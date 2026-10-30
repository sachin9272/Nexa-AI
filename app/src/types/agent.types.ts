export type AgentStatus = 'autopilot' | 'active' | 'scheduled' | 'paused';

export interface AgentMetricCallout {
  highlight: string;
  subtext: string;
  climbBadge?: string;
  icon?: string;
}

export interface AgentLogEntry {
  icon: string;
  text: string;
  boldText?: string;
}

export interface AgentPreviewCard {
  title: string;
  subtext: string;
  imageUri: string;
}

export interface AgentButton {
  label: string;
  variant: 'primary' | 'secondary' | 'whatsapp' | 'purple' | 'ghost';
  icon?: string;
}

export interface Agent {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  status: AgentStatus;
  statusLabel: string;
  metricCallout?: AgentMetricCallout;
  logs: AgentLogEntry[];
  previewCard?: AgentPreviewCard;
  bookingMetrics?: {
    todayBookings: string;
    fillRate: string;
    dropOff: string;
    subNote: string;
  };
  revenueAttribution?: string;
  buttons: AgentButton[];
}

export interface LiveStreamItem {
  id: string;
  title: string;
  timeAgo: string;
  description: string;
  type: 'appointment' | 'review' | 'followup' | 'ranking';
  icon: string;
  iconBg: string;
  iconColor: string;
}
