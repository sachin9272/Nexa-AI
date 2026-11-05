'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  Search,
  CheckCircle,
  XCircle,
  Tag,
  Phone,
  Mail,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { Customer } from '../../lib/types';

interface CustomersViewProps {
  customers: Customer[];
  onAddCustomer: (customer: { name: string; phone: string; email?: string; tags?: string[] }) => void;
  onImportCustomers: (contacts: Array<{ name: string; phone: string; email?: string; tags?: string[] }>) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onAddCustomer,
  onImportCustomers,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTag, setNewTag] = useState('patient');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneE164.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));

    const matchesTag =
      selectedTag === 'all' ||
      c.tags.includes(selectedTag) ||
      c.consentStatus === selectedTag;

    return matchesSearch && matchesTag;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    onAddCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      tags: [newTag],
    });
    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
  };

  const handleSimulateCsvImport = () => {
    const demoBatch = [
      { name: 'Meenakshi Iyer', phone: '+919811223344', email: 'meenakshi@gmail.com', tags: ['patient', 'invisalign'] },
      { name: 'Rajesh Singhal', phone: '+919822334455', email: 'rajesh.s@yahoo.com', tags: ['patient', 'reactivation_target'] },
      { name: 'Dr. Shalini Gupta', phone: '+919833445566', email: 'dr.shalini@outlook.com', tags: ['patient', 'vip'] },
      { name: 'Arjun Nambiar', phone: '+919844556677', email: 'arjun.n@gmail.com', tags: ['patient', 'teeth_whitening'] },
    ];
    onImportCustomers(demoBatch);
    setIsImportModalOpen(false);
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Customer Directory & CRM</h2>
            <span className="badge badge-cyan">{customers.length} Contacts</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            E.164 phone normalized database with verified WhatsApp opt-in consent tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsImportModalOpen(true)} className="btn btn-secondary">
            <Upload size={15} />
            <span>Import CSV / Excel</span>
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <UserPlus size={15} />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search patient by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['all', 'invisalign', 'vip', 'reactivation_target', 'OPTED_IN', 'OPTED_OUT'] as const).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              style={{
                padding: '6px 12px',
                borderRadius: '9999px',
                border: selectedTag === tag ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                background: selectedTag === tag ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-card)',
                color: selectedTag === tag ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tag === 'all' ? 'All Tags' : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PATIENT</th>
              <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PHONE (E.164)</th>
              <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONSENT STATUS</th>
              <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TAGS</th>
              <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LAST VISIT</th>
              <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>VISITS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr
                key={c._id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background 0.15s ease',
                }}
              >
                <td style={{ padding: '16px 20px' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</p>
                  {c.email && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</p>
                  )}
                </td>

                <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: 'var(--accent-cyan)' }}>
                  {c.phoneE164}
                </td>

                <td style={{ padding: '16px 20px' }}>
                  <span
                    className={`badge ${c.consentStatus === 'OPTED_IN' ? 'badge-emerald' : 'badge-rose'}`}
                    style={{ fontSize: '0.6875rem' }}
                  >
                    {c.consentStatus === 'OPTED_IN' ? '✓ Opted In' : '✕ Opted Out'}
                  </span>
                </td>

                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '0.6875rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>

                <td style={{ padding: '16px 20px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString() : 'N/A'}
                </td>

                <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: 600 }}>
                  {c.totalVisits}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
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
            style={{ width: '100%', maxWidth: '480px', padding: '32px', background: 'var(--bg-secondary)' }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Add New Patient</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Phone numbers are automatically normalized to E.164 (+91 standard).
            </p>

            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Sen"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
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
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9811044291 or +919811044291"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
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
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. radhika@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
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
                  Initial Tag
                </label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
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
                  <option value="patient">General Patient</option>
                  <option value="invisalign">Invisalign Candidate</option>
                  <option value="teeth_whitening">Teeth Whitening</option>
                  <option value="vip">VIP Patient</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Save Contact</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {isImportModalOpen && (
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
            style={{ width: '100%', maxWidth: '500px', padding: '32px', background: 'var(--bg-secondary)', textAlign: 'center' }}
          >
            <FileSpreadsheet size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              Import Patients CSV / Excel
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Upload your existing patient list. Nexa normalizes numbers, removes duplicates, and logs consent timestamps.
            </p>

            <div
              style={{
                border: '2px dashed var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '30px 20px',
                marginBottom: '20px',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <Upload size={28} color="var(--accent-cyan)" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Drag and drop patients.csv</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports CSV, XLS, XLSX up to 10,000 rows</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => setIsImportModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSimulateCsvImport} className="btn btn-primary">
                <CheckCircle size={16} />
                <span>Simulate 4 Patients Import</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
