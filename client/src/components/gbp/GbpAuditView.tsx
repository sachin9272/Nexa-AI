'use client';

import React, { useState } from 'react';
import {
  MapPin,
  RefreshCw,
  Star,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Image as ImageIcon,
  Clock,
  Phone,
} from 'lucide-react';
import { GbpAudit, Review } from '../../lib/types';

interface GbpAuditViewProps {
  audit: GbpAudit | null;
  reviews: Review[];
  onRunAudit: () => void;
  onReplyReview: (reviewId: string, replyText: string) => void;
}

export const GbpAuditView: React.FC<GbpAuditViewProps> = ({
  audit,
  reviews,
  onRunAudit,
  onReplyReview,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'AUDIT' | 'REVIEWS'>('AUDIT');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    await onRunAudit();
    setIsAuditing(false);
  };

  const handleOpenReply = (review: Review) => {
    setSelectedReviewId(review._id);
    setReplyText(
      `Dear ${review.authorName}, thank you for your feedback! Ensuring a high standard of patient care is our utmost priority at Apex Dental. We look forward to seeing you again.`,
    );
  };

  const handleSubmitReply = (reviewId: string) => {
    onReplyReview(reviewId, replyText);
    setSelectedReviewId(null);
    setReplyText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Sub-tab Switcher */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Google Business Profile Optimizer</h2>
            <span className="badge badge-emerald">Connected (Greater Kailash 1)</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Evaluates Google Maps ranking factors, response rates, and customer sentiment algorithms.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setActiveSubTab('AUDIT')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeSubTab === 'AUDIT' ? 'var(--accent-cyan)' : 'transparent',
                color: activeSubTab === 'AUDIT' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              Algorithmic Audit
            </button>
            <button
              onClick={() => setActiveSubTab('REVIEWS')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeSubTab === 'REVIEWS' ? 'var(--accent-cyan)' : 'transparent',
                color: activeSubTab === 'REVIEWS' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              Reviews Manager ({reviews.length})
            </button>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="btn btn-primary"
            style={{ fontSize: '0.8125rem' }}
          >
            <RefreshCw size={15} className={isAuditing ? 'pulse-dot' : ''} />
            <span>{isAuditing ? 'Auditing...' : 'Re-Run Live Audit'}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'AUDIT' ? (
        <>
          {/* Audit Score & Attributes Checklist */}
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
            {/* Score Wheel Card */}
            <div
              className="glass-panel"
              style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  background: 'conic-gradient(#10b981 0% 78%, rgba(255, 255, 255, 0.08) 78% 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 0 28px rgba(16, 185, 129, 0.25)',
                }}
              >
                <div
                  style={{
                    width: '108px',
                    height: '108px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '2.25rem', fontWeight: 900, lineHeight: 1 }}>
                    {audit?.score ?? 78}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    out of 100
                  </span>
                </div>
              </div>

              <span
                className={`badge ${audit && audit.score >= 80 ? 'badge-emerald' : 'badge-amber'}`}
                style={{ fontSize: '0.8125rem', marginBottom: '8px' }}
              >
                Health Status: {audit?.healthStatus ?? 'GOOD'}
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Evaluated: {new Date(audit?.evaluatedAt || Date.now()).toLocaleDateString()}
              </p>
            </div>

            {/* Profile Attributes Grid */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                Google Maps Ranking Attributes Checklist
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <CheckCircle size={16} color="var(--accent-emerald)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Operating Hours</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configured Mon-Sat</p>
                </div>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <CheckCircle size={16} color="var(--accent-emerald)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Phone (E.164)</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+91 98110 44291 Verified</p>
                </div>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <ImageIcon size={16} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Photo Gallery</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {audit?.photoCount ?? 18} Photos Active
                  </p>
                </div>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <MessageCircle size={16} color="var(--accent-violet)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Review Response</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {audit?.reviewResponseRate ?? 84}% within 48h
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations List */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px' }}>
              Actionable Fixes (Rank & Calls Boosters)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Algorithmic recommendations to surpass competing clinics in local 3-pack Map rankings.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {audit?.recommendations.map((rec) => (
                <div
                  key={rec.key}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span
                      className={`badge ${
                        rec.impact === 'CRITICAL'
                          ? 'badge-rose'
                          : rec.impact === 'HIGH'
                          ? 'badge-amber'
                          : 'badge-cyan'
                      }`}
                      style={{ marginTop: '2px' }}
                    >
                      {rec.impact}
                    </span>

                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '4px' }}>
                        {rec.title}
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {rec.recommendation}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Current status: {rec.currentValue}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                      +{rec.estimatedCallsLiftPercentage}% Calls Lift
                    </span>

                    {rec.autoFixAvailable && (
                      <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                        <Sparkles size={14} />
                        <span>Auto-Fix</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Reviews Sub-tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="glass-panel"
              style={{
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: 'var(--accent-cyan)',
                    }}
                  >
                    {rev.authorName.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{rev.authorName}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ display: 'flex' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            color={i < rev.rating ? '#f59e0b' : '#334155'}
                            fill={i < rev.rating ? '#f59e0b' : 'none'}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(rev.reviewTimestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`badge ${
                    rev.sentiment === 'positive'
                      ? 'badge-emerald'
                      : rev.sentiment === 'mixed'
                      ? 'badge-amber'
                      : 'badge-rose'
                  }`}
                >
                  {rev.sentiment.toUpperCase()}
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                {rev.comment}
              </p>

              {/* Existing Reply or Reply Box */}
              {rev.reply?.status === 'published' ? (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <CheckCircle size={14} color="var(--accent-emerald)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                      Published Google Reply
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {rev.reply.publishedText}
                  </p>
                </div>
              ) : selectedReviewId === rev._id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--accent-cyan)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedReviewId(null)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmitReply(rev._id)}
                      className="btn btn-success"
                      style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                    >
                      Publish Reply to Google
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleOpenReply(rev)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                  >
                    <Sparkles size={14} color="var(--accent-cyan)" />
                    <span>Generate AI Reply</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
