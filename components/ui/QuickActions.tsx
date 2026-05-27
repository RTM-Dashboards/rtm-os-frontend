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
          className="flex flex-col items-start gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group text-left"
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${action.color}`}>
            {action.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {action.label}
            </p>
            {action.description && (
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{action.description}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
