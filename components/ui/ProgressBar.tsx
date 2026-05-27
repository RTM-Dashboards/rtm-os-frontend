interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  color = "bg-indigo-500",
  height = 6,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-xs text-slate-600 dark:text-slate-400">{label}</span>}
          {showLabel && <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" style={{ height }}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
