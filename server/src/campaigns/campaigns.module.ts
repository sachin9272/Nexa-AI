import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { CampaignsController } from './campaigns.controller';
import { WhatsAppWebhookController } from './whatsapp-webhook.controller';
import { CampaignsService } from './campaigns.service';
import { WhatsAppCloudService } from './whatsapp-cloud.service';
import { CampaignDispatcherProcessor } from './workers/campaign-dispatcher.processor';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { MetricsDaily, MetricsDailySchema } from '../analytics/schemas/metrics-daily.schema';
import { QUEUE_CAMPAIGN_DISPATCH } from '../common/constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: MetricsDaily.name, schema: MetricsDailySchema },
    ]),
    BullModule.registerQueue({ name: QUEUE_CAMPAIGN_DISPATCH }),
  ],
  controllers: [CampaignsController, WhatsAppWebhookController],
  providers: [CampaignsService, WhatsAppCloudService, CampaignDispatcherProcessor],
  exports: [CampaignsService, WhatsAppCloudService],
})
export class CampaignsModule {}
