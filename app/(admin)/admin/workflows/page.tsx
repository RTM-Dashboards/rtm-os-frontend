"use client";

import Link from "next/link";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";

// ─── Honesty-treatment helpers (matches /operations/workflows pattern) ────────

function PreviewBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
    >
      Preview — Target State
    </span>
  );
}

function DisabledBtn({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      disabled
      title="Not yet available"
      className={`opacity-40 cursor-not-allowed ${className ?? ""}`}
      style={style}
    >
      {children}
    </button>
  );
}

import React from "react";

// 
// Workflow Engine — Workflow-Generated Tasks Integration
// Route: /admin/workflows
// 

const WORKFLOW_TRIGGERS = [
  {
    trigger: "Proposal Approved",
    result: "Create Invoice Task",
    workflow: "Sales Pipeline",
    module: "Billing",
    route: "/billing/invoices",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    icon: "",
    count: 3,
  },
  {
    trigger: "Invoice Paid",
    result: "Assign AM Task",
    workflow: "Onboarding Workflow",
    module: "Account Management",
    route: "/account-management/onboarding",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    icon: "",
    count: 5,
  },
  {
    trigger: "Assign AM",
    result: "Schedule Kickoff Task",
    workflow: "Onboarding Workflow",
    module: "Account Management",
    route: "/account-management/onboarding",
    color: "#7C3AED",
    bg: "#FAF5FF",
    border: "#DDD6FE",
    icon: "",
    count: 4,
  },
  {
    trigger: "Complete Kickoff",
    result: "Create Department Activation Tasks",
    workflow: "Onboarding Workflow",
    module: "Activation",
    route: "/billing/activation",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    icon: "",
    count: 7,
  },
  {
    trigger: "Renewal Due",
    result: "Create Renewal Tasks",
    workflow: "Renewal Workflow",
    module: "Account Management",
    route: "/account-management/clients",
    color: "#0891B2",
    bg: "#ECFEFF",
    border: "#A5F3FC",
    icon: "",
    count: 6,
  },
  {
    trigger: "Cancellation Approved",
    result: "Create Offboarding Tasks",
    workflow: "Offboarding Workflow",
    module: "Offboarding",
    route: "/cancellations/offboarding",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    icon: "",
    count: 2,
  },
];

const RECENT_WORKFLOW_TASKS = [
  {
    id: "wt-001",
    name: "Create invoice — Horizon Dental onboarding",
    trigger: "Proposal Approved",
    workflow: "Sales Pipeline",
    client: "Horizon Dental",
    module: "Billing",
    status: "Open",
    created: "2025-07-23",
    statusColor: "#1D4ED8",
    statusBg: "#EFF6FF",
  },
  {
    id: "wt-002",
    name: "Assign Account Manager — Summit Fitness",
    trigger: "Invoice Paid",
    workflow: "Onboarding Workflow",
    client: "Summit Fitness",
    module: "Account Management",
    status: "In Progress",
    created: "2025-07-24",
    statusColor: "#A16207",
    statusBg: "#FEF9C3",
  },
  {
    id: "wt-003",
    name: "Create department activation tasks — Clearwater Insurance",
    trigger: "Complete Kickoff",
    workflow: "Onboarding Workflow",
    client: "Clearwater Insurance",
    module: "Activation",
    status: "Open",
    created: "2025-07-24",
    statusColor: "#1D4ED8",
    statusBg: "#EFF6FF",
  },
  {
    id: "wt-004",
    name: "Renewal review — Prestige Law Group",
    trigger: "Renewal Due",
    workflow: "Renewal Workflow",
    client: "Prestige Law Group",
    module: "Account Management",
    status: "In Progress",
    created: "2025-07-20",
    statusColor: "#A16207",
    statusBg: "#FEF9C3",
  },
  {
    id: "wt-005",
    name: "Department shutdown — Clearwater Spa",
    trigger: "Cancellation Approved",
    workflow: "Offboarding Workflow",
    client: "Clearwater Spa",
    module: "Offboarding",
    status: "In Progress",
    created: "2025-07-22",
    statusColor: "#A16207",
    statusBg: "#FEF9C3",
  },
  {
    id: "wt-006",
    name: "Access removal — Clearwater Spa",
    trigger: "Cancellation Approved",
    workflow: "Offboarding Workflow",
    client: "Clearwater Spa",
    module: "Offboarding",
    status: "Open",
    created: "2025-07-22",
    statusColor: "#1D4ED8",
    statusBg: "#EFF6FF",
  },
];

export default function WorkflowsPage() {
  const totalWorkflowTasks = WORKFLOW_TRIGGERS.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: "var(--rtm-blue)"}}>
            Admin
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
              Workflow Engine
            </h1>
            <PreviewBadge />
          </div>
          <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
            Automated workflow triggers and generated tasks across Sales, Billing, Onboarding, Renewals, and Offboarding.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/tasks"className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"style={{ background: "var(--rtm-blue)"}}
          >
             Open Tasks
          </Link>
          <DisabledBtn
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
          >
            + Create Workflow Task
          </DisabledBtn>
        </div>
      </div>

      {/* ── Prototype Data Banner ── */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl border text-sm"
        style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
      >
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>
          <strong>Prototype figures only.</strong> The trigger counts, task totals, and generated-task records shown here are static mock data — they do not reflect live system state and will not match data shown elsewhere in RTM OS.
        </span>
      </div>

      {/* Task Access Card */}
      <TaskAccessCard
        context="Workflow Engine"counters={{ open: 27, overdue: 4, dueToday: 9, completed: 41, upcoming: 16 }}
        createLabel="Create Workflow Task"examples={["Proposal Approved → Invoice Task", "Invoice Paid → Assign AM", "Renewal Due → Renewal Task", "Cancellation → Offboarding Task"]}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Workflow Triggers Active", value: WORKFLOW_TRIGGERS.length, color: "var(--rtm-blue)", bg: "var(--rtm-blue-light)"},
          { label: "Auto-Generated Tasks", value: totalWorkflowTasks, color: "#7C3AED", bg: "#FAF5FF"},
          { label: "Tasks Open", value: 27, color: "#D97706", bg: "#FFFBEB"},
          { label: "Tasks Completed", value: 41, color: "#059669", bg: "#ECFDF5"},
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className="rounded-xl p-4 text-center"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <div className="text-3xl font-black"style={{ color }}>{value}</div>
            <div className="text-xs font-semibold mt-1"style={{ color: "var(--rtm-text-secondary)"}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Workflow Trigger Rules */}
      <div
        className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"style={{ background: "var(--rtm-blue-xlight)", borderBottom: "1px solid #BFDBFE"}}
        >
          <div className="flex items-center gap-2">
            
            <h2 className="text-sm font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>
              Workflow-Generated Tasks
            </h2>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"style={{ background: "var(--rtm-blue)"}}
            >
              {totalWorkflowTasks} auto-created
            </span>
          </div>
          <Link href="/tasks" className="text-xs font-semibold hover:underline" style={{ color: "var(--rtm-blue)" }}>
            View All in Task Engine →
          </Link>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {WORKFLOW_TRIGGERS.map((item) => (
            <div
              key={item.trigger}
              className="rounded-xl overflow-hidden"style={{ border: `1px solid ${item.border}` }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"style={{ background: item.bg }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide"style={{ color: item.color }}>
                      Trigger
                    </div>
                    <div className="text-sm font-extrabold"style={{ color: item.color }}>
                      {item.trigger}
                    </div>
                  </div>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"style={{ background: item.color }}
                >
                  {item.count} tasks
                </span>
              </div>
              <div className="px-4 py-3 bg-white"style={{ borderTop: `1px solid ${item.border}` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <svg width="12"height="12"viewBox="0 0 24 24"fill="none"stroke={item.color} strokeWidth="2">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                  <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>
                    {item.result}
                  </span>
                </div>
                <div className="text-[10px] mb-2"style={{ color: "var(--rtm-text-muted)"}}>
                  {item.workflow} → {item.module}
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/tasks"className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-white transition-opacity hover:opacity-90"style={{ background: item.color }}
                  >
                    Open Tasks
                  </Link>
                  <Link
                    href={item.route}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80"style={{ borderColor: item.border, color: item.color }}
                  >
                    View Module →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent workflow-generated tasks table */}
      <div
        className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        <div className="px-5 py-4"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          <h2 className="text-sm font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>
            Recent Workflow-Generated Tasks
          </h2>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
            Tasks automatically created by workflow triggers.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                {["Task Name", "Trigger Event", "Workflow", "Client", "Module", "Status", "Created"].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"style={{ color: "var(--rtm-text-secondary)"}}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_WORKFLOW_TASKS.map((task, i) => (
                <tr
                  key={task.id}
                  className="hover:bg-blue-50/30 transition-colors"style={{ borderBottom: i < RECENT_WORKFLOW_TASKS.length - 1 ? "1px solid var(--rtm-border-light)": "none"}}
                >
                  <td className="px-4 py-3">
                    <Link
                      href="/tasks"className="font-semibold hover:underline"style={{ color: "var(--rtm-blue)"}}
                    >
                      {task.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
                    >
                       {task.trigger}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{task.workflow}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/clients/${task.client.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-xs font-medium hover:underline"style={{ color: "var(--rtm-text-primary)"}}
                    >
                      {task.client}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"}}
                    >
                      {task.module}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"style={{ background: task.statusBg, color: task.statusColor, borderColor: task.statusBg }}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{task.created}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="px-5 py-3 flex items-center justify-between"style={{ borderTop: "1px solid var(--rtm-border-light)"}}
        >
          <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            Showing 6 recent workflow-generated tasks
          </span>
          <Link href="/tasks" className="text-xs font-semibold hover:underline" style={{ color: "var(--rtm-blue)" }}>
            View All Tasks →
          </Link>
        </div>
      </div>

      {/* Route integrations */}
      <div
        className="rounded-xl p-5"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        <h3 className="text-sm font-extrabold mb-3"style={{ color: "var(--rtm-text-primary)"}}>
           Module Integrations
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Clients", href: "/clients"},
            { label: "Task Engine", href: "/tasks"},
            { label: "Invoices", href: "/billing/invoices"},
            { label: "Activation", href: "/billing/activation"},
            { label: "Onboarding", href: "/account-management/onboarding"},
            { label: "Cancellations", href: "/billing/cancellations"},
            { label: "Offboarding", href: "/cancellations/offboarding"},
          ].map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:opacity-80 transition-opacity"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)", borderColor: "#BFDBFE"}}
            >
              {r.label}
              <svg width="10"height="10"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10"y1="14"x2="21"y2="3"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
