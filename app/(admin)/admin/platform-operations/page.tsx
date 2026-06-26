"use client";

import React, { useState } from "react";
import KpiCard from "@/components/ui/KpiCard";
import SectionWrapper from "@/components/ui/SectionWrapper";
import StatusBadge, { StatusVariant } from "@/components/ui/StatusBadge";

// ─────────────────────────────────────────────────────────────────────────────
// Platform Operations Dashboard
// Route: /admin/platform-operations
// ─────────────────────────────────────────────────────────────────────────────

// ── Mock data ────────────────────────────────────────────────────────────────

const HEALTH_SCORE = 74;

const CRITICAL_ISSUES = [
  {
    id: "ci-001",
    title: "Billing webhook endpoint returning 503",
    module: "Billing",
    detected: "2025-07-24 09:14",
    impact: "Invoice delivery blocked for 12 clients",
    status: "critical" as StatusVariant,
    owner: "Platform Team",
  },
  {
    id: "ci-002",
    title: "AM assignment automation not triggering after invoice paid",
    module: "Account Management",
    detected: "2025-07-23 17:42",
    impact: "4 onboarding workflows stalled",
    status: "critical" as StatusVariant,
    owner: "Workflow Team",
  },
  {
    id: "ci-003",
    title: "SSO token refresh failing for Google Workspace users",
    module: "Integrations",
    detected: "2025-07-24 06:30",
    impact: "23 users locked out",
    status: "critical" as StatusVariant,
    owner: "Security Team",
  },
];

const WARNINGS = [
  {
    id: "w-001",
    title: "Task overdue rate above threshold (18%)",
    module: "Task Engine",
    detected: "2025-07-24",
    impact: "SLA exposure across 9 active clients",
    status: "warning" as StatusVariant,
  },
  {
    id: "w-002",
    title: "Renewal workflow not initiated for 3 upcoming renewals",
    module: "Renewals",
    detected: "2025-07-23",
    impact: "Potential revenue at risk: $24,000",
    status: "warning" as StatusVariant,
  },
  {
    id: "w-003",
    title: "Slack integration rate-limited — delivery delayed",
    module: "Integrations",
    detected: "2025-07-24",
    impact: "Notifications delayed up to 12 min",
    status: "warning" as StatusVariant,
  },
  {
    id: "w-004",
    title: "Department activation template missing for Healthcare vertical",
    module: "Activation",
    detected: "2025-07-22",
    impact: "Manual setup required for new Healthcare clients",
    status: "warning" as StatusVariant,
  },
];

const CONFIG_HEALTH = [
  { area: "Workflow Trigger Rules", status: "healthy" as StatusVariant, configured: 12, issues: 0 },
  { area: "Billing Defaults", status: "at-risk" as StatusVariant, configured: 8, issues: 2 },
  { area: "Task Templates", status: "healthy" as StatusVariant, configured: 34, issues: 0 },
  { area: "Role Permissions", status: "monitor" as StatusVariant, configured: 6, issues: 1 },
  { area: "Notification Rules", status: "at-risk" as StatusVariant, configured: 11, issues: 3 },
  { area: "Department Activation Sets", status: "at-risk" as StatusVariant, configured: 5, issues: 1 },
  { area: "Integration Credentials", status: "critical" as StatusVariant, configured: 7, issues: 2 },
  { area: "SLA Thresholds", status: "healthy" as StatusVariant, configured: 4, issues: 0 },
];

const WORKFLOW_HEALTH = [
  { name: "Sales Pipeline",       runs30d: 42, failures: 0,  lastRun: "2025-07-24", status: "healthy" as StatusVariant },
  { name: "Onboarding Workflow",  runs30d: 18, failures: 4,  lastRun: "2025-07-23", status: "at-risk" as StatusVariant },
  { name: "Renewal Workflow",     runs30d: 9,  failures: 3,  lastRun: "2025-07-22", status: "critical" as StatusVariant },
  { name: "Offboarding Workflow", runs30d: 7,  failures: 0,  lastRun: "2025-07-21", status: "healthy" as StatusVariant },
  { name: "Activation Workflow",  runs30d: 14, failures: 1,  lastRun: "2025-07-24", status: "monitor" as StatusVariant },
];

const INTEGRATION_HEALTH = [
  { name: "Stripe",          type: "Payment",       status: "healthy" as StatusVariant,  latency: "48 ms",   lastCheck: "2 min ago" },
  { name: "Google Workspace",type: "SSO / Auth",    status: "critical" as StatusVariant, latency: "—",       lastCheck: "6 min ago" },
  { name: "Slack",           type: "Notifications", status: "at-risk" as StatusVariant,  latency: "740 ms",  lastCheck: "1 min ago" },
  { name: "QuickBooks",      type: "Accounting",    status: "healthy" as StatusVariant,  latency: "112 ms",  lastCheck: "5 min ago" },
  { name: "HubSpot",         type: "CRM",           status: "monitor" as StatusVariant,  latency: "290 ms",  lastCheck: "3 min ago" },
  { name: "DocuSign",        type: "E-Signature",   status: "healthy" as StatusVariant,  latency: "63 ms",   lastCheck: "4 min ago" },
];

const BROKEN_ROUTES = [
  { route: "/billing/invoices/batch-send", method: "POST", error: "503 Service Unavailable", last404: "2025-07-24 09:14", hits: 37 },
  { route: "/integrations/google/refresh", method: "GET",  error: "401 Unauthorized",        last404: "2025-07-24 06:32", hits: 89 },
  { route: "/tasks/bulk-assign",           method: "POST", error: "422 Unprocessable",       last404: "2025-07-23 14:07", hits: 12 },
];

const TECH_DEBT = [
  { item: "Legacy billing data migration incomplete",  severity: "high",   age: "47 days",  owner: "Platform" },
  { item: "Task audit log schema not indexed",         severity: "medium", age: "31 days",  owner: "Backend"  },
  { item: "Deprecated onboarding v1 endpoints active", severity: "high",  age: "62 days",  owner: "API"      },
  { item: "Client settings stored in flat JSON",       severity: "medium", age: "88 days",  owner: "Data"     },
  { item: "Email template engine pre-2023 version",    severity: "low",    age: "120 days", owner: "Platform" },
];

const ISSUE_CENTER: Array<{
  id: string; title: string; module: string; type: string; severity: "Critical" | "High" | "Medium" | "Low";
  opened: string; status: StatusVariant;
}> = [
  { id: "ISS-201", title: "Webhook 503 — Billing endpoint down",              module: "Billing",          type: "Incident",    severity: "Critical", opened: "2025-07-24", status: "critical"  },
  { id: "ISS-202", title: "SSO token refresh failure — Google Workspace",     module: "Integrations",     type: "Incident",    severity: "Critical", opened: "2025-07-24", status: "critical"  },
  { id: "ISS-203", title: "AM workflow stalled post invoice paid",            module: "Account Mgmt",     type: "Bug",         severity: "High",     opened: "2025-07-23", status: "at-risk"   },
  { id: "ISS-204", title: "Slack rate limiting causing notification lag",     module: "Integrations",     type: "Performance", severity: "Medium",   opened: "2025-07-24", status: "warning"   },
  { id: "ISS-205", title: "Renewal workflow not auto-triggering",             module: "Renewals",         type: "Bug",         severity: "High",     opened: "2025-07-23", status: "at-risk"   },
  { id: "ISS-206", title: "Healthcare activation template missing",           module: "Activation",       type: "Config",      severity: "Medium",   opened: "2025-07-22", status: "warning"   },
  { id: "ISS-207", title: "Task overdue rate exceeds SLA threshold",          module: "Task Engine",      type: "SLA",         severity: "High",     opened: "2025-07-22", status: "at-risk"   },
  { id: "ISS-208", title: "Bulk-assign endpoint returning 422",               module: "Tasks",            type: "Bug",         severity: "Medium",   opened: "2025-07-23", status: "warning"   },
];

const ACTIVITY = [
  { time: "09:31", event: "Critical alert triggered — Billing webhook 503",          actor: "System Monitor", type: "critical" },
  { time: "09:14", event: "Webhook delivery failure detected on /billing/invoices",  actor: "System",         type: "error"    },
  { time: "07:15", event: "Google Workspace SSO token refresh failure",              actor: "System Monitor", type: "critical" },
  { time: "06:30", event: "Integration health check failed — Google Workspace",      actor: "Health Check",   type: "error"    },
  { time: "06:00", event: "Scheduled platform health scan completed",                actor: "Cron",           type: "info"     },
  { time: "Yesterday 22:45", event: "Renewal workflow failure logged (3 instances)", actor: "Workflow Engine",type: "warning"  },
  { time: "Yesterday 18:10", event: "Task overdue threshold breached (18.2%)",       actor: "SLA Monitor",    type: "warning"  },
  { time: "Yesterday 14:07", event: "Bulk-assign endpoint returned 422 (12 times)",  actor: "Error Tracker",  type: "warning"  },
];

const SYSTEM_ACTIONS = [
  { label: "Run Platform Health Scan",        description: "Full config and workflow audit" },
  { label: "Flush Webhook Queue",             description: "Retry all pending webhook deliveries" },
  { label: "Rebuild Integration Connections", description: "Re-authenticate and verify all integrations" },
  { label: "Recalculate SLA Thresholds",      description: "Sync against current client SLAs" },
  { label: "Clear Broken Route Cache",        description: "Invalidate cached route error state" },
  { label: "Export Platform Health Report",   description: "Generate PDF report for review" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 85) return "#059669";
  if (score >= 65) return "#D97706";
  return "#DC2626";
}

function scoreBg(score: number) {
  if (score >= 85) return "#ECFDF5";
  if (score >= 65) return "#FFFBEB";
  return "#FEF2F2";
}

function scoreLabel(score: number) {
  if (score >= 85) return "Healthy";
  if (score >= 65) return "Needs Attention";
  return "Degraded";
}

const severityStyle: Record<string, { bg: string; color: string; border: string }> = {
  Critical: { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA" },
  High:     { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A" },
  Medium:   { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  Low:      { bg: "#F8FAFC", color: "#475569", border: "#E2E8F0" },
};

const activityDot: Record<string, string> = {
  critical: "#DC2626",
  error:    "#EF4444",
  warning:  "#F59E0B",
  info:     "#3B82F6",
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconShield = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconAlert = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconSettings = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
const IconWorkflow = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <rect x="2" y="3" width="6" height="6" rx="1" />
    <rect x="16" y="3" width="6" height="6" rx="1" />
    <rect x="9" y="15" width="6" height="6" rx="1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 9v3a3 3 0 003 3h8a3 3 0 003-3V9" />
    <line x1="12" y1="12" x2="12" y2="15" />
  </svg>
);
const IconIntegration = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const IconDebt = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

export default function PlatformOperationsPage() {
  const [actionFired, setActionFired] = useState<string | null>(null);

  function handleAction(label: string) {
    setActionFired(label);
    setTimeout(() => setActionFired(null), 2000);
  }

  const criticalCount  = CRITICAL_ISSUES.length;
  const warningCount   = WARNINGS.length;
  const configIssues   = CONFIG_HEALTH.reduce((s, r) => s + r.issues, 0);
  const workflowFails  = WORKFLOW_HEALTH.reduce((s, w) => s + w.failures, 0);
  const integBad       = INTEGRATION_HEALTH.filter(i => i.status === "critical" || i.status === "at-risk").length;
  const brokenCount    = BROKEN_ROUTES.length;
  const debtHigh       = TECH_DEBT.filter(d => d.severity === "high").length;

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-blue)" }}>
            Admin
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Platform Operations
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            System health, configuration integrity, workflow reliability, and integration status across the RTM OS platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction("Run Platform Health Scan")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--rtm-blue)" }}
          >
            Run Health Scan
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
          >
            Export Report
          </button>
        </div>
      </div>

      {/* ── Platform Health Score ────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-6"
        style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
      >
        {/* Score ring / number */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-32 h-32 rounded-full border-4"
          style={{ borderColor: scoreColor(HEALTH_SCORE), background: scoreBg(HEALTH_SCORE) }}
        >
          <span className="text-4xl font-black" style={{ color: scoreColor(HEALTH_SCORE) }}>
            {HEALTH_SCORE}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wide mt-0.5" style={{ color: scoreColor(HEALTH_SCORE) }}>
            / 100
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
              Platform Health Score
            </h2>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full border"
              style={{ background: scoreBg(HEALTH_SCORE), color: scoreColor(HEALTH_SCORE), borderColor: scoreColor(HEALTH_SCORE) + "44" }}
            >
              {scoreLabel(HEALTH_SCORE)}
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--rtm-text-secondary)" }}>
            Score calculated from configuration integrity, workflow reliability, integration uptime, route health, and open issue severity.
          </p>
          {/* Score breakdown bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Configuration",   value: 68, max: 20 },
              { label: "Workflows",       value: 72, max: 20 },
              { label: "Integrations",    value: 58, max: 20 },
              { label: "Routes",          value: 80, max: 20 },
              { label: "Issue Backlog",   value: 92, max: 20 },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
                    {label}
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: scoreColor(value) }}>
                    {value}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--rtm-border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${value}%`, background: scoreColor(value) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Strip ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        {[
          { title: "Critical Issues",     value: String(criticalCount),  risk: "critical" as const,  icon: <IconAlert /> },
          { title: "Warnings",            value: String(warningCount),   risk: "at-risk" as const,   icon: <IconAlert /> },
          { title: "Config Issues",       value: String(configIssues),   risk: "at-risk" as const,   icon: <IconSettings /> },
          { title: "Workflow Failures",   value: String(workflowFails),  risk: "at-risk" as const,   icon: <IconWorkflow /> },
          { title: "Integration Alerts",  value: String(integBad),       risk: "critical" as const,  icon: <IconIntegration /> },
          { title: "Broken Routes",       value: String(brokenCount),    risk: "at-risk" as const,   icon: <IconAlert /> },
          { title: "High Tech Debt",      value: String(debtHigh),       risk: "at-risk" as const,   icon: <IconDebt /> },
        ].map(({ title, value, risk, icon }) => (
          <KpiCard key={title} title={title} value={value} risk={risk} icon={icon} />
        ))}
      </div>

      {/* ── Critical Issues ─────────────────────────────────────────────────── */}
      <SectionWrapper
        title="Critical Issues"
        description={`${criticalCount} active critical issues requiring immediate attention`}
        actions={
          <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{ background: "#FEF2F2", color: "#991B1B", borderColor: "#FECACA" }}>
            {criticalCount} Critical
          </span>
        }
      >
        <div className="space-y-3">
          {CRITICAL_ISSUES.map((issue) => (
            <div
              key={issue.id}
              className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-lg border"
              style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="text-xs font-mono font-semibold" style={{ color: "#991B1B" }}>{issue.id}</span>
                  <StatusBadge variant="critical" size="sm" />
                  <span className="text-[11px] px-2 py-0.5 rounded font-semibold"
                    style={{ background: "white", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" }}>
                    {issue.module}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                  {issue.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#991B1B" }}>
                  Impact: {issue.impact}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>Detected</div>
                <div className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{issue.detected}</div>
                <div className="text-[11px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>Owner: {issue.owner}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Warnings ────────────────────────────────────────────────────────── */}
      <SectionWrapper
        title="Warnings"
        description={`${warningCount} active warnings that may escalate without action`}
        actions={
          <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{ background: "#FFFBEB", color: "#92400E", borderColor: "#FDE68A" }}>
            {warningCount} Warnings
          </span>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WARNINGS.map((w) => (
            <div
              key={w.id}
              className="p-4 rounded-lg border"
              style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
            >
              <div className="flex items-start gap-2 flex-wrap mb-1.5">
                <span className="text-xs font-mono font-semibold" style={{ color: "#92400E" }}>{w.id}</span>
                <StatusBadge variant="warning" size="sm" label="Warning" />
                <span className="text-[11px] px-2 py-0.5 rounded font-semibold"
                  style={{ background: "white", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" }}>
                  {w.module}
                </span>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{w.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>{w.impact}</p>
              <p className="text-[11px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>Detected: {w.detected}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Configuration Health ─────────────────────────────────────────────── */}
      <SectionWrapper
        title="Configuration Health"
        description="Status of system configuration areas across the platform"
        actions={<IconSettings />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                {["Configuration Area", "Status", "Configured", "Open Issues"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                    style={{ color: "var(--rtm-text-secondary)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONFIG_HEALTH.map((row, i) => (
                <tr key={row.area} className="hover:bg-slate-50/40 transition-colors"
                  style={{ borderBottom: i < CONFIG_HEALTH.length - 1 ? "1px solid var(--rtm-border-light)" : "none" }}>
                  <td className="px-4 py-3 font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{row.area}</td>
                  <td className="px-4 py-3"><StatusBadge variant={row.status} size="sm" /></td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{row.configured}</td>
                  <td className="px-4 py-3">
                    {row.issues > 0 ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                        {row.issues}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "#059669" }}>None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Workflow Health ──────────────────────────────────────────────────── */}
      <SectionWrapper
        title="Workflow Health"
        description="Run status and failure rates for active platform workflows (last 30 days)"
        actions={<IconWorkflow />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                {["Workflow", "Status", "Runs (30d)", "Failures", "Last Run"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                    style={{ color: "var(--rtm-text-secondary)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WORKFLOW_HEALTH.map((wf, i) => (
                <tr key={wf.name} className="hover:bg-slate-50/40 transition-colors"
                  style={{ borderBottom: i < WORKFLOW_HEALTH.length - 1 ? "1px solid var(--rtm-border-light)" : "none" }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{wf.name}</td>
                  <td className="px-4 py-3"><StatusBadge variant={wf.status} size="sm" /></td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{wf.runs30d}</td>
                  <td className="px-4 py-3">
                    {wf.failures > 0 ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: wf.failures >= 3 ? "#FEF2F2" : "#FFFBEB", color: wf.failures >= 3 ? "#DC2626" : "#92400E", border: `1px solid ${wf.failures >= 3 ? "#FECACA" : "#FDE68A"}` }}>
                        {wf.failures}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "#059669" }}>0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>{wf.lastRun}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Integration Health ───────────────────────────────────────────────── */}
      <SectionWrapper
        title="Integration Health"
        description="Live status for all external service integrations"
        actions={<IconIntegration />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {INTEGRATION_HEALTH.map((intg) => (
            <div
              key={intg.name}
              className="flex items-center gap-4 p-4 rounded-lg border"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm"
                style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", color: "var(--rtm-blue)" }}
              >
                {intg.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{intg.name}</span>
                  <StatusBadge variant={intg.status} size="sm" />
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  {intg.type} &nbsp;·&nbsp; Latency: {intg.latency} &nbsp;·&nbsp; {intg.lastCheck}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Broken Routes ────────────────────────────────────────────────────── */}
      <SectionWrapper
        title="Broken Routes"
        description={`${BROKEN_ROUTES.length} routes returning errors in the last 24 hours`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                {["Route", "Method", "Error", "Last Occurrence", "Hit Count"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                    style={{ color: "var(--rtm-text-secondary)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BROKEN_ROUTES.map((r, i) => (
                <tr key={r.route} className="hover:bg-red-50/20 transition-colors"
                  style={{ borderBottom: i < BROKEN_ROUTES.length - 1 ? "1px solid var(--rtm-border-light)" : "none" }}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "var(--rtm-blue)" }}>{r.route}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded"
                      style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                      {r.method}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold" style={{ color: "#DC2626" }}>{r.error}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>{r.last404}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                      {r.hits}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Technical Debt ───────────────────────────────────────────────────── */}
      <SectionWrapper
        title="Technical Debt"
        description="Tracked items requiring remediation to prevent platform degradation"
        actions={<IconDebt />}
      >
        <div className="space-y-2">
          {TECH_DEBT.map((item, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 rounded-lg border"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.item}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                  style={severityStyle[item.severity.charAt(0).toUpperCase() + item.severity.slice(1)]}>
                  {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded"
                  style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
                  {item.owner}
                </span>
                <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{item.age}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Issue Center ─────────────────────────────────────────────────────── */}
      <SectionWrapper
        title="Issue Center"
        description="All open platform issues across modules, sorted by severity"
        actions={
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full border"
            style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)", borderColor: "#BFDBFE" }}>
            {ISSUE_CENTER.length} Open
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                {["ID", "Issue", "Module", "Type", "Severity", "Opened", "Status"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                    style={{ color: "var(--rtm-text-secondary)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ISSUE_CENTER.map((iss, i) => (
                <tr key={iss.id} className="hover:bg-slate-50/30 transition-colors"
                  style={{ borderBottom: i < ISSUE_CENTER.length - 1 ? "1px solid var(--rtm-border-light)" : "none" }}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "var(--rtm-blue)" }}>{iss.id}</td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{iss.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] px-2 py-0.5 rounded font-semibold"
                      style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                      {iss.module}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>{iss.type}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                      style={severityStyle[iss.severity]}>
                      {iss.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>{iss.opened}</td>
                  <td className="px-4 py-3"><StatusBadge variant={iss.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Platform Activity ────────────────────────────────────────────────── */}
      <SectionWrapper
        title="Platform Activity"
        description="Recent system events, alerts, and automated actions"
      >
        <div className="space-y-0">
          {ACTIVITY.map((ev, i) => (
            <div
              key={i}
              className="flex items-start gap-3 py-3"
              style={{ borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--rtm-border-light)" : "none" }}
            >
              <div className="flex-shrink-0 mt-1">
                <span className="w-2 h-2 rounded-full block"
                  style={{ background: activityDot[ev.type] ?? "#94A3B8" }} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm" style={{ color: "var(--rtm-text-primary)" }}>{ev.event}</span>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  {ev.actor} &nbsp;·&nbsp; {ev.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── System Actions ───────────────────────────────────────────────────── */}
      <SectionWrapper
        title="System Actions"
        description="Administrative platform operations — run with care"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {SYSTEM_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleAction(action.label)}
              className="text-left p-4 rounded-lg border transition-all hover:shadow-md"
              style={{
                background: actionFired === action.label ? "var(--rtm-blue-xlight)" : "var(--rtm-bg)",
                borderColor: actionFired === action.label ? "var(--rtm-blue)" : "var(--rtm-border)",
              }}
            >
              <div className="text-sm font-bold mb-0.5"
                style={{ color: actionFired === action.label ? "var(--rtm-blue)" : "var(--rtm-text-primary)" }}>
                {actionFired === action.label ? "Running..." : action.label}
              </div>
              <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                {action.description}
              </div>
            </button>
          ))}
        </div>
      </SectionWrapper>

    </div>
  );
}
