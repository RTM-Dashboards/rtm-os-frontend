"use client";

import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// RTM OS — Configuration Control Center
// Settings is the source of truth for all configurable platform behavior.
// Workspaces execute behavior. Settings defines it.
// ─────────────────────────────────────────────────────────────────────────────

interface ConfigSection {
  label: string;
  description: string;
  href: string;
  items: string[];
  status: "live" | "partial" | "planned";
}

const CONFIG_SECTIONS: ConfigSection[] = [
  {
    label: "Organization",
    description: "Company identity, departments, user accounts, and role assignments.",
    href: "/settings/organization",
    items: ["Company Profile", "Departments", "Users", "Roles & Permissions"],
    status: "live",
  },
  {
    label: "Platform Configuration",
    description: "Define services, pricing, line items, and packages that power the entire platform.",
    href: "/settings/services",
    items: ["Services", "Service Catalog", "Line Items", "Pricing Rules", "Packages & Bundles"],
    status: "partial",
  },
  {
    label: "Forms & Templates",
    description: "Build and manage intake forms, audit templates, proposals, contracts, and reports.",
    href: "/settings/form-builder",
    items: [
      "Form Builder",
      "Sales Intake Forms",
      "Client Intake Forms",
      "Audit Templates",
      "Proposal Templates",
      "Contract Templates",
      "Report Templates",
    ],
    status: "planned",
  },
  {
    label: "Sales Configuration",
    description: "Configure intake questions, audit goals, scoring conditions, and proposal rules consumed by the Sales workspace.",
    href: "/settings/intake-questions",
    items: [
      "Intake Questions",
      "Audit Goal Configuration",
      "Audit Conditions",
      "Recommendation Rules",
      "Proposal Rules",
    ],
    status: "partial",
  },
  {
    label: "Workflow Configuration",
    description: "Define workflow templates, task blueprints, and automation rules consumed by all departments.",
    href: "/settings/workflow-templates",
    items: ["Workflow Templates", "Workflow Rules", "Task Blueprints", "Automation Rules"],
    status: "partial",
  },
  {
    label: "Intelligence",
    description: "Define KPIs, dashboard configurations, scoring rules, and recommendation logic.",
    href: "/settings/kpi-definitions",
    items: ["KPI Definitions", "Dashboard Builder", "Recommendation Rules", "Scoring Rules"],
    status: "planned",
  },
  {
    label: "Notifications & Escalations",
    description: "Configure notification delivery rules and escalation triggers platform-wide.",
    href: "/settings/notification-rules",
    items: ["Notification Rules", "Escalation Rules"],
    status: "planned",
  },
  {
    label: "Integrations",
    description: "Manage connected services, providers, webhooks, and API connections.",
    href: "/settings/integrations",
    items: ["Integration Hub", "Add Integration", "Provider Templates", "Webhooks", "API Connections"],
    status: "live",
  },
  {
    label: "System",
    description: "Monitor platform health, review configuration audit trails, and track issues.",
    href: "/settings/system-health",
    items: ["System Health", "Logs", "Configuration Audit", "Issue Monitor"],
    status: "planned",
  },
];

const STATUS_STYLES = {
  live:    { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", label: "Live" },
  partial: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "Partial" },
  planned: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", label: "Planned" },
} as const;

const ARCHITECTURE_NOTES = [
  {
    consumer: "Sales Workspace",
    sources: [
      "Sales Intake Forms",
      "Audit Templates",
      "Audit Goal Configuration",
      "Recommendation Rules",
      "Proposal Templates",
      "Pricing Rules",
    ],
  },
  {
    consumer: "Department Workspaces",
    sources: [
      "Department Settings",
      "KPI Definitions",
      "Task Blueprints",
      "Integration Connections",
      "Workflow Rules",
      "Report Templates",
    ],
  },
];

export default function SettingsIndexPage() {
  return (
    <div className="space-y-8 max-w-screen-xl">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Platform Admin
          </p>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Configuration Control Center
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            Settings is the authoritative source of truth for all configurable platform behavior.
            Workspaces execute configuration — they do not define it.
          </p>
        </div>
      </div>

      {/* ── Architecture Notice ───────────────────────────────────────────── */}
      <div
        className="rounded-xl border p-5"
        style={{
          background: "var(--rtm-blue-xlight)",
          borderColor: "var(--rtm-blue-light)",
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: "var(--rtm-blue)" }}
        >
          Configuration Architecture
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ARCHITECTURE_NOTES.map((note) => (
            <div
              key={note.consumer}
              className="rounded-lg p-4"
              style={{
                background: "var(--rtm-surface)",
                border: "1px solid var(--rtm-border)",
              }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {note.consumer}
              </p>
              <p
                className="text-xs mb-2"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Consumes from Settings:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {note.sources.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--rtm-blue-xlight)",
                      color: "var(--rtm-blue)",
                      border: "1px solid var(--rtm-blue-light)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Configuration Sections Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {CONFIG_SECTIONS.map((section) => {
          const s = STATUS_STYLES[section.status];
          return (
            <Link
              key={section.label}
              href={section.href}
              className="block rounded-xl border transition-all hover:shadow-md group"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                textDecoration: "none",
              }}
            >
              <div className="p-5">
                {/* Card header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2
                    className="text-sm font-bold leading-tight group-hover:underline"
                    style={{ color: "var(--rtm-text-primary)" }}
                  >
                    {section.label}
                  </h2>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: s.bg,
                      color: s.color,
                      border: `1px solid ${s.border}`,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed mb-4"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {section.description}
                </p>
                {/* Sub-items */}
                <div className="flex flex-wrap gap-1.5">
                  {section.items.map((item) => (
                    <span
                      key={item}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                      style={{
                        background: "var(--rtm-bg)",
                        color: "var(--rtm-text-secondary)",
                        border: "1px solid var(--rtm-border)",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
