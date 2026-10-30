import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { tenantScopePlugin } from '../../common/tenancy/tenant-scope.plugin';

export type MetricsDailyDocument = HydratedDocument<MetricsDaily>;

@Schema({ timestamps: true, collection: 'metrics_daily' })
export class MetricsDaily {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  date: Date; // Normalized to start of day UTC

  @Prop({
    type: {
      callClicks: { type: Number, default: 0 },
      directionRequests: { type: Number, default: 0 },
      websiteClicks: { type: Number, default: 0 },
      mapsImpressions: { type: Number, default: 0 },
      searchImpressions: { type: Number, default: 0 },
      photoViews: { type: Number, default: 0 },
    },
    default: {},
  })
  gbp: {
    callClicks: number;
    directionRequests: number;
    websiteClicks: number;
    mapsImpressions: number;
    searchImpressions: number;
    photoViews: number;
  };

  @Prop({
    type: {
      messagesSent: { type: Number, default: 0 },
      messagesDelivered: { type: Number, default: 0 },
      messagesRead: { type: Number, default: 0 },
      replies: { type: Number, default: 0 },
      optOuts: { type: Number, default: 0 },
    },
    default: {},
  })
  whatsapp: {
    messagesSent: number;
    messagesDelivered: number;
    messagesRead: number;
    replies: number;
    optOuts: number;
  };

  @Prop({
    type: {
      reviewsReceived: { type: Number, default: 0 },
      reviewsReplied: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0 },
      postsPublished: { type: Number, default: 0 },
    },
    default: {},
  })
  content: {
    reviewsReceived: number;
    reviewsReplied: number;
    avgRating: number;
    postsPublished: number;
  };

  @Prop({
    type: {
      llmTokensUsed: { type: Number, default: 0 },
      llmCostUsd: { type: Number, default: 0 },
      whatsappMessagesCost: { type: Number, default: 0 },
    },
    default: {},
  })
  costs: {
    llmTokensUsed: number;
    llmCostUsd: number;
    whatsappMessagesCost: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const MetricsDailySchema = SchemaFactory.createForClass(MetricsDaily);

MetricsDailySchema.plugin(tenantScopePlugin);

// Compound indexes
MetricsDailySchema.index({ tenantId: 1, date: -1 });
MetricsDailySchema.index({ tenantId: 1, date: 1 }, { unique: true });
