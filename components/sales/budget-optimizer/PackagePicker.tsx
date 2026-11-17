"use client";

// RTM OS — Package Picker
//
// Renders active packages fetched from /api/sales/packages and allows the rep
// to insert a package block into the proposal budget (or remove one already
// inserted).
//
// DISPLAY: name, price, billingFrequency, service count.
// EMPTY STATE: "No active packages" — never seeded examples.
// INSERTION: delegates to buildPackageLineItems → returns BudgetLineItem[]
//   that the caller splices into lineItems.
// REMOVAL: caller removes all lines where lineItem.packageId === pkg.id.
// MULTI-PACKAGE: caller tracks insertedPackageIds (a Set); this component
//   just marks each package as inserted or not.
//
// All prices are snapshotted at insertion time (same contract as
// buildLineItemFromService). A package edited or deactivated after insertion
// does NOT change an existing proposal.
//
// SAVE AS PACKAGE — foot of picker, role-gated to Sales Manager+
//   Reads lineItems from the proposal, applies hazard handling:
//     A. Duplicate service ids → quantities summed, user is told before confirm
//     B. custom-* lines       → excluded, user is told before confirm
//     C. package-discount     → excluded from items; net price includes their effect
//     D. Mixed buckets        → price prefilled from dominant (recurring) bucket
//   Opens a prefilled dialog; POSTs to existing /api/sales/packages route.
//   On success: new package appears in the picker list without a page reload.
//   Role gate: fetches /api/me; hides button for anyone below Sales Manager.
//   Pattern: mirrors SalesSettingsPage canAccess(me.role) usage.

import React, { useEffect, useRef, useState } from "react";
import type { BudgetServiceDefinition } from "@/lib/sales/budget-config";
import { buildPackageLineItems } from "@/lib/sales/budget-engine";
import type { BudgetLineItem } from "@/lib/sales/budget-engine";
import { AUDIT_GOAL_CONFIG } from "@/lib/sales/intake-config";

// ─── Constants ──────────────────────────────────────────────────────────────

const BILLING_FREQUENCIES = [
  "Monthly",
  "Quarterly",
  "Annually",
  "One-time",
] as const;

type BillingFrequency = (typeof BILLING_FREQUENCIES)[number];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PackageItemRow {
  id:        string;
  packageId: string;
  serviceId: string;
  position:  number;
  quantity:  number;
}

export interface PackageRow {
  id:               string;
  name:             string;
  price:            number;
  billingFrequency: string;
  description:      string;
  isActive:         boolean;
  items:            PackageItemRow[];
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface PackagePickerProps {
  /** Set of packageIds already present in the proposal's lineItems */
  insertedPackageIds: Set<string>;
  /** DB catalogue lookup — same instance used by BudgetOptimizerShell */
  catalogLookup: (id: string) => BudgetServiceDefinition | undefined;
  /** Called when the rep inserts a package; returns the new lines to append */
  onInsert: (lines: BudgetLineItem[], pkg: PackageRow) => void;
  /** Called when the rep removes a package; caller filters by packageId */
  onRemove: (packageId: string) => void;
  /**
   * The proposal's current effective line items.
   * Passed so the Save As Package control can read what is on the proposal
   * right now. Optional: when absent the Save button is hidden.
   */
  lineItems?: BudgetLineItem[];
  /**
   * Called after a package is successfully saved so the parent can optionally
   * react (e.g. analytics). The picker refreshes its own list internally.
   */
  onPackageSaved?: (pkg: PackageRow) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function slugify(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Returns true when the signed-in user can write packages
// (Sales Manager, Executive, SystemAdmin).
// Pattern: mirrors SalesSettingsPage canAccess() — fetch /api/me and
// check me.role against the write minimum.
function canWritePackages(role: string): boolean {
  return (
    role === "Manager" ||
    role === "Executive" ||
    role === "SystemAdmin"
  );
}

// ─── Save-As-Package analysis ─────────────────────────────────────────────────
//
// Applies Hazards A, B, C, D to the proposal's lineItems and returns a
// ready-to-POST payload plus the lists to show in the confirmation dialog.

interface MergedItem {
  serviceId: string;
  label:     string;
  quantity:  number;
  merged:    boolean;   // true when two separate lines were summed
}

interface SaveAnalysis {
  // Hazard A: merged items (shown when merged=true for any entry)
  mergedItems: MergedItem[];
  // Hazard B: custom lines excluded
  customExcluded: { serviceId: string; label: string }[];
  // Hazard C: discount lines excluded (counted silently; price already accounts for them)
  discountExcluded: number;
  // Hazard D: computed prefill price and suggested billingFrequency
  prefillPrice:     number;
  prefillFrequency: BillingFrequency;
  // Whether there are any eligible items at all
  hasEligibleItems: boolean;
}

function analyzeProposalLines(lineItems: BudgetLineItem[]): SaveAnalysis {
  // Step 1: partition by kind
  const serviceLines  = lineItems.filter(
    (l) => l.lineKind !== "package-discount" && !String(l.serviceId).startsWith("custom-")
  );
  const customLines   = lineItems.filter((l) => String(l.serviceId).startsWith("custom-"));
  const discountLines = lineItems.filter((l) => l.lineKind === "package-discount");

  // Hazard B exclusion list
  const customExcluded = customLines.map((l) => ({
    serviceId: String(l.serviceId),
    label:     l.label,
  }));

  // Hazard C: how many discount lines
  const discountExcluded = discountLines.length;

  // Hazard A: sum duplicate serviceIds
  const quantityByService = new Map<string, { label: string; quantity: number; count: number }>();
  for (const line of serviceLines) {
    const sid = String(line.serviceId);
    const existing = quantityByService.get(sid);
    if (existing) {
      existing.quantity += line.quantity;
      existing.count    += 1;
    } else {
      quantityByService.set(sid, { label: line.label, quantity: line.quantity, count: 1 });
    }
  }

  const mergedItems: MergedItem[] = Array.from(quantityByService.entries()).map(
    ([serviceId, { label, quantity, count }]) => ({
      serviceId,
      label,
      quantity,
      merged: count > 1,
    })
  );

  // Hazard D: price from dominant bucket
  // Recurring bucket = all isRecurring service lines (excludes package-discount lines)
  const recurringServiceLines  = serviceLines.filter((l) => l.isRecurring);
  const oneTimeServiceLines    = serviceLines.filter((l) => !l.isRecurring);

  // Recurring net = sum of monthlySubtotals for recurring service lines
  //               + sum of monthlySubtotals for recurring package-discount lines
  const recurringServiceTotal  = recurringServiceLines.reduce((s, l) => s + l.monthlySubtotal, 0);
  const recurringDiscountTotal = discountLines
    .filter((l) => l.isRecurring)
    .reduce((s, l) => s + l.monthlySubtotal, 0);
  const recurringNet = parseFloat((recurringServiceTotal + recurringDiscountTotal).toFixed(2));

  // One-time net = sum of setupSubtotals for one-time service lines
  //              + sum of setupSubtotals for one-time package-discount lines
  const oneTimeServiceTotal  = oneTimeServiceLines.reduce((s, l) => s + l.setupSubtotal, 0);
  const oneTimeDiscountTotal = discountLines
    .filter((l) => !l.isRecurring)
    .reduce((s, l) => s + l.setupSubtotal, 0);
  const oneTimeNet = parseFloat((oneTimeServiceTotal + oneTimeDiscountTotal).toFixed(2));

  // Dominant bucket: if any recurring lines exist → recurring, else one-time
  const hasRecurring   = recurringServiceLines.length > 0;
  const prefillPrice     = hasRecurring ? recurringNet   : oneTimeNet;
  const prefillFrequency: BillingFrequency = hasRecurring ? "Monthly" : "One-time";

  return {
    mergedItems,
    customExcluded,
    discountExcluded,
    prefillPrice,
    prefillFrequency,
    hasEligibleItems: mergedItems.length > 0,
  };
}

// ─── Save As Package Dialog ────────────────────────────────────────────────────

interface SaveDialogProps {
  analysis:          SaveAnalysis;
  onClose:           () => void;
  onSaved:           (pkg: PackageRow) => void;
}

function SaveAsPackageDialog({ analysis, onClose, onSaved }: SaveDialogProps) {
  const [name,             setName]             = useState("");
  const [code,             setCode]             = useState("");
  const [price,            setPrice]            = useState<number>(analysis.prefillPrice);
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>(analysis.prefillFrequency);
  const [description,      setDescription]      = useState("");
  const [recommendedFor,   setRecommendedFor]   = useState<string[]>([]);
  const [saving,           setSaving]           = useState(false);
  const [saveError,        setSaveError]        = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  // Auto-suggest code from name
  useEffect(() => {
    setCode(slugify(name));
  }, [name]);

  // Focus name on mount
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function toggleGoal(id: string) {
    setRecommendedFor((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    if (!name.trim()) { setSaveError("Name is required."); return; }
    setSaving(true);
    setSaveError(null);

    const items = analysis.mergedItems.map((item, idx) => ({
      serviceId: item.serviceId,
      quantity:  item.quantity,
      position:  idx,
    }));

    const body = {
      name:             name.trim(),
      code:             code.trim() || slugify(name.trim()),
      price,
      billingFrequency,
      description:      description.trim(),
      recommendedFor,
      items,
      isActive:  true,
      isFeatured: false,
      minBudget: 0,
      maxBudget: 0,
    };

    try {
      const res = await fetch("/api/sales/packages", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
        credentials: "include",
      });
      const data = (await res.json()) as { package?: PackageRow; error?: string };

      if (!res.ok) {
        setSaveError(data.error ?? `Unexpected error (${res.status})`);
        setSaving(false);
        return;
      }

      onSaved(data.package!);
    } catch (err) {
      setSaveError(String(err));
      setSaving(false);
    }
  }

  // Handle Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const hasMerges   = analysis.mergedItems.some((m) => m.merged);
  const hasExcludes = analysis.customExcluded.length > 0;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div
        className="rounded-xl border w-full max-w-lg overflow-hidden shadow-2xl"
        style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Save as Package
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {analysis.mergedItems.length} service{analysis.mergedItems.length !== 1 ? "s" : ""} will be saved
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
          >
            Cancel
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5" style={{ flex: 1 }}>

          {/* Merge notice — Hazard A */}
          {hasMerges && (
            <div
              className="rounded-lg border px-4 py-3 space-y-1"
              style={{ background: "#FFFBF5", borderColor: "#FED7AA" }}
            >
              <p className="text-xs font-bold" style={{ color: "#C2410C" }}>
                Duplicate services merged
              </p>
              {analysis.mergedItems
                .filter((m) => m.merged)
                .map((m) => (
                  <p key={m.serviceId} className="text-xs" style={{ color: "#92400E" }}>
                    <strong>{m.label}</strong> appeared more than once — saved as qty{" "}
                    <strong>{m.quantity}</strong>.
                  </p>
                ))}
            </div>
          )}

          {/* Exclusion notice — Hazard B */}
          {hasExcludes && (
            <div
              className="rounded-lg border px-4 py-3 space-y-1"
              style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
            >
              <p className="text-xs font-bold" style={{ color: "#DC2626" }}>
                Lines not carried across
              </p>
              <p className="text-xs" style={{ color: "#7F1D1D" }}>
                The following custom lines have no catalogue ID and cannot be stored in a package:
              </p>
              {analysis.customExcluded.map((ex) => (
                <p key={ex.serviceId} className="text-xs" style={{ color: "#991B1B" }}>
                  • <strong>{ex.label}</strong> ({ex.serviceId})
                </p>
              ))}
            </div>
          )}

          {/* Fields */}
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
              Package name <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Local SEO Starter"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-1"
              style={{
                background:   "var(--rtm-bg)",
                borderColor:  "var(--rtm-border)",
                color:        "var(--rtm-text-primary)",
              }}
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
              Code <span className="text-[10px] font-normal" style={{ color: "var(--rtm-text-muted)" }}>(suggested from name, must be unique)</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
              placeholder="LOCAL-SEO-STARTER"
              className="w-full px-3 py-2 rounded-lg border text-sm font-mono outline-none focus:ring-1"
              style={{
                background:   "var(--rtm-bg)",
                borderColor:  "var(--rtm-border)",
                color:        "var(--rtm-text-primary)",
              }}
            />
          </div>

          {/* Price + billingFrequency */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
                Price
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-1"
                style={{
                  background:   "var(--rtm-bg)",
                  borderColor:  "var(--rtm-border)",
                  color:        "var(--rtm-text-primary)",
                }}
              />
              <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                Net of {analysis.prefillFrequency === "One-time" ? "one-time" : "recurring monthly"} lines incl. discounts
              </p>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
                Billing frequency
              </label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-1"
                style={{
                  background:   "var(--rtm-bg)",
                  borderColor:  "var(--rtm-border)",
                  color:        "var(--rtm-text-primary)",
                }}
              >
                {BILLING_FREQUENCIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
              Description <span className="text-[10px] font-normal" style={{ color: "var(--rtm-text-muted)" }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short description for reps browsing packages…"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-1 resize-none"
              style={{
                background:   "var(--rtm-bg)",
                borderColor:  "var(--rtm-border)",
                color:        "var(--rtm-text-primary)",
              }}
            />
          </div>

          {/* RecommendedFor */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-secondary)" }}>
              Recommended for <span className="text-[10px] font-normal" style={{ color: "var(--rtm-text-muted)" }}>(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AUDIT_GOAL_CONFIG.map((goal) => {
                const selected = recommendedFor.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className="text-[11px] font-semibold px-3 py-1 rounded-full border transition-all"
                    style={
                      selected
                        ? { background: "rgba(29,78,216,0.12)", color: "#1D4ED8", borderColor: "#BFDBFE" }
                        : { background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }
                    }
                  >
                    {selected ? "✓ " : ""}{goal.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {saveError && (
            <div
              className="rounded-lg border px-4 py-3"
              style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
            >
              <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>
                {saveError}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-3 px-6 py-4 border-t shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
            {analysis.mergedItems.length} service{analysis.mergedItems.length !== 1 ? "s" : ""}
            {hasExcludes ? ` · ${analysis.customExcluded.length} excluded` : ""}
            {analysis.discountExcluded > 0 ? " · discount lines affect price only" : ""}
          </p>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !name.trim()}
            className="px-5 py-2 rounded-lg text-xs font-bold transition-all"
            style={{
              background:  saving || !name.trim() ? "#93C5FD" : "var(--rtm-accent)",
              color:       "#fff",
              cursor:      saving || !name.trim() ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : "Save package"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PackagePicker ─────────────────────────────────────────────────────────────

export function PackagePicker({
  insertedPackageIds,
  catalogLookup,
  onInsert,
  onRemove,
  lineItems,
  onPackageSaved,
}: PackagePickerProps) {
  const [packages, setPackages] = useState<PackageRow[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Role gate — fetches /api/me once; hides the Save control for non-Managers
  // Pattern: mirrors SalesSettingsPage canAccess(me.role) in
  //   app/(sales)/sales/settings/page.tsx lines 69-173.
  // "Sales Member would get a 403 from a button they can see" — control is
  // hidden (null) for anyone below Sales Manager; they never see it.
  const [meRole, setMeRole]       = useState<string | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  // Save-As-Package dialog state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveAnalysis,   setSaveAnalysis]   = useState<SaveAnalysis | null>(null);
  const [noLinesError,   setNoLinesError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sales/packages")
      .then((r) => r.json())
      .then((d: { packages?: PackageRow[]; error?: string }) => {
        if (cancelled) return;
        if (d.error) { setFetchError(d.error); return; }
        setPackages((d.packages ?? []).filter((p) => p.isActive));
      })
      .catch((e: unknown) => {
        if (!cancelled) setFetchError(String(e));
      });

    // Fetch current user role for the Save As Package gate
    fetch("/api/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { role?: string } | null) => {
        if (!cancelled && d?.role) setMeRole(d.role);
      })
      .catch(() => { /* role stays null → button stays hidden */ })
      .finally(() => { if (!cancelled) setMeLoading(false); });

    return () => { cancelled = true; };
  }, []);

  function handleInsert(pkg: PackageRow) {
    const lines = buildPackageLineItems(pkg, catalogLookup);
    onInsert(lines, pkg);
  }

  function handleOpenSaveDialog() {
    setNoLinesError(null);
    if (!lineItems || lineItems.length === 0) {
      setNoLinesError("No lines on this proposal to save as a package.");
      return;
    }
    const analysis = analyzeProposalLines(lineItems);
    if (!analysis.hasEligibleItems) {
      setNoLinesError(
        "No eligible lines to save. This proposal contains only custom lines, which cannot be stored in a package."
      );
      return;
    }
    setSaveAnalysis(analysis);
    setSaveDialogOpen(true);
  }

  function handleSaved(pkg: PackageRow) {
    // Append the new package to the local list (no reload needed)
    setPackages((prev) => (prev ? [...prev, pkg] : [pkg]));
    setSaveDialogOpen(false);
    setSaveAnalysis(null);
    onPackageSaved?.(pkg);
  }

  const insertedCount = insertedPackageIds.size;

  // Can the signed-in user write packages?
  const canSave = !meLoading && meRole !== null && canWritePackages(meRole);
  // Show the save section only when lineItems were provided (parent opted in)
  const showSaveSection = lineItems !== undefined && canSave;

  return (
    <>
      <div
        className="rounded-lg border overflow-hidden"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        {/* Header / toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-left transition-colors hover:opacity-80"
          style={{
            background: "var(--rtm-bg)",
            borderBottom: open ? "1px solid var(--rtm-border)" : undefined,
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Packages
            </span>
            {insertedCount > 0 && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  borderColor: "#BFDBFE",
                }}
              >
                {insertedCount} inserted
              </span>
            )}
          </div>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            {open ? "Hide" : "Browse packages"}
          </span>
        </button>

        {open && (
          <div className="p-4 space-y-3" style={{ background: "var(--rtm-surface)" }}>

            {/* Error state */}
            {fetchError && (
              <div
                className="rounded-lg border px-4 py-3"
                style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
              >
                <p className="text-sm font-semibold" style={{ color: "#DC2626" }}>
                  Failed to load packages.
                </p>
                <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{fetchError}</p>
              </div>
            )}

            {/* Loading */}
            {!fetchError && packages === null && (
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                Loading packages…
              </p>
            )}

            {/* Empty state */}
            {!fetchError && packages !== null && packages.length === 0 && (
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                No active packages. Create packages in Settings → Packages.
              </p>
            )}

            {/* Package list */}
            {!fetchError && packages !== null && packages.length > 0 && (
              <div className="space-y-2">
                {packages.map((pkg) => {
                  const inserted     = insertedPackageIds.has(pkg.id);
                  const serviceCount = pkg.items.length;

                  return (
                    <div
                      key={pkg.id}
                      className="rounded-lg border flex items-center justify-between gap-4 px-4 py-3"
                      style={{
                        borderColor: inserted ? "#BFDBFE" : "var(--rtm-border)",
                        background:  inserted ? "#EFF6FF" : "var(--rtm-bg)",
                      }}
                    >
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: "var(--rtm-text-primary)" }}
                        >
                          {pkg.name}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--rtm-text-muted)" }}
                        >
                          {formatUSD(pkg.price)}{" "}
                          <span style={{ color: "var(--rtm-text-secondary)" }}>
                            {pkg.billingFrequency}
                          </span>
                          {" · "}
                          {serviceCount} service{serviceCount !== 1 ? "s" : ""}
                        </p>
                        {pkg.description && (
                          <p
                            className="text-xs mt-0.5 truncate"
                            style={{ color: "var(--rtm-text-muted)" }}
                          >
                            {pkg.description}
                          </p>
                        )}
                      </div>

                      {/* Insert / Remove button */}
                      {inserted ? (
                        <button
                          type="button"
                          onClick={() => onRemove(pkg.id)}
                          className="shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:opacity-80"
                          style={{
                            background:   "#EFF6FF",
                            borderColor:  "#BFDBFE",
                            color:        "#1D4ED8",
                          }}
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleInsert(pkg)}
                          className="shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:opacity-80"
                          style={{
                            background:   "var(--rtm-accent)",
                            borderColor:  "var(--rtm-accent)",
                            color:        "#fff",
                          }}
                        >
                          Insert
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hint */}
            {!fetchError && packages !== null && packages.length > 0 && (
              <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
                Inserting a package appends service lines at catalogue prices plus a discount line.
                All lines stay editable; changes are not retroactively reflected in the package definition.
              </p>
            )}

            {/* ─── Save As Package — foot of picker, Manager+ only ───────────────── */}
            {showSaveSection && (
              <div
                className="mt-1 pt-3 border-t"
                style={{ borderColor: "var(--rtm-border)" }}
              >
                {noLinesError && (
                  <p className="text-xs mb-2 font-semibold" style={{ color: "#DC2626" }}>
                    {noLinesError}
                  </p>
                )}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
                    Save this proposal&apos;s current lines as a reusable package.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenSaveDialog}
                    className="shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:opacity-80"
                    style={{
                      background:  "var(--rtm-bg)",
                      borderColor: "var(--rtm-border)",
                      color:       "var(--rtm-text-secondary)",
                    }}
                  >
                    Save as Package
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save-As-Package Dialog (portal-free; z-50 overlay) */}
      {saveDialogOpen && saveAnalysis && (
        <SaveAsPackageDialog
          analysis={saveAnalysis}
          onClose={() => { setSaveDialogOpen(false); setSaveAnalysis(null); }}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
