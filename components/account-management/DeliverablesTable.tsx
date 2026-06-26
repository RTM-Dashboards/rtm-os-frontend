"use client";

import { useState, useMemo } from "react";
import type { Deliverable } from "@/lib/account-management/types";
import { StatusBadge } from "./StatusBadge";
import { SearchFilter } from "./SearchFilter";
import { SectionCard } from "./SectionCard";

interface DeliverablesTableProps {
  deliverables: Deliverable[];
}

export function DeliverablesTable({ deliverables }: DeliverablesTableProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const filtered = useMemo(() => {
    return deliverables.filter((d) => {
      const q = search.toLowerCase();
      if (
        q &&
        !d.clientName.toLowerCase().includes(q) &&
        !d.title.toLowerCase().includes(q) &&
        !d.service.toLowerCase().includes(q) &&
        !d.assignedTo.toLowerCase().includes(q)
      )
        return false;
      if (filterStatus && d.status !== filterStatus) return false;
      if (filterPriority && d.priority !== filterPriority) return false;
      return true;
    });
  }, [deliverables, search, filterStatus, filterPriority]);

  const overdueCount = deliverables.filter((d) => d.status === "Overdue").length;

  return (
    <SectionCard
      title="Deliverables"subtitle="Tracked tasks and outputs"badge={overdueCount > 0 ? `${overdueCount} overdue` : filtered.length}
      badgeVariant={overdueCount > 0 ? "danger": "default"}
    >
      <div className="px-5 py-3 border-b border-slate-100">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search deliverables..."resultCount={filtered.length}
          filters={[
            {
              label: "Status",
              value: filterStatus,
              onChange: setFilterStatus,
              options: [
                { value: "In Progress", label: "In Progress"},
                { value: "Not Started", label: "Not Started"},
                { value: "Overdue", label: "Overdue"},
                { value: "Blocked", label: "Blocked"},
                { value: "Completed", label: "Completed"},
              ],
            },
            {
              label: "Priority",
              value: filterPriority,
              onChange: setFilterPriority,
              options: [
                { value: "Critical", label: "Critical"},
                { value: "High", label: "High"},
                { value: "Medium", label: "Medium"},
                { value: "Low", label: "Low"},
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
                Deliverable
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Due Date
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
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">
                  No deliverables match the filters.
                </td>
              </tr>
            )}
            {filtered.map((d) => {
              const isOverdue = d.status === "Overdue";
              return (
                <tr key={d.id} className={`hover:bg-slate-50 transition-colors ${isOverdue ? "bg-red-50/40": ""}`}>
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">{d.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{d.description}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{d.clientName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs rounded font-medium" style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" }}>
                      {d.service}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{d.assignedTo}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <DueDateCell date={d.dueDate} status={d.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={d.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={d.priority} />
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

function DueDateCell({ date, status }: { date: string; status: string }) {
  const due = new Date(date);
  const now = new Date();
  const isOverdue = status === "Overdue"|| (due < now && status !== "Completed");
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isSoon = !isOverdue && diffDays <= 3 && diffDays >= 0;

  return (
    <div>
      <span className={`font-medium text-sm ${isOverdue ? "text-red-600": isSoon ? "text-amber-600": "text-slate-700"}`}>
        {due.toLocaleDateString("en-US", { month: "short", day: "numeric"})}
      </span>
      {isOverdue && <div className="text-xs text-red-500">Overdue</div>}
      {isSoon && !isOverdue && <div className="text-xs text-amber-500">Due soon</div>}
    </div>
  );
}
