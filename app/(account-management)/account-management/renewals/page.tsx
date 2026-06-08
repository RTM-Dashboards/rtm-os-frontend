"use client";

import React, { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const RENEWAL_STAGES = [
  "Renewal Triggered",
  "Performance Review",
  "Renewal Prep",
  "QBR Scheduled",
  "QBR Completed",
  "Client Decision",
  "Renewed",
  "Renewed With Changes",
  "Declined",
  "Retention Plan",
  "Lost",
] as const;

type RenewalStage = (typeof RENEWAL_STAGES)[number];

type RenewalRisk = "Low" | "Medium" | "High" | "Critical";
type BillingStatus =
  | "Waiting For Renewal Decision"
  | "Contract Pending"
  | "Billing Update Needed"
  | "Billing Updated"
  | "Services Continued"
  | "Services Changed"
  | "Cancelled";
type SalesInvolvement =
  | "No"
  | "Yes - Upsell"
  | "Yes - Expansion"
  | "Yes - Pricing Negotiation"
  | "Yes - Retention Risk"
  | "Yes - Contract Change";

interface RenewalProject {
  id: string;
  client: string;
  assignedAM: string;
  renewalDate: string;
  daysRemaining: number;
  currentStage: RenewalStage;
  salesInvolvement: SalesInvolvement;
  billingStatus: BillingStatus;
  renewalRisk: RenewalRisk;
  nextAction: string;
  contractValue: string;
  monthlyValue: number;
  salesRep?: string;
  salesRole?: string;
  salesStatus?: string;
  salesNotes?: string;
  declineReason?: string;
  retentionOffer?: string;
  retentionOwner?: string;
  leadershipReview?: string;
  outcome?: string;
}

const MOCK_RENEWALS: RenewalProject[] = [
  {
    id: "r1",
    client: "Acme Corp",
    assignedAM: "Sarah Mitchell",
    renewalDate: "2025-08-15",
    daysRemaining: 46,
    currentStage: "QBR Scheduled",
    salesInvolvement: "No",
    billingStatus: "Waiting For Renewal Decision",
    renewalRisk: "Low",
    nextAction: "Confirm QBR date with client",
    contractValue: "$48,000/yr",
    monthlyValue: 4000,
  },
  {
    id: "r2",
    client: "BlueSky Solutions",
    assignedAM: "James Carter",
    renewalDate: "2025-07-30",
    daysRemaining: 30,
    currentStage: "Client Decision",
    salesInvolvement: "Yes - Upsell",
    billingStatus: "Contract Pending",
    renewalRisk: "Medium",
    nextAction: "Follow up on proposal sent",
    contractValue: "$72,000/yr",
    monthlyValue: 6000,
    salesRep: "David Park",
    salesRole: "Upsell Specialist",
    salesStatus: "In Progress",
    salesNotes: "Proposed adding analytics add-on",
  },
  {
    id: "r3",
    client: "NovaTech Inc",
    assignedAM: "Sarah Mitchell",
    renewalDate: "2025-07-22",
    daysRemaining: 22,
    currentStage: "Retention Plan",
    salesInvolvement: "Yes - Retention Risk",
    billingStatus: "Waiting For Renewal Decision",
    renewalRisk: "Critical",
    nextAction: "Schedule leadership review call",
    contractValue: "$96,000/yr",
    monthlyValue: 8000,
    salesRep: "Lisa Chen",
    salesRole: "Retention Specialist",
    salesStatus: "Escalated",
    salesNotes: "Client unhappy with support response times",
    declineReason: "Service quality concerns",
    retentionOffer: "3-month SLA credit + dedicated support",
    retentionOwner: "Sarah Mitchell",
    leadershipReview: "Pending",
  },
  {
    id: "r4",
    client: "Greenfield Media",
    assignedAM: "Rachel Torres",
    renewalDate: "2025-09-01",
    daysRemaining: 62,
    currentStage: "Performance Review",
    salesInvolvement: "Yes - Expansion",
    billingStatus: "Waiting For Renewal Decision",
    renewalRisk: "Low",
    nextAction: "Complete performance review deck",
    contractValue: "$36,000/yr",
    monthlyValue: 3000,
    salesRep: "Tom Walsh",
    salesRole: "Expansion AE",
    salesStatus: "Not Started",
    salesNotes: "Exploring adding 2 new service lines",
  },
  {
    id: "r5",
    client: "Vertex Partners",
    assignedAM: "James Carter",
    renewalDate: "2025-08-05",
    daysRemaining: 36,
    currentStage: "Renewed",
    salesInvolvement: "No",
    billingStatus: "Billing Updated",
    renewalRisk: "Low",
    nextAction: "Confirm billing updated",
    contractValue: "$60,000/yr",
    monthlyValue: 5000,
    outcome: "Renewed",
  },
  {
    id: "r6",
    client: "Summit Digital",
    assignedAM: "Rachel Torres",
    renewalDate: "2025-07-18",
    daysRemaining: 18,
    currentStage: "Renewed With Changes",
    salesInvolvement: "Yes - Contract Change",
    billingStatus: "Services Changed",
    renewalRisk: "Medium",
    nextAction: "Confirm amended contract signed",
    contractValue: "$54,000/yr",
    monthlyValue: 4500,
    salesRep: "David Park",
    salesRole: "Contract Specialist",
    salesStatus: "Complete",
    salesNotes: "Reduced scope, new pricing agreed",
    outcome: "Renewed With Changes",
  },
  {
    id: "r7",
    client: "Cobalt Systems",
    assignedAM: "Sarah Mitchell",
    renewalDate: "2025-10-01",
    daysRemaining: 92,
    currentStage: "Renewal Triggered",
    salesInvolvement: "No",
    billingStatus: "Waiting For Renewal Decision",
    renewalRisk: "Low",
    nextAction: "Send renewal intro email",
    contractValue: "$42,000/yr",
    monthlyValue: 3500,
  },
  {
    id: "r8",
    client: "Harmon & Associates",
    assignedAM: "James Carter",
    renewalDate: "2025-07-10",
    daysRemaining: 10,
    currentStage: "Declined",
    salesInvolvement: "Yes - Pricing Negotiation",
    billingStatus: "Cancelled",
    renewalRisk: "Critical",
    nextAction: "Initiate win-back plan",
    contractValue: "$84,000/yr",
    monthlyValue: 7000,
    salesRep: "Lisa Chen",
    salesRole: "Negotiation Lead",
    salesStatus: "Failed",
    salesNotes: "Price was primary objection",
    declineReason: "Budget constraints",
    retentionOffer: "10% discount on renewal",
    retentionOwner: "James Carter",
    leadershipReview: "Completed",
    outcome: "Declined",
  },
];

interface QBRRecord {
  id: string;
  client: string;
  qbrDate: string;
  amOwner: string;
  meetingStatus: "Scheduled" | "Completed" | "Pending" | "Cancelled";
  performanceSummary: string;
  clientGoals: string;
  wins: string;
  challenges: string;
  roadmap: string;
  upsellOpportunities: string;
  feedbackCaptured: string;
}

const MOCK_QBRS: QBRRecord[] = [
  {
    id: "q1",
    client: "Acme Corp",
    qbrDate: "2025-07-28",
    amOwner: "Sarah Mitchell",
    meetingStatus: "Scheduled",
    performanceSummary: "95% SLA met, 12% YoY growth in usage",
    clientGoals: "Expand into 2 new markets, improve reporting",
    wins: "Onboarded 3 new teams, launched new integration",
    challenges: "Slow response times during peak hours",
    roadmap: "API v2 rollout, dedicated dashboard",
    upsellOpportunities: "Analytics Pro, Priority Support",
    feedbackCaptured: "Pending post-QBR survey",
  },
  {
    id: "q2",
    client: "BlueSky Solutions",
    qbrDate: "2025-07-15",
    amOwner: "James Carter",
    meetingStatus: "Completed",
    performanceSummary: "88% SLA, flat usage, 1 open escalation",
    clientGoals: "Reduce operational costs, improve uptime",
    wins: "Resolved 2 major tickets, improved load times",
    challenges: "Pricing concerns, exploring alternatives",
    roadmap: "Cost optimization roadmap shared",
    upsellOpportunities: "Analytics add-on pitched",
    feedbackCaptured: "Feedback form submitted",
  },
  {
    id: "q3",
    client: "Greenfield Media",
    qbrDate: "2025-08-10",
    amOwner: "Rachel Torres",
    meetingStatus: "Pending",
    performanceSummary: "92% SLA, strong usage growth",
    clientGoals: "Scale to 3 new regions, add automation",
    wins: "Exceeded KPIs Q2, zero critical incidents",
    challenges: "Needs more automation features",
    roadmap: "Automation module Q4",
    upsellOpportunities: "Expansion to 2 new service lines",
    feedbackCaptured: "Not yet",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Badge helpers
// ─────────────────────────────────────────────────────────────────────────────

function stageBadge(stage: RenewalStage) {
  const map: Record<string, string> = {
    "Renewal Triggered": "bg-blue-100 text-blue-700 border-blue-200",
    "Performance Review": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Renewal Prep": "bg-violet-100 text-violet-700 border-violet-200",
    "QBR Scheduled": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "QBR Completed": "bg-teal-100 text-teal-700 border-teal-200",
    "Client Decision": "bg-amber-100 text-amber-700 border-amber-200",
    Renewed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Renewed With Changes": "bg-green-100 text-green-700 border-green-200",
    Declined: "bg-red-100 text-red-700 border-red-200",
    "Retention Plan": "bg-orange-100 text-orange-700 border-orange-200",
    Lost: "bg-slate-200 text-slate-600 border-slate-300",
  };
  return map[stage] ?? "bg-slate-100 text-slate-500 border-slate-200";
}

function riskBadge(risk: RenewalRisk) {
  const map: Record<RenewalRisk, string> = {
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    High: "bg-orange-100 text-orange-700 border-orange-200",
    Critical: "bg-red-100 text-red-700 border-red-200",
  };
  return map[risk];
}

function billingBadge(status: BillingStatus) {
  const map: Record<BillingStatus, string> = {
    "Waiting For Renewal Decision": "bg-slate-100 text-slate-600 border-slate-200",
    "Contract Pending": "bg-amber-100 text-amber-700 border-amber-200",
    "Billing Update Needed": "bg-orange-100 text-orange-700 border-orange-200",
    "Billing Updated": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Services Continued": "bg-green-100 text-green-700 border-green-200",
    "Services Changed": "bg-blue-100 text-blue-700 border-blue-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
  };
  return map[status];
}

function salesBadge(inv: SalesInvolvement) {
  if (inv === "No") return "bg-slate-100 text-slate-500 border-slate-200";
  return "bg-indigo-100 text-indigo-700 border-indigo-200";
}

function meetingBadge(status: QBRRecord["meetingStatus"]) {
  const map: Record<QBRRecord["meetingStatus"], string> = {
    Scheduled: "bg-cyan-100 text-cyan-700 border-cyan-200",
    Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
  };
  return map[status];
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Renewal Project Workflow
// ─────────────────────────────────────────────────────────────────────────────

function RenewalProjectWorkflow() {
  const steps = [
    { label: "Renewal Triggered", owner: "System", color: "bg-blue-600" },
    { label: "Performance Review", owner: "Account Management", color: "bg-indigo-600" },
    { label: "Renewal Prep", owner: "Account Management", color: "bg-violet-600" },
    { label: "QBR Scheduled", owner: "Account Management + Client", color: "bg-cyan-600" },
    { label: "QBR Completed", owner: "Account Management + Client", color: "bg-teal-600" },
    { label: "Client Decision", owner: "Client", color: "bg-amber-600" },
    { label: "Renewal Outcome", owner: "Billing + Leadership", color: "bg-emerald-600" },
  ];

  const owners = [
    { role: "System", color: "bg-blue-500", desc: "Auto-triggers renewal project 90 days before contract end" },
    { role: "Account Management", color: "bg-indigo-500", desc: "Owns full renewal lifecycle — review, prep, QBR, decision" },
    { role: "Client", color: "bg-amber-500", desc: "Participates in QBR, makes renewal decision" },
    { role: "Sales (Optional)", color: "bg-purple-500", desc: "Supports upsell, expansion, negotiation, and retention" },
    { role: "Billing", color: "bg-emerald-500", desc: "Receives renewed terms, updates billing schedule" },
    { role: "Leadership", color: "bg-rose-500", desc: "Reviews at-risk and declined accounts" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Renewal Project Workflow</p>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">Renewal Process Workflow Timeline</h2>
        <p className="text-sm text-slate-500">End-to-end workflow from trigger to outcome.</p>
      </div>

      {/* Timeline */}
      <div className="px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className={`${step.color} rounded-xl px-4 py-3 text-center min-w-[130px]`}>
                <p className="text-xs font-bold text-white">{step.label}</p>
                <p className="text-[10px] text-white/80 mt-0.5">{step.owner}</p>
              </div>
              {i < steps.length - 1 && (
                <span className="text-slate-400 text-lg font-bold">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Owners */}
      <div className="border-t border-slate-100 px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Workflow Owners</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {owners.map((o) => (
            <div key={o.role} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className={`${o.color} rounded-lg px-2 py-1 text-xs font-bold text-white text-center mb-2`}>{o.role}</div>
              <p className="text-[11px] text-slate-500 leading-tight">{o.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Renewal Metrics
// ─────────────────────────────────────────────────────────────────────────────

function RenewalMetrics() {
  const due90 = MOCK_RENEWALS.filter((r) => r.daysRemaining <= 90).length;
  const pipelineValue = MOCK_RENEWALS.reduce((s, r) => s + r.monthlyValue * 12, 0);
  const renewed = MOCK_RENEWALS.filter((r) => r.currentStage === "Renewed" || r.currentStage === "Renewed With Changes").length;
  const total = MOCK_RENEWALS.length;
  const winRate = Math.round((renewed / total) * 100);
  const atRisk = MOCK_RENEWALS.filter((r) => r.renewalRisk === "High" || r.renewalRisk === "Critical").length;
  const upsellPipeline = MOCK_RENEWALS.filter((r) => r.salesInvolvement.includes("Upsell") || r.salesInvolvement.includes("Expansion")).length * 2500 * 12;
  const declined = MOCK_RENEWALS.filter((r) => r.currentStage === "Declined" || r.currentStage === "Lost").length;
  const churnRate = Math.round((declined / total) * 100);

  const cards = [
    { label: "Renewals Due Next 90 Days", value: due90, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "Renewal Pipeline Value", value: `$${(pipelineValue / 1000).toFixed(0)}K/yr`, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    { label: "Renewal Win Rate", value: `${winRate}%`, color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200" },
    { label: "At-Risk Contracts", value: atRisk, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
    { label: "Upsell Pipeline Value", value: `$${(upsellPipeline / 1000).toFixed(0)}K/yr`, color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
    { label: "Churn Rate", value: `${churnRate}%`, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
    { label: "Contract End Dates (90d)", value: MOCK_RENEWALS.filter((r) => r.daysRemaining <= 90).length, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    { label: "Total Tracked Renewals", value: MOCK_RENEWALS.length, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map(({ label, value, color, bg, border }) => (
        <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
          <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Renewal Project Table
// ─────────────────────────────────────────────────────────────────────────────

function RenewalProjectTable() {
  const [stageFilter, setStageFilter] = useState<string>("All");
  const [riskFilter, setRiskFilter] = useState<string>("All");

  const filtered = MOCK_RENEWALS.filter((r) => {
    if (stageFilter !== "All" && r.currentStage !== stageFilter) return false;
    if (riskFilter !== "All" && r.renewalRisk !== riskFilter) return false;
    return true;
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Renewal Project Table</h2>
          <p className="text-sm text-slate-500">Full pipeline with stage, sales, billing, and risk tracking.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5"
          >
            <option value="All">All Stages</option>
            {RENEWAL_STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5"
          >
            <option value="All">All Risk Levels</option>
            {(["Low", "Medium", "High", "Critical"] as RenewalRisk[]).map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Client",
                "Assigned AM",
                "Renewal Date",
                "Days Remaining",
                "Current Stage",
                "Sales Involvement",
                "Billing Status",
                "Renewal Risk",
                "Next Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{r.client}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.assignedAM}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.renewalDate}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`font-bold ${
                      r.daysRemaining <= 14
                        ? "text-red-600"
                        : r.daysRemaining <= 30
                        ? "text-orange-600"
                        : r.daysRemaining <= 60
                        ? "text-amber-600"
                        : "text-slate-700"
                    }`}
                  >
                    {r.daysRemaining}d
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stageBadge(r.currentStage)}`}>
                    {r.currentStage}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${salesBadge(r.salesInvolvement)}`}>
                    {r.salesInvolvement}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${billingBadge(r.billingStatus)}`}>
                    {r.billingStatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${riskBadge(r.renewalRisk)}`}>
                    {r.renewalRisk}
                  </span>
                </td>
                <td className="px-4 py-3 text-blue-700 text-xs max-w-[200px]">{r.nextAction}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                  No renewals match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          {filtered.length} of {MOCK_RENEWALS.length} renewals shown
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: QBR Workspace
// ─────────────────────────────────────────────────────────────────────────────

function QBRWorkspace() {
  const [selectedQBR, setSelectedQBR] = useState<string | null>(null);
  const qbr = MOCK_QBRS.find((q) => q.id === selectedQBR) ?? MOCK_QBRS[0];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">QBR Workspace</p>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">QBR Workspace</h2>
        <p className="text-sm text-slate-500">Manage Quarterly Business Reviews for renewal accounts.</p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* QBR List */}
        <div className="p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">QBR Records</p>
          {MOCK_QBRS.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedQBR(q.id)}
              className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                (selectedQBR ?? MOCK_QBRS[0].id) === q.id
                  ? "border-cyan-300 bg-cyan-50"
                  : "border-slate-100 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-sm font-bold text-slate-800">{q.client}</p>
              <p className="text-xs text-slate-500 mt-0.5">{q.amOwner} · {q.qbrDate}</p>
              <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meetingBadge(q.meetingStatus)}`}>
                {q.meetingStatus}
              </span>
            </button>
          ))}
        </div>

        {/* QBR Detail */}
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">{qbr.client} — QBR</h3>
              <p className="text-sm text-slate-500">{qbr.amOwner} · {qbr.qbrDate}</p>
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${meetingBadge(qbr.meetingStatus)}`}>
              {qbr.meetingStatus}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              { label: "Performance Summary", value: qbr.performanceSummary },
              { label: "Client Goals", value: qbr.clientGoals },
              { label: "Wins", value: qbr.wins },
              { label: "Challenges", value: qbr.challenges },
              { label: "Roadmap", value: qbr.roadmap },
              { label: "Upsell Opportunities", value: qbr.upsellOpportunities },
              { label: "Feedback Captured", value: qbr.feedbackCaptured },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <p className="text-slate-700 text-xs leading-relaxed">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { label: "Schedule QBR", color: "bg-cyan-600 hover:bg-cyan-700" },
              { label: "Prepare QBR Deck", color: "bg-indigo-600 hover:bg-indigo-700" },
              { label: "Mark QBR Complete", color: "bg-emerald-600 hover:bg-emerald-700" },
              { label: "Add Feedback", color: "bg-slate-600 hover:bg-slate-700" },
            ].map(({ label, color }) => (
              <button key={label} className={`${color} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Client Decision Tracking
// ─────────────────────────────────────────────────────────────────────────────

function ClientDecisionTracking() {
  type Decision = "Renew" | "Renew With Changes" | "Decline";
  const [activeDecision, setActiveDecision] = useState<Decision>("Renew");

  const decisionPaths: Record<Decision, { steps: string[]; color: string; bg: string; border: string }> = {
    Renew: {
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      steps: [
        "Create renewal order",
        "Confirm services continue",
        "Send to Billing",
      ],
    },
    "Renew With Changes": {
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      steps: [
        "Adjust scope",
        "Adjust pricing",
        "Optional Sales support",
        "Send updated proposal",
        "Send to Billing after approval",
      ],
    },
    Decline: {
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      steps: [
        "Retention Review",
        "Retention Plan",
        "Leadership Review",
        "Outcome Tracking",
      ],
    },
  };

  const decisionClients: Record<Decision, RenewalProject[]> = {
    Renew: MOCK_RENEWALS.filter((r) => r.currentStage === "Renewed"),
    "Renew With Changes": MOCK_RENEWALS.filter((r) => r.currentStage === "Renewed With Changes"),
    Decline: MOCK_RENEWALS.filter((r) => r.currentStage === "Declined" || r.currentStage === "Retention Plan"),
  };

  const current = decisionPaths[activeDecision];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-bold text-slate-900">Client Decision Tracking</h2>
        <p className="text-sm text-slate-500">Track and act on client renewal decisions.</p>
      </div>

      {/* Decision Tabs */}
      <div className="flex border-b border-slate-100">
        {(["Renew", "Renew With Changes", "Decline"] as Decision[]).map((d) => (
          <button
            key={d}
            onClick={() => setActiveDecision(d)}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeDecision === d
                ? d === "Renew"
                  ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                  : d === "Renew With Changes"
                  ? "border-blue-500 text-blue-700 bg-blue-50"
                  : "border-red-500 text-red-700 bg-red-50"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-4">
        {/* Steps */}
        <div className={`rounded-xl border ${current.border} ${current.bg} p-4`}>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Process Steps — {activeDecision}</p>
          <div className="flex flex-wrap items-center gap-2">
            {current.steps.map((step, i) => (
              <React.Fragment key={step}>
                <div className={`rounded-lg border ${current.border} bg-white px-3 py-2`}>
                  <p className={`text-xs font-semibold ${current.color}`}>{step}</p>
                </div>
                {i < current.steps.length - 1 && <span className="text-slate-300 font-bold">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Client list for this decision */}
        {decisionClients[activeDecision].length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Clients in this decision path ({decisionClients[activeDecision].length})
            </p>
            {decisionClients[activeDecision].map((r) => (
              <div key={r.id} className={`rounded-xl border ${current.border} ${current.bg} px-4 py-3 flex items-center justify-between gap-4`}>
                <div>
                  <p className="text-sm font-bold text-slate-800">{r.client}</p>
                  <p className="text-xs text-slate-500">{r.assignedAM} · Renewal: {r.renewalDate}</p>
                  {r.outcome && <p className="text-xs font-semibold mt-1 text-slate-600">Outcome: {r.outcome}</p>}
                </div>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stageBadge(r.currentStage)}`}>
                  {r.currentStage}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No clients currently at this decision stage.</p>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Optional Sales Involvement
// ─────────────────────────────────────────────────────────────────────────────

function OptionalSalesInvolvement() {
  const withSales = MOCK_RENEWALS.filter((r) => r.salesInvolvement !== "No");

  const salesRoles = [
    { type: "Upsell", desc: "Sales supports upsell conversations and expanded service proposals", color: "bg-violet-100 text-violet-700 border-violet-200" },
    { type: "Expansion", desc: "Sales drives expansion into new teams, regions, or service lines", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    { type: "Pricing Negotiation", desc: "Sales leads pricing negotiation when commercial terms need adjustment", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { type: "Retention Risk", desc: "Sales supports retention offers for at-risk accounts", color: "bg-red-100 text-red-700 border-red-200" },
    { type: "Contract Change", desc: "Sales manages scope and contract change negotiations", color: "bg-blue-100 text-blue-700 border-blue-200" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-purple-600">Optional Sales Involvement</p>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">Optional Sales Involvement</h2>
        <p className="text-sm text-slate-500">
          Sales is optional, not mandatory. Involvement is triggered by specific renewal scenarios.
        </p>
      </div>

      {/* Sales Role Cards */}
      <div className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {salesRoles.map((role) => (
            <div key={role.type} className={`rounded-xl border ${role.color} p-4`}>
              <p className="text-sm font-bold mb-1">Yes — {role.type}</p>
              <p className="text-xs leading-relaxed opacity-80">{role.desc}</p>
            </div>
          ))}
        </div>

        {/* Active Sales Involvement Table */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Active Sales Involvement ({withSales.length} accounts)
          </p>
          {withSales.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Client", "Sales Assistance Required", "Assigned Sales Rep", "Sales Role", "Sales Status", "Sales Notes"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {withSales.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{r.client}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${salesBadge(r.salesInvolvement)}`}>
                          {r.salesInvolvement}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.salesRep ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.salesRole ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.salesStatus ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs max-w-[200px]">{r.salesNotes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No active sales involvement.</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Billing Renewal Handoff
// ─────────────────────────────────────────────────────────────────────────────

function BillingRenewalHandoff() {
  const billingRows = MOCK_RENEWALS.map((r) => ({
    ...r,
    updatedServices: r.currentStage === "Renewed With Changes" ? "Adjusted scope" : "Same as contract",
    updatedMonthlyValue: `$${r.monthlyValue.toLocaleString()}/mo`,
    contractStatus: r.currentStage === "Renewed" || r.currentStage === "Renewed With Changes" ? "Active" : r.currentStage === "Declined" ? "Cancelled" : "Pending",
    billingOwner: "Billing Team",
    billingNextAction:
      r.billingStatus === "Billing Update Needed"
        ? "Update billing schedule"
        : r.billingStatus === "Billing Updated"
        ? "Confirm schedule active"
        : r.billingStatus === "Cancelled"
        ? "Cancel subscription"
        : "Await renewal decision",
  }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Billing Renewal Handoff</p>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">Billing Renewal Handoff</h2>
        <p className="text-sm text-slate-500">Billing receives renewed terms after client decision is finalized.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Client",
                "Renewal Outcome",
                "Updated Services",
                "Updated Monthly Value",
                "Contract Status",
                "Billing Schedule Status",
                "Billing Owner",
                "Billing Next Action",
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {billingRows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{r.client}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stageBadge(r.currentStage)}`}>
                    {r.currentStage}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{r.updatedServices}</td>
                <td className="px-4 py-3 font-semibold text-emerald-700 whitespace-nowrap">{r.updatedMonthlyValue}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.contractStatus}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${billingBadge(r.billingStatus)}`}>
                    {r.billingStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.billingOwner}</td>
                <td className="px-4 py-3 text-blue-700 text-xs max-w-[180px]">{r.billingNextAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Retention Center
// ─────────────────────────────────────────────────────────────────────────────

function RetentionCenter() {
  const atRisk = MOCK_RENEWALS.filter(
    (r) =>
      r.currentStage === "Declined" ||
      r.currentStage === "Retention Plan" ||
      r.currentStage === "Lost" ||
      r.renewalRisk === "High" ||
      r.renewalRisk === "Critical"
  );

  const retentionActions = [
    { label: "Create Win-back Plan", color: "bg-indigo-600 hover:bg-indigo-700" },
    { label: "Offer Special Terms", color: "bg-violet-600 hover:bg-violet-700" },
    { label: "Escalate To Leadership", color: "bg-red-600 hover:bg-red-700" },
    { label: "Capture Feedback", color: "bg-slate-600 hover:bg-slate-700" },
    { label: "Close Renewal Project", color: "bg-slate-700 hover:bg-slate-800" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-red-600">Retention Center</p>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">Retention Center</h2>
        <p className="text-sm text-slate-500">
          Manage declined, at-risk, and lost renewals. Track retention offers, leadership reviews, and outcomes.
        </p>
      </div>

      {/* Actions */}
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Retention Actions</p>
        <div className="flex flex-wrap gap-2">
          {retentionActions.map(({ label, color }) => (
            <button key={label} className={`${color} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Retention Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Client",
                "Decline Reason",
                "Risk Level",
                "Retention Owner",
                "Retention Offer",
                "Leadership Review",
                "Outcome",
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {atRisk.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{r.client}</td>
                <td className="px-4 py-3 text-slate-600 text-xs max-w-[160px]">{r.declineReason ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${riskBadge(r.renewalRisk)}`}>
                    {r.renewalRisk}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.retentionOwner ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600 text-xs max-w-[200px]">{r.retentionOffer ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.leadershipReview ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.outcome ? (
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stageBadge(r.currentStage)}`}>
                      {r.outcome}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">In Progress</span>
                  )}
                </td>
              </tr>
            ))}
            {atRisk.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No at-risk or declined accounts.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">{atRisk.length} accounts in retention or at risk</p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Renewal Timeline
// ─────────────────────────────────────────────────────────────────────────────

function RenewalTimeline() {
  const milestones = [
    {
      label: "90 Days Out",
      color: "bg-blue-600",
      border: "border-blue-200",
      bg: "bg-blue-50",
      tasks: [
        { task: "Auto-create renewal project", owner: "System", status: "Automated" },
        { task: "Assign AM to renewal", owner: "System", status: "Automated" },
        { task: "Send renewal intro email to client", owner: "Account Management", status: "Pending" },
      ],
    },
    {
      label: "60 Days Out",
      color: "bg-indigo-600",
      border: "border-indigo-200",
      bg: "bg-indigo-50",
      tasks: [
        { task: "Complete performance review", owner: "Account Management", status: "Pending" },
        { task: "60-day reminder notification", owner: "System", status: "Automated" },
        { task: "Prepare QBR agenda", owner: "Account Management", status: "Pending" },
      ],
    },
    {
      label: "30 Days Out",
      color: "bg-amber-600",
      border: "border-amber-200",
      bg: "bg-amber-50",
      tasks: [
        { task: "Schedule and hold QBR", owner: "Account Management + Client", status: "Pending" },
        { task: "30-day reminder notification", owner: "System", status: "Automated" },
        { task: "Identify upsell opportunities", owner: "Account Management", status: "Pending" },
        { task: "Engage Sales if needed", owner: "Account Management", status: "Optional" },
      ],
    },
    {
      label: "14 Days Out",
      color: "bg-orange-600",
      border: "border-orange-200",
      bg: "bg-orange-50",
      tasks: [
        { task: "Capture client decision", owner: "Account Management", status: "Critical" },
        { task: "14-day reminder notification", owner: "System", status: "Automated" },
        { task: "Send renewal proposal if changes", owner: "Account Management", status: "If Applicable" },
      ],
    },
    {
      label: "Renewal Date",
      color: "bg-emerald-600",
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      tasks: [
        { task: "Process renewal with Billing", owner: "Billing", status: "Action Required" },
        { task: "Confirm services continue or change", owner: "Billing", status: "Action Required" },
        { task: "Initiate retention plan if declined", owner: "Account Management + Leadership", status: "If Declined" },
        { task: "Record final outcome", owner: "Account Management", status: "Required" },
      ],
    },
  ];

  function statusPill(status: string) {
    if (status === "Automated") return "bg-blue-100 text-blue-700 border-blue-200";
    if (status === "Critical" || status === "Action Required") return "bg-red-100 text-red-700 border-red-200";
    if (status === "Optional") return "bg-slate-100 text-slate-500 border-slate-200";
    if (status === "If Applicable" || status === "If Declined") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-bold text-slate-900">Renewal Timeline</h2>
        <p className="text-sm text-slate-500">Task-level breakdown by milestone — 90 days out through renewal date.</p>
      </div>

      <div className="p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {milestones.map((m) => (
            <div key={m.label} className={`rounded-xl border ${m.border} ${m.bg} p-4 space-y-3`}>
              <div className={`${m.color} rounded-lg px-3 py-2 text-center`}>
                <p className="text-sm font-bold text-white">{m.label}</p>
              </div>
              <div className="space-y-2">
                {m.tasks.map((t) => (
                  <div key={t.task} className="rounded-lg border border-white bg-white p-2 shadow-sm">
                    <p className="text-xs font-semibold text-slate-700 leading-tight">{t.task}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.owner}</p>
                    <span className={`mt-1 inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${statusPill(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Renewal Automations
// ─────────────────────────────────────────────────────────────────────────────

function RenewalAutomations() {
  const automations = [
    {
      title: "Auto-Create Renewal Project",
      description: "Automatically creates a renewal project 90 days before the contract end date.",
      trigger: "90 days before contract end",
      owner: "System",
      status: "Active",
      icon: "⚙️",
      color: "border-blue-200 bg-blue-50",
    },
    {
      title: "60-Day Reminder Notification",
      description: "Sends reminder notifications to the assigned AM 60 days before renewal.",
      trigger: "60 days before renewal date",
      owner: "System → AM",
      status: "Active",
      icon: "🔔",
      color: "border-indigo-200 bg-indigo-50",
    },
    {
      title: "30-Day Reminder Notification",
      description: "Sends escalated reminders at 30 days; flags account as high priority.",
      trigger: "30 days before renewal date",
      owner: "System → AM",
      status: "Active",
      icon: "⚠️",
      color: "border-amber-200 bg-amber-50",
    },
    {
      title: "14-Day Critical Alert",
      description: "Sends critical alerts if no client decision is recorded within 14 days.",
      trigger: "14 days before renewal date",
      owner: "System → AM + Leadership",
      status: "Active",
      icon: "🚨",
      color: "border-orange-200 bg-orange-50",
    },
    {
      title: "Auto-Assign Renewal Tasks",
      description: "Automatically assigns renewal tasks to AM, Sales (if triggered), and Billing based on account status.",
      trigger: "On renewal project creation",
      owner: "System",
      status: "Active",
      icon: "👥",
      color: "border-violet-200 bg-violet-50",
    },
    {
      title: "Pipeline & Churn Risk Dashboard",
      description: "Dashboard tracks renewal pipeline value, churn risk, and upsell opportunities in real time.",
      trigger: "Continuous",
      owner: "System → AM + Leadership",
      status: "Active",
      icon: "📊",
      color: "border-emerald-200 bg-emerald-50",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-bold text-slate-900">Renewal Automations</h2>
        <p className="text-sm text-slate-500">System-driven automation rules for the renewal lifecycle.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {automations.map((a) => (
          <div key={a.title} className={`rounded-xl border ${a.color} p-5 space-y-2`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{a.icon}</span>
              <p className="text-sm font-bold text-slate-800">{a.title}</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{a.description}</p>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Trigger</span>
                <span className="font-semibold text-slate-600">{a.trigger}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Owner</span>
                <span className="font-semibold text-slate-600">{a.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-emerald-600">{a.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

type Tab =
  | "workflow"
  | "projects"
  | "qbr"
  | "decisions"
  | "sales"
  | "billing"
  | "retention"
  | "timeline"
  | "automations";

const TABS: { id: Tab; label: string }[] = [
  { id: "workflow", label: "Workflow" },
  { id: "projects", label: "Projects" },
  { id: "qbr", label: "QBR Workspace" },
  { id: "decisions", label: "Client Decisions" },
  { id: "sales", label: "Sales Involvement" },
  { id: "billing", label: "Billing Handoff" },
  { id: "retention", label: "Retention Center" },
  { id: "timeline", label: "Timeline" },
  { id: "automations", label: "Automations" },
];

export default function RenewalsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("workflow");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Renewals</h1>
        <p className="text-sm text-slate-500 mt-1">
          End-to-end renewal management — workflow, QBR, client decisions, sales involvement, billing handoff, and retention.
        </p>
      </div>

      {/* Metrics */}
      <RenewalMetrics />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "workflow" && <RenewalProjectWorkflow />}
        {activeTab === "projects" && <RenewalProjectTable />}
        {activeTab === "qbr" && <QBRWorkspace />}
        {activeTab === "decisions" && <ClientDecisionTracking />}
        {activeTab === "sales" && <OptionalSalesInvolvement />}
        {activeTab === "billing" && <BillingRenewalHandoff />}
        {activeTab === "retention" && <RetentionCenter />}
        {activeTab === "timeline" && <RenewalTimeline />}
        {activeTab === "automations" && <RenewalAutomations />}
      </div>
    </div>
  );
}
