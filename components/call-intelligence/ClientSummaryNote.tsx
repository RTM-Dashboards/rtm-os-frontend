// RTM OS — ClientSummaryNote (shared component)
//
// Real persisted per-client summary note. Written by reps, NOT AI-generated.
// Reads/writes via /api/call-intelligence-notes (data/call-intelligence-notes.json).
//
// Used on:
//   - Reporting › Call Intelligence   (/reporting/call-intelligence)
//   - Local Service Ads › Performance (/local-service-ads/performance)
//
// Do not build a second note-storage mechanism — this component IS the single
// implementation. Both pages use this same component + same API endpoint.

"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NoteState {
  text: string;
  savedText: string;
  updatedAt: string | null;
  saving: boolean;
  saved: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ClientSummaryNote({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [state, setState] = useState<NoteState>({
    text: "",
    savedText: "",
    updatedAt: null,
    saving: false,
    saved: false,
  });

  // Load note on mount / clientId change
  useEffect(() => {
    setState({ text: "", savedText: "", updatedAt: null, saving: false, saved: false });
    fetch(`/api/call-intelligence-notes?clientId=${encodeURIComponent(clientId)}`)
      .then((r) => r.json())
      .then((d: { note?: string; updatedAt?: string | null }) => {
        const note = d.note ?? "";
        setState((prev) => ({
          ...prev,
          text: note,
          savedText: note,
          updatedAt: d.updatedAt ?? null,
        }));
      })
      .catch(() => {/* ignore load errors */});
  }, [clientId]);

  const handleSave = useCallback(async () => {
    setState((prev) => ({ ...prev, saving: true, saved: false }));
    try {
      const res = await fetch(
        `/api/call-intelligence-notes?clientId=${encodeURIComponent(clientId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: state.text }),
        }
      );
      const d = (await res.json()) as { updatedAt?: string };
      setState((prev) => ({
        ...prev,
        savedText: prev.text,
        updatedAt: d.updatedAt ?? null,
        saving: false,
        saved: true,
      }));
      setTimeout(() => setState((prev) => ({ ...prev, saved: false })), 2000);
    } catch {
      setState((prev) => ({ ...prev, saving: false }));
    }
  }, [clientId, state.text]);

  const isDirty = state.text !== state.savedText;

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border-light)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className="font-bold text-sm"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Client Summary Note
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {clientName} · Written by rep · Persisted, not AI-generated
          </div>
        </div>
        {state.updatedAt && (
          <div className="text-xs flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }}>
            Saved {new Date(state.updatedAt).toLocaleString()}
          </div>
        )}
      </div>

      <textarea
        value={state.text}
        onChange={(e) => setState((prev) => ({ ...prev, text: e.target.value, saved: false }))}
        placeholder={`Write a summary note for ${clientName} — overall performance, what needs attention, recent observations…`}
        rows={5}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-y"
        style={{
          borderColor: "var(--rtm-border-light)",
          background: "var(--rtm-bg-secondary)",
          color: "var(--rtm-text-primary)",
        }}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={state.saving || !isDirty}
          className="text-xs font-semibold px-4 py-2 rounded-lg border transition-opacity"
          style={{
            color: "#0F766E",
            background: "#0F766E15",
            borderColor: "#0F766E40",
            opacity: state.saving || !isDirty ? 0.5 : 1,
            cursor: state.saving || !isDirty ? "not-allowed" : "pointer",
          }}
        >
          {state.saving ? "Saving…" : "Save Note"}
        </button>
        {state.saved && (
          <span className="text-xs font-semibold" style={{ color: "#059669" }}>
            ✓ Saved
          </span>
        )}
        {isDirty && !state.saving && (
          <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
}
