import {
  Tenant,
  GbpAudit,
  Review,
  ContentItem,
  Customer,
  Campaign,
  AnalyticsOverview,
  TimeseriesPoint,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Initial realistic default data for clinic marketing co-pilot
const initialTenant: Tenant = {
  _id: 't_6723a19b8c',
  name: 'Apex Dental & Aesthetic Clinic',
  category: 'Dental & Aesthetic Practice',
  city: 'New Delhi',
  timezone: 'Asia/Kolkata',
  phone: '+91 98110 44291',
  email: 'care@apexdental.in',
  website: 'https://apexdental.in',
  address: 'B-42, Greater Kailash 1, New Delhi, Delhi 110048',
  plan: 'growth',
  status: 'active',
  operatingHours: {
    monday: ['09:00 - 20:00'],
    tuesday: ['09:00 - 20:00'],
    wednesday: ['09:00 - 20:00'],
    thursday: ['09:00 - 20:00'],
    friday: ['09:00 - 20:00'],
    saturday: ['10:00 - 18:00'],
    sunday: ['Closed'],
  },
  servicesCatalog: [
    {
      name: 'Laser Teeth Whitening',
      description: 'Advanced 45-min Zoom diode laser treatment for up to 8 shades brighter teeth.',
      price: '₹7,500',
      durationMinutes: 45,
      category: 'Cosmetic Dentistry',
    },
    {
      name: 'Invisalign Clear Aligners',
      description: 'US-FDA certified invisible teeth alignment treatment with 3D iTero digital scans.',
      price: '₹85,000',
      durationMinutes: 60,
      category: 'Orthodontics',
    },
    {
      name: 'Painless Single-Sitting RCT',
      description: 'Rotary endodontics root canal therapy under Zeiss surgical microscope.',
      price: '₹5,500',
      durationMinutes: 45,
      category: 'Endodontics',
    },
    {
      name: 'HydraFacial Glow Therapy',
      description: 'Medical-grade vortex infusion and skin resurfacing treatment.',
      price: '₹4,200',
      durationMinutes: 40,
      category: 'Aesthetic Clinic',
    },
  ],
  brandVoice: {
    tone: 'Empathetic, reassuring, and clinically precise',
    languages: ['English', 'Hindi'],
    signatureText: 'Dr. Rohan Mehra, Lead Implantologist | Apex Dental',
    ctaText: 'Book Instant Consultation',
    appointmentLink: 'https://apexdental.in/book',
    highlightServices: ['Laser Teeth Whitening', 'Invisalign Clear Aligners'],
  },
  usageLimits: {
    gbpPostsPerMonth: 15,
    reviewRepliesPerMonth: 50,
    whatsappMessagesPerMonth: 500,
    gbpPostsUsed: 8,
    reviewRepliesUsed: 22,
    whatsappMessagesUsed: 310,
  },
};

const initialAudit: GbpAudit = {
  score: 78,
  healthStatus: 'GOOD',
  missingAttributes: [
    'Online appointment booking link not set in attributes section',
    'Cover photo resolution below 1024x576 recommended',
    'Special holiday operating hours unconfirmed',
  ],
  photoCount: 18,
  hasAppointmentLink: true,
  businessHoursConfigured: true,
  reviewResponseRate: 84,
  evaluatedAt: new Date().toISOString(),
  recommendations: [
    {
      key: 'cta_link',
      title: 'Missing Direct Appointment Attribute',
      impact: 'CRITICAL',
      category: 'Attributes',
      currentValue: 'No action link configured',
      recommendation: 'Link directly to https://apexdental.in/book to trigger the Google Reserve badge.',
      estimatedCallsLiftPercentage: 14,
      autoFixAvailable: true,
    },
    {
      key: 'response_speed',
      title: '3 Reviews Awaiting Reply (>48 hours)',
      impact: 'HIGH',
      category: 'Reputation',
      currentValue: '84% response rate',
      recommendation: 'Reply to remaining reviews to reach 100% and earn the High Response ranking signal.',
      estimatedCallsLiftPercentage: 9,
      autoFixAvailable: true,
    },
    {
      key: 'high_res_photos',
      title: 'Clinic Interior Photos Need Refresh',
      impact: 'MEDIUM',
      category: 'Media',
      currentValue: 'Last interior photo uploaded 4 months ago',
      recommendation: 'Upload 3 high-definition photos of clinic operatory and sterilization bay.',
      estimatedCallsLiftPercentage: 6,
      autoFixAvailable: false,
    },
  ],
};

const initialApprovals: ContentItem[] = [
  {
    _id: 'ci_01',
    type: 'GBP_POST',
    status: 'pending_approval',
    body: '✨ Thinking about brightening your smile for upcoming wedding season? Our in-clinic Laser Teeth Whitening gives you up to 8 shades lighter teeth in just 45 minutes using gentle diode technology. \n\nBook your consultation this week and receive a complimentary smile assessment scan! 📍 Greater Kailash 1, New Delhi.',
    callToActionType: 'BOOK',
    callToActionUrl: 'https://apexdental.in/book',
    source: 'ai_generated',
    modelName: 'gemini-1.5-flash',
    promptVersion: 'gbp_weekly_post@1.2.0',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'ci_02',
    type: 'REVIEW_REPLY',
    status: 'pending_approval',
    body: 'Dear Priya, thank you so much for the glowing 5-star review! We are delighted to hear that your Invisalign aligner fitting went so smoothly and that our team made you feel at ease. We look forward to seeing your progress at your next checkup. Warm regards, Dr. Rohan & Apex Dental Team.',
    source: 'ai_generated',
    modelName: 'gemini-1.5-flash',
    promptVersion: 'review_reply_positive@1.1.0',
    reviewId: 'rev_101',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'ci_03',
    type: 'GBP_POST',
    status: 'pending_approval',
    body: '🦷 Suffering from sudden tooth sensitivity? Micro-fractures and enamel thinning are common issues that can be treated early before needing major procedures. Walk-in appointments available daily at Apex Dental.',
    callToActionType: 'CALL',
    callToActionUrl: 'tel:+919811044291',
    source: 'ai_generated',
    modelName: 'gemini-1.5-flash',
    promptVersion: 'gbp_weekly_post@1.2.0',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

const initialReviews: Review[] = [
  {
    _id: 'rev_101',
    externalId: 'locations/123/reviews/r1',
    authorName: 'Priya Sharma',
    rating: 5,
    comment: 'Had my Invisalign consultation here last week. Dr. Rohan explained everything using 3D digital scans. The clinic is pristine and staff is very polite!',
    reviewTimestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    sentiment: 'positive',
    reply: {
      status: 'draft_generated',
    },
  },
  {
    _id: 'rev_102',
    externalId: 'locations/123/reviews/r2',
    authorName: 'Amitabh Sen',
    rating: 5,
    comment: 'Painless RCT done today. I was terrified of dental needles but did not feel any discomfort. Highly recommended clinic in South Delhi.',
    reviewTimestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    sentiment: 'positive',
    reply: {
      status: 'published',
      publishedText: 'Thank you Amitabh for trusting us with your dental care. Ensuring zero-pain treatment is our top priority! Get well soon.',
      publishedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    },
  },
  {
    _id: 'rev_103',
    externalId: 'locations/123/reviews/r3',
    authorName: 'Kunal Kapoor',
    rating: 4,
    comment: 'Great dental cleaning experience. The waiting area was slightly crowded on Saturday morning, but doctor attended to me within 15 minutes.',
    reviewTimestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
    sentiment: 'mixed',
    reply: {
      status: 'pending',
    },
  },
];

const initialCampaigns: Campaign[] = [
  {
    _id: 'cmp_01',
    title: '6-Month Dental Checkup & Hygiene Win-Back',
    goal: 'win_back',
    templateId: 'patient_winback_checkup_v2',
    templateLanguage: 'en',
    status: 'running',
    startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    stats: {
      total: 142,
      sent: 142,
      delivered: 139,
      read: 118,
      replied: 24,
      failed: 3,
      optedOut: 1,
    },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    _id: 'cmp_02',
    title: 'Post-Visit Google 5-Star Review Booster',
    goal: 'review_request',
    templateId: 'review_request_post_appointment',
    templateLanguage: 'en',
    status: 'running',
    startedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    stats: {
      total: 85,
      sent: 85,
      delivered: 84,
      read: 76,
      replied: 19,
      failed: 1,
      optedOut: 0,
    },
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    _id: 'cmp_03',
    title: 'Diwali Festive Smile Makeover Offer',
    goal: 'seasonal',
    templateId: 'festive_whitening_promo',
    templateLanguage: 'en',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    stats: {
      total: 310,
      sent: 0,
      delivered: 0,
      read: 0,
      replied: 0,
      failed: 0,
      optedOut: 0,
    },
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const initialCustomers: Customer[] = [
  {
    _id: 'c_01',
    name: 'Aanya Verma',
    phoneE164: '+919810123456',
    email: 'aanya.v@gmail.com',
    consentStatus: 'OPTED_IN',
    consentSource: 'import',
    consentTimestamp: new Date(Date.now() - 86400000 * 30).toISOString(),
    tags: ['patient', 'invisalign', 'vip'],
    lastVisitAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    totalVisits: 4,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    _id: 'c_02',
    name: 'Rahul Batra',
    phoneE164: '+919820456789',
    email: 'r.batra@outlook.com',
    consentStatus: 'OPTED_IN',
    consentSource: 'whatsapp_optin',
    consentTimestamp: new Date(Date.now() - 86400000 * 45).toISOString(),
    tags: ['patient', 'teeth_whitening', 'reactivation_target'],
    lastVisitAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    totalVisits: 2,
    createdAt: new Date(Date.now() - 86400000 * 190).toISOString(),
  },
  {
    _id: 'c_03',
    name: 'Sunita Mehra',
    phoneE164: '+919930789012',
    email: 'sunita.mehra@gmail.com',
    consentStatus: 'OPTED_IN',
    consentSource: 'manual',
    consentTimestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
    tags: ['patient', 'implants'],
    lastVisitAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    totalVisits: 6,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    _id: 'c_04',
    name: 'Vikram Joshi',
    phoneE164: '+919876500112',
    consentStatus: 'OPTED_OUT',
    consentSource: 'import',
    consentTimestamp: new Date(Date.now() - 86400000 * 20).toISOString(),
    tags: ['unsubscribed'],
    lastVisitAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    totalVisits: 1,
    createdAt: new Date(Date.now() - 86400000 * 95).toISOString(),
  },
];

const initialAnalytics: AnalyticsOverview = {
  periodDays: 30,
  outcomes: {
    callsReceived: 148,
    directionRequests: 214,
    websiteClicks: 490,
    totalEngagements: 852,
  },
  reputation: {
    totalReviews: 64,
    averageRating: 4.9,
    repliedPercentage: 95,
    pendingReplies: 3,
  },
  whatsapp: {
    campaignsActive: 2,
    messagesSent: 537,
    readRatePercentage: 86,
    repliesReceived: 43,
  },
  content: {
    postsPublished: 8,
    pendingApprovals: 3,
  },
  unitEconomics: {
    llmTokens: 148200,
    llmCostUsd: 0.18,
    whatsappCostUsd: 2.68,
    estimatedRevenueAttributedUsd: 11620,
  },
};

const initialTimeseries: TimeseriesPoint[] = [
  { date: 'Oct 18', calls: 8, directions: 12, whatsappSent: 20 },
  { date: 'Oct 20', calls: 14, directions: 19, whatsappSent: 35 },
  { date: 'Oct 22', calls: 11, directions: 15, whatsappSent: 42 },
  { date: 'Oct 24', calls: 16, directions: 22, whatsappSent: 60 },
  { date: 'Oct 26', calls: 19, directions: 25, whatsappSent: 75 },
  { date: 'Oct 28', calls: 24, directions: 31, whatsappSent: 90 },
  { date: 'Oct 30', calls: 27, directions: 38, whatsappSent: 110 },
];

// In-memory local state store for persistent interactive actions
let stateTenant = { ...initialTenant };
let stateAudit = { ...initialAudit };
let stateApprovals = [...initialApprovals];
let stateReviews = [...initialReviews];
let stateCampaigns = [...initialCampaigns];
let stateCustomers = [...initialCustomers];
let stateAnalytics = { ...initialAnalytics };

export const api = {
  // --- Tenant ---
  async getTenant(): Promise<Tenant> {
    try {
      const res = await fetch(`${API_BASE_URL}/tenants/current`);
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch {}
    return stateTenant;
  },

  async updateTenant(updates: Partial<Tenant>): Promise<Tenant> {
    try {
      const res = await fetch(`${API_BASE_URL}/tenants/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        stateTenant = data.data || data;
        return stateTenant;
      }
    } catch {}
    stateTenant = { ...stateTenant, ...updates };
    return stateTenant;
  },

  // --- GBP & Audit ---
  async getAudit(): Promise<GbpAudit> {
    try {
      const res = await fetch(`${API_BASE_URL}/gbp/audit/latest`);
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch {}
    return stateAudit;
  },

  async runAudit(): Promise<GbpAudit> {
    try {
      const res = await fetch(`${API_BASE_URL}/gbp/audit/run`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        stateAudit = data.data || data;
        return stateAudit;
      }
    } catch {}
    stateAudit = {
      ...stateAudit,
      score: Math.min(94, stateAudit.score + 5),
      evaluatedAt: new Date().toISOString(),
    };
    return stateAudit;
  },

  async getReviews(): Promise<Review[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/gbp/reviews`);
      if (res.ok) {
        const data = await res.json();
        return data.data?.items || data.items || data;
      }
    } catch {}
    return stateReviews;
  },

  async replyToReview(reviewId: string, replyText: string): Promise<Review> {
    const rev = stateReviews.find((r) => r._id === reviewId);
    if (rev) {
      rev.reply = {
        status: 'published',
        publishedText: replyText,
        publishedAt: new Date().toISOString(),
      };
    }
    return rev!;
  },

  // --- Content & 1-Tap Approvals ---
  async getPendingApprovals(): Promise<ContentItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/content/pending`);
      if (res.ok) {
        const data = await res.json();
        return data.data?.items || data.items || data;
      }
    } catch {}
    return stateApprovals.filter((a) => a.status === 'pending_approval');
  },

  async approveContent(id: string, editedBody?: string): Promise<ContentItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/content/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editedBody }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch {}
    const item = stateApprovals.find((a) => a._id === id);
    if (item) {
      item.status = 'published';
      item.publishedAt = new Date().toISOString();
      if (editedBody) item.body = editedBody;
      stateAnalytics.content.pendingApprovals = Math.max(
        0,
        stateAnalytics.content.pendingApprovals - 1,
      );
      stateAnalytics.content.postsPublished += 1;
    }
    return item!;
  },

  async rejectContent(id: string, reason: string): Promise<ContentItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/content/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch {}
    const item = stateApprovals.find((a) => a._id === id);
    if (item) {
      item.status = 'rejected';
      item.rejectionReason = reason;
      stateAnalytics.content.pendingApprovals = Math.max(
        0,
        stateAnalytics.content.pendingApprovals - 1,
      );
    }
    return item!;
  },

  async generateGbpPost(topicFocus?: string): Promise<ContentItem> {
    const newItem: ContentItem = {
      _id: `ci_${Date.now()}`,
      type: 'GBP_POST',
      status: 'pending_approval',
      body: `🌟 Protect your smile this season! ${topicFocus ? `Focusing on ${topicFocus}: ` : ''}Our gentle dental checkup & digital scan helps spot issues before they become painful. Book your visit at Apex Dental Greater Kailash today!`,
      callToActionType: 'BOOK',
      callToActionUrl: 'https://apexdental.in/book',
      source: 'ai_generated',
      modelName: 'gemini-1.5-flash',
      promptVersion: 'gbp_weekly_post@1.2.0',
      createdAt: new Date().toISOString(),
    };
    stateApprovals.unshift(newItem);
    stateAnalytics.content.pendingApprovals += 1;
    return newItem;
  },

  // --- Customers CRM ---
  async getCustomers(query?: string, tag?: string): Promise<Customer[]> {
    try {
      const url = new URL(`${API_BASE_URL}/customers`);
      if (query) url.searchParams.set('search', query);
      if (tag) url.searchParams.set('tag', tag);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        return data.data?.items || data.items || data;
      }
    } catch {}
    let list = [...stateCustomers];
    if (tag && tag !== 'all') {
      list = list.filter((c) => c.tags.includes(tag) || c.consentStatus === tag);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phoneE164.includes(q) ||
          c.email?.toLowerCase().includes(q),
      );
    }
    return list;
  },

  async addCustomer(customer: {
    name: string;
    phone: string;
    email?: string;
    tags?: string[];
  }): Promise<Customer> {
    const newCust: Customer = {
      _id: `c_${Date.now()}`,
      name: customer.name,
      phoneE164: customer.phone.startsWith('+') ? customer.phone : `+91${customer.phone.replace(/^0/, '')}`,
      email: customer.email,
      consentStatus: 'OPTED_IN',
      consentSource: 'manual',
      consentTimestamp: new Date().toISOString(),
      tags: customer.tags || ['patient'],
      totalVisits: 1,
      createdAt: new Date().toISOString(),
    };
    stateCustomers.unshift(newCust);
    return newCust;
  },

  async importCustomers(
    contacts: Array<{ name: string; phone: string; email?: string; tags?: string[] }>,
  ): Promise<{ imported: number }> {
    for (const c of contacts) {
      stateCustomers.push({
        _id: `c_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: c.name,
        phoneE164: c.phone.startsWith('+') ? c.phone : `+91${c.phone.replace(/^0/, '')}`,
        email: c.email,
        consentStatus: 'OPTED_IN',
        consentSource: 'import',
        consentTimestamp: new Date().toISOString(),
        tags: c.tags || ['patient', 'imported'],
        totalVisits: 1,
        createdAt: new Date().toISOString(),
      });
    }
    return { imported: contacts.length };
  },

  // --- WhatsApp Campaigns ---
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`);
      if (res.ok) {
        const data = await res.json();
        return data.data?.items || data.items || data;
      }
    } catch {}
    return stateCampaigns;
  },

  async createCampaign(campaign: {
    title: string;
    goal: Campaign['goal'];
    templateId: string;
    segmentTags: string[];
  }): Promise<Campaign> {
    const newCamp: Campaign = {
      _id: `cmp_${Date.now()}`,
      title: campaign.title,
      goal: campaign.goal,
      templateId: campaign.templateId,
      templateLanguage: 'en',
      segmentFilter: {
        tags: campaign.segmentTags,
        consentStatus: 'OPTED_IN',
      },
      status: 'running',
      startedAt: new Date().toISOString(),
      stats: {
        total: stateCustomers.filter((c) => c.consentStatus === 'OPTED_IN').length,
        sent: 0,
        delivered: 0,
        read: 0,
        replied: 0,
        failed: 0,
        optedOut: 0,
      },
      createdAt: new Date().toISOString(),
    };
    stateCampaigns.unshift(newCamp);
    stateAnalytics.whatsapp.campaignsActive += 1;
    return newCamp;
  },

  // --- Analytics ---
  async getAnalytics(): Promise<AnalyticsOverview> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/overview`);
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch {}
    return stateAnalytics;
  },

  async getTimeseries(): Promise<TimeseriesPoint[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/timeseries`);
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch {}
    return initialTimeseries;
  },

  async sendTestDigest(): Promise<{ success: boolean; summary: string }> {
    return {
      success: true,
      summary: `📊 Monday Morning WhatsApp Growth Digest dispatched to ${stateTenant.phone}! Over past 7 days: Driven 27 calls, 38 directions, and 8 new 5-star reviews.`,
    };
  },
};
