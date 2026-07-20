"use client";

// ─────────────────────────────────────────────────────────────────────────────
// SEO & Local — Local Performance Dashboard
//
// Sections:
//  1. Date-range filter (shared DateRangeFilter — same component as Organic
//     Performance, preset 30/60/90 + custom date range)
//  2. GBP / local visibility KPI cards
//  3. Local Map Pack Report — keyword-level 3-pack presence over time
//  4. Google Maps Search Rankings Report — per-keyword rank in Maps results
//  5. Geo-Grid Ranking Visualization — LocalFalcon-style 5×5 geo grid
//  6. People Performance section (unchanged — do not modify this section)
//
// HONESTY: Items 3, 4, 5 use REPRESENTATIVE / ILLUSTRATIVE data. No real
// Google Maps / Places / rank-tracking API is connected.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { useEnabledKpis } from "@/lib/hooks/useEnabledKpis";
import { usePersonTaskStats } from "@/lib/hooks/usePersonTaskStats";
import { DeptRoleToggle, type DeptRole } from "@/components/dept-role-toggle";
import SeoTeamPerformanceRollup from "@/components/seo-local/SeoTeamPerformanceRollup";
import DateRangeFilter, {
  DEFAULT_DATE_RANGE,
  describeDateRange,
} from "@/components/seo-local/DateRangeFilter";
import type { DateRangeState } from "@/components/seo-local/DateRangeFilter";

const workspace = getWorkspace("seo-local")!;
const SEO_LOCAL_DEPARTMENTS = ["SEO", "GBP"];

// ─── Shared accent ────────────────────────────────────────────────────────────
const ACCENT = workspace.accentColor ?? "#1d709f";

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — LOCAL MAP PACK REPORT
// Data shape: per client, per keyword, position-in-3-pack over weeks
// ═══════════════════════════════════════════════════════════════════════════════

interface MapPackWeek {
  week: string;       // "W1" … "W13"
  position: number;   // 1, 2, 3 = in pack; null/4+ = not in pack
  inPack: boolean;
}

interface MapPackKeyword {
  keyword: string;
  currentPosition: number | null; // null = not in 3-pack
  weeks: MapPackWeek[];
  packAppearanceRate: number; // % of weeks in 3-pack
  avgPosition: number | null;
}

interface MapPackClient {
  id: string;
  name: string;
  keywords: MapPackKeyword[];
}

function makeMapPackWeeks(
  basePos: number,
  inPackPct: number, // 0–1 probability of being in pack each week
  n = 13,
): MapPackWeek[] {
  return Array.from({ length: n }, (_, i) => {
    // Deterministic in-pack decision
    const inPack = ((i * 7 + Math.floor(inPackPct * 13)) % 10) / 10 < inPackPct;
    const noiseOffset = ((i * 3 + 1) % 3) - 1; // -1, 0, or 1
    const pos = inPack ? Math.max(1, Math.min(3, basePos + noiseOffset)) : 4;
    return { week: `W${i + 1}`, position: pos, inPack };
  });
}

const MAP_PACK_CLIENTS: MapPackClient[] = [
  {
    id: "mc001",
    name: "Apex Roofing Solutions",
    keywords: [
      { keyword: "roofing company denver", currentPosition: 2, packAppearanceRate: 85, avgPosition: 2.1, weeks: makeMapPackWeeks(2, 0.85) },
      { keyword: "roof repair near me", currentPosition: 1, packAppearanceRate: 92, avgPosition: 1.4, weeks: makeMapPackWeeks(1, 0.92) },
      { keyword: "emergency roofer", currentPosition: 3, packAppearanceRate: 71, avgPosition: 2.8, weeks: makeMapPackWeeks(3, 0.71) },
      { keyword: "storm damage roofing", currentPosition: null, packAppearanceRate: 38, avgPosition: null, weeks: makeMapPackWeeks(4, 0.38) },
    ],
  },
  {
    id: "mc003",
    name: "Pacific Dental Group",
    keywords: [
      { keyword: "dentist san diego", currentPosition: 1, packAppearanceRate: 97, avgPosition: 1.2, weeks: makeMapPackWeeks(1, 0.97) },
      { keyword: "emergency dentist near me", currentPosition: 2, packAppearanceRate: 88, avgPosition: 1.9, weeks: makeMapPackWeeks(2, 0.88) },
      { keyword: "teeth cleaning san diego", currentPosition: 1, packAppearanceRate: 95, avgPosition: 1.1, weeks: makeMapPackWeeks(1, 0.95) },
      { keyword: "invisalign san diego", currentPosition: 3, packAppearanceRate: 74, avgPosition: 2.6, weeks: makeMapPackWeeks(3, 0.74) },
    ],
  },
  {
    id: "mc005",
    name: "Harbor Auto Group",
    keywords: [
      { keyword: "car dealership phoenix", currentPosition: 3, packAppearanceRate: 62, avgPosition: 2.9, weeks: makeMapPackWeeks(3, 0.62) },
      { keyword: "used cars phoenix az", currentPosition: null, packAppearanceRate: 29, avgPosition: null, weeks: makeMapPackWeeks(4, 0.29) },
      { keyword: "auto dealer near me", currentPosition: 2, packAppearanceRate: 77, avgPosition: 2.3, weeks: makeMapPackWeeks(2, 0.77) },
    ],
  },
  {
    id: "mc004",
    name: "Blue Ridge Plumbing Co.",
    keywords: [
      { keyword: "plumber asheville nc", currentPosition: 1, packAppearanceRate: 91, avgPosition: 1.3, weeks: makeMapPackWeeks(1, 0.91) },
      { keyword: "emergency plumbing", currentPosition: 2, packAppearanceRate: 83, avgPosition: 2.0, weeks: makeMapPackWeeks(2, 0.83) },
      { keyword: "drain cleaning near me", currentPosition: null, packAppearanceRate: 44, avgPosition: null, weeks: makeMapPackWeeks(4, 0.44) },
    ],
  },
  {
    id: "mc015",
    name: "Pinnacle Chiropractic",
    keywords: [
      { keyword: "chiropractor near me", currentPosition: 1, packAppearanceRate: 96, avgPosition: 1.2, weeks: makeMapPackWeeks(1, 0.96) },
      { keyword: "back pain doctor", currentPosition: 2, packAppearanceRate: 82, avgPosition: 2.1, weeks: makeMapPackWeeks(2, 0.82) },
      { keyword: "sports injury chiropractic", currentPosition: 3, packAppearanceRate: 67, avgPosition: 2.7, weeks: makeMapPackWeeks(3, 0.67) },
    ],
  },
];

// ─── Map Pack Position micro-chart ────────────────────────────────────────────

function PackPositionChart({ weeks }: { weeks: MapPackWeek[] }) {
  const W = 240;
  const H = 48;
  const padL = 6;
  const padR = 6;
  const padT = 6;
  const padB = 6;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = weeks.length;

  const toX = (i: number) => padL + (i / (n - 1)) * innerW;
  // Y: position 1 at top, 3 at middle, "not in pack" at bottom
  const toY = (w: MapPackWeek) => {
    if (!w.inPack) return padT + innerH; // bottom = not in pack
    return padT + ((w.position - 1) / 2) * innerH * 0.6;
  };

  const points = weeks.map((w, i) => `${toX(i)},${toY(w)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} aria-hidden>
      {/* "Not in pack" zone */}
      <rect
        x={padL}
        y={padT + innerH * 0.7}
        width={innerW}
        height={innerH * 0.35}
        fill="#FEF2F2"
        rx={2}
        opacity={0.7}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="none"
      />
      {/* Dots */}
      {weeks.map((w, i) => (
        <circle
          key={i}
          cx={toX(i)}
          cy={toY(w)}
          r={2}
          fill={w.inPack ? (w.position === 1 ? "#059669" : w.position === 2 ? "#D97706" : ACCENT) : "#DC2626"}
        />
      ))}
    </svg>
  );
}

// ─── Pack position badge ──────────────────────────────────────────────────────

function PackPosBadge({ pos }: { pos: number | null }) {
  if (pos === null)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600">
        Not in pack
      </span>
    );
  const bg = pos === 1 ? "#ECFDF5" : pos === 2 ? "#FFFBEB" : "var(--rtm-blue-xlight)";
  const color = pos === 1 ? "#059669" : pos === 2 ? "#D97706" : ACCENT;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: bg, color }}
    >
      #{pos} in 3-pack
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — GOOGLE MAPS SEARCH RANKINGS REPORT
// Per-keyword rank in Google Maps search results over time
// ═══════════════════════════════════════════════════════════════════════════════

interface MapsRankWeek {
  week: string;
  rank: number; // 1-based; >20 = effectively not visible
}

interface MapsRankKeyword {
  keyword: string;
  currentRank: number;
  peakRank: number;
  avgRank: number;
  weeks: MapsRankWeek[];
}

interface MapsRankClient {
  id: string;
  name: string;
  keywords: MapsRankKeyword[];
}

function makeMapsRankWeeks(startRank: number, endRank: number, n = 13): MapsRankWeek[] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const base = startRank + (endRank - startRank) * t;
    const noise = (((i * 11 + 3) % 5) - 2) * 0.8;
    return {
      week: `W${i + 1}`,
      rank: Math.max(1, Math.round(base + noise)),
    };
  });
}

const MAPS_RANK_CLIENTS: MapsRankClient[] = [
  {
    id: "mc001",
    name: "Apex Roofing Solutions",
    keywords: [
      { keyword: "roofing company denver", currentRank: 2, peakRank: 1, avgRank: 2.3, weeks: makeMapsRankWeeks(5, 2) },
      { keyword: "roof repair near me", currentRank: 1, peakRank: 1, avgRank: 1.6, weeks: makeMapsRankWeeks(4, 1) },
      { keyword: "emergency roofer", currentRank: 4, peakRank: 3, avgRank: 4.8, weeks: makeMapsRankWeeks(8, 4) },
      { keyword: "storm damage roofing", currentRank: 11, peakRank: 7, avgRank: 13.2, weeks: makeMapsRankWeeks(18, 11) },
    ],
  },
  {
    id: "mc003",
    name: "Pacific Dental Group",
    keywords: [
      { keyword: "dentist san diego", currentRank: 1, peakRank: 1, avgRank: 1.4, weeks: makeMapsRankWeeks(3, 1) },
      { keyword: "emergency dentist near me", currentRank: 2, peakRank: 1, avgRank: 2.1, weeks: makeMapsRankWeeks(5, 2) },
      { keyword: "teeth cleaning san diego", currentRank: 1, peakRank: 1, avgRank: 1.2, weeks: makeMapsRankWeeks(2, 1) },
      { keyword: "invisalign san diego", currentRank: 5, peakRank: 3, avgRank: 6.4, weeks: makeMapsRankWeeks(10, 5) },
    ],
  },
  {
    id: "mc005",
    name: "Harbor Auto Group",
    keywords: [
      { keyword: "car dealership phoenix", currentRank: 7, peakRank: 5, avgRank: 9.1, weeks: makeMapsRankWeeks(14, 7) },
      { keyword: "used cars phoenix az", currentRank: 14, peakRank: 11, avgRank: 16.3, weeks: makeMapsRankWeeks(21, 14) },
      { keyword: "auto dealer near me", currentRank: 4, peakRank: 3, avgRank: 5.2, weeks: makeMapsRankWeeks(9, 4) },
    ],
  },
  {
    id: "mc004",
    name: "Blue Ridge Plumbing Co.",
    keywords: [
      { keyword: "plumber asheville nc", currentRank: 1, peakRank: 1, avgRank: 1.7, weeks: makeMapsRankWeeks(4, 1) },
      { keyword: "emergency plumbing", currentRank: 2, peakRank: 1, avgRank: 2.4, weeks: makeMapsRankWeeks(5, 2) },
      { keyword: "drain cleaning near me", currentRank: 8, peakRank: 6, avgRank: 10.1, weeks: makeMapsRankWeeks(15, 8) },
    ],
  },
  {
    id: "mc015",
    name: "Pinnacle Chiropractic",
    keywords: [
      { keyword: "chiropractor near me", currentRank: 1, peakRank: 1, avgRank: 1.3, weeks: makeMapsRankWeeks(3, 1) },
      { keyword: "back pain doctor", currentRank: 3, peakRank: 2, avgRank: 3.7, weeks: makeMapsRankWeeks(7, 3) },
      { keyword: "sports injury chiropractic", currentRank: 6, peakRank: 4, avgRank: 7.8, weeks: makeMapsRankWeeks(12, 6) },
    ],
  },
];

// ─── Maps Rank mini chart ─────────────────────────────────────────────────────

function MapsRankChart({ weeks }: { weeks: MapsRankWeek[] }) {
  const W = 240;
  const H = 48;
  const padL = 4;
  const padR = 4;
  const padT = 4;
  const padB = 4;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = weeks.length;
  const ranks = weeks.map((w) => w.rank);
  const minR = Math.min(...ranks);
  const maxR = Math.max(...ranks);
  const rng = maxR - minR || 1;

  const toX = (i: number) => padL + (i / (n - 1)) * innerW;
  // lower rank = better = higher on chart (invert)
  const toY = (r: number) => padT + ((r - minR) / rng) * innerH;

  const points = weeks.map((w, i) => `${toX(i)},${toY(w.rank)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="#059669"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {weeks.map((w, i) => {
        const color = w.rank <= 3 ? "#059669" : w.rank <= 10 ? "#D97706" : "#DC2626";
        return <circle key={i} cx={toX(i)} cy={toY(w.rank)} r={2} fill={color} />;
      })}
    </svg>
  );
}

// ─── Maps rank badge ──────────────────────────────────────────────────────────

function MapsRankBadge({ rank }: { rank: number }) {
  const isTop3 = rank <= 3;
  const isTop10 = rank <= 10;
  const bg = isTop3 ? "#ECFDF5" : isTop10 ? "#FFFBEB" : "#FEF2F2";
  const color = isTop3 ? "#059669" : isTop10 ? "#D97706" : "#DC2626";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: bg, color }}
    >
      #{rank} in Maps
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — GEO-GRID RANKING VISUALIZATION
// 5×5 grid of points around the business location, each showing rank
// ═══════════════════════════════════════════════════════════════════════════════

interface GridPoint {
  row: number; // 0-4
  col: number; // 0-4
  rank: number; // 1-based; 0 = not ranking / unknown
}

interface GridKeyword {
  keyword: string;
  grid: GridPoint[];
}

interface GridClient {
  id: string;
  name: string;
  city: string;
  keywords: GridKeyword[];
}

// Color tiers: 1-3 green, 4-10 yellow, 11+ red, 0 = grey
function gridPointColor(rank: number): { bg: string; text: string; border: string } {
  if (rank === 0) return { bg: "#F1F5F9", text: "#94A3B8", border: "#E2E8F0" };
  if (rank <= 3) return { bg: "#ECFDF5", text: "#065F46", border: "#6EE7B7" };
  if (rank <= 10) return { bg: "#FFFBEB", text: "#92400E", border: "#FCD34D" };
  return { bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5" };
}

function makeGrid(center: number, spread: number): GridPoint[] {
  const points: GridPoint[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      // Distance from center (2,2)
      const dist = Math.sqrt((row - 2) ** 2 + (col - 2) ** 2);
      const base = center + dist * spread;
      // Deterministic noise
      const noise = (((row * 5 + col) * 7 + 3) % 5) - 2;
      const rank = Math.max(1, Math.round(base + noise));
      points.push({ row, col, rank });
    }
  }
  return points;
}

const GRID_CLIENTS: GridClient[] = [
  {
    id: "mc001",
    name: "Apex Roofing Solutions",
    city: "Denver, CO",
    keywords: [
      { keyword: "roofing company", grid: makeGrid(1, 1.8) },
      { keyword: "roof repair", grid: makeGrid(2, 2.1) },
      { keyword: "storm damage roofing", grid: makeGrid(5, 2.8) },
    ],
  },
  {
    id: "mc003",
    name: "Pacific Dental Group",
    city: "San Diego, CA",
    keywords: [
      { keyword: "dentist", grid: makeGrid(1, 1.2) },
      { keyword: "emergency dentist", grid: makeGrid(2, 1.9) },
      { keyword: "invisalign", grid: makeGrid(3, 2.4) },
    ],
  },
  {
    id: "mc005",
    name: "Harbor Auto Group",
    city: "Phoenix, AZ",
    keywords: [
      { keyword: "car dealership", grid: makeGrid(5, 2.2) },
      { keyword: "auto dealer", grid: makeGrid(4, 2.0) },
    ],
  },
  {
    id: "mc004",
    name: "Blue Ridge Plumbing Co.",
    city: "Asheville, NC",
    keywords: [
      { keyword: "plumber", grid: makeGrid(1, 1.5) },
      { keyword: "emergency plumbing", grid: makeGrid(2, 2.3) },
    ],
  },
  {
    id: "mc015",
    name: "Pinnacle Chiropractic",
    city: "Nashville, TN",
    keywords: [
      { keyword: "chiropractor", grid: makeGrid(1, 1.4) },
      { keyword: "back pain doctor", grid: makeGrid(3, 2.2) },
    ],
  },
];

// ─── Grid cell ────────────────────────────────────────────────────────────────

function GridCell({ point, isCenter }: { point: GridPoint; isCenter: boolean }) {
  const { bg, text, border } = gridPointColor(point.rank);
  return (
    <div
      className="flex items-center justify-center rounded-lg font-bold text-sm select-none transition-transform hover:scale-105"
      style={{
        background: bg,
        color: text,
        border: `2px solid ${isCenter ? "#1d709f" : border}`,
        aspectRatio: "1",
        fontSize: isCenter ? "13px" : "12px",
        boxShadow: isCenter ? "0 0 0 2px rgba(29,112,159,0.25)" : undefined,
        position: "relative",
      }}
      title={point.rank === 0 ? "No data" : `Rank #${point.rank} at this location`}
    >
      {point.rank === 0 ? "—" : `#${point.rank}`}
      {isCenter && (
        <span
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            background: "#1d709f",
            color: "#fff",
            borderRadius: "50%",
            width: 16,
            height: 16,
            fontSize: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
          title="Business location"
        >
          ★
        </span>
      )}
    </div>
  );
}

// ─── Grid legend ─────────────────────────────────────────────────────────────

function GridLegend() {
  const items = [
    { label: "Rank 1-3", bg: "#ECFDF5", text: "#065F46", border: "#6EE7B7" },
    { label: "Rank 4-10", bg: "#FFFBEB", text: "#92400E", border: "#FCD34D" },
    { label: "Rank 11+", bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5" },
    { label: "No data", bg: "#F1F5F9", text: "#94A3B8", border: "#E2E8F0" },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {items.map(({ label, bg, text, border }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: text, border: `1.5px solid ${border}` }}
          >
            #1
          </div>
          <span className="text-[11px]" style={{ color: "var(--rtm-text-secondary)" }}>
            {label}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{
            background: "var(--rtm-blue-xlight)",
            border: "2px solid #1d709f",
            color: ACCENT,
            fontSize: 8,
            fontWeight: 700,
          }}
        >
          ★
        </div>
        <span className="text-[11px]" style={{ color: "var(--rtm-text-secondary)" }}>
          Business location
        </span>
      </div>
    </div>
  );
}

// ─── Grid stats summary ───────────────────────────────────────────────────────

function gridStats(grid: GridPoint[]) {
  const ranked = grid.filter((p) => p.rank > 0);
  const inTop3 = ranked.filter((p) => p.rank <= 3).length;
  const inTop10 = ranked.filter((p) => p.rank <= 10).length;
  const avgRank = ranked.length
    ? Math.round((ranked.reduce((s, p) => s + p.rank, 0) / ranked.length) * 10) / 10
    : null;
  return { inTop3, inTop10, total: grid.length, avgRank };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HONEST DATA BANNER — reused across all 3 new report sections
// ═══════════════════════════════════════════════════════════════════════════════

function RepresentativeDataBanner() {
  return (
    <div
      className="flex items-start gap-3 p-3.5 rounded-xl border"
      style={{
        background: "var(--rtm-blue-xlight)",
        borderColor: "var(--rtm-blue-light)",
      }}
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
          Representative data — not live Google Maps / Places API data
        </p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--rtm-blue)", opacity: 0.85 }}>
          All local map pack positions, Maps search rankings, and geo-grid ranking figures are{" "}
          <strong>illustrative sample data</strong> designed to demonstrate the report structure.
          Connect a real rank-tracking API (e.g. Local Falcon, BrightLocal, or Google Maps Platform)
          to replace these with live data.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function SeoLocalPerformancePage() {
  const { isEnabled } = useEnabledKpis("seo-local");
  const [role, setRole] = useState<DeptRole>("manager");
  const { stats: personStats, loading: personLoading } = usePersonTaskStats(
    SEO_LOCAL_DEPARTMENTS
  );

  // ── Shared date range state ──────────────────────────────────────────────
  const [dateRange, setDateRange] = useState<DateRangeState>(DEFAULT_DATE_RANGE);

  // ── Local Map Pack state ─────────────────────────────────────────────────
  const [mapPackClientId, setMapPackClientId] = useState(MAP_PACK_CLIENTS[0].id);

  // ── Maps Search Rankings state ────────────────────────────────────────────
  const [mapsClientId, setMapsClientId] = useState(MAPS_RANK_CLIENTS[0].id);

  // ── Grid Ranking state ────────────────────────────────────────────────────
  const [gridClientId, setGridClientId] = useState(GRID_CLIENTS[0].id);
  const [gridKeywordIdx, setGridKeywordIdx] = useState(0);

  // Derived
  const rangeLabel = describeDateRange(dateRange);

  const mapPackClient = useMemo(
    () => MAP_PACK_CLIENTS.find((c) => c.id === mapPackClientId)!,
    [mapPackClientId]
  );

  const mapsClient = useMemo(
    () => MAPS_RANK_CLIENTS.find((c) => c.id === mapsClientId)!,
    [mapsClientId]
  );

  const gridClient = useMemo(
    () => GRID_CLIENTS.find((c) => c.id === gridClientId)!,
    [gridClientId]
  );

  const safeKeywordIdx = Math.min(gridKeywordIdx, gridClient.keywords.length - 1);
  const activeGridKeyword = gridClient.keywords[safeKeywordIdx];
  const gStats = gridStats(activeGridKeyword.grid);

  // Reset keyword index when client changes
  const handleGridClientChange = (id: string) => {
    setGridClientId(id);
    setGridKeywordIdx(0);
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ────────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Local Performance
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Local visibility, map pack presence, Maps rankings, geo-grid, and review metrics.
        </p>
      </div>

      {/* ── Shared date range filter ────────────────────────────────────── */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          accentColor={ACCENT}
          label="Date Range (applies to all reports below)"
        />
      </div>

      {/* ── GBP / Local Visibility KPI cards ───────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isEnabled("seo-avg-visibility") && (
          <KpiCard
            title="Avg. Visibility"
            value="72%"
            trend="up"
            trendValue="4%"
            iconBg="var(--rtm-blue-light)"
            iconColor="var(--rtm-blue)"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
        )}
        {isEnabled("seo-map-pack-appearances") && (
          <KpiCard
            title="Map Pack Appearances"
            value="284"
            trend="up"
            trendValue="31"
            iconBg="#ECFDF5"
            iconColor="#059669"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        )}
        {isEnabled("seo-review-velocity") && (
          <KpiCard
            title="Review Velocity"
            value="67/mo"
            trend="up"
            trendValue="12"
            iconBg="#FFFBEB"
            iconColor="#D97706"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
          />
        )}
        {isEnabled("seo-gbp-views") && (
          <KpiCard
            title="GBP Views (MTD)"
            value="12.4k"
            trend="up"
            trendValue="8%"
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        )}
      </div>

      {/* ── Visibility trend placeholder ────────────────────────────────── */}
      <SectionWrapper title="Visibility Trends" description={`Local visibility overview — ${rangeLabel}`}>
        <div
          className="rounded-xl border flex items-center justify-center h-48"
          style={{
            background: "var(--rtm-bg)",
            borderColor: "var(--rtm-border-light)",
            borderStyle: "dashed",
          }}
        >
          <div className="text-center">
            <p className="text-sm mt-2 font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
              Local Performance Chart Placeholder
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
              Connect GBP and ranking data to display visibility trends.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — LOCAL MAP PACK REPORT
          ════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4 pt-2">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Local Map Pack Report
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
              Representative Data
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            Track each client's presence and position in Google's local 3-pack for their target keywords over time.
          </p>
        </div>

        <RepresentativeDataBanner />

        {/* Client selector */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1 min-w-[220px]">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
              Client
            </label>
            <select
              value={mapPackClientId}
              onChange={(e) => setMapPackClientId(e.target.value)}
              className="text-sm rounded-lg border px-3 py-2"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
                appearance: "auto",
              }}
            >
              {MAP_PACK_CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <span className="text-xs pb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Showing {rangeLabel} · {mapPackClient.keywords.length} keywords tracked
          </span>
        </div>

        {/* KPI summary for selected client */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Keywords in 3-pack",
              value: mapPackClient.keywords.filter((k) => k.currentPosition !== null).length,
              suffix: `/ ${mapPackClient.keywords.length}`,
              color: "#059669",
              bg: "#ECFDF5",
            },
            {
              label: "Avg 3-Pack Position",
              value:
                mapPackClient.keywords.filter((k) => k.currentPosition !== null).length > 0
                  ? (
                      mapPackClient.keywords
                        .filter((k) => k.currentPosition !== null)
                        .reduce((s, k) => s + k.currentPosition!, 0) /
                      mapPackClient.keywords.filter((k) => k.currentPosition !== null).length
                    ).toFixed(1)
                  : "—",
              suffix: "",
              color: ACCENT,
              bg: "var(--rtm-blue-xlight)",
            },
            {
              label: "Avg Pack Appearance",
              value:
                Math.round(
                  mapPackClient.keywords.reduce((s, k) => s + k.packAppearanceRate, 0) /
                    mapPackClient.keywords.length
                ) + "%",
              suffix: "",
              color: "#D97706",
              bg: "#FFFBEB",
            },
            {
              label: "Keywords Out of Pack",
              value: mapPackClient.keywords.filter((k) => k.currentPosition === null).length,
              suffix: "",
              color: "#DC2626",
              bg: "#FEF2F2",
            },
          ].map(({ label, value, suffix, color, bg }) => (
            <div
              key={label}
              className="rounded-xl border p-4 flex flex-col gap-1"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
                {label}
              </p>
              <p className="text-2xl font-bold" style={{ color }}>
                {value}
                {suffix && <span className="text-sm font-normal ml-1" style={{ color: "var(--rtm-text-muted)" }}>{suffix}</span>}
              </p>
              <div className="w-full h-1.5 rounded-full mt-1" style={{ background: bg }}>
                <div className="h-full rounded-full" style={{ background: color, width: "100%" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Keyword table with mini chart */}
        <SectionWrapper
          title={`${mapPackClient.name} — Keyword 3-Pack Positions`}
          description={`${rangeLabel} · representative data`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border)" }}>
                  {["Keyword", "Current Position", "Appearance Rate", "Avg Position", "Trend (13 wk)"].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-2 pr-4 text-[11px] font-bold uppercase tracking-widest"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mapPackClient.keywords.map((kw, idx) => (
                  <tr
                    key={kw.keyword}
                    style={{
                      borderBottom:
                        idx < mapPackClient.keywords.length - 1
                          ? "1px solid var(--rtm-border-light)"
                          : "none",
                    }}
                  >
                    <td className="py-3 pr-4 font-medium" style={{ color: "var(--rtm-text-primary)" }}>
                      {kw.keyword}
                    </td>
                    <td className="py-3 pr-4">
                      <PackPosBadge pos={kw.currentPosition} />
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: 60,
                            background: "var(--rtm-border-light)",
                          }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${kw.packAppearanceRate}%`,
                              background: kw.packAppearanceRate >= 80 ? "#059669" : kw.packAppearanceRate >= 50 ? "#D97706" : "#DC2626",
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                          {kw.packAppearanceRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {kw.avgPosition !== null ? (
                        <span className="font-mono text-sm" style={{ color: "var(--rtm-text-primary)" }}>
                          #{kw.avgPosition.toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ color: "var(--rtm-text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="py-3 pr-2" style={{ minWidth: 160, maxWidth: 260 }}>
                      <PackPositionChart weeks={kw.weeks} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] mt-3" style={{ color: "var(--rtm-text-muted)" }}>
            Trend chart: blue/green dots = in 3-pack, red dots = not in pack. All figures are illustrative representative data.
          </p>
        </SectionWrapper>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — GOOGLE MAPS SEARCH RANKINGS REPORT
          ════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4 pt-2">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Google Maps Search Rankings
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              Representative Data
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            Track ranking position in Google Maps search results for target keywords over time.
          </p>
        </div>

        {/* Client selector */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1 min-w-[220px]">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
              Client
            </label>
            <select
              value={mapsClientId}
              onChange={(e) => setMapsClientId(e.target.value)}
              className="text-sm rounded-lg border px-3 py-2"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
                appearance: "auto",
              }}
            >
              {MAPS_RANK_CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <span className="text-xs pb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Showing {rangeLabel} · {mapsClient.keywords.length} keywords tracked
          </span>
        </div>

        {/* KPI summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Keywords Top 3",
              value: mapsClient.keywords.filter((k) => k.currentRank <= 3).length,
              suffix: `/ ${mapsClient.keywords.length}`,
              color: "#059669",
              bg: "#ECFDF5",
            },
            {
              label: "Keywords Top 10",
              value: mapsClient.keywords.filter((k) => k.currentRank <= 10).length,
              suffix: `/ ${mapsClient.keywords.length}`,
              color: "#D97706",
              bg: "#FFFBEB",
            },
            {
              label: "Avg Maps Rank",
              value:
                Math.round(
                  (mapsClient.keywords.reduce((s, k) => s + k.currentRank, 0) /
                    mapsClient.keywords.length) *
                    10
                ) / 10,
              suffix: "",
              color: ACCENT,
              bg: "var(--rtm-blue-xlight)",
            },
            {
              label: "Best Rank",
              value: `#${Math.min(...mapsClient.keywords.map((k) => k.currentRank))}`,
              suffix: "",
              color: "#059669",
              bg: "#ECFDF5",
            },
          ].map(({ label, value, suffix, color, bg }) => (
            <div
              key={label}
              className="rounded-xl border p-4 flex flex-col gap-1"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
                {label}
              </p>
              <p className="text-2xl font-bold" style={{ color }}>
                {value}
                {suffix && <span className="text-sm font-normal ml-1" style={{ color: "var(--rtm-text-muted)" }}>{suffix}</span>}
              </p>
              <div className="w-4 h-1 rounded-full mt-1" style={{ background: bg }} />
            </div>
          ))}
        </div>

        {/* Keyword ranking table */}
        <SectionWrapper
          title={`${mapsClient.name} — Maps Keyword Rankings`}
          description={`${rangeLabel} · representative data`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border)" }}>
                  {["Keyword", "Current Rank", "Peak Rank", "Avg Rank", "Trend (13 wk)"].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-2 pr-4 text-[11px] font-bold uppercase tracking-widest"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mapsClient.keywords.map((kw, idx) => (
                  <tr
                    key={kw.keyword}
                    style={{
                      borderBottom:
                        idx < mapsClient.keywords.length - 1
                          ? "1px solid var(--rtm-border-light)"
                          : "none",
                    }}
                  >
                    <td className="py-3 pr-4 font-medium" style={{ color: "var(--rtm-text-primary)" }}>
                      {kw.keyword}
                    </td>
                    <td className="py-3 pr-4">
                      <MapsRankBadge rank={kw.currentRank} />
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-semibold" style={{ color: "#059669" }}>
                        #{kw.peakRank}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-mono text-sm" style={{ color: "var(--rtm-text-primary)" }}>
                        #{kw.avgRank.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 pr-2" style={{ minWidth: 160, maxWidth: 260 }}>
                      <MapsRankChart weeks={kw.weeks} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {[
              { color: "#059669", label: "Top 3" },
              { color: "#D97706", label: "4–10" },
              { color: "#DC2626", label: "11+" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
              </div>
            ))}
            <span className="text-[10px] ml-auto" style={{ color: "var(--rtm-text-muted)" }}>
              All figures are illustrative representative data.
            </span>
          </div>
        </SectionWrapper>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5 — GEO-GRID RANKING VISUALIZATION
          ════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4 pt-2">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Geo-Grid Ranking Visualization
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-600 border border-purple-100">
              Representative Data
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            LocalFalcon / GridMySEO-style visualization. Each cell shows rank at a geographic point
            in a 5×5 grid around the business. Star (★) marks the business center location.
          </p>
        </div>

        <RepresentativeDataBanner />

        {/* Selectors */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1 min-w-[220px]">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
              Client
            </label>
            <select
              value={gridClientId}
              onChange={(e) => handleGridClientChange(e.target.value)}
              className="text-sm rounded-lg border px-3 py-2"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
                appearance: "auto",
              }}
            >
              {GRID_CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.city}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
              Keyword
            </label>
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
              {gridClient.keywords.map((kw, idx) => (
                <button
                  key={kw.keyword}
                  onClick={() => setGridKeywordIdx(idx)}
                  className="px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    background: safeKeywordIdx === idx ? ACCENT : "var(--rtm-surface)",
                    color: safeKeywordIdx === idx ? "#fff" : "var(--rtm-text-secondary)",
                    borderRight:
                      idx < gridClient.keywords.length - 1
                        ? "1px solid var(--rtm-border)"
                        : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {kw.keyword}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Points in Top 3", value: gStats.inTop3, total: gStats.total, color: "#059669", bg: "#ECFDF5" },
            { label: "Points in Top 10", value: gStats.inTop10, total: gStats.total, color: "#D97706", bg: "#FFFBEB" },
            {
              label: "Avg Grid Rank",
              value: gStats.avgRank !== null ? `#${gStats.avgRank}` : "—",
              total: null,
              color: ACCENT,
              bg: "var(--rtm-blue-xlight)",
            },
            { label: "Total Grid Points", value: gStats.total, total: null, color: "#7C3AED", bg: "#F5F3FF" },
          ].map(({ label, value, total, color, bg }) => (
            <div
              key={label}
              className="rounded-xl border p-4 flex flex-col gap-1"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
                {label}
              </p>
              <p className="text-2xl font-bold" style={{ color }}>
                {value}
                {total !== null && (
                  <span className="text-sm font-normal ml-1" style={{ color: "var(--rtm-text-muted)" }}>
                    / {total}
                  </span>
                )}
              </p>
              {total !== null && typeof value === "number" && (
                <div className="h-1.5 rounded-full mt-1" style={{ background: "var(--rtm-border-light)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(value / total) * 100}%`, background: color }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* The actual grid */}
        <SectionWrapper
          title={`${gridClient.name} — "${activeGridKeyword.keyword}" — 5×5 Geo-Grid`}
          description={`${gridClient.city} · center = business location (★) · color = rank tier`}
        >
          <div className="space-y-4">
            {/* Legend */}
            <GridLegend />

            {/* Grid */}
            <div
              className="inline-grid gap-2 p-4 rounded-xl border"
              style={{
                gridTemplateColumns: "repeat(5, minmax(60px, 80px))",
                background: "var(--rtm-bg)",
                borderColor: "var(--rtm-border-light)",
              }}
            >
              {activeGridKeyword.grid.map((point) => (
                <GridCell
                  key={`${point.row}-${point.col}`}
                  point={point}
                  isCenter={point.row === 2 && point.col === 2}
                />
              ))}
            </div>

            {/* Coverage bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
                <span>Grid coverage breakdown</span>
                <span>{gStats.total} total points</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                {[
                  { count: gStats.inTop3, color: "#059669" },
                  { count: gStats.inTop10 - gStats.inTop3, color: "#D97706" },
                  { count: gStats.total - gStats.inTop10, color: "#DC2626" },
                ].map(({ count, color }, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${(count / gStats.total) * 100}%`,
                      background: color,
                      minWidth: count > 0 ? 4 : 0,
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-4 text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                <span>
                  <span className="font-bold" style={{ color: "#059669" }}>Top 3: {gStats.inTop3}</span>
                </span>
                <span>
                  <span className="font-bold" style={{ color: "#D97706" }}>4–10: {gStats.inTop10 - gStats.inTop3}</span>
                </span>
                <span>
                  <span className="font-bold" style={{ color: "#DC2626" }}>11+: {gStats.total - gStats.inTop10}</span>
                </span>
              </div>
            </div>

            <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
              Grid points represent geographic positions around the business. Real data requires a geo-grid rank-tracking API (e.g. Local Falcon, BrightLocal). All figures shown are illustrative representative data.
            </p>
          </div>
        </SectionWrapper>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          PEOPLE PERFORMANCE (unchanged — do not modify)
          ════════════════════════════════════════════════════════════════════ */}
      <div className="pt-2 space-y-4">
        <div>
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            People Performance
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
            Team-level and individual task metrics. Manager view required.
          </p>
        </div>

        {/* Role toggle — gates People section */}
        <DeptRoleToggle
          role={role}
          onRoleChange={setRole}
          managerLabel="Manager View"
          memberLabel="Team Member View"
        />

        {/* Team Performance Rollup — Manager view only */}
        {role === "manager" && (
          <SeoTeamPerformanceRollup
            stats={personStats}
            loading={personLoading}
            isEnabled={isEnabled}
          />
        )}

        {/* Team Member view placeholder */}
        {role === "member" && (
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border"
            style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
          >
            <span className="text-xl">👤</span>
            <p className="text-sm font-medium text-emerald-800">
              Switch to Manager View to see team performance data and the
              sub-team rollup.
            </p>
          </div>
        )}
      </div>

      {/* ── Footer nav ──────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        <Link href="/seo-local/health" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Client Health →</Link>
        <Link href="/seo-local/organic-performance" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Organic Performance →</Link>
        <Link href={workspace.tasksRoute} className="rtm-btn-primary text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
