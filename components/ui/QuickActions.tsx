"use client";

export interface QuickAction {
  label: string;
  description?: string;
  icon: string;
  color: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  cols?: 2 | 3 | 4;
}

export default function QuickActions({ actions, cols = 2 }: QuickActionsProps) {
  const colClass = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[cols];
  return (
    <div className={`grid ${colClass} gap-3`}>
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`flex flex-col items-start gap-2 p-4 rounded-xl border transition-all group text-left`}
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-blue)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(27,79,216,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-border)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${action.color}`}>
            {action.icon}
          </div>
          <div>
            <p className="text-sm font-semibold transition-colors" style={{ color: "var(--rtm-text-primary)" }}>
              {action.label}
            </p>
            {action.description && (
              <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--rtm-text-muted)" }}>
                {action.description}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
