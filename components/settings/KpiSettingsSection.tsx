"use client";

// KpiSettingsSection — reusable component for department Settings pages.
//
// Renders a "Performance Settings" section with:
//   - Campaign KPI tab: KPIs for the specific department (all roles can see)
//   - People KPI tab: universal KPIs (manager view only, gated by DeptRoleToggle)
//
// Persists toggle state via PATCH /api/kpi-definitions.

import { useState, useEffect, useCallback } from "react";
import { DeptRoleToggle, type DeptRole } from "@/components/dept-role-toggle";

export interface KpiDefinition {
  id: string;
  name: string;
  category: "Campaign" | "People";
  departments: string[];
  enabled: boolean;
  description?: string;
}

interface KpiSettingsSectionProps {
  /** The department slug, e.g. "content", "seo-local" */
  departmentSlug: string;
  /** Optional accent color for the department; defaults to rtm-blue */
  accentColor?: string;
}

// ── Toggle switch ──────────────────────────────────────────────────────────────

function KpiToggleRow({
  kpi,
  onToggle,
  disabled,
}: {
  kpi: KpiDefinition;
  onToggle: (id: string, enabled: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg"
      style={{
        background: "var(--rtm-bg)",
        border: "1px solid var(--rtm-border-light)",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div className="min-w-0 flex-1 pr-4">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          {kpi.name}
        </p>
        {kpi.description && (
          <p
            className="text-xs mt-0.5 truncate"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            {kpi.description}
          </p>
        )}
      </div>
      <button
        disabled={disabled}
        onClick={() => !disabled && onToggle(kpi.id, !kpi.enabled)}
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
        style={{
          background: kpi.enabled ? "#1d709f" : "var(--rtm-border)",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        aria-label={`${kpi.enabled ? "Disable" : "Enable"} ${kpi.name}`}
      >
        <span
          className="inline-block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform"
          style={{
            transform: kpi.enabled ? "translateX(18px)" : "translateX(3px)",
          }}
        />
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function KpiSettingsSection({
  departmentSlug,
  accentColor,
}: KpiSettingsSectionProps) {
  const [role, setRole] = useState<DeptRole>("manager");
  const [kpis, setKpis] = useState<KpiDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Campaign" | "People">("Campaign");

  // Fetch KPIs on mount
  useEffect(() => {
    setLoading(true);
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
      // Optimistic update
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
        // Rollback
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

  // Filter KPIs for this department
  const campaignKpis = kpis.filter(
    (k) =>
      k.category === "Campaign" &&
      (k.departments.includes(departmentSlug) ||
        k.departments.includes("all"))
  );

  const peopleKpis = kpis.filter(
    (k) =>
      k.category === "People" &&
      (k.departments.includes("all") ||
        k.departments.includes(departmentSlug))
  );

  const color = accentColor ?? "var(--rtm-blue)";

  const tabStyle = (tab: "Campaign" | "People") =>
    activeTab === tab
      ? { background: color, color: "#fff" }
      : { color: "var(--rtm-text-secondary)", background: "transparent" };

  return (
    <div
      className="rounded-xl border p-5 space-y-4"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
      }}
    >
      {/* Section header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3
            className="text-sm font-bold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Performance Settings
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Configure which KPIs are enabled for this department&apos;s
            performance tracking. People KPIs require Manager view.
          </p>
        </div>
      </div>

      {/* Role toggle — gates People KPI visibility */}
      <DeptRoleToggle role={role} onRoleChange={setRole} />

      {/* Tab strip */}
      <div
        className="flex gap-1 rounded-xl border p-1 w-fit"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <button
          onClick={() => setActiveTab("Campaign")}
          className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
          style={tabStyle("Campaign")}
        >
          Campaign KPIs
        </button>
        <button
          onClick={() => {
            if (role !== "manager") return; // soft guard — button still shows but is inactive
            setActiveTab("People");
          }}
          className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
          style={
            role !== "manager"
              ? {
                  color: "var(--rtm-text-muted)",
                  background: "transparent",
                  cursor: "not-allowed",
                  opacity: 0.45,
                }
              : tabStyle("People")
          }
          title={
            role !== "manager"
              ? "Switch to Manager view to access People KPIs"
              : undefined
          }
        >
          People KPIs
          {role !== "manager" && (
            <span className="ml-1.5 text-[10px]">🔒</span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div
          className="py-8 text-center text-sm"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Loading KPIs…
        </div>
      ) : error ? (
        <div className="py-4 text-sm text-red-600">{error}</div>
      ) : activeTab === "Campaign" ? (
        <div className="space-y-2">
          {campaignKpis.length === 0 ? (
            <p
              className="text-sm py-4 text-center"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              No Campaign KPIs defined for this department.
            </p>
          ) : (
            campaignKpis.map((kpi) => (
              <KpiToggleRow
                key={kpi.id}
                kpi={kpi}
                onToggle={handleToggle}
                disabled={saving === kpi.id}
              />
            ))
          )}
        </div>
      ) : activeTab === "People" && role === "manager" ? (
        <div className="space-y-2">
          {peopleKpis.length === 0 ? (
            <p
              className="text-sm py-4 text-center"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              No People KPIs defined.
            </p>
          ) : (
            peopleKpis.map((kpi) => (
              <KpiToggleRow
                key={kpi.id}
                kpi={kpi}
                onToggle={handleToggle}
                disabled={saving === kpi.id}
              />
            ))
          )}
        </div>
      ) : null}

      {/* Saving indicator */}
      {saving && (
        <p
          className="text-xs animate-pulse"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Saving…
        </p>
      )}
    </div>
  );
}
