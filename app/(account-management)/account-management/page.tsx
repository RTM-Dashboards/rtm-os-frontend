"use client";

import React, { useState } from "react";
import { RoleToggle } from "@/components/am-role-toggle";
import {
  ALL_CLIENTS,
  ALL_TASKS,
  ALL_ONBOARDING,
  ALL_RENEWALS,
  ALL_HEALTH,
  AM_NAMES,
  SARAH,
  getClientsByAM,
  getWorkloadSummary,
  type AMRole,
} from "@/lib/am-role-mock-data";

//  Client Lifecycle Engine (AM module) 

const AM_LIFECYCLE_STAGES = [
  { stage: "Lead",                   owner: "Sales",              color: "#94A3B8"},
  { stage: "Opportunity",            owner: "Sales",              color: "#2563EB"},
  { stage: "Proposal",               owner: "Sales",              color: "#7C3AED"},
  { stage: "Contract",               owner: "Sales",              color: "#0891B2"},
  { stage: "Closed Won",             owner: "Sales",              color: "#059669"},
  { stage: "Sent To Billing",        owner: "Sales",              color: "#D97706"},
  { stage: "Invoice Sent",           owner: "Billing",            color: "#6366F1"},
  { stage: "Awaiting Payment",       owner: "Billing",            color: "#8B5CF6"},
  { stage: "Payment Confirmed",      owner: "Billing",            color: "#059669"},
  { stage: "Activation Approved",    owner: "Billing",            color: "#0EA5E9"},
  { stage: "Ready For Assignment",   owner: "Billing",            color: "#10B981"},
  { stage: "Assigned",               owner: "Account Management", color: "#3B82F6"},
  { stage: "Onboarding",             owner: "Account Management", color: "#6366F1"},
  { stage: "Service Activation",     owner: "Account Management", color: "#8B5CF6"},
  { stage: "Department Launch",      owner: "Account Management", color: "#A855F7"},
  { stage: "Active",                 owner: "Account Management", color: "#059669"},
  { stage: "Renewal Triggered",      owner: "Account Management", color: "#D97706"},
  { stage: "QBR Scheduled",          owner: "Account Management", color: "#0891B2"},
  { stage: "Renewal Negotiation",    owner: "Account Management", color: "#F59E0B"},
  { stage: "Renewed",                owner: "Account Management", color: "#059669"},
] as const;

const AM_OWNER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Sales":              { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE"},
  "Billing":            { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE"},
  "Account Management": { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0"},
};

function AMLifecycleEngine({ activeStages }: { activeStages?: string[] }) {
  const active = activeStages ?? [];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Client Lifecycle Status Engine</p>
        <div className="flex gap-2">
          {Object.entries(AM_OWNER_COLORS).map(([owner, c]) => (
            <span key={owner} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"style={{ background: c.bg, color: c.text, borderColor: c.border }}>{owner}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {AM_LIFECYCLE_STAGES.map((s, i) => {
          const c = AM_OWNER_COLORS[s.owner];
          const isActive = active.includes(s.stage);
          return (
            <React.Fragment key={s.stage}>
              <div
                className="px-2 py-1 rounded-lg text-[10px] font-semibold border"style={{
                  background: isActive ? s.color : c.bg,
                  color: isActive ? "#fff": c.text,
                  borderColor: isActive ? s.color : c.border,
                  opacity: active.length === 0 || isActive ? 1 : 0.5,
                }}
              >
                {s.stage}
              </div>
              {i < AM_LIFECYCLE_STAGES.length - 1 && (
                <span className="text-[10px] text-slate-300">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2">
        <p className="text-xs font-semibold text-indigo-800">
           Account Management starts only after <strong>Ready For Assignment</strong> (confirmed by Billing).
          AM owns: Assigned → Onboarding → Service Activation → Department Launch → Active → Renewal Triggered → QBR Scheduled → Renewal Negotiation → Renewed.
        </p>
      </div>
    </div>
  );
}

//  Badge helpers 

function healthBadge(status: string) {
  switch (status) {
    case "Healthy": return "bg-green-100 text-green-700 border-green-200";
    case "Needs Attention": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "At Risk": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Critical": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

function severityBadge(level: string) {
  switch (level) {
    case "Critical": return "bg-red-100 text-red-700";
    case "High": return "bg-orange-100 text-orange-700";
    case "Medium": return "bg-yellow-100 text-yellow-700";
    case "Low": return "bg-blue-100 text-blue-700";
    default: return "bg-slate-100 text-slate-500";
  }
}

function priorityBadge(p: string) {
  switch (p) {
    case "Critical": return "bg-red-100 text-red-700";
    case "High": return "bg-orange-100 text-orange-700";
    case "Medium": return "bg-yellow-100 text-yellow-700";
    case "Low": return "bg-blue-100 text-blue-700";
    default: return "bg-slate-100 text-slate-500";
  }
}

//  Shared sub-components 

function KpiCard({ label, value, color, bg, border }: { label: string; value: string | number; color: string; bg: string; border: string }) {
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-slate-100 px-6 py-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function ModuleButton({ label, href }: { label: string; href?: string }) {
  return (
    <a
      href={href ?? "#"}
      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors">
      {label} →
    </a>
  );
}

function PipelineStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
      <p className={`text-2xl font-bold ${color ?? "text-slate-800"}`}>{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
    </div>
  );
}

//  HEAD VIEW 

function HeadView() {
  const workload = getWorkloadSummary();

  // 1. Portfolio KPI Summary — derived from mock data
  const activeClients = ALL_CLIENTS.length;
  const atRisk = ALL_CLIENTS.filter((c) => c.healthStatus === "At Risk"|| c.healthStatus === "Critical").length;
  const latePayments = ALL_CLIENTS.filter((c) => c.paymentStatus === "Overdue").length;
  const delayedDeliverables = ALL_HEALTH.filter((h) => h.deliverableStatus === "Delayed"|| h.deliverableStatus === "Blocked").length;
  const reportsDue = ALL_HEALTH.filter((h) => h.reportingStatus === "Overdue"|| h.reportingStatus === "Due Soon").length;
  const checkinsDue = ALL_CLIENTS.filter((c) => c.nextCheckin <= "Jun 15, 2025").length;
  const renewalsDue = ALL_RENEWALS.filter((r) => r.daysRemaining <= 90).length;
  const revenueAtRisk = ALL_RENEWALS
    .filter((r) => r.status === "High Risk"|| r.status === "At Risk")
    .reduce((sum, r) => {
      const mo = parseFloat(r.contractValue.replace(/[^0-9.]/g, "")) / 12;
      return sum + mo;
    }, 0);

  // 2. Clients Requiring Action — mock rows
  const actionClients = [
    { client: "Lakeview Dental", am: "Sarah Chen", issue: "Payment 45 days overdue; renewal in 23 days", severity: "Critical", module: "Renewals", due: "Jun 30, 2025", action: "Executive retention call + billing escalation"},
    { client: "Harbor Auto", am: "Sarah Chen", issue: "Overdue payment; lead volume down 28%", severity: "High", module: "Client Health", due: "Jul 11, 2025", action: "Immediate payment follow-up; performance review"},
    { client: "Summit Landscaping", am: "James Park", issue: "Deliverables delayed; reporting overdue", severity: "High", module: "Tasks Central", due: "Jun 5, 2025", action: "Unblock LSA docs; expedite deliverables"},
    { client: "Pacific Dental", am: "Maria Santos", issue: "No check-in in 30 days; report due soon", severity: "Medium", module: "Check-ins", due: "Jun 11, 2025", action: "Book check-in within 48 hours"},
    { client: "Bright Dental Studio", am: "Tina Webb", issue: "Renewal in 43 days; upsell opportunity pending", severity: "Medium", module: "Renewals", due: "Jul 20, 2025", action: "Initiate renewal conversation; content upsell proposal"},
    { client: "Metro Plumbing", am: "Maria Santos", issue: "Satisfaction survey overdue; winter planning needed", severity: "Low", module: "Check-ins", due: "Jun 8, 2025", action: "Send satisfaction survey; schedule winter campaign call"},
  ];

  // Onboarding pipeline counts
  const onboardingStages = ["Awaiting Payment", "Ready To Onboard", "Intake In Progress", "Service Activation", "Department Launch", "Onboarding Complete"];
  const onboardingCounts: Record<string, number> = {};
  onboardingStages.forEach((s) => {
    onboardingCounts[s] = ALL_ONBOARDING.filter((o) => o.stage === s).length;
  });
  // manual supplement for demo
  onboardingCounts["Ready To Onboard"] = onboardingCounts["Ready To Onboard"] || 1;
  onboardingCounts["Onboarding Complete"] = onboardingCounts["Onboarding Complete"] || 0;

  // Renewal pipeline
  const renewalPipeline = {
    due90: ALL_RENEWALS.filter((r) => r.daysRemaining <= 90).length,
    due60: ALL_RENEWALS.filter((r) => r.daysRemaining <= 60).length,
    due30: ALL_RENEWALS.filter((r) => r.daysRemaining <= 30).length,
    negotiation: ALL_RENEWALS.filter((r) => r.status === "High Risk").length,
    renewed: ALL_RENEWALS.filter((r) => r.status === "Renewing").length,
    lost: 0,
  };

  // Client health summary
  const highRisk = ALL_CLIENTS.filter((c) => c.riskLevel === "High").length;
  const critical = ALL_CLIENTS.filter((c) => c.riskLevel === "Critical").length;
  const escalations = ALL_CLIENTS.filter((c) => c.healthStatus === "Critical").length;
  const avgHealth = Math.round(ALL_HEALTH.reduce((a, h) => a + h.healthScore, 0) / ALL_HEALTH.length);
  const seasonal = ALL_HEALTH.filter((h) => h.seasonalNote).length;

  // Task summary
  const openTasks = ALL_TASKS.filter((t) => t.status !== "Completed").length;
  const blockedTasks = ALL_TASKS.filter((t) => t.status === "Blocked").length;
  const waitingClient = ALL_TASKS.filter((t) => t.status === "Waiting For Client").length;
  const waitingDept = ALL_TASKS.filter((t) => t.status === "Review").length;
  const completedWeek = ALL_TASKS.filter((t) => t.status === "Completed").length;

  // AM Portfolio Summary extended
  const workloadExtended = AM_NAMES.map((am) => {
    const clients = getClientsByAM(am);
    const onboarding = ALL_ONBOARDING.filter((o) => o.assignedAM === am).length;
    const openT = ALL_TASKS.filter((t) => t.assignedAM === am && t.status !== "Completed").length;
    const atRiskC = clients.filter((c) => c.riskLevel === "High"|| c.riskLevel === "Critical").length;
    const checkins = clients.filter((c) => c.nextCheckin <= "Jun 15, 2025").length;
    const renewals = ALL_RENEWALS.filter((r) => r.assignedAM === am && r.daysRemaining <= 90).length;
    const pct = Math.round((clients.length / 4) * 100); // max ~4 per AM in demo
    const capacity = pct >= 100 ? "High Load": pct >= 75 ? "Active": "Available";
    return { am, clients: clients.length, onboarding, openT, atRiskC, checkins, renewals, capacity };
  });

  return (
    <div className="space-y-6">

      {/*  1. Portfolio KPI Summary  */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Portfolio KPI Summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard label="Active Recurring Clients"value={activeClients} color="text-slate-800"bg="bg-slate-50"border="border-slate-200"/>
          <KpiCard label="Clients At Risk"value={atRisk} color="text-red-700"bg="bg-red-50"border="border-red-200"/>
          <KpiCard label="Clients With Late Payments"value={latePayments} color="text-orange-700"bg="bg-orange-50"border="border-orange-200"/>
          <KpiCard label="Deliverables Delayed"value={delayedDeliverables} color="text-amber-700"bg="bg-amber-50"border="border-amber-200"/>
          <KpiCard label="Reports Due"value={reportsDue} color="text-indigo-700"bg="bg-indigo-50"border="border-indigo-200"/>
          <KpiCard label="Check-ins Due"value={checkinsDue} color="text-blue-700"bg="bg-blue-50"border="border-blue-200"/>
          <KpiCard label="Renewals Due"value={renewalsDue} color="text-violet-700"bg="bg-violet-50"border="border-violet-200"/>
          <KpiCard label="Revenue At Risk"value={`$${Math.round(revenueAtRisk / 100) * 100 / 1000 < 1 ? Math.round(revenueAtRisk) : (revenueAtRisk / 1000).toFixed(1) + "K"}/mo`} color="text-red-700"bg="bg-red-50"border="border-red-200"/>
        </div>
      </section>

      {/*  0. Client Lifecycle Engine  */}
      <AMLifecycleEngine activeStages={["Assigned","Onboarding","Service Activation","Department Launch","Active","Renewal Triggered","QBR Scheduled","Renewal Negotiation","Renewed"]} />

      {/*  2. AM Portfolio Summary  */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader title="AM Portfolio Summary"subtitle="Client load, task burden, risk, and SLA status across all Account Managers."/>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Account Manager", "Assigned Clients", "Onboarding Clients", "Open Tasks", "At-Risk Clients", "Check-ins Due", "Renewals Due", "Queue Status"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workloadExtended.map((row) => (
                <tr key={row.am} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">{row.am}</td>
                  <td className="px-5 py-3 text-slate-700">{row.clients}</td>
                  <td className="px-5 py-3 text-slate-700">{row.onboarding}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${row.openT > 3 ? "bg-orange-100 text-orange-700": "bg-slate-100 text-slate-600"}`}>{row.openT}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${row.atRiskC > 0 ? "bg-red-100 text-red-700": "bg-green-100 text-green-700"}`}>{row.atRiskC}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{row.checkins}</td>
                  <td className="px-5 py-3 text-slate-700">{row.renewals}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.capacity === "High Load"? "bg-red-100 text-red-700": row.capacity === "Active"? "bg-yellow-100 text-yellow-700": "bg-green-100 text-green-700"}`}>{row.capacity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/*  3. Clients Requiring Action  */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader title="Clients Requiring Action"subtitle="Priority clients that need immediate or near-term manager intervention."/>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Assigned AM", "Issue", "Severity", "Related Module", "Due Date", "Recommended Action"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {actionClients.map((row) => (
                <tr key={row.client} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{row.am}</td>
                  <td className="px-5 py-3 text-slate-700 max-w-[220px]">{row.issue}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${severityBadge(row.severity)}`}>{row.severity}</span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{row.module}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap text-xs">{row.due}</td>
                  <td className="px-5 py-3 text-slate-600 text-xs max-w-[220px]">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/*  4. Onboarding Pipeline Summary  */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader title="Onboarding Pipeline Summary"subtitle="High-level onboarding stage counts across all clients and AMs."/>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <PipelineStat label="Awaiting Payment"value={onboardingCounts["Awaiting Payment"] ?? 0} color="text-orange-600"/>
            <PipelineStat label="Ready To Onboard"value={onboardingCounts["Ready To Onboard"] ?? 0} color="text-blue-600"/>
            <PipelineStat label="Intake In Progress"value={onboardingCounts["Intake In Progress"] ?? 0} color="text-indigo-600"/>
            <PipelineStat label="Service Activation"value={onboardingCounts["Service Activation"] ?? 0} color="text-violet-600"/>
            <PipelineStat label="Department Launch"value={onboardingCounts["Department Launch"] ?? 0} color="text-teal-600"/>
            <PipelineStat label="Onboarding Complete"value={onboardingCounts["Onboarding Complete"] ?? 0} color="text-green-600"/>
          </div>
          <div className="flex justify-end">
            <ModuleButton label="View Client Onboarding" href="/account-management/onboarding" />
          </div>
        </div>
      </section>

      {/*  5. Renewal Pipeline Summary  */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader title="Renewal Pipeline Summary"subtitle="Portfolio renewal health and stage distribution."/>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <PipelineStat label="Renewals Due 90 Days"value={renewalPipeline.due90} color="text-indigo-600"/>
            <PipelineStat label="Renewals Due 60 Days"value={renewalPipeline.due60} color="text-violet-600"/>
            <PipelineStat label="Renewals Due 30 Days"value={renewalPipeline.due30} color="text-orange-600"/>
            <PipelineStat label="Negotiation"value={renewalPipeline.negotiation} color="text-amber-600"/>
            <PipelineStat label="Renewed"value={renewalPipeline.renewed} color="text-green-600"/>
            <PipelineStat label="Lost"value={renewalPipeline.lost} color="text-red-600"/>
          </div>
          <div className="flex justify-end">
            <ModuleButton label="View Renewals" href="/account-management/renewals" />
          </div>
        </div>
      </section>

      {/*  6. Escalations & Client Health Summary  */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader title="Escalations & Client Health Summary"subtitle="Portfolio-wide health signals, risk counts, and seasonal context."/>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <PipelineStat label="High Risk Clients"value={highRisk} color="text-orange-600"/>
            <PipelineStat label="Critical Clients"value={critical} color="text-red-600"/>
            <PipelineStat label="Escalations Open"value={escalations} color="text-red-700"/>
            <PipelineStat label="Average Health Score"value={`${avgHealth}/100`} color={avgHealth >= 75 ? "text-green-600": avgHealth >= 60 ? "text-yellow-600": "text-red-600"} />
            <PipelineStat label="Seasonal Opportunities"value={seasonal} color="text-teal-600"/>
          </div>
          <div className="flex justify-end">
            <ModuleButton label="View Client Health" href="/account-management/client-health" />
          </div>
        </div>
      </section>

      {/*  7. Centralized Task Summary  */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader title="Centralized Task Summary"subtitle="Portfolio-wide task status snapshot across all AMs and clients."/>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <PipelineStat label="Open Tasks"value={openTasks} color="text-indigo-600"/>
            <PipelineStat label="Blocked Tasks"value={blockedTasks} color="text-red-600"/>
            <PipelineStat label="Waiting For Client"value={waitingClient} color="text-orange-600"/>
            <PipelineStat label="Waiting For Department"value={waitingDept} color="text-amber-600"/>
            <PipelineStat label="Completed This Week"value={completedWeek} color="text-green-600"/>
          </div>
          <div className="flex justify-end">
            <ModuleButton label="View Centralized Tasks" href="/account-management/tasks-central" />
          </div>
        </div>
      </section>

      {/*  8. AI Executive Summary  */}
      <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm">
        <div className="border-b border-indigo-100 px-6 py-4 flex items-center gap-3">
          
          <div>
            <h2 className="text-lg font-bold text-indigo-900">AI Executive Summary</h2>
            <p className="text-sm text-indigo-600 mt-0.5">AI-generated portfolio intelligence · Updated today</p>
          </div>
          <span className="ml-auto inline-flex rounded-full bg-indigo-100 border border-indigo-200 px-3 py-0.5 text-xs font-bold text-indigo-700">Mock AI</span>
        </div>
        <div className="p-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: "",
              title: "Overall Portfolio Status",
              text: "Portfolio is moderately healthy with 10 active recurring clients across 4 AMs. 2 clients (Lakeview Dental, Harbor Auto) require urgent executive intervention due to combined payment and renewal risk.",
              bg: "bg-white border-indigo-100",
            },
            {
              icon: "",
              title: "Risk Trends",
              text: "At-risk revenue is trending upward. Lakeview Dental and Harbor Auto represent $56,400/yr in combined renewal risk. If both churn, MRR drops ~15%. Early Q3 intervention is critical.",
              bg: "bg-white border-red-100",
            },
            {
              icon: "",
              title: "Throughput Issues",
              text: "Sarah Chen carries the highest risk load (2 critical accounts). James Park has a delayed deliverable blocking LSA launch for Summit Landscaping. Consider redistributing 1 account from Sarah to Tina in Q3.",
              bg: "bg-white border-orange-100",
            },
            {
              icon: "",
              title: "Renewal Opportunities",
              text: "Pinnacle HVAC ($54K/yr) is renewal-ready with a 95% retention probability — propose GBP + SEO upsell worth $1,200/mo. Apex Roofing storm season upsell (LSA + Call Tracking) adds $800/mo.",
              bg: "bg-white border-green-100",
            },
            {
              icon: "",
              title: "Recommended Manager Actions",
              text: "1) Call Lakeview Dental executive this week. 2) Resolve Harbor Auto payment before Jul 11 renewal. 3) Unblock Summit Landscaping LSA docs. 4) Send upsell proposals to Pinnacle HVAC and Apex Roofing. 5) Book Pacific Dental check-in within 48 hrs.",
              bg: "bg-white border-indigo-100",
            },
            {
              icon: "",
              title: "Seasonal Context",
              text: "Phoenix summer heat spike benefits Pinnacle HVAC and Apex Roofing — both should increase paid budgets. MedSpa summer season boosts Radiance MedSpa. Back-to-school dental demand peaks in August for NorthStar and Pacific Dental.",
              bg: "bg-white border-teal-100",
            },
          ].map(({ icon, title, text, bg }) => (
            <div key={title} className={`rounded-xl border p-4 ${bg}`}>
              <p className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-2">
                <span>{icon}</span>{title}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

//  AM VIEW 

function AMView() {
  const myClients = getClientsByAM(SARAH);
  const myTasks = ALL_TASKS.filter((t) => t.assignedAM === SARAH);
  const myRenewals = ALL_RENEWALS.filter((r) => r.assignedAM === SARAH);
  const myHealth = ALL_HEALTH.filter((h) => h.assignedAM === SARAH);
  const myOnboarding = ALL_ONBOARDING.filter((o) => o.assignedAM === SARAH);

  // 1. My KPI Summary
  const myAtRisk = myClients.filter((c) => c.riskLevel === "High"|| c.riskLevel === "Critical").length;
  const myOpenTasks = myTasks.filter((t) => t.status !== "Completed").length;
  const myCheckinsDue = myClients.filter((c) => c.nextCheckin <= "Jun 15, 2025").length;
  const myRenewalsDue = myRenewals.filter((r) => r.daysRemaining <= 90).length;
  const myReportsDue = myHealth.filter((h) => h.reportingStatus === "Overdue"|| h.reportingStatus === "Due Soon").length;
  const myOnboardingCount = myOnboarding.length;
  const myDelayed = myHealth.filter((h) => h.deliverableStatus === "Delayed"|| h.deliverableStatus === "Blocked").length;

  // 3. My Priority Actions
  const priorityActions = [
    { client: "Lakeview Dental", action: "Payment 45 days overdue — escalate to billing and book retention call", module: "Renewals", priority: "Critical", due: "Jun 10, 2025", suggested: "Call client; prepare executive brief for manager"},
    { client: "Harbor Auto", action: "Follow up on overdue payment; performance declining", module: "Client Health", priority: "High", due: "Jun 10, 2025", suggested: "Send payment reminder; schedule performance review call"},
    { client: "Lakeview Dental", action: "Renewal due Jun 30 — brief and proposal needed", module: "Renewals", priority: "High", due: "Jun 12, 2025", suggested: "Prepare renewal brief; coordinate with manager"},
    { client: "Harbor Auto", action: "GBP access request pending client approval", module: "Tasks Central", priority: "Medium", due: "Jun 10, 2025", suggested: "Follow up with client contact via email"},
    { client: "Apex Roofing", action: "Upsell opportunity: storm season LSA campaign", module: "Renewals", priority: "Medium", due: "Jun 20, 2025", suggested: "Prepare LSA + Call Tracking upsell proposal"},
  ];

  // 4. My Onboarding Summary
  const myReadyToOnboard = myOnboarding.filter((o) => o.stage === "Assigned to AM"|| o.stage === "Ready To Onboard").length;
  const myIntakeInProgress = myOnboarding.filter((o) => o.stage === "Intake In Progress").length;
  const myAssetsMissing = 1; // mock: Apex Roofing assets
  const myDeptLaunch = myOnboarding.filter((o) => o.stage === "Department Launch").length;

  // 5. My Task Summary
  const myAssignedTasks = myTasks.length;
  const myOverdue = myTasks.filter((t) => t.dueDate <= "Jun 10"&& t.status !== "Completed").length;
  const myBlocked = myTasks.filter((t) => t.status === "Blocked").length;
  const myWaitingClient = myTasks.filter((t) => t.status === "Waiting For Client").length;
  const myCompletedWeek = myTasks.filter((t) => t.status === "Completed").length;

  // 6. My Client Health Summary
  const myHealthy = myClients.filter((c) => c.healthStatus === "Healthy").length;
  const myNeedsAttention = myClients.filter((c) => c.healthStatus === "Needs Attention").length;
  const myAtRiskH = myClients.filter((c) => c.healthStatus === "At Risk"|| c.healthStatus === "Critical").length;
  const mySeasonal = myHealth.filter((h) => h.seasonalNote).length;
  const myAIRecs = myHealth.filter((h) => h.aiRecommendation).length;

  // 7. My Renewals Summary
  const myRenewalsDue90 = myRenewals.filter((r) => r.daysRemaining <= 90).length;
  const myUpsell = myRenewals.filter((r) => r.upsellOpportunity).length;
  const myRevenueOpp = myRenewals.reduce((sum, r) => {
    const v = parseFloat(r.upsellRevenue.replace(/[^0-9]/g, ""));
    return sum + (isNaN(v) ? 0 : v);
  }, 0);
  const myRenewalRisk = myRenewals.filter((r) => r.status === "High Risk"|| r.status === "At Risk").length;

  return (
    <div className="space-y-6">

      {/*  1. My KPI Summary  */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">My KPI Summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard label="My Assigned Clients"value={myClients.length} color="text-blue-700"bg="bg-blue-50"border="border-blue-200"/>
          <KpiCard label="My Open Tasks"value={myOpenTasks} color="text-indigo-700"bg="bg-indigo-50"border="border-indigo-200"/>
          <KpiCard label="My Check-ins Due"value={myCheckinsDue} color="text-violet-700"bg="bg-violet-50"border="border-violet-200"/>
          <KpiCard label="My At-Risk Clients"value={myAtRisk} color="text-red-700"bg="bg-red-50"border="border-red-200"/>
          <KpiCard label="My Renewals Due"value={myRenewalsDue} color="text-amber-700"bg="bg-amber-50"border="border-amber-200"/>
          <KpiCard label="My Reports Due"value={myReportsDue} color="text-orange-700"bg="bg-orange-50"border="border-orange-200"/>
          <KpiCard label="My Onboarding Clients"value={myOnboardingCount} color="text-teal-700"bg="bg-teal-50"border="border-teal-200"/>
          <KpiCard label="My Delayed Deliverables"value={myDelayed} color="text-red-700"bg="bg-red-50"border="border-red-200"/>
        </div>
      </section>

      {/*  0b. Client Lifecycle Engine  */}
      <AMLifecycleEngine activeStages={["Assigned","Onboarding","Service Activation","Department Launch","Active","Renewal Triggered","QBR Scheduled","Renewal Negotiation","Renewed"]} />

      {/*  2. My Client Portfolio  */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader title="My Client Portfolio"subtitle={`All clients assigned to ${SARAH}. Other AM portfolios are not visible in this view.`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Active Services", "Payment Status", "Deliverable Status", "Health Score", "Last Check-in", "Next Check-in", "Renewal Date", "Next Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myClients.map((c) => {
                const health = myHealth.find((h) => h.client === c.name);
                return (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.services.map((s) => (
                          <span key={s} className="text-[10px] rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.paymentStatus === "Current"? "bg-emerald-100 text-emerald-700": c.paymentStatus === "Overdue"? "bg-red-100 text-red-700": "bg-amber-100 text-amber-700"}`}>{c.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${health?.deliverableStatus === "Completed"? "bg-green-100 text-green-700": health?.deliverableStatus === "Blocked"? "bg-red-100 text-red-700": health?.deliverableStatus === "Delayed"? "bg-orange-100 text-orange-700": "bg-blue-100 text-blue-700"}`}>{health?.deliverableStatus ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold text-sm ${c.healthScore >= 80 ? "text-green-600": c.healthScore >= 60 ? "text-yellow-600": "text-red-600"}`}>{c.healthScore}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{c.lastCheckin}</td>
                    <td className="px-4 py-3 text-blue-600 font-semibold whitespace-nowrap text-xs">{c.nextCheckin}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{c.renewalDate}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[180px]">{health?.aiRecommendation ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic">{myClients.length} clients in my portfolio · Other AM client data not visible in this view.</p>
        </div>
      </section>

      {/*  3. My Priority Actions  */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader title="My Priority Actions"subtitle="Immediate and near-term actions required across my client portfolio."/>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Action Needed", "Related Module", "Priority", "Due Date", "Suggested Action"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {priorityActions.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-5 py-3 text-slate-700 max-w-[200px]">{row.action}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{row.module}</span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityBadge(row.priority)}`}>{row.priority}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap text-xs">{row.due}</td>
                  <td className="px-5 py-3 text-slate-600 text-xs max-w-[200px]">{row.suggested}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/*  4. My Onboarding Summary  */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader title="My Onboarding Summary"subtitle="Onboarding status for clients in my queue."/>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <PipelineStat label="Clients Ready To Onboard"value={myReadyToOnboard} color="text-blue-600"/>
            <PipelineStat label="Intake In Progress"value={myIntakeInProgress} color="text-indigo-600"/>
            <PipelineStat label="Assets Missing"value={myAssetsMissing} color="text-orange-600"/>
            <PipelineStat label="Department Launch Pending"value={myDeptLaunch} color="text-teal-600"/>
          </div>
          <div className="flex justify-end">
            <ModuleButton label="Go To My Onboarding" href="/account-management/onboarding" />
          </div>
        </div>
      </section>

      {/*  5. My Task Summary  */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader title="My Task Summary"subtitle="Task status overview for all my assigned work."/>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <PipelineStat label="Assigned Tasks"value={myAssignedTasks} color="text-indigo-600"/>
            <PipelineStat label="Overdue Tasks"value={myOverdue} color="text-red-600"/>
            <PipelineStat label="Blocked Tasks"value={myBlocked} color="text-orange-600"/>
            <PipelineStat label="Waiting For Client"value={myWaitingClient} color="text-amber-600"/>
            <PipelineStat label="Completed This Week"value={myCompletedWeek} color="text-green-600"/>
          </div>
          <div className="flex justify-end">
            <ModuleButton label="Go To Centralized Tasks" href="/account-management/tasks-central" />
          </div>
        </div>
      </section>

      {/*  6. My Client Health Summary  */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader title="My Client Health Summary"subtitle="Health distribution and AI recommendations across my portfolio."/>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <PipelineStat label="Healthy Clients"value={myHealthy} color="text-green-600"/>
            <PipelineStat label="Needs Attention"value={myNeedsAttention} color="text-yellow-600"/>
            <PipelineStat label="At Risk"value={myAtRiskH} color="text-red-600"/>
            <PipelineStat label="Seasonal Opportunities"value={mySeasonal} color="text-teal-600"/>
            <PipelineStat label="AI Recommendations"value={myAIRecs} color="text-indigo-600"/>
          </div>
          <div className="flex justify-end">
            <ModuleButton label="Go To Client Health" href="/account-management/client-health" />
          </div>
        </div>
      </section>

      {/*  7. My Renewals Summary  */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader title="My Renewals Summary"subtitle="Renewal pipeline and upsell opportunities for my clients."/>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <PipelineStat label="Renewals Due"value={myRenewalsDue90} color="text-indigo-600"/>
            <PipelineStat label="Upsell Opportunities"value={myUpsell} color="text-teal-600"/>
            <PipelineStat label="Revenue Opportunity"value={`$${myRevenueOpp}/mo`} color="text-green-600"/>
            <PipelineStat label="Renewal Risk"value={myRenewalRisk} color="text-red-600"/>
          </div>
          <div className="flex justify-end">
            <ModuleButton label="Go To Renewals" href="/account-management/renewals" />
          </div>
        </div>
      </section>

      {/*  8. AI AM Summary  */}
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
        <div className="border-b border-blue-100 px-6 py-4 flex items-center gap-3">
          
          <div>
            <h2 className="text-lg font-bold text-blue-900">AI AM Summary</h2>
            <p className="text-sm text-blue-600 mt-0.5">AI-generated insights for your portfolio · {SARAH}</p>
          </div>
          <span className="ml-auto inline-flex rounded-full bg-blue-100 border border-blue-200 px-3 py-0.5 text-xs font-bold text-blue-700">Mock AI</span>
        </div>
        <div className="p-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: "",
              title: "Client Risks",
              text: "Lakeview Dental is your most urgent risk — payment is 45 days overdue and renewal is in 23 days. Escalate immediately. Harbor Auto payment must be resolved before the Jul 11 renewal window closes.",
            },
            {
              icon: "",
              title: "Suggested Check-ins",
              text: "Schedule Harbor Auto check-in immediately (last contact May 15). Book Lakeview Dental executive call this week. Apex Roofing is due for a Jul 2 check-in — storm season campaign should be the agenda focus.",
            },
            {
              icon: "",
              title: "Overdue Tasks",
              text: "GBP access request for Harbor Auto is waiting on client approval — send a follow-up today. Lakeview Dental renewal brief is not started and is due Jun 12. SEO setup checklist for Apex Roofing is in progress — confirm completion.",
            },
            {
              icon: "",
              title: "Upsell Opportunities",
              text: "Apex Roofing: propose LSA + Call Tracking ($800/mo) aligned to summer storm season. Harbor Auto: Display Ads expansion ($600/mo) once payment is resolved. Lakeview Dental: GBP Management add-on ($400/mo) if retained.",
            },
            {
              icon: "",
              title: "Seasonal Opportunities",
              text: "Phoenix storm season is live — Apex Roofing should increase Google Ads budget and launch storm damage creative now. Harbor Auto benefits from summer driving demand — recovery is possible if payment is resolved quickly.",
            },
            {
              icon: "",
              title: "Recommended Next Actions",
              text: "1) Call Lakeview Dental today. 2) Send Harbor Auto payment reminder + escalate. 3) Prepare Lakeview renewal brief by Jun 12. 4) Send Apex Roofing upsell proposal. 5) Follow up Harbor Auto GBP access request.",
            },
          ].map(({ icon, title, text }) => (
            <div key={title} className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-2">
                <span>{icon}</span>{title}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

//  Page 

export default function AccountManagementDashboard() {
  const [role, setRole] = useState<AMRole>("head");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Account Management Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Executive command center — portfolio KPIs, AM load, client health, renewals, SLA status, and AI insights.
          <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            AM starts after Ready For Assignment
          </span>
        </p>
      </div>

      {/* Role Toggle — Account Management Head View / Account Manager View */}
      <RoleToggle role={role} onRoleChange={setRole} />

      {/* View label for each role — confirmed by toggle */}
      {role === "head"? (
        <div aria-label="Account Management Head View"className="hidden"/>
      ) : (
        <div aria-label="Account Manager View"className="hidden">
          <span>Viewing as Account Manager: {SARAH}</span>
        </div>
      )}

      {/* Role content */}
      {role === "head"? <HeadView /> : <AMView />}
    </div>
  );
}
