import type { ClientProfile } from "@/lib/mock/clients";
import { CampaignBadge } from "@/components/clients/ClientStatusBadge";

export default function CampaignsTab({ client }: { client: ClientProfile }) {
  return (
    <div className="space-y-5">
      {/* Status header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Campaign Status</p>
            <CampaignBadge status={client.campaignStatus} />
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Active Campaigns</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{client.activeCampaigns.length}</p>
          </div>
        </div>
      </div>

      {/* Campaigns list */}
      {client.activeCampaigns.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Active Campaigns</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Campaign</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Channel</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Started</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget/mo</th>
                </tr>
              </thead>
              <tbody>
                {client.activeCampaigns.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">{c.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {c.channel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <CampaignBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {new Date(c.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                      ${c.budget.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center">
          
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No active campaigns</p>
          <p className="text-xs text-slate-400 mt-1">
            {client.campaignStatus === "paused"
              ? "Campaigns are currently paused for this client."
              : "No campaigns have been set up yet."}
          </p>
        </div>
      )}
    </div>
  );
}
