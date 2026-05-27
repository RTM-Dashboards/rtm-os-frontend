import type { HealthScore } from "@/lib/account-management/types";

const scoreConfig: Record<HealthScore, { percent: number; color: string; label: string }> = {
  Healthy: { percent: 90, color: "bg-emerald-500", label: "90" },
  "Needs Attention": { percent: 60, color: "bg-amber-500", label: "60" },
  "At-Risk": { percent: 35, color: "bg-orange-500", label: "35" },
  Critical: { percent: 15, color: "bg-red-500", label: "15" },
};

interface HealthScoreBarProps {
  score: HealthScore;
}

export function HealthScoreBar({ score }: HealthScoreBarProps) {
  const config = scoreConfig[score];
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${config.color}`}
          style={{ width: `${config.percent}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 w-5 text-right">{config.label}</span>
    </div>
  );
}
