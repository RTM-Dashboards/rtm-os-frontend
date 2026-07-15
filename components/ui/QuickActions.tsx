"use client";

export interface QuickAction {
  label: string;
  description?: string;
  /** Emoji string or short text; optional for backward compat */
  icon?: string;
  color: string;
  onClick?: () => void;
  /** When true the button is visually disabled and shows disabledReason as a tooltip */
  disabled?: boolean;
  /** Tooltip shown on hover when disabled — defaults to "Not yet available" */
  disabledReason?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  cols?: 2 | 3 | 4;
}

export default function QuickActions({ actions, cols = 2 }: QuickActionsProps) {
  const colClass = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4"}[cols];
  return (
    <div className={`grid ${colClass} gap-3`}>
      {actions.map((action) => {
        if (action.disabled) {
          return (
            <button
              key={action.label}
              disabled
              title={action.disabledReason ?? "Not yet available"}
              className="flex flex-col items-start gap-2 p-4 rounded-xl border text-left opacity-45 cursor-not-allowed"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
              }}
            >
              {action.icon && (
                <span className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>{action.icon}</span>
              )}
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                  {action.label}
                </p>
                {action.description && (
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--rtm-text-muted)" }}>
                    {action.description}
                  </p>
                )}
                <p className="text-[10px] mt-1 font-medium" style={{ color: "var(--rtm-text-muted)" }}>
                  Not yet available
                </p>
              </div>
            </button>
          );
        }
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-start gap-2 p-4 rounded-xl border transition-all group text-left"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-blue)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(29,112,159,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-border)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            {action.icon && (
              <span className="text-xl leading-none" style={{ color: "var(--rtm-text-secondary)" }}>{action.icon}</span>
            )}
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
        );
      })}
    </div>
  );
}
