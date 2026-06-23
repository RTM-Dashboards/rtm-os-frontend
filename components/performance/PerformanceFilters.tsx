"use client";

import React, { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type DateRangeOption =
  | "today"| "yesterday"| "last7"| "last14"| "last30"| "thisMonth"| "lastMonth"| "thisQuarter"| "lastQuarter"| "ytd"| "last12months"| "custom";

export type ComparisonMode = "previousPeriod"| "previousYear"| "none";

export interface PerformanceFilterState {
  dateRange: DateRangeOption;
  customStart: string;
  customEnd: string;
  comparison: ComparisonMode;
  client: string;
  location: string;
  campaign: string;
  service: string;
}

export interface PerformanceFiltersProps {
  value: PerformanceFilterState;
  onChange: (next: PerformanceFilterState) => void;
  /** Hide the service filter (e.g. on a single-service page) */
  hideServiceFilter?: boolean;
  /** Hide the campaign filter */
  hideCampaignFilter?: boolean;
  /** Export callbacks — mock by default */
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const DATE_RANGE_LABELS: Record<DateRangeOption, string> = {
  today: "Today",
  yesterday: "Yesterday",
  last7: "Last 7 Days",
  last14: "Last 14 Days",
  last30: "Last 30 Days",
  thisMonth: "This Month",
  lastMonth: "Last Month",
  thisQuarter: "This Quarter",
  lastQuarter: "Last Quarter",
  ytd: "Year To Date",
  last12months: "Last 12 Months",
  custom: "Custom Range",
};

export const COMPARISON_LABELS: Record<ComparisonMode, string> = {
  previousPeriod: "vs Previous Period",
  previousYear: "vs Previous Year",
  none: "No Comparison",
};

export const DEFAULT_FILTERS: PerformanceFilterState = {
  dateRange: "last30",
  customStart: "",
  customEnd: "",
  comparison: "previousPeriod",
  client: "all",
  location: "all",
  campaign: "all",
  service: "all",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function comparisonLabel(range: DateRangeOption, comparison: ComparisonMode): string {
  if (comparison === "none") return "";
  const map: Partial<Record<DateRangeOption, string>> = {
    last30: "vs Previous 30 Days",
    thisMonth: "vs Last Month",
    lastMonth: "vs Month Before",
    thisQuarter: "vs Last Quarter",
    lastQuarter: "vs Quarter Before",
    last7: "vs Previous 7 Days",
    last14: "vs Previous 14 Days",
    last12months: "vs Previous 12 Months",
    ytd: comparison === "previousYear"? "vs Last Year": "vs Previous YTD",
    today: "vs Yesterday",
    yesterday: "vs Day Before",
  };
  if (comparison === "previousYear") return "vs Previous Year";
  return map[range] ?? "vs Previous Period";
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Select({
  value,
  onChange,
  children,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-xs font-medium rounded-lg border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        color: "var(--rtm-text-primary)",
        minWidth: 120,
      }}
    >
      {children}
    </select>
  );
}

function Input({
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="text-xs rounded-lg border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        color: "var(--rtm-text-primary)",
        minWidth: 120,
      }}
    />
  );
}

function ExportBtn({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-medium rounded-lg border px-2.5 py-1.5 transition-colors hover:bg-slate-50 active:scale-95"style={{
        borderColor: "var(--rtm-border)",
        color: "var(--rtm-text-secondary)",
        background: "var(--rtm-surface)",
      }}
      title={`Export ${label}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function PerformanceFilters({
  value,
  onChange,
  hideServiceFilter = false,
  hideCampaignFilter = false,
  onExportCSV,
  onExportExcel,
  onExportPDF,
}: PerformanceFiltersProps) {
  const [showExports, setShowExports] = useState(false);

  const set = <K extends keyof PerformanceFilterState>(
    key: K,
    val: PerformanceFilterState[K]
  ) => onChange({ ...value, [key]: val });

  const mockExport = (format: string) => {
    // Mock export — no real file in this version
    alert(`[Mock] Exporting as ${format}…`);
  };

  const handleCSV = onExportCSV ?? (() => mockExport("CSV"));
  const handleExcel = onExportExcel ?? (() => mockExport("Excel"));
  const handlePDF = onExportPDF ?? (() => mockExport("PDF"));

  const showCustom = value.dateRange === "custom";
  const compLabel = comparisonLabel(value.dateRange, value.comparison);

  return (
    <div
      className="rounded-xl border p-3"style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        boxShadow: "0 1px 3px rgba(15,28,56,0.04)",
      }}
    >
      {/* Row 1 – Date, Comparison, Exports */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>
            Period
          </span>
          <Select
            value={value.dateRange}
            onChange={(v) => set("dateRange", v as DateRangeOption)}
          >
            {(Object.entries(DATE_RANGE_LABELS) as [DateRangeOption, string][]).map(
              ([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              )
            )}
          </Select>
        </div>

        {/* Custom date pickers */}
        {showCustom && (
          <>
            <Input
              type="date"value={value.customStart}
              onChange={(v) => set("customStart", v)}
              placeholder="Start"/>
            <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>→</span>
            <Input
              type="date"value={value.customEnd}
              onChange={(v) => set("customEnd", v)}
              placeholder="End"/>
          </>
        )}

        {/* Comparison */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>
            Compare
          </span>
          <Select
            value={value.comparison}
            onChange={(v) => set("comparison", v as ComparisonMode)}
          >
            <option value="previousPeriod">Previous Period</option>
            <option value="previousYear">Previous Year</option>
            <option value="none">No Comparison</option>
          </Select>
        </div>

        {/* Comparison label pill */}
        {compLabel && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"style={{
              background: "var(--rtm-blue-xlight, #EFF6FF)",
              borderColor: "var(--rtm-blue-light, #DBEAFE)",
              color: "var(--rtm-blue, #2563EB)",
            }}
          >
            {compLabel}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1"/>

        {/* Export toggle */}
        <button
          onClick={() => setShowExports((p) => !p)}
          className="inline-flex items-center gap-1 text-xs font-medium rounded-lg border px-2.5 py-1.5 transition-colors hover:bg-slate-50"style={{
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-secondary)",
            background: "var(--rtm-surface)",
          }}
        >
          <span>⬇</span>
          <span>Export</span>
        </button>

        {showExports && (
          <>
            <ExportBtn label="CSV"icon="CSV"onClick={handleCSV} />
            <ExportBtn label="Excel"icon="XLS"onClick={handleExcel} />
            <ExportBtn label="PDF"icon="PDF"onClick={handlePDF} />
          </>
        )}
      </div>

      {/* Row 2 – Global Filters */}
      <div className="flex flex-wrap items-center gap-2 mt-2 pt-2"style={{ borderTop: "1px solid var(--rtm-border-light)"}}>
        {/* Client */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>
            Client
          </span>
          <Select value={value.client} onChange={(v) => set("client", v)}>
            <option value="all">All Clients</option>
            <option value="apex-roofing">Apex Roofing Co.</option>
            <option value="sunbelt-hvac">Sunbelt HVAC</option>
            <option value="pacific-dental">Pacific Dental</option>
            <option value="summit-landscaping">Summit Landscaping</option>
            <option value="blue-ridge-plumbing">Blue Ridge Plumbing</option>
            <option value="harbor-auto">Harbor Auto Group</option>
            <option value="metro-dental">Metro Dental</option>
          </Select>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>
            Location
          </span>
          <Select value={value.location} onChange={(v) => set("location", v)}>
            <option value="all">All Locations</option>
            <option value="denver">Denver, CO</option>
            <option value="phoenix">Phoenix, AZ</option>
            <option value="san-diego">San Diego, CA</option>
            <option value="asheville">Asheville, NC</option>
          </Select>
        </div>

        {/* Campaign */}
        {!hideCampaignFilter && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>
              Campaign
            </span>
            <Select value={value.campaign} onChange={(v) => set("campaign", v)}>
              <option value="all">All Campaigns</option>
              <option value="storm-season">Storm Season Lead Gen</option>
              <option value="summer-sale">Summer Sale Traffic</option>
              <option value="brand-search">Brand Search</option>
              <option value="new-patient">New Patient Promo</option>
              <option value="spring-services">Spring Services</option>
            </Select>
          </div>
        )}

        {/* Service */}
        {!hideServiceFilter && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>
              Service
            </span>
            <Select value={value.service} onChange={(v) => set("service", v)}>
              <option value="all">All Services</option>
              <option value="seo">SEO</option>
              <option value="gbp">GBP</option>
              <option value="yelp">Yelp</option>
              <option value="meta-ads">Meta Ads</option>
              <option value="google-ads">Google Ads</option>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
