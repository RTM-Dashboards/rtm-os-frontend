"use client";

import React, { useState, useEffect, useCallback } from "react";
import { KpiCard, SectionWrapper, StatusBadge, DataTable, ProgressBar } from "@/components/ui";
import type { Column } from "@/components/ui";
import { useWidgetPreferences } from "@/components/sales/widgets/useWidgetPreferences";
import { CustomizeViewModal } from "@/components/sales/widgets/CustomizeViewModal";

// ── Types ──────────────────────────────────────────────────────────────────────

type AffiliateType =
  | "Client Referral" | "Strategic Partner" | "Agency Partner"
  | "Influencer" | "Employee" | "Vendor";

type AffiliateStatus = "Active" | "Pending" | "Suspended" | "Archived";
type PortalStatus = "Invited" | "Active" | "Disabled" | "Pending Setup";
type CommissionModel = "Flat Fee" | "Percentage" | "Tiered" | "Custom";
type CommissionStatus = "Pending" | "Approved" | "Paid" | "Rejected" | "On Hold";
type ReferralPipelineStage =
  | "Lead" | "Qualified" | "Audit" | "Proposal" | "Negotiation" | "Won" | "Lost";
type NoteCategory = "General" | "Referral" | "Commission" | "Portal" | "Relationship";

interface Affiliate extends Record<string, unknown> {
  id: string;
  name: string;
  company: string;
  type: AffiliateType;
  status: AffiliateStatus;
  contactName: string;
  email: string;
  phone: string;
  joinDate: string;
  portalStatus: PortalStatus;
  referralCode: string;
  referralLink: string;
  assignedManager: string;
  commissionModel: CommissionModel;
  commissionRate: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Referral extends Record<string, unknown> {
  id: string;
  affiliateId: string;
  affiliateName: string;
  referralCode: string;
  referral: string;
  submissionDate: string;
  status: ReferralPipelineStage;
  assignedRep: string;
  pipelineStage: ReferralPipelineStage;
  dealValue: string;
  commission: string;
  opportunityId: string | null;
}

interface Commission extends Record<string, unknown> {
  id: string;
  affiliateId: string;
  referral: string;
  dealValue: string;
  commissionType: CommissionModel;
  commissionAmount: string;
  status: CommissionStatus;
  paymentDate: string;
}

interface AffiliateNote extends Record<string, unknown> {
  id: string;
  affiliateId: string;
  category: NoteCategory;
  content: string;
  author: string;
  date: string;
  pinned: boolean;
}

interface PortalUser extends Record<string, unknown> {
  id: string;
  affiliateId: string;
  portalUser: string;
  email: string;
  lastLogin: string;
  status: "Active" | "Disabled" | "Invited" | "Pending";
  role: string;
}

interface ReferralLink extends Record<string, unknown> {
  id: string;
  affiliateId: string;
  referralCode: string;
  referralUrl: string;
  createdDate: string;
  clicks: number;
  leads: number;
  qualified: number;
  won: number;
  revenue: string;
  active: boolean;
}

// ── Static commission display data (Phase 2 — deferred) ──────────────────────

const COMMISSIONS_STATIC: Commission[] = [
  { id: "com-001", affiliateId: "aff-009", referral: "Bay Area Chiro", dealValue: "$3,600/mo", commissionType: "Tiered", commissionAmount: "$1,080", status: "Approved", paymentDate: "Jun 15, 2025"},
  { id: "com-002", affiliateId: "aff-002", referral: "Pacific Spine Clinic", dealValue: "$4,200/mo", commissionType: "Tiered", commissionAmount: "$1,260", status: "Paid", paymentDate: "May 15, 2025"},
  { id: "com-003", affiliateId: "aff-001", referral: "Valley Pool Service", dealValue: "$2,200/mo", commissionType: "Percentage", commissionAmount: "$440", status: "Paid", paymentDate: "Apr 15, 2025"},
  { id: "com-004", affiliateId: "aff-016", referral: "Summit Electrical", dealValue: "$1,900/mo", commissionType: "Tiered", commissionAmount: "$380", status: "Pending", paymentDate: "—"},
  { id: "com-005", affiliateId: "aff-014", referral: "Premier Dental Group", dealValue: "$5,800/mo", commissionType: "Tiered", commissionAmount: "$1,740", status: "Approved", paymentDate: "Jun 15, 2025"},
  { id: "com-006", affiliateId: "aff-007", referral: "Bayside Law", dealValue: "$4,400/mo", commissionType: "Tiered", commissionAmount: "$1,320", status: "Paid", paymentDate: "May 15, 2025"},
  { id: "com-007", affiliateId: "aff-020", referral: "Liberty Insurance", dealValue: "$3,000/mo", commissionType: "Tiered", commissionAmount: "$600", status: "Paid", paymentDate: "Apr 15, 2025"},
  { id: "com-008", affiliateId: "aff-005", referral: "Greenfield Pest Control", dealValue: "$1,400/mo", commissionType: "Flat Fee", commissionAmount: "$500", status: "Paid", paymentDate: "Apr 1, 2025"},
  { id: "com-009", affiliateId: "aff-015", referral: "Ridge Custom Homes", dealValue: "$2,800/mo", commissionType: "Flat Fee", commissionAmount: "$750", status: "Pending", paymentDate: "—"},
  { id: "com-010", affiliateId: "aff-013", referral: "Horizon Tech", dealValue: "$1,200/mo", commissionType: "Flat Fee", commissionAmount: "$300", status: "Rejected", paymentDate: "—"},
];

const NOTES_STATIC: AffiliateNote[] = [
  { id: "note-001", affiliateId: "aff-002", category: "Relationship", content: "Sarah is a top performer. Has quarterly meeting preference. Has referred 3 healthcare clients this month.", author: "Jordan M.", date: "Jun 2, 2025", pinned: true },
  { id: "note-002", affiliateId: "aff-002", category: "Commission", content: "Tiered commission upgraded to 30% at 5+ wins after negotiation May 2025.", author: "Sarah K.", date: "May 10, 2025", pinned: false },
  { id: "note-003", affiliateId: "aff-009", category: "Referral", content: "Carlos refers primarily healthcare and professional services clients — high quality pipeline.", author: "Sarah K.", date: "May 28, 2025", pinned: true },
  { id: "note-004", affiliateId: "aff-013", category: "General", content: "Account suspended due to dispute over commission terms. Awaiting resolution.", author: "Admin", date: "Mar 5, 2025", pinned: false },
  { id: "note-005", affiliateId: "aff-019", category: "Portal", content: "Portal setup completed. Eric prefers the dashboard analytics view.", author: "Mike T.", date: "Mar 14, 2025", pinned: false },
];

// ── Status Variant Helpers ─────────────────────────────────────────────────────

function affiliateStatusVariant(s: AffiliateStatus): "success" | "pending" | "error" | "neutral" {
  const map: Record<AffiliateStatus, "success" | "pending" | "error" | "neutral"> = {
    Active: "success", Pending: "pending", Suspended: "error", Archived: "neutral",
  };
  return map[s];
}

function portalStatusVariant(s: PortalStatus): "success" | "info" | "neutral" | "pending" {
  const map: Record<PortalStatus, "success" | "info" | "neutral" | "pending"> = {
    Active: "success", Invited: "info", Disabled: "neutral", "Pending Setup": "pending",
  };
  return map[s];
}

function commissionStatusVariant(s: CommissionStatus): "pending" | "info" | "success" | "error" | "warning" {
  const map: Record<CommissionStatus, "pending" | "info" | "success" | "error" | "warning"> = {
    Pending: "pending", Approved: "info", Paid: "success", Rejected: "error", "On Hold": "warning",
  };
  return map[s];
}

function referralStageVariant(s: ReferralPipelineStage): "neutral" | "info" | "pending" | "warning" | "success" | "error" {
  const map: Record<ReferralPipelineStage, "neutral" | "info" | "pending" | "warning" | "success" | "error"> = {
    Lead: "neutral", Qualified: "info", Audit: "pending", Proposal: "warning",
    Negotiation: "warning", Won: "success", Lost: "error",
  };
  return map[s];
}

function affiliateTypeColor(t: AffiliateType): { bg?: string; text: string; border: string } {
  const map: Record<AffiliateType, { bg?: string; text: string; border: string }> = {
    "Client Referral":   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    "Strategic Partner": { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
    "Agency Partner":    { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
    "Influencer":        { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    "Employee":          { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
    "Vendor":            { bg: "#FAFAF9", text: "#44403C", border: "#D6D3D1" },
  };
  return map[t];
}

// ── Table Columns ──────────────────────────────────────────────────────────────

const affiliateDirectoryColumns: Column<Affiliate>[] = [
  {
    key: "name", header: "Affiliate Name", width: "160px",
    render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span>,
  },
  { key: "company", header: "Company", width: "160px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
  {
    key: "type", header: "Affiliate Type", width: "140px",
    render: (v) => {
      const c = affiliateTypeColor(v as AffiliateType);
      return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: c.bg, color: c.text, borderColor: c.border }}>{String(v)}</span>;
    },
  },
  {
    key: "status", header: "Status", width: "100px",
    render: (v) => <StatusBadge variant={affiliateStatusVariant(v as AffiliateStatus)} label={String(v)} size="sm" />,
  },
  { key: "commissionModel", header: "Commission", width: "110px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
  {
    key: "portalStatus", header: "Portal Status", width: "120px",
    render: (v) => <StatusBadge variant={portalStatusVariant(v as PortalStatus)} label={String(v)} size="sm" />,
  },
  { key: "assignedManager", header: "Manager", width: "100px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{String(v)}</span> },
  { key: "joinDate", header: "Join Date", width: "110px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{String(v)}</span> },
];

const referralsTableColumns: Column<Referral>[] = [
  { key: "referral", header: "Referral", width: "160px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "affiliateName", header: "Affiliate", width: "140px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
  { key: "submissionDate", header: "Submission Date", width: "130px" },
  {
    key: "pipelineStage", header: "Pipeline Stage", width: "120px",
    render: (v) => <StatusBadge variant={referralStageVariant(v as ReferralPipelineStage)} label={String(v)} size="sm" />,
  },
  { key: "assignedRep", header: "Sales Rep", width: "110px" },
  { key: "dealValue", header: "Deal Value", width: "110px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "commission", header: "Commission", width: "100px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#D97706" }}>{String(v)}</span> },
];

const commissionsTableColumns: Column<Commission>[] = [
  { key: "referral", header: "Referral", width: "160px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "dealValue", header: "Deal Value", width: "100px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "commissionType", header: "Commission Type", width: "130px" },
  { key: "commissionAmount", header: "Amount", width: "100px", render: (v) => <span className="font-bold text-xs" style={{ color: "#D97706" }}>{String(v)}</span> },
  {
    key: "status", header: "Status", width: "110px",
    render: (v) => <StatusBadge variant={commissionStatusVariant(v as CommissionStatus)} label={String(v)} size="sm" />,
  },
  { key: "paymentDate", header: "Payment Date", width: "120px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{String(v)}</span> },
];

const referralLinkColumns: Column<ReferralLink>[] = [
  { key: "referralCode", header: "Referral Code", width: "120px", render: (v) => <span className="font-mono font-bold text-xs px-2 py-0.5 rounded" style={{ background: "var(--rtm-bg)", color: "var(--rtm-blue)" }}>{String(v)}</span> },
  { key: "referralUrl", header: "Referral URL", width: "220px", render: (v) => <span className="text-xs truncate max-w-[200px] block" style={{ color: "#2563EB" }}>{String(v)}</span> },
  { key: "createdDate", header: "Created", width: "110px" },
  { key: "clicks", header: "Clicks", width: "80px", render: (v) => <span className="font-bold text-xs" style={{ color: "#2563EB" }}>{String(v)}</span> },
  { key: "leads", header: "Leads", width: "70px", render: (v) => <span className="font-bold text-xs" style={{ color: "#7C3AED" }}>{String(v)}</span> },
  { key: "qualified", header: "Qualified", width: "80px", render: (v) => <span className="font-bold text-xs" style={{ color: "#0891B2" }}>{String(v)}</span> },
  { key: "won", header: "Won", width: "70px", render: (v) => <span className="font-bold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "revenue", header: "Revenue", width: "110px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  {
    key: "active", header: "Status", width: "90px",
    render: (v) => <StatusBadge variant={v ? "success" : "neutral"} label={v ? "Active" : "Inactive"} size="sm" />,
  },
];

const portalUsersColumns: Column<PortalUser>[] = [
  { key: "portalUser", header: "Portal User", width: "140px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "email", header: "Email", width: "200px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
  { key: "lastLogin", header: "Last Login", width: "120px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{String(v)}</span> },
  {
    key: "status", header: "Status", width: "110px",
    render: (v) => {
      const variant = v === "Active" ? "success" : v === "Invited" ? "info" : v === "Pending" ? "pending" : "neutral";
      return <StatusBadge variant={variant as "success" | "info" | "pending" | "neutral"} label={String(v)} size="sm" />;
    },
  },
  { key: "role", header: "Role", width: "140px", render: (v) => <span className="text-xs font-medium" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
];

// ── Affiliate Profile Drawer ──────────────────────────────────────────────────

interface AffiliateDrawerProps {
  affiliate: Affiliate | null;
  allReferrals: Referral[];
  allPortalUsers: PortalUser[];
  allLinks: ReferralLink[];
  onClose: () => void;
  onGenerateLink: (aff: Affiliate) => void;
  onInviteUser: (aff: Affiliate) => void;
  onLinksChanged: () => void;
}

function AffiliateDrawer({
  affiliate, allReferrals, allPortalUsers, allLinks,
  onClose, onGenerateLink, onInviteUser, onLinksChanged,
}: AffiliateDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "referrals" | "commissions" | "links" | "portal" | "notes">("overview");

  if (!affiliate) return null;

  const affiliateReferrals = allReferrals.filter((r) => r.affiliateId === affiliate.id);
  const affiliateCommissions = COMMISSIONS_STATIC.filter((c) => c.affiliateId === affiliate.id);
  const affiliateNotes = NOTES_STATIC.filter((n) => n.affiliateId === affiliate.id);
  const affiliatePortalUsers = allPortalUsers.filter((p) => p.affiliateId === affiliate.id);
  const affiliateLinks = allLinks.filter((l) => l.affiliateId === affiliate.id);

  const typeColors = affiliateTypeColor(affiliate.type);

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "referrals", label: `Referrals (${affiliateReferrals.length})` },
    { key: "commissions", label: `Commissions (${affiliateCommissions.length})` },
    { key: "links", label: "Ref. Links" },
    { key: "portal", label: "Portal Access" },
    { key: "notes", label: `Notes (${affiliateNotes.length})` },
  ];

  async function handleToggleLink(link: ReferralLink) {
    await fetch("/api/sales-referral-links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: link.id, active: !link.active }),
    });
    onLinksChanged();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(15,28,56,0.35)" }} onClick={onClose}>
      <div
        className="relative h-full w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>{affiliate.name}</h2>
              <StatusBadge variant={affiliateStatusVariant(affiliate.status)} label={affiliate.status} size="sm" />
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: typeColors.bg, color: typeColors.text, borderColor: typeColors.border }}>{affiliate.type}</span>
            </div>
            <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{affiliate.company} · {affiliate.assignedManager}</p>
            <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--rtm-text-muted)" }}>Code: {affiliate.referralCode}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-lg font-bold transition-colors hover:bg-red-50" style={{ color: "var(--rtm-text-muted)" }}>×</button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto px-6 pt-3 pb-0 gap-1" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-3 py-2 text-xs font-semibold rounded-t-lg whitespace-nowrap transition-colors"
              style={{
                background: activeTab === tab.key ? "var(--rtm-bg)" : "transparent",
                color: activeTab === tab.key ? "var(--rtm-blue)" : "var(--rtm-text-muted)",
                borderBottom: activeTab === tab.key ? "2px solid var(--rtm-blue)" : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              <div className="rounded-xl border p-5 space-y-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Affiliate Overview</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    ["Affiliate Name", affiliate.name],
                    ["Company", affiliate.company],
                    ["Type", affiliate.type],
                    ["Contact Name", affiliate.contactName],
                    ["Email", affiliate.email],
                    ["Phone", affiliate.phone],
                    ["Join Date", affiliate.joinDate],
                    ["Assigned Manager", affiliate.assignedManager],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                      <p className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t" style={{ borderColor: "var(--rtm-border)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Referral Link</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: "var(--rtm-bg)", color: "#2563EB" }}>{affiliate.referralLink}</span>
                    <button
                      className="text-xs font-semibold px-2 py-1 rounded border"
                      style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}
                      onClick={() => {
                        try { navigator.clipboard.writeText(affiliate.referralLink); } catch {}
                        alert("Copied to clipboard");
                      }}
                    >Copy</button>
                  </div>
                </div>
                <div className="pt-2 border-t" style={{ borderColor: "var(--rtm-border)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Commission Model</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" }}>
                    {affiliate.commissionModel}{affiliate.commissionRate ? ` · ${affiliate.commissionRate}${affiliate.commissionModel === "Percentage" ? "%" : affiliate.commissionModel === "Flat Fee" ? " flat" : "%"}` : ""}
                  </span>
                </div>
                {affiliate.notes && (
                  <div className="pt-2 border-t" style={{ borderColor: "var(--rtm-border)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Notes</p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{affiliate.notes}</p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border p-5 space-y-3" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Referral Activity</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Referrals Submitted", value: affiliateReferrals.length, color: "#2563EB" },
                    { label: "Won Deals", value: affiliateReferrals.filter((r) => r.pipelineStage === "Won").length, color: "#059669" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-lg p-3 text-center" style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
                      <p className="text-xl font-bold" style={{ color }}>{value}</p>
                      <p className="text-[10px] font-semibold mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                    </div>
                  ))}
                </div>
                {affiliateReferrals.length > 0 && (() => {
                  const conversionRate = Math.round((affiliateReferrals.filter((r) => r.pipelineStage === "Won").length / affiliateReferrals.length) * 100);
                  return (
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Conversion Rate</span>
                        <span className="text-xs font-bold" style={{ color: conversionRate >= 40 ? "#059669" : "#D97706" }}>{conversionRate}%</span>
                      </div>
                      <ProgressBar value={conversionRate} color={conversionRate >= 40 ? "bg-emerald-500" : "bg-amber-500"} height={6} />
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {/* Referrals Tab */}
          {activeTab === "referrals" && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Referral History</p>
              {affiliateReferrals.length > 0 ? (
                <DataTable columns={referralsTableColumns} data={affiliateReferrals} />
              ) : (
                <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>No referrals on record for this affiliate.</div>
              )}
            </div>
          )}

          {/* Commissions Tab — Phase 2 deferred */}
          {activeTab === "commissions" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Commission History</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border" style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}>
                  Phase 2 — Not yet available
                </span>
              </div>
              <div className="rounded-xl border px-4 py-3" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
                <p className="text-xs font-semibold" style={{ color: "#92400E" }}>Commission approval and payout tracking is a financial workflow deferred to Phase 2. Data shown below is read-only display.</p>
              </div>
              {affiliateCommissions.length > 0 ? (
                <DataTable columns={commissionsTableColumns} data={affiliateCommissions} />
              ) : (
                <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>No commissions on record for this affiliate.</div>
              )}
            </div>
          )}

          {/* Referral Links Tab */}
          {activeTab === "links" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Referral Links</p>
                <button
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90"
                  style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}
                  onClick={() => onGenerateLink(affiliate)}
                >
                  Generate Link
                </button>
              </div>
              {affiliateLinks.length > 0 ? (
                <div className="space-y-3">
                  {affiliateLinks.map((link) => (
                    <div key={link.id} className="rounded-xl border p-4 space-y-3" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm px-2 py-1 rounded" style={{ background: "var(--rtm-bg)", color: "#2563EB" }}>{link.referralCode}</span>
                        <div className="flex gap-2 flex-wrap">
                          <StatusBadge variant={link.active ? "success" : "neutral"} label={link.active ? "Active" : "Inactive"} size="sm" />
                          <button
                            className="text-xs font-semibold px-2 py-1 rounded border"
                            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
                            onClick={() => { try { navigator.clipboard.writeText(link.referralUrl); } catch {} alert("Copied!"); }}
                          >Copy</button>
                          <button
                            className="text-xs font-semibold px-2 py-1 rounded border"
                            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
                            onClick={() => handleToggleLink(link)}
                          >{link.active ? "Deactivate" : "Activate"}</button>
                        </div>
                      </div>
                      <p className="text-xs truncate" style={{ color: "#2563EB" }}>{link.referralUrl}</p>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { label: "Clicks", value: link.clicks, color: "#2563EB" },
                          { label: "Leads", value: link.leads, color: "#7C3AED" },
                          { label: "Qualified", value: link.qualified, color: "#0891B2" },
                          { label: "Won", value: link.won, color: "#059669" },
                          { label: "Revenue", value: link.revenue, color: "#059669" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="text-center">
                            <p className="text-base font-bold" style={{ color }}>{value}</p>
                            <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>No referral links generated for this affiliate yet.</div>
              )}
            </div>
          )}

          {/* Portal Access Tab */}
          {activeTab === "portal" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Portal Access Management</p>
                <div className="flex gap-2 items-center">
                  <button
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90"
                    style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}
                    onClick={() => onInviteUser(affiliate)}
                  >
                    Invite User
                  </button>
                  <StatusBadge variant={portalStatusVariant(affiliate.portalStatus)} label={affiliate.portalStatus} size="sm" />
                </div>
              </div>
              {affiliatePortalUsers.length > 0 ? (
                <DataTable columns={portalUsersColumns} data={affiliatePortalUsers} />
              ) : (
                <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>No portal users configured. Invite a user to grant portal access.</div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Affiliate Notes</p>
              </div>
              {affiliateNotes.length > 0 ? (
                <div className="space-y-3">
                  {affiliateNotes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map((note) => {
                    const catColors: Record<NoteCategory, { bg?: string; text: string }> = {
                      General: { bg: "#F8FAFC", text: "#475569" },
                      Referral: { bg: "#EFF6FF", text: "#1D4ED8" },
                      Commission: { bg: "#FFFBEB", text: "#B45309" },
                      Portal: { bg: "#F5F3FF", text: "#6D28D9" },
                      Relationship: { bg: "#ECFDF5", text: "#065F46" },
                    };
                    const cc = catColors[note.category];
                    return (
                      <div key={note.id} className="rounded-xl border p-4 space-y-2" style={{ background: note.pinned ? "#FFFBEB" : "var(--rtm-surface)", borderColor: note.pinned ? "#FDE68A" : "var(--rtm-border)" }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {note.pinned && <span className="text-xs font-semibold text-amber-600">Pinned</span>}
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cc.bg, color: cc.text }}>{note.category}</span>
                          </div>
                          <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{note.author} · {note.date}</span>
                        </div>
                        <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{note.content}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>No notes for this affiliate yet.</div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 flex flex-wrap gap-2" style={{ background: "var(--rtm-surface)", borderTop: "1px solid var(--rtm-border)" }}>
          <button
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90"
            style={{ background: "#2563EB10", color: "#2563EB", borderColor: "#2563EB35" }}
            onClick={() => onGenerateLink(affiliate)}
          >
            Generate Referral Link
          </button>
          <button
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90"
            style={{ background: "#EFF6FF10", color: "#2563EB", borderColor: "#2563EB35" }}
            onClick={() => onInviteUser(affiliate)}
          >
            Invite Portal User
          </button>
          <button
            disabled
            title="Phase 2 — Not yet available"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border opacity-40 cursor-not-allowed"
            style={{ background: "#05966910", color: "#059669", borderColor: "#05966935" }}
          >
            Record Payment
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Row Action Menu ────────────────────────────────────────────────────────────

interface RowActionsProps {
  affiliate: Affiliate;
  onView: () => void;
  onGenerateLink: (aff: Affiliate) => void;
  onInviteUser: (aff: Affiliate) => void;
}

function RowActions({ affiliate, onView, onGenerateLink, onInviteUser }: RowActionsProps) {
  const [open, setOpen] = useState(false);

  const actions = [
    { label: "View Details",           action: onView },
    { label: "Generate Referral Link", action: () => onGenerateLink(affiliate) },
    { label: "Invite Portal User",     action: () => onInviteUser(affiliate) },
  ];

  return (
    <div className="relative">
      <button
        className="text-xs font-semibold px-2 py-1 rounded border transition-colors"
        style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
        onClick={() => setOpen((p) => !p)}
      >
        ⋯ Actions
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-52 rounded-xl border shadow-lg overflow-hidden" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            {actions.map(({ label, action }) => (
              <button
                key={label}
                className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors hover:bg-blue-50"
                style={{ color: "var(--rtm-text-secondary)" }}
                onClick={() => { setOpen(false); action(); }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Add Affiliate Modal ────────────────────────────────────────────────────────

interface AddAffiliateForm {
  name: string;
  type: AffiliateType;
  email: string;
  phone: string;
  company: string;
  assignedManager: string;
  commissionStructure: CommissionModel;
  commissionRate: string;
  notes: string;
}

const EMPTY_ADD_FORM: AddAffiliateForm = {
  name: "", type: "Client Referral", email: "", phone: "",
  company: "", assignedManager: "",
  commissionStructure: "Percentage", commissionRate: "", notes: "",
};

interface AddAffiliateModalProps {
  onClose: () => void;
  onAdd: (aff: Affiliate) => void;
}

function AddAffiliateModal({ onClose, onAdd }: AddAffiliateModalProps) {
  const [form, setForm] = useState<AddAffiliateForm>(EMPTY_ADD_FORM);
  const [errors, setErrors] = useState<Partial<AddAffiliateForm>>({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const e: Partial<AddAffiliateForm> = {};
    if (!form.name.trim())  e.name  = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);

    const code = form.name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) + "-RTM";
    const id = `aff-${Date.now()}`;
    const newAff: Affiliate = {
      id,
      name: form.name,
      company: form.company.trim() || form.name,
      type: form.type,
      status: "Pending",
      contactName: form.name,
      email: form.email,
      phone: form.phone,
      joinDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      portalStatus: "Pending Setup",
      referralCode: code,
      referralLink: `https://app.rtmagency.com/ref/${code}`,
      assignedManager: form.assignedManager.trim() || "—",
      commissionModel: form.commissionStructure,
      commissionRate: form.commissionRate,
      notes: form.notes,
    };

    try {
      const res = await fetch("/api/sales-affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAff),
      });
      if (res.ok) {
        const data = (await res.json()) as { record: Affiliate };
        onAdd(data.record);
        onClose();
      } else {
        alert("Failed to save affiliate. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const rateLabel = form.commissionStructure === "Percentage" ? "Rate (%)"
    : form.commissionStructure === "Flat Fee" ? "Amount ($)"
    : "Base Rate (%)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,28,56,0.45)" }} onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--rtm-border)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Add Affiliate</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Register a new affiliate partner.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-lg font-bold" style={{ color: "var(--rtm-text-muted)" }}>&#x2715;</button>
        </div>
        <div className="px-6 py-5 space-y-4 overflow-y-auto" style={{ maxHeight: "65vh" }}>
          {/* Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Affiliate Name <span style={{ color: "#DC2626" }}>*</span></label>
            <input className="w-full rtm-input text-sm" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name or company name" />
            {errors.name && <p className="text-[10px] mt-0.5" style={{ color: "#DC2626" }}>{errors.name}</p>}
          </div>
          {/* Company */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Company</label>
            <input className="w-full rtm-input text-sm" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Company name (optional, defaults to name)" />
          </div>
          {/* Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Affiliate Type</label>
            <select className="w-full rtm-input text-sm" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AffiliateType }))}>
              {(["Client Referral", "Strategic Partner", "Agency Partner", "Influencer", "Employee", "Vendor"] as AffiliateType[]).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Contact Email <span style={{ color: "#DC2626" }}>*</span></label>
            <input className="w-full rtm-input text-sm" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
            {errors.email && <p className="text-[10px] mt-0.5" style={{ color: "#DC2626" }}>{errors.email}</p>}
          </div>
          {/* Phone */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Contact Phone</label>
            <input className="w-full rtm-input text-sm" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(555) 000-0000" />
          </div>
          {/* Assigned Manager */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Assigned Manager</label>
            <input className="w-full rtm-input text-sm" value={form.assignedManager} onChange={(e) => setForm((f) => ({ ...f, assignedManager: e.target.value }))} placeholder="e.g. Jordan M." />
          </div>
          {/* Commission */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Commission Structure</label>
              <select className="w-full rtm-input text-sm" value={form.commissionStructure} onChange={(e) => setForm((f) => ({ ...f, commissionStructure: e.target.value as CommissionModel }))}>
                {(["Percentage", "Flat Fee", "Tiered"] as CommissionModel[]).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>{rateLabel}</label>
              <input
                className="w-full rtm-input text-sm"
                type="number" min="0"
                value={form.commissionRate}
                onChange={(e) => setForm((f) => ({ ...f, commissionRate: e.target.value }))}
                placeholder={form.commissionStructure === "Percentage" ? "e.g. 20" : "e.g. 500"}
              />
            </div>
          </div>
          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Notes</label>
            <textarea className="w-full rtm-input text-sm" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional notes about this affiliate..." />
          </div>
        </div>
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ borderColor: "var(--rtm-border)" }}>
          <button onClick={onClose} className="text-sm font-semibold px-4 py-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-60" style={{ background: "#059669", color: "#fff" }}>
            {saving ? "Saving…" : "Add Affiliate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Generate Referral Link Modal ──────────────────────────────────────────────

interface GenerateLinkModalProps {
  affiliate: Affiliate;
  onClose: () => void;
  onGenerated: (link: ReferralLink) => void;
}

function GenerateLinkModal({ affiliate, onClose, onGenerated }: GenerateLinkModalProps) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");

  async function handleGenerate() {
    setSaving(true);
    const id = `rl-${Date.now()}`;
    const ts = Date.now();
    const code = `${affiliate.referralCode}-${ts.toString().slice(-4)}`;
    const url = `https://app.rtmagency.com/ref/${code}`;

    const newLink: ReferralLink = {
      id,
      affiliateId: affiliate.id,
      referralCode: code,
      referralUrl: url,
      createdDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      clicks: 0,
      leads: 0,
      qualified: 0,
      won: 0,
      revenue: "$0",
      active: true,
    };

    try {
      const res = await fetch("/api/sales-referral-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLink),
      });
      if (res.ok) {
        const data = (await res.json()) as { record: ReferralLink };
        setGeneratedUrl(data.record.referralUrl);
        setDone(true);
        onGenerated(data.record);
      } else {
        alert("Failed to generate link.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,28,56,0.45)" }} onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--rtm-border)" }}>
          <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Generate Referral Link</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-lg font-bold" style={{ color: "var(--rtm-text-muted)" }}>&#x2715;</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
            Generate a trackable referral link for <strong>{affiliate.name}</strong>.
          </p>
          {done ? (
            <>
              <div className="rounded-lg border px-3 py-2.5" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
                <p className="text-xs font-mono break-all" style={{ color: "#2563EB" }}>{generatedUrl}</p>
              </div>
              <button
                onClick={() => { try { navigator.clipboard.writeText(generatedUrl); } catch {} alert("Copied!"); }}
                className="w-full text-sm font-bold px-4 py-2.5 rounded-lg border transition-all"
                style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
              >
                Copy Link
              </button>
              <button onClick={onClose} className="w-full text-sm font-semibold px-4 py-2.5 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Close</button>
            </>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={saving}
              className="w-full text-sm font-bold px-4 py-2.5 rounded-lg disabled:opacity-60"
              style={{ background: "#2563EB", color: "#fff" }}
            >
              {saving ? "Generating…" : "Generate Link"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Invite Portal User Modal ──────────────────────────────────────────────────

interface InvitePortalUserModalProps {
  affiliate: Affiliate;
  onClose: () => void;
  onInvited: (user: PortalUser) => void;
}

function InvitePortalUserModal({ affiliate, onClose, onInvited }: InvitePortalUserModalProps) {
  const [name, setName] = useState(affiliate.contactName);
  const [email, setEmail] = useState(affiliate.email);
  const [role, setRole] = useState("Affiliate Member");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  async function handleInvite() {
    const e: { name?: string; email?: string } = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email.trim()) e.email = "Email is required.";
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    const id = `pu-${Date.now()}`;
    const newUser: PortalUser = {
      id,
      affiliateId: affiliate.id,
      portalUser: name,
      email,
      lastLogin: "—",
      status: "Invited",
      role,
    };

    try {
      const res = await fetch("/api/sales-portal-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        const data = (await res.json()) as { record: PortalUser };
        onInvited(data.record);
        onClose();
      } else {
        alert("Failed to invite user.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,28,56,0.45)" }} onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--rtm-border)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Invite Portal User</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Grant portal access for {affiliate.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-lg font-bold" style={{ color: "var(--rtm-text-muted)" }}>&#x2715;</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="rounded-xl border px-4 py-3" style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}>
            <p className="text-xs" style={{ color: "#0369A1" }}>This records portal access status only — not actual authentication credentials.</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>User Name <span style={{ color: "#DC2626" }}>*</span></label>
            <input className="w-full rtm-input text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            {errors.name && <p className="text-[10px] mt-0.5" style={{ color: "#DC2626" }}>{errors.name}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Email <span style={{ color: "#DC2626" }}>*</span></label>
            <input className="w-full rtm-input text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
            {errors.email && <p className="text-[10px] mt-0.5" style={{ color: "#DC2626" }}>{errors.email}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Role</label>
            <select className="w-full rtm-input text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Affiliate Member</option>
              <option>Partner Admin</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ borderColor: "var(--rtm-border)" }}>
          <button onClick={onClose} className="text-sm font-semibold px-4 py-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Cancel</button>
          <button onClick={handleInvite} disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-60" style={{ background: "#2563EB", color: "#fff" }}>
            {saving ? "Inviting…" : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Commission Report Modal (read-only display, Phase 2 deferred) ─────────────

interface CommissionReportModalProps {
  affiliates: Affiliate[];
  onClose: () => void;
}

function CommissionReportModal({ affiliates, onClose }: CommissionReportModalProps) {
  const pendingTotal = COMMISSIONS_STATIC.filter((c) => c.status === "Pending" || c.status === "Approved")
    .reduce((s, c) => s + parseFloat(String(c.commissionAmount).replace(/[^0-9.]/g, "") || "0"), 0);
  const paidTotal = COMMISSIONS_STATIC.filter((c) => c.status === "Paid")
    .reduce((s, c) => s + parseFloat(String(c.commissionAmount).replace(/[^0-9.]/g, "") || "0"), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,28,56,0.45)" }} onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--rtm-border)" }}>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Commission Report</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border" style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}>
                Phase 2 — Read-only
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Summary of commission records. Approval and payout actions available in Phase 2.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-lg font-bold" style={{ color: "var(--rtm-text-muted)" }}>&#x2715;</button>
        </div>
        <div className="px-6 py-5 space-y-5" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border p-4" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
              <p className="text-2xl font-bold" style={{ color: "#D97706" }}>${Math.round(pendingTotal).toLocaleString()}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: "#92400E" }}>Pending + Approved Commissions</p>
            </div>
            <div className="rounded-xl border p-4" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
              <p className="text-2xl font-bold" style={{ color: "#059669" }}>${Math.round(paidTotal).toLocaleString()}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: "#065F46" }}>Total Paid Commissions</p>
            </div>
          </div>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
                  {["Referral", "Affiliate", "Type", "Amount", "Status", "Payment Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMMISSIONS_STATIC.map((c, i) => {
                  const aff = affiliates.find((a) => a.id === c.affiliateId);
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "transparent" : "var(--rtm-surface)" }}>
                      <td className="px-4 py-2.5 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.referral}</td>
                      <td className="px-4 py-2.5" style={{ color: "var(--rtm-text-secondary)" }}>{aff?.name ?? "—"}</td>
                      <td className="px-4 py-2.5" style={{ color: "var(--rtm-text-muted)" }}>{c.commissionType}</td>
                      <td className="px-4 py-2.5 font-bold" style={{ color: "#D97706" }}>{c.commissionAmount}</td>
                      <td className="px-4 py-2.5"><StatusBadge variant={commissionStatusVariant(c.status)} label={c.status} size="sm" /></td>
                      <td className="px-4 py-2.5" style={{ color: "var(--rtm-text-muted)" }}>{c.paymentDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: "var(--rtm-border)" }}>
          <button onClick={onClose} className="text-sm font-semibold px-4 py-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Workflow Steps ─────────────────────────────────────────────────────────────

const WORKFLOW_STEPS = [
  { label: "Affiliate Referral", color: "#94A3B8", desc: "Affiliate submits referral" },
  { label: "Lead",               color: "#2563EB", desc: "Lead created in CRM" },
  { label: "Audit",              color: "#7C3AED", desc: "Discovery & audit phase" },
  { label: "Proposal",           color: "#0891B2", desc: "Proposal sent to prospect" },
  { label: "Invoice Paid",       color: "#D97706", desc: "Deal closed + payment" },
  { label: "Commission Created", color: "#6366F1", desc: "Commission record created" },
  { label: "Commission Paid",    color: "#059669", desc: "Payout issued to affiliate" },
];

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AffiliatesPage() {
  // Data state
  const [affiliateList,   setAffiliateList]   = useState<Affiliate[]>([]);
  const [referralList,    setReferralList]    = useState<Referral[]>([]);
  const [portalUserList,  setPortalUserList]  = useState<PortalUser[]>([]);
  const [referralLinks,   setReferralLinks]   = useState<ReferralLink[]>([]);
  const [loading,         setLoading]         = useState(true);

  // UI state
  const [selectedAffiliate,   setSelectedAffiliate]   = useState<Affiliate | null>(null);
  const [statusFilter,        setStatusFilter]        = useState<AffiliateStatus | "All">("All");
  const [typeFilter,          setTypeFilter]          = useState<AffiliateType | "All">("All");
  const [searchQuery,         setSearchQuery]         = useState("");
  const [activeSection,       setActiveSection]       = useState<string | null>(null);
  const [showAddModal,        setShowAddModal]        = useState(false);
  const [generateLinkFor,     setGenerateLinkFor]     = useState<Affiliate | null>(null);
  const [inviteUserFor,       setInviteUserFor]       = useState<Affiliate | null>(null);
  const [showCommReport,      setShowCommReport]      = useState(false);
  const [showCustomize,       setShowCustomize]       = useState(false);
  const [exportBanner,        setExportBanner]        = useState(false);

  const { widgetOrder, isVisible } = useWidgetPreferences("affiliates");

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [affRes, refRes, puRes, rlRes] = await Promise.all([
        fetch("/api/sales-affiliates"),
        fetch("/api/sales-referrals"),
        fetch("/api/sales-portal-users"),
        fetch("/api/sales-referral-links"),
      ]);
      const [affData, refData, puData, rlData] = await Promise.all([
        affRes.json() as Promise<{ records: Affiliate[] }>,
        refRes.json() as Promise<{ records: Referral[] }>,
        puData_parse(puRes),
        rlRes.json() as Promise<{ records: ReferralLink[] }>,
      ]);
      setAffiliateList(affData.records ?? []);
      setReferralList(refData.records ?? []);
      setPortalUserList(puData);
      setReferralLinks(rlData.records ?? []);
    } catch {
      // Silently degrade — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  async function puData_parse(res: Response): Promise<PortalUser[]> {
    const data = (await res.json()) as { records: PortalUser[] };
    return data.records ?? [];
  }

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── KPI computations ──────────────────────────────────────────────────────

  const activeAffiliates       = affiliateList.filter((a) => a.status === "Active").length;
  const referralLeadsTotal     = referralList.length;
  const qualifiedReferralsTotal = referralList.filter((r) => r.pipelineStage === "Qualified" || r.pipelineStage === "Audit" || r.pipelineStage === "Proposal" || r.pipelineStage === "Negotiation" || r.pipelineStage === "Won").length;
  const closedWonTotal         = referralList.filter((r) => r.pipelineStage === "Won").length;

  const pendingCommissionsTotal = COMMISSIONS_STATIC.reduce((s, c) => {
    if (c.status !== "Pending" && c.status !== "Approved") return s;
    return s + parseFloat(String(c.commissionAmount).replace(/[^0-9.]/g, "") || "0");
  }, 0);

  const paidCommissionsTotal = COMMISSIONS_STATIC.reduce((s, c) => {
    if (c.status !== "Paid") return s;
    return s + parseFloat(String(c.commissionAmount).replace(/[^0-9.]/g, "") || "0");
  }, 0);

  // ── Type breakdown ─────────────────────────────────────────────────────────

  const typeCounts: Record<AffiliateType, number> = {
    "Client Referral": 0, "Strategic Partner": 0, "Agency Partner": 0,
    "Influencer": 0, "Employee": 0, "Vendor": 0,
  };
  affiliateList.forEach((a) => { typeCounts[a.type]++; });

  // ── Filtered list ──────────────────────────────────────────────────────────

  const toggle = (s: string) => setActiveSection((p) => (p === s ? null : s));

  const filteredAffiliates = affiliateList.filter((a) => {
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    const matchType   = typeFilter === "All" || a.type === typeFilter;
    const matchSearch = !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.referralCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  // ── Export ─────────────────────────────────────────────────────────────────

  function handleExport() {
    const headers = ["Name", "Company", "Type", "Status", "Email", "Phone", "Join Date", "Commission Model", "Portal Status", "Referral Code"];
    const rows = affiliateList.map((a) =>
      [a.name, a.company, a.type, a.status, a.email, a.phone, a.joinDate, a.commissionModel, a.portalStatus, a.referralCode]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `affiliates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportBanner(true);
    setTimeout(() => setExportBanner(false), 3000);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Modals */}
      {showAddModal && (
        <AddAffiliateModal
          onClose={() => setShowAddModal(false)}
          onAdd={(aff) => {
            setAffiliateList((prev) => [aff, ...prev]);
          }}
        />
      )}
      {generateLinkFor && (
        <GenerateLinkModal
          affiliate={generateLinkFor}
          onClose={() => setGenerateLinkFor(null)}
          onGenerated={(link) => setReferralLinks((prev) => [link, ...prev])}
        />
      )}
      {inviteUserFor && (
        <InvitePortalUserModal
          affiliate={inviteUserFor}
          onClose={() => setInviteUserFor(null)}
          onInvited={(user) => setPortalUserList((prev) => [user, ...prev])}
        />
      )}
      {showCommReport && (
        <CommissionReportModal affiliates={affiliateList} onClose={() => setShowCommReport(false)} />
      )}

      {/* Page Header */}
      <div
        className="rounded-xl px-6 py-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #05966918 0%, #05966908 100%)", border: "1px solid #05966930" }}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#059669" }}>Sales</p>
          <h1 className="text-2xl font-medium tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Affiliates</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            Manage affiliates, referral performance, and portal access.
            Commission approval and payout available in Phase 2.
          </p>
        </div>
      </div>

      {/* Export banner */}
      {exportBanner && (
        <div className="rounded-xl border px-4 py-3 flex items-center justify-between" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
          <p className="text-sm font-semibold" style={{ color: "#6D28D9" }}>Affiliate data exported as CSV.</p>
          <button onClick={() => setExportBanner(false)} className="text-xs" style={{ color: "#94A3B8" }}>Dismiss</button>
        </div>
      )}

      {/* Top Action Bar */}
      {showCustomize && (
        <CustomizeViewModal pageId="affiliates" onClose={() => setShowCustomize(false)} />
      )}
      <div className="flex flex-wrap gap-2">
        <button
          className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
          style={{ background: "#05966912", color: "#059669", borderColor: "#05966940" }}
          onClick={() => setShowAddModal(true)}
        >
          + Add Affiliate
        </button>
        <button
          className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
          style={{ background: "#7C3AED12", color: "#7C3AED", borderColor: "#7C3AED40" }}
          onClick={handleExport}
        >
          Export Affiliates
        </button>
        <button
          className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
          style={{ background: "#D9770612", color: "#D97706", borderColor: "#D9770640" }}
          onClick={() => setShowCommReport(true)}
        >
          Commission Report
        </button>
        <button
          disabled
          title="Phase 2 — Not yet available"
          className="text-sm font-semibold px-4 py-2 rounded-lg border opacity-40 cursor-not-allowed"
          style={{ background: "#05966912", color: "#059669", borderColor: "#05966940" }}
        >
          Approve Commissions — Phase 2
        </button>
        <button
          className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
          style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
          onClick={() => setShowCustomize(true)}
        >
          Customize View
        </button>
      </div>

      {/* KPI Cards */}
      {(() => {
        const kpiCards: Record<string, React.ReactElement> = {
          "aff-active-affiliates": (
            <KpiCard key="aff-active-affiliates"
              title="Active Affiliates" value={loading ? "—" : String(activeAffiliates)}
              trend="up" trendValue="3" iconBg="#ECFDF5" iconColor="#059669"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
            />
          ),
          "aff-referral-leads": (
            <KpiCard key="aff-referral-leads"
              title="Referral Leads" value={loading ? "—" : String(referralLeadsTotal)}
              trend="up" trendValue="2" iconBg="#EFF6FF" iconColor="#2563EB"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
            />
          ),
          "aff-qualified-referrals": (
            <KpiCard key="aff-qualified-referrals"
              title="Qualified Referrals" value={loading ? "—" : String(qualifiedReferralsTotal)}
              iconBg="#F5F3FF" iconColor="#7C3AED"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
          ),
          "aff-closed-won-deals": (
            <KpiCard key="aff-closed-won-deals"
              title="Closed Won Deals" value={loading ? "—" : String(closedWonTotal)}
              iconBg="#ECFDF5" iconColor="#059669"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>}
            />
          ),
          "aff-pending-commissions": (
            <KpiCard key="aff-pending-commissions"
              title="Pending Commissions" value={`$${Math.round(pendingCommissionsTotal).toLocaleString()}`}
              iconBg="#FFFBEB" iconColor="#D97706"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
          ),
          "aff-paid-commissions": (
            <KpiCard key="aff-paid-commissions"
              title="Paid Commissions" value={`$${Math.round(paidCommissionsTotal).toLocaleString()}`}
              iconBg="#ECFDF5" iconColor="#059669"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
            />
          ),
          "aff-referral-revenue": (
            <KpiCard key="aff-referral-revenue"
              title="Referral Links" value={loading ? "—" : String(referralLinks.filter((l) => l.active).length) + " active"}
              iconBg="#EFF6FF" iconColor="#2563EB"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>}
            />
          ),
          "aff-avg-affiliate-value": (
            <KpiCard key="aff-avg-affiliate-value"
              title="Total Affiliates" value={loading ? "—" : String(affiliateList.length)}
              iconBg="#F5F3FF" iconColor="#7C3AED"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
            />
          ),
        };
        const visibleCards = widgetOrder
          .filter((id) => isVisible(id) && kpiCards[id])
          .map((id) => kpiCards[id]);
        if (visibleCards.length === 0) return null;
        return <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{visibleCards}</div>;
      })()}

      {/* Affiliate Type Breakdown */}
      {!loading && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {(Object.keys(typeCounts) as AffiliateType[]).map((type) => {
            const c = affiliateTypeColor(type);
            return (
              <div
                key={type}
                className="rounded-xl border p-3 text-center cursor-pointer transition-all hover:shadow-md"
                style={{ background: c.bg, borderColor: c.border }}
                onClick={() => setTypeFilter(typeFilter === type ? "All" : type)}
              >
                <p className="text-xl font-bold" style={{ color: c.text }}>{typeCounts[type]}</p>
                <p className="text-[10px] font-semibold mt-0.5 leading-tight" style={{ color: c.text }}>{type}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Workflow Attribution */}
      <SectionWrapper title="Referral Workflow Attribution" description="End-to-end affiliate referral flow from submission to commission payout">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {WORKFLOW_STEPS.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-1 min-w-[90px]">
                  <div className="rounded-lg px-3 py-2 text-center w-full" style={{ background: `${step.color}12`, border: `1.5px solid ${step.color}35` }}>
                    <p className="text-[10px] font-bold" style={{ color: step.color }}>{step.label}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{step.desc}</p>
                  </div>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && <span className="text-sm" style={{ color: "var(--rtm-border)" }}>→</span>}
              </React.Fragment>
            ))}
          </div>
          {!loading && (() => {
            const qualRate = referralLeadsTotal > 0 ? Math.round((qualifiedReferralsTotal / referralLeadsTotal) * 100) : 0;
            const winRate  = qualifiedReferralsTotal > 0 ? Math.round((closedWonTotal / qualifiedReferralsTotal) * 100) : 0;
            return (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Referrals Submitted", value: String(referralLeadsTotal), color: "#2563EB" },
                  { label: "Qualification Rate", value: `${qualRate}%`, color: "#7C3AED" },
                  { label: "Referral Win Rate", value: `${winRate}%`, color: "#059669" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-lg p-3 text-center" style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
                    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>{label}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </SectionWrapper>

      {/* Affiliate Directory */}
      <SectionWrapper
        title="Affiliate Directory"
        description="All affiliate partners with commission model and portal access status"
        actions={
          <button
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90"
            style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}
            onClick={() => setShowAddModal(true)}
          >
            + Add Affiliate
          </button>
        }
      >
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text" placeholder="Search affiliates…" value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rtm-input text-sm w-56" style={{ fontSize: "12px", padding: "6px 12px" }}
          />
          <div className="flex gap-1 flex-wrap">
            {(["All", "Active", "Pending", "Suspended", "Archived"] as (AffiliateStatus | "All")[]).map((s) => (
              <button
                key={s} onClick={() => setStatusFilter(s)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                style={{
                  background: statusFilter === s
                    ? (s === "All" ? "#1E293B" : s === "Active" ? "#059669" : s === "Pending" ? "#3B82F6" : s === "Suspended" ? "#DC2626" : "#64748B")
                    : "var(--rtm-surface)",
                  color: statusFilter === s ? "#fff" : "var(--rtm-text-secondary)",
                  borderColor: statusFilter === s ? "transparent" : "var(--rtm-border)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {(["All", "Client Referral", "Agency Partner", "Strategic Partner", "Influencer", "Employee", "Vendor"] as (AffiliateType | "All")[]).map((t) => {
              const c = t !== "All" ? affiliateTypeColor(t) : null;
              return (
                <button
                  key={t} onClick={() => setTypeFilter(t)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                  style={{
                    background: typeFilter === t ? (c?.bg ?? "#1E293B") : "var(--rtm-surface)",
                    color: typeFilter === t ? (c?.text ?? "#fff") : "var(--rtm-text-secondary)",
                    borderColor: typeFilter === t ? (c?.border ?? "transparent") : "var(--rtm-border)",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading affiliates…</div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--rtm-border)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
                    {affiliateDirectoryColumns.map((col) => (
                      <th key={String(col.key)} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)", ...(col.width ? { width: col.width } : {}) }}>
                        {col.header}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)", width: "130px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAffiliates.map((aff, rowIdx) => (
                    <tr key={aff.id} style={{ background: rowIdx % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)" }}>
                      {affiliateDirectoryColumns.map((col) => (
                        <td key={String(col.key)} className="px-4 py-3 text-xs align-middle" style={{ color: "var(--rtm-text-secondary)" }}>
                          {col.render ? col.render(aff[col.key], aff) : String(aff[col.key])}
                        </td>
                      ))}
                      <td className="px-4 py-3 align-middle">
                        <RowActions
                          affiliate={aff}
                          onView={() => setSelectedAffiliate(aff)}
                          onGenerateLink={(a) => setGenerateLinkFor(a)}
                          onInviteUser={(a) => setInviteUserFor(a)}
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredAffiliates.length === 0 && (
                    <tr>
                      <td colSpan={affiliateDirectoryColumns.length + 1} className="px-4 py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                        No affiliates match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--rtm-text-muted)" }}>
              Showing {filteredAffiliates.length} of {affiliateList.length} affiliates
            </p>
          </>
        )}
      </SectionWrapper>

      {/* Referral Tracking */}
      <SectionWrapper
        title="Referral Tracking"
        description="All referrals tracked across the pipeline with stage, rep assignment, and commission estimates"
        actions={
          <button className="rtm-btn-secondary text-sm" onClick={() => toggle("referralTracking")}>
            {activeSection === "referralTracking" ? "Collapse" : "Expand"}
          </button>
        }
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {(["Lead", "Qualified", "Audit", "Proposal", "Negotiation", "Won", "Lost"] as ReferralPipelineStage[]).map((stage) => {
            const count = referralList.filter((r) => r.pipelineStage === stage).length;
            return (
              <div key={stage} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <StatusBadge variant={referralStageVariant(stage)} label={stage} size="sm" />
                <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{count}</span>
              </div>
            );
          })}
        </div>
        {loading ? (
          <div className="py-4 text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading referrals…</div>
        ) : activeSection === "referralTracking" ? (
          <DataTable columns={referralsTableColumns} data={referralList} />
        ) : (
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {referralList.length} referrals tracked · Click Expand to view full table
          </p>
        )}
      </SectionWrapper>

      {/* Commission Tracking — Phase 2 deferred, read-only display */}
      <SectionWrapper
        title="Commission Tracking"
        description="Commission approval and payout tracking. Approval and payment actions deferred to Phase 2."
        actions={
          <div className="flex gap-2">
            <button disabled title="Phase 2 — Not yet available" className="text-xs font-semibold px-3 py-1.5 rounded-lg border opacity-40 cursor-not-allowed" style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>Bulk Approve</button>
            <button className="rtm-btn-secondary text-sm" onClick={() => toggle("commissions")}>
              {activeSection === "commissions" ? "Collapse" : "Expand"}
            </button>
          </div>
        }
      >
        <div className="rounded-xl border px-4 py-3 mb-4" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
          <p className="text-xs font-semibold" style={{ color: "#92400E" }}>
            Approve Commission, Pay Now, and Process Payouts are financial workflow actions deferred to Phase 2.
            The data below is read-only display from the current commission records.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {(["Pending", "Approved", "Paid", "Rejected", "On Hold"] as CommissionStatus[]).map((s) => {
            const count = COMMISSIONS_STATIC.filter((c) => c.status === s).length;
            const totalAmt = COMMISSIONS_STATIC.filter((c) => c.status === s).reduce((sum, c) => {
              return sum + parseFloat(String(c.commissionAmount).replace(/[^0-9.]/g, "") || "0");
            }, 0);
            return (
              <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <StatusBadge variant={commissionStatusVariant(s)} label={s} size="sm" />
                <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{count}</span>
                {totalAmt > 0 && <span className="text-xs font-semibold" style={{ color: "#D97706" }}>${totalAmt.toLocaleString()}</span>}
              </div>
            );
          })}
        </div>
        {activeSection === "commissions" ? (
          <DataTable columns={commissionsTableColumns} data={COMMISSIONS_STATIC} />
        ) : (
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {COMMISSIONS_STATIC.length} commission records · ${Math.round(pendingCommissionsTotal).toLocaleString()} pending · Click Expand to view all
          </p>
        )}
      </SectionWrapper>

      {/* Referral Link Management */}
      <SectionWrapper
        title="Referral Link Management"
        description="All affiliate referral links with click tracking and lead attribution"
        actions={
          <div className="flex gap-2">
            <button className="rtm-btn-secondary text-sm" onClick={() => toggle("referralLinks")}>
              {activeSection === "referralLinks" ? "Collapse" : "Expand"}
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="py-4 text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading referral links…</div>
        ) : activeSection === "referralLinks" ? (
          <DataTable columns={referralLinkColumns} data={referralLinks} />
        ) : (
          <div className="flex flex-wrap gap-3 py-1">
            {referralLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <span className="font-mono font-bold text-xs" style={{ color: "#2563EB" }}>{link.referralCode}</span>
                <StatusBadge variant={link.active ? "success" : "neutral"} label={link.active ? "Active" : "Off"} size="sm" />
                <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{link.leads} leads · {link.won} won</span>
              </div>
            ))}
            {referralLinks.length === 0 && (
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No referral links yet. Open an affiliate to generate one.</p>
            )}
          </div>
        )}
      </SectionWrapper>

      {/* Portal Access Management */}
      <SectionWrapper
        title="Affiliate Portal Access"
        description="Manage portal user access, login status, and roles across all affiliate accounts"
        actions={
          <div className="flex gap-2">
            <button className="rtm-btn-secondary text-sm" onClick={() => toggle("portalAccess")}>
              {activeSection === "portalAccess" ? "Collapse" : "Expand"}
            </button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: "Active",   count: portalUserList.filter((p) => p.status === "Active").length,   variant: "success" as const },
            { label: "Invited",  count: portalUserList.filter((p) => p.status === "Invited").length,  variant: "info" as const },
            { label: "Disabled", count: portalUserList.filter((p) => p.status === "Disabled").length, variant: "neutral" as const },
          ].map(({ label, count, variant }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <StatusBadge variant={variant} label={label} size="sm" />
              <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{count}</span>
            </div>
          ))}
        </div>
        {loading ? (
          <div className="py-4 text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading portal users…</div>
        ) : activeSection === "portalAccess" ? (
          <DataTable columns={portalUsersColumns} data={portalUserList} />
        ) : (
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {portalUserList.length} portal users · {portalUserList.filter((p) => p.status === "Active").length} active · Click Expand to manage
          </p>
        )}
      </SectionWrapper>

      {/* Payout Management — Phase 2 deferred */}
      <SectionWrapper
        title="Payout Management"
        description="Review pending commissions and record affiliate payouts. Payout actions deferred to Phase 2."
        actions={
          <button disabled title="Phase 2 — Not yet available" className="text-xs font-semibold px-3 py-1.5 rounded-lg border opacity-40 cursor-not-allowed" style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>
            Process Payouts
          </button>
        }
      >
        <div className="rounded-xl border px-4 py-3 mb-4" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
          <p className="text-xs font-semibold" style={{ color: "#92400E" }}>
            Process Payouts and Pay Now actions are deferred to Phase 2. The payout summary below is read-only display.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { label: "Ready to Pay", value: `$${COMMISSIONS_STATIC.filter((c) => c.status === "Approved").reduce((s, c) => s + parseFloat(String(c.commissionAmount).replace(/[^0-9.]/g, "") || "0"), 0).toLocaleString()}`, color: "#059669", desc: "Approved commissions" },
            { label: "Awaiting Approval", value: `$${COMMISSIONS_STATIC.filter((c) => c.status === "Pending").reduce((s, c) => s + parseFloat(String(c.commissionAmount).replace(/[^0-9.]/g, "") || "0"), 0).toLocaleString()}`, color: "#D97706", desc: "Pending review" },
            { label: "Total Paid", value: `$${Math.round(paidCommissionsTotal).toLocaleString()}`, color: "#2563EB", desc: "Paid commissions total" },
          ].map(({ label, value, color, desc }) => (
            <div key={label} className="rounded-xl border p-4" style={{ background: `${color}08`, borderColor: `${color}25` }}>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
                {["Affiliate", "Commission Type", "Amount", "Status", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMMISSIONS_STATIC.filter((c) => c.status === "Approved" || c.status === "Pending").map((c, i) => {
                const aff = affiliateList.find((a) => a.id === c.affiliateId);
                return (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)" }}>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{aff?.name ?? c.affiliateId}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{c.commissionType}</td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: "#D97706" }}>{c.commissionAmount}</td>
                    <td className="px-4 py-3"><StatusBadge variant={commissionStatusVariant(c.status)} label={c.status} size="sm" /></td>
                    <td className="px-4 py-3">
                      <button disabled title="Phase 2 — Not yet available" className="text-xs font-semibold px-3 py-1 rounded border opacity-40 cursor-not-allowed" style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>
                        Pay Now
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* Affiliate Profile Drawer */}
      <AffiliateDrawer
        affiliate={selectedAffiliate}
        allReferrals={referralList}
        allPortalUsers={portalUserList}
        allLinks={referralLinks}
        onClose={() => setSelectedAffiliate(null)}
        onGenerateLink={(aff) => { setSelectedAffiliate(null); setGenerateLinkFor(aff); }}
        onInviteUser={(aff) => { setSelectedAffiliate(null); setInviteUserFor(aff); }}
        onLinksChanged={() => {
          fetch("/api/sales-referral-links")
            .then((r) => r.json() as Promise<{ records: ReferralLink[] }>)
            .then((d) => setReferralLinks(d.records ?? []))
            .catch(() => {});
        }}
      />
    </div>
  );
}
