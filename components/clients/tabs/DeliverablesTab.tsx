import type { ClientProfile, DeliverableStatus } from "@/lib/mock/clients";
import { DeliverableBadge } from "@/components/clients/ClientStatusBadge";

export default function DeliverablesTab({ client }: { client: ClientProfile }) {
  const counts: Record<DeliverableStatus, number> = {
    completed: 0,
    in_progress: 0,
    blocked: 0,
    overdue: 0,
    not_started: 0,
  };
  for (const d of client.deliverables) counts[d.status]++;

  const sorted = [...client.deliverables].sort((a, b) => {
    const order: Record<DeliverableStatus, number> = {
      overdue: 0,
      blocked: 1,
      in_progress: 2,
      not_started: 3,
      completed: 4,
    };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(
          [
            ["overdue",     "Overdue",     "text-red-700 dark:text-red-400",       "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40"],
            ["blocked",     "Blocked",     "text-red-600 dark:text-red-400",       "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40"],
            ["in_progress", "In Progress", "text-blue-700 dark:text-blue-400",     "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/40"],
            ["not_started", "Not Started", "text-slate-600 dark:text-slate-400",   "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"],
            ["completed",   "Completed",   "text-emerald-700 dark:text-emerald-400","bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40"],
          ] as [DeliverableStatus, string, string, string][]
        ).map(([status, label, textClass, bgClass]) => (
          <div key={status} className={`rounded-xl border p-4 ${bgClass}`}>
            <p className={`text-2xl font-bold ${textClass}`}>{counts[status]}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">All Deliverables</h3>
          <p className="text-xs text-slate-500 mt-0.5">{client.deliverables.length} total</p>
        </div>
        {sorted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deliverable</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Dept</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Assignee</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((d) => (
                  <tr key={d.id} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">{d.title}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {d.department}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{d.assignee}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {new Date(d.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <DeliverableBadge status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-500">No deliverables on record.</p>
          </div>
        )}
      </div>
    </div>
  );
}
