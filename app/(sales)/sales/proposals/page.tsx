"use client";

import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("sales")!;

const templates = [
  { name: "Full-Service SEO Package",   desc: "Includes on-page, off-page, GBP and monthly reporting.", tier: "Standard" },
  { name: "Paid Advertising Bundle",    desc: "Meta + Google Ads management with monthly performance review.", tier: "Premium" },
  { name: "Website Redesign",           desc: "Custom WordPress build, mobile-first, 30-day support.", tier: "Project" },
  { name: "Local Visibility Package",   desc: "GBP, Yelp, LSA and citation management.", tier: "Standard" },
  { name: "Content Marketing Retainer", desc: "4 blogs/mo, social calendar, email newsletter.", tier: "Standard" },
  { name: "Enterprise Agency Bundle",   desc: "All services combined with a dedicated account manager.", tier: "Enterprise" },
];

export default function SalesProposalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Sales</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Proposal Generator</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Select a template to build a custom proposal.</p>
      </div>

      <div
        className="rounded-xl border p-8 flex flex-col items-center gap-3 text-center"
        style={{ background: "var(--rtm-blue-xlight)", borderColor: "#1B4FD820" }}
      >
        <span className="text-5xl">📝</span>
        <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>Proposal Builder</h2>
        <p className="text-sm max-w-md" style={{ color: "var(--rtm-text-secondary)" }}>
          This is a placeholder for the Proposal Generator. Choose a package template below and customize for your prospect.
        </p>
        <button className="rtm-btn-primary mt-2">+ New Proposal</button>
      </div>

      <SectionWrapper title="Proposal Templates" description="Pre-built packages — click to customize">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((t) => (
            <div
              key={t.name}
              className="p-4 rounded-lg border cursor-pointer transition-all"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1B4FD8"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--rtm-border-light)"; }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{t.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>{t.tier}</span>
              </div>
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/sales/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Sales Tasks →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
