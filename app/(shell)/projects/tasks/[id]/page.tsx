"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import {
  getTask,
  getProject,
  getBlueprint,
  getAllTasks,
  type Task,
  type Project,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/engine";
import { fetchMasterClient } from "@/lib/mock/master-clients-api";
import type { MasterClient, BillingStatus, PaymentStatus } from "@/lib/mock/master-clients";
import type { AMOnboardingRecord } from "@/lib/mock/am-onboarding-store";
import { ONBOARDING_FIELD_SCHEMA, ONBOARDING_SECTIONS } from "@/lib/mock/am-onboarding-field-schema";

// =============================================================================
// RTM OS — Task Detail Page
// Route: /projects/tasks/[id]
// =============================================================================

type Tab = "info" | "project" | "blueprint" | "dependencies" | "notes" | "client-context" | "activity" | "files" | "automation";

const TS_CFG: Record<TaskStatus, { bg: string; color: string; dot: string; border: string }> = {
  "Open":       { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", border: "#BFDBFE" },
  "In Progress":{ bg: "#FEF9C3", color: "#A16207", dot: "#EAB308", border: "#FDE68A" },
  "Waiting":    { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8", border: "#E2E8F0" },
  "Review":     { bg: "#FAF5FF", color: "#6D28D9", dot: "#8B5CF6", border: "#DDD6FE" },
  "Blocked":    { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", border: "#FECACA" },
  "Completed":  { bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
  "Cancelled":  { bg: "#F8FAFC", color: "#94A3B8", dot: "#CBD5E1", border: "#E4E8F0" },
};

const PRIORITY_CFG: Record<TaskPriority, { color: string; bg: string; border: string }> = {
  Low:    { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
  Medium: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  High:   { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  Urgent: { color: "#7C3AED", bg: "#FAF5FF", border: "#DDD6FE" },
};

function TsBadge({ status }: { status: TaskStatus }) {
  const c = TS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>{label}</div>
      <div className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>{value}</div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#1B4FD8","#059669","#7C3AED","#D97706","#DC2626","#0891B2","#BE185D"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold"
      style={{ background: bg }}>{initials}</span>
  );
}

// ---------------------------------------------------------------------------
// Compact BillingStatusBadge for task views
// ---------------------------------------------------------------------------

function BillingStatusBadge({ billingStatus, paymentStatus }: { billingStatus: BillingStatus; paymentStatus: PaymentStatus }) {
  type Variant = "paid" | "pending" | "overdue" | "cleared" | "closed" | "unpaid";
  let variant: Variant = "pending";
  let label: string = billingStatus;

  if (billingStatus === "Paid" || billingStatus === "Cleared") {
    variant = billingStatus === "Cleared" ? "cleared" : "paid";
  } else if (billingStatus === "Overdue" || paymentStatus === "Overdue") {
    variant = "overdue";
  } else if (billingStatus === "Closed") {
    variant = "closed";
  } else if (paymentStatus === "Unpaid") {
    variant = "unpaid";
    label = "Unpaid";
  }

  const CFG: Record<Variant, { bg: string; color: string; border: string; dot: string }> = {
    paid:    { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7", dot: "#10B981" },
    cleared: { bg: "#F0FDF4", color: "#166534", border: "#86EFAC", dot: "#22C55E" },
    pending: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A", dot: "#F59E0B" },
    unpaid:  { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", dot: "#F59E0B" },
    overdue: { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA", dot: "#EF4444" },
    closed:  { bg: "#F8FAFC", color: "#475569", border: "#E2E8F0", dot: "#94A3B8" },
  };
  const c = CFG[variant];

  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 border" style={{ background: c.bg, borderColor: c.border }}>
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      <div className="flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: c.color }}>Client Billing Status</div>
        <div className="text-sm font-bold mt-0.5" style={{ color: c.color }}>
          {label}
          {paymentStatus !== "N/A" && paymentStatus !== billingStatus && (
            <span className="text-xs font-normal ml-2" style={{ color: c.color }}>· Payment: {paymentStatus}</span>
          )}
        </div>
      </div>
      <div className="text-[10px]" style={{ color: c.color }}>
        {(variant === "paid" || variant === "cleared") && "Confirmed ✓"}
        {(variant === "overdue" || variant === "unpaid") && "Check with Billing ⚠"}
        {variant === "pending" && "Awaiting confirmation"}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onboarding context helpers (shared logic, no dept-tagging fabrication)
// ---------------------------------------------------------------------------

function buildOnboardingGroups(record: AMOnboardingRecord) {
  return ONBOARDING_SECTIONS.map((sec) => {
    const sectionFields = ONBOARDING_FIELD_SCHEMA.filter((f) => f.section === sec.id);
    const fields = sectionFields
      .map((f) => ({
        label: f.label,
        value: record.fieldAssignments[f.id]?.value ?? "",
      }))
      .filter((r) => r.value.trim().length > 0);
    return { id: sec.id, label: sec.label, fields };
  }).filter((s) => s.fields.length > 0);
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("info");

  const [liveTask, setLiveTask] = useState<Task | null | undefined>(undefined);
  const [allTasks, setAllTasks] = useState<Task[]>(() => getAllTasks());
  const [liveProject, setLiveProject] = useState<Project | undefined>(() => undefined);

  // Billing + onboarding context — fetched live, never stored on Task
  const [clientRecord, setClientRecord] = useState<MasterClient | null>(null);
  const [onboardingRecord, setOnboardingRecord] = useState<AMOnboardingRecord | null | "loading">("loading");
  const [clientContextExpanded, setClientContextExpanded] = useState<Set<string>>(
    () => new Set(["client-basics", "engagement-setup", "am-internal"])
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/engine?resource=tasks").then((r) => r.ok ? r.json() : null),
      fetch("/api/engine?resource=projects").then((r) => r.ok ? r.json() : null),
    ]).then(([td, pd]) => {
      if (td?.tasks) {
        const tasks = td.tasks as Task[];
        setAllTasks(tasks);
        setLiveTask(tasks.find((t) => t.id === id) ?? null);
        const found = tasks.find((t) => t.id === id);
        if (found && pd?.projects) {
          const proj = (pd.projects as Project[]).find((p) => p.id === found.projectId);
          setLiveProject(proj);
          // Fetch billing + onboarding when we have a project with clientId
          if (proj?.clientId) {
            const cid = proj.clientId;
            Promise.all([
              fetchMasterClient(cid),
              fetch(`/api/onboarding-records?clientId=${encodeURIComponent(cid)}`, { cache: "no-store" })
                .then((r) => r.ok ? r.json() as Promise<{ record: AMOnboardingRecord | null }> : null)
                .catch(() => null),
            ]).then(([mc, onbData]) => {
              setClientRecord(mc);
              setOnboardingRecord(onbData?.record ?? null);
            }).catch(() => {
              setClientRecord(null);
              setOnboardingRecord(null);
            });
          } else {
            setOnboardingRecord(null);
          }
        }
      } else {
        setLiveTask(getTask(id) ?? null);
      }
      if (!td?.tasks && pd?.projects) {
        const t = getTask(id);
        if (t) setLiveProject((pd.projects as Project[]).find((p) => p.id === t.projectId));
      }
    }).catch(() => {
      setLiveTask(getTask(id) ?? null);
    });
  }, [id]);

  if (liveTask === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--rtm-bg)" }}>
        <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  const task = liveTask;
  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--rtm-bg)" }}>
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: "var(--rtm-text-secondary)" }}>Task not found.</p>
          <Link href="/projects" className="text-sm hover:underline" style={{ color: "var(--rtm-blue)" }}>Back to Projects</Link>
        </div>
      </div>
    );
  }

  const project = liveProject ?? getProject(task.projectId);
  const blueprint = task.blueprintId ? getBlueprint(task.blueprintId) : undefined;
  const sc = TS_CFG[task.status];
  const pc = PRIORITY_CFG[task.priority];

  // Resolve dependency tasks
  const depTasks: Task[] = task.dependencies
    .map((d) => allTasks.find((t) => t.id === d.dependsOnTaskId))
    .filter((t): t is Task => t !== undefined);

  const TABS: { id: Tab; label: string }[] = [
    { id: "info",           label: "Task Info" },
    { id: "project",        label: "Related Project" },
    { id: "blueprint",      label: "Blueprint" },
    { id: "dependencies",   label: `Dependencies (${task.dependencies.length})` },
    { id: "notes",          label: `Notes (${task.notes.length})` },
    { id: "client-context", label: "Client Context" },
    { id: "activity",       label: "Activity" },
    { id: "files",          label: "Files" },
    { id: "automation",     label: "Automation History" },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>

      {/* HEADER */}
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[900px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-3 flex-wrap" style={{ color: "var(--rtm-text-muted)" }}>
            <Link href="/projects" className="hover:underline" style={{ color: "var(--rtm-blue)" }}>Global Projects</Link>
            <span>/</span>
            {project && (
              <>
                <Link href={`/projects/${project.id}`} className="hover:underline" style={{ color: "var(--rtm-blue)" }}>{project.name}</Link>
                <span>/</span>
              </>
            )}
            <span>Task: {task.id}</span>
          </div>

          {/* Title */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>{task.id}</span>
                <TsBadge status={task.status} />
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border"
                  style={{ background: pc.bg, color: pc.color, borderColor: pc.border }}>
                  {task.priority}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                  {task.department}
                </span>
              </div>
              <h1 className="text-xl font-black" style={{ color: "var(--rtm-text-primary)" }}>{task.title}</h1>
              {task.description && (
                <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{task.description}</p>
              )}
              {/* Compact billing status — live from MASTER_CLIENTS */}
              {clientRecord && (
                <div className="mt-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap"
                    style={{
                      background:
                        (clientRecord.billingStatus === "Paid" || clientRecord.billingStatus === "Cleared")
                          ? "#ECFDF5"
                          : clientRecord.billingStatus === "Overdue" || clientRecord.paymentStatus === "Overdue"
                          ? "#FEF2F2"
                          : "#FFFBEB",
                      color:
                        (clientRecord.billingStatus === "Paid" || clientRecord.billingStatus === "Cleared")
                          ? "#065F46"
                          : clientRecord.billingStatus === "Overdue" || clientRecord.paymentStatus === "Overdue"
                          ? "#991B1B"
                          : "#92400E",
                      borderColor:
                        (clientRecord.billingStatus === "Paid" || clientRecord.billingStatus === "Cleared")
                          ? "#6EE7B7"
                          : clientRecord.billingStatus === "Overdue" || clientRecord.paymentStatus === "Overdue"
                          ? "#FECACA"
                          : "#FDE68A",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background:
                          (clientRecord.billingStatus === "Paid" || clientRecord.billingStatus === "Cleared")
                            ? "#10B981"
                            : clientRecord.billingStatus === "Overdue" || clientRecord.paymentStatus === "Overdue"
                            ? "#EF4444"
                            : "#F59E0B",
                      }}
                    />
                    Billing: {clientRecord.billingStatus}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Link href={`/projects/${task.projectId}`}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50"
                style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                View Project
              </Link>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className="px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0"
                style={{
                  color: activeTab === t.id ? "var(--rtm-blue)" : "var(--rtm-text-secondary)",
                  borderBottom: activeTab === t.id ? "2px solid var(--rtm-blue)" : "2px solid transparent",
                  background: "transparent",
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-6 py-6 max-w-[900px] mx-auto w-full">

        {/* TASK INFO */}
        {activeTab === "info" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Task ID"       value={task.id} />
              <Field label="Project ID"    value={task.projectId} />
              <Field label="Blueprint ID"  value={task.blueprintId ?? "—"} />
              <Field label="Client"        value={task.clientName} />
              <Field label="Project"       value={task.projectName} />
              <Field label="Department"    value={task.department} />
              <Field label="Service"       value={task.service} />
              <Field label="Type"          value={task.type} />
              <Field label="Source"        value={task.source} />
              <Field label="Status"        value={<TsBadge status={task.status} />} />
              <Field label="Priority"      value={<span style={{ color: pc.color, fontWeight: 700 }}>{task.priority}</span>} />
              <Field label="Est. Hours"    value={`${task.estimatedHours}h`} />
              <Field label="Due Date"      value={task.dueDate} />
              <Field label="Start Date"    value={task.startDate ?? "—"} />
              <Field label="Completed"     value={task.completionDate ?? "—"} />
              <Field label="Created By"    value={task.createdByName} />
              <Field label="Created At"    value={new Date(task.createdAt).toLocaleString()} />
              <Field label="Updated At"    value={new Date(task.updatedAt).toLocaleString()} />
            </div>

            {/* Assigned user */}
            {task.assignedUserName && (
              <div className="rounded-xl p-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-3" style={{ color: "var(--rtm-text-muted)" }}>Assigned User</p>
                <div className="flex items-center gap-3">
                  <Avatar name={task.assignedUserName} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{task.assignedUserName}</p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>ID: {task.assignedUserId}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RELATED PROJECT */}
        {activeTab === "project" && (
          <div className="flex flex-col gap-4">
            {project ? (
              <>
                <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-blue)" }}>{project.id}</p>
                      <h2 className="text-lg font-black" style={{ color: "var(--rtm-text-primary)" }}>{project.name}</h2>
                    </div>
                    <Link href={`/projects/${project.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: "var(--rtm-blue)" }}>
                      Open Project
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Field label="Client"        value={project.client} />
                    <Field label="Package"       value={project.servicePackage} />
                    <Field label="Account Manager" value={project.accountManager} />
                    <Field label="Status"        value={project.status} />
                    <Field label="Health"        value={project.health} />
                    <Field label="Launch Date"   value={project.launchDate} />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>Project not found.</div>
            )}
          </div>
        )}

        {/* BLUEPRINT */}
        {activeTab === "blueprint" && (
          <div className="flex flex-col gap-4">
            {blueprint ? (
              <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#7C3AED" }}>{blueprint.id}</p>
                    <h2 className="text-lg font-black" style={{ color: "var(--rtm-text-primary)" }}>{blueprint.name}</h2>
                    <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>{blueprint.description}</p>
                  </div>
                  <Link href={`/projects/blueprints#${blueprint.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                    style={{ borderColor: "#DDD6FE", color: "#7C3AED" }}>
                    View Blueprint
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Field label="Department"     value={blueprint.department} />
                  <Field label="Service Package"value={blueprint.servicePackage} />
                  <Field label="Line Item"      value={blueprint.mappedLineItem} />
                  <Field label="Trigger"        value={blueprint.activationTrigger} />
                  <Field label="Total Tasks"    value={String(blueprint.tasks.length)} />
                  <Field label="Est. Hours"     value={`${blueprint.estimatedTotalHours}h`} />
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                  This task was not generated from a blueprint. Source: <b>{task.source}</b>
                </p>
              </div>
            )}
          </div>
        )}

        {/* DEPENDENCIES */}
        {activeTab === "dependencies" && (
          <div className="flex flex-col gap-4">
            {task.dependencies.length === 0 && (
              <div className="rounded-xl p-5 text-center text-sm"
                style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
                This task has no dependencies.
              </div>
            )}

            {task.dependencies.length > 0 && (
              <div
                className="px-4 py-3 rounded-xl text-xs font-semibold"
                style={{ background: "#FEF9C3", color: "#A16207", border: "1px solid #FDE68A" }}
              >
                Finish-To-Start: This task is blocked by the tasks below. It cannot start until all blocked-by tasks are Completed.
              </div>
            )}

            {task.dependencies.map((dep) => {
              const depTask = depTasks.find((t) => t.id === dep.dependsOnTaskId);
              return (
                <div key={dep.id} className="rounded-xl p-4"
                  style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide mb-1"
                        style={{ color: dep.direction === "blocked-by" ? "#DC2626" : "#D97706" }}>
                        {dep.direction === "blocked-by" ? "This task is blocked by:" : "This task is blocking:"}
                      </p>
                      {depTask ? (
                        <Link href={`/projects/tasks/${depTask.id}`}
                          className="font-bold text-base hover:underline"
                          style={{ color: "var(--rtm-blue)" }}>
                          {depTask.title}
                        </Link>
                      ) : (
                        <p className="font-bold text-base" style={{ color: "var(--rtm-text-primary)" }}>{dep.dependsOnTaskName}</p>
                      )}
                    </div>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: dep.status === "Completed" ? "#ECFDF5" : dep.status === "Blocked" ? "#FEF2F2" : "#FEF9C3",
                        color: dep.status === "Completed" ? "#059669" : dep.status === "Blocked" ? "#DC2626" : "#A16207",
                      }}
                    >
                      {dep.status}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Dependency type: {dep.type}</p>
                  {dep.status !== "Completed" && dep.direction === "blocked-by" && (
                    <div className="mt-2 px-3 py-2 rounded-lg text-xs font-semibold"
                      style={{ background: "#FEF2F2", color: "#DC2626" }}>
                      This task cannot start until the above task is completed.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* NOTES */}
        {activeTab === "notes" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: "var(--rtm-blue)" }}>
                + Add Note
              </button>
            </div>
            {task.notes.length === 0 && (
              <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>No notes yet.</div>
            )}
            {task.notes.map((note) => (
              <div key={note.id} className="rounded-xl p-4"
                style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={note.authorName} />
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{note.authorName}</p>
                    <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{new Date(note.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-primary)" }}>{note.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* CLIENT CONTEXT */}
        {activeTab === "client-context" && (
          <div className="flex flex-col gap-4">
            <div
              className="px-4 py-3 rounded-xl text-xs font-semibold"
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
            >
              Client context is fetched live from the onboarding record — not stored on this task.
              All fields are general (no per-department filtering — no real department tagging exists in the schema).
            </div>

            {/* Billing status — full version */}
            {clientRecord && (
              <BillingStatusBadge
                billingStatus={clientRecord.billingStatus}
                paymentStatus={clientRecord.paymentStatus}
              />
            )}
            {!clientRecord && liveProject?.clientId && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#F8FAFC", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
                Loading billing status…
              </div>
            )}
            {!liveProject?.clientId && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#F8FAFC", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
                No MASTER_CLIENTS record linked to this project — billing status unavailable.
              </div>
            )}

            {/* Onboarding record — general Client Context */}
            {onboardingRecord === "loading" && (
              <div className="rounded-xl px-5 py-4 text-sm" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
                Loading client onboarding record…
              </div>
            )}
            {onboardingRecord === null && (
              <div className="rounded-xl px-5 py-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                <p className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Client Onboarding Record</p>
                <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                  No onboarding record found for this client.
                </p>
              </div>
            )}
            {onboardingRecord && onboardingRecord !== "loading" && (() => {
              const groups = buildOnboardingGroups(onboardingRecord);
              const totalFields = Object.values(onboardingRecord.fieldAssignments).length;
              const filledFields = Object.values(onboardingRecord.fieldAssignments).filter(
                (a) => a.value.trim().length > 0
              ).length;
              return (
                <div className="rounded-xl border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b" style={{ borderColor: "var(--rtm-border)" }}>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>Client Onboarding Record</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                        {filledFields} of {totalFields} fields filled · Status: {onboardingRecord.status}
                      </p>
                    </div>
                    <Link
                      href={`/account-management/onboarding/${onboardingRecord.id}/record`}
                      className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                      style={{ background: "#2563EB" }}
                    >
                      View Full Record →
                    </Link>
                  </div>
                  {/* Sections */}
                  <div className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
                    {groups.length === 0 && (
                      <div className="px-5 py-4 text-sm" style={{ color: "var(--rtm-text-muted)" }}>No fields filled in yet.</div>
                    )}
                    {groups.map((sec) => {
                      const isOpen = clientContextExpanded.has(sec.id);
                      return (
                        <div key={sec.id}>
                          <button
                            type="button"
                            onClick={() => setClientContextExpanded((prev) => {
                              const next = new Set(prev);
                              if (next.has(sec.id)) next.delete(sec.id);
                              else next.add(sec.id);
                              return next;
                            })}
                            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{sec.label}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                                {sec.fields.length} field{sec.fields.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <span className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>{isOpen ? "▲" : "▼"}</span>
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-4 grid grid-cols-1 gap-2">
                              {sec.fields.map((row) => (
                                <div key={row.label} className="rounded-lg p-3" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
                                  <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>{row.label}</div>
                                  <div className="text-sm" style={{ color: "var(--rtm-text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{row.value}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
            <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: "var(--rtm-text-secondary)" }}>Activity Log</p>
            <div className="text-center py-8 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
              Activity history will appear here as task events are recorded. (Mock — v1)
            </div>
          </div>
        )}

        {/* FILES */}
        {activeTab === "files" && (
          <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>Files</p>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--rtm-blue)" }}>
                + Attach File
              </button>
            </div>
            <div className="text-center py-8 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
              No files attached. (Mock — v1)
            </div>
          </div>
        )}

        {/* AUTOMATION HISTORY */}
        {activeTab === "automation" && (
          <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
            <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: "var(--rtm-text-secondary)" }}>Automation History</p>
            {task.automationHistory.length === 0 && (
              <div className="text-center py-8 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                No automation events recorded. (Mock — v1)
              </div>
            )}
            {task.automationHistory.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg mb-2"
                style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{ev.trigger} → {ev.action}</p>
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{ev.executedAt}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: ev.result === "Success" ? "#ECFDF5" : "#FEF2F2", color: ev.result === "Success" ? "#059669" : "#DC2626" }}>
                  {ev.result}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
