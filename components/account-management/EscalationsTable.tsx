"use client";

import { useState, useMemo } from "react";
import type { Escalation } from "@/lib/account-management/types";
import { StatusBadge } from "./StatusBadge";
import { SearchFilter } from "./SearchFilter";
import { SectionCard } from "./SectionCard";

interface EscalationsTableProps {
  escalations: Escalation[];
}

export function EscalationsTable({ escalations }: EscalationsTableProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const filtered = useMemo(() => {
    return escalations.filter((e) => {
      const q = search.toLowerCase();
      if (
        q &&
        !e.clientName.toLowerCase().includes(q) &&
        !e.issue.toLowerCase().includes(q) &&
        !e.assignedAM.toLowerCase().includes(q)
      )
        return false;
      if (filterStatus && e.status !== filterStatus) return false;
      if (filterPriority && e.priority !== filterPriority) return false;
      return true;
    });
  }, [escalations, search, filterStatus, filterPriority]);

  const openCount = escalations.filter((e) => e.status === "Open" || e.status === "Escalated").length;

  return (
    <SectionCard
      title="Escalations"
      subtitle="Active client issues requiring attention"
      badge={openCount > 0 ? `${openCount} open` : "0"}
      badgeVariant={openCount > 0 ? "danger" : "default"}
    >
      <div className="px-5 py-3 border-b border-slate-100">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search escalations..."
          resultCount={filtered.length}
          filters={[
            {
              label: "Status",
              value: filterStatus,
              onChange: setFilterStatus,
              options: [
                { value: "Open", label: "Open" },
                { value: "In Progress", label: "In Progress" },
                { value: "Escalated", label: "Escalated" },
                { value: "Resolved", label: "Resolved" },
              ],
            },
            {
              label: "Priority",
              value: filterPriority,
              onChange: setFilterPriority,
              options: [
                { value: "Critical", label: "Critical" },
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
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
                Issue
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Raised By
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Date Raised
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Priority
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">
                  No escalations found.
                </td>
              </tr>
            )}
            {filtered.map((e) => (
              <tr key={e.id} className={`hover:bg-slate-50 transition-colors ${e.status === "Open" || e.status === "Escalated" ? "bg-red-50/30" : ""}`}>
                <td className="px-5 py-3">
                  <div className="font-medium text-slate-900">{e.issue}</div>
                  <div className="text-xs text-slate-500 mt-0.5 max-w-xs">{e.notes}</div>
                </td>
                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{e.clientName}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{e.raisedBy}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {new Date(e.dateRaised).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={e.status} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={e.priority} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
