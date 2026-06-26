import type { Client } from "@/lib/account-management/types";
import { StatusBadge } from "./StatusBadge";

interface AlertsPanelProps {
  clients: Client[];
}

export function AlertsPanel({ clients }: AlertsPanelProps) {
  const atRisk = clients.filter(
    (c) => c.healthScore === "At-Risk"|| c.healthScore === "Critical");

  const now = new Date();
  const sixtyDaysOut = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const renewalsSoon = clients.filter((c) => {
    const renewal = new Date(c.renewalDate);
    return renewal >= now && renewal <= sixtyDaysOut;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* At-Risk Alerts */}
      <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-red-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600"fill="none"stroke="currentColor"viewBox="0 0 24 24">
              <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">At-Risk Clients</h3>
            <p className="text-xs text-slate-500">{atRisk.length} client{atRisk.length !== 1 ? "s": ""} need attention</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {atRisk.length === 0 && (
            <div className="px-5 py-6 text-center text-sm text-slate-400">
              No at-risk clients right now.
            </div>
          )}
          {atRisk.map((c) => (
            <div key={c.id} className="px-5 py-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-900">{c.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  AM: {c.assignedAM} · Last contact: {new Date(c.lastContact).toLocaleDateString("en-US", { month: "short", day: "numeric"})}
                </div>
                {c.reportsOverdue > 0 && (
                  <div className="text-xs text-red-600 mt-0.5">
                    {c.reportsOverdue} report{c.reportsOverdue !== 1 ? "s": ""} overdue
                  </div>
                )}
              </div>
              <StatusBadge value={c.healthScore} />
            </div>
          ))}
        </div>
      </div>

      {/* Renewal Tracking */}
      <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-amber-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
            <svg className="w-4 h-4 text-amber-600"fill="none"stroke="currentColor"viewBox="0 0 24 24">
              <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Renewals (Next 60 Days)</h3>
            <p className="text-xs text-slate-500">{renewalsSoon.length} renewal{renewalsSoon.length !== 1 ? "s": ""} upcoming</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {renewalsSoon.length === 0 && (
            <div className="px-5 py-6 text-center text-sm text-slate-400">
              No renewals due in the next 60 days.
            </div>
          )}
          {renewalsSoon.map((c) => {
            const renewal = new Date(c.renewalDate);
            const diffDays = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const isUrgent = diffDays <= 30;
            return (
              <div key={c.id} className="px-5 py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    AM: {c.assignedAM} · MRR: ${c.monthlyRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm font-semibold ${isUrgent ? "text-red-600": "text-amber-600"}`}>
                    {renewal.toLocaleDateString("en-US", { month: "short", day: "numeric"})}
                  </div>
                  <div className={`text-xs ${isUrgent ? "text-red-500": "text-amber-500"}`}>
                    in {diffDays}d
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
