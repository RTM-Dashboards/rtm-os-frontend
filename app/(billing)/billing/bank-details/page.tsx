"use client";

import React, { useEffect, useRef, useState } from "react";
import type { BankDetailsRow } from "@/app/api/bank-details/route";

// ─── Styles ───────────────────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  background: "var(--rtm-bg)",
  borderColor: "var(--rtm-border)",
  color: "var(--rtm-text-primary)",
  width: "100%",
  padding: "6px 10px",
  borderRadius: "6px",
  borderWidth: 1,
  borderStyle: "solid",
  fontSize: 13,
  outline: "none",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--rtm-text-muted)",
  display: "block",
  marginBottom: 4,
};

// ─────────────────────────────────────────────────────────────────────────────
// BankDetailsPage
// ─────────────────────────────────────────────────────────────────────────────
//
// Editable by: Billing Manager, Executive, SystemAdmin.
//              (requireDepartment gate on the API)
// Members, Managers in other departments, and unauthenticated callers
// receive a 403 and see the load-error panel.

export default function BankDetailsPage() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // ── Form state ──────────────────────────────────────────────────────────────
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName,      setBankName]      = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [swiftCode,     setSwiftCode]     = useState("");

  // ── Save state ──────────────────────────────────────────────────────────────
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/bank-details");
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? `Failed to load: ${res.status}`);
      }
      const data = await res.json() as { bankDetails: BankDetailsRow };
      applyRow(data.bankDetails);
    } catch (err) {
      setLoadError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function applyRow(r: BankDetailsRow) {
    setAccountHolder(r.accountHolder);
    setBankName(r.bankName);
    setRoutingNumber(r.routingNumber);
    setAccountNumber(r.accountNumber);
    setSwiftCode(r.swiftCode);
    setLastUpdated(r.updatedAt);
  }

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/bank-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountHolder, bankName, routingNumber, accountNumber, swiftCode }),
      });
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? `Save failed: ${res.status}`);
      }
      const data = await res.json() as { bankDetails: BankDetailsRow };
      applyRow(data.bankDetails);
      setSaveSuccess(true);
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  }

  // ── Render: loading ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <div
          className="rounded-xl border px-6 py-10 text-center"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            Loading bank details…
          </p>
        </div>
      </div>
    );
  }

  // ── Render: load error ──────────────────────────────────────────────────────

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <div
          className="rounded-xl border px-6 py-8 text-center"
          style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#DC2626" }}>
            Failed to load bank details
          </p>
          <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{loadError}</p>
          <button
            onClick={load}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-bold text-white"
            style={{ background: "#DC2626" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render: form ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader />

      {/* Warning banner — details are unconfirmed */}
      <div
        className="rounded-xl border px-5 py-3"
        style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
      >
        <p className="text-xs font-bold" style={{ color: "#92400E" }}>
          ⚠ These bank details are seeded from Fe&apos;s second invoice but have not been
          confirmed as current. Verify every field with RTM&apos;s bank before sending any invoice
          with transfer instructions.
        </p>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        {/* Form header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div>
            <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Wire Transfer Details
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Shown on the second page of every invoice. Billing Manager, Executive, or
              SystemAdmin only.
            </p>
          </div>
          {lastUpdated && (
            <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

        {/* Form body */}
        <div className="p-6 space-y-5" style={{ background: "var(--rtm-bg)" }}>

          {/* Save feedback */}
          {saveError && (
            <div
              className="rounded-lg border px-4 py-3"
              style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
            >
              <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>{saveError}</p>
            </div>
          )}
          {saveSuccess && (
            <div
              className="rounded-lg border px-4 py-3"
              style={{ background: "#ECFDF5", borderColor: "#BBF7D0" }}
            >
              <p className="text-xs font-semibold" style={{ color: "#059669" }}>
                Bank details saved.
              </p>
            </div>
          )}

          {/* Fields */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div className="sm:col-span-2">
              <label style={LABEL_STYLE}>Account Holder</label>
              <input
                style={INPUT_STYLE}
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Real Time Marketing"
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>Bank Name</label>
              <input
                style={INPUT_STYLE}
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Wells Fargo"
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>SWIFT Code</label>
              <input
                style={INPUT_STYLE}
                value={swiftCode}
                onChange={(e) => setSwiftCode(e.target.value)}
                placeholder="WFBIUS6SXXX"
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>Routing Number</label>
              <input
                style={INPUT_STYLE}
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                placeholder="121000248"
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>Account Number</label>
              <input
                style={INPUT_STYLE}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
                autoComplete="off"
              />
              <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                Stored encrypted at rest by Supabase. Not printed in logs or error messages.
              </p>
            </div>

            <div className="sm:col-span-2 rounded-lg border px-4 py-3" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border-light)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Reference line</p>
              <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                The <strong>Reference</strong> field on a wire transfer shows the invoice number.
                It is injected per-invoice at render time — not stored here.
              </p>
            </div>

          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "var(--rtm-border)" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#1D4ED8" }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
              Changes appear on all invoices rendered after saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div>
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-1"
        style={{ color: "var(--rtm-text-muted)" }}
      >
        Billing → Bank Details
      </p>
      <h1
        className="text-2xl font-medium tracking-tight"
        style={{ color: "var(--rtm-text-primary)" }}
      >
        Bank Transfer Details
      </h1>
      <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
        RTM&apos;s wire transfer details shown on the second page of every invoice.
        Editable by Billing Manager, Executive, and SystemAdmin only.
      </p>
    </div>
  );
}
