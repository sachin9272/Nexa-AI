export type CampaignStatus = 'ready' | 'active' | 'scheduled' | 'completed';

export interface CampaignItem {
  id: string;
  title: string;
  offerText: string;
  tag: string;
  scheduledTime: string;
  targetAudience: string;
  audienceCount: number;
  status: CampaignStatus;
  statusLabel: string;
  predictedBookings: string;
  revenueGenerated?: string;
  openRate?: string;
  imageUri?: string;
}

export interface CampaignSummary {
  totalRevenue: string;
  roiMultiple: string;
  audiencePool: string;
  openRate: string;
  conversionRate: string;
}
