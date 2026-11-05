'use client';

import React from 'react';
import {
  Sparkles,
  Building2,
  CheckCircle2,
  Bell,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Tenant } from '../../lib/types';

interface HeaderProps {
  tenant: Tenant | null;
  pendingApprovalsCount: number;
  onOpenApprovals: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tenant,
  pendingApprovalsCount,
  onOpenApprovals,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 28px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Brand & Clinic Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>
                Nexa<span style={{ color: 'var(--accent-cyan)' }}>AI</span>
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--accent-cyan-light)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Co-Pilot
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Autonomous Growth Engine
            </p>
          </div>
        </div>

        <div
          style={{
            height: '24px',
            width: '1px',
            backgroundColor: 'var(--border-subtle)',
          }}
        />

        {/* Clinic pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Building2 size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {tenant?.name || 'Loading Clinic...'}
          </span>
          <span className="badge badge-emerald" style={{ fontSize: '0.6875rem', padding: '2px 6px' }}>
            {tenant?.city || 'Delhi'}
          </span>
        </div>
      </div>

      {/* Center: Live Integrations Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          <div className="pulse-dot" />
          <span>GBP Sync: Live</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={14} color="var(--accent-cyan)" />
          <span>WhatsApp Cloud API: Connected</span>
        </div>
      </div>

      {/* Right: Approvals trigger & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {pendingApprovalsCount > 0 && (
          <button
            onClick={onOpenApprovals}
            className="btn btn-primary"
            style={{ fontSize: '0.8125rem', padding: '7px 14px' }}
          >
            <Sparkles size={15} />
            <span>{pendingApprovalsCount} Approvals Pending</span>
          </button>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 8px 4px 4px',
            borderRadius: '9999px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            DR
          </div>
          <div style={{ textAlign: 'left', paddingRight: '6px' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.1 }}>Dr. Rohan Mehra</p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Clinic Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
};
