"use client";

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export default function MiniSparkline({
  data,
  color = "var(--rtm-blue)",
  height = 40,
  width = 120,
}: MiniSparklineProps) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padX = 4;
  const padY = 4;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * innerW;
    const y = padY + (1 - (v - min) / range) * innerH;
    return `${x},${y}`;
  });
  const polyline = points.join("");
  const lastPt = points[points.length - 1].split(",");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        points={polyline}
        fill="none"stroke={color}
        strokeWidth={2}
        strokeLinecap="round"strokeLinejoin="round"/>
      <circle cx={lastPt[0]} cy={lastPt[1]} r={3} fill={color} />
    </svg>
  );
}
