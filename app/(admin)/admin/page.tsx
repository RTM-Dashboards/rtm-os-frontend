"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge, ActivityFeed, AlertBanner, QuickActions, TeamWidget, MiniSparkline, DonutChart } from "@/components/ui";
import type { ActivityItem, AlertItem, QuickAction, TeamMember } from "@/components/ui";
import { workspaces } from "@/lib/workspaces";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";

const sparkData = [42, 45, 40, 48, 52, 50, 55, 58, 61, 59, 64, 68];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "Jordan M.", action: "completed deliverable for", target: "Apex Roofing — May Report",    timestamp: "2 min ago",  type: "task",     avatarColor: "#1d709f"},
  { id: "2", actor: "Sarah K.",  action: "flagged at-risk client",   target: "Sunbelt HVAC",                  timestamp: "15 min ago", type: "alert",    avatarColor: "#D97706"},
  { id: "3", actor: "System",    action: "generated monthly report for", target: "Pacific Dental",           timestamp: "1h ago",     type: "report",   avatarColor: "#2994d2"},
  { id: "4", actor: "Mike T.",   action: "launched campaign",         target: "Summer Sale — Harbor Auto",    timestamp: "2h ago",     type: "campaign", avatarColor: "#5A6A85"},
  { id: "5", actor: "Alex R.",   action: "onboarded new client",      target: "Blue Ridge Plumbing",          timestamp: "3h ago",     type: "client",   avatarColor: "#059669"},
  { id: "6", actor: "Jordan M.", action: "updated SEO rankings for",  target: "Summit Landscaping",           timestamp: "4h ago",     type: "task",     avatarColor: "#1d709f"},
  { id: "7", actor: "System",    action: "sent invoice reminder to",  target: "Green Valley Pools",           timestamp: "5h ago",     type: "system",   avatarColor: "#9AAABB"},
];

const alerts: AlertItem[] = [
  { id: "1", severity: "critical", title: "3 clients are at churn risk",       description: "Sunbelt HVAC, Harbor Auto, Cascade Flooring need immediate outreach.", action: "Review"},
  { id: "2", severity: "warning",  title: "12 reports due this week",           description: "5 are overdue. Assign report writers immediately.",                    action: "Assign"},
  { id: "3", severity: "info",     title: "Q2 billing cycle starts in 3 days",  description: "Review outstanding invoices before cycle closes.",                     action: "View"},
];

const quickActions: QuickAction[] = [
  { label: "New Report",   description: "Generate a client report", color: "bg-[var(--rtm-bg-secondary)] text-[var(--rtm-text-secondary)]"},
  { label: "Add Client",   description: "Onboard a new account",    icon: "", color: "bg-[var(--rtm-bg-secondary)] text-[var(--rtm-text-secondary)]"},
  { label: "New Campaign", description: "Launch paid media",         icon: "", color: "bg-[var(--rtm-bg-secondary)] text-[var(--rtm-text-secondary)]"},
  { label: "View Tasks",   description: "Open task manager",         icon: "",  color: "bg-[var(--rtm-bg-secondary)] text-[var(--rtm-text-secondary)]"},
  { label: "Send Invoice", description: "Billing & payments",        icon: "", color: "bg-[var(--rtm-bg-secondary)] text-[var(--rtm-text-secondary)]"},
  { label: "Run Audit",    description: "SEO / GBP audit",           icon: "", color: "bg-[var(--rtm-bg-secondary)] text-[var(--rtm-text-secondary)]"},
];

const team: TeamMember[] = [
  { name: "Jordan M.", role: "Sr. Account Manager", status: "online",  clients: 28, tasks: 14, avatarColor: "#1d709f"},
  { name: "Sarah K.",  role: "Account Manager",     status: "online",  clients: 24, tasks: 9,  avatarColor: "#2994d2"},
  { name: "Mike T.",   role: "Paid Media Lead",      status: "away",    clients: 18, tasks: 21, avatarColor: "#5A6A85"},
  { name: "Alex R.",   role: "Content Manager",      status: "online",  clients: 31, tasks: 17, avatarColor: "#059669"},
  { name: "Lisa P.",   role: "SEO Specialist",        status: "offline", clients: 22, tasks: 8,  avatarColor: "#9AAABB"},
];

const deliverableSegments = [
  { label: "Completed",   value: 67, color: "#059669"},
  { label: "In Progress", value: 21, color: "#1d709f"},
  { label: "Blocked",     value: 8,  color: "#D97706"},
  { label: "Overdue",     value: 4,  color: "#EF4444"},
];

const deptHealth = [
  { name: "Account Mgmt", status: "success"as const, label: "Healthy",  score: 94 },
  { name: "Sales",         status: "success"as const, label: "On Track", score: 88 },
  { name: "Content",       status: "warning"as const, label: "Behind",   score: 71 },
  { name: "SEO / GBP",     status: "success"as const, label: "On Track", score: 90 },
  { name: "Meta Ads",      status: "info"as const, label: "Active",   score: 85 },
  { name: "Design",        status: "warning"as const, label: "Backlog",  score: 62 },
  { name: "Billing",       status: "success"as const, label: "Healthy",  score: 97 },
  { name: "IT & Security", status: "success"as const, label: "Secure",   score: 94 },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">

      {/*  Page header  */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--rtm-blue)"}}
            >
              Real Time Marketing Operational Dashboards
            </p>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
              style={{
                background: "#FFFBEB",
                borderColor: "#FDE68A",
                color: "#92400E",
              }}
            >
              Preview — Target State
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
            Good morning, Admin 
          </h1>
          <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
            Here&apos;s what&apos;s happening across your agency today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"style={{
              background: "#FFFFFF",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-secondary)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-bg)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF")}
          >
             May 2025
          </button>
          <button className="rtm-btn-primary inline-flex items-center gap-1.5">
            + Quick Add
          </button>
        </div>
      </div>

      {/*  Task Management Engine card  */}
      <TaskAccessCard
        context="Dashboard"counters={{ open: 47, overdue: 8, dueToday: 12, completed: 67, upcoming: 23 }}
        examples={["Follow-up call", "Create invoice", "Assign AM", "Schedule kickoff", "Renewal review"]}
      />

      {/*  Admin quick nav  */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            href:        "/admin/users",
            title:       "Users",
            description: "Manage team members, roles, and client assignments.",
          },
          {
            href:        "/admin/workspaces",
            title:       "Workspaces",
            description: "View department workspaces, admins, member counts, and access matrix.",
          },
          {
            href:        "/admin/settings",
            title:       "Settings",
            description: "System config, role architecture, and permission matrix.",
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex items-start gap-4 p-5 rounded-xl border transition-all duration-150"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rtm-blue)";
              (e.currentTarget as HTMLAnchorElement).style.background   = "var(--rtm-blue-xlight)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rtm-border)";
              (e.currentTarget as HTMLAnchorElement).style.background   = "var(--rtm-surface)";
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{card.title}</p>
              <p className="text-xs mt-0.5 leading-relaxed"style={{ color: "var(--rtm-text-secondary)"}}>{card.description}</p>
              <p className="text-xs mt-2 font-semibold"style={{ color: "var(--rtm-blue)" }}>Open →</p>
            </div>
          </Link>
        ))}
      </div>

      {/*  Workspace grid  */}
      <div
        className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Department Workspaces</h2>
            <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>Enter any workspace to see its dedicated dashboard and tools.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {workspaces.map((ws) => (
            <Link
              key={ws.slug}
              href={ws.dashboardRoute}
              className="group flex flex-col items-start gap-2 p-4 rounded-lg border transition-all duration-150"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rtm-blue)";
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--rtm-blue-xlight)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rtm-border-light)";
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--rtm-bg)";
              }}
            >
              <div className="min-w-0 w-full">
                <p className="text-sm font-semibold leading-tight truncate"style={{ color: "var(--rtm-text-primary)"}}>
                  {ws.name}
                </p>
                <p className="text-[10px] mt-1 font-semibold"style={{ color: "var(--rtm-blue)" }}>Enter →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/*  Alerts  */}
      <AlertBanner alerts={alerts} />

      {/*  KPI row  */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Active Clients"value="148"trend="up"trendValue="6%"iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={
            <svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
              <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          }
        />
        <KpiCard
          title="Monthly Revenue"value="$94,800"trend="up"trendValue="11.2%"iconBg="#ECFDF5"iconColor="#059669"icon={
            <svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
              <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          }
        />
        <KpiCard
          title="Open Deliverables"value="312"trend="down"trendValue="4%"iconBg="#FFFBEB"iconColor="#D97706"icon={
            <svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
              <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          }
        />
        <KpiCard
          title="Avg. Client Score"value="8.7 / 10"trend="up"trendValue="0.3"icon={
            <svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
              <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          }
        />
      </div>

      {/*  Revenue trend + Deliverable donut  */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper
          title="Revenue Trend"description="Last 12 months"className="lg:col-span-2">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-3xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
                $94,800
              </p>
              <p className="text-sm font-semibold mt-1"style={{ color: "#059669"}}>
                ↑ +11.2% vs last month
              </p>
            </div>
            <div className="flex gap-5 text-right">
              <div>
                <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>YTD</p>
                <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>$512,400</p>
              </div>
              <div>
                <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>Target</p>
                <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>$1.1M</p>
              </div>
            </div>
          </div>
          <MiniSparkline data={sparkData}height={80} width={600} />
          <div className="mt-3 flex gap-2 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Deliverable Status"description="Current sprint breakdown">
          <DonutChart
            segments={deliverableSegments}
            size={140}
            thickness={22}
            centerLabel="100"centerSub="total"/>
        </SectionWrapper>
      </div>

      {/*  Department health + Quick actions  */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper
          title="Department Health"description="Real-time status across all teams"className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {deptHealth.map((dept) => (
              <div
                key={dept.name}
                className="flex items-center justify-between p-3 rounded-lg border"style={{
                  background: "var(--rtm-bg)",
                  borderColor: "var(--rtm-border-light)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"style={{
                      background:
                        dept.status === "success"? "#10B981":
                        dept.status === "warning"? "#F59E0B": "var(--rtm-blue)",
                    }}
                  />
                  <span className="text-sm font-medium"style={{ color: "var(--rtm-text-primary)"}}>
                    {dept.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold"style={{ color: "var(--rtm-text-secondary)"}}
                  >
                    {dept.score}
                  </span>
                  <StatusBadge variant={dept.status} label={dept.label} size="sm"/>
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Quick Actions"description="Common operations">
          <QuickActions actions={quickActions} cols={2} />
        </SectionWrapper>
      </div>

      {/*  Activity feed + Team widget  */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper
          title="Activity Feed"description="Latest across all departments"className="lg:col-span-2"actions={
            <button
              className="text-xs font-semibold hover:underline"style={{ color: "var(--rtm-blue)"}}
            >
              View all
            </button>
          }
        >
          <ActivityFeed items={activityItems} />
        </SectionWrapper>

        <div className="space-y-4">
          <SectionWrapper title="Team Status"description="Account managers on duty">
            <TeamWidget members={team} />
          </SectionWrapper>

          <SectionWrapper title="This Week"description="Activity snapshot">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Deliverables sent", value: "47"},
                { label: "Check-ins done",     value: "22"},
                { label: "Campaigns live",     value: "9"},
                { label: "Reports sent",       value: "14"},
                { label: "Issues resolved",    value: "31"},
                { label: "New leads",          value: "18"},
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg p-3 border"style={{
                    background: "var(--rtm-bg)",
                    borderColor: "var(--rtm-border-light)",
                  }}
                >
                  <p
                    className="text-lg font-bold"style={{ color: "var(--rtm-text-primary)"}}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-[11px] mt-0.5 leading-tight"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </div>

    </div>
  );
}
