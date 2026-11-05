'use client';

import React from 'react';
import {
  PhoneCall,
  Navigation,
  DollarSign,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Shield,
} from 'lucide-react';
import { AnalyticsOverview, GbpAudit, ContentItem } from '../../lib/types';

interface OverviewViewProps {
  analytics: AnalyticsOverview | null;
  audit: GbpAudit | null;
  pendingApprovals: ContentItem[];
  onNavigateTab: (tab: any) => void;
  onQuickApprove: (id: string) => void;
  onGeneratePost: () => void;
  onSendDigest: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  analytics,
  audit,
  pendingApprovals,
  onNavigateTab,
  onQuickApprove,
  onGeneratePost,
  onSendDigest,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner: Outcome Summary */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(13, 21, 39, 0.8) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-cyan">Automated Growth Engine</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Past 30 Days Results</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
              Your Practice Grew by <span style={{ color: 'var(--accent-cyan)' }}>+{analytics?.outcomes.callsReceived ?? 148} Inbound Patient Calls</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '640px' }}>
              Nexa autonomous agents kept your Google Business Profile top-ranked and reactivated dormant patients via targeted WhatsApp broadcasts.
            </p>
          </div>

          <button
            onClick={onSendDigest}
            className="btn btn-secondary"
            style={{ fontSize: '0.8125rem' }}
          >
            <Send size={15} color="var(--accent-cyan)" />
            <span>Send Monday WhatsApp Digest</span>
          </button>
        </div>

        {/* 4 Metric Counters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '24px',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Phone Calls Driven</span>
              <PhoneCall size={16} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {analytics?.outcomes.callsReceived ?? 148}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              ↑ +28% vs last month
            </span>
          </div>

          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Maps Direction Requests</span>
              <Navigation size={16} color="var(--accent-blue)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {analytics?.outcomes.directionRequests ?? 214}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              ↑ +34% foot-traffic intent
            </span>
          </div>

          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>WhatsApp Read Rate</span>
              <MessageSquare size={16} color="var(--accent-emerald)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {analytics?.whatsapp.readRatePercentage ?? 86}%
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {analytics?.whatsapp.messagesSent ?? 537} messages sent
            </span>
          </div>

          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Estimated Revenue Attributed</span>
              <DollarSign size={16} color="var(--accent-amber)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              ${analytics?.unitEconomics.estimatedRevenueAttributedUsd.toLocaleString() ?? '11,620'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Based on completed visits
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <button onClick={onGeneratePost} className="btn btn-primary">
          <Sparkles size={16} />
          <span>Generate AI GBP Post</span>
        </button>

        <button onClick={() => onNavigateTab('campaigns')} className="btn btn-secondary">
          <MessageSquare size={16} />
          <span>New WhatsApp Campaign</span>
        </button>

        <button onClick={() => onNavigateTab('gbp')} className="btn btn-secondary">
          <Navigation size={16} />
          <span>Run Profile Audit (Score: {audit?.score ?? 78}/100)</span>
        </button>

        <button onClick={() => onNavigateTab('customers')} className="btn btn-secondary">
          <span>Import Patient CSV</span>
        </button>
      </div>

      {/* Main Grid: Pending Approvals & GBP Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        {/* Left Column: 1-Tap Mobile Approval Queue */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={18} color="var(--accent-cyan)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>1-Tap Approval Queue</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Review and publish AI co-pilot suggestions to Google with 1 tap
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('approvals')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-cyan)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
              }}
            >
              <span>View All ({pendingApprovals.length})</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {pendingApprovals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <CheckCircle size={36} color="var(--accent-emerald)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                All Caught Up!
              </p>
              <p style={{ fontSize: '0.8125rem' }}>No pending items require owner review at this moment.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingApprovals.slice(0, 2).map((item) => (
                <div
                  key={item._id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.6875rem' }}>
                        {item.type === 'GBP_POST' ? 'Google Post' : 'Review Reply'}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        Powered by {item.modelName}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      Requires Approval
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      color: 'var(--text-primary)',
                      marginBottom: '14px',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {item.body}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      onClick={() => onQuickApprove(item._id)}
                      className="btn btn-success"
                      style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
                    >
                      <CheckCircle size={14} />
                      <span>Approve & Publish</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Google Profile Health Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>GBP Health Score</h3>
            <span
              className={`badge ${audit && audit.score >= 80 ? 'badge-emerald' : 'badge-amber'}`}
              style={{ fontSize: '0.875rem', padding: '4px 10px' }}
            >
              {audit?.score ?? 78}/100
            </span>
          </div>

          <div
            style={{
              height: '8px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: `${audit?.score ?? 78}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                borderRadius: '9999px',
              }}
            />
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Top Actionable Fixes for Maximum Google Maps Ranking:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {audit?.recommendations.slice(0, 3).map((rec, idx) => (
              <div
                key={rec.key}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <AlertCircle size={16} color="var(--accent-amber)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{rec.title}</span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                      +{rec.estimatedCallsLiftPercentage}% Calls
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {rec.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('gbp')}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '18px', fontSize: '0.8125rem' }}
          >
            <span>Open Complete GBP Optimizer</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
