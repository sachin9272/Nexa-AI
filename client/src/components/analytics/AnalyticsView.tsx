'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  PhoneCall,
  Navigation,
  MessageSquare,
  DollarSign,
  Cpu,
  Send,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { AnalyticsOverview, TimeseriesPoint } from '../../lib/types';

interface AnalyticsViewProps {
  analytics: AnalyticsOverview | null;
  timeseries: TimeseriesPoint[];
  clinicPhone: string;
  onSendTestDigest: () => Promise<{ summary: string }>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  timeseries,
  clinicPhone,
  onSendTestDigest,
}) => {
  const [digestNotification, setDigestNotification] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleTestDigest = async () => {
    setIsSending(true);
    const res = await onSendTestDigest();
    setDigestNotification(res.summary);
    setIsSending(false);
    setTimeout(() => setDigestNotification(null), 8000);
  };

  const maxVal = Math.max(...timeseries.map((t) => Math.max(t.calls, t.directions, t.whatsappSent / 3)), 30);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Alert */}
      {digestNotification && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
          }}
        >
          <CheckCircle2 size={20} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{digestNotification}</span>
        </div>
      )}

      {/* Top Header */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Outcome Analytics & Cost Ledger</h2>
            <span className="badge badge-emerald">Outcome-First Reporting</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real patient acquisitions, Maps direction intent, and transparent per-tenant LLM token ledger.
          </p>
        </div>

        <button
          onClick={handleTestDigest}
          disabled={isSending}
          className="btn btn-primary"
        >
          <Send size={15} />
          <span>{isSending ? 'Sending Digest...' : 'Dispatch Monday WhatsApp Digest'}</span>
        </button>
      </div>

      {/* Unit Economics Ledger Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '20px',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(13, 21, 39, 0.8) 100%)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Cpu size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LLM Tokens Billed</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {analytics?.unitEconomics.llmTokens.toLocaleString() ?? '148,200'}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Cost: ${analytics?.unitEconomics.llmCostUsd ?? 0.18}
          </span>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <MessageSquare size={16} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Meta Cloud API Fees</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            ${analytics?.unitEconomics.whatsappCostUsd ?? 2.68}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {analytics?.whatsapp.messagesSent ?? 537} templates delivered
          </span>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <DollarSign size={16} color="var(--accent-amber)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Platform Cost</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
            ${((analytics?.unitEconomics.llmCostUsd ?? 0.18) + (analytics?.unitEconomics.whatsappCostUsd ?? 2.68)).toFixed(2)}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Included in Growth Plan
          </span>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <TrendingUp size={16} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attributed Patient Revenue</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            ${analytics?.unitEconomics.estimatedRevenueAttributedUsd.toLocaleString() ?? '11,620'}
          </p>
          <span className="badge badge-emerald" style={{ fontSize: '0.6875rem' }}>
            ~4,062x Return on AI Cost
          </span>
        </div>
      </div>

      {/* Daily Performance Timeseries Chart */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Daily Inbound Intent Trajectory</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Tracking calls, directions, and WhatsApp message responses over the past 14 days.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-cyan)' }} />
              <span>Inbound Phone Calls</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-blue)' }} />
              <span>Maps Directions</span>
            </div>
          </div>
        </div>

        {/* CSS Chart Columns */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: '220px',
            paddingTop: '20px',
            borderBottom: '1px solid var(--border-subtle)',
            gap: '12px',
          }}
        >
          {timeseries.map((pt) => {
            const callHeight = (pt.calls / maxVal) * 180;
            const dirHeight = (pt.directions / maxVal) * 180;

            return (
              <div
                key={pt.date}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  gap: '6px',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '180px' }}>
                  {/* Calls Bar */}
                  <div
                    title={`${pt.calls} calls`}
                    style={{
                      width: '18px',
                      height: `${callHeight}px`,
                      borderRadius: '4px 4px 0 0',
                      background: 'linear-gradient(180deg, #06b6d4 0%, rgba(6, 182, 212, 0.4) 100%)',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  {/* Directions Bar */}
                  <div
                    title={`${pt.directions} directions`}
                    style={{
                      width: '18px',
                      height: `${dirHeight}px`,
                      borderRadius: '4px 4px 0 0',
                      background: 'linear-gradient(180deg, #3b82f6 0%, rgba(59, 130, 246, 0.4) 100%)',
                      transition: 'height 0.4s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{pt.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monday Morning WhatsApp Digest Simulator */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px' }}>
          Monday Morning WhatsApp Digest Preview
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Every Monday at 9:00 AM, the business owner receives this concise performance report directly on WhatsApp:
        </p>

        {/* WhatsApp Chat Bubble Mockup */}
        <div
          style={{
            maxWidth: '460px',
            padding: '16px 20px',
            borderRadius: '16px 16px 16px 4px',
            background: '#075e54',
            color: '#ffffff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Nexa Marketing Co-Pilot</span>
            <span style={{ fontSize: '0.6875rem', opacity: 0.8 }}>9:00 AM</span>
          </div>

          <p style={{ fontSize: '0.875rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
            📊 *Your Weekly Business Growth Report*{'\n\n'}
            Good morning Dr. Rohan! Here is how Nexa grew Apex Dental & Aesthetic Clinic over the past 7 days:{'\n\n'}
            📞 *Inbound Phone Calls*: 27 (+18%){'\n'}
            🗺️ *Google Maps Driving Directions*: 38{'\n'}
            ⭐ *New 5-Star Reviews Managed*: 3{'\n'}
            💬 *Patient WhatsApp Win-Backs*: 8 booked{'\n\n'}
            Estimated revenue generated: *$3,240*{'\n'}
            Pending items for your review: 3 posts ready.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', opacity: 0.7, fontSize: '0.6875rem' }}>
            Delivered to {clinicPhone} ✓✓
          </div>
        </div>
      </div>
    </div>
  );
};
