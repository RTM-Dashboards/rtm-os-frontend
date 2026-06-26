"use client";

import { useState } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// RTM OS — Audit Goal Configuration
// Defines prospect primary goals that drive audit sections, recommendations,
// service mappings, and proposal packages. The Sales workspace consumes
// these goals — it does not define them.
// ─────────────────────────────────────────────────────────────────────────────

interface AuditGoal {
  id: string;
  name: string;
  description: string;
  auditSections: string[];
  recommendedServices: string[];
  packageMapping: string;
  scoringWeight: number;
  defaultBudgetMin: number;
  defaultBudgetMax: number;
  recommendationRules: string[];
  isActive: boolean;
}

const AUDIT_GOALS: AuditGoal[] = [
  {
    id: "more-leads",
    name: "Get More Leads & Calls",
    description: "Prospect's primary goal is increasing inbound leads and phone calls through digital channels.",
    auditSections: ["Website Conversion", "GBP Presence", "LSA Eligibility", "Call Tracking", "Landing Pages"],
    recommendedServices: ["Google Business Profile Optimization", "Local SEO", "LSA Management", "Google Ads", "Landing Page CRO"],
    packageMapping: "Lead Generation Bundle",
    scoringWeight: 35,
    defaultBudgetMin: 1500,
    defaultBudgetMax: 5000,
    recommendationRules: ["Rule: GBP Score < 70 → Recommend GBP Optimization", "Rule: No LSA → Recommend LSA Setup", "Rule: CTR < 2% → Recommend Landing Page CRO"],
    isActive: true,
  },
  {
    id: "rank-higher",
    name: "Rank Higher on Google",
    description: "Prospect wants to improve organic search rankings for local and industry keywords.",
    auditSections: ["Keyword Rankings", "Technical SEO", "On-Page SEO", "Backlink Profile", "Local Citations"],
    recommendedServices: ["Local SEO", "Technical SEO Audit", "Content Strategy", "Link Building"],
    packageMapping: "SEO Domination Package",
    scoringWeight: 30,
    defaultBudgetMin: 1000,
    defaultBudgetMax: 4000,
    recommendationRules: ["Rule: Domain Authority < 20 → Recommend Link Building", "Rule: No GMB Posts → Recommend GBP Content", "Rule: Page Speed < 70 → Recommend Technical SEO"],
    isActive: true,
  },
  {
    id: "website-conversion",
    name: "Improve Website Conversion",
    description: "Prospect wants to convert more website visitors into leads or sales.",
    auditSections: ["Conversion Rate Analysis", "Landing Page Quality", "Call-to-Action Audit", "Form Performance", "Page Speed"],
    recommendedServices: ["Website CRO", "Landing Page Design", "A/B Testing", "UX Audit"],
    packageMapping: "Conversion Optimization Bundle",
    scoringWeight: 20,
    defaultBudgetMin: 800,
    defaultBudgetMax: 3000,
    recommendationRules: ["Rule: Bounce Rate > 65% → Recommend UX Audit", "Rule: No A/B Tests → Recommend CRO Program", "Rule: Form Abandonment > 40% → Recommend Form Optimization"],
    isActive: true,
  },
  {
    id: "ai-search",
    name: "Show Up in AI Search",
    description: "Prospect wants to appear in AI-powered search results and assistants (ChatGPT, Google AI Overview, Perplexity).",
    auditSections: ["AI Search Visibility", "Structured Data", "Content Authority", "FAQ Coverage", "Entity Optimization"],
    recommendedServices: ["AI Search Optimization", "Structured Data Implementation", "Content Authority Building", "FAQ Content Strategy"],
    packageMapping: "AI Search Visibility Package",
    scoringWeight: 25,
    defaultBudgetMin: 1200,
    defaultBudgetMax: 4500,
    recommendationRules: ["Rule: No Schema Markup → Recommend Structured Data", "Rule: Low Content Authority → Recommend Content Program", "Rule: No FAQ Pages → Recommend FAQ Strategy"],
    isActive: true,
  },
  {
    id: "gbp-improve",
    name: "Improve Google Business Profile",
    description: "Prospect wants to optimize their Google Business Profile to improve local visibility, reviews, and engagement.",
    auditSections: ["GBP Completeness", "Review Score & Volume", "GBP Posts Activity", "Photo Quality", "Q&A Coverage", "Category Optimization"],
    recommendedServices: ["GBP Optimization", "Review Generation", "GBP Content Management", "Local Citation Building"],
    packageMapping: "Local Presence Package",
    scoringWeight: 20,
    defaultBudgetMin: 500,
    defaultBudgetMax: 2000,
    recommendationRules: ["Rule: GBP Completeness < 80% → Recommend Full GBP Optimization", "Rule: Review Score < 4.0 → Recommend Review Generation", "Rule: No Posts in 30 Days → Recommend GBP Content"],
    isActive: true,
  },
  {
    id: "google-ads",
    name: "Run Google Ads / PPC",
    description: "Prospect wants to launch or improve Google Ads campaigns to drive immediate traffic and leads.",
    auditSections: ["Existing Ad Account Audit", "Keyword Opportunity", "Competitor Ads", "Landing Page Readiness", "Conversion Tracking Setup"],
    recommendedServices: ["Google Ads Management", "PPC Campaign Setup", "Landing Page Creation", "Conversion Tracking"],
    packageMapping: "Google Ads Starter Package",
    scoringWeight: 30,
    defaultBudgetMin: 2000,
    defaultBudgetMax: 10000,
    recommendationRules: ["Rule: No Conversion Tracking → Recommend Tracking Setup", "Rule: No Ad Account → Recommend Fresh Account Setup", "Rule: High CPC Industry → Recommend Landing Page Optimization"],
    isActive: true,
  },
  {
    id: "google-guaranteed",
    name: "Get Google Guaranteed / LSA",
    description: "Prospect wants to get Google Guaranteed badge and appear in Local Services Ads.",
    auditSections: ["LSA Eligibility Check", "License Verification", "Insurance Status", "Background Check Status", "GBP Linkage"],
    recommendedServices: ["LSA Setup & Management", "Google Guaranteed Application", "GBP Optimization"],
    packageMapping: "LSA Fast-Track Package",
    scoringWeight: 25,
    defaultBudgetMin: 1500,
    defaultBudgetMax: 5000,
    recommendationRules: ["Rule: Not LSA Eligible → Recommend Eligibility Remediation", "Rule: GBP Not Linked → Recommend GBP Linkage", "Rule: Low Review Count → Recommend Review Generation Before LSA"],
    isActive: true,
  },
  {
    id: "meta-ads",
    name: "Improve Meta Ads Performance",
    description: "Prospect wants to improve Facebook and Instagram advertising ROI.",
    auditSections: ["Meta Account Audit", "Audience Analysis", "Creative Performance", "Pixel & Tracking", "Campaign Structure"],
    recommendedServices: ["Meta Ads Management", "Creative Strategy", "Audience Building", "Pixel Setup"],
    packageMapping: "Meta Ads Performance Package",
    scoringWeight: 25,
    defaultBudgetMin: 1500,
    defaultBudgetMax: 8000,
    recommendationRules: ["Rule: No Meta Pixel → Recommend Pixel Setup", "Rule: ROAS < 2x → Recommend Creative Refresh", "Rule: High CPM → Recommend Audience Optimization"],
    isActive: true,
  },
];

const FIELD_SCHEMA = [
  { key: "goal_name",            label: "Goal Name",                type: "Text" },
  { key: "description",          label: "Description",              type: "Long Text" },
  { key: "audit_sections",       label: "Audit Sections Included",  type: "Multi-Select" },
  { key: "recommended_services", label: "Recommended Services",     type: "Multi-Select" },
  { key: "package_mapping",      label: "Proposal Package Mapping", type: "Select" },
  { key: "scoring_weight",       label: "Scoring Weight",           type: "Number (0–100)" },
  { key: "budget_min",           label: "Default Budget Min",       type: "Currency" },
  { key: "budget_max",           label: "Default Budget Max",       type: "Currency" },
  { key: "recommendation_rules", label: "Recommendation Rules",     type: "Multi-Select" },
  { key: "is_active",            label: "Active",                   type: "Toggle" },
];

export default function AuditGoalConfigPage() {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(AUDIT_GOALS[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState<"goals" | "schema">("goals");

  const selectedGoal = AUDIT_GOALS.find((g) => g.id === selectedGoalId) ?? null;

  return (
    <div className="space-y-6 max-w-screen-xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        <Link href="/settings" className="hover:underline" style={{ color: "var(--rtm-text-muted)" }}>
          Settings
        </Link>
        <span>›</span>
        <Link href="/settings/intake-questions" className="hover:underline" style={{ color: "var(--rtm-text-muted)" }}>
          Sales Configuration
        </Link>
        <span>›</span>
        <span style={{ color: "var(--rtm-text-secondary)" }}>Audit Goal Configuration</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Audit Goal Configuration
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            Define prospect primary goals that drive audit sections, scoring, service recommendations, and proposal packages.
            The Sales workspace consumes these goals — it does not define them.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}
          >
            In Progress
          </span>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            + Add Goal
          </button>
        </div>
      </div>

      {/* Architecture note */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--rtm-blue-xlight)", borderColor: "var(--rtm-blue-light)" }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: "var(--rtm-blue)" }}
        >
          Configuration Architecture
        </p>
        <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
          Audit Goals are selected by prospects during the sales intake process. Each goal activates specific audit sections,
          determines scoring weights, triggers recommendation rules, and maps to proposal packages. No goal logic, question lists,
          or service recommendations should be hardcoded in the Sales workspace.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: "var(--rtm-blue)" }}>Consumed by:</span>
          {["Sales Intake Forms", "Audit Templates", "Recommendation Rules", "Proposal Templates", "Pricing Rules"].map((s) => (
            <span
              key={s}
              className="text-xs font-medium px-2 py-0.5 rounded-md"
              style={{
                background: "var(--rtm-surface)",
                color: "var(--rtm-blue)",
                border: "1px solid var(--rtm-blue-light)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 border-b"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        {(["goals", "schema"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
            style={
              activeTab === tab
                ? {
                    borderColor: "var(--rtm-blue)",
                    color: "var(--rtm-blue)",
                  }
                : {
                    borderColor: "transparent",
                    color: "var(--rtm-text-muted)",
                  }
            }
          >
            {tab === "goals" ? `Goals (${AUDIT_GOALS.length})` : "Field Schema"}
          </button>
        ))}
      </div>

      {/* GOALS TAB */}
      {activeTab === "goals" && (
        <div className="flex gap-5">
          {/* Goal list sidebar */}
          <div
            className="flex-shrink-0 rounded-xl border overflow-hidden"
            style={{
              width: "260px",
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
            }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
            >
              <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
                {AUDIT_GOALS.filter((g) => g.isActive).length} Active Goals
              </p>
            </div>
            <ul className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {AUDIT_GOALS.map((goal) => (
                <li key={goal.id}>
                  <button
                    onClick={() => setSelectedGoalId(goal.id)}
                    className="w-full text-left px-4 py-3 transition-colors"
                    style={
                      selectedGoalId === goal.id
                        ? { background: "var(--rtm-blue-xlight)" }
                        : {}
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="text-xs font-semibold leading-tight"
                        style={{
                          color: selectedGoalId === goal.id
                            ? "var(--rtm-blue)"
                            : "var(--rtm-text-primary)",
                        }}
                      >
                        {goal.name}
                      </p>
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
                        style={{ background: goal.isActive ? "#10B981" : "#94A3B8" }}
                      />
                    </div>
                    <p
                      className="text-[11px] mt-0.5 leading-tight line-clamp-2"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      Weight: {goal.scoringWeight}% · ${goal.defaultBudgetMin.toLocaleString()}–${goal.defaultBudgetMax.toLocaleString()}/mo
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Goal detail panel */}
          {selectedGoal ? (
            <div className="flex-1 min-w-0 space-y-4">
              {/* Goal header */}
              <div
                className="rounded-xl border p-5"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2
                    className="text-base font-bold"
                    style={{ color: "var(--rtm-text-primary)" }}
                  >
                    {selectedGoal.name}
                  </h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: selectedGoal.isActive ? "#ECFDF5" : "#F8FAFC",
                        color: selectedGoal.isActive ? "#059669" : "#64748B",
                        border: `1px solid ${selectedGoal.isActive ? "#A7F3D0" : "#E2E8F0"}`,
                      }}
                    >
                      {selectedGoal.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      className="text-xs font-medium px-2.5 py-1 rounded-lg border"
                      style={{
                        background: "var(--rtm-bg)",
                        color: "var(--rtm-text-secondary)",
                        borderColor: "var(--rtm-border)",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                  {selectedGoal.description}
                </p>

                {/* Key metrics */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: "Scoring Weight",    value: `${selectedGoal.scoringWeight}%` },
                    { label: "Budget Min",         value: `$${selectedGoal.defaultBudgetMin.toLocaleString()}/mo` },
                    { label: "Budget Max",         value: `$${selectedGoal.defaultBudgetMax.toLocaleString()}/mo` },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-lg p-3"
                      style={{
                        background: "var(--rtm-bg)",
                        border: "1px solid var(--rtm-border)",
                      }}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                        {metric.label}
                      </p>
                      <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Sections */}
              <div
                className="rounded-xl border overflow-hidden"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
              >
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
                >
                  <h3 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    Audit Sections Included
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    These audit sections are activated when this goal is selected.
                  </p>
                </div>
                <div className="p-5 flex flex-wrap gap-2">
                  {selectedGoal.auditSections.map((section) => (
                    <span
                      key={section}
                      className="text-xs font-medium px-3 py-1 rounded-md"
                      style={{
                        background: "var(--rtm-bg)",
                        color: "var(--rtm-text-secondary)",
                        border: "1px solid var(--rtm-border)",
                      }}
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Services */}
              <div
                className="rounded-xl border overflow-hidden"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
              >
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
                >
                  <h3 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    Recommended Services
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    Services surfaced in proposals when this goal is active.
                  </p>
                </div>
                <div className="p-5 flex flex-wrap gap-2">
                  {selectedGoal.recommendedServices.map((service) => (
                    <span
                      key={service}
                      className="text-xs font-medium px-3 py-1 rounded-md"
                      style={{
                        background: "var(--rtm-blue-xlight)",
                        color: "var(--rtm-blue)",
                        border: "1px solid var(--rtm-blue-light)",
                      }}
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Package Mapping & Rules row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Package Mapping */}
                <div
                  className="rounded-xl border p-5"
                  style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
                >
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--rtm-text-primary)" }}>
                    Proposal Package Mapping
                  </h3>
                  <p className="text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
                    Default package proposed when this goal is the primary driver.
                  </p>
                  <span
                    className="text-sm font-semibold px-3 py-1.5 rounded-lg inline-block"
                    style={{
                      background: "var(--rtm-blue-xlight)",
                      color: "var(--rtm-blue)",
                      border: "1px solid var(--rtm-blue-light)",
                    }}
                  >
                    {selectedGoal.packageMapping}
                  </span>
                </div>

                {/* Budget Range */}
                <div
                  className="rounded-xl border p-5"
                  style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
                >
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--rtm-text-primary)" }}>
                    Default Budget Range
                  </h3>
                  <p className="text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
                    Typical monthly budget range for prospects selecting this goal.
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-1 text-center rounded-lg p-2"
                      style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>Min</p>
                      <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                        ${selectedGoal.defaultBudgetMin.toLocaleString()}
                      </p>
                    </div>
                    <span style={{ color: "var(--rtm-text-muted)" }}>—</span>
                    <div
                      className="flex-1 text-center rounded-lg p-2"
                      style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>Max</p>
                      <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                        ${selectedGoal.defaultBudgetMax.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation Rules */}
              <div
                className="rounded-xl border overflow-hidden"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
              >
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
                >
                  <h3 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    Recommendation Rules
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    Conditional logic that fires when this goal is active. Full rule editor in Recommendation Rules.
                  </p>
                </div>
                <div className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
                  {selectedGoal.recommendationRules.map((rule, i) => (
                    <div
                      key={i}
                      className="px-5 py-3 flex items-start gap-3"
                    >
                      <span
                        className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: "var(--rtm-bg)",
                          color: "var(--rtm-text-muted)",
                          border: "1px solid var(--rtm-border)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                        {rule}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3" style={{ borderTop: "1px solid var(--rtm-border-light)" }}>
                  <Link
                    href="/settings/recommendation-rules"
                    className="text-xs font-semibold hover:underline"
                    style={{ color: "var(--rtm-blue)" }}
                  >
                    Manage Recommendation Rules
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex-1 rounded-xl border flex items-center justify-center"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                Select a goal to view its configuration.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SCHEMA TAB */}
      {activeTab === "schema" && (
        <div className="space-y-4 max-w-2xl">
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            Field schema for Audit Goal records. The full editor will allow creating, editing, and reordering goals with these fields.
          </p>
          <section
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
            >
              <h2 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                Audit Goal — Field Schema
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {FIELD_SCHEMA.map((field) => (
                <div
                  key={field.key}
                  className="px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>
                      {field.label}
                    </p>
                    <p
                      className="text-[11px] font-mono mt-0.5"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      key: {field.key}
                    </p>
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      background: "var(--rtm-bg)",
                      color: "var(--rtm-text-secondary)",
                      border: "1px solid var(--rtm-border)",
                    }}
                  >
                    {field.type}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-primary)" }}>
              Related Configuration
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { label: "Recommendation Rules", href: "/settings/recommendation-rules" },
                { label: "Audit Templates",      href: "/settings/audit-templates" },
                { label: "Proposal Templates",   href: "/settings/proposal-templates" },
                { label: "Packages & Bundles",   href: "/settings/packages" },
                { label: "Service Catalog",      href: "/settings/service-catalog" },
              ].map((rel) => (
                <Link
                  key={rel.href}
                  href={rel.href}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg border"
                  style={{
                    background: "var(--rtm-surface)",
                    color: "var(--rtm-text-secondary)",
                    borderColor: "var(--rtm-border)",
                    textDecoration: "none",
                  }}
                >
                  {rel.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
