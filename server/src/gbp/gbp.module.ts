import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { GbpController } from './gbp.controller';
import { GbpService } from './gbp.service';
import { GbpSyncProcessor } from './workers/gbp-sync.processor';
import { GbpConnection, GbpConnectionSchema } from './schemas/gbp-connection.schema';
import { Audit, AuditSchema } from './schemas/audit.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { ContentItem, ContentItemSchema } from '../content/schemas/content-item.schema';
import { MetricsDaily, MetricsDailySchema } from '../analytics/schemas/metrics-daily.schema';
import { QUEUE_GBP_SYNC } from '../common/constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GbpConnection.name, schema: GbpConnectionSchema },
      { name: Audit.name, schema: AuditSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: ContentItem.name, schema: ContentItemSchema },
      { name: MetricsDaily.name, schema: MetricsDailySchema },
    ]),
    BullModule.registerQueue({ name: QUEUE_GBP_SYNC }),
  ],
  controllers: [GbpController],
  providers: [GbpService, GbpSyncProcessor],
  exports: [GbpService],
})
export class GbpModule {}
