"use client";

/**
 * Client-Facing Onboarding Form
 *
 * Route: /client-onboarding/[recordId]
 *
 * A simplified, standalone view for a specific onboarding record that the AM
 * can share with their client via a copyable link. This page renders ONLY the
 * fields currently assigned to the client (status "pending-client").
 *
 * Data is loaded from and written to the file-backed API route at
 * /api/onboarding-records, so this client-facing view and the AM view at
 * /account-management/onboarding/[recordId] always see the same live data,
 * even though they live in different Next.js route groups.
 */

import React, { useState, useCallback, useEffect, use } from "react";
import {
  getOnboardingRecordById,
  simulateClientResponse,
} from "@/lib/mock/am-onboarding-store";
import type { AMOnboardingRecord, FieldAssignment } from "@/lib/mock/am-onboarding-store";
import { ONBOARDING_FIELD_SCHEMA } from "@/lib/mock/am-onboarding-field-schema";
import type { AMOnboardingFieldDef } from "@/lib/mock/am-onboarding-field-schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientVisibleFields(record: AMOnboardingRecord): AMOnboardingFieldDef[] {
  return ONBOARDING_FIELD_SCHEMA.filter((f) => {
    if (f.section === "am-internal") return false;
    const assignment = record.fieldAssignments[f.id];
    return assignment?.status === "pending-client";
  });
}

// ─── Field input ───────────────────────────────────────────────────────────────

function ClientFieldInput({
  field,
  value,
  onChange,
}: {
  field: AMOnboardingFieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const baseClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-slate-400 transition-shadow";

  if (field.type === "textarea") {
    return (
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={baseClass}
      />
    );
  }
  if (field.type === "select" && field.options) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={baseClass}>
        <option value="">— Select one —</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-300"
        />
        <span className="text-sm text-slate-700">{field.label}</span>
      </label>
    );
  }
  if (field.type === "date") {
    return <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={baseClass} />;
  }
  if (field.type === "number") {
    return <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={baseClass} />;
  }
  return (
    <input
      type={field.type === "phone" ? "tel" : field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={baseClass}
    />
  );
}

// ─── Single field card ────────────────────────────────────────────────────────

function ClientFieldCard({
  record,
  field,
  onSubmitted,
}: {
  record: AMOnboardingRecord;
  field: AMOnboardingFieldDef;
  onSubmitted: () => void;
}) {
  const assignment: FieldAssignment | undefined = record.fieldAssignments[field.id];
  const isResponded = assignment?.status === "client-responded";

  const [value, setValue] = useState(assignment?.value ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isResponded);

  async function handleSubmit() {
    if (!value.trim() && field.type !== "checkbox") return;
    setSaving(true);
    await simulateClientResponse(record.id, field.id, value);
    setSaving(false);
    setSaved(true);
    onSubmitted();
  }

  if (saved || isResponded) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[11px] font-bold">✓</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-800">{field.label}</p>
            {value ? (
              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{value}</p>
            ) : (
              <p className="text-sm italic text-slate-400 mt-1">Response submitted</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-slate-800">{field.label}</p>
          {field.required && (
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Required</span>
          )}
        </div>
        {field.description && (
          <p className="text-xs text-slate-500">{field.description}</p>
        )}
      </div>

      <ClientFieldInput field={field} value={value} onChange={setValue} />

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => void handleSubmit()}
          disabled={saving || (!value.trim() && field.type !== "checkbox")}
          className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Submitting…" : "Submit"}
        </button>
        {!value.trim() && field.type !== "checkbox" && (
          <span className="text-xs text-slate-400">Enter a value to submit</span>
        )}
      </div>
    </div>
  );
}

// ─── Main client view ─────────────────────────────────────────────────────────

function ClientOnboardingView({ recordId }: { recordId: string }) {
  // Load from file-backed API — cross-route-group reliable
  const [record, setRecord] = useState<AMOnboardingRecord | null | undefined>(undefined);

  const loadRecord = useCallback(async () => {
    const r = await getOnboardingRecordById(recordId);
    setRecord(r ?? null);
  }, [recordId]);

  useEffect(() => {
    void loadRecord();
  }, [loadRecord]);

  // After client submits a field, reload so the count/progress updates
  const refresh = useCallback(() => {
    void loadRecord();
  }, [loadRecord]);

  // Loading
  if (record === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-slate-50 flex items-center justify-center p-6">
        <p className="text-sm text-slate-400">Loading onboarding form…</p>
      </div>
    );
  }

  // Not found
  if (record === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-lg font-bold text-slate-800 mb-2">Form not found</h1>
          <p className="text-sm text-slate-500 mb-1">
            This onboarding form link may be expired or invalid. Please contact your account manager for a fresh link.
          </p>
          <p className="text-[11px] text-slate-300 mt-3 font-mono">{recordId}</p>
        </div>
      </div>
    );
  }

  const clientFields = getClientVisibleFields(record);
  const responded = clientFields.filter(
    (f) => record.fieldAssignments[f.id]?.status === "client-responded"
  ).length;
  const total = clientFields.length;
  const allDone = total > 0 && responded === total;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-white">
      {/* Header bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-0.5">
              Onboarding
            </p>
            <h1 className="text-base font-bold text-slate-900">
              {record.salesPrefill.clientName}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">
              {responded} of {total} field{total !== 1 ? "s" : ""} complete
            </p>
            <div className="mt-1 w-32 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: total > 0 ? `${Math.round((responded / total) * 100)}%` : "0%" }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {allDone ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">All done!</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Thank you! Your account manager will review your responses and be in touch shortly.
            </p>
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 inline-block">
              <p className="text-sm font-semibold text-emerald-800">
                {record.salesPrefill.clientName} — Onboarding responses submitted ✓
              </p>
            </div>
          </div>
        ) : total === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Nothing to fill in right now</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Your account manager hasn&apos;t assigned any fields for you to complete yet. Check back later or reach out to them directly.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-1">
                Please fill in the following information
              </h2>
              <p className="text-sm text-slate-500">
                Your account manager at RTM needs a few details to get started. Fill in each field and hit Submit — you can do them one at a time.
              </p>
            </div>

            <div className="space-y-4">
              {clientFields.map((field) => (
                <ClientFieldCard
                  key={field.id}
                  record={record}
                  field={field}
                  onSubmitted={refresh}
                />
              ))}
            </div>

            <p className="mt-8 text-center text-xs text-slate-300">
              Secure link provided by your account manager · {record.salesPrefill.clientName}
            </p>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Page entry point ──────────────────────────────────────────────────────────

export default function ClientOnboardingPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = use(params);
  return <ClientOnboardingView recordId={recordId} />;
}
