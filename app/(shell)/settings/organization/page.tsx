"use client";

import React, { useEffect, useRef, useState } from "react";
import type { CompanyConfigRow } from "@/app/api/company-config/route";

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
// CompanyConfigPage
// ─────────────────────────────────────────────────────────────────────────────
//
// Three distinguishable states:
//   1. Loading   — skeleton / spinner
//   2. Load error — error panel with retry button
//   3. Loaded    — edit form with Save / save-error / save-success feedback
//
// Auth: Executive or SystemAdmin only. A Manager will receive a 403 from the
// API and see the load-error panel.

export default function CompanyConfigPage() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [config, setConfig]         = useState<CompanyConfigRow | null>(null);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);

  // ── Edit form state (mirrors the nine editable fields) ────────────────────
  const [legalName,           setLegalName]           = useState("");
  const [address,             setAddress]             = useState("");
  const [phone,               setPhone]               = useState("");
  const [supportEmail,        setSupportEmail]         = useState("");
  const [logoUrl,             setLogoUrl]             = useState("");
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState("");
  const [refundFooter,        setRefundFooter]        = useState("");
  const [defaultTaxRate,      setDefaultTaxRate]      = useState("0");
  const [taxExemptionText,    setTaxExemptionText]    = useState("");

  // ── Save state ──────────────────────────────────────────────────────────────
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState<string | null>(null);
  const [saveSuccess,  setSaveSuccess]  = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/company-config");
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? `Failed to load: ${res.status}`);
      }
      const data = await res.json() as { config: CompanyConfigRow };
      applyConfig(data.config);
      setConfig(data.config);
    } catch (err) {
      setLoadError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function applyConfig(c: CompanyConfigRow) {
    setLegalName(c.legalName);
    setAddress(c.address);
    setPhone(c.phone);
    setSupportEmail(c.supportEmail);
    setLogoUrl(c.logoUrl);
    setDefaultPaymentTerms(c.defaultPaymentTerms);
    setRefundFooter(c.refundFooter);
    setDefaultTaxRate(String(c.defaultTaxRate));
    setTaxExemptionText(c.taxExemptionText);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const taxRate = parseFloat(defaultTaxRate);
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 1) {
      setSaveError("Default tax rate must be a number between 0 and 1 (e.g. 0 for 0%, 0.1 for 10%).");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/company-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName,
          address,
          phone,
          supportEmail,
          logoUrl,
          defaultPaymentTerms,
          refundFooter,
          defaultTaxRate: taxRate,
          taxExemptionText,
        }),
      });
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? `Save failed: ${res.status}`);
      }
      const data = await res.json() as { config: CompanyConfigRow };
      applyConfig(data.config);
      setConfig(data.config);
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
            Loading company configuration…
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
            Failed to load company configuration
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
              Company Identity
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              These details appear on all client-facing documents. Executive or SystemAdmin only.
            </p>
          </div>
          {config && (
            <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
              Last updated: {config.updatedAt ? new Date(config.updatedAt).toLocaleString() : "—"}
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
                Company configuration saved.
              </p>
            </div>
          )}

          {/* ── Grid of fields ── */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Legal Name */}
            <div className="sm:col-span-2">
              <label style={LABEL_STYLE}>Legal Entity Name</label>
              <input
                style={INPUT_STYLE}
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Real Time Marketing"
              />
              <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                Printed exactly as entered on all invoices, proposals, and contracts.
              </p>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label style={LABEL_STYLE}>Mailing Address</label>
              <textarea
                style={{ ...INPUT_STYLE, resize: "vertical", minHeight: 72 }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="4700 Riverview Blvd, Bradenton, Florida 34209, United States"
              />
            </div>

            {/* Phone */}
            <div>
              <label style={LABEL_STYLE}>Phone</label>
              <input
                style={INPUT_STYLE}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 941-289-1234"
              />
            </div>

            {/* Support Email */}
            <div>
              <label style={LABEL_STYLE}>Support Email</label>
              <input
                type="email"
                style={INPUT_STYLE}
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@realtimemarketing.com"
              />
            </div>

            {/* Logo URL */}
            <div className="sm:col-span-2">
              <label style={LABEL_STYLE}>Logo URL or Path</label>
              <input
                style={INPUT_STYLE}
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="/rtm-logo.png"
              />
              <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                A root-relative path (e.g. <code>/rtm-logo.png</code>) or an absolute URL.
                File upload is not supported; update the file in <code>public/</code> directly.
              </p>
              {logoUrl && (
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    style={{ height: 36, objectFit: "contain", borderRadius: 4, border: "1px solid var(--rtm-border)" }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                    Preview (shown only when path resolves)
                  </span>
                </div>
              )}
            </div>

            {/* Default Payment Terms */}
            <div>
              <label style={LABEL_STYLE}>Default Payment Terms</label>
              <input
                style={INPUT_STYLE}
                value={defaultPaymentTerms}
                onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                placeholder="e.g. Net 30"
              />
              <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                Printed on invoices when no per-invoice override is set. Leave blank if unknown.
              </p>
            </div>

            {/* Default Tax Rate */}
            <div>
              <label style={LABEL_STYLE}>Default Tax Rate</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.001}
                  style={{ ...INPUT_STYLE, flex: 1 }}
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(e.target.value)}
                />
                <span className="text-xs font-semibold shrink-0" style={{ color: "var(--rtm-text-muted)" }}>
                  ({(parseFloat(defaultTaxRate) * 100 || 0).toFixed(1)}%)
                </span>
              </div>
              <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                Enter as a decimal: 0 = 0%, 0.1 = 10%. RTM clients are currently always exempt
                (value stays 0; tax exemption text appears on the document instead).
              </p>
            </div>

            {/* Tax Exemption Text */}
            <div className="sm:col-span-2">
              <label style={LABEL_STYLE}>Tax Exemption Text</label>
              <input
                style={INPUT_STYLE}
                value={taxExemptionText}
                onChange={(e) => setTaxExemptionText(e.target.value)}
                placeholder="Customer is tax exempt"
              />
              <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                Shown on invoices when the tax rate is zero. Confirms the exemption explicitly.
              </p>
            </div>

            {/* Refund Footer */}
            <div className="sm:col-span-2">
              <label style={LABEL_STYLE}>Refund / Card Fee Footer</label>
              <textarea
                style={{ ...INPUT_STYLE, resize: "vertical", minHeight: 64 }}
                value={refundFooter}
                onChange={(e) => setRefundFooter(e.target.value)}
                placeholder="Note: Card transactions are subject to a 2.9% + $0.30 processing fee. This fee is non-refundable."
              />
              <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                Printed at the bottom of every invoice.
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
              Changes take effect immediately for all new documents generated after saving.
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
        Settings → Organization
      </p>
      <h1
        className="text-2xl font-medium tracking-tight"
        style={{ color: "var(--rtm-text-primary)" }}
      >
        Company Profile
      </h1>
      <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
        RTM&apos;s own identity as it appears on all client-facing documents: invoices, proposals,
        and contracts. Editable by Executive and SystemAdmin only.
      </p>
    </div>
  );
}
