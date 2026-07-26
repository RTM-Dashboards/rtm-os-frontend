"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Sales Leads — Date Range Filter
//
// A Sales-specific date-range control following the same established pattern
// as components/seo-local/DateRangeFilter.tsx (separate departmental instance,
// not reaching into Reporting's component).
//
// Uses the shared useDateRangeFilter hook from lib/reporting/useDateRangeFilter
// for state management (it's department-agnostic).
//
// Presets: All Time / Last 7 / Last 30 / Last 90 days + Custom Range.
// Filters Sales Leads by the `createdDate` field (YYYY-MM-DD).
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import type { DateRangePreset } from "@/lib/reporting/useDateRangeFilter";
import { DATE_RANGE_LABELS } from "@/lib/reporting/useDateRangeFilter";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SalesLeadsDateRangeFilterProps {
  dateRange: DateRangePreset;
  setDateRange: (v: DateRangePreset) => void;
  customStart: string;
  setCustomStart: (v: string) => void;
  customEnd: string;
  setCustomEnd: (v: string) => void;
  onReset: () => void;
  /** Number of leads after all filters applied (optional). */
  resultCount?: number;
  /** Total leads before date filtering (optional). */
  totalCount?: number;
  /** Workspace accent color */
  accentColor?: string;
}

// ─── Preset config ────────────────────────────────────────────────────────────

const PRESETS: DateRangePreset[] = ["all", "last7", "last30", "last90", "custom"];

// ─── Component ────────────────────────────────────────────────────────────────

export function SalesLeadsDateRangeFilter({
  dateRange,
  setDateRange,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  onReset,
  resultCount,
  totalCount,
  accentColor = "#1d709f",
}: SalesLeadsDateRangeFilterProps) {
  const isFiltered = dateRange !== "all";
  const isCustom = dateRange === "custom";

  return (
    <div
      className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border"
      style={{
        background: isFiltered ? "#EFF6FF" : "var(--rtm-surface)",
        borderColor: isFiltered ? `${accentColor}40` : "var(--rtm-border)",
      }}
    >
      {/* Label */}
      <span
        className="text-xs font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0"
        style={{ color: isFiltered ? accentColor : "var(--rtm-text-muted)" }}
      >
        Date Range
      </span>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => {
          const active = dateRange === preset;
          return (
            <button
              key={preset}
              onClick={() => setDateRange(preset)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90 whitespace-nowrap"
              style={{
                color: active ? accentColor : "var(--rtm-text-secondary)",
                background: active ? `${accentColor}15` : "transparent",
                borderColor: active ? `${accentColor}40` : "var(--rtm-border)",
              }}
            >
              {DATE_RANGE_LABELS[preset]}
            </button>
          );
        })}
      </div>

      {/* Custom date inputs — shown only when "custom" is selected */}
      {isCustom && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="rounded-lg px-2.5 py-1.5 text-xs border outline-none"
            style={{
              borderColor: "var(--rtm-border)",
              background: "var(--rtm-bg)",
              color: "var(--rtm-text-secondary)",
            }}
            aria-label="Custom range start date"
          />
          <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            →
          </span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="rounded-lg px-2.5 py-1.5 text-xs border outline-none"
            style={{
              borderColor: "var(--rtm-border)",
              background: "var(--rtm-bg)",
              color: "var(--rtm-text-secondary)",
            }}
            aria-label="Custom range end date"
          />
        </div>
      )}

      {/* Result count + Reset */}
      <div className="ml-auto flex items-center gap-2 flex-shrink-0">
        {resultCount !== undefined && totalCount !== undefined && (
          <span
            className="text-xs font-semibold whitespace-nowrap"
            style={{ color: isFiltered ? accentColor : "var(--rtm-text-muted)" }}
          >
            {isFiltered
              ? `${resultCount} of ${totalCount} leads`
              : `${totalCount} leads`}
          </span>
        )}
        {isFiltered && (
          <button
            onClick={onReset}
            className="text-xs font-bold px-2.5 py-1 rounded-lg border"
            style={{
              background: "var(--rtm-bg)",
              color: "var(--rtm-text-muted)",
              borderColor: "var(--rtm-border)",
            }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
