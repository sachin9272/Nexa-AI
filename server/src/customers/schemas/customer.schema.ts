import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { tenantScopePlugin } from '../../common/tenancy/tenant-scope.plugin';
import { CONSENT_OPTED_IN } from '../../common/constants';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ timestamps: true, collection: 'customers' })
export class Customer {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  phoneE164: string; // Strict E.164 format e.g. +919876543210

  @Prop({ trim: true, lowercase: true })
  email: string;

  @Prop({
    type: String,
    enum: ['OPTED_IN', 'OPTED_OUT', 'PENDING'],
    default: CONSENT_OPTED_IN,
    required: true,
  })
  consentStatus: string;

  @Prop({ enum: ['import', 'whatsapp_optin', 'manual', 'api'], default: 'import' })
  consentSource: string;

  @Prop({ type: Date, default: Date.now })
  consentTimestamp: Date;

  @Prop({ type: Date, default: null })
  optedOutAt: Date | null;

  @Prop({ type: [String], default: [] })
  tags: string[]; // e.g. ['patient', 'vip', 'inactive', 'reactivation_target']

  @Prop({ type: Date, default: null })
  lastVisitAt: Date | null;

  @Prop({ type: Date, default: null })
  nextAppointmentAt: Date | null;

  @Prop({ type: Number, default: 0 })
  totalVisits: number;

  @Prop({ type: Number, default: 0 })
  totalMessagesSent: number;

  @Prop({ type: Number, default: 0 })
  totalMessagesRead: number;

  @Prop({ type: String, default: null })
  notes: string | null;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.plugin(tenantScopePlugin);

// Compound indexes
CustomerSchema.index({ tenantId: 1, phoneE164: 1 }, { unique: true });
CustomerSchema.index({ tenantId: 1, consentStatus: 1 });
CustomerSchema.index({ tenantId: 1, tags: 1 });
CustomerSchema.index({ tenantId: 1, lastVisitAt: 1 });
CustomerSchema.index({ tenantId: 1, createdAt: -1 });
