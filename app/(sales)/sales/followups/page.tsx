"use client";

import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("sales")!;

const followups = [
  { prospect: "Summit Landscaping",  owner: "Jordan M.", date: "Jun 5",  type: "Proposal Review",  status: "due"      },
  { prospect: "Harbor Auto Group",   owner: "Mike T.",   date: "Jun 6",  type: "Negotiation Call", status: "upcoming" },
  { prospect: "Metro Dental Group",  owner: "Jordan M.", date: "Jun 7",  type: "Discovery Call",   status: "upcoming" },
  { prospect: "Blue Ridge Plumbing", owner: "Sarah K.",  date: "Jun 8",  type: "Check-in Email",   status: "upcoming" },
  { prospect: "Cascade Flooring",    owner: "Alex R.",   date: "Jun 9",  type: "Discovery Call",   status: "upcoming" },
  { prospect: "Green Valley Pools",  owner: "Alex R.",   date: "Jun 10", type: "Intro Email",      status: "upcoming" },
];

const variantMap: Record<string, "warning"|"info"|"success"> = {
  due: "warning", upcoming: "info", done: "success",
};

export default function SalesFollowupsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Sales</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Follow-ups</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Scheduled touchpoints and outreach reminders.</p>
      </div>

      <SectionWrapper title="Upcoming Follow-ups" description={`${followups.length} scheduled`}>
        <div className="space-y-2">
          {followups.map((f) => (
            <div key={f.prospect} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{f.prospect}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{f.type} · {f.owner}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: "var(--rtm-text-secondary)" }}>{f.date}</span>
                <StatusBadge variant={variantMap[f.status]} label={f.status.charAt(0).toUpperCase() + f.status.slice(1)} size="sm" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/sales/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">View Tasks →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
