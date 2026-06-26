"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { recurringContracts, revenueSummary } from "@/lib/billing-mock-data";

const workspace = getWorkspace("billing")!;

type BadgeVariant = "success"| "error"| "warning"| "info"| "neutral"| "pending";

function contractStatusVariant(s: string): BadgeVariant {
  switch (s) {
    case "Active": return "success";
    case "At Risk": return "error";
    case "Pending Renewal": return "warning";
    case "Paused": return "neutral";
    case "Cancelled": return "error";
    default: return "neutral";
  }
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2.5 whitespace-nowrap border-b"style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "#F9FAFB"}}
    >
      {children}
    </th>
  );
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td
      className="px-3 py-2.5 text-sm whitespace-nowrap border-b"style={{ color: muted ? "var(--rtm-text-muted)": "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)"}}
    >
      {children}
    </td>
  );
}

function ActionBtn({ label, onClick, variant = "secondary"}: { label: string; onClick: () => void; variant?: "primary"| "secondary"| "danger"}) {
  const base = "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer";
  const styles: Record<string, string> = {
    primary:   "bg-[#059669] text-white border-transparent hover:opacity-90",
    secondary: "bg-white text-[var(--rtm-text-primary)] border-[var(--rtm-border)] hover:bg-[var(--rtm-bg)]",
    danger:    "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]",
  };
  return <button className={`${base} ${styles[variant]}`} onClick={onClick}>{label}</button>;
}

// Revenue bar chart component
function RevenueBar({ label, value, max, color }: { label: string; value: number; max: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs"style={{ color: "var(--rtm-text-muted)"}}>
        <span>{label}</span>
        <span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>${value.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden"style={{ background: `${color}20` }}>
        <div className="h-2 rounded-full transition-all"style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// Computations
const active = recurringContracts.filter((c) => c.status === "Active");
const pendingRenewal = recurringContracts.filter((c) => c.status === "Pending Renewal");
const atRisk = recurringContracts.filter((c) => c.status === "At Risk");
const totalMRR = recurringContracts.filter((c) => c.status === "Active").reduce((s, c) => s + c.monthlyRevenue, 0);
const maxMonthlyRevenue = Math.max(...revenueSummary.monthlyRevenue.map((m) => m.revenue));
const maxDeptRevenue = Math.max(...revenueSummary.revenueByDepartment.map((d) => d.revenue));
const maxServiceRevenue = Math.max(...revenueSummary.revenueByService.map((s) => s.revenue));

export default function RecurringRevenuePage() {
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("All");

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 14)]);
  }

  const statuses = ["All", "Active", "Pending Renewal", "At Risk", "Paused", "Cancelled"];
  const filtered = filter === "All"? recurringContracts : recurringContracts.filter((c) => c.status === filter);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>
          {workspace.name} / Recurring Revenue
        </p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
          Recurring Revenue
        </h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
          MRR, ARR, active contracts, upcoming renewals, at-risk revenue, and projected revenue.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="MRR"value={`$${totalMRR.toLocaleString()}`}
          trend="up"trendValue="11.2%"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
        />
        <KpiCard
          title="ARR"value={`$${(totalMRR * 12 / 1000).toFixed(0)}k`}
          trend="up"trendValue="11.2%"iconBg="#EFF6FF"iconColor="#1B4FD8"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
        />
        <KpiCard
          title="Active Contracts"value={String(active.length)}
          trend="up"trendValue="2"iconBg="#F0F9FF"iconColor="#0891B2"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
        />
        <KpiCard
          title="Upcoming Renewals"value={String(pendingRenewal.length)}
          trend="neutral"trendValue="unchanged"iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>}
        />
        <KpiCard
          title="Revenue At Risk"value={`$${revenueSummary.revenueAtRisk.toLocaleString()}`}
          trend="up"trendValue="$1,800"iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
        />
        <KpiCard
          title="At-Risk Contracts"value={String(atRisk.length)}
          trend="neutral"trendValue="unchanged"iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>}
        />
        <KpiCard
          title="New Revenue"value={`$${revenueSummary.newRevenue.toLocaleString()}`}
          trend="up"trendValue="$2,100"iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 4v16m8-8H4"/></svg>}
        />
        <KpiCard
          title="Projected Revenue"value={`$${revenueSummary.projectedRevenue.toLocaleString()}`}
          trend="up"trendValue="8.0%"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>}
        />
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Monthly Revenue Trend */}
        <SectionWrapper title="Monthly Revenue Trend"description="Last 6 months">
          <div className="space-y-3">
            {revenueSummary.monthlyRevenue.map((m) => (
              <RevenueBar key={m.month} label={m.month} value={m.revenue} max={maxMonthlyRevenue}/>
            ))}
          </div>
        </SectionWrapper>

        {/* Revenue By Department */}
        <SectionWrapper title="Revenue By Department"description="Current month">
          <div className="space-y-3">
            {revenueSummary.revenueByDepartment.map((d) => (
              <RevenueBar key={d.department} label={d.department} value={d.revenue} max={maxDeptRevenue}/>
            ))}
          </div>
        </SectionWrapper>

        {/* Revenue By Service */}
        <SectionWrapper title="Revenue By Service"description="Current month">
          <div className="space-y-3">
            {revenueSummary.revenueByService.map((s) => (
              <RevenueBar key={s.service} label={s.service} value={s.revenue} max={maxServiceRevenue}/>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/* Upcoming Renewals Alert */}
      {pendingRenewal.length > 0 && (
        <div
          className="rounded-xl border p-5 space-y-3"style={{ background: "#FFFBEB", borderColor: "#FDE68A"}}
        >
          <div className="flex items-center gap-2">
            
            <span className="text-sm font-bold"style={{ color: "#D97706"}}>
              {pendingRenewal.length} Contract{pendingRenewal.length > 1 ? "s": ""} Pending Renewal
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingRenewal.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border p-3 space-y-2"style={{ background: "#fff", borderColor: "#FDE68A"}}
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{c.client}</span>
                  <StatusBadge variant="warning"label="Pending Renewal"size="sm"/>
                </div>
                <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{c.contractName}</p>
                <div className="text-xs space-y-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                  <div>Ends: {c.contractEnd}</div>
                  <div>MRR: <span className="font-bold text-[#059669]">${c.monthlyRevenue.toLocaleString()}</span></div>
                  <div>Notice: {c.noticePeriod}</div>
                </div>
                <div className="flex gap-1.5">
                  <ActionBtn label="Send Renewal"variant="primary"onClick={() => log(`Renewal sent: ${c.client}`)} />
                  <ActionBtn label="Discuss"onClick={() => log(`Discussion started: ${c.client}`)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue At Risk Alert */}
      {atRisk.length > 0 && (
        <div
          className="rounded-xl border p-5 space-y-3"style={{ background: "#FEF2F2", borderColor: "#FECACA"}}
        >
          <div className="flex items-center gap-2">
            
            <span className="text-sm font-bold"style={{ color: "#DC2626"}}>
              {atRisk.length} Contract{atRisk.length > 1 ? "s": ""} At Risk
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {atRisk.map((c) => (
              <div key={c.id} className="rounded-lg border p-3 space-y-2"style={{ background: "#fff", borderColor: "#FECACA"}}>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{c.client}</span>
                  <StatusBadge variant="error"label="At Risk"size="sm"/>
                </div>
                <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{c.contractName}</p>
                <div className="text-xs space-y-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                  <div>MRR At Risk: <span className="font-bold text-[#DC2626]">${c.monthlyRevenue.toLocaleString()}</span></div>
                  <div>Ends: {c.contractEnd}</div>
                  <div>AM: {c.assignedAM}</div>
                </div>
                <div className="flex gap-1.5">
                  <ActionBtn label="Flag For Review"variant="danger"onClick={() => log(`Flagged for review: ${c.client}`)} />
                  <ActionBtn label="Contact AM"onClick={() => log(`AM notified: ${c.assignedAM} re ${c.client}`)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Recurring Contracts Table */}
      <SectionWrapper
        title="All Recurring Contracts"description="15 active recurring revenue contracts"actions={
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"style={
                  filter === s
                    ? { background: "#059669", color: "#fff", borderColor: "#059669"}
                    : { background: "#fff", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)"}
                }
              >
                {s}
              </button>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Contract Name</Th>
                <Th>Term</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Monthly Revenue</Th>
                <Th>Annual Value</Th>
                <Th>Notice Period</Th>
                <Th>Auto Renew</Th>
                <Th>Status</Th>
                <Th>AM</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-[#F9FAFB] transition-colors"style={{ background: c.status === "At Risk"? "#FFF7F7": "var(--rtm-bg)"}}
                >
                  <Td><span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{c.client}</span></Td>
                  <Td muted>{c.contractName}</Td>
                  <Td muted>{c.contractTerm}</Td>
                  <Td muted>{c.contractStart}</Td>
                  <Td muted>{c.contractEnd}</Td>
                  <Td><span className="font-bold text-[#059669]">${c.monthlyRevenue.toLocaleString()}</span></Td>
                  <Td muted>${c.annualValue.toLocaleString()}</Td>
                  <Td muted>{c.noticePeriod}</Td>
                  <Td muted>{c.autoRenew ? "": "—"}</Td>
                  <Td><StatusBadge variant={contractStatusVariant(c.status)} label={c.status} size="sm"/></Td>
                  <Td muted>{c.assignedAM}</Td>
                  <Td>
                    <div className="flex gap-1.5">
                      <ActionBtn label="View Contract"onClick={() => log(`Viewing: ${c.contractName}`)} />
                      <ActionBtn label="Renew"variant="primary"onClick={() => log(`Renewal initiated: ${c.client}`)} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* Action Log */}
      {actionLog.length > 0 && (
        <SectionWrapper title="Action Log"description="Recent revenue actions">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {actionLog.map((entry, i) => (
              <p key={i} className="text-xs font-mono"style={{ color: "var(--rtm-text-secondary)"}}>{entry}</p>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Footer */}
      <div className="flex gap-2">
        <Link href="/billing" className="rtm-btn-secondary text-sm">← Dashboard</Link>
        <Link href="/billing/revenue" className="rtm-btn-primary text-sm">Revenue Dashboard →</Link>
        <Link href="/billing/activation-queue" className="rtm-btn-secondary text-sm">Activation Queue →</Link>
      </div>
    </div>
  );
}
