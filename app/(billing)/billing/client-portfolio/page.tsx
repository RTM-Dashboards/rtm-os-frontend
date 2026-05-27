"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

const clients = [
  { name: "Apex Roofing",         plans: 3, mrr: "$6,200", since: "Jan 2023" },
  { name: "Pacific Dental",       plans: 4, mrr: "$9,100", since: "Mar 2022" },
  { name: "Sunbelt HVAC",         plans: 2, mrr: "$2,800", since: "Sep 2023" },
  { name: "Harbor Auto Group",    plans: 5, mrr: "$11,400",since: "Jun 2021" },
  { name: "Metro Dental",         plans: 2, mrr: "$3,400", since: "Feb 2024" },
  { name: "Blue Ridge Plumbing",  plans: 1, mrr: "$800",   since: "May 2025" },
  { name: "Summit Landscaping",   plans: 3, mrr: "$5,600", since: "Apr 2023" },
  { name: "Green Valley Pools",   plans: 2, mrr: "$2,400", since: "Jul 2023" },
];

export default function BillingPortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Client Portfolio</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>All billed clients and their service totals.</p>
      </div>
      <SectionWrapper title="Client Portfolio" description={`${clients.length} clients`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {clients.map((c) => (
            <div key={c.name} className="p-4 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <p className="text-sm font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
              <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>{c.plans} active plans</p>
              <p className="text-lg font-bold mt-2" style={{ color: "#D97706" }}>{c.mrr}<span className="text-xs font-normal ml-1" style={{ color: "var(--rtm-text-muted)" }}>/mo</span></p>
              <p className="text-[11px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>Since {c.since}</p>
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
