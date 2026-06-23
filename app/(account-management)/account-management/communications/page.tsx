"use client";

import { useState } from "react";
import {
  COMMUNICATIONS,
  AI_CLIENT_INTEL,
  type CommunicationType,
  type SentimentType,
} from "@/lib/account-management/am-client-success-data";

// ── Constants ─────────────────────────────────────────────────────────────────

const COMMUNICATION_TYPES: CommunicationType[] = [
  "Call Summary",
  "Meeting Notes",
  "Client Notes",
  "Email",
  "SMS",
  "Follow-Up",
  "Action Item",
];

const TYPE_COLORS: Record<CommunicationType, string> = {
  "Call Summary":   "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  "Meeting Notes":  "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200",
  "Client Notes":   "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  "Email":          "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
  "SMS":            "bg-teal-100 text-teal-800 ring-1 ring-teal-200",
  "Follow-Up":      "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  "Action Item":    "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
};

const TYPE_DOT: Record<CommunicationType, string> = {
  "Call Summary":   "bg-blue-500",
  "Meeting Notes":  "bg-indigo-500",
  "Client Notes":   "bg-slate-500",
  "Email":          "bg-violet-500",
  "SMS":            "bg-teal-500",
  "Follow-Up":      "bg-amber-500",
  "Action Item":    "bg-orange-500",
};

const SENTIMENT_COLORS: Record<SentimentType, string> = {
  Positive: "bg-green-100 text-green-800 ring-1 ring-green-200",
  Neutral:  "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  Negative: "bg-red-100 text-red-800 ring-1 ring-red-200",
  Mixed:    "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
};

const SENTIMENT_DOT: Record<SentimentType, string> = {
  Positive: "bg-green-500",
  Neutral:  "bg-slate-400",
  Negative: "bg-red-500",
  Mixed:    "bg-amber-500",
};

// ── KPI helpers ───────────────────────────────────────────────────────────────

function computeKPIs() {
  const total = COMMUNICATIONS.length;
  const followUpsPending = COMMUNICATIONS.filter((c) => c.followUpRequired).length;
  const openConcerns = COMMUNICATIONS.reduce((sum, c) => sum + c.openConcerns.length, 0);
  const negativeSentiment = COMMUNICATIONS.filter((c) => c.sentiment === "Negative").length;
  const actionItems = COMMUNICATIONS.reduce((sum, c) => sum + c.actionItems.length, 0);
  return { total, followUpsPending, openConcerns, negativeSentiment, actionItems };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex flex-col gap-1 min-w-0">
      <span className={`text-2xl font-bold ${accent ?? "text-gray-900"}`}>{value}</span>
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
        {label}
      </span>
    </div>
  );
}

function TypeBadge({ type }: { type: CommunicationType }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[type]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${TYPE_DOT[type]}`} />
      {type}
    </span>
  );
}

function SentimentBadge({ sentiment }: { sentiment: SentimentType }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${SENTIMENT_COLORS[sentiment]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${SENTIMENT_DOT[sentiment]}`} />
      {sentiment}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric"});
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CommunicationsPage() {
  const [activeFilter, setActiveFilter] = useState<"All"| CommunicationType>("All");

  const kpis = computeKPIs();

  const filtered =
    activeFilter === "All"? COMMUNICATIONS
      : COMMUNICATIONS.filter((c) => c.type === activeFilter);

  // Sort by date descending (most recent first)
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Client Communications
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Complete log of client interactions, follow-ups, and open concerns.
            </p>
          </div>
          <span className="text-xs text-gray-400 mt-1 whitespace-nowrap">
            {COMMUNICATIONS.length} entries
          </span>
        </div>

        {/* ── KPI Row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KPICard label="Total Communications"value={kpis.total} accent="text-gray-900"/>
          <KPICard label="Follow-Ups Pending"value={kpis.followUpsPending} accent="text-amber-600"/>
          <KPICard label="Open Concerns"value={kpis.openConcerns} accent="text-orange-600"/>
          <KPICard label="Negative Sentiment"value={kpis.negativeSentiment} accent="text-red-600"/>
          <KPICard label="Action Items"value={kpis.actionItems} accent="text-indigo-600"/>
        </div>

        {/* ── Type Filter Tabs ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {(["All", ...COMMUNICATION_TYPES] as Array<"All"| CommunicationType>).map(
            (tab) => {
              const isActive = activeFilter === tab;
              const dot = tab !== "All"? TYPE_DOT[tab as CommunicationType] : null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm": "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {dot && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? "bg-white opacity-80": dot
                      }`}
                    />
                  )}
                  {tab}
                  <span
                    className={`text-xs rounded-full px-1.5 py-0 font-semibold ${
                      isActive
                        ? "bg-white/20 text-white": "bg-gray-200 text-gray-500"}`}
                  >
                    {tab === "All"? COMMUNICATIONS.length
                      : COMMUNICATIONS.filter((c) => c.type === tab).length}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* ── Communication Timeline ───────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Communication Timeline
          </h2>

          {sorted.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No communications match the selected filter.
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-gray-300 transition-colors">
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <TypeBadge type={entry.type} />
                      <SentimentBadge sentiment={entry.sentiment} />
                      {entry.followUpRequired && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                          <svg className="w-3 h-3"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth={2.5}>
                            <path strokeLinecap="round"strokeLinejoin="round"d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          Follow-up{entry.followUpDate ? ` · ${formatDate(entry.followUpDate)}` : ""}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium shrink-0">
                      {formatDate(entry.date)}
                    </span>
                  </div>

                  {/* Client + AM + Subject */}
                  <div className="mt-3 space-y-0.5">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-bold text-gray-900">{entry.client}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-sm text-gray-500">{entry.accountManager}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{entry.subject}</p>
                  </div>

                  {/* Summary */}
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{entry.summary}</p>

                  {/* Action Items */}
                  {entry.actionItems.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5">
                        Action Items
                      </p>
                      <ul className="space-y-1">
                        {entry.actionItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"/>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Open Concerns */}
                  {entry.openConcerns.length > 0 && (
                    <div className="mt-3 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
                      <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1.5">
                        Open Concerns
                      </p>
                      <ul className="space-y-1">
                        {entry.openConcerns.map((concern, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-red-700">
                            <svg
                              className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-500"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth={2.5}
                            >
                              <path
                                strokeLinecap="round"strokeLinejoin="round"d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                            </svg>
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── AI Communication Intelligence ────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-4 h-4 text-indigo-500"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth={2}
            >
              <path
                strokeLinecap="round"strokeLinejoin="round"d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
            </svg>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
              AI Communication Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_CLIENT_INTEL.map((intel) => (
              <div
                key={intel.clientId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-gray-300 transition-colors">
                {/* Intel Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{intel.client}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Last contact: {formatDate(intel.lastCommunication)}
                    </p>
                  </div>
                  <SentimentBadge sentiment={intel.sentiment} />
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-1.5 bg-amber-50 rounded-lg px-3 py-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-amber-500"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth={2}
                    >
                      <path strokeLinecap="round"strokeLinejoin="round"d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className="text-xs font-semibold text-amber-700">
                      {intel.pendingFollowUps} follow-up{intel.pendingFollowUps !== 1 ? "s": ""} pending
                    </span>
                  </div>
                  {intel.openConcerns.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-red-50 rounded-lg px-3 py-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-red-500"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"strokeLinejoin="round"d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.05 3.378c.866-1.5 3.032-1.5 3.898 0L21.303 16.126zM12 15.75h.007v.008H12v-.008z"/>
                      </svg>
                      <span className="text-xs font-semibold text-red-700">
                        {intel.openConcerns.length} open concern{intel.openConcerns.length !== 1 ? "s": ""}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Open Concerns */}
                  {intel.openConcerns.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
                        Open Concerns
                      </p>
                      <ul className="space-y-0.5">
                        {intel.openConcerns.map((c, i) => (
                          <li key={i} className="text-sm text-red-700 flex items-start gap-1.5">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"/>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Renewal Signals */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Renewal Signal
                    </p>
                    <p className="text-sm text-gray-700">{intel.renewalSignals}</p>
                  </div>

                  {/* Upsell Signals */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Upsell Signal
                    </p>
                    <p className="text-sm text-gray-700">{intel.upsellSignals}</p>
                  </div>

                  {/* Growth Opportunities */}
                  {intel.growthOpportunities.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                        Growth Opportunities
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {intel.growthOpportunities.map((opp, i) => (
                          <span
                            key={i}
                            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-800 ring-1 ring-green-200">
                            {opp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
