import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Model, Types } from 'mongoose';
import { ContentItem, ContentItemDocument } from './schemas/content-item.schema';
import { Review, ReviewDocument } from '../gbp/schemas/review.schema';
import { TenantContextService } from '../common/tenancy/tenant-context.service';
import { AiGatewayService } from '../ai/ai-gateway.service';
import { ContentGuardrailService } from '../ai/guardrails/content-guardrail.service';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import {
  CONTENT_STATUS_APPROVED,
  CONTENT_STATUS_PENDING_APPROVAL,
  CONTENT_STATUS_REJECTED,
  CONTENT_STATUS_SCHEDULED,
  CONTENT_TYPE_GBP_POST,
  QUEUE_CONTENT_PUBLISH,
  JOB_PUBLISH_CONTENT_ITEM,
} from '../common/constants';

export class GenerateGbpPostDto {
  gbpConnectionId: string;
  topicFocus?: string; // e.g. 'teeth whitening', 'new equipment', 'patient testimonial'
  scheduleAt?: string; // ISO date string
}

export class ApproveContentDto {
  editedBody?: string; // optional edit before approval
}

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    @InjectModel(ContentItem.name)
    private readonly contentItemModel: Model<ContentItemDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    @InjectQueue(QUEUE_CONTENT_PUBLISH)
    private readonly publishQueue: Queue,
    private readonly tenantContext: TenantContextService,
    private readonly aiGateway: AiGatewayService,
    private readonly guardrails: ContentGuardrailService,
  ) {}

  async generateGbpPost(dto: GenerateGbpPostDto): Promise<ContentItemDocument> {
    const tenantId = this.tenantContext.getTenantId();
    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant not found');

    const result = await this.aiGateway.generate<{
      body: string;
      callToActionType: string;
      callToActionUrl: string | null;
      suggestedHashtags: string[];
      topicSummary: string;
    }>({
      promptKey: 'gbp_weekly_post',
      tenantContext: {
        tenantId,
        businessName: tenant.name,
        category: tenant.category,
        city: tenant.city,
        services: tenant.servicesCatalog,
        brandVoice: tenant.brandVoice,
      },
      variables: {
        businessName: tenant.name,
        category: tenant.category,
        city: tenant.city,
        services: tenant.servicesCatalog.map((s) => `${s.name}: ${s.description}`).join('\n'),
        tone: tenant.brandVoice?.tone ?? 'professional',
        ctaText: tenant.brandVoice?.ctaText ?? 'Book an Appointment',
        appointmentLink: tenant.brandVoice?.appointmentLink ?? '',
        topicFocus: dto.topicFocus ?? 'general services update',
      },
    });

    const serviceNames = tenant.servicesCatalog.map((s) => s.name.toLowerCase());
    const guardrailResult = this.guardrails.validateGbpPost(result.data.body, serviceNames);

    if (!guardrailResult.isValid) {
      this.logger.warn(
        `Content guardrail failed for tenant ${tenantId.toString()}: ${guardrailResult.violations.join('; ')}`,
      );
      throw new BadRequestException(
        `Generated content failed compliance checks: ${guardrailResult.violations.join('; ')}`,
      );
    }

    const contentItem = await this.contentItemModel.create({
      tenantId,
      type: CONTENT_TYPE_GBP_POST,
      status: CONTENT_STATUS_PENDING_APPROVAL,
      body: result.data.body,
      callToActionUrl: result.data.callToActionUrl,
      callToActionType: result.data.callToActionType,
      source: 'ai_generated',
      modelName: result.modelUsed,
      promptVersion: result.promptVersion,
      gbpConnectionId: new Types.ObjectId(dto.gbpConnectionId),
      scheduledAt: dto.scheduleAt ? new Date(dto.scheduleAt) : null,
    });

    return contentItem;
  }

  async approveContent(
    contentItemId: string,
    dto: ApproveContentDto,
  ): Promise<ContentItemDocument> {
    const tenantId = this.tenantContext.getTenantId();
    const userId = this.tenantContext.getUserId();

    const item = await this.contentItemModel.findOne({ _id: contentItemId, tenantId });
    if (!item) throw new NotFoundException('Content item not found');

    if (item.status !== CONTENT_STATUS_PENDING_APPROVAL) {
      throw new BadRequestException(
        `Cannot approve content in status: ${item.status}`,
      );
    }

    // Allow optional edit before approval
    const finalBody = dto.editedBody?.trim() ?? item.body;

    // Re-run guardrails on edited content
    if (dto.editedBody) {
      const tenant = await this.tenantModel.findById(tenantId);
      const serviceNames = tenant?.servicesCatalog.map((s) => s.name.toLowerCase()) ?? [];
      const guardrailResult = this.guardrails.validateGbpPost(finalBody, serviceNames);
      if (!guardrailResult.isValid) {
        throw new BadRequestException(
          `Edited content failed compliance: ${guardrailResult.violations.join('; ')}`,
        );
      }
    }

    const newStatus = item.scheduledAt
      ? CONTENT_STATUS_SCHEDULED
      : CONTENT_STATUS_APPROVED;

    item.body = finalBody;
    item.status = newStatus;
    item.approvedBy = userId;
    item.approvedAt = new Date();
    await item.save();

    // If scheduled, queue for publishing at the right time
    if (item.scheduledAt) {
      const delay = item.scheduledAt.getTime() - Date.now();
      await this.publishQueue.add(
        JOB_PUBLISH_CONTENT_ITEM,
        { contentItemId: (item._id as Types.ObjectId).toString(), tenantId: tenantId.toString() },
        { delay: Math.max(0, delay) },
      );
    } else {
      // Publish immediately
      await this.publishQueue.add(JOB_PUBLISH_CONTENT_ITEM, {
        contentItemId: (item._id as Types.ObjectId).toString(),
        tenantId: tenantId.toString(),
      });
    }

    return item;
  }

  async rejectContent(
    contentItemId: string,
    reason: string,
  ): Promise<ContentItemDocument> {
    const tenantId = this.tenantContext.getTenantId();
    const item = await this.contentItemModel.findOne({ _id: contentItemId, tenantId });
    if (!item) throw new NotFoundException('Content item not found');

    if (item.status !== CONTENT_STATUS_PENDING_APPROVAL) {
      throw new BadRequestException(`Cannot reject content in status: ${item.status}`);
    }

    item.status = CONTENT_STATUS_REJECTED;
    item.rejectionReason = reason;
    await item.save();

    // Update review status if this was a review reply
    if (item.reviewId) {
      await this.reviewModel.findByIdAndUpdate(item.reviewId, {
        'reply.status': 'pending', // Reset so it can be regenerated
      });
    }

    return item;
  }

  async getPendingApprovals(
    page = 1,
    limit = 10,
    type?: string,
  ): Promise<{ items: ContentItemDocument[]; total: number }> {
    const tenantId = this.tenantContext.getTenantId();
    const filter: Record<string, unknown> = {
      tenantId,
      status: CONTENT_STATUS_PENDING_APPROVAL,
    };
    if (type) filter['type'] = type;

    const [items, total] = await Promise.all([
      this.contentItemModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.contentItemModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async getContentHistory(
    page = 1,
    limit = 20,
    status?: string,
    type?: string,
  ): Promise<{ items: ContentItemDocument[]; total: number }> {
    const tenantId = this.tenantContext.getTenantId();
    const filter: Record<string, unknown> = { tenantId };
    if (status) filter['status'] = status;
    if (type) filter['type'] = type;

    const [items, total] = await Promise.all([
      this.contentItemModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.contentItemModel.countDocuments(filter),
    ]);

    return { items, total };
  }
}
