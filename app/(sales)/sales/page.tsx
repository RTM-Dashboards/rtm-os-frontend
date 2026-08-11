"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// ─── Static navigation data ───────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: "Pipeline",     desc: "Track open opportunities and deal stages.",       href: "/sales/pipeline"    },
  { label: "Follow Ups",   desc: "Manage overdue and upcoming follow-up tasks.",    href: "/sales/followups"   },
  { label: "Proposals",    desc: "View, edit, and send client proposals.",          href: "/sales/proposals"   },
  { label: "Performance",  desc: "KPIs, rep metrics, and revenue forecasting.",     href: "/sales/performance" },
];

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function PreviewBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
    >
      Preview — Target State
    </span>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OpportunityRecord {
  id: string;
  stage: string;
  estimatedMonthlyValue: number;
  leadId: string | null;
}

interface LeadRecord {
  id: string;
  stage: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalesDashboard() {
  // ── Real data state ──────────────────────────────────────────────────────────
  const [opps, setOpps] = useState<OpportunityRecord[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setDataLoading(true);
      setDataError(false);
      try {
        const [oppRes, leadRes] = await Promise.all([
          fetch("/api/sales-opportunities"),
          fetch("/api/leads"),
        ]);

        const oppData = oppRes.ok
          ? (await oppRes.json() as { records: OpportunityRecord[] })
          : { records: [] };

        const leadData = leadRes.ok
          ? (await leadRes.json() as { records: LeadRecord[] })
          : { records: [] };

        if (cancelled) return;

        setOpps(Array.isArray(oppData.records) ? oppData.records : []);
        setLeads(Array.isArray(leadData.records) ? leadData.records : []);
      } catch (err) {
        console.error("[SalesDashboard] Failed to load data:", err);
        if (!cancelled) setDataError(true);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    void loadData();
    return () => { cancelled = true; };
  }, []);

  // ── Derived real values ──────────────────────────────────────────────────────
  const CLOSED_STAGES = new Set(["Closed Won", "Closed Lost"]);

  const openOpps = opps.filter((o) => !CLOSED_STAGES.has(o.stage));
  const openOppCount = openOpps.length;
  const pipelineValue = openOpps.reduce((sum, o) => sum + (o.estimatedMonthlyValue ?? 0), 0);

  // Leads ready for intake: stage === "Qualified" with no linked opportunity
  const oppLeadIds = new Set(opps.map((o) => o.leadId).filter(Boolean) as string[]);
  const leadsReadyForIntake = leads.filter(
    (l) => l.stage === "Qualified" && !oppLeadIds.has(l.id)
  ).length;

  const fmtCurrency = (n: number) =>
    n === 0 ? "$0" : "$" + n.toLocaleString("en-US");

  const loadingCell = (
    <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
      —
    </span>
  );

  const errorCell = (
    <span className="text-sm font-semibold" style={{ color: "#DC2626" }}>
      err
    </span>
  );

  const val = (v: React.ReactNode) =>
    dataLoading ? loadingCell : dataError ? errorCell : v;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#059669" }}>
            Sales
          </p>
          <h1 className="text-2xl font-medium tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Sales Dashboard
          </h1>
          <div className="mt-2"><PreviewBadge /></div>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            Your sales workspace — leads, pipeline, and workflow.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          <Link
            href="/sales/leads?action=add-lead"
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
            style={{ background: "#059669", color: "#fff", borderColor: "#059669" }}>
            Add Lead
          </Link>
          {/* "New Audit" previously navigated to /sales/intake which unconditionally
              redirects to the Proposals wizard — the label was wrong. Renamed to
              match the actual destination. */}
          <Link
            href="/sales/proposals?new=true"
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
            style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }}>
            New Proposal
          </Link>
          <Link
            href="/sales/pipeline"
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
            style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }}>
            View Pipeline
          </Link>
        </div>
      </div>

      {/* Section 1 — Pipeline KPIs (real data) */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Pipeline KPIs
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Open Opportunities — computed from DB */}
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <p className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {val(openOppCount)}
            </p>
            <p className="text-xs font-semibold mt-1" style={{ color: "var(--rtm-text-muted)" }}>
              Open Opportunities
            </p>
          </div>

          {/* Pipeline Value — computed from DB */}
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <p className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {val(fmtCurrency(pipelineValue) + "/mo")}
            </p>
            <p className="text-xs font-semibold mt-1" style={{ color: "var(--rtm-text-muted)" }}>
              Pipeline Value
            </p>
          </div>

          {/* Leads Ready for Intake — computed from DB */}
          <div
            className="rounded-xl border p-4"
            style={{ background: leadsReadyForIntake > 0 && !dataLoading && !dataError ? "#FFFBEB" : "var(--rtm-surface)", borderColor: leadsReadyForIntake > 0 && !dataLoading && !dataError ? "#FDE68A" : "var(--rtm-border)" }}>
            <p className="text-2xl font-bold" style={{ color: leadsReadyForIntake > 0 && !dataLoading && !dataError ? "#D97706" : "var(--rtm-text-primary)" }}>
              {val(leadsReadyForIntake)}
            </p>
            <p className="text-xs font-semibold mt-1" style={{ color: leadsReadyForIntake > 0 && !dataLoading && !dataError ? "#D97706" : "var(--rtm-text-muted)" }}>
              Leads Ready for Intake
            </p>
          </div>
        </div>
        {dataError && (
          <p className="text-xs mt-2" style={{ color: "#DC2626" }}>
            Could not load pipeline data. Check your connection.
          </p>
        )}
      </div>

      {/* Section 2 — Priority Actions (not yet computed — no backing data) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
            Priority Actions
          </p>
          <PreviewBadge />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Overdue Follow-Ups",          href: "/sales/followups",   warning: true  },
            { label: "Proposals Awaiting Approval",  href: "/sales/proposals",   warning: true  },
            { label: "Handoffs Pending Submission",  href: "/sales/handoffs",    warning: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-xl border p-4 block transition-all hover:shadow-md"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
              }}>
              <p className="text-2xl font-bold" style={{ color: "var(--rtm-text-muted)" }}>—</p>
              <p className="text-xs font-semibold mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                {item.label}
              </p>
            </Link>
          ))}
          <div
            className="rounded-xl border p-4"
            style={{ background: leadsReadyForIntake > 0 && !dataLoading && !dataError ? "#FFFBEB" : "var(--rtm-surface)", borderColor: leadsReadyForIntake > 0 && !dataLoading && !dataError ? "#FDE68A" : "var(--rtm-border)" }}>
            <p className="text-2xl font-bold" style={{ color: leadsReadyForIntake > 0 && !dataLoading && !dataError ? "#D97706" : "var(--rtm-text-primary)" }}>
              {val(leadsReadyForIntake)}
            </p>
            <p className="text-xs font-semibold mt-1" style={{ color: leadsReadyForIntake > 0 && !dataLoading && !dataError ? "#D97706" : "var(--rtm-text-muted)" }}>
              Leads Ready for Intake
            </p>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--rtm-text-muted)" }}>
          Follow-ups, proposals awaiting approval, and handoffs will populate once those features are backed by live data.
        </p>
      </div>

      {/* Section 3 — Quick Links */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Quick Links
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-xl border p-4 block transition-all hover:shadow-md"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{link.label}</p>
              <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
