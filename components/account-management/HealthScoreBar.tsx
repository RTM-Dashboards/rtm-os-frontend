import type { HealthScore } from "@/lib/account-management/types";

const scoreConfig: Record<HealthScore, { percent: number; color: string; label: string }> = {
  Healthy:           { percent: 90, color: "#10B981", label: "90"},
  "Needs Attention": { percent: 60, color: "#F59E0B", label: "60"},
  "At-Risk":         { percent: 35, color: "#F97316", label: "35"},
  Critical:          { percent: 15, color: "#EF4444", label: "15"},
};

interface HealthScoreBarProps {
  score: HealthScore;
}

export function HealthScoreBar({ score }: HealthScoreBarProps) {
  const config = scoreConfig[score];
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"style={{ background: "var(--rtm-border-light)"}}
      >
        <div
          className="h-full rounded-full transition-all"style={{ width: `${config.percent}%`, background: config.color }}
        />
      </div>
      <span className="text-xs w-5 text-right"style={{ color: "var(--rtm-text-muted)"}}>
        {config.label}
      </span>
    </div>
  );
}
