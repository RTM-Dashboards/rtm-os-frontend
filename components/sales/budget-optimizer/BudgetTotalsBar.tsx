"use client";

import React from "react";
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

interface BudgetTotalsBarProps {
  budgetResult: BudgetResult;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BudgetTotalsBar({ budgetResult }: BudgetTotalsBarProps) {
  const {
    grandTotalMonthly,
    totalSetupFees,
    totalOneTimeProjects,
    grandTotalFirstMonth,
    serviceCount,
    departmentCount,
    discountedMonthly,
    discountAmount,
  } = budgetResult;

  const oneTimeFees = totalSetupFees + totalOneTimeProjects;
  const hasDiscount = discountAmount > 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        boxShadow: "0 -4px 16px 0 rgba(0,0,0,0.08)",
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 py-3">
        <div className="flex items-center gap-6 flex-wrap justify-between">
          {/* Left: metrics */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Services
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {serviceCount}
              </span>
            </div>

            <div
              className="w-px h-5"
              style={{ background: "var(--rtm-border)" }}
            />

            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Departments
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {departmentCount}
              </span>
            </div>

            <div
              className="w-px h-5"
              style={{ background: "var(--rtm-border)" }}
            />

            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Monthly Recurring
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {hasDiscount ? (
                  <>
                    <span
                      className="line-through mr-1.5"
                      style={{ color: "var(--rtm-text-muted)", fontWeight: 500 }}
                    >
                      {formatUSD(grandTotalMonthly)}
                    </span>
                    {formatUSD(discountedMonthly)}
                  </>
                ) : (
                  formatUSD(grandTotalMonthly)
                )}
              </span>
            </div>

            <div
              className="w-px h-5"
              style={{ background: "var(--rtm-border)" }}
            />

            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Setup and One-Time
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {formatUSD(oneTimeFees)}
              </span>
            </div>
          </div>

          {/* Right: grand total */}
          <div className="flex items-center gap-3">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider text-right"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Grand Total — First Month
              </p>
            </div>
            <p
              className="text-xl font-black"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {formatUSD(grandTotalFirstMonth)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
