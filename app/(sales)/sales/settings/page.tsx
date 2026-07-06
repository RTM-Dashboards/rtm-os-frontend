"use client";

import React from "react";
import Link from "next/link";
import {
  BUDGET_SERVICE_CATALOG,
  DISCOUNT_TIERS,
} from "@/lib/sales/budget-config";
import {
  PROPOSAL_SECTIONS,
  PROPOSAL_TEMPLATES,
} from "@/lib/sales/proposal-config";
import {
  CONTRACT_CLAUSES,
  CONTRACT_TEMPLATES,
} from "@/lib/sales/contract-config";
import {
  HANDOFF_CHECKLIST,
  HANDOFF_SUMMARY_FIELDS,
} from "@/lib/sales/handoff-config";
import {
  RECOMMENDATION_RULES,
  SERVICE_CATALOG,
} from "@/lib/sales/recommendation-config";
import {
  SCORING_THRESHOLDS,
} from "@/lib/sales/audit-config";
import {
  INTAKE_SOURCE_OPTIONS,
  STEP1_BUSINESS_INFO_FIELDS,
  AUDIT_GOAL_CONFIG,
} from "@/lib/sales/intake-config";
import {
  PERFORMANCE_WIDGETS,
  TASKS_WIDGETS,
  AFFILIATES_WIDGETS,
} from "@/lib/sales/widget-config";

// ─── Role mock (from auth context in production) ─────────────────────────────
// In production this value comes from auth context and varies at runtime.
type UserRole = "Department Head" | "Manager" | "Specialist" | "Coordinator";
const CURRENT_ROLE: UserRole = "Manager" as UserRole;
const CAN_ACCESS = CURRENT_ROLE === "Department Head" || CURRENT_ROLE === "Manager";

// ─── Team Members mock ────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  { name: "Ryan B.",    role: "Department Head",   access: "Full Access", status: "Active"   },
  { name: "Tina G.",    role: "Sr. Sales Executive",access: "Edit",        status: "Active"   },
  { name: "Carlos V.",  role: "Sales Executive",    access: "Edit",        status: "Active"   },
  { name: "Megan S.",   role: "Sales Coordinator",  access: "View",        status: "Active"   },
  { name: "David L.",   role: "Business Dev Rep",   access: "View",        status: "Inactive" },
];

// ─── Pipeline stages — sourced from the canonical list ───────────────────────
// The single source of truth is lib/sales/pipeline-stages.ts.
// Do NOT maintain a separate hardcoded list here.
import { DEFAULT_PIPELINE_STAGE_NAMES as PIPELINE_STAGES } from "@/lib/sales/pipeline-stages";

// ─── Lead sources from intake config ─────────────────────────────────────────
const LEAD_SOURCES = INTAKE_SOURCE_OPTIONS.map(s => s.label);

// ─── KPI definitions mock ─────────────────────────────────────────────────────
const KPI_DEFINITIONS = [
  { name: "Win Rate",             definition: "Closed Won / (Closed Won + Closed Lost)" },
  { name: "Pipeline Value",       definition: "Sum of estimated value for all non-lost opportunities" },
  { name: "Weighted Revenue",     definition: "Pipeline Value × probability for each opportunity" },
  { name: "Average Deal Size",    definition: "Total pipeline value / count of active opportunities" },
  { name: "Sales Cycle Length",   definition: "Average days from Lead Created to Closed Won" },
  { name: "Quota Attainment",     definition: "Closed Won revenue / monthly revenue target" },
];

// ─── Section Component ────────────────────────────────────────────────────────
function Section({
  title,
  description,
  href,
  children,
}: {
  title: string;
  description: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
      <div className="flex items-center justify-between px-5 py-4 border-b"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <div>
          <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{title}</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{description}</p>
        </div>
        {href ? (
          <Link href={href} className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
            Configure
          </Link>
        ) : (
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border opacity-40 cursor-not-allowed"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }} disabled>
            Configure
          </button>
        )}
      </div>
      <div className="p-5" style={{ background: "var(--rtm-bg)" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0"
      style={{ borderColor: "var(--rtm-border)" }}>
      <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{label}</span>
      <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{value}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalesSettingsPage() {
  if (!CAN_ACCESS) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="rounded-xl border p-10 text-center max-w-md"
          style={{ background: "var(--rtm-surface)", borderColor: "#FECACA" }}>
          <h2 className="text-lg font-bold mb-2" style={{ color: "#DC2626" }}>Access Denied</h2>
          <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
            Department Settings is restricted to Department Head and Manager roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#059669" }}>Sales</p>
          <h1 className="text-2xl font-medium tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Department Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            Sales department configuration — manage team, workflow, and operational settings.
          </p>
        </div>
        <button disabled
          className="text-sm font-semibold px-4 py-2 rounded-lg border opacity-40 cursor-not-allowed"
          style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }}>
          Save Changes
        </button>
      </div>

      {/* Section 1 — Team and Access */}
      <Section title="Team and Access" description="Current team members, roles, and access levels." href="/sales/settings/team-access">
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
                {["Name", "Role", "Access", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEAM_MEMBERS.map((m, i) => (
                <tr key={m.name} style={{
                  borderBottom: "1px solid var(--rtm-border)",
                  background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                }}>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{m.name}</td>
                  <td className="px-4 py-2.5" style={{ color: "var(--rtm-text-secondary)" }}>{m.role}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: m.access === "Full Access" ? "#EFF6FF" : m.access === "Edit" ? "#ECFDF5" : "#F3F4F6",
                        color: m.access === "Full Access" ? "#1D4ED8" : m.access === "Edit" ? "#059669" : "#6B7280",
                      }}>
                      {m.access}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] font-semibold" style={{ color: m.status === "Active" ? "#059669" : "#6B7280" }}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Section 2 — Workflow Configuration */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
        <div className="px-5 py-4 border-b" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>Workflow Configuration</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            Read-only summary of current configuration sourced from lib/sales/.
          </p>
        </div>
        <div className="p-5 space-y-6" style={{ background: "var(--rtm-bg)" }}>

          {/* Sales Intake */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Sales Intake</p>
              <Link href="/sales/settings/sales-intake" className="text-xs font-semibold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
                style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
                Configure
              </Link>
            </div>
            <Row label="Intake form fields configured" value={STEP1_BUSINESS_INFO_FIELDS.length} />
            <Row label="Lead sources configured" value={INTAKE_SOURCE_OPTIONS.length} />
            <Row label="Sources" value={INTAKE_SOURCE_OPTIONS.slice(0, 5).map(s => s.label).join(", ") + "..."} />
          </div>

          {/* Audit Configuration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Audit Configuration</p>
              <Link href="/sales/settings/audit-configuration" className="text-xs font-semibold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
                style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
                Configure
              </Link>
            </div>
            <Row label="Scoring threshold rules configured" value={SCORING_THRESHOLDS.length} />
            <Row label="Audit goal categories configured" value={AUDIT_GOAL_CONFIG.length} />
          </div>

          {/* Recommendation Rules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Recommendation Rules</p>
              <Link href="/sales/settings/recommendation-rules" className="text-xs font-semibold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
                style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
                Configure
              </Link>
            </div>
            <Row label="Recommendation rules configured" value={RECOMMENDATION_RULES.length} />
            <Row label="Services in service catalog" value={SERVICE_CATALOG.length} />
          </div>

          {/* Budget Optimizer */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Budget Optimizer</p>
              <Link href="/sales/settings/budget-optimizer" className="text-xs font-semibold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
                style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
                Configure
              </Link>
            </div>
            <Row label="Services in catalog" value={BUDGET_SERVICE_CATALOG.length} />
            <Row label="Discount tiers configured" value={DISCOUNT_TIERS.length} />
          </div>

          {/* Proposal Templates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Proposal Templates</p>
              <Link href="/sales/settings/proposal-templates" className="text-xs font-semibold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
                style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
                Configure
              </Link>
            </div>
            <Row label="Proposal templates configured" value={PROPOSAL_TEMPLATES.length} />
            <Row label="Proposal sections configured" value={PROPOSAL_SECTIONS.length} />
          </div>

          {/* Contract Templates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Contract Templates</p>
              <Link href="/sales/settings/contract-templates" className="text-xs font-semibold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
                style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
                Configure
              </Link>
            </div>
            <Row label="Contract templates configured" value={CONTRACT_TEMPLATES.length} />
            <Row label="Contract clauses configured" value={CONTRACT_CLAUSES.length} />
          </div>

          {/* Handoff Configuration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Handoff Configuration</p>
              <Link href="/sales/settings/handoff-configuration" className="text-xs font-semibold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
                style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
                Configure
              </Link>
            </div>
            <Row label="Handoff checklist items configured" value={HANDOFF_CHECKLIST.length} />
            <Row label="Handoff summary fields configured" value={HANDOFF_SUMMARY_FIELDS.length} />
          </div>
        </div>
      </div>

      {/* Section 3 — Pipeline Configuration */}
      <Section title="Pipeline Configuration" description="Current pipeline stages and lead source list." href="/sales/settings/pipeline-configuration">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-muted)" }}>Pipeline Stages ({PIPELINE_STAGES.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {PIPELINE_STAGES.map((stage, i) => (
                <span key={stage} className="text-[10px] font-semibold px-2 py-1 rounded-lg border"
                  style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
                  {i + 1}. {stage}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-muted)" }}>Lead Sources ({LEAD_SOURCES.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {LEAD_SOURCES.map(source => (
                <span key={source} className="text-[10px] font-semibold px-2 py-1 rounded-lg border"
                  style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}>
                  {source}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Section 4 — Notification Preferences */}
      <Section title="Notification Preferences" description="Current notification toggle settings." href="/sales/settings/notification-preferences">
        <div className="space-y-2">
          {[
            { label: "New lead submitted",         enabled: true  },
            { label: "Follow-up due",              enabled: true  },
            { label: "Proposal viewed by client",  enabled: true  },
            { label: "Deal closed won",            enabled: true  },
            { label: "Deal closed lost",           enabled: false },
          ].map(({ label, enabled }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b last:border-b-0"
              style={{ borderColor: "var(--rtm-border)" }}>
              <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{label}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: enabled ? "#ECFDF5" : "#F3F4F6",
                  color: enabled ? "#059669" : "#6B7280",
                }}>
                {enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Section 5 — Performance and Reporting */}
      <Section title="Performance and Reporting" description="KPI definitions used on the Performance page." href="/sales/settings/performance-reporting">
        <div className="space-y-2">
          {KPI_DEFINITIONS.map(({ name, definition }) => (
            <div key={name} className="py-2 border-b last:border-b-0" style={{ borderColor: "var(--rtm-border)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{name}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{definition}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Section 6 — Affiliate Configuration */}
      <Section title="Affiliate Configuration" description="Commission rules and affiliate tier summary." href="/sales/settings/affiliate-configuration">
        <Row label="Affiliate tiers" value="3 (Standard, Silver, Gold)" />
        <Row label="Default commission model" value="Percentage of first month MRR" />
        <Row label="Standard commission rate" value="10% of Month 1 MRR" />
        <Row label="Silver commission rate" value="12.5% of Month 1 MRR" />
        <Row label="Gold commission rate" value="15% of Month 1 MRR" />
      </Section>

      {/* Section 7 — Dashboard & Reporting Views */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
        <div className="px-5 py-4 border-b" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>Dashboard &amp; Reporting Views</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            Performance, Tasks, and Affiliates dashboards support per-user widget customization.
            Each team member can choose which KPI cards to display and in what order via the
            Customize View button on each page.
          </p>
        </div>
        <div className="p-5" style={{ background: "var(--rtm-bg)" }}>
          <div className="space-y-3">
            {[
              {
                page: "Performance Dashboard",
                href: "/sales/performance",
                count: PERFORMANCE_WIDGETS.length,
              },
              {
                page: "Tasks Dashboard",
                href: "/sales/tasks",
                count: TASKS_WIDGETS.length,
              },
              {
                page: "Affiliates Dashboard",
                href: "/sales/affiliates",
                count: AFFILIATES_WIDGETS.length,
              },
            ].map(({ page, href, count }) => (
              <div
                key={page}
                className="flex items-center justify-between py-2.5 border-b last:border-b-0"
                style={{ borderColor: "var(--rtm-border)" }}
              >
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{page}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    {count} widget{count !== 1 ? "s" : ""} available
                  </p>
                </div>
                <a
                  href={href}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                  style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}
                >
                  Open Page
                </a>
              </div>
            ))}
          </div>
          <p className="text-[11px] mt-4 pt-3 border-t" style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}>
            Customization is managed per-page, not centrally. Use the Customize View button on
            each dashboard page to show, hide, or reorder KPI cards. Preferences are saved
            per-user in your browser.
          </p>
        </div>
      </div>

      {/* Section 8 — Integrations (Sales-specific) */}
      <Section title="Integrations" description="Sales-specific integration statuses and field mapping summary.">
        <div className="space-y-3">
          <Row label="GoHighLevel CRM" value="Connected — Active Sync" />
          <Row label="Last GHL sync" value="Today, 9:42 AM" />
          <Row label="GHL pipeline mapped" value="RTM OS Sales Pipeline" />
          <Row label="Lead source connections" value="Google Ads, Meta Ads, LSA, Website, Affiliate" />
          <Row label="CRM field mapping" value="13 fields mapped" />
          <div className="pt-2">
            <a href="/settings/integrations"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border inline-block"
              style={{ background: "var(--rtm-surface)", color: "#2563EB", borderColor: "#BFDBFE" }}>
              Open Integrations Settings →
            </a>
          </div>
        </div>
      </Section>

    </div>
  );
}
