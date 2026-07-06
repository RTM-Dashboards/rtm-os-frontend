export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target?: string;
  timestamp: string;
  type: "task"| "alert"| "report"| "campaign"| "client"| "system";
  avatarColor?: string;
}

const typeChar: Record<ActivityItem["type"], string> = {
  task:     "T",
  alert:    "!",
  report:   "R",
  campaign: "C",
  client:   "U",
  system:   "S",
};

const typeDotColor: Record<ActivityItem["type"], string> = {
  task:     "#10B981",
  alert:    "#EF4444",
  report:   "#1B4FD8",
  campaign: "#7C3AED",
  client:   "#3B6EF5",
  system:   "#94A3B8",
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
        <li
          key={item.id}
          className="flex gap-3 py-3 last:border-0"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}
        >
          {/* Avatar with type dot */}
          <div className="relative flex-shrink-0 mt-0.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"style={{ background: item.avatarColor ?? "var(--rtm-blue)"}}
            >
              {item.actor.charAt(0).toUpperCase()}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"style={{ background: typeDotColor[item.type] }}
            />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug"style={{ color: "var(--rtm-text-secondary)"}}>
              <span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                {item.actor}
              </span>{" "}
              {item.action}
              {item.target && (
                <span className="font-medium"style={{ color: "var(--rtm-blue)"}}> {item.target}</span>
              )}
            </p>
            <p className="mt-0.5 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
              {item.timestamp}
            </p>
          </div>

          <span
            className="text-[10px] font-bold flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"style={{ background: typeDotColor[item.type] + "22", color: typeDotColor[item.type] }}
          >
            {typeChar[item.type]}
          </span>
        </li>
      ))}
    </ul>
  );
}
