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
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"stroke="var(--rtm-border-light)"strokeWidth={thickness}
        />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="round"/>
          );
          offset += dash;
          return el;
        })}
        {centerLabel && (
          <>
            <text
              x={cx} y={cy - 4}
              textAnchor="middle"dominantBaseline="middle"fontSize={size * 0.16}
              fontWeight="700"fill="var(--rtm-text-primary)">
              {centerLabel}
            </text>
            {centerSub && (
              <text
                x={cx} y={cy + 14}
                textAnchor="middle"dominantBaseline="middle"fontSize={size * 0.1}
                fill="var(--rtm-text-muted)">
                {centerSub}
              </text>
            )}
          </>
        )}
      </svg>
      <ul className="space-y-2 flex-1">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"style={{ background: seg.color }} />
            <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{seg.label}</span>
            <span className="text-xs font-semibold ml-auto"style={{ color: "var(--rtm-text-primary)"}}>
              {Math.round((seg.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
