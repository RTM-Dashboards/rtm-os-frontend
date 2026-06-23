"use client";

import { useState, useMemo } from "react";
import type { OverdueAccount } from "@/lib/billing/types";
import BillingSearchFilter from "./BillingSearchFilter";
import { RiskLevelBadge } from "./BillingStatusBadge";

const RISK_FILTER_OPTIONS = [
  { value: "critical", label: "Critical"},
  { value: "high", label: "High"},
  { value: "medium", label: "Medium"},
  { value: "low", label: "Low"},
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString()}`;
}

function DaysOverduePill({ days }: { days: number }) {
  let cls = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  if (days >= 30) cls = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  else if (days <= 7) cls = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {days}d
    </span>
  );
}

interface Props {
  data: OverdueAccount[];
}

export default function OverdueAccountsTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchSearch =
        !search || row.client.toLowerCase().includes(search.toLowerCase());
      const matchFilter = !riskFilter || row.riskLevel === riskFilter;
      return matchSearch && matchFilter;
    });
  }, [data, search, riskFilter]);

  // Sort by days overdue descending
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => (b.daysOverdue as number) - (a.daysOverdue as number));
  }, [filtered]);

  return (
    <div className="space-y-3">
      <BillingSearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={riskFilter}
        onFilterChange={setRiskFilter}
        filterOptions={RISK_FILTER_OPTIONS}
        filterPlaceholder="All Risk Levels"searchPlaceholder="Search client..."resultCount={sorted.length}
      />
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Client</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Days Overdue</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Risk Level</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Start Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  No overdue accounts found.
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr
                  key={row.id}
                  className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {row.client}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <DaysOverduePill days={row.daysOverdue as number} />
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {formatCurrency(row.amount as number)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RiskLevelBadge level={row.riskLevel} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(row.startDate as string)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
