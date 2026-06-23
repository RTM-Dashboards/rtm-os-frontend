"use client";

import { useState, useMemo } from "react";
import type { RenewalQueueItem } from "@/lib/billing/types";
import BillingSearchFilter from "./BillingSearchFilter";
import { RenewalStatusBadge } from "./BillingStatusBadge";

const STATUS_FILTER_OPTIONS = [
  { value: "on_track", label: "On Track"},
  { value: "at_risk", label: "At Risk"},
  { value: "renewed", label: "Renewed"},
  { value: "pending", label: "Pending"},
  { value: "churned", label: "Churned"},
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

/** Days until renewal (positive = future, negative = past) */
function daysUntilRenewal(isoDate: string) {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function RenewalCountdown({ isoDate }: { isoDate: string }) {
  const days = daysUntilRenewal(isoDate);
  if (days < 0) {
    return <span className="text-xs text-red-500 font-medium">Expired {Math.abs(days)}d ago</span>;
  }
  if (days <= 30) {
    return <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">In {days}d</span>;
  }
  return <span className="text-xs text-slate-500 dark:text-slate-400">In {days}d</span>;
}

interface Props {
  data: RenewalQueueItem[];
}

export default function RenewalQueueTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchSearch =
        !search ||
        (row.client as string).toLowerCase().includes(search.toLowerCase()) ||
        (row.assignedAM as string).toLowerCase().includes(search.toLowerCase());
      const matchFilter = !statusFilter || row.status === statusFilter;
      return matchSearch && matchFilter;
    });
  }, [data, search, statusFilter]);

  // Sort by renewal date ascending
  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => new Date(a.renewalDate as string).getTime() - new Date(b.renewalDate as string).getTime()
    );
  }, [filtered]);

  return (
    <div className="space-y-3">
      <BillingSearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={STATUS_FILTER_OPTIONS}
        filterPlaceholder="All Statuses"searchPlaceholder="Search client or AM..."resultCount={sorted.length}
      />
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Client</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Renewal Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Contract Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Assigned AM</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  No renewals match your search.
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr
                  key={row.id}
                  className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {row.client as string}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 dark:text-slate-300">
                        {formatDate(row.renewalDate as string)}
                      </span>
                      <RenewalCountdown isoDate={row.renewalDate as string} />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {formatCurrency(row.contractValue as number)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(row.startDate as string)}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {row.assignedAM as string}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RenewalStatusBadge status={row.status} />
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
