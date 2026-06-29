"use client";

import React, { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("sales")!;

//  Types 

type DateRange = "month"| "quarter"| "year";

//  Mock Data 

// Sales Reps
const SALES_REPS = [
  {
    id: "rep-001",
    name: "Sarah K.",
    assignedLeads: 42,
    openOpportunities: 11,
    proposalsSent: 8,
    closedWon: 6,
    closedLost: 2,
    winRate: 75,
    pipelineValue: 48200,
    weightedRevenue: 32500,
    avgResponseTime: "2.4h",
    followUpCompletionRate: 88,
  },
  {
    id: "rep-002",
    name: "Jordan M.",
    assignedLeads: 38,
    openOpportunities: 9,
    proposalsSent: 7,
    closedWon: 5,
    closedLost: 3,
    winRate: 62,
    pipelineValue: 41600,
    weightedRevenue: 28100,
    avgResponseTime: "3.1h",
    followUpCompletionRate: 79,
  },
  {
    id: "rep-003",
    name: "Mike T.",
    assignedLeads: 35,
    openOpportunities: 10,
    proposalsSent: 6,
    closedWon: 4,
    closedLost: 2,
    winRate: 67,
    pipelineValue: 38900,
    weightedRevenue: 25800,
    avgResponseTime: "1.8h",
    followUpCompletionRate: 93,
  },
  {
    id: "rep-004",
    name: "Alex R.",
    assignedLeads: 31,
    openOpportunities: 8,
    proposalsSent: 5,
    closedWon: 3,
    closedLost: 4,
    winRate: 43,
    pipelineValue: 29400,
    weightedRevenue: 18600,
    avgResponseTime: "4.2h",
    followUpCompletionRate: 71,
  },
];

// Lead Sources
const LEAD_SOURCES = [
  { source: "Google Ads",  ghlContacts: 52, qualifiedLeads: 34, oppsCreated: 22, proposalsSent: 14, closedWon: 9,  revenueGenerated: 38400, costPerLead: 110, costPerAcquisition: 635,  conversionRate: 17 },
  { source: "LSA",         ghlContacts: 38, qualifiedLeads: 28, oppsCreated: 18, proposalsSent: 11, closedWon: 8,  revenueGenerated: 33200, costPerLead: 85,  costPerAcquisition: 403,  conversionRate: 21 },
  { source: "Website",     ghlContacts: 44, qualifiedLeads: 31, oppsCreated: 20, proposalsSent: 12, closedWon: 7,  revenueGenerated: 29800, costPerLead: 0,   costPerAcquisition: 0,    conversionRate: 16 },
  { source: "Referral",    ghlContacts: 19, qualifiedLeads: 17, oppsCreated: 15, proposalsSent: 12, closedWon: 10, revenueGenerated: 46500, costPerLead: 0,   costPerAcquisition: 0,    conversionRate: 53 },
  { source: "Affiliate",   ghlContacts: 28, qualifiedLeads: 22, oppsCreated: 18, proposalsSent: 13, closedWon: 9,  revenueGenerated: 41200, costPerLead: 0,   costPerAcquisition: 0,    conversionRate: 32 },
  { source: "Meta Ads",    ghlContacts: 41, qualifiedLeads: 24, oppsCreated: 15, proposalsSent: 8,  closedWon: 4,  revenueGenerated: 16800, costPerLead: 95,  costPerAcquisition: 977,  conversionRate: 10 },
  { source: "GBP",         ghlContacts: 22, qualifiedLeads: 16, oppsCreated: 10, proposalsSent: 6,  closedWon: 4,  revenueGenerated: 14400, costPerLead: 0,   costPerAcquisition: 0,    conversionRate: 18 },
  { source: "Partner",     ghlContacts: 14, qualifiedLeads: 12, oppsCreated: 10, proposalsSent: 8,  closedWon: 5,  revenueGenerated: 23500, costPerLead: 0,   costPerAcquisition: 0,    conversionRate: 36 },
  { source: "Outbound",    ghlContacts: 55, qualifiedLeads: 18, oppsCreated: 10, proposalsSent: 5,  closedWon: 2,  revenueGenerated: 7800,  costPerLead: 45,  costPerAcquisition: 1237, conversionRate: 4  },
  { source: "Direct",      ghlContacts: 17, qualifiedLeads: 14, oppsCreated: 11, proposalsSent: 7,  closedWon: 5,  revenueGenerated: 22800, costPerLead: 0,   costPerAcquisition: 0,    conversionRate: 29 },
];

// GHL Pipeline Stages
const GHL_PIPELINE_STAGES = [
  { ghlStage: "New Lead",           rtmStage: "Lead",             oppCount: 18, pipelineValue: 42000, weightedRevenue: 6300,  avgDaysInStage: 2.1,  conversionRate: 61, dropOffRate: 39 },
  { ghlStage: "Appointment Booked", rtmStage: "Discovery",        oppCount: 12, pipelineValue: 34800, weightedRevenue: 12900, avgDaysInStage: 3.8,  conversionRate: 72, dropOffRate: 28 },
  { ghlStage: "Qualified",          rtmStage: "Qualified",        oppCount: 9,  pipelineValue: 28100, weightedRevenue: 12700, avgDaysInStage: 5.2,  conversionRate: 78, dropOffRate: 22 },
  { ghlStage: "Audit Requested",    rtmStage: "Audit Requested",  oppCount: 7,  pipelineValue: 21600, weightedRevenue: 11800, avgDaysInStage: 4.6,  conversionRate: 81, dropOffRate: 19 },
  { ghlStage: "Proposal Sent",      rtmStage: "Proposal Sent",    oppCount: 6,  pipelineValue: 19200, weightedRevenue: 13400, avgDaysInStage: 7.3,  conversionRate: 67, dropOffRate: 33 },
  { ghlStage: "Negotiation",        rtmStage: "Negotiation",      oppCount: 4,  pipelineValue: 11800, weightedRevenue: 8500,  avgDaysInStage: 6.1,  conversionRate: 88, dropOffRate: 12 },
  { ghlStage: "Won",                rtmStage: "Proposal Approved",oppCount: 5,  pipelineValue: 17200, weightedRevenue: 15800, avgDaysInStage: 1.4,  conversionRate: 100, dropOffRate: 0 },
  { ghlStage: "Lost",               rtmStage: "Closed Lost",      oppCount: 7,  pipelineValue: 0,     weightedRevenue: 0,     avgDaysInStage: 0,    conversionRate: 0,  dropOffRate: 100 },
];

// Proposal Performance
const PROPOSAL_STAGES = [
  { stage: "Draft",                 count: 7,  value: 22400, approvedValue: 0,     rejectedValue: 0,     approvalRate: 0,   avgTimeToApproval: "—"},
  { stage: "Internal Review",       count: 3,  value: 9600,  approvedValue: 0,     rejectedValue: 0,     approvalRate: 0,   avgTimeToApproval: "—"},
  { stage: "Sent",                  count: 8,  value: 28200, approvedValue: 0,     rejectedValue: 0,     approvalRate: 0,   avgTimeToApproval: "—"},
  { stage: "Viewed",                count: 5,  value: 17800, approvedValue: 0,     rejectedValue: 0,     approvalRate: 0,   avgTimeToApproval: "3.2 days"},
  { stage: "Negotiation",           count: 4,  value: 14600, approvedValue: 0,     rejectedValue: 0,     approvalRate: 0,   avgTimeToApproval: "5.8 days"},
  { stage: "Approved",              count: 9,  value: 42100, approvedValue: 42100, rejectedValue: 0,     approvalRate: 100, avgTimeToApproval: "6.1 days"},
  { stage: "Rejected",              count: 5,  value: 16300, approvedValue: 0,     rejectedValue: 16300, approvalRate: 0,   avgTimeToApproval: "—"},
  { stage: "Pushed to Handoff",     count: 6,  value: 23800, approvedValue: 23800, rejectedValue: 0,     approvalRate: 100, avgTimeToApproval: "4.4 days"},
];

// Handoff Performance
const HANDOFF_STAGES = [
  { stage: "Proposal Approved", count: 9, revenue: 42100, avgDays: 1.2, blocked: 0, invoiceCreated: 6, invoicePaid: 4, readyForActivation: 3 },
  { stage: "Billing Requested", count: 7, revenue: 31400, avgDays: 2.1, blocked: 1, invoiceCreated: 5, invoicePaid: 3, readyForActivation: 2 },
  { stage: "Invoice Created",   count: 6, revenue: 26800, avgDays: 3.4, blocked: 1, invoiceCreated: 6, invoicePaid: 3, readyForActivation: 2 },
  { stage: "Invoice Sent",      count: 5, revenue: 22100, avgDays: 4.8, blocked: 0, invoiceCreated: 5, invoicePaid: 2, readyForActivation: 2 },
  { stage: "Invoice Paid",      count: 4, revenue: 18600, avgDays: 1.1, blocked: 0, invoiceCreated: 4, invoicePaid: 4, readyForActivation: 4 },
  { stage: "Ready for Activation", count: 3, revenue: 14200, avgDays: 0.8, blocked: 0, invoiceCreated: 3, invoicePaid: 3, readyForActivation: 3 },
  { stage: "Blocked",           count: 2, revenue: 8400, avgDays: 8.2, blocked: 2, invoiceCreated: 1, invoicePaid: 0, readyForActivation: 0 },
];

// Affiliates
const AFFILIATES = [
  { name: "Brandon Ellis",     referralLeads: 14, qualifiedLeads: 12, opportunities: 10, closedWon: 8, revenueGenerated: 36200, commissionPending: 1820, commissionPaid: 5400, conversionRate: 57 },
  { name: "Maria Santos",      referralLeads: 12, qualifiedLeads: 10, opportunities: 8,  closedWon: 6, revenueGenerated: 28400, commissionPending: 700,  commissionPaid: 4200, conversionRate: 50 },
  { name: "Lisa Park",         referralLeads: 10, qualifiedLeads: 9,  opportunities: 7,  closedWon: 5, revenueGenerated: 22600, commissionPending: 380,  commissionPaid: 3400, conversionRate: 50 },
  { name: "Tyler Nguyen",      referralLeads: 8,  qualifiedLeads: 6,  opportunities: 5,  closedWon: 3, revenueGenerated: 12800, commissionPending: 150,  commissionPaid: 1800, conversionRate: 38 },
  { name: "Carlos Reyes",      referralLeads: 7,  qualifiedLeads: 5,  opportunities: 4,  closedWon: 2, revenueGenerated: 7400,  commissionPending: 200,  commissionPaid: 600,  conversionRate: 29 },
  { name: "MedRef Alliance",   referralLeads: 6,  qualifiedLeads: 5,  opportunities: 4,  closedWon: 3, revenueGenerated: 19800, commissionPending: 550,  commissionPaid: 2400, conversionRate: 50 },
  { name: "HealthRef Network", referralLeads: 5,  qualifiedLeads: 4,  opportunities: 3,  closedWon: 2, revenueGenerated: 8600,  commissionPending: 250,  commissionPaid: 900,  conversionRate: 40 },
  { name: "LegalConnect",      referralLeads: 4,  qualifiedLeads: 3,  opportunities: 2,  closedWon: 1, revenueGenerated: 4100,  commissionPending: 300,  commissionPaid: 300,  conversionRate: 25 },
];

// Follow-Up Performance
const FOLLOWUP_PERFORMANCE = [
  { rep: "Sarah K.",   dueFollowUps: 18, completedFollowUps: 16, overdueFollowUps: 2,  completionRate: 89, avgResponseTime: "2.4h", stalledRecovered: 3 },
  { rep: "Jordan M.",  dueFollowUps: 15, completedFollowUps: 12, overdueFollowUps: 3,  completionRate: 80, avgResponseTime: "3.1h", stalledRecovered: 2 },
  { rep: "Mike T.",    dueFollowUps: 14, completedFollowUps: 13, overdueFollowUps: 1,  completionRate: 93, avgResponseTime: "1.8h", stalledRecovered: 4 },
  { rep: "Alex R.",    dueFollowUps: 12, completedFollowUps: 9,  overdueFollowUps: 3,  completionRate: 75, avgResponseTime: "4.2h", stalledRecovered: 1 },
];

// Conversion Funnel
const CONVERSION_FUNNEL = [
  { stage: "GHL Contacts",        count: 330, conversionRate: 100, revenueValue: null },
  { stage: "Qualified Leads",     count: 183, conversionRate: 55,  revenueValue: null },
  { stage: "Opportunities Created", count: 128, conversionRate: 70, revenueValue: 386400 },
  { stage: "Audits Completed",    count: 84,  conversionRate: 66,  revenueValue: 268800 },
  { stage: "Proposals Sent",      count: 61,  conversionRate: 73,  revenueValue: 213200 },
  { stage: "Proposals Approved",  count: 40,  conversionRate: 66,  revenueValue: 162400 },
  { stage: "Sales Handoff",       count: 34,  conversionRate: 85,  revenueValue: 141800 },
  { stage: "Invoice Paid",        count: 26,  conversionRate: 76,  revenueValue: 112600 },
  { stage: "Activated Client",    count: 21,  conversionRate: 81,  revenueValue: 94800 },
];

// Revenue by Service
const REVENUE_BY_SERVICE = [
  { service: "SEO",       dealsSold: 38, monthlyRevenue: 128400, setupFees: 19000, avgDealValue: 3379, upsellPotential: 42000 },
  { service: "GBP",       dealsSold: 24, monthlyRevenue: 48000,  setupFees: 9600,  avgDealValue: 2000, upsellPotential: 18000 },
  { service: "PPC",       dealsSold: 16, monthlyRevenue: 64000,  setupFees: 8000,  avgDealValue: 4000, upsellPotential: 28000 },
  { service: "Meta Ads",  dealsSold: 11, monthlyRevenue: 38500,  setupFees: 5500,  avgDealValue: 3500, upsellPotential: 15000 },
  { service: "LSA",       dealsSold: 9,  monthlyRevenue: 27000,  setupFees: 4500,  avgDealValue: 3000, upsellPotential: 12000 },
  { service: "Reporting", dealsSold: 28, monthlyRevenue: 22400,  setupFees: 2800,  avgDealValue: 800,  upsellPotential: 8000  },
  { service: "Web",       dealsSold: 7,  monthlyRevenue: 7000,   setupFees: 21000, avgDealValue: 1000, upsellPotential: 14000 },
  { service: "Creative",  dealsSold: 5,  monthlyRevenue: 10000,  setupFees: 5000,  avgDealValue: 2000, upsellPotential: 8000  },
];

// GHL Sync Health
const GHL_SYNC_HEALTH = {
  lastSyncDate: "Jan 11, 2025 09:14 AM",
  contactsSynced: 330,
  opportunitiesSynced: 122,
  activitiesSynced: 1840,
  syncFailed: 5,
  manualOverrides: 4,
  dataQualityIssues: 8,
};

// Task Examples
const TASK_EXAMPLES = [
  { id: "t1", title: "Sales report review",   dueDate: "Jan 12, 2025", owner: "Jordan M.", status: "Open"},
  { id: "t2", title: "Follow-up overdue",     dueDate: "Jan 11, 2025", owner: "Alex R.",   status: "Overdue"},
  { id: "t3", title: "Proposal needs review", dueDate: "Jan 13, 2025", owner: "Sarah K.",  status: "Open"},
  { id: "t4", title: "Handoff blocked",       dueDate: "Jan 11, 2025", owner: "Mike T.",   status: "Overdue"},
  { id: "t5", title: "Commission review",     dueDate: "Jan 15, 2025", owner: "Jordan M.", status: "Open"},
];

// Notification Examples
const NOTIFICATION_EXAMPLES = [
  { id: "n1", type: "Risk",       message: "Forecast risk: Q1 weighted revenue down 8% vs target.",   date: "Jan 11, 2025", read: false },
  { id: "n2", type: "Alert",      message: "Win rate drop: Alex R. 43% — below 50% threshold.",        date: "Jan 10, 2025", read: false },
  { id: "n3", type: "Blocked",    message: "Handoff blocked: 2 deals stuck in Blocked stage.",         date: "Jan 11, 2025", read: false },
  { id: "n4", type: "Sync",       message: "GHL sync failed: 5 opportunities failed last sync.",       date: "Jan 11, 2025", read: true },
  { id: "n5", type: "Commission", message: "Affiliate payout due: $3,250 pending across 6 affiliates.", date: "Jan 10, 2025", read: true },
];

//  Helpers 

function fmt$(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;
}

function fmtFull$(n: number): string {
  return `$${n.toLocaleString()}`;
}

function winRateColor(rate: number): string {
  if (rate >= 70) return "#059669";
  if (rate >= 50) return "#D97706";
  return "#DC2626";
}

function statusColor(status: string): "green"| "yellow"| "red"| "blue"| "gray"{
  if (["Open", "Synced", "Active", "Completed", "Approved", "Paid", "Live"].includes(status)) return "green";
  if (["Pending Sync", "Pending", "Manual Override", "Drafted", "In Progress"].includes(status)) return "yellow";
  if (["Sync Failed", "Overdue", "Blocked", "Rejected", "Not Connected"].includes(status)) return "red";
  if (["Sent", "Viewed"].includes(status)) return "blue";
  return "gray";
}

//  Sub-Components 

function ActionBar() {
  const actions = [
    { label: "Sync GHL Data",     icon: "", primary: true  },
    { label: "Export Report",     icon: "", primary: false },
    { label: "Revenue Forecast",  icon: "", primary: false },
    { label: "Sales Rep Report",  icon: "", primary: false },
    { label: "Lead Source Report",icon: "", primary: false },
    { label: "Affiliate Report",  icon: "", primary: false },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <button
          key={a.label}
          className={a.primary ? "rtm-btn-primary text-sm inline-flex items-center gap-1.5": "rtm-btn-secondary text-sm inline-flex items-center gap-1.5"}
        >
          <span>{a.icon}</span>
          {a.label}
        </button>
      ))}
    </div>
  );
}

function ForecastCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-1"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)"}}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
      <p className="text-2xl font-bold tracking-tight"style={{ color }}>{value}</p>
      {sub && <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-base font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>{title}</h2>
      {description && <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{description}</p>}
    </div>
  );
}

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border"style={{ borderColor: "var(--rtm-border)"}}>
      <table className="w-full text-sm"style={{ borderCollapse: "collapse"}}>
        {children}
      </table>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap ${right ? "text-right": "text-left"}`}
      style={{ color: "var(--rtm-text-muted)", background: "var(--rtm-surface-alt, var(--rtm-surface))", borderBottom: "1px solid var(--rtm-border)"}}
    >
      {children}
    </th>
  );
}

function Td({ children, right, muted }: { children: React.ReactNode; right?: boolean; muted?: boolean }) {
  return (
    <td
      className={`px-3 py-2.5 whitespace-nowrap ${right ? "text-right": ""}`}
      style={{ color: muted ? "var(--rtm-text-muted)": "var(--rtm-text-primary)", borderBottom: "1px solid var(--rtm-border)"}}
    >
      {children}
    </td>
  );
}

function WinRateBadge({ rate }: { rate: number }) {
  const color = winRateColor(rate);
  const bg = rate >= 70 ? "#ECFDF5": rate >= 50 ? "#FFFBEB": "#FEF2F2";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"style={{ color, background: bg }}
    >
      {rate}%
    </span>
  );
}

//  Page 

export default function SalesPerformancePage() {
  const [dateRange, setDateRange] = useState<DateRange>("month");

  // Computed KPI aggregates from mock data
  const totalClosedWon = SALES_REPS.reduce((s, r) => s + r.closedWon, 0);
  const totalClosedLost = SALES_REPS.reduce((s, r) => s + r.closedLost, 0);
  const totalPipelineValue = SALES_REPS.reduce((s, r) => s + r.pipelineValue, 0);
  const totalWeighted = SALES_REPS.reduce((s, r) => s + r.weightedRevenue, 0);
  const overallWinRate = Math.round((totalClosedWon / (totalClosedWon + totalClosedLost)) * 100);
  const closedWonRevenue = REVENUE_BY_SERVICE.reduce((s, r) => s + r.monthlyRevenue, 0);

  return (
    <div className="space-y-8 pb-10">
      {/*  Header  */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>
          Sales
        </p>
        <h1 className="text-2xl font-medium tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
          Performance
        </h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-muted)"}}>
          Track sales KPIs, rep performance, lead source conversion, affiliate contribution, and revenue forecasting.
        </p>
      </div>

      {/*  Top Action Bar  */}
      <ActionBar />

      {/*  Date Range Toggle  */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>Period:</span>
        {(["month", "quarter", "year"] as DateRange[]).map((r) => (
          <button
            key={r}
            onClick={() => setDateRange(r)}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"style={{
              background: dateRange === r ? workspace.accentColor : "var(--rtm-surface)",
              color: dateRange === r ? "#fff": "var(--rtm-text-secondary)",
              border: `1px solid ${dateRange === r ? workspace.accentColor : "var(--rtm-border)"}`,
            }}
          >
            {r === "month"? "This Month": r === "quarter"? "This Quarter": "This Year"}
          </button>
        ))}
      </div>

      {/*  KPI Cards  */}
      <div>
        <SectionHeader title="Key Performance Indicators"/>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            title="GHL Contacts Synced"value={GHL_SYNC_HEALTH.contactsSynced.toString()}
            trend="up"trendValue="14%"iconBg="#EFF6FF"iconColor="#2563EB"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>}
          />
          <KpiCard
            title="Open Opportunities"value="38"trend="up"trendValue="6"iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
          />
          <KpiCard
            title="Pipeline Value"value={fmt$(totalPipelineValue)}
            trend="up"trendValue="9%"iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
          />
          <KpiCard
            title="Weighted Forecast"value={fmt$(totalWeighted)}
            trend="up"trendValue="7%"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
          />
          <KpiCard
            title="Closed Won Revenue"value={fmt$(closedWonRevenue)}
            trend="up"trendValue="18%"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <KpiCard
            title="Closed Lost Revenue"value={fmt$(totalClosedLost * 2100)}
            trend="down"trendValue="3%"iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <KpiCard
            title="Win Rate"value={`${overallWinRate}%`}
            trend="up"trendValue="4%"iconBg="#F0FDF4"iconColor="#16A34A"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>}
          />
          <KpiCard
            title="Avg Sales Cycle"value="42 days"trend="down"trendValue="3 days"iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
        </div>
      </div>

      {/*  Revenue Forecasting  */}
      <div>
        <SectionHeader
          title="Revenue Forecasting"description="Forecast based on GHL Opportunities, Proposal Value, Negotiation Stage, Proposal Approved, and Sales Handoff."/>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <ForecastCard label="Forecast This Month"value="$87.4k"sub="GHL + Proposal pipeline"color="#2563EB"/>
          <ForecastCard label="Forecast This Quarter"value="$248k"sub="Q1 2025 projected"color="#7C3AED"/>
          <ForecastCard label="Forecast This Year"value="$1.02M"sub="FY 2025 projection"color="#059669"/>
          <ForecastCard label="Weighted Revenue"value={fmt$(totalWeighted)} sub="Probability-adjusted"color="#D97706"/>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <ForecastCard label="Best Case Revenue"value="$124k"sub="All open opps close"color="#059669"/>
          <ForecastCard label="Committed Revenue"value="$62k"sub="Prob. ≥ 80% only"color="#2563EB"/>
          <ForecastCard label="At Risk Revenue"value="$18.4k"sub="Stalled + overdue opps"color="#DC2626"/>
        </div>
      </div>

      {/*  Sales Rep Performance  */}
      <div>
        <SectionHeader
          title="Sales Rep Performance"description="Individual rep metrics across leads, opportunities, proposals, and closed deals."/>
        <TableWrapper>
          <thead>
            <tr>
              <Th>Sales Rep</Th>
              <Th right>Assigned Leads</Th>
              <Th right>Open Opps</Th>
              <Th right>Proposals Sent</Th>
              <Th right>Closed Won</Th>
              <Th right>Closed Lost</Th>
              <Th right>Win Rate</Th>
              <Th right>Pipeline Value</Th>
              <Th right>Weighted Rev</Th>
              <Th right>Avg Response</Th>
              <Th right>Follow-Up Rate</Th>
            </tr>
          </thead>
          <tbody>
            {SALES_REPS.map((rep) => (
              <tr key={rep.id} style={{ background: "var(--rtm-surface)"}}>
                <Td>
                  <span className="font-semibold">{rep.name}</span>
                </Td>
                <Td right>{rep.assignedLeads}</Td>
                <Td right>{rep.openOpportunities}</Td>
                <Td right>{rep.proposalsSent}</Td>
                <Td right>
                  <span style={{ color: "#059669", fontWeight: 600 }}>{rep.closedWon}</span>
                </Td>
                <Td right>
                  <span style={{ color: "#DC2626", fontWeight: 600 }}>{rep.closedLost}</span>
                </Td>
                <Td right><WinRateBadge rate={rep.winRate} /></Td>
                <Td right>{fmt$(rep.pipelineValue)}</Td>
                <Td right>{fmt$(rep.weightedRevenue)}</Td>
                <Td right muted>{rep.avgResponseTime}</Td>
                <Td right><WinRateBadge rate={rep.followUpCompletionRate} /></Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </div>

      {/*  Lead Source Performance  */}
      <div>
        <SectionHeader
          title="Lead Source Performance"description="Conversion and cost metrics across all lead acquisition channels."/>
        <TableWrapper>
          <thead>
            <tr>
              <Th>Lead Source</Th>
              <Th right>GHL Contacts</Th>
              <Th right>Qualified Leads</Th>
              <Th right>Opps Created</Th>
              <Th right>Proposals Sent</Th>
              <Th right>Closed Won</Th>
              <Th right>Revenue</Th>
              <Th right>Cost / Lead</Th>
              <Th right>CPA</Th>
              <Th right>Conv. Rate</Th>
            </tr>
          </thead>
          <tbody>
            {LEAD_SOURCES.map((ls) => (
              <tr key={ls.source} style={{ background: "var(--rtm-surface)"}}>
                <Td>
                  <span className="font-semibold">{ls.source}</span>
                </Td>
                <Td right>{ls.ghlContacts}</Td>
                <Td right>{ls.qualifiedLeads}</Td>
                <Td right>{ls.oppsCreated}</Td>
                <Td right>{ls.proposalsSent}</Td>
                <Td right>
                  <span style={{ color: "#059669", fontWeight: 600 }}>{ls.closedWon}</span>
                </Td>
                <Td right>{fmtFull$(ls.revenueGenerated)}</Td>
                <Td right muted>{ls.costPerLead > 0 ? `$${ls.costPerLead}` : "—"}</Td>
                <Td right muted>{ls.costPerAcquisition > 0 ? fmtFull$(ls.costPerAcquisition) : "—"}</Td>
                <Td right><WinRateBadge rate={ls.conversionRate} /></Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </div>

      {/*  GHL Pipeline Stage Performance  */}
      <div>
        <SectionHeader
          title="GHL Pipeline Stage Performance"description="Opportunity flow, value, and conversion across GHL pipeline stages mapped to RTM OS stages."/>
        <TableWrapper>
          <thead>
            <tr>
              <Th>GHL Stage</Th>
              <Th>RTM OS Stage</Th>
              <Th right>Opp Count</Th>
              <Th right>Pipeline Value</Th>
              <Th right>Weighted Rev</Th>
              <Th right>Avg Days in Stage</Th>
              <Th right>Conv. Rate</Th>
              <Th right>Drop-Off Rate</Th>
            </tr>
          </thead>
          <tbody>
            {GHL_PIPELINE_STAGES.map((stage) => (
              <tr key={stage.ghlStage} style={{ background: "var(--rtm-surface)"}}>
                <Td><span className="font-semibold">{stage.ghlStage}</span></Td>
                <Td muted>{stage.rtmStage}</Td>
                <Td right>{stage.oppCount}</Td>
                <Td right>{stage.pipelineValue > 0 ? fmtFull$(stage.pipelineValue) : "—"}</Td>
                <Td right>{stage.weightedRevenue > 0 ? fmtFull$(stage.weightedRevenue) : "—"}</Td>
                <Td right muted>{stage.avgDaysInStage > 0 ? `${stage.avgDaysInStage}d` : "—"}</Td>
                <Td right>
                  {stage.conversionRate > 0 ? <WinRateBadge rate={stage.conversionRate} /> : <span style={{ color: "var(--rtm-text-muted)"}}>—</span>}
                </Td>
                <Td right>
                  {stage.dropOffRate > 0 ? (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"style={{ color: stage.dropOffRate > 30 ? "#DC2626": "#D97706", background: stage.dropOffRate > 30 ? "#FEF2F2": "#FFFBEB"}}
                    >
                      {stage.dropOffRate}%
                    </span>
                  ) : "—"}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </div>

      {/*  Proposal Performance  */}
      <div>
        <SectionHeader
          title="Proposal Performance"description="Proposal counts, values, and approval rates across all proposal stages."/>
        <TableWrapper>
          <thead>
            <tr>
              <Th>Proposal Stage</Th>
              <Th right>Count</Th>
              <Th right>Proposal Value</Th>
              <Th right>Approved Value</Th>
              <Th right>Rejected Value</Th>
              <Th right>Approval Rate</Th>
              <Th right>Avg Time to Approval</Th>
            </tr>
          </thead>
          <tbody>
            {PROPOSAL_STAGES.map((ps) => (
              <tr key={ps.stage} style={{ background: "var(--rtm-surface)"}}>
                <Td><span className="font-semibold">{ps.stage}</span></Td>
                <Td right>{ps.count}</Td>
                <Td right>{fmtFull$(ps.value)}</Td>
                <Td right>
                  {ps.approvedValue > 0
                    ? <span style={{ color: "#059669", fontWeight: 600 }}>{fmtFull$(ps.approvedValue)}</span>
                    : <span style={{ color: "var(--rtm-text-muted)"}}>—</span>}
                </Td>
                <Td right>
                  {ps.rejectedValue > 0
                    ? <span style={{ color: "#DC2626", fontWeight: 600 }}>{fmtFull$(ps.rejectedValue)}</span>
                    : <span style={{ color: "var(--rtm-text-muted)"}}>—</span>}
                </Td>
                <Td right>
                  {ps.approvalRate > 0
                    ? <WinRateBadge rate={ps.approvalRate} />
                    : <span style={{ color: "var(--rtm-text-muted)"}}>—</span>}
                </Td>
                <Td right muted>{ps.avgTimeToApproval}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </div>

      {/*  Handoff Performance  */}
      <div>
        <SectionHeader
          title="Handoff Performance"description="Revenue and status tracking across all sales handoff stages."/>
        <TableWrapper>
          <thead>
            <tr>
              <Th>Handoff Stage</Th>
              <Th right>Count</Th>
              <Th right>Revenue</Th>
              <Th right>Avg Days</Th>
              <Th right>Blocked</Th>
              <Th right>Invoice Created</Th>
              <Th right>Invoice Paid</Th>
              <Th right>Ready for Activation</Th>
            </tr>
          </thead>
          <tbody>
            {HANDOFF_STAGES.map((hs) => (
              <tr key={hs.stage} style={{ background: "var(--rtm-surface)"}}>
                <Td>
                  <span className="font-semibold">{hs.stage}</span>
                  {hs.stage === "Blocked"&& (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold"style={{ background: "#FEF2F2", color: "#DC2626"}}>
                      BLOCKED
                    </span>
                  )}
                </Td>
                <Td right>{hs.count}</Td>
                <Td right>{fmtFull$(hs.revenue)}</Td>
                <Td right muted>{hs.avgDays > 0 ? `${hs.avgDays}d` : "—"}</Td>
                <Td right>
                  {hs.blocked > 0
                    ? <span style={{ color: "#DC2626", fontWeight: 600 }}>{hs.blocked}</span>
                    : <span style={{ color: "var(--rtm-text-muted)"}}>0</span>}
                </Td>
                <Td right>{hs.invoiceCreated}</Td>
                <Td right>
                  <span style={{ color: hs.invoicePaid > 0 ? "#059669": "var(--rtm-text-muted)", fontWeight: hs.invoicePaid > 0 ? 600 : 400 }}>
                    {hs.invoicePaid}
                  </span>
                </Td>
                <Td right>
                  <span style={{ color: hs.readyForActivation > 0 ? "#2563EB": "var(--rtm-text-muted)", fontWeight: hs.readyForActivation > 0 ? 600 : 400 }}>
                    {hs.readyForActivation}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </div>

      {/*  Affiliate Revenue Performance  */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader
            title="Affiliate Revenue Performance"description="Referral leads, deal conversion, and commission tracking across all affiliates."/>
          <Link
            href="/sales/affiliates"className="text-xs font-semibold inline-flex items-center gap-1"style={{ color: workspace.accentColor }}
          >
            View Affiliates →
          </Link>
        </div>
        <TableWrapper>
          <thead>
            <tr>
              <Th>Affiliate</Th>
              <Th right>Referral Leads</Th>
              <Th right>Qualified Leads</Th>
              <Th right>Opportunities</Th>
              <Th right>Closed Won</Th>
              <Th right>Revenue</Th>
              <Th right>Commission Pending</Th>
              <Th right>Commission Paid</Th>
              <Th right>Conv. Rate</Th>
            </tr>
          </thead>
          <tbody>
            {AFFILIATES.map((aff) => (
              <tr key={aff.name} style={{ background: "var(--rtm-surface)"}}>
                <Td><span className="font-semibold">{aff.name}</span></Td>
                <Td right>{aff.referralLeads}</Td>
                <Td right>{aff.qualifiedLeads}</Td>
                <Td right>{aff.opportunities}</Td>
                <Td right>
                  <span style={{ color: "#059669", fontWeight: 600 }}>{aff.closedWon}</span>
                </Td>
                <Td right>{fmtFull$(aff.revenueGenerated)}</Td>
                <Td right>
                  <span style={{ color: "#D97706", fontWeight: 600 }}>{fmtFull$(aff.commissionPending)}</span>
                </Td>
                <Td right muted>{fmtFull$(aff.commissionPaid)}</Td>
                <Td right><WinRateBadge rate={aff.conversionRate} /></Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </div>

      {/*  Follow-Up Performance  */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader
            title="Follow-Up Performance"description="Follow-up completion rates and response times by sales rep."/>
          <Link
            href="/sales/followups"className="text-xs font-semibold inline-flex items-center gap-1"style={{ color: workspace.accentColor }}
          >
            View Follow-Ups →
          </Link>
        </div>
        <TableWrapper>
          <thead>
            <tr>
              <Th>Sales Rep</Th>
              <Th right>Due Follow-Ups</Th>
              <Th right>Completed</Th>
              <Th right>Overdue</Th>
              <Th right>Completion Rate</Th>
              <Th right>Avg Response Time</Th>
              <Th right>Stalled Opps Recovered</Th>
            </tr>
          </thead>
          <tbody>
            {FOLLOWUP_PERFORMANCE.map((fp) => (
              <tr key={fp.rep} style={{ background: "var(--rtm-surface)"}}>
                <Td><span className="font-semibold">{fp.rep}</span></Td>
                <Td right>{fp.dueFollowUps}</Td>
                <Td right>
                  <span style={{ color: "#059669", fontWeight: 600 }}>{fp.completedFollowUps}</span>
                </Td>
                <Td right>
                  {fp.overdueFollowUps > 0
                    ? <span style={{ color: "#DC2626", fontWeight: 600 }}>{fp.overdueFollowUps}</span>
                    : <span style={{ color: "var(--rtm-text-muted)"}}>0</span>}
                </Td>
                <Td right><WinRateBadge rate={fp.completionRate} /></Td>
                <Td right muted>{fp.avgResponseTime}</Td>
                <Td right>
                  <span style={{ color: fp.stalledRecovered > 0 ? "#2563EB": "var(--rtm-text-muted)", fontWeight: fp.stalledRecovered > 0 ? 600 : 400 }}>
                    {fp.stalledRecovered}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </div>

      {/*  Conversion Funnel  */}
      <div>
        <SectionHeader
          title="Conversion Funnel"description="Full sales funnel from GHL Contacts to Activated Client — count, conversion rate, and revenue value at each stage."/>
        <div
          className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)"}}
        >
          {CONVERSION_FUNNEL.map((step, i) => {
            const maxCount = CONVERSION_FUNNEL[0].count;
            const widthPct = Math.round((step.count / maxCount) * 100);
            const isFirst = i === 0;
            const isLast = i === CONVERSION_FUNNEL.length - 1;
            return (
              <div
                key={step.stage}
                className="flex items-center gap-4 px-5 py-3"style={{ borderBottom: isLast ? "none": "1px solid var(--rtm-border)"}}
              >
                {/* Step number */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"style={{
                    background: isFirst ? workspace.accentColor : isLast ? "#059669": "var(--rtm-surface-alt, #f8fafc)",
                    color: isFirst || isLast ? "#fff": "var(--rtm-text-muted)",
                    border: `1px solid ${isFirst ? workspace.accentColor : isLast ? "#059669": "var(--rtm-border)"}`,
                  }}
                >
                  {i + 1}
                </div>

                {/* Stage name */}
                <div className="w-44 flex-shrink-0">
                  <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{step.stage}</p>
                </div>

                {/* Bar */}
                <div className="flex-1 min-w-0">
                  <div className="w-full rounded-full overflow-hidden"style={{ height: 8, background: "var(--rtm-border)"}}>
                    <div
                      className="h-full rounded-full transition-all"style={{
                        width: `${widthPct}%`,
                        background: isFirst ? workspace.accentColor : isLast ? "#059669": "#2563EB",
                      }}
                    />
                  </div>
                </div>

                {/* Count */}
                <div className="w-16 text-right flex-shrink-0">
                  <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{step.count}</span>
                </div>

                {/* Conversion rate */}
                <div className="w-20 text-right flex-shrink-0">
                  {i > 0 ? (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"style={{
                        background: step.conversionRate >= 70 ? "#ECFDF5": step.conversionRate >= 50 ? "#FFFBEB": "#FEF2F2",
                        color: step.conversionRate >= 70 ? "#059669": step.conversionRate >= 50 ? "#D97706": "#DC2626",
                      }}
                    >
                      {step.conversionRate}%
                    </span>
                  ) : (
                    <span className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>base</span>
                  )}
                </div>

                {/* Revenue value */}
                <div className="w-24 text-right flex-shrink-0">
                  {step.revenueValue != null ? (
                    <span className="text-xs font-semibold"style={{ color: "#059669"}}>
                      {fmt$(step.revenueValue)}
                    </span>
                  ) : (
                    <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/*  Revenue by Service  */}
      <div>
        <SectionHeader
          title="Revenue by Service"description="Monthly revenue, setup fees, average deal value, and upsell potential broken down by service type."/>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {REVENUE_BY_SERVICE.map((svc) => (
            <div
              key={svc.service}
              className="rounded-xl border p-4 space-y-3"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)"}}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{svc.service}</span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"style={{ background: "#EFF6FF", color: "#2563EB"}}
                >
                  {svc.dealsSold} deals
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--rtm-text-muted)"}}>Monthly Revenue</span>
                  <span className="font-semibold"style={{ color: "#059669"}}>{fmtFull$(svc.monthlyRevenue)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--rtm-text-muted)"}}>Setup Fees</span>
                  <span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{fmtFull$(svc.setupFees)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--rtm-text-muted)"}}>Avg Deal Value</span>
                  <span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{fmtFull$(svc.avgDealValue)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--rtm-text-muted)"}}>Upsell Potential</span>
                  <span className="font-semibold"style={{ color: "#D97706"}}>{fmtFull$(svc.upsellPotential)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
