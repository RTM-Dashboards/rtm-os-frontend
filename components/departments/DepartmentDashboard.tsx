"use client";

// ── Department Dashboard ──────────────────────────────────────────────────────
// Fully configuration-driven department dashboard.
// Receives a DepartmentConfig and renders all enabled modules as tabs.
// No department-specific hardcoded logic — all behavior comes from config.

import { useState } from "react";
import type { DepartmentConfig } from "@/types/department";

import DepartmentKpiRow           from "./DepartmentKpiRow";
import DepartmentProjectsPanel    from "./DepartmentProjectsPanel";
import DepartmentTasksPanel       from "./DepartmentTasksPanel";
import DepartmentReportsPanel     from "./DepartmentReportsPanel";
import DepartmentEscalationsPanel from "./DepartmentEscalationsPanel";
import DepartmentWorkflowsPanel   from "./DepartmentWorkflowsPanel";
import DepartmentIntegrationsPanel from "./DepartmentIntegrationsPanel";
import DepartmentNotificationsPanel from "./DepartmentNotificationsPanel";
import DepartmentSettingsPanel    from "./DepartmentSettingsPanel";

// ── Tab IDs ───────────────────────────────────────────────────────────────────

type DashboardTab =
  | "overview"| "projects"| "tasks"| "reports"| "escalations"| "workflows"| "integrations"| "notifications"| "settings";

interface TabConfig {
  id: DashboardTab;
  label: string;
  /** If set, only show this tab when the matching module is enabled */
  moduleId?: string;
}

const ALL_TABS: TabConfig[] = [
  { id: "overview",      label: "Overview"},
  { id: "projects",      label: "Projects",      moduleId: "projects"},
  { id: "tasks",         label: "Tasks",         moduleId: "tasks"},
  { id: "reports",       label: "Reports",       moduleId: "reports"},
  { id: "escalations",   label: "Escalations",   moduleId: "escalations"},
  { id: "workflows",     label: "Workflows",     moduleId: "workflows"},
  { id: "integrations",  label: "Integrations",  moduleId: "integrations"},
  { id: "notifications", label: "Notifications", moduleId: "notifications"},
  { id: "settings",      label: "Settings"},
];

// ─── Helper: is a module enabled ─────────────────────────────────────────────

function isModuleEnabled(dept: DepartmentConfig, moduleId: string): boolean {
  return dept.modules.find((m) => m.id === moduleId)?.enabled ?? false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface Props {
  dept: DepartmentConfig;
}

const TYPE_LABEL: Record<DepartmentConfig["departmentType"], { label: string; color: string; bg: string }> = {
  core:      { label: "Core",      color: "#1D4ED8", bg: "#EFF6FF"},
  service:   { label: "Service",   color: "#059669", bg: "#ECFDF5"},
  support:   { label: "Support",   color: "#B45309", bg: "#FFFBEB"},
  executive: { label: "Executive", color: "#7C3AED", bg: "#F5F3FF"},
};

export default function DepartmentDashboard({ dept }: Props) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Only show tabs whose module is enabled (or tabs with no module gate)
  const visibleTabs = ALL_TABS.filter((tab) =>
    tab.moduleId ? isModuleEnabled(dept, tab.moduleId) : true,
  );

  const typeCfg = TYPE_LABEL[dept.departmentType];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"style={{ background: typeCfg.bg, color: typeCfg.color }}
            >
              {typeCfg.label} Department
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"style={{
                background: dept.status === "active"? "#ECFDF5": "#F8FAFC",
                color:      dept.status === "active"? "#059669": "#64748B",
              }}
            >
              {dept.status.charAt(0).toUpperCase() + dept.status.slice(1)}
            </span>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}
          >
            {dept.name}
          </h1>
          <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
            {dept.description}
          </p>
          <p className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>
            Owner: <span className="font-semibold">{dept.owner}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start flex-wrap">
          {dept.workspaceSlug && (
            <a
              href={`/${dept.workspaceSlug}`}
              className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
              Workspace
            </a>
          )}
          <a
            href="/settings/departments"className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            Settings
          </a>
        </div>
      </div>

      {/* ── KPI Row (always visible) ── */}
      <DepartmentKpiRow kpis={dept.kpis} accentColor={dept.accentColor} />

      {/* ── Tab Bar ── */}
      <div className="border-b"style={{ borderColor: "var(--rtm-border-light)"}}>
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"style={{
                borderColor: activeTab === tab.id ? dept.accentColor : "transparent",
                color:       activeTab === tab.id ? dept.accentColor : "var(--rtm-text-muted)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab Panels ── */}

      {activeTab === "overview"&& (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick module links */}
          <div
            className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"style={{ color: "var(--rtm-text-muted)"}}
            >
              Department Modules
            </p>
            <div className="grid grid-cols-2 gap-2">
              {dept.modules
                .filter((m) => m.enabled)
                .map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      const tab = ALL_TABS.find((t) => t.moduleId === mod.id);
                      if (tab) setActiveTab(tab.id);
                    }}
                    className="flex items-center gap-2 p-3 rounded-lg border text-sm font-medium text-left transition-colors hover:opacity-90"style={{
                      background:   `${dept.accentColor}08`,
                      borderColor:  `${dept.accentColor}25`,
                      color:        dept.accentColor,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: dept.accentColor }} />
                    {mod.label}
                  </button>
                ))}
            </div>
          </div>

          {/* KPI summary */}
          <div
            className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"style={{ color: "var(--rtm-text-muted)"}}
            >
              Department KPIs
            </p>
            <div className="space-y-2">
              {dept.kpis.slice(0, 5).map((kpi) => (
                <div
                  key={kpi.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"style={{ borderColor: "var(--rtm-border-light)"}}
                >
                  <span className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>
                    {kpi.name}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"style={{ background: "#ECFDF5", color: "#059669"}}>
                    {kpi.target}
                  </span>
                </div>
              ))}
            </div>
            {dept.kpis.length > 5 && (
              <p className="text-xs mt-2"style={{ color: "var(--rtm-text-muted)"}}>
                +{dept.kpis.length - 5} more KPIs in Settings
              </p>
            )}
          </div>

          {/* Integrations summary */}
          <div
            className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"style={{ color: "var(--rtm-text-muted)"}}
            >
              Integration Hub
            </p>
            <div className="flex flex-wrap gap-2">
              {dept.integrations.map((int) => (
                <span
                  key={int.integrationId}
                  className="text-xs px-2.5 py-1 rounded-full border font-medium"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)"}}
                >
                  {int.displayName}
                </span>
              ))}
            </div>
          </div>

          {/* Workflows summary */}
          <div
            className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"style={{ color: "var(--rtm-text-muted)"}}
            >
              Workflow Engine
            </p>
            <div className="space-y-2">
              {dept.workflows.map((wf) => (
                <div
                  key={wf.workflowId}
                  className="flex items-start gap-2 py-2 border-b last:border-0"style={{ borderColor: "var(--rtm-border-light)"}}
                >
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"style={{ background: "#059669"}} />
                  <div>
                    <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                      {wf.displayName}
                    </p>
                    <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                      {wf.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "projects"&& (
        <DepartmentProjectsPanel
          accentColor={dept.accentColor}
          disabled={!isModuleEnabled(dept, "projects")}
        />
      )}

      {activeTab === "tasks"&& (
        <DepartmentTasksPanel
          accentColor={dept.accentColor}
          disabled={!isModuleEnabled(dept, "tasks")}
        />
      )}

      {activeTab === "reports"&& (
        <DepartmentReportsPanel
          reports={dept.reports}
          accentColor={dept.accentColor}
          disabled={!isModuleEnabled(dept, "reports")}
        />
      )}

      {activeTab === "escalations"&& (
        <DepartmentEscalationsPanel
          accentColor={dept.accentColor}
          disabled={!isModuleEnabled(dept, "escalations")}
        />
      )}

      {activeTab === "workflows"&& (
        <DepartmentWorkflowsPanel
          workflows={dept.workflows}
          accentColor={dept.accentColor}
          disabled={!isModuleEnabled(dept, "workflows")}
        />
      )}

      {activeTab === "integrations"&& (
        <DepartmentIntegrationsPanel
          integrations={dept.integrations}
          accentColor={dept.accentColor}
        />
      )}

      {activeTab === "notifications"&& (
        <DepartmentNotificationsPanel
          accentColor={dept.accentColor}
          disabled={!isModuleEnabled(dept, "notifications")}
        />
      )}

      {activeTab === "settings"&& (
        <DepartmentSettingsPanel dept={dept} />
      )}
    </div>
  );
}
