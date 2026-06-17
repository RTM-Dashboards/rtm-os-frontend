"use client";

import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Department Throughput Overview
// Route: /tasks/workload-planning
// Task Operations workspace
// ─────────────────────────────────────────────────────────────────────────────

const DEPARTMENT_THROUGHPUT = [
  { dept: "SEO",                openTasks: 34,  overdueTasks: 4,  avgResponseDays: 1.2, slaCompliance: 88, color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", specialists: 2 },
  { dept: "GBP",                openTasks: 18,  overdueTasks: 1,  avgResponseDays: 0.8, slaCompliance: 95, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", specialists: 1 },
  { dept: "Paid Advertising",   openTasks: 19,  overdueTasks: 3,  avgResponseDays: 1.0, slaCompliance: 84, color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA", specialists: 2 },
  { dept: "Meta Ads",           openTasks: 14,  overdueTasks: 2,  avgResponseDays: 1.1, slaCompliance: 86, color: "#7C3AED", bg: "#FAF5FF", border: "#DDD6FE", specialists: 1 },
  { dept: "Reporting",          openTasks: 14,  overdueTasks: 1,  avgResponseDays: 0.9, slaCompliance: 93, color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", specialists: 1 },
  { dept: "Web Development",    openTasks: 40,  overdueTasks: 5,  avgResponseDays: 1.5, slaCompliance: 80, color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", specialists: 2 },
  { dept: "Creative",           openTasks: 20,  overdueTasks: 2,  avgResponseDays: 1.2, slaCompliance: 90, color: "#BE123C", bg: "#FFF1F2", border: "#FECDD3", specialists: 1 },
  { dept: "Account Management", openTasks: 26,  overdueTasks: 3,  avgResponseDays: 0.7, slaCompliance: 91, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", specialists: 3 },
  { dept: "Billing",            openTasks: 0,   overdueTasks: 0,  avgResponseDays: 0.5, slaCompliance: 100, color: "#475569", bg: "#F8FAFC", border: "#CBD5E1", specialists: 1 },
];

function SLABar({ compliance, color }: { compliance: number; color: string }) {
  const barColor = compliance < 80 ? "#DC2626" : compliance < 90 ? "#D97706" : color;
  return (
    <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "#E5E7EB" }}>
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${compliance}%`, background: barColor }}
      />
    </div>
  );
}

export default function DepartmentThroughputPage() {
  const totalOpen = DEPARTMENT_THROUGHPUT.reduce((s, d) => s + d.openTasks, 0);
  const totalOverdue = DEPARTMENT_THROUGHPUT.reduce((s, d) => s + d.overdueTasks, 0);
  const avgSLA = Math.round(DEPARTMENT_THROUGHPUT.reduce((s, d) => s + d.slaCompliance, 0) / DEPARTMENT_THROUGHPUT.length);
  const atRiskDepts = DEPARTMENT_THROUGHPUT.filter((d) => d.slaCompliance < 85).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>
              Task Operations
            </p>
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>›</span>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
              Department Throughput
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Department Throughput Overview
          </h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: "var(--rtm-text-secondary)" }}>
            Monitor open tasks, overdue tasks, SLA compliance, and average response times per department.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/tasks/templates"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}
          >
            📋 View Templates
          </Link>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            ↓ Export Throughput Report
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Open Tasks", value: totalOpen, color: "var(--rtm-blue)" },
          { label: "Total Overdue Tasks", value: totalOverdue, color: totalOverdue > 0 ? "#DC2626" : "#059669" },
          { label: "Depts Below 85% SLA", value: atRiskDepts, color: atRiskDepts > 0 ? "#DC2626" : "#059669" },
          { label: "Avg. SLA Compliance", value: `${avgSLA}%`, color: "#7C3AED" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4 text-center"
            style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
          >
            <div className="text-3xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: "var(--rtm-text-secondary)" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Department breakdown */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
          <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
            🏢 SLA Compliance by Department
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            Based on active task templates and current client activations.
          </p>
        </div>
        <div className="p-5 space-y-4">
          {DEPARTMENT_THROUGHPUT.map((dept) => {
            const slaColor = dept.slaCompliance < 80 ? "#DC2626" : dept.slaCompliance < 90 ? "#D97706" : "#059669";
            return (
              <div key={dept.dept}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: dept.bg, color: dept.color, border: `1px solid ${dept.border}` }}
                    >
                      {dept.dept}
                    </span>
                    <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                      {dept.specialists} specialist{dept.specialists !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                      {dept.openTasks} open
                    </span>
                    {dept.overdueTasks > 0 && (
                      <span className="font-semibold" style={{ color: "#DC2626" }}>{dept.overdueTasks} overdue</span>
                    )}
                    <span className="font-black" style={{ color: slaColor }}>{dept.slaCompliance}% SLA</span>
                  </div>
                </div>
                <SLABar compliance={dept.slaCompliance} color={dept.color} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {DEPARTMENT_THROUGHPUT.map((dept) => (
          <div
            key={dept.dept}
            className="rounded-xl p-4 text-center"
            style={{ background: dept.bg, border: `1px solid ${dept.border}` }}
          >
            <div className="text-2xl font-black" style={{ color: dept.color }}>{dept.openTasks}</div>
            <div className="text-[10px] font-bold" style={{ color: dept.color }}>open tasks</div>
            <div className="text-[10px] mt-1.5 font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{dept.dept}</div>
            <div className="text-[10px] mt-0.5" style={{ color: dept.color }}>{dept.slaCompliance}% SLA</div>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <div className="font-bold text-sm mb-1" style={{ color: "#1D4ED8" }}>Live Throughput Sync — Coming Soon</div>
            <p className="text-xs" style={{ color: "#1E40AF" }}>
              Real-time throughput sync with active client count, SLA tracking, and task aging analysis
              will connect directly to the Task Template Library and Activation Engine.
            </p>
            <div className="flex gap-2 mt-3">
              <Link
                href="/tasks/templates"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: "#1D4ED8", color: "#fff" }}
              >
                📋 Manage Templates →
              </Link>
              <Link
                href="/tasks/activation-rules"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                style={{ borderColor: "#BFDBFE", color: "#1D4ED8" }}
              >
                ⚡ Activation Rules
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
