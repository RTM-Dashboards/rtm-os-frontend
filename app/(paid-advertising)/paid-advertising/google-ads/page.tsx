"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("paid-advertising")!;

export default function GoogleAdsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Google Ads
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Search, display, and performance campaign management.
        </p>
      </div>

      <SectionWrapper title="Active Campaigns" description="No data connected yet">
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ borderColor: "var(--rtm-border-light)", borderStyle: "dashed", background: "var(--rtm-bg)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Google Ads data not yet connected
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Campaigns, spend, ROAS, and lead counts will appear here once the
            Google Ads API is integrated. Controls are ready.
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/paid-advertising/google-ads/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">Tasks →</Link>
          <Link href="/paid-advertising/google-ads/performance" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Performance →</Link>
        </div>
      </SectionWrapper>

      <div className="flex gap-2">
        <Link href="/paid-advertising" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href="/paid-advertising/meta-ads" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Meta Ads →</Link>
      </div>
    </div>
  );
}
