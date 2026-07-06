"use client";

// RTM OS — Pipeline Configuration Page
//
// Canonical stage list: lib/sales/pipeline-stages.ts (compile-time defaults)
// Live persistence:     data/pipeline-stages.json  (via GET/POST /api/pipeline-stages)
//
// Supported operations:
//   • Add stage (name + automatic order position at end)
//   • Rename stage (inline edit)
//   • Reorder stages (up / down buttons)
//   • Remove stage (confirmation dialog; blocked if any opportunity uses that stage)
//
// Changes are written to data/pipeline-stages.json through the API route and
// are reflected on the live Pipeline Kanban board after a browser reload —
// no code redeploy required.
//
// NOTE: OPPORTUNITY_STAGES in lib/sales/intake-config.ts has been removed.
// That was a stale 9-stage list that was never connected to the live Kanban.
// This page and the Kanban board both now reference the same canonical source.

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_PIPELINE_STAGES,
  type PipelineStageDefinition,
} from "@/lib/sales/pipeline-stages";

// ─── Mock opportunity data ─────────────────────────────────────────────────────
// In a future real data layer this would come from the database.
// For now it mirrors the mock opportunity records used by the Pipeline Kanban.
// Used solely to determine whether a stage has opportunities blocking removal.
const MOCK_STAGE_USAGE: Record<string, number> = {
  "Lead": 3,
  "Discovery": 2,
  "Qualified": 1,
  "Audit Requested": 4,
  "Audit In Progress": 2,
  "Proposal Draft": 1,
  "Proposal Sent": 3,
  "Negotiation": 2,
  "Verbal Approval": 1,
  "Proposal Approved": 0,
  "Sales Handoff": 1,
  "Closed Won": 5,
  "Closed Lost": 3,
};

function getOpportunityCount(stageName: string): number {
  return MOCK_STAGE_USAGE[stageName] ?? 0;
}

// ─── Colour palette for new stages ─────────────────────────────────────────────
const COLOUR_PALETTE = [
  { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" },
  { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  { color: "#6D28D9", bg: "#EDE9FE", border: "#C4B5FD" },
  { color: "#B45309", bg: "#FEF3C7", border: "#FCD34D" },
];

function nextColour(stages: PipelineStageDefinition[]): { color: string; bg: string; border: string } {
  return COLOUR_PALETTE[stages.length % COLOUR_PALETTE.length];
}

// ─── API helpers ───────────────────────────────────────────────────────────────

async function fetchStages(): Promise<PipelineStageDefinition[]> {
  const res = await fetch("/api/pipeline-stages");
  if (!res.ok) throw new Error("Failed to load stages");
  const data = (await res.json()) as { stages: PipelineStageDefinition[] };
  return data.stages.length > 0 ? data.stages : DEFAULT_PIPELINE_STAGES;
}

async function saveStages(stages: PipelineStageDefinition[]): Promise<void> {
  const res = await fetch("/api/pipeline-stages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stages }),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Save failed");
  }
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
            style={{ background: bg, borderColor: border, minWidth: 280, maxWidth: 400 }}
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

// ─── Confirmation Dialog ───────────────────────────────────────────────────────
function ConfirmDialog({
  stageName,
  opportunityCount,
  onCancel,
  onConfirm,
}: {
  stageName: string;
  opportunityCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isBlocked = opportunityCount > 0;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            background: isBlocked ? "#FEF2F2" : "var(--rtm-surface)",
            borderColor: isBlocked ? "#FECACA" : "var(--rtm-border)",
          }}
        >
          <h2
            className="text-base font-bold"
            style={{ color: isBlocked ? "#DC2626" : "var(--rtm-text-primary)" }}
          >
            {isBlocked ? "Cannot Remove Stage" : "Remove Stage"}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {isBlocked ? (
            <div>
              <p className="text-sm mb-3" style={{ color: "var(--rtm-text-primary)" }}>
                <strong>{stageName}</strong> cannot be removed because{" "}
                <strong>
                  {opportunityCount} opportunit{opportunityCount === 1 ? "y" : "ies"}
                </strong>{" "}
                currently sit{opportunityCount === 1 ? "s" : ""} in this stage.
              </p>
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                Move or close those opportunities first, then retry removing this stage.
              </p>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--rtm-text-primary)" }}>
              Are you sure you want to remove <strong>{stageName}</strong>? This action cannot
              be undone. The stage will be removed from the pipeline immediately.
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4 border-t"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <button
            onClick={onCancel}
            className="text-sm px-4 py-2 rounded-lg font-semibold border"
            style={{
              background: "var(--rtm-bg)",
              color: "var(--rtm-text-secondary)",
              borderColor: "var(--rtm-border)",
            }}
          >
            {isBlocked ? "OK" : "Cancel"}
          </button>
          {!isBlocked && (
            <button
              onClick={onConfirm}
              className="text-sm px-4 py-2 rounded-lg font-bold"
              style={{ background: "#DC2626", color: "#fff" }}
            >
              Remove Stage
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stage Row ─────────────────────────────────────────────────────────────────
function StageRow({
  stage,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRename,
  onRemove,
  saving,
}: {
  stage: PipelineStageDefinition;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRename: (newName: string) => void;
  onRemove: () => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(stage.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  function commitRename() {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setDraftName(stage.name);
      setEditing(false);
      return;
    }
    if (trimmed !== stage.name) onRename(trimmed);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") {
      setDraftName(stage.name);
      setEditing(false);
    }
  }

  const oppCount = getOpportunityCount(stage.name);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
      style={{
        background: "var(--rtm-bg)",
        borderColor: "var(--rtm-border)",
      }}
    >
      {/* Order number */}
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
        style={{ background: stage.bg, color: stage.color, border: `1px solid ${stage.border}` }}
      >
        {index + 1}
      </span>

      {/* Stage name / inline edit */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleKeyDown}
            className="w-full text-sm font-semibold rounded-lg border px-2 py-1 focus:outline-none"
            style={{
              background: "var(--rtm-surface)",
              borderColor: stage.border,
              color: "var(--rtm-text-primary)",
            }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {stage.name}
            </span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ background: stage.bg, color: stage.color, borderColor: stage.border }}
            >
              Stage
            </span>
            {oppCount > 0 && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}
              >
                {oppCount} opp{oppCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Move up */}
        <button
          onClick={onMoveUp}
          disabled={index === 0 || saving}
          title="Move up"
          className="w-7 h-7 flex items-center justify-center rounded-lg border text-sm disabled:opacity-30 hover:opacity-70 transition-opacity"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-muted)",
          }}
        >
          ↑
        </button>
        {/* Move down */}
        <button
          onClick={onMoveDown}
          disabled={index === total - 1 || saving}
          title="Move down"
          className="w-7 h-7 flex items-center justify-center rounded-lg border text-sm disabled:opacity-30 hover:opacity-70 transition-opacity"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-muted)",
          }}
        >
          ↓
        </button>
        {/* Rename */}
        {!editing && (
          <button
            onClick={() => { setDraftName(stage.name); setEditing(true); }}
            disabled={saving}
            className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border disabled:opacity-30 hover:opacity-70 transition-opacity"
            style={{
              background: "#EFF6FF",
              color: "#1D4ED8",
              borderColor: "#BFDBFE",
            }}
          >
            Rename
          </button>
        )}
        {/* Remove */}
        <button
          onClick={onRemove}
          disabled={saving}
          className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border disabled:opacity-30 hover:opacity-70 transition-opacity"
          style={{
            background: "#FEF2F2",
            color: "#DC2626",
            borderColor: "#FECACA",
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

// ─── Main page component ───────────────────────────────────────────────────────

export default function PipelineConfigPage() {
  const [stages, setStages] = useState<PipelineStageDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmStage, setConfirmStage] = useState<PipelineStageDefinition | null>(null);
  const [newStageName, setNewStageName] = useState("");
  const [addError, setAddError] = useState("");

  // Load from API on mount
  useEffect(() => {
    fetchStages()
      .then((loaded) => setStages(loaded))
      .catch(() => setStages(DEFAULT_PIPELINE_STAGES))
      .finally(() => setLoading(false));
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    _toastId += 1;
    const id = _toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Persist and update local state
  async function persist(updated: PipelineStageDefinition[], successMsg: string) {
    // Re-number orders to match array position (1-indexed)
    const reordered = updated.map((s, i) => ({ ...s, order: i + 1 }));
    setSaving(true);
    try {
      await saveStages(reordered);
      setStages(reordered);
      addToast(successMsg, "success");
    } catch (err) {
      addToast(`Save failed: ${String(err)}`, "error");
    } finally {
      setSaving(false);
    }
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const next = [...stages];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    void persist(next, `Moved "${stages[index].name}" up`);
  }

  function handleMoveDown(index: number) {
    if (index === stages.length - 1) return;
    const next = [...stages];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    void persist(next, `Moved "${stages[index].name}" down`);
  }

  function handleRename(index: number, newName: string) {
    // Check for duplicate name
    if (stages.some((s, i) => i !== index && s.name.toLowerCase() === newName.toLowerCase())) {
      addToast(`Stage "${newName}" already exists`, "error");
      return;
    }
    const next = stages.map((s, i) =>
      i === index ? { ...s, name: newName } : s
    );
    void persist(next, `Renamed to "${newName}"`);
  }

  function handleRemoveRequest(stage: PipelineStageDefinition) {
    setConfirmStage(stage);
  }

  function handleRemoveConfirm() {
    if (!confirmStage) return;
    const oppCount = getOpportunityCount(confirmStage.name);
    if (oppCount > 0) {
      // Should not reach here (dialog blocks it), but guard anyway
      setConfirmStage(null);
      return;
    }
    const next = stages.filter((s) => s.id !== confirmStage.id);
    setConfirmStage(null);
    void persist(next, `Removed stage "${confirmStage.name}"`);
  }

  function handleAddStage() {
    const trimmed = newStageName.trim();
    if (!trimmed) {
      setAddError("Stage name cannot be empty.");
      return;
    }
    if (stages.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setAddError(`A stage named "${trimmed}" already exists.`);
      return;
    }
    setAddError("");
    const colour = nextColour(stages);
    const newStage: PipelineStageDefinition = {
      id: `stage-custom-${Date.now()}`,
      name: trimmed,
      order: stages.length + 1,
      ...colour,
    };
    setNewStageName("");
    void persist([...stages, newStage], `Added stage "${trimmed}"`);
  }

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismissToast} />
      {confirmStage && (
        <ConfirmDialog
          stageName={confirmStage.name}
          opportunityCount={getOpportunityCount(confirmStage.name)}
          onCancel={() => setConfirmStage(null)}
          onConfirm={handleRemoveConfirm}
        />
      )}

      <div className="space-y-6">
        {/* ── Page header ── */}
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
            Pipeline Configuration
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            Manage pipeline stages — the same list shown on the live Kanban board. Changes are
            saved immediately and reflected on the Pipeline board after a page reload.
          </p>
        </div>

        {/* ── Info notice ── */}
        <div
          className="rounded-xl border px-5 py-4"
          style={{ background: "#ECFEFF", borderColor: "#A5F3FC" }}
        >
          <p className="text-xs font-bold mb-1" style={{ color: "#0891B2" }}>
            Single source of truth
          </p>
          <p className="text-xs" style={{ color: "#0E7490" }}>
            These stages drive the Pipeline Kanban board at{" "}
            <strong>/sales/pipeline</strong> and the Pipeline Configuration widget on the
            Sales Department Settings page. Edits here take effect on those surfaces after a
            browser reload — no code redeploy required.
          </p>
        </div>

        {/* ── Stage list ── */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          {/* Section header */}
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <div>
              <h2
                className="text-sm font-bold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                Pipeline Stages
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                {loading
                  ? "Loading…"
                  : `${stages.length} stage${stages.length !== 1 ? "s" : ""} configured`}
                {saving && (
                  <span
                    className="ml-2 font-semibold"
                    style={{ color: "#D97706" }}
                  >
                    Saving…
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Stage rows */}
          {loading ? (
            <div
              className="p-8 text-center text-sm"
              style={{ color: "var(--rtm-text-muted)", background: "var(--rtm-bg)" }}
            >
              Loading stages…
            </div>
          ) : (
            <div style={{ background: "var(--rtm-bg)" }}>
              {stages.map((stage, index) => (
                <StageRow
                  key={stage.id}
                  stage={stage}
                  index={index}
                  total={stages.length}
                  saving={saving}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  onRename={(name) => handleRename(index, name)}
                  onRemove={() => handleRemoveRequest(stage)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Add stage ── */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          <div
            className="px-5 py-4 border-b"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <h2
              className="text-sm font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              Add New Stage
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              New stages are added at the end of the pipeline. Reorder using the ↑/↓ buttons.
            </p>
          </div>
          <div
            className="p-5 flex items-start gap-3"
            style={{ background: "var(--rtm-bg)" }}
          >
            <div className="flex-1">
              <input
                type="text"
                value={newStageName}
                onChange={(e) => {
                  setNewStageName(e.target.value);
                  if (addError) setAddError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddStage();
                }}
                placeholder="e.g. Contract Sent"
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
                style={{
                  background: "var(--rtm-surface)",
                  borderColor: addError ? "#FECACA" : "var(--rtm-border)",
                  color: "var(--rtm-text-primary)",
                }}
              />
              {addError && (
                <p className="text-xs mt-1.5 font-semibold" style={{ color: "#DC2626" }}>
                  {addError}
                </p>
              )}
            </div>
            <button
              onClick={handleAddStage}
              disabled={saving || loading}
              className="text-sm font-bold px-4 py-2 rounded-lg border disabled:opacity-40 hover:opacity-80 transition-opacity flex-shrink-0"
              style={{ background: "#059669", color: "#fff", borderColor: "#059669" }}
            >
              Add Stage
            </button>
          </div>
        </div>

        {/* ── Legend ── */}
        <div
          className="rounded-xl border p-5"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <h3
            className="text-xs font-bold uppercase tracking-wide mb-3"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Stage Overview
          </h3>
          <div className="flex flex-wrap gap-2">
            {stages.map((stage, i) => (
              <div
                key={stage.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold"
                style={{
                  background: stage.bg,
                  borderColor: stage.border,
                  color: stage.color,
                }}
              >
                <span
                  className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: stage.color, color: "#fff" }}
                >
                  {i + 1}
                </span>
                {stage.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
