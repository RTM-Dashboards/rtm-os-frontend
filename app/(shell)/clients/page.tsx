"use client";

import Link from "next/link";
import { MOCK_CLIENTS } from "@/lib/mock/clients";
import { HealthBadge, BillingBadge, CampaignBadge } from "@/components/clients/ClientStatusBadge";

export default function ClientsPage() {
  const total = MOCK_CLIENTS.length;
  const healthy = MOCK_CLIENTS.filter((c) => c.healthStatus === "healthy").length;
  const atRisk = MOCK_CLIENTS.filter((c) => c.healthStatus === "at_risk").length;
  const newClients = MOCK_CLIENTS.filter((c) => c.healthStatus === "new").length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[var(--rtm-blue)] uppercase tracking-widest mb-1">Client Profiles</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Clients</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Centralized profiles for all active accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--rtm-blue)] hover:bg-[var(--rtm-blue-dark)] text-white text-sm font-semibold transition-colors shadow-sm ">
            + Add Client
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Clients",  value: total,     color: "text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)]",  bg: "bg-[var(--rtm-blue-xlight)]" },
          { label: "Healthy",        value: healthy,   color: "text-emerald-600 dark:text-emerald-400",bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "At Risk",        value: atRisk,    color: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "New Clients",    value: newClients, color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/20" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className={`inline-flex w-8 h-8 rounded-lg ${stat.bg} items-center justify-center mb-2`}>
              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Client cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MOCK_CLIENTS.map((client) => {
          const activeMRR = client.services
            .filter((s) => s.status === "active")
            .reduce((sum, s) => sum + s.monthlyValue, 0);

          return (
            <Link
              key={client.id}
              href={`/clients/${client.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[var(--rtm-blue)]/40 dark:hover:border-[var(--rtm-blue)]/40 hover:shadow-md transition-all p-5 block"
            >
              {/* Card header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow"
                  style={{ background: client.avatarColor }}
                >
                  {client.companyName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate group-hover:text-[var(--rtm-blue)] dark:group-hover:text-[color:var(--rtm-blue)] transition-colors">
                    {client.companyName}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{client.domain} · {client.location}</p>
                </div>
                <HealthBadge status={client.healthStatus} />
              </div>

              {/* Team */}
              <div className="flex gap-4 mb-4 text-xs text-slate-500">
                <span>AM: <span className="font-medium text-slate-700 dark:text-slate-300">{client.assignedAM}</span></span>
                <span>Sales: <span className="font-medium text-slate-700 dark:text-slate-300">{client.salesRep}</span></span>
              </div>

              {/* Services tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {client.services.filter(s => s.status === "active").slice(0, 3).map((s) => (
                  <span
                    key={s.id}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                  >
                    {s.name}
                  </span>
                ))}
                {client.services.filter(s => s.status === "active").length > 3 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                    +{client.services.filter(s => s.status === "active").length - 3} more
                  </span>
                )}
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BillingBadge status={client.billingStatus} />
                  <CampaignBadge status={client.campaignStatus} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">${activeMRR.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">/mo MRR</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
