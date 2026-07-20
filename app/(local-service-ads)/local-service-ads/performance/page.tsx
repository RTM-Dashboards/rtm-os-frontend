"use client";

import Link from "next/link";
import { useState } from "react";
import { KpiCard, SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { useEnabledKpis } from "@/lib/hooks/useEnabledKpis";
import ClientSummaryNote from "@/components/call-intelligence/ClientSummaryNote";

const workspace = getWorkspace("local-service-ads")!;

// ── Illustrative LSA client data ──────────────────────────────────────────────
//
// These rows are sourced from the same hardcoded illustrative dataset used on
// Reporting › Call Intelligence. Filtered to clients whose topServices include
// "LSA". No real call-tracking integration exists — this is representative
// sample data only. The same ClientSummaryNote component and API are used here
// as on Call Intelligence, so notes are shared in one real data store.
//
// ─────────────────────────────────────────────────────────────────────────────

const LSA_CLIENT_ROWS = [
  {
    client: "Apex Roofing",
    clientId: "apex-roofing",
    totalCalls: 48,
    qualifiedLeads: 31,
    bookedLeads: 22,
    bookingPct: 71,
    spamPct: 8,
    missedOpp: 3,
    qualityScore: 88,
    trend: "up" as const,
  },
  {
    client: "BlueSky HVAC",
    clientId: "bluesky-hvac",
    totalCalls: 55,
    qualifiedLeads: 40,
    bookedLeads: 33,
    bookingPct: 83,
    spamPct: 5,
    missedOpp: 2,
    qualityScore: 92,
    trend: "up" as const,
  },
];

// LSA service-level illustrative summary (from servicePerformance on Call Intelligence)
const LSA_SERVICE_SUMMARY = {
  calls: 167,
  qualifiedLeads: 130,
  bookedLeads: 104,
  bookingPct: 80,
  leadQuality: 89,
  revenueOpportunity: "$261,000",
};

// ── IllustrativeCallDataBanner ────────────────────────────────────────────────
// Exact same amber/yellow pattern + copy family as Reporting › Call Intelligence.

function IllustrativeCallDataBanner() {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border-2 p-4"
      style={{
        background: "#FFFBEB",
        borderColor: "#FCD34D",
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
        style={{ background: "#FEF3C7" }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: "#D97706" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div className="min-w-0">
        <div className="font-bold text-sm mb-1" style={{ color: "#92400E" }}>
          Illustrative Data — No Real Call-Tracking Integration
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#78350F" }}>
          All call volumes, classifications, sentiment scores, lead quality scores, and
          booking rates shown in this section are{" "}
          <strong>representative examples only</strong> — they are hardcoded sample data,
          not output from any real AI system or call-tracking platform (CallRail,
          CallTrackingMetrics, etc.). No calls are actually being analyzed or tracked.
          These figures show what the workflow would look like once a real call-tracking
          API integration is connected.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "#FDE68A", color: "#92400E" }}
          >
            No real AI output
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "#FDE68A", color: "#92400E" }}
          >
            No call-tracking API connected
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "#FDE68A", color: "#92400E" }}
          >
            Scores are illustrative, not computed
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LsaPerformancePage() {
  const { isEnabled } = useEnabledKpis("local-service-ads");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const selectedClient = LSA_CLIENT_ROWS.find((r) => r.clientId === selectedClientId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: workspace.accentColor }}
        >
          {workspace.name}
        </p>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          LSA Performance
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Lead generation and budget utilization metrics.
        </p>
      </div>

      {/* ── Core LSA KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isEnabled("lsa-monthly-leads") && (
          <KpiCard
            title="Monthly Leads"
            value="184"
            trend="up"
            trendValue="22"
            iconBg="#ECFDF5"
            iconColor="#059669"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          />
        )}
        {isEnabled("lsa-cost-per-lead") && (
          <KpiCard
            title="Cost Per Lead"
            value="$24"
            trend="down"
            trendValue="$3"
            iconBg="#FEF2F2"
            iconColor="#DC2626"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        )}
        {isEnabled("lsa-budget-utilization") && (
          <KpiCard
            title="Budget Utilization"
            value="91%"
            trend="up"
            trendValue="3%"
            iconBg="var(--rtm-blue-light)"
            iconColor="var(--rtm-blue)"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10"
                />
              </svg>
            }
          />
        )}
        {isEnabled("lsa-avg-lead-quality") && (
          <KpiCard
            title="Avg. Lead Quality"
            value="8.2"
            trend="up"
            trendValue="0.4"
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            }
          />
        )}
      </div>

      {/* ── Lead Trend Placeholder ── */}
      <SectionWrapper title="Lead Trend" description="Chart coming soon">
        <div
          className="rounded-xl border flex items-center justify-center h-48"
          style={{
            background: "var(--rtm-bg)",
            borderColor: "var(--rtm-border-light)",
            borderStyle: "dashed",
          }}
        >
          <div className="text-center">
            <span className="text-4xl">⭐</span>
            <p className="text-sm mt-2 font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
              LSA Performance Chart Placeholder
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
              Connect LSA data to display lead and cost trends.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* ════════════════════════════════════════════════════════════════════════
          Lead Quality Section
          ════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Section heading */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2
              className="text-lg font-bold tracking-tight"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              Lead Quality
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
              Call intelligence overview for LSA accounts — illustrative data only.
            </p>
          </div>
          {/* Link to full Call Intelligence page */}
          <Link
            href="/reporting/call-intelligence"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors"
            style={{
              color: "#0F766E",
              background: "#0F766E10",
              borderColor: "#0F766E30",
            }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Full Call Intelligence →
          </Link>
        </div>

        {/* Illustrative data banner — same amber pattern as Reporting › Call Intelligence */}
        <IllustrativeCallDataBanner />

        {/* LSA Service Summary KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border-light)" }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
              Total Calls{" "}
              <span
                className="normal-case font-normal tracking-normal ml-1 px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: "#FDE68A", color: "#92400E" }}
              >
                illustrative
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {LSA_SERVICE_SUMMARY.calls}
            </div>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border-light)" }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
              Qualified Leads{" "}
              <span
                className="normal-case font-normal tracking-normal ml-1 px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: "#FDE68A", color: "#92400E" }}
              >
                illustrative
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: "#059669" }}>
              {LSA_SERVICE_SUMMARY.qualifiedLeads}
            </div>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border-light)" }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
              Booked Leads{" "}
              <span
                className="normal-case font-normal tracking-normal ml-1 px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: "#FDE68A", color: "#92400E" }}
              >
                illustrative
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: "#065F46" }}>
              {LSA_SERVICE_SUMMARY.bookedLeads}
            </div>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border-light)" }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
              Booking Rate{" "}
              <span
                className="normal-case font-normal tracking-normal ml-1 px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: "#FDE68A", color: "#92400E" }}
              >
                illustrative
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: "#059669" }}>
              {LSA_SERVICE_SUMMARY.bookingPct}%
            </div>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border-light)" }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
              Avg Quality Score{" "}
              <span
                className="normal-case font-normal tracking-normal ml-1 px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: "#FDE68A", color: "#92400E" }}
              >
                illustrative
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: "#7C3AED" }}>
              {LSA_SERVICE_SUMMARY.leadQuality}
            </div>
          </div>
        </div>

        {/* Per-client table */}
        <SectionWrapper
          title="LSA Client Lead Quality"
          description="Illustrative call performance for LSA accounts — click a client row to write a real summary note"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                  {[
                    "Client",
                    "Total Calls (Illus.)",
                    "Qualified Leads (Illus.)",
                    "Booked Leads (Illus.)",
                    "Booking %",
                    "Spam %",
                    "Missed Opp.",
                    "Quality Score (Illus.)",
                    "Trend",
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
              <tbody>
                {LSA_CLIENT_ROWS.map((row) => {
                  const isSelected = selectedClientId === row.clientId;
                  return (
                    <tr
                      key={row.clientId}
                      onClick={() =>
                        setSelectedClientId(isSelected ? null : row.clientId)
                      }
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      style={{
                        borderBottom: "1px solid var(--rtm-border-light)",
                        background: isSelected ? "var(--rtm-blue-light)" : undefined,
                      }}
                    >
                      <td
                        className="py-2.5 px-3 font-semibold whitespace-nowrap"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {row.client}
                      </td>
                      <td
                        className="py-2.5 px-3 text-center font-semibold"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {row.totalCalls}
                      </td>
                      <td
                        className="py-2.5 px-3 text-center font-semibold"
                        style={{ color: "#059669" }}
                      >
                        {row.qualifiedLeads}
                      </td>
                      <td
                        className="py-2.5 px-3 text-center font-bold"
                        style={{ color: "#065F46" }}
                      >
                        {row.bookedLeads}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className="text-sm font-bold"
                          style={{
                            color:
                              row.bookingPct >= 70
                                ? "#059669"
                                : row.bookingPct >= 60
                                ? "#D97706"
                                : "#DC2626",
                          }}
                        >
                          {row.bookingPct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className="text-sm font-bold"
                          style={{ color: row.spamPct > 12 ? "#DC2626" : "#64748B" }}
                        >
                          {row.spamPct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className="text-sm font-bold"
                          style={{ color: row.missedOpp > 5 ? "#DC2626" : "#D97706" }}
                        >
                          {row.missedOpp}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex-1 h-2 rounded-full"
                            style={{
                              background: "var(--rtm-border-light)",
                              maxWidth: 60,
                            }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${row.qualityScore}%`,
                                background:
                                  row.qualityScore >= 80
                                    ? "#059669"
                                    : row.qualityScore >= 65
                                    ? "#D97706"
                                    : "#DC2626",
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-bold"
                            style={{
                              color:
                                row.qualityScore >= 80
                                  ? "#059669"
                                  : row.qualityScore >= 65
                                  ? "#D97706"
                                  : "#DC2626",
                            }}
                          >
                            {row.qualityScore}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className="text-sm font-bold"
                          style={{
                            color:
                              row.trend === "up"
                                ? "#059669"
                                : row.trend === "down"
                                ? "#DC2626"
                                : "#D97706",
                          }}
                        >
                          {row.trend === "up" ? "↑" : row.trend === "down" ? "↓" : "→"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs mt-3" style={{ color: "var(--rtm-text-muted)" }}>
            Illustrative data only — figures above are representative sample data, not
            real call-tracking output. Click a client row to write a real, persisted
            summary note for that account.
          </p>
        </SectionWrapper>

        {/* Per-client summary note (real — same API + store as Reporting › Call Intelligence) */}
        {selectedClient ? (
          <div className="space-y-2">
            <div
              className="flex items-center gap-2 px-1"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "#0F766E" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs font-semibold" style={{ color: "#0F766E" }}>
                Real feature — this note is genuinely persisted. The same note appears
                on Reporting › Call Intelligence for this client. Not AI-generated.
              </p>
            </div>
            <ClientSummaryNote
              clientId={selectedClient.clientId}
              clientName={selectedClient.client}
            />
          </div>
        ) : (
          <div
            className="rounded-xl border px-4 py-5 text-center"
            style={{
              borderColor: "var(--rtm-border-light)",
              borderStyle: "dashed",
              background: "var(--rtm-bg-secondary)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
              Click a client row above to write or edit a real, persisted lead-quality
              note for that account.
            </p>
          </div>
        )}

        {/* Link to full Call Intelligence */}
        <div
          className="flex items-center gap-3 rounded-lg border px-4 py-3"
          style={{
            background: "#F0FDF4",
            borderColor: "#86EFAC",
          }}
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "#16A34A" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs flex-1" style={{ color: "#166534" }}>
            For the full call log, per-call breakdowns, sentiment analysis, and all
            service types —{" "}
            <Link
              href="/reporting/call-intelligence"
              className="font-semibold underline underline-offset-2"
              style={{ color: "#16A34A" }}
            >
              open Call Intelligence in Reporting →
            </Link>
          </p>
        </div>
      </div>

      {/* ── Nav links ── */}
      <div className="flex gap-2">
        <Link
          href={workspace.dashboardRoute}
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1"
        >
          ← Dashboard
        </Link>
        <Link
          href={workspace.tasksRoute}
          className="rtm-btn-primary text-sm inline-flex items-center gap-1"
        >
          Tasks →
        </Link>
      </div>
    </div>
  );
}
