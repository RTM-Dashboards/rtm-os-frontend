"use client";

import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Issue Monitor — Active Platform Issues Tracker
// ─────────────────────────────────────────────────────────────────────────────

interface PlatformIssue {
  id: string;
  title: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "resolved";
  detected: string;
  updated: string;
  description: string;
}

const ISSUES: PlatformIssue[] = [
  {
    id: "ISS-001",
    title: "Meta Ads API intermittent slow responses",
    category: "Integration",
    severity: "medium",
    status: "investigating",
    detected: "Jun 25, 2025 09:35",
    updated: "Jun 25, 2025 10:40",
    description: "Meta Ads API responses occasionally exceed 500ms timeout threshold. Data is still being collected but with delays. Monitoring for escalation.",
  },
  {
    id: "ISS-002",
    title: "Salesforce connection timeout",
    category: "Integration",
    severity: "high",
    status: "investigating",
    detected: "Jun 25, 2025 09:58",
    updated: "Jun 25, 2025 10:15",
    description: "Salesforce CRM sync is failing due to connection timeout. CRM data is stale. Manual sync available as workaround.",
  },
];

const SEVERITY_STYLES = {
  critical:  { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA", label: "Critical" },
  high:      { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", label: "High" },
  medium:    { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "Medium" },
  low:       { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", label: "Low" },
};

const STATUS_STYLES = {
  open:          { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", label: "Open" },
  investigating: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "Investigating" },
  resolved:      { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", label: "Resolved" },
};

export default function IssueMonitorPage() {
  const openCount = ISSUES.filter((i) => i.status !== "resolved").length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        <Link href="/settings" className="hover:underline" style={{ color: "var(--rtm-text-muted)" }}>Settings</Link>
        <span>›</span>
        <span style={{ color: "var(--rtm-text-secondary)" }}>Issue Monitor</span>
      </nav>

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Issue Monitor
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {openCount} active issue{openCount !== 1 ? "s" : ""} under investigation.
          </p>
        </div>
        <Link
          href="/settings/system-health"
          className="text-sm font-medium px-3 py-1.5 rounded-lg border"
          style={{
            background: "var(--rtm-bg)",
            color: "var(--rtm-text-secondary)",
            borderColor: "var(--rtm-border)",
            textDecoration: "none",
          }}
        >
          System Health
        </Link>
      </div>

      {/* Issues list */}
      {ISSUES.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>
            No active issues
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            All platform systems are operating normally.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ISSUES.map((issue) => {
            const sev = SEVERITY_STYLES[issue.severity];
            const sta = STATUS_STYLES[issue.status];
            return (
              <div
                key={issue.id}
                className="rounded-xl border p-5"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="text-xs font-mono font-semibold flex-shrink-0"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {issue.id}
                    </span>
                    <h2
                      className="text-sm font-semibold"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {issue.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}
                    >
                      {sev.label}
                    </span>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: sta.bg, color: sta.color, border: `1px solid ${sta.border}` }}
                    >
                      {sta.label}
                    </span>
                  </div>
                </div>
                <p className="text-xs mb-3" style={{ color: "var(--rtm-text-secondary)" }}>
                  {issue.description}
                </p>
                <div
                  className="flex items-center gap-4 text-xs"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  <span>Category: {issue.category}</span>
                  <span>Detected: {issue.detected}</span>
                  <span>Last updated: {issue.updated}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
