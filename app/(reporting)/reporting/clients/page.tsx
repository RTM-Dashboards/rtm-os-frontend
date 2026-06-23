"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("reporting")!;

const clients = [
  { name: "Apex Roofing",        completed: 14, lastReport: "Jun 5",  cadence: "Monthly"},
  { name: "Pacific Dental",      completed: 18, lastReport: "Jun 4",  cadence: "Monthly"},
  { name: "Harbor Auto Group",   completed: 11, lastReport: "May 28", cadence: "Monthly"},
  { name: "Summit Landscaping",  completed: 7,  lastReport: "Jun 2",  cadence: "Monthly"},
  { name: "Metro Dental",        completed: 4,  lastReport: "May 30", cadence: "Quarterly"},
  { name: "Blue Ridge Plumbing", completed: 1,  lastReport: "May 15", cadence: "Monthly"},
];

export default function ReportingClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Reporting Clients</h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Clients with active reporting cadences.</p>
      </div>
      <SectionWrapper title="Reporting Clients"description={`${clients.length} clients`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clients.map((c) => (
            <div key={c.name} className="p-4 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
              <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{c.name}</p>
              <p className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>Cadence: {c.cadence}</p>
              <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>Last report: {c.lastReport}</p>
              <p className="text-lg font-bold mt-2"style={{ color: workspace.accentColor }}>{c.completed}<span className="text-xs font-normal ml-1"style={{ color: "var(--rtm-text-muted)"}}>completed</span></p>
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
