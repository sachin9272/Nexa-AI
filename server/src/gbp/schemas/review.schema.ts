import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { tenantScopePlugin } from '../../common/tenancy/tenant-scope.plugin';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'GbpConnection', required: true })
  gbpConnectionId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  externalId: string; // Google review name (e.g. accounts/.../locations/.../reviews/...)

  @Prop({ required: true })
  authorName: string;

  @Prop()
  authorPhotoUrl: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  comment: string;

  @Prop({ required: true })
  reviewTimestamp: Date;

  @Prop({
    enum: ['positive', 'neutral', 'negative', 'mixed'],
    default: 'neutral',
  })
  sentiment: string;

  @Prop({ type: [String], default: [] })
  keyTopics: string[]; // e.g. ['wait time', 'doctor attitude', 'pricing']

  @Prop({
    type: {
      status: {
        type: String,
        enum: ['pending', 'draft_generated', 'approved', 'published', 'skipped'],
        default: 'pending',
      },
      contentItemId: { type: Types.ObjectId, ref: 'ContentItem', default: null },
      publishedAt: { type: Date, default: null },
      publishedText: { type: String, default: null },
    },
    default: {},
  })
  reply: {
    status: string;
    contentItemId: Types.ObjectId | null;
    publishedAt: Date | null;
    publishedText: string | null;
  };

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.plugin(tenantScopePlugin);

// Compound indexes
ReviewSchema.index({ tenantId: 1, createdAt: -1 });
ReviewSchema.index({ tenantId: 1, rating: 1 });
ReviewSchema.index({ tenantId: 1, 'reply.status': 1 });
ReviewSchema.index({ tenantId: 1, sentiment: 1 });
ReviewSchema.index({ externalId: 1 }, { unique: true });
