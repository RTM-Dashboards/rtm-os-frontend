interface MetricItem {
  label: string;
  value: string | number;
  change?: string;
  changeUp?: boolean;
  subtext?: string;
}

interface MetricRowProps {
  items: MetricItem[];
  cols?: 2 | 3 | 4 | 5 | 6;
}

export default function MetricRow({ items, cols = 3 }: MetricRowProps) {
  const colMap: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  };
  return (
    <div
      className={`grid ${colMap[cols] || colMap[3]}`}
      style={{ borderTop: "1px solid var(--rtm-border-light)" }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="px-4 py-3 first:pl-0"
          style={{ borderRight: i < items.length - 1 ? "1px solid var(--rtm-border-light)" : undefined }}
        >
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{item.label}</p>
          <p className="mt-0.5 text-xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            {item.value}
          </p>
          {item.change && (
            <p
              className="text-xs font-semibold mt-0.5"
              style={{ color: item.changeUp ? "#059669" : "#DC2626" }}
            >
              {item.changeUp ? "↑" : "↓"} {item.change}
            </p>
          )}
          {item.subtext && (
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {item.subtext}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
