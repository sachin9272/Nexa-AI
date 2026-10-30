import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, lowercase: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ select: false })
  passwordHash: string;

  @Prop({ type: String, default: null })
  otpHash: string | null;

  @Prop({ type: Date, default: null })
  otpExpiresAt: Date | null;

  @Prop({
    type: [
      {
        tenantId: { type: Types.ObjectId, ref: 'Tenant', required: true },
        role: {
          type: String,
          enum: ['owner', 'staff', 'admin'],
          required: true,
        },
      },
    ],
    default: [],
  })
  memberships: Array<{ tenantId: Types.ObjectId; role: string }>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, default: null })
  refreshToken: string | null;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;

  @Prop({ trim: true })
  avatarUrl: string;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ 'memberships.tenantId': 1 });
