// ─── Application Constants ─────────────────────────────────────────────────

export const TENANT_CONTEXT_KEY = 'NEXA_TENANT_CONTEXT';

// ─── Queue Names ────────────────────────────────────────────────────────────
export const QUEUE_GBP_SYNC = 'gbp-sync';
export const QUEUE_CONTENT_PUBLISH = 'content-publish';
export const QUEUE_CAMPAIGN_DISPATCH = 'campaign-dispatch';
export const QUEUE_WEEKLY_DIGEST = 'weekly-digest';
export const QUEUE_REVIEW_REPLY = 'review-reply';

// ─── Job Names ───────────────────────────────────────────────────────────────
export const JOB_GBP_METRICS_SYNC = 'gbp-metrics-sync';
export const JOB_GBP_REVIEWS_SYNC = 'gbp-reviews-sync';
export const JOB_GBP_AUDIT = 'gbp-audit';
export const JOB_PUBLISH_CONTENT_ITEM = 'publish-content-item';
export const JOB_DISPATCH_CAMPAIGN = 'dispatch-campaign';
export const JOB_DISPATCH_SINGLE_MESSAGE = 'dispatch-single-message';
export const JOB_SEND_WEEKLY_DIGEST = 'send-weekly-digest';
export const JOB_GENERATE_REVIEW_REPLY = 'generate-review-reply';
export const JOB_GENERATE_GBP_POST = 'generate-gbp-post';

// ─── Content Item Types ──────────────────────────────────────────────────────
export const CONTENT_TYPE_GBP_POST = 'GBP_POST';
export const CONTENT_TYPE_REVIEW_REPLY = 'REVIEW_REPLY';
export const CONTENT_TYPE_WHATSAPP_CAMPAIGN = 'WHATSAPP_CAMPAIGN';

// ─── Content Item Statuses ───────────────────────────────────────────────────
export const CONTENT_STATUS_DRAFT = 'draft';
export const CONTENT_STATUS_PENDING_APPROVAL = 'pending_approval';
export const CONTENT_STATUS_APPROVED = 'approved';
export const CONTENT_STATUS_SCHEDULED = 'scheduled';
export const CONTENT_STATUS_PUBLISHED = 'published';
export const CONTENT_STATUS_REJECTED = 'rejected';
export const CONTENT_STATUS_FAILED = 'failed';

// ─── Message Statuses ────────────────────────────────────────────────────────
export const MESSAGE_STATUS_QUEUED = 'queued';
export const MESSAGE_STATUS_SENT = 'sent';
export const MESSAGE_STATUS_DELIVERED = 'delivered';
export const MESSAGE_STATUS_READ = 'read';
export const MESSAGE_STATUS_REPLIED = 'replied';
export const MESSAGE_STATUS_FAILED = 'failed';
export const MESSAGE_STATUS_OPTED_OUT = 'opted_out';

// ─── Consent Statuses ────────────────────────────────────────────────────────
export const CONSENT_OPTED_IN = 'OPTED_IN';
export const CONSENT_OPTED_OUT = 'OPTED_OUT';
export const CONSENT_PENDING = 'PENDING';

// ─── Tenant Plans ────────────────────────────────────────────────────────────
export const PLAN_STARTER = 'starter';
export const PLAN_GROWTH = 'growth';
export const PLAN_PRO = 'pro';

// ─── User Roles ──────────────────────────────────────────────────────────────
export const ROLE_OWNER = 'owner';
export const ROLE_STAFF = 'staff';
export const ROLE_ADMIN = 'admin';

// ─── Throttle Defaults ───────────────────────────────────────────────────────
export const THROTTLE_TTL_SECONDS = 60;
export const THROTTLE_LIMIT = 30;

// ─── WhatsApp Opt-Out Keywords ───────────────────────────────────────────────
export const WHATSAPP_OPTOUT_KEYWORDS = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'OPT OUT', 'OPTOUT', 'QUIT'];

// ─── GBP Audit Weights ──────────────────────────────────────────────────────
export const GBP_AUDIT_WEIGHTS = {
  businessName: 5,
  description: 15,
  primaryCategory: 10,
  additionalCategories: 5,
  serviceAreas: 5,
  businessHours: 10,
  phoneNumber: 5,
  website: 5,
  appointmentLink: 5,
  photos: 15,
  reviewResponseRate: 10,
  recentActivity: 10,
};

// ─── Plan Limits ─────────────────────────────────────────────────────────────
export const PLAN_LIMITS = {
  [PLAN_STARTER]: {
    gbpPostsPerMonth: 8,
    reviewRepliesPerMonth: 20,
    whatsappMessagesPerMonth: 200,
  },
  [PLAN_GROWTH]: {
    gbpPostsPerMonth: 15,
    reviewRepliesPerMonth: 50,
    whatsappMessagesPerMonth: 500,
  },
  [PLAN_PRO]: {
    gbpPostsPerMonth: 30,
    reviewRepliesPerMonth: 200,
    whatsappMessagesPerMonth: 2000,
  },
};
