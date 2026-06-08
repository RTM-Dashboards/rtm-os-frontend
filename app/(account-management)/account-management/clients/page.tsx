"use client";

import React, { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("account-management")!;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const kpiData = [
  { title: "Total Active Clients",          value: "47",  subtitle: "Across all AMs",      trend: "up"      as const, trendValue: "+3" },
  { title: "Recurring Clients",             value: "38",  subtitle: "Retained month-over-month", trend: "up" as const, trendValue: "+1" },
  { title: "New Onboarding Clients",        value: "6",   subtitle: "In progress",          trend: "neutral" as const, trendValue: "0"  },
  { title: "At-Risk Clients",               value: "5",   subtitle: "Need immediate attention", trend: "down" as const, trendValue: "+2" },
  { title: "Clients With Late Payments",    value: "4",   subtitle: "Past due 30+ days",    trend: "down"    as const, trendValue: "+1" },
  { title: "Clients With Delayed Deliverables", value: "7", subtitle: "Behind schedule",   trend: "down"    as const, trendValue: "+2" },
  { title: "Renewals Due (30 days)",        value: "9",   subtitle: "Upcoming renewals",    trend: "neutral" as const, trendValue: "0"  },
  { title: "Upsell Opportunities",          value: "12",  subtitle: "Identified pipeline",  trend: "up"      as const, trendValue: "+4" },
];

const directoryClients = [
  {
    name: "Apex Roofing",        industry: "Home Services", location: "Phoenix, AZ",   am: "Jordan M.", services: 6, paymentStatus: "Current",   healthScore: 92, onboarding: "Complete",   renewal: "Mar 2026", lastCheckin: "Jan 10", nextAction: "Quarterly Review",
  },
  {
    name: "Sunbelt HVAC",        industry: "Home Services", location: "Dallas, TX",    am: "Sarah K.",  services: 4, paymentStatus: "Late",      healthScore: 54, onboarding: "Complete",   renewal: "Feb 2026", lastCheckin: "Jan 5",  nextAction: "Escalation Call",
  },
  {
    name: "Pacific Dental",      industry: "Healthcare",    location: "San Diego, CA", am: "Jordan M.", services: 5, paymentStatus: "Current",   healthScore: 88, onboarding: "Complete",   renewal: "Apr 2026", lastCheckin: "Jan 12", nextAction: "Upsell Discussion",
  },
  {
    name: "Harbor Auto Group",   industry: "Automotive",    location: "Seattle, WA",   am: "Mike T.",   services: 3, paymentStatus: "Pending",   healthScore: 71, onboarding: "Complete",   renewal: "Jun 2026", lastCheckin: "Dec 28", nextAction: "Check-in Call",
  },
  {
    name: "Blue Ridge Plumbing", industry: "Home Services", location: "Denver, CO",    am: "Alex R.",   services: 2, paymentStatus: "Current",   healthScore: 65, onboarding: "In Progress",renewal: "Jul 2026", lastCheckin: "Jan 8",  nextAction: "Onboarding Kickoff",
  },
  {
    name: "Metro Dental",        industry: "Healthcare",    location: "Chicago, IL",   am: "Sarah K.",  services: 7, paymentStatus: "Current",   healthScore: 94, onboarding: "Complete",   renewal: "May 2026", lastCheckin: "Jan 14", nextAction: "Reporting Review",
  },
  {
    name: "Summit Landscaping",  industry: "Landscaping",   location: "Austin, TX",    am: "Jordan M.", services: 5, paymentStatus: "Current",   healthScore: 82, onboarding: "Complete",   renewal: "Aug 2026", lastCheckin: "Jan 9",  nextAction: "Renewal Prep",
  },
  {
    name: "Green Valley Pools",  industry: "Home Services", location: "Tampa, FL",     am: "Alex R.",   services: 4, paymentStatus: "Overdue",   healthScore: 77, onboarding: "Complete",   renewal: "Sep 2026", lastCheckin: "Jan 3",  nextAction: "Payment Follow-up",
  },
];

const healthVariant = (score: number) => {
  if (score >= 85) return "success" as const;
  if (score >= 70) return "info"    as const;
  if (score >= 55) return "warning" as const;
  return "error" as const;
};
const paymentVariant = (s: string) => {
  if (s === "Current")  return "success" as const;
  if (s === "Pending")  return "warning" as const;
  return "error" as const;
};
const onboardingVariant = (s: string) => s === "Complete" ? "success" as const : "info" as const;

// ── Client Lifecycle Engine ──────────────────────────────────────────────────

const CLC_STAGES = [
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

const CLC_OWNER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Sales":              { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Billing":            { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Account Management": { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
};

function ClientLifecycleEngine({ activeStages }: { activeStages?: string[] }) {
  const active = activeStages ?? [];
  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Client Lifecycle Status Engine</p>
        <div className="flex gap-2">
          {Object.entries(CLC_OWNER_COLORS).map(([owner, c]) => (
            <span key={owner} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: c.bg, color: c.text, borderColor: c.border }}>{owner}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {CLC_STAGES.map((s, i) => {
          const c = CLC_OWNER_COLORS[s.owner];
          const isActive = active.includes(s.stage);
          return (
            <React.Fragment key={s.stage}>
              <div
                className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                style={{
                  background: isActive ? s.color : c.bg,
                  color: isActive ? "#fff" : c.text,
                  borderColor: isActive ? s.color : c.border,
                  opacity: active.length === 0 || isActive ? 1 : 0.5,
                }}
              >
                {s.stage}
              </div>
              {i < CLC_STAGES.length - 1 && <span className="text-[10px]" style={{ color: "var(--rtm-border)" }}>→</span>}
            </React.Fragment>
          );
        })}
      </div>
      <p className="text-xs font-semibold" style={{ color: "#065F46" }}>
        ⚠️ Account Management starts only after <strong>Ready For Assignment</strong> (Billing-confirmed).
      </p>
    </div>
  );
}

// ─── Selected Client Mock ─────────────────────────────────────────────────────

const selectedClient = {
  name:          "Apex Roofing",
  industry:      "Home Services",
  website:       "apexroofing.com",
  location:      "Phoenix, AZ",
  am:            "Jordan M.",
  contractValue: "$4,200 / mo",
  contractStart: "Jan 2024",
  renewal:       "Mar 2026",
  paymentStatus: "Current",
  healthScore:   92,
  services:      ["SEO", "GBP", "Meta Ads", "Google Ads", "LSA", "Reporting"],
};

// ─── Tab Content Data ─────────────────────────────────────────────────────────

const clientServices = [
  { name: "SEO",                  status: "Active",  owner: "Jordan M.", launch: "Feb 2024", perf: "On Track",  next: "Monthly Report"       },
  { name: "GBP",                  status: "Active",  owner: "Sarah K.",  launch: "Feb 2024", perf: "On Track",  next: "Review Listings"      },
  { name: "Yelp",                 status: "Paused",  owner: "Mike T.",   launch: "—",        perf: "Paused",    next: "Reactivation Call"    },
  { name: "Meta Ads",             status: "Active",  owner: "Jordan M.", launch: "Mar 2024", perf: "Exceeding", next: "Budget Review"        },
  { name: "Google Ads",           status: "Active",  owner: "Jordan M.", launch: "Mar 2024", perf: "On Track",  next: "Bid Optimization"     },
  { name: "LSA",                  status: "Active",  owner: "Alex R.",   launch: "Apr 2024", perf: "On Track",  next: "Verification Update"  },
  { name: "Content",              status: "Pending", owner: "Alex R.",   launch: "—",        perf: "Pending",   next: "Content Brief"        },
  { name: "Website Development",  status: "Paused",  owner: "Mike T.",   launch: "—",        perf: "Paused",    next: "Scope Review"         },
  { name: "Reporting",            status: "Active",  owner: "Jordan M.", launch: "Feb 2024", perf: "On Track",  next: "Q1 Report Due"        },
];

const clientTasks = [
  { task: "Send Q1 Report",         dept: "Reporting", owner: "Jordan M.", due: "Jan 20", status: "In Progress", priority: "High",   notes: "Client requested early delivery" },
  { task: "Meta Ads Creative",      dept: "Paid Media", owner: "Sarah K.", due: "Jan 18", status: "Pending",    priority: "High",   notes: "New creative set needed"         },
  { task: "LSA Profile Update",     dept: "SEO",        owner: "Alex R.",  due: "Jan 22", status: "Pending",    priority: "Medium", notes: "License renewal required"        },
  { task: "Monthly Check-in Call",  dept: "AM",         owner: "Jordan M.", due: "Jan 15", status: "Done",      priority: "Medium", notes: "Completed on time"               },
  { task: "GBP Photo Update",       dept: "SEO",        owner: "Sarah K.", due: "Jan 25", status: "Pending",    priority: "Low",    notes: "Seasonal photos needed"          },
];

const checkinHistory = [
  { date: "Jan 10, 2025", type: "Quarterly Review", notes: "Client happy with leads, requested budget increase on Meta Ads.", followUp: "Submit budget change request to Paid Media team.", next: "Apr 10, 2025" },
  { date: "Dec 12, 2024", type: "Monthly Check-in", notes: "Reviewed November report. Discussed winter seasonality strategy.", followUp: "Seasonal content plan.", next: "Jan 10, 2025" },
];

const reportsData = {
  lastSent: "Dec 5, 2024",  nextDue: "Jan 20, 2025", owner: "Jordan M.",
  reportStatus: "In Progress", qa: "Pending", approval: "Not Started",
};

const clientReportDetails = {
  lastReportSent:    "Dec 5, 2024",
  nextReportDue:     "Jan 20, 2025",
  reportOwner:       "Jordan M.",
  reportStatus:      "Drafting",
  qaStatus:          "Pending",
  amReviewStatus:    "Not Started",
  clientApproval:    "Not Started",
  reportingNotes:    "Client requested delivery by Jan 18. Jordan M. is coordinating with Paid Media for ad spend data. Awaiting GBP insights from Sarah K.",
  deptInputs: [
    { dept: "SEO",        input: "Rankings snapshot + traffic report", owner: "Sarah K.",  due: "Jan 17", status: "In Progress" },
    { dept: "Meta Ads",   input: "Campaign performance summary",       owner: "Jordan M.", due: "Jan 16", status: "Done"        },
    { dept: "Google Ads", input: "Ad spend + conversion data",         owner: "Jordan M.", due: "Jan 16", status: "Done"        },
    { dept: "LSA",        input: "Lead data + verification status",    owner: "Alex R.",   due: "Jan 18", status: "Pending"     },
    { dept: "GBP",        input: "GBP insights export",                owner: "Sarah K.",  due: "Jan 17", status: "Pending"     },
  ],
};

const reportDeptStatusStyle = (s: string) => {
  if (s === "Done")        return "bg-green-100 text-green-700";
  if (s === "In Progress") return "bg-blue-100 text-blue-700";
  if (s === "Overdue")     return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
};

const renewalData = {
  date: "Mar 2026", probability: "High (85%)", upsell: "Content + Website Dev",
  revenueForecast: "$5,800 / mo", status: "Active",
};

const healthData = {
  score: 92, risk: "Low", reasons: ["No payment issues", "Consistent engagement", "Positive ROI reported"],
  recommendations: ["Introduce upsell for Content & Web Dev", "Schedule Q2 planning session", "Increase GBP posting cadence"],
  weather: "January is off-peak for roofing in Phoenix. Recommend nurture content and pre-spring promotion prep.",
  escalations: "None",
};

const PROFILE_TABS = ["Overview", "Onboarding", "Services", "Tasks", "Health", "Check-ins", "Reports", "Renewals", "Notes", "Documents"] as const;
type ProfileTab = typeof PROFILE_TABS[number];

const AM_OPTIONS     = ["All AMs", "Jordan M.", "Sarah K.", "Mike T.", "Alex R."];
const STATUS_OPTIONS = ["All Statuses", "Healthy", "At Risk", "Watch", "Onboarding"];
const SERVICE_OPTIONS= ["All Services", "SEO", "GBP", "Meta Ads", "Google Ads", "LSA", "Content", "Website Dev", "Reporting"];
const PAYMENT_OPTIONS= ["All Payments", "Current", "Pending", "Late", "Overdue"];
const HEALTH_OPTIONS = ["All Health", "85+", "70–84", "55–69", "<55"];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AccountClientsPage() {
  const [activeTab,       setActiveTab]       = useState<ProfileTab>("Overview");
  const [selectedRow,     setSelectedRow]     = useState<string>("Apex Roofing");
  const [filterAM,        setFilterAM]        = useState("All AMs");
  const [filterStatus,    setFilterStatus]    = useState("All Statuses");
  const [filterService,   setFilterService]   = useState("All Services");
  const [filterPayment,   setFilterPayment]   = useState("All Payments");
  const [filterHealth,    setFilterHealth]    = useState("All Health");

  const filteredClients = directoryClients.filter((c) => {
    if (filterAM      !== "All AMs"       && c.am             !== filterAM)      return false;
    if (filterPayment !== "All Payments"  && c.paymentStatus  !== filterPayment) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Client Command Center
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Single source of truth for all client management — portfolio, health, services, tasks, and renewals.
        </p>
      </div>

      {/* ── Client Lifecycle Status ─────────────────────────────────────────── */}
      <section aria-label="Client Lifecycle Status">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Client Lifecycle Status
        </h2>
        <ClientLifecycleEngine activeStages={["Assigned","Onboarding","Service Activation","Department Launch","Active","Renewal Triggered","QBR Scheduled","Renewal Negotiation","Renewed"]} />
      </section>

      {/* ── SECTION 1 — Client Portfolio Overview ───────────────────────────── */}
      <section aria-label="Client Portfolio Overview">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Client Portfolio Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiData.map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              trend={kpi.trend}
              trendValue={kpi.trendValue}
              accentColor={workspace.accentColor}
            />
          ))}
        </div>
      </section>

      {/* ── SECTION 2 — Client Directory ────────────────────────────────────── */}
      <section aria-label="Client Directory">
        <SectionWrapper
          title="Client Directory"
          description={`${filteredClients.length} clients`}
          actions={
            <button className="rtm-btn-primary text-xs">+ Add Client</button>
          }
        >
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { label: "Account Manager", value: filterAM,      set: setFilterAM,      options: AM_OPTIONS      },
              { label: "Client Status",   value: filterStatus,  set: setFilterStatus,  options: STATUS_OPTIONS  },
              { label: "Service Type",    value: filterService, set: setFilterService, options: SERVICE_OPTIONS },
              { label: "Payment Status",  value: filterPayment, set: setFilterPayment, options: PAYMENT_OPTIONS },
              { label: "Health Status",   value: filterHealth,  set: setFilterHealth,  options: HEALTH_OPTIONS  },
            ].map(({ label, value, set, options }) => (
              <select
                key={label}
                value={value}
                onChange={(e) => set(e.target.value)}
                className="text-xs rounded-lg border px-2.5 py-1.5"
                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                aria-label={label}
              >
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                  {["Client", "Industry", "Location", "Assigned AM", "Active Services", "Payment Status", "Health Score", "Onboarding Status", "Renewal Date", "Last Check-in", "Next Action"].map((col) => (
                    <th key={col} className="text-left py-2 px-3 font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((c) => {
                  const isSelected = c.name === selectedRow;
                  return (
                    <tr
                      key={c.name}
                      onClick={() => setSelectedRow(c.name)}
                      className="cursor-pointer transition-colors"
                      style={{
                        background: isSelected ? "var(--rtm-blue-light)" : undefined,
                        borderBottom: "1px solid var(--rtm-border-light)",
                      }}
                    >
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{c.industry}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{c.location}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{c.am}</td>
                      <td className="py-2.5 px-3 text-center" style={{ color: "var(--rtm-text-secondary)" }}>{c.services}</td>
                      <td className="py-2.5 px-3"><StatusBadge variant={paymentVariant(c.paymentStatus)} label={c.paymentStatus} size="sm" /></td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold" style={{ color: c.healthScore >= 85 ? "#059669" : c.healthScore >= 70 ? "#2563EB" : c.healthScore >= 55 ? "#D97706" : "#DC2626" }}>
                          {c.healthScore}
                        </span>
                        <StatusBadge variant={healthVariant(c.healthScore)} label="" size="sm" />
                      </td>
                      <td className="py-2.5 px-3"><StatusBadge variant={onboardingVariant(c.onboarding)} label={c.onboarding} size="sm" /></td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{c.renewal}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{c.lastCheckin}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{c.nextAction}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      </section>

      {/* ── SECTION 3 — Selected Client Profile ─────────────────────────────── */}
      <section aria-label="Selected Client Profile">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Selected Client Profile
        </h2>
        <SectionWrapper
          title={selectedClient.name}
          description="Client workspace — full profile, tabs, and action center"
          actions={
            <StatusBadge variant={healthVariant(selectedClient.healthScore)} label={`Health: ${selectedClient.healthScore}`} size="sm" />
          }
        >
          {/* Profile Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Industry",       value: selectedClient.industry       },
              { label: "Website",        value: selectedClient.website        },
              { label: "Location",       value: selectedClient.location       },
              { label: "Assigned AM",    value: selectedClient.am             },
              { label: "Contract Value", value: selectedClient.contractValue  },
              { label: "Contract Start", value: selectedClient.contractStart  },
              { label: "Renewal Date",   value: selectedClient.renewal        },
              { label: "Payment Status", value: selectedClient.paymentStatus  },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Active Services chips */}
          <div className="mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Active Services</p>
            <div className="flex flex-wrap gap-2">
              {selectedClient.services.map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* ── SECTION 4 — Client Profile Tabs ─────────────────────────────── */}
          <section aria-label="Client Profile Tabs">
            <div
              className="flex flex-wrap gap-1 mb-5 rounded-lg p-1"
              style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}
            >
              {PROFILE_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                  style={{
                    background: activeTab === tab ? "var(--rtm-surface)" : "transparent",
                    color:      activeTab === tab ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)",
                    boxShadow:  activeTab === tab ? "0 1px 3px rgba(15,28,56,0.08)" : "none",
                    fontWeight: activeTab === tab ? "600" : "500",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ── SECTION 5 — Overview Tab ──────────────────────────────────── */}
            {activeTab === "Overview" && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>Account Summary</h3>
                <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                  Apex Roofing has been a client since January 2024. They are enrolled in 6 active services with strong performance across paid media and SEO. Revenue is on track and renewal probability is high.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>Current Goals</p>
                    <ul className="space-y-1 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                      <li>• Increase inbound calls by 20% Q1</li>
                      <li>• Improve GBP ranking in Phoenix market</li>
                      <li>• Launch spring roofing promo campaign</li>
                      <li>• Reduce cost-per-lead on Google Ads</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>Primary Contacts</p>
                    <div className="space-y-2">
                      {[
                        { name: "Marcus Webb",   role: "Owner",               email: "marcus@apexroofing.com" },
                        { name: "Linda Torres",  role: "Office Manager",      email: "linda@apexroofing.com"  },
                        { name: "Jordan M.",     role: "Account Manager (RTM)", email: "jordan@rtm.com"       },
                      ].map((c) => (
                        <div key={c.name}>
                          <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.name} <span className="font-normal" style={{ color: "var(--rtm-text-muted)" }}>· {c.role}</span></p>
                          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>Recent Activity</p>
                  <div className="space-y-2">
                    {[
                      { date: "Jan 14", event: "Q1 Report started by Jordan M." },
                      { date: "Jan 10", event: "Quarterly check-in completed — client satisfied, requested Meta budget increase." },
                      { date: "Jan 8",  event: "LSA profile submitted for verification." },
                      { date: "Jan 5",  event: "GBP photo batch uploaded (12 photos)." },
                    ].map((a, i) => (
                      <div key={i} className="flex gap-3 text-xs">
                        <span className="font-medium w-10 flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }}>{a.date}</span>
                        <span style={{ color: "var(--rtm-text-secondary)" }}>{a.event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-blue)", background: "var(--rtm-blue-light)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-blue)" }}>✦ AI Client Summary</p>
                  <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                    Apex Roofing is performing well across all active services. Health score is 92 (Healthy). The account is on track for renewal in March 2026 with a high probability. Recommended focus: introduce Content and Website Development upsell in next check-in. Watch for spring seasonality opportunity — roofing demand typically surges in Phoenix from March through May.
                  </p>
                </div>
              </div>
            )}

            {/* ── SECTION 6 — Onboarding Tab ───────────────────────────────── */}
            {activeTab === "Onboarding" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge variant="success" label="Onboarding Complete" size="sm" />
                  <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Linked to /account-management/onboarding</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Intake Status",         value: "Complete",    variant: "success" as const },
                    { label: "Asset Collection",      value: "Complete",    variant: "success" as const },
                    { label: "Service Activation",    value: "Complete",    variant: "success" as const },
                    { label: "Department Launch",     value: "Complete",    variant: "success" as const },
                    { label: "Readiness Score",       value: "100 / 100",   variant: "success" as const },
                    { label: "Onboarding Status",     value: "Complete",    variant: "success" as const },
                  ].map(({ label, value, variant }) => (
                    <div key={label} className="rounded-lg border p-3" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                      <p className="text-sm font-semibold mt-1" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
                      <div className="mt-1"><StatusBadge variant={variant} label={variant === "success" ? "Done" : "Pending"} size="sm" /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION 7 — Services Tab ─────────────────────────────────── */}
            {activeTab === "Services" && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                      {["Service", "Status", "Owner", "Launch Date", "Performance", "Next Action"].map((h) => (
                        <th key={h} className="text-left py-2 px-3 font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clientServices.map((s) => {
                      const statusVar = s.status === "Active" ? "success" as const : s.status === "Pending" ? "info" as const : "warning" as const;
                      const perfVar   = s.perf === "Exceeding" ? "success" as const : s.perf === "On Track" ? "info" as const : s.perf === "Pending" ? "warning" as const : "warning" as const;
                      return (
                        <tr key={s.name} style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                          <td className="py-2.5 px-3 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{s.name}</td>
                          <td className="py-2.5 px-3"><StatusBadge variant={statusVar} label={s.status} size="sm" /></td>
                          <td className="py-2.5 px-3" style={{ color: "var(--rtm-text-secondary)" }}>{s.owner}</td>
                          <td className="py-2.5 px-3" style={{ color: "var(--rtm-text-secondary)" }}>{s.launch}</td>
                          <td className="py-2.5 px-3"><StatusBadge variant={perfVar} label={s.perf} size="sm" /></td>
                          <td className="py-2.5 px-3" style={{ color: "var(--rtm-text-secondary)" }}>{s.next}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── SECTION 8 — Tasks Tab ─────────────────────────────────────── */}
            {activeTab === "Tasks" && (
              <div className="space-y-2">
                <p className="text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>Linked to /account-management/tasks-central</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                        {["Task", "Department", "Owner", "Due Date", "Status", "Priority", "Notes"].map((h) => (
                          <th key={h} className="text-left py-2 px-3 font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clientTasks.map((t) => {
                        const statusVar   = t.status === "Done" ? "success" as const : t.status === "In Progress" ? "info" as const : "warning" as const;
                        const priorityVar = t.priority === "High" ? "error" as const : t.priority === "Medium" ? "warning" as const : "info" as const;
                        return (
                          <tr key={t.task} style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                            <td className="py-2.5 px-3 font-medium" style={{ color: "var(--rtm-text-primary)" }}>{t.task}</td>
                            <td className="py-2.5 px-3" style={{ color: "var(--rtm-text-secondary)" }}>{t.dept}</td>
                            <td className="py-2.5 px-3" style={{ color: "var(--rtm-text-secondary)" }}>{t.owner}</td>
                            <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{t.due}</td>
                            <td className="py-2.5 px-3"><StatusBadge variant={statusVar} label={t.status} size="sm" /></td>
                            <td className="py-2.5 px-3"><StatusBadge variant={priorityVar} label={t.priority} size="sm" /></td>
                            <td className="py-2.5 px-3" style={{ color: "var(--rtm-text-muted)" }}>{t.notes}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── SECTION 9 — Health Tab ────────────────────────────────────── */}
            {activeTab === "Health" && (
              <div className="space-y-4">
                <p className="text-xs mb-1" style={{ color: "var(--rtm-text-muted)" }}>Linked to /account-management/client-health</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border p-4 text-center" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>Health Score</p>
                    <p className="text-3xl font-bold" style={{ color: "#059669" }}>{healthData.score}</p>
                    <StatusBadge variant="success" label="Healthy" size="sm" />
                  </div>
                  <div className="rounded-lg border p-4 text-center" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>Risk Status</p>
                    <p className="text-xl font-bold mt-1" style={{ color: "var(--rtm-text-primary)" }}>{healthData.risk}</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>Escalations</p>
                    <p className="text-xl font-bold mt-1" style={{ color: "var(--rtm-text-primary)" }}>{healthData.escalations}</p>
                  </div>
                </div>
                <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>At-Risk Reasons</p>
                  <ul className="space-y-1 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                    {healthData.reasons.map((r) => <li key={r}>✓ {r}</li>)}
                  </ul>
                </div>
                <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>AI Recommendations</p>
                  <ul className="space-y-1 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                    {healthData.recommendations.map((r) => <li key={r}>→ {r}</li>)}
                  </ul>
                </div>
                <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-blue)", background: "var(--rtm-blue-light)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-blue)" }}>🌤 Weather & Seasonal Recommendations</p>
                  <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{healthData.weather}</p>
                </div>
              </div>
            )}

            {/* ── SECTION 10 — Check-ins Tab ────────────────────────────────── */}
            {activeTab === "Check-ins" && (
              <div className="space-y-4">
                <p className="text-xs mb-1" style={{ color: "var(--rtm-text-muted)" }}>Linked to /account-management/checkins</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>Last Check-in</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: "var(--rtm-text-primary)" }}>Jan 10, 2025</p>
                  </div>
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>Next Check-in</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: "var(--rtm-text-primary)" }}>Apr 10, 2025</p>
                  </div>
                </div>
                {checkinHistory.map((ci, i) => (
                  <div key={i} className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{ci.date}</span>
                      <StatusBadge variant="info" label={ci.type} size="sm" />
                    </div>
                    <p className="text-xs mb-1" style={{ color: "var(--rtm-text-muted)" }}>Check-in Notes</p>
                    <p className="text-sm mb-2" style={{ color: "var(--rtm-text-secondary)" }}>{ci.notes}</p>
                    <p className="text-xs mb-1" style={{ color: "var(--rtm-text-muted)" }}>Follow-up Items</p>
                    <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{ci.followUp}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── SECTION 11 — Reports Tab ─────────────────────────────────── */}
            {activeTab === "Reports" && (
              <div className="space-y-5">
                {/* Conceptual link to Account Management Reports */}
                <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>Account Management Reports</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>View full report command center — all clients, status pipeline, risks, and department inputs.</p>
                  </div>
                  <span className="text-xs font-semibold rounded-lg px-3 py-1.5 border" style={{ color: "var(--rtm-blue)", background: "var(--rtm-blue-light)", borderColor: "var(--rtm-blue)" }}>Open Account Management Reports →</span>
                </div>

                {/* Client Reports fields */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Client Reports</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: "Last Report Sent",       value: clientReportDetails.lastReportSent  },
                      { label: "Next Report Due",        value: clientReportDetails.nextReportDue   },
                      { label: "Report Owner",           value: clientReportDetails.reportOwner     },
                      { label: "Report Status",          value: clientReportDetails.reportStatus    },
                      { label: "QA Status",              value: clientReportDetails.qaStatus        },
                      { label: "AM Review Status",       value: clientReportDetails.amReviewStatus  },
                      { label: "Client Approval Status", value: clientReportDetails.clientApproval  },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg border p-3" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                        <p className="text-sm font-semibold mt-1" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Department Inputs */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Department Inputs</p>
                  <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
                    <table className="w-full text-xs">
                      <thead style={{ background: "var(--rtm-bg)" }}>
                        <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                          {["Department", "Input Needed", "Owner", "Due Date", "Status"].map((h) => (
                            <th key={h} className="px-3 py-2 text-left font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {clientReportDetails.deptInputs.map((d) => (
                          <tr key={d.dept} style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                            <td className="px-3 py-2 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{d.dept}</td>
                            <td className="px-3 py-2" style={{ color: "var(--rtm-text-secondary)" }}>{d.input}</td>
                            <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{d.owner}</td>
                            <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{d.due}</td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${reportDeptStatusStyle(d.status)}`}>{d.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Reporting Notes */}
                <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>Reporting Notes</p>
                  <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{clientReportDetails.reportingNotes}</p>
                </div>
              </div>
            )}

            {/* ── SECTION 12 — Renewals Tab ────────────────────────────────── */}
            {activeTab === "Renewals" && (
              <div className="space-y-4">
                <p className="text-xs mb-1" style={{ color: "var(--rtm-text-muted)" }}>Linked to /account-management/renewals</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Renewal Date",         value: renewalData.date             },
                    { label: "Renewal Probability",  value: renewalData.probability      },
                    { label: "Upsell Opportunities", value: renewalData.upsell           },
                    { label: "Revenue Forecast",     value: renewalData.revenueForecast  },
                    { label: "Renewal Status",       value: renewalData.status           },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg border p-3" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                      <p className="text-sm font-semibold mt-1" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION 13 — Notes Tab ────────────────────────────────────── */}
            {activeTab === "Notes" && (
              <div className="space-y-4">
                {[
                  { label: "Internal Notes",      text: "Jordan M. — Client prefers morning calls. Owner (Marcus) is detail-oriented; always provide data-backed summaries." },
                  { label: "Client Notes",        text: "Client mentioned interest in website refresh for spring. Wants to discuss in Q2 planning." },
                  { label: "Sales Handoff Notes", text: "Closed by David R. in Dec 2023. Client came from referral — Harbor Mechanical. Budget was approved at $4,200/mo." },
                  { label: "Billing Notes",       text: "Auto-pay on file via ACH. Invoiced on 1st of each month. No late payment history." },
                ].map(({ label, text }) => (
                  <div key={label} className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                    <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "Documents" && (
              <div className="space-y-3">
                {[
                  { name: "Master Services Agreement — Apex Roofing.pdf", type: "Contract",    date: "Jan 2024", status: "Signed"   },
                  { name: "Service Proposal — Q1 2024.pdf",               type: "Proposal",   date: "Dec 2023", status: "Approved" },
                  { name: "Onboarding Intake Form.pdf",                   type: "Intake",     date: "Jan 2024", status: "Complete" },
                  { name: "Q4 2024 Performance Report.pdf",               type: "Report",     date: "Dec 2024", status: "Sent"     },
                  { name: "Budget Authorization — Meta Ads.pdf",          type: "Internal",   date: "Mar 2024", status: "Signed"   },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>{doc.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{doc.type} · Uploaded {doc.date}</p>
                    </div>
                    <StatusBadge variant="success" label={doc.status} size="sm" />
                  </div>
                ))}
                <button className="rtm-btn-secondary text-xs mt-2">+ Upload Document</button>
              </div>
            )}
          </section>
        </SectionWrapper>
      </section>

      {/* ── SECTION 14 — Client Action Center ───────────────────────────────── */}
      <section aria-label="Client Action Center">
        <SectionWrapper title="Client Action Center" description={`Quick actions for ${selectedClient.name}`}>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Add Note",            style: "secondary" },
              { label: "Create Task",         style: "secondary" },
              { label: "Schedule Check-in",   style: "secondary" },
              { label: "View Reports",        style: "secondary" },
              { label: "Start Renewal",       style: "secondary" },
              { label: "Escalate Risk",       style: "error"     },
              { label: "Update Services",     style: "secondary" },
              { label: "Open Onboarding",     style: "secondary" },
              { label: "Generate AI Summary", style: "primary"   },
            ].map(({ label, style }) => (
              <button
                key={label}
                className={style === "primary" ? "rtm-btn-primary text-xs" : style === "error" ? "text-xs px-4 py-2 rounded-lg font-medium border transition-colors" : "rtm-btn-secondary text-xs"}
                style={style === "error" ? { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" } : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </SectionWrapper>
      </section>
    </div>
  );
}
