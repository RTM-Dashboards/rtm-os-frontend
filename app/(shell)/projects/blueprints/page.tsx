"use client";

import { useState } from "react";
import Link from "next/link";
import { getBlueprints, type TaskBlueprint, type DepartmentName } from "@/lib/engine";

// =============================================================================
// RTM OS — Task Blueprints Library
// Route: /projects/blueprints
// Blueprints define the task templates that generate department tasks.
// =============================================================================

const PRIORITY_COLOR: Record<string, string> = {
  Low:    "#64748B",
  Medium: "#D97706",
  High:   "#DC2626",
  Urgent: "#7C3AED",
};

function Avatar({ name }: { name: string }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold"
      style={{ background: "#7C3AED" }}>
      {initials}
    </span>
  );
}

function BlueprintCard({ bp }: { bp: TaskBlueprint }) {
  const [expanded, setExpanded] = useState(false);

  // Build dependency map for display
  const depMap: Record<string, string> = {};
  bp.tasks.forEach((t) => {
    if (t.dependsOnId) {
      const parent = bp.tasks.find((p) => p.id === t.dependsOnId);
      if (parent) depMap[t.id] = parent.name;
    }
  });

  return (
    <div id={bp.id} className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
      {/* Card header */}
      <div
        className="flex items-center justify-between gap-3 p-4 cursor-pointer hover:bg-gray-50/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>{bp.id}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${bp.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
            >
              {bp.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-semibold" style={{ background: "#FAF5FF", color: "#7C3AED" }}>
              v{bp.version}
            </span>
          </div>
          <h3 className="font-bold text-base" style={{ color: "var(--rtm-text-primary)" }}>{bp.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>{bp.description}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Department</div>
            <div className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{bp.department}</div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Tasks</div>
            <div className="text-xl font-black" style={{ color: "var(--rtm-blue)" }}>{bp.tasks.length}</div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Est. Hours</div>
            <div className="text-xl font-black" style={{ color: "var(--rtm-text-primary)" }}>{bp.estimatedTotalHours}h</div>
          </div>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ color: "var(--rtm-text-muted)", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Metadata strip */}
      <div className="flex flex-wrap gap-3 px-4 py-2" style={{ background: "var(--rtm-bg)", borderTop: "1px solid var(--rtm-border-light)" }}>
        {[
          { label: "Trigger",    value: bp.activationTrigger },
          { label: "Package",    value: bp.servicePackage },
          { label: "Line Item",  value: bp.mappedLineItem },
          { label: "Updated",    value: bp.lastUpdated },
        ].map((m) => (
          <span key={m.label} className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
            <b style={{ color: "var(--rtm-text-secondary)" }}>{m.label}:</b> {m.value}
          </span>
        ))}
      </div>

      {/* Expanded task list */}
      {expanded && (
        <div className="p-4" style={{ borderTop: "1px solid var(--rtm-border)" }}>
          <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            Blueprint Tasks — ordered by execution
          </p>

          {/* Dependency flow diagram (text) */}
          <div className="flex flex-col gap-2">
            {bp.tasks.map((t, i) => {
              const dep = depMap[t.id];
              return (
                <div key={t.id} className="flex items-stretch gap-2">
                  {/* Connector line */}
                  <div className="flex flex-col items-center w-6 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                      style={{ background: "var(--rtm-blue)" }}>
                      {i + 1}
                    </div>
                    {i < bp.tasks.length - 1 && (
                      <div className="flex-1 w-px mt-1" style={{ background: "var(--rtm-border)" }} />
                    )}
                  </div>

                  <div className="flex-1 rounded-lg p-3 mb-2" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{t.name}</span>
                      <span className="text-[11px] font-bold" style={{ color: PRIORITY_COLOR[t.priority] ?? "#D97706" }}>{t.priority}</span>
                    </div>
                    {t.description && (
                      <p className="text-xs mb-1.5" style={{ color: "var(--rtm-text-secondary)" }}>{t.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
                      <span>Dept: <b style={{ color: "var(--rtm-text-primary)" }}>{t.department}</b></span>
                      <span>Role: <b style={{ color: "var(--rtm-text-primary)" }}>{t.ownerRole}</b></span>
                      <span>Est: <b style={{ color: "var(--rtm-text-primary)" }}>{t.estimatedHours}h</b></span>
                      <span>Due offset: <b style={{ color: "var(--rtm-text-primary)" }}>Day {t.dueDaysOffset}</b></span>
                      {dep && (
                        <span style={{ color: "#DC2626" }}>
                          Depends on: <b>{dep}</b>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function BlueprintsPage() {
  const [deptFilter, setDeptFilter] = useState<DepartmentName | "All">("All");
  const [activeFilter, setActiveFilter] = useState<"All" | "Active" | "Inactive">("All");

  const blueprints = getBlueprints();

  const depts: (DepartmentName | "All")[] = [
    "All",
    "Account Management", "SEO", "GBP", "PPC", "Meta Ads", "Reporting", "Web Development", "Design",
  ];

  const filtered = blueprints.filter((bp) => {
    if (deptFilter !== "All" && bp.department !== deptFilter) return false;
    if (activeFilter === "Active" && !bp.isActive) return false;
    if (activeFilter === "Inactive" && bp.isActive) return false;
    return true;
  });

  const totalTasks = blueprints.reduce((sum, bp) => sum + bp.tasks.length, 0);
  const totalHours = blueprints.reduce((sum, bp) => sum + bp.estimatedTotalHours, 0);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>

      {/* ── HEADER ── */}
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            <Link href="/projects" className="hover:underline" style={{ color: "var(--rtm-blue)" }}>Global Projects</Link>
            <span>/</span>
            <span>Task Blueprints</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: "var(--rtm-text-primary)" }}>Task Blueprints</h1>
              <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                Blueprints define the task templates applied to project milestones. When applied, tasks are generated and assigned to the correct department.
              </p>
            </div>
            <button
              className="px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90"
              style={{ background: "var(--rtm-blue)" }}
            >
              + New Blueprint
            </button>
          </div>

          {/* Architecture note */}
          <div
            className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold mb-4"
            style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE" }}
          >
            <span style={{ color: "var(--rtm-text-secondary)" }}>Blueprint applied to Milestone</span>
            <span style={{ color: "var(--rtm-blue)" }}>→</span>
            <span style={{ color: "var(--rtm-text-secondary)" }}>Tasks generated with Department, Assignee, Due Date</span>
            <span style={{ color: "var(--rtm-blue)" }}>→</span>
            <span style={{ color: "var(--rtm-text-secondary)" }}>Tasks appear in Department Workspace</span>
            <span style={{ color: "var(--rtm-blue)" }}>→</span>
            <span style={{ color: "var(--rtm-text-secondary)" }}>Dependencies enforced in order</span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 px-6 py-5 max-w-[1200px] mx-auto w-full">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total Blueprints",  value: blueprints.length, color: "var(--rtm-blue)"  },
            { label: "Active",            value: blueprints.filter((b) => b.isActive).length, color: "#059669" },
            { label: "Total Blueprint Tasks", value: totalTasks, color: "#7C3AED" },
            { label: "Total Est. Hours",  value: `${totalHours}h`,   color: "#D97706" },
          ].map((k) => (
            <div key={k.label} className="rounded-xl p-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>{k.label}</p>
              <p className="text-3xl font-black" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          className="flex flex-wrap gap-3 items-center p-4 rounded-xl mb-4"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value as DepartmentName | "All")}
              className="rounded-lg px-2 py-1.5 text-xs border outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
            >
              {depts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>Status:</span>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as "All" | "Active" | "Inactive")}
              className="rounded-lg px-2 py-1.5 text-xs border outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <span className="text-xs font-semibold ml-auto" style={{ color: "var(--rtm-text-muted)" }}>
            {filtered.length} of {blueprints.length} blueprints
          </span>
        </div>

        {/* Blueprint cards */}
        <div className="flex flex-col gap-3">
          {filtered.map((bp) => (
            <BlueprintCard key={bp.id} bp={bp} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
              No blueprints match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
