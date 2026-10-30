import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Model, Types } from 'mongoose';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { TenantContextService } from '../common/tenancy/tenant-context.service';
import {
  CONSENT_OPTED_IN,
  CONSENT_OPTED_OUT,
  MESSAGE_STATUS_QUEUED,
  QUEUE_CAMPAIGN_DISPATCH,
  JOB_DISPATCH_SINGLE_MESSAGE,
  WHATSAPP_OPTOUT_KEYWORDS,
} from '../common/constants';

export class CreateCampaignDto {
  title: string;
  description?: string;
  goal: string; // 'win_back', 'appointment_reminder', 'review_request', 'seasonal', 'custom'
  templateId: string;
  templateLanguage?: string;
  segmentFilter?: {
    tags?: string[];
    lastVisitBefore?: string;
    lastVisitAfter?: string;
    minVisits?: number;
  };
  scheduledAt?: string;
}

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectQueue(QUEUE_CAMPAIGN_DISPATCH)
    private readonly campaignQueue: Queue,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(dto: CreateCampaignDto): Promise<CampaignDocument> {
    const tenantId = this.tenantContext.getTenantId();
    const userId = this.tenantContext.getUserId();

    const campaign = await this.campaignModel.create({
      tenantId,
      title: dto.title.trim(),
      description: dto.description?.trim(),
      goal: dto.goal,
      templateId: dto.templateId,
      templateLanguage: dto.templateLanguage ?? 'en',
      segmentFilter: {
        tags: dto.segmentFilter?.tags ?? [],
        consentStatus: CONSENT_OPTED_IN,
        lastVisitBefore: dto.segmentFilter?.lastVisitBefore
          ? new Date(dto.segmentFilter.lastVisitBefore)
          : null,
        lastVisitAfter: dto.segmentFilter?.lastVisitAfter
          ? new Date(dto.segmentFilter.lastVisitAfter)
          : null,
        minVisits: dto.segmentFilter?.minVisits ?? null,
      },
      status: dto.scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      createdBy: userId,
      stats: {
        total: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        replied: 0,
        failed: 0,
        optedOut: 0,
      },
    });

    return campaign;
  }

  async launch(campaignId: string): Promise<{ queuedCount: number }> {
    const tenantId = this.tenantContext.getTenantId();
    const campaign = await this.campaignModel.findOne({ _id: campaignId, tenantId });
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.status === 'running' || campaign.status === 'completed') {
      throw new BadRequestException(`Campaign is already ${campaign.status}`);
    }

    // Build filter matching strictly opted-in customers
    const customerFilter: Record<string, unknown> = {
      tenantId,
      consentStatus: CONSENT_OPTED_IN,
      isActive: true,
    };

    if (campaign.segmentFilter?.tags && campaign.segmentFilter.tags.length > 0) {
      customerFilter['tags'] = { $in: campaign.segmentFilter.tags };
    }

    if (campaign.segmentFilter?.lastVisitBefore) {
      customerFilter['lastVisitAt'] = {
        ...(customerFilter['lastVisitAt'] as object ?? {}),
        $lte: campaign.segmentFilter.lastVisitBefore,
      };
    }

    if (campaign.segmentFilter?.lastVisitAfter) {
      customerFilter['lastVisitAt'] = {
        ...(customerFilter['lastVisitAt'] as object ?? {}),
        $gte: campaign.segmentFilter.lastVisitAfter,
      };
    }

    const customers = await this.customerModel.find(customerFilter);

    if (customers.length === 0) {
      throw new BadRequestException('No opted-in customers match this segment filter');
    }

    campaign.status = 'running';
    campaign.startedAt = new Date();
    campaign.stats.total = customers.length;
    await campaign.save();

    // Prepare message batch
    const messagesToInsert = customers.map((c) => ({
      tenantId,
      campaignId: campaign._id,
      customerId: c._id,
      recipientPhone: c.phoneE164,
      status: MESSAGE_STATUS_QUEUED,
      templateVariables: [{ name: c.name }],
    }));

    const insertedMessages = await this.messageModel.insertMany(messagesToInsert);

    // Queue individual messages with slight delay to avoid rate limiting
    let delayMs = 0;
    const BULK_DELAY_STEP_MS = 250; // 4 messages per second throttle

    for (const msg of insertedMessages) {
      await this.campaignQueue.add(
        JOB_DISPATCH_SINGLE_MESSAGE,
        {
          messageId: (msg._id as Types.ObjectId).toString(),
          tenantId: tenantId.toString(),
          campaignId: (campaign._id as Types.ObjectId).toString(),
        },
        { delay: delayMs },
      );
      delayMs += BULK_DELAY_STEP_MS;
    }

    this.logger.log(
      `Dispatched campaign ${campaignId} with ${customers.length} messages queued`,
    );

    return { queuedCount: customers.length };
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ items: CampaignDocument[]; total: number }> {
    const tenantId = this.tenantContext.getTenantId();
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const filter: Record<string, unknown> = { tenantId };
    if (params.status) filter['status'] = params.status;

    const [items, total] = await Promise.all([
      this.campaignModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.campaignModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async findById(campaignId: string): Promise<CampaignDocument> {
    const tenantId = this.tenantContext.getTenantId();
    const campaign = await this.campaignModel.findOne({ _id: campaignId, tenantId });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async getMessages(
    campaignId: string,
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<{ items: MessageDocument[]; total: number }> {
    const tenantId = this.tenantContext.getTenantId();
    const filter: Record<string, unknown> = {
      tenantId,
      campaignId: new Types.ObjectId(campaignId),
    };
    if (status) filter['status'] = status;

    const [items, total] = await Promise.all([
      this.messageModel
        .find(filter)
        .populate('customerId', 'name phoneE164')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.messageModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async cancel(campaignId: string): Promise<CampaignDocument> {
    const tenantId = this.tenantContext.getTenantId();
    const campaign = await this.campaignModel.findOne({ _id: campaignId, tenantId });
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.status === 'completed') {
      throw new BadRequestException('Cannot cancel a completed campaign');
    }

    campaign.status = 'cancelled';
    await campaign.save();
    return campaign;
  }

  /**
   * Webhook processing: update message status based on WhatsApp Cloud webhook
   */
  async processWebhookStatus(statusUpdate: {
    id: string; // provider message ID (wamid)
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
    errors?: Array<{ code: number; title: string }>;
  }): Promise<void> {
    const message = await this.messageModel.findOne({ providerMsgId: statusUpdate.id });
    if (!message) {
      this.logger.debug(`Webhook status update for unknown message: ${statusUpdate.id}`);
      return;
    }

    const timestamp = new Date(parseInt(statusUpdate.timestamp, 10) * 1000);
    const updates: Record<string, unknown> = { status: statusUpdate.status };
    const statKey = `stats.${statusUpdate.status}`;

    if (statusUpdate.status === 'delivered') {
      updates['deliveredAt'] = timestamp;
    } else if (statusUpdate.status === 'read') {
      updates['readAt'] = timestamp;
    } else if (statusUpdate.status === 'failed') {
      updates['failureReason'] = statusUpdate.errors?.[0]?.title ?? 'Delivery failed';
    }

    await this.messageModel.findByIdAndUpdate(message._id, { $set: updates });

    // Increment campaign stats
    await this.campaignModel.findByIdAndUpdate(message.campaignId, {
      $inc: { [statKey]: 1 },
    });
  }

  /**
   * Webhook processing: handle incoming reply text
   */
  async processWebhookIncomingMessage(incoming: {
    from: string; // phone without +
    id: string;
    text?: { body: string };
    timestamp: string;
  }): Promise<void> {
    const phoneE164 = `+${incoming.from}`;
    const textBody = incoming.text?.body?.trim() ?? '';
    const upperText = textBody.toUpperCase();

    // Check for opt-out keywords
    const isOptOut = WHATSAPP_OPTOUT_KEYWORDS.some((kw) => upperText === kw || upperText.startsWith(kw));

    if (isOptOut) {
      this.logger.log(`Opt-out keyword received from ${phoneE164}: "${textBody}"`);
      await this.customerModel.updateMany(
        { phoneE164 },
        {
          consentStatus: CONSENT_OPTED_OUT,
          optedOutAt: new Date(),
        },
      );
      return;
    }

    // Associate incoming reply with latest sent message
    const latestMessage = await this.messageModel
      .findOne({ recipientPhone: phoneE164 })
      .sort({ createdAt: -1 });

    if (latestMessage) {
      latestMessage.status = 'replied';
      latestMessage.repliedAt = new Date();
      latestMessage.replyText = textBody;
      await latestMessage.save();

      await this.campaignModel.findByIdAndUpdate(latestMessage.campaignId, {
        $inc: { 'stats.replied': 1 },
      });
    }
  }
}
