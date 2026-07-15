"use client";

// RTM OS — /settings/kpi-definitions
// Real working page. Replaces the ConfigPlaceholder (planned status).
// Lists all KPI definitions grouped by department and category,
// with live enabled/disabled toggles that persist via PATCH /api/kpi-definitions.

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface KpiDefinition {
  id: string;
  name: string;
  category: "Campaign" | "People";
  departments: string[];
  enabled: boolean;
  description?: string;
}

// ── Department display config ─────────────────────────────────────────────────

const DEPT_LABELS: Record<string, string> = {
  content: "Content",
  "web-development-design": "Web Development & Design",
  "seo-local": "SEO & Local",
  "paid-advertising": "Paid Advertising",
  reporting: "Reporting",
  "local-service-ads": "Local Service Ads",
  "it-security": "IT & Security",
};

const DEPT_ORDER = [
  "content",
  "web-development-design",
  "seo-local",
  "paid-advertising",
  "reporting",
  "local-service-ads",
  "it-security",
];

// ── Toggle switch ──────────────────────────────────────────────────────────────

function ToggleSwitch({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onToggle}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
      style={{
        background: enabled ? "#1B4FD8" : "var(--rtm-border)",
        cursor: disabled ? "wait" : "pointer",
      }}
      aria-label={enabled ? "Disable" : "Enable"}
    >
      <span
        className="inline-block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform"
        style={{
          transform: enabled ? "translateX(18px)" : "translateX(3px)",
        }}
      />
    </button>
  );
}

// ── KPI row ───────────────────────────────────────────────────────────────────

function KpiRow({
  kpi,
  onToggle,
  saving,
}: {
  kpi: KpiDefinition;
  onToggle: (id: string, enabled: boolean) => void;
  saving: string | null;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-3"
      style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {kpi.name}
          </p>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={
              kpi.category === "Campaign"
                ? {
                    background: "var(--rtm-blue-xlight)",
                    color: "var(--rtm-blue)",
                    border: "1px solid var(--rtm-blue-light)",
                  }
                : {
                    background: "#ECFDF5",
                    color: "#059669",
                    border: "1px solid #A7F3D0",
                  }
            }
          >
            {kpi.category}
          </span>
          {saving === kpi.id && (
            <span
              className="text-[10px] animate-pulse"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Saving…
            </span>
          )}
        </div>
        {kpi.description && (
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            {kpi.description}
          </p>
        )}
        <p
          className="text-[11px] font-mono mt-0.5"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          {kpi.id}
        </p>
      </div>
      <ToggleSwitch
        enabled={kpi.enabled}
        onToggle={() => onToggle(kpi.id, !kpi.enabled)}
        disabled={saving === kpi.id}
      />
    </div>
  );
}

// ── Department group ───────────────────────────────────────────────────────────

function DeptGroup({
  dept,
  kpis,
  onToggle,
  saving,
}: {
  dept: string;
  kpis: KpiDefinition[];
  onToggle: (id: string, enabled: boolean) => void;
  saving: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const label = DEPT_LABELS[dept] ?? dept;
  const enabledCount = kpis.filter((k) => k.enabled).length;

  return (
    <section
      className="rounded-xl border overflow-hidden"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
      }}
    >
      {/* Header */}
      <button
        className="w-full px-5 py-4 flex items-center justify-between text-left"
        style={{ borderBottom: collapsed ? "none" : "1px solid var(--rtm-border-light)" }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3">
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {label}
          </h2>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: "var(--rtm-bg)",
              color: "var(--rtm-text-muted)",
              border: "1px solid var(--rtm-border)",
            }}
          >
            {enabledCount}/{kpis.length} enabled
          </span>
        </div>
        <span
          className="text-xs"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          {collapsed ? "▸" : "▾"}
        </span>
      </button>

      {/* Rows */}
      {!collapsed && (
        <div>
          {kpis.map((kpi) => (
            <KpiRow
              key={kpi.id}
              kpi={kpi}
              onToggle={onToggle}
              saving={saving}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function KpiDefinitionsPage() {
  const [kpis, setKpis] = useState<KpiDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<
    "all" | "Campaign" | "People"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "enabled" | "disabled"
  >("all");

  useEffect(() => {
    fetch("/api/kpi-definitions")
      .then((r) => r.json())
      .then((data: { definitions: KpiDefinition[] }) => {
        setKpis(data.definitions ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load KPI definitions.");
        setLoading(false);
      });
  }, []);

  const handleToggle = useCallback(
    async (id: string, enabled: boolean) => {
      setKpis((prev) =>
        prev.map((k) => (k.id === id ? { ...k, enabled } : k))
      );
      setSaving(id);
      try {
        const res = await fetch("/api/kpi-definitions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, enabled }),
        });
        if (!res.ok) throw new Error("Save failed");
      } catch {
        setKpis((prev) =>
          prev.map((k) => (k.id === id ? { ...k, enabled: !enabled } : k))
        );
        setError("Failed to save. Please try again.");
      } finally {
        setSaving(null);
      }
    },
    []
  );

  // Apply filters
  const filteredKpis = kpis.filter((k) => {
    if (filterCategory !== "all" && k.category !== filterCategory) return false;
    if (filterStatus === "enabled" && !k.enabled) return false;
    if (filterStatus === "disabled" && k.enabled) return false;
    return true;
  });

  // Group Campaign KPIs by department; People KPIs in their own section
  const campaignByDept: Record<string, KpiDefinition[]> = {};
  const peopleKpis: KpiDefinition[] = [];

  for (const kpi of filteredKpis) {
    if (kpi.category === "People") {
      peopleKpis.push(kpi);
    } else {
      for (const dept of kpi.departments) {
        if (!campaignByDept[dept]) campaignByDept[dept] = [];
        campaignByDept[dept].push(kpi);
      }
    }
  }

  const totalEnabled = kpis.filter((k) => k.enabled).length;
  const campaignKpis = kpis.filter((k) => k.category === "Campaign");
  const peopleAll = kpis.filter((k) => k.category === "People");

  const selectCls =
    "text-xs font-medium rounded-lg border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const selectStyle = {
    background: "var(--rtm-surface)",
    borderColor: "var(--rtm-border)",
    color: "var(--rtm-text-primary)",
  } as React.CSSProperties;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5 text-xs"
        style={{ color: "var(--rtm-text-muted)" }}
      >
        <Link
          href="/settings"
          className="hover:underline"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Settings
        </Link>
        <span>›</span>
        <span style={{ color: "var(--rtm-text-secondary)" }}>
          KPI Definitions
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            KPI Definitions
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Manage and toggle KPI definitions across all departments. Changes
            persist immediately.
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 self-start"
          style={{
            background: "#ECFDF5",
            color: "#059669",
            border: "1px solid #A7F3D0",
          }}
        >
          Live
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total KPIs",
            value: kpis.length,
            color: "var(--rtm-text-primary)",
          },
          {
            label: "Enabled",
            value: totalEnabled,
            color: "#059669",
          },
          {
            label: "Disabled",
            value: kpis.length - totalEnabled,
            color: "#78716C",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border p-3 text-center"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: s.color }}
            >
              {s.value}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl border p-4 flex items-center gap-3"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "var(--rtm-blue)" }}
          />
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              Campaign KPIs
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {campaignKpis.filter((k) => k.enabled).length}/
              {campaignKpis.length} enabled · department-specific
            </p>
          </div>
        </div>
        <div
          className="rounded-xl border p-4 flex items-center gap-3"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#059669" }}
          />
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              People KPIs
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {peopleAll.filter((k) => k.enabled).length}/{peopleAll.length}{" "}
              enabled · universal (all departments)
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl border p-3 flex flex-wrap items-center gap-3"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Filter
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Category
          </span>
          <select
            className={selectCls}
            style={selectStyle}
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value as "all" | "Campaign" | "People")
            }
          >
            <option value="all">All</option>
            <option value="Campaign">Campaign</option>
            <option value="People">People</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Status
          </span>
          <select
            className={selectCls}
            style={selectStyle}
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "enabled" | "disabled")
            }
          >
            <option value="all">All</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200">
          {error}
          <button
            className="ml-3 underline text-xs"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div
          className="py-16 text-center text-sm"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Loading KPI definitions…
        </div>
      ) : (
        <div className="space-y-4">
          {/* Campaign KPIs grouped by department */}
          {(filterCategory === "all" || filterCategory === "Campaign") &&
            DEPT_ORDER.map((dept) => {
              const deptKpis = campaignByDept[dept];
              if (!deptKpis || deptKpis.length === 0) return null;
              return (
                <DeptGroup
                  key={dept}
                  dept={dept}
                  kpis={deptKpis}
                  onToggle={handleToggle}
                  saving={saving}
                />
              );
            })}

          {/* People KPIs — universal */}
          {(filterCategory === "all" || filterCategory === "People") &&
            peopleKpis.length > 0 && (
              <section
                className="rounded-xl border overflow-hidden"
                style={{
                  background: "var(--rtm-surface)",
                  borderColor: "#A7F3D0",
                }}
              >
                <div
                  className="px-5 py-4"
                  style={{
                    borderBottom: "1px solid var(--rtm-border-light)",
                    background: "#ECFDF5",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <h2
                      className="text-sm font-semibold"
                      style={{ color: "#065F46" }}
                    >
                      People KPIs — Universal (All Departments)
                    </h2>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: "#fff",
                        color: "#059669",
                        border: "1px solid #A7F3D0",
                      }}
                    >
                      {peopleKpis.filter((k) => k.enabled).length}/
                      {peopleKpis.length} enabled
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 text-emerald-700">
                    Applies to all 7 departments. Manager view only on
                    department Performance Settings pages.
                  </p>
                </div>
                <div>
                  {peopleKpis.map((kpi) => (
                    <KpiRow
                      key={kpi.id}
                      kpi={kpi}
                      onToggle={handleToggle}
                      saving={saving}
                    />
                  ))}
                </div>
              </section>
            )}

          {filteredKpis.length === 0 && (
            <div
              className="py-12 text-center text-sm rounded-xl border"
              style={{
                color: "var(--rtm-text-muted)",
                borderColor: "var(--rtm-border)",
                background: "var(--rtm-surface)",
              }}
            >
              No KPI definitions match the current filters.
            </div>
          )}
        </div>
      )}

      {/* Related sections */}
      <section
        className="rounded-xl border overflow-hidden"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Related Configuration
          </h2>
        </div>
        <div className="p-5 flex flex-wrap gap-2">
          {[
            { label: "Dashboard Builder", href: "/settings/dashboard-builder" },
            { label: "Scoring Rules", href: "/settings/scoring-rules" },
            { label: "Report Templates", href: "/settings/report-templates" },
          ].map((rel) => (
            <Link
              key={rel.href}
              href={rel.href}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors hover:shadow-sm"
              style={{
                background: "var(--rtm-bg)",
                color: "var(--rtm-text-secondary)",
                borderColor: "var(--rtm-border)",
              }}
            >
              {rel.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
