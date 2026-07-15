"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { DeptRoleToggle, type DeptRole } from "@/components/dept-role-toggle";
import DeptClientDetailDrawer, { type DeptClientRecord } from "@/components/dept/DeptClientDetailDrawer";

const workspace = getWorkspace("local-service-ads")!;

// No dedicated LSA service tag exists in activeServices; show all active
// clients. When an LSA-specific service label is added to the data layer,
// this can be narrowed to filter on that value.
function healthToVariant(health?: string, status?: string): "success" | "info" | "warning" | "pending" {
  if (status === "Inactive" || status === "Churned") return "pending";
  switch (health) {
    case "Excellent":
    case "Good":
      return "success";
    case "Fair":
      return "warning";
    case "At Risk":
      return "pending";
    default:
      return "info";
  }
}

export default function LsaClientsPage() {
  const [clients, setClients] = useState<DeptClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<DeptRole>("member");
  const [selectedClient, setSelectedClient] = useState<DeptClientRecord | null>(null);

  useEffect(() => {
    fetch("/api/master-clients")
      .then((r) => r.json())
      .then((data: { clients: DeptClientRecord[] }) => {
        // Show all clients; no LSA-specific service tag in master data yet
        setClients(data.clients ?? []);
      })
      .catch(() => setError("Failed to load clients"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {selectedClient && (
        <DeptClientDetailDrawer
          client={selectedClient}
          role={role}
          accentColor={workspace.accentColor}
          onClose={() => setSelectedClient(null)}
        />
      )}

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>LSA Clients</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Clients with active Local Service Ads accounts.
        </p>
      </div>

      {/* Role toggle — gates financial visibility */}
      <DeptRoleToggle
        role={role}
        onRoleChange={setRole}
        managerLabel="Manager View"
        memberLabel="Team Member View"
      />

      <SectionWrapper
        title="LSA Clients"
        description={loading ? "Loading…" : error ? error : `${clients.length} clients`}
      >
        {loading ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--rtm-text-muted)" }}>Loading clients…</p>
        ) : error ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--rtm-text-muted)" }}>{error}</p>
        ) : (
          <div className="space-y-2">
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className="flex items-center justify-between p-3 rounded-lg border w-full text-left transition-shadow hover:shadow-sm"
                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", cursor: "pointer" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.clientName}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    {c.assignedAM ? `AM: ${c.assignedAM}` : ""}
                    {/* Monthly value inline — Manager view only */}
                    {role === "manager" && c.monthlyValue ? ` · $${c.monthlyValue.toLocaleString()}/mo` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <StatusBadge
                    variant={healthToVariant(c.clientHealth, c.currentStatus)}
                    label={c.clientHealth ?? c.currentStatus ?? "Active"}
                    size="sm"
                  />
                  <span className="text-[10px]" style={{ color: workspace.accentColor }}>→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </SectionWrapper>

      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href={workspace.tasksRoute} className="rtm-btn-primary text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
