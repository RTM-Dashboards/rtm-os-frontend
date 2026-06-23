interface SectionCardProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  badgeVariant?: "default"| "warning"| "danger";
  children: React.ReactNode;
  action?: React.ReactNode;
}

const badgeStyleMap = {
  default: { background: "var(--rtm-blue-light)",  color: "var(--rtm-blue)"},
  warning: { background: "#FEF3C7", color: "#B45309"},
  danger:  { background: "#FEE2E2", color: "#DC2626"},
};

export function SectionCard({
  title,
  subtitle,
  badge,
  badgeVariant = "default",
  children,
  action,
}: SectionCardProps) {
  return (
    <div
      className="rounded-xl border overflow-hidden"style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
      }}
    >
      <div
        className="px-5 py-4 flex items-center justify-between gap-3"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold truncate"style={{ color: "var(--rtm-text-primary)"}}>
                {title}
              </h2>
              {badge !== undefined && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"style={badgeStyleMap[badgeVariant]}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
