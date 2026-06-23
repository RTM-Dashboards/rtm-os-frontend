"use client";

import React, { useState } from "react";
import { ACTIVATION_RECORDS } from "@/lib/activation-data";
import type { ActivationRecord, ActivationStatus } from "@/types/activation";
import ActivationStatusBadge from "./ActivationStatusBadge";
import ChecklistPanel from "./ChecklistPanel";

const STATUS_OPTIONS: ActivationStatus[] = [
  "Pending Contract",
  "Pending Payment",
  "Pending Assignment",
  "Ready For Launch",
  "Launching",
  "Active",
  "On Hold",
];

function formatCurrency(n: number) {
  return "$"+ n.toLocaleString("en-US");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface RowProps {
  record: ActivationRecord;
  onSelect: (id: string) => void;
  selected: boolean;
}

function QueueRow({ record, onSelect, selected }: RowProps) {
  return (
    <tr
      onClick={() => onSelect(record.id)}
      className="cursor-pointer transition-colors"style={{
        background: selected ? "var(--rtm-blue-xlight)": undefined,
        borderBottom: "1px solid var(--rtm-border-light)",
      }}
      onMouseEnter={(e) => {
        if (!selected) (e.currentTarget as HTMLTableRowElement).style.background = "#F4F7FF";
      }}
      onMouseLeave={(e) => {
        if (!selected) (e.currentTarget as HTMLTableRowElement).style.background = "";
      }}
    >
      <td className="px-4 py-3">
        <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
          {record.client}
        </p>
        <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
          {record.id}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs font-medium"style={{ color: "var(--rtm-text-secondary)"}}>
          {record.contractNumber}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
          {record.proposalId}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-bold"style={{ color: "var(--rtm-blue)"}}>
          {formatCurrency(record.revenue)}
          <span className="text-xs font-normal ml-1"style={{ color: "var(--rtm-text-muted)"}}>
            /mo
          </span>
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {record.servicesSold.map((s) => (
            <span
              key={s}
              className="text-[11px] font-semibold px-1.5 py-0.5 rounded border"style={{
                background: "var(--rtm-blue-xlight)",
                color: "var(--rtm-blue)",
                borderColor: "var(--rtm-blue-light)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {record.departmentsInvolved.map((d) => (
            <span
              key={d}
              className="text-[11px] font-medium px-1.5 py-0.5 rounded border"style={{
                background: "#F5F3FF",
                color: "#5B21B6",
                borderColor: "#DDD6FE",
              }}
            >
              {d}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs font-medium"style={{ color: "var(--rtm-text-secondary)"}}>
          {record.assignedAM}
        </p>
      </td>
      <td className="px-4 py-3">
        <ActivationStatusBadge status={record.activationStatus} />
      </td>
      <td className="px-4 py-3">
        <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
          {formatDate(record.launchDate)}
        </p>
      </td>
      <td className="px-4 py-3">
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"style={{
            background: "var(--rtm-blue)",
            color: "#fff",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(record.id);
          }}
        >
          View
        </button>
      </td>
    </tr>
  );
}

export default function ActivationQueue() {
  const [statusFilter, setStatusFilter] = useState<ActivationStatus | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered =
    statusFilter === "All"? ACTIVATION_RECORDS
      : ACTIVATION_RECORDS.filter((r) => r.activationStatus === statusFilter);

  const selected = ACTIVATION_RECORDS.find((r) => r.id === selectedId) ?? null;

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["All", ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"style={
              statusFilter === s
                ? {
                    background: "var(--rtm-blue)",
                    color: "#fff",
                    borderColor: "var(--rtm-blue)",
                  }
                : {
                    background: "var(--rtm-surface)",
                    color: "var(--rtm-text-secondary)",
                    borderColor: "var(--rtm-border)",
                  }
            }
          >
            {s}
            {s !== "All"&& (
              <span className="ml-1.5 opacity-70">
                ({ACTIVATION_RECORDS.filter((r) => r.activationStatus === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
          boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border)"}}>
                {[
                  "Client",
                  "Contract",
                  "Proposal",
                  "Revenue",
                  "Services Sold",
                  "Departments",
                  "Assigned AM",
                  "Status",
                  "Launch Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)", background: "#FAFBFD"}}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <QueueRow
                  key={r.id}
                  record={r}
                  onSelect={handleSelect}
                  selected={selectedId === r.id}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-sm"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    No records match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div
          className="px-4 py-3 flex items-center justify-between"style={{ borderTop: "1px solid var(--rtm-border-light)"}}
        >
          <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            Showing {filtered.length} of {ACTIVATION_RECORDS.length} records
          </p>
        </div>
      </div>

      {/* Selected record checklist */}
      {selected && (
        <ChecklistPanel record={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
