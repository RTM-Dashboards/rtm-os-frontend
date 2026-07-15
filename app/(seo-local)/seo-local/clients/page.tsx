"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { DeptRoleToggle, type DeptRole } from "@/components/dept-role-toggle";
import DeptClientDetailDrawer, { type DeptClientRecord } from "@/components/dept/DeptClientDetailDrawer";

const workspace = getWorkspace("seo-local")!;

const SEO_LOCAL_SERVICES = ["SEO", "SEO / GBP", "GBP", "Yelp Ads"];

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

export default function SeoLocalClientsPage() {
  const [clients, setClients] = useState<DeptClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<DeptRole>("member");
  const [selectedClient, setSelectedClient] = useState<DeptClientRecord | null>(null);

  useEffect(() => {
    fetch("/api/master-clients")
      .then((r) => r.json())
      .then((data: { clients: DeptClientRecord[] }) => {
        const filtered = (data.clients ?? []).filter((c) =>
          (c.activeServices ?? []).some((s) => SEO_LOCAL_SERVICES.includes(s))
        );
        setClients(filtered);
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
          deptServices={SEO_LOCAL_SERVICES}
          accentColor={workspace.accentColor}
          onClose={() => setSelectedClient(null)}
        />
      )}

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          SEO &amp; Local Clients
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Clients with active SEO, GBP, or Yelp Ads services.
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
        title="SEO &amp; Local Clients"
        description={loading ? "Loading…" : error ? error : `${clients.length} clients`}
      >
        {loading ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--rtm-text-muted)" }}>
            Loading clients…
          </p>
        ) : error ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--rtm-text-muted)" }}>{error}</p>
        ) : clients.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--rtm-text-muted)" }}>
            No clients with SEO &amp; Local services found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className="p-4 rounded-xl border flex flex-col gap-2 text-left w-full transition-shadow hover:shadow-md"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", cursor: "pointer" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                    {c.clientName}
                  </p>
                  <StatusBadge
                    variant={healthToVariant(c.clientHealth, c.currentStatus)}
                    label={c.clientHealth ?? c.currentStatus ?? "Active"}
                    size="sm"
                  />
                </div>
                <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  {(c.activeServices ?? [])
                    .filter((s) => SEO_LOCAL_SERVICES.includes(s))
                    .join(" · ")}
                </p>
                {c.assignedAM && (
                  <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                    AM: {c.assignedAM}
                  </p>
                )}
                {/* Monthly value — Manager view only */}
                {role === "manager" && c.monthlyValue !== undefined && (
                  <p className="text-base font-bold mt-1" style={{ color: workspace.accentColor }}>
                    ${c.monthlyValue.toLocaleString()}
                    <span className="text-xs font-normal ml-1" style={{ color: "var(--rtm-text-muted)" }}>
                      /mo
                    </span>
                  </p>
                )}
                <p className="text-[10px] mt-auto pt-1" style={{ color: workspace.accentColor }}>
                  Click to view details →
                </p>
              </button>
            ))}
          </div>
        )}
      </SectionWrapper>

      <div className="flex gap-2 flex-wrap">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          ← Overview
        </Link>
        <Link href="/seo-local/health" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          Client Health →
        </Link>
        <Link href={workspace.tasksRoute} className="rtm-btn-primary text-sm inline-flex items-center gap-1">
          Tasks →
        </Link>
      </div>
    </div>
  );
}
