"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge, ActivityFeed } from "@/components/ui";
import type { ActivityItem } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

const activity: ActivityItem[] = [
  { id: "1", actor: "Lisa P.",   action: "sent invoice to",            target: "Apex Roofing",        timestamp: "1h ago",  type: "system",   avatarColor: "#D97706" },
  { id: "2", actor: "System",    action: "flagged overdue invoice for", target: "Green Valley Pools",  timestamp: "2h ago",  type: "alert",    avatarColor: "#DC2626" },
  { id: "3", actor: "Sarah K.",  action: "processed cancellation for",  target: "Harbor Auto",         timestamp: "3h ago",  type: "task",     avatarColor: "#D97706" },
  { id: "4", actor: "Lisa P.",   action: "activated new service for",   target: "Blue Ridge Plumbing", timestamp: "4h ago",  type: "client",   avatarColor: "#059669" },
];

const services = [
  { client: "Apex Roofing",        plan: "Full-Service SEO",        mrr: "$2,400", status: "success" as const, label: "Active"   },
  { client: "Pacific Dental",      plan: "Paid Advertising Bundle", mrr: "$3,800", status: "success" as const, label: "Active"   },
  { client: "Sunbelt HVAC",        plan: "Content Retainer",        mrr: "$1,200", status: "error"   as const, label: "At Risk"  },
  { client: "Harbor Auto Group",   plan: "Full-Service Bundle",     mrr: "$5,000", status: "warning" as const, label: "Pausing"  },
  { client: "Metro Dental",        plan: "Local Visibility",        mrr: "$1,800", status: "success" as const, label: "Active"   },
  { client: "Blue Ridge Plumbing", plan: "Starter SEO",             mrr: "$800",   status: "info"    as const, label: "New"      },
];

const quickLinks = [
  { label: "Billing Dashboard",  href: "/billing",                  icon: "📊", description: "Financial overview",       accent: "#D97706" },
  { label: "Tasks",              href: "/billing/tasks",            icon: "✅", description: "Open billing tasks",       accent: "#1B4FD8" },
  { label: "Active Services",    href: "/billing/active-services",  icon: "⚡", description: "Service subscriptions",    accent: "#059669" },
  { label: "Client Portfolio",   href: "/billing/client-portfolio", icon: "👥", description: "All billed clients",       accent: "#7C3AED" },
  { label: "Invoices",           href: "/billing/invoices",         icon: "🧾", description: "Invoice management",       accent: "#2563EB" },
  { label: "Cancellations",      href: "/billing/cancellations",    icon: "❌", description: "Cancellation pipeline",    accent: "#DC2626" },
  { label: "Offboarding",        href: "/billing/offboarding",      icon: "🚪", description: "Offboarding triggers",     accent: "#9CA3AF" },
  { label: "Dept. Activation",   href: "/billing/activation",       icon: "🔔", description: "Activation status",        accent: "#0891B2" },
];

export default function BillingDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Client services, invoices, cancellations and financial health." />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Monthly Revenue"     value="$94,800" trend="up"   trendValue="11.2%" iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Active Services"     value="148"     trend="up"   trendValue="3"     iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
        <KpiCard title="Overdue Invoices"    value="$12,400" trend="down" trendValue="$2k"   iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <KpiCard title="Cancellations (MTD)" value="3"       trend="up"   trendValue="1"     iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" /></svg>} />
      </div>

      <WorkspaceQuickLinks links={quickLinks} title="Billing Workspace — Navigation" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Active Services" description="Current client subscriptions" className="lg:col-span-2">
          <div className="space-y-2">
            {services.map((s) => (
              <div key={s.client} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{s.client}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{s.plan}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: "var(--rtm-text-secondary)" }}>{s.mrr}</span>
                  <StatusBadge variant={s.status} label={s.label} size="sm" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Link href="/billing/active-services"  className="rtm-btn-primary text-sm inline-flex items-center gap-1">All Services →</Link>
            <Link href="/billing/tasks"             className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Tasks →</Link>
            <Link href="/billing/invoices"          className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Invoices →</Link>
            <Link href="/billing/cancellations"     className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Cancellations →</Link>
          </div>
        </SectionWrapper>

        <SectionWrapper title="Recent Activity" description="Billing updates">
          <ActivityFeed items={activity} />
        </SectionWrapper>
      </div>
    </div>
  );
}
