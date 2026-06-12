"use client";

import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Activation Rules
// Route: /tasks/activation-rules
// Task Operations workspace
// ─────────────────────────────────────────────────────────────────────────────

export default function ActivationRulesPage() {
  const rules = [
    {
      trigger: "Invoice Paid",
      icon: "💳",
      color: "#C2410C",
      bg: "#FFF7ED",
      border: "#FED7AA",
      templateCount: 8,
      description: "Activates setup and onboarding templates when an invoice is collected.",
    },
    {
      trigger: "Contract Signed",
      icon: "📄",
      color: "#059669",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      templateCount: 2,
      description: "Triggers website build and creative production workflows on contract execution.",
    },
    {
      trigger: "Client Activated",
      icon: "🚀",
      color: "#7C3AED",
      bg: "#FAF5FF",
      border: "#DDD6FE",
      templateCount: 6,
      description: "Fires recurring monthly management templates once a client is active.",
    },
    {
      trigger: "Upsell Approved",
      icon: "📈",
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FDE68A",
      templateCount: 2,
      description: "Activates upsell and budget reallocation workflows on approval.",
    },
    {
      trigger: "Renewal Signed",
      icon: "🔄",
      color: "#16A34A",
      bg: "#F0FDF4",
      border: "#BBF7D0",
      templateCount: 1,
      description: "Triggers renewal process tasks upon signed renewal agreement.",
    },
    {
      trigger: "Cancellation Requested",
      icon: "⚠️",
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FECACA",
      templateCount: 1,
      description: "Initiates cancellation acknowledgement and retention workflow.",
    },
    {
      trigger: "Offboarding Approved",
      icon: "📦",
      color: "#BE123C",
      bg: "#FFF1F2",
      border: "#FECDD3",
      templateCount: 1,
      description: "Starts the full offboarding process including access removal and final reporting.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>
              Task Operations
            </p>
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>›</span>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
              Activation Rules
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Activation Rules Engine
          </h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: "var(--rtm-text-secondary)" }}>
            Define and manage the trigger events that automatically activate task templates across departments when business events occur.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/tasks/templates"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}
          >
            📋 View Templates
          </Link>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            + New Activation Rule
          </button>
        </div>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Rules", value: rules.length, color: "var(--rtm-blue)" },
          { label: "Active Triggers", value: rules.length, color: "#059669" },
          { label: "Templates Mapped", value: rules.reduce((s, r) => s + r.templateCount, 0), color: "#7C3AED" },
          { label: "Pending Config", value: 2, color: "#D97706" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4 text-center"
            style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
          >
            <div className="text-3xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: "var(--rtm-text-secondary)" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Rules grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.trigger}
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--rtm-surface)", border: `1px solid ${rule.border}` }}
          >
            <div className="px-5 py-4" style={{ background: rule.bg }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{rule.icon}</span>
                <span className="font-extrabold text-sm" style={{ color: rule.color }}>
                  {rule.trigger}
                </span>
                <span
                  className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.7)", color: rule.color }}
                >
                  {rule.templateCount} templates
                </span>
              </div>
              <p className="text-xs" style={{ color: rule.color }}>{rule.description}</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="rounded-lg p-3" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#1D4ED8" }}>Example Rule</div>
                <div className="font-mono text-[11px] leading-relaxed" style={{ color: "#1E40AF" }}>
                  WHEN {rule.trigger}<br />
                  THEN activate {rule.templateCount} template{rule.templateCount !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                  style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
                >
                  Edit Rule
                </button>
                <Link
                  href="/tasks/templates"
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-center"
                  style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
                >
                  View Templates
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <div className="font-bold text-sm mb-1" style={{ color: "#D97706" }}>Activation Engine — Coming Soon</div>
            <p className="text-xs" style={{ color: "#92400E" }}>
              Full rule builder, conditional logic, and multi-step activation chains will be available in the next release.
              Templates and triggers are already configured and operational.
            </p>
            <div className="flex gap-2 mt-3">
              <Link
                href="/tasks/templates"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: "#D97706", color: "#fff" }}
              >
                📋 Manage Templates →
              </Link>
              <Link
                href="/billing/activation"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                style={{ borderColor: "#FDE68A", color: "#D97706" }}
              >
                💳 Billing Activation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
