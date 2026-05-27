export interface TeamMember {
  name: string;
  role: string;
  status: "online" | "away" | "offline";
  clients?: number;
  tasks?: number;
  avatarColor?: string;
}

const statusStyles = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-slate-400",
};

interface TeamWidgetProps {
  members: TeamMember[];
}

export default function TeamWidget({ members }: TeamWidgetProps) {
  return (
    <ul className="space-y-3">
      {members.map((member) => (
        <li key={member.name} className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: member.avatarColor || "#6366f1" }}
            >
              {member.name.charAt(0).toUpperCase()}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${statusStyles[member.status]}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{member.name}</p>
            <p className="text-xs text-slate-500 truncate">{member.role}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            {member.clients !== undefined && (
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{member.clients} clients</p>
            )}
            {member.tasks !== undefined && (
              <p className="text-xs text-slate-400">{member.tasks} tasks</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
