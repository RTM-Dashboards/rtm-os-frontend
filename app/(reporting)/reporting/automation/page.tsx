"use client";

import { useState } from "react";

//  TYPES 
type AutomationStatus = "Active"| "Paused"| "Draft"| "Error";
type TriggerType = "Schedule"| "Milestone Completed"| "Task Completed"| "Project Launch"| "Client Request"| "Manual";
type ReportType = "Monthly SEO"| "Monthly PPC"| "Monthly Meta Ads"| "Monthly LSA"| "Monthly GBP"| "Monthly Yelp"| "QBR"| "Custom"| "Executive Summary";

interface AutomationRule {
  id: string;
  name: string;
  reportType: ReportType;
  trigger: TriggerType;
  schedule?: string;
  recipients: string[];
  clients: string[];
  status: AutomationStatus;
  lastRun?: string;
  nextRun?: string;
  runsTotal: number;
  runsFailed: number;
  template: string;
}

const STATUS_CFG: Record<AutomationStatus, { bg: string; color: string; border: string; dot: string }> = {
  Active:  { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981"},
  Paused:  { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", dot: "#F59E0B"},
  Draft:   { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", dot: "#94A3B8"},
  Error:   { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444"},
};

const AUTOMATIONS: AutomationRule[] = [
  {
    id: "auto-001",
    name: "Monthly SEO Report — All Clients",
    reportType: "Monthly SEO",
    trigger: "Schedule",
    schedule: "1st of every month at 8:00 AM",
    recipients: ["Account Manager", "Client"],
    clients: ["All SEO clients"],
    status: "Active",
    lastRun: "2025-07-01",
    nextRun: "2025-08-01",
    runsTotal: 24,
    runsFailed: 0,
    template: "RTM Monthly SEO Template v3",
  },
  {
    id: "auto-002",
    name: "Monthly PPC Report — Google Ads",
    reportType: "Monthly PPC",
    trigger: "Schedule",
    schedule: "3rd of every month at 9:00 AM",
    recipients: ["Account Manager", "Client"],
    clients: ["All Google Ads clients"],
    status: "Active",
    lastRun: "2025-07-03",
    nextRun: "2025-08-03",
    runsTotal: 18,
    runsFailed: 1,
    template: "RTM Monthly PPC Template v2",
  },
  {
    id: "auto-003",
    name: "Project Launch Report",
    reportType: "Custom",
    trigger: "Project Launch",
    recipients: ["Account Manager", "Department Heads"],
    clients: ["All new project clients"],
    status: "Active",
    lastRun: "2025-07-20",
    nextRun: "On trigger",
    runsTotal: 42,
    runsFailed: 0,
    template: "RTM Project Launch Summary Template",
  },
  {
    id: "auto-004",
    name: "Quarterly QBR Report",
    reportType: "QBR",
    trigger: "Schedule",
    schedule: "1st of Jan, Apr, Jul, Oct at 9:00 AM",
    recipients: ["Account Manager", "Client", "Executive Team"],
    clients: ["All active retainer clients"],
    status: "Active",
    lastRun: "2025-07-01",
    nextRun: "2025-10-01",
    runsTotal: 8,
    runsFailed: 0,
    template: "RTM QBR Template v5",
  },
  {
    id: "auto-005",
    name: "Monthly Meta Ads Report",
    reportType: "Monthly Meta Ads",
    trigger: "Schedule",
    schedule: "2nd of every month at 8:00 AM",
    recipients: ["Account Manager", "Client"],
    clients: ["All Meta Ads clients"],
    status: "Paused",
    lastRun: "2025-06-02",
    nextRun: "Paused",
    runsTotal: 14,
    runsFailed: 2,
    template: "RTM Monthly Meta Ads Template v1",
  },
  {
    id: "auto-006",
    name: "Executive Portfolio Summary",
    reportType: "Executive Summary",
    trigger: "Schedule",
    schedule: "Every Monday at 7:00 AM",
    recipients: ["Executive Team", "Department Heads"],
    clients: ["All clients — portfolio view"],
    status: "Active",
    lastRun: "2025-07-21",
    nextRun: "2025-07-28",
    runsTotal: 52,
    runsFailed: 0,
    template: "RTM Executive Portfolio Template",
  },
  {
    id: "auto-007",
    name: "Milestone Completion Report",
    reportType: "Custom",
    trigger: "Milestone Completed",
    recipients: ["Account Manager", "Project Owner"],
    clients: ["All project clients"],
    status: "Draft",
    runsTotal: 0,
    runsFailed: 0,
    template: "RTM Milestone Completion Template",
  },
  {
    id: "auto-008",
    name: "LSA Monthly Report",
    reportType: "Monthly LSA",
    trigger: "Schedule",
    schedule: "4th of every month at 9:00 AM",
    recipients: ["Account Manager", "Client"],
    clients: ["All LSA clients"],
    status: "Error",
    lastRun: "2025-07-04",
    nextRun: "2025-08-04",
    runsTotal: 10,
    runsFailed: 3,
    template: "RTM Monthly LSA Template v1",
  },
];

function StatusBadge({ status }: { status: AutomationStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap"style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function KpiCard({ label, value, icon = "", color, sub }: { label: string; value: number | string; icon?: string; color: string; sub?: string }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-secondary)"}}>{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-3xl font-black"style={{ color }}>{value}</div>
      {sub && <div className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{sub}</div>}
    </div>
  );
}

export default function ReportAutomationPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AutomationStatus | "All">("All");

  const filtered = AUTOMATIONS.filter(a => {
    if (statusFilter !== "All"&& a.status !== statusFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const kpis = {
    total: AUTOMATIONS.length,
    active: AUTOMATIONS.filter(a => a.status === "Active").length,
    paused: AUTOMATIONS.filter(a => a.status === "Paused").length,
    errors: AUTOMATIONS.filter(a => a.status === "Error").length,
    totalRuns: AUTOMATIONS.reduce((s, a) => s + a.runsTotal, 0),
    failedRuns: AUTOMATIONS.reduce((s, a) => s + a.runsFailed, 0),
  };

  return (
    <div className="flex flex-col min-h-screen"style={{ background: "var(--rtm-bg)"}}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4"style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)"}}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                
                <h1 className="text-2xl font-black"style={{ color: "var(--rtm-text-primary)"}}>Report Automation</h1>
              </div>
              <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>
                Configure automated report generation and delivery rules for all clients and services.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm"style={{ background: "var(--rtm-blue)"}}>
                + New Automation
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}>
                Run All Active
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-5 max-w-[1400px] mx-auto w-full">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          <KpiCard label="Total Rules"value={kpis.total} color="var(--rtm-blue)"/>
          <KpiCard label="Active"value={kpis.active} color="#059669"/>
          <KpiCard label="Paused"value={kpis.paused} icon=""color="#D97706"/>
          <KpiCard label="Errors"value={kpis.errors} color="#DC2626"/>
          <KpiCard label="Total Runs"value={kpis.totalRuns} icon=""color="var(--rtm-blue)"/>
          <KpiCard label="Failed Runs"value={kpis.failedRuns} color="#DC2626"/>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl mb-4"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2"width="14"height="14"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"style={{ color: "var(--rtm-text-muted)"}}><circle cx="11"cy="11"r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search automations..."className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)"}} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold"style={{ color: "var(--rtm-text-secondary)"}}>Status:</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as AutomationStatus | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)"}}>
              {(["All", "Active", "Paused", "Draft", "Error"] as (AutomationStatus | "All")[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <span className="text-xs font-semibold ml-auto"style={{ color: "var(--rtm-text-muted)"}}>{filtered.length} of {AUTOMATIONS.length} rules</span>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                  {["Automation Name", "Report Type", "Trigger", "Schedule / Next Run", "Recipients", "Clients", "Runs", "Failures", "Status", "Actions"].map(col => (
                    <th key={col} className="px-3 py-3 text-left text-[11px] font-black uppercase tracking-wider"style={{ color: "var(--rtm-text-secondary)"}}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((auto, i) => (
                  <tr key={auto.id} className="hover:bg-blue-50/30 transition-colors"style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--rtm-border-light)": "none"}}>
                    <td className="px-3 py-3 max-w-[220px]">
                      <div className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{auto.name}</div>
                      <div className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>{auto.template}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE"}}>{auto.reportType}</span>
                    </td>
                    <td className="px-3 py-3 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{auto.trigger}</td>
                    <td className="px-3 py-3">
                      <div className="text-xs"style={{ color: "var(--rtm-text-primary)"}}>{auto.schedule ?? "—"}</div>
                      {auto.nextRun && <div className="text-[11px] font-semibold mt-0.5"style={{ color: "#0891B2"}}>Next: {auto.nextRun}</div>}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-0.5">
                        {auto.recipients.map(r => (
                          <span key={r} className="text-[11px] px-1.5 py-0.5 rounded font-semibold"style={{ background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0"}}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{auto.clients.join(", ")}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{auto.runsTotal}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-sm font-bold"style={{ color: auto.runsFailed > 0 ? "#DC2626": "#059669"}}>{auto.runsFailed}</span>
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={auto.status} /></td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <button className="px-2 py-1 rounded text-[11px] font-semibold text-white"style={{ background: "var(--rtm-blue)"}}>Edit</button>
                        {auto.status === "Active"&& <button className="px-2 py-1 rounded text-[11px] font-semibold border"style={{ borderColor: "#FDE68A", color: "#D97706"}}>Pause</button>}
                        {auto.status === "Paused"&& <button className="px-2 py-1 rounded text-[11px] font-semibold border"style={{ borderColor: "#A7F3D0", color: "#059669"}}>Resume</button>}
                        <button className="px-2 py-1 rounded text-[11px] font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}> Run</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16"style={{ color: "var(--rtm-text-muted)"}}>
                
                <p className="text-sm font-medium">No automations match your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
