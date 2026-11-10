"use client";

// RTM OS — Package Builder
//
// Sales-workspace-owned page. Packages are named, priced bundles of catalogue
// services. Package Builder is where packages are stored and authored from
// scratch. Document-layout proposal templates are a separate, later feature.
//
// Path: /sales/settings/packages
// API:  /api/sales/packages  (GET, POST, PATCH /:id)
//
// Auth is enforced server-side by the API. The page itself relies on the
// Sales workspace layout and the department gate on every API call.

import React, { useCallback, useEffect, useRef, useState } from "react";
import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import type { PackageRow, PackageItemRow } from "@/app/api/sales/packages/route";
import type { ServiceCatalogRow } from "@/app/api/sales/service-catalog/route";
import { AUDIT_GOALS } from "@/lib/sales/audit-goal-config";

// ─── Constants ────────────────────────────────────────────────────────────────

const BILLING_FREQUENCIES = [
  "Monthly",
  "Quarterly",
  "Annually",
  "One-time",
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(n: number): string {
  if (n === 0) return "$0";
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Sum of catalogue prices for the selected services (display only).
function computeCatalogueTotal(
  items: { serviceId: string; quantity: number }[],
  catalogue: ServiceCatalogRow[]
): number {
  const map = new Map(catalogue.map((s) => [s.id, s]));
  return items.reduce((sum, it) => {
    const svc = map.get(it.serviceId);
    if (!svc) return sum;
    return sum + svc.defaultMonthlyPrice * it.quantity;
  }, 0);
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
// Goal Multiselect
// Lets the author pick any subset of Audit Goals by id. Stores ids, not
// display names, so a renamed goal does not break existing packages.
// ─────────────────────────────────────────────────────────────────────────────

interface GoalMultiselectProps {
  value:    string[]; // selected goal ids
  onChange: (ids: string[]) => void;
}

function GoalMultiselect({ value, onChange }: GoalMultiselectProps) {
  const selectedSet = new Set(value);

  function toggle(id: string) {
    if (selectedSet.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {AUDIT_GOALS.map((goal) => {
        const selected = selectedSet.has(goal.id);
        return (
          <button
            key={goal.id}
            type="button"
            onClick={() => toggle(goal.id)}
            className="text-[11px] font-semibold px-3 py-1 rounded-full border transition-all"
            style={selected ? {
              background: "rgba(29,78,216,0.12)",
              color: "#1D4ED8",
              borderColor: "#BFDBFE",
            } : {
              background: "var(--rtm-bg)",
              color: "var(--rtm-text-muted)",
              borderColor: "var(--rtm-border)",
            }}
          >
            {selected ? "✓ " : ""}{goal.name}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Picker
// Lets the author choose services from the active catalogue, set a quantity
// per service, and see the unbundled catalogue total.
// ─────────────────────────────────────────────────────────────────────────────

interface ServicePickerItem {
  serviceId: string;
  quantity:  number;
}

interface ServicePickerProps {
  catalogue: ServiceCatalogRow[];
  value:     ServicePickerItem[];
  onChange:  (items: ServicePickerItem[]) => void;
}

function ServicePicker({ catalogue, value, onChange }: ServicePickerProps) {
  const selectedIds = new Set(value.map((it) => it.serviceId));

  function addService(serviceId: string) {
    if (selectedIds.has(serviceId)) return;
    const svc = catalogue.find((s) => s.id === serviceId);
    const qty = svc?.defaultQuantity ?? 1;
    onChange([...value, { serviceId, quantity: qty }]);
  }

  function removeService(serviceId: string) {
    onChange(value.filter((it) => it.serviceId !== serviceId));
  }

  function setQuantity(serviceId: string, qty: number) {
    onChange(value.map((it) => it.serviceId === serviceId ? { ...it, quantity: qty } : it));
  }

  const unselected = catalogue.filter((s) => !selectedIds.has(s.id));
  const catalogueMap = new Map(catalogue.map((s) => [s.id, s]));

  return (
    <div className="space-y-3">
      {/* Chosen services */}
      {value.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
          <div className="px-3 py-2 border-b" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>
              Included Services ({value.length})
            </p>
          </div>
          <div className="divide-y" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
            {value.map((it, idx) => {
              const svc = catalogueMap.get(it.serviceId);
              if (!svc) return null;
              const hasOptions = svc.quantityOptions.length > 0;
              return (
                <div
                  key={it.serviceId}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  {/* Position badge */}
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(29,78,216,0.12)", color: "#1D4ED8" }}
                  >
                    {idx + 1}
                  </span>
                  {/* Label + unit */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>
                      {svc.label}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "var(--rtm-text-muted)" }}>
                      {formatUSD(svc.defaultMonthlyPrice)}/{svc.quantityUnit !== "flat" ? svc.quantityUnit : "mo"} · {svc.department}
                    </p>
                  </div>
                  {/* Quantity picker */}
                  <div className="flex-shrink-0" style={{ width: 100 }}>
                    <label style={{ ...LABEL_STYLE, marginBottom: 2, display: "block" }}>
                      Qty ({svc.quantityUnit})
                    </label>
                    {hasOptions ? (
                      <select
                        style={{ ...INPUT_STYLE, padding: "4px 6px", width: 100 }}
                        value={it.quantity}
                        onChange={(e) => setQuantity(it.serviceId, parseInt(e.target.value, 10))}
                      >
                        {svc.quantityOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        min={1}
                        style={{ ...INPUT_STYLE, padding: "4px 6px", width: 100 }}
                        value={it.quantity}
                        onChange={(e) => {
                          const q = parseInt(e.target.value, 10);
                          if (q > 0) setQuantity(it.serviceId, q);
                        }}
                      />
                    )}
                  </div>
                  {/* Line total */}
                  <div className="text-right flex-shrink-0 w-20">
                    <p className="text-[11px] font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                      {formatUSD(svc.defaultMonthlyPrice * it.quantity)}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>unbundled</p>
                  </div>
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeService(it.serviceId)}
                    className="flex-shrink-0 text-[11px] font-bold px-2 py-1 rounded transition-colors"
                    style={{ color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA" }}
                    title="Remove service"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add service */}
      {unselected.length > 0 && (
        <div>
          <label style={LABEL_STYLE}>Add Service</label>
          <select
            style={INPUT_STYLE}
            value=""
            onChange={(e) => { if (e.target.value) addService(e.target.value); }}
          >
            <option value="">— select a service to add —</option>
            {unselected.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} ({s.department}) · {formatUSD(s.defaultMonthlyPrice)}/{s.quantityUnit !== "flat" ? s.quantityUnit : "mo"}
              </option>
            ))}
          </select>
        </div>
      )}

      {catalogue.length === 0 && (
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          No active services in the catalogue yet.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Package Form
// Used for both create and edit.
// ─────────────────────────────────────────────────────────────────────────────

interface PackageFormProps {
  catalogue: ServiceCatalogRow[];
  existing?: PackageRow;
  onSaved:   (pkg: PackageRow) => void;
  onCancel:  () => void;
}

function PackageForm({ catalogue, existing, onSaved, onCancel }: PackageFormProps) {
  const [name,             setName]             = useState(existing?.name             ?? "");
  const [code,             setCode]             = useState(existing?.code             ?? "");
  const [price,            setPrice]            = useState(existing ? String(existing.price) : "");
  const [billingFrequency, setBillingFrequency] = useState(existing?.billingFrequency ?? "Monthly");
  const [description,      setDescription]      = useState(existing?.description      ?? "");
  const [recommendedFor,   setRecommendedFor]   = useState<string[]>(existing?.recommendedFor ?? []);
  const [minBudget,        setMinBudget]        = useState(existing ? String(existing.minBudget) : "");
  const [maxBudget,        setMaxBudget]        = useState(existing ? String(existing.maxBudget) : "");
  const [isActive,         setIsActive]         = useState(existing?.isActive  ?? true);
  const [isFeatured,       setIsFeatured]       = useState(existing?.isFeatured ?? false);

  // Build initial items from the existing package, defaulting quantity to
  // the catalogue's defaultQuantity when item quantity is 0 (shouldn't happen).
  const initialItems: { serviceId: string; quantity: number }[] = existing
    ? existing.items.map((it) => {
        const svc = catalogue.find((s) => s.id === it.serviceId);
        return { serviceId: it.serviceId, quantity: it.quantity || (svc?.defaultQuantity ?? 1) };
      })
    : [];
  const [items, setItems] = useState<{ serviceId: string; quantity: number }[]>(initialItems);

  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);

  // Catalogue total — unbundled sum of selected services at their catalogue price × qty.
  const catalogueTotal = computeCatalogueTotal(items, catalogue);

  async function handleSubmit() {
    setSaving(true);
    setSaveError(null);

    const body = {
      name:             name.trim(),
      code:             code.trim(),
      price:            parseFloat(price) || 0,
      billingFrequency,
      description:      description.trim(),
      recommendedFor:   recommendedFor,
      minBudget:        parseFloat(minBudget) || 0,
      maxBudget:        parseFloat(maxBudget) || 0,
      isActive,
      isFeatured,
      items:            items.map((it, pos) => ({
        serviceId: it.serviceId,
        position:  pos,
        quantity:  it.quantity,
      })),
    };

    try {
      let res: Response;
      if (existing) {
        res = await fetch(`/api/sales/packages/${existing.id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/sales/packages", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? `Save failed: ${res.status}`);
      }

      const data = await res.json() as { package: PackageRow };
      onSaved(data.package);
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {saveError && (
        <div className="rounded-lg border px-4 py-3" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>{saveError}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label style={LABEL_STYLE}>Package Name *</label>
          <input
            style={INPUT_STYLE}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Local Domination Package"
          />
        </div>

        {/* Code */}
        <div>
          <label style={LABEL_STYLE}>Package Code</label>
          <input
            style={INPUT_STYLE}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Auto-generated from name if blank"
          />
        </div>

        {/* Price */}
        <div>
          <label style={LABEL_STYLE}>
            Package Price ($)
            {items.length > 0 && (
              <span className="ml-2 font-normal" style={{ color: "var(--rtm-text-muted)" }}>
                · Unbundled catalogue total: {formatUSD(catalogueTotal)}
              </span>
            )}
          </label>
          <input
            type="number"
            min={0}
            style={INPUT_STYLE}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Combined package price"
          />
          {items.length > 0 && catalogueTotal > 0 && (
            <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
              Catalogue total (sum of default monthly prices × quantities): {formatUSD(catalogueTotal)}.
              The package price may differ — no discount is computed or stored here.
            </p>
          )}
        </div>

        {/* Billing Frequency */}
        <div>
          <label style={LABEL_STYLE}>Billing Frequency</label>
          <select
            style={INPUT_STYLE}
            value={billingFrequency}
            onChange={(e) => setBillingFrequency(e.target.value)}
          >
            {BILLING_FREQUENCIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label style={LABEL_STYLE}>Description</label>
          <textarea
            style={{ ...INPUT_STYLE, resize: "vertical", minHeight: 60 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this package delivers and who it is for."
          />
        </div>

        {/* Recommended For */}
        <div className="col-span-2">
          <label style={LABEL_STYLE}>
            Recommended For
            <span className="ml-1 font-normal" style={{ color: "var(--rtm-text-muted)" }}>
              — Audit Goals this package suits
            </span>
          </label>
          <p className="text-[10px] mb-2" style={{ color: "var(--rtm-text-muted)" }}>
            Select the Audit Goals that make this package a good recommendation.
            Goal ids are stored so a renamed goal does not break existing packages.
          </p>
          <GoalMultiselect value={recommendedFor} onChange={setRecommendedFor} />
        </div>

        {/* Min Budget */}
        <div>
          <label style={LABEL_STYLE}>Minimum Client Budget ($)</label>
          <input
            type="number"
            min={0}
            style={INPUT_STYLE}
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            placeholder="0"
          />
        </div>

        {/* Max Budget */}
        <div>
          <label style={LABEL_STYLE}>Maximum Client Budget ($)</label>
          <input
            type="number"
            min={0}
            style={INPUT_STYLE}
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="0 = no limit"
          />
        </div>

        {/* Toggles */}
        <div className="col-span-2 flex items-center gap-6 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span style={{ fontSize: 12, color: "var(--rtm-text-secondary)" }}>Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <span style={{ fontSize: 12, color: "var(--rtm-text-secondary)" }}>
              Featured (show prominently in proposal selection)
            </span>
          </label>
        </div>
      </div>

      {/* Service picker */}
      <div>
        <label style={{ ...LABEL_STYLE, marginBottom: 8 }}>Included Services</label>
        <ServicePicker
          catalogue={catalogue}
          value={items}
          onChange={setItems}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={saving || !name.trim()}
          className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "#1D4ED8" }}
        >
          {saving ? "Saving…" : existing ? "Save Changes" : "Create Package"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-xs font-semibold border transition-all hover:opacity-80 disabled:opacity-50"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Package List
// ─────────────────────────────────────────────────────────────────────────────

interface PackageListProps {
  packages:   PackageRow[];
  catalogue:  ServiceCatalogRow[];
  onEdit:     (pkg: PackageRow) => void;
  onDeactivate: (pkg: PackageRow) => void;
  onRestore:  (pkg: PackageRow) => void;
  showInactive: boolean;
}

function PackageList({
  packages,
  catalogue,
  onEdit,
  onDeactivate,
  onRestore,
  showInactive,
}: PackageListProps) {
  if (packages.length === 0) {
    return (
      <div
        className="rounded-xl border px-6 py-10 text-center"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
          No packages yet
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
          Create your first package using the form below.
        </p>
      </div>
    );
  }

  const catalogueMap = new Map(catalogue.map((s) => [s.id, s]));

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
      <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
            <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Name</th>
            <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Code</th>
            <th className="text-right px-4 py-2.5 font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Price</th>
            <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Frequency</th>
            <th className="text-center px-4 py-2.5 font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Services</th>
            <th className="text-center px-4 py-2.5 font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Active</th>
            <th className="text-center px-4 py-2.5 font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Featured</th>
            <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg, i) => {
            const isInactive = !pkg.isActive;
            const serviceCount = pkg.items.length;
            const catalogueTotal = computeCatalogueTotal(
              pkg.items.map((it) => ({ serviceId: it.serviceId, quantity: it.quantity })),
              catalogue
            );

            return (
              <tr
                key={pkg.id}
                style={{
                  background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                  borderTop: i > 0 ? "1px solid var(--rtm-border)" : undefined,
                  opacity: isInactive ? 0.6 : 1,
                }}
              >
                <td className="px-4 py-3">
                  <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{pkg.name}</p>
                  {pkg.description && (
                    <p className="text-[10px] mt-0.5 truncate max-w-[200px]" style={{ color: "var(--rtm-text-muted)" }}>
                      {pkg.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-[11px]" style={{ color: "var(--rtm-text-secondary)" }}>
                  {pkg.code}
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {formatUSD(pkg.price)}
                  </p>
                  {catalogueTotal > 0 && catalogueTotal !== pkg.price && (
                    <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                      ({formatUSD(catalogueTotal)} unbundled)
                    </p>
                  )}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>
                  {pkg.billingFrequency || "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  {serviceCount > 0 ? (
                    <span
                      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(29,78,216,0.1)", color: "#1D4ED8" }}
                      title={pkg.items
                        .map((it) => {
                          const svc = catalogueMap.get(it.serviceId);
                          return `${svc?.label ?? it.serviceId} × ${it.quantity}`;
                        })
                        .join(", ")}
                    >
                      {serviceCount} service{serviceCount !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span style={{ color: "var(--rtm-text-muted)" }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {pkg.isActive ? (
                    <span className="text-[10px] font-bold" style={{ color: "#059669" }}>✓ Active</span>
                  ) : (
                    <span className="text-[10px] font-bold" style={{ color: "#DC2626" }}>✗ Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {pkg.isFeatured ? (
                    <span className="text-[10px] font-bold" style={{ color: "#D97706" }}>★ Featured</span>
                  ) : (
                    <span style={{ color: "var(--rtm-text-muted)", fontSize: 10 }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(pkg)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded border transition-all hover:opacity-80"
                      style={{ background: "var(--rtm-surface)", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                    >
                      Edit
                    </button>
                    {pkg.isActive ? (
                      <button
                        onClick={() => onDeactivate(pkg)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded border transition-all hover:opacity-80"
                        style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}
                      >
                        Deactivate
                      </button>
                    ) : showInactive && (
                      <button
                        onClick={() => onRestore(pkg)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded border transition-all hover:opacity-80"
                        style={{ background: "#F0FDF4", color: "#059669", borderColor: "#BBF7D0" }}
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Package Builder Component
// ─────────────────────────────────────────────────────────────────────────────

function PackageBuilder() {
  const [packages,     setPackages]     = useState<PackageRow[]>([]);
  const [catalogue,    setCatalogue]    = useState<ServiceCatalogRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [loadError,    setLoadError]    = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [editing,      setEditing]      = useState<PackageRow | null>(null);
  const [creating,     setCreating]     = useState(false);
  const [actionError,  setActionError]  = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSuccess = useCallback((msg: string) => {
    setActionSuccess(msg);
    if (successTimer.current) clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setActionSuccess(null), 4000);
  }, []);

  // ── Load data ─────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [pkgRes, catRes] = await Promise.all([
        fetch(`/api/sales/packages${showInactive ? "?all=1" : ""}`),
        fetch("/api/sales/service-catalog"),
      ]);

      if (!pkgRes.ok) {
        const b = await pkgRes.json() as { error?: string };
        throw new Error(b.error ?? `Packages fetch failed: ${pkgRes.status}`);
      }
      if (!catRes.ok) {
        const b = await catRes.json() as { error?: string };
        throw new Error(b.error ?? `Catalogue fetch failed: ${catRes.status}`);
      }

      const pkgData  = await pkgRes.json() as { packages: PackageRow[] };
      const catData  = await catRes.json() as { services: ServiceCatalogRow[] };
      setPackages(pkgData.packages);
      // Only active catalogue items for the service picker.
      setCatalogue(catData.services.filter((s) => s.isActive));
    } catch (err) {
      setLoadError(String(err));
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // ── Soft delete / restore ─────────────────────────────────────────────────
  async function handleDeactivate(pkg: PackageRow) {
    setActionError(null);
    try {
      const res = await fetch(`/api/sales/packages/${pkg.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive: false }),
      });
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? `Deactivate failed: ${res.status}`);
      }
      showSuccess(`"${pkg.name}" deactivated.`);
      void loadAll();
    } catch (err) {
      setActionError(String(err));
    }
  }

  async function handleRestore(pkg: PackageRow) {
    setActionError(null);
    try {
      const res = await fetch(`/api/sales/packages/${pkg.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive: true }),
      });
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? `Restore failed: ${res.status}`);
      }
      showSuccess(`"${pkg.name}" restored.`);
      void loadAll();
    } catch (err) {
      setActionError(String(err));
    }
  }

  // ── After form save ───────────────────────────────────────────────────────
  function handleSaved(pkg: PackageRow) {
    showSuccess(editing ? `"${pkg.name}" updated.` : `"${pkg.name}" created.`);
    setEditing(null);
    setCreating(false);
    void loadAll();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="rounded-xl border px-6 py-10 text-center"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading packages…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="rounded-xl border px-6 py-8 text-center"
        style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#DC2626" }}>Failed to load packages</p>
        <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{loadError}</p>
        <button
          onClick={() => void loadAll()}
          className="mt-3 text-xs font-semibold px-3 py-1.5 rounded border hover:opacity-80"
          style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback banners */}
      {actionError && (
        <div className="rounded-lg border px-4 py-3" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>{actionError}</p>
        </div>
      )}
      {actionSuccess && (
        <div className="rounded-lg border px-4 py-3" style={{ background: "#ECFDF5", borderColor: "#BBF7D0" }}>
          <p className="text-xs font-semibold" style={{ color: "#059669" }}>{actionSuccess}</p>
        </div>
      )}

      {/* Controls row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Show inactive packages</span>
        </label>
        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: "#1D4ED8" }}
          >
            + New Package
          </button>
        )}
      </div>

      {/* Package list */}
      <PackageList
        packages={packages}
        catalogue={catalogue}
        onEdit={(pkg) => { setEditing(pkg); setCreating(false); }}
        onDeactivate={handleDeactivate}
        onRestore={handleRestore}
        showInactive={showInactive}
      />

      {/* Edit form */}
      {editing && (
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Editing: {editing.name}
            </h2>
            <button
              onClick={() => setEditing(null)}
              className="text-xs font-semibold px-2.5 py-1 rounded border hover:opacity-80"
              style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
            >
              ✕ Close
            </button>
          </div>
          <PackageForm
            catalogue={catalogue}
            existing={editing}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {/* Create form */}
      {creating && (
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              New Package
            </h2>
            <button
              onClick={() => setCreating(false)}
              className="text-xs font-semibold px-2.5 py-1 rounded border hover:opacity-80"
              style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
            >
              ✕ Close
            </button>
          </div>
          <PackageForm
            catalogue={catalogue}
            onSaved={handleSaved}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function PackagesPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Package Builder" />

      <div className="space-y-6">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "#059669" }}
          >
            Sales Settings
          </p>
          <h1
            className="text-2xl font-medium tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Packages &amp; Bundles
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            Pre-configured service bundles offered as named packages with combined pricing.
            Packages are named collections of services sold together at a defined price point.
            They simplify proposal creation by pre-assembling common service combinations.
            Audit Goal Configuration maps prospect goals to recommended packages.
          </p>
        </div>

        <PackageBuilder />
      </div>
    </>
  );
}
