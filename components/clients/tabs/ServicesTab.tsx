import type { ClientProfile } from "@/lib/mock/clients";
import { ServiceBadge } from "@/components/clients/ClientStatusBadge";

export default function ServicesTab({ client }: { client: ClientProfile }) {
  const active = client.services.filter((s) => s.status === "active");
  const paused = client.services.filter((s) => s.status === "paused");
  const cancelled = client.services.filter((s) => s.status === "cancelled");

  const totalMRR = active.reduce((sum, s) => sum + s.monthlyValue, 0);

  return (
    <div className="space-y-5">
      {/* MRR summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total MRR", value: `$${totalMRR.toLocaleString()}`, sub: "active services" },
          { label: "Active", value: String(active.length), sub: "services" },
          { label: "Paused", value: String(paused.length), sub: "services" },
          { label: "Cancelled", value: String(cancelled.length), sub: "services" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Services table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">All Services</h3>
          <p className="text-xs text-slate-500 mt-0.5">{client.services.length} total services</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Started</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Monthly Value</th>
              </tr>
            </thead>
            <tbody>
              {client.services.map((service) => (
                <tr key={service.id} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{service.name}</p>
                      {service.notes && (
                        <p className="text-xs text-slate-400 mt-0.5">{service.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <ServiceBadge status={service.status} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                    {new Date(service.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                    {service.status === "active"
                      ? `$${service.monthlyValue.toLocaleString()}`
                      : <span className="text-slate-400 font-normal">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <td colSpan={3} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total MRR</td>
                <td className="px-5 py-3 text-right font-bold text-slate-900 dark:text-white">
                  ${totalMRR.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
