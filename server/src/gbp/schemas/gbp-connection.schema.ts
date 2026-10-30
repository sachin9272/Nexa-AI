import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { tenantScopePlugin } from '../../common/tenancy/tenant-scope.plugin';

export type GbpConnectionDocument = HydratedDocument<GbpConnection>;

@Schema({ timestamps: true, collection: 'gbp_connections' })
export class GbpConnection {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  googleAccountId: string;

  @Prop({ required: true, select: false })
  encryptedRefreshToken: string;

  @Prop({ required: true })
  locationId: string;

  @Prop()
  locationName: string;

  @Prop()
  address: string;

  @Prop()
  websiteUri: string;

  @Prop({ type: [String], default: [] })
  primaryPhone: string[];

  @Prop({
    type: String,
    enum: ['connected', 'syncing', 'error', 'disconnected'],
    default: 'connected',
  })
  syncStatus: string;

  @Prop({ type: String, default: null })
  syncError: string | null;

  @Prop({ type: Date, default: null })
  lastSyncedAt: Date | null;

  @Prop({ type: Date, default: null })
  lastAuditAt: Date | null;

  @Prop({ type: Number, default: null })
  lastAuditScore: number | null;

  createdAt: Date;
  updatedAt: Date;
}

export const GbpConnectionSchema = SchemaFactory.createForClass(GbpConnection);

GbpConnectionSchema.plugin(tenantScopePlugin);

// Compound indexes
GbpConnectionSchema.index({ tenantId: 1, locationId: 1 }, { unique: true });
GbpConnectionSchema.index({ tenantId: 1, syncStatus: 1 });
