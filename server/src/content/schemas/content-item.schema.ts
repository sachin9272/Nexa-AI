import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { tenantScopePlugin } from '../../common/tenancy/tenant-scope.plugin';
import {
  CONTENT_STATUS_PENDING_APPROVAL,
  CONTENT_TYPE_GBP_POST,
} from '../../common/constants';

export type ContentItemDocument = HydratedDocument<ContentItem>;

@Schema({ timestamps: true, collection: 'content_items' })
export class ContentItem {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['GBP_POST', 'REVIEW_REPLY', 'WHATSAPP_CAMPAIGN'],
    default: CONTENT_TYPE_GBP_POST,
    required: true,
  })
  type: string;

  @Prop({
    type: String,
    enum: [
      'draft',
      'pending_approval',
      'approved',
      'scheduled',
      'published',
      'rejected',
      'failed',
    ],
    default: CONTENT_STATUS_PENDING_APPROVAL,
    required: true,
  })
  status: string;

  @Prop({ required: true })
  body: string;

  @Prop()
  mediaUrl: string;

  @Prop({ type: String, default: null })
  callToActionUrl: string | null;

  @Prop({ type: String, default: null })
  callToActionType: string | null; // 'BOOK', 'ORDER', 'LEARN_MORE', 'SIGN_UP', 'CALL'

  @Prop({
    enum: ['ai_generated', 'manual', 'template'],
    default: 'ai_generated',
  })
  source: string;

  @Prop()
  modelName: string; // e.g. 'gemini-1.5-flash'

  @Prop()
  promptVersion: string; // e.g. 'gbp_weekly_post_v1.2.0'

  @Prop({ type: Types.ObjectId, ref: 'GbpConnection', default: null })
  gbpConnectionId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Review', default: null })
  reviewId: Types.ObjectId | null; // set when type === REVIEW_REPLY

  @Prop({ type: Date, default: null })
  scheduledAt: Date | null;

  @Prop({ type: Date, default: null })
  publishedAt: Date | null;

  @Prop({ type: String, default: null })
  externalPostId: string | null; // Google post name

  @Prop({ type: String, default: null })
  rejectionReason: string | null;

  @Prop({ type: String, default: null })
  publishError: string | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  approvedBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  approvedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const ContentItemSchema = SchemaFactory.createForClass(ContentItem);

ContentItemSchema.plugin(tenantScopePlugin);

// Compound indexes
ContentItemSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
ContentItemSchema.index({ tenantId: 1, type: 1, status: 1 });
ContentItemSchema.index({ tenantId: 1, scheduledAt: 1, status: 1 });
ContentItemSchema.index({ tenantId: 1, reviewId: 1 });
