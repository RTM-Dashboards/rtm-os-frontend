"use client";

import React, { useState } from "react";
import { LAUNCH_RECORDS, AI_LAUNCH_SUMMARY } from "@/lib/activation-data";
import type { LaunchRecord, LaunchStatus } from "@/types/activation";
import LaunchStatusBadge from "./LaunchStatusBadge";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_FILTER_OPTIONS: (LaunchStatus | "All")[] = [
  "All",
  "Upcoming",
  "Launching",
  "Onboarding",
  "Blocked",
  "Delayed",
  "Active",
];

function ProgressBar({ pct }: { pct: number }) {
  const color = pct === 100 ? "#10B981" : pct >= 60 ? "var(--rtm-blue)" : pct >= 30 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--rtm-border)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

function LaunchCard({ record }: { record: LaunchRecord }) {
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: "var(--rtm-text-primary)" }}>
            {record.client}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {record.id}
          </p>
        </div>
        <LaunchStatusBadge status={record.launchStatus} size="sm" />
      </div>

      {/* Services */}
      <div className="flex flex-wrap gap-1">
        {record.services.map((s) => (
          <span
            key={s}
            className="text-[11px] font-semibold px-1.5 py-0.5 rounded border"
            style={{ background: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", borderColor: "var(--rtm-blue-light)" }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Progress */}
      <ProgressBar pct={record.completionPercent} />

      {/* Info row */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
            Launch Date
          </p>
          <p className="text-xs font-medium mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
            {formatDate(record.launchDate)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
            Project Manager
          </p>
          <p className="text-xs font-medium mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
            {record.projectManager}
          </p>
        </div>
      </div>

      {/* Blockers */}
      {record.blockers.length > 0 && (
        <div
          className="rounded-lg px-3 py-2"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#DC2626" }}>
            Blockers
          </p>
          <ul className="space-y-0.5">
            {record.blockers.map((b) => (
              <li key={b} className="text-xs flex items-center gap-1.5" style={{ color: "#991B1B" }}>
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#EF4444" }} />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AISummarySection() {
  const s = AI_LAUNCH_SUMMARY;
  const sections = [
    { title: "Launch Risks", items: s.launchRisks, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    { title: "Missing Requirements", items: s.missingRequirements, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    { title: "Pending Assignments", items: s.pendingAssignments, color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    { title: "Billing Issues", items: s.billingIssues, color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    { title: "Recommended Actions", items: s.recommendedActions, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  ];

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)" }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-4"
        style={{ color: "var(--rtm-blue)" }}
      >
        AI Launch Summary
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map(({ title, items, color, bg, border }) => (
          <div
            key={title}
            className="rounded-lg p-3"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color }}>
              {title}
            </p>
            <ul className="space-y-1.5">
              {items.map((item) => (
                <li key={item} className="text-xs flex items-start gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
                    style={{ background: color }}
                  />
                  <span style={{ color: "var(--rtm-text-primary)" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LaunchCenter() {
  const [statusFilter, setStatusFilter] = useState<LaunchStatus | "All">("All");

  const filtered =
    statusFilter === "All"
      ? LAUNCH_RECORDS
      : LAUNCH_RECORDS.filter((r) => r.launchStatus === statusFilter);

  const grouped: Record<string, LaunchRecord[]> = {};
  filtered.forEach((r) => {
    if (!grouped[r.launchStatus]) grouped[r.launchStatus] = [];
    grouped[r.launchStatus].push(r);
  });

  const SECTION_ORDER: LaunchStatus[] = ["Blocked", "Delayed", "Launching", "Upcoming", "Onboarding", "Active"];

  const blockedCount = LAUNCH_RECORDS.filter((r) => r.launchStatus === "Blocked").length;
  const delayedCount = LAUNCH_RECORDS.filter((r) => r.launchStatus === "Delayed").length;
  const launchingCount = LAUNCH_RECORDS.filter((r) => r.launchStatus === "Launching").length;
  const upcomingCount = LAUNCH_RECORDS.filter((r) => r.launchStatus === "Upcoming").length;

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Upcoming Launches", value: upcomingCount,  color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
          { label: "Actively Launching",value: launchingCount, color: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE" },
          { label: "Blocked Launches",  value: blockedCount,   color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
          { label: "Delayed Launches",  value: delayedCount,   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
        ].map(({ label, value, color, bg, border }) => (
          <div
            key={label}
            className="rounded-xl p-4 text-center"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            <p className="text-2xl font-bold" style={{ color }}>
              {value}
            </p>
            <p className="text-xs font-semibold mt-1" style={{ color }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      <AISummarySection />

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTER_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
            style={
              statusFilter === s
                ? { background: "var(--rtm-blue)", color: "#fff", borderColor: "var(--rtm-blue)" }
                : { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }
            }
          >
            {s}
            {s !== "All" && (
              <span className="ml-1.5 opacity-70">
                ({LAUNCH_RECORDS.filter((r) => r.launchStatus === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grouped launch cards */}
      {SECTION_ORDER.filter((st) => grouped[st] && grouped[st].length > 0).map((st) => (
        <div key={st}>
          <div className="flex items-center gap-2 mb-3">
            <LaunchStatusBadge status={st} />
            <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
              {grouped[st].length} project{grouped[st].length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {grouped[st].map((r) => (
              <LaunchCard key={r.id} record={r} />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: "var(--rtm-text-muted)" }}>
          No launches match the selected filter.
        </p>
      )}
    </div>
  );
}
