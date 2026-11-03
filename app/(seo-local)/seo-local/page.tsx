"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

const quickLinks = [
  { label: "SEO-Local",         href: "/seo-local",                  icon: "", description: "SEO & Local overview",   accent: "#2563EB"},
  { label: "SEO",               href: "/seo-local/seo",              icon: "", description: "Organic SEO",            accent: "#7C3AED"},
  { label: "GBP",               href: "/seo-local/gbp",              icon: "", description: "Google Business Profile", accent: "#D97706"},
  { label: "Yelp",              href: "/seo-local/yelp",             icon: "", description: "Yelp management",        accent: "#DC2626"},
  { label: "Clients",           href: "/seo-local/clients",          icon: "", description: "SEO clients",            accent: "#059669"},
  { label: "Health",            href: "/seo-local/health",           icon: "", description: "Client health overview",  accent: "#0891B2"},
];

export default function SeoLocalDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Organic SEO, GBP optimization, Yelp, and keyword rankings."/>

      <WorkspaceQuickLinks links={quickLinks} title="SEO & Local Workspace — Navigation"/>

      <SectionWrapper title="SEO & Local Overview" description="No data connected yet">
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ borderColor: "var(--rtm-border-light)", borderStyle: "dashed", background: "var(--rtm-bg)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            SEO and local data not yet connected
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Client health scores, activity, and performance metrics will appear
            here once SEO analytics integrations are configured. Controls are ready.
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/seo-local/seo/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">SEO Tasks →</Link>
          <Link href="/seo-local/clients" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Clients →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
