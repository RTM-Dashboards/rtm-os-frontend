"use client";

// ── useDateRangeFilter — shared date-duration filter for all real, timestamped
//    Reporting surfaces.
//
// Presets: Last 7 / 30 / 90 days + Custom Range (calendar inputs).
// The hook owns the state; the DateRangeFilter component (in
// components/reporting/DateRangeFilter.tsx) renders the control.
//
// Usage:
//   const { dateRange, setDateRange, customStart, setCustomStart,
//           customEnd, setCustomEnd, filterByDate } = useDateRangeFilter();
//
//   // Then filter any array of records by a date field:
//   const visible = records.filter((r) => filterByDate(r.createdAt));

import { useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DateRangePreset =
  | "all"
  | "last7"
  | "last30"
  | "last90"
  | "custom";

export interface DateRangeFilterState {
  /** Active preset. "all" means no filtering; "custom" uses customStart/customEnd. */
  dateRange: DateRangePreset;
  /** ISO date string "YYYY-MM-DD" for custom range start (inclusive). */
  customStart: string;
  /** ISO date string "YYYY-MM-DD" for custom range end (inclusive). */
  customEnd: string;
}

export interface UseDateRangeFilterReturn extends DateRangeFilterState {
  setDateRange: (preset: DateRangePreset) => void;
  setCustomStart: (v: string) => void;
  setCustomEnd: (v: string) => void;
  /**
   * Returns true if the given ISO timestamp (or null/undefined) falls within
   * the currently selected date range.  Pass any ISO-8601 string — or a
   * human-readable date string — from your record.
   *
   * When dateRange === "all", always returns true.
   * When the value is null/undefined, returns false (exclude unknown dates).
   */
  filterByDate: (isoValue: string | null | undefined) => boolean;
  /** Reset to "all" (show everything). */
  reset: () => void;
  /** Human-readable label for the current selection (e.g. "Last 30 days"). */
  label: string;
}

// ── Label map ─────────────────────────────────────────────────────────────────

export const DATE_RANGE_LABELS: Record<DateRangePreset, string> = {
  all:    "All Time",
  last7:  "Last 7 Days",
  last30: "Last 30 Days",
  last90: "Last 90 Days",
  custom: "Custom Range",
};

// ── Default state ─────────────────────────────────────────────────────────────

const DEFAULT_STATE: DateRangeFilterState = {
  dateRange: "all",
  customStart: "",
  customEnd: "",
};

// ── Helper: compute effective [from, to] Date objects for the preset ───────────

function computeWindow(
  preset: DateRangePreset,
  customStart: string,
  customEnd: string
): { from: Date | null; to: Date | null } {
  const now = new Date();
  // End of today (23:59:59.999)
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  if (preset === "all") return { from: null, to: null };

  if (preset === "custom") {
    const from = customStart ? new Date(`${customStart}T00:00:00`) : null;
    const to   = customEnd   ? new Date(`${customEnd}T23:59:59.999`) : null;
    return { from, to };
  }

  const days = preset === "last7" ? 7 : preset === "last30" ? 30 : 90;
  const from = new Date(now);
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  return { from, to: todayEnd };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDateRangeFilter(
  initial: DateRangePreset = "all"
): UseDateRangeFilterReturn {
  const [dateRange, setDateRange] = useState<DateRangePreset>(initial);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const filterByDate = useCallback(
    (isoValue: string | null | undefined): boolean => {
      if (dateRange === "all") return true;
      if (!isoValue) return false;

      const ts = new Date(isoValue);
      if (isNaN(ts.getTime())) return false;

      const { from, to } = computeWindow(dateRange, customStart, customEnd);
      if (from && ts < from) return false;
      if (to   && ts > to)   return false;
      return true;
    },
    [dateRange, customStart, customEnd]
  );

  const reset = useCallback(() => {
    setDateRange("all");
    setCustomStart("");
    setCustomEnd("");
  }, []);

  const label =
    dateRange === "custom" && (customStart || customEnd)
      ? `${customStart || "…"} → ${customEnd || "…"}`
      : DATE_RANGE_LABELS[dateRange];

  return {
    dateRange,
    setDateRange,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    filterByDate,
    reset,
    label,
  };
}
