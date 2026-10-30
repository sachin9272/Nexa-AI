export type DateRange = '7d' | '30d' | '90d' | 'ytd';

export interface KeywordMetric {
  id: string;
  keyword: string;
  rank: number;
  previousRank: number;
  rankChange: number;
  searchVolume: string;
  category: string;
}

export interface VisibilityGridCell {
  id: string;
  zone: string;
  rank: number;
  status: 'top1' | 'top3' | 'top5';
}

export interface AnalyticsSummary {
  callsOriginal: number;
  callsCurrent: number;
  growthPercent: number;
  attributedRevenue: string;
  bookedConsults: number;
  avgRating: number;
  totalReviews: number;
  reviewsClimbedMonthly: number;
}
