"use client";

import React from "react";
import {
  DISCOUNT_TIERS,
  BUDGET_VIEW_LABELS,
  type BudgetView,
} from "@/lib/sales/budget-config";
import type { BudgetResult } from "@/lib/sales/budget-engine";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BudgetSummaryPanelProps {
  budgetResult: BudgetResult;
  activeView: BudgetView;
  discountPercentage: number;
  onDiscountChange: (percentage: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BudgetSummaryPanel({
  budgetResult,
  activeView,
  discountPercentage,
  onDiscountChange,
}: BudgetSummaryPanelProps) {
  const {
    lineItems,
    totalMonthlyRecurring,
    totalSetupFees,
    totalOneTimeProjects,
    grandTotalFirstMonth,
    grandTotalMonthly,
    discountAmount,
    discountedFirstMonth,
    discountedMonthly,
  } = budgetResult;

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

            {/* Summary totals */}
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
                {[
                  {
                    label: "Total Monthly Recurring",
                    value: formatUSD(totalMonthlyRecurring),
                    bold: false,
                  },
                  {
                    label: "Total Setup Fees",
                    value: formatUSD(totalSetupFees),
                    bold: false,
                  },
                  ...(totalOneTimeProjects > 0
                    ? [
                        {
                          label: "Total One-Time Projects",
                          value: formatUSD(totalOneTimeProjects),
                          bold: false,
                        },
                      ]
                    : []),
                  {
                    label: "Grand Total — First Month",
                    value: formatUSD(grandTotalFirstMonth),
                    bold: true,
                  },
                  {
                    label: "Grand Total — Monthly (Month 2+)",
                    value: formatUSD(grandTotalMonthly),
                    bold: false,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center px-5 py-3"
                  >
                    <span
                      className="text-sm"
                      style={{
                        color: row.bold
                          ? "var(--rtm-text-primary)"
                          : "var(--rtm-text-secondary)",
                        fontWeight: row.bold ? 700 : 500,
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--rtm-text-primary)",
                        fontWeight: row.bold ? 800 : 600,
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── Package Total View ─────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
        {BUDGET_VIEW_LABELS.packageTotal}
      </h2>

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
            {/* Discount selector */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "var(--rtm-text-secondary)" }}
              >
                Discount
              </label>
              <select
                value={discountPercentage}
                onChange={(e) => onDiscountChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: "var(--rtm-border)",
                  color: "var(--rtm-text-primary)",
                }}
              >
                {DISCOUNT_TIERS.map((tier) => (
                  <option key={tier.percentage} value={tier.percentage}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

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

              {discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--color-success, #059669)" }}>
                    Discount ({discountPercentage}%)
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--color-success, #059669)" }}>
                    -{formatUSD(discountAmount)}
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
                  {formatUSD(discountedMonthly)}
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
            <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Not subject to discount
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
            {formatUSD(discountedFirstMonth)}
          </p>
        </div>

        {discountAmount > 0 && (
          <div
            className="mt-3 pt-3 border-t flex items-center justify-between"
            style={{ borderColor: "var(--rtm-border)" }}
          >
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Without discount
            </span>
            <span
              className="text-sm font-semibold line-through"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {formatUSD(grandTotalFirstMonth)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
