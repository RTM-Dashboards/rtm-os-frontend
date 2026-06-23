"use client";

import { useState } from "react";
import type { Integration, IntegrationCategory, IntegrationStatus } from "@/lib/integrations/types";
import IntegrationStatusBadge from "./IntegrationStatusBadge";
import SectionWrapper from "@/components/ui/SectionWrapper";

const CATEGORIES: Array<IntegrationCategory | "All"> = [
  "All", "CRM", "Call Tracking", "Analytics", "Advertising",
  "Communication", "AI", "Storage", "Reporting", "Custom API",
];

const STATUS_FILTERS: Array<IntegrationStatus | "All"> = [
  "All", "connected", "disconnected", "pending", "error",
];

interface Props {
  integrations: Integration[];
  onSelect: (integration: Integration) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric"});
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit"});
}

export default function IntegrationTable({ integrations, onSelect }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | "All">("All");
  const [statusFilter, setStatusFilter]     = useState<IntegrationStatus | "All">("All");
  const [search, setSearch]                 = useState("");

  const filtered = integrations.filter((i) => {
    if (categoryFilter !== "All"&& i.category !== categoryFilter) return false;
    if (statusFilter !== "All"&& i.status !== statusFilter) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <SectionWrapper
      title="Integration Registry"description={`${filtered.length} of ${integrations.length} connectors shown`}
      actions={
        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"style={{ background: "var(--rtm-blue)"}}>
          + Add Connector
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"placeholder="Search integrations..."value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border text-sm"style={{
            background: "var(--rtm-input-bg, #F8FAFC)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as IntegrationCategory | "All")}
          className="px-3 py-2 rounded-lg border text-sm"style={{
            background: "var(--rtm-input-bg, #F8FAFC)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === "All"? "All Categories": c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as IntegrationStatus | "All")}
          className="px-3 py-2 rounded-lg border text-sm"style={{
            background: "var(--rtm-input-bg, #F8FAFC)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>{s === "All"? "All Statuses": s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border"style={{ borderColor: "var(--rtm-border)"}}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--rtm-surface-raised, #F8FAFC)", borderBottom: "1px solid var(--rtm-border)"}}>
              {["Integration Name", "Category", "Status", "Clients Using", "Departments", "Last Sync", "Owner", "Actions"].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm"style={{ color: "var(--rtm-text-muted)"}}>
                  No integrations match the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((integration, idx) => (
                <tr
                  key={integration.id}
                  className="transition-colors cursor-pointer"style={{
                    borderBottom: idx < filtered.length - 1 ? "1px solid var(--rtm-border-light)": undefined,
                    background: "var(--rtm-surface)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--rtm-surface-hover, #F1F5F9)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--rtm-surface)";
                  }}
                  onClick={() => onSelect(integration)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                        {integration.name}
                      </p>
                      <p className="text-xs mt-0.5 truncate max-w-[200px]"style={{ color: "var(--rtm-text-muted)"}}>
                        {integration.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium border"style={{
                        background: "var(--rtm-blue-xlight)",
                        color: "var(--rtm-blue)",
                        borderColor: "var(--rtm-blue-light)",
                      }}
                    >
                      {integration.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <IntegrationStatusBadge status={integration.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span style={{ color: "var(--rtm-text-primary)"}}>
                      {integration.clientsUsing.length}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {integration.departmentsUsing.length === 0 ? (
                        <span style={{ color: "var(--rtm-text-muted)"}}>—</span>
                      ) : (
                        integration.departmentsUsing.slice(0, 2).map((d) => (
                          <span
                            key={d}
                            className="text-[11px] px-1.5 py-0.5 rounded"style={{ background: "var(--rtm-border-light)", color: "var(--rtm-text-secondary, #475569)"}}
                          >
                            {d}
                          </span>
                        ))
                      )}
                      {integration.departmentsUsing.length > 2 && (
                        <span className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>
                          +{integration.departmentsUsing.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {integration.lastSync ? (
                      <div>
                        <p className="text-xs"style={{ color: "var(--rtm-text-primary)"}}>
                          {formatDate(integration.lastSync)}
                        </p>
                        <p className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>
                          {formatTime(integration.lastSync)}
                        </p>
                      </div>
                    ) : (
                      <span style={{ color: "var(--rtm-text-muted)"}}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm"style={{ color: "var(--rtm-text-primary)"}}>
                      {integration.owner}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelect(integration); }}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors"style={{
                          color: "var(--rtm-blue)",
                          borderColor: "var(--rtm-blue-light)",
                          background: "var(--rtm-blue-xlight)",
                        }}
                      >
                        Configure
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors"style={{
                          color: "var(--rtm-text-muted)",
                          borderColor: "var(--rtm-border)",
                          background: "transparent",
                        }}
                      >
                        {integration.enabled ? "Disable": "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
