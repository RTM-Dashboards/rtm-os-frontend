"use client";

/**
 * Import Existing Client
 * /account-management/clients/import
 *
 * For Account Management use only. Melissa fills this in for each existing
 * client being migrated from Teamwork. Bypasses Billing entirely — the client
 * is already paying. No invoice, no handoff, no contract row, no setup tasks.
 *
 * Gate: requireDepartment(user, "Account Management", "Member") on the API.
 * This page does not re-check — the API enforces it.
 *
 * Three distinguishable UI states:
 *   idle     — form ready to fill
 *   saving   — POST in flight; submit disabled
 *   success  — result shown; form resets for the next import
 *   failure  — error shown; form stays filled so Melissa can fix and retry
 *
 * Field layout is optimised for speed: company name and domain at the top
 * (the two most critical fields), then contact, address, services, monthly
 * value, AM, contract ref. Tab order follows the visual order.
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getWorkspace } from "@/lib/workspaces";
import type { ImportResult } from "@/app/api/account-management/import-client/route";

const workspace = getWorkspace("account-management")!;

// ── Types ─────────────────────────────────────────────────────────────────────

interface CatalogService {
  id:         string;
  label:      string;
  department: string;
}

interface AMUser {
  id:         string;
  name:       string;
  department: string | null;
}

type FormState = "idle" | "saving" | "success" | "failure";

// ── Small UI helpers ──────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
      {children}
      {required && <span className="ml-1" style={{ color: "#DC2626" }}>*</span>}
    </label>
  );
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {hint && <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{hint}</p>}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors"
      style={{
        borderColor: "var(--rtm-border)",
        background: disabled ? "var(--rtm-bg-alt, #F9FAFB)" : "var(--rtm-bg)",
        color: "var(--rtm-text-primary)",
      }}
    />
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b pb-1 mb-3" style={{ borderColor: "var(--rtm-border-light)" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>
        {children}
      </p>
    </div>
  );
}

// ── Success card ──────────────────────────────────────────────────────────────

function SuccessCard({
  result,
  onImportAnother,
}: {
  result: ImportResult;
  onImportAnother: () => void;
}) {
  const r = result.launch;
  return (
    <div className="rounded-xl border p-6 space-y-4" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#059669" }}>
          Import Complete
        </p>
        <h2 className="text-lg font-bold" style={{ color: "#065F46" }}>✅ Client imported successfully</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#059669" }}>Client ID</p>
          <p className="font-mono text-xs" style={{ color: "#065F46" }}>{result.clientId}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#059669" }}>Business ID</p>
          <p className="font-mono text-xs" style={{ color: "#065F46" }}>{result.businessId}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#059669" }}>Project ID</p>
          <p className="font-mono text-xs" style={{ color: "#065F46" }}>{r.projectId ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#059669" }}>Assigned AM</p>
          <p className="text-xs font-semibold" style={{ color: "#065F46" }}>{r.assignedAMName ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#059669" }}>Categories</p>
          <p className="text-xs font-semibold" style={{ color: "#065F46" }}>{r.categoriesCreated}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#059669" }}>Recurring Tasks</p>
          <p className="text-xs font-semibold" style={{ color: "#065F46" }}>{r.recurringTasksCreated}</p>
        </div>
      </div>

      {r.errors.length > 0 && (
        <div className="rounded-lg border p-3" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#991B1B" }}>Partial warnings</p>
          {r.errors.map((e, i) => (
            <p key={i} className="text-xs" style={{ color: "#991B1B" }}>{e}</p>
          ))}
        </div>
      )}

      {r.emptyDepartments.length > 0 && (
        <p className="text-xs" style={{ color: "#D97706" }}>
          ⚠ Tasks in these departments are unassigned (no active member): {r.emptyDepartments.join(", ")}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onImportAnother}
          className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
          style={{ background: workspace.accentColor }}
        >
          Import Another Client
        </button>
        <Link
          href="/account-management/projects"
          className="text-sm font-semibold px-4 py-2 rounded-lg border"
          style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
        >
          View Projects
        </Link>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const BLANK = {
  company:        "",
  domain:         "",
  contactName:    "",
  contactEmail:   "",
  contactPhone:   "",
  addressStreet:  "",
  addressSuite:   "",
  addressCity:    "",
  addressState:   "",
  addressZip:     "",
  addressCountry: "",
  monthlyValue:   "",
  contractRef:    "",
  assignedAMId:   "",
  serviceIds:     [] as string[],
};

export default function ImportClientPage() {
  const [form, setForm] = useState({ ...BLANK });
  const [services, setServices] = useState<CatalogService[]>([]);
  const [amUsers, setAmUsers]   = useState<AMUser[]>([]);
  const [state, setState]       = useState<FormState>("idle");
  const [error, setError]       = useState<string | null>(null);
  const [result, setResult]     = useState<ImportResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Load catalogue and AM users ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [svcRes, userRes] = await Promise.all([
        fetch("/api/sales/service-catalog"),
        fetch("/api/users"),
      ]);

      if (svcRes.ok) {
        const svcData = await svcRes.json() as { services?: CatalogService[] };
        setServices(svcData.services ?? []);
      } else {
        setLoadError("Failed to load service catalogue.");
        return;
      }

      if (userRes.ok) {
        const userData = await userRes.json() as { users?: AMUser[] };
        const all = userData.users ?? [];
        // Only show Account Management users as AM options.
        setAmUsers(all.filter((u) => u.department === "Account Management"));
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load data.");
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  function set(key: keyof typeof BLANK, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleService(id: string) {
    setForm((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter((s) => s !== id)
        : [...prev.serviceIds, id],
    }));
  }

  function reset() {
    setForm({ ...BLANK });
    setState("idle");
    setError(null);
    setResult(null);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side validation (mirrors API validation)
    if (!form.company.trim()) { setError("Business name is required."); return; }
    if (!form.domain.trim())  { setError("Domain is required."); return; }
    if (form.serviceIds.length === 0) { setError("Select at least one service."); return; }
    if (!form.assignedAMId)   { setError("Select an Account Manager."); return; }

    const monthly = parseFloat(form.monthlyValue);
    if (!form.monthlyValue.trim() || !Number.isFinite(monthly) || monthly < 0) {
      setError("Monthly value must be a valid non-negative number.");
      return;
    }

    setState("saving");

    try {
      const res = await fetch("/api/account-management/import-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company:        form.company.trim(),
          domain:         form.domain.trim(),
          contactName:    form.contactName.trim(),
          contactEmail:   form.contactEmail.trim(),
          contactPhone:   form.contactPhone.trim(),
          addressStreet:  form.addressStreet.trim(),
          addressSuite:   form.addressSuite.trim(),
          addressCity:    form.addressCity.trim(),
          addressState:   form.addressState.trim(),
          addressZip:     form.addressZip.trim(),
          addressCountry: form.addressCountry.trim(),
          monthlyValueCents: Math.round(monthly * 100),
          contractRef:    form.contractRef.trim(),
          serviceIds:     form.serviceIds,
          assignedAMId:   form.assignedAMId,
        }),
      });

      const data = await res.json() as { result?: ImportResult; error?: string };

      if (!res.ok || data.error) {
        setError(data.error ?? `HTTP ${res.status}`);
        setState("failure");
        return;
      }

      setResult(data.result!);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("failure");
    }
  }

  const saving = state === "saving";

  // ── Render ─────────────────────────────────────────────────────────────────

  if (state === "success" && result) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
            Account Management
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Import Existing Client
          </h1>
        </div>
        <SuccessCard result={result} onImportAnother={reset} />
        <Link href="/account-management" className="text-sm font-semibold" style={{ color: workspace.accentColor }}>
          ← Account Management
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          Account Management
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Import Existing Client
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          For clients already being served — currently on Teamwork, moving to RTM OS.
          Bypasses Billing entirely. No invoice is raised.
        </p>
      </div>

      {loadError && (
        <div className="rounded-lg border px-4 py-3 text-sm" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}>
          {loadError}
        </div>
      )}

      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">

        {/* ── Business identity ──────────────────────────────────────────── */}
        <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: "var(--rtm-border)" }}>
          <SectionHead>Business</SectionHead>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Business Name" required>
              <Input value={form.company} onChange={(v) => set("company", v)}
                placeholder="Apex Roofing" disabled={saving} />
            </Field>
            <Field label="Domain" required hint="We normalise it — paste the full URL if you like.">
              <Input value={form.domain} onChange={(v) => set("domain", v)}
                placeholder="apexroofing.com" disabled={saving} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Monthly Value ($)" required hint="Dollars, not cents — e.g. 1500">
              <Input value={form.monthlyValue} onChange={(v) => set("monthlyValue", v)}
                placeholder="1500" type="number" disabled={saving} />
            </Field>
            <Field label="Contract Number" hint="PandaDoc number or internal ref — for reference only.">
              <Input value={form.contractRef} onChange={(v) => set("contractRef", v)}
                placeholder="CTR-2024-0042" disabled={saving} />
            </Field>
          </div>
        </div>

        {/* ── Contact ────────────────────────────────────────────────────── */}
        <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: "var(--rtm-border)" }}>
          <SectionHead>Primary Contact</SectionHead>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Name">
              <Input value={form.contactName} onChange={(v) => set("contactName", v)}
                placeholder="Jane Smith" disabled={saving} />
            </Field>
            <Field label="Email">
              <Input value={form.contactEmail} onChange={(v) => set("contactEmail", v)}
                placeholder="jane@apexroofing.com" type="email" disabled={saving} />
            </Field>
            <Field label="Phone">
              <Input value={form.contactPhone} onChange={(v) => set("contactPhone", v)}
                placeholder="(602) 555-0123" disabled={saving} />
            </Field>
          </div>
        </div>

        {/* ── Address ────────────────────────────────────────────────────── */}
        <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: "var(--rtm-border)" }}>
          <SectionHead>Address</SectionHead>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Street">
              <Input value={form.addressStreet} onChange={(v) => set("addressStreet", v)}
                placeholder="123 Main St" disabled={saving} />
            </Field>
            <Field label="Suite / Unit">
              <Input value={form.addressSuite} onChange={(v) => set("addressSuite", v)}
                placeholder="Suite 400" disabled={saving} />
            </Field>
            <Field label="City">
              <Input value={form.addressCity} onChange={(v) => set("addressCity", v)}
                placeholder="Phoenix" disabled={saving} />
            </Field>
            <Field label="State">
              <Input value={form.addressState} onChange={(v) => set("addressState", v)}
                placeholder="AZ" disabled={saving} />
            </Field>
            <Field label="Zip">
              <Input value={form.addressZip} onChange={(v) => set("addressZip", v)}
                placeholder="85001" disabled={saving} />
            </Field>
            <Field label="Country">
              <Input value={form.addressCountry} onChange={(v) => set("addressCountry", v)}
                placeholder="US" disabled={saving} />
            </Field>
          </div>
        </div>

        {/* ── Services ───────────────────────────────────────────────────── */}
        <div className="rounded-xl border p-5 space-y-3" style={{ borderColor: "var(--rtm-border)" }}>
          <SectionHead>Services *</SectionHead>
          {services.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading catalogue…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map((svc) => {
                const checked = form.serviceIds.includes(svc.id);
                return (
                  <label
                    key={svc.id}
                    className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors"
                    style={{
                      borderColor: checked ? workspace.accentColor : "var(--rtm-border-light)",
                      background:  checked ? "#EFF6FF"             : "var(--rtm-bg)",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 flex-shrink-0"
                      checked={checked}
                      onChange={() => toggleService(svc.id)}
                      disabled={saving}
                    />
                    <div>
                      <p className="text-sm font-semibold leading-snug" style={{ color: "var(--rtm-text-primary)" }}>
                        {svc.label}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{svc.department}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
          {form.serviceIds.length > 0 && (
            <p className="text-xs" style={{ color: workspace.accentColor }}>
              {form.serviceIds.length} service{form.serviceIds.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {/* ── Account Manager ────────────────────────────────────────────── */}
        <div className="rounded-xl border p-5 space-y-3" style={{ borderColor: "var(--rtm-border)" }}>
          <SectionHead>Account Manager *</SectionHead>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Pick the AM already assigned to this client. This is not routed by workload.
          </p>
          {amUsers.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading AM list…</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {amUsers.map((am) => {
                const selected = form.assignedAMId === am.id;
                return (
                  <button
                    key={am.id}
                    type="button"
                    onClick={() => set("assignedAMId", am.id)}
                    disabled={saving}
                    className="text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                    style={{
                      borderColor: selected ? workspace.accentColor : "var(--rtm-border-light)",
                      background:  selected ? "#EFF6FF"             : "var(--rtm-bg)",
                      color:       selected ? workspace.accentColor : "var(--rtm-text-secondary)",
                    }}
                  >
                    {am.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Error ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-lg border px-4 py-3 text-sm font-medium"
            style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}>
            {error}
          </div>
        )}

        {/* ── Submit ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="text-sm font-bold px-6 py-2.5 rounded-lg text-white transition-opacity"
            style={{ background: workspace.accentColor, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Importing…" : "Import Client"}
          </button>
          <Link href="/account-management"
            className="text-sm font-semibold px-4 py-2.5 rounded-lg border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
            Cancel
          </Link>
          {saving && (
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Creating client, business, project, and recurring tasks…
            </span>
          )}
        </div>
      </form>

      {/* Footer */}
      <div className="pt-2">
        <Link href="/account-management" className="text-sm font-semibold" style={{ color: workspace.accentColor }}>
          ← Account Management
        </Link>
      </div>
    </div>
  );
}
