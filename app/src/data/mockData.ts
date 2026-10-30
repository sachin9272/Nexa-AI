import { Agent, LiveStreamItem } from '@/types/agent.types';
import { ConversationItem } from '@/types/conversation.types';
import { CampaignItem, CampaignSummary } from '@/types/campaign.types';
import { AnalyticsSummary, KeywordMetric } from '@/types/analytics.types';
import { Theme } from '@/constants/theme';

export const mockClinicProfile = {
  name: 'AUM Wellness Clinic',
  doctorName: 'Dr. Priya',
  agentCount: 3,
  status: 'AI Agents Active',
  avatarUri: 'https://images.unsplash.com/photo-1594824813511-3d75c87a0228?w=150&auto=format&fit=crop&q=80',
};

export const mockRoiHeroData = {
  totalValue: '₹142,500',
  growthPercent: '+28%',
  timeframe: 'This Month',
  callsCount: 355,
  callsGrowth: '+294%',
  callsSubtext: 'From Page 3 → Rank #1',
  waBookings: 84,
  waStatus: 'Confirmed',
  waSubtext: 'Zero drop-offs today',
};

export const mockQuickActions = [
  { id: 'gbp', title: 'Run GBP Booster', icon: 'search', color: Theme.colors.secondaryGrowth },
  { id: 'growth', title: 'Ask Growth Agent', icon: 'sparkles', color: Theme.colors.aiPurple },
  { id: 'post', title: 'Generate Post', icon: 'create-outline', color: Theme.colors.whatsappGreen },
  { id: 'offers', title: 'Sync Calendar', icon: 'calendar', color: Theme.colors.tertiary },
];

export const mockAgents: Agent[] = [
  {
    id: 'agent_gbp',
    title: 'Business Profile (GBP) AI',
    subtitle: 'Google Visibility & SEO Engine',
    icon: 'business',
    iconColor: Theme.colors.primaryContainer,
    status: 'autopilot',
    statusLabel: 'Autopilot',
    metricCallout: {
      highlight: 'Rank #1 for "wellness clinic near me"',
      subtext: '+14 positions climbed this month',
      climbBadge: '#1',
      icon: 'checkmark-circle',
    },
    logs: [
      {
        icon: 'time-outline',
        text: 'Auto-posted SEO update ',
        boldText: '“5 Skin Hydration Tips” 2h ago.',
      },
      {
        icon: 'star',
        text: 'Replied to 4 Google reviews autonomously ',
        boldText: '(avg 5.0★ rating).',
      },
    ],
    previewCard: {
      title: '“Hydration fuels cellular repair...”',
      subtext: 'Google Post • 89 views • 6 calls triggered',
      imageUri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&auto=format&fit=crop&q=80',
    },
    buttons: [
      { label: 'Review Post', variant: 'secondary', icon: 'eye-outline' },
      { label: 'Boost Ranking', variant: 'primary', icon: 'rocket-outline' },
    ],
  },
  {
    id: 'agent_wa_chat',
    title: 'WhatsApp Chat AI',
    subtitle: 'Instant Booking & Lead Conversion',
    icon: 'chatbubbles',
    iconColor: Theme.colors.whatsappGreen,
    status: 'active',
    statusLabel: '18 Active Chats',
    bookingMetrics: {
      todayBookings: '12 Consults',
      fillRate: '100% Slot fill rate',
      dropOff: '0 Leads Lost',
      subNote: 'Auto follow-up enabled',
    },
    logs: [
      {
        icon: 'checkmark-done',
        text: 'Aarav K. (+91 98402 1****) confirmed booking for ',
        boldText: 'Ayurvedic Consultation on Sat, 11:30 AM.',
      },
    ],
    buttons: [
      { label: 'Chats (3 Unread)', variant: 'whatsapp', icon: 'chatbox-ellipses' },
      { label: 'Pause Agent', variant: 'secondary', icon: 'pause-circle-outline' },
    ],
  },
  {
    id: 'agent_wa_marketing',
    title: 'WhatsApp Marketing AI',
    subtitle: 'Lifecycle Re-engagement & Offers',
    icon: 'megaphone',
    iconColor: Theme.colors.aiPurple,
    status: 'scheduled',
    statusLabel: 'Scheduled',
    logs: [
      {
        icon: 'pricetag-outline',
        text: 'Targeting 420 past clients inactive for 45+ days. ',
        boldText: '“Weekend Wellness 20% Off”',
      },
    ],
    previewCard: {
      title: 'Offer: 20% off Panchakarma session',
      subtext: 'Predicted Response: ~18-22 bookings',
      imageUri: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200&auto=format&fit=crop&q=80',
    },
    revenueAttribution: '₹38,200 generated',
    buttons: [
      { label: 'Review Draft', variant: 'secondary', icon: 'document-text-outline' },
      { label: 'New Campaign', variant: 'purple', icon: 'add-circle-outline' },
    ],
  },
];

export const mockLiveStream: LiveStreamItem[] = [
  {
    id: 'live_1',
    title: 'Appointment Locked',
    timeAgo: '4m ago',
    description: 'WhatsApp Chat Agent matched Sat 11:30 AM slot with Dr. Priya for Aarav K. Calendar updated.',
    type: 'appointment',
    icon: 'calendar',
    iconBg: Theme.colors.whatsappGreenLight,
    iconColor: Theme.colors.whatsappGreen,
  },
  {
    id: 'live_2',
    title: '5★ Google Review Replied',
    timeAgo: '32m ago',
    description: 'GBP Agent replied to Meera Sen: “Thank you Meera! We are thrilled our therapy brought lasting relief.”',
    type: 'review',
    icon: 'star',
    iconBg: Theme.colors.surfaceContainer,
    iconColor: Theme.colors.primaryContainer,
  },
  {
    id: 'live_3',
    title: 'Follow-up Dispatched',
    timeAgo: '1h ago',
    description: 'Re-engaged 14 patients who enquired about acupuncture last week. 3 responses received so far.',
    type: 'followup',
    icon: 'send',
    iconBg: Theme.colors.aiPurpleLight,
    iconColor: Theme.colors.aiPurple,
  },
  {
    id: 'live_4',
    title: 'Keyword Position #1 Secured',
    timeAgo: '2h ago',
    description: 'GBP Agent verified Rank #1 for “wellness clinic near me” across 8 nearby geocodes.',
    type: 'ranking',
    icon: 'trending-up',
    iconBg: Theme.colors.warningAmberLight,
    iconColor: Theme.colors.warningAmber,
  },
];

export const mockConversations: ConversationItem[] = [
  {
    id: 'conv_urgent',
    patientName: 'Mrs. Ananya Sen',
    phone: '+91 98201 44210',
    avatarText: 'AS',
    status: 'attention',
    statusLabel: 'Action Required',
    treatment: 'PRP Anti-Aging Package',
    lastMessage: 'Requested specialized PRP Anti-Aging Package with custom protocol pricing. AI paused to prevent unauthorized discount.',
    timestamp: '2m ago',
    urgentReason: 'Custom medical protocol pricing requested. AI waiting for doctor approval.',
  },
  {
    id: 'conv_1',
    patientName: 'Aarav Kapoor',
    phone: '+91 98402 18492',
    avatarText: 'AK',
    status: 'booked',
    statusLabel: 'Confirmed',
    treatment: 'Ayurvedic Consultation',
    timeSlot: 'Saturday, 11:30 AM',
    lastMessage: 'Perfect, I will bring my previous test reports. See you on Saturday!',
    timestamp: '14m ago',
  },
  {
    id: 'conv_2',
    patientName: 'Dr. Sameer Malhotra',
    phone: '+91 97110 59281',
    avatarText: 'SM',
    status: 'ai_active',
    statusLabel: 'AI Replying',
    treatment: 'Holistic Spine Assessment',
    lastMessage: 'AI: Dr. Priya holds specialized certifications in spinal alignment. Would morning or evening suit you better?',
    timestamp: '28m ago',
  },
  {
    id: 'conv_3',
    patientName: 'Vikram Rao',
    phone: '+91 98840 31209',
    avatarText: 'VR',
    status: 'booked',
    statusLabel: 'Rescheduled',
    treatment: 'Panchakarma Detox Session 2',
    timeSlot: 'Sunday, 4:00 PM',
    lastMessage: 'Your session has been shifted to Sunday 4:00 PM. Reminder sent to WhatsApp.',
    timestamp: '1h ago',
  },
  {
    id: 'conv_4',
    patientName: 'Priya Nair',
    phone: '+91 98214 77312',
    avatarText: 'PN',
    status: 'inquiry',
    statusLabel: 'New Inquiry',
    treatment: 'Herbal Steam & Detox Package',
    lastMessage: 'Hi, does the clinic provide certified diet charts alongside the steam sessions?',
    timestamp: '2h ago',
    unreadCount: 1,
  },
];

export const mockCampaignSummary: CampaignSummary = {
  totalRevenue: '₹900K+',
  roiMultiple: '14.2x ROI in 6 mos',
  audiencePool: '2,450',
  openRate: '88.4%',
  conversionRate: '32.0%',
};

export const mockCampaigns: CampaignItem[] = [
  {
    id: 'camp_1',
    title: 'Weekend Wellness 20% Off',
    offerText: 'Offer: 20% off Panchakarma session',
    tag: 'Re-engagement',
    scheduledTime: 'Tomorrow, 10:00 AM',
    targetAudience: '420 past clients inactive for 45+ days',
    audienceCount: 420,
    status: 'ready',
    statusLabel: 'Ready for Approval',
    predictedBookings: '18-22 bookings (~₹65,000 value)',
    imageUri: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'camp_2',
    title: 'Diwali Glow Ayurvedic Facial Blast',
    offerText: 'Festive Package: Kumkumadi Radiance Therapy',
    tag: 'Seasonal Festival',
    scheduledTime: 'Fri Nov 3, 11:30 AM',
    targetAudience: '850 female patients with prior aesthetic treatments',
    audienceCount: 850,
    status: 'scheduled',
    statusLabel: 'Scheduled',
    predictedBookings: '35-45 bookings (~₹120,000 value)',
    imageUri: 'https://images.unsplash.com/photo-1512290900672-1f5be4cb0e7b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'camp_3',
    title: 'Monsoon Detox & Immunity Booster',
    offerText: 'Ayurvedic Kadha + Abhyanga 3-Session Course',
    tag: 'Completed',
    scheduledTime: 'Dispatched Sep 15',
    targetAudience: '1,200 verified local contacts',
    audienceCount: 1200,
    status: 'completed',
    statusLabel: 'Completed',
    predictedBookings: '52 Bookings Actualized',
    revenueGenerated: '₹184,000',
    openRate: '91.2%',
  },
];

export const mockAnalyticsSummary: AnalyticsSummary = {
  callsOriginal: 90,
  callsCurrent: 355,
  growthPercent: 294,
  attributedRevenue: '₹142,500',
  bookedConsults: 48,
  avgRating: 4.9,
  totalReviews: 248,
  reviewsClimbedMonthly: 36,
};

export const mockKeywords: KeywordMetric[] = [
  {
    id: 'kw_1',
    keyword: 'wellness clinic near me',
    rank: 1,
    previousRank: 15,
    rankChange: 14,
    searchVolume: '2,400/mo',
    category: 'High Intent Local',
  },
  {
    id: 'kw_2',
    keyword: 'ayurvedic doctor in south delhi',
    rank: 1,
    previousRank: 8,
    rankChange: 7,
    searchVolume: '1,800/mo',
    category: 'Speciality Doctor',
  },
  {
    id: 'kw_3',
    keyword: 'best panchakarma center',
    rank: 2,
    previousRank: 11,
    rankChange: 9,
    searchVolume: '3,100/mo',
    category: 'Therapy & Treatments',
  },
  {
    id: 'kw_4',
    keyword: 'natural holistic skin clinic',
    rank: 2,
    previousRank: 18,
    rankChange: 16,
    searchVolume: '950/mo',
    category: 'Aesthetics',
  },
];
