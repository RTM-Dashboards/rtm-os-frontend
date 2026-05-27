import { KpiCard, SectionWrapper, StatusBadge, ActivityFeed, AlertBanner, QuickActions, TeamWidget, MiniSparkline, DonutChart } from "@/components/ui";
import type { ActivityItem, AlertItem, QuickAction, TeamMember } from "@/components/ui";

const sparkData = [42, 45, 40, 48, 52, 50, 55, 58, 61, 59, 64, 68];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "Jordan M.", action: "completed deliverable for", target: "Apex Roofing — May Report", timestamp: "2 min ago", type: "task", avatarColor: "#6366f1" },
  { id: "2", actor: "Sarah K.", action: "flagged at-risk client", target: "Sunbelt HVAC", timestamp: "15 min ago", type: "alert", avatarColor: "#f59e0b" },
  { id: "3", actor: "System", action: "generated monthly report for", target: "Pacific Dental", timestamp: "1h ago", type: "report", avatarColor: "#3b82f6" },
  { id: "4", actor: "Mike T.", action: "launched campaign", target: "Summer Sale — Harbor Auto", timestamp: "2h ago", type: "campaign", avatarColor: "#8b5cf6" },
  { id: "5", actor: "Alex R.", action: "onboarded new client", target: "Blue Ridge Plumbing", timestamp: "3h ago", type: "client", avatarColor: "#10b981" },
  { id: "6", actor: "Jordan M.", action: "updated SEO rankings for", target: "Summit Landscaping", timestamp: "4h ago", type: "task", avatarColor: "#6366f1" },
  { id: "7", actor: "System", action: "sent invoice reminder to", target: "Green Valley Pools", timestamp: "5h ago", type: "system", avatarColor: "#64748b" },
];

const alerts: AlertItem[] = [
  { id: "1", severity: "critical", title: "3 clients are at churn risk", description: "Sunbelt HVAC, Harbor Auto, Cascade Flooring need immediate outreach.", action: "Review" },
  { id: "2", severity: "warning", title: "12 reports due this week", description: "5 are overdue. Assign report writers immediately.", action: "Assign" },
  { id: "3", severity: "info", title: "Q2 billing cycle starts in 3 days", description: "Review outstanding invoices before cycle closes.", action: "View" },
];

const quickActions: QuickAction[] = [
  { label: "New Report", description: "Generate a client report", icon: "📊", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
  { label: "Add Client", description: "Onboard a new account", icon: "➕", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { label: "New Campaign", description: "Launch paid media", icon: "🎯", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
  { label: "View Tasks", description: "Open task manager", icon: "✓", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
  { label: "Send Invoice", description: "Billing & payments", icon: "💳", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
  { label: "Run Audit", description: "SEO / GBP audit", icon: "🔍", color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600" },
];

const team: TeamMember[] = [
  { name: "Jordan M.", role: "Sr. Account Manager", status: "online", clients: 28, tasks: 14, avatarColor: "#6366f1" },
  { name: "Sarah K.", role: "Account Manager", status: "online", clients: 24, tasks: 9, avatarColor: "#f59e0b" },
  { name: "Mike T.", role: "Paid Media Lead", status: "away", clients: 18, tasks: 21, avatarColor: "#8b5cf6" },
  { name: "Alex R.", role: "Content Manager", status: "online", clients: 31, tasks: 17, avatarColor: "#10b981" },
  { name: "Lisa P.", role: "SEO Specialist", status: "offline", clients: 22, tasks: 8, avatarColor: "#ec4899" },
];

const deliverableSegments = [
  { label: "Completed", value: 67, color: "#10b981" },
  { label: "In Progress", value: 21, color: "#6366f1" },
  { label: "Blocked", value: 8, color: "#f59e0b" },
  { label: "Overdue", value: 4, color: "#ef4444" },
];

const deptHealth = [
  { name: "Account Mgmt", status: "success" as const, label: "Healthy", score: 94 },
  { name: "Sales", status: "success" as const, label: "On Track", score: 88 },
  { name: "Content", status: "warning" as const, label: "Behind", score: 71 },
  { name: "SEO / GBP", status: "success" as const, label: "On Track", score: 90 },
  { name: "Meta Ads", status: "info" as const, label: "Active", score: 85 },
  { name: "Design", status: "warning" as const, label: "Backlog", score: 62 },
  { name: "Billing", status: "success" as const, label: "Healthy", score: 97 },
  { name: "IT & Security", status: "success" as const, label: "Secure", score: 94 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">RTM OS</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Good morning, Admin 👋</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here&apos;s what&apos;s happening across your agency today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            📅 May 2025
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-indigo-500/30">
            + Quick Add
          </button>
        </div>
      </div>

      {/* Alerts */}
      <AlertBanner alerts={alerts} />

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Active Clients"
          value="148"
          trend="up"
          trendValue="6%"
          accentColor="bg-indigo-100 dark:bg-indigo-900/30"
          icon={
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <KpiCard
          title="Monthly Revenue"
          value="$94,800"
          trend="up"
          trendValue="11.2%"
          accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          title="Open Deliverables"
          value="312"
          trend="down"
          trendValue="4%"
          accentColor="bg-amber-100 dark:bg-amber-900/30"
          icon={
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <KpiCard
          title="Avg. Client Score"
          value="8.7 / 10"
          trend="up"
          trendValue="0.3"
          accentColor="bg-purple-100 dark:bg-purple-900/30"
          icon={
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
      </div>

      {/* Revenue trend + Deliverable donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Revenue Trend" description="Last 12 months" className="lg:col-span-2">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">$94,800</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">↑ +11.2% vs last month</p>
            </div>
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-xs text-slate-400">YTD</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">$512,400</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Target</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">$1.1M</p>
              </div>
            </div>
          </div>
          <MiniSparkline data={sparkData} color="#6366f1" height={80} width={600} />
          <div className="mt-3 flex gap-2 text-xs text-slate-400">
            {["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"].map(m => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Deliverable Status" description="Current sprint breakdown">
          <DonutChart
            segments={deliverableSegments}
            size={140}
            thickness={22}
            centerLabel="100"
            centerSub="total"
          />
        </SectionWrapper>
      </div>

      {/* Department health + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Department Health" description="Real-time status across all teams" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {deptHealth.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    dept.status === "success" ? "bg-emerald-500" :
                    dept.status === "warning" ? "bg-amber-500" : "bg-blue-500"
                  }`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{dept.score}</span>
                  <StatusBadge variant={dept.status} label={dept.label} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Quick Actions" description="Common operations">
          <QuickActions actions={quickActions} cols={2} />
        </SectionWrapper>
      </div>

      {/* Activity feed + Team widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper
          title="Activity Feed"
          description="Latest across all departments"
          className="lg:col-span-2"
          actions={<button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View all</button>}
        >
          <ActivityFeed items={activityItems} />
        </SectionWrapper>

        <div className="space-y-4">
          <SectionWrapper title="Team Status" description="Account managers on duty">
            <TeamWidget members={team} />
          </SectionWrapper>

          <SectionWrapper title="This Week" description="Activity snapshot">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Deliverables sent", value: "47" },
                { label: "Check-ins done", value: "22" },
                { label: "Campaigns live", value: "9" },
                { label: "Reports sent", value: "14" },
                { label: "Issues resolved", value: "31" },
                { label: "New leads", value: "18" },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
