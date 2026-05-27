"use client";

import { useState, useMemo } from "react";
import type { ActiveCampaign } from "@/lib/billing/types";
import BillingSearchFilter from "./BillingSearchFilter";
import ServiceTags from "./ServiceTags";
import { BillingStatusBadge, CampaignStatusBadge } from "./BillingStatusBadge";

const BILLING_FILTER_OPTIONS = [
  { value: "current", label: "Current" },
  { value: "past_due", label: "Past Due" },
  { value: "overdue", label: "Overdue" },
  { value: "pending", label: "Pending" },
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

interface Props {
  data: ActiveCampaign[];
}

export default function ActiveCampaignsTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const [billingFilter, setBillingFilter] = useState("");

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchSearch =
        !search ||
        row.client.toLowerCase().includes(search.toLowerCase()) ||
        row.assignedAM.toLowerCase().includes(search.toLowerCase()) ||
        (row.services as string[]).some((s) =>
          s.toLowerCase().includes(search.toLowerCase())
        );
      const matchFilter =
        !billingFilter || row.billingStatus === billingFilter;
      return matchSearch && matchFilter;
    });
  }, [data, search, billingFilter]);

  return (
    <div className="space-y-3">
      <BillingSearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={billingFilter}
        onFilterChange={setBillingFilter}
        filterOptions={BILLING_FILTER_OPTIONS}
        filterPlaceholder="All Billing Status"
        searchPlaceholder="Search client or AM..."
        resultCount={filtered.length}
      />
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Client</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Services</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Monthly Revenue</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Campaign</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Billing</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Renewal Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Assigned AM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  No campaigns match your search.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {row.client}
                  </td>
                  <td className="px-4 py-3">
                    <ServiceTags services={row.services as string[]} />
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {formatCurrency(row.monthlyRevenue)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <CampaignStatusBadge status={row.campaignStatus} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <BillingStatusBadge status={row.billingStatus} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(row.startDate)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(row.renewalDate)}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {row.assignedAM}
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
