"use client";

import { SectionWrapper, StatusBadge, DataTable, ProgressBar } from "@/components/ui";
import type { Column } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("sales")!;

interface Lead extends Record<string, unknown> {
  name: string; source: string; value: string; stage: string; owner: string; lastContact: string; probability: number;
}

const leads: Lead[] = [
  { name: "Summit Landscaping",  source: "Referral",      value: "$2,400/mo", stage: "proposal",    owner: "Jordan M.", lastContact: "Today",     probability: 75 },
  { name: "Blue Ridge Plumbing", source: "Website",       value: "$1,800/mo", stage: "discovery",   owner: "Sarah K.",  lastContact: "Yesterday", probability: 40 },
  { name: "Harbor Auto Group",   source: "Cold Outreach", value: "$5,000/mo", stage: "negotiation", owner: "Mike T.",   lastContact: "2d ago",    probability: 85 },
  { name: "Cascade Flooring",    source: "LinkedIn",      value: "$3,200/mo", stage: "discovery",   owner: "Alex R.",   lastContact: "3d ago",    probability: 30 },
  { name: "Metro Dental Group",  source: "Referral",      value: "$4,500/mo", stage: "proposal",    owner: "Jordan M.", lastContact: "Today",     probability: 65 },
  { name: "Sunstate Solar",      source: "Google Ads",    value: "$6,000/mo", stage: "closed-won",  owner: "Sarah K.",  lastContact: "1w ago",    probability: 100 },
  { name: "Green Valley Pools",  source: "Website",       value: "$2,000/mo", stage: "discovery",   owner: "Alex R.",   lastContact: "4d ago",    probability: 25 },
  { name: "Apex Dental Partners",source: "Referral",      value: "$8,000/mo", stage: "negotiation", owner: "Mike T.",   lastContact: "Today",     probability: 70 },
];

const columns: Column<Lead>[] = [
  { key: "name",        header: "Company" },
  { key: "source",      header: "Source",       width: "130px" },
  { key: "value",       header: "MRR",          width: "110px" },
  { key: "owner",       header: "Owner",        width: "120px" },
  { key: "lastContact", header: "Last Contact", width: "120px" },
  {
    key: "probability", header: "Win %", width: "130px",
    render: (v) => {
      const n = Number(v);
      return (
        <div className="flex items-center gap-2">
          <ProgressBar value={n} color={n >= 70 ? "bg-emerald-500" : n >= 40 ? "bg-amber-500" : "bg-red-400"} height={5} />
          <span className="text-xs font-semibold text-slate-600 w-8 flex-shrink-0">{n}%</span>
        </div>
      );
    },
  },
  {
    key: "stage", header: "Stage", width: "130px",
    render: (v) => {
      const map: Record<string, { variant: "info"|"pending"|"warning"|"success"; label: string }> = {
        discovery:    { variant: "info",    label: "Discovery"   },
        proposal:     { variant: "pending", label: "Proposal"    },
        negotiation:  { variant: "warning", label: "Negotiation" },
        "closed-won": { variant: "success", label: "Closed Won"  },
      };
      const c = map[String(v)] ?? { variant: "info" as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

export default function SalesLeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Sales</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Leads</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>All active leads and pipeline opportunities.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads",   value: leads.length,                                       bg: "#EFF6FF", color: "#2563EB" },
          { label: "In Proposal",   value: leads.filter(l => l.stage === "proposal").length,   bg: "#F5F3FF", color: "#7C3AED" },
          { label: "Negotiation",   value: leads.filter(l => l.stage === "negotiation").length,bg: "#FFFBEB", color: "#D97706" },
          { label: "Closed Won",    value: leads.filter(l => l.stage === "closed-won").length, bg: "#ECFDF5", color: "#059669" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-4" style={{ background: s.bg, borderColor: `${s.color}20` }}>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      <SectionWrapper title="Lead Pipeline" description={`${leads.length} leads`}>
        <DataTable columns={columns} data={leads} />
        <div className="mt-4">
          <Link href="/sales/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">View Tasks →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
