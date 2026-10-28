"use client";

import React, { useState, useEffect } from "react";
import { useDepartmentUsers } from "@/lib/users/users-api";
import { fetchAMClients, type BusinessClient } from "@/lib/account-management/am-client-data";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";

const workspace = getWorkspace("account-management")!;

//  Mock Data 

// kpiData is computed from real clients inside the page component (below).
// These static values have been removed.

// directoryClients is now loaded from real Postgres data via fetchAMClients (in component).

const healthVariant = (score: number) => {
  if (score >= 85) return "success"as const;
  if (score >= 70) return "info"as const;
  if (score >= 55) return "warning"as const;
  return "error"as const;
};
const paymentVariant = (s: string) => {
  if (s === "Current")  return "success"as const;
  if (s === "Pending")  return "warning"as const;
  return "error"as const;
};
const onboardingVariant = (s: string) => s === "Complete"? "success"as const : "info"as const;

//  Client Lifecycle Engine 

const CLC_STAGES = [
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

const CLC_OWNER_COLORS: Record<string, { bg?: string; text: string; border: string }> = {
  "Sales":              { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE"},
  "Billing":            { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE"},
  "Account Management": { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0"},
};

function ClientLifecycleEngine({ activeStages }: { activeStages?: string[] }) {
  const active = activeStages ?? [];
  return (
    <div className="rounded-xl border p-4 space-y-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <p className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Client Lifecycle Status Engine</p>
        <div className="flex gap-2">
          {Object.entries(CLC_OWNER_COLORS).map(([owner, c]) => (
            <span key={owner} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"style={{ background: c.bg, color: c.text, borderColor: c.border }}>{owner}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {CLC_STAGES.map((s, i) => {
          const c = CLC_OWNER_COLORS[s.owner];
          const isActive = active.includes(s.stage);
          return (
            <React.Fragment key={s.stage}>
              <div
                className="px-2 py-0.5 rounded text-[10px] font-semibold border"style={{
                  background: isActive ? s.color : c.bg,
                  color: isActive ? "#fff": c.text,
                  borderColor: isActive ? s.color : c.border,
                  opacity: active.length === 0 || isActive ? 1 : 0.5,
                }}
              >
                {s.stage}
              </div>
              {i < CLC_STAGES.length - 1 && <span className="text-[10px]"style={{ color: "var(--rtm-border)"}}>→</span>}
            </React.Fragment>
          );
        })}
      </div>
      <p className="text-xs font-semibold"style={{ color: "#065F46"}}>
         Account Management starts only after <strong>Ready For Assignment</strong> (Billing-confirmed).
      </p>
    </div>
  );
}

//  Selected Client Mock 

// selectedClient is derived from the selected real BusinessClient — see component.

// Tab content data (clientServices, clientTasks, etc.) are not yet connected to a real API source.
// Tabs that previously showed invented data now show an honest empty state.
// See the tab rendering section in the component for details.

const reportDeptStatusStyle = (s: string): React.CSSProperties => {
  if (s === "Done")        return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
  if (s === "In Progress") return { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" };
  if (s === "Overdue")     return { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
  return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
};

const PROFILE_TABS = ["Overview", "Onboarding", "Services", "Tasks", "Health", "Check-ins", "Reports", "Renewals", "Notes", "Documents"] as const;
type ProfileTab = typeof PROFILE_TABS[number];

// AM_OPTIONS removed — the AM filter now uses real Account Management users from the API.
const STATUS_OPTIONS = ["All Statuses", "Healthy", "At Risk", "Watch", "Onboarding"];
const SERVICE_OPTIONS= ["All Services", "SEO", "GBP", "Meta Ads", "Google Ads", "LSA", "Content", "Website Dev", "Reporting"];
const PAYMENT_OPTIONS= ["All Payments", "Current", "Pending", "Late", "Overdue"];
const HEALTH_OPTIONS = ["All Health", "85+", "70–84", "55–69", "<55"];

//  Page Component 

export default function AccountClientsPage() {
  const [activeTab,       setActiveTab]       = useState<ProfileTab>("Overview");
  const [selectedRow,     setSelectedRow]     = useState<string>("");
  const [filterAM,        setFilterAM]        = useState("All AMs");

  // Real clients from Postgres
  const [realClients, setRealClients] = useState<BusinessClient[]>([]);
  useEffect(() => {
    fetchAMClients().then((data) => {
      setRealClients(data);
      if (data.length > 0 && !selectedRow) setSelectedRow(data[0].clientName);
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Real Account Management users — loaded once for the AM filter.
  const { users: amUsers, loading: amLoading } = useDepartmentUsers("Account Management");
  const AM_OPTIONS = ["All AMs", ...amUsers.map(u => u.name)];
  const [filterStatus,    setFilterStatus]    = useState("All Statuses");
  const [filterService,   setFilterService]   = useState("All Services");
  const [filterPayment,   setFilterPayment]   = useState("All Payments");
  const [filterHealth,    setFilterHealth]    = useState("All Health");

  // Map real BusinessClient to the shape the directory table expects
  const directoryClients = realClients.map((c) => ({
    id:            c.id,
    name:          c.clientName,
    industry:      c.domain,
    location:      "—",
    am:            c.assignedAM,
    services:      c.activeServices.length,
    paymentStatus: c.paymentStatus === "paid" || c.paymentStatus === "cleared"
                     ? "Current"
                     : c.paymentStatus === "pending"
                     ? "Pending"
                     : c.paymentStatus === "overdue" || c.paymentStatus === "failed"
                     ? "Overdue"
                     : c.paymentStatus,
    healthScore:   c.activationStatus === "active" ? 85 : 60,
    onboarding:    c.cleared ? "Complete" : "In Progress",
    renewal:       c.renewalDate ?? "—",
    lastCheckin:   "—",
    nextAction:    "See onboarding record",
    rawClient:     c,
  }));

  const filteredClients = directoryClients.filter((c) => {
    if (filterAM !== "All AMs" && c.am !== filterAM) return false;
    if (filterPayment !== "All Payments" && c.paymentStatus !== filterPayment) return false;
    return true;
  });

  // KPI data derived from real clients
  const kpiData = [
    { title: "Total Active Clients",       value: String(realClients.length),  subtitle: "Across all AMs",           trend: "neutral" as const, trendValue: "live"},
    { title: "Active (Billing Cleared)",   value: String(realClients.filter(c => c.cleared).length), subtitle: "Cleared by Billing", trend: "neutral" as const, trendValue: "live"},
    { title: "New Onboarding Clients",     value: String(realClients.filter(c => c.activationStatus === "pending" || !c.cleared).length), subtitle: "In progress", trend: "neutral" as const, trendValue: "live"},
    { title: "Payment Issues",             value: String(realClients.filter(c => c.paymentStatus === "failed" || c.paymentStatus === "overdue").length), subtitle: "Failed or overdue", trend: "neutral" as const, trendValue: "live"},
    { title: "Clients With Late Payments", value: "—", subtitle: "Not yet connected", trend: "neutral" as const, trendValue: ""},
    { title: "Deliverable Delays",         value: "—", subtitle: "Not yet connected", trend: "neutral" as const, trendValue: ""},
    { title: "Renewals Due (30 days)",     value: "—", subtitle: "Not yet connected", trend: "neutral" as const, trendValue: ""},
    { title: "Upsell Opportunities",       value: "—", subtitle: "Not yet connected", trend: "neutral" as const, trendValue: ""},
  ];

  // Selected client (real data)
  const selectedClientRaw = realClients.find(c => c.clientName === selectedRow);

  return (
    <div className="space-y-8">

      {/*  Task Management Engine Banner  */}
      <TaskAccessCard
        context="Account Management"variant="banner"counters={{ open: 18, overdue: 4, dueToday: 7, completed: 53 }}
        createLabel="Create AM Task"examples={["Check-In", "QBR", "Client Follow-Up", "Renewal Prep", "Onboarding Task"]}
      />

      {/* Page Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
          Client Command Center
        </h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
          Single source of truth for all client management — portfolio, health, services, tasks, and renewals.
        </p>
      </div>

      {/*  Client Lifecycle Status  */}
      <section aria-label="Client Lifecycle Status">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>
          Client Lifecycle Status
        </h2>
        <ClientLifecycleEngine activeStages={["Assigned","Onboarding","Service Activation","Department Launch","Active","Renewal Triggered","QBR Scheduled","Renewal Negotiation","Renewed"]} />
      </section>

      {/*  SECTION 1 — Client Portfolio Overview  */}
      <section aria-label="Client Portfolio Overview">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>
          Client Portfolio Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiData.map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              trend={kpi.trend}
              trendValue={kpi.trendValue}
              accentColor={workspace.accentColor}
            />
          ))}
        </div>
      </section>

      {/*  SECTION 2 — Client Directory  */}
      <section aria-label="Client Directory">
        <SectionWrapper
          title="Client Directory"description={`${filteredClients.length} clients`}
          actions={
            <button className="rtm-btn-primary text-xs">+ Add Client</button>
          }
        >
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { label: "Account Manager", value: filterAM,      set: setFilterAM,      options: AM_OPTIONS      },
              { label: "Client Status",   value: filterStatus,  set: setFilterStatus,  options: STATUS_OPTIONS  },
              { label: "Service Type",    value: filterService, set: setFilterService, options: SERVICE_OPTIONS },
              { label: "Payment Status",  value: filterPayment, set: setFilterPayment, options: PAYMENT_OPTIONS },
              { label: "Health Status",   value: filterHealth,  set: setFilterHealth,  options: HEALTH_OPTIONS  },
            ].map(({ label, value, set, options }) => (
              <select
                key={label}
                value={value}
                onChange={(e) => set(e.target.value)}
                className="text-xs rounded-lg border px-2.5 py-1.5"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
                aria-label={label}
              >
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
          </div>
          {!amLoading && amUsers.length === 0 && (
            <p className="text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
              No one in Account Management has signed in yet — the AM filter will populate after first login.
            </p>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs"style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                  {["Client", "Industry", "Location", "Assigned AM", "Active Services", "Payment Status", "Health Score", "Onboarding Status", "Renewal Date", "Last Check-in", "Next Action"].map((col) => (
                    <th key={col} className="text-left py-2 px-3 font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((c) => {
                  const isSelected = c.name === selectedRow;
                  return (
                    <tr
                      key={c.name}
                      onClick={() => setSelectedRow(c.name)}
                      className="cursor-pointer transition-colors"style={{
                        background: isSelected ? "var(--rtm-blue-light)": undefined,
                        borderBottom: "1px solid var(--rtm-border-light)",
                      }}
                    >
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>{c.name}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{c.industry}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{c.location}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{c.am}</td>
                      <td className="py-2.5 px-3 text-center"style={{ color: "var(--rtm-text-secondary)"}}>{c.services}</td>
                      <td className="py-2.5 px-3"><StatusBadge variant={paymentVariant(c.paymentStatus)} label={c.paymentStatus} size="sm"/></td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold"style={{ color: c.healthScore >= 85 ? "#059669": c.healthScore >= 70 ? "#2563EB": c.healthScore >= 55 ? "#D97706": "#DC2626"}}>
                          {c.healthScore}
                        </span>
                        <StatusBadge variant={healthVariant(c.healthScore)} label=""size="sm"/>
                      </td>
                      <td className="py-2.5 px-3"><StatusBadge variant={onboardingVariant(c.onboarding)} label={c.onboarding} size="sm"/></td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{c.renewal}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{c.lastCheckin}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{c.nextAction}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      </section>

      {/*  SECTION 3 — Selected Client Profile (wired to real data)  */}
      <section aria-label="Selected Client Profile">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Selected Client Profile
        </h2>
        {!selectedClientRaw ? (
          <div className="rounded-xl border p-10 text-center" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
            <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
              {realClients.length === 0
                ? "No clients found. Clients appear here once Billing clears a payment and creates a business record."
                : "Select a client from the directory above to view their profile."}
            </p>
          </div>
        ) : (
          <SectionWrapper
            title={selectedClientRaw.clientName}
            description="Client workspace — full profile, tabs, and action center"
            actions={
              <StatusBadge
                variant={selectedClientRaw.paymentStatus === "failed" ? "error" : selectedClientRaw.activationStatus === "active" ? "success" : "pending"}
                label={selectedClientRaw.activationStatus}
                size="sm"
              />
            }
          >
            {/* Profile Header — real data from Postgres */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Domain / Website", value: selectedClientRaw.domain },
                { label: "Assigned AM",      value: selectedClientRaw.assignedAM || "Unassigned" },
                { label: "Payment Status",   value: selectedClientRaw.paymentStatus },
                { label: "Activation",       value: selectedClientRaw.activationStatus },
                { label: "Monthly Value",    value: selectedClientRaw.monthlyValue > 0 ? `$${selectedClientRaw.monthlyValue.toLocaleString()}/mo` : "—" },
                { label: "Renewal Date",     value: selectedClientRaw.renewalDate ?? "—" },
                { label: "Renewal Status",   value: selectedClientRaw.renewalStatus },
                { label: "Invoice Status",   value: selectedClientRaw.invoiceStatus },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Active Services chips */}
            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Active Services</p>
              <div className="flex flex-wrap gap-2">
                {selectedClientRaw.activeServices.length > 0 ? selectedClientRaw.activeServices.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>
                    {s}
                  </span>
                )) : (
                  <span className="text-sm italic" style={{ color: "var(--rtm-text-muted)" }}>No services recorded yet</span>
                )}
              </div>
            </div>

            {/*  Client Profile Tabs  */}
            <section aria-label="Client Profile Tabs">
              <div className="flex flex-wrap gap-1 mb-5 rounded-lg p-1" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
                {PROFILE_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                    style={{
                      background: activeTab === tab ? "var(--rtm-surface)" : "transparent",
                      color: activeTab === tab ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)",
                      boxShadow: activeTab === tab ? "0 1px 3px rgba(15,28,56,0.08)" : "none",
                      fontWeight: activeTab === tab ? "600" : "500",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* All tabs now show the real fields available or an honest empty state */}
              {activeTab === "Overview" && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>Account Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>Business Details</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium" style={{ color: "var(--rtm-text-secondary)" }}>Domain:</span> {selectedClientRaw.domain}</p>
                        <p><span className="font-medium" style={{ color: "var(--rtm-text-secondary)" }}>MRR:</span> {selectedClientRaw.monthlyValue > 0 ? `$${selectedClientRaw.monthlyValue.toLocaleString()}/mo` : "—"}</p>
                        <p><span className="font-medium" style={{ color: "var(--rtm-text-secondary)" }}>Cleared by Billing:</span> {selectedClientRaw.cleared ? "Yes" : "No"}</p>
                        <p><span className="font-medium" style={{ color: "var(--rtm-text-secondary)" }}>Activation:</span> {selectedClientRaw.activationStatus}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>Primary Contacts</p>
                      <p className="text-sm italic" style={{ color: "var(--rtm-text-muted)" }}>
                        Contact details are not yet connected to a real source. They will appear here once a contacts API is wired.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>AI Summary</p>
                    <p className="text-sm italic" style={{ color: "var(--rtm-text-muted)" }}>
                      AI account summaries will appear here once more client data is connected (tasks, renewals, check-in history).
                    </p>
                  </div>
                </div>
              )}

              {activeTab !== "Overview" && (
                <div className="rounded-xl border p-10 text-center" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-primary)" }}>{activeTab} — Not yet connected</p>
                  <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    The {activeTab} tab will display real data once the corresponding API source is wired for this client.
                    Layout and controls are preserved.
                  </p>
                </div>
              )}
            </section>
          </SectionWrapper>
        )}
      </section>

      {/*  SECTION 14 — Client Action Center  */}
      <section aria-label="Client Action Center">
        <SectionWrapper title="Client Action Center"description={`Quick actions for ${selectedClientRaw?.clientName ?? "selected client"}`}>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Add Note",            style: "secondary"},
              { label: "Create Task",         style: "secondary"},
              { label: "Schedule Check-in",   style: "secondary"},
              { label: "View Reports",        style: "secondary"},
              { label: "Start Renewal",       style: "secondary"},
              { label: "Escalate Risk",       style: "error"},
              { label: "Update Services",     style: "secondary"},
              { label: "Open Onboarding",     style: "secondary"},
              { label: "Generate AI Summary", style: "primary"},
            ].map(({ label, style }) => (
              <button
                key={label}
                className={style === "primary"? "rtm-btn-primary text-xs": style === "error"? "text-xs px-4 py-2 rounded-lg font-medium border transition-colors": "rtm-btn-secondary text-xs"}
                style={style === "error"? { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA"} : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </SectionWrapper>
      </section>
    </div>
  );
}
