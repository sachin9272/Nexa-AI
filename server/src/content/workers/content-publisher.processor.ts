import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { ContentItem, ContentItemDocument } from '../schemas/content-item.schema';
import { GbpConnection, GbpConnectionDocument } from '../../gbp/schemas/gbp-connection.schema';
import { Review, ReviewDocument } from '../../gbp/schemas/review.schema';
import { GbpService } from '../../gbp/gbp.service';
import { decryptToken } from '../../common/utils/encryption.util';
import {
  QUEUE_CONTENT_PUBLISH,
  JOB_PUBLISH_CONTENT_ITEM,
  CONTENT_STATUS_PUBLISHED,
  CONTENT_STATUS_FAILED,
  CONTENT_TYPE_GBP_POST,
  CONTENT_TYPE_REVIEW_REPLY,
} from '../../common/constants';

@Processor(QUEUE_CONTENT_PUBLISH)
export class ContentPublisherProcessor extends WorkerHost {
  private readonly logger = new Logger(ContentPublisherProcessor.name);

  constructor(
    @InjectModel(ContentItem.name)
    private readonly contentItemModel: Model<ContentItemDocument>,
    @InjectModel(GbpConnection.name)
    private readonly gbpConnectionModel: Model<GbpConnectionDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    private readonly gbpService: GbpService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing job: ${job.name} [${job.id}]`);
    if (job.name === JOB_PUBLISH_CONTENT_ITEM) {
      await this.handlePublish(job.data as { contentItemId: string; tenantId: string });
    }
  }

  private async handlePublish(data: { contentItemId: string; tenantId: string }): Promise<void> {
    const contentItem = await this.contentItemModel.findById(data.contentItemId);
    if (!contentItem) {
      this.logger.warn(`ContentItem ${data.contentItemId} not found`);
      return;
    }

    try {
      const connection = await this.gbpConnectionModel
        .findOne({
          _id: contentItem.gbpConnectionId,
          tenantId: new Types.ObjectId(data.tenantId),
        })
        .select('+encryptedRefreshToken');

      if (!connection) throw new Error('GBP connection not found');

      const encryptionKey = this.configService.get<string>('encryption.key', '');
      const refreshToken = decryptToken(connection.encryptedRefreshToken, encryptionKey);
      const accessToken = await this.gbpService.refreshAccessToken(refreshToken);

      if (contentItem.type === CONTENT_TYPE_GBP_POST) {
        await this.publishGbpPost(contentItem, connection, accessToken);
      } else if (contentItem.type === CONTENT_TYPE_REVIEW_REPLY) {
        await this.publishReviewReply(contentItem, connection, accessToken);
      }

      contentItem.status = CONTENT_STATUS_PUBLISHED;
      contentItem.publishedAt = new Date();
      await contentItem.save();

      this.logger.log(`ContentItem ${data.contentItemId} published successfully`);
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Publishing failed for ${data.contentItemId}: ${error.message}`);
      await this.contentItemModel.findByIdAndUpdate(data.contentItemId, {
        status: CONTENT_STATUS_FAILED,
        publishError: error.message,
      });
      throw err; // BullMQ will handle retries
    }
  }

  private async publishGbpPost(
    item: ContentItemDocument,
    connection: GbpConnectionDocument,
    accessToken: string,
  ): Promise<void> {
    const postBody: Record<string, unknown> = {
      languageCode: 'en-US',
      summary: item.body,
    };

    if (item.callToActionType && item.callToActionUrl) {
      postBody['callToAction'] = {
        actionType: item.callToActionType,
        url: item.callToActionUrl,
      };
    }

    const response = await fetch(
      `https://mybusiness.googleapis.com/v4/${connection.locationId}/localPosts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postBody),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`GBP post creation failed: ${err}`);
    }

    const post = await response.json() as { name: string };
    item.externalPostId = post.name;
  }

  private async publishReviewReply(
    item: ContentItemDocument,
    connection: GbpConnectionDocument,
    accessToken: string,
  ): Promise<void> {
    if (!item.reviewId) throw new Error('No reviewId on REVIEW_REPLY content item');

    const review = await this.reviewModel.findById(item.reviewId);
    if (!review) throw new Error('Review not found');

    const response = await fetch(
      `https://mybusiness.googleapis.com/v4/${review.externalId}/reply`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: item.body }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Review reply failed: ${err}`);
    }

    // Update review document
    await this.reviewModel.findByIdAndUpdate(item.reviewId, {
      'reply.status': 'published',
      'reply.publishedAt': new Date(),
      'reply.publishedText': item.body,
      'reply.contentItemId': item._id,
    });
  }
}
