"use client";

import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Task Analytics — Placeholder
// Route: /tasks/analytics
// Task Operations workspace
// ─────────────────────────────────────────────────────────────────────────────

const MODULE_LINKS = [
  { label: "Task Management",      href: "/tasks",                       icon: "📋" },
  { label: "Task Templates",       href: "/tasks/templates",             icon: "🗂️" },
  { label: "Activation Rules",     href: "/tasks/activation-rules",      icon: "⚡" },
  { label: "Activation Engine",    href: "/tasks/activation-engine",     icon: "🚀" },
  { label: "Department Activation",href: "/tasks/department-activation", icon: "🏢" },
  { label: "Dept. Throughput",    href: "/tasks/workload-planning",     icon: "📊" },
];

const PLANNED_METRICS = [
  { label: "Task Completion Rate",      icon: "✅", desc: "% of tasks completed on time vs overdue across all departments" },
  { label: "Avg Time to Complete",      icon: "⏱️", desc: "Average days from task creation to completion by department" },
  { label: "Department Throughput",     icon: "🏢", desc: "Tasks completed per department per week/month" },
  { label: "Overdue Trend",             icon: "🚨", desc: "Overdue task volume over time — spot bottlenecks early" },
  { label: "Activation Velocity",       icon: "🚀", desc: "Average time from contract sign to department activation" },
  { label: "Template Usage",            icon: "📋", desc: "Most-used task templates and their completion rates" },
  { label: "SLA Distribution",     icon: "📊", desc: "SLA compliance by department — identify at-risk and overdue trends" },
  { label: "Blocked Task Rate",         icon: "🚫", desc: "% of tasks blocked and average resolution time" },
];

export default function TaskAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>
              Task Operations
            </p>
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>›</span>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
              Analytics
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Task Analytics
          </h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: "var(--rtm-text-secondary)" }}>
            Performance metrics, completion rates, SLA trends, and operational insights across all task modules.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}
          >
            ← Back to Tasks
          </Link>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4"
        style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE" }}>
        <div className="text-5xl">📈</div>
        <div>
          <h2 className="text-xl font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
            Task Analytics — Coming Soon
          </h2>
          <p className="text-sm mt-2 max-w-md" style={{ color: "var(--rtm-text-secondary)" }}>
            Deep task performance metrics are being built. This module will provide real-time operational
            insights across all task modules, departments, and client workflows.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            📋 Task Management
          </Link>
          <Link
            href="/tasks/workload-planning"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border"
            style={{ borderColor: "#BFDBFE", color: "#1E40AF", background: "white" }}
          >
            📊 Dept. Throughput
          </Link>
        </div>
      </div>

      {/* Planned Metrics Grid */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
          <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
            Planned Analytics Modules
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            These metrics will be available in the full Analytics release.
          </p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANNED_METRICS.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
            >
              <span className="text-2xl">{metric.icon}</span>
              <div>
                <div className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
                  {metric.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
                  {metric.desc}
                </div>
              </div>
              <div
                className="text-[10px] font-bold px-2 py-0.5 rounded-full self-start"
                style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
              >
                Coming soon
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module navigation */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
          <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
            Other Task Modules
          </h2>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MODULE_LINKS.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="rounded-xl p-4 flex flex-col gap-2 transition-opacity hover:opacity-80"
              style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE" }}
            >
              <span className="text-2xl">{module.icon}</span>
              <div className="text-xs font-extrabold" style={{ color: "var(--rtm-blue)" }}>
                {module.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
