"use client";

import React, { useState } from "react";
import {
  BUDGET_VIEW_LABELS,
  DISCOUNT_TYPE_OPTIONS,
  DISCOUNT_SUGGESTIONS,
  MAX_DISCOUNT_PERCENTAGE,
  MAX_FLAT_DISCOUNT_MONTHLY,
  MAX_FLAT_DISCOUNT_SETUP,
  type BudgetView,
} from "@/lib/sales/budget-config";
import { computeDiscountedSummary, type BudgetResult } from "@/lib/sales/budget-engine";
import type { ProposalDiscount, DiscountType } from "@/lib/sales/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function isPercentageType(type: DiscountType): boolean {
  return type === "percentage-monthly" || type === "percentage-setup";
}

function isFlatType(type: DiscountType): boolean {
  return type === "flat-monthly" || type === "flat-setup" || type === "custom";
}

function maxForType(type: DiscountType): number {
  if (type === "flat-monthly") return MAX_FLAT_DISCOUNT_MONTHLY;
  if (type === "flat-setup") return MAX_FLAT_DISCOUNT_SETUP;
  if (type === "custom") return MAX_FLAT_DISCOUNT_MONTHLY;
  return MAX_DISCOUNT_PERCENTAGE;
}

function discountTypeLabel(type: DiscountType): string {
  return DISCOUNT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BudgetSummaryPanelProps {
  budgetResult: BudgetResult;
  activeView: BudgetView;
  discount: ProposalDiscount;
  onDiscountChange: (discount: ProposalDiscount) => void;
}

// ─── Discount Section ─────────────────────────────────────────────────────────

interface DiscountSectionProps {
  discount: ProposalDiscount;
  onChange: (discount: ProposalDiscount) => void;
  totalMonthlyRecurring: number;
  totalSetupFees: number;
}

function DiscountSection({
  discount,
  onChange,
  totalMonthlyRecurring,
  totalSetupFees,
}: DiscountSectionProps) {
  const hasDiscount = discount.type !== "none" && discount.value > 0;
  const [open, setOpen] = useState<boolean>(hasDiscount);

  function patch(partial: Partial<ProposalDiscount>) {
    onChange({ ...discount, ...partial });
  }

  const isPercentage = isPercentageType(discount.type);
  const isFlat = isFlatType(discount.type);
  const valueMax = maxForType(discount.type);
  const showValue = discount.type !== "none";

  // Recomputed live summary for the preview row
  const summary =
    discount.type !== "none" && discount.value > 0
      ? computeDiscountedSummary(totalMonthlyRecurring, totalSetupFees, discount)
      : null;

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
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Discount
          {hasDiscount && discount.label && (
            <span
              className="ml-2 normal-case font-semibold"
              style={{ color: "#059669" }}
            >
              — {discount.label}
            </span>
          )}
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          {open ? "Hide" : "Show"}
        </span>
      </button>

      {open && (
        <div className="p-5 space-y-4" style={{ background: "var(--rtm-surface)" }}>
          {/* Discount Type */}
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "var(--rtm-text-secondary)" }}
            >
              Discount Type
            </label>
            <select
              value={discount.type}
              onChange={(e) =>
                patch({ type: e.target.value as DiscountType, value: 0, label: "" })
              }
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{
                background: "var(--rtm-bg)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            >
              {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {discount.type !== "none" && (
              <p
                className="text-[11px] mt-1"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                {DISCOUNT_TYPE_OPTIONS.find((o) => o.value === discount.type)?.description}
              </p>
            )}
          </div>

          {showValue && (
            <>
              {/* Discount Value */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--rtm-text-secondary)" }}
                >
                  Discount Value
                </label>
                <div className="flex items-center gap-0">
                  {isFlat && (
                    <span
                      className="px-3 py-2 rounded-l-lg border border-r-0 text-sm font-semibold"
                      style={{
                        background: "var(--rtm-bg)",
                        borderColor: "var(--rtm-border)",
                        color: "var(--rtm-text-muted)",
                      }}
                    >
                      $
                    </span>
                  )}
                  <input
                    type="number"
                    min={0}
                    max={valueMax}
                    step={isPercentage ? 1 : 10}
                    value={discount.value === 0 ? "" : discount.value}
                    placeholder={isPercentage ? "e.g. 10" : "e.g. 200"}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);
                      patch({ value: isNaN(raw) ? 0 : Math.max(0, raw) });
                    }}
                    className="flex-1 px-3 py-2 border text-sm outline-none"
                    style={{
                      background: "var(--rtm-bg)",
                      borderColor: "var(--rtm-border)",
                      color: "var(--rtm-text-primary)",
                      borderRadius: isFlat
                        ? isPercentage
                          ? "0.5rem"
                          : "0 0.5rem 0.5rem 0"
                        : isPercentage
                        ? "0.5rem 0 0 0.5rem"
                        : "0.5rem",
                    }}
                  />
                  {isPercentage && (
                    <span
                      className="px-3 py-2 rounded-r-lg border border-l-0 text-sm font-semibold"
                      style={{
                        background: "var(--rtm-bg)",
                        borderColor: "var(--rtm-border)",
                        color: "var(--rtm-text-muted)",
                      }}
                    >
                      %
                    </span>
                  )}
                </div>
                <p
                  className="text-[11px] mt-1"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {isPercentage
                    ? `Max ${MAX_DISCOUNT_PERCENTAGE}%`
                    : discount.type === "flat-setup"
                    ? `Max ${formatUSD(MAX_FLAT_DISCOUNT_SETUP)}`
                    : `Max ${formatUSD(MAX_FLAT_DISCOUNT_MONTHLY)}`}
                </p>
              </div>

              {/* Discount Label */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--rtm-text-secondary)" }}
                >
                  Discount Label{" "}
                  <span style={{ color: "var(--rtm-text-muted)", fontWeight: 400 }}>
                    — shown on proposal
                  </span>
                </label>
                <input
                  type="text"
                  value={discount.label}
                  placeholder="e.g. New Client Discount"
                  onChange={(e) => patch({ label: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{
                    background: "var(--rtm-bg)",
                    borderColor: "var(--rtm-border)",
                    color: "var(--rtm-text-primary)",
                  }}
                />
                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {DISCOUNT_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => patch({ label: suggestion })}
                      className="px-2 py-0.5 rounded-md border text-[11px] font-medium transition-all hover:opacity-80"
                      style={{
                        background:
                          discount.label === suggestion
                            ? "#DCFCE7"
                            : "var(--rtm-bg)",
                        borderColor:
                          discount.label === suggestion
                            ? "#86EFAC"
                            : "var(--rtm-border)",
                        color:
                          discount.label === suggestion
                            ? "#15803D"
                            : "var(--rtm-text-muted)",
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Authorization Note */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--rtm-text-secondary)" }}
                >
                  Authorization Note{" "}
                  <span
                    className="font-normal text-[10px]"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    Internal only — not shown on proposal
                  </span>
                </label>
                <input
                  type="text"
                  value={discount.authorizationNote}
                  placeholder="e.g. Approved by Jordan M."
                  onChange={(e) => patch({ authorizationNote: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{
                    background: "var(--rtm-bg)",
                    borderColor: "var(--rtm-border)",
                    color: "var(--rtm-text-primary)",
                  }}
                />
              </div>
            </>
          )}

          {/* Live discount preview line */}
          {summary && (summary.discountAmountMonthly > 0 || summary.discountAmountSetup > 0) && (
            <div
              className="rounded-lg border px-4 py-3 space-y-1"
              style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
            >
              {summary.discountAmountMonthly > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold" style={{ color: "#15803D" }}>
                    Monthly savings ({discount.label || discountTypeLabel(discount.type)})
                  </span>
                  <span className="text-sm font-bold" style={{ color: "#15803D" }}>
                    -{formatUSD(summary.discountAmountMonthly)}/mo
                  </span>
                </div>
              )}
              {summary.discountAmountSetup > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold" style={{ color: "#15803D" }}>
                    Setup savings ({discount.label || discountTypeLabel(discount.type)})
                  </span>
                  <span className="text-sm font-bold" style={{ color: "#15803D" }}>
                    -{formatUSD(summary.discountAmountSetup)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BudgetSummaryPanel({
  budgetResult,
  activeView,
  discount,
  onDiscountChange,
}: BudgetSummaryPanelProps) {
  const {
    lineItems,
    totalMonthlyRecurring,
    totalSetupFees,
    totalOneTimeProjects,
  } = budgetResult;

  // Compute discounted summary live
  const discounted = computeDiscountedSummary(
    totalMonthlyRecurring,
    totalSetupFees,
    discount
  );

  const hasDiscount =
    discount.type !== "none" &&
    discount.value > 0 &&
    (discounted.discountAmountMonthly > 0 || discounted.discountAmountSetup > 0);

  // Grand totals (discount applied to recurring + setup; one-time projects not discounted)
  const grandTotalFirstMonth = discounted.discountedMonthly + discounted.discountedSetup + totalOneTimeProjects;
  const grandTotalMonthly = discounted.discountedMonthly;

  // ─── By Service View ───────────────────────────────────────────────────────

  if (activeView === "byService") {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          {BUDGET_VIEW_LABELS.byService}
        </h2>

        {lineItems.length === 0 ? (
          <div
            className="rounded-lg border p-6 text-center"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
              No services added. Add services above to view breakdown.
            </p>
          </div>
        ) : (
          <>
            {/* Per-service cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {lineItems.map((item) => (
                <div
                  key={item.serviceId}
                  className="rounded-lg border p-4"
                  style={{
                    background: "var(--rtm-surface)",
                    borderColor: "var(--rtm-border)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        {item.department}
                      </p>
                    </div>
                    {!item.isRecurring && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{
                          background: "var(--rtm-bg)",
                          color: "var(--rtm-text-muted)",
                          border: "1px solid var(--rtm-border)",
                        }}
                      >
                        One-Time
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                        Quantity
                      </span>
                      <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                        {item.quantity}
                      </span>
                    </div>

                    {item.isRecurring && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                          Monthly Subtotal
                        </span>
                        <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                          {formatUSD(item.monthlySubtotal)}
                        </span>
                      </div>
                    )}

                    {item.setupSubtotal > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                          {item.isRecurring ? "Setup Fee" : "Project Fee"}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
                          {formatUSD(item.setupSubtotal)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Budget Summary */}
            <div
              className="rounded-lg border"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
              }}
            >
              <div className="px-5 py-3 border-b" style={{ borderColor: "var(--rtm-border)" }}>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>
                  Budget Summary
                </h3>
              </div>

              <div className="divide-y" style={{ borderColor: "var(--rtm-border)" }}>
                {/* Base totals */}
                <div className="flex justify-between items-center px-5 py-3">
                  <span className="text-sm" style={{ color: "var(--rtm-text-secondary)", fontWeight: 500 }}>
                    Total Monthly Recurring
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {formatUSD(totalMonthlyRecurring)}
                  </span>
                </div>

                <div className="flex justify-between items-center px-5 py-3">
                  <span className="text-sm" style={{ color: "var(--rtm-text-secondary)", fontWeight: 500 }}>
                    Total Setup Fees
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {formatUSD(totalSetupFees)}
                  </span>
                </div>

                {totalOneTimeProjects > 0 && (
                  <div className="flex justify-between items-center px-5 py-3">
                    <span className="text-sm" style={{ color: "var(--rtm-text-secondary)", fontWeight: 500 }}>
                      Total One-Time Projects
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                      {formatUSD(totalOneTimeProjects)}
                    </span>
                  </div>
                )}

                {/* Discount row */}
                {hasDiscount && discounted.discountAmountMonthly > 0 && (
                  <div className="flex justify-between items-center px-5 py-3">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#059669" }}
                    >
                      Discount
                      {discount.label && (
                        <span className="font-normal"> — {discount.label}</span>
                      )}
                      <span className="ml-1 text-xs font-normal" style={{ color: "#16A34A" }}>
                        ({discountTypeLabel(discount.type)})
                      </span>
                    </span>
                    <span className="text-sm font-bold" style={{ color: "#059669" }}>
                      -{formatUSD(discounted.discountAmountMonthly)}/mo
                    </span>
                  </div>
                )}

                {hasDiscount && discounted.discountAmountSetup > 0 && (
                  <div className="flex justify-between items-center px-5 py-3">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#059669" }}
                    >
                      Setup Discount
                      {discount.label && (
                        <span className="font-normal"> — {discount.label}</span>
                      )}
                      <span className="ml-1 text-xs font-normal" style={{ color: "#16A34A" }}>
                        ({discountTypeLabel(discount.type)})
                      </span>
                    </span>
                    <span className="text-sm font-bold" style={{ color: "#059669" }}>
                      -{formatUSD(discounted.discountAmountSetup)}
                    </span>
                  </div>
                )}

                {/* Divider before final totals */}
                {hasDiscount && (
                  <>
                    {discounted.discountAmountMonthly > 0 && (
                      <div className="flex justify-between items-center px-5 py-3">
                        <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                          Discounted Monthly
                        </span>
                        <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                          {formatUSD(discounted.discountedMonthly)}
                        </span>
                      </div>
                    )}
                    {discounted.discountAmountSetup > 0 && (
                      <div className="flex justify-between items-center px-5 py-3">
                        <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                          Discounted Setup
                        </span>
                        <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                          {formatUSD(discounted.discountedSetup)}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Grand totals */}
                <div className="flex justify-between items-center px-5 py-3">
                  <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                    Grand Total — First Month
                  </span>
                  <span className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
                    {formatUSD(grandTotalFirstMonth)}
                  </span>
                </div>

                <div className="flex justify-between items-center px-5 py-3">
                  <span className="text-sm" style={{ color: "var(--rtm-text-secondary)", fontWeight: 500 }}>
                    Grand Total — Monthly (Month 2+)
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {formatUSD(grandTotalMonthly)}
                  </span>
                </div>
              </div>
            </div>

            {/* Discount section */}
            <DiscountSection
              discount={discount}
              onChange={onDiscountChange}
              totalMonthlyRecurring={totalMonthlyRecurring}
              totalSetupFees={totalSetupFees}
            />
          </>
        )}
      </div>
    );
  }

  // ─── Package Total View ─────────────────────────────────────────────────────

  // ── By-department breakdown for Package Total view ─────────────────────────
  const departmentGroups = React.useMemo(() => {
    const map = new Map<string, { monthly: number; setup: number; oneTime: number }>();
    for (const item of lineItems) {
      const existing = map.get(item.department) ?? { monthly: 0, setup: 0, oneTime: 0 };
      if (item.isRecurring) {
        map.set(item.department, {
          ...existing,
          monthly: existing.monthly + item.monthlySubtotal,
          setup: existing.setup + item.setupSubtotal,
        });
      } else {
        map.set(item.department, {
          ...existing,
          oneTime: existing.oneTime + item.setupSubtotal,
        });
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1].monthly - a[1].monthly);
  }, [lineItems]);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
        {BUDGET_VIEW_LABELS.packageTotal}
      </h2>

      {lineItems.length === 0 ? (
        <div
          className="rounded-lg border p-6 text-center"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            No services added. Add services above to view the package total.
          </p>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recurring / Monthly block */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
          }}
        >
          <div
            className="px-5 py-3 border-b"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>
              Recurring Monthly Services
            </p>
          </div>
          <div className="p-5 space-y-4">
            {/* Recurring breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                  Base Monthly
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                  {formatUSD(totalMonthlyRecurring)}
                </span>
              </div>

              {hasDiscount && discounted.discountAmountMonthly > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "#059669" }}>
                    {discount.label || discountTypeLabel(discount.type)}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "#059669" }}>
                    -{formatUSD(discounted.discountAmountMonthly)}
                  </span>
                </div>
              )}

              <div
                className="flex justify-between items-center pt-2 border-t"
                style={{ borderColor: "var(--rtm-border)" }}
              >
                <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                  Discounted Monthly
                </span>
                <span className="text-lg font-black" style={{ color: "var(--rtm-text-primary)" }}>
                  {formatUSD(discounted.discountedMonthly)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* One-time / Setup block */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
          }}
        >
          <div
            className="px-5 py-3 border-b"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>
              Setup and One-Time Fees
            </p>
          </div>
          <div className="p-5 space-y-2">
            {totalSetupFees > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                  Setup Fees
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                  {formatUSD(totalSetupFees)}
                </span>
              </div>
            )}

            {hasDiscount && discounted.discountAmountSetup > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "#059669" }}>
                  {discount.label || discountTypeLabel(discount.type)}
                </span>
                <span className="text-sm font-semibold" style={{ color: "#059669" }}>
                  -{formatUSD(discounted.discountAmountSetup)}
                </span>
              </div>
            )}

            {hasDiscount && discounted.discountAmountSetup > 0 && (
              <div
                className="flex justify-between items-center pt-2 border-t"
                style={{ borderColor: "var(--rtm-border)" }}
              >
                <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                  Discounted Setup
                </span>
                <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                  {formatUSD(discounted.discountedSetup)}
                </span>
              </div>
            )}

            {totalOneTimeProjects > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                  One-Time Projects
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                  {formatUSD(totalOneTimeProjects)}
                </span>
              </div>
            )}

            {totalSetupFees === 0 && totalOneTimeProjects === 0 && (
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                No setup or one-time fees.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Grand Total First Month */}
      <div
        className="rounded-lg border p-5"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider mb-0.5"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Grand Total — First Month
            </p>
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Discounted recurring + all setup and one-time fees
            </p>
          </div>
          <p
            className="text-3xl font-black"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {formatUSD(grandTotalFirstMonth)}
          </p>
        </div>

        {hasDiscount && (discounted.discountAmountMonthly > 0 || discounted.discountAmountSetup > 0) && (
          <div
            className="mt-3 pt-3 border-t flex items-center justify-between"
            style={{ borderColor: "var(--rtm-border)" }}
          >
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Before discount
            </span>
            <span
              className="text-sm font-semibold line-through"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {formatUSD(totalMonthlyRecurring + totalSetupFees + totalOneTimeProjects)}
            </span>
          </div>
        )}
      </div>

      {/* Department breakdown */}
      {departmentGroups.length > 0 && (
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
          }}
        >
          <div
            className="px-5 py-3 border-b"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              By Department
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--rtm-border)" }}>
            {departmentGroups.map(([dept, totals]) => (
              <div
                key={dept}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--rtm-text-primary)" }}
                  >
                    {dept}
                  </p>
                  {(totals.setup > 0 || totals.oneTime > 0) && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {totals.setup > 0 && `${formatUSD(totals.setup)} setup`}
                      {totals.setup > 0 && totals.oneTime > 0 && " · "}
                      {totals.oneTime > 0 && `${formatUSD(totals.oneTime)} one-time`}
                    </p>
                  )}
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--rtm-text-primary)" }}
                >
                  {totals.monthly > 0
                    ? formatUSD(totals.monthly) + "/mo"
                    : formatUSD(totals.setup + totals.oneTime) + " one-time"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discount section */}
      <DiscountSection
        discount={discount}
        onChange={onDiscountChange}
        totalMonthlyRecurring={totalMonthlyRecurring}
        totalSetupFees={totalSetupFees}
      />
        </>
      )}
    </div>
  );
}
