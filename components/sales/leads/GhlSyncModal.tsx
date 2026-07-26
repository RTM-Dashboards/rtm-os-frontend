"use client";

// RTM OS — GHL Lead Sync Modal
//
// Triggered from the Leads table (···  menu → "Sync to GHL") or from the
// GHL Contact tab in the Lead drawer. Shows sync status, triggers the real
// /api/ghl/sync-lead call, and displays honest success/error feedback.
//
// Mirrors the visual pattern of the existing Opportunity GHL Sync tab.

import React, { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LeadGhlSyncState {
  ghlContactId?: string;
  ghlSyncStatus?: string;
  ghlSyncError?: string;
  ghlLastSyncedAt?: string;
}

interface GhlSyncModalProps {
  lead: {
    id: string;
    name: string;
    businessName: string;
    email: string;
    phone: string;
    industry: string;
    leadSource: string;
    assignedRep: string;
    // Current overlay state (may be undefined if never synced)
    ghlContactId?: string;
    ghlSyncStatus?: string;
    ghlSyncError?: string;
    ghlLastSyncedAt?: string;
  };
  onClose: () => void;
  onSynced: (result: LeadGhlSyncState) => void;
}

// ── Sync status badge ─────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  Synced:           { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", icon: "✓" },
  "Pending Sync":   { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: "⏳" },
  "Sync Failed":    { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", icon: "✕" },
  "Manual Override":{ color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", icon: "✎" },
  "Not Connected":  { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0", icon: "○" },
};

function SyncBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES["Not Connected"];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border"
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      {s.icon} {status}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function GhlSyncModal({ lead, onClose, onSynced }: GhlSyncModalProps) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    ghlContactId?: string;
    created?: boolean;
    error?: string;
    errorCode?: string;
  } | null>(null);

  // Determine current live state (overlay takes priority over static mock data)
  const liveStatus = lead.ghlSyncStatus ?? "Not Connected";
  const hasRealContactId =
    lead.ghlContactId &&
    !lead.ghlContactId.startsWith("GHL-CON-") &&
    lead.ghlContactId !== "—";

  // Distinguish "Not Connected" (no real GHL data) from a real synced/failed state
  const isRealSynced = hasRealContactId && liveStatus === "Synced";
  const isRealFailed = liveStatus === "Sync Failed";
  const isNotConnected = !hasRealContactId && liveStatus !== "Sync Failed";
  const displayStatus = isNotConnected ? "Not Connected" : liveStatus;

  async function handleSync() {
    setSyncing(true);
    setResult(null);

    try {
      const res = await fetch("/api/ghl/sync-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          businessName: lead.businessName,
          leadSource: lead.leadSource,
          industry: lead.industry,
          assignedRep: lead.assignedRep,
          // Pass existing real ID to update rather than re-create
          ghlContactId: hasRealContactId ? lead.ghlContactId : undefined,
        }),
      });

      const data = await res.json();
      setResult(data);

      if (data.ok) {
        const syncedState: LeadGhlSyncState = {
          ghlContactId: data.ghlContactId,
          ghlSyncStatus: "Synced",
          ghlSyncError: "",
          ghlLastSyncedAt: new Date().toISOString(),
        };
        onSynced(syncedState);
      } else {
        // Error state — onSynced not called; error shown in modal
        // The API route has already persisted the Sync Failed state
      }
    } catch (networkErr) {
      setResult({
        ok: false,
        error: networkErr instanceof Error ? networkErr.message : "Network error",
        errorCode: "NETWORK_ERROR",
      });
    } finally {
      setSyncing(false);
    }
  }

  const lastSynced = lead.ghlLastSyncedAt
    ? new Date(lead.ghlLastSyncedAt).toLocaleString()
    : "Never";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              GHL Contact Sync
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {lead.businessName} · {lead.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Current status */}
          <div className="flex items-center justify-between rounded-lg border p-3" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Current Sync Status</p>
              <SyncBadge status={displayStatus} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Last Synced</p>
              <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{lastSynced}</p>
            </div>
          </div>

          {/* GHL Contact ID (if known) */}
          {hasRealContactId && (
            <div className="rounded-lg border p-3" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>GHL Contact ID</p>
              <code className="text-xs font-mono" style={{ color: "#0891B2" }}>{lead.ghlContactId}</code>
            </div>
          )}

          {/* Not Connected explanation */}
          {isNotConnected && !result && (
            <div className="rounded-lg border p-4" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-primary)" }}>Not Connected to GHL</p>
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                This lead has no confirmed GHL Contact link. Clicking &quot;Sync to GHL&quot; will search
                GHL for a matching contact (by email), update it if found, or create a new one.
              </p>
            </div>
          )}

          {/* Existing sync error explanation */}
          {isRealFailed && lead.ghlSyncError && !result && (
            <div className="rounded-lg border p-4" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
              <p className="text-xs font-bold mb-1" style={{ color: "#DC2626" }}>Last Sync Error</p>
              <p className="text-xs" style={{ color: "#B91C1C" }}>{lead.ghlSyncError}</p>
              <p className="text-xs mt-2" style={{ color: "var(--rtm-text-muted)" }}>
                Click &quot;Retry Sync&quot; to attempt again with the current lead data.
              </p>
            </div>
          )}

          {/* Sync result — success */}
          {result?.ok && (
            <div className="rounded-lg border p-4" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
              <p className="text-sm font-bold mb-1" style={{ color: "#059669" }}>
                ✓ {result.created ? "GHL Contact Created" : "GHL Contact Updated"}
              </p>
              <p className="text-xs mb-2" style={{ color: "#15803D" }}>
                This lead is now synced to GHL.
              </p>
              <div className="rounded-md border p-2" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#059669" }}>GHL Contact ID</p>
                <code className="text-xs font-mono" style={{ color: "#059669" }}>{result.ghlContactId}</code>
              </div>
            </div>
          )}

          {/* Sync result — error */}
          {result && !result.ok && (
            <div className="rounded-lg border p-4" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
              <p className="text-sm font-bold mb-1" style={{ color: "#DC2626" }}>✕ Sync Failed</p>
              <p className="text-xs mb-1" style={{ color: "#B91C1C" }}>{result.error}</p>
              {result.errorCode === "GHL_NOT_CONFIGURED" && (
                <p className="text-xs mt-2" style={{ color: "var(--rtm-text-muted)" }}>
                  Set <code className="bg-red-50 px-1 rounded">GHL_PRIVATE_INTEGRATION_TOKEN</code> and{" "}
                  <code className="bg-red-50 px-1 rounded">GHL_LOCATION_ID</code> in your environment variables to enable sync.
                </p>
              )}
            </div>
          )}

          {/* What will be synced */}
          {!result && (
            <div className="rounded-lg border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Data Being Synced to GHL</p>
              <div className="space-y-1">
                {[
                  ["Name",          lead.name],
                  ["Email",         lead.email || "—"],
                  ["Phone",         lead.phone || "—"],
                  ["Company",       lead.businessName],
                  ["Source",        lead.leadSource],
                  ["Tags",          [lead.industry, lead.leadSource].filter(Boolean).join(", ") || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
                    <span className="font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4 border-t"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-lg font-semibold border"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
          >
            {result?.ok ? "Close" : "Cancel"}
          </button>
          {!result?.ok && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="text-sm px-4 py-2 rounded-lg font-bold disabled:opacity-40 flex items-center gap-1.5"
              style={{ background: isRealFailed ? "#DC2626" : "#0891B2", color: "#fff" }}
            >
              {syncing ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Syncing…
                </>
              ) : isRealFailed ? (
                "Retry Sync"
              ) : isRealSynced ? (
                "Re-sync to GHL"
              ) : (
                "Sync to GHL"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
