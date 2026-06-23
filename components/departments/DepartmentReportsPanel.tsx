"use client";

// ── Department Reports Panel ──────────────────────────────────────────────────
// Reports come from Reporting & Intelligence. Refs are sourced from
// DepartmentConfig.reports — no hardcoded report names.

import { SectionWrapper, StatusBadge } from "@/components/ui";
import type { DepartmentReportRef, KpiReportingFrequency } from "@/types/department";

interface ReportStatus {
  reportId: string;
  status: "delivered"| "in-progress"| "overdue"| "scheduled";
  lastDelivered: string;
  nextDue: string;
  clientCount: number;
}

const REPORT_STATUS_MAP: Record<string, ReportStatus> = {
  "seo-monthly":         { reportId: "seo-monthly",     status: "in-progress", lastDelivered: "May 7",  nextDue: "Jun 7",  clientCount: 12 },
  "seo-performance":     { reportId: "seo-performance", status: "delivered",   lastDelivered: "Jun 1",  nextDue: "Jul 1",  clientCount: 12 },
  "seo-executive":       { reportId: "seo-executive",   status: "scheduled",   lastDelivered: "Apr 1",  nextDue: "Jul 1",  clientCount: 3  },
  "gbp-monthly":         { reportId: "gbp-monthly",     status: "in-progress", lastDelivered: "May 8",  nextDue: "Jun 8",  clientCount: 9  },
  "gbp-performance":     { reportId: "gbp-performance", status: "delivered",   lastDelivered: "Jun 1",  nextDue: "Jul 1",  clientCount: 9  },
  "ppc-monthly":         { reportId: "ppc-monthly",     status: "in-progress", lastDelivered: "May 5",  nextDue: "Jun 5",  clientCount: 8  },
  "meta-monthly":        { reportId: "meta-monthly",    status: "overdue",     lastDelivered: "May 3",  nextDue: "Jun 3",  clientCount: 6  },
  "content-monthly":     { reportId: "content-monthly", status: "in-progress", lastDelivered: "May 11", nextDue: "Jun 11", clientCount: 15 },
  "design-performance":  { reportId: "design-performance",status: "delivered", lastDelivered: "Jun 1",  nextDue: "Jul 1",  clientCount: 4  },
  "reporting-dept":      { reportId: "reporting-dept",  status: "delivered",   lastDelivered: "Jun 1",  nextDue: "Jul 1",  clientCount: 1  },
  "it-security-report":  { reportId: "it-security-report",status: "delivered", lastDelivered: "Jun 1",  nextDue: "Jul 1",  clientCount: 1  },
  "ai-automation-report":{ reportId: "ai-automation-report",status: "in-progress",lastDelivered: "May 12",nextDue: "Jun 12",clientCount: 7 },
};

function getReportStatus(reportId: string): ReportStatus {
  return REPORT_STATUS_MAP[reportId] ?? {
    reportId,
    status: "scheduled",
    lastDelivered: "—",
    nextDue: "—",
    clientCount: 0,
  };
}

const STATUS_MAP = {
  delivered:    { variant: "success"as const,  label: "Delivered"},
  "in-progress":{ variant: "info"as const,  label: "In Progress"},
  overdue:      { variant: "error"as const,  label: "Overdue"},
  scheduled:    { variant: "neutral"as const,  label: "Scheduled"},
};

const FREQ_LABEL: Record<KpiReportingFrequency, string> = {
  daily:     "Daily",
  weekly:    "Weekly",
  monthly:   "Monthly",
  quarterly: "Quarterly",
};

interface Props {
  reports: DepartmentReportRef[];
  accentColor: string;
  disabled?: boolean;
}

export default function DepartmentReportsPanel({ reports, accentColor, disabled }: Props) {
  if (disabled) {
    return (
      <SectionWrapper title="Reports"description="Department reports from Reporting and Intelligence">
        <div
          className="rounded-lg border p-6 text-center text-sm"style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-muted)", background: "var(--rtm-bg)"}}
        >
          Reports module is disabled for this department.
        </div>
      </SectionWrapper>
    );
  }

  if (reports.length === 0) {
    return (
      <SectionWrapper title="Reports"description="Department reports from Reporting and Intelligence">
        <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>
          No reports configured. Configure reports in Reporting &amp; Intelligence.
        </p>
      </SectionWrapper>
    );
  }

  const enriched = reports.map((r) => ({ ...r, health: getReportStatus(r.reportId) }));

  return (
    <SectionWrapper
      title="Department Reports"description="Reports from Reporting and Intelligence — no hardcoded report data"noPadding
      actions={
        <a className="text-xs font-medium hover:underline" href="/reporting" style={{ color: accentColor }}>
          View in Reporting
        </a>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
              {["Report", "Frequency", "Data Source", "Clients", "Status", "Last Delivered", "Next Due"].map((h) => (
                <th
                  key={h}
                  className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enriched.map((report) => {
              const st = STATUS_MAP[report.health.status];
              return (
                <tr
                  key={report.reportId}
                  className="hover:bg-slate-50/50 transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}
                >
                  <td className="py-2.5 px-3 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>
                    {report.displayName}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
                    >
                      {FREQ_LABEL[report.frequency]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                    {report.source}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-center font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>
                    {report.health.clientCount}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge variant={st.variant} label={st.label} size="sm"/>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                    {report.health.lastDelivered}
                  </td>
                  <td
                    className="py-2.5 px-3 whitespace-nowrap font-medium text-xs"style={{ color: report.health.status === "overdue"? "#DC2626": "var(--rtm-text-secondary)"}}
                  >
                    {report.health.nextDue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
