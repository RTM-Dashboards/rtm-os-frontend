"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import type { ScopedTask } from "@/app/api/projects/detail/route";
import type { ScopedProjectListItem } from "@/app/api/projects/scoped/route";

// =============================================================================
// RTM OS — Task Detail Page
// Route: /projects/tasks/[id]
// Data source: Postgres via /api/tasks (for individual task) and /api/projects/detail
// =============================================================================

// Because there is no single-task GET route, we load the project detail and
// find the task within it.

type Tab = "info" | "dependencies";

const STATUS_CFG: Record<string, { bg: string; color: string; dot: string; border: string }> = {
  "open":        { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", border: "#BFDBFE" },
  "in_progress": { bg: "#FEF9C3", color: "#A16207", dot: "#EAB308", border: "#FDE68A" },
  "done":        { bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
  "skipped":     { bg: "#F8FAFC", color: "#94A3B8", dot: "#CBD5E1", border: "#E4E8F0" },
};

function TaskStatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG["open"];
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

// We resolve the task by: loading all projects via /api/tasks filtered by no specific project,
// then finding which project the task belongs to via /api/tasks?taskId — but there's no single-task
// route. Instead we resolve via /api/tasks (all tasks for the caller) to find the task.
// Then load its project via /api/projects/detail.

type TaskWithProject = {
  task: ScopedTask;
  categoryId: string;
  serviceLabel: string;
  projectId: string;
  projectName: string;
};

async function resolveTask(taskId: string): Promise<TaskWithProject | null> {
  // Load all tasks and find this one
  const tasksRes = await fetch("/api/tasks", { cache: "no-store" });
  if (!tasksRes.ok) return null;
  const { tasks } = await tasksRes.json() as { tasks: Array<{
    id: string; categoryId: string; projectId: string; projectName: string;
    label: string; department: string | null; ownerId: string | null;
    ownerName: string | null; dueDate: string | null; status: string;
    isSetup: boolean; isRecurring: boolean; priority: string | null;
    estimatedHours: number | null; description: string | null;
    createdAt: string; updatedAt: string;
  }>};

  const flat = tasks.find((t) => t.id === taskId);
  if (!flat) return null;

  // Load project detail to get full ScopedTask with blockedBy
  const detailRes = await fetch(`/api/projects/detail?id=${encodeURIComponent(flat.projectId)}`, { cache: "no-store" });
  if (!detailRes.ok) {
    // Fall back to flat task without blockedBy
    return {
      task: {
        id: flat.id,
        label: flat.label,
        department: flat.department,
        ownerId: flat.ownerId,
        ownerName: flat.ownerName,
        dueDate: flat.dueDate,
        status: flat.status,
        isSetup: flat.isSetup,
        createdAt: flat.createdAt,
        updatedAt: flat.updatedAt,
        isOverdue: false,
        isBlocked: false,
        blockedBy: [],
        ownerRole:           null,
        blueprintAssigneeId: null,
        estimatedHours:      flat.estimatedHours,
        priority:            flat.priority,
        description:         flat.description,
        isAdHoc:             false,
      },
      categoryId: flat.categoryId,
      serviceLabel: "",
      projectId: flat.projectId,
      projectName: flat.projectName,
    };
  }

  const { record } = await detailRes.json() as { record: { id: string; name: string; categories: Array<{ id: string; serviceLabel: string; tasks: ScopedTask[] }> } };
  for (const cat of record.categories) {
    const found = cat.tasks.find((t) => t.id === taskId);
    if (found) {
      return {
        task: found,
        categoryId: cat.id,
        serviceLabel: cat.serviceLabel,
        projectId: record.id,
        projectName: record.name,
      };
    }
  }
  return null;
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [data, setData] = useState<TaskWithProject | null | undefined>(undefined);

  useEffect(() => {
    resolveTask(id).then((r) => setData(r)).catch(() => setData(null));
  }, [id]);

  if (data === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--rtm-bg)" }}>
        <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>Loading…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--rtm-bg)" }}>
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: "var(--rtm-text-secondary)" }}>Task not found.</p>
          <Link href="/projects/tasks" className="text-sm hover:underline" style={{ color: "var(--rtm-blue)" }}>Back to Tasks</Link>
        </div>
      </div>
    );
  }

  const { task, serviceLabel, projectId, projectName } = data;
  const sc = STATUS_CFG[task.status] ?? STATUS_CFG["open"];

  const TABS: { id: Tab; label: string }[] = [
    { id: "info",         label: "Task Info" },
    { id: "dependencies", label: `Dependencies (${task.blockedBy.length})` },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>

      {/* HEADER */}
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[900px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-3 flex-wrap" style={{ color: "var(--rtm-text-muted)" }}>
            <Link href="/projects" className="hover:underline" style={{ color: "var(--rtm-blue)" }}>Projects</Link>
            <span>/</span>
            <Link href={`/projects/${projectId}`} className="hover:underline" style={{ color: "var(--rtm-blue)" }}>{projectName}</Link>
            <span>/</span>
            <span>Task</span>
          </div>

          {/* Title */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <TaskStatusBadge status={task.status} />
                {task.priority && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border"
                    style={{ background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" }}>
                    {task.priority}
                  </span>
                )}
                {task.department && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                    {task.department}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-black" style={{ color: "var(--rtm-text-primary)" }}>{task.label}</h1>
              {task.description && (
                <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{task.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Link href={`/projects/${projectId}`}
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
              <Field label="Task ID"      value={task.id} />
              <Field label="Project"      value={<Link href={`/projects/${projectId}`} className="hover:underline" style={{ color: "var(--rtm-blue)" }}>{projectName}</Link>} />
              <Field label="Service"      value={serviceLabel || "—"} />
              <Field label="Department"   value={task.department ?? "—"} />
              <Field label="Status"       value={<TaskStatusBadge status={task.status} />} />
              <Field label="Priority"     value={task.priority ?? "—"} />
              {task.estimatedHours !== null && <Field label="Est. Hours" value={`${task.estimatedHours}h`} />}
              <Field label="Due Date"     value={task.dueDate ?? "—"} />
              <Field label="Owner"        value={task.ownerName ?? "Unassigned"} />
              <Field label="Setup Task"   value={task.isSetup ? "Yes" : "No"} />
              <Field label="Created"      value={new Date(task.createdAt).toLocaleString()} />
              <Field label="Updated"      value={new Date(task.updatedAt).toLocaleString()} />
            </div>

            {task.isBlocked && (
              <div className="rounded-xl px-4 py-3 text-sm font-semibold"
                style={{ background: "#FEF9C3", color: "#A16207", border: "1px solid #FDE68A" }}>
                This task is waiting on prerequisites to complete before it can start.
              </div>
            )}
            {task.isOverdue && (
              <div className="rounded-xl px-4 py-3 text-sm font-semibold"
                style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                This task is overdue (due date passed, not yet done).
              </div>
            )}
          </div>
        )}

        {/* DEPENDENCIES */}
        {activeTab === "dependencies" && (
          <div className="flex flex-col gap-4">
            {task.blockedBy.length === 0 ? (
              <div className="rounded-xl p-5 text-center text-sm"
                style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
                This task has no unmet prerequisites.
              </div>
            ) : (
              <>
                <div className="px-4 py-3 rounded-xl text-xs font-semibold"
                  style={{ background: "#FEF9C3", color: "#A16207", border: "1px solid #FDE68A" }}>
                  This task is waiting on the following tasks to be completed first.
                </div>
                {task.blockedBy.map((b, idx) => (
                  <div key={idx} className="rounded-xl p-4"
                    style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                    <p className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{b.label}</p>
                    {b.department && (
                      <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>Department: {b.department}</p>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
