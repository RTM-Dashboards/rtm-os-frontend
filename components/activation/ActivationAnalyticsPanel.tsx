"use client";

import { ACTIVATION_ANALYTICS, ACTIVATION_RECORDS } from "@/lib/activation-data";

function formatCurrency(n: number) {
  return "$"+ n.toLocaleString("en-US");
}

function HBar({ label, value, max, color, suffix = ""}: { label: string; value: number; max: number; color: string; suffix?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3 py-2"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
      <p className="text-xs font-medium w-44 flex-shrink-0"style={{ color: "var(--rtm-text-secondary)"}}>
        {label}
      </p>
      <div className="flex-1 h-2 rounded-full overflow-hidden"style={{ background: "var(--rtm-border)"}}>
        <div className="h-full rounded-full"style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-xs font-bold w-16 text-right flex-shrink-0"style={{ color }}>
        {value}{suffix}
      </p>
    </div>
  );
}

export default function ActivationAnalyticsPanel() {
  const a = ACTIVATION_ANALYTICS;

  const statusCounts = {
    Active: ACTIVATION_RECORDS.filter((r) => r.activationStatus === "Active").length,
    Launching: ACTIVATION_RECORDS.filter((r) => r.activationStatus === "Launching").length,
    "Ready For Launch": ACTIVATION_RECORDS.filter((r) => r.activationStatus === "Ready For Launch").length,
    "Pending Payment": ACTIVATION_RECORDS.filter((r) => r.activationStatus === "Pending Payment").length,
    "Pending Assignment": ACTIVATION_RECORDS.filter((r) => r.activationStatus === "Pending Assignment").length,
    "Pending Contract": ACTIVATION_RECORDS.filter((r) => r.activationStatus === "Pending Contract").length,
    "On Hold": ACTIVATION_RECORDS.filter((r) => r.activationStatus === "On Hold").length,
  };

  const totalRevenue = ACTIVATION_RECORDS.reduce((sum, r) => sum + r.billingHandoff.recurringRevenue, 0);

  const kpis = [
    {
      label: "Average Time To Launch",
      value: `${a.avgTimeToLaunch} days`,
      sub: "From contract signed to Active",
      color: "var(--rtm-blue)",
      bg: "var(--rtm-blue-xlight)",
      border: "var(--rtm-blue-light)",
    },
    {
      label: "Revenue Waiting For Launch",
      value: formatCurrency(a.revenueWaitingForLaunch),
      sub: "Across all pending activations",
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FDE68A",
    },
    {
      label: "Pending Activations",
      value: `${a.pendingActivations}`,
      sub: "Not yet fully Active",
      color: "#7C3AED",
      bg: "#F5F3FF",
      border: "#DDD6FE",
    },
    {
      label: "Total Recurring Revenue",
      value: formatCurrency(totalRevenue),
      sub: "Monthly across all active clients",
      color: "#059669",
      bg: "#ECFDF5",
      border: "#A7F3D0",
    },
  ];

  const maxBottleneckDays = Math.max(...a.bottlenecks.map((b) => b.avgDays));
  const maxDeptDelay = Math.max(...a.departmentDelays.map((d) => d.avgDelay));

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, color, bg, border }) => (
          <div
            key={label}
            className="rounded-xl p-5 flex flex-col gap-2"style={{ background: bg, border: `1px solid ${border}`, boxShadow: "0 1px 3px rgba(15,28,56,0.04)"}}
          >
            <p className="text-[11px] font-bold uppercase tracking-wide"style={{ color }}>
              {label}
            </p>
            <p className="text-2xl font-bold"style={{ color }}>
              {value}
            </p>
            <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Activation Bottlenecks */}
        <div
          className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)"}}
        >
          <p className="text-sm font-bold mb-1"style={{ color: "var(--rtm-text-primary)"}}>
            Activation Bottlenecks
          </p>
          <p className="text-xs mb-4"style={{ color: "var(--rtm-text-muted)"}}>
            Average days spent at each stage
          </p>
          {a.bottlenecks.map((b) => (
            <HBar
              key={b.stage}
              label={`${b.stage} (${b.count})`}
              value={b.avgDays}
              max={maxBottleneckDays}
              color="var(--rtm-blue)"suffix="days"/>
          ))}
        </div>

        {/* Department Delays */}
        <div
          className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)"}}
        >
          <p className="text-sm font-bold mb-1"style={{ color: "var(--rtm-text-primary)"}}>
            Department Delays
          </p>
          <p className="text-xs mb-4"style={{ color: "var(--rtm-text-muted)"}}>
            Average delay in days per department
          </p>
          {a.departmentDelays.map((d) => (
            <HBar
              key={d.department}
              label={`${d.department} (${d.cases})`}
              value={d.avgDelay}
              max={maxDeptDelay}
              color="#7C3AED"suffix="days"/>
          ))}
        </div>
      </div>

      {/* Status Distribution */}
      <div
        className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)"}}
      >
        <p className="text-sm font-bold mb-1"style={{ color: "var(--rtm-text-primary)"}}>
          Activation Status Distribution
        </p>
        <p className="text-xs mb-4"style={{ color: "var(--rtm-text-muted)"}}>
          Current breakdown of all 20 activation records
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {(Object.entries(statusCounts) as [string, number][]).map(([status, count]) => (
            <div
              key={status}
              className="rounded-lg p-3 text-center"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}
            >
              <p className="text-2xl font-bold"style={{ color: "var(--rtm-blue)"}}>
                {count}
              </p>
              <p className="text-[11px] font-medium mt-1 leading-tight"style={{ color: "var(--rtm-text-muted)"}}>
                {status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
