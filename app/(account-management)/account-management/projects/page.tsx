"use client";

import { useState, useMemo } from "react";
import {
  ACTIVE_PROJECTS,
  DEPARTMENT_STATUS,
  type ActiveProject,
  type ProjectStatus,
} from "@/lib/account-management/am-client-success-data";

//  Badge helpers 

const STATUS_STYLES: Record<ProjectStatus, string> = {
  Active: "bg-green-100 text-green-800 border border-green-200",
  "On Hold": "bg-amber-100 text-amber-800 border border-amber-200",
  "At Risk": "bg-red-100 text-red-800 border border-red-200",
  Planning: "bg-blue-100 text-blue-800 border border-blue-200",
  Completed: "bg-teal-100 text-teal-800 border border-teal-200",
  Cancelled: "bg-slate-100 text-slate-700 border border-slate-200",
};

const ALL_STATUSES: ProjectStatus[] = [
  "Active",
  "Planning",
  "On Hold",
  "At Risk",
  "Completed",
  "Cancelled",
];

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

function CountBadge({
  count,
  color,
}: {
  count: number;
  color: "red"| "amber"| "gray";
}) {
  const styles = {
    red: "bg-red-100 text-red-700 border border-red-200",
    amber: "bg-amber-100 text-amber-700 border border-amber-200",
    gray: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[1.4rem] h-5 px-1.5 rounded text-xs font-bold ${styles[color]}`}
    >
      {count}
    </span>
  );
}

//  KPI Card 

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "green"| "red"| "amber"| "blue"| "default";
}) {
  const accentClass = {
    green: "text-green-600",
    red: "text-red-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
    default: "text-gray-900",
  }[accent ?? "default"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-bold ${accentClass}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

//  Progress Bar 

function ProgressBar({ pct }: { pct: number }) {
  const color =
    pct >= 75
      ? "bg-green-500": pct >= 50
      ? "bg-blue-500": pct >= 25
      ? "bg-amber-500": "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-9 text-right">
        {pct}%
      </span>
    </div>
  );
}

//  Project Card 

function ProjectCard({ project }: { project: ActiveProject }) {
  const hasDeps = project.dependencies.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-gray-900 text-sm leading-snug">
            {project.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{project.client}</p>
        </div>
        <StatusBadge status={project.launchStatus} />
      </div>

      {/* Departments */}
      <div className="flex flex-wrap gap-1">
        {project.departments.map((d) => (
          <span
            key={d}
            className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs px-2 py-0.5 rounded-full font-medium">
            {d}
          </span>
        ))}
      </div>

      {/* Milestones */}
      <div className="text-xs text-gray-500 leading-relaxed">
        {project.milestones.map((m, i) => (
          <span key={m}>
            <span
              className={
                i === 0
                  ? "text-gray-700 font-medium": "text-gray-400"}
            >
              {m}
            </span>
            {i < project.milestones.length - 1 && (
              <span className="mx-1 text-gray-300">→</span>
            )}
          </span>
        ))}
      </div>

      {/* Progress */}
      <ProgressBar pct={project.completionPct} />

      {/* Counters row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <span className="text-gray-400">Blocked</span>
          <CountBadge
            count={project.blockedTasks}
            color={project.blockedTasks > 0 ? "red": "gray"}
          />
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <span className="text-gray-400">Escalations</span>
          <CountBadge
            count={project.escalations}
            color={project.escalations > 0 ? "red": "gray"}
          />
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <span className="text-gray-400">Approvals</span>
          <CountBadge
            count={project.approvalsPending}
            color={project.approvalsPending > 0 ? "amber": "gray"}
          />
        </span>
      </div>

      {/* Dependencies */}
      {hasDeps && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <div className="flex items-start gap-1.5">
            <span className="text-amber-500 text-sm mt-px">⚠</span>
            <div>
              <p className="text-xs font-semibold text-amber-800 mb-0.5">
                Dependencies
              </p>
              <ul className="space-y-0.5">
                {project.dependencies.map((dep) => (
                  <li key={dep} className="text-xs text-amber-700">
                    {dep}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Due{""}
          <span className="text-gray-600 font-medium">
            {new Date(project.dueDate + "T00:00:00").toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric"}
            )}
          </span>
        </span>
        <span className="text-xs text-gray-500 font-medium">
          {project.accountManager}
        </span>
      </div>
    </div>
  );
}

//  Main Page 

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | "All">(
    "All");

  // KPI calculations
  const kpis = useMemo(() => {
    const total = ACTIVE_PROJECTS.length;
    const active = ACTIVE_PROJECTS.filter(
      (p) => p.launchStatus === "Active").length;
    const atRisk = ACTIVE_PROJECTS.filter(
      (p) => p.launchStatus === "At Risk").length;
    const blockedTasks = ACTIVE_PROJECTS.reduce(
      (s, p) => s + p.blockedTasks,
      0
    );
    const escalations = ACTIVE_PROJECTS.reduce(
      (s, p) => s + p.escalations,
      0
    );
    const approvals = ACTIVE_PROJECTS.reduce(
      (s, p) => s + p.approvalsPending,
      0
    );
    const avgCompletion = Math.round(
      ACTIVE_PROJECTS.reduce((s, p) => s + p.completionPct, 0) / total
    );

    return {
      total,
      active,
      atRisk,
      blockedTasks,
      escalations,
      approvals,
      avgCompletion,
    };
  }, []);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: ACTIVE_PROJECTS.length };
    for (const s of ALL_STATUSES) {
      counts[s] = ACTIVE_PROJECTS.filter((p) => p.launchStatus === s).length;
    }
    return counts;
  }, []);

  // Filtered projects
  const filtered = useMemo(() => {
    if (activeFilter === "All") return ACTIVE_PROJECTS;
    return ACTIVE_PROJECTS.filter((p) => p.launchStatus === activeFilter);
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/*  Page Header  */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Project Launch Center
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track active projects, milestones, blockers, and department
            coordination across all client accounts.
          </p>
        </div>

        {/*  KPI Row  */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <KpiCard label="Total Projects"value={kpis.total} accent="default"/>
          <KpiCard
            label="Active"value={kpis.active}
            accent="green"sub={`of ${kpis.total} projects`}
          />
          <KpiCard
            label="At Risk"value={kpis.atRisk}
            accent={kpis.atRisk > 0 ? "red": "default"}
            sub="need attention"/>
          <KpiCard
            label="Blocked Tasks"value={kpis.blockedTasks}
            accent={kpis.blockedTasks > 0 ? "red": "default"}
            sub="across all projects"/>
          <KpiCard
            label="Open Escalations"value={kpis.escalations}
            accent={kpis.escalations > 0 ? "red": "default"}
            sub="require action"/>
          <KpiCard
            label="Pending Approvals"value={kpis.approvals}
            accent={kpis.approvals > 0 ? "amber": "default"}
            sub="awaiting sign-off"/>
          <KpiCard
            label="Avg Completion"value={`${kpis.avgCompletion}%`}
            accent="blue"sub="across all projects"/>
        </div>

        {/*  Status Filter Tabs  */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-0">
          {(["All", ...ALL_STATUSES] as (ProjectStatus | "All")[]).map(
            (status) => {
              const isActive = activeFilter === status;
              const count = tabCounts[status] ?? 0;
              return (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    isActive
                      ? "border-indigo-600 text-indigo-700 bg-indigo-50": "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-transparent"}`}
                >
                  {status}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700": "bg-gray-100 text-gray-500"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/*  Project Cards Grid  */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No projects match the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/*  Department Coordination Summary  */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Department Coordination
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Department
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Open Tasks
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Blocked
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Escalations
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Upcoming Deliverables
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Dependencies
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {DEPARTMENT_STATUS.map((dept, idx) => (
                  <tr
                    key={dept.department}
                    className={idx % 2 === 0 ? "bg-white": "bg-gray-50/50"}
                  >
                    {/* Department name */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-800">
                        {dept.department}
                      </span>
                    </td>

                    {/* Open Tasks */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[1.75rem] h-6 px-2 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                        {dept.openTasks}
                      </span>
                    </td>

                    {/* Blocked */}
                    <td className="px-5 py-4 text-center">
                      {dept.blockedWork > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-[1.75rem] h-6 px-2 rounded-full bg-red-50 text-red-700 font-bold text-xs border border-red-100">
                          {dept.blockedWork}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Escalations */}
                    <td className="px-5 py-4 text-center">
                      {dept.escalations > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-[1.75rem] h-6 px-2 rounded-full bg-red-50 text-red-700 font-bold text-xs border border-red-100">
                          {dept.escalations}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Upcoming Deliverables */}
                    <td className="px-5 py-4">
                      <ul className="space-y-1">
                        {dept.upcomingDeliverables.map((d) => (
                          <li
                            key={d}
                            className="flex items-start gap-1.5 text-xs text-gray-600">
                            <span className="text-indigo-400 mt-px">•</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </td>

                    {/* Dependencies */}
                    <td className="px-5 py-4">
                      {dept.dependencies.length > 0 ? (
                        <ul className="space-y-1">
                          {dept.dependencies.map((dep) => (
                            <li
                              key={dep}
                              className="flex items-start gap-1.5 text-xs text-amber-700">
                              <span className="text-amber-400 mt-px">⚠</span>
                              {dep}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-gray-300">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
