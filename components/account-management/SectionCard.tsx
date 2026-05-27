interface SectionCardProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  badgeVariant?: "default" | "warning" | "danger";
  children: React.ReactNode;
  action?: React.ReactNode;
}

const badgeStyles = {
  default: "bg-slate-100 text-slate-600",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 truncate">{title}</h2>
              {badge !== undefined && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badgeStyles[badgeVariant]}`}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
