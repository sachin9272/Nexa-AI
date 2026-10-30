import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job } from 'bullmq';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Campaign, CampaignDocument } from '../schemas/campaign.schema';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import { MetricsDaily, MetricsDailyDocument } from '../../analytics/schemas/metrics-daily.schema';
import { WhatsAppCloudService } from '../whatsapp-cloud.service';
import {
  QUEUE_CAMPAIGN_DISPATCH,
  JOB_DISPATCH_SINGLE_MESSAGE,
  MESSAGE_STATUS_SENT,
  MESSAGE_STATUS_FAILED,
} from '../../common/constants';

@Processor(QUEUE_CAMPAIGN_DISPATCH)
export class CampaignDispatcherProcessor extends WorkerHost {
  private readonly logger = new Logger(CampaignDispatcherProcessor.name);

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(MetricsDaily.name)
    private readonly metricsDailyModel: Model<MetricsDailyDocument>,
    private readonly whatsappCloudService: WhatsAppCloudService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name === JOB_DISPATCH_SINGLE_MESSAGE) {
      await this.handleDispatchSingleMessage(
        job.data as { messageId: string; tenantId: string; campaignId: string },
      );
    }
  }

  private async handleDispatchSingleMessage(data: {
    messageId: string;
    tenantId: string;
    campaignId: string;
  }): Promise<void> {
    const message = await this.messageModel.findById(data.messageId);
    if (!message) {
      this.logger.warn(`Message ${data.messageId} not found`);
      return;
    }

    const campaign = await this.campaignModel.findById(data.campaignId);
    if (!campaign) {
      this.logger.warn(`Campaign ${data.campaignId} not found`);
      return;
    }

    // Extract template parameters
    const paramValues = (message.templateVariables ?? []).map((v) => Object.values(v)[0]);

    try {
      const sendResult = await this.whatsappCloudService.sendTemplateMessage({
        toPhoneE164: message.recipientPhone,
        templateName: campaign.templateId,
        languageCode: campaign.templateLanguage || 'en',
        bodyParameters: paramValues,
      });

      if (sendResult.success) {
        message.status = MESSAGE_STATUS_SENT;
        message.sentAt = new Date();
        message.providerMsgId = sendResult.messageId ?? null;
        await message.save();

        await this.campaignModel.findByIdAndUpdate(campaign._id, {
          $inc: { 'stats.sent': 1 },
        });

        // Record metrics and usage
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tenantId = new Types.ObjectId(data.tenantId);

        await this.metricsDailyModel.findOneAndUpdate(
          { tenantId, date: today },
          {
            $inc: {
              'whatsapp.messagesSent': 1,
              'costs.whatsappMessagesCost': 0.005, // ~$0.005 per utility/marketing msg
            },
          },
          { upsert: true },
        );

        await this.tenantModel.findByIdAndUpdate(tenantId, {
          $inc: { 'usageLimits.whatsappMessagesUsed': 1 },
        });

        this.logger.log(`Message ${data.messageId} successfully dispatched to ${message.recipientPhone}`);
      } else {
        message.status = MESSAGE_STATUS_FAILED;
        message.failureReason = sendResult.error ?? 'Unknown error';
        await message.save();

        await this.campaignModel.findByIdAndUpdate(campaign._id, {
          $inc: { 'stats.failed': 1 },
        });
      }
    } catch (err) {
      const errorMsg = (err as Error).message;
      message.status = MESSAGE_STATUS_FAILED;
      message.failureReason = errorMsg;
      await message.save();

      await this.campaignModel.findByIdAndUpdate(campaign._id, {
        $inc: { 'stats.failed': 1 },
      });
      throw err;
    }
  }
}
