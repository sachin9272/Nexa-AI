import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job } from 'bullmq';
import { GbpService } from '../gbp.service';
import {
  GbpConnection,
  GbpConnectionDocument,
} from '../schemas/gbp-connection.schema';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { MetricsDaily, MetricsDailyDocument } from '../../analytics/schemas/metrics-daily.schema';
import { AiGatewayService } from '../../ai/ai-gateway.service';
import { ContentGuardrailService } from '../../ai/guardrails/content-guardrail.service';
import { ContentItem, ContentItemDocument } from '../../content/schemas/content-item.schema';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import { ConfigService } from '@nestjs/config';
import { decryptToken } from '../../common/utils/encryption.util';
import {
  QUEUE_GBP_SYNC,
  JOB_GBP_AUDIT,
  JOB_GBP_METRICS_SYNC,
  JOB_GBP_REVIEWS_SYNC,
  JOB_GENERATE_REVIEW_REPLY,
  CONTENT_STATUS_PENDING_APPROVAL,
  CONTENT_TYPE_REVIEW_REPLY,
} from '../../common/constants';

@Processor(QUEUE_GBP_SYNC)
export class GbpSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(GbpSyncProcessor.name);

  constructor(
    @InjectModel(GbpConnection.name)
    private readonly gbpConnectionModel: Model<GbpConnectionDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(MetricsDaily.name)
    private readonly metricsDailyModel: Model<MetricsDailyDocument>,
    @InjectModel(ContentItem.name)
    private readonly contentItemModel: Model<ContentItemDocument>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    private readonly gbpService: GbpService,
    private readonly aiGateway: AiGatewayService,
    private readonly guardrails: ContentGuardrailService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing job: ${job.name} [${job.id}]`);
    try {
      switch (job.name) {
        case JOB_GBP_AUDIT:
          await this.handleAudit(job.data as { tenantId: string; gbpConnectionId: string });
          break;
        case JOB_GBP_METRICS_SYNC:
          await this.handleMetricsSync(job.data as { tenantId: string; gbpConnectionId: string });
          break;
        case JOB_GBP_REVIEWS_SYNC:
          await this.handleReviewsSync(job.data as { tenantId: string; gbpConnectionId: string });
          break;
        case JOB_GENERATE_REVIEW_REPLY:
          await this.handleReviewReplyGeneration(job.data as { tenantId: string; reviewId: string });
          break;
        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }
    } catch (err) {
      this.logger.error(`Job ${job.name} [${job.id}] failed:`, err);
      throw err; // Re-throw so BullMQ marks as failed and can retry
    }
  }

  private async handleAudit(data: { tenantId: string; gbpConnectionId: string }): Promise<void> {
    const tenantId = new Types.ObjectId(data.tenantId);
    await this.gbpService.runAudit(data.gbpConnectionId, tenantId);
    this.logger.log(`GBP audit completed for connection ${data.gbpConnectionId}`);
  }

  private async handleReviewReplyGeneration(data: { tenantId: string; reviewId: string }): Promise<void> {
    const tenantId = new Types.ObjectId(data.tenantId);
    const review = await this.reviewModel.findById(data.reviewId);
    if (!review) return;
    await this.generateReviewReply(tenantId, review);
  }

  private async handleMetricsSync(data: {
    tenantId: string;
    gbpConnectionId: string;
  }): Promise<void> {
    const tenantId = new Types.ObjectId(data.tenantId);
    const connection = await this.gbpConnectionModel
      .findOne({ _id: data.gbpConnectionId, tenantId })
      .select('+encryptedRefreshToken');

    if (!connection) return;

    const encryptionKey = this.configService.get<string>('encryption.key', '');
    const refreshToken = decryptToken(connection.encryptedRefreshToken, encryptionKey);
    const accessToken = await this.gbpService.refreshAccessToken(refreshToken);

    // Fetch GBP insights - daily metrics from the Performance API
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days

    const insightsUrl = `https://mybusiness.googleapis.com/v4/${connection.locationId}:reportInsights`;

    try {
      const response = await fetch(insightsUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationNames: [connection.locationId],
          basicRequest: {
            metricRequests: [
              { metric: 'QUERIES_DIRECT' },
              { metric: 'QUERIES_INDIRECT' },
              { metric: 'ACTIONS_PHONE' },
              { metric: 'ACTIONS_DRIVING_DIRECTIONS' },
              { metric: 'ACTIONS_WEBSITE' },
              { metric: 'VIEWS_MAPS' },
              { metric: 'VIEWS_SEARCH' },
            ],
            timeRange: {
              startTime: startDate.toISOString(),
              endTime: new Date().toISOString(),
            },
          },
        }),
      });

      if (response.ok) {
        const data2 = await response.json() as {
          locationMetrics?: Array<{
            metricValues?: Array<{
              metric: string;
              totalValue?: { value: number };
              dimensionalValues?: Array<{ timeDimension?: { timeRange?: { startTime?: string } }; value?: number }>;
            }>;
          }>;
        };
        await this.storeMetrics(tenantId, data2);
      }
    } catch (err) {
      this.logger.error('GBP metrics sync error:', err);
    }

    await this.gbpConnectionModel.findByIdAndUpdate(connection._id, {
      lastSyncedAt: new Date(),
    });
  }

  private async handleReviewsSync(data: {
    tenantId: string;
    gbpConnectionId: string;
  }): Promise<void> {
    const tenantId = new Types.ObjectId(data.tenantId);
    const connection = await this.gbpConnectionModel
      .findOne({ _id: data.gbpConnectionId, tenantId })
      .select('+encryptedRefreshToken');

    if (!connection) return;

    const encryptionKey = this.configService.get<string>('encryption.key', '');
    const refreshToken = decryptToken(connection.encryptedRefreshToken, encryptionKey);
    const accessToken = await this.gbpService.refreshAccessToken(refreshToken);

    // Fetch reviews from Google
    const reviewsUrl = `https://mybusiness.googleapis.com/v4/${connection.locationId}/reviews?pageSize=50`;
    const response = await fetch(reviewsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      this.logger.error(`Failed to fetch reviews: ${response.status}`);
      return;
    }

    const reviewsData = await response.json() as {
      reviews?: Array<{
        name: string;
        reviewer?: { profilePhotoUrl?: string; displayName?: string };
        starRating?: string;
        comment?: string;
        createTime?: string;
        reviewReply?: { comment: string; updateTime: string };
      }>;
    };
    const reviews = reviewsData.reviews ?? [];

    for (const review of reviews) {
      const externalId = review.name;
      const rating = this.starRatingToNumber(review.starRating ?? 'ZERO');
      const comment = review.comment ?? '';
      const sentiment = this.inferSentiment(rating, comment);

      // Upsert review (idempotent)
      const savedReview = await this.reviewModel.findOneAndUpdate(
        { externalId },
        {
          tenantId,
          gbpConnectionId: connection._id,
          externalId,
          authorName: review.reviewer?.displayName ?? 'Anonymous',
          authorPhotoUrl: review.reviewer?.profilePhotoUrl ?? '',
          rating,
          comment,
          reviewTimestamp: new Date(review.createTime ?? Date.now()),
          sentiment,
          'reply.publishedText': review.reviewReply?.comment ?? null,
          'reply.publishedAt': review.reviewReply?.updateTime
            ? new Date(review.reviewReply.updateTime)
            : null,
          'reply.status': review.reviewReply ? 'published' : 'pending',
        },
        { upsert: true, new: true },
      );

      // Generate AI reply for new unanswered reviews
      if (!review.reviewReply && savedReview.reply.status === 'pending') {
        await this.generateReviewReply(tenantId, savedReview);
      }
    }

    this.logger.log(`Synced ${reviews.length} reviews for connection ${data.gbpConnectionId}`);
  }

  private async generateReviewReply(
    tenantId: Types.ObjectId,
    review: ReviewDocument,
  ): Promise<void> {
    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) return;

    const promptKey =
      review.rating <= 2 ? 'review_reply_negative' : 'review_reply_positive';

    try {
      const result = await this.aiGateway.generate<{ replyText: string; escalationNeeded?: boolean }>({
        promptKey,
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
          authorName: review.authorName,
          rating: review.rating.toString(),
          reviewText: review.comment ?? '(No text provided)',
          signatureText: tenant.brandVoice?.signatureText ?? '',
          contactInfo: tenant.phone ?? '',
        },
      });

      const replyText = result.data.replyText;
      const guardrailResult = this.guardrails.validateReviewReply(
        replyText,
        review.rating <= 2,
      );

      if (!guardrailResult.isValid) {
        this.logger.warn(
          `Review reply guardrail violations for review ${review._id.toString()}: ${guardrailResult.violations.join('; ')}`,
        );
        return;
      }

      // Create a ContentItem in pending_approval state
      await this.contentItemModel.create({
        tenantId,
        type: CONTENT_TYPE_REVIEW_REPLY,
        status: CONTENT_STATUS_PENDING_APPROVAL,
        body: replyText,
        source: 'ai_generated',
        modelName: result.modelUsed,
        promptVersion: result.promptVersion,
        reviewId: review._id,
        gbpConnectionId: review.gbpConnectionId,
      });

      // Update review reply status to draft_generated
      await this.reviewModel.findByIdAndUpdate(review._id, {
        'reply.status': 'draft_generated',
      });
    } catch (err) {
      this.logger.error(`Review reply generation failed for ${review._id.toString()}:`, err);
    }
  }

  private async storeMetrics(
    tenantId: Types.ObjectId,
    data: { locationMetrics?: Array<{ metricValues?: Array<{ metric: string; totalValue?: { value: number } }> }> },
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metrics = data.locationMetrics?.[0]?.metricValues ?? [];
    const getMetric = (name: string) =>
      metrics.find((m) => m.metric === name)?.totalValue?.value ?? 0;

    await this.metricsDailyModel.findOneAndUpdate(
      { tenantId, date: today },
      {
        $set: {
          'gbp.callClicks': getMetric('ACTIONS_PHONE'),
          'gbp.directionRequests': getMetric('ACTIONS_DRIVING_DIRECTIONS'),
          'gbp.websiteClicks': getMetric('ACTIONS_WEBSITE'),
          'gbp.mapsImpressions': getMetric('VIEWS_MAPS'),
          'gbp.searchImpressions': getMetric('VIEWS_SEARCH'),
        },
      },
      { upsert: true },
    );
  }

  private starRatingToNumber(starRating: string): number {
    const map: Record<string, number> = {
      ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, ZERO: 0,
    };
    return map[starRating] ?? 0;
  }

  private inferSentiment(rating: number, comment: string): string {
    if (rating >= 4) return 'positive';
    if (rating <= 2) return 'negative';
    const lowerComment = comment.toLowerCase();
    const negativeWords = ['wait', 'slow', 'rude', 'bad', 'worst', 'never', 'disappointed'];
    if (negativeWords.some((w) => lowerComment.includes(w))) return 'mixed';
    return 'neutral';
  }
}
