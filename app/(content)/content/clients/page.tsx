"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("content")!;

const clients = [
  { name: "Apex Roofing",        deliverables: 6, writer: "Alex R.",   plan: "Full Content"},
  { name: "Pacific Dental",      deliverables: 8, writer: "Sarah K.",  plan: "Social + Blog"},
  { name: "Sunbelt HVAC",        deliverables: 4, writer: "Jordan M.", plan: "Blog Only"},
  { name: "Harbor Auto Group",   deliverables: 5, writer: "Alex R.",   plan: "Full Content"},
  { name: "Metro Dental",        deliverables: 3, writer: "Sarah K.",  plan: "Email + Social"},
  { name: "Blue Ridge Plumbing", deliverables: 2, writer: "Jordan M.", plan: "Starter Blog"},
];

export default function ContentClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Content Clients</h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Clients with active content deliverables.</p>
      </div>
      <SectionWrapper title="Content Clients"description={`${clients.length} clients`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clients.map((c) => (
            <div key={c.name} className="p-4 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
              <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{c.name}</p>
              <p className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>{c.plan}</p>
              <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>Writer: {c.writer}</p>
              <p className="text-lg font-bold mt-2"style={{ color: workspace.accentColor }}>{c.deliverables}<span className="text-xs font-normal ml-1"style={{ color: "var(--rtm-text-muted)"}}>deliverables</span></p>
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
