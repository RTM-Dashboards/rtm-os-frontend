"use client";

import { useState, useMemo } from "react";
import type { Blocker } from "@/lib/account-management/types";
import { StatusBadge } from "./StatusBadge";
import { SearchFilter } from "./SearchFilter";
import { SectionCard } from "./SectionCard";

interface BlockersTableProps {
  blockers: Blocker[];
}

export function BlockersTable({ blockers }: BlockersTableProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBlockedBy, setFilterBlockedBy] = useState("");

  const filtered = useMemo(() => {
    return blockers.filter((b) => {
      const q = search.toLowerCase();
      if (
        q &&
        !b.clientName.toLowerCase().includes(q) &&
        !b.title.toLowerCase().includes(q) &&
        !b.assignedAM.toLowerCase().includes(q)
      )
        return false;
      if (filterStatus && b.status !== filterStatus) return false;
      if (filterBlockedBy && b.blockedBy !== filterBlockedBy) return false;
      return true;
    });
  }, [blockers, search, filterStatus, filterBlockedBy]);

  const openCount = blockers.filter(
    (b) => b.status === "Open" || b.status === "Awaiting Client" || b.status === "In Review"
  ).length;

  return (
    <SectionCard
      title="Blockers"
      subtitle="Items blocking progress"
      badge={openCount > 0 ? `${openCount} active` : "0"}
      badgeVariant={openCount > 0 ? "warning" : "default"}
    >
      <div className="px-5 py-3 border-b border-slate-100">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search blockers..."
          resultCount={filtered.length}
          filters={[
            {
              label: "Status",
              value: filterStatus,
              onChange: setFilterStatus,
              options: [
                { value: "Open", label: "Open" },
                { value: "In Review", label: "In Review" },
                { value: "Awaiting Client", label: "Awaiting Client" },
                { value: "Resolved", label: "Resolved" },
              ],
            },
            {
              label: "Blocked By",
              value: filterBlockedBy,
              onChange: setFilterBlockedBy,
              options: [
                { value: "Client", label: "Client" },
                { value: "Internal", label: "Internal" },
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
                Blocker
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Blocked By
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Assigned AM
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Date Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">
                  No blockers found.
                </td>
              </tr>
            )}
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="font-medium text-slate-900">{b.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5 max-w-xs">{b.impact}</div>
                </td>
                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{b.clientName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      b.blockedBy === "Client"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {b.blockedBy}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{b.assignedAM}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {new Date(b.dateCreated).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
