"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { DeptRoleToggle, type DeptRole } from "@/components/dept-role-toggle";
import DeptClientDetailDrawer, { type DeptClientRecord } from "@/components/dept/DeptClientDetailDrawer";
import DeptClientCard from "@/components/dept/DeptClientCard";

const workspace = getWorkspace("web-development-design")!;

// Services that belong to Web Development & Design
const WD_SERVICES = ["Website Build", "Website Maintenance"];

export default function WDClientsPage() {
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
          (c.activeServices ?? []).some((s) => WD_SERVICES.includes(s))
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
          deptServices={WD_SERVICES}
          accentColor={workspace.accentColor}
          onClose={() => setSelectedClient(null)}
        />
      )}

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          Web Development &amp; Design
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Clients</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Clients with active Website Build or Website Maintenance services.
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
        title="Client Projects"
        description={loading ? "Loading…" : error ? error : `${clients.length} active web clients`}
      >
        {loading ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--rtm-text-muted)" }}>Loading clients…</p>
        ) : error ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--rtm-text-muted)" }}>{error}</p>
        ) : clients.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--rtm-text-muted)" }}>No clients with web services found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((c) => (
              <DeptClientCard
                key={c.id}
                client={c}
                role={role}
                accentColor={workspace.accentColor}
                deptServices={WD_SERVICES}
                onClick={setSelectedClient}
              />
            ))}
          </div>
        )}
        <div className="mt-5 flex gap-2 flex-wrap">
          <Link href="/web-development-design/web-development/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">
            WD Tasks →
          </Link>
          <Link href="/web-development-design/design/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            Design Tasks →
          </Link>
          <Link href="/web-development-design" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            Overview →
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
