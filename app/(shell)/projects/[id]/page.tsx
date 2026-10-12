"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { use } from "react";
import type { ScopedProjectDetail, ScopedTask, ScopedCategory } from "@/app/api/projects/detail/route";

// =============================================================================
// RTM OS — Project Detail Page
// Route: /projects/[id]
// Data source: Postgres via /api/projects/detail
// =============================================================================

type Tab = "overview" | "categories" | "tasks";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const CFG: Record<string, { bg: string; color: string; border: string; dot: string }> = {
    "active":    { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6" },
    "planned":   { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", dot: "#CBD5E1" },
    "on_hold":   { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA", dot: "#F97316" },
    "complete":  { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981" },
    "cancelled": { bg: "#F8FAFC", color: "#94A3B8", border: "#E4E8F0", dot: "#CBD5E1" },
  };
  const c = CFG[status] ?? CFG["planned"];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  const CFG: Record<string, { bg: string; color: string; dot: string }> = {
    "open":        { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
    "in_progress": { bg: "#FEF9C3", color: "#A16207", dot: "#EAB308" },
    "done":        { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
    "skipped":     { bg: "#F8FAFC", color: "#94A3B8", dot: "#CBD5E1" },
  };
  const c = CFG[status] ?? CFG["open"];
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

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>{label}</div>
      <div className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [project, setProject] = useState<ScopedProjectDetail | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const loadProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/detail?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json() as { record: ScopedProjectDetail };
        setProject(data.record ?? null);
      } else {
        setProject(null);
      }
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void loadProject(); }, [loadProject]);

  if (loading || project === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--rtm-bg)" }}>
        <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>Loading…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--rtm-bg)" }}>
        <div className="text-center">
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--rtm-text-secondary)" }}>
            Project not found.
          </p>
          <Link href="/projects" className="text-sm hover:underline" style={{ color: "var(--rtm-blue)" }}>
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // All tasks across all categories
  const allTasks: ScopedTask[] = project.categories.flatMap((c) => c.tasks);
  const tasksByDept = useMemo(() => {
    return allTasks.reduce<Record<string, ScopedTask[]>>((acc, t) => {
      const key = t.department ?? "Unassigned";
      acc[key] = acc[key] ?? [];
      acc[key].push(t);
      return acc;
    }, {});
  }, [allTasks]);

  const openCount    = allTasks.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const doneCount    = allTasks.filter((t) => t.status === "done").length;
  const blockedCount = allTasks.filter((t) => t.isBlocked).length;
  const overdueCount = allTasks.filter((t) => t.isOverdue).length;

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview",   label: "Overview" },
    { id: "categories", label: `Services (${project.categories.length})` },
    { id: "tasks",      label: `Tasks (${allTasks.length})` },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>

      {/* ── HEADER ── */}
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            <Link href="/projects" className="hover:underline" style={{ color: "var(--rtm-blue)" }}>Projects</Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>

          {/* Title */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <StatusBadge status={project.status} />
              </div>
              <h1 className="text-xl font-black mb-1" style={{ color: "var(--rtm-text-primary)" }}>{project.name}</h1>
              <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: "var(--rtm-text-secondary)" }}>
                <span>Domain: <b>{project.domain}</b></span>
                {project.assignedAMName && <span>AM: <b>{project.assignedAMName}</b></span>}
                {project.startDate && <span>Start: <b>{project.startDate}</b></span>}
                {project.endDate && <span>End: <b>{project.endDate}</b></span>}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/projects" className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50"
                style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                Back
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
            {/* Task summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Tasks", value: allTasks.length },
                { label: "Open",        value: openCount },
                { label: "Done",        value: doneCount },
                { label: "Blocked",     value: blockedCount },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>{m.label}</p>
                  <p className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>{m.value}</p>
                </div>
              ))}
            </div>

            {overdueCount > 0 && (
              <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                {overdueCount} task{overdueCount !== 1 ? "s" : ""} overdue
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Project ID"   value={project.id} />
              <Field label="Domain"       value={project.domain} />
              <Field label="Status"       value={<StatusBadge status={project.status} />} />
              <Field label="Account Manager" value={project.assignedAMName ?? "Unassigned"} />
              <Field label="Start Date"   value={project.startDate ?? "—"} />
              <Field label="End Date"     value={project.endDate ?? "—"} />
              <Field label="Services"     value={String(project.categories.length)} />
              <Field label="Total Tasks"  value={String(allTasks.length)} />
              <Field label="Created"      value={project.createdAt} />
            </div>

            {/* Onboarding record link */}
            {project.clientId && (
              <OnboardingLink clientId={project.clientId} projectId={project.id} />
            )}
          </div>
        )}

        {/* ── SERVICES / CATEGORIES ── */}
        {activeTab === "categories" && (
          <div className="flex flex-col gap-4">
            {project.categories.length === 0 && (
              <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>No service categories defined.</div>
            )}
            {project.categories.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        )}

        {/* ── TASKS ── */}
        {activeTab === "tasks" && (
          <div className="flex flex-col gap-4">
            {allTasks.length === 0 && (
              <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>No tasks generated for this project yet.</div>
            )}
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
                        <span className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>
                          {t.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <TaskStatusBadge status={t.status} />
                          {t.priority && (
                            <span className="text-[11px] font-bold" style={{ color: "var(--rtm-text-secondary)" }}>{t.priority}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                        {t.dueDate && <span>Due: <b style={{ color: "var(--rtm-text-secondary)" }}>{t.dueDate}</b></span>}
                        {t.ownerName && <span>Owner: <b style={{ color: "var(--rtm-text-secondary)" }}>{t.ownerName}</b></span>}
                        {t.isBlocked && (
                          <span style={{ color: "#DC2626" }}>Blocked by: {t.blockedBy.map((b) => b.label).join(", ")}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category card
// ---------------------------------------------------------------------------

function CategoryCard({ cat }: { cat: ScopedCategory }) {
  const done    = cat.tasks.filter((t) => t.status === "done").length;
  const open    = cat.tasks.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const blocked = cat.tasks.filter((t) => t.isBlocked).length;

  return (
    <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div>
          <h3 className="font-bold text-base" style={{ color: "var(--rtm-text-primary)" }}>{cat.serviceLabel}</h3>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{cat.department}</p>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
          <span>{cat.tasks.length} tasks</span>
          {done > 0 && <span style={{ color: "#059669" }}>{done} done</span>}
          {open > 0 && <span>{open} open</span>}
          {blocked > 0 && <span style={{ color: "#DC2626" }}>{blocked} blocked</span>}
        </div>
      </div>
      {cat.tasks.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {cat.tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
              style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
              <span className="text-xs font-semibold flex-1" style={{ color: "var(--rtm-text-primary)" }}>
                {t.label}
              </span>
              <div className="flex items-center gap-2">
                {t.dueDate && <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{t.dueDate}</span>}
                <TaskStatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onboarding record link
// ---------------------------------------------------------------------------

function OnboardingLink({ clientId, projectId }: { clientId: string; projectId: string }) {
  const [recordId, setRecordId] = useState<string | null | "loading">("loading");

  useEffect(() => {
    if (!clientId) { setRecordId(null); return; }
    fetch(`/api/onboarding-records?clientId=${encodeURIComponent(clientId)}`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { record?: { id: string; projectId: string | null } } | null) => {
        // Only use this record if it is linked to this project
        const rec = data?.record;
        if (rec && rec.projectId === projectId) {
          setRecordId(rec.id);
        } else {
          setRecordId(null);
        }
      })
      .catch(() => setRecordId(null));
  }, [clientId, projectId]);

  if (recordId === "loading") return null;
  if (!recordId) return (
    <div className="rounded-xl px-5 py-4" style={{ background: "#F8FAFC", border: "1px solid var(--rtm-border)" }}>
      <p className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Client Onboarding Record</p>
      <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No onboarding record linked to this project.</p>
      <Link href="/account-management/onboarding" className="inline-block mt-2 text-xs font-semibold hover:underline" style={{ color: "var(--rtm-blue)" }}>
        Go to Onboarding →
      </Link>
    </div>
  );

  return (
    <div className="rounded-xl px-5 py-4" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
      <p className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: "#059669" }}>Client Onboarding Record</p>
      <p className="text-sm mb-2" style={{ color: "#065F46" }}>Onboarding record found for this project.</p>
      <Link
        href={`/account-management/onboarding/${recordId}/record`}
        className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
        style={{ color: "#059669" }}
      >
        View Onboarding Record →
      </Link>
    </div>
  );
}
