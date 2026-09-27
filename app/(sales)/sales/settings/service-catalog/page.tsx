"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import type { ServiceCatalogRow } from "@/app/api/sales/service-catalog/route";
import type { DiscountTierRow, DiscountTypeRow } from "@/app/api/sales/discount-config/route";

// ─── Constants ────────────────────────────────────────────────────────────────

const QUANTITY_UNITS = ["flat", "location", "campaign", "page"] as const;
const DEPARTMENTS = ["SEO", "GBP", "PPC", "LSA", "Meta Ads", "Web Development", "Content", "Analytics"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(n: number): string {
  return n === 0 ? "$0" : `$${n.toLocaleString()}`;
}

function parseDollar(raw: string): number | null {
  const n = parseFloat(raw.replace(/[$,]/g, ""));
  if (isNaN(n) || n < 0) return null;
  return n;
}

function parseIntOptions(raw: string): number[] | null {
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const nums = parts.map(Number);
  if (nums.some(isNaN)) return null;
  return nums;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  background: "var(--rtm-bg)",
  borderColor: "var(--rtm-border)",
  color: "var(--rtm-text-primary)",
  width: "100%",
  padding: "6px 10px",
  borderRadius: "6px",
  borderWidth: 1,
  borderStyle: "solid",
  fontSize: 12,
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
// Service Catalogue Config
// ─────────────────────────────────────────────────────────────────────────────

function ServiceCatalogConfig() {
  const [services, setServices] = useState<ServiceCatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null); // service id being saved
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sales/service-catalog?all=1");
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? `Fetch failed: ${res.status}`);
      }
      const data = await res.json() as { services: ServiceCatalogRow[] };
      setServices(data.services);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  async function handlePatch(id: string, patch: Partial<ServiceCatalogRow>) {
    setSaving(id);
    setSaveError(null);
    try {
      const res = await fetch(`/api/sales/service-catalog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? `Save failed: ${res.status}`);
      }
      const data = await res.json() as { service: ServiceCatalogRow };
      setServices((prev) => prev.map((s) => s.id === id ? data.service : s));
      setEditingId(null);
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(null);
    }
  }

  async function handleCreate(row: Partial<ServiceCatalogRow> & { label: string }) {
    setSaving("__new__");
    setSaveError(null);
    try {
      const res = await fetch("/api/sales/service-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? `Create failed: ${res.status}`);
      }
      const data = await res.json() as { service: ServiceCatalogRow };
      setServices((prev) => [...prev, data.service]);
      setAddingNew(false);
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border px-6 py-10 text-center" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading service catalogue…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border px-6 py-8 text-center" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
        <p className="text-sm font-semibold" style={{ color: "#DC2626" }}>Failed to load service catalogue</p>
        <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{error}</p>
        <button onClick={fetchServices} className="mt-4 px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: "#DC2626" }}>Retry</button>
      </div>
    );
  }

  const active = services.filter((s) => s.isActive);
  const retired = services.filter((s) => !s.isActive);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
          Service Catalogue — {active.length} active{retired.length > 0 ? `, ${retired.length} retired` : ""}
        </p>
        <button
          onClick={() => { setAddingNew(true); setSaveError(null); }}
          className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
          style={{ background: "#1D4ED8" }}
        >
          + Add Service
        </button>
      </div>

      {saveError && (
        <div className="rounded-lg border px-4 py-3" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>{saveError}</p>
        </div>
      )}

      {addingNew && (
        <ServiceEditor
          onSave={handleCreate}
          onCancel={() => { setAddingNew(false); setSaveError(null); }}
          saving={saving === "__new__"}
        />
      )}

      {/* Active services */}
      {active.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
          <div className="px-4 py-2 border-b" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#059669" }}>Active ({active.length})</p>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--rtm-border)" }}>
            {active.map((svc) => (
              editingId === svc.id
                ? <ServiceEditor key={svc.id} existing={svc} onSave={(patch) => handlePatch(svc.id, patch)} onCancel={() => setEditingId(null)} saving={saving === svc.id} />
                : <ServiceListRow key={svc.id} svc={svc} onEdit={() => setEditingId(svc.id)}
                    onRetire={() => handlePatch(svc.id, { isActive: false })}
                    saving={saving === svc.id}
                  />
            ))}
          </div>
        </div>
      )}

      {/* Retired services */}
      {retired.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
          <div className="px-4 py-2 border-b" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#6B7280" }}>
              Retired ({retired.length}) — excluded from new proposals; old proposals still display these
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--rtm-border)" }}>
            {retired.map((svc) => (
              editingId === svc.id
                ? <ServiceEditor key={svc.id} existing={svc} onSave={(patch) => handlePatch(svc.id, patch)} onCancel={() => setEditingId(null)} saving={saving === svc.id} />
                : <ServiceListRow key={svc.id} svc={svc} onEdit={() => setEditingId(svc.id)}
                    onRestore={() => handlePatch(svc.id, { isActive: true })}
                    saving={saving === svc.id}
                    retired
                  />
            ))}
          </div>
        </div>
      )}

      {services.length === 0 && !addingNew && (
        <div className="rounded-xl border px-6 py-10 text-center" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No services in catalogue. Add one above.</p>
        </div>
      )}
    </div>
  );
}

// ─── Service list row ─────────────────────────────────────────────────────────

function ServiceListRow({
  svc,
  onEdit,
  onRetire,
  onRestore,
  saving,
  retired = false,
}: {
  svc: ServiceCatalogRow;
  onEdit: () => void;
  onRetire?: () => void;
  onRestore?: () => void;
  saving: boolean;
  retired?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ background: retired ? "var(--rtm-surface)" : "var(--rtm-bg)", opacity: retired ? 0.75 : 1 }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{svc.label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{svc.department}</span>
          {svc.isRecurring
            ? <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#ECFDF5", color: "#059669" }}>Recurring</span>
            : <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#F3F4F6", color: "#6B7280" }}>One-Time</span>
          }
          {retired && <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#F3F4F6", color: "#6B7280" }}>Retired</span>}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
            {svc.isRecurring ? `${formatUSD(svc.defaultMonthlyPrice)}/mo` : `${formatUSD(svc.defaultSetupFee)} one-time`}
            {svc.isRecurring && svc.defaultSetupFee > 0 && ` + ${formatUSD(svc.defaultSetupFee)} setup`}
          </span>
          {svc.isRecurring && (svc.minMonthlyPrice > 0 || svc.maxMonthlyPrice > 0) && (
            <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
              range {formatUSD(svc.minMonthlyPrice)}–{formatUSD(svc.maxMonthlyPrice)}
            </span>
          )}
          <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>qty: {svc.quantityOptions.join(", ")} {svc.quantityUnit}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onEdit} disabled={saving}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-80"
          style={{ background: "var(--rtm-bg)", color: "#1D4ED8", borderColor: "#BFDBFE" }}>
          Edit
        </button>
        {onRetire && (
          <button onClick={onRetire} disabled={saving}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-80"
            style={{ background: "var(--rtm-bg)", color: "#DC2626", borderColor: "#FECACA" }}>
            {saving ? "…" : "Retire"}
          </button>
        )}
        {onRestore && (
          <button onClick={onRestore} disabled={saving}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-80"
            style={{ background: "var(--rtm-bg)", color: "#059669", borderColor: "#BBF7D0" }}>
            {saving ? "…" : "Restore"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Service editor form ──────────────────────────────────────────────────────

function ServiceEditor({
  existing,
  onSave,
  onCancel,
  saving,
}: {
  existing?: ServiceCatalogRow;
  onSave: (data: Partial<ServiceCatalogRow> & { label: string }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [label, setLabel] = useState(existing?.label ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [department, setDepartment] = useState(existing?.department ?? "SEO");
  const [quantityUnit, setQuantityUnit] = useState(existing?.quantityUnit ?? "flat");
  const [quantityOptionsStr, setQuantityOptionsStr] = useState((existing?.quantityOptions ?? [1]).join(", "));
  const [defaultQuantity, setDefaultQuantity] = useState(String(existing?.defaultQuantity ?? 1));
  const [defaultMonthlyStr, setDefaultMonthlyStr] = useState(String(existing?.defaultMonthlyPrice ?? 0));
  const [defaultSetupStr, setDefaultSetupStr] = useState(String(existing?.defaultSetupFee ?? 0));
  const [minMonthlyStr, setMinMonthlyStr] = useState(String(existing?.minMonthlyPrice ?? 0));
  const [maxMonthlyStr, setMaxMonthlyStr] = useState(String(existing?.maxMonthlyPrice ?? 0));
  const [setupFeeEditable, setSetupFeeEditable] = useState(existing?.setupFeeEditable ?? false);
  const [isRecurring, setIsRecurring] = useState(existing?.isRecurring ?? true);
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? false);
  const [catalogId, setCatalogId] = useState(existing?.catalogId ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  function validate(): boolean {
    setValidationError(null);
    if (!label.trim()) { setValidationError("Label is required."); return false; }
    const defMonthly = parseDollar(defaultMonthlyStr);
    const minMonthly = parseDollar(minMonthlyStr);
    const maxMonthly = parseDollar(maxMonthlyStr);
    if (defMonthly === null) { setValidationError("Default monthly price must be a valid number ≥ 0."); return false; }
    if (minMonthly === null) { setValidationError("Min price must be a valid number ≥ 0."); return false; }
    if (maxMonthly === null) { setValidationError("Max price must be a valid number ≥ 0."); return false; }
    if (maxMonthly > 0 && (defMonthly < minMonthly || defMonthly > maxMonthly)) {
      setValidationError(`Default price (${formatUSD(defMonthly)}) must be between min (${formatUSD(minMonthly)}) and max (${formatUSD(maxMonthly)}).`);
      return false;
    }
    const opts = parseIntOptions(quantityOptionsStr);
    if (!opts || opts.length === 0) { setValidationError("Quantity options must be a comma-separated list of integers."); return false; }
    const dq = parseInt(defaultQuantity);
    if (isNaN(dq) || dq < 1) { setValidationError("Default quantity must be a positive integer."); return false; }
    return true;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({
      label: label.trim(),
      description: description.trim(),
      department,
      quantityUnit,
      quantityOptions: parseIntOptions(quantityOptionsStr)!,
      defaultQuantity: parseInt(defaultQuantity),
      defaultMonthlyPrice: parseDollar(defaultMonthlyStr)!,
      defaultSetupFee: parseDollar(defaultSetupStr)!,
      minMonthlyPrice: parseDollar(minMonthlyStr)!,
      maxMonthlyPrice: parseDollar(maxMonthlyStr)!,
      setupFeeEditable,
      isRecurring,
      isDefault,
      catalogId: catalogId.trim(),
    });
  }

  return (
    <div className="border rounded-xl p-4 space-y-4" style={{ borderColor: "#BFDBFE", background: "#EFF6FF" }}>
      <p className="text-xs font-bold" style={{ color: "#1D4ED8" }}>
        {existing ? `Editing: ${existing.label}` : "New Service"}
      </p>

      {validationError && (
        <div className="rounded-lg border px-3 py-2" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>{validationError}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={LABEL_STYLE}>Label *</label>
          <input style={INPUT_STYLE} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Website Hosting" />
        </div>
        <div>
          <label style={LABEL_STYLE}>Department</label>
          <select style={INPUT_STYLE} value={department} onChange={(e) => setDepartment(e.target.value)}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label style={LABEL_STYLE}>Description</label>
          <textarea style={{ ...INPUT_STYLE, resize: "vertical", minHeight: 60 }} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label style={LABEL_STYLE}>Quantity Unit</label>
          <select style={INPUT_STYLE} value={quantityUnit} onChange={(e) => setQuantityUnit(e.target.value)}>
            {QUANTITY_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label style={LABEL_STYLE}>Quantity Options (comma-separated)</label>
          <input style={INPUT_STYLE} value={quantityOptionsStr} onChange={(e) => setQuantityOptionsStr(e.target.value)} placeholder="1, 2, 3" />
        </div>
        <div>
          <label style={LABEL_STYLE}>Default Quantity</label>
          <input type="number" min={1} style={INPUT_STYLE} value={defaultQuantity} onChange={(e) => setDefaultQuantity(e.target.value)} />
        </div>
        <div>
          <label style={LABEL_STYLE}>Default Monthly Price ($)</label>
          <input type="number" min={0} style={INPUT_STYLE} value={defaultMonthlyStr} onChange={(e) => setDefaultMonthlyStr(e.target.value)} />
        </div>
        <div>
          <label style={LABEL_STYLE}>Default Setup Fee ($)</label>
          <input type="number" min={0} style={INPUT_STYLE} value={defaultSetupStr} onChange={(e) => setDefaultSetupStr(e.target.value)} />
        </div>
        <div>
          <label style={LABEL_STYLE}>Min Monthly Price ($)</label>
          <input type="number" min={0} style={INPUT_STYLE} value={minMonthlyStr} onChange={(e) => setMinMonthlyStr(e.target.value)} />
        </div>
        <div>
          <label style={LABEL_STYLE}>Max Monthly Price ($)</label>
          <input type="number" min={0} style={INPUT_STYLE} value={maxMonthlyStr} onChange={(e) => setMaxMonthlyStr(e.target.value)} />
          {(() => {
            const def = parseDollar(defaultMonthlyStr);
            const min = parseDollar(minMonthlyStr);
            const max = parseDollar(maxMonthlyStr);
            if (def !== null && min !== null && max !== null && max > 0 && (def < min || def > max)) {
              return <p className="text-[10px] mt-1" style={{ color: "#DC2626" }}>Default price is outside the min–max range.</p>;
            }
            return null;
          })()}
        </div>
        <div>
          <label style={LABEL_STYLE}>Catalogue ID (links to recommendation config)</label>
          <input style={INPUT_STYLE} value={catalogId} onChange={(e) => setCatalogId(e.target.value)} placeholder="e.g. svc-web-hosting" />
        </div>
        <div className="col-span-2 flex items-center gap-6 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
            <span style={{ fontSize: 12, color: "var(--rtm-text-secondary)" }}>Recurring (monthly)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={setupFeeEditable} onChange={(e) => setSetupFeeEditable(e.target.checked)} />
            <span style={{ fontSize: 12, color: "var(--rtm-text-secondary)" }}>Setup fee editable by rep</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            <span style={{ fontSize: 12, color: "var(--rtm-text-secondary)" }}>Is default (reserved for future use)</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleSubmit} disabled={saving}
          className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "#1D4ED8" }}>
          {saving ? "Saving…" : existing ? "Save Changes" : "Create Service"}
        </button>
        <button onClick={onCancel} disabled={saving}
          className="px-4 py-2 rounded-lg text-xs font-semibold border transition-all hover:opacity-80 disabled:opacity-50"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
          Cancel
        </button>
        {existing && (
          <p className="text-[10px] ml-2" style={{ color: "var(--rtm-text-muted)" }}>
            Note: renaming this service changes what existing proposals display, since proposals store the service id, not a snapshot.
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Discount Config
// ─────────────────────────────────────────────────────────────────────────────

function DiscountConfig() {
  const [tiers, setTiers] = useState<DiscountTierRow[]>([]);
  const [types, setTypes] = useState<DiscountTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/sales/discount-config");
        if (!res.ok) {
          const b = await res.json() as { error?: string };
          throw new Error(b.error ?? `Fetch failed: ${res.status}`);
        }
        const data = await res.json() as { tiers: DiscountTierRow[]; types: DiscountTypeRow[] };
        if (!cancelled) { setTiers(data.tiers); setTypes(data.types); }
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function saveTiers(updated: DiscountTierRow[]) {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/sales/discount-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiers: updated }),
      });
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? `Save failed: ${res.status}`);
      }
      setTiers(updated);
      setSaveSuccess(true);
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-xl border px-6 py-8 text-center" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
      <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading discount config…</p>
    </div>;
  }

  if (error) {
    return <div className="rounded-xl border px-6 py-8 text-center" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
      <p className="text-sm font-semibold" style={{ color: "#DC2626" }}>Failed to load discount config</p>
      <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{error}</p>
    </div>;
  }

  return (
    <div className="space-y-4">
      {saveError && (
        <div className="rounded-lg border px-4 py-3" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>{saveError}</p>
        </div>
      )}
      {saveSuccess && (
        <div className="rounded-lg border px-4 py-3" style={{ background: "#ECFDF5", borderColor: "#BBF7D0" }}>
          <p className="text-xs font-semibold" style={{ color: "#059669" }}>Discount tiers saved.</p>
        </div>
      )}

      {/* Percentage tiers */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>Discount Percentage Tiers</p>
          <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>Edit label or percentage per tier</p>
        </div>
        <div className="p-4 space-y-2" style={{ background: "var(--rtm-bg)" }}>
          {tiers.map((tier, i) => (
            <div key={tier.id} className="flex items-center gap-3">
              <span className="text-[10px] font-semibold w-8 text-right shrink-0" style={{ color: "var(--rtm-text-muted)" }}>{i + 1}.</span>
              <input
                style={{ ...INPUT_STYLE, flex: 2 }}
                value={tier.label}
                onChange={(e) => setTiers((prev) => prev.map((t, j) => j === i ? { ...t, label: e.target.value } : t))}
                placeholder="Label"
              />
              <input
                type="number" min={0} max={100}
                style={{ ...INPUT_STYLE, flex: 1 }}
                value={tier.percentage}
                onChange={(e) => {
                  const pct = parseFloat(e.target.value);
                  if (!isNaN(pct) && pct >= 0 && pct <= 100) {
                    setTiers((prev) => prev.map((t, j) => j === i ? { ...t, percentage: pct } : t));
                  }
                }}
              />
              <span className="text-[11px] shrink-0" style={{ color: "var(--rtm-text-muted)" }}>%</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setTiers((prev) => [...prev, { id: `tier-${Date.now()}`, label: "", percentage: 0, sortOrder: prev.length }])}
              className="text-xs font-semibold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
              style={{ background: "var(--rtm-surface)", color: "#1D4ED8", borderColor: "#BFDBFE" }}>
              + Add Tier
            </button>
            <button
              onClick={() => saveTiers(tiers.map((t, i) => ({ ...t, sortOrder: i })))}
              disabled={saving}
              className="text-xs font-bold px-4 py-1.5 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#1D4ED8" }}>
              {saving ? "Saving…" : "Save Tiers"}
            </button>
          </div>
        </div>
      </div>

      {/* Discount types (read-only summary — changing these requires a deploy to update the engine) */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
        <div className="px-4 py-3 border-b" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>Discount Types</p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>These types are configured in the database and match the budget engine. Changing their values here changes labels but not engine logic.</p>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--rtm-border)" }}>
          {types.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3" style={{ background: "var(--rtm-bg)" }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{t.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{t.description}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-muted)" }}>{t.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ServiceCatalogConfigPage() {
  const [tab, setTab] = useState<"services" | "discounts">("services");

  return (
    <>
      <SalesSettingsBreadcrumb section="Service Catalogue" />

      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#059669" }}>Sales Settings</p>
          <h1 className="text-2xl font-medium tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Service Catalogue &amp; Discount Config
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            Edit services, pricing, and discount tiers. Changes take effect immediately on new proposals.
          </p>
          <p className="text-xs mt-1 font-semibold" style={{ color: "#C2410C" }}>
            ⚠ Renaming a service changes how it appears on any proposal that references it by id, including proposals already sent.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border rounded-lg p-1 w-fit" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          {(["services", "discounts"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-md text-sm font-semibold transition-colors"
              style={{ background: tab === t ? "var(--rtm-accent)" : "transparent", color: tab === t ? "#fff" : "var(--rtm-text-secondary)" }}>
              {t === "services" ? "Services" : "Discounts"}
            </button>
          ))}
        </div>

        {tab === "services" && <ServiceCatalogConfig />}
        {tab === "discounts" && <DiscountConfig />}
      </div>
    </>
  );
}
