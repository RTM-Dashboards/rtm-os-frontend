"use client";

// RTM OS — Lead Stages Configuration Page
//
// Canonical stage list: lib/sales/lead-stages.ts (compile-time defaults)
// Live persistence:     lead_stages table via GET/POST /api/lead-stages
// Rename with migration: POST /api/lead-stages/rename
//
// Supported operations:
//   • Rename stage — validates, migrates DB records, retags GHL contacts.
//     GHL retag failures are shown per contact so they can be fixed by hand.
//
// NOTE: Add and delete are explicitly out of scope for this run.
// Those operations have different migration questions and have not been scoped.

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_LEAD_STAGES,
  type LeadStageDefinition,
} from "@/lib/sales/lead-stages";

// ─── API helpers ───────────────────────────────────────────────────────────────

async function fetchStages(): Promise<LeadStageDefinition[]> {
  const res = await fetch("/api/lead-stages");
  if (!res.ok) throw new Error("Failed to load lead stages");
  const data = (await res.json()) as { stages: LeadStageDefinition[] };
  return data.stages.length > 0 ? data.stages : DEFAULT_LEAD_STAGES;
}

interface RenameResult {
  ok: true;
  leadsUpdated: number;
  leadStatusesUpdated: number;
  retag: {
    retagged: number;
    failures: Array<{ leadId: string; ghlContactId: string; error: string }>;
  };
}

async function renameStage(oldName: string, newName: string): Promise<RenameResult> {
  const res = await fetch("/api/lead-stages/rename", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldName, newName }),
  });
  const data = (await res.json()) as RenameResult | { ok: false; error: string };
  if (!res.ok || !data.ok) {
    throw new Error(
      (data as { error?: string }).error ?? `Rename failed (HTTP ${res.status})`
    );
  }
  return data as RenameResult;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let _toastId = 0;

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const bg =
          t.type === "success" ? "#F0FDF4" : t.type === "error" ? "#FEF2F2" : "#EFF6FF";
        const color =
          t.type === "success" ? "#15803D" : t.type === "error" ? "#DC2626" : "#1D4ED8";
        const border =
          t.type === "success" ? "#A7F3D0" : t.type === "error" ? "#FECACA" : "#BFDBFE";
        return (
          <div
            key={t.id}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg"
            style={{ background: bg, borderColor: border, minWidth: 280, maxWidth: 480 }}
          >
            <p className="text-sm font-semibold" style={{ color }}>
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              className="font-bold text-lg leading-none"
              style={{ color }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Retag failures panel ──────────────────────────────────────────────────────

function RetagFailuresPanel({
  failures,
  onDismiss,
}: {
  failures: Array<{ leadId: string; ghlContactId: string; error: string }>;
  onDismiss: () => void;
}) {
  if (failures.length === 0) return null;
  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold" style={{ color: "#DC2626" }}>
            {failures.length} GHL contact{failures.length === 1 ? "" : "s"} failed to retag
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#B91C1C" }}>
            The stage rename was saved. These contacts still carry the old tag and must be
            fixed in GHL manually.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="font-bold text-lg leading-none flex-shrink-0"
          style={{ color: "#DC2626" }}
        >
          ×
        </button>
      </div>
      <div className="space-y-2">
        {failures.map((f, i) => (
          <div
            key={i}
            className="rounded-lg border px-3 py-2 text-xs font-mono"
            style={{ background: "#FFF1F2", borderColor: "#FECDD3" }}
          >
            <span className="font-bold" style={{ color: "#DC2626" }}>Lead:</span>{" "}
            <span style={{ color: "#7F1D1D" }}>{f.leadId}</span>
            {"  "}
            <span className="font-bold" style={{ color: "#DC2626" }}>GHL Contact:</span>{" "}
            <span style={{ color: "#7F1D1D" }}>{f.ghlContactId}</span>
            {"  "}
            <span className="font-bold" style={{ color: "#DC2626" }}>Error:</span>{" "}
            <span style={{ color: "#991B1B" }}>{f.error}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stage row ────────────────────────────────────────────────────────────────

function StageRow({
  stage,
  onRename,
  saving,
}: {
  stage: LeadStageDefinition;
  onRename: (newName: string) => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stage.name);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft(stage.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function cancelEdit() {
    setDraft(stage.name);
    setEditing(false);
  }

  function commitEdit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === stage.name) {
      cancelEdit();
      return;
    }
    onRename(trimmed);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") cancelEdit();
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{ background: "var(--rtm-bg, #fff)", borderColor: "var(--rtm-border, #E2E8F0)" }}
    >
      {/* Colour swatch */}
      <span
        className="inline-flex w-3 h-3 rounded-full flex-shrink-0"
        style={{ background: stage.color || "#94A3B8" }}
      />

      {/* Name — inline edit */}
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitEdit}
          className="flex-1 text-sm font-semibold border rounded-lg px-2 py-0.5 outline-none"
          style={{ borderColor: "#6366F1", background: "#EEF2FF" }}
          disabled={saving}
        />
      ) : (
        <span className="flex-1 text-sm font-semibold" style={{ color: "var(--rtm-text, #0F172A)" }}>
          {stage.name}
        </span>
      )}

      {/* Actions */}
      {editing ? (
        <div className="flex items-center gap-2">
          <button
            onClick={commitEdit}
            disabled={saving}
            className="text-xs px-3 py-1 rounded-lg font-semibold text-white disabled:opacity-40"
            style={{ background: "#6366F1" }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={cancelEdit}
            className="text-xs px-3 py-1 rounded-lg font-semibold border"
            style={{ borderColor: "#CBD5E1", color: "#475569" }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={startEdit}
          disabled={saving}
          className="text-xs px-3 py-1 rounded-lg font-semibold border disabled:opacity-40"
          style={{ borderColor: "#CBD5E1", color: "#475569" }}
        >
          Rename
        </button>
      )}
    </div>
  );
}

// ─── Main page component ───────────────────────────────────────────────────────

export default function LeadStagesConfigPage() {
  const [stages, setStages] = useState<LeadStageDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [retagFailures, setRetagFailures] = useState<
    Array<{ leadId: string; ghlContactId: string; error: string }>
  >([]);

  useEffect(() => {
    fetchStages()
      .then((loaded) => setStages(loaded))
      .catch(() => setStages(DEFAULT_LEAD_STAGES))
      .finally(() => setLoading(false));
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    _toastId += 1;
    const id = _toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  async function handleRename(stage: LeadStageDefinition, newName: string) {
    setSaving(true);
    setRetagFailures([]);
    try {
      const result = await renameStage(stage.name, newName);

      // Update local stage list with the new name
      setStages((prev) =>
        prev.map((s) => (s.id === stage.id ? { ...s, name: newName } : s))
      );

      const { leadsUpdated, leadStatusesUpdated, retag } = result;

      // Build the summary toast
      const dbSummary = `${leadsUpdated} lead${leadsUpdated === 1 ? "" : "s"} + ${leadStatusesUpdated} status row${leadStatusesUpdated === 1 ? "" : "s"} updated`;

      if (retag.failures.length > 0) {
        // Some retags failed — show warning toast and the failures panel
        addToast(
          `"${stage.name}" → "${newName}" saved. ${dbSummary}. ${retag.retagged} GHL contact${retag.retagged === 1 ? "" : "s"} retagged. ${retag.failures.length} contact${retag.failures.length === 1 ? "" : "s"} failed — see details below.`,
          "error"
        );
        setRetagFailures(retag.failures);
      } else if (retag.retagged > 0) {
        addToast(
          `"${stage.name}" → "${newName}" saved. ${dbSummary}. ${retag.retagged} GHL contact${retag.retagged === 1 ? "" : "s"} retagged.`,
          "success"
        );
      } else {
        addToast(
          `"${stage.name}" → "${newName}" saved. ${dbSummary}. No GHL contacts to retag.`,
          "success"
        );
      }
    } catch (err) {
      addToast(`Rename failed: ${String(err)}`, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismissToast} />

      <div className="space-y-6">
        {/* ── Page header ── */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "#6366F1" }}
          >
            Settings
          </p>
          <h1
            className="text-2xl font-medium tracking-tight"
            style={{ color: "var(--rtm-text, #0F172A)" }}
          >
            Lead Stages
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--rtm-text-secondary, #64748B)" }}
          >
            Rename lead stages. A rename migrates all existing lead records and retags
            affected GHL contacts automatically.
          </p>
        </div>

        {/* ── Retag failures panel (persists until dismissed) ── */}
        {retagFailures.length > 0 && (
          <RetagFailuresPanel
            failures={retagFailures}
            onDismiss={() => setRetagFailures([])}
          />
        )}

        {/* ── Stage list ── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--rtm-border, #E2E8F0)" }}
        >
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: "var(--rtm-border, #E2E8F0)", background: "var(--rtm-surface, #F8FAFC)" }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "var(--rtm-text, #0F172A)" }}>
              Lead Stages ({stages.length})
            </h2>
            {saving && (
              <span className="text-xs" style={{ color: "#6366F1" }}>
                Saving…
              </span>
            )}
          </div>

          <div className="p-4 space-y-2">
            {loading ? (
              <p className="text-sm text-center py-6" style={{ color: "#94A3B8" }}>
                Loading stages…
              </p>
            ) : stages.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "#94A3B8" }}>
                No stages found.
              </p>
            ) : (
              stages.map((stage) => (
                <StageRow
                  key={stage.id}
                  stage={stage}
                  saving={saving}
                  onRename={(newName) => handleRename(stage, newName)}
                />
              ))
            )}
          </div>

          {/* ── Out-of-scope notice ── */}
          <div
            className="px-4 py-3 border-t text-xs"
            style={{ borderColor: "var(--rtm-border, #E2E8F0)", background: "var(--rtm-surface, #F8FAFC)", color: "#94A3B8" }}
          >
            Adding and deleting stages are not supported in this release. Contact Fe to scope those changes.
          </div>
        </div>

        {/* ── GHL warning ── */}
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
        >
          <strong>GHL note:</strong> This editor retags GHL contacts automatically.
          Contacts that fail to retag are listed above with their GHL contact ID and
          error. Fix them manually in GHL using the tag{" "}
          <code className="font-mono text-xs bg-yellow-100 px-1 rounded">rtm-stage-*</code>.
        </div>
      </div>
    </>
  );
}
