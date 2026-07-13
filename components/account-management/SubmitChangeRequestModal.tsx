"use client";

// SubmitChangeRequestModal — shared component
//
// Used by:
//   • app/(account-management)/account-management/change-requests/page.tsx
//   • app/(account-management)/account-management/expansion/page.tsx
//     (pre-filled via `prefill` prop for "Convert to Change Request" flow)
//
// POSTs to /api/pending-change-requests (the real file-backed submission
// mechanism).  Never duplicates that mechanism — this is the single source.

import React, { useState } from "react";

// ── Inline types (mirrors API route types; kept here to avoid server-only imports) ──

export type ChangeRequestType =
  | "Budget Reallocation"
  | "Service Upgrade"
  | "Service Downgrade"
  | "Service Addition"
  | "Service Removal"
  | "Pause"
  | "Reactivation"
  | "Contract Amendment"
  | "Custom Scope Change";

export type PendingChangeRequestStatus =
  | "Submitted"
  | "Under Review"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Implemented"
  | "Cancelled";

export interface PendingChangeRequest {
  id: string;
  client: string;
  requestType: ChangeRequestType;
  description: string;
  project: string;
  requestedBy: string;
  revenueImpact: number;
  departmentsImpacted: string[];
  submittedDate: string;
  status: PendingChangeRequestStatus;
  submittedByRole: "AM";
  billingApprovalStatus: "Pending" | "Approved" | "Rejected";
  notes?: string;
}

// Fields that callers may pre-fill (all optional).
export interface SubmitChangeRequestPrefill {
  client?: string;
  requestType?: ChangeRequestType;
  description?: string;
  project?: string;
  revenueImpact?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CR_TYPES: ChangeRequestType[] = [
  "Budget Reallocation",
  "Service Upgrade",
  "Service Downgrade",
  "Service Addition",
  "Service Removal",
  "Pause",
  "Reactivation",
  "Contract Amendment",
  "Custom Scope Change",
];

const DEPT_OPTIONS = [
  "Account Management",
  "SEO",
  "Paid Advertising",
  "Content",
  "Web Development",
  "Reporting",
  "Billing",
];

const inputCls =
  "w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200";
const inputSty: React.CSSProperties = {
  background: "var(--rtm-bg, #F9FAFB)",
  borderColor: "#E2E8F0",
  color: "#0F172A",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onSubmitted: (record: PendingChangeRequest) => void;
  /** Optional pre-fill values (e.g. from "Convert to Change Request"). */
  prefill?: SubmitChangeRequestPrefill;
}

export default function SubmitChangeRequestModal({
  onClose,
  onSubmitted,
  prefill,
}: Props) {
  const [client, setClient] = useState(prefill?.client ?? "");
  const [requestType, setRequestType] = useState<ChangeRequestType>(
    prefill?.requestType ?? "Custom Scope Change"
  );
  const [project, setProject] = useState(prefill?.project ?? "");
  const [description, setDescription] = useState(prefill?.description ?? "");
  const [requestedBy, setRequestedBy] = useState("Account Management");
  const [revenueImpact, setRevenueImpact] = useState(
    prefill?.revenueImpact !== undefined ? String(prefill.revenueImpact) : "0"
  );
  const [depts, setDepts] = useState<string[]>(["Account Management"]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggleDept(dept: string) {
    setDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  }

  async function handleSubmit() {
    if (!client.trim()) {
      setError("Client name is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!requestedBy.trim()) {
      setError("Requested by is required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/pending-change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: client.trim(),
          requestType,
          description: description.trim(),
          project: project.trim() || "General",
          requestedBy: requestedBy.trim(),
          revenueImpact: parseFloat(revenueImpact) || 0,
          departmentsImpacted:
            depts.length > 0 ? depts : ["Account Management"],
          notes: notes.trim(),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Submission failed.");
        return;
      }
      const data = (await res.json()) as { record: PendingChangeRequest };
      onSubmitted(data.record);
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-y-auto"
        style={{
          background: "var(--rtm-surface, #fff)",
          borderColor: "#E2E8F0",
          maxHeight: "92vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "#E2E8F0" }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-0.5">
              Account Management
            </p>
            <h2 className="text-base font-bold" style={{ color: "#0F172A" }}>
              Submit Change Request
            </h2>
            {prefill && (
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-filled from Expansion Opportunity — review and confirm.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
            style={{ color: "#64748B", borderColor: "#E2E8F0" }}
          >
            Close
          </button>
        </div>

        {/* Ownership notice */}
        <div
          className="mx-6 mt-5 rounded-lg border px-4 py-3 text-xs"
          style={{
            background: "#EFF6FF",
            borderColor: "#BFDBFE",
            color: "#1E3A8A",
          }}
        >
          <strong>AM submits. Billing reviews.</strong> This request will be
          handed off to Billing for review and approval. AM cannot approve or
          implement a change request — that step belongs to Billing.
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Client */}
          <div className="space-y-1">
            <label
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#64748B" }}
            >
              Client *
            </label>
            <input
              type="text"
              className={inputCls}
              style={inputSty}
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Client name"
            />
          </div>

          {/* Request Type */}
          <div className="space-y-1">
            <label
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#64748B" }}
            >
              Request Type
            </label>
            <select
              className={inputCls}
              style={inputSty}
              value={requestType}
              onChange={(e) =>
                setRequestType(e.target.value as ChangeRequestType)
              }
            >
              {CR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div className="space-y-1">
            <label
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#64748B" }}
            >
              Project / Service Context
            </label>
            <input
              type="text"
              className={inputCls}
              style={inputSty}
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g. SEO / GBP Management"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#64748B" }}
            >
              Description of Change *
            </label>
            <textarea
              rows={3}
              className={`${inputCls} resize-none`}
              style={inputSty}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the requested change in detail…"
            />
          </div>

          {/* Requested By */}
          <div className="space-y-1">
            <label
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#64748B" }}
            >
              Requested By (AM Name) *
            </label>
            <input
              type="text"
              className={inputCls}
              style={inputSty}
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Revenue Impact */}
          <div className="space-y-1">
            <label
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#64748B" }}
            >
              Estimated Revenue Impact ($/mo)
            </label>
            <input
              type="number"
              className={inputCls}
              style={inputSty}
              value={revenueImpact}
              onChange={(e) => setRevenueImpact(e.target.value)}
              placeholder="0"
            />
            <p className="text-[10px] text-slate-400">
              Use negative for reductions (e.g. -500). Zero if unknown or
              neutral.
            </p>
          </div>

          {/* Departments Impacted */}
          <div className="space-y-1.5">
            <label
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#64748B" }}
            >
              Departments Impacted
            </label>
            <div className="flex flex-wrap gap-2">
              {DEPT_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDept(d)}
                  className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
                  style={{
                    background: depts.includes(d) ? "#1D4ED8" : "#F8FAFC",
                    color: depts.includes(d) ? "#fff" : "#64748B",
                    borderColor: depts.includes(d) ? "#1D4ED8" : "#E2E8F0",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#64748B" }}
            >
              Notes (optional)
            </label>
            <textarea
              rows={2}
              className={`${inputCls} resize-none`}
              style={inputSty}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context for Billing…"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            style={{ background: "#1D4ED8" }}
          >
            {submitting ? "Submitting…" : "Submit Change Request →"}
          </button>
        </div>
      </div>
    </div>
  );
}
