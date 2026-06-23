"use client";

import React, { useState } from "react";
import { ACTIVATION_RECORDS } from "@/lib/activation-data";
import type { ActivationRecord } from "@/types/activation";
import ActivationStatusBadge from "./ActivationStatusBadge";

function formatCurrency(n: number) {
  return "$"+ n.toLocaleString("en-US");
}

// ── Status style maps ─────────────────────────────────────────────────────────

const CONTRACT_STYLES = {
  Pending: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A"},
  Signed:  { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0"},
  Expired: { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA"},
} as const;

const INVOICE_STYLES = {
  "Not Sent": { bg: "#F8FAFC", color: "#475569", border: "#E2E8F0"},
  Sent:       { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE"},
  Overdue:    { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA"},
  Paid:       { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0"},
} as const;

const PAYMENT_STYLES = {
  Awaiting:  { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A"},
  Partial:   { bg: "#FFF7ED", color: "#9A3412", border: "#FED7AA"},
  Confirmed: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0"},
  Failed:    { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA"},
} as const;

function InlineTag({ label, style }: { label: string; style: { bg: string; color: string; border: string } }) {
  return (
    <span
      className="inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full border"style={{ background: style.bg, color: style.color, borderColor: style.border }}
    >
      {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
      <p className="text-[11px] font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>
        {label}
      </p>
      <div className="text-sm"style={{ color: "var(--rtm-text-primary)"}}>
        {value}
      </div>
    </div>
  );
}

function SalesHandoffCard({ record }: { record: ActivationRecord }) {
  const s = record.salesHandoff;
  return (
    <div
      className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)"}}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest mb-3"style={{ color: "var(--rtm-blue)"}}>
        Sales Handoff Summary
      </p>
      <InfoRow label="Sales Owner"value={s.salesOwner} />
      <InfoRow
        label="Services Sold"value={
          <div className="flex flex-wrap gap-1 mt-0.5">
            {s.servicesSold.map((sv) => (
              <span
                key={sv}
                className="text-[11px] font-semibold px-2 py-0.5 rounded border"style={{ background: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", borderColor: "var(--rtm-blue-light)"}}
              >
                {sv}
              </span>
            ))}
          </div>
        }
      />
      <InfoRow
        label="Line Items Sold"value={
          <ul className="mt-0.5 space-y-0.5">
            {s.lineItems.map((li) => (
              <li key={li} className="text-xs flex items-center gap-1.5"style={{ color: "var(--rtm-text-secondary)"}}>
                <span className="w-1 h-1 rounded-full flex-shrink-0"style={{ background: "var(--rtm-blue)"}} />
                {li}
              </li>
            ))}
          </ul>
        }
      />
      <InfoRow label="Budget"value={<span className="font-bold"style={{ color: "var(--rtm-blue)"}}>{formatCurrency(s.budget)}</span>} />
      <InfoRow label="Client Goals"value={s.clientGoals} />
      <InfoRow label="Client Concerns"value={s.clientConcerns} />
      <InfoRow label="Special Requirements"value={s.specialRequirements} />
      <InfoRow label="Proposal Notes"value={s.proposalNotes} />
      <InfoRow label="Communication Summary"value={s.communicationSummary} />
    </div>
  );
}

function BillingHandoffCard({ record }: { record: ActivationRecord }) {
  const b = record.billingHandoff;
  return (
    <div
      className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)"}}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest mb-3"style={{ color: "#7C3AED"}}>
        Billing Handoff Summary
      </p>
      <InfoRow label="Billing Owner"value={b.billingOwner} />
      <InfoRow
        label="Contract Status"value={<InlineTag label={b.contractStatus} style={CONTRACT_STYLES[b.contractStatus]} />}
      />
      <InfoRow
        label="Invoice Status"value={<InlineTag label={b.invoiceStatus} style={INVOICE_STYLES[b.invoiceStatus]} />}
      />
      <InfoRow
        label="Payment Status"value={<InlineTag label={b.paymentStatus} style={PAYMENT_STYLES[b.paymentStatus]} />}
      />
      <InfoRow label="Billing Notes"value={b.billingNotes} />
      <InfoRow
        label="Recurring Revenue"value={
          b.recurringRevenue > 0 ? (
            <span className="font-bold"style={{ color: "#059669"}}>
              {formatCurrency(b.recurringRevenue)}<span className="text-xs font-normal ml-1"style={{ color: "var(--rtm-text-muted)"}}>/mo</span>
            </span>
          ) : (
            <span style={{ color: "var(--rtm-text-muted)"}}>One-time project</span>
          )
        }
      />
    </div>
  );
}

function AMAssignmentCard({ record }: { record: ActivationRecord }) {
  const am = record.amAssignment;
  return (
    <div
      className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)"}}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest mb-3"style={{ color: "#059669"}}>
        Account Management Assignment
      </p>
      {[
        { label: "Primary Account Manager", value: am.primaryAM },
        { label: "Secondary Account Manager", value: am.secondaryAM ?? "—"},
        { label: "Executive Sponsor", value: am.executiveSponsor ?? "—"},
      ].map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between py-2.5"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
          <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>{label}</p>
          <div className="flex items-center gap-2">
            {value !== "—"&& (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"style={{ background: "var(--rtm-blue)"}}
              >
                {value.charAt(0)}
              </div>
            )}
            <p className="text-sm font-medium"style={{ color: value === "—"? "var(--rtm-text-muted)": "var(--rtm-text-primary)"}}>
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectGenerationCard({ record }: { record: ActivationRecord }) {
  const pg = record.projectGeneration;
  const stats = [
    { label: "Projects Created", value: pg.projectsCreated },
    { label: "Task Blueprints Generated", value: pg.taskBlueprintsGenerated },
    { label: "Milestones Generated", value: pg.milestonesGenerated },
    { label: "Dependencies Generated", value: pg.dependenciesGenerated },
  ];
  return (
    <div
      className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)"}}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest mb-3"style={{ color: "#0891B2"}}>
        Project Generation
      </p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {stats.map((st) => (
          <div
            key={st.label}
            className="rounded-lg p-3 text-center"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}
          >
            <p className="text-xl font-bold"style={{ color: "var(--rtm-blue)"}}>
              {st.value}
            </p>
            <p className="text-[11px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
              {st.label}
            </p>
          </div>
        ))}
      </div>
      {pg.departmentsAssigned.length > 0 ? (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5"style={{ color: "var(--rtm-text-muted)"}}>
            Departments Assigned
          </p>
          <div className="flex flex-wrap gap-1">
            {pg.departmentsAssigned.map((d) => (
              <span
                key={d}
                className="text-[11px] font-semibold px-2 py-0.5 rounded border"style={{ background: "#F5F3FF", color: "#5B21B6", borderColor: "#DDD6FE"}}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
          No departments assigned yet. Complete prior checklist steps first.
        </p>
      )}
    </div>
  );
}

function HandoffOverviewCard({ record }: { record: ActivationRecord }) {
  return (
    <div
      className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)"}}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>
            Handoff Overview
          </p>
          <h3 className="text-lg font-bold"style={{ color: "var(--rtm-text-primary)"}}>
            {record.client}
          </h3>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
            {record.id} &mdash; {record.contractNumber}
          </p>
        </div>
        <ActivationStatusBadge status={record.activationStatus} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <InfoRow label="Sales Owner"value={record.salesHandoff.salesOwner} />
        <InfoRow label="Billing Owner"value={record.billingHandoff.billingOwner} />
        <InfoRow label="Account Manager"value={record.amAssignment.primaryAM} />
        <InfoRow
          label="Department Owners"value={
            <div className="flex flex-wrap gap-1 mt-0.5">
              {record.departmentsInvolved.map((d) => (
                <span key={d} className="text-[11px] font-medium px-1.5 py-0.5 rounded border"style={{ background: "#F5F3FF", color: "#5B21B6", borderColor: "#DDD6FE"}}>
                  {d}
                </span>
              ))}
            </div>
          }
        />
      </div>

      <InfoRow label="Launch Notes"value={record.launchNotes} />
      <InfoRow label="Client Expectations"value={record.clientExpectations} />
      <InfoRow label="Scope Notes"value={record.scopeNotes} />
      <InfoRow
        label="Deliverables"value={
          <ul className="mt-0.5 space-y-0.5">
            {record.deliverables.map((d) => (
              <li key={d} className="text-xs flex items-center gap-1.5"style={{ color: "var(--rtm-text-secondary)"}}>
                <span className="w-1 h-1 rounded-full flex-shrink-0"style={{ background: "#059669"}} />
                {d}
              </li>
            ))}
          </ul>
        }
      />
    </div>
  );
}

export default function HandoffCenter() {
  const [selectedId, setSelectedId] = useState<string>(ACTIVATION_RECORDS[0].id);
  const record = ACTIVATION_RECORDS.find((r) => r.id === selectedId)!;

  return (
    <div className="space-y-4">
      {/* Client selector */}
      <div
        className="rounded-xl border p-4"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)"}}
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-2"style={{ color: "var(--rtm-text-muted)"}}>
          Select Client
        </p>
        <div className="flex flex-wrap gap-2">
          {ACTIVATION_RECORDS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"style={
                selectedId === r.id
                  ? { background: "var(--rtm-blue)", color: "#fff", borderColor: "var(--rtm-blue)"}
                  : { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)"}
              }
            >
              {r.client}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      <HandoffOverviewCard record={record} />

      {/* Detail cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesHandoffCard record={record} />
        <BillingHandoffCard record={record} />
        <AMAssignmentCard record={record} />
        <ProjectGenerationCard record={record} />
      </div>
    </div>
  );
}
