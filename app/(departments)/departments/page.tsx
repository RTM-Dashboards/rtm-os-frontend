"use client";

// ── Departments Index ─────────────────────────────────────────────────────────
// Lists all configured departments. No hardcoded department logic —
// all data comes from the department config registry.

import Link from "next/link";
import { DEPARTMENT_CONFIGS } from "@/lib/departments/config";
import { StatusBadge } from "@/components/ui";
import type { DepartmentConfig } from "@/types/department";

const TYPE_LABEL: Record<DepartmentConfig["departmentType"], { label: string; color?: string; bg?: string }> = {
  core:      { label: "Core",      color: "#1D4ED8", bg: "#EFF6FF"},
  service:   { label: "Service",   color: "#059669", bg: "#ECFDF5"},
  support:   { label: "Support",   color: "#B45309", bg: "#FFFBEB"},
  executive: { label: "Executive", color: "#7C3AED", bg: "#F5F3FF"},
};

const TYPE_ORDER: DepartmentConfig["departmentType"][] = ["core", "service", "support", "executive"];

export default function DepartmentsIndexPage() {
  const byType = TYPE_ORDER.map((type) => ({
    type,
    depts: DEPARTMENT_CONFIGS.filter((d) => d.departmentType === type),
  })).filter((g) => g.depts.length > 0);

  const total   = DEPARTMENT_CONFIGS.length;
  const active  = DEPARTMENT_CONFIGS.filter((d) => d.status === "active").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: "var(--rtm-text-muted)"}}
          >
            RTM OS
          </p>
          <h1
            className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}
          >
            Departments
          </h1>
          <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
            {active} active departments · {total} total · Configuration-driven architecture
          </p>
        </div>
        <Link
          href="/settings/departments"className="rtm-btn-secondary text-sm inline-flex items-center gap-1 self-start">
          Settings
        </Link>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {TYPE_ORDER.map((type) => {
          const cfg   = TYPE_LABEL[type];
          const count = DEPARTMENT_CONFIGS.filter((d) => d.departmentType === type).length;
          return (
            <div
              key={type}
              className="rounded-xl border p-4 text-center"style={{ background: cfg.bg, borderColor: "var(--rtm-border-light)"}}
            >
              <p className="text-2xl font-bold"style={{ color: cfg.color }}>{count}</p>
              <p className="text-xs mt-0.5 font-semibold"style={{ color: cfg.color }}>{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Department groups */}
      {byType.map(({ type, depts }) => {
        const cfg = TYPE_LABEL[type];
        return (
          <section key={type}>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold"style={{ background: cfg.bg, color: cfg.color }}
              >
                {cfg.label} Departments
              </span>
              <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>
                {depts.length} department{depts.length !== 1 ? "s": ""}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {depts.map((dept) => (
                <Link
                  key={dept.id}
                  href={dept.baseRoute}
                  className="group block rounded-xl border p-5 transition-all hover:shadow-md hover:opacity-90"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"style={{ background: `${dept.accentColor}18`, color: dept.accentColor }}
                    >
                      {dept.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate"style={{ color: "var(--rtm-text-primary)"}}>
                        {dept.name}
                      </p>
                      <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                        {dept.owner}
                      </p>
                    </div>
                    <StatusBadge
                      variant={dept.status === "active"? "success": "neutral"}
                      label={dept.status === "active"? "Active": "Inactive"}
                      size="sm"/>
                  </div>

                  {/* Description */}
                  <p
                    className="text-xs leading-relaxed line-clamp-2 mb-3"style={{ color: "var(--rtm-text-secondary)"}}
                  >
                    {dept.description}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                    <span>
                      <span className="font-semibold"style={{ color: "var(--rtm-text-primary)" }}>{dept.kpis.length}</span> KPIs
                    </span>
                    <span>
                      <span className="font-semibold"style={{ color: "var(--rtm-text-primary)" }}>{dept.integrations.length}</span> Integrations
                    </span>
                    <span>
                      <span className="font-semibold"style={{ color: "var(--rtm-text-primary)" }}>{dept.modules.filter((m) => m.enabled).length}</span> Modules
                    </span>
                  </div>

                  {/* Enabled modules preview */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {dept.modules
                      .filter((m) => m.enabled)
                      .slice(0, 5)
                      .map((m) => (
                        <span
                          key={m.id}
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"style={{ background: "var(--rtm-bg-secondary)", color: "var(--rtm-text-muted)" }}
                        >
                          {m.label}
                        </span>
                      ))}
                    {dept.modules.filter((m) => m.enabled).length > 5 && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)"}}
                      >
                        +{dept.modules.filter((m) => m.enabled).length - 5}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
