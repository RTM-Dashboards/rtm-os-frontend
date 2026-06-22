import type { ClientProfile } from "@/lib/mock/clients";
import { BillingBadge } from "@/components/clients/ClientStatusBadge";

export default function BillingTab({ client }: { client: ClientProfile }) {
  const activeMRR = client.services
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.monthlyValue, 0);

  return (
    <div className="space-y-5">
      {/* Billing overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Billing Status</p>
          <BillingBadge status={client.billingStatus} />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Monthly Recurring</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">${activeMRR.toLocaleString()}</p>
          <p className="text-xs text-slate-400 capitalize mt-0.5">{client.billingCycle} billing</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Next Billing Date</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {new Date(client.nextBillingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Billing detail */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Billing Summary</h3>
        </div>
        <div className="p-5">
          {client.billingStatus === "overdue" && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-sm font-bold flex-shrink-0">!</span>
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">Invoice Overdue</p>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                    This client has an outstanding balance. Immediate follow-up required.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-400">Billing Cycle</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{client.billingCycle}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active Service MRR</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">${activeMRR.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-400">Paused Services</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {client.services.filter((s) => s.status === "paused").length > 0
                  ? `${client.services.filter((s) => s.status === "paused").length} paused`
                  : "None"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-400">Next Billing Date</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {new Date(client.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Current Status</span>
              <BillingBadge status={client.billingStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Contracts */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Contracts & Agreements</h3>
          <p className="text-xs text-slate-500 mt-0.5">{client.contracts.length} document{client.contracts.length !== 1 ? "s" : ""} on file</p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {client.contracts.map((ct) => (
            <div key={ct.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{ct.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Signed {new Date(ct.signedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {ct.expiryDate && ` · Expires ${new Date(ct.expiryDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                  </p>
                </div>
              </div>
              <a
                href={ct.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline flex-shrink-0"
              >
                View →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
