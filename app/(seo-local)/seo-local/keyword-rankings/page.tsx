"use client";

// ─────────────────────────────────────────────────────────────────────────────
// SEO & Local — Keyword Rankings
//
// Dedicated per-keyword ranking breakdown page. For a selected client, shows
// EVERY individually tracked keyword with:
//   • Current organic SERP position
//   • Position change over the selected date window
//   • Estimated monthly search volume
//   • Ranking URL (page that ranks for the keyword)
//   • A per-row sparkline showing that keyword's rank trend
//   • Click-to-expand detail panel with a fuller historical rank chart
//
// IMPORTANT: All keyword rank positions, search volumes, and ranking URLs
// shown here are REPRESENTATIVE / ILLUSTRATIVE sample data. No Google Search
// Console, third-party rank-tracking API, or live crawl data is connected.
// Numbers are realistic-looking stand-ins designed to demonstrate the page
// structure. Connect a real rank-tracking integration to replace them with
// live data.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { useState, useMemo } from "react";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import DateRangeFilter, {
  DEFAULT_DATE_RANGE,
  describeDateRange,
} from "@/components/seo-local/DateRangeFilter";
import type { DateRangeState } from "@/components/seo-local/DateRangeFilter";

const workspace = getWorkspace("seo-local")!;
const ACCENT = workspace.accentColor ?? "#1d709f";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KeywordWeek {
  /** ISO week label, e.g. "W1" .. "W13" */
  week: string;
  /** Organic SERP position (1 = top result; 0 = not ranking / >100) */
  position: number;
}

interface TrackedKeyword {
  id: string;
  keyword: string;
  /** Current organic position (end of selected window) */
  currentPosition: number;
  /** Position change over selected window: negative = improved (moved up) */
  positionChange: number;
  /** Estimated monthly search volume */
  searchVolume: number;
  /** The page on the client's site that ranks for this keyword */
  rankingUrl: string;
  /** 13-week rank history — sliced by date window */
  weeks: KeywordWeek[];
  /** Keyword intent tag */
  intent: "brand" | "local" | "service" | "informational";
}

interface ClientKeywordData {
  id: string;
  name: string;
  domain: string;
  keywords: TrackedKeyword[];
}

// ─── Data generators ─────────────────────────────────────────────────────────

function makeKwWeeks(
  startPos: number,
  endPos: number,
  noise: number = 1.2,
  n = 13,
): KeywordWeek[] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const base = startPos + (endPos - startPos) * t;
    // Deterministic noise via index seed
    const noiseVal = (((i * 13 + 7) % 7) - 3) * noise;
    const pos = Math.max(1, Math.round(base + noiseVal));
    return { week: `W${i + 1}`, position: pos };
  });
}

// ─── Dataset ─────────────────────────────────────────────────────────────────
// No invented data. Connect a real rank-tracking integration to populate this.

const ALL_CLIENTS: ClientKeywordData[] = [];

// ─── Week count from DateRangeState ──────────────────────────────────────────

function weeksFromDateRange(dr: DateRangeState): number {
  if (dr.mode === "preset") {
    if (dr.presetDays === 30) return 4;
    if (dr.presetDays === 60) return 9;
    return 13;
  }
  if (dr.customStart && dr.customEnd) {
    const start = new Date(dr.customStart + "T00:00:00");
    const end = new Date(dr.customEnd + "T00:00:00");
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return Math.min(13, Math.max(1, Math.ceil(diffDays / 7)));
  }
  return 13;
}

// ─── Derive position change from sliced window ────────────────────────────────

function slicedChange(weeks: KeywordWeek[], n: number): number {
  const sliced = weeks.slice(weeks.length - n);
  if (sliced.length < 2) return 0;
  const delta = sliced[sliced.length - 1].position - sliced[0].position;
  return Math.round(delta * 10) / 10;
}

// ─── Position badge color tiers ───────────────────────────────────────────────

function positionTier(pos: number): { bg: string; color: string } {
  if (pos <= 3)  return { bg: "#ECFDF5", color: "#059669" };
  if (pos <= 10) return { bg: "#FFFBEB", color: "#D97706" };
  if (pos <= 20) return { bg: "var(--rtm-blue-xlight)", color: ACCENT };
  return { bg: "#FEF2F2", color: "#DC2626" };
}

// ─── Intent badge ─────────────────────────────────────────────────────────────

function IntentBadge({ intent }: { intent: TrackedKeyword["intent"] }) {
  const map: Record<TrackedKeyword["intent"], { label: string; bg: string; color: string }> = {
    brand:         { label: "Brand",         bg: "#F5F3FF", color: "#7C3AED" },
    local:         { label: "Local",         bg: "#ECFDF5", color: "#059669" },
    service:       { label: "Service",       bg: "var(--rtm-blue-xlight)", color: ACCENT },
    informational: { label: "Informational", bg: "#FFFBEB", color: "#D97706" },
  };
  const { label, bg, color } = map[intent];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

// ─── Position change badge ─────────────────────────────────────────────────────

function ChangeBadge({ change }: { change: number }) {
  if (change === 0)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
        style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}>
        —
      </span>
    );
  const improved = change < 0; // negative = moved up = improved
  const bg = improved ? "#ECFDF5" : "#FEF2F2";
  const color = improved ? "#059669" : "#DC2626";
  const icon = improved ? "↑" : "↓";
  const label = improved ? `${icon} ${Math.abs(change)}` : `${icon} +${change}`;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: bg, color }}>
      {label}
    </span>
  );
}

// ─── Volume formatter ─────────────────────────────────────────────────────────

function fmtVol(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return v.toString();
}

// ─── Sparkline (per-row mini SVG chart) ──────────────────────────────────────

interface SparklineProps {
  data: number[];
  /** When true, lower values sit visually higher (rank improvement = up) */
  invertY?: boolean;
  color?: string;
  width?: number;
  height?: number;
}

function Sparkline({ data, invertY = true, color = ACCENT, width = 80, height = 28 }: SparklineProps) {
  if (data.length < 2) return null;
  const padX = 2;
  const padY = 2;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const toX = (i: number) => padX + (i / (data.length - 1)) * innerW;
  const toY = (v: number) => {
    const n = (v - min) / range; // 0..1
    return invertY
      ? padY + n * innerH         // lower rank = top of chart
      : padY + (1 - n) * innerH;
  };

  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const improved = data[data.length - 1] < data[0]; // position number went down = improved
  const lineColor = improved ? "#059669" : color;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Start dot */}
      <circle cx={toX(0)} cy={toY(data[0])} r={2} fill={lineColor} opacity={0.5} />
      {/* End dot */}
      <circle cx={toX(data.length - 1)} cy={toY(data[data.length - 1])} r={2.5} fill={lineColor} />
    </svg>
  );
}

// ─── Full detail chart (SVG, wider) ──────────────────────────────────────────

interface DetailChartProps {
  weeks: KeywordWeek[];
  accentColor?: string;
  height?: number;
}

function DetailChart({ weeks, accentColor = ACCENT, height = 160 }: DetailChartProps) {
  if (weeks.length < 2) return null;

  const W = 480;
  const H = height;
  const padL = 32;
  const padR = 10;
  const padT = 12;
  const padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const data = weeks.map((w) => w.position);
  const labels = weeks.map((w) => w.week);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const toX = (i: number) => padL + (i / (data.length - 1)) * innerW;
  // lower position number = higher up (better) = lower Y
  const toY = (v: number) => padT + ((v - min) / range) * innerH;

  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

  const areaPath =
    `M ${toX(0)},${toY(data[0])} ` +
    data.slice(1).map((v, i) => `L ${toX(i + 1)},${toY(v)}`).join(" ") +
    ` L ${toX(data.length - 1)},${H - padB} L ${toX(0)},${H - padB} Z`;

  // Y ticks — 4 evenly spaced
  const yTicks = [0, 0.33, 0.67, 1].map((t) => ({
    val: min + t * range,
    y: padT + t * innerH,
  }));

  const step = data.length <= 5 ? 1 : data.length <= 9 ? 2 : 3;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} aria-hidden="true">
      {/* Grid lines + Y labels */}
      {yTicks.map(({ val, y }, idx) => (
        <g key={idx}>
          <line x1={padL} y1={y} x2={W - padR} y2={y}
            stroke="var(--rtm-border-light)" strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={8}
            fill="var(--rtm-text-muted)">
            #{Math.round(val)}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={accentColor} opacity={0.08} />

      {/* Line */}
      <polyline points={points} fill="none" stroke={accentColor}
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {data.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill={accentColor} />
      ))}

      {/* X labels */}
      {labels.map((lbl, i) => {
        if (i % step !== 0 && i !== labels.length - 1) return null;
        return (
          <text key={i} x={toX(i)} y={H - 6} textAnchor="middle"
            fontSize={7.5} fill="var(--rtm-text-muted)">
            {lbl}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Sort types ───────────────────────────────────────────────────────────────

type SortField = "keyword" | "position" | "change" | "volume";
type SortDir = "asc" | "desc";

// ─── Honest data banner ───────────────────────────────────────────────────────

function RepresentativeDataBanner() {
  return (
    <div
      className="flex items-start gap-3 p-3.5 rounded-xl border"
      style={{ background: "var(--rtm-blue-xlight)", borderColor: "var(--rtm-blue-light)" }}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--rtm-blue-dark)" }}>
          Representative data — not live Search Console or rank-tracking data
        </p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--rtm-blue)", opacity: 0.85 }}>
          All keyword positions, position changes, search volumes, and ranking URLs shown here are{" "}
          <strong>illustrative sample data</strong> designed to demonstrate the dashboard structure.
          Connect Google Search Console, Google Analytics, or a rank-tracking API (e.g. Semrush,
          Ahrefs, BrightLocal) to replace these with live metrics.
        </p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function KeywordRankingsPage() {
  const [selectedId, setSelectedId]     = useState<string>(ALL_CLIENTS[0]?.id ?? "");
  const [dateRange, setDateRange]       = useState<DateRangeState>(DEFAULT_DATE_RANGE);
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [sortField, setSortField]       = useState<SortField>("position");
  const [sortDir, setSortDir]           = useState<SortDir>("asc");
  const [intentFilter, setIntentFilter] = useState<TrackedKeyword["intent"] | "all">("all");
  const [search, setSearch]             = useState("");

  const client = ALL_CLIENTS.find((c) => c.id === selectedId) ?? null;
  const numWeeks = weeksFromDateRange(dateRange);
  const rangeLabel = describeDateRange(dateRange);

  // ── Derive display keyword list with sliced position change ──────────────
  const displayKeywords: (TrackedKeyword & { windowChange: number; slicedWeeks: KeywordWeek[] })[] =
    useMemo(() => {
      if (!client) return [];
      return client.keywords.map((kw) => {
        const slicedWeeks = kw.weeks.slice(kw.weeks.length - numWeeks);
        const windowChange = slicedChange(kw.weeks, numWeeks);
        return { ...kw, windowChange, slicedWeeks };
      });
    }, [client, numWeeks]);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return displayKeywords.filter((kw) => {
      if (intentFilter !== "all" && kw.intent !== intentFilter) return false;
      if (search.trim() && !kw.keyword.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [displayKeywords, intentFilter, search]);

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "keyword")  cmp = a.keyword.localeCompare(b.keyword);
      if (sortField === "position") cmp = a.currentPosition - b.currentPosition;
      if (sortField === "change")   cmp = a.windowChange - b.windowChange;
      if (sortField === "volume")   cmp = a.searchVolume - b.searchVolume;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "keyword" ? "asc" : "asc");
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) =>
    sortField === field ? (
      <span className="ml-0.5 opacity-60">{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : null;

  // ── Summary KPIs ─────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const all = displayKeywords;
    const top3  = all.filter((k) => k.currentPosition <= 3).length;
    const top10 = all.filter((k) => k.currentPosition <= 10).length;
    const top20 = all.filter((k) => k.currentPosition <= 20).length;
    const improved = all.filter((k) => k.windowChange < 0).length;
    const avgPos = all.length
      ? Math.round((all.reduce((s, k) => s + k.currentPosition, 0) / all.length) * 10) / 10
      : 0;
    return { total: all.length, top3, top10, top20, improved, avgPos };
  }, [displayKeywords]);

  // ── Client change handler ─────────────────────────────────────────────────
  const handleClientChange = (id: string) => {
    setSelectedId(id);
    setExpandedId(null);
    setSearch("");
    setIntentFilter("all");
  };

  // ── Expanded keyword ──────────────────────────────────────────────────────
  const expandedKw = expandedId
    ? displayKeywords.find((k) => k.id === expandedId)
    : null;

  if (ALL_CLIENTS.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: ACCENT }}>{workspace.name}</p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Keyword Rankings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Individual keyword rank tracking.</p>
        </div>
        <div className="rounded-xl border px-4 py-10 text-center" style={{ borderColor: "var(--rtm-border-light)", borderStyle: "dashed", background: "var(--rtm-bg)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>No keyword tracking data yet</p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Connect a rank-tracking integration to see per-keyword positions, trends, and history. Layout and controls are ready.</p>
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="space-y-6">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: ACCENT }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--rtm-text-primary)" }}>
          Keyword Rankings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Individual keyword rank tracking — every tracked keyword with its position, change,
          search volume, ranking URL, and trend history.
        </p>
      </div>

      {/* ── Honest data banner ────────────────────────────────────────────── */}
      <RepresentativeDataBanner />

      {/* ── Selectors row ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Client selector */}
        <div className="flex flex-col gap-1 min-w-[220px]">
          <label className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--rtm-text-muted)" }}>
            Client
          </label>
          <select
            value={selectedId}
            onChange={(e) => handleClientChange(e.target.value)}
            className="text-sm rounded-lg border px-3 py-2 pr-8"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
              appearance: "auto",
            }}
          >
            {ALL_CLIENTS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Shared date-range filter */}
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          accentColor={ACCENT}
          label="Date Range"
        />

        {/* Domain badge */}
        <div className="flex items-center pb-0.5">
          <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
            style={{ background: "var(--rtm-blue-xlight)", color: ACCENT }}>
            {client.domain}
          </span>
        </div>
      </div>

      {/* ── KPI summary cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          {
            label: "Total Keywords",
            value: kpis.total,
            sub: "tracked",
            color: ACCENT,
            bg: "var(--rtm-blue-xlight)",
          },
          {
            label: "Top 3",
            value: kpis.top3,
            sub: `of ${kpis.total}`,
            color: "#059669",
            bg: "#ECFDF5",
          },
          {
            label: "Top 10",
            value: kpis.top10,
            sub: `of ${kpis.total}`,
            color: "#D97706",
            bg: "#FFFBEB",
          },
          {
            label: "Top 20",
            value: kpis.top20,
            sub: `of ${kpis.total}`,
            color: ACCENT,
            bg: "var(--rtm-blue-xlight)",
          },
          {
            label: "Improved",
            value: kpis.improved,
            sub: `over ${rangeLabel}`,
            color: "#059669",
            bg: "#ECFDF5",
          },
          {
            label: "Avg Position",
            value: `#${kpis.avgPos}`,
            sub: "across all kws",
            color: kpis.avgPos <= 10 ? "#059669" : kpis.avgPos <= 20 ? ACCENT : "#DC2626",
            bg: kpis.avgPos <= 10 ? "#ECFDF5" : kpis.avgPos <= 20 ? "var(--rtm-blue-xlight)" : "#FEF2F2",
          },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className="rounded-xl border p-3.5 flex flex-col gap-0.5"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Keyword table section ──────────────────────────────────────────── */}
      <SectionWrapper
        title={`${client.name} — All Tracked Keywords`}
        description={`${kpis.total} keywords · ${rangeLabel} · representative data`}
      >
        {/* ── Filter/search bar ──────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          {/* Keyword search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter keywords…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm rounded-lg border pl-8 pr-3 py-1.5 w-52 focus:outline-none"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            />
            <svg className="absolute left-2.5 top-2 w-3.5 h-3.5" fill="none"
              stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: "var(--rtm-text-muted)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
          </div>

          {/* Intent filter */}
          <div className="flex rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--rtm-border)" }}>
            {(["all", "local", "service", "informational", "brand"] as const).map((v, idx, arr) => (
              <button
                key={v}
                onClick={() => setIntentFilter(v)}
                className="px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors"
                style={{
                  background: intentFilter === v ? ACCENT : "var(--rtm-surface)",
                  color: intentFilter === v ? "#fff" : "var(--rtm-text-secondary)",
                  borderRight: idx < arr.length - 1 ? "1px solid var(--rtm-border)" : "none",
                }}
              >
                {v === "all" ? "All" : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Results count */}
          <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
            {sorted.length} of {kpis.total} keywords
          </span>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border)" }}>
                {/* Keyword */}
                <th
                  className="text-left pb-2 pr-3 text-[11px] font-bold uppercase tracking-widest cursor-pointer select-none"
                  style={{ color: "var(--rtm-text-muted)", minWidth: 200 }}
                  onClick={() => handleSort("keyword")}
                >
                  Keyword <SortIndicator field="keyword" />
                </th>
                {/* Intent */}
                <th className="text-left pb-2 pr-3 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--rtm-text-muted)" }}>
                  Intent
                </th>
                {/* Current position */}
                <th
                  className="text-left pb-2 pr-3 text-[11px] font-bold uppercase tracking-widest cursor-pointer select-none"
                  style={{ color: "var(--rtm-text-muted)" }}
                  onClick={() => handleSort("position")}
                >
                  Position <SortIndicator field="position" />
                </th>
                {/* Change */}
                <th
                  className="text-left pb-2 pr-3 text-[11px] font-bold uppercase tracking-widest cursor-pointer select-none"
                  style={{ color: "var(--rtm-text-muted)" }}
                  onClick={() => handleSort("change")}
                >
                  Change <SortIndicator field="change" />
                </th>
                {/* Volume */}
                <th
                  className="text-left pb-2 pr-3 text-[11px] font-bold uppercase tracking-widest cursor-pointer select-none"
                  style={{ color: "var(--rtm-text-muted)" }}
                  onClick={() => handleSort("volume")}
                >
                  Vol/mo <SortIndicator field="volume" />
                </th>
                {/* Ranking URL */}
                <th className="text-left pb-2 pr-3 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--rtm-text-muted)", minWidth: 180 }}>
                  Ranking URL
                </th>
                {/* Sparkline */}
                <th className="text-left pb-2 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--rtm-text-muted)" }}>
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((kw, idx) => {
                const { bg, color } = positionTier(kw.currentPosition);
                const isExpanded = expandedId === kw.id;

                return (
                  <>
                    <tr
                      key={kw.id}
                      onClick={() => setExpandedId(isExpanded ? null : kw.id)}
                      className="cursor-pointer transition-colors group"
                      style={{
                        borderBottom: "1px solid var(--rtm-border-light)",
                        background: isExpanded ? "var(--rtm-blue-xlight)" : "transparent",
                      }}
                    >
                      {/* Keyword cell */}
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-1.5">
                          {/* Expand chevron */}
                          <span
                            className="text-[10px] transition-transform"
                            style={{
                              color: "var(--rtm-text-muted)",
                              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                              display: "inline-block",
                            }}
                          >
                            ▶
                          </span>
                          <span className="font-medium leading-snug"
                            style={{ color: isExpanded ? ACCENT : "var(--rtm-text-primary)" }}>
                            {kw.keyword}
                          </span>
                        </div>
                      </td>

                      {/* Intent */}
                      <td className="py-2.5 pr-3">
                        <IntentBadge intent={kw.intent} />
                      </td>

                      {/* Current position */}
                      <td className="py-2.5 pr-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                          style={{ background: bg, color }}
                        >
                          #{kw.currentPosition}
                        </span>
                      </td>

                      {/* Change */}
                      <td className="py-2.5 pr-3">
                        <ChangeBadge change={kw.windowChange} />
                      </td>

                      {/* Search volume */}
                      <td className="py-2.5 pr-3 font-mono text-xs"
                        style={{ color: "var(--rtm-text-secondary)" }}>
                        {fmtVol(kw.searchVolume)}
                      </td>

                      {/* Ranking URL */}
                      <td className="py-2.5 pr-3">
                        <span
                          className="text-xs font-mono truncate block max-w-[200px]"
                          style={{ color: "var(--rtm-text-muted)" }}
                          title={`${client.domain}${kw.rankingUrl}`}
                        >
                          {kw.rankingUrl}
                        </span>
                      </td>

                      {/* Sparkline */}
                      <td className="py-2.5">
                        <Sparkline
                          data={kw.slicedWeeks.map((w) => w.position)}
                          invertY
                          color={ACCENT}
                        />
                      </td>
                    </tr>

                    {/* ── Expanded detail row ──────────────────────────── */}
                    {isExpanded && expandedKw && expandedKw.id === kw.id && (
                      <tr key={`${kw.id}-detail`}>
                        <td colSpan={7} style={{ padding: 0 }}>
                          <div
                            className="mx-0 mb-1 rounded-xl border p-5 space-y-4"
                            style={{
                              background: "var(--rtm-surface)",
                              borderColor: "var(--rtm-border)",
                              borderTop: `3px solid ${ACCENT}`,
                            }}
                          >
                            {/* Detail header */}
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
                                  style={{ color: ACCENT }}>
                                  Keyword Detail
                                </p>
                                <h3 className="text-lg font-bold"
                                  style={{ color: "var(--rtm-text-primary)" }}>
                                  {expandedKw.keyword}
                                </h3>
                                <p className="text-xs mt-0.5"
                                  style={{ color: "var(--rtm-text-muted)" }}>
                                  {client.domain}{expandedKw.rankingUrl}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2 items-center">
                                <IntentBadge intent={expandedKw.intent} />
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                                  style={{ ...positionTier(expandedKw.currentPosition) }}
                                >
                                  #{expandedKw.currentPosition} current
                                </span>
                                <ChangeBadge change={expandedKw.windowChange} />
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                  style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}>
                                  {fmtVol(expandedKw.searchVolume)}/mo est.
                                </span>
                              </div>
                            </div>

                            {/* Detail KPI row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                {
                                  label: "Best Position",
                                  value: `#${Math.min(...expandedKw.weeks.map((w) => w.position))}`,
                                  color: "#059669",
                                },
                                {
                                  label: "Worst Position",
                                  value: `#${Math.max(...expandedKw.weeks.map((w) => w.position))}`,
                                  color: "#DC2626",
                                },
                                {
                                  label: "Avg Position (13wk)",
                                  value: `#${
                                    Math.round(
                                      (expandedKw.weeks.reduce((s, w) => s + w.position, 0) /
                                        expandedKw.weeks.length) * 10
                                    ) / 10
                                  }`,
                                  color: ACCENT,
                                },
                                {
                                  label: "Weeks Tracked",
                                  value: expandedKw.weeks.length,
                                  color: "var(--rtm-text-primary)",
                                },
                              ].map(({ label, value, color }) => (
                                <div key={label} className="rounded-lg border p-3"
                                  style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
                                  <p className="text-[10px] font-bold uppercase tracking-widest"
                                    style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                                  <p className="text-lg font-bold mt-0.5" style={{ color }}>
                                    {value}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Full rank history chart */}
                            <div>
                              <p className="text-xs font-semibold mb-2"
                                style={{ color: "var(--rtm-text-secondary)" }}>
                                Full 13-week rank history (lower position = better ranking)
                              </p>
                              <div className="rounded-xl border p-4"
                                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
                                <DetailChart weeks={expandedKw.weeks} accentColor={ACCENT} height={160} />
                                <p className="text-center text-[10px] mt-2"
                                  style={{ color: "var(--rtm-text-muted)" }}>
                                  Y-axis = keyword position (#1 = top result). Lower position number = better ranking.
                                  All figures are illustrative representative data.
                                </p>
                              </div>
                            </div>

                            {/* Weekly data table */}
                            <div>
                              <p className="text-xs font-semibold mb-2"
                                style={{ color: "var(--rtm-text-secondary)" }}>
                                Weekly position breakdown
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {expandedKw.weeks.map((w) => {
                                  const { bg, color } = positionTier(w.position);
                                  return (
                                    <div key={w.week}
                                      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg border"
                                      style={{ background: bg, borderColor: color + "40", minWidth: 38 }}>
                                      <span className="text-[9px] font-bold"
                                        style={{ color: "var(--rtm-text-muted)" }}>{w.week}</span>
                                      <span className="text-[11px] font-bold" style={{ color }}>
                                        #{w.position}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Close button */}
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                                className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors"
                                style={{
                                  background: "var(--rtm-surface)",
                                  borderColor: "var(--rtm-border)",
                                  color: "var(--rtm-text-secondary)",
                                }}
                              >
                                Close detail ↑
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm"
                    style={{ color: "var(--rtm-text-muted)" }}>
                    No keywords match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] mt-3" style={{ color: "var(--rtm-text-muted)" }}>
          Click any row to expand the keyword's full rank history and detailed chart.
          Sort by any column header. All figures are representative/illustrative — not live data.
          Lower position number = higher ranking.
        </p>
      </SectionWrapper>

      {/* ── Footer nav ───────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        <Link href={workspace.dashboardRoute}
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          ← Overview
        </Link>
        <Link href="/seo-local/organic-performance"
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          Organic Performance →
        </Link>
        <Link href="/seo-local/performance"
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          Local Performance →
        </Link>
        <Link href="/seo-local/clients"
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          Clients →
        </Link>
        <Link href={workspace.tasksRoute}
          className="rtm-btn-primary text-sm inline-flex items-center gap-1">
          Tasks →
        </Link>
      </div>
    </div>
  );
}
