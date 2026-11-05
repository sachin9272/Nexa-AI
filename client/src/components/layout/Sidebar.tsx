'use client';

import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  MapPin,
  MessageSquare,
  Users,
  TrendingUp,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export type TabType =
  | 'overview'
  | 'approvals'
  | 'gbp'
  | 'campaigns'
  | 'customers'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingApprovalsCount: number;
  auditScore: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingApprovalsCount,
  auditScore,
}) => {
  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'overview',
      label: 'Executive Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'approvals',
      label: '1-Tap Approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'badge-cyan',
    },
    {
      id: 'gbp',
      label: 'Google Profile & Audit',
      icon: MapPin,
      badge: `${auditScore}/100`,
      badgeColor: auditScore >= 80 ? 'badge-emerald' : 'badge-amber',
    },
    {
      id: 'campaigns',
      label: 'WhatsApp Campaigns',
      icon: MessageSquare,
    },
    {
      id: 'customers',
      label: 'Customers & CRM',
      icon: Users,
    },
    {
      id: 'analytics',
      label: 'ROI & Attribution',
      icon: TrendingUp,
    },
    {
      id: 'settings',
      label: 'Clinic & AI Voice',
      icon: Settings,
    },
  ];

  return (
    <aside
      style={{
        width: '260px',
        minHeight: 'calc(100vh - 71px)',
        borderRight: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-secondary)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <p
          style={{
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            paddingLeft: '12px',
            marginBottom: '12px',
          }}
        >
          Growth Channels
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isActive
                    ? '1px solid rgba(6, 182, 212, 0.3)'
                    : '1px solid transparent',
                  background: isActive
                    ? 'rgba(6, 182, 212, 0.12)'
                    : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon
                    size={18}
                    color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`badge ${item.badgeColor || 'badge-cyan'}`}
                    style={{ fontSize: '0.6875rem', padding: '2px 7px' }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Safety & Compliance Badge */}
      <div
        style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.18)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <ShieldCheck size={16} color="var(--accent-emerald)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
            Strict Guardrails Active
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          No unvetted AI post or campaign broadcasts without 1-tap owner approval. Zero hallucinated pricing.
        </p>
      </div>
    </aside>
  );
};
