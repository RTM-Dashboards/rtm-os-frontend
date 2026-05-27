import type { AssignedUser } from "@/lib/tasks/types";

interface Props {
  users: AssignedUser[];
  max?: number;
  size?: "sm" | "md";
}

export default function UserAvatarStack({ users, max = 3, size = "sm" }: Props) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;
  const dim = size === "sm" ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-[11px]";

  return (
    <div className="flex items-center" style={{ gap: "-4px" }}>
      <div className="flex -space-x-1.5">
        {visible.map((u) => (
          <span
            key={u.id}
            className={`${dim} rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ring-2 ring-white`}
            style={{ background: u.avatarColor }}
            title={u.name}
          >
            {u.initials}
          </span>
        ))}
        {overflow > 0 && (
          <span
            className={`${dim} rounded-full flex-shrink-0 flex items-center justify-center font-bold ring-2 ring-white`}
            style={{ background: "#E2E8F0", color: "#64748B" }}
            title={`+${overflow} more`}
          >
            +{overflow}
          </span>
        )}
      </div>
    </div>
  );
}
