"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge, KpiCard } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

// ── Types ─────────────────────────────────────────────────────────────────────

type BadgeVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "neutral"
  | "pending";

interface ClientPortfolioRow {
  id: string;
  client: string;
  lifecycleStatus: string;
  lifecycleVariant: BadgeVariant;
  salesStatus: string;
  salesVariant: BadgeVariant;
  invoiceStatus: string;
  invoiceVariant: BadgeVariant;
  paymentStatus: string;
  paymentVariant: BadgeVariant;
  activationStatus: string;
  activationVariant: BadgeVariant;
  amStatus: string;
  amVariant: BadgeVariant;
  onboardingStatus: string;
  onboardingVariant: BadgeVariant;
  renewalStatus: string;
  renewalVariant: BadgeVariant;
  billingRisk: string;
  billingRiskVariant: BadgeVariant;
  billingOwner: string;
  nextAction: string;
  // Client Information
  contractValue: string;
  monthlyValue: string;
  setupFee: string;
  servicesPurchased: string;
  contractStart: string;
  contractEnd: string;
  renewalDate: string;
  // Cross-module
  salesOwner: string;
  amOwner: string;
  renewalOwner: string;
  currentDepartment: string;
  currentWorkflowStage: string;
  // Issues
  issues: ClientIssue[];
}

interface ClientIssue {
  type: string;
  status: "Open" | "In Progress" | "Escalated" | "Resolved";
}

// ── Lifecycle Stages ──────────────────────────────────────────────────────────

const LIFECYCLE_STAGES = [
  { key: "lead",               label: "Lead" },
  { key: "opportunity",        label: "Opportunity" },
  { key: "proposal",           label: "Proposal" },
  { key: "contract",           label: "Contract" },
  { key: "closed_won",         label: "Closed Won" },
  { key: "sent_to_billing",    label: "Sent To Billing" },
  { key: "invoice_sent",       label: "Invoice Sent" },
  { key: "awaiting_payment",   label: "Awaiting Payment" },
  { key: "payment_confirmed",  label: "Payment Confirmed" },
  { key: "activation_approved",label: "Activation Approved" },
  { key: "sent_to_am",         label: "Sent To AM" },
  { key: "onboarding",         label: "Onboarding" },
  { key: "active",             label: "Active" },
  { key: "renewal",            label: "Renewal" },
] as const;

// ── Mock Data ─────────────────────────────────────────────────────────────────

const clientPortfolioRows: ClientPortfolioRow[] = [
  {
    id: "1",
    client: "Apex Roofing",
    lifecycleStatus: "Invoice Sent",         lifecycleVariant: "info",
    salesStatus: "Closed Won",               salesVariant: "success",
    invoiceStatus: "Sent",                   invoiceVariant: "info",
    paymentStatus: "Awaiting Payment",       paymentVariant: "warning",
    activationStatus: "Awaiting Invoice",    activationVariant: "neutral",
    amStatus: "Pending",                     amVariant: "neutral",
    onboardingStatus: "Not Started",         onboardingVariant: "neutral",
    renewalStatus: "Active",                 renewalVariant: "success",
    billingRisk: "Medium",                   billingRiskVariant: "warning",
    billingOwner: "Lisa P.",
    nextAction: "Follow up on payment",
    contractValue: "$12,000",
    monthlyValue: "$1,000",
    setupFee: "$500",
    servicesPurchased: "SEO, GBP, Reporting",
    contractStart: "2024-01-15",
    contractEnd: "2025-01-14",
    renewalDate: "2024-12-15",
    salesOwner: "Marco T.",
    amOwner: "Unassigned",
    renewalOwner: "Unassigned",
    currentDepartment: "Billing",
    currentWorkflowStage: "Invoice Sent",
    issues: [{ type: "Missing Payment", status: "Open" }],
  },
  {
    id: "2",
    client: "Pacific Dental",
    lifecycleStatus: "Onboarding",           lifecycleVariant: "info",
    salesStatus: "Closed Won",               salesVariant: "success",
    invoiceStatus: "Paid",                   invoiceVariant: "success",
    paymentStatus: "Confirmed",              paymentVariant: "success",
    activationStatus: "Ready For Activation",activationVariant: "info",
    amStatus: "Assigned",                    amVariant: "success",
    onboardingStatus: "In Progress",         onboardingVariant: "info",
    renewalStatus: "Schedule Pending",       renewalVariant: "warning",
    billingRisk: "Low",                      billingRiskVariant: "success",
    billingOwner: "Sarah K.",
    nextAction: "Update billing schedule",
    contractValue: "$24,000",
    monthlyValue: "$2,000",
    setupFee: "$1,500",
    servicesPurchased: "Meta Ads, Google Ads, LSA",
    contractStart: "2024-02-01",
    contractEnd: "2025-01-31",
    renewalDate: "2024-12-31",
    salesOwner: "Jordan R.",
    amOwner: "Dana W.",
    renewalOwner: "Sarah K.",
    currentDepartment: "Account Management",
    currentWorkflowStage: "Onboarding",
    issues: [],
  },
  {
    id: "3",
    client: "Sunbelt HVAC",
    lifecycleStatus: "Awaiting Payment",     lifecycleVariant: "warning",
    salesStatus: "Closed Won",               salesVariant: "success",
    invoiceStatus: "Partially Paid",         invoiceVariant: "warning",
    paymentStatus: "Partial",               paymentVariant: "warning",
    activationStatus: "Awaiting Payment",    activationVariant: "warning",
    amStatus: "On Hold",                     amVariant: "warning",
    onboardingStatus: "Paused",              onboardingVariant: "warning",
    renewalStatus: "Retention Plan",         renewalVariant: "warning",
    billingRisk: "High",                     billingRiskVariant: "error",
    billingOwner: "Lisa P.",
    nextAction: "Collect remaining balance",
    contractValue: "$9,600",
    monthlyValue: "$800",
    setupFee: "$0",
    servicesPurchased: "Content, Reporting",
    contractStart: "2024-03-10",
    contractEnd: "2025-03-09",
    renewalDate: "2025-02-10",
    salesOwner: "Marco T.",
    amOwner: "Alex V.",
    renewalOwner: "Lisa P.",
    currentDepartment: "Billing",
    currentWorkflowStage: "Awaiting Payment",
    issues: [
      { type: "Failed Payment", status: "In Progress" },
      { type: "Cancellation Request", status: "Open" },
    ],
  },
  {
    id: "4",
    client: "Harbor Auto Group",
    lifecycleStatus: "Active",               lifecycleVariant: "success",
    salesStatus: "Closed Won",               salesVariant: "success",
    invoiceStatus: "Paid",                   invoiceVariant: "success",
    paymentStatus: "Confirmed",              paymentVariant: "success",
    activationStatus: "Activated",           activationVariant: "success",
    amStatus: "Active",                      amVariant: "success",
    onboardingStatus: "Completed",           onboardingVariant: "success",
    renewalStatus: "Renewed",                renewalVariant: "success",
    billingRisk: "None",                     billingRiskVariant: "neutral",
    billingOwner: "Sarah K.",
    nextAction: "Monitor renewal",
    contractValue: "$36,000",
    monthlyValue: "$3,000",
    setupFee: "$2,000",
    servicesPurchased: "Full Bundle",
    contractStart: "2023-06-01",
    contractEnd: "2024-05-31",
    renewalDate: "2024-04-30",
    salesOwner: "Jordan R.",
    amOwner: "Dana W.",
    renewalOwner: "Sarah K.",
    currentDepartment: "Account Management",
    currentWorkflowStage: "Active",
    issues: [],
  },
  {
    id: "5",
    client: "Metro Dental",
    lifecycleStatus: "Sent To Billing",      lifecycleVariant: "neutral",
    salesStatus: "Closed Won",               salesVariant: "success",
    invoiceStatus: "Draft",                  invoiceVariant: "neutral",
    paymentStatus: "Not Sent",               paymentVariant: "neutral",
    activationStatus: "Awaiting Invoice",    activationVariant: "neutral",
    amStatus: "Pending",                     amVariant: "neutral",
    onboardingStatus: "Not Started",         onboardingVariant: "neutral",
    renewalStatus: "Cancelled",              renewalVariant: "error",
    billingRisk: "Critical",                 billingRiskVariant: "error",
    billingOwner: "Lisa P.",
    nextAction: "Generate invoice, final billing review",
    contractValue: "$14,400",
    monthlyValue: "$1,200",
    setupFee: "$750",
    servicesPurchased: "SEO, GBP, Call Tracking",
    contractStart: "2024-04-01",
    contractEnd: "2025-03-31",
    renewalDate: "2025-02-28",
    salesOwner: "Marco T.",
    amOwner: "Unassigned",
    renewalOwner: "Unassigned",
    currentDepartment: "Billing",
    currentWorkflowStage: "Sent To Billing",
    issues: [{ type: "Cancellation Request", status: "Escalated" }],
  },
  {
    id: "6",
    client: "Blue Ridge Plumbing",
    lifecycleStatus: "Payment Confirmed",    lifecycleVariant: "success",
    salesStatus: "Closed Won",               salesVariant: "success",
    invoiceStatus: "Paid",                   invoiceVariant: "success",
    paymentStatus: "Confirmed",              paymentVariant: "success",
    activationStatus: "Ready For Activation",activationVariant: "info",
    amStatus: "Assignment Pending",          amVariant: "warning",
    onboardingStatus: "Not Started",         onboardingVariant: "neutral",
    renewalStatus: "Billing Updated",        renewalVariant: "success",
    billingRisk: "Low",                      billingRiskVariant: "success",
    billingOwner: "Sarah K.",
    nextAction: "Approve activation, send to AM",
    contractValue: "$7,200",
    monthlyValue: "$600",
    setupFee: "$300",
    servicesPurchased: "Starter SEO",
    contractStart: "2024-05-15",
    contractEnd: "2025-05-14",
    renewalDate: "2025-04-15",
    salesOwner: "Jordan R.",
    amOwner: "Unassigned",
    renewalOwner: "Sarah K.",
    currentDepartment: "Billing",
    currentWorkflowStage: "Payment Confirmed",
    issues: [],
  },
  {
    id: "7",
    client: "Green Valley Pools",
    lifecycleStatus: "Awaiting Payment",     lifecycleVariant: "error",
    salesStatus: "Closed Won",               salesVariant: "success",
    invoiceStatus: "Overdue",                invoiceVariant: "error",
    paymentStatus: "Overdue",                paymentVariant: "error",
    activationStatus: "Hold — Overdue",      activationVariant: "error",
    amStatus: "Blocked",                     amVariant: "error",
    onboardingStatus: "Blocked",             onboardingVariant: "error",
    renewalStatus: "Cancelled",              renewalVariant: "error",
    billingRisk: "Critical",                 billingRiskVariant: "error",
    billingOwner: "Lisa P.",
    nextAction: "Escalate collections, close account",
    contractValue: "$10,800",
    monthlyValue: "$900",
    setupFee: "$500",
    servicesPurchased: "SEO, Meta Ads",
    contractStart: "2024-01-01",
    contractEnd: "2024-12-31",
    renewalDate: "2024-11-30",
    salesOwner: "Marco T.",
    amOwner: "Blocked",
    renewalOwner: "Unassigned",
    currentDepartment: "Billing",
    currentWorkflowStage: "Collections",
    issues: [
      { type: "Failed Payment", status: "Escalated" },
      { type: "Billing Dispute", status: "Open" },
      { type: "Renewal Issue", status: "Escalated" },
    ],
  },
  {
    id: "8",
    client: "Skyline Landscaping",
    lifecycleStatus: "Active",               lifecycleVariant: "success",
    salesStatus: "Closed Won",               salesVariant: "success",
    invoiceStatus: "Paid",                   invoiceVariant: "success",
    paymentStatus: "Confirmed",              paymentVariant: "success",
    activationStatus: "Activated",           activationVariant: "success",
    amStatus: "Active",                      amVariant: "success",
    onboardingStatus: "Completed",           onboardingVariant: "success",
    renewalStatus: "Renewed",                renewalVariant: "success",
    billingRisk: "None",                     billingRiskVariant: "neutral",
    billingOwner: "Sarah K.",
    nextAction: "None",
    contractValue: "$18,000",
    monthlyValue: "$1,500",
    setupFee: "$800",
    servicesPurchased: "GBP, Yelp, Reporting",
    contractStart: "2023-09-01",
    contractEnd: "2024-08-31",
    renewalDate: "2024-07-31",
    salesOwner: "Jordan R.",
    amOwner: "Alex V.",
    renewalOwner: "Sarah K.",
    currentDepartment: "Account Management",
    currentWorkflowStage: "Active",
    issues: [],
  },
  {
    id: "9",
    client: "Cornerstone Flooring",
    lifecycleStatus: "Awaiting Payment",     lifecycleVariant: "error",
    salesStatus: "Closed Won",               salesVariant: "success",
    invoiceStatus: "Overdue",                invoiceVariant: "error",
    paymentStatus: "Overdue 60 Days",        paymentVariant: "error",
    activationStatus: "Services On Hold",    activationVariant: "error",
    amStatus: "Blocked",                     amVariant: "error",
    onboardingStatus: "Blocked",             onboardingVariant: "error",
    renewalStatus: "At Risk",                renewalVariant: "error",
    billingRisk: "Critical",                 billingRiskVariant: "error",
    billingOwner: "Lisa P.",
    nextAction: "Collections agency follow-up",
    contractValue: "$8,400",
    monthlyValue: "$700",
    setupFee: "$350",
    servicesPurchased: "SEO, Reporting",
    contractStart: "2024-02-15",
    contractEnd: "2025-02-14",
    renewalDate: "2025-01-14",
    salesOwner: "Marco T.",
    amOwner: "Blocked",
    renewalOwner: "Unassigned",
    currentDepartment: "Billing",
    currentWorkflowStage: "Collections",
    issues: [
      { type: "Missing Payment", status: "Escalated" },
      { type: "Activation Delay", status: "In Progress" },
    ],
  },
  {
    id: "10",
    client: "Summit Pest Control",
    lifecycleStatus: "Active",               lifecycleVariant: "success",
    salesStatus: "Closed Won",               salesVariant: "success",
    invoiceStatus: "Partially Paid",         invoiceVariant: "warning",
    paymentStatus: "Payment Plan",           paymentVariant: "info",
    activationStatus: "Active",              activationVariant: "success",
    amStatus: "Active",                      amVariant: "success",
    onboardingStatus: "Completed",           onboardingVariant: "success",
    renewalStatus: "Active",                 renewalVariant: "success",
    billingRisk: "Low",                      billingRiskVariant: "success",
    billingOwner: "Sarah K.",
    nextAction: "Confirm next payment plan installment",
    contractValue: "$6,000",
    monthlyValue: "$500",
    setupFee: "$250",
    servicesPurchased: "Local SEO",
    contractStart: "2024-06-01",
    contractEnd: "2025-05-31",
    renewalDate: "2025-04-30",
    salesOwner: "Jordan R.",
    amOwner: "Dana W.",
    renewalOwner: "Sarah K.",
    currentDepartment: "Account Management",
    currentWorkflowStage: "Active",
    issues: [{ type: "Contract Issue", status: "In Progress" }],
  },
];

// ── KPI helpers ───────────────────────────────────────────────────────────────

const kpiData = {
  activeClients:            clientPortfolioRows.filter((c) => c.lifecycleStatus === "Active").length,
  awaitingInvoice:          clientPortfolioRows.filter((c) => c.invoiceStatus === "Draft" || c.activationStatus === "Awaiting Invoice").length,
  awaitingPayment:          clientPortfolioRows.filter((c) => c.paymentVariant === "warning" || c.paymentStatus === "Awaiting Payment").length,
  paymentConfirmed:         clientPortfolioRows.filter((c) => c.paymentStatus === "Confirmed").length,
  readyForActivation:       clientPortfolioRows.filter((c) => c.activationStatus === "Ready For Activation").length,
  activeServices:           clientPortfolioRows.filter((c) => c.activationStatus === "Activated" || c.activationStatus === "Active").length,
  cancellationRequests:     clientPortfolioRows.filter((c) => c.issues.some((i) => i.type === "Cancellation Request" && i.status !== "Resolved")).length,
  renewalBillingRequired:   clientPortfolioRows.filter((c) => c.renewalStatus === "Retention Plan" || c.renewalStatus === "Schedule Pending" || c.renewalStatus === "At Risk").length,
};

// ── Issue status color ────────────────────────────────────────────────────────

const issueStatusVariant: Record<string, BadgeVariant> = {
  "Open":        "warning",
  "In Progress": "info",
  "Escalated":   "error",
  "Resolved":    "success",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2 whitespace-nowrap border-b"
      style={{
        color: "var(--rtm-text-muted)",
        borderColor: "var(--rtm-border-light)",
        background: "var(--rtm-bg-alt, #F9FAFB)",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <td
      className="px-3 py-2.5 text-sm whitespace-nowrap border-b"
      style={{
        color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)",
        borderColor: "var(--rtm-border-light)",
      }}
    >
      {children}
    </td>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: "var(--rtm-text-muted)" }}
      >
        {label}
      </span>
      <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  variant = "secondary",
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}) {
  const base =
    "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap";
  const styles: Record<string, string> = {
    primary:
      "bg-[var(--rtm-blue,#1B4FD8)] text-white border-transparent hover:opacity-90",
    secondary:
      "bg-[var(--rtm-surface,#fff)] text-[var(--rtm-text-primary)] border-[var(--rtm-border)] hover:bg-[var(--rtm-bg)]",
    danger:
      "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]",
  };
  return (
    <button className={`${base} ${styles[variant]}`} onClick={onClick}>
      {label}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingClientPortfolioPage() {
  const [selected, setSelected] = useState<ClientPortfolioRow | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);

  function log(msg: string) {
    setActionLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 9),
    ]);
  }

  // Lifecycle current stage index
  const currentStageIndex = selected
    ? LIFECYCLE_STAGES.findIndex(
        (s) =>
          s.label.toLowerCase() ===
          selected.lifecycleStatus.toLowerCase()
      )
    : -1;

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: workspace.accentColor }}
        >
          {workspace.name}
        </p>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          Client Portfolio Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Billing&rsquo;s primary client management workspace — full lifecycle
          visibility across Sales, Billing, Account Management, and Renewals.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Client Portfolio Dashboard — KPI Cards
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiCard
          title="Active Clients"
          value={String(kpiData.activeClients)}
          accentColor="#059669"
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<span className="text-lg">✓</span>}
        />
        <KpiCard
          title="Awaiting Invoice"
          value={String(kpiData.awaitingInvoice)}
          accentColor="#6366F1"
          iconBg="#EEF2FF"
          iconColor="#6366F1"
          icon={<span className="text-lg">📄</span>}
        />
        <KpiCard
          title="Awaiting Payment"
          value={String(kpiData.awaitingPayment)}
          accentColor="#D97706"
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={<span className="text-lg">⏳</span>}
        />
        <KpiCard
          title="Payment Confirmed"
          value={String(kpiData.paymentConfirmed)}
          accentColor="#059669"
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<span className="text-lg">💳</span>}
        />
        <KpiCard
          title="Ready For Activation"
          value={String(kpiData.readyForActivation)}
          accentColor="#1B4FD8"
          iconBg="#EFF6FF"
          iconColor="#1B4FD8"
          icon={<span className="text-lg">🚀</span>}
        />
        <KpiCard
          title="Active Services"
          value={String(kpiData.activeServices)}
          accentColor="#059669"
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<span className="text-lg">⚡</span>}
        />
        <KpiCard
          title="Cancellation Requests"
          value={String(kpiData.cancellationRequests)}
          accentColor="#DC2626"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          icon={<span className="text-lg">⚠️</span>}
        />
        <KpiCard
          title="Renewal Billing Required"
          value={String(kpiData.renewalBillingRequired)}
          accentColor="#D97706"
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={<span className="text-lg">🔁</span>}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CLIENT PORTFOLIO TABLE
      ══════════════════════════════════════════════════════════════════════ */}
      <SectionWrapper
        title="Client Portfolio Table"
        description="Click a row to open the Client Detail Workspace"
      >
        <div
          className="overflow-x-auto rounded-lg border"
          style={{ borderColor: "var(--rtm-border-light)" }}
        >
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Lifecycle Status</Th>
                <Th>Sales Status</Th>
                <Th>Invoice Status</Th>
                <Th>Payment Status</Th>
                <Th>Activation Status</Th>
                <Th>AM Status</Th>
                <Th>Onboarding Status</Th>
                <Th>Renewal Status</Th>
                <Th>Billing Risk</Th>
                <Th>Billing Owner</Th>
                <Th>Next Action</Th>
              </tr>
            </thead>
            <tbody>
              {clientPortfolioRows.map((row) => {
                const isSelected = selected?.id === row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelected(isSelected ? null : row)}
                    className="cursor-pointer transition-colors"
                    style={{
                      background: isSelected
                        ? "#EFF6FF"
                        : "var(--rtm-bg)",
                    }}
                  >
                    <Td>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {row.client}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={row.lifecycleVariant}
                        label={row.lifecycleStatus}
                        size="sm"
                      />
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={row.salesVariant}
                        label={row.salesStatus}
                        size="sm"
                      />
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={row.invoiceVariant}
                        label={row.invoiceStatus}
                        size="sm"
                      />
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={row.paymentVariant}
                        label={row.paymentStatus}
                        size="sm"
                      />
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={row.activationVariant}
                        label={row.activationStatus}
                        size="sm"
                      />
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={row.amVariant}
                        label={row.amStatus}
                        size="sm"
                      />
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={row.onboardingVariant}
                        label={row.onboardingStatus}
                        size="sm"
                      />
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={row.renewalVariant}
                        label={row.renewalStatus}
                        size="sm"
                      />
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={row.billingRiskVariant}
                        label={row.billingRisk}
                        size="sm"
                      />
                    </Td>
                    <Td muted>{row.billingOwner}</Td>
                    <Td muted>
                      <span className="block max-w-[160px] whitespace-normal leading-tight text-xs">
                        {row.nextAction}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════════════════════════════════════
          CLIENT DETAIL WORKSPACE
      ══════════════════════════════════════════════════════════════════════ */}
      {selected && (
        <div
          className="rounded-xl border p-6 space-y-6"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
          }}
        >
          {/* Panel header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: workspace.accentColor }}
              >
                Client Detail Workspace
              </p>
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {selected.client}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                Billing Owner: {selected.billingOwner} · Next:{" "}
                {selected.nextAction}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border flex-shrink-0"
              style={{
                color: "var(--rtm-text-muted)",
                borderColor: "var(--rtm-border)",
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* ── Client Information ── */}
          <div
            className="rounded-xl border p-5"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border-light)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-4"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Client Information
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoRow label="Client Name"       value={selected.client} />
              <InfoRow label="Contract Value"    value={selected.contractValue} />
              <InfoRow label="Monthly Value"     value={selected.monthlyValue} />
              <InfoRow label="Setup Fee"         value={selected.setupFee} />
              <InfoRow label="Services Purchased" value={selected.servicesPurchased} />
              <InfoRow label="Contract Start"    value={selected.contractStart} />
              <InfoRow label="Contract End"      value={selected.contractEnd} />
              <InfoRow label="Renewal Date"      value={selected.renewalDate} />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              CLIENT LIFECYCLE TIMELINE
          ══════════════════════════════════════════════════════════════════ */}
          <div
            className="rounded-xl border p-5"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border-light)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-1"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Client Lifecycle Timeline
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--rtm-text-muted)" }}>
              Current Stage:{" "}
              <span
                className="font-semibold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {selected.lifecycleStatus}
              </span>{" "}
              · Owner Module:{" "}
              <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                {selected.currentDepartment}
              </span>{" "}
              · Next Action:{" "}
              <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                {selected.nextAction}
              </span>
            </p>

            {/* Timeline scroll */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-0 min-w-max">
                {LIFECYCLE_STAGES.map((stage, idx) => {
                  const isPast    = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  const isFuture  = idx > currentStageIndex;

                  const dotColor = isCurrent
                    ? "#1B4FD8"
                    : isPast
                    ? "#059669"
                    : "var(--rtm-border)";
                  const labelColor = isCurrent
                    ? "var(--rtm-text-primary)"
                    : isPast
                    ? "#059669"
                    : "var(--rtm-text-muted)";
                  const lineColor = isPast ? "#059669" : "var(--rtm-border-light)";

                  return (
                    <React.Fragment key={stage.key}>
                      <div className="flex flex-col items-center gap-1">
                        {/* Dot */}
                        <div
                          className="w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors"
                          style={{
                            background: isCurrent ? dotColor : isPast ? dotColor : "var(--rtm-bg)",
                            borderColor: dotColor,
                          }}
                        />
                        {/* Label */}
                        <span
                          className={`text-[10px] font-semibold text-center max-w-[72px] leading-tight ${isCurrent ? "font-bold" : ""}`}
                          style={{ color: labelColor, minWidth: 56 }}
                        >
                          {stage.label}
                        </span>
                      </div>
                      {/* Connector */}
                      {idx < LIFECYCLE_STAGES.length - 1 && (
                        <div
                          className="h-0.5 w-6 flex-shrink-0 mt-[-14px]"
                          style={{ background: lineColor }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              BILLING ACTION CENTER
          ══════════════════════════════════════════════════════════════════ */}
          <div
            className="rounded-xl border p-5"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border-light)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Billing Action Center
            </p>
            <div className="flex flex-wrap gap-2">
              <ActionBtn
                variant="secondary"
                label="Open Invoice"
                onClick={() => log(`Opening invoice for ${selected.client}`)}
              />
              <ActionBtn
                variant="primary"
                label="Generate Invoice"
                onClick={() => log(`Generating invoice for ${selected.client}`)}
              />
              <ActionBtn
                variant="secondary"
                label="Record Payment"
                onClick={() => log(`Recording payment for ${selected.client}`)}
              />
              <ActionBtn
                variant="primary"
                label="Confirm Payment"
                onClick={() => log(`Confirming payment for ${selected.client}`)}
              />
              <ActionBtn
                variant="primary"
                label="Approve Activation"
                onClick={() => log(`Approving activation for ${selected.client}`)}
              />
              <ActionBtn
                variant="secondary"
                label="Send To Account Management"
                onClick={() => log(`Sending ${selected.client} to Account Management`)}
              />
              <ActionBtn
                variant="secondary"
                label="Create Billing Task"
                onClick={() => log(`Billing task created for ${selected.client}`)}
              />
              <ActionBtn
                variant="danger"
                label="Start Cancellation"
                onClick={() => log(`Cancellation started for ${selected.client}`)}
              />
              <ActionBtn
                variant="secondary"
                label="Create Renewal Billing Task"
                onClick={() => log(`Renewal billing task created for ${selected.client}`)}
              />
              <ActionBtn
                variant="danger"
                label="Flag Billing Issue"
                onClick={() => log(`Billing issue flagged for ${selected.client}`)}
              />
            </div>

            {/* Action log */}
            {actionLog.length > 0 && (
              <div
                className="rounded-lg border mt-4 p-3"
                style={{
                  background: "var(--rtm-surface)",
                  borderColor: "var(--rtm-border-light)",
                }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  Action Log
                </p>
                <div className="space-y-1">
                  {actionLog.map((entry, i) => (
                    <p
                      key={i}
                      className="text-xs font-mono"
                      style={{ color: "var(--rtm-text-secondary)" }}
                    >
                      {entry}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              CLIENT ISSUE CENTER
          ══════════════════════════════════════════════════════════════════ */}
          <div
            className="rounded-xl border p-5"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border-light)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Client Issue Center
            </p>
            {selected.issues.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                No active issues.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {selected.issues.map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                    style={{
                      background: "var(--rtm-surface)",
                      borderColor: "var(--rtm-border)",
                    }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {issue.type}
                    </span>
                    <StatusBadge
                      variant={issueStatusVariant[issue.status] ?? "neutral"}
                      label={issue.status}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Issue type legend */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--rtm-border-light)" }}>
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Issue Types
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Missing Payment",
                  "Failed Payment",
                  "Contract Issue",
                  "Billing Dispute",
                  "Cancellation Request",
                  "Renewal Issue",
                  "Activation Delay",
                ].map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-1 rounded border"
                    style={{
                      color: "var(--rtm-text-muted)",
                      borderColor: "var(--rtm-border-light)",
                      background: "var(--rtm-surface)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              CROSS MODULE VISIBILITY
          ══════════════════════════════════════════════════════════════════ */}
          <div
            className="rounded-xl border p-5"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border-light)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-1"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Cross Module Visibility
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--rtm-text-muted)" }}>
              Read-only status across all departments
            </p>

            {/* Module status row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { module: "Sales",              status: selected.salesStatus,    variant: selected.salesVariant },
                { module: "Billing",            status: selected.invoiceStatus,  variant: selected.invoiceVariant },
                { module: "Account Management", status: selected.amStatus,       variant: selected.amVariant },
                { module: "Renewals",           status: selected.renewalStatus,  variant: selected.renewalVariant },
              ].map((m) => (
                <div
                  key={m.module}
                  className="rounded-lg border p-3 flex flex-col gap-2"
                  style={{
                    background: "var(--rtm-surface)",
                    borderColor: "var(--rtm-border)",
                  }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {m.module}
                  </span>
                  <StatusBadge variant={m.variant} label={m.status} size="sm" />
                </div>
              ))}
            </div>

            {/* Read-only ownership fields */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <InfoRow label="Sales Owner"            value={selected.salesOwner} />
              <InfoRow label="AM Owner"               value={selected.amOwner} />
              <InfoRow label="Renewal Owner"          value={selected.renewalOwner} />
              <InfoRow label="Current Department"     value={selected.currentDepartment} />
              <InfoRow label="Current Workflow Stage" value={selected.currentWorkflowStage} />
            </div>
          </div>
        </div>
      )}

      {/* ── Footer nav ──────────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <Link
          href={workspace.dashboardRoute}
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1"
        >
          ← Dashboard
        </Link>
        <Link
          href="/billing/invoices"
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1"
        >
          Invoices →
        </Link>
        <Link
          href={workspace.tasksRoute}
          className="rtm-btn-primary text-sm inline-flex items-center gap-1"
        >
          Tasks →
        </Link>
      </div>
    </div>
  );
}
