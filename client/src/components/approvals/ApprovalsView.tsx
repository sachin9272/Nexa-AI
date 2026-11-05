'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Edit3,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Filter,
  Check,
} from 'lucide-react';
import { ContentItem } from '../../lib/types';

interface ApprovalsViewProps {
  items: ContentItem[];
  onApprove: (id: string, editedBody?: string) => void;
  onReject: (id: string, reason: string) => void;
  onGeneratePost: (topicFocus?: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  items,
  onApprove,
  onReject,
  onGeneratePost,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'GBP_POST' | 'REVIEW_REPLY'>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [topicFocus, setTopicFocus] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredItems = items.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  const handleStartEdit = (item: ContentItem) => {
    setEditingId(item._id);
    setEditText(item.body);
  };

  const handleSaveAndApprove = (id: string) => {
    onApprove(id, editText);
    setEditingId(null);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await onGeneratePost(topicFocus);
    setTopicFocus('');
    setIsGenerating(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Generator */}
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>1-Tap Approvals Queue</h2>
            <span className="badge badge-cyan">{items.length} Pending</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Review, edit, or approve AI-generated drafts before they are published to Google.
          </p>
        </div>

        {/* Quick Generator Box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            placeholder="Focus topic (e.g. Teeth Whitening, RCT)..."
            value={topicFocus}
            onChange={(e) => setTopicFocus(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              width: '260px',
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn btn-primary"
            style={{ fontSize: '0.8125rem' }}
          >
            <Sparkles size={15} />
            <span>{isGenerating ? 'Drafting...' : 'Generate Post'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginRight: '6px' }}>Filter:</span>
        {(['ALL', 'GBP_POST', 'REVIEW_REPLY'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: filterType === type ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              background: filterType === type ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-card)',
              color: filterType === type ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {type === 'ALL' ? 'All Pending' : type === 'GBP_POST' ? 'Google Posts' : 'Review Replies'}
          </button>
        ))}
      </div>

      {/* Approvals Cards Feed */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <CheckCircle2 size={44} color="var(--accent-emerald)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
            No Pending Approvals!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 20px' }}>
            All draft posts and review replies have been reviewed and published to your channels.
          </p>
          <button onClick={() => onGeneratePost('Preventive oral hygiene tips')} className="btn btn-primary">
            <Sparkles size={16} />
            <span>Generate New AI Post</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredItems.map((item) => {
            const isEditing = editingId === item._id;

            return (
              <div
                key={item._id}
                className="glass-panel"
                style={{
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      className={`badge ${item.type === 'GBP_POST' ? 'badge-cyan' : 'badge-violet'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {item.type === 'GBP_POST' ? 'Google Business Profile Post' : 'Google Review Reply'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} color="var(--accent-emerald)" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
                        Guardrails Passed
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Generated with {item.modelName}
                  </span>
                </div>

                {/* Card Body */}
                {isEditing ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--accent-cyan)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9375rem',
                        lineHeight: 1.5,
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {editText.length} / 1500 characters
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveAndApprove(item._id)}
                          className="btn btn-success"
                          style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                        >
                          <Check size={14} />
                          <span>Approve Edited Post</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {item.body}
                  </p>
                )}

                {/* Action Link Metadata */}
                {item.callToActionUrl && !isEditing && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      width: 'fit-content',
                    }}
                  >
                    <ExternalLink size={14} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      CTA ({item.callToActionType}):{' '}
                      <span style={{ color: 'var(--accent-cyan)' }}>{item.callToActionUrl}</span>
                    </span>
                  </div>
                )}

                {/* Card Actions Footer */}
                {!isEditing && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '16px',
                    }}
                  >
                    <button
                      onClick={() => handleStartEdit(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <Edit3 size={15} />
                      <span>Edit Content</span>
                    </button>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => onReject(item._id, 'Not aligned with current clinic promotions')}
                        className="btn btn-danger"
                      >
                        <XCircle size={15} />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => onApprove(item._id)}
                        className="btn btn-success"
                      >
                        <CheckCircle2 size={16} />
                        <span>1-Tap Approve & Publish</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
