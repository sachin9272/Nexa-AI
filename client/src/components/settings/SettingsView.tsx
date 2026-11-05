'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Link as LinkIcon,
  Clock,
} from 'lucide-react';
import { Tenant, ServiceItem } from '../../lib/types';

interface SettingsViewProps {
  tenant: Tenant | null;
  onUpdateTenant: (updates: Partial<Tenant>) => Promise<Tenant>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  tenant,
  onUpdateTenant,
}) => {
  const [name, setName] = useState(tenant?.name || '');
  const [phone, setPhone] = useState(tenant?.phone || '');
  const [city, setCity] = useState(tenant?.city || '');
  const [address, setAddress] = useState(tenant?.address || '');
  const [tone, setTone] = useState(tenant?.brandVoice?.tone || 'Empathetic, reassuring, and clinically precise');
  const [signatureText, setSignatureText] = useState(tenant?.brandVoice?.signatureText || '');
  const [ctaText, setCtaText] = useState(tenant?.brandVoice?.ctaText || 'Book Instant Consultation');
  const [appointmentLink, setAppointmentLink] = useState(tenant?.brandVoice?.appointmentLink || 'https://apexdental.in/book');
  const [services, setServices] = useState<ServiceItem[]>(tenant?.servicesCatalog || []);
  const [isSaved, setIsSaved] = useState(false);

  // New Service input state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Cosmetic');

  const handleAddService = () => {
    if (!newServiceName.trim() || !newServicePrice.trim()) return;
    setServices([
      ...services,
      {
        name: newServiceName.trim(),
        price: newServicePrice.trim(),
        description: newServiceDesc.trim() || 'Professional in-clinic treatment',
        durationMinutes: 45,
        category: newServiceCategory,
      },
    ]);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDesc('');
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateTenant({
      name,
      phone,
      city,
      address,
      servicesCatalog: services,
      brandVoice: {
        tone,
        languages: ['English', 'Hindi'],
        signatureText,
        ctaText,
        appointmentLink,
        highlightServices: services.slice(0, 2).map((s) => s.name),
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Clinic Profile & Grounded AI Voice</h2>
            <span className="badge badge-emerald">Deterministic Grounding</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Configure real services, transparent pricing, and brand tone. The AI co-pilot strictly references this catalog.
          </p>
        </div>

        <button type="submit" className="btn btn-primary">
          <Save size={16} />
          <span>{isSaved ? 'Changes Saved!' : 'Save Profile'}</span>
        </button>
      </div>

      {isSaved && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>Clinic settings and AI grounding catalog updated successfully!</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Business Details */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Building2 size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Clinic Identity & Contact</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                Clinic Legal / Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
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
                Primary Phone Number (E.164 verified for WhatsApp & Calls)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
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
                  Timezone
                </label>
                <input
                  type="text"
                  disabled
                  value="Asia/Kolkata (UTC+5:30)"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                Physical Location Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: AI Brand Voice & Compliance */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Sparkles size={18} color="var(--accent-violet)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>AI Brand Voice & Guardrails</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                Communication Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                <option value="Empathetic, reassuring, and clinically precise">Empathetic, reassuring, and clinically precise (Recommended for Healthcare)</option>
                <option value="Warm, welcoming, and friendly">Warm, welcoming, and friendly</option>
                <option value="Prestigious, luxury, and aesthetic-focused">Prestigious, luxury, and aesthetic-focused</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                Official Doctor / Sign-off Signature
              </label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="e.g. Dr. Rohan Mehra, Lead Implantologist"
                style={{
                  width: '100%',
                  padding: '9px 12px',
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
                Default Appointment / Call-To-Action URL
              </label>
              <input
                type="text"
                value={appointmentLink}
                onChange={(e) => setAppointmentLink(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Guardrails Active Notice */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginTop: '4px',
              }}
            >
              <ShieldCheck size={18} color="var(--accent-indigo)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#a5b4fc' }}>
                  Healthcare Compliance Active
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                  All generated Google posts and review replies are automatically checked against banned medical superiority claims (*"#1 clinic"*, *"permanent cure"*).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Catalog Grounding Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '4px' }}>
          Grounding Services & Treatments Catalog
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          The AI co-pilot will only mention procedures and prices explicitly listed here.
        </p>

        {/* Existing Services List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {services.map((s, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{s.name}</span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.6875rem' }}>{s.price}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {s.description}
                </p>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  {s.category} • {s.durationMinutes} mins
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveService(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-rose)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Service Inputs */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Add New Treatment / Procedure</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px' }}>
            <input
              type="text"
              placeholder="Treatment name (e.g. Dental Veneers)"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
              }}
            />
            <input
              type="text"
              placeholder="Starting Price (e.g. ₹12,000)"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
              }}
            />
            <input
              type="text"
              placeholder="Description..."
              value={newServiceDesc}
              onChange={(e) => setNewServiceDesc(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleAddService} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 14px' }}>
              <Plus size={14} />
              <span>Add to Catalog</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
