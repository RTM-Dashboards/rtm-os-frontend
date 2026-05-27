"use client";

import React, { useState, useMemo } from "react";
import type { Client } from "@/lib/account-management/types";
import { StatusBadge } from "./StatusBadge";
import { HealthScoreBar } from "./HealthScoreBar";
import { SearchFilter } from "./SearchFilter";
import { SectionCard } from "./SectionCard";

interface ClientPortfolioTableProps {
  clients: Client[];
}

export function ClientPortfolioTable({ clients }: ClientPortfolioTableProps) {
  const [search, setSearch] = useState("");
  const [filterAM, setFilterAM] = useState("");
  const [filterHealth, setFilterHealth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const amOptions = useMemo(() => {
    const ams = [...new Set(clients.map((c) => c.assignedAM))].sort();
    return ams.map((am) => ({ value: am, label: am }));
  }, [clients]);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase();
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.industry.toLowerCase().includes(q) &&
        !c.location.toLowerCase().includes(q) &&
        !c.assignedAM.toLowerCase().includes(q)
      )
        return false;
      if (filterAM && c.assignedAM !== filterAM) return false;
      if (filterHealth && c.healthScore !== filterHealth) return false;
      if (filterStatus && c.campaignStatus !== filterStatus) return false;
      return true;
    });
  }, [clients, search, filterAM, filterHealth, filterStatus]);

  return (
    <SectionCard
      title="Client Portfolio"
      subtitle="All active client accounts"
      badge={filtered.length}
    >
      <div className="px-5 py-3 border-b border-slate-100">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search clients, industry, location..."
          resultCount={filtered.length}
          filters={[
            {
              label: "AM",
              value: filterAM,
              onChange: setFilterAM,
              options: amOptions,
            },
            {
              label: "Health",
              value: filterHealth,
              onChange: setFilterHealth,
              options: [
                { value: "Healthy", label: "Healthy" },
                { value: "Needs Attention", label: "Needs Attention" },
                { value: "At-Risk", label: "At-Risk" },
                { value: "Critical", label: "Critical" },
              ],
            },
            {
              label: "Status",
              value: filterStatus,
              onChange: setFilterStatus,
              options: [
                { value: "Active", label: "Active" },
                { value: "Paused", label: "Paused" },
                { value: "Pending Launch", label: "Pending Launch" },
              ],
            },
          ]}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Services
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Health Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Assigned AM
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Campaign Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Start Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Renewal Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                MRR
              </th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-slate-400 text-sm">
                  No clients match the current filters.
                </td>
              </tr>
            )}
            {filtered.map((client) => (
              <React.Fragment key={client.id}>
                <tr
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">{client.name}</div>
                    <div className="text-xs text-slate-500">{client.industry} · {client.location}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {client.services.map((s) => (
                        <span
                          key={s}
                          className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <StatusBadge value={client.healthScore} />
                      <HealthScoreBar score={client.healthScore} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{client.assignedAM}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={client.campaignStatus} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {new Date(client.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RenewalCell date={client.renewalDate} />
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                    ${client.monthlyRevenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedId === client.id ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </td>
                </tr>
                {expandedId === client.id && (
                  <tr className="bg-slate-50">
                    <td colSpan={9} className="px-5 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Last Contact
                          </span>
                          <p className="text-slate-700 mt-0.5">
                            {new Date(client.lastContact).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Open Items
                          </span>
                          <p className="text-slate-700 mt-0.5">
                            {client.openDeliverables} deliverable{client.openDeliverables !== 1 ? "s" : ""},{" "}
                            {client.reportsOverdue} report{client.reportsOverdue !== 1 ? "s" : ""} overdue
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                            AI Notes
                            <span className="text-indigo-400 text-[10px] font-normal normal-case tracking-normal">(placeholder)</span>
                          </span>
                          <p className="text-slate-600 mt-0.5 italic">{client.aiNotes}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function RenewalCell({ date }: { date: string }) {
  const renewal = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays <= 60 && diffDays > 0;
  const isPast = diffDays <= 0;

  return (
    <div>
      <div className={`font-medium ${isPast ? "text-red-600" : isUrgent ? "text-amber-600" : "text-slate-700"}`}>
        {renewal.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </div>
      {isUrgent && (
        <div className="text-xs text-amber-600">{diffDays}d left</div>
      )}
      {isPast && (
        <div className="text-xs text-red-500">Expired</div>
      )}
    </div>
  );
}
