import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { tenantScopePlugin } from '../../common/tenancy/tenant-scope.plugin';
import { MESSAGE_STATUS_QUEUED } from '../../common/constants';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true, collection: 'messages' })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaignId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  recipientPhone: string; // E.164

  @Prop({ type: String, default: null })
  providerMsgId: string | null; // Meta WhatsApp message ID (wamid)

  @Prop({
    enum: ['queued', 'sent', 'delivered', 'read', 'replied', 'failed', 'opted_out'],
    default: MESSAGE_STATUS_QUEUED,
    required: true,
  })
  status: string;

  @Prop({ type: String, default: null })
  failureReason: string | null;

  @Prop({ type: [Object], default: [] })
  templateVariables: Record<string, string>[]; // substituted variables

  @Prop({ type: Date, default: null })
  sentAt: Date | null;

  @Prop({ type: Date, default: null })
  deliveredAt: Date | null;

  @Prop({ type: Date, default: null })
  readAt: Date | null;

  @Prop({ type: Date, default: null })
  repliedAt: Date | null;

  @Prop({ type: String, default: null })
  replyText: string | null; // customer's reply text

  createdAt: Date;
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.plugin(tenantScopePlugin);

// Compound indexes
MessageSchema.index({ tenantId: 1, campaignId: 1, status: 1 });
MessageSchema.index({ tenantId: 1, customerId: 1, createdAt: -1 });
MessageSchema.index({ providerMsgId: 1 }, { sparse: true }); // for webhook idempotency
MessageSchema.index({ tenantId: 1, createdAt: -1 });
