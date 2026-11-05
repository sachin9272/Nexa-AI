export interface ServiceItem {
  name: string;
  description: string;
  price: string;
  durationMinutes: number;
  category: string;
}

export interface BrandVoice {
  tone: string;
  languages: string[];
  signatureText: string;
  ctaText: string;
  appointmentLink: string;
  highlightServices: string[];
}

export interface Tenant {
  _id: string;
  name: string;
  category: string;
  city: string;
  timezone: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  plan: 'starter' | 'growth' | 'pro';
  status: 'active' | 'trial' | 'suspended';
  operatingHours?: Record<string, string[]>;
  servicesCatalog: ServiceItem[];
  brandVoice: BrandVoice;
  usageLimits: {
    gbpPostsPerMonth: number;
    reviewRepliesPerMonth: number;
    whatsappMessagesPerMonth: number;
    gbpPostsUsed: number;
    reviewRepliesUsed: number;
    whatsappMessagesUsed: number;
  };
}

export interface GbpAuditRecommendation {
  key: string;
  title: string;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  currentValue: string;
  recommendation: string;
  estimatedCallsLiftPercentage: number;
  autoFixAvailable: boolean;
}

export interface GbpAudit {
  score: number;
  healthStatus: 'OPTIMAL' | 'GOOD' | 'NEEDS_WORK' | 'CRITICAL';
  missingAttributes: string[];
  photoCount: number;
  hasAppointmentLink: boolean;
  businessHoursConfigured: boolean;
  reviewResponseRate: number;
  recommendations: GbpAuditRecommendation[];
  evaluatedAt: string;
}

export interface Review {
  _id: string;
  externalId: string;
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  comment: string;
  reviewTimestamp: string;
  sentiment: 'positive' | 'neutral' | 'mixed' | 'negative';
  reply?: {
    status: 'pending' | 'draft_generated' | 'approved' | 'published';
    publishedText?: string;
    publishedAt?: string;
  };
}

export interface ContentItem {
  _id: string;
  type: 'GBP_POST' | 'REVIEW_REPLY' | 'WHATSAPP_CAMPAIGN';
  status: 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'published' | 'rejected';
  body: string;
  callToActionType?: string;
  callToActionUrl?: string;
  source: string;
  modelName: string;
  promptVersion: string;
  reviewId?: string;
  scheduledAt?: string;
  approvedAt?: string;
  publishedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  phoneE164: string;
  email?: string;
  consentStatus: 'OPTED_IN' | 'OPTED_OUT' | 'PENDING';
  consentSource: string;
  consentTimestamp: string;
  tags: string[];
  lastVisitAt?: string;
  totalVisits: number;
  notes?: string;
  createdAt: string;
}

export interface Campaign {
  _id: string;
  title: string;
  description?: string;
  goal: 'win_back' | 'appointment_reminder' | 'review_request' | 'seasonal' | 'custom';
  templateId: string;
  templateLanguage: string;
  segmentFilter?: {
    tags: string[];
    consentStatus: string;
    lastVisitBefore?: string;
    lastVisitAfter?: string;
  };
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  scheduledAt?: string;
  startedAt?: string;
  stats: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    replied: number;
    failed: number;
    optedOut: number;
  };
  createdAt: string;
}

export interface AnalyticsOverview {
  periodDays: number;
  outcomes: {
    callsReceived: number;
    directionRequests: number;
    websiteClicks: number;
    totalEngagements: number;
  };
  reputation: {
    totalReviews: number;
    averageRating: number;
    repliedPercentage: number;
    pendingReplies: number;
  };
  whatsapp: {
    campaignsActive: number;
    messagesSent: number;
    readRatePercentage: number;
    repliesReceived: number;
  };
  content: {
    postsPublished: number;
    pendingApprovals: number;
  };
  unitEconomics: {
    llmTokens: number;
    llmCostUsd: number;
    whatsappCostUsd: number;
    estimatedRevenueAttributedUsd: number;
  };
}

export interface TimeseriesPoint {
  date: string;
  calls: number;
  directions: number;
  whatsappSent: number;
}
