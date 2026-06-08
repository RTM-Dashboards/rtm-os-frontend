"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

// ── Types ─────────────────────────────────────────────────────────────────────

type TaskStatus =
  | "Not Started"
  | "In Progress"
  | "Waiting For Client"
  | "Waiting For Sales"
  | "Waiting For AM"
  | "Waiting For Department"
  | "Blocked"
  | "Completed"
  | "Cancelled";

type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

interface BillingTask {
  id: string;
  task: string;
  client: string;
  billingArea: string;
  assignedUser: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  notes: string;
  nextAction: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const billingTaskQueue: BillingTask[] = [
  {
    id: "bt1",
    task: "Generate Invoice — Metro Dental",
    client: "Metro Dental",
    billingArea: "Invoice",
    assignedUser: "Lisa P.",
    dueDate: "Jun 16",
    priority: "High",
    status: "Not Started",
    notes: "First invoice for new client. Contract value $1,800/mo.",
    nextAction: "Create and send invoice",
  },
  {
    id: "bt2",
    task: "Collect Remaining Balance — Sunbelt HVAC",
    client: "Sunbelt HVAC",
    billingArea: "Collections",
    assignedUser: "Lisa P.",
    dueDate: "Jun 20",
    priority: "High",
    status: "In Progress",
    notes: "$600 remaining. Client promised payment by Jun 20.",
    nextAction: "Send second payment reminder",
  },
  {
    id: "bt3",
    task: "Escalate Collections — Green Valley Pools",
    client: "Green Valley Pools",
    billingArea: "Collections",
    assignedUser: "Lisa P.",
    dueDate: "Jun 15",
    priority: "Urgent",
    status: "Blocked",
    notes: "$4,400 outstanding. 45 days overdue. Legal notice may be needed.",
    nextAction: "Prepare legal notice or send to collections agency",
  },
  {
    id: "bt4",
    task: "Approve GBP Billing — Blue Ridge Plumbing",
    client: "Blue Ridge Plumbing",
    billingArea: "Activation",
    assignedUser: "Sarah K.",
    dueDate: "Jun 18",
    priority: "Medium",
    status: "Waiting For Department",
    notes: "GBP add-on pending billing approval before activation.",
    nextAction: "Approve billing for GBP service",
  },
  {
    id: "bt5",
    task: "Update Billing Schedule — Pacific Dental Renewal",
    client: "Pacific Dental",
    billingArea: "Renewal",
    assignedUser: "Sarah K.",
    dueDate: "Jun 22",
    priority: "Medium",
    status: "In Progress",
    notes: "LSA and Call Tracking added at renewal. Schedule update pending.",
    nextAction: "Update billing schedule to $4,200/mo",
  },
  {
    id: "bt6",
    task: "Confirm Payment Plan — Summit Pest Control",
    client: "Summit Pest Control",
    billingArea: "Collections",
    assignedUser: "Sarah K.",
    dueDate: "Jun 25",
    priority: "Medium",
    status: "Waiting For Client",
    notes: "Payment plan agreed. Next installment due Jun 25.",
    nextAction: "Confirm next installment receipt",
  },
  {
    id: "bt7",
    task: "Send To Account Management — Blue Ridge Plumbing",
    client: "Blue Ridge Plumbing",
    billingArea: "Handoff",
    assignedUser: "Sarah K.",
    dueDate: "Jun 19",
    priority: "High",
    status: "Waiting For AM",
    notes: "All billing approved. Waiting for AM team to accept assignment.",
    nextAction: "Follow up with AM head",
  },
  {
    id: "bt8",
    task: "Close Account — Green Valley Pools",
    client: "Green Valley Pools",
    billingArea: "Cancellation",
    assignedUser: "Lisa P.",
    dueDate: "Jun 30",
    priority: "High",
    status: "Not Started",
    notes: "Client declined renewal. All services to be cancelled.",
    nextAction: "Stop billing, close account",
  },
  {
    id: "bt9",
    task: "Collect Apex Roofing Contract Signature",
    client: "Apex Roofing",
    billingArea: "Renewal",
    assignedUser: "Lisa P.",
    dueDate: "Jun 20",
    priority: "Medium",
    status: "Waiting For Client",
    notes: "Renewal agreed but contract not yet signed. Billing blocked.",
    nextAction: "Send contract reminder to client",
  },
  {
    id: "bt10",
    task: "Verify Services — Ironclad Fitness Handoff",
    client: "Ironclad Fitness",
    billingArea: "Intake",
    assignedUser: "Lisa P.",
    dueDate: "Jun 18",
    priority: "Medium",
    status: "In Progress",
    notes: "Sales handoff received. Verifying services before invoice generation.",
    nextAction: "Complete billing intake review",
  },
  {
    id: "bt11",
    task: "Send Final Invoice — Metro Dental Termination",
    client: "Metro Dental",
    billingArea: "Offboarding",
    assignedUser: "Sarah K.",
    dueDate: "Jun 25",
    priority: "High",
    status: "Not Started",
    notes: "Contract terminated early. Final billing review needed.",
    nextAction: "Issue final invoice if applicable",
  },
  {
    id: "bt12",
    task: "Notify Paid Media — Pacific Dental LSA Add",
    client: "Pacific Dental",
    billingArea: "Activation",
    assignedUser: "Sarah K.",
    dueDate: "Jun 17",
    priority: "Low",
    status: "Completed",
    notes: "LSA billing approved. Paid Media dept notified.",
    nextAction: "None",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusVariant(s: TaskStatus): BadgeVariant {
  switch (s) {
    case "Completed":              return "success";
    case "Cancelled":              return "neutral";
    case "Blocked":                return "error";
    case "In Progress":            return "info";
    case "Not Started":            return "neutral";
    case "Waiting For Client":
    case "Waiting For Sales":
    case "Waiting For AM":
    case "Waiting For Department": return "warning";
    default:                       return "neutral";
  }
}

function priorityColor(p: TaskPriority): { bg: string; color: string; border: string } {
  switch (p) {
    case "Urgent": return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "High":   return { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" };
    case "Medium": return { bg: "#EFF6FF", color: "#1B4FD8", border: "#BFDBFE" };
    case "Low":    return { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" };
  }
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2 whitespace-nowrap border-b"
      style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-alt, #F9FAFB)" }}>
      {children}
    </th>
  );
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td className="px-3 py-2.5 text-sm border-b"
      style={{ color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)" }}>
      {children}
    </td>
  );
}

function ActionBtn({ label, onClick, variant = "secondary" }: {
  label: string; onClick: () => void; variant?: "primary" | "secondary" | "danger";
}) {
  const base = "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap";
  const styles: Record<string, string> = {
    primary:   "bg-[var(--rtm-blue,#1B4FD8)] text-white border-transparent hover:opacity-90",
    secondary: "bg-[var(--rtm-surface,#fff)] text-[var(--rtm-text-primary)] border-[var(--rtm-border)] hover:bg-[var(--rtm-bg)]",
    danger:    "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]",
  };
  return <button className={`${base} ${styles[variant]}`} onClick={onClick}>{label}</button>;
}

// ── Task Status Counts ────────────────────────────────────────────────────────

const STATUSES: TaskStatus[] = [
  "Not Started",
  "In Progress",
  "Waiting For Client",
  "Waiting For Sales",
  "Waiting For AM",
  "Waiting For Department",
  "Blocked",
  "Completed",
  "Cancelled",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingTasksPage() {
  const [selected, setSelected] = useState<BillingTask | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "All">("All");
  const [noteText, setNoteText] = useState("");

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  }

  const filtered = filterStatus === "All"
    ? billingTaskQueue
    : billingTaskQueue.filter((t) => t.status === filterStatus);

  const statusCounts: Record<string, number> = {};
  for (const s of STATUSES) {
    statusCounts[s] = billingTaskQueue.filter((t) => t.status === s).length;
  }

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Billing Task Queue
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Create, assign, escalate, and manage all billing tasks. Full operational task management for Billing.
        </p>
      </div>

      {/* ── Task Status Summary ── */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const v = statusVariant(s);
          const count = statusCounts[s] ?? 0;
          const colors: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
            success: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
            error:   { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
            warning: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
            info:    { bg: "#EFF6FF", color: "#1B4FD8", border: "#BFDBFE" },
            neutral: { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
            pending: { bg: "#FFF7ED", color: "#D97706", border: "#FDE68A" },
          };
          const c = colors[v];
          return (
            <div key={s} className="flex flex-col px-3 py-2 rounded-lg border text-xs min-w-[100px]"
              style={{ background: c.bg, borderColor: c.border }}>
              <span className="font-medium" style={{ color: "var(--rtm-text-muted)" }}>{s}</span>
              <span className="text-lg font-bold mt-0.5" style={{ color: c.color }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── Billing Task Queue ────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <SectionWrapper
        title="Billing Task Queue"
        description="All billing tasks — click a row to open task actions"
      >
        {/* Global task actions */}
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Task Actions</p>
          <div className="flex flex-wrap gap-2">
            <ActionBtn variant="primary"   label="Create Task"              onClick={() => log("Create Task triggered")} />
            <ActionBtn variant="secondary" label="Assign Task"              onClick={() => log("Assign Task triggered")} />
            <ActionBtn variant="secondary" label="Change Status"            onClick={() => log("Change Status triggered")} />
            <ActionBtn variant="secondary" label="Add Note"                 onClick={() => log("Add Note triggered")} />
            <ActionBtn variant="secondary" label="Add Comment"              onClick={() => log("Add Comment triggered")} />
            <ActionBtn variant="secondary" label="Send Internal Note"       onClick={() => log("Send Internal Note triggered")} />
            <ActionBtn variant="secondary" label="Escalate"                 onClick={() => log("Escalate triggered")} />
            <ActionBtn variant="secondary" label="Mark Complete"            onClick={() => log("Mark Complete triggered")} />
            <ActionBtn variant="secondary" label="Request Department Update"onClick={() => log("Request Department Update triggered")} />
            <ActionBtn variant="secondary" label="Create Follow-up"         onClick={() => log("Create Follow-up triggered")} />
          </div>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(["All", ...STATUSES] as (TaskStatus | "All")[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
              style={
                filterStatus === s
                  ? { background: "#1B4FD8", color: "#fff", borderColor: "#1B4FD8" }
                  : { background: "var(--rtm-surface)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }
              }
            >
              {s}
            </button>
          ))}
        </div>

        {/* Task table */}
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Task</Th>
                <Th>Client</Th>
                <Th>Billing Area</Th>
                <Th>Assigned User</Th>
                <Th>Due Date</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>Notes</Th>
                <Th>Next Action</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const isSelected = selected?.id === t.id;
                const pc = priorityColor(t.priority);
                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelected(isSelected ? null : t)}
                    className="cursor-pointer transition-colors"
                    style={{ background: isSelected ? "#EFF6FF" : "var(--rtm-bg)" }}
                  >
                    <Td>
                      <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{t.task}</span>
                    </Td>
                    <Td muted>{t.client}</Td>
                    <Td muted>{t.billingArea}</Td>
                    <Td muted>{t.assignedUser}</Td>
                    <Td muted>{t.dueDate}</Td>
                    <Td>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                        style={{ background: pc.bg, color: pc.color, borderColor: pc.border }}>
                        {t.priority}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge variant={statusVariant(t.status)} label={t.status} size="sm" />
                    </Td>
                    <Td muted>
                      <span className="block max-w-[200px] whitespace-normal leading-tight text-xs">{t.notes}</span>
                    </Td>
                    <Td muted>{t.nextAction}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Task Action Panel ── */}
      {selected && (
        <div className="rounded-xl border p-6 space-y-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                Task Actions — {selected.task}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                {selected.client} · {selected.billingArea} · Due {selected.dueDate} · Assigned: {selected.assignedUser}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
              style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
            >
              ✕ Close
            </button>
          </div>

          {/* Status change */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Change Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => {
                const v = statusVariant(s);
                const colors: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
                  success: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
                  error:   { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
                  warning: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
                  info:    { bg: "#EFF6FF", color: "#1B4FD8", border: "#BFDBFE" },
                  neutral: { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
                  pending: { bg: "#FFF7ED", color: "#D97706", border: "#FDE68A" },
                };
                const c = colors[v];
                const isActive = selected.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => log(`Status changed to "${s}" for task: ${selected.task}`)}
                    className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
                    style={
                      isActive
                        ? { background: c.color, color: "#fff", borderColor: c.color }
                        : { background: c.bg, color: c.color, borderColor: c.border }
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task actions */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Task Actions</p>
            <div className="flex flex-wrap gap-2">
              <ActionBtn variant="primary"   label="Assign Task"              onClick={() => log(`Assigned task: ${selected.task}`)} />
              <ActionBtn variant="secondary" label="Add Comment"              onClick={() => log(`Comment added to: ${selected.task}`)} />
              <ActionBtn variant="secondary" label="Send Internal Note"       onClick={() => log(`Internal note sent: ${selected.task}`)} />
              <ActionBtn variant="secondary" label="Escalate"                 onClick={() => log(`Escalated task: ${selected.task}`)} />
              <ActionBtn variant="secondary" label="Mark Complete"            onClick={() => log(`Marked complete: ${selected.task}`)} />
              <ActionBtn variant="secondary" label="Request Department Update"onClick={() => log(`Dept update requested: ${selected.task}`)} />
              <ActionBtn variant="secondary" label="Create Follow-up"         onClick={() => log(`Follow-up created: ${selected.task}`)} />
              <ActionBtn variant="danger"    label="Cancel Task"              onClick={() => log(`Cancelled task: ${selected.task}`)} />
            </div>
          </div>

          {/* Add note */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Add Note</p>
            <textarea
              rows={2}
              placeholder="Add a note to this task…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border resize-none"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            />
            <ActionBtn variant="primary" label="Save Note" onClick={() => { log(`Note saved: "${noteText}"`); setNoteText(""); }} />
          </div>

          {/* Action log */}
          {actionLog.length > 0 && (
            <div className="rounded-lg border p-3" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Action Log</p>
              <div className="space-y-1">
                {actionLog.map((entry, i) => (
                  <p key={i} className="text-xs font-mono" style={{ color: "var(--rtm-text-secondary)" }}>{entry}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Footer nav ── */}
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href="/billing/invoices"        className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Invoices →</Link>
        <Link href="/billing/client-portfolio"className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Client Portfolio →</Link>
      </div>
    </div>
  );
}
