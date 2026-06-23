"use client";

import { DonutChart, SectionWrapper } from "@/components/ui";

interface HealthSegment {
  label: string;
  count: number;
  color: string;
}

interface Props {
  segments: HealthSegment[];
}

export default function HealthDistributionPanel({ segments }: Props) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);

  // DonutChart expects value; we map count -> value
  const donutSegments = segments.map((s) => ({
    label: s.label,
    value: s.count,
    color: s.color,
  }));

  return (
    <SectionWrapper
      title="Client Health Distribution"description="Portfolio composition by health score">
      <DonutChart
        segments={donutSegments}
        size={160}
        thickness={24}
        centerLabel={String(total)}
        centerSub="clients"/>

      {/* Bar breakdown */}
      <div className="mt-4 space-y-2">
        {segments.map((s) => {
          const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
          return (
            <div key={s.label}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "var(--rtm-text-secondary)"}}>{s.label}</span>
                <span className="font-semibold"style={{ color: s.color }}>
                  {s.count} ({pct}%)
                </span>
              </div>
              <div
                className="w-full rounded-full overflow-hidden"style={{ height: 5, background: "var(--rtm-border-light)"}}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"style={{ width: `${pct}%`, background: s.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
