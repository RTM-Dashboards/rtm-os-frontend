"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

const services = [
  { client: "Apex Roofing",        plan: "Full-Service SEO",        mrr: "$2,400/mo", status: "success" as const, label: "Active"  },
  { client: "Pacific Dental",      plan: "Paid Advertising Bundle", mrr: "$3,800/mo", status: "success" as const, label: "Active"  },
  { client: "Sunbelt HVAC",        plan: "Content Retainer",        mrr: "$1,200/mo", status: "error"   as const, label: "At Risk" },
  { client: "Harbor Auto Group",   plan: "Full-Service Bundle",     mrr: "$5,000/mo", status: "warning" as const, label: "Pausing"},
  { client: "Metro Dental",        plan: "Local Visibility",        mrr: "$1,800/mo", status: "success" as const, label: "Active"  },
  { client: "Blue Ridge Plumbing", plan: "Starter SEO",             mrr: "$800/mo",   status: "info"    as const, label: "New"     },
];

export default function BillingServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Active Services</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>All current client service subscriptions.</p>
      </div>
      <SectionWrapper title="Active Services" description={`${services.length} subscriptions`}>
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.client} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{s.client}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{s.plan}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: "var(--rtm-text-secondary)" }}>{s.mrr}</span>
                <StatusBadge variant={s.status} label={s.label} size="sm" />
              </div>
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
