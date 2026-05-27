"use client";

import type { BillingStatus, CampaignStatus, InvoiceStatus, RenewalStatus, RiskLevel } from "@/lib/billing/types";

// ─── Billing Status Badge ─────────────────────────────────────────────────────

const billingStatusConfig: Record<BillingStatus, { label: string; classes: string; dot: string }> = {
  current: {
    label: "Current",
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  past_due: {
    label: "Past Due",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  overdue: {
    label: "Overdue",
    classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
  pending: {
    label: "Pending",
    classes: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    dot: "bg-indigo-500",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

export function BillingStatusBadge({ status }: { status: BillingStatus }) {
  const cfg = billingStatusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Campaign Status Badge ────────────────────────────────────────────────────

const campaignStatusConfig: Record<CampaignStatus, { label: string; classes: string; dot: string }> = {
  active: {
    label: "Active",
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  paused: {
    label: "Paused",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  pending: {
    label: "Pending",
    classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const cfg = campaignStatusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Invoice Status Badge ─────────────────────────────────────────────────────

const invoiceStatusConfig: Record<InvoiceStatus, { label: string; classes: string; dot: string }> = {
  paid: {
    label: "Paid",
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    classes: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    dot: "bg-indigo-500",
  },
  overdue: {
    label: "Overdue",
    classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
  draft: {
    label: "Draft",
    classes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400",
  },
  void: {
    label: "Void",
    classes: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
    dot: "bg-slate-300",
  },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = invoiceStatusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Risk Level Badge ─────────────────────────────────────────────────────────

const riskLevelConfig: Record<RiskLevel, { label: string; classes: string; dot: string }> = {
  low: {
    label: "Low",
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  medium: {
    label: "Medium",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  high: {
    label: "High",
    classes: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  critical: {
    label: "Critical",
    classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
};

export function RiskLevelBadge({ level }: { level: RiskLevel }) {
  const cfg = riskLevelConfig[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Renewal Status Badge ─────────────────────────────────────────────────────

const renewalStatusConfig: Record<RenewalStatus, { label: string; classes: string; dot: string }> = {
  on_track: {
    label: "On Track",
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  at_risk: {
    label: "At Risk",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  renewed: {
    label: "Renewed",
    classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  churned: {
    label: "Churned",
    classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
  pending: {
    label: "Pending",
    classes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

export function RenewalStatusBadge({ status }: { status: RenewalStatus }) {
  const cfg = renewalStatusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
