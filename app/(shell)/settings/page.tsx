"use client";

import { SectionWrapper, StatusBadge, AlertBanner } from "@/components/ui";
import type { AlertItem } from "@/components/ui";

const alerts: AlertItem[] = [
  { id: "1", severity: "warning", title: "2FA not enabled for all team members", description: "3 accounts have not enabled two-factor authentication.", action: "Enforce" },
];

const integrations = [
  { name: "Google Workspace", status: "connected", description: "Email, calendar & docs", icon: "🔵" },
  { name: "Slack", status: "connected", description: "Team notifications" },
  { name: "Google Analytics", status: "connected", description: "Site analytics" },
  { name: "Stripe", status: "connected", description: "Billing & payments" },
  { name: "Meta Business Suite", status: "connected", description: "Ads & pages", icon: "📘" },
  { name: "Google Ads", status: "connected", description: "PPC campaigns" },
  { name: "Salesforce", status: "disconnected", description: "CRM sync", icon: "☁️" },
  { name: "Zapier", status: "disconnected", description: "Workflow automation" },
];

const teamMembers = [
  { name: "Jordan M.", email: "jordan@rtm.io", role: "Sr. Account Manager", status: "active", twoFa: true },
  { name: "Sarah K.", email: "sarah@rtm.io", role: "Account Manager", status: "active", twoFa: true },
  { name: "Mike T.", email: "mike@rtm.io", role: "Paid Media Lead", status: "active", twoFa: false },
  { name: "Alex R.", email: "alex@rtm.io", role: "Content Manager", status: "active", twoFa: true },
  { name: "Lisa P.", email: "lisa@rtm.io", role: "SEO Specialist", status: "active", twoFa: false },
  { name: "Chris D.", email: "chris@rtm.io", role: "Designer", status: "active", twoFa: false },
];

// ─── Reporting & Intelligence ────────────────────────────────────────────────

const dashboardTypes = [
  { id: "department", label: "Department Dashboard", description: "Team performance & workload" },
  { id: "client", label: "Client Dashboard", description: "Per-client performance metrics" },
  { id: "executive", label: "Executive Dashboard", description: "High-level KPIs & revenue" },
  { id: "project", label: "Project Dashboard", description: "Project health & milestones" },
  { id: "operations", label: "Operations Dashboard", description: "Operational efficiency" },
];

const dashboardBuilderPermissions = [
  { label: "Create Dashboard", enabled: true },
  { label: "Edit Dashboard", enabled: true },
  { label: "Clone Dashboard", enabled: true },
  { label: "Archive Dashboard", enabled: false },
  { label: "Assign Dashboard", enabled: true },
  { label: "Configure Widgets", enabled: true },
  { label: "Configure KPIs", enabled: true },
  { label: "Configure Data Sources", enabled: false },
  { label: "Configure Filters", enabled: true },
  { label: "Configure AI Summaries", enabled: false },
];

const clientDashboardTemplates = [
  { id: "seo", label: "SEO Dashboard", description: "Organic traffic, rankings, GSC" },
  { id: "ppc", label: "PPC Dashboard", description: "Google Ads performance & ROAS" },
  { id: "gbp", label: "GBP Dashboard", description: "Google Business Profile activity" },
  { id: "lsa", label: "LSA Dashboard", icon: "📣", description: "Local Services Ads performance" },
  { id: "website", label: "Website Dashboard", description: "Web analytics & conversion" },
  { id: "ai_auto", label: "AI Automation Dashboard", description: "AI campaign & automation KPIs" },
  { id: "full", label: "Full-Service Dashboard", description: "All channels combined" },
];

const executiveDashboardTemplates = [
  { id: "revenue", label: "Revenue", description: "MRR, ARR, churn revenue" },
  { id: "dept_perf", label: "Department Performance", description: "Team output & efficiency" },
  { id: "project_health", label: "Project Health", description: "Project status across org" },
  { id: "client_health", label: "Client Health", icon: "💚", description: "Health scores & risk flags" },
  { id: "renewal_risk", label: "Renewal Risk", description: "Upcoming renewals at risk" },
  { id: "revenue_risk", label: "Revenue Risk", icon: "📉", description: "Revenue at risk indicators" },
  { id: "escalations", label: "Escalations", description: "Active escalations & blockers" },
  { id: "ops_summary", label: "Operations Summary", description: "Ops efficiency & capacity" },
  { id: "exec_ai", label: "Executive AI Summary", description: "AI-generated exec briefing" },
];

const clientDashboardWidgets = [
  { id: "organic_traffic", label: "Organic Traffic", source: "GA4" },
  { id: "keyword_rankings", label: "Keyword Rankings", source: "GSC" },
  { id: "leads", label: "Leads", source: "GoHighLevel" },
  { id: "calls", label: "Calls", source: "CallRail" },
  { id: "booked_calls", label: "Booked Calls", source: "GoHighLevel" },
  { id: "conversions", label: "Conversions", source: "GA4" },
  { id: "cost_per_lead", label: "Cost Per Lead", source: "Google Ads" },
  { id: "roas", label: "ROAS", source: "Google Ads" },
  { id: "gbp_activity", label: "GBP Activity", source: "GBP" },
  { id: "lsa_perf", label: "LSA Performance", source: "LSA" },
  { id: "project_status", label: "Project Status", source: "Internal" },
  { id: "deliverables", label: "Deliverables", source: "Internal" },
  { id: "completed_tasks", label: "Completed Tasks", source: "Internal" },
  { id: "open_tasks", label: "Open Tasks", source: "Internal" },
  { id: "client_health", label: "Client Health Score", source: "Internal" },
  { id: "ai_summary", label: "AI Summary", source: "OpenAI" },
  { id: "recommendations", label: "Recommendations", source: "OpenAI" },
];

const dataSources = [
  { name: "GA4", status: "connected", description: "Google Analytics 4" },
  { name: "Google Ads", status: "connected", description: "PPC campaigns" },
  { name: "Meta Ads", icon: "📘", status: "connected", description: "Facebook & Instagram ads" },
  { name: "Google Search Console", status: "connected", description: "Organic search data" },
  { name: "Google Business Profile", status: "connected", description: "Local presence data" },
  { name: "Google Local Services Ads", icon: "📣", status: "connected", description: "LSA performance" },
  { name: "CallRail", status: "connected", description: "Call tracking & recording" },
  { name: "GoHighLevel", status: "connected", description: "CRM & pipeline" },
  { name: "Power BI", icon: "📉", status: "disconnected", description: "Business intelligence" },
  { name: "Google Sheets", status: "connected", description: "Manual data inputs" },
  { name: "Twilio", status: "disconnected", description: "SMS & voice" },
  { name: "OpenAI", status: "connected", description: "AI summaries & analysis" },
  { name: "Custom API", status: "disconnected", description: "External data source" },
];

const reportAutomationTypes = [
  { label: "Weekly Reports", description: "Auto-generated every Monday", enabled: true },
  { label: "Monthly Reports", icon: "📆", description: "Auto-generated on the 1st", enabled: true },
  { label: "Quarterly Reports", description: "Q1–Q4 performance summary", enabled: true },
  { label: "QBR Reports", description: "Quarterly business review decks", enabled: false },
  { label: "Renewal Reports", description: "Triggered 60 days before renewal", enabled: true },
  { label: "Executive Reports", icon: "👔", description: "Leadership briefing packages", enabled: false },
  { label: "Client Reports", description: "Client-facing performance decks", enabled: true },
];

const generateReportTypes = [
  { label: "Generate Client Report", status: "available" as const },
  { label: "Generate Executive Report", icon: "👔", status: "available" as const },
  { label: "Generate QBR Report", status: "coming_soon" as const },
  { label: "Generate Renewal Report", status: "available" as const },
  { label: "Generate Call Analysis Report", status: "available" as const },
  { label: "Generate Department Report", status: "coming_soon" as const },
];

const callIntelligenceIntegrations = [
  { name: "CallRail", status: "connected", description: "Call tracking & analytics" },
  { name: "GoHighLevel Calls", status: "connected", description: "CRM-linked call data" },
  { name: "Twilio Calls", status: "disconnected", description: "Voice & SMS calls" },
];

const callIntelligenceFeatures = [
  { label: "Call Summary", description: "AI-generated recap of each call", enabled: true },
  { label: "Call Sentiment", description: "Positive, neutral, or negative tone", enabled: true },
  { label: "Lead Quality", description: "Score each inbound lead call", enabled: true },
  { label: "Missed Opportunities", description: "Flag upsell / conversion moments", enabled: false },
  { label: "Competitor Mentions", description: "Detect competitor names in calls", enabled: true },
  { label: "Objections", description: "Surface common objections", enabled: true },
  { label: "Action Items", description: "Extract follow-up tasks from calls", enabled: true },
  { label: "Follow-Up Recommendations", description: "AI suggests next steps", enabled: false },
];

const aiSummaryRules = [
  {
    type: "Department Daily Summary",
    icon: "🏢",
    displays: ["Today's Priorities", "Urgent Tasks", "Overdue Items", "Blocked Work", "Projects At Risk", "Recommended Actions"],
    enabled: true,
  },
  {
    type: "Project Summary",
    icon: "📋",
    displays: ["Project Health", "Blocked Items", "Milestone Progress", "Delay Reasons", "Dependencies", "Recommended Actions"],
    enabled: true,
  },
  {
    type: "Client Summary",
    icon: "👤",
    displays: ["Performance Highlights", "Wins", "Concerns", "Recommendations", "Upcoming Deliverables", "Client Health"],
    enabled: true,
  },
  {
    type: "Executive Summary",
    icon: "👔",
    displays: ["Revenue Risks", "Renewal Risks", "Department Bottlenecks", "Escalations", "Projects At Risk", "Recommended Actions"],
    enabled: false,
  },
];

const clientHealthScores = [
  { label: "Client Health Score", icon: "💚", description: "Composite score across performance, engagement & delivery", status: "architecture_ready" as const },
  { label: "Renewal Risk Score", description: "Likelihood of non-renewal based on signals", status: "architecture_ready" as const },
  { label: "Expansion Opportunity Score", description: "Upsell / cross-sell readiness score", status: "coming_soon" as const },
  { label: "Churn Risk Score", description: "Early warning churn probability", status: "coming_soon" as const },
];

// ─── Notification Settings ─────────────────────────────────────────────────────

const notificationSettings = [
  { label: "New lead assigned", channel: "Email + Slack", enabled: true },
  { label: "Client health drops below 70", channel: "Email + Slack", enabled: true },
  { label: "Invoice overdue", channel: "Email", enabled: true },
  { label: "Report due in 2 days", channel: "Slack", enabled: true },
  { label: "Campaign ROAS drops below target", channel: "Email", enabled: false },
  { label: "New review received", channel: "Slack", enabled: true },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform configuration, team management & integrations.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[var(--rtm-blue)] hover:bg-[var(--rtm-blue-dark)] text-white text-sm font-semibold transition-colors self-start">Save Changes</button>
      </div>

      <AlertBanner alerts={alerts} />

      {/* Platform Info */}
      <SectionWrapper title="Platform" description="Real Time Marketing Operational Dashboards — Configuration">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Agency Name", value: "RTM Agency" },
            { label: "Primary Domain", value: "rtm.io" },
            { label: "Time Zone", value: "America/Denver (MST)" },
            { label: "Plan", value: "Enterprise" },
            { label: "Active Users", value: "6" },
            { label: "Billing Cycle", value: "Monthly" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Team Members */}
      <SectionWrapper title="Team Members" description={`${teamMembers.length} active users`}
        actions={<button className="text-xs font-medium text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] hover:underline">+ Invite User</button>}
      >
        <div className="space-y-2">
          {teamMembers.map((member) => (
            <div key={member.email} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-[var(--rtm-blue)]/30 dark:hover:border-[var(--rtm-blue)]/30 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: "var(--rtm-blue)" }}
                >
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email} · {member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {member.twoFa ? (
                  <StatusBadge variant="success" label="2FA On" size="sm" />
                ) : (
                  <StatusBadge variant="warning" label="No 2FA" size="sm" />
                )}
                <StatusBadge variant="success" label="Active" size="sm" />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Integrations */}
      <SectionWrapper title="Integrations" description="Connected services & platforms">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {integrations.map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[var(--rtm-blue)]/40 dark:hover:border-[var(--rtm-blue)]/40 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">{integration.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{integration.name}</p>
                  <p className="text-xs text-slate-500">{integration.description}</p>
                </div>
              </div>
              {integration.status === "connected" ? (
                <StatusBadge variant="success" label="Connected" size="sm" />
              ) : (
                <button className="text-xs font-medium text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] hover:underline px-2 py-1 rounded border border-[var(--rtm-blue)]/30 dark:border-[var(--rtm-blue)]/30 hover:bg-[var(--rtm-blue-xlight)]  transition-colors">
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Notifications */}
      <SectionWrapper title="Notifications" description="Configure alert delivery">
        <div className="space-y-2">
          {notificationSettings.map((setting) => (
            <div key={setting.label} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{setting.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{setting.channel}</p>
              </div>
              <div className={`w-10 h-6 rounded-full flex items-center transition-colors cursor-pointer flex-shrink-0 ${setting.enabled ? "bg-indigo-600 justify-end" : "bg-slate-200 dark:bg-slate-700 justify-start"}`}>
                <div className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ══════════════════════════════════════════════════════════════
           REPORTING & INTELLIGENCE — ORGANIZATION CONFIGURATION
      ══════════════════════════════════════════════════════════════ */}

      {/* Reporting & Intelligence header */}
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">📊</span>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Configuration Module</p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Reporting &amp; Intelligence</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 ml-11">
          Hybrid department responsible for dashboards, report automation, data aggregation, client performance, executive reporting, AI summaries, call intelligence, client health, and renewal intelligence.
        </p>
      </div>

      {/* ── Dashboard Builder ─────────────────────────────────────── */}
      <SectionWrapper title="Dashboard Builder" description="Reporting team permissions for dashboard management">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {dashboardBuilderPermissions.map((perm) => (
            <div key={perm.label} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-[var(--rtm-blue)]/40 transition-colors shadow-sm">
              <span className="text-sm font-medium text-slate-700">{perm.label}</span>
              <div className={`w-10 h-6 rounded-full flex items-center transition-colors cursor-pointer flex-shrink-0 ${perm.enabled ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"}`}>
                <div className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Dashboard Types ───────────────────────────────────────── */}
      <SectionWrapper title="Dashboard Types" description="Supported dashboard categories">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dashboardTypes.map((dt) => (
            <div key={dt.id} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[var(--rtm-blue)]/50 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
                >
                  {String(dt.id).slice(0, 2).toUpperCase()}
                </span>
                <p className="text-sm font-semibold text-slate-800">{dt.label}</p>
              </div>
              <p className="text-xs text-slate-500 ml-7">{dt.description}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Client Dashboard Templates ───────────────────────────── */}
      <SectionWrapper title="Client Dashboard Templates" description="Pre-built service-line dashboards for clients">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clientDashboardTemplates.map((tpl) => (
            <div key={tpl.id} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[var(--rtm-blue)]/50 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{tpl.icon}</span>
                <p className="text-sm font-semibold text-slate-800">{tpl.label}</p>
              </div>
              <p className="text-xs text-slate-500 ml-7">{tpl.description}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Client Dashboard Widgets ──────────────────────────────── */}
      <SectionWrapper title="Client Dashboard Widgets" description="Available widgets for client dashboards">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {clientDashboardWidgets.map((w) => (
            <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-[var(--rtm-blue)]/40 transition-colors shadow-sm">
              <span className="text-sm font-medium text-slate-700">{w.label}</span>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{w.source}</span>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Executive Dashboard Templates ─────────────────────────── */}
      <SectionWrapper title="Executive Dashboard Templates" description="High-level dashboards for leadership">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {executiveDashboardTemplates.map((tpl) => (
            <div key={tpl.id} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[var(--rtm-blue)]/50 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{tpl.icon}</span>
                <p className="text-sm font-semibold text-slate-800">{tpl.label}</p>
              </div>
              <p className="text-xs text-slate-500 ml-7">{tpl.description}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Data Sources ──────────────────────────────────────────── */}
      <SectionWrapper title="Data Sources" description="Connected reporting data providers">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dataSources.map((ds) => (
            <div key={ds.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-[var(--rtm-blue)]/40 transition-colors bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xl">{ds.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{ds.name}</p>
                  <p className="text-xs text-slate-500">{ds.description}</p>
                </div>
              </div>
              {ds.status === "connected" ? (
                <StatusBadge variant="success" label="Connected" size="sm" />
              ) : (
                <button className="text-xs font-medium text-[var(--rtm-blue)] hover:underline px-2 py-1 rounded border border-[var(--rtm-blue)]/30 hover:bg-[var(--rtm-blue-xlight)] transition-colors">
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Report Automation ─────────────────────────────────────── */}
      <SectionWrapper title="Report Automation" description="Scheduled report generation rules">
        <div className="space-y-2">
          {reportAutomationTypes.map((r) => (
            <div key={r.label} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-[var(--rtm-blue)]/40 transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xl">{r.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{r.label}</p>
                  <p className="text-xs text-slate-500">{r.description}</p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full flex items-center transition-colors cursor-pointer flex-shrink-0 ${r.enabled ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"}`}>
                <div className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Generate Report ───────────────────────────────────────── */}
      <SectionWrapper title="Generate Report" description="On-demand report generation (future functionality)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {generateReportTypes.map((r) => (
            <div key={r.label} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-[var(--rtm-blue)]/50 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2">
                <span className="text-xl">{r.icon}</span>
                <p className="text-sm font-semibold text-slate-800">{r.label}</p>
              </div>
              {r.status === "available" ? (
                <StatusBadge variant="success" label="Available" size="sm" />
              ) : (
                <StatusBadge variant="warning" label="Coming Soon" size="sm" />
              )}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Call Intelligence ─────────────────────────────────────── */}
      <SectionWrapper title="Call Intelligence" description="AI-powered analysis of inbound and outbound calls">
        <div className="space-y-4">
          {/* Integrations */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Integrations</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {callIntelligenceIntegrations.map((ci) => (
                <div key={ci.name} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-[var(--rtm-blue)]/40 transition-colors shadow-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold"
                      style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
                    >
                      {ci.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{ci.name}</p>
                      <p className="text-xs text-slate-500">{ci.description}</p>
                    </div>
                  </div>
                  {ci.status === "connected" ? (
                    <StatusBadge variant="success" label="On" size="sm" />
                  ) : (
                    <StatusBadge variant="neutral" label="Off" size="sm" />
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* AI Features */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Analysis Features</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {callIntelligenceFeatures.map((feat) => (
                <div key={feat.label} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-[var(--rtm-blue)]/40 transition-colors shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{feat.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{feat.description}</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full flex items-center transition-colors cursor-pointer flex-shrink-0 ml-3 ${feat.enabled ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"}`}>
                    <div className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── AI Summary Rules ──────────────────────────────────────── */}
      <SectionWrapper title="AI Summary Rules" description="Configure what each AI summary displays">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {aiSummaryRules.map((rule) => (
            <div key={rule.type} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[var(--rtm-blue)]/50 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{rule.icon}</span>
                  <p className="text-sm font-semibold text-slate-800">{rule.type}</p>
                </div>
                <div className={`w-10 h-6 rounded-full flex items-center transition-colors cursor-pointer flex-shrink-0 ${rule.enabled ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"}`}>
                  <div className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 ml-7">
                {rule.displays.map((d) => (
                  <span key={d} className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">{d}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Client Health Intelligence ────────────────────────────── */}
      <SectionWrapper title="Client Health Intelligence" description="Scoring models architecture — ready for data integration">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {clientHealthScores.map((score) => (
            <div key={score.label} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-[var(--rtm-blue)]/50 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{score.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{score.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{score.description}</p>
                </div>
              </div>
              {score.status === "architecture_ready" ? (
                <StatusBadge variant="info" label="Arch Ready" size="sm" />
              ) : (
                <StatusBadge variant="warning" label="Coming Soon" size="sm" />
              )}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Danger Zone */}
      <SectionWrapper title="Danger Zone" description="Irreversible platform actions">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">Export All Data</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Download a full backup of all platform data in JSON format.</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex-shrink-0">
              Export
            </button>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
