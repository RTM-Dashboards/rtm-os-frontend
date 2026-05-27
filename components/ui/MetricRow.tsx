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
    <div className={`grid ${colMap[cols] || colMap[3]} divide-x divide-slate-100 dark:divide-slate-800`}>
      {items.map((item, i) => (
        <div key={i} className="px-4 py-3 first:pl-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
          <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white tracking-tight">{item.value}</p>
          {item.change && (
            <p className={`text-xs font-medium mt-0.5 ${item.changeUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {item.changeUp ? "↑" : "↓"} {item.change}
            </p>
          )}
          {item.subtext && <p className="text-xs text-slate-400 mt-0.5">{item.subtext}</p>}
        </div>
      ))}
    </div>
  );
}
