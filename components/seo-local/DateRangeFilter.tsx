"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Shared Date Range Filter
//
// Used by Organic Performance and Local Performance dashboards.
// Provides preset buttons (30 / 60 / 90 days) and a "Custom" mode that
// reveals start/end date pickers.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PresetDays = 30 | 60 | 90;

export type DateRangeMode = "preset" | "custom";

export interface DateRangeState {
  mode: DateRangeMode;
  /** Active when mode === "preset" */
  presetDays: PresetDays;
  /** Active when mode === "custom" */
  customStart: string; // ISO date string "YYYY-MM-DD"
  customEnd: string;   // ISO date string "YYYY-MM-DD"
}

export const DEFAULT_DATE_RANGE: DateRangeState = {
  mode: "preset",
  presetDays: 90,
  customStart: "",
  customEnd: "",
};

export interface DateRangeFilterProps {
  value: DateRangeState;
  onChange: (next: DateRangeState) => void;
  /** Accent color for selected preset buttons */
  accentColor?: string;
  /** Label shown above the control */
  label?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PRESET_OPTIONS: { label: string; value: PresetDays }[] = [
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
];

/**
 * Returns a human-readable summary of the active range, e.g.
 * "Last 90 days" or "May 1 – Jun 30 2025".
 */
export function describeDateRange(dr: DateRangeState): string {
  if (dr.mode === "preset") return `Last ${dr.presetDays} days`;
  if (dr.customStart && dr.customEnd) {
    const fmt = (s: string) => {
      const d = new Date(s + "T00:00:00");
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };
    return `${fmt(dr.customStart)} – ${fmt(dr.customEnd)}`;
  }
  if (dr.customStart) return `From ${dr.customStart}`;
  if (dr.customEnd) return `Until ${dr.customEnd}`;
  return "Custom range";
}

/**
 * Converts the active DateRangeState to a concrete { start, end } Date pair
 * for use in data filtering. Preset is resolved relative to today.
 */
export function resolveDateRange(dr: DateRangeState): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dr.mode === "preset") {
    const start = new Date(today);
    start.setDate(start.getDate() - dr.presetDays + 1);
    return { start, end: today };
  }
  const start = dr.customStart ? new Date(dr.customStart + "T00:00:00") : new Date(today.getFullYear(), 0, 1);
  const end = dr.customEnd ? new Date(dr.customEnd + "T00:00:00") : today;
  return { start, end };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DateRangeFilter({
  value,
  onChange,
  accentColor = "#1d709f",
  label = "Date Range",
}: DateRangeFilterProps) {
  const set = (patch: Partial<DateRangeState>) => onChange({ ...value, ...patch });

  const selectPreset = (days: PresetDays) =>
    set({ mode: "preset", presetDays: days });

  const selectCustom = () =>
    set({ mode: "custom" });

  const isCustom = value.mode === "custom";

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          {label}
        </label>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {/* Preset buttons */}
        <div
          className="flex rounded-lg border overflow-hidden"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          {PRESET_OPTIONS.map((opt, idx) => {
            const isActive = !isCustom && value.presetDays === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => selectPreset(opt.value)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  background: isActive ? accentColor : "var(--rtm-surface)",
                  color: isActive ? "#fff" : "var(--rtm-text-secondary)",
                  borderRight:
                    idx < PRESET_OPTIONS.length - 1
                      ? "1px solid var(--rtm-border)"
                      : "none",
                }}
              >
                {opt.label}
              </button>
            );
          })}

          {/* Custom button */}
          <button
            onClick={selectCustom}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: isCustom ? accentColor : "var(--rtm-surface)",
              color: isCustom ? "#fff" : "var(--rtm-text-secondary)",
              borderLeft: "1px solid var(--rtm-border)",
            }}
          >
            Custom
          </button>
        </div>

        {/* Custom date inputs */}
        {isCustom && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={value.customStart}
              onChange={(e) => set({ customStart: e.target.value })}
              className="text-sm rounded-lg border px-3 py-1.5 focus:outline-none focus:ring-2"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
              aria-label="Custom start date"
            />
            <span className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
              →
            </span>
            <input
              type="date"
              value={value.customEnd}
              onChange={(e) => set({ customEnd: e.target.value })}
              className="text-sm rounded-lg border px-3 py-1.5 focus:outline-none focus:ring-2"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
              aria-label="Custom end date"
            />
            {value.customStart && value.customEnd && (
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "var(--rtm-blue-xlight)",
                  color: accentColor,
                }}
              >
                {describeDateRange(value)}
              </span>
            )}
          </div>
        )}

        {/* Active range summary pill (preset mode) */}
        {!isCustom && (
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{
              background: "var(--rtm-blue-xlight)",
              color: accentColor,
            }}
          >
            {describeDateRange(value)}
          </span>
        )}
      </div>
    </div>
  );
}
