"use client";

/**
 * Active Services — Billing Source of Truth
 *
 * Subscriptions are billing records. This page shows the full set of
 * active client subscriptions derived from MASTER_CLIENTS.activeServices[].
 *
 * DATA SOURCE: /api/master-clients (file-backed, cross-route-group reliable)
 * Seed: MASTER_CLIENTS in-memory singleton (hydrated on mount from the API)
 *
 * EDIT PATH: Client Portfolio › Update Billing Fields (UpdateStatusModal)
 *   — the only place to edit a client's activeServices, via patchMasterClient().
 *
 * Each client.activeServices entry becomes one row. MRR is shared from the
 * client's monthlyValue (divided evenly across their services). Status is
 * derived from clientHealth / billingStatus (Billing-owned field).
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { MASTER_CLIENTS } from "@/lib/mock/master-clients";
import { fetchMasterClients } from "@/lib/mock/master-clients-api";
import { inferServiceType } from "@/lib/billing/service-utils";
import type { MasterClient, HealthStatus, BillingStatus } from "@/lib/mock/master-clients";

const workspace = getWorkspace("billing")!;

// ── Derived service row type ──────────────────────────────────────────────────

type ServiceStatus = "Active" | "At Risk" | "Critical" | "Pausing" | "New";
type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

function statusVariant(s: ServiceStatus): BadgeVariant {
  switch (s) {
    case "Active":   return "success";
    case "At Risk":  return "warning";
    case "Critical": return "error";
    case "Pausing":  return "warning";
    case "New":      return "info";
    default:         return "neutral";
  }
}

/** Derive a user-facing service status from client-level billing + health fields. */
function deriveServiceStatus(
  health: HealthStatus,
  billingStatus: BillingStatus,
  activationStatus: MasterClient["activationStatus"],
): ServiceStatus {
  if (health === "Critical") return "Critical";
  if (health === "At Risk" || billingStatus === "Overdue") return "At Risk";
  if (billingStatus === "Pending" && activationStatus === "Not Started") return "New";
  if (billingStatus === "Pending") return "Pausing";
  return "Active";
}

interface ServiceRow {
  rowKey: string;         // unique key per row
  clientId: string;
  client: string;
  serviceName: string;
  serviceType: string;
  /** Per-service MRR = floor(monthlyValue / serviceCount). Last service gets the remainder. */
  mrrValue: number;
  status: ServiceStatus;
  billingOwner: string;
  industry: string;
}

/** Expand a MasterClient into one ServiceRow per activeServices entry. */
function expandClientToRows(c: MasterClient): ServiceRow[] {
  if (c.activeServices.length === 0) return [];
  const count = c.activeServices.length;
  const perService = Math.floor(c.monthlyValue / count);
  const remainder = c.monthlyValue - perService * count;
  const derivedStatus = deriveServiceStatus(c.clientHealth, c.billingStatus, c.activationStatus);

  return c.activeServices.map((svcName, idx) => ({
    rowKey: `${c.id}__${idx}`,
    clientId: c.id,
    client: c.clientName,
    serviceName: svcName,
    serviceType: inferServiceType(svcName),
    // last service gets any remaining cents to match the total exactly
    mrrValue: idx === count - 1 ? perService + remainder : perService,
    status: derivedStatus,
    billingOwner: c.billingOwner,
    industry: c.industry,
  }));
}

// ── Service type set — derived from real rows ─────────────────────────────────

const allStatuses: (ServiceStatus | "All")[] = ["All", "Active", "At Risk", "Critical", "Pausing", "New"];

// ── Table primitives ──────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2 whitespace-nowrap border-b"
      style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-alt, #F9FAFB)" }}>
      {children}
    </th>
  );
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td className="px-3 py-2.5 text-sm whitespace-nowrap border-b"
      style={{ color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)" }}>
      {children}
    </td>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingServicesPage() {
  const [clients, setClients] = useState<MasterClient[]>(MASTER_CLIENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Hydrate from file-backed API (handles cross-route-group edits from Client Portfolio)
  useEffect(() => {
    fetchMasterClients()
      .then((live) => setClients(live))
      .catch(() => { /* keep seed */ });
  }, []);

  // Expand all clients into service rows (only clients with at least one service)
  const allRows: ServiceRow[] = clients.flatMap(expandClientToRows);

  // Derive service types for filter dropdown
  const allServiceTypes = ["All", ...Array.from(new Set(allRows.map((r) => r.serviceType))).sort()];

  const filtered = allRows.filter((r) => {
    const matchesSearch =
      search.trim() === "" ||
      r.client.toLowerCase().includes(search.toLowerCase()) ||
      r.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      r.serviceType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    const matchesType = typeFilter === "All" || r.serviceType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalMRR = filtered.reduce((s, r) => s + r.mrrValue, 0);

  // KPI counts from ALL rows (unfiltered)
  const activeCount   = allRows.filter((r) => r.status === "Active").length;
  const atRiskCount   = allRows.filter((r) => r.status === "At Risk").length;
  const criticalCount = allRows.filter((r) => r.status === "Critical").length;
  const newCount      = allRows.filter((r) => r.status === "New").length;
  const pausingCount  = allRows.filter((r) => r.status === "Pausing").length;

  // Unique client count
  const uniqueClientCount = new Set(allRows.map((r) => r.clientId)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Active Services</h1>
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          All current client service subscriptions — {allRows.length} subscription{allRows.length !== 1 ? "s" : ""} across {uniqueClientCount} client{uniqueClientCount !== 1 ? "s" : ""}.
          Derived from <strong>MASTER_CLIENTS.activeServices[]</strong>. Billing is the source of truth for active services.
        </p>
      </div>

      {/* Data-source notice */}
      <div className="rounded-lg border px-4 py-3 flex items-start gap-3" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
        <svg width="16" height="16" className="flex-shrink-0 mt-0.5" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm" style={{ color: "#065F46" }}>
          <span className="font-bold">Real data.</span>{" "}
          Rows are derived live from <code className="font-mono text-xs">MASTER_CLIENTS.activeServices[]</code>.
          To add, remove, or change a client&apos;s services, use{" "}
          <Link href="/billing/client-portfolio" className="font-bold underline">Client Portfolio → Update Billing Fields</Link>.
          Changes persist immediately via <code className="font-mono text-xs">patchMasterClient()</code> and are reflected here on reload.
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Subscriptions", value: allRows.length,    color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE" },
          { label: "Active",              value: activeCount,        color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
          { label: "At Risk",             value: atRiskCount,        color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
          { label: "Critical",            value: criticalCount,      color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className="rounded-xl border p-4 flex flex-col gap-1" style={{ background: bg, borderColor: border }}>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>{label}</span>
            <span className="text-3xl font-black" style={{ color }}>{value}</span>
          </div>
        ))}
        {newCount > 0 && (
          <div className="rounded-xl border p-4 flex flex-col gap-1" style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#0891B2" }}>New</span>
            <span className="text-3xl font-black" style={{ color: "#0891B2" }}>{newCount}</span>
          </div>
        )}
        {pausingCount > 0 && (
          <div className="rounded-xl border p-4 flex flex-col gap-1" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#D97706" }}>Pausing</span>
            <span className="text-3xl font-black" style={{ color: "#D97706" }}>{pausingCount}</span>
          </div>
        )}
      </div>

      {/* Filters + Table */}
      <SectionWrapper
        title={`Active Services (${filtered.length} of ${allRows.length})`}
        description={`MRR shown: $${totalMRR.toLocaleString()}/mo`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: "var(--rtm-text-muted)" }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text" placeholder="Search…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm pl-8 pr-3 py-1.5 rounded-lg border focus:outline-none"
                style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)", width: 160 }}
              />
            </div>
            {allStatuses.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s as ServiceStatus | "All")}
                className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
                style={statusFilter === s
                  ? { background: "#1B4FD8", color: "#fff", borderColor: "#1B4FD8" }
                  : { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }
                }>
                {s}
              </button>
            ))}
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg border focus:outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)" }}>
              {allServiceTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Service</Th>
                <Th>Type</Th>
                <Th>MRR (pro-rated)</Th>
                <Th>Status</Th>
                <Th>Billing Owner</Th>
                <Th>Industry</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    {allRows.length === 0
                      ? "No clients have active services yet. Add services via Client Portfolio → Update Billing Fields."
                      : "No services match your filters."}
                  </td>
                </tr>
              ) : filtered.map((row) => (
                <tr key={row.rowKey}
                  className="transition-colors"
                  style={{
                    background:
                      row.status === "Critical" ? "#FFF1F2" :
                      row.status === "At Risk"  ? "#FFFBEB" :
                      row.status === "New"      ? "#F0F9FF" :
                      "var(--rtm-bg)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg-alt, #F9FAFB)"; }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      row.status === "Critical" ? "#FFF1F2" :
                      row.status === "At Risk"  ? "#FFFBEB" :
                      row.status === "New"      ? "#F0F9FF" :
                      "var(--rtm-bg)";
                  }}>
                  <Td><span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{row.client}</span></Td>
                  <Td>{row.serviceName}</Td>
                  <Td muted>{row.serviceType}</Td>
                  <Td>
                    <span className="font-bold" style={{ color: "#059669" }}>
                      ${row.mrrValue.toLocaleString()}/mo
                    </span>
                  </Td>
                  <Td><StatusBadge variant={statusVariant(row.status)} label={row.status} size="sm" /></Td>
                  <Td muted>{row.billingOwner}</Td>
                  <Td muted>{row.industry}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MRR Summary */}
        <div className="mt-4 flex items-center justify-between px-1">
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Showing {filtered.length} subscription{filtered.length !== 1 ? "s" : ""} across {new Set(filtered.map((r) => r.clientId)).size} client{new Set(filtered.map((r) => r.clientId)).size !== 1 ? "s" : ""}
          </p>
          <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            MRR shown: <span style={{ color: "#059669" }}>${totalMRR.toLocaleString()}/mo</span>
          </p>
        </div>
      </SectionWrapper>

      {/* Footer */}
      <div className="flex gap-2 flex-wrap">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm">← Dashboard</Link>
        <Link href="/billing/client-portfolio" className="rtm-btn-primary text-sm">Edit Services (Client Portfolio) →</Link>
        <Link href="/billing/recurring-revenue" className="rtm-btn-secondary text-sm">Recurring Revenue →</Link>
        <Link href="/billing/invoices" className="rtm-btn-secondary text-sm">Invoices →</Link>
      </div>
    </div>
  );
}
