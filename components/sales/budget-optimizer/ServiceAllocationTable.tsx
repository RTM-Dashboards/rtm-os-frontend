"use client";

import React, { useState, useCallback } from "react";
import {
  getBudgetServiceById,
  type BudgetServiceId,
  type BudgetServiceDefinition,
} from "@/lib/sales/budget-config";
import { getServiceLineItems } from "@/lib/sales/recommendation-config";
import {
  computeLineItemSubtotal,
  type BudgetLineItem,
} from "@/lib/sales/budget-engine";
import type { ServiceLineItem } from "@/lib/sales/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** Per-service map of lineItemId → selected quantity. */
export type LineItemQuantities = Record<string, Record<string, number>>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ServiceAllocationTableProps {
  lineItems: BudgetLineItem[];
  lineItemQuantities: LineItemQuantities;
  onUpdate: (
    serviceId: BudgetServiceId,
    changes: Partial<
      Pick<BudgetLineItem, "quantity" | "unitMonthlyPrice" | "setupFee">
    >
  ) => void;
  onRemove: (serviceId: BudgetServiceId) => void;
  onAdd: (serviceId: BudgetServiceId) => void;
  onLineItemQuantityChange: (
    serviceId: BudgetServiceId,
    lineItemId: string,
    quantity: number
  ) => void;
  availableServices: BudgetServiceDefinition[];
}

// ─── Chevron icon ─────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 150ms ease",
        flexShrink: 0,
      }}
    >
      <path
        d="M5 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Line Item Sub-Row ────────────────────────────────────────────────────────

interface LineItemRowProps {
  lineItem: ServiceLineItem;
  quantity: number;
  onChange: (lineItemId: string, quantity: number) => void;
}

function LineItemRow({ lineItem, quantity, onChange }: LineItemRowProps) {
  const subtotal = computeLineItemSubtotal(lineItem, quantity);
  const isLocked = lineItem.isIncludedFlat;

  return (
    <tr
      style={{
        background: "var(--rtm-bg)",
        borderBottom: "1px solid var(--rtm-border)",
      }}
    >
      {/* Indent + name */}
      <td className="pl-10 pr-4 py-2.5" colSpan={1}>
        <div>
          <p
            className="text-xs font-medium"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {lineItem.name}
          </p>
          {lineItem.description && (
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {lineItem.description}
            </p>
          )}
        </div>
      </td>

      {/* Unit label */}
      <td className="px-4 py-2.5">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded"
          style={{
            background: "var(--rtm-surface)",
            color: "var(--rtm-text-muted)",
            border: "1px solid var(--rtm-border)",
          }}
        >
          {isLocked ? "included" : lineItem.unitLabel}
        </span>
      </td>

      {/* Quantity input */}
      <td className="px-4 py-2.5">
        {isLocked ? (
          <input
            type="number"
            value={1}
            disabled
            className="px-2 py-1 rounded border text-xs outline-none w-16 opacity-50 cursor-not-allowed"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-muted)",
            }}
          />
        ) : (
          <input
            type="number"
            value={quantity}
            min={lineItem.minQuantity}
            max={lineItem.maxQuantity}
            step={1}
            onChange={(e) => {
              const raw = parseInt(e.target.value, 10);
              if (isNaN(raw)) return;
              const clamped = Math.max(
                lineItem.minQuantity,
                Math.min(lineItem.maxQuantity, raw)
              );
              onChange(lineItem.id, clamped);
            }}
            className="px-2 py-1 rounded border text-xs outline-none w-16"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-accent)",
              color: "var(--rtm-text-primary)",
            }}
          />
        )}
      </td>

      {/* Unit price */}
      <td className="px-4 py-2.5">
        <span
          className="text-xs"
          style={{ color: "var(--rtm-text-secondary)" }}
        >
          {isLocked ? "flat" : formatUSD(lineItem.unitPrice)}
        </span>
      </td>

      {/* Line item subtotal */}
      <td className="px-4 py-2.5">
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          {formatUSD(subtotal)}
        </span>
      </td>

      {/* Empty actions col */}
      <td className="px-4 py-2.5" />
    </tr>
  );
}

// ─── Service Row (collapsible) ────────────────────────────────────────────────

interface ServiceRowProps {
  item: BudgetLineItem;
  lineItemQuantities: Record<string, number>;
  onUpdate: (
    serviceId: BudgetServiceId,
    changes: Partial<Pick<BudgetLineItem, "quantity" | "unitMonthlyPrice" | "setupFee">>
  ) => void;
  onRemove: (serviceId: BudgetServiceId) => void;
  onLineItemQuantityChange: (lineItemId: string, quantity: number) => void;
}

function ServiceRow({
  item,
  lineItemQuantities,
  onUpdate,
  onRemove,
  onLineItemQuantityChange,
}: ServiceRowProps) {
  const [expanded, setExpanded] = useState(false);
  const def = getBudgetServiceById(item.serviceId);
  const catalogId = def?.catalogId ?? "";
  const lineItemDefs: ServiceLineItem[] = getServiceLineItems(catalogId);

  // Compute monthly subtotal from line items if available,
  // otherwise fall back to the BudgetLineItem's existing monthlySubtotal.
  const computedMonthlySubtotal =
    lineItemDefs.length > 0
      ? lineItemDefs.reduce((sum, li) => {
          const qty = lineItemQuantities[li.id] ?? li.defaultQuantity;
          const clamped = Math.max(li.minQuantity, Math.min(li.maxQuantity, qty));
          return sum + computeLineItemSubtotal(li, clamped);
        }, 0)
      : item.monthlySubtotal;

  const lineItemCount = lineItemDefs.length;
  const hasLineItems = lineItemCount > 0;

  function handleRemoveClick(e: React.MouseEvent) {
    e.stopPropagation();
    onRemove(item.serviceId);
  }

  return (
    <>
      {/* ── Collapsed service row ─────────────────────────────────────────── */}
      <tr
        style={{
          background: "var(--rtm-surface)",
          borderBottom: expanded ? "none" : "1px solid var(--rtm-border)",
          cursor: hasLineItems ? "pointer" : "default",
        }}
        onClick={() => hasLineItems && setExpanded((prev) => !prev)}
      >
        {/* Service name */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {hasLineItems && (
              <span style={{ color: "var(--rtm-text-muted)" }}>
                <ChevronIcon open={expanded} />
              </span>
            )}
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {item.label}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {!item.isRecurring && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded inline-block"
                    style={{
                      background: "var(--rtm-bg)",
                      color: "var(--rtm-text-muted)",
                      border: "1px solid var(--rtm-border)",
                    }}
                  >
                    One-Time
                  </span>
                )}
                {hasLineItems && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block"
                    style={{
                      background: "var(--rtm-accent)",
                      color: "#fff",
                      opacity: 0.85,
                    }}
                  >
                    {lineItemCount} line item{lineItemCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>

        {/* Department */}
        <td className="px-4 py-3">
          <span
            className="text-xs font-medium"
            style={{ color: "var(--rtm-text-secondary)" }}
          >
            {item.department}
          </span>
        </td>

        {/* Qty (kept for backward compat display) */}
        <td className="px-4 py-3">
          <span
            className="text-xs"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            {item.quantity}
          </span>
        </td>

        {/* Monthly Price — editable for recurring services */}
        <td className="px-4 py-3">
          {item.isRecurring ? (
            <input
              type="number"
              value={item.unitMonthlyPrice}
              min={0}
              step={50}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                const price = parseFloat(e.target.value);
                if (!isNaN(price) && price >= 0) {
                  onUpdate(item.serviceId, { unitMonthlyPrice: price });
                }
              }}
              className="px-2 py-1.5 rounded border text-sm outline-none w-28"
              style={{
                background: "var(--rtm-bg)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            />
          ) : (
            <span
              className="text-sm"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {formatUSD(0)}
            </span>
          )}
        </td>

        {/* Setup Fee — editable for all service rows */}
        <td className="px-4 py-3">
          <input
            type="number"
            value={item.setupFee}
            min={0}
            step={50}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              const fee = parseFloat(e.target.value);
              if (!isNaN(fee) && fee >= 0) {
                onUpdate(item.serviceId, { setupFee: fee });
              }
            }}
            className="px-2 py-1.5 rounded border text-sm outline-none w-28"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
            }}
          />
        </td>

        {/* Monthly Subtotal col (was "Monthly Subtotal" — now shows line-item computed total) */}
        <td className="px-4 py-3">
          <span
            className="text-sm font-bold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {item.isRecurring
              ? formatUSD(computedMonthlySubtotal)
              : formatUSD(item.setupSubtotal)}
          </span>
          {item.monthlySubtotal === 0 && item.setupSubtotal > 0 && !item.isRecurring && (
            <p
              className="text-[10px]"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {formatUSD(item.setupSubtotal)} one-time
            </p>
          )}
        </td>

        {/* Remove */}
        <td className="px-4 py-3">
          <button
            onClick={handleRemoveClick}
            className="px-3 py-1.5 rounded border text-xs font-semibold transition-all hover:opacity-80"
            style={{
              background: "var(--rtm-bg)",
              color: "var(--rtm-text-muted)",
              borderColor: "var(--rtm-border)",
            }}
            title="Remove service"
          >
            Remove
          </button>
        </td>
      </tr>

      {/* ── Expanded line items sub-table ─────────────────────────────────── */}
      {expanded && hasLineItems && (
        <>
          {/* Sub-header row */}
          <tr
            style={{
              background: "var(--rtm-bg)",
              borderBottom: "1px solid var(--rtm-border)",
            }}
          >
            <th
              className="pl-10 pr-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-left"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Line Item
            </th>
            <th
              className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-left"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Unit
            </th>
            <th
              className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-left"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Qty
            </th>
            <th
              className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-left"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Unit Price
            </th>
            <th
              className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-left"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Subtotal
            </th>
            <th className="px-4 py-1.5" />
          </tr>
          {lineItemDefs.map((li) => {
            const qty = lineItemQuantities[li.id] ?? li.defaultQuantity;
            return (
              <LineItemRow
                key={li.id}
                lineItem={li}
                quantity={qty}
                onChange={onLineItemQuantityChange}
              />
            );
          })}
          {/* Subtotal footer for expanded section */}
          <tr
            style={{
              background: "var(--rtm-surface)",
              borderBottom: "1px solid var(--rtm-border)",
            }}
          >
            <td
              className="pl-10 pr-4 py-2 text-xs font-bold text-right"
              colSpan={4}
              style={{ color: "var(--rtm-text-secondary)" }}
            >
              Monthly Subtotal for {item.label}
            </td>
            <td className="px-4 py-2">
              <span
                className="text-sm font-black"
                style={{ color: "var(--rtm-accent)" }}
              >
                {formatUSD(computedMonthlySubtotal)}
              </span>
            </td>
            <td className="px-4 py-2" />
          </tr>
        </>
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ServiceAllocationTable({
  lineItems,
  lineItemQuantities,
  onUpdate,
  onRemove,
  onAdd,
  onLineItemQuantityChange,
  availableServices,
}: ServiceAllocationTableProps) {
  function handleAddServiceSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value as BudgetServiceId;
    if (id) {
      onAdd(id);
      e.target.value = "";
    }
  }

  // ─── Empty State ───────────────────────────────────────────────────────────

  if (lineItems.length === 0) {
    return (
      <div
        className="rounded-lg border"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          <div>
            <h2
              className="text-sm font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              Service Allocation
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Add services to build the budget
            </p>
          </div>
        </div>
        <div className="p-10 text-center">
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: "var(--rtm-text-secondary)" }}
          >
            No services added yet
          </p>
          <p
            className="text-xs mb-4"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Select a service from the catalog to begin building the budget.
          </p>
          {availableServices.length > 0 && (
            <select
              defaultValue=""
              onChange={handleAddServiceSelect}
              className="px-4 py-2 rounded-lg border text-sm outline-none"
              style={{
                background: "var(--rtm-bg)",
                borderColor: "var(--rtm-accent)",
                color: "var(--rtm-text-primary)",
              }}
            >
              <option value="" disabled>
                Add service from catalog...
              </option>
              {availableServices.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.label} — {svc.department}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    );
  }

  // ─── Table ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between gap-4"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div>
          <h2
            className="text-sm font-bold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Service Allocation
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            {lineItems.length} service{lineItems.length !== 1 ? "s" : ""} ·
            Click a row to expand line items and adjust quantities
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr
              className="text-left"
              style={{
                background: "var(--rtm-bg)",
                borderBottom: "1px solid var(--rtm-border)",
              }}
            >
              {[
                "Service",
                "Department",
                "Qty",
                "Monthly Price",
                "Setup Fee",
                "Monthly Subtotal",
                "",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => {
              const perServiceQtys = lineItemQuantities[item.serviceId] ?? {};
              return (
                <ServiceRow
                  key={item.serviceId}
                  item={item}
                  lineItemQuantities={perServiceQtys}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  onLineItemQuantityChange={(lineItemId, qty) =>
                    onLineItemQuantityChange(item.serviceId, lineItemId, qty)
                  }
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Service */}
      {availableServices.length > 0 && (
        <div
          className="px-5 py-4 border-t flex items-center gap-3"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--rtm-text-secondary)" }}
          >
            Add service:
          </span>
          <select
            defaultValue=""
            onChange={handleAddServiceSelect}
            className="px-3 py-1.5 rounded-lg border text-sm outline-none"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
            }}
          >
            <option value="" disabled>
              Select from catalog...
            </option>
            {availableServices.map((svc) => (
              <option key={svc.id} value={svc.id}>
                {svc.label} — {svc.department}
              </option>
            ))}
          </select>
        </div>
      )}
      {availableServices.length === 0 && lineItems.length > 0 && (
        <div
          className="px-5 py-3 border-t"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            All available services have been added.
          </p>
        </div>
      )}
    </div>
  );
}
