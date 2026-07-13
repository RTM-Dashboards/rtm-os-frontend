"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import type { DeptReport, ReportStatus } from "@/lib/reporting/types";

// ── Status badge variant mapper ────────────────────────────────────────────────
function statusVariant(
  s: ReportStatus
): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Sent":
    case "Approved":
      return "success";
    case "Overdue":
    case "Needs Revision":
      return "error";
    case "QA In Progress":
    case "Ready for QA":
      return "warning";
    case "Ready to Send":
      return "info";
    default:
      return "pending";
  }
}

function qaVariant(
  s: DeptReport["qaStatus"]
): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Approved":
      return "success";
    case "Failed":
      return "error";
    case "In Review":
      return "warning";
    case "In Queue":
      return "info";
    default:
      return "pending";
  }
}

function sendVariant(
  s: DeptReport["sendStatus"]
): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Sent":
      return "success";
    case "Bounced":
      return "error";
    case "Scheduled":
      return "info";
    default:
      return "pending";
  }
}

// ── Status transition rules ────────────────────────────────────────────────────
// Maps each Quick Action to the status it should set.
// "Generate Report" advances Draft/In Progress → a visible "generated" state.
// We map it to "In Progress" if already Draft, or keep pushing forward.
function nextStatusForAction(
  action: string,
  current: ReportStatus
): ReportStatus | null {
  switch (action) {
    case "Generate Report":
      // Draft → In Progress; anything else → In Progress as well (re-generate)
      return "In Progress";
    case "Submit for QA":
      return "Ready for QA";
    case "Mark Ready to Send":
      return "Ready to Send";
    case "Send Report":
      return "Sent";
    default:
      return null;
  }
}

// ── Persistence helpers ────────────────────────────────────────────────────────
interface StatusOverride {
  reportId: string;
  status: string;
  updatedAt: string;
}

async function fetchOverrides(): Promise<StatusOverride[]> {
  try {
    const res = await fetch("/api/dept-report-status");
    if (!res.ok) return [];
    const data = (await res.json()) as { records: StatusOverride[] };
    return Array.isArray(data.records) ? data.records : [];
  } catch {
    return [];
  }
}

async function persistStatus(
  reportId: string,
  status: string
): Promise<boolean> {
  try {
    const res = await fetch("/api/dept-report-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── CSV export ────────────────────────────────────────────────────────────────
function exportCSV(reports: DeptReport[], dept: string): void {
  const headers = [
    "Client",
    "Reporting Period",
    "Owner",
    "Status",
    "QA Status",
    "Send Status",
    "Due Date",
    "Last Updated",
    "Next Action",
  ];

  const escape = (v: string) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;

  const rows = reports.map((r) =>
    [
      r.client,
      r.reportingPeriod,
      r.owner,
      r.status,
      r.qaStatus,
      r.sendStatus,
      r.dueDate,
      r.lastUpdated,
      r.nextAction,
    ]
      .map(escape)
      .join(",")
  );

  const csv = [headers.map(escape).join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${dept.replace(/\s+/g, "-").toLowerCase()}-reports.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── KPI Summary ───────────────────────────────────────────────────────────────
interface KPISummary {
  title: string;
  value: string | number;
  trend?: "up" | "down";
  trendValue?: string;
  iconBg: string;
  iconColor: string;
}

// ── Preview Modal ─────────────────────────────────────────────────────────────
interface PreviewModalProps {
  report: DeptReport;
  accent: string;
  onClose: () => void;
}

function PreviewModal({ report, accent, onClose }: PreviewModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const fields: { label: string; value: string }[] = [
    { label: "Client", value: report.client },
    { label: "Reporting Period", value: report.reportingPeriod },
    { label: "Owner", value: report.owner },
    { label: "Status", value: report.status },
    { label: "QA Status", value: report.qaStatus },
    { label: "Send Status", value: report.sendStatus },
    { label: "Due Date", value: report.dueDate },
    { label: "Last Updated", value: report.lastUpdated },
    { label: "Next Action", value: report.nextAction },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", border: "1px solid" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: `${accent}10`, borderBottom: `1px solid ${accent}25` }}
        >
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: accent }}>
              Report Preview
            </p>
            <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {report.client}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-black/10 transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-5 py-4 space-y-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span
                className="text-xs font-semibold uppercase tracking-wide w-36 flex-shrink-0 pt-0.5"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                {label}
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Modal footer */}
        <div
          className="px-5 py-3 flex justify-end"
          style={{ borderTop: "1px solid var(--rtm-border-light)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: accent }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  title: string;
  description: string;
  accent: string;
  dept: string;
  reports: DeptReport[];
  kpis: KPISummary[];
  reportingWorkspaceHref: string;
  kpiSections?: React.ReactNode;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function DeptReportPage({
  title,
  description,
  accent,
  dept,
  reports,
  kpis,
  reportingWorkspaceHref,
  kpiSections,
}: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState("May 2025");
  const [selectedClient, setSelectedClient] = useState("All");

  // Status overrides loaded from persistence layer — keyed by reportId.
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, ReportStatus>
  >({});

  // Which report row is "selected" (for actions that need a target).
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  // Preview modal target.
  const [previewReport, setPreviewReport] = useState<DeptReport | null>(null);

  // In-flight action label (disables buttons during async work).
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Toast-style feedback.
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // ── Hydrate status overrides on mount ────────────────────────────────────────
  useEffect(() => {
    fetchOverrides().then((overrides) => {
      const map: Record<string, ReportStatus> = {};
      for (const o of overrides) {
        map[o.reportId] = o.status as ReportStatus;
      }
      setStatusOverrides(map);
    });
  }, []);

  // Auto-dismiss toast after 3 s.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Merge overrides onto mock data ────────────────────────────────────────────
  const mergedReports: DeptReport[] = reports.map((r) =>
    statusOverrides[r.id]
      ? { ...r, status: statusOverrides[r.id] }
      : r
  );

  const clients = [
    "All",
    ...Array.from(new Set(mergedReports.map((r) => r.client))),
  ];

  const filtered = mergedReports.filter(
    (r) => selectedClient === "All" || r.client === selectedClient
  );

  const stats = {
    total: mergedReports.length,
    sent: mergedReports.filter((r) => r.status === "Sent").length,
    overdue: mergedReports.filter((r) => r.status === "Overdue").length,
    readyForQA: mergedReports.filter((r) => r.status === "Ready for QA").length,
  };

  // ── Active report lookup ──────────────────────────────────────────────────────
  const activeReport = activeReportId
    ? mergedReports.find((r) => r.id === activeReportId) ?? null
    : null;

  // ── Show toast helper ─────────────────────────────────────────────────────────
  const showToast = (msg: string, ok: boolean) => setToast({ msg, ok });

  // ── Action handler ────────────────────────────────────────────────────────────
  const handleAction = useCallback(
    async (actionLabel: string) => {
      // ── Export CSV — no target needed, exports filtered rows ─────────────────
      if (actionLabel === "Export CSV") {
        exportCSV(filtered, dept);
        showToast(`Exported ${filtered.length} report(s) to CSV.`, true);
        return;
      }

      // ── Preview — needs a selected report ────────────────────────────────────
      if (actionLabel === "Preview Report") {
        if (!activeReport) {
          showToast("Select a report row first, then click Preview Report.", false);
          return;
        }
        setPreviewReport(activeReport);
        return;
      }

      // ── Export PDF — intentionally disabled ──────────────────────────────────
      if (actionLabel === "Export PDF") {
        // Handled at render — button is disabled with tooltip. No-op here.
        return;
      }

      // ── Status-transition actions — need a selected report ───────────────────
      const newStatus = nextStatusForAction(
        actionLabel,
        activeReport?.status ?? "Draft"
      );
      if (!newStatus) return;

      if (!activeReport) {
        showToast(
          `Select a report row first, then click "${actionLabel}".`,
          false
        );
        return;
      }

      setPendingAction(actionLabel);
      const ok = await persistStatus(activeReport.id, newStatus);
      setPendingAction(null);

      if (ok) {
        setStatusOverrides((prev) => ({
          ...prev,
          [activeReport.id]: newStatus,
        }));
        showToast(
          `${activeReport.client}: status → ${newStatus}`,
          true
        );
      } else {
        showToast("Failed to save status. Please try again.", false);
      }
    },
    [activeReport, filtered, dept]
  );

  // ── Quick Actions definition (with metadata) ──────────────────────────────────
  const QUICK_ACTIONS: {
    label: string;
    icon?: string;
    disabled?: boolean;
    disabledReason?: string;
  }[] = [
    { label: "Generate Report" },
    { label: "Preview Report" },
    { label: "Submit for QA" },
    { label: "Mark Ready to Send" },
    { label: "Send Report" },
    {
      label: "Export PDF",
      disabled: true,
      disabledReason: "Export PDF: Not yet available",
    },
    { label: "Export CSV", icon: "⬇" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Preview Modal ── */}
      {previewReport && (
        <PreviewModal
          report={previewReport}
          accent={accent}
          onClose={() => setPreviewReport(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-xs"
          style={{
            background: toast.ok ? "#059669" : "#DC2626",
            color: "#fff",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-md"
              style={{ background: `${accent}15`, color: accent }}
            >
              {dept}
            </span>
            <Link
              href={reportingWorkspaceHref}
              className="text-xs hover:underline"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              → Reporting Workspace
            </Link>
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {title}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none"
            style={{
              borderColor: "var(--rtm-border-light)",
              color: "var(--rtm-text-primary)",
              background: "var(--rtm-bg)",
            }}
          >
            {["May 2025", "Apr 2025", "Mar 2025"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard
            key={k.title}
            title={k.title}
            value={String(k.value)}
            trend={k.trend}
            trendValue={k.trendValue}
            iconBg={k.iconBg}
            iconColor={k.iconColor}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
        ))}
      </div>

      {/* ── Dept-specific KPI sections ── */}
      {kpiSections}

      {/* ── Report Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Reports", value: stats.total, color: "#6366F1" },
          { label: "Sent", value: stats.sent, color: "#059669" },
          { label: "Ready for QA", value: stats.readyForQA, color: "#D97706" },
          { label: "Overdue", value: stats.overdue, color: "#DC2626" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-3 rounded-xl border text-center"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border-light)",
            }}
          >
            <p className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <SectionWrapper
        title="Quick Actions"
        description={
          activeReport
            ? `Acting on: ${activeReport.client} (${activeReport.status}) — click a different row to change target`
            : "Select a report row below, then click an action"
        }
      >
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((a) =>
            a.disabled ? (
              /* Disabled button with tooltip */
              <div key={a.label} className="relative group">
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border cursor-not-allowed opacity-40"
                  style={{
                    background: `${accent}08`,
                    borderColor: `${accent}30`,
                    color: accent,
                  }}
                >
                  {a.icon && <span>{a.icon}</span>}
                  {a.label}
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-lg pointer-events-none z-20"
                  style={{ background: "#1E293B", color: "#F8FAFC" }}
                >
                  {a.disabledReason}
                  {/* Arrow */}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #1E293B" }} />
                </div>
              </div>
            ) : (
              <button
                key={a.label}
                onClick={() => handleAction(a.label)}
                disabled={pendingAction === a.label}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: `${accent}08`,
                  borderColor: `${accent}30`,
                  color: accent,
                }}
                onMouseEnter={(e) => {
                  if (!pendingAction)
                    (e.currentTarget as HTMLButtonElement).style.background = `${accent}18`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${accent}08`;
                }}
              >
                {a.icon && <span>{a.icon}</span>}
                {pendingAction === a.label ? "Saving…" : a.label}
              </button>
            )
          )}
        </div>
      </SectionWrapper>

      {/* ── Report Table ── */}
      <SectionWrapper
        title={`${dept} Reports — ${selectedPeriod}`}
        description="Click a row to select it for Quick Actions"
      >
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none"
            style={{
              borderColor: "var(--rtm-border-light)",
              color: "var(--rtm-text-primary)",
              background: "var(--rtm-bg)",
            }}
          >
            {clients.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
              >
                {[
                  "Client",
                  "Period",
                  "Owner",
                  "Status",
                  "QA Status",
                  "Send Status",
                  "Due Date",
                  "Last Updated",
                  "Next Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: "var(--rtm-border-light)" }}
            >
              {filtered.map((r) => {
                const isActive = r.id === activeReportId;
                return (
                  <tr
                    key={r.id}
                    onClick={() =>
                      setActiveReportId((prev) =>
                        prev === r.id ? null : r.id
                      )
                    }
                    className="transition-colors cursor-pointer"
                    style={{
                      background: isActive
                        ? `${accent}12`
                        : undefined,
                      outline: isActive
                        ? `2px solid ${accent}40`
                        : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          "rgba(100,116,139,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          "";
                    }}
                  >
                    <td
                      className="py-2.5 px-3 font-semibold whitespace-nowrap"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {isActive && (
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                          style={{ background: accent }}
                        />
                      )}
                      {r.client}
                    </td>
                    <td
                      className="py-2.5 px-3 whitespace-nowrap"
                      style={{ color: "var(--rtm-text-secondary)" }}
                    >
                      {r.reportingPeriod}
                    </td>
                    <td
                      className="py-2.5 px-3 whitespace-nowrap"
                      style={{ color: "var(--rtm-text-secondary)" }}
                    >
                      {r.owner}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge
                        variant={statusVariant(r.status)}
                        label={r.status}
                        size="sm"
                      />
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge
                        variant={qaVariant(r.qaStatus)}
                        label={r.qaStatus}
                        size="sm"
                      />
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge
                        variant={sendVariant(r.sendStatus)}
                        label={r.sendStatus}
                        size="sm"
                      />
                    </td>
                    <td
                      className="py-2.5 px-3 whitespace-nowrap text-xs"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {r.dueDate}
                    </td>
                    <td
                      className="py-2.5 px-3 whitespace-nowrap text-xs"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {r.lastUpdated}
                    </td>
                    <td
                      className="py-2.5 px-3 text-xs"
                      style={{ color: "var(--rtm-text-secondary)" }}
                    >
                      {r.nextAction}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-sm"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    No reports found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Connection to Reporting Workspace ── */}
      <div
        className="p-4 rounded-xl border"
        style={{ background: `${accent}06`, borderColor: `${accent}25` }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: accent }}>
          Connected to Reporting Workspace
        </p>
        <p
          className="text-xs mb-3"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          {dept} department reports feed directly into the Reporting Workspace,
          where they are compiled, QA&apos;d, and delivered to clients.
        </p>
        <Link
          href={reportingWorkspaceHref}
          className="text-xs font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ background: accent, color: "#fff" }}
        >
          View in Reporting Workspace →
        </Link>
      </div>
    </div>
  );
}
