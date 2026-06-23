export interface TeamMember {
  name: string;
  role: string;
  status: "online"| "away"| "offline";
  clients?: number;
  tasks?: number;
  avatarColor?: string;
}

const statusDot: Record<TeamMember["status"], string> = {
  online:  "#10B981",
  away:    "#F59E0B",
  offline: "#CBD5E1",
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
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"style={{ background: member.avatarColor ?? "var(--rtm-blue)"}}
            >
              {member.name.charAt(0).toUpperCase()}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"style={{ background: statusDot[member.status] }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate"style={{ color: "var(--rtm-text-primary)"}}>
              {member.name}
            </p>
            <p className="text-xs truncate"style={{ color: "var(--rtm-text-muted)"}}>
              {member.role}
            </p>
          </div>

          <div className="flex-shrink-0 text-right">
            {member.clients !== undefined && (
              <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>
                {member.clients} clients
              </p>
            )}
            {member.tasks !== undefined && (
              <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                {member.tasks} tasks
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
