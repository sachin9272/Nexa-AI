import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MetricsDaily, MetricsDailyDocument } from './schemas/metrics-daily.schema';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { Review, ReviewDocument } from '../gbp/schemas/review.schema';
import { ContentItem, ContentItemDocument } from '../content/schemas/content-item.schema';
import { Campaign, CampaignDocument } from '../campaigns/schemas/campaign.schema';
import { TenantContextService } from '../common/tenancy/tenant-context.service';
import { WhatsAppCloudService } from '../campaigns/whatsapp-cloud.service';

export interface DashboardOverview {
  periodDays: number;
  outcomes: {
    callsReceived: number;
    directionRequests: number;
    websiteClicks: number;
    totalEngagements: number;
  };
  reputation: {
    totalReviews: number;
    averageRating: number;
    repliedPercentage: number;
    pendingReplies: number;
  };
  whatsapp: {
    campaignsActive: number;
    messagesSent: number;
    readRatePercentage: number;
    repliesReceived: number;
  };
  content: {
    postsPublished: number;
    pendingApprovals: number;
  };
  unitEconomics: {
    llmTokens: number;
    llmCostUsd: number;
    whatsappCostUsd: number;
    estimatedRevenueAttributedUsd: number;
  };
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(MetricsDaily.name)
    private readonly metricsModel: Model<MetricsDailyDocument>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(ContentItem.name)
    private readonly contentItemModel: Model<ContentItemDocument>,
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    private readonly tenantContext: TenantContextService,
    private readonly whatsappCloudService: WhatsAppCloudService,
  ) {}

  async getDashboardOverview(days = 30): Promise<DashboardOverview> {
    const tenantId = this.tenantContext.getTenantId();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [dailyMetrics, reviews, pendingContent, campaigns] = await Promise.all([
      this.metricsModel.find({ tenantId, date: { $gte: startDate } }),
      this.reviewModel.find({ tenantId }),
      this.contentItemModel.countDocuments({ tenantId, status: 'pending_approval' }),
      this.campaignModel.find({ tenantId }),
    ]);

    // Aggregate daily metrics
    let calls = 0;
    let directions = 0;
    let website = 0;
    let waSent = 0;
    let waRead = 0;
    let waReplies = 0;
    let llmTokens = 0;
    let llmCost = 0;
    let waCost = 0;
    let postsPublished = 0;

    for (const m of dailyMetrics) {
      calls += m.gbp?.callClicks ?? 0;
      directions += m.gbp?.directionRequests ?? 0;
      website += m.gbp?.websiteClicks ?? 0;
      waSent += m.whatsapp?.messagesSent ?? 0;
      waRead += m.whatsapp?.messagesRead ?? 0;
      waReplies += m.whatsapp?.replies ?? 0;
      postsPublished += m.content?.postsPublished ?? 0;
      llmTokens += m.costs?.llmTokensUsed ?? 0;
      llmCost += m.costs?.llmCostUsd ?? 0;
      waCost += m.costs?.whatsappMessagesCost ?? 0;
    }

    // Reviews summary
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? +(reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : 5.0;
    const repliedCount = reviews.filter((r) => r.reply?.status === 'published').length;
    const repliedPercentage = totalReviews > 0 ? +((repliedCount / totalReviews) * 100).toFixed(0) : 100;
    const pendingReplies = reviews.filter((r) => r.reply?.status === 'pending' || r.reply?.status === 'draft_generated').length;

    // WhatsApp summary
    const readRatePercentage = waSent > 0 ? +((waRead / waSent) * 100).toFixed(0) : 0;
    const activeCampaigns = campaigns.filter((c) => c.status === 'running' || c.status === 'scheduled').length;

    // Approximate patient/appointment revenue attribution ($40 average value per patient booking/call)
    const estimatedRevenue = calls * 35 + directions * 20 + waReplies * 50;

    return {
      periodDays: days,
      outcomes: {
        callsReceived: calls,
        directionRequests: directions,
        websiteClicks: website,
        totalEngagements: calls + directions + website,
      },
      reputation: {
        totalReviews,
        averageRating: avgRating,
        repliedPercentage,
        pendingReplies,
      },
      whatsapp: {
        campaignsActive: activeCampaigns,
        messagesSent: waSent,
        readRatePercentage,
        repliesReceived: waReplies,
      },
      content: {
        postsPublished,
        pendingApprovals: pendingContent,
      },
      unitEconomics: {
        llmTokens,
        llmCostUsd: +llmCost.toFixed(3),
        whatsappCostUsd: +waCost.toFixed(3),
        estimatedRevenueAttributedUsd: estimatedRevenue,
      },
    };
  }

  async getTimeseries(days = 14): Promise<Array<{
    date: string;
    calls: number;
    directions: number;
    whatsappSent: number;
  }>> {
    const tenantId = this.tenantContext.getTenantId();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const metrics = await this.metricsModel
      .find({ tenantId, date: { $gte: startDate } })
      .sort({ date: 1 });

    return metrics.map((m) => ({
      date: m.date.toISOString().split('T')[0],
      calls: m.gbp?.callClicks ?? 0,
      directions: m.gbp?.directionRequests ?? 0,
      whatsappSent: m.whatsapp?.messagesSent ?? 0,
    }));
  }

  /**
   * Generates and dispatches Monday Morning WhatsApp Digest for business owners
   */
  async sendWeeklyDigest(tenantId: Types.ObjectId): Promise<{ success: boolean; summary: string }> {
    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant not found');

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    last7Days.setHours(0, 0, 0, 0);

    const metrics = await this.metricsModel.find({ tenantId, date: { $gte: last7Days } });

    let calls = 0;
    let directions = 0;
    let reviews = 0;

    for (const m of metrics) {
      calls += m.gbp?.callClicks ?? 0;
      directions += m.gbp?.directionRequests ?? 0;
      reviews += m.content?.reviewsReceived ?? 0;
    }

    const summaryText =
      `📊 *Your Weekly Business Growth Report*\n\n` +
      `Hello ${tenant.name} Team!\n` +
      `Here is how Nexa grew your business over the past 7 days:\n\n` +
      `📞 *Phone Calls Driven*: ${calls}\n` +
      `🗺️ *Google Maps Direction Requests*: ${directions}\n` +
      `⭐ *New Reviews Managed*: ${reviews}\n\n` +
      `Estimated patient/customer appointments generated: ~${Math.round(calls * 0.4 + directions * 0.3)}\n\n` +
      `Open your dashboard for pending approvals: ${tenant.brandVoice?.appointmentLink || 'https://nexa.ai'}`;

    this.logger.log(`Generated weekly digest for tenant ${tenant.name}: ${summaryText}`);

    // If tenant has owner phone, dispatch message
    if (tenant.phone) {
      await this.whatsappCloudService.sendTemplateMessage({
        toPhoneE164: tenant.phone,
        templateName: 'weekly_growth_digest',
        languageCode: 'en',
        bodyParameters: [tenant.name, calls.toString(), directions.toString()],
      });
    }

    return { success: true, summary: summaryText };
  }
}
