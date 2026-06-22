"use client";

import React, { useState } from "react";
import {
  ONBOARDING_RECORDS,
  type OnboardingRecord,
  type OnboardingStatus,
} from "@/lib/account-management/am-client-success-data";

// ── Badge helpers ─────────────────────────────────────────────────────────────

const ONBOARDING_STATUS_COLORS: Record<OnboardingStatus, string> = {
  Pending: "bg-slate-100 text-slate-600 border border-slate-200",
  "In Progress": "bg-blue-100 text-blue-700 border border-blue-200",
  "Waiting On Client": "bg-amber-100 text-amber-700 border border-amber-200",
  "Ready To Launch": "bg-teal-100 text-teal-700 border border-teal-200",
  Completed: "bg-green-100 text-green-700 border border-green-200",
};

const ONBOARDING_STATUS_DOT: Record<OnboardingStatus, string> = {
  Pending: "bg-slate-400",
  "In Progress": "bg-blue-500",
  "Waiting On Client": "bg-amber-500",
  "Ready To Launch": "bg-teal-500",
  Completed: "bg-green-500",
};

function OnboardingBadge({ status }: { status: OnboardingStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${ONBOARDING_STATUS_COLORS[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${ONBOARDING_STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

function ActivationBadge({ status }: { status: OnboardingRecord["activationStatus"] }) {
  const map: Record<OnboardingRecord["activationStatus"], string> = {
    "Not Started": "bg-slate-100 text-slate-500 border border-slate-200",
    "In Progress": "bg-blue-50 text-blue-600 border border-blue-200",
    Complete: "bg-green-100 text-green-700 border border-green-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${map[status]}`}>
      {status}
    </span>
  );
}

function ProjectCreationBadge({ status }: { status: OnboardingRecord["projectCreationStatus"] }) {
  const map: Record<OnboardingRecord["projectCreationStatus"], string> = {
    "Not Created": "bg-slate-100 text-slate-500 border border-slate-200",
    Created: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    Launched: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${map[status]}`}>
      {status}
    </span>
  );
}

function PillBadge({ label, color }: { label: string; color?: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color ?? "bg-slate-50 text-slate-600 border-slate-200"}`}
    >
      {label}
    </span>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const barColor =
    pct === 100
      ? "bg-green-500"
      : pct >= 60
      ? "bg-blue-500"
      : pct >= 30
      ? "bg-amber-400"
      : "bg-slate-300";

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
        {completed}/{total}
      </span>
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col gap-1 shadow-sm">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-bold ${accent}`}>{value}</span>
    </div>
  );
}

// ── All statuses ──────────────────────────────────────────────────────────────

const ALL_STATUSES: OnboardingStatus[] = [
  "Pending",
  "In Progress",
  "Waiting On Client",
  "Ready To Launch",
  "Completed",
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OnboardingCenterPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | OnboardingStatus>("All");

  const records = ONBOARDING_RECORDS;

  // KPI counts
  const total = records.length;
  const kpiCounts: Record<OnboardingStatus, number> = {
    Pending: 0,
    "In Progress": 0,
    "Waiting On Client": 0,
    "Ready To Launch": 0,
    Completed: 0,
  };
  records.forEach((r) => {
    kpiCounts[r.onboardingStatus] = (kpiCounts[r.onboardingStatus] ?? 0) + 1;
  });

  // Filtered table rows
  const filtered =
    activeFilter === "All"
      ? records
      : records.filter((r) => r.onboardingStatus === activeFilter);

  // Blockers summary
  const withBlockers = records.filter((r) => r.blockers.length > 0);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Onboarding Center</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Track client onboarding progress, activation status, and blockers.
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            {total} total records
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Total" value={total} accent="text-slate-800" />
          <KpiCard label="In Progress" value={kpiCounts["In Progress"]} accent="text-blue-600" />
          <KpiCard label="Waiting On Client" value={kpiCounts["Waiting On Client"]} accent="text-amber-600" />
          <KpiCard label="Ready To Launch" value={kpiCounts["Ready To Launch"]} accent="text-teal-600" />
          <KpiCard label="Completed" value={kpiCounts["Completed"]} accent="text-green-600" />
          <KpiCard label="Pending" value={kpiCounts["Pending"]} accent="text-slate-500" />
        </div>

        {/* ── Status Filter Tabs ── */}
        <div className="flex flex-wrap gap-2">
          {(["All", ...ALL_STATUSES] as const).map((s) => {
            const isActive = activeFilter === s;
            const count = s === "All" ? total : kpiCounts[s];
            return (
              <button
                key={s}
                onClick={() => setActiveFilter(s as typeof activeFilter)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {s}
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Main Table ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Contract
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Services
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Departments
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Onboarding Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Activation
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Project
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Assigned AM
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Progress
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Blockers
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-slate-400 text-sm">
                      No onboarding records match this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Client */}
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                        {record.client}
                      </td>

                      {/* Contract */}
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {record.contract}
                      </td>

                      {/* Services Purchased */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {record.servicesPurchased.map((svc) => (
                            <PillBadge
                              key={svc}
                              label={svc}
                              color="bg-violet-50 text-violet-700 border-violet-200"
                            />
                          ))}
                        </div>
                      </td>

                      {/* Assigned Departments */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {record.assignedDepartments.map((dept) => (
                            <PillBadge
                              key={dept}
                              label={dept}
                              color="bg-sky-50 text-sky-700 border-sky-200"
                            />
                          ))}
                        </div>
                      </td>

                      {/* Onboarding Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <OnboardingBadge status={record.onboardingStatus} />
                      </td>

                      {/* Activation Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <ActivationBadge status={record.activationStatus} />
                      </td>

                      {/* Project Creation Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <ProjectCreationBadge status={record.projectCreationStatus} />
                      </td>

                      {/* Assigned AM */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {record.assignedAM
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <span className="text-slate-700 text-sm">{record.assignedAM}</span>
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="px-4 py-3">
                        <ProgressBar
                          completed={record.completedSteps}
                          total={record.totalSteps}
                        />
                      </td>

                      {/* Blockers */}
                      <td className="px-4 py-3">
                        {record.blockers.length === 0 ? (
                          <span className="text-slate-300 text-xs">—</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {record.blockers.map((blocker, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-1.5 text-xs text-red-600"
                              >
                                <span className="mt-0.5 flex-shrink-0">⚠</span>
                                <span>{blocker}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Blockers Summary ── */}
        {withBlockers.length > 0 && (
          <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-red-100 bg-red-50 flex items-center gap-3">
              <span className="text-red-500 text-lg">⚠</span>
              <div>
                <h2 className="text-sm font-semibold text-red-800">Blockers Summary</h2>
                <p className="text-xs text-red-500 mt-0.5">
                  {withBlockers.length} onboarding{withBlockers.length !== 1 ? "s" : ""} with active blockers requiring attention
                </p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {withBlockers.map((record) => (
                <div key={record.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-shrink-0 sm:w-56">
                    <div className="font-medium text-slate-800 text-sm">{record.client}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{record.contract}</div>
                    <div className="mt-1.5">
                      <OnboardingBadge status={record.onboardingStatus} />
                    </div>
                  </div>
                  <div className="flex-shrink-0 sm:w-32 text-xs text-slate-500">
                    <div className="font-medium text-slate-600 mb-0.5">Assigned AM</div>
                    {record.assignedAM}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-slate-500 mb-1.5">Active Blockers</div>
                    <ul className="space-y-1.5">
                      {record.blockers.map((blocker, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
                        >
                          <span className="flex-shrink-0 mt-0.5 text-red-400">⚠</span>
                          {blocker}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-shrink-0 sm:w-40">
                    <div className="text-xs font-medium text-slate-500 mb-1">Progress</div>
                    <ProgressBar
                      completed={record.completedSteps}
                      total={record.totalSteps}
                    />
                    <div className="text-xs text-slate-400 mt-1">
                      Target: {record.targetDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
