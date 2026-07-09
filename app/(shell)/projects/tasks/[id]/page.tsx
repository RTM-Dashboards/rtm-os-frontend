"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import {
  getTask,
  getProject,
  getBlueprint,
  getAllTasks,
  ENGINE_STORE,
  type Task,
  type Project,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/engine";

// =============================================================================
// RTM OS — Task Detail Page
// Route: /projects/tasks/[id]
// =============================================================================

type Tab = "info" | "project" | "blueprint" | "dependencies" | "notes" | "activity" | "files" | "automation";

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

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("info");

  const [liveTask, setLiveTask] = useState<Task | null | undefined>(undefined);
  const [allTasks, setAllTasks] = useState<Task[]>(() => getAllTasks());
  const [liveProject, setLiveProject] = useState<Project | undefined>(() => undefined);

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
          setLiveProject((pd.projects as Project[]).find((p) => p.id === found.projectId));
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
    { id: "info",         label: "Task Info" },
    { id: "project",      label: "Related Project" },
    { id: "blueprint",    label: "Blueprint" },
    { id: "dependencies", label: `Dependencies (${task.dependencies.length})` },
    { id: "notes",        label: `Notes (${task.notes.length})` },
    { id: "activity",     label: "Activity" },
    { id: "files",        label: "Files" },
    { id: "automation",   label: "Automation History" },
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
