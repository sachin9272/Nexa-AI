import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentPublisherProcessor } from './workers/content-publisher.processor';
import { ContentItem, ContentItemSchema } from './schemas/content-item.schema';
import { Review, ReviewSchema } from '../gbp/schemas/review.schema';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { GbpConnection, GbpConnectionSchema } from '../gbp/schemas/gbp-connection.schema';
import { GbpModule } from '../gbp/gbp.module';
import { QUEUE_CONTENT_PUBLISH } from '../common/constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContentItem.name, schema: ContentItemSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: GbpConnection.name, schema: GbpConnectionSchema },
    ]),
    BullModule.registerQueue({ name: QUEUE_CONTENT_PUBLISH }),
    GbpModule,
  ],
  controllers: [ContentController],
  providers: [ContentService, ContentPublisherProcessor],
  exports: [ContentService],
})
export class ContentModule {}
