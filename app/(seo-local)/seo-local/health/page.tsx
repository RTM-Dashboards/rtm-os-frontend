"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

interface ClientHealthRow {
  name: string;
  seo: number;
  gbp: number;
  yelp: number;
  status: "success" | "warning" | "info" | "neutral" | "error" | "pending";
  label: string;
}
const clients: ClientHealthRow[] = [
  // No data — not yet connected to a real API source
];

export default function SeoLocalHealthPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Client Health</h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>SEO, GBP and Yelp health scores across all clients.</p>
      </div>

      <SectionWrapper title="Health Scores by Client"description={`${clients.length} clients`}>
        <div className="space-y-2">
          {clients.map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
              <div>
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{c.name}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                  SEO: {c.seo} · GBP: {c.gbp} · Yelp: {c.yelp === 0 ? "—": c.yelp}
                </p>
              </div>
              <StatusBadge variant={c.status} label={c.label} size="sm"/>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <div className="flex gap-2 flex-wrap">
        <Link href="/seo-local/seo/tasks"className="rtm-btn-primary  text-sm inline-flex items-center gap-1">SEO Tasks →</Link>
        <Link href="/seo-local/gbp/tasks"className="rtm-btn-secondary text-sm inline-flex items-center gap-1">GBP Tasks →</Link>
        <Link href="/seo-local/yelp/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Yelp Tasks →</Link>
        <Link href="/seo-local/performance"className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Performance →</Link>
        <Link href={workspace.dashboardRoute}          className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
      </div>
    </div>
  );
}
