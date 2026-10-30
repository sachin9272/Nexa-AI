export type ConversationFilter = 'all' | 'ai' | 'attention' | 'booked';

export interface ConversationItem {
  id: string;
  patientName: string;
  phone: string;
  avatarText: string;
  status: 'booked' | 'attention' | 'ai_active' | 'inquiry';
  statusLabel: string;
  treatment: string;
  timeSlot?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  urgentReason?: string;
}
