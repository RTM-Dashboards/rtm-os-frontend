"use client";

import React from "react";
import Link from "next/link";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PRIORITY_ACTIONS = [
  { label: "Overdue Follow-Ups",           value: 4,  href: "/sales/followups",   warning: true },
  { label: "Proposals Awaiting Approval",  value: 3,  href: "/sales/proposals",   warning: true },
  { label: "Handoffs Pending Submission",  value: 2,  href: "/sales/handoffs",    warning: false },
  { label: "Leads Ready for Intake",       value: 7,  href: "/sales/leads",       warning: false },
];

const PIPELINE_KPIS = [
  { label: "Open Opportunities",       value: "18",        },
  { label: "Pipeline Value",           value: "$94,200/mo" },
  { label: "Closing This Month",       value: "5"          },
  { label: "Win Rate",                 value: "48%"        },
  { label: "Proposals Sent This Month",value: "11"         },
  { label: "Revenue This Month",       value: "$21,400"    },
];

const RECENT_ACTIVITY = [
  { action: "Proposal sent",       client: "Harbor Auto Group",       rep: "Mike T.",    timeAgo: "12 min ago",  href: "/sales/proposals"     },
  { action: "Audit completed",     client: "Metro Dental Group",      rep: "Jordan M.",  timeAgo: "45 min ago",  href: "/sales/audits"        },
  { action: "Lead created",        client: "Peak Performance Chiro",  rep: "Jordan M.",  timeAgo: "1 hr ago",    href: "/sales/leads"         },
  { action: "Follow-up overdue",   client: "Patel Dental Group",      rep: "Sarah K.",   timeAgo: "2 hr ago",    href: "/sales/followups"     },
  { action: "Intake submitted",    client: "NovaCare Physical Therapy",rep: "Sarah K.",  timeAgo: "3 hr ago",    href: "/sales/intake"        },
  { action: "Proposal approved",   client: "Flores Urgent Care",      rep: "Sarah K.",   timeAgo: "4 hr ago",    href: "/sales/proposals"     },
  { action: "Discovery call done", client: "Morrison HVAC",            rep: "Alex R.",    timeAgo: "5 hr ago",    href: "/sales/leads"         },
  { action: "Recommendation sent", client: "Sunstate Solar",           rep: "Sarah K.",   timeAgo: "Yesterday",   href: "/sales/recommendations"},
  { action: "Contract signed",     client: "Kline Law Group",         rep: "Jordan M.",  timeAgo: "Yesterday",   href: "/sales/contracts"     },
  { action: "Handoff submitted",   client: "Torres Landscaping",      rep: "Mike T.",    timeAgo: "2 days ago",  href: "/sales/handoffs"      },
];

const QUICK_LINKS = [
  { label: "Pipeline",     desc: "Track open opportunities and deal stages.",       href: "/sales/pipeline"    },
  { label: "Follow Ups",   desc: "Manage overdue and upcoming follow-up tasks.",    href: "/sales/followups"   },
  { label: "Proposals",    desc: "View, edit, and send client proposals.",          href: "/sales/proposals"   },
  { label: "Performance",  desc: "KPIs, rep metrics, and revenue forecasting.",     href: "/sales/performance" },
];

function PreviewBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
    >
      Preview — Target State
    </span>
  );
}

function initials(name: string): string {
  return name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalesDashboard() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#059669" }}>
            Sales
          </p>
          <h1 className="text-2xl font-medium tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Sales Dashboard
          </h1>
          <div className="mt-2"><PreviewBadge /></div>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            Your sales workspace — leads, pipeline, and workflow.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          <Link href="/sales/leads?action=add-lead"
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
            style={{ background: "#059669", color: "#fff", borderColor: "#059669" }}>
            Add Lead
          </Link>
          <Link href="/sales/intake?source=new-audit"
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
            style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }}>
            New Audit
          </Link>
          <Link href="/sales/pipeline"
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
            style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }}>
            View Pipeline
          </Link>
        </div>
      </div>

      {/* Section 1 — Priority Actions */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Priority Actions
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PRIORITY_ACTIONS.map((item) => (
            <Link key={item.label} href={item.href}
              className="rounded-xl border p-4 block transition-all hover:shadow-md"
              style={{
                background: item.warning ? "#FFFBEB" : "var(--rtm-surface)",
                borderColor: item.warning ? "#FDE68A" : "var(--rtm-border)",
              }}>
              <p className="text-2xl font-bold" style={{ color: item.warning ? "#D97706" : "var(--rtm-text-primary)" }}>
                {item.value}
              </p>
              <p className="text-xs font-semibold mt-1" style={{ color: item.warning ? "#D97706" : "var(--rtm-text-secondary)" }}>
                {item.label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Section 2 — Pipeline KPIs */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Pipeline KPIs
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {PIPELINE_KPIS.map((kpi) => (
            <div key={kpi.label}
              className="rounded-xl border p-4"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <p className="text-xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>{kpi.value}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: "var(--rtm-text-muted)" }}>{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — Recent Activity Feed */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Recent Activity
        </p>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
          {RECENT_ACTIVITY.map((item, i) => (
            <Link key={i} href={item.href}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50/50 block"
              style={{
                borderBottom: i < RECENT_ACTIVITY.length - 1 ? "1px solid var(--rtm-border)" : undefined,
                background: i % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-bg)",
              }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-white"
                style={{ background: "#059669" }}>
                {initials(item.rep)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                  {item.action}
                </span>
                {" — "}
                <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                  {item.client}
                </span>
                <span className="text-xs ml-1" style={{ color: "var(--rtm-text-muted)" }}>
                  via {item.rep}
                </span>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }}>
                {item.timeAgo}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Section 4 — Quick Links */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Quick Links
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.label} href={link.href}
              className="rounded-xl border p-4 block transition-all hover:shadow-md"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{link.label}</p>
              <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
