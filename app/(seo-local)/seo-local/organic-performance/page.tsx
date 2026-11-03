"use client";

// ─────────────────────────────────────────────────────────────────────────────
// SEO & Local — Organic Performance Dashboard
//
// Shows per-client ranking and organic traffic trends over a selectable date
// window (30 / 60 / 90 days preset, or custom date range).
//
// IMPORTANT: All ranking and traffic figures shown here are REPRESENTATIVE /
// ILLUSTRATIVE sample data. No Google Search Console, Google Analytics, or
// third-party rank-tracking API is connected. Numbers are realistic-looking
// stand-ins designed to demonstrate the dashboard structure. Connect a real
// integration to replace them with live data.
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeekPoint {
  /** ISO week label, e.g. "W1", "W2" */
  week: string;
  /** Average keyword position (lower = better) */
  avgPosition: number;
  /** Organic sessions that week */
  sessions: number;
}

interface ClientOrganicData {
  id: string;
  name: string;
  services: string[];
  /** 13-week (90-day) baseline. Sliced by duration selector. */
  weeks: WeekPoint[];
  /** Summary stats for the full 90-day window */
  positionDelta: number; // negative = improved (lower rank number)
  sessionsDelta: number; // positive = more traffic
}

// ─── Representative dataset ───────────────────────────────────────────────────
// 15 SEO/Local clients mirroring master-clients IDs.
// Data is seeded to show realistic trends (gradual position improvement,
// traffic growth) with some client-specific variance.

function makeWeeks(
  startPos: number,
  endPos: number,
  startSessions: number,
  endSessions: number,
  noise: number = 0.3,
): WeekPoint[] {
  const n = 13;
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const posBase = startPos + (endPos - startPos) * t;
    const sessBase = startSessions + (endSessions - startSessions) * t;
    // Deterministic noise via index
    const posNoise = (((i * 7 + 3) % 5) - 2) * noise;
    const sessNoise = (((i * 11 + 1) % 7) - 3) * (sessBase * 0.07);
    return {
      week: `W${i + 1}`,
      avgPosition: Math.max(1, Math.round((posBase + posNoise) * 10) / 10),
      sessions: Math.max(0, Math.round(sessBase + sessNoise)),
    };
  });
}

const CLIENT_DATA: ClientOrganicData[] = [
  // No data — not yet connected to a real API source
];

// ─── Week count from DateRangeState ──────────────────────────────────────────

function weeksFromDateRange(dr: DateRangeState): number {
  if (dr.mode === "preset") {
    if (dr.presetDays === 30) return 4;
    if (dr.presetDays === 60) return 9;
    return 13;
  }
  // Custom: compute from start/end if both present
  if (dr.customStart && dr.customEnd) {
    const start = new Date(dr.customStart + "T00:00:00");
    const end = new Date(dr.customEnd + "T00:00:00");
    const diffDays = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    // Clamp to max 13 weeks of sample data
    return Math.min(13, Math.max(1, Math.ceil(diffDays / 7)));
  }
  return 13;
}

// ─── Trend line SVG chart ────────────────────────────────────────────────────

interface TrendChartProps {
  data: number[];
  labels: string[];
  color: string;
  /** When true, lower values are rendered higher (better) — for position */
  invertY?: boolean;
  height?: number;
}

function TrendChart({ data, labels, color, invertY = false, height = 120 }: TrendChartProps) {
  if (data.length < 2) return null;

  const W = 400;
  const H = height;
  const padL = 36;
  const padR = 8;
  const padT = 10;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const toX = (i: number) => padL + (i / (data.length - 1)) * innerW;
  const toY = (v: number) => {
    const normalised = (v - min) / range; // 0..1, higher = bigger
    const plotY = invertY
      ? padT + normalised * innerH        // lower pos = top of chart = better
      : padT + (1 - normalised) * innerH; // higher sessions = top = better
    return plotY;
  };

  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

  // Area fill path
  const areaPath =
    `M ${toX(0)},${toY(data[0])} ` +
    data
      .slice(1)
      .map((v, i) => `L ${toX(i + 1)},${toY(v)}`)
      .join(" ") +
    ` L ${toX(data.length - 1)},${H - padB} L ${toX(0)},${H - padB} Z`;

  // Y-axis labels — 3 ticks
  const yTicks = [0, 0.5, 1].map((t) => {
    const val = min + t * range;
    const y = invertY
      ? padT + (1 - t) * innerH
      : padT + t * innerH;
    return { val, y };
  });

  // X-axis labels — show every 2nd or 3rd label to avoid crowding
  const step = data.length <= 5 ? 1 : data.length <= 9 ? 2 : 3;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height }}
      aria-hidden="true"
    >
      {/* Y-axis ticks */}
      {yTicks.map(({ val, y }, idx) => (
        <g key={idx}>
          <line
            x1={padL}
            y1={y}
            x2={W - padR}
            y2={y}
            stroke="var(--rtm-border-light)"
            strokeWidth={0.5}
            strokeDasharray="3,3"
          />
          <text
            x={padL - 4}
            y={y + 4}
            textAnchor="end"
            fontSize={8}
            fill="var(--rtm-text-muted)"
          >
            {invertY
              ? Math.round(val * 10) / 10
              : val >= 1000
              ? `${(val / 1000).toFixed(1)}k`
              : Math.round(val)}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={color} opacity={0.08} />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {data.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r={2.5} fill={color} />
      ))}

      {/* X-axis labels */}
      {labels.map((lbl, i) => {
        if (i % step !== 0 && i !== labels.length - 1) return null;
        return (
          <text
            key={i}
            x={toX(i)}
            y={H - 6}
            textAnchor="middle"
            fontSize={7.5}
            fill="var(--rtm-text-muted)"
          >
            {lbl}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Delta badge ──────────────────────────────────────────────────────────────

function DeltaBadge({ value, unit, invertGood = false }: { value: number; unit: string; invertGood?: boolean }) {
  // invertGood: when true, negative = good (position going down = better rank)
  const isGood = invertGood ? value < 0 : value > 0;
  const color = isGood ? "#059669" : value === 0 ? "var(--rtm-text-muted)" : "#DC2626";
  const bg = isGood ? "#ECFDF5" : value === 0 ? "var(--rtm-bg)" : "#FEF2F2";
  const prefix = value > 0 ? "+" : "";
  return (
    <span
      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ color, background: bg }}
    >
      {prefix}{value}{unit}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OrganicPerformancePage() {
  const [selectedId, setSelectedId] = useState<string>(CLIENT_DATA[0]?.id ?? "");
  const [dateRange, setDateRange] = useState<DateRangeState>(DEFAULT_DATE_RANGE);

  const client = CLIENT_DATA.find((c) => c.id === selectedId) ?? null;
  const numWeeks = weeksFromDateRange(dateRange);

  // Slice weeks to the selected duration window
  const slicedWeeks = useMemo(() => {
    if (!client) return [];
    return client.weeks.slice(client.weeks.length - numWeeks);
  }, [client, numWeeks]);

  const positionData = slicedWeeks.map((w) => w.avgPosition);
  const sessionData = slicedWeeks.map((w) => w.sessions);
  const weekLabels = slicedWeeks.map((w) => w.week);

  // Summarize the sliced window
  const currentPos = positionData[positionData.length - 1] ?? 0;
  const startPos = positionData[0] ?? 0;
  const posDelta = Math.round((currentPos - startPos) * 10) / 10;

  const currentSess = sessionData[sessionData.length - 1];
  const startSess = sessionData[0];
  const sessDelta = currentSess - startSess;

  const accentColor = workspace.accentColor; // #1d709f

  const rangeLabel = describeDateRange(dateRange);
  const displayDays =
    dateRange.mode === "preset"
      ? dateRange.presetDays
      : numWeeks * 7;

  if (CLIENT_DATA.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-text-muted)" }}>SEO-Local</p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Organic Performance</h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Aggregate organic traffic and position tracking.</p>
        </div>
        <div className="rounded-xl border px-4 py-10 text-center" style={{ borderColor: "var(--rtm-border-light)", borderStyle: "dashed", background: "var(--rtm-bg)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>No organic performance data yet</p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Connect Google Search Console or a rank-tracking API to see organic traffic, position, and session trends. Layout and controls are ready.</p>
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: accentColor }}
        >
          {workspace.name}
        </p>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          Organic Performance
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Keyword ranking trends and organic traffic by client and date window.
        </p>
      </div>

      {/* ── Honest data label ────────────────────────────────────────────── */}
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
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--rtm-blue-dark)" }}
          >
            Representative data — not live Search Console or Analytics
          </p>
          <p
            className="text-xs mt-0.5 leading-relaxed"
            style={{ color: "var(--rtm-blue)", opacity: 0.85 }}
          >
            All ranking positions and organic session figures shown here are{" "}
            <strong>illustrative sample data</strong> designed to demonstrate the
            dashboard structure. Connect Google Search Console and Google Analytics
            (or a rank-tracking API) to replace these with live metrics.
          </p>
        </div>
      </div>

      {/* ── Selectors row ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Client selector */}
        <div className="flex flex-col gap-1 min-w-[220px]">
          <label
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Client
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-sm rounded-lg border px-3 py-2 pr-8"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
              appearance: "auto",
            }}
          >
            {CLIENT_DATA.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Shared date-range filter (presets + custom) */}
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          accentColor={accentColor}
          label="Date Range"
        />

        {/* Service tags for selected client */}
        <div className="flex gap-2 flex-wrap items-center pb-0.5">
          {client.services.map((s) => (
            <span
              key={s}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: "var(--rtm-blue-xlight)",
                color: accentColor,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── KPI summary row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current avg position */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-1"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
            Avg. Position
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            #{currentPos.toFixed(1)}
          </p>
          <DeltaBadge value={posDelta} unit=" pos" invertGood />
          <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            Lower = better rank
          </p>
        </div>

        {/* Position change */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-1"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
            Rank Change
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {posDelta > 0 ? "+" : ""}{posDelta.toFixed(1)}
          </p>
          <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            vs. start of window
          </p>
          <p className="text-[10px]" style={{ color: "#059669" }}>
            {posDelta < 0 ? "↑ Ranking improved" : posDelta > 0 ? "↓ Ranking dropped" : "Stable"}
          </p>
        </div>

        {/* Current weekly sessions */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-1"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
            Organic Sessions/wk
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {currentSess.toLocaleString()}
          </p>
          <DeltaBadge value={sessDelta} unit=" sessions" />
          <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            vs. start of window
          </p>
        </div>

        {/* Traffic growth % */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-1"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
            Traffic Growth
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {startSess > 0
              ? `+${Math.round(((currentSess - startSess) / startSess) * 100)}%`
              : "—"}
          </p>
          <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            over {rangeLabel}
          </p>
          <p className="text-[10px]" style={{ color: "#059669" }}>
            {sessDelta > 0 ? "↑ Organic traffic growing" : sessDelta < 0 ? "↓ Traffic declined" : "Stable"}
          </p>
        </div>
      </div>

      {/* ── Ranking trend chart ──────────────────────────────────────────── */}
      <SectionWrapper
        title="Keyword Ranking Trend"
        description={`Avg. keyword position over ${rangeLabel} — lower is better`}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
              Average keyword position (1 = top result)
            </p>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: "#ECFDF5", color: "#059669" }}
            >
              ↑ Improving
            </span>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
          >
            <TrendChart
              data={positionData}
              labels={weekLabels}
              color={accentColor}
              invertY
              height={140}
            />
            <p className="text-center text-[10px] mt-2" style={{ color: "var(--rtm-text-muted)" }}>
              ↑ Chart shows improvement (lower position number = better ranking). Y-axis = avg keyword position.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* ── Traffic trend chart ──────────────────────────────────────────── */}
      <SectionWrapper
        title="Organic Traffic Trend"
        description={`Weekly organic sessions over ${rangeLabel}`}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
              Organic sessions per week (Google Analytics source)
            </p>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: "#ECFDF5", color: "#059669" }}
            >
              ↑ Growing
            </span>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
          >
            <TrendChart
              data={sessionData}
              labels={weekLabels}
              color="#059669"
              height={140}
            />
            <p className="text-center text-[10px] mt-2" style={{ color: "var(--rtm-text-muted)" }}>
              Y-axis = weekly organic sessions. Trend line shows growth direction over the selected window.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* ── All-client summary table ─────────────────────────────────────── */}
      <SectionWrapper
        title={`All Clients — ${displayDays}-Day Summary`}
        description="Representative ranking and traffic trends across all SEO & Local clients"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border)" }}>
                {["Client", "Services", "Avg Position", `Rank Δ (${displayDays}d)`, "Sessions/wk", `Traffic Δ (${displayDays}d)`].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left pb-2 pr-4 text-[11px] font-bold uppercase tracking-widest"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {CLIENT_DATA.map((c, idx) => {
                const lastWeek = c.weeks[c.weeks.length - 1];
                const isSelected = c.id === selectedId;
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className="cursor-pointer transition-colors"
                    style={{
                      borderBottom:
                        idx < CLIENT_DATA.length - 1
                          ? "1px solid var(--rtm-border-light)"
                          : "none",
                      background: isSelected
                        ? "var(--rtm-blue-xlight)"
                        : "transparent",
                    }}
                  >
                    <td
                      className="py-2.5 pr-4 font-medium"
                      style={{ color: isSelected ? accentColor : "var(--rtm-text-primary)" }}
                    >
                      {c.name}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "var(--rtm-blue-xlight)",
                          color: accentColor,
                        }}
                      >
                        {c.services.join(", ")}
                      </span>
                    </td>
                    <td
                      className="py-2.5 pr-4 font-mono"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      #{lastWeek.avgPosition.toFixed(1)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <DeltaBadge value={c.positionDelta} unit=" pos" invertGood />
                    </td>
                    <td
                      className="py-2.5 pr-4 font-mono"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {lastWeek.sessions.toLocaleString()}
                    </td>
                    <td className="py-2.5">
                      <DeltaBadge value={c.sessionsDelta} unit=" /wk" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] mt-3" style={{ color: "var(--rtm-text-muted)" }}>
          Click any row to load that client's trend charts above. All figures are representative/illustrative — not live data.
        </p>
      </SectionWrapper>

      {/* ── Footer nav ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href={workspace.dashboardRoute}
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1"
        >
          ← Overview
        </Link>
        <Link
          href="/seo-local/clients"
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1"
        >
          Clients →
        </Link>
        <Link
          href="/seo-local/performance"
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1"
        >
          Local Performance →
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
