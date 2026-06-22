import type { ClientProfile, ActivityItem } from "@/lib/mock/clients";

const typeConfig: Record<ActivityItem["type"], { icon: string; dot: string }> = {
  note:       { icon: "N", dot: "bg-slate-400" },
  task:       { icon: "T", dot: "bg-emerald-500" },
  billing:    { icon: "B", dot: "bg-indigo-500" },
  campaign:   { icon: "C", dot: "bg-purple-500" },
  onboarding: { icon: "O", dot: "bg-blue-500" },
  system:     { icon: "S", dot: "bg-slate-400" },
  alert:      { icon: "!", dot: "bg-red-500" },
};

export default function HistoryTab({ client }: { client: ClientProfile }) {
  const sorted = [...client.activity].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-5">
      {/* Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Activity Timeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">{sorted.length} events recorded</p>
        </div>
        <div className="p-5">
          {sorted.length > 0 ? (
            <ol className="relative">
              {sorted.map((item, i) => {
                const cfg = typeConfig[item.type];
                return (
                  <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Vertical line */}
                    {i < sorted.length - 1 && (
                      <div className="absolute left-[15px] top-7 bottom-0 w-px bg-slate-100 dark:bg-slate-800" />
                    )}

                    {/* Dot */}
                    <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-white dark:border-slate-900 shadow-sm ${
                      item.type === "alert"
                        ? "bg-red-100 dark:bg-red-900/20"
                        : item.type === "billing"
                        ? "bg-indigo-50 dark:bg-indigo-900/20"
                        : item.type === "campaign"
                        ? "bg-purple-50 dark:bg-purple-900/20"
                        : item.type === "onboarding"
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : item.type === "task"
                        ? "bg-emerald-50 dark:bg-emerald-900/20"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                          <span className="font-semibold text-slate-900 dark:text-white">{item.actor}</span>
                          {" — "}
                          {item.action}
                        </p>
                        <time className="text-xs text-slate-400 flex-shrink-0 sm:text-right">
                          {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </time>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No activity recorded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Client tenure */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Client Tenure</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-slate-500">Client since</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {new Date(client.clientSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total tenure</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {(() => {
                const months = Math.floor(
                  (Date.now() - new Date(client.clientSince).getTime()) / (1000 * 60 * 60 * 24 * 30)
                );
                if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
                const yrs = Math.floor(months / 12);
                const rem = months % 12;
                return `${yrs}yr${yrs !== 1 ? "s" : ""}${rem > 0 ? ` ${rem}mo` : ""}`;
              })()}
            </p>
          </div>
          {client.onboardedDate && (
            <div>
              <p className="text-xs text-slate-500">Onboarded</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {new Date(client.onboardedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
