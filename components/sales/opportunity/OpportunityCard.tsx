"use client";

import React, { useState } from "react";
import { OPPORTUNITY_STAGES } from "@/lib/sales/intake-config";
import type { OpportunityRecord } from "@/lib/sales/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface OpportunityCardProps {
  opportunity: OpportunityRecord;
  onStageChange: (id: string, stage: string) => void;
  onStartProposal: (id: string) => void;
}

// ─── Stage Colors ─────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  "New Opportunity":     { color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
  "Discovery Scheduled": { color: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD" },
  "Discovery Complete":  { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  "Audit Requested":     { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  "Audit Complete":      { color: "#059669", bg: "#F0FDF4", border: "#BBF7D0" },
  "Proposal Sent":       { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "Negotiation":         { color: "#EA580C", bg: "#FFF7ED", border: "#FDBA74" },
  "Won":                 { color: "#15803D", bg: "#F0FDF4", border: "#86EFAC" },
  "Lost":                { color: "#94A3B8", bg: "#F1F5F9", border: "#CBD5E1" },
};

const PRIORITY_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  High:   { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  Medium: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  Low:    { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
};

function getStageMeta(stage: string) {
  return STAGE_COLORS[stage] ?? { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" };
}

function getPriorityMeta(priority: string) {
  return PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.Low;
}

function formatCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OpportunityCard({
  opportunity,
  onStageChange,
  onStartProposal,
}: OpportunityCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stageMenuOpen, setStageMenuOpen] = useState(false);

  const stageMeta = getStageMeta(opportunity.stage);
  const priorityMeta = getPriorityMeta(opportunity.priority);

  return (
    <div
      className="rounded-xl border p-4 relative"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      {/* Top row: business name + three-dot menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-bold truncate"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {opportunity.businessName}
          </p>
          <p className="text-xs truncate" style={{ color: "var(--rtm-text-muted)" }}>
            {opportunity.opportunityNumber}
          </p>
        </div>

        {/* Three-dot menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => { setMenuOpen((v) => !v); setStageMenuOpen(false); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", border: "1px solid var(--rtm-border)" }}
          >
            ···
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-lg z-20"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <a
                href={`/sales/proposals?new=true&opportunityId=${opportunity.id}`}
                className="block w-full text-left px-3 py-2 text-xs font-bold rounded-t-lg"
                style={{ color: "#2563EB", background: "#EFF6FF" }}
                onClick={() => setMenuOpen(false)}
              >
                Start Proposal
              </a>
              <div className="relative">
                <button
                  className="block w-full text-left px-3 py-2 text-xs hover:opacity-80"
                  style={{ color: "var(--rtm-text-primary)" }}
                  onClick={() => setStageMenuOpen((v) => !v)}
                >
                  Change Stage
                  <span className="float-right">›</span>
                </button>
                {stageMenuOpen && (
                  <div
                    className="absolute left-full top-0 w-44 rounded-lg border shadow-lg z-30"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
                  >
                    {OPPORTUNITY_STAGES.map((stage) => (
                      <button
                        key={stage}
                        className="block w-full text-left px-3 py-2 text-xs first:rounded-t-lg last:rounded-b-lg hover:opacity-80"
                        style={{
                          color: stage === opportunity.stage ? getStageMeta(stage).color : "var(--rtm-text-primary)",
                          background: stage === opportunity.stage ? getStageMeta(stage).bg : "transparent",
                          fontWeight: stage === opportunity.stage ? 700 : 400,
                        }}
                        onClick={() => {
                          onStageChange(opportunity.id, stage);
                          setStageMenuOpen(false);
                          setMenuOpen(false);
                        }}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="block w-full text-left px-3 py-2 text-xs hover:opacity-80"
                style={{ color: "var(--rtm-text-primary)" }}
                onClick={() => setMenuOpen(false)}
              >
                Edit Opportunity
              </button>
              {opportunity.leadId && (
                <a
                  href="/sales/leads"
                  className="block w-full text-left px-3 py-2 text-xs rounded-b-lg hover:opacity-80"
                  style={{ color: "var(--rtm-text-primary)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  View Lead
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trade type badge */}
      {opportunity.tradeType && (
        <span
          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
          style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }}
        >
          {opportunity.tradeType}
        </span>
      )}

      {/* Stage + priority badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{ background: stageMeta.bg, color: stageMeta.color, borderColor: stageMeta.border }}
        >
          {opportunity.stage}
        </span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{ background: priorityMeta.bg, color: priorityMeta.color, borderColor: priorityMeta.border }}
        >
          {opportunity.priority}
        </span>
      </div>

      {/* Contact info */}
      <div className="space-y-1 mb-3">
        {opportunity.contactName && (
          <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
            <span className="font-semibold">Contact:</span> {opportunity.contactName}
          </p>
        )}
        {opportunity.assignedRep && (
          <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
            <span className="font-semibold">Rep:</span> {opportunity.assignedRep}
          </p>
        )}
      </div>

      {/* Value + close date */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {opportunity.estimatedMonthlyValue > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
              Est. Monthly
            </p>
            <p className="text-sm font-bold" style={{ color: "#2563EB" }}>
              {formatCurrency(opportunity.estimatedMonthlyValue)}/mo
            </p>
          </div>
        )}
        {opportunity.expectedCloseDate && (
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
              Close Date
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
              {opportunity.expectedCloseDate}
            </p>
          </div>
        )}
      </div>

      {/* Service interest chips */}
      {opportunity.serviceInterest.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {opportunity.serviceInterest.map((svc) => (
            <span
              key={svc}
              className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", border: "1px solid var(--rtm-border)" }}
            >
              {svc}
            </span>
          ))}
        </div>
      )}

      {/* GHL sync indicator */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold"
          style={{ color: opportunity.ghlSynced ? "#059669" : "#94A3B8" }}
        >
          GHL: {opportunity.ghlSynced ? "Synced" : "Not Synced"}
        </span>
        <button
          onClick={() => onStartProposal(opportunity.id)}
          className="text-[10px] px-2.5 py-1 rounded-lg font-bold"
          style={{ background: "#2563EB", color: "#fff" }}
        >
          Start Proposal
        </button>
      </div>
    </div>
  );
}
