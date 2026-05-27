"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("local-service-ads")!;

const clients = [
  { name: "Apex Roofing",         leads: 42, rating: "4.9", spend: "$1,200/mo", status: "success" as const, label: "Active"    },
  { name: "Pacific Dental",       leads: 38, rating: "4.8", spend: "$900/mo",   status: "success" as const, label: "Active"    },
  { name: "Harbor Auto Group",    leads: 31, rating: "4.4", spend: "$800/mo",   status: "warning" as const, label: "Watch"     },
  { name: "Summit Landscaping",   leads: 29, rating: "4.7", spend: "$700/mo",   status: "success" as const, label: "Active"    },
  { name: "Metro Dental",         leads: 14, rating: "4.2", spend: "$500/mo",   status: "success" as const, label: "Active"    },
  { name: "Blue Ridge Plumbing",  leads: 0,  rating: "—",   spend: "$500/mo",   status: "info"    as const, label: "Setting Up"},
];

export default function LsaClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>LSA Clients</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Clients with active Local Service Ads accounts.</p>
      </div>
      <SectionWrapper title="LSA Clients" description={`${clients.length} accounts`}>
        <div className="space-y-2">
          {clients.map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  {c.rating !== "—" ? `★ ${c.rating}` : "No rating"} · {c.leads} leads · {c.spend}
                </p>
              </div>
              <StatusBadge variant={c.status} label={c.label} size="sm" />
            </div>
          ))}
        </div>
      </SectionWrapper>
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href={workspace.tasksRoute}     className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
