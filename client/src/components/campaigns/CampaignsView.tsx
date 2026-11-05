'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Send,
  Users,
  CheckCircle2,
  Eye,
  CornerDownRight,
  ShieldAlert,
  Play,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Campaign } from '../../lib/types';

interface CampaignsViewProps {
  campaigns: Campaign[];
  onCreateCampaign: (data: {
    title: string;
    goal: Campaign['goal'];
    templateId: string;
    segmentTags: string[];
  }) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  campaigns,
  onCreateCampaign,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState<Campaign['goal']>('win_back');
  const [templateId, setTemplateId] = useState('patient_winback_checkup_v2');
  const [segmentTag, setSegmentTag] = useState('reactivation_target');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateCampaign({
      title: title.trim(),
      goal,
      templateId,
      segmentTags: [segmentTag],
    });
    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>WhatsApp Lifecycle Campaigns</h2>
            <span className="badge badge-cyan">Official Meta Cloud API</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Automated WhatsApp broadcast sequences for patient reactivation, review boosts, and appointment reminders.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Create New Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {campaigns.map((c) => {
          const readRate = c.stats.sent > 0 ? Math.round((c.stats.read / c.stats.sent) * 100) : 0;
          const replyRate = c.stats.sent > 0 ? Math.round((c.stats.replied / c.stats.sent) * 100) : 0;

          return (
            <div
              key={c._id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(255, 255, 255, 0.09)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span
                    className={`badge ${
                      c.status === 'running'
                        ? 'badge-emerald'
                        : c.status === 'scheduled'
                        ? 'badge-cyan'
                        : 'badge-amber'
                    }`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Template: {c.templateId}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px' }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  Goal: {c.goal.replace('_', ' ').toUpperCase()} • Audience Filter: Opted-In Patients
                </p>

                {/* Funnel Delivery Stats */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Dispatched</span>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {c.stats.sent}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Read Rate</span>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      {readRate}%
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Replies (Bookings)</span>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {c.stats.replied}
                    </p>
                  </div>
                </div>

                {/* Read Progress Bar */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Message Engagement</span>
                    <span>{c.stats.read} / {c.stats.sent} Opened</span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${readRate}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: Opt-outs and status */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '14px',
                  marginTop: '12px',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Opt-outs: {c.stats.optedOut} (Honored)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  Active Engine
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '32px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
              Launch WhatsApp Lifecycle Campaign
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Broadcast to segmented opted-in patients using approved Meta Cloud API templates.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Smile Health & Cleaning Checkup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Campaign Goal & Strategy
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                >
                  <option value="win_back">Win-Back Dormant Patients (&gt;6 months)</option>
                  <option value="review_request">Post-Visit 5-Star Review Request</option>
                  <option value="appointment_reminder">Preventive Checkup Reminder</option>
                  <option value="seasonal">Festive Aesthetic Promotion</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Meta WhatsApp Template
                </label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                >
                  <option value="patient_winback_checkup_v2">patient_winback_checkup_v2 (Approved)</option>
                  <option value="review_request_post_appointment">review_request_post_appointment (Approved)</option>
                  <option value="festive_whitening_promo">festive_whitening_promo (Approved)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Target Patient Audience Tag
                </label>
                <select
                  value={segmentTag}
                  onChange={(e) => setSegmentTag(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                >
                  <option value="reactivation_target">Dormant Patients (reactivation_target)</option>
                  <option value="invisalign">Orthodontic Patients (invisalign)</option>
                  <option value="vip">VIP Patients (vip)</option>
                  <option value="patient">All Opted-In Patients</option>
                </select>
              </div>

              {/* Compliance Notice */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={16} color="var(--accent-emerald)" />
                <span>Strict consent filter active: Customers who replied STOP are excluded.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={15} />
                  <span>Launch Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
