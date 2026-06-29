"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  BUDGET_VIEW_LABELS,
  type BudgetView,
  type BudgetServiceId,
  type BudgetServiceDefinition,
} from "@/lib/sales/budget-config";
import {
  buildLineItemsFromRecommendations,
  buildLineItemFromService,
  computeBudget,
  getAvailableServices,
  type BudgetLineItem,
  type BudgetResult,
} from "@/lib/sales/budget-engine";
import { ServiceAllocationTable } from "./ServiceAllocationTable";
import { BudgetSummaryPanel } from "./BudgetSummaryPanel";
import { BudgetTotalsBar } from "./BudgetTotalsBar";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BudgetOptimizerShellProps {
  recommendedServiceLabels?: string[];
  clientName?: string;
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function BudgetOptimizerShell({
  recommendedServiceLabels,
  clientName,
}: BudgetOptimizerShellProps) {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>([]);
  const [activeView, setActiveView] = useState<BudgetView>("byService");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  // ─── Bootstrap from recommendations ───────────────────────────────────────
  useEffect(() => {
    if (recommendedServiceLabels && recommendedServiceLabels.length > 0) {
      setLineItems(buildLineItemsFromRecommendations(recommendedServiceLabels));
    }
  }, []);

  // ─── Derived values ─────────────────────────────────────────────────────────
  const budgetResult: BudgetResult = useMemo(
    () => computeBudget(lineItems, discountPercentage),
    [lineItems, discountPercentage]
  );

  const availableServices: BudgetServiceDefinition[] = useMemo(
    () => getAvailableServices(lineItems.map((i) => i.serviceId)),
    [lineItems]
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleAddService(serviceId: BudgetServiceId) {
    const newItem = buildLineItemFromService(serviceId);
    setLineItems((prev) => [...prev, newItem]);
  }

  function handleRemoveService(serviceId: BudgetServiceId) {
    setLineItems((prev) => prev.filter((i) => i.serviceId !== serviceId));
  }

  function handleUpdateLineItem(
    serviceId: BudgetServiceId,
    changes: Partial<
      Pick<BudgetLineItem, "quantity" | "unitMonthlyPrice" | "setupFee">
    >
  ) {
    const updated = buildLineItemFromService(serviceId, changes);
    setLineItems((prev) =>
      prev.map((i) => (i.serviceId === serviceId ? updated : i))
    );
  }

  function handleDiscountChange(percentage: number) {
    setDiscountPercentage(percentage);
  }

  function handleViewToggle(view: BudgetView) {
    setActiveView(view);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-28">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--rtm-accent)" }}
          >
            Sales
          </p>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Budget Optimizer
            {clientName && (
              <span
                className="ml-3 text-base font-semibold"
                style={{ color: "var(--rtm-text-secondary)" }}
              >
                — {clientName}
              </span>
            )}
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--rtm-text-secondary)" }}
          >
            Build and refine the service budget. Adjust services, quantities,
            and pricing before generating a proposal.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            href="/sales/recommendations"
            className="px-4 py-2 rounded-lg font-semibold text-sm border"
            style={{
              background: "var(--rtm-surface)",
              color: "var(--rtm-text-secondary)",
              borderColor: "var(--rtm-border)",
            }}
          >
            Recommendations
          </Link>
          <Link
            href="/sales/proposals"
            className="px-4 py-2 rounded-lg font-bold text-sm"
            style={{ background: "var(--rtm-accent)", color: "#fff" }}
          >
            Continue to Proposal Builder
          </Link>
        </div>
      </div>

      {/* ── Workflow Breadcrumb ───────────────────────────────────────────── */}
      <div
        className="rounded-lg border p-3"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-2"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Sales Workflow
        </p>
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { label: "Sales Intake", href: "/sales/intake" },
            { label: "Goal Selection", href: "/sales/goal-selection" },
            { label: "Audit", href: "/sales/audits" },
            { label: "Audit Report", href: "/sales/audit-report" },
            { label: "Recommendations", href: "/sales/recommendations" },
            { label: "Budget Optimizer", href: "/sales/budget-optimizer" },
            { label: "Proposal Builder", href: "/sales/proposals" },
          ].map((step, i, arr) => {
            const isCurrent = step.label === "Budget Optimizer";
            const isDone = i < 5;
            return (
              <React.Fragment key={step.label}>
                <Link
                  href={step.href}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded"
                  style={{
                    background: isCurrent
                      ? "var(--rtm-accent)"
                      : isDone
                      ? "var(--rtm-bg)"
                      : "transparent",
                    color: isCurrent
                      ? "#fff"
                      : isDone
                      ? "var(--rtm-text-secondary)"
                      : "var(--rtm-text-muted)",
                    textDecoration: "none",
                  }}
                >
                  {step.label}
                </Link>
                {i < arr.length - 1 && (
                  <span
                    className="text-xs"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    /
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── View Toggle ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border rounded-lg p-1 w-fit"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        {(Object.keys(BUDGET_VIEW_LABELS) as BudgetView[]).map((view) => (
          <button
            key={view}
            onClick={() => handleViewToggle(view)}
            className="px-4 py-1.5 rounded-md text-sm font-semibold transition-all"
            style={{
              background:
                activeView === view ? "var(--rtm-accent)" : "transparent",
              color:
                activeView === view ? "#fff" : "var(--rtm-text-secondary)",
            }}
          >
            {BUDGET_VIEW_LABELS[view]}
          </button>
        ))}
      </div>

      {/* ── Service Allocation Table ──────────────────────────────────────── */}
      <ServiceAllocationTable
        lineItems={lineItems}
        onUpdate={handleUpdateLineItem}
        onRemove={handleRemoveService}
        onAdd={handleAddService}
        availableServices={availableServices}
      />

      {/* ── Budget Summary Panel ──────────────────────────────────────────── */}
      <BudgetSummaryPanel
        budgetResult={budgetResult}
        activeView={activeView}
        discountPercentage={discountPercentage}
        onDiscountChange={handleDiscountChange}
      />

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <div
        className="rounded-lg border p-5 flex items-center justify-between gap-4 flex-wrap"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <div>
          <p
            className="text-sm font-bold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Ready to build the proposal?
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--rtm-text-secondary)" }}
          >
            The services and pricing configured here will carry forward into the
            Proposal Builder.
          </p>
        </div>
        <Link
          href="/sales/proposals"
          className="px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap"
          style={{ background: "var(--rtm-accent)", color: "#fff" }}
        >
          Continue to Proposal Builder
        </Link>
      </div>

      {/* ── Sticky Totals Bar ─────────────────────────────────────────────── */}
      <BudgetTotalsBar budgetResult={budgetResult} />
    </div>
  );
}
