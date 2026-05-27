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
  color,
  height = 6,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const fillColor = color ?? "var(--rtm-blue)";

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between mb-1">
          {label && (
            <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: "var(--rtm-border-light)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: fillColor }}
        />
      </div>
    </div>
  );
}
