"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { ProjectRecord } from "@/lib/sales/project-config";
import {
  getProjects,
  getAllTasks,
  getBlueprints,
  type Project,
  type Task,
  type TaskBlueprint,
  type ProjectStatus,
  type ProjectHealth,
  type ServicePackage,
} from "@/lib/engine";

// =============================================================================
// RTM OS — Global Projects & Tasks Engine
// Route: /projects
// Single source of truth for all client projects, milestones, tasks, blueprints
// =============================================================================

// ---------------------------------------------------------------------------
// Design tokens (semantic only)
// ---------------------------------------------------------------------------

const STATUS_CFG: Record<ProjectStatus, { bg: string; color: string; border: string; dot: string }> = {
  "Draft":               { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", dot: "#CBD5E1" },
  "Ready to Launch":     { bg: "#ECFEFF", color: "#0E7490", border: "#A5F3FC", dot: "#06B6D4" },
  "Launched":            { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6" },
  "In Progress":         { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A", dot: "#EAB308" },
  "Blocked":             { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444" },
  "Pending Client":      { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA", dot: "#F97316" },
  "Pending Department":  { bg: "#FAF5FF", color: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6" },
  "Completed":           { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981" },
  "Cancelled":           { bg: "#F8FAFC", color: "#94A3B8", border: "#E4E8F0", dot: "#CBD5E1" },
};

const HEALTH_CFG: Record<ProjectHealth, { bg: string; color: string }> = {
  "Green":  { bg: "#ECFDF5", color: "#059669" },
  "Yellow": { bg: "#FFFBEB", color: "#D97706" },
  "Red":    { bg: "#FEF2F2", color: "#DC2626" },
};

// ---------------------------------------------------------------------------
// Shared small components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ProjectStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function HealthDot({ health }: { health: ProjectHealth }) {
  const c = HEALTH_CFG[health];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: c.bg, color: c.color }}
    >
      {health}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#1B4FD8","#059669","#7C3AED","#D97706","#DC2626","#0891B2","#BE185D"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold flex-shrink-0"
      style={{ background: bg }}
    >
      {initials}
    </span>
  );
}

function KpiCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1.5"
      style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>
        {label}
      </span>
      <span className="text-3xl font-black" style={{ color: color ?? "var(--rtm-text-primary)" }}>
        {value}
      </span>
      {sub && <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{sub}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row actions menu
// ---------------------------------------------------------------------------

function RowActions({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        style={{ color: "#94A3B8" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-8 z-50 w-44 rounded-xl shadow-xl bg-white py-1.5"
            style={{ border: "1px solid var(--rtm-border)" }}
          >
            {[
              { label: "View Project",   href: `/projects/${project.id}` },
              { label: "View Tasks",     href: `/projects/${project.id}#tasks` },
              { label: "View Client",    href: `/clients/${project.clientSlug}` },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                onClick={() => setOpen(false)}
                className="block px-3.5 py-2 text-sm hover:bg-gray-50"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock onboarding projects (created from billing handoff)
// ---------------------------------------------------------------------------

const MOCK_ONBOARDING_PROJECTS: ProjectRecord[] = [
  {
    id: "prj-onb-001",
    projectNumber: "PRJ-2025-4821",
    clientName: "Summit Landscaping",
    contractNumber: "CTR-2025-0041",
    handoffId: "hof-001",
    proposalId: "",
    status: "not-started",
    priority: "high",
    phase: "onboarding",
    services: [],
    totalMonthlyValue: 2400,
    totalSetupFees: 0,
    assignedAM: "Jake Monroe",
    createdAt: new Date().toISOString(),
    startDate: new Date().toISOString().split("T")[0],
    estimatedLaunchDate: "",
    notes: "",
  },
  {
    id: "prj-onb-002",
    projectNumber: "PRJ-2025-3317",
    clientName: "Apex Roofing LLC",
    contractNumber: "CTR-2025-0038",
    handoffId: "hof-002",
    proposalId: "",
    status: "not-started",
    priority: "high",
    phase: "onboarding",
    services: [],
    totalMonthlyValue: 3800,
    totalSetupFees: 500,
    assignedAM: null,
    createdAt: new Date().toISOString(),
    startDate: new Date().toISOString().split("T")[0],
    estimatedLaunchDate: "",
    notes: "",
  },
  {
    id: "prj-onb-003",
    projectNumber: "PRJ-2025-2094",
    clientName: "Greenleaf Dental",
    contractNumber: "CTR-2025-0035",
    handoffId: "hof-003",
    proposalId: "",
    status: "not-started",
    priority: "medium",
    phase: "onboarding",
    services: [],
    totalMonthlyValue: 1900,
    totalSetupFees: 0,
    assignedAM: "Dana W.",
    createdAt: new Date().toISOString(),
    startDate: new Date().toISOString().split("T")[0],
    estimatedLaunchDate: "",
    notes: "",
  },
];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type ViewMode = "projects" | "tasks";

export default function GlobalProjectsPage() {
  const [view, setView] = useState<ViewMode>("projects");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [healthFilter, setHealthFilter] = useState<ProjectHealth | "All">("All");
  const [packageFilter, setPackageFilter] = useState<ServicePackage | "All">("All");
  const [search, setSearch] = useState("");

  // Live data — initialized from seed, hydrated from API on mount
  const [liveProjects, setLiveProjects] = useState<Project[]>(() => getProjects());
  const [liveTasks, setLiveTasks] = useState<Task[]>(() => getAllTasks());
  const [liveBlueprints] = useState<TaskBlueprint[]>(() => getBlueprints());

  useEffect(() => {
    Promise.all([
      fetch("/api/engine?resource=projects").then((r) => r.ok ? r.json() : null),
      fetch("/api/engine?resource=tasks").then((r) => r.ok ? r.json() : null),
    ]).then(([pd, td]) => {
      if (pd?.projects) setLiveProjects(pd.projects as Project[]);
      if (td?.tasks) setLiveTasks(td.tasks as Task[]);
    }).catch(() => {/* keep seed */});
  }, []);

  const projects = liveProjects;
  const allTasks = liveTasks;
  const blueprints = liveBlueprints;
  const kpis = {
    total:          projects.length,
    active:         projects.filter((p) => p.status === "In Progress" || p.status === "Launched").length,
    blocked:        projects.filter((p) => p.status === "Blocked" || p.status === "Pending Client").length,
    completed:      projects.filter((p) => p.status === "Completed").length,
    healthGreen:    projects.filter((p) => p.health === "Green").length,
    healthYellow:   projects.filter((p) => p.health === "Yellow").length,
    healthRed:      projects.filter((p) => p.health === "Red").length,
    totalTasks:     allTasks.length,
    openTasks:      allTasks.filter((t) => t.status !== "Completed" && t.status !== "Cancelled").length,
    blockedTasks:   allTasks.filter((t) => t.status === "Blocked").length,
    completedTasks: allTasks.filter((t) => t.status === "Completed").length,
    tasksWithDeps:  allTasks.filter((t) => t.dependencies.length > 0).length,
  };

  const [taskSearch, setTaskSearch] = useState("");
  const [taskDeptFilter, setTaskDeptFilter] = useState("All");
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (healthFilter !== "All" && p.health !== healthFilter) return false;
      if (packageFilter !== "All" && p.servicePackage !== packageFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.client.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [projects, statusFilter, healthFilter, packageFilter, search]);

  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      if (taskSearch && !t.title.toLowerCase().includes(taskSearch.toLowerCase())) return false;
      if (taskDeptFilter !== "All" && t.department !== taskDeptFilter) return false;
      if (taskStatusFilter !== "All" && t.status !== taskStatusFilter) return false;
      return true;
    });
  }, [allTasks, taskSearch, taskDeptFilter, taskStatusFilter]);

  const allDepts = Array.from(new Set(allTasks.map((t) => t.department))).sort();
  const allStatuses: ProjectStatus[] = ["Draft","Ready to Launch","Launched","In Progress","Pending Client","Pending Department","Blocked","Completed","Cancelled"];
  const allHealths: ProjectHealth[] = ["Green","Yellow","Red"];
  const allPackages: ServicePackage[] = ["SEO Only","SEO + GBP","PPC + Landing Page","Full Service","Reporting Only","Website Build","AI Automation","Upsell","Renewal","Custom"];
  const allTaskStatuses = ["Open","In Progress","Waiting","Review","Blocked","Completed","Cancelled"];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>

      {/* ── PAGE HEADER ── */}
      <div
        className="px-6 pt-6 pb-4"
        style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}
      >
        <div className="max-w-[1600px] mx-auto">
          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>
                  Global Projects &amp; Tasks Engine
                </h1>
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                  style={{ background: "var(--rtm-blue)", color: "white" }}
                >
                  v1
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                Single source of truth for projects, milestones, blueprints, tasks, and department assignments.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/projects/blueprints"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border hover:bg-gray-50"
                style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
              >
                Task Blueprints
              </Link>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90"
                style={{ background: "var(--rtm-blue)" }}
              >
                + New Project
              </button>
            </div>
          </div>

          {/* Architecture flow */}
          <div
            className="flex flex-wrap items-center gap-1.5 mb-5 px-4 py-3 rounded-xl text-xs font-semibold overflow-x-auto"
            style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE" }}
          >
            {["Project","Milestones","Task Blueprints","Generated Tasks","Assigned Department","Assigned User","Workspace Views"].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-1.5 whitespace-nowrap">
                <span
                  className="px-2 py-1 rounded-lg"
                  style={{ background: "white", color: "var(--rtm-blue)", border: "1px solid #BFDBFE" }}
                >
                  {step}
                </span>
                {i < arr.length - 1 && <span style={{ color: "var(--rtm-blue)" }}>→</span>}
              </span>
            ))}
          </div>

          {/* View tabs */}
          <div className="flex gap-1">
            {([["projects","Projects"], ["tasks","All Tasks"]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setView(id as ViewMode)}
                className="px-4 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  color: view === id ? "var(--rtm-blue)" : "var(--rtm-text-secondary)",
                  borderBottom: view === id ? "2px solid var(--rtm-blue)" : "2px solid transparent",
                  background: "transparent",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 px-6 py-5 max-w-[1600px] mx-auto w-full">

        {/* ── New projects onboarding alert banner ── */}
        {MOCK_ONBOARDING_PROJECTS.length > 0 && (
          <div
            className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 border mb-5"
            style={{
              background: "#FFFBEB",
              borderColor: "#FDE68A",
            }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#D97706" }}
              />
              <p
                className="text-xs font-semibold"
                style={{ color: "#92400E" }}
              >
                {MOCK_ONBOARDING_PROJECTS.length} new project
                {MOCK_ONBOARDING_PROJECTS.length !== 1 ? "s" : ""} awaiting
                onboarding kickoff.
              </p>
            </div>
            <Link
              href="#new-projects"
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border hover:opacity-80 transition-opacity"
              style={{
                background: "#D97706",
                color: "#fff",
                borderColor: "#D97706",
              }}
            >
              View New Projects
            </Link>
          </div>
        )}

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          <KpiCard label="Total Projects"   value={kpis.total}          sub="All projects" />
          <KpiCard label="Active"           value={kpis.active}         sub="In Progress / Launched" />
          <KpiCard label="Pending / Blocked"value={kpis.blocked}        sub="Needs attention"   color="#C2410C" />
          <KpiCard label="Completed"        value={kpis.completed}      sub="Delivered"         color="#059669" />
          <KpiCard label="Total Tasks"      value={kpis.totalTasks}     sub="Across all projects" />
          <KpiCard label="Open Tasks"       value={kpis.openTasks}      sub="Active work" />
          <KpiCard label="Blocked Tasks"    value={kpis.blockedTasks}   sub="Need unblocking"   color="#DC2626" />
          <KpiCard label="Blueprints"       value={blueprints.length}   sub="Task blueprints"   color="#7C3AED" />
        </div>

        {/* ── PROJECTS VIEW ── */}
        {view === "projects" && (
          <div className="flex flex-col gap-4">
            {/* Filters */}
            <div
              className="flex flex-wrap gap-3 items-center p-4 rounded-xl"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
            >
              <div className="flex-1 min-w-[200px] relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects or clients..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
                />
              </div>
              {[
                { label: "Status",  value: statusFilter,  values: ["All", ...allStatuses],  set: setStatusFilter  as (v: string) => void },
                { label: "Health",  value: healthFilter,  values: ["All", ...allHealths],   set: setHealthFilter  as (v: string) => void },
                { label: "Package", value: packageFilter, values: ["All", ...allPackages],  set: setPackageFilter as (v: string) => void },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-1.5">
                  <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>{f.label}:</span>
                  <select
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="rounded-lg px-2 py-1.5 text-xs border outline-none"
                    style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
                  >
                    {f.values.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              ))}
              <span className="text-xs font-semibold ml-auto" style={{ color: "var(--rtm-text-muted)" }}>
                {filteredProjects.length} of {projects.length}
              </span>
            </div>

            {/* Table */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead>
                    <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                      {["Project","Client","Package","Account Manager","Owner","Depts","Milestones","Tasks","Launch Date","Status","Health","Actions"].map((col) => (
                        <th
                          key={col}
                          className="px-3 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                          style={{ color: "var(--rtm-text-secondary)" }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((p, i) => (
                      <tr
                        key={p.id}
                        className="hover:bg-blue-50/30 transition-colors"
                        style={{ borderBottom: i < filteredProjects.length - 1 ? "1px solid var(--rtm-border-light)" : "none" }}
                      >
                        <td className="px-3 py-3 max-w-[220px]">
                          <Link
                            href={`/projects/${p.id}`}
                            className="font-semibold hover:underline text-sm"
                            style={{ color: "var(--rtm-blue)" }}
                          >
                            {p.name}
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/clients/${p.clientSlug}`}
                            className="text-xs font-medium hover:underline"
                            style={{ color: "var(--rtm-text-primary)" }}
                          >
                            {p.client}
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className="text-[11px] px-2 py-0.5 rounded-lg font-semibold border"
                            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
                          >
                            {p.servicePackage}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <Avatar name={p.accountManager} />
                            <span className="text-xs">{p.accountManager}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                          {p.owner}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className="text-xs font-semibold px-1.5 py-0.5 rounded"
                            style={{ background: "#EFF6FF", color: "var(--rtm-blue)" }}
                          >
                            {p.departments.length}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs font-medium" style={{ color: "var(--rtm-text-secondary)" }}>
                          {p.milestoneIds.length}
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs font-bold" style={{ color: p.taskIds.length > 0 ? "#D97706" : "#059669" }}>
                            {p.taskIds.length}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                          {p.launchDate}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-3 py-3">
                          <HealthDot health={p.health} />
                        </td>
                        <td className="px-3 py-3">
                          <RowActions project={p} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProjects.length === 0 && (
                  <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    No projects match your filters.
                  </div>
                )}
              </div>
            </div>

            {/* Architecture info card */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
            >
              {[
                {
                  title: "Department Views are Filters",
                  body: "Sales, Billing, SEO, PPC and other department task pages do not own tasks. They filter this engine by Department = [name].",
                  color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE",
                },
                {
                  title: "Blueprints Generate Tasks",
                  body: "Task Blueprints define the template. When a blueprint is applied to a milestone, tasks are generated and assigned to the correct department.",
                  color: "#7C3AED", bg: "#FAF5FF", border: "#DDD6FE",
                },
                {
                  title: "Dependencies Enforce Order",
                  body: "Tasks support Finish-To-Start dependencies. Task B cannot start until Task A completes. The engine tracks this across all projects.",
                  color: "#059669", bg: "#ECFDF5", border: "#A7F3D0",
                },
              ].map((card) => (
                <div key={card.title} className="rounded-xl p-4" style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                  <p className="text-xs font-black mb-2" style={{ color: card.color }}>{card.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ALL TASKS VIEW ── */}
        {view === "tasks" && (
          <div className="flex flex-col gap-4">
            <div
              className="flex flex-wrap gap-3 items-center p-4 rounded-xl"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
            >
              <div className="flex-1 min-w-[200px] relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>Department:</span>
                <select
                  value={taskDeptFilter}
                  onChange={(e) => setTaskDeptFilter(e.target.value)}
                  className="rounded-lg px-2 py-1.5 text-xs border outline-none"
                  style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
                >
                  <option>All</option>
                  {allDepts.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>Status:</span>
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="rounded-lg px-2 py-1.5 text-xs border outline-none"
                  style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
                >
                  <option>All</option>
                  {allTaskStatuses.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <span className="text-xs font-semibold ml-auto" style={{ color: "var(--rtm-text-muted)" }}>
                {filteredTasks.length} of {allTasks.length} tasks
              </span>
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1100px]">
                  <thead>
                    <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                      {["Task","Project","Client","Department","Service","Assignee","Source","Priority","Status","Due Date","Deps"].map((col) => (
                        <th
                          key={col}
                          className="px-3 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                          style={{ color: "var(--rtm-text-secondary)" }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((t, i) => {
                      const TSTATUS: Record<string, { bg: string; color: string; dot: string }> = {
                        "Open":       { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
                        "In Progress":{ bg: "#FEF9C3", color: "#A16207", dot: "#EAB308" },
                        "Waiting":    { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8" },
                        "Review":     { bg: "#FAF5FF", color: "#6D28D9", dot: "#8B5CF6" },
                        "Blocked":    { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
                        "Completed":  { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
                        "Cancelled":  { bg: "#F8FAFC", color: "#94A3B8", dot: "#CBD5E1" },
                      };
                      const TPRIORITY: Record<string, { color: string }> = {
                        "Low":    { color: "#64748B" },
                        "Medium": { color: "#D97706" },
                        "High":   { color: "#DC2626" },
                        "Urgent": { color: "#7C3AED" },
                      };
                      const sc = TSTATUS[t.status] ?? TSTATUS["Open"];
                      const pc = TPRIORITY[t.priority] ?? TPRIORITY["Medium"];
                      return (
                        <tr
                          key={t.id}
                          className="hover:bg-blue-50/30 transition-colors"
                          style={{ borderBottom: i < filteredTasks.length - 1 ? "1px solid var(--rtm-border-light)" : "none" }}
                        >
                          <td className="px-3 py-3 max-w-[200px]">
                            <Link
                              href={`/projects/tasks/${t.id}`}
                              className="font-semibold text-sm hover:underline"
                              style={{ color: "var(--rtm-blue)" }}
                            >
                              {t.title}
                            </Link>
                          </td>
                          <td className="px-3 py-3">
                            <Link
                              href={`/projects/${t.projectId}`}
                              className="text-xs hover:underline"
                              style={{ color: "var(--rtm-text-secondary)" }}
                            >
                              {t.projectName}
                            </Link>
                          </td>
                          <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{t.clientName}</td>
                          <td className="px-3 py-3">
                            <span
                              className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                            >
                              {t.department}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>{t.service}</td>
                          <td className="px-3 py-3">
                            {t.assignedUserName ? (
                              <div className="flex items-center gap-1.5">
                                <Avatar name={t.assignedUserName} />
                                <span className="text-xs">{t.assignedUserName}</span>
                              </div>
                            ) : (
                              <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Unassigned</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className="text-[11px] px-2 py-0.5 rounded font-semibold"
                              style={{ background: "#FAF5FF", color: "#7C3AED" }}
                            >
                              {t.source}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs font-bold" style={{ color: pc.color }}>{t.priority}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                              style={{ background: sc.bg, color: sc.color }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
                              {t.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{t.dueDate}</td>
                          <td className="px-3 py-3">
                            {t.dependencies.length > 0 ? (
                              <span
                                className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: "#FEF2F2", color: "#DC2626" }}
                              >
                                {t.dependencies.length}
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredTasks.length === 0 && (
                  <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    No tasks match your filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
