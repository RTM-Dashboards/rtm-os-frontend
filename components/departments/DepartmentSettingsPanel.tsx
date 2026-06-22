"use client";

// ── Department Settings Panel ─────────────────────────────────────────────────
// Read-only view of department configuration. All edits happen in
// Settings → Departments. No mutable state lives here.

import { SectionWrapper, StatusBadge } from "@/components/ui";
import type { DepartmentConfig } from "@/types/department";

interface Props {
  dept: DepartmentConfig;
}

const MODULE_ICONS: Record<string, string> = {
  "projects":       "P",
  "tasks":          "T",
  "reports":        "R",
  "audits":         "A",
  "escalations":    "E",
  "notifications":  "N",
  "workflows":      "W",
  "integrations":   "I",
  "knowledge-base": "K",
  "custom":         "C",
};

const TYPE_LABEL: Record<DepartmentConfig["departmentType"], { label: string; color: string; bg: string }> = {
  core:       { label: "Core",      color: "#1D4ED8", bg: "#EFF6FF" },
  service:    { label: "Service",   color: "#059669", bg: "#ECFDF5" },
  support:    { label: "Support",   color: "#B45309", bg: "#FFFBEB" },
  executive:  { label: "Executive", color: "#7C3AED", bg: "#F5F3FF" },
};

const ROLE_TYPE_LABEL: Record<string, { color: string; bg: string }> = {
  member:             { color: "#64748B", bg: "#F8FAFC" },
  lead:               { color: "#2563EB", bg: "#EFF6FF" },
  manager:            { color: "#7C3AED", bg: "#F5F3FF" },
  "operations-support":{ color: "#B45309", bg: "#FFFBEB" },
  executive:          { color: "#059669", bg: "#ECFDF5" },
};

export default function DepartmentSettingsPanel({ dept }: Props) {
  const typeCfg = TYPE_LABEL[dept.departmentType];

  return (
    <div className="space-y-5">
      {/* Profile */}
      <SectionWrapper title="Department Profile" description="Settings and Departments configuration">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              { label: "Department Name",  value: dept.name                        },
              { label: "Department ID",    value: dept.id                          },
              { label: "Owner",            value: dept.owner                       },
              { label: "Base Route",       value: dept.baseRoute                   },
              { label: "Workspace",        value: dept.workspaceSlug ?? "Standalone"},
            ] as { label: string; value: string }[]
          ).map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                {value}
              </span>
            </div>
          ))}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Status</span>
            <StatusBadge
              variant={dept.status === "active" ? "success" : dept.status === "inactive" ? "neutral" : "pending"}
              label={dept.status.charAt(0).toUpperCase() + dept.status.slice(1).replace("-", " ")}
              size="sm"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Department Type</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold w-fit"
              style={{ background: typeCfg.bg, color: typeCfg.color }}
            >
              {typeCfg.label}
            </span>
          </div>
        </div>
        {dept.description && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--rtm-border-light)" }}>
            <span className="text-xs font-semibold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Description</span>
            <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{dept.description}</p>
          </div>
        )}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--rtm-border-light)" }}>
          <a
            href="/settings/departments"
            className="text-sm font-medium hover:underline"
            style={{ color: dept.accentColor }}
          >
            Edit in Settings &rarr; Departments
          </a>
        </div>
      </SectionWrapper>

      {/* Enabled Modules */}
      <SectionWrapper title="Enabled Modules" description="Toggle modules in Settings → Departments">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dept.modules.map((mod) => (
            <div
              key={mod.id}
              className="flex items-center gap-3 p-3 rounded-lg border"
              style={{
                background: mod.enabled ? `${dept.accentColor}08` : "var(--rtm-bg)",
                borderColor: mod.enabled ? `${dept.accentColor}30` : "var(--rtm-border-light)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: mod.enabled ? dept.accentColor : "var(--rtm-border-light)",
                  color: mod.enabled ? "#fff" : "var(--rtm-text-muted)",
                }}
              >
                {MODULE_ICONS[mod.id] ?? "M"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>
                  {mod.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: mod.enabled ? dept.accentColor : "var(--rtm-text-muted)" }}>
                  {mod.enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Roles */}
      <SectionWrapper title="Department Roles" description="Role definitions configured in Settings → Departments">
        <div className="space-y-3">
          {dept.roles.map((role) => {
            const rstyle = ROLE_TYPE_LABEL[role.type] ?? ROLE_TYPE_LABEL.member;
            return (
              <div
                key={role.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{role.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{role.description}</p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap capitalize"
                  style={{ background: rstyle.bg, color: rstyle.color }}
                >
                  {role.type.replace("-", " ")}
                </span>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* KPI Summary */}
      <SectionWrapper title="Assigned KPIs" description="KPIs from Settings → Departments">
        <div className="space-y-2">
          {dept.kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg border"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>{kpi.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  {kpi.metricType} &middot; {kpi.dataSource} &middot; {kpi.reportingFrequency}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-semibold" style={{ color: "#059669" }}>Target: {kpi.target}</p>
                <p className="text-xs" style={{ color: "#D97706" }}>Warn: {kpi.warningThreshold || "—"}</p>
              </div>
              {kpi.dashboardVisible && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-semibold whitespace-nowrap"
                  style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
                >
                  Dashboard
                </span>
              )}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Assigned Integrations */}
      <SectionWrapper title="Assigned Integrations" description="Integration Hub references">
        <div className="flex flex-wrap gap-2">
          {dept.integrations.map((int) => (
            <span
              key={int.integrationId}
              className="text-xs px-3 py-1 rounded-full border font-medium"
              style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)" }}
            >
              {int.displayName}
            </span>
          ))}
        </div>
      </SectionWrapper>

      {/* Assigned Reports */}
      <SectionWrapper title="Assigned Reports" description="Reporting and Intelligence references">
        <div className="flex flex-wrap gap-2">
          {dept.reports.map((r) => (
            <span
              key={r.reportId}
              className="text-xs px-3 py-1 rounded-full border font-medium"
              style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)" }}
            >
              {r.displayName}
            </span>
          ))}
        </div>
      </SectionWrapper>

      {/* Assigned Workflows */}
      <SectionWrapper title="Assigned Workflows" description="Workflow Engine references">
        <div className="flex flex-wrap gap-2">
          {dept.workflows.map((wf) => (
            <span
              key={wf.workflowId}
              className="text-xs px-3 py-1 rounded-full border font-medium"
              style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)" }}
            >
              {wf.displayName}
            </span>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
