"use client";

import { useState, useMemo } from "react";
import type { OnboardingItem } from "@/lib/account-management/types";
import { StatusBadge } from "./StatusBadge";
import { SearchFilter } from "./SearchFilter";
import { SectionCard } from "./SectionCard";

interface OnboardingTableProps {
  items: OnboardingItem[];
}

export function OnboardingTable({ items }: OnboardingTableProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = useMemo(() => {
    return items.filter((o) => {
      const q = search.toLowerCase();
      if (
        q &&
        !o.clientName.toLowerCase().includes(q) &&
        !o.assignedAM.toLowerCase().includes(q)
      )
        return false;
      if (filterStatus && o.status !== filterStatus) return false;
      return true;
    });
  }, [items, search, filterStatus]);

  const inProgressCount = items.filter(
    (o) => o.status !== "Completed").length;

  return (
    <SectionCard
      title="Onboarding Queue"subtitle="New clients in onboarding process"badge={inProgressCount}
      badgeVariant={inProgressCount > 0 ? "warning": "default"}
    >
      <div className="px-5 py-3 border-b border-slate-100">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search clients..."resultCount={filtered.length}
          filters={[
            {
              label: "Status",
              value: filterStatus,
              onChange: setFilterStatus,
              options: [
                { value: "Not Started", label: "Not Started"},
                { value: "In Progress", label: "In Progress"},
                { value: "Awaiting Assets", label: "Awaiting Assets"},
                { value: "Stalled", label: "Stalled"},
                { value: "Completed", label: "Completed"},
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Services
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Assigned AM
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Start Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Target Complete
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Progress
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">
                  No onboarding items found.
                </td>
              </tr>
            )}
            {filtered.map((o) => {
              const pct = o.totalSteps > 0 ? Math.round((o.completedSteps / o.totalSteps) * 100) : 0;
              const isStalled = o.status === "Stalled";
              return (
                <tr key={o.id} className={`hover:bg-slate-50 transition-colors ${isStalled ? "bg-amber-50/30": ""}`}>
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">{o.clientName}</div>
                    {o.pendingItems.length > 0 && (
                      <div className="text-xs text-slate-500 mt-0.5 max-w-xs">
                        Pending: {o.pendingItems[0]}
                        {o.pendingItems.length > 1 && ` +${o.pendingItems.length - 1} more`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[140px]">
                      {o.services.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{o.assignedAM}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {new Date(o.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {new Date(o.targetCompletionDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isStalled ? "bg-amber-400": "bg-indigo-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {o.completedSteps}/{o.totalSteps}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={o.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
