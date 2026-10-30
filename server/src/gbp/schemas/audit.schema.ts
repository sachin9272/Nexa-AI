import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { tenantScopePlugin } from '../../common/tenancy/tenant-scope.plugin';

export type AuditDocument = HydratedDocument<Audit>;

export interface AuditFinding {
  field: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  recommendation: string;
  points: number;
}

@Schema({ timestamps: true, collection: 'audits' })
export class Audit {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'GbpConnection', required: true })
  gbpConnectionId: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 100 })
  score: number;

  @Prop({ enum: ['good', 'average', 'poor'], required: true })
  grade: string;

  @Prop({
    type: [
      {
        field: String,
        severity: {
          type: String,
          enum: ['critical', 'high', 'medium', 'low'],
        },
        message: String,
        recommendation: String,
        points: Number,
      },
    ],
    default: [],
  })
  findings: AuditFinding[];

  @Prop({
    type: {
      businessName: Boolean,
      description: Boolean,
      primaryCategory: Boolean,
      additionalCategories: Boolean,
      serviceAreas: Boolean,
      businessHours: Boolean,
      phoneNumber: Boolean,
      website: Boolean,
      appointmentLink: Boolean,
      photos: Boolean,
      coverPhoto: Boolean,
      reviewResponseRate: Number, // percentage 0-100
      totalReviews: Number,
      avgRating: Number,
      recentPostCount: Number,
    },
    default: {},
  })
  breakdown: {
    businessName: boolean;
    description: boolean;
    primaryCategory: boolean;
    additionalCategories: boolean;
    serviceAreas: boolean;
    businessHours: boolean;
    phoneNumber: boolean;
    website: boolean;
    appointmentLink: boolean;
    photos: boolean;
    coverPhoto: boolean;
    reviewResponseRate: number;
    totalReviews: number;
    avgRating: number;
    recentPostCount: number;
  };

  @Prop({ type: [String], default: [] })
  topFixes: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);

AuditSchema.plugin(tenantScopePlugin);

// Compound indexes
AuditSchema.index({ tenantId: 1, createdAt: -1 });
AuditSchema.index({ tenantId: 1, gbpConnectionId: 1, createdAt: -1 });
