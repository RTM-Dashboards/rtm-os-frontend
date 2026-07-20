"use client";

// ── DateRangeFilter — shared date-range control for all real Reporting surfaces
//
// Renders preset buttons (All / Last 7 / Last 30 / Last 90 days) + a
// "Custom Range" section with two date inputs that expands inline.
//
// Designed to be dropped into any Reporting page or tab.  State is managed
// externally via useDateRangeFilter(); this component is purely presentational.
//
// Props:
//   dateRange, setDateRange    — active preset + setter
//   customStart, setCustomStart
//   customEnd, setCustomEnd
//   label                      — human-readable current selection (optional, for
//                                use in parent context)
//   resultCount                — optional "X records shown" count to display
//   totalCount                 — optional total before filtering

import type { DateRangePreset } from "@/lib/reporting/useDateRangeFilter";
import { DATE_RANGE_LABELS } from "@/lib/reporting/useDateRangeFilter";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface DateRangeFilterProps {
  dateRange: DateRangePreset;
  setDateRange: (v: DateRangePreset) => void;
  customStart: string;
  setCustomStart: (v: string) => void;
  customEnd: string;
  setCustomEnd: (v: string) => void;
  /** Number of records after filter (optional). */
  resultCount?: number;
  /** Total records before filter (optional). */
  totalCount?: number;
  /** Extra className for the outer wrapper. */
  className?: string;
}

// ── Preset buttons config ─────────────────────────────────────────────────────

const PRESETS: DateRangePreset[] = ["all", "last7", "last30", "last90", "custom"];

// ── Component ─────────────────────────────────────────────────────────────────

export function DateRangeFilter({
  dateRange,
  setDateRange,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  resultCount,
  totalCount,
  className = "",
}: DateRangeFilterProps) {
  const isFiltered = dateRange !== "all";

  return (
    <div
      className={`flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border ${className}`}
      style={{
        background: isFiltered ? "#EFF6FF" : "var(--rtm-bg-secondary)",
        borderColor: isFiltered ? "#2563EB40" : "var(--rtm-border-light)",
      }}
    >
      {/* Label */}
      <span
        className="text-xs font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0"
        style={{ color: isFiltered ? "#1D4ED8" : "var(--rtm-text-muted)" }}
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
                color: active ? "#2563EB" : "var(--rtm-text-secondary)",
                background: active ? "#2563EB15" : "transparent",
                borderColor: active ? "#2563EB40" : "var(--rtm-border-light)",
              }}
            >
              {DATE_RANGE_LABELS[preset]}
            </button>
          );
        })}
      </div>

      {/* Custom range inputs — shown only when "custom" is selected */}
      {dateRange === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="rounded-lg px-2.5 py-1.5 text-xs border outline-none"
            style={{
              borderColor: "var(--rtm-border-light)",
              background: "var(--rtm-bg-secondary)",
              color: "var(--rtm-text-secondary)",
            }}
            aria-label="Custom range start date"
          />
          <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>→</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="rounded-lg px-2.5 py-1.5 text-xs border outline-none"
            style={{
              borderColor: "var(--rtm-border-light)",
              background: "var(--rtm-bg-secondary)",
              color: "var(--rtm-text-secondary)",
            }}
            aria-label="Custom range end date"
          />
        </div>
      )}

      {/* Result count */}
      {resultCount !== undefined && totalCount !== undefined && (
        <span
          className="ml-auto text-xs font-semibold whitespace-nowrap"
          style={{ color: isFiltered ? "#1D4ED8" : "var(--rtm-text-muted)" }}
        >
          {isFiltered
            ? `${resultCount} of ${totalCount} records`
            : `${totalCount} records`}
        </span>
      )}
    </div>
  );
}
