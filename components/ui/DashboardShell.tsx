"use client";

// RTM OS — Standard Dashboard Shell
// All dashboards use: KPI Section, Alerts Section, Work Queue, Performance Metrics, AI Insights.

import React from "react";

interface DashboardShellProps {
  /** Rendered in the top KPI grid (typically 4 KpiCard components) */
  kpiSection: React.ReactNode;
  /** AlertBanner or inline alert content */
  alertsSection?: React.ReactNode;
  /** Table, card list, or queue component */
  workQueue?: React.ReactNode;
  /** Charts or metric rows */
  performanceSection?: React.ReactNode;
  /** AISummary component */
  aiInsights?: React.ReactNode;
  /** Additional sections rendered after the standard ones */
  extraSections?: React.ReactNode;
  /** Grid columns for KPI section: 2 | 3 | 4 */
  kpiCols?: 2 | 3 | 4;
  /** Section labels — override if needed */
  labels?: {
    alerts?: string;
    workQueue?: string;
    performance?: string;
    ai?: string;
  };
}

const SectionHeading = ({ label }: { label: string }) => (
  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>
    {label}
  </p>
);

export default function DashboardShell({
  kpiSection,
  alertsSection,
  workQueue,
  performanceSection,
  aiInsights,
  extraSections,
  kpiCols = 4,
  labels,
}: DashboardShellProps) {
  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[kpiCols];

  return (
    <div className="space-y-8">
      {/* ── KPI Section ── */}
      <section aria-label="Key Performance Indicators">
        <div className={`grid ${colClass} gap-4`}>
          {kpiSection}
        </div>
      </section>

      {/* ── Alerts ── */}
      {alertsSection && (
        <section aria-label="Alerts">
          {labels?.alerts && <SectionHeading label={labels.alerts} />}
          {alertsSection}
        </section>
      )}

      {/* ── Main content: work queue + performance (side by side on wide screens) ── */}
      {(workQueue || performanceSection) && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Work queue: 2/3 width */}
          {workQueue && (
            <div className="xl:col-span-2">
              {labels?.workQueue && <SectionHeading label={labels.workQueue} />}
              {workQueue}
            </div>
          )}

          {/* Performance: 1/3 width */}
          {performanceSection && (
            <div className="xl:col-span-1">
              {labels?.performance && <SectionHeading label={labels.performance} />}
              {performanceSection}
            </div>
          )}
        </div>
      )}

      {/* ── AI Insights ── */}
      {aiInsights && (
        <section aria-label="AI Insights">
          {labels?.ai && <SectionHeading label={labels.ai} />}
          {aiInsights}
        </section>
      )}

      {/* ── Extra sections ── */}
      {extraSections}
    </div>
  );
}
