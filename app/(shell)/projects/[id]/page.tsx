"use client";

import { useState } from "react";
import Link from "next/link";
import { use } from "react";
import {
  getProject,
  getMilestonesForProject,
  getTasksForProject,
  getBlueprint,
  type Project,
  type Task,
  type Milestone,
  type ProjectStatus,
  type ProjectHealth,
  type MilestoneStatus,
  type TaskStatus,
  type TaskPriority,
  type ActivityEntry,
} from "@/lib/engine";

// =============================================================================
// RTM OS — Project Detail Page
// Route: /projects/[id]
// =============================================================================

type Tab =
  | "overview"
  | "milestones"
  | "departments"
  | "tasks"
  | "dependencies"
  | "timeline"
  | "health";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const STATUS_CFG: Record<ProjectStatus, { bg: string; color: string; border: string; dot: string }> = {
  "Draft":              { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", dot: "#CBD5E1" },
  "Ready to Launch":    { bg: "#ECFEFF", color: "#0E7490", border: "#A5F3FC", dot: "#06B6D4" },
  "Launched":           { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6" },
  "In Progress":        { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A", dot: "#EAB308" },
  "Blocked":            { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444" },
  "Pending Client":     { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA", dot: "#F97316" },
  "Pending Department": { bg: "#FAF5FF", color: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6" },
  "Completed":          { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981" },
  "Cancelled":          { bg: "#F8FAFC", color: "#94A3B8", border: "#E4E8F0", dot: "#CBD5E1" },
};

const HEALTH_CFG: Record<ProjectHealth, { bg: string; color: string }> = {
  "Green":  { bg: "#ECFDF5", color: "#059669" },
  "Yellow": { bg: "#FFFBEB", color: "#D97706" },
  "Red":    { bg: "#FEF2F2", color: "#DC2626" },
};

const MS_CFG: Record<MilestoneStatus, { bg: string; color: string; border: string }> = {
  "Not Started": { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  "In Progress": { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A" },
  "Blocked":     { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  "Completed":   { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
};

const TS_CFG: Record<TaskStatus, { bg: string; color: string; dot: string }> = {
  "Open":       { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  "In Progress":{ bg: "#FEF9C3", color: "#A16207", dot: "#EAB308" },
  "Waiting":    { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8" },
  "Review":     { bg: "#FAF5FF", color: "#6D28D9", dot: "#8B5CF6" },
  "Blocked":    { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
  "Completed":  { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
  "Cancelled":  { bg: "#F8FAFC", color: "#94A3B8", dot: "#CBD5E1" },
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  Low: "#64748B", Medium: "#D97706", High: "#DC2626", Urgent: "#7C3AED",
};

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ProjectStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function MsBadge({ status }: { status: MilestoneStatus }) {
  const c = MS_CFG[status];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      {status}
    </span>
  );
}

function TsBadge({ status }: { status: TaskStatus }) {
  const c = TS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#1B4FD8","#059669","#7C3AED","#D97706","#DC2626","#0891B2","#BE185D"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold flex-shrink-0"
      style={{ background: bg }}>{initials}</span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>{label}</div>
      <div className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>{value}</div>
    </div>
  );
}

function ActivityIcon({ type }: { type: ActivityEntry["eventType"] }) {
  const MAP: Partial<Record<ActivityEntry["eventType"], string>> = {
    "Project Created":    "#1D4ED8",
    "Task Generated":     "#7C3AED",
    "Task Assigned":      "#0891B2",
    "Task Completed":     "#059669",
    "Milestone Reached":  "#059669",
    "Blueprint Applied":  "#7C3AED",
    "Invoice Paid":       "#059669",
    "Blocker Added":      "#DC2626",
    "Blocker Resolved":   "#059669",
    "Status Changed":     "#D97706",
    "Department Activated":"#0891B2",
  };
  const color = MAP[type] ?? "#64748B";
  return <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: color }} />;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const project = getProject(id);
  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--rtm-bg)" }}>
        <div className="text-center">
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--rtm-text-secondary)" }}>
            Project not found.
          </p>
          <Link href="/projects" className="text-sm hover:underline" style={{ color: "var(--rtm-blue)" }}>
            Back to Global Projects
          </Link>
        </div>
      </div>
    );
  }

  const milestones = getMilestonesForProject(id);
  const tasks = getTasksForProject(id);
  const health = HEALTH_CFG[project.health];
  const allDeps = tasks.flatMap((t) => t.dependencies);

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview",     label: "Overview" },
    { id: "milestones",   label: `Milestones (${milestones.length})` },
    { id: "departments",  label: `Departments (${project.departments.length})` },
    { id: "tasks",        label: `Tasks (${tasks.length})` },
    { id: "dependencies", label: `Dependencies (${allDeps.length})` },
    { id: "timeline",     label: "Activity Timeline" },
    { id: "health",       label: "Project Health" },
  ];

  // Group tasks by department for the tasks tab
  const tasksByDept = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    acc[t.department] = acc[t.department] ?? [];
    acc[t.department].push(t);
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>

      {/* ── HEADER ── */}
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            <Link href="/projects" className="hover:underline" style={{ color: "var(--rtm-blue)" }}>Global Projects</Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>

          {/* Title */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>{project.id}</span>
                <StatusBadge status={project.status} />
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: health.bg, color: health.color }}>
                  {project.health} Health
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded font-bold"
                  style={{ background: "#FAF5FF", color: "#7C3AED" }}>
                  {project.priority} Priority
                </span>
              </div>
              <h1 className="text-xl font-black mb-1" style={{ color: "var(--rtm-text-primary)" }}>{project.name}</h1>
              <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: "var(--rtm-text-secondary)" }}>
                <span>Client: <b>{project.client}</b></span>
                <span>AM: <b>{project.accountManager}</b></span>
                <span>Owner: <b>{project.owner}</b></span>
                <span>Launch: <b>{project.launchDate}</b></span>
                <span>Package: <b>{project.servicePackage}</b></span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/projects" className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50"
                style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                Back
              </Link>
              <Link href={`/projects/tasks?project=${id}`} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: "var(--rtm-blue)" }}>
                All Tasks
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto gap-0">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className="px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0"
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

      {/* ── TAB CONTENT ── */}
      <div className="flex-1 px-6 py-6 max-w-[1200px] mx-auto w-full">

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Client"          value={project.client} />
              <Field label="Service Package" value={project.servicePackage} />
              <Field label="Account Manager" value={project.accountManager} />
              <Field label="Project Owner"   value={project.owner} />
              <Field label="Launch Date"     value={project.launchDate} />
              <Field label="Status"          value={project.status} />
              <Field label="Milestones"      value={String(milestones.length)} />
              <Field label="Tasks Generated" value={String(tasks.length)} />
              <Field label="Departments"     value={String(project.departments.length)} />
            </div>

            <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-secondary)" }}>
                Contract Summary
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-primary)" }}>{project.contractSummary}</p>
            </div>

            {project.notes && (
              <div className="rounded-xl p-4" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "#D97706" }}>Notes</p>
                <p className="text-sm" style={{ color: "var(--rtm-text-primary)" }}>{project.notes}</p>
              </div>
            )}

            {/* Milestone progress strip */}
            <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: "var(--rtm-text-secondary)" }}>Milestone Progress</p>
              <div className="flex flex-col gap-3">
                {milestones.map((ms) => (
                  <div key={ms.id} className="flex items-center gap-3">
                    <div className="w-36 flex-shrink-0 text-xs font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>{ms.name}</div>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--rtm-border)" }}>
                      <div className="h-full rounded-full"
                        style={{
                          width: `${ms.progress}%`,
                          background: ms.status === "Completed" ? "#10B981" : ms.status === "Blocked" ? "#EF4444" : "#3B82F6",
                        }} />
                    </div>
                    <span className="text-xs font-bold w-9 text-right" style={{ color: "var(--rtm-text-secondary)" }}>{ms.progress}%</span>
                    <MsBadge status={ms.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MILESTONES ── */}
        {activeTab === "milestones" && (
          <div className="flex flex-col gap-4">
            {milestones.length === 0 && (
              <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>No milestones defined.</div>
            )}
            {milestones.map((ms) => {
              const msTasks = tasks.filter((t) => ms.taskIds.includes(t.id));
              const blueprint = ms.blueprintId ? getBlueprint(ms.blueprintId) : undefined;
              return (
                <div key={ms.id} className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                    <div>
                      <h3 className="font-bold text-base" style={{ color: "var(--rtm-text-primary)" }}>{ms.name}</h3>
                      {blueprint && (
                        <Link href={`/projects/blueprints#${blueprint.id}`}
                          className="text-xs hover:underline" style={{ color: "#7C3AED" }}>
                          Blueprint: {blueprint.name}
                        </Link>
                      )}
                    </div>
                    <MsBadge status={ms.status} />
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 text-xs mb-4">
                    <div><span style={{ color: "var(--rtm-text-muted)" }}>Owner: </span><b>{ms.owner}</b></div>
                    <div><span style={{ color: "var(--rtm-text-muted)" }}>Start: </span><b>{ms.startDate}</b></div>
                    <div><span style={{ color: "var(--rtm-text-muted)" }}>Due: </span><b>{ms.dueDate}</b></div>
                    {ms.completionDate && <div><span style={{ color: "var(--rtm-text-muted)" }}>Completed: </span><b style={{ color: "#059669" }}>{ms.completionDate}</b></div>}
                    <div><span style={{ color: "var(--rtm-text-muted)" }}>Tasks: </span><b>{msTasks.length}</b></div>
                  </div>

                  {ms.blockedReason && (
                    <div className="text-xs p-2 rounded-lg mb-3" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                      {ms.blockedReason}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--rtm-border)" }}>
                      <div className="h-full rounded-full"
                        style={{
                          width: `${ms.progress}%`,
                          background: ms.status === "Completed" ? "#10B981" : ms.status === "Blocked" ? "#EF4444" : "#3B82F6",
                        }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>{ms.progress}%</span>
                  </div>

                  {/* Mini task list */}
                  {msTasks.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Generated Tasks</p>
                      {msTasks.map((t) => (
                        <div key={t.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                          style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
                          <Link href={`/projects/tasks/${t.id}`}
                            className="text-xs font-semibold hover:underline flex-1"
                            style={{ color: "var(--rtm-blue)" }}>
                            {t.title}
                          </Link>
                          <span className="text-[11px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{t.department}</span>
                          <TsBadge status={t.status} />
                          {t.assignedUserName && <Avatar name={t.assignedUserName} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── DEPARTMENTS ── */}
        {activeTab === "departments" && (
          <div className="flex flex-col gap-4">
            <div
              className="px-4 py-3 rounded-xl text-xs font-semibold"
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
            >
              Department pages are FILTER views only. Tasks are owned by this engine and filtered by Department field.
            </div>
            {project.departments.map((dept) => {
              const deptTasks = tasks.filter((t) => dept.taskIds.includes(t.id));
              const open      = deptTasks.filter((t) => t.status !== "Completed" && t.status !== "Cancelled").length;
              const blocked   = deptTasks.filter((t) => t.status === "Blocked").length;
              const completed = deptTasks.filter((t) => t.status === "Completed").length;
              const escCfg = dept.escalationStatus === "Critical"
                ? { bg: "#FEF2F2", color: "#DC2626" }
                : dept.escalationStatus === "Escalated"
                ? { bg: "#FFFBEB", color: "#D97706" }
                : { bg: "#ECFDF5", color: "#059669" };
              return (
                <div key={dept.department} className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                    <h3 className="font-bold text-base" style={{ color: "var(--rtm-text-primary)" }}>{dept.department}</h3>
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-bold" style={escCfg}>
                      {dept.escalationStatus === "None" ? "On Track" : dept.escalationStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center mb-3">
                    {[
                      { label: "Total",     value: deptTasks.length, color: "#1D4ED8" },
                      { label: "Open",      value: open,      color: "#D97706" },
                      { label: "Blocked",   value: blocked,   color: "#DC2626" },
                      { label: "Completed", value: completed, color: "#059669" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg p-2" style={{ background: "var(--rtm-bg)" }}>
                        <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
                        <div className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs mb-2" style={{ color: "var(--rtm-text-secondary)" }}>Owner: <b>{dept.owner}</b></div>
                  {dept.delayReason && (
                    <div className="text-xs p-2 rounded-lg" style={{ background: "#FFFBEB", color: "#D97706" }}>{dept.delayReason}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── TASKS ── */}
        {activeTab === "tasks" && (
          <div className="flex flex-col gap-4">
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl text-xs"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
            >
              <span className="font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                {tasks.length} tasks across {Object.keys(tasksByDept).length} departments
              </span>
              <Link href={`/projects/tasks?project=${id}`} className="font-semibold hover:underline" style={{ color: "var(--rtm-blue)" }}>
                Open Global Task View
              </Link>
            </div>

            {Object.entries(tasksByDept).map(([dept, deptTasks]) => (
              <div key={dept}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--rtm-blue)" }}>{dept}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: "#EFF6FF", color: "var(--rtm-blue)" }}>{deptTasks.length}</span>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  {deptTasks.map((t) => (
                    <div key={t.id} className="rounded-lg p-3" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <Link href={`/projects/tasks/${t.id}`}
                          className="font-semibold text-sm hover:underline"
                          style={{ color: "var(--rtm-blue)" }}>
                          {t.title}
                        </Link>
                        <div className="flex items-center gap-2">
                          <TsBadge status={t.status} />
                          <span className="text-[11px] font-bold" style={{ color: PRIORITY_COLOR[t.priority] }}>{t.priority}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                        <span>Due: <b style={{ color: "var(--rtm-text-secondary)" }}>{t.dueDate}</b></span>
                        {t.assignedUserName && <span>Assignee: <b style={{ color: "var(--rtm-text-secondary)" }}>{t.assignedUserName}</b></span>}
                        <span>Source: <b style={{ color: "#7C3AED" }}>{t.source}</b></span>
                        {t.dependencies.length > 0 && (
                          <span style={{ color: "#DC2626" }}>{t.dependencies.length} dep{t.dependencies.length > 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── DEPENDENCIES ── */}
        {activeTab === "dependencies" && (
          <div className="flex flex-col gap-4">
            {allDeps.length === 0 && (
              <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>No dependencies defined on this project.</div>
            )}

            <div
              className="px-4 py-3 rounded-xl text-xs font-semibold"
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
            >
              Finish-To-Start: Task B cannot start until Task A completes. Tasks with blocked-by dependencies are shown below.
            </div>

            {tasks
              .filter((t) => t.dependencies.length > 0)
              .map((t) => (
                <div key={t.id} className="rounded-xl p-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                  <Link href={`/projects/tasks/${t.id}`}
                    className="font-bold text-sm hover:underline block mb-3"
                    style={{ color: "var(--rtm-blue)" }}>
                    {t.title}
                  </Link>
                  <div className="flex flex-col gap-2">
                    {t.dependencies.map((dep) => (
                      <div key={dep.id}
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ background: dep.status === "Completed" ? "#ECFDF5" : dep.status === "Blocked" ? "#FEF2F2" : "#FFFBEB", border: `1px solid ${dep.status === "Completed" ? "#A7F3D0" : dep.status === "Blocked" ? "#FECACA" : "#FDE68A"}` }}>
                        <div className="flex-1">
                          <div className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                            {dep.direction === "blocked-by" ? "Blocked by:" : "Blocking:"} {dep.dependsOnTaskName}
                          </div>
                          <div className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{dep.type}</div>
                        </div>
                        <TsBadge status={dep.status} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ── TIMELINE ── */}
        {activeTab === "timeline" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: "var(--rtm-text-secondary)" }}>Activity Timeline</p>
              <div className="flex flex-col gap-4">
                {[...project.activityLog].reverse().map((entry) => (
                  <div key={entry.id} className="flex gap-3">
                    <ActivityIcon type={entry.eventType} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{entry.eventType}</span>
                        <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>by {entry.actorName}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>{entry.description}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {project.activityLog.length === 0 && (
                  <div className="text-center py-8 text-sm" style={{ color: "var(--rtm-text-muted)" }}>No activity yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── HEALTH ── */}
        {activeTab === "health" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Project Health",      value: project.health,   cfgBg: health.bg,   cfgColor: health.color },
                { label: "Active Departments",   value: String(project.departments.filter((d) => d.escalationStatus !== "Critical").length), cfgBg: "#ECFDF5", cfgColor: "#059669" },
                { label: "Blocked Tasks",        value: String(tasks.filter((t) => t.status === "Blocked").length), cfgBg: "#FEF2F2", cfgColor: "#DC2626" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-5 flex flex-col gap-2" style={{ background: m.cfgBg, border: "1px solid var(--rtm-border)" }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: m.cfgColor }}>{m.label}</p>
                  <p className="text-4xl font-black" style={{ color: m.cfgColor }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Escalation statuses */}
            <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: "var(--rtm-text-secondary)" }}>Department Escalation Status</p>
              <div className="flex flex-col gap-2">
                {project.departments.map((d) => {
                  const escCfg = d.escalationStatus === "Critical"
                    ? { bg: "#FEF2F2", color: "#DC2626" }
                    : d.escalationStatus === "Escalated"
                    ? { bg: "#FFFBEB", color: "#D97706" }
                    : { bg: "#ECFDF5", color: "#059669" };
                  return (
                    <div key={d.department} className="flex items-center justify-between p-3 rounded-lg"
                      style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
                      <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{d.department}</span>
                      <div className="flex items-center gap-2">
                        {d.delayReason && (
                          <span className="text-[10px]" style={{ color: "#D97706" }}>{d.delayReason}</span>
                        )}
                        <span className="text-[11px] px-2.5 py-1 rounded-full font-bold" style={escCfg}>
                          {d.escalationStatus === "None" ? "On Track" : d.escalationStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
