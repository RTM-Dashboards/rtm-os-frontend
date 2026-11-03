"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("paid-advertising")!;

const quickLinks = [
  { label: "Dashboard",    href: "/paid-advertising",                  icon: "", description: "Paid ads overview",      accent: "#1B4FD8"},
  { label: "Google Ads",   href: "/paid-advertising/google-ads",       icon: "", description: "Google Ads campaigns",   accent: "#D97706"},
  { label: "Meta Ads",     href: "/paid-advertising/meta-ads",         icon: "", description: "Meta Ads campaigns",     accent: "#7C3AED"},
  { label: "Clients",      href: "/paid-advertising/clients",          icon: "", description: "Advertising clients",    accent: "#0891B2"},
  { label: "Reports",      href: "/paid-advertising/reports",          icon: "", description: "Paid ads reports",       accent: "#059669"},
];

export default function PaidAdvertisingDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Google Ads, Meta Ads, and paid campaign management."/>

      <WorkspaceQuickLinks links={quickLinks} title="Paid Advertising Workspace — Navigation"/>

      <SectionWrapper title="Active Campaigns" description="No data connected yet">
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ borderColor: "var(--rtm-border-light)", borderStyle: "dashed", background: "var(--rtm-bg)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Campaign data not yet connected
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Campaign summaries, spend, ROAS, and lead counts will appear here once
            Google Ads and Meta Ads APIs are integrated. Controls are ready.
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/paid-advertising/google-ads" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Google Ads →</Link>
          <Link href="/paid-advertising/meta-ads" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Meta Ads →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
