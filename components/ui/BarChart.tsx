interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  barColor?: string;
  showLabels?: boolean;
}

export default function BarChart({
  data,
  height = 120,
  barColor = "#6366f1",
  showLabels = true,
}: BarChartProps) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value));
  const barW = 100 / data.length;
  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" className="w-full" style={{ height: showLabels ? height - 20 : height }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * 90;
          const x = i * barW + barW * 0.1;
          const w = barW * 0.8;
          return (
            <rect
              key={i}
              x={x}
              y={100 - barH}
              width={w}
              height={barH}
              fill={d.color || barColor}
              rx={1}
              opacity={0.85}
            />
          );
        })}
      </svg>
      {showLabels && (
        <div className="flex justify-around mt-1">
          {data.map((d) => (
            <span key={d.label} className="text-[10px] text-slate-400 truncate" style={{ width: `${barW}%`, textAlign: "center" }}>
              {d.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
