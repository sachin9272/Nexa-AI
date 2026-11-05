'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar, TabType } from '../components/layout/Sidebar';
import { OverviewView } from '../components/dashboard/OverviewView';
import { ApprovalsView } from '../components/approvals/ApprovalsView';
import { GbpAuditView } from '../components/gbp/GbpAuditView';
import { CampaignsView } from '../components/campaigns/CampaignsView';
import { CustomersView } from '../components/customers/CustomersView';
import { AnalyticsView } from '../components/analytics/AnalyticsView';
import { SettingsView } from '../components/settings/SettingsView';
import {
  Tenant,
  GbpAudit,
  ContentItem,
  Review,
  Campaign,
  Customer,
  AnalyticsOverview,
  TimeseriesPoint,
} from '../lib/types';
import { api } from '../lib/api';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Application Data States
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [audit, setAudit] = useState<GbpAudit | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<ContentItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          tenantData,
          auditData,
          approvalsData,
          reviewsData,
          campaignsData,
          customersData,
          analyticsData,
          timeseriesData,
        ] = await Promise.all([
          api.getTenant(),
          api.getAudit(),
          api.getPendingApprovals(),
          api.getReviews(),
          api.getCampaigns(),
          api.getCustomers(),
          api.getAnalytics(),
          api.getTimeseries(),
        ]);

        setTenant(tenantData);
        setAudit(auditData);
        setPendingApprovals(approvalsData);
        setReviews(reviewsData);
        setCampaigns(campaignsData);
        setCustomers(customersData);
        setAnalytics(analyticsData);
        setTimeseries(timeseriesData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Handlers for interactive actions across views
  const handleApprove = async (id: string, editedBody?: string) => {
    await api.approveContent(id, editedBody);
    setPendingApprovals((prev) => prev.filter((item) => item._id !== id));
    if (analytics) {
      setAnalytics({
        ...analytics,
        content: {
          ...analytics.content,
          pendingApprovals: Math.max(0, analytics.content.pendingApprovals - 1),
          postsPublished: analytics.content.postsPublished + 1,
        },
      });
    }
  };

  const handleReject = async (id: string, reason: string) => {
    await api.rejectContent(id, reason);
    setPendingApprovals((prev) => prev.filter((item) => item._id !== id));
  };

  const handleGeneratePost = async (topicFocus?: string) => {
    const newItem = await api.generateGbpPost(topicFocus);
    setPendingApprovals((prev) => [newItem, ...prev]);
  };

  const handleRunAudit = async () => {
    const updated = await api.runAudit();
    setAudit(updated);
  };

  const handleReplyReview = async (reviewId: string, replyText: string) => {
    const updated = await api.replyToReview(reviewId, replyText);
    setReviews((prev) =>
      prev.map((r) => (r._id === reviewId ? { ...r, reply: updated.reply } : r)),
    );
  };

  const handleCreateCampaign = async (data: {
    title: string;
    goal: Campaign['goal'];
    templateId: string;
    segmentTags: string[];
  }) => {
    const newCamp = await api.createCampaign(data);
    setCampaigns((prev) => [newCamp, ...prev]);
  };

  const handleAddCustomer = async (cust: {
    name: string;
    phone: string;
    email?: string;
    tags?: string[];
  }) => {
    const newCust = await api.addCustomer(cust);
    setCustomers((prev) => [newCust, ...prev]);
  };

  const handleImportCustomers = async (
    contacts: Array<{ name: string; phone: string; email?: string; tags?: string[] }>,
  ) => {
    await api.importCustomers(contacts);
    const updated = await api.getCustomers();
    setCustomers(updated);
  };

  const handleUpdateTenant = async (updates: Partial<Tenant>) => {
    const updated = await api.updateTenant(updates);
    setTenant(updated);
    return updated;
  };

  const handleSendDigest = async () => {
    return api.sendTestDigest();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Ambient glowing radial gradient backdrop */}
      <div className="ambient-glow" />

      {/* Top Navigation Header */}
      <Header
        tenant={tenant}
        pendingApprovalsCount={pendingApprovals.length}
        onOpenApprovals={() => setActiveTab('approvals')}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingApprovalsCount={pendingApprovals.length}
          auditScore={audit?.score ?? 78}
        />

        {/* Dynamic Main Workspace Container */}
        <main
          style={{
            flex: 1,
            padding: '32px 40px',
            maxWidth: '1440px',
            margin: '0 auto',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <div className="pulse-dot" style={{ width: '16px', height: '16px' }} />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewView
                  analytics={analytics}
                  audit={audit}
                  pendingApprovals={pendingApprovals}
                  onNavigateTab={setActiveTab}
                  onQuickApprove={handleApprove}
                  onGeneratePost={() => handleGeneratePost('Autumn dental hygiene checks')}
                  onSendDigest={handleSendDigest}
                />
              )}

              {activeTab === 'approvals' && (
                <ApprovalsView
                  items={pendingApprovals}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onGeneratePost={handleGeneratePost}
                />
              )}

              {activeTab === 'gbp' && (
                <GbpAuditView
                  audit={audit}
                  reviews={reviews}
                  onRunAudit={handleRunAudit}
                  onReplyReview={handleReplyReview}
                />
              )}

              {activeTab === 'campaigns' && (
                <CampaignsView
                  campaigns={campaigns}
                  onCreateCampaign={handleCreateCampaign}
                />
              )}

              {activeTab === 'customers' && (
                <CustomersView
                  customers={customers}
                  onAddCustomer={handleAddCustomer}
                  onImportCustomers={handleImportCustomers}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  analytics={analytics}
                  timeseries={timeseries}
                  clinicPhone={tenant?.phone || '+91 98110 44291'}
                  onSendTestDigest={handleSendDigest}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  tenant={tenant}
                  onUpdateTenant={handleUpdateTenant}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
