import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { SendOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { ROLE_OWNER } from '../common/constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Step 1: Generate and "send" OTP.
   * In production, integrate with Twilio Verify / Firebase Auth.
   * For now, we store a bcrypt hash of the OTP and return it in dev mode.
   */
  async sendOtp(dto: SendOtpDto): Promise<{ message: string; devOtp?: string }> {
    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.userModel.findOneAndUpdate(
      { phone: dto.phone },
      {
        phone: dto.phone,
        otpHash,
        otpExpiresAt: expiresAt,
      },
      { upsert: true, new: true },
    );

    this.logger.log(`OTP generated for phone: ${dto.phone}`);

    // In production: await this.smsService.sendOtp(dto.phone, otp);
    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';

    return {
      message: 'OTP sent successfully.',
      ...(isDev && { devOtp: otp }), // Only expose in development
    };
  }

  /**
   * Step 2: Verify OTP and issue JWT.
   * Creates tenant + user if this is a first-time registration.
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; name: string; phone: string };
    tenant: { id: string; name: string };
    isNewUser: boolean;
  }> {
    const user = await this.userModel
      .findOne({ phone: dto.phone })
      .select('+otpHash');

    if (!user) {
      throw new NotFoundException('No OTP request found for this phone number.');
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      throw new BadRequestException('No active OTP found. Please request a new one.');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    const isOtpValid = await bcrypt.compare(dto.otp, user.otpHash);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP.');
    }

    // Clear OTP
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.lastLoginAt = new Date();

    let tenant: TenantDocument | null = null;
    let isNewUser = false;

    // Check if user already has a membership
    if (user.memberships && user.memberships.length > 0) {
      const primaryMembership = user.memberships[0];
      tenant = await this.tenantModel.findById(primaryMembership.tenantId);
    } else {
      // New user - create tenant if name provided
      isNewUser = true;
      if (dto.tenantName) {
        tenant = await this.tenantModel.create({
          name: dto.tenantName,
          category: dto.tenantCategory ?? 'general',
        });
        user.name = dto.name ?? dto.phone;
        user.memberships = [
          { tenantId: tenant._id as Types.ObjectId, role: ROLE_OWNER },
        ];
        tenant.ownerUserId = user._id as Types.ObjectId;
        await tenant.save();
      } else {
        throw new BadRequestException(
          'First-time registration requires tenantName.',
        );
      }
    }

    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    const activeMembership = user.memberships.find(
      (m) => m.tenantId.toString() === (tenant!._id as Types.ObjectId).toString(),
    );

    const payload = {
      sub: (user._id as Types.ObjectId).toString(),
      tenantId: (tenant._id as Types.ObjectId).toString(),
      role: activeMembership?.role ?? ROLE_OWNER,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    user.refreshToken = await bcrypt.hash(refreshToken, 8);
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: (user._id as Types.ObjectId).toString(),
        name: user.name,
        phone: user.phone,
      },
      tenant: {
        id: (tenant._id as Types.ObjectId).toString(),
        name: tenant.name,
      },
      isNewUser,
    };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        tenantId: string;
        role: string;
      }>(refreshToken);

      const user = await this.userModel
        .findById(payload.sub)
        .select('+refreshToken');

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      const accessToken = this.jwtService.sign({
        sub: payload.sub,
        tenantId: payload.tenantId,
        role: payload.role,
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Refresh token expired or invalid.');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
