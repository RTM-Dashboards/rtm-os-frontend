"use client";

import type { BillingStatus, CampaignStatus, InvoiceStatus, RenewalStatus, RiskLevel } from "@/lib/billing/types";

// ── Shared badge shell ────────────────────────────────────────────────────────
function Badge({ label, dot, bg, color, border }: { label: string; dot: string; bg: string; color: string; border: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold border whitespace-nowrap"
      style={{ background: bg, color, borderColor: border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
      {label}
    </span>
  );
}

// ── Billing Status ────────────────────────────────────────────────────────────
const billingStatusMap: Record<BillingStatus, { label: string; bg: string; color: string; dot: string; border: string }> = {
  current:   { label: "Current",   bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
  past_due:  { label: "Past Due",  bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B", border: "#FDE68A" },
  overdue:   { label: "Overdue",   bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", border: "#FECACA" },
  pending:   { label: "Pending",   bg: "#EFF6FF", color: "#3B82F6", dot: "#6366F1", border: "#BFDBFE" },
  cancelled: { label: "Cancelled", bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8", border: "#E2E8F0" },
};

export function BillingStatusBadge({ status }: { status: BillingStatus }) {
  return <Badge {...billingStatusMap[status]} />;
}

// ── Campaign Status ───────────────────────────────────────────────────────────
const campaignStatusMap: Record<CampaignStatus, { label: string; bg: string; color: string; dot: string; border: string }> = {
  active:    { label: "Active",    bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
  paused:    { label: "Paused",    bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B", border: "#FDE68A" },
  pending:   { label: "Pending",   bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", dot: "var(--rtm-blue-mid)", border: "var(--rtm-blue-light)" },
  cancelled: { label: "Cancelled", bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8", border: "#E2E8F0" },
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return <Badge {...campaignStatusMap[status]} />;
}

// ── Invoice Status ────────────────────────────────────────────────────────────
const invoiceStatusMap: Record<InvoiceStatus, { label: string; bg: string; color: string; dot: string; border: string }> = {
  paid:    { label: "Paid",    bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
  pending: { label: "Pending", bg: "#EFF6FF", color: "#3B82F6", dot: "#6366F1", border: "#BFDBFE" },
  overdue: { label: "Overdue", bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", border: "#FECACA" },
  draft:   { label: "Draft",   bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8", border: "#E2E8F0" },
  void:    { label: "Void",    bg: "#F8FAFC", color: "#94A3B8", dot: "#CBD5E1", border: "#E2E8F0" },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge {...invoiceStatusMap[status]} />;
}

// ── Risk Level ────────────────────────────────────────────────────────────────
const riskLevelMap: Record<RiskLevel, { label: string; bg: string; color: string; dot: string; border: string }> = {
  low:      { label: "Low",      bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
  medium:   { label: "Medium",   bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B", border: "#FDE68A" },
  high:     { label: "High",     bg: "#FFF7ED", color: "#C2410C", dot: "#F97316", border: "#FED7AA" },
  critical: { label: "Critical", bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", border: "#FECACA" },
};

export function RiskLevelBadge({ level }: { level: RiskLevel }) {
  return <Badge {...riskLevelMap[level]} />;
}

// ── Renewal Status ────────────────────────────────────────────────────────────
const renewalStatusMap: Record<RenewalStatus, { label: string; bg: string; color: string; dot: string; border: string }> = {
  on_track: { label: "On Track", bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
  at_risk:  { label: "At Risk",  bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B", border: "#FDE68A" },
  renewed:  { label: "Renewed",  bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", dot: "var(--rtm-blue-mid)", border: "var(--rtm-blue-light)" },
  churned:  { label: "Churned",  bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", border: "#FECACA" },
  pending:  { label: "Pending",  bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8", border: "#E2E8F0" },
};

export function RenewalStatusBadge({ status }: { status: RenewalStatus }) {
  return <Badge {...renewalStatusMap[status]} />;
}
