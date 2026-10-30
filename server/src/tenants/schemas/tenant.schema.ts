import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PLAN_GROWTH, PLAN_LIMITS } from '../../common/constants';

export type TenantDocument = HydratedDocument<Tenant>;

@Schema({ timestamps: true, collection: 'tenants' })
export class Tenant {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  category: string; // e.g. 'dental_clinic', 'aesthetic_clinic', 'salon'

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  timezone: string; // e.g. 'Asia/Kolkata'

  @Prop({ trim: true, lowercase: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true })
  website: string;

  @Prop({ trim: true })
  address: string;

  @Prop({ enum: ['starter', 'growth', 'pro'], default: PLAN_GROWTH })
  plan: string;

  @Prop({ enum: ['active', 'trial', 'suspended', 'churned'], default: 'trial' })
  status: string;

  @Prop({
    type: {
      monday: [String],
      tuesday: [String],
      wednesday: [String],
      thursday: [String],
      friday: [String],
      saturday: [String],
      sunday: [String],
    },
    default: {},
  })
  operatingHours: Record<string, string[]>;

  @Prop({
    type: [
      {
        name: String,
        description: String,
        price: String,
        durationMinutes: Number,
        category: String,
      },
    ],
    default: [],
  })
  servicesCatalog: Array<{
    name: string;
    description: string;
    price: string;
    durationMinutes: number;
    category: string;
  }>;

  @Prop({
    type: {
      tone: { type: String, default: 'professional' }, // 'professional', 'friendly', 'clinical'
      languages: { type: [String], default: ['English'] },
      signatureText: { type: String, default: '' },
      ctaText: { type: String, default: 'Book an Appointment' },
      appointmentLink: { type: String, default: '' },
      highlightServices: { type: [String], default: [] },
    },
    default: {},
  })
  brandVoice: {
    tone: string;
    languages: string[];
    signatureText: string;
    ctaText: string;
    appointmentLink: string;
    highlightServices: string[];
  };

  @Prop({
    type: {
      gbpPostsPerMonth: Number,
      reviewRepliesPerMonth: Number,
      whatsappMessagesPerMonth: Number,
      gbpPostsUsed: { type: Number, default: 0 },
      reviewRepliesUsed: { type: Number, default: 0 },
      whatsappMessagesUsed: { type: Number, default: 0 },
      resetAt: Date,
    },
    default: () => ({ ...PLAN_LIMITS[PLAN_GROWTH], resetAt: new Date() }),
  })
  usageLimits: {
    gbpPostsPerMonth: number;
    reviewRepliesPerMonth: number;
    whatsappMessagesPerMonth: number;
    gbpPostsUsed: number;
    reviewRepliesUsed: number;
    whatsappMessagesUsed: number;
    resetAt: Date;
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerUserId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

// Indexes
TenantSchema.index({ phone: 1 }, { unique: true, sparse: true });
TenantSchema.index({ email: 1 }, { sparse: true });
TenantSchema.index({ status: 1 });
