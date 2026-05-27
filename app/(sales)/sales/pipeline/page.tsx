"use client";

import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("sales")!;

const stages = [
  {
    label: "Discovery", color: "#2563EB", bg: "#EFF6FF",
    deals: [
      { name: "Blue Ridge Plumbing", value: "$1,800/mo", owner: "Sarah K." },
      { name: "Cascade Flooring",    value: "$3,200/mo", owner: "Alex R."  },
      { name: "Green Valley Pools",  value: "$2,000/mo", owner: "Alex R."  },
    ],
  },
  {
    label: "Proposal", color: "#7C3AED", bg: "#F5F3FF",
    deals: [
      { name: "Summit Landscaping", value: "$2,400/mo", owner: "Jordan M." },
      { name: "Metro Dental Group", value: "$4,500/mo", owner: "Jordan M." },
    ],
  },
  {
    label: "Negotiation", color: "#D97706", bg: "#FFFBEB",
    deals: [
      { name: "Harbor Auto Group",   value: "$5,000/mo", owner: "Mike T." },
      { name: "Apex Dental Partners",value: "$8,000/mo", owner: "Mike T." },
    ],
  },
  {
    label: "Closed Won", color: "#059669", bg: "#ECFDF5",
    deals: [
      { name: "Sunstate Solar", value: "$6,000/mo", owner: "Sarah K." },
    ],
  },
];

export default function SalesPipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Sales</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Pipeline</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Deal flow by stage.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <div key={stage.label}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: stage.color }}>{stage.label}</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: stage.bg, color: stage.color }}>
                {stage.deals.length}
              </span>
            </div>
            <div className="space-y-2">
              {stage.deals.map((d) => (
                <div key={d.name} className="p-3 rounded-lg border" style={{ background: stage.bg, borderColor: `${stage.color}20` }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{d.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{d.value} · {d.owner}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Link href="/sales/leads" className="rtm-btn-primary text-sm inline-flex items-center gap-1">View All Leads →</Link>
        <Link href="/sales/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
