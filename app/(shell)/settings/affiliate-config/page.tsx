"use client";

import React from "react";
import { AFFILIATES_WIDGETS } from "@/lib/sales/widget-config";
import { INTAKE_SOURCE_OPTIONS } from "@/lib/sales/intake-config";

// Affiliate source option — pull only "affiliate" source from intake config
const AFFILIATE_SOURCE = INTAKE_SOURCE_OPTIONS.find((s) => s.value === "affiliate");

// Commission tiers sourced from product description (no fabricated pricing config)
const COMMISSION_TIERS = [
  {
    tier: "Standard",
    requirement: "Default",
    model: "Percentage of Month 1 MRR",
    rate: "10%",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  },
  {
    tier: "Silver",
    requirement: "5+ closed referrals",
    model: "Percentage of Month 1 MRR",
    rate: "12.5%",
    badge: { bg: "#F0F9FF", color: "#0284C7", border: "#BAE6FD" },
  },
  {
    tier: "Gold",
    requirement: "15+ closed referrals",
    model: "Percentage of Month 1 MRR",
    rate: "15%",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  },
];

export default function AffiliateConfigPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: "#059669" }}
        >
          Settings
        </p>
        <h1
          className="text-2xl font-medium tracking-tight"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          Affiliate Configuration
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
          Commission tiers, referral tracking settings, and affiliate dashboard widget
          definitions.
        </p>
      </div>

      {/* Coming soon notice */}
      <div
        className="rounded-xl border px-5 py-4"
        style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
      >
        <p className="text-xs font-bold" style={{ color: "#D97706" }}>
          Full editor coming soon
        </p>
        <p className="text-xs mt-1" style={{ color: "#92400E" }}>
          Affiliate partner management, commission payout configuration, and referral code
          assignment will be editable here. Currently showing active configuration summary.
        </p>
      </div>

      {/* Commission Tiers */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Commission Tiers
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {COMMISSION_TIERS.length} tiers configured · read-only
          </p>
        </div>
        <div className="overflow-x-auto">
          <table
            className="w-full text-xs"
            style={{ borderCollapse: "collapse", minWidth: 500 }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--rtm-surface)",
                  borderBottom: "1px solid var(--rtm-border)",
                }}
              >
                {["Tier", "Requirement", "Commission Model", "Rate"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMMISSION_TIERS.map((tier, i) => (
                <tr
                  key={tier.tier}
                  style={{
                    borderBottom: "1px solid var(--rtm-border)",
                    background:
                      i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                  }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full border"
                      style={{
                        background: tier.badge.bg,
                        color: tier.badge.color,
                        borderColor: tier.badge.border,
                      }}
                    >
                      {tier.tier}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: "var(--rtm-text-secondary)" }}
                  >
                    {tier.requirement}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {tier.model}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-bold text-sm"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {tier.rate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Source */}
      {AFFILIATE_SOURCE && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          <div
            className="px-5 py-4 border-b"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Lead Source Attribution
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Affiliate leads are tagged with the following source value in the intake
              system.
            </p>
          </div>
          <div className="p-5" style={{ background: "var(--rtm-bg)" }}>
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg border"
                style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}
              >
                value: {AFFILIATE_SOURCE.value}
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--rtm-text-secondary)" }}
              >
                Label: {AFFILIATE_SOURCE.label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Widgets */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Affiliates Dashboard Widgets
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {AFFILIATES_WIDGETS.length} widgets available on the Affiliates dashboard ·
            read-only
          </p>
        </div>
        <div className="overflow-x-auto">
          <table
            className="w-full text-xs"
            style={{ borderCollapse: "collapse", minWidth: 400 }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--rtm-surface)",
                  borderBottom: "1px solid var(--rtm-border)",
                }}
              >
                {["Widget", "Description", "Visible by Default"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AFFILIATES_WIDGETS.map((w, i) => (
                <tr
                  key={w.id}
                  style={{
                    borderBottom: "1px solid var(--rtm-border)",
                    background:
                      i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                  }}
                >
                  <td
                    className="px-4 py-2.5 font-semibold"
                    style={{ color: "var(--rtm-text-primary)" }}
                  >
                    {w.label}
                  </td>
                  <td
                    className="px-4 py-2.5"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {w.description}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: w.defaultVisible ? "#ECFDF5" : "#F3F4F6",
                        color: w.defaultVisible ? "#059669" : "#6B7280",
                      }}
                    >
                      {w.defaultVisible ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Link to Affiliates Dashboard */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          Manage active affiliate partners and track commissions on the live Affiliates
          dashboard.
        </p>
        <a
          href="/sales/affiliates"
          className="inline-block mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg border"
          style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}
        >
          Open Affiliates Dashboard →
        </a>
      </div>
    </div>
  );
}
