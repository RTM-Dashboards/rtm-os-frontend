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

import React, { useEffect, useState } from "react";
import type { BudgetServiceDefinition } from "@/lib/sales/budget-config";
import { buildPackageLineItems } from "@/lib/sales/budget-engine";
import type { BudgetLineItem } from "@/lib/sales/budget-engine";

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

// ─── PackagePicker ─────────────────────────────────────────────────────────────

export function PackagePicker({
  insertedPackageIds,
  catalogLookup,
  onInsert,
  onRemove,
}: PackagePickerProps) {
  const [packages, setPackages] = useState<PackageRow[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
    return () => { cancelled = true; };
  }, []);

  function handleInsert(pkg: PackageRow) {
    const lines = buildPackageLineItems(pkg, catalogLookup);
    onInsert(lines, pkg);
  }

  const insertedCount = insertedPackageIds.size;

  return (
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
        </div>
      )}
    </div>
  );
}
