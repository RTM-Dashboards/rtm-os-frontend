export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target?: string;
  timestamp: string;
  type: "task" | "alert" | "report" | "campaign" | "client" | "system";
  avatarColor?: string;
}

const typeIcons: Record<ActivityItem["type"], string> = {
  task: "✓",
  alert: "⚠",
  report: "📊",
  campaign: "🎯",
  client: "👤",
  system: "⚙",
};

const typeDot: Record<ActivityItem["type"], string> = {
  task: "bg-emerald-500",
  alert: "bg-red-500",
  report: "bg-blue-500",
  campaign: "bg-purple-500",
  client: "bg-indigo-500",
  system: "bg-slate-400",
};

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
}

export default function ActivityFeed({ items, maxItems = 8 }: ActivityFeedProps) {
  const visible = items.slice(0, maxItems);
  return (
    <ul className="space-y-0">
      {visible.map((item) => (
        <li key={item.id} className="flex gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <div className="relative flex-shrink-0 mt-0.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: item.avatarColor || "#6366f1" }}
            >
              {item.actor.charAt(0).toUpperCase()}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${typeDot[item.type]}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
              <span className="font-semibold">{item.actor}</span>{" "}
              {item.action}
              {item.target && (
                <span className="font-medium text-indigo-600 dark:text-indigo-400"> {item.target}</span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{item.timestamp}</p>
          </div>
          <span className="text-base flex-shrink-0">{typeIcons[item.type]}</span>
        </li>
      ))}
    </ul>
  );
}
