interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}

export default function DonutChart({
  segments,
  size = 120,
  thickness = 20,
  centerLabel,
  centerSub,
}: DonutChartProps) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += dash;
          return el;
        })}
        {centerLabel && (
          <>
            <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle" className="fill-slate-800 dark:fill-white" fontSize={size * 0.16} fontWeight="700">
              {centerLabel}
            </text>
            {centerSub && (
              <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" className="fill-slate-400" fontSize={size * 0.1}>
                {centerSub}
              </text>
            )}
          </>
        )}
      </svg>
      <ul className="space-y-1.5">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-xs text-slate-600 dark:text-slate-400">{seg.label}</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 ml-auto">{Math.round((seg.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
