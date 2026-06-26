"use client";

import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// System Health — Platform Status Overview
// ─────────────────────────────────────────────────────────────────────────────

interface SystemComponent {
  name: string;
  category: string;
  status: "operational" | "degraded" | "outage";
  latencyMs?: number;
  uptime: string;
  lastChecked: string;
}

const COMPONENTS: SystemComponent[] = [
  { name: "Platform Core",       category: "Core",         status: "operational", latencyMs: 42,   uptime: "99.98%", lastChecked: "2 min ago" },
  { name: "Database",            category: "Core",         status: "operational", latencyMs: 18,   uptime: "99.99%", lastChecked: "2 min ago" },
  { name: "Authentication",      category: "Core",         status: "operational", latencyMs: 55,   uptime: "99.97%", lastChecked: "2 min ago" },
  { name: "Notification Engine", category: "Services",     status: "operational", latencyMs: 120,  uptime: "99.92%", lastChecked: "3 min ago" },
  { name: "Report Automation",   category: "Services",     status: "operational", latencyMs: 340,  uptime: "99.85%", lastChecked: "5 min ago" },
  { name: "Workflow Engine",     category: "Services",     status: "operational", latencyMs: 88,   uptime: "99.95%", lastChecked: "2 min ago" },
  { name: "Google Analytics 4",  category: "Integrations", status: "operational", latencyMs: 420,  uptime: "99.80%", lastChecked: "5 min ago" },
  { name: "Google Ads",          category: "Integrations", status: "operational", latencyMs: 380,  uptime: "99.75%", lastChecked: "5 min ago" },
  { name: "Meta Ads",            category: "Integrations", status: "operational", latencyMs: 510,  uptime: "99.60%", lastChecked: "5 min ago" },
  { name: "CallRail",            category: "Integrations", status: "operational", latencyMs: 290,  uptime: "99.90%", lastChecked: "5 min ago" },
  { name: "GoHighLevel CRM",     category: "Integrations", status: "operational", latencyMs: 450,  uptime: "99.70%", lastChecked: "5 min ago" },
];

const STATUS_STYLES = {
  operational: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981", label: "Operational" },
  degraded:    { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", dot: "#F59E0B", label: "Degraded" },
  outage:      { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444", label: "Outage" },
};

const categories = [...new Set(COMPONENTS.map((c) => c.category))];

const allOperational = COMPONENTS.every((c) => c.status === "operational");

export default function SystemHealthPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        <Link href="/settings" className="hover:underline" style={{ color: "var(--rtm-text-muted)" }}>Settings</Link>
        <span>›</span>
        <span style={{ color: "var(--rtm-text-secondary)" }}>System Health</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          System Health
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
          Real-time status of platform components and integrations.
        </p>
      </div>

      {/* Overall status banner */}
      <div
        className="rounded-xl border p-4"
        style={{
          background: allOperational ? "#ECFDF5" : "#FFFBEB",
          borderColor: allOperational ? "#A7F3D0" : "#FDE68A",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: allOperational ? "#10B981" : "#F59E0B" }}
          />
          <p
            className="text-sm font-semibold"
            style={{ color: allOperational ? "#059669" : "#B45309" }}
          >
            {allOperational
              ? "All Systems Operational"
              : "Some Systems Experiencing Issues"}
          </p>
          <span
            className="ml-auto text-xs"
            style={{ color: allOperational ? "#059669" : "#B45309" }}
          >
            Last updated 2 min ago
          </span>
        </div>
      </div>

      {/* Components by category */}
      {categories.map((cat) => {
        const components = COMPONENTS.filter((c) => c.category === cat);
        return (
          <section
            key={cat}
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
            >
              <h2 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                {cat}
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {components.map((component) => {
                const s = STATUS_STYLES[component.status];
                return (
                  <div
                    key={component.name}
                    className="px-5 py-4 flex items-center gap-4"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: s.dot }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>
                        {component.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                        Uptime {component.uptime} · Checked {component.lastChecked}
                      </p>
                    </div>
                    {component.latencyMs && (
                      <span className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>
                        {component.latencyMs}ms
                      </span>
                    )}
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Related */}
      <div className="flex gap-3">
        <Link
          href="/settings/logs"
          className="text-sm font-medium px-3 py-1.5 rounded-lg border"
          style={{
            background: "var(--rtm-bg)",
            color: "var(--rtm-text-secondary)",
            borderColor: "var(--rtm-border)",
            textDecoration: "none",
          }}
        >
          View Logs
        </Link>
        <Link
          href="/settings/issue-monitor"
          className="text-sm font-medium px-3 py-1.5 rounded-lg border"
          style={{
            background: "var(--rtm-bg)",
            color: "var(--rtm-text-secondary)",
            borderColor: "var(--rtm-border)",
            textDecoration: "none",
          }}
        >
          Issue Monitor
        </Link>
      </div>
    </div>
  );
}
