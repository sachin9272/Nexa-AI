import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Model, Types } from 'mongoose';
import {
  GbpConnection,
  GbpConnectionDocument,
} from './schemas/gbp-connection.schema';
import { Audit, AuditDocument } from './schemas/audit.schema';
import { Review, ReviewDocument } from './schemas/review.schema';
import { TenantContextService } from '../common/tenancy/tenant-context.service';
import { encryptToken, decryptToken } from '../common/utils/encryption.util';
import { AiGatewayService } from '../ai/ai-gateway.service';
import {
  QUEUE_GBP_SYNC,
  JOB_GBP_AUDIT,
  JOB_GBP_METRICS_SYNC,
  JOB_GBP_REVIEWS_SYNC,
  GBP_AUDIT_WEIGHTS,
} from '../common/constants';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';

interface GbpProfileData {
  name?: string;
  primaryPhone?: string[];
  websiteUri?: string;
  primaryCategory?: { displayName: string };
  additionalCategories?: Array<{ displayName: string }>;
  regularHours?: { periods: Array<unknown> };
  serviceArea?: { businessType: string };
  profile?: { description: string };
  openInfo?: { status: string };
  metadata?: { mapsUri: string; newReviewUri: string };
}

@Injectable()
export class GbpService {
  private readonly logger = new Logger(GbpService.name);
  private readonly GBP_API_BASE = 'https://mybusiness.googleapis.com/v4';
  private readonly GBP_MYBUSINESS_BASE = 'https://mybusinessinformation.googleapis.com/v1';

  constructor(
    @InjectModel(GbpConnection.name)
    private readonly gbpConnectionModel: Model<GbpConnectionDocument>,
    @InjectModel(Audit.name)
    private readonly auditModel: Model<AuditDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    @InjectQueue(QUEUE_GBP_SYNC)
    private readonly gbpSyncQueue: Queue,
    private readonly tenantContext: TenantContextService,
    private readonly configService: ConfigService,
    private readonly aiGateway: AiGatewayService,
  ) {}

  // ─── OAuth Flow ────────────────────────────────────────────────────────────

  getOAuthUrl(state: string): string {
    const clientId = this.configService.get<string>('google.clientId');
    const redirectUri = this.configService.get<string>('google.redirectUri');
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'openid',
      'email',
      'profile',
    ];

    const params = new URLSearchParams({
      client_id: clientId ?? '',
      redirect_uri: redirectUri ?? '',
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleOAuthCallback(code: string, state?: string): Promise<GbpConnectionDocument> {
    let tenantId: Types.ObjectId;
    try {
      if (state && Types.ObjectId.isValid(state)) {
        tenantId = new Types.ObjectId(state);
      } else {
        tenantId = this.tenantContext.getTenantId();
      }
    } catch {
      const tenant = await this.tenantModel.findOne();
      tenantId = (tenant?._id as Types.ObjectId) ?? new Types.ObjectId();
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code);
    const encryptionKey = this.configService.get<string>('encryption.key', '');
    const encryptedRefreshToken = encryptToken(tokens.refresh_token, encryptionKey);

    // Fetch account and locations
    const accessToken = tokens.access_token;
    const accountId = await this.fetchGoogleAccountId(accessToken);
    const locations = await this.fetchLocations(accessToken, accountId);

    if (!locations.length) {
      throw new BadRequestException(
        'No Google Business Profile locations found for this account.',
      );
    }

    const location = locations[0]; // Use first location; multi-location coming later
    const locationId = location.name; // Format: accounts/{accountId}/locations/{locationId}

    const connection = await this.gbpConnectionModel.findOneAndUpdate(
      { tenantId, locationId },
      {
        tenantId,
        googleAccountId: accountId,
        encryptedRefreshToken,
        locationId,
        locationName: location.title,
        address: this.formatAddress(location.storefrontAddress),
        websiteUri: location.websiteUri,
        primaryPhone: location.phoneNumbers?.primaryPhone ? [location.phoneNumbers.primaryPhone] : [],
        syncStatus: 'connected',
        lastSyncedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    // Queue initial audit and metrics sync
    await this.gbpSyncQueue.add(JOB_GBP_AUDIT, {
      tenantId: tenantId.toString(),
      gbpConnectionId: (connection._id as Types.ObjectId).toString(),
    });

    await this.gbpSyncQueue.add(JOB_GBP_METRICS_SYNC, {
      tenantId: tenantId.toString(),
      gbpConnectionId: (connection._id as Types.ObjectId).toString(),
    });

    return connection;
  }

  // ─── Audit Engine ─────────────────────────────────────────────────────────

  async runAudit(gbpConnectionId: string, tenantId: Types.ObjectId): Promise<AuditDocument> {
    const connection = await this.gbpConnectionModel
      .findOne({ _id: gbpConnectionId, tenantId })
      .select('+encryptedRefreshToken');

    if (!connection) throw new NotFoundException('GBP connection not found');

    const encryptionKey = this.configService.get<string>('encryption.key', '');
    const refreshToken = decryptToken(connection.encryptedRefreshToken, encryptionKey);
    const accessToken = await this.refreshAccessToken(refreshToken);

    const profileData = await this.fetchProfileData(accessToken, connection.locationId);
    const reviewStats = await this.fetchReviewStats(accessToken, connection.locationId);

    const { score, breakdown, findings } = this.calculateAuditScore(
      profileData,
      reviewStats,
    );

    const grade = score >= 70 ? 'good' : score >= 40 ? 'average' : 'poor';

    // Use AI to generate top-3 human-readable fixes
    const tenant = await this.tenantModel.findById(tenantId);
    const missingFields = findings
      .filter((f) => f.severity === 'critical' || f.severity === 'high')
      .map((f) => f.field)
      .join(', ');

    let topFixes: string[] = findings
      .slice(0, 3)
      .map((f) => f.recommendation);

    try {
      const aiResult = await this.aiGateway.generate<{
        topFixes: Array<{ fix: string }>;
        summary: string;
      }>({
        promptKey: 'gbp_audit',
        tenantContext: {
          tenantId,
          businessName: tenant?.name ?? 'Your Business',
          category: tenant?.category ?? '',
          city: tenant?.city ?? '',
          services: [],
          brandVoice: tenant?.brandVoice ?? {
            tone: 'professional',
            languages: ['English'],
            signatureText: '',
            ctaText: 'Book Now',
            appointmentLink: '',
            highlightServices: [],
          },
        },
        variables: {
          profileData: JSON.stringify(profileData),
          score: score.toString(),
          missingFields,
        },
      });
      topFixes = aiResult.data.topFixes?.map((f) => f.fix) ?? topFixes;
    } catch (err) {
      this.logger.warn('AI audit text generation failed, using algorithmic fallback:', err);
    }

    const audit = await this.auditModel.create({
      tenantId,
      gbpConnectionId: connection._id,
      score,
      grade,
      findings,
      breakdown,
      topFixes,
    });

    // Update connection with latest audit score
    await this.gbpConnectionModel.findByIdAndUpdate(connection._id, {
      lastAuditAt: new Date(),
      lastAuditScore: score,
    });

    return audit;
  }

  private calculateAuditScore(
    profile: GbpProfileData,
    reviewStats: { total: number; avgRating: number; responseRate: number; recentPostCount: number },
  ): {
    score: number;
    breakdown: Record<string, unknown>;
    findings: Array<{ field: string; severity: 'critical' | 'high' | 'medium' | 'low'; message: string; recommendation: string; points: number }>;
  } {
    const findings: Array<{
      field: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      message: string;
      recommendation: string;
      points: number;
    }> = [];
    let earnedPoints = 0;
    const maxPoints = Object.values(GBP_AUDIT_WEIGHTS).reduce((a, b) => a + b, 0);

    const checks: Array<{
      field: string;
      weight: number;
      check: () => boolean;
      severity: 'critical' | 'high' | 'medium' | 'low';
      failMessage: string;
      recommendation: string;
    }> = [
      {
        field: 'businessName',
        weight: GBP_AUDIT_WEIGHTS.businessName,
        check: () => !!(profile.name),
        severity: 'critical',
        failMessage: 'Business name is missing from Google Business Profile.',
        recommendation: 'Add your business name immediately — this is mandatory for GBP.',
      },
      {
        field: 'description',
        weight: GBP_AUDIT_WEIGHTS.description,
        check: () => (profile.profile?.description?.length ?? 0) >= 150,
        severity: 'high',
        failMessage: 'Business description is missing or too short (under 150 characters).',
        recommendation: 'Add a compelling 250-750 character description highlighting your top services and unique value.',
      },
      {
        field: 'primaryCategory',
        weight: GBP_AUDIT_WEIGHTS.primaryCategory,
        check: () => !!(profile.primaryCategory?.displayName),
        severity: 'critical',
        failMessage: 'Primary business category is not set.',
        recommendation: 'Set the most specific primary category (e.g. "Dental Clinic" not just "Clinic").',
      },
      {
        field: 'businessHours',
        weight: GBP_AUDIT_WEIGHTS.businessHours,
        check: () => (profile.regularHours?.periods?.length ?? 0) > 0,
        severity: 'high',
        failMessage: 'Business hours are not configured.',
        recommendation: 'Add accurate opening hours for all operating days including holidays.',
      },
      {
        field: 'phoneNumber',
        weight: GBP_AUDIT_WEIGHTS.phoneNumber,
        check: () => (profile.primaryPhone?.length ?? 0) > 0,
        severity: 'critical',
        failMessage: 'No phone number added to profile.',
        recommendation: 'Add a primary business phone number to enable "Call" actions from Google Maps.',
      },
      {
        field: 'website',
        weight: GBP_AUDIT_WEIGHTS.website,
        check: () => !!(profile.websiteUri),
        severity: 'medium',
        failMessage: 'No website URL linked.',
        recommendation: 'Link your website to drive traffic and improve trust signals.',
      },
      {
        field: 'reviewResponseRate',
        weight: GBP_AUDIT_WEIGHTS.reviewResponseRate,
        check: () => reviewStats.responseRate >= 75,
        severity: 'high',
        failMessage: `Only ${reviewStats.responseRate.toFixed(0)}% of reviews have been responded to.`,
        recommendation: 'Respond to at least 75% of reviews — Google favors active profiles.',
      },
      {
        field: 'recentActivity',
        weight: GBP_AUDIT_WEIGHTS.recentActivity,
        check: () => reviewStats.recentPostCount >= 2,
        severity: 'medium',
        failMessage: 'No recent GBP posts in the last 30 days.',
        recommendation: 'Post 2-4 updates per week to signal an active, engaged business to Google.',
      },
    ];

    const breakdown: Record<string, unknown> = {
      reviewResponseRate: reviewStats.responseRate,
      totalReviews: reviewStats.total,
      avgRating: reviewStats.avgRating,
      recentPostCount: reviewStats.recentPostCount,
    };

    for (const check of checks) {
      const passed = check.check();
      breakdown[check.field] = passed;
      if (passed) {
        earnedPoints += check.weight;
      } else {
        findings.push({
          field: check.field,
          severity: check.severity,
          message: check.failMessage,
          recommendation: check.recommendation,
          points: check.weight,
        });
      }
    }

    // Sort findings by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const score = Math.round((earnedPoints / maxPoints) * 100);
    return { score, breakdown, findings };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  async getConnections(): Promise<GbpConnectionDocument[]> {
    const tenantId = this.tenantContext.getTenantId();
    return this.gbpConnectionModel.find({ tenantId }).sort({ createdAt: -1 });
  }

  async getLatestAudit(gbpConnectionId: string): Promise<AuditDocument | null> {
    const tenantId = this.tenantContext.getTenantId();
    return this.auditModel
      .findOne({ tenantId, gbpConnectionId })
      .sort({ createdAt: -1 });
  }

  async getReviews(
    gbpConnectionId: string,
    page = 1,
    limit = 20,
    replyStatus?: string,
  ): Promise<{ reviews: ReviewDocument[]; total: number }> {
    const tenantId = this.tenantContext.getTenantId();
    const filter: Record<string, unknown> = { tenantId, gbpConnectionId };
    if (replyStatus) filter['reply.status'] = replyStatus;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ reviewTimestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.reviewModel.countDocuments(filter),
    ]);

    return { reviews, total };
  }

  private async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const params = new URLSearchParams({
      code,
      client_id: this.configService.get<string>('google.clientId', ''),
      client_secret: this.configService.get<string>('google.clientSecret', ''),
      redirect_uri: this.configService.get<string>('google.redirectUri', ''),
      grant_type: 'authorization_code',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new BadRequestException(`Google OAuth token exchange failed: ${err}`);
    }

    return response.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.configService.get<string>('google.clientId', ''),
      client_secret: this.configService.get<string>('google.clientSecret', ''),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Google access token');
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  }

  private async fetchGoogleAccountId(accessToken: string): Promise<string> {
    const res = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const data = await res.json() as { accounts?: Array<{ name: string }> };
    const account = data.accounts?.[0];
    if (!account) throw new BadRequestException('No Google Business Account found');
    return account.name;
  }

  private async fetchLocations(accessToken: string, accountName: string): Promise<Array<{
    name: string;
    title: string;
    websiteUri?: string;
    storefrontAddress?: Record<string, unknown>;
    phoneNumbers?: { primaryPhone: string };
  }>> {
    const res = await fetch(
      `${this.GBP_MYBUSINESS_BASE}/${accountName}/locations?readMask=name,title,websiteUri,phoneNumbers,storefrontAddress`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const data = await res.json() as { locations?: Array<{
      name: string;
      title: string;
      websiteUri?: string;
      storefrontAddress?: Record<string, unknown>;
      phoneNumbers?: { primaryPhone: string };
    }> };
    return data.locations ?? [];
  }

  private async fetchProfileData(
    accessToken: string,
    locationName: string,
  ): Promise<GbpProfileData> {
    const res = await fetch(
      `${this.GBP_MYBUSINESS_BASE}/${locationName}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!res.ok) return {};
    return res.json() as Promise<GbpProfileData>;
  }

  private async fetchReviewStats(
    accessToken: string,
    locationName: string,
  ): Promise<{ total: number; avgRating: number; responseRate: number; recentPostCount: number }> {
    try {
      const res = await fetch(
        `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const data = await res.json() as {
        reviews?: Array<{ rating: string; reviewReply?: { comment: string } }>;
        totalReviewCount?: number;
        averageRating?: number;
      };

      const reviews = data.reviews ?? [];
      const total = data.totalReviewCount ?? 0;
      const avgRating = data.averageRating ?? 0;
      const responded = reviews.filter((r) => r.reviewReply).length;
      const responseRate = reviews.length > 0 ? (responded / reviews.length) * 100 : 0;

      return { total, avgRating, responseRate, recentPostCount: 0 };
    } catch {
      return { total: 0, avgRating: 0, responseRate: 0, recentPostCount: 0 };
    }
  }

  private formatAddress(addr?: Record<string, unknown>): string {
    if (!addr) return '';
    const parts = [
      addr['addressLines'],
      addr['locality'],
      addr['administrativeArea'],
      addr['postalCode'],
    ].filter(Boolean);
    return parts.join(', ');
  }
}
