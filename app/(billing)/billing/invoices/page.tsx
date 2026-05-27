"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

const invoices = [
  { id: "INV-2410", client: "Apex Roofing",        amount: "$6,200", due: "Jun 1",  status: "success" as const, label: "Paid"    },
  { id: "INV-2411", client: "Pacific Dental",       amount: "$9,100", due: "Jun 1",  status: "success" as const, label: "Paid"    },
  { id: "INV-2412", client: "Green Valley Pools",   amount: "$2,400", due: "May 28", status: "error"   as const, label: "Overdue" },
  { id: "INV-2413", client: "Sunbelt HVAC",         amount: "$2,800", due: "Jun 5",  status: "pending" as const, label: "Pending" },
  { id: "INV-2414", client: "Harbor Auto Group",    amount: "$11,400",due: "Jun 7",  status: "pending" as const, label: "Pending" },
  { id: "INV-2415", client: "Blue Ridge Plumbing",  amount: "$800",   due: "Jun 10", status: "info"    as const, label: "New"     },
];

export default function BillingInvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Invoices</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Invoice tracking and payment status.</p>
      </div>
      <SectionWrapper title="Invoice Ledger" description={`${invoices.length} invoices this cycle`}>
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{inv.client}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{inv.id} · Due {inv.due}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: "var(--rtm-text-secondary)" }}>{inv.amount}</span>
                <StatusBadge variant={inv.status} label={inv.label} size="sm" />
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
