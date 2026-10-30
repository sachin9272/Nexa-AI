import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { tenantScopePlugin } from '../../common/tenancy/tenant-scope.plugin';

export type CampaignDocument = HydratedDocument<Campaign>;

@Schema({ timestamps: true, collection: 'campaigns' })
export class Campaign {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({
    enum: ['win_back', 'appointment_reminder', 'review_request', 'seasonal', 'custom'],
    required: true,
  })
  goal: string;

  @Prop({ required: true })
  templateId: string; // Meta WhatsApp template name

  @Prop({ required: true })
  templateLanguage: string; // e.g. 'en', 'hi'

  @Prop({
    type: {
      tags: { type: [String], default: [] },
      consentStatus: { type: String, default: 'OPTED_IN' },
      lastVisitBefore: { type: Date, default: null }, // for win-back
      lastVisitAfter: { type: Date, default: null },
      minVisits: { type: Number, default: null },
    },
    default: {},
  })
  segmentFilter: {
    tags: string[];
    consentStatus: string;
    lastVisitBefore: Date | null;
    lastVisitAfter: Date | null;
    minVisits: number | null;
  };

  @Prop({
    enum: ['draft', 'scheduled', 'running', 'completed', 'failed', 'cancelled'],
    default: 'draft',
  })
  status: string;

  @Prop({ type: Date, default: null })
  scheduledAt: Date | null;

  @Prop({ type: Date, default: null })
  startedAt: Date | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({
    type: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      read: { type: Number, default: 0 },
      replied: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      optedOut: { type: Number, default: 0 },
    },
    default: {},
  })
  stats: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    replied: number;
    failed: number;
    optedOut: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

CampaignSchema.plugin(tenantScopePlugin);

// Compound indexes
CampaignSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
CampaignSchema.index({ tenantId: 1, scheduledAt: 1, status: 1 });
