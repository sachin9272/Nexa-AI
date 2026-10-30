import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { MetricsDaily, MetricsDailySchema } from './schemas/metrics-daily.schema';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { Review, ReviewSchema } from '../gbp/schemas/review.schema';
import { ContentItem, ContentItemSchema } from '../content/schemas/content-item.schema';
import { Campaign, CampaignSchema } from '../campaigns/schemas/campaign.schema';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MetricsDaily.name, schema: MetricsDailySchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: ContentItem.name, schema: ContentItemSchema },
      { name: Campaign.name, schema: CampaignSchema },
    ]),
    CampaignsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
