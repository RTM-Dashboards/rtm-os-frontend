"use client";

import React, { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge, DataTable, ProgressBar } from "@/components/ui";
import type { Column } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("sales")!;

// ── Client Lifecycle Engine ───────────────────────────────────────────────────

const LIFECYCLE_STAGES = [
  { stage: "Lead",                   owner: "Sales",              color: "#94A3B8" },
  { stage: "Opportunity",            owner: "Sales",              color: "#2563EB" },
  { stage: "Proposal",               owner: "Sales",              color: "#7C3AED" },
  { stage: "Contract",               owner: "Sales",              color: "#0891B2" },
  { stage: "Closed Won",             owner: "Sales",              color: "#059669" },
  { stage: "Sent To Billing",        owner: "Sales",              color: "#D97706" },
  { stage: "Invoice Sent",           owner: "Billing",            color: "#6366F1" },
  { stage: "Awaiting Payment",       owner: "Billing",            color: "#8B5CF6" },
  { stage: "Payment Confirmed",      owner: "Billing",            color: "#059669" },
  { stage: "Activation Approved",    owner: "Billing",            color: "#0EA5E9" },
  { stage: "Ready For Assignment",   owner: "Billing",            color: "#10B981" },
  { stage: "Assigned",               owner: "Account Management", color: "#3B82F6" },
  { stage: "Onboarding",             owner: "Account Management", color: "#6366F1" },
  { stage: "Service Activation",     owner: "Account Management", color: "#8B5CF6" },
  { stage: "Department Launch",      owner: "Account Management", color: "#A855F7" },
  { stage: "Active",                 owner: "Account Management", color: "#059669" },
  { stage: "Renewal Triggered",      owner: "Account Management", color: "#D97706" },
  { stage: "QBR Scheduled",          owner: "Account Management", color: "#0891B2" },
  { stage: "Renewal Negotiation",    owner: "Account Management", color: "#F59E0B" },
  { stage: "Renewed",                owner: "Account Management", color: "#059669" },
] as const;

const OWNER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Sales":              { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Billing":            { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Account Management": { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
};

function ClientLifecycleEngine({ activeStages }: { activeStages?: string[] }) {
  const active = activeStages ?? [];
  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Client Lifecycle Status Engine</p>
        <div className="flex gap-2">
          {Object.entries(OWNER_COLORS).map(([owner, c]) => (
            <span key={owner} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: c.bg, color: c.text, borderColor: c.border }}>{owner}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {LIFECYCLE_STAGES.map((s, i) => {
          const c = OWNER_COLORS[s.owner];
          const isActive = active.includes(s.stage);
          return (
            <React.Fragment key={s.stage}>
              <div
                className="px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all"
                style={{
                  background: isActive ? s.color : c.bg,
                  color: isActive ? "#fff" : c.text,
                  borderColor: isActive ? s.color : c.border,
                  opacity: active.length === 0 || isActive ? 1 : 0.55,
                }}
              >
                {s.stage}
              </div>
              {i < LIFECYCLE_STAGES.length - 1 && (
                <span className="text-xs" style={{ color: "var(--rtm-border)" }}>→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 pt-1">
        {Object.entries(OWNER_COLORS).map(([owner, c]) => {
          const count = LIFECYCLE_STAGES.filter((s) => s.owner === owner).length;
          return (
            <div key={owner} className="flex items-center gap-1.5 px-3 py-1 rounded-lg border" style={{ background: c.bg, borderColor: c.border }}>
              <span className="text-xs font-bold" style={{ color: c.text }}>{owner}</span>
              <span className="text-[10px]" style={{ color: c.text }}>owns {count} stages</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sales Billing Handoff Checklist ──────────────────────────────────────────

const BILLING_HANDOFF_CHECKLIST = [
  "Proposal accepted",
  "Contract signed",
  "Services sold confirmed",
  "Contract value confirmed",
  "Setup fee confirmed",
  "Billing notes added",
  "Sent to Billing",
];

function BillingHandoffChecklist({ client }: { client?: string }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (item: string) => setChecked((p) => ({ ...p, [item]: !p[item] }));
  const completed = BILLING_HANDOFF_CHECKLIST.filter((i) => checked[i]).length;
  const allDone = completed === BILLING_HANDOFF_CHECKLIST.length;
  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
          Billing Handoff Checklist{client ? ` — ${client}` : ""}
        </p>
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
          style={{
            background: allDone ? "#ECFDF5" : "#FFFBEB",
            color: allDone ? "#065F46" : "#92400E",
            borderColor: allDone ? "#A7F3D0" : "#FDE68A",
          }}
        >
          {completed}/{BILLING_HANDOFF_CHECKLIST.length} complete
        </span>
      </div>
      <div className="space-y-2">
        {BILLING_HANDOFF_CHECKLIST.map((item) => (
          <label key={item} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={!!checked[item]}
              onChange={() => toggle(item)}
              className="w-4 h-4 rounded accent-emerald-600"
            />
            <span
              className="text-sm transition-all"
              style={{ color: checked[item] ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)", textDecoration: checked[item] ? "line-through" : "none" }}
            >
              {item}
            </span>
            {checked[item] && <span className="text-xs text-emerald-600 font-semibold">✓</span>}
          </label>
        ))}
      </div>
      {allDone && (
        <div className="rounded-lg p-3 text-sm font-semibold text-emerald-700" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
          ✅ Ready to send to Billing — all handoff items confirmed.
        </div>
      )}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type OpportunityStage =
  | "New Lead"
  | "Discovery"
  | "Proposal"
  | "Negotiation"
  | "Verbal Agreement"
  | "Closed Won"
  | "Closed Lost";

type ProposalStatus = "Draft" | "Sent" | "Viewed" | "Negotiating" | "Accepted" | "Rejected";

type ContractStatus = "Active" | "Pending" | "Expired" | "Cancelled";

type BillingHandoffStatus =
  | "Ready For Billing"
  | "Sent To Billing"
  | "Billing Accepted"
  | "Awaiting Invoice"
  | "Awaiting Payment";

interface Opportunity extends Record<string, unknown> {
  client: string;
  industry: string;
  leadSource: string;
  services: string;
  estimatedValue: string;
  salesRep: string;
  stage: OpportunityStage;
  probability: number;
  closeDate: string;
}

interface ServicePackage extends Record<string, unknown> {
  package: string;
  includedServices: string;
  monthlyValue: string;
  setupFee: string;
  contractLength: string;
  profitabilityScore: string;
}

interface ProposalRecord extends Record<string, unknown> {
  proposal: string;
  client: string;
  servicesIncluded: string;
  monthlyValue: string;
  setupFee: string;
  contractLength: string;
  status: ProposalStatus;
  sentDate: string;
  expirationDate: string;
}

interface ContractRecord extends Record<string, unknown> {
  client: string;
  contractType: string;
  contractLength: string;
  monthlyValue: string;
  setupFee: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: ContractStatus;
}

interface ClosedWonRecord extends Record<string, unknown> {
  client: string;
  servicesSold: string;
  contractValue: string;
  billingStatus: string;
  handoffStatus: string;
}

interface BillingHandoff extends Record<string, unknown> {
  client: string;
  servicesSold: string;
  contractValue: string;
  proposalStatus: string;
  contractStatus: string;
  billingStatus: BillingHandoffStatus;
  handoffNotes: string;
  nextAction: string;
}

// ── New Phase 2 Types ─────────────────────────────────────────────────────────

interface ProposalBuilder extends Record<string, unknown> {
  proposalName: string;
  client: string;
  opportunity: string;
  salesRep: string;
  proposalDate: string;
  expirationDate: string;
  contractLength: string;
  monthlyValue: string;
  setupFee: string;
  totalContractValue: string;
}

interface ServiceConfig extends Record<string, unknown> {
  service: string;
  included: boolean;
  monthlyFee: string;
  setupFee: string;
  departmentOwner: string;
  profitability: string;
}

interface PackageTemplate extends Record<string, unknown> {
  packageName: string;
  includedServices: string;
  monthlyValue: string;
  setupFee: string;
  contractLength: string;
  profitabilityScore: string;
}

interface SalesActivityEntry extends Record<string, unknown> {
  date: string;
  client: string;
  activity: string;
  owner: string;
  notes: string;
}

interface SalesRepPerformance extends Record<string, unknown> {
  salesRep: string;
  opportunities: number;
  proposalsSent: number;
  closedWon: number;
  closedLost: number;
  conversionRate: string;
  revenueClosed: string;
  forecastRevenue: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const opportunities: Opportunity[] = [
  {
    client: "Summit Landscaping",
    industry: "Home Services",
    leadSource: "Referral",
    services: "SEO, GBP, Reporting",
    estimatedValue: "$2,400/mo",
    salesRep: "Jordan M.",
    stage: "Proposal",
    probability: 75,
    closeDate: "Jun 15, 2025",
  },
  {
    client: "Blue Ridge Plumbing",
    industry: "Home Services",
    leadSource: "Website",
    services: "SEO, GBP",
    estimatedValue: "$1,800/mo",
    salesRep: "Sarah K.",
    stage: "Discovery",
    probability: 40,
    closeDate: "Jun 28, 2025",
  },
  {
    client: "Harbor Auto Group",
    industry: "Automotive",
    leadSource: "Cold Outreach",
    services: "SEO, Google Ads, Website Design",
    estimatedValue: "$5,000/mo",
    salesRep: "Mike T.",
    stage: "Negotiation",
    probability: 85,
    closeDate: "Jun 10, 2025",
  },
  {
    client: "Metro Dental Group",
    industry: "Healthcare",
    leadSource: "Referral",
    services: "SEO, GBP, Yelp, Reporting",
    estimatedValue: "$4,500/mo",
    salesRep: "Jordan M.",
    stage: "Verbal Agreement",
    probability: 90,
    closeDate: "Jun 5, 2025",
  },
  {
    client: "Sunstate Solar",
    industry: "Energy",
    leadSource: "Google Ads",
    services: "Meta Ads, Google Ads, Landing Pages",
    estimatedValue: "$6,000/mo",
    salesRep: "Sarah K.",
    stage: "Closed Won",
    probability: 100,
    closeDate: "May 30, 2025",
  },
  {
    client: "Coastal Realty",
    industry: "Real Estate",
    leadSource: "LinkedIn",
    services: "SEO, Reporting",
    estimatedValue: "$1,200/mo",
    salesRep: "Mike T.",
    stage: "New Lead",
    probability: 20,
    closeDate: "Jul 15, 2025",
  },
  {
    client: "Prestige Roofing",
    industry: "Construction",
    leadSource: "Trade Show",
    services: "Google Ads, Local Service Ads",
    estimatedValue: "$3,200/mo",
    salesRep: "Jordan M.",
    stage: "Closed Lost",
    probability: 0,
    closeDate: "May 20, 2025",
  },
];

const servicePackages: ServicePackage[] = [
  {
    package: "SEO Growth Package",
    includedServices: "SEO, GBP, Reporting",
    monthlyValue: "$1,500/mo",
    setupFee: "$750",
    contractLength: "6 months",
    profitabilityScore: "82%",
  },
  {
    package: "Local Domination Package",
    includedServices: "SEO, GBP, Yelp, Reporting",
    monthlyValue: "$2,200/mo",
    setupFee: "$1,000",
    contractLength: "12 months",
    profitabilityScore: "88%",
  },
  {
    package: "Lead Generation Package",
    includedServices: "Meta Ads, Google Ads, Landing Pages, Reporting",
    monthlyValue: "$3,500/mo",
    setupFee: "$1,500",
    contractLength: "6 months",
    profitabilityScore: "76%",
  },
  {
    package: "Full Service Package",
    includedServices: "SEO, GBP, Meta Ads, Google Ads, Yelp, Reporting",
    monthlyValue: "$5,500/mo",
    setupFee: "$2,500",
    contractLength: "12 months",
    profitabilityScore: "91%",
  },
  {
    package: "Starter Visibility Package",
    includedServices: "GBP, Reporting",
    monthlyValue: "$800/mo",
    setupFee: "$400",
    contractLength: "3 months",
    profitabilityScore: "70%",
  },
];

const proposals: ProposalRecord[] = [
  {
    proposal: "Summit Landscaping – SEO Growth",
    client: "Summit Landscaping",
    servicesIncluded: "SEO, GBP, Reporting",
    monthlyValue: "$2,400/mo",
    setupFee: "$1,000",
    contractLength: "12 months",
    status: "Viewed",
    sentDate: "May 24, 2025",
    expirationDate: "Jun 7, 2025",
  },
  {
    proposal: "Metro Dental – Local Domination",
    client: "Metro Dental Group",
    servicesIncluded: "SEO, GBP, Yelp, Reporting",
    monthlyValue: "$4,500/mo",
    setupFee: "$1,500",
    contractLength: "12 months",
    status: "Negotiating",
    sentDate: "May 20, 2025",
    expirationDate: "Jun 3, 2025",
  },
  {
    proposal: "Harbor Auto – Full Service",
    client: "Harbor Auto Group",
    servicesIncluded: "SEO, Google Ads, Website Design",
    monthlyValue: "$5,000/mo",
    setupFee: "$2,500",
    contractLength: "12 months",
    status: "Sent",
    sentDate: "May 26, 2025",
    expirationDate: "Jun 9, 2025",
  },
  {
    proposal: "Sunstate Solar – Lead Gen",
    client: "Sunstate Solar",
    servicesIncluded: "Meta Ads, Google Ads, Landing Pages, Reporting",
    monthlyValue: "$6,000/mo",
    setupFee: "$2,000",
    contractLength: "6 months",
    status: "Accepted",
    sentDate: "May 15, 2025",
    expirationDate: "May 29, 2025",
  },
  {
    proposal: "Coastal Realty – SEO Growth",
    client: "Coastal Realty",
    servicesIncluded: "SEO, Reporting",
    monthlyValue: "$1,200/mo",
    setupFee: "$500",
    contractLength: "6 months",
    status: "Draft",
    sentDate: "—",
    expirationDate: "—",
  },
  {
    proposal: "Prestige Roofing – Lead Gen",
    client: "Prestige Roofing",
    servicesIncluded: "Google Ads, Local Service Ads",
    monthlyValue: "$3,200/mo",
    setupFee: "$1,200",
    contractLength: "6 months",
    status: "Rejected",
    sentDate: "May 10, 2025",
    expirationDate: "May 24, 2025",
  },
];

const contracts: ContractRecord[] = [
  {
    client: "Sunstate Solar",
    contractType: "Lead Generation",
    contractLength: "6 months",
    monthlyValue: "$6,000/mo",
    setupFee: "$2,000",
    startDate: "Jun 1, 2025",
    endDate: "Nov 30, 2025",
    renewalDate: "Nov 15, 2025",
    status: "Active",
  },
  {
    client: "Harbor Auto Group",
    contractType: "Full Service",
    contractLength: "12 months",
    monthlyValue: "$5,000/mo",
    setupFee: "$2,500",
    startDate: "Jun 10, 2025",
    endDate: "Jun 9, 2026",
    renewalDate: "May 25, 2026",
    status: "Pending",
  },
  {
    client: "Metro Dental Group",
    contractType: "Local Domination",
    contractLength: "12 months",
    monthlyValue: "$4,500/mo",
    setupFee: "$1,500",
    startDate: "Jun 5, 2025",
    endDate: "Jun 4, 2026",
    renewalDate: "May 20, 2026",
    status: "Pending",
  },
  {
    client: "Summit Landscaping",
    contractType: "SEO Growth",
    contractLength: "12 months",
    monthlyValue: "$2,400/mo",
    setupFee: "$1,000",
    startDate: "May 1, 2024",
    endDate: "Apr 30, 2025",
    renewalDate: "Apr 15, 2025",
    status: "Expired",
  },
];

const closedWonRecords: ClosedWonRecord[] = [
  {
    client: "Sunstate Solar",
    servicesSold: "Meta Ads, Google Ads, Landing Pages, Reporting",
    contractValue: "$6,000/mo × 6 mo",
    billingStatus: "Sent To Billing",
    handoffStatus: "Handoff Complete",
  },
  {
    client: "Harbor Auto Group",
    servicesSold: "SEO, Google Ads, Website Design",
    contractValue: "$5,000/mo × 12 mo",
    billingStatus: "Ready For Billing",
    handoffStatus: "Pending Handoff",
  },
  {
    client: "Metro Dental Group",
    servicesSold: "SEO, GBP, Yelp, Reporting",
    contractValue: "$4,500/mo × 12 mo",
    billingStatus: "Ready For Billing",
    handoffStatus: "Pending Handoff",
  },
];

const billingHandoffs: BillingHandoff[] = [
  {
    client: "Sunstate Solar",
    servicesSold: "Meta Ads, Google Ads, Landing Pages, Reporting",
    contractValue: "$36,000 total",
    proposalStatus: "Accepted",
    contractStatus: "Active",
    billingStatus: "Billing Accepted",
    handoffNotes: "Kickoff scheduled Jun 1. PM assigned.",
    nextAction: "Send onboarding docs",
  },
  {
    client: "Harbor Auto Group",
    servicesSold: "SEO, Google Ads, Website Design",
    contractValue: "$60,000 total",
    proposalStatus: "Accepted",
    contractStatus: "Pending",
    billingStatus: "Sent To Billing",
    handoffNotes: "Contract signed. Awaiting billing confirmation.",
    nextAction: "Billing team to confirm receipt",
  },
  {
    client: "Metro Dental Group",
    servicesSold: "SEO, GBP, Yelp, Reporting",
    contractValue: "$54,000 total",
    proposalStatus: "Accepted",
    contractStatus: "Pending",
    billingStatus: "Ready For Billing",
    handoffNotes: "Verbal agreement confirmed. Contract pending signature.",
    nextAction: "Send contract for signature",
  },
];

// ── Phase 2 Mock Data ─────────────────────────────────────────────────────────

const mockProposalBuilders: ProposalBuilder[] = [
  {
    proposalName: "Summit Landscaping – Q3 Growth",
    client: "Summit Landscaping",
    opportunity: "Local Visibility Expansion",
    salesRep: "Jordan M.",
    proposalDate: "Jun 1, 2025",
    expirationDate: "Jun 15, 2025",
    contractLength: "12 months",
    monthlyValue: "$2,400",
    setupFee: "$1,000",
    totalContractValue: "$29,800",
  },
  {
    proposalName: "Harbor Auto – Full Digital",
    client: "Harbor Auto Group",
    opportunity: "Multi-Channel Lead Gen",
    salesRep: "Mike T.",
    proposalDate: "May 26, 2025",
    expirationDate: "Jun 9, 2025",
    contractLength: "12 months",
    monthlyValue: "$5,000",
    setupFee: "$2,500",
    totalContractValue: "$62,500",
  },
  {
    proposalName: "Coastal Realty – SEO Starter",
    client: "Coastal Realty",
    opportunity: "Organic Growth",
    salesRep: "Mike T.",
    proposalDate: "Jun 2, 2025",
    expirationDate: "Jun 16, 2025",
    contractLength: "6 months",
    monthlyValue: "$1,200",
    setupFee: "$500",
    totalContractValue: "$7,700",
  },
];

const serviceConfigs: ServiceConfig[] = [
  { service: "SEO",                  included: true,  monthlyFee: "$800",   setupFee: "$400",   departmentOwner: "SEO Team",     profitability: "84%" },
  { service: "GBP",                  included: true,  monthlyFee: "$300",   setupFee: "$150",   departmentOwner: "Local Team",   profitability: "88%" },
  { service: "Yelp",                 included: false, monthlyFee: "$200",   setupFee: "$100",   departmentOwner: "Local Team",   profitability: "79%" },
  { service: "Meta Ads",             included: true,  monthlyFee: "$1,200", setupFee: "$600",   departmentOwner: "Paid Team",    profitability: "72%" },
  { service: "Google Ads",           included: true,  monthlyFee: "$1,500", setupFee: "$750",   departmentOwner: "Paid Team",    profitability: "74%" },
  { service: "LSA",                  included: false, monthlyFee: "$400",   setupFee: "$200",   departmentOwner: "Paid Team",    profitability: "81%" },
  { service: "Content",              included: false, monthlyFee: "$500",   setupFee: "$250",   departmentOwner: "Content Team", profitability: "76%" },
  { service: "Reporting",            included: true,  monthlyFee: "$150",   setupFee: "$0",     departmentOwner: "Ops Team",     profitability: "92%" },
  { service: "Website Development",  included: false, monthlyFee: "$0",     setupFee: "$3,500", departmentOwner: "Dev Team",     profitability: "65%" },
  { service: "Landing Pages",        included: false, monthlyFee: "$300",   setupFee: "$500",   departmentOwner: "Dev Team",     profitability: "70%" },
  { service: "Call Tracking",        included: false, monthlyFee: "$100",   setupFee: "$50",    departmentOwner: "Ops Team",     profitability: "90%" },
  { service: "Conversion Tracking",  included: false, monthlyFee: "$150",   setupFee: "$100",   departmentOwner: "Dev Team",     profitability: "87%" },
];

const packageTemplates: PackageTemplate[] = [
  { packageName: "SEO Growth Package",         includedServices: "SEO, GBP, Reporting",                                     monthlyValue: "$1,500/mo", setupFee: "$750",   contractLength: "6 months",  profitabilityScore: "82%" },
  { packageName: "Local Domination Package",   includedServices: "SEO, GBP, Yelp, Reporting",                              monthlyValue: "$2,200/mo", setupFee: "$1,000", contractLength: "12 months", profitabilityScore: "88%" },
  { packageName: "Lead Generation Package",    includedServices: "Meta Ads, Google Ads, Landing Pages, Reporting",          monthlyValue: "$3,500/mo", setupFee: "$1,500", contractLength: "6 months",  profitabilityScore: "76%" },
  { packageName: "MedSpa Growth Package",      includedServices: "SEO, GBP, Meta Ads, Yelp, Reporting",                    monthlyValue: "$4,200/mo", setupFee: "$1,800", contractLength: "12 months", profitabilityScore: "83%" },
  { packageName: "Home Services Growth Package", includedServices: "SEO, GBP, Google Ads, LSA, Reporting",                monthlyValue: "$3,800/mo", setupFee: "$1,600", contractLength: "12 months", profitabilityScore: "85%" },
];

const salesActivityTimeline: SalesActivityEntry[] = [
  { date: "Jun 2, 2025",  client: "Coastal Realty",    activity: "Lead Created",      owner: "Mike T.",    notes: "Inbound via LinkedIn" },
  { date: "Jun 1, 2025",  client: "Summit Landscaping", activity: "Discovery Call",   owner: "Jordan M.",  notes: "Client interested in SEO + GBP" },
  { date: "May 30, 2025", client: "Sunstate Solar",    activity: "Closed Won",        owner: "Sarah K.",   notes: "Contract signed electronically" },
  { date: "May 28, 2025", client: "Sunstate Solar",    activity: "Sent To Billing",   owner: "Sarah K.",   notes: "Handoff packet submitted to billing" },
  { date: "May 26, 2025", client: "Harbor Auto Group", activity: "Proposal Sent",     owner: "Mike T.",    notes: "Full Service proposal emailed" },
  { date: "May 25, 2025", client: "Summit Landscaping", activity: "Proposal Viewed",  owner: "Jordan M.",  notes: "Client opened proposal link" },
  { date: "May 22, 2025", client: "Metro Dental Group", activity: "Negotiation",      owner: "Jordan M.",  notes: "Price discussion on GBP tier" },
  { date: "May 20, 2025", client: "Metro Dental Group", activity: "Proposal Sent",    owner: "Jordan M.",  notes: "Local Domination proposal sent" },
  { date: "May 18, 2025", client: "Harbor Auto Group",  activity: "Discovery Call",   owner: "Mike T.",    notes: "Explored multi-channel needs" },
  { date: "May 15, 2025", client: "Sunstate Solar",    activity: "Contract Signed",   owner: "Sarah K.",   notes: "Lead Gen 6-month contract" },
];

const salesTeamPerformance: SalesRepPerformance[] = [
  { salesRep: "Jordan M.", opportunities: 3, proposalsSent: 3, closedWon: 1, closedLost: 1, conversionRate: "50%", revenueClosed: "$4,500/mo", forecastRevenue: "$8,100/mo" },
  { salesRep: "Sarah K.",  opportunities: 2, proposalsSent: 2, closedWon: 1, closedLost: 0, conversionRate: "50%", revenueClosed: "$6,000/mo", forecastRevenue: "$6,720/mo" },
  { salesRep: "Mike T.",   opportunities: 2, proposalsSent: 2, closedWon: 0, closedLost: 0, conversionRate: "0%",  revenueClosed: "$0",        forecastRevenue: "$5,100/mo" },
];

// ── Pipeline Stage Config ──────────────────────────────────────────────────────

const OPPORTUNITY_STAGES: { stage: OpportunityStage; color: string }[] = [
  { stage: "New Lead",         color: "#94A3B8" },
  { stage: "Discovery",        color: "#2563EB" },
  { stage: "Proposal",         color: "#7C3AED" },
  { stage: "Negotiation",      color: "#D97706" },
  { stage: "Verbal Agreement", color: "#0891B2" },
  { stage: "Closed Won",       color: "#059669" },
  { stage: "Closed Lost",      color: "#DC2626" },
];

function getPipelineStats() {
  return OPPORTUNITY_STAGES.map(({ stage, color }) => {
    const stageOpps = opportunities.filter((o) => o.stage === stage);
    const count = stageOpps.length;
    const value = stageOpps.reduce((sum, o) => {
      const n = parseFloat(String(o.estimatedValue).replace(/[^0-9.]/g, ""));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
    const totalCount = opportunities.length;
    const prevStages = OPPORTUNITY_STAGES.slice(0, OPPORTUNITY_STAGES.findIndex((s) => s.stage === stage));
    const prevCount = prevStages.reduce((s, ps) => s + opportunities.filter((o) => o.stage === ps.stage).length, 0) + count;
    const convRate = totalCount > 0 ? Math.round((prevCount / totalCount) * 100) : 0;
    return { stage, color, count, value, convRate };
  });
}

// ── Status Badge Helpers ───────────────────────────────────────────────────────

function stageVariant(stage: OpportunityStage): "info" | "pending" | "warning" | "success" | "error" | "neutral" {
  const map: Record<OpportunityStage, "info" | "pending" | "warning" | "success" | "error" | "neutral"> = {
    "New Lead":         "neutral",
    "Discovery":        "info",
    "Proposal":         "pending",
    "Negotiation":      "warning",
    "Verbal Agreement": "info",
    "Closed Won":       "success",
    "Closed Lost":      "error",
  };
  return map[stage];
}

function proposalStatusVariant(s: ProposalStatus): "info" | "pending" | "warning" | "success" | "error" | "neutral" {
  const map: Record<ProposalStatus, "info" | "pending" | "warning" | "success" | "error" | "neutral"> = {
    Draft:       "neutral",
    Sent:        "info",
    Viewed:      "info",
    Negotiating: "warning",
    Accepted:    "success",
    Rejected:    "error",
  };
  return map[s];
}

function contractStatusVariant(s: ContractStatus): "success" | "pending" | "error" | "neutral" {
  const map: Record<ContractStatus, "success" | "pending" | "error" | "neutral"> = {
    Active:    "success",
    Pending:   "pending",
    Expired:   "error",
    Cancelled: "neutral",
  };
  return map[s];
}

function billingStatusVariant(s: BillingHandoffStatus): "neutral" | "info" | "success" | "warning" | "pending" {
  const map: Record<BillingHandoffStatus, "neutral" | "info" | "success" | "warning" | "pending"> = {
    "Ready For Billing": "neutral",
    "Sent To Billing":   "info",
    "Billing Accepted":  "success",
    "Awaiting Invoice":  "warning",
    "Awaiting Payment":  "pending",
  };
  return map[s];
}

// ── Table Columns ─────────────────────────────────────────────────────────────

const opportunityColumns: Column<Opportunity>[] = [
  { key: "client",         header: "Client",           width: "150px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "industry",       header: "Industry",         width: "120px" },
  { key: "leadSource",     header: "Lead Source",      width: "120px" },
  { key: "services",       header: "Services Interested", width: "200px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
  { key: "estimatedValue", header: "Est. Value",       width: "100px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "salesRep",       header: "Sales Rep",        width: "110px" },
  {
    key: "stage", header: "Stage", width: "140px",
    render: (v) => <StatusBadge variant={stageVariant(v as OpportunityStage)} label={String(v)} size="sm" />,
  },
  {
    key: "probability", header: "Win %", width: "130px",
    render: (v) => {
      const n = Number(v);
      return (
        <div className="flex items-center gap-2">
          <ProgressBar value={n} color={n >= 70 ? "bg-emerald-500" : n >= 40 ? "bg-amber-500" : "bg-red-400"} height={5} />
          <span className="text-xs font-semibold text-slate-600 w-8 flex-shrink-0">{n}%</span>
        </div>
      );
    },
  },
  { key: "closeDate", header: "Expected Close", width: "130px" },
];

const servicePackageColumns: Column<ServicePackage>[] = [
  { key: "package",            header: "Package",           width: "200px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "includedServices",   header: "Included Services", width: "250px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
  { key: "monthlyValue",       header: "Monthly Value",     width: "110px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "setupFee",           header: "Setup Fee",         width: "90px" },
  { key: "contractLength",     header: "Contract Length",   width: "120px" },
  {
    key: "profitabilityScore", header: "Profitability", width: "120px",
    render: (v) => {
      const n = parseFloat(String(v));
      return (
        <div className="flex items-center gap-2">
          <ProgressBar value={n} color={n >= 80 ? "bg-emerald-500" : n >= 70 ? "bg-amber-500" : "bg-red-400"} height={5} />
          <span className="text-xs font-semibold" style={{ color: n >= 80 ? "#059669" : n >= 70 ? "#D97706" : "#DC2626" }}>{String(v)}</span>
        </div>
      );
    },
  },
];

const proposalColumns: Column<ProposalRecord>[] = [
  { key: "proposal",         header: "Proposal",          width: "200px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "client",           header: "Client",            width: "140px" },
  { key: "servicesIncluded", header: "Services Included", width: "220px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
  { key: "monthlyValue",     header: "Monthly Value",     width: "110px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "setupFee",         header: "Setup Fee",         width: "90px" },
  { key: "contractLength",   header: "Contract",          width: "100px" },
  {
    key: "status", header: "Status", width: "120px",
    render: (v) => <StatusBadge variant={proposalStatusVariant(v as ProposalStatus)} label={String(v)} size="sm" />,
  },
  { key: "sentDate",       header: "Sent Date",   width: "110px" },
  { key: "expirationDate", header: "Expires",     width: "110px" },
];

const contractColumns: Column<ContractRecord>[] = [
  { key: "client",         header: "Client",           width: "150px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "contractType",   header: "Contract Type",    width: "160px" },
  { key: "contractLength", header: "Length",           width: "100px" },
  { key: "monthlyValue",   header: "Monthly Value",    width: "110px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "setupFee",       header: "Setup Fee",        width: "90px" },
  { key: "startDate",      header: "Start Date",       width: "110px" },
  { key: "endDate",        header: "End Date",         width: "110px" },
  { key: "renewalDate",    header: "Renewal Date",     width: "110px" },
  {
    key: "status", header: "Status", width: "100px",
    render: (v) => <StatusBadge variant={contractStatusVariant(v as ContractStatus)} label={String(v)} size="sm" />,
  },
];

const closedWonColumns: Column<ClosedWonRecord>[] = [
  { key: "client",         header: "Client",           width: "150px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "servicesSold",   header: "Services Sold",    width: "250px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
  { key: "contractValue",  header: "Contract Value",   width: "150px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  {
    key: "billingStatus", header: "Billing Status", width: "140px",
    render: (v) => <StatusBadge variant="info" label={String(v)} size="sm" />,
  },
  {
    key: "handoffStatus", header: "Handoff Status", width: "140px",
    render: (v) => {
      const s = String(v);
      return <StatusBadge variant={s === "Handoff Complete" ? "success" : "warning"} label={s} size="sm" />;
    },
  },
];

const billingHandoffColumns: Column<BillingHandoff>[] = [
  { key: "client",          header: "Client",            width: "150px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "servicesSold",    header: "Services Sold",     width: "230px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
  { key: "contractValue",   header: "Contract Value",    width: "120px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "proposalStatus",  header: "Proposal Status",   width: "120px", render: (v) => <StatusBadge variant={proposalStatusVariant(v as ProposalStatus)} label={String(v)} size="sm" /> },
  { key: "contractStatus",  header: "Contract Status",   width: "120px", render: (v) => <StatusBadge variant={contractStatusVariant(v as ContractStatus)} label={String(v)} size="sm" /> },
  {
    key: "billingStatus", header: "Billing Status", width: "150px",
    render: (v) => <StatusBadge variant={billingStatusVariant(v as BillingHandoffStatus)} label={String(v)} size="sm" />,
  },
  { key: "handoffNotes", header: "Handoff Notes", width: "220px", render: (v) => <span className="text-xs italic" style={{ color: "var(--rtm-text-muted)" }}>{String(v)}</span> },
  { key: "nextAction",   header: "Next Action",   width: "190px", render: (v) => <span className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
];

// ── Phase 2 Table Columns ─────────────────────────────────────────────────────

const proposalBuilderColumns: Column<ProposalBuilder>[] = [
  { key: "proposalName",       header: "Proposal Name",       width: "200px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "client",             header: "Client",              width: "150px" },
  { key: "opportunity",        header: "Opportunity",         width: "180px" },
  { key: "salesRep",           header: "Sales Rep",           width: "110px" },
  { key: "proposalDate",       header: "Proposal Date",       width: "120px" },
  { key: "expirationDate",     header: "Expiration Date",     width: "120px" },
  { key: "contractLength",     header: "Contract Length",     width: "120px" },
  { key: "monthlyValue",       header: "Monthly Value",       width: "110px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "setupFee",           header: "Setup Fee",           width: "90px" },
  { key: "totalContractValue", header: "Total Contract Value", width: "140px", render: (v) => <span className="font-bold text-xs" style={{ color: "#2563EB" }}>{String(v)}</span> },
];

const serviceConfigColumns: Column<ServiceConfig>[] = [
  { key: "service",         header: "Service",         width: "180px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  {
    key: "included", header: "Included", width: "90px",
    render: (v) => (
      <span className={`text-xs font-bold ${v ? "text-emerald-600" : "text-slate-400"}`}>
        {v ? "✓ Yes" : "— No"}
      </span>
    ),
  },
  { key: "monthlyFee",      header: "Monthly Fee",     width: "100px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "setupFee",        header: "Setup Fee",       width: "90px" },
  { key: "departmentOwner", header: "Department Owner", width: "140px" },
  {
    key: "profitability", header: "Profitability", width: "130px",
    render: (v) => {
      const n = parseFloat(String(v));
      return (
        <div className="flex items-center gap-2">
          <ProgressBar value={n} color={n >= 85 ? "bg-emerald-500" : n >= 75 ? "bg-amber-500" : "bg-red-400"} height={5} />
          <span className="text-xs font-semibold" style={{ color: n >= 85 ? "#059669" : n >= 75 ? "#D97706" : "#DC2626" }}>{String(v)}</span>
        </div>
      );
    },
  },
];

const packageTemplateColumns: Column<PackageTemplate>[] = [
  { key: "packageName",       header: "Package Name",      width: "200px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "includedServices",  header: "Included Services", width: "280px", render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
  { key: "monthlyValue",      header: "Monthly Value",     width: "110px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "setupFee",          header: "Setup Fee",         width: "90px" },
  { key: "contractLength",    header: "Contract Length",   width: "120px" },
  {
    key: "profitabilityScore", header: "Profitability Score", width: "140px",
    render: (v) => {
      const n = parseFloat(String(v));
      return (
        <div className="flex items-center gap-2">
          <ProgressBar value={n} color={n >= 85 ? "bg-emerald-500" : n >= 75 ? "bg-amber-500" : "bg-red-400"} height={5} />
          <span className="text-xs font-semibold" style={{ color: n >= 85 ? "#059669" : n >= 75 ? "#D97706" : "#DC2626" }}>{String(v)}</span>
        </div>
      );
    },
  },
];

const salesActivityColumns: Column<SalesActivityEntry>[] = [
  { key: "date",     header: "Date",     width: "120px" },
  { key: "client",   header: "Client",   width: "160px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  {
    key: "activity", header: "Activity", width: "160px",
    render: (v) => {
      const colors: Record<string, string> = {
        "Lead Created": "#94A3B8", "Discovery Call": "#2563EB", "Proposal Sent": "#7C3AED",
        "Proposal Viewed": "#0891B2", "Negotiation": "#D97706", "Contract Signed": "#0891B2",
        "Closed Won": "#059669", "Sent To Billing": "#D97706",
      };
      const c = colors[String(v)] ?? "#64748B";
      return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${c}15`, color: c }}>{String(v)}</span>;
    },
  },
  { key: "owner", header: "Owner", width: "110px" },
  { key: "notes", header: "Notes", width: "240px", render: (v) => <span className="text-xs italic" style={{ color: "var(--rtm-text-muted)" }}>{String(v)}</span> },
];

const salesTeamColumns: Column<SalesRepPerformance>[] = [
  { key: "salesRep",       header: "Sales Rep",       width: "130px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "opportunities",  header: "Opportunities",   width: "110px", render: (v) => <span className="font-bold text-xs" style={{ color: "#2563EB" }}>{String(v)}</span> },
  { key: "proposalsSent",  header: "Proposals Sent",  width: "120px", render: (v) => <span className="font-bold text-xs" style={{ color: "#7C3AED" }}>{String(v)}</span> },
  { key: "closedWon",      header: "Closed Won",      width: "100px", render: (v) => <span className="font-bold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "closedLost",     header: "Closed Lost",     width: "100px", render: (v) => <span className="font-bold text-xs" style={{ color: "#DC2626" }}>{String(v)}</span> },
  {
    key: "conversionRate", header: "Conversion Rate", width: "130px",
    render: (v) => {
      const n = parseFloat(String(v));
      return (
        <div className="flex items-center gap-2">
          <ProgressBar value={n} color={n >= 40 ? "bg-emerald-500" : n >= 20 ? "bg-amber-500" : "bg-red-400"} height={5} />
          <span className="text-xs font-semibold" style={{ color: n >= 40 ? "#059669" : n >= 20 ? "#D97706" : "#DC2626" }}>{String(v)}</span>
        </div>
      );
    },
  },
  { key: "revenueClosed",   header: "Revenue Closed",   width: "120px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#059669" }}>{String(v)}</span> },
  { key: "forecastRevenue", header: "Forecast Revenue", width: "130px", render: (v) => <span className="font-semibold text-xs" style={{ color: "#2563EB" }}>{String(v)}</span> },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SalesDashboard() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Proposal Builder form state
  const [proposalForm, setProposalForm] = useState({
    proposalName: "",
    client: "",
    opportunity: "",
    salesRep: "",
    proposalDate: "",
    expirationDate: "",
    contractLength: "",
    monthlyValue: "",
    setupFee: "",
    totalContractValue: "",
    servicesIncluded: "",
    deliverablesIncluded: "",
    assumptions: "",
    exclusions: "",
    specialTerms: "",
    notes: "",
  });

  // Pricing Engine state
  const [pricing, setPricing] = useState({
    serviceTotal: 3500,
    setupFees: 1500,
    discounts: 0,
    contractLength: 12,
    estimatedMargin: 78,
  });

  const toggle = (section: string) =>
    setActiveSection((prev) => (prev === section ? null : section));

  const pipelineStats = getPipelineStats();

  const totalPipeline = opportunities
    .filter((o) => o.stage !== "Closed Lost")
    .reduce((sum, o) => {
      const n = parseFloat(String(o.estimatedValue).replace(/[^0-9.]/g, ""));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);

  const forecastRevenue = opportunities
    .filter((o) => o.stage !== "Closed Lost")
    .reduce((sum, o) => {
      const n = parseFloat(String(o.estimatedValue).replace(/[^0-9.]/g, ""));
      return sum + (isNaN(n) ? 0 : n * (o.probability / 100));
    }, 0);

  const avgDealSize =
    totalPipeline > 0 ? totalPipeline / opportunities.filter((o) => o.stage !== "Closed Lost").length : 0;

  // Pricing engine computed values
  const discountedMonthly = pricing.serviceTotal - pricing.discounts;
  const monthlyRevenue = discountedMonthly;
  const annualRevenue = monthlyRevenue * 12;
  const contractValue = monthlyRevenue * pricing.contractLength + pricing.setupFees;
  const grossMarginEst = Math.round((monthlyRevenue * pricing.estimatedMargin) / 100);

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Revenue generation command center — pipeline, proposals, contracts, and billing handoffs." />

      {/* ── Sales Ownership Banner ────────────────────────────────────────── */}
      <div className="rounded-xl border p-4" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
        <p className="text-sm font-bold mb-1" style={{ color: "#1D4ED8" }}>Sales Module Ownership</p>
        <p className="text-xs mb-2" style={{ color: "#1E40AF" }}>
          Sales owns the client lifecycle from <strong>Lead</strong> through <strong>Sent To Billing</strong>.
          Sales does <em>not</em> own payment confirmation, client activation, account assignment, or onboarding — those belong to Billing and Account Management.
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {["Lead","Opportunity","Proposal","Contract","Closed Won","Sent To Billing"].map((s, i, arr) => (
            <React.Fragment key={s}>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "#1D4ED8", color: "#fff" }}>{s}</span>
              {i < arr.length - 1 && <span style={{ color: "#93C5FD" }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Client Lifecycle Status ───────────────────────────────────────── */}
      <SectionWrapper
        title="Client Lifecycle Status"
        description="Full pipeline view showing Sales, Billing, and Account Management ownership across every client stage"
      >
        <ClientLifecycleEngine activeStages={["Lead","Opportunity","Proposal","Contract","Closed Won","Sent To Billing"]} />
      </SectionWrapper>

      {/* ── Billing Handoff Checklist ─────────────────────────────────────── */}
      <SectionWrapper
        title="Billing Handoff Checklist"
        description="Complete before sending any closed-won deal to Billing. Sales is responsible for all items below."
      >
        <BillingHandoffChecklist />
      </SectionWrapper>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="New Leads"
          value={String(opportunities.filter((o) => o.stage === "New Lead").length)}
          trend="up" trendValue="3"
          iconBg="#EFF6FF" iconColor="#2563EB"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <KpiCard
          title="Opportunities"
          value={String(opportunities.filter((o) => !["Closed Won", "Closed Lost"].includes(o.stage)).length)}
          trend="up" trendValue="2"
          iconBg="#F5F3FF" iconColor="#7C3AED"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <KpiCard
          title="Active Proposals"
          value={String(proposals.filter((p) => ["Sent", "Viewed", "Negotiating"].includes(p.status)).length)}
          trend="up" trendValue="1"
          iconBg="#FFFBEB" iconColor="#D97706"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <KpiCard
          title="Closed Won"
          value={String(opportunities.filter((o) => o.stage === "Closed Won").length)}
          trend="up" trendValue="1"
          iconBg="#ECFDF5" iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
        />
        <KpiCard
          title="Closed Lost"
          value={String(opportunities.filter((o) => o.stage === "Closed Lost").length)}
          iconBg="#FEF2F2" iconColor="#DC2626"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          title="Pipeline Value"
          value={`$${Math.round(totalPipeline / 1000)}k/mo`}
          trend="up" trendValue="12%"
          iconBg="#EFF6FF" iconColor="#2563EB"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <KpiCard
          title="Forecast Revenue"
          value={`$${Math.round(forecastRevenue / 1000)}k/mo`}
          trend="up" trendValue="8%"
          iconBg="#ECFDF5" iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <KpiCard
          title="Avg Deal Size"
          value={`$${Math.round(avgDealSize / 100) * 100}/mo`}
          iconBg="#FFFBEB" iconColor="#D97706"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* ── ACTION CENTER ─────────────────────────────────────────────────── */}
      <SectionWrapper title="Action Center" description="Quick actions for the sales team">
        <div className="flex flex-wrap gap-3">
          {[
            { label: "＋ Create Proposal",    color: "#7C3AED" },
            { label: "＋ Create Package",     color: "#2563EB" },
            { label: "✎ Generate Contract",   color: "#0891B2" },
            { label: "📊 Forecast Revenue",   color: "#059669" },
            { label: "→ Send To Billing",     color: "#D97706" },
            { label: "⧉ Clone Opportunity",  color: "#64748B" },
          ].map(({ label, color }) => (
            <button
              key={label}
              className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
              style={{ background: `${color}15`, color, borderColor: `${color}40` }}
              onClick={() => alert(`[Mock] ${label}`)}
            >
              {label}
            </button>
          ))}
        </div>
      </SectionWrapper>

      {/* ── PROPOSAL BUILDER ──────────────────────────────────────────────── */}
      <SectionWrapper
        title="Proposal Builder"
        description="Create and manage proposal workspaces for clients"
        actions={
          <button className="rtm-btn-secondary text-sm" onClick={() => toggle("proposalBuilder")}>
            {activeSection === "proposalBuilder" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        {activeSection === "proposalBuilder" ? (
          <div className="space-y-6">
            {/* Form */}
            <div className="rounded-xl border p-5 space-y-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>New Proposal Workspace</p>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[
                  { label: "Proposal Name", key: "proposalName", placeholder: "e.g. Summit Landscaping – Q3 SEO" },
                  { label: "Client", key: "client", placeholder: "Client name" },
                  { label: "Opportunity", key: "opportunity", placeholder: "Linked opportunity" },
                  { label: "Sales Rep", key: "salesRep", placeholder: "Rep name" },
                  { label: "Proposal Date", key: "proposalDate", placeholder: "Jun 1, 2025" },
                  { label: "Expiration Date", key: "expirationDate", placeholder: "Jun 15, 2025" },
                  { label: "Contract Length", key: "contractLength", placeholder: "e.g. 12 months" },
                  { label: "Monthly Value", key: "monthlyValue", placeholder: "$0" },
                  { label: "Setup Fee", key: "setupFee", placeholder: "$0" },
                  { label: "Total Contract Value", key: "totalContractValue", placeholder: "$0" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{label}</label>
                    <input
                      className="rtm-input text-sm"
                      placeholder={placeholder}
                      value={proposalForm[key as keyof typeof proposalForm]}
                      onChange={(e) => setProposalForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              {/* Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[
                  { label: "Services Included", key: "servicesIncluded", placeholder: "List services..." },
                  { label: "Deliverables Included", key: "deliverablesIncluded", placeholder: "List deliverables..." },
                  { label: "Assumptions", key: "assumptions", placeholder: "Assumptions..." },
                  { label: "Exclusions", key: "exclusions", placeholder: "What is excluded..." },
                  { label: "Special Terms", key: "specialTerms", placeholder: "Special terms..." },
                  { label: "Notes", key: "notes", placeholder: "Internal notes..." },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{label}</label>
                    <textarea
                      rows={3}
                      className="rtm-input text-sm resize-none"
                      placeholder={placeholder}
                      value={proposalForm[key as keyof typeof proposalForm]}
                      onChange={(e) => setProposalForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  { label: "💾 Save Proposal",     color: "#64748B" },
                  { label: "📄 Generate Proposal",  color: "#2563EB" },
                  { label: "✉ Send Proposal",       color: "#7C3AED" },
                  { label: "⧉ Clone Proposal",      color: "#0891B2" },
                ].map(({ label, color }) => (
                  <button
                    key={label}
                    className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
                    style={{ background: `${color}15`, color, borderColor: `${color}40` }}
                    onClick={() => alert(`[Mock] ${label}`)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Existing proposals table */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-secondary)" }}>Saved Proposals</p>
              <DataTable columns={proposalBuilderColumns} data={mockProposalBuilders} />
            </div>
          </div>
        ) : (
          <div className="py-2 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {mockProposalBuilders.length} saved proposals · Click Expand to open workspace
          </div>
        )}
      </SectionWrapper>

      {/* ── SERVICE CONFIGURATION CENTER ─────────────────────────────────── */}
      <SectionWrapper
        title="Service Configuration Center"
        description="Configure services, pricing, department owners, and profitability for each service line"
        actions={
          <button className="rtm-btn-secondary text-sm" onClick={() => toggle("serviceConfig")}>
            {activeSection === "serviceConfig" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        {activeSection === "serviceConfig" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {serviceConfigs.filter((s) => s.included).map((s) => (
                <span key={s.service} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #BBF7D0" }}>
                  ✓ {s.service}
                </span>
              ))}
            </div>
            <DataTable columns={serviceConfigColumns} data={serviceConfigs} />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 py-1">
            {serviceConfigs.map((s) => (
              <span
                key={s.service}
                className="text-xs font-semibold px-2 py-1 rounded-full border"
                style={{
                  background: s.included ? "#ECFDF515" : "var(--rtm-surface)",
                  color: s.included ? "#059669" : "var(--rtm-text-muted)",
                  borderColor: s.included ? "#BBF7D0" : "var(--rtm-border)",
                }}
              >
                {s.included ? "✓" : "○"} {s.service}
              </span>
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* ── PACKAGE TEMPLATE LIBRARY ──────────────────────────────────────── */}
      <SectionWrapper
        title="Package Template Library"
        description="Reusable service packages with pricing, contract terms, and profitability scores"
        actions={
          <div className="flex gap-2">
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }} onClick={() => alert("[Mock] Create Package")}>
              ＋ Create Package
            </button>
            <button className="rtm-btn-secondary text-sm" onClick={() => toggle("packageLibrary")}>
              {activeSection === "packageLibrary" ? "Collapse ▲" : "Expand ▼"}
            </button>
          </div>
        }
      >
        {activeSection === "packageLibrary" ? (
          <div className="space-y-4">
            <DataTable columns={packageTemplateColumns} data={packageTemplates} />
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: "⧉ Clone Package",   color: "#0891B2" },
                { label: "✎ Edit Package",    color: "#7C3AED" },
                { label: "✗ Archive Package", color: "#DC2626" },
              ].map(({ label, color }) => (
                <button
                  key={label}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90"
                  style={{ background: `${color}10`, color, borderColor: `${color}35` }}
                  onClick={() => alert(`[Mock] ${label}`)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 py-1">
            {packageTemplates.map((pkg) => (
              <span
                key={pkg.packageName}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                style={{ background: "#F5F3FF", color: "#7C3AED", borderColor: "#DDD6FE" }}
              >
                {pkg.packageName} — {pkg.monthlyValue}
              </span>
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* ── PRICING ENGINE ────────────────────────────────────────────────── */}
      <SectionWrapper
        title="Pricing Engine"
        description="Calculate revenue, contract value, and estimated margin for any service combination"
        actions={
          <button className="rtm-btn-secondary text-sm" onClick={() => toggle("pricingEngine")}>
            {activeSection === "pricingEngine" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        {activeSection === "pricingEngine" ? (
          <div className="space-y-5">
            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[
                { label: "Service Total ($/mo)", key: "serviceTotal" },
                { label: "Setup Fees ($)", key: "setupFees" },
                { label: "Discounts ($/mo)", key: "discounts" },
                { label: "Contract Length (months)", key: "contractLength" },
                { label: "Estimated Margin (%)", key: "estimatedMargin" },
              ].map(({ label, key }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{label}</label>
                  <input
                    type="number"
                    className="rtm-input text-sm"
                    value={pricing[key as keyof typeof pricing]}
                    onChange={(e) => setPricing((p) => ({ ...p, [key]: Number(e.target.value) }))}
                  />
                </div>
              ))}
            </div>

            {/* Output Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: "Monthly Revenue",       value: `$${monthlyRevenue.toLocaleString()}`,              color: "#059669" },
                { label: "Annual Revenue",         value: `$${annualRevenue.toLocaleString()}`,               color: "#2563EB" },
                { label: "Contract Value",         value: `$${contractValue.toLocaleString()}`,               color: "#7C3AED" },
                { label: "Gross Margin Estimate",  value: `$${grossMarginEst.toLocaleString()}/mo`,           color: "#D97706" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border p-4 text-center" style={{ background: `${color}08`, borderColor: `${color}30` }}>
                  <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: "var(--rtm-text-secondary)" }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Margin bar */}
            <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Estimated Margin</span>
                <span className="text-sm font-bold" style={{ color: pricing.estimatedMargin >= 75 ? "#059669" : "#D97706" }}>{pricing.estimatedMargin}%</span>
              </div>
              <ProgressBar
                value={pricing.estimatedMargin}
                color={pricing.estimatedMargin >= 75 ? "bg-emerald-500" : "bg-amber-500"}
                height={8}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 py-1">
            {[
              { label: "Monthly Revenue",  value: `$${monthlyRevenue.toLocaleString()}`, color: "#059669" },
              { label: "Contract Value",   value: `$${contractValue.toLocaleString()}`, color: "#7C3AED" },
              { label: "Est. Margin",      value: `${pricing.estimatedMargin}%`,         color: "#D97706" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{label}:</span>
                <span className="text-sm font-bold" style={{ color }}>{value}</span>
              </div>
            ))}
            <button className="text-xs text-slate-400 underline" onClick={() => toggle("pricingEngine")}>Open calculator →</button>
          </div>
        )}
      </SectionWrapper>

      {/* ── REVENUE FORECASTING ───────────────────────────────────────────── */}
      <SectionWrapper
        title="Revenue Forecasting"
        description="Pipeline-weighted forecast across monthly, quarterly, and annual horizons"
        actions={
          <button className="rtm-btn-secondary text-sm" onClick={() => toggle("revenueForecast")}>
            {activeSection === "revenueForecast" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { label: "Forecast Revenue This Month",  value: "$12,400",  color: "#2563EB", note: "Based on active pipeline" },
            { label: "Forecast Revenue This Quarter", value: "$38,200", color: "#7C3AED", note: "Q2 weighted forecast" },
            { label: "Forecast Revenue This Year",    value: "$148,500", color: "#059669", note: "Full-year projection" },
            { label: "Weighted Pipeline Value",       value: `$${Math.round(forecastRevenue / 100) * 100}/mo`, color: "#0891B2", note: "Probability-weighted" },
            { label: "Closed Won Revenue",            value: "$6,000/mo", color: "#059669", note: "Confirmed MRR" },
            { label: "Revenue Goal Progress",         value: "62%",      color: "#D97706", note: "vs. $20k monthly goal" },
          ].map(({ label, value, color, note }) => (
            <div key={label} className="rounded-xl border p-4" style={{ background: `${color}08`, borderColor: `${color}25` }}>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: "var(--rtm-text-primary)" }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{note}</p>
              {label === "Revenue Goal Progress" && (
                <div className="mt-2">
                  <ProgressBar value={62} color="bg-amber-500" height={6} />
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── SALES ACTIVITY TIMELINE ───────────────────────────────────────── */}
      <SectionWrapper
        title="Sales Activity Timeline"
        description="Chronological log of all sales activities across leads, proposals, and closes"
        actions={
          <button className="rtm-btn-secondary text-sm" onClick={() => toggle("activityTimeline")}>
            {activeSection === "activityTimeline" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        {/* Stage legend */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            { label: "Lead Created", color: "#94A3B8" },
            { label: "Discovery Call", color: "#2563EB" },
            { label: "Proposal Sent", color: "#7C3AED" },
            { label: "Proposal Viewed", color: "#0891B2" },
            { label: "Negotiation", color: "#D97706" },
            { label: "Contract Signed", color: "#0891B2" },
            { label: "Closed Won", color: "#059669" },
            { label: "Sent To Billing", color: "#D97706" },
          ].map(({ label, color }) => (
            <span key={label} className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${color}15`, color }}>
              {label}
            </span>
          ))}
        </div>
        {activeSection === "activityTimeline" ? (
          <DataTable columns={salesActivityColumns} data={salesActivityTimeline} />
        ) : (
          <div className="py-2 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {salesActivityTimeline.length} activity entries · Click Expand to view timeline
          </div>
        )}
      </SectionWrapper>

      {/* ── SALES TEAM PERFORMANCE ────────────────────────────────────────── */}
      <SectionWrapper
        title="Sales Team Performance"
        description="Rep-level performance metrics including conversion rate, closed revenue, and forecast"
        actions={
          <button className="rtm-btn-secondary text-sm" onClick={() => toggle("teamPerformance")}>
            {activeSection === "teamPerformance" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        {activeSection === "teamPerformance" ? (
          <DataTable columns={salesTeamColumns} data={salesTeamPerformance} />
        ) : (
          <div className="flex flex-wrap gap-3 py-1">
            {salesTeamPerformance.map((rep) => (
              <div key={rep.salesRep} className="flex items-center gap-3 px-3 py-2 rounded-lg border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{rep.salesRep}</span>
                <span className="text-xs" style={{ color: "#059669" }}>{rep.closedWon} won</span>
                <span className="text-xs" style={{ color: "#2563EB" }}>{rep.conversionRate} CR</span>
                <span className="text-xs" style={{ color: "#7C3AED" }}>{rep.forecastRevenue}</span>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* ── Opportunity Pipeline ──────────────────────────────────────────── */}
      <SectionWrapper
        title="Opportunity Pipeline"
        description="Stage-by-stage opportunity breakdown with count, value, and conversion rate"
        actions={
          <button
            className="rtm-btn-secondary text-sm"
            onClick={() => toggle("pipeline")}
          >
            {activeSection === "pipeline" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        <div className="flex flex-wrap gap-2">
          {pipelineStats.map((s, i) => (
            <React.Fragment key={s.stage}>
              <div className="flex flex-col items-center gap-1 min-w-[100px]">
                <div className="rounded-lg px-3 py-2.5 text-center w-full" style={{ background: `${s.color}12`, border: `1.5px solid ${s.color}35` }}>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.count}</p>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: s.color }}>{s.stage}</p>
                  <p className="text-[10px] font-semibold mt-1" style={{ color: s.color }}>
                    ${s.value.toLocaleString()}/mo
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    {s.convRate}% conv.
                  </p>
                </div>
              </div>
              {i < pipelineStats.length - 1 && (
                <div className="flex items-center text-lg" style={{ color: "var(--rtm-border)" }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Opportunity Management ────────────────────────────────────────── */}
      <SectionWrapper
        title="Opportunity Management"
        description="All active and historical opportunities with stage, probability, and close date"
        actions={
          <button className="rtm-btn-secondary text-sm" onClick={() => toggle("opportunities")}>
            {activeSection === "opportunities" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        {activeSection === "opportunities" ? (
          <DataTable columns={opportunityColumns} data={opportunities} />
        ) : (
          <div className="py-2 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {opportunities.length} opportunities · Click Expand to view details
          </div>
        )}
      </SectionWrapper>

      {/* ── Service Packaging Center ──────────────────────────────────────── */}
      <SectionWrapper
        title="Service Packaging Center"
        description="Available service bundles with pricing, contract terms, and profitability"
        actions={
          <button className="rtm-btn-secondary text-sm" onClick={() => toggle("packages")}>
            {activeSection === "packages" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        {activeSection === "packages" ? (
          <DataTable columns={servicePackageColumns} data={servicePackages} />
        ) : (
          <div className="flex flex-wrap gap-2 py-1">
            {servicePackages.map((pkg) => (
              <span
                key={pkg.package}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}
              >
                {pkg.package} — {pkg.monthlyValue}
              </span>
            ))}
            <button className="text-xs text-slate-400 underline ml-1" onClick={() => toggle("packages")}>
              View all →
            </button>
          </div>
        )}
      </SectionWrapper>

      {/* ── Proposal Summary Center ───────────────────────────────────────── */}
      <SectionWrapper
        title="Proposal Summary Center"
        description="All proposals with status, value, and key dates"
        actions={
          <button className="rtm-btn-secondary text-sm" onClick={() => toggle("proposals")}>
            {activeSection === "proposals" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        {activeSection === "proposals" ? (
          <DataTable columns={proposalColumns} data={proposals} />
        ) : (
          <div className="flex flex-wrap gap-2 py-1">
            {(["Draft", "Sent", "Viewed", "Negotiating", "Accepted", "Rejected"] as ProposalStatus[]).map((s) => {
              const count = proposals.filter((p) => p.status === s).length;
              return (
                <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                  <StatusBadge variant={proposalStatusVariant(s)} label={s} size="sm" />
                  <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{count}</span>
                </div>
              );
            })}
            <button className="text-xs text-slate-400 underline ml-1" onClick={() => toggle("proposals")}>
              View all →
            </button>
          </div>
        )}
      </SectionWrapper>

      {/* ── Contract Management ───────────────────────────────────────────── */}
      <SectionWrapper
        title="Contract Management"
        description="All contracts with term, value, and renewal tracking"
        actions={
          <button className="rtm-btn-secondary text-sm" onClick={() => toggle("contracts")}>
            {activeSection === "contracts" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        {activeSection === "contracts" ? (
          <DataTable columns={contractColumns} data={contracts} />
        ) : (
          <div className="py-2 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {contracts.length} contracts · {contracts.filter((c) => c.status === "Active").length} active · Click Expand to view details
          </div>
        )}
      </SectionWrapper>

      {/* ── Closed Won Workflow ───────────────────────────────────────────── */}
      <SectionWrapper
        title="Closed Won Workflow"
        description="Track won deals through the full handoff pipeline"
        actions={
          <button className="rtm-btn-secondary text-sm" onClick={() => toggle("closedWon")}>
            {activeSection === "closedWon" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        {/* Workflow Steps */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {[
            { label: "Lead",            color: "#94A3B8" },
            { label: "Opportunity",     color: "#2563EB" },
            { label: "Proposal",        color: "#7C3AED" },
            { label: "Contract",        color: "#0891B2" },
            { label: "Closed Won",      color: "#059669" },
            { label: "Billing Handoff", color: "#D97706" },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                style={{ background: `${step.color}15`, color: step.color, borderColor: `${step.color}40` }}
              >
                {step.label}
              </div>
              {i < arr.length - 1 && <span className="text-base" style={{ color: "var(--rtm-border)" }}>→</span>}
            </React.Fragment>
          ))}
        </div>

        {activeSection === "closedWon" ? (
          <DataTable columns={closedWonColumns} data={closedWonRecords} />
        ) : (
          <div className="py-2 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {closedWonRecords.length} closed won deals · Click Expand to view details
          </div>
        )}
      </SectionWrapper>

      {/* ── Billing Handoff Center ────────────────────────────────────────── */}
      <SectionWrapper
        title="Billing Handoff Center"
        description="Critical handoff tracking from closed deals to active billing"
        actions={
          <button className="rtm-btn-primary text-sm" onClick={() => toggle("billing")}>
            {activeSection === "billing" ? "Collapse ▲" : "Expand ▼"}
          </button>
        }
      >
        {/* Status summary row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(["Ready For Billing", "Sent To Billing", "Billing Accepted", "Awaiting Invoice", "Awaiting Payment"] as BillingHandoffStatus[]).map((s) => {
            const count = billingHandoffs.filter((b) => b.billingStatus === s).length;
            return (
              <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <StatusBadge variant={billingStatusVariant(s)} label={s} size="sm" />
                <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{count}</span>
              </div>
            );
          })}
        </div>

        {activeSection === "billing" ? (
          <DataTable columns={billingHandoffColumns} data={billingHandoffs} />
        ) : (
          <div className="py-2 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {billingHandoffs.length} handoffs in progress · Click Expand to view details
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}
