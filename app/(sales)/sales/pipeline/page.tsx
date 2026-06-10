"use client";

import { useState } from "react";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("sales")!;

type ReferralSource = "Direct" | "Affiliate" | "Partner" | "Employee" | "Client Referral";

interface Deal {
  name: string;
  value: string;
  owner: string;
  referralSource: ReferralSource;
  affiliateName?: string;
}

const REFERRAL_SOURCE_COLORS: Record<ReferralSource, { color: string; bg: string }> = {
  "Direct":          { color: "#2563EB", bg: "#EFF6FF" },
  "Affiliate":       { color: "#059669", bg: "#ECFDF5" },
  "Partner":         { color: "#7C3AED", bg: "#F5F3FF" },
  "Employee":        { color: "#0891B2", bg: "#ECFEFF" },
  "Client Referral": { color: "#D97706", bg: "#FFFBEB" },
};

const stages: { label: string; color: string; bg: string; deals: Deal[] }[] = [
  {
    label: "Discovery", color: "#2563EB", bg: "#EFF6FF",
    deals: [
      { name: "Blue Ridge Plumbing", value: "$1,800/mo", owner: "Sarah K.",  referralSource: "Affiliate",       affiliateName: "Tyler Nguyen" },
      { name: "Cascade Flooring",    value: "$3,200/mo", owner: "Alex R.",   referralSource: "Direct" },
      { name: "Green Valley Pools",  value: "$2,000/mo", owner: "Alex R.",   referralSource: "Client Referral" },
    ],
  },
  {
    label: "Proposal", color: "#7C3AED", bg: "#F5F3FF",
    deals: [
      { name: "Summit Landscaping", value: "$2,400/mo", owner: "Jordan M.", referralSource: "Affiliate",       affiliateName: "Brandon Ellis" },
      { name: "Metro Dental Group", value: "$4,500/mo", owner: "Jordan M.", referralSource: "Partner" },
    ],
  },
  {
    label: "Negotiation", color: "#D97706", bg: "#FFFBEB",
    deals: [
      { name: "Harbor Auto Group",    value: "$5,000/mo", owner: "Mike T.", referralSource: "Direct" },
      { name: "Apex Dental Partners", value: "$8,000/mo", owner: "Mike T.", referralSource: "Affiliate", affiliateName: "Maria Santos" },
    ],
  },
  {
    label: "Closed Won", color: "#059669", bg: "#ECFDF5",
    deals: [
      { name: "Sunstate Solar",       value: "$6,000/mo", owner: "Sarah K.", referralSource: "Affiliate", affiliateName: "Brandon Ellis" },
      { name: "Coastal Wellness Spa", value: "$3,800/mo", owner: "Jordan M.", referralSource: "Affiliate", affiliateName: "Lisa Park" },
    ],
  },
];

const ALL_SOURCES: ReferralSource[] = ["Direct", "Affiliate", "Partner", "Employee", "Client Referral"];
const ALL_AFFILIATES = ["Brandon Ellis", "Maria Santos", "Tyler Nguyen", "Lisa Park", "Carlos Reyes"];

export default function SalesPipelinePage() {
  const [filterSource, setFilterSource] = useState<ReferralSource | "All">("All");
  const [filterAffiliate, setFilterAffiliate] = useState<string>("All");

  const filteredStages = stages.map((stage) => ({
    ...stage,
    deals: stage.deals.filter((d) => {
      const srcMatch = filterSource === "All" || d.referralSource === filterSource;
      const affMatch = filterAffiliate === "All" || d.affiliateName === filterAffiliate;
      return srcMatch && affMatch;
    }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Sales</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Pipeline</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Deal flow by stage with referral source tracking.</p>
      </div>

      {/* Referral Source Legend */}
      <div className="flex flex-wrap gap-2">
        {ALL_SOURCES.map((s) => (
          <span key={s} className="text-[10px] font-bold px-2.5 py-1 rounded-full border" style={{ background: REFERRAL_SOURCE_COLORS[s].bg, color: REFERRAL_SOURCE_COLORS[s].color, borderColor: `${REFERRAL_SOURCE_COLORS[s].color}30` }}>
            {s}
          </span>
        ))}
      </div>

      {/* Filters */}
      <SectionWrapper title="Filters" description="Filter pipeline by referral source or affiliate">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Referral Source</label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as ReferralSource | "All")}
              className="text-xs rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            >
              <option value="All">All Sources</option>
              {ALL_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Affiliate</label>
            <select
              value={filterAffiliate}
              onChange={(e) => setFilterAffiliate(e.target.value)}
              className="text-xs rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            >
              <option value="All">All Affiliates</option>
              {ALL_AFFILIATES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {(filterSource !== "All" || filterAffiliate !== "All") && (
            <div className="flex items-end">
              <button
                onClick={() => { setFilterSource("All"); setFilterAffiliate("All"); }}
                className="text-xs font-semibold px-3 py-2 rounded-lg border"
                style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </SectionWrapper>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredStages.map((stage) => (
          <div key={stage.label}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: stage.color }}>{stage.label}</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: stage.bg, color: stage.color }}>
                {stage.deals.length}
              </span>
            </div>
            <div className="space-y-2">
              {stage.deals.length === 0 ? (
                <div className="p-3 rounded-lg border border-dashed text-center" style={{ borderColor: "var(--rtm-border)" }}>
                  <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No deals</p>
                </div>
              ) : stage.deals.map((d) => {
                const srcStyle = REFERRAL_SOURCE_COLORS[d.referralSource];
                return (
                  <div key={d.name} className="p-3 rounded-lg border" style={{ background: stage.bg, borderColor: `${stage.color}20` }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{d.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{d.value} · {d.owner}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: srcStyle.bg, color: srcStyle.color }}>
                        {d.referralSource}
                      </span>
                      {d.affiliateName && (
                        <span className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
                          via {d.affiliateName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Link href="/sales/leads" className="rtm-btn-primary text-sm inline-flex items-center gap-1">View All Leads →</Link>
        <Link href="/sales/affiliates" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Affiliates →</Link>
        <Link href="/sales/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
