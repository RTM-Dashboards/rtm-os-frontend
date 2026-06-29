"use client";

import React from "react";
import {
  getBudgetServiceById,
  type BudgetServiceId,
  type BudgetServiceDefinition,
} from "@/lib/sales/budget-config";
import type { BudgetLineItem } from "@/lib/sales/budget-engine";

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

interface ServiceAllocationTableProps {
  lineItems: BudgetLineItem[];
  onUpdate: (
    serviceId: BudgetServiceId,
    changes: Partial<
      Pick<BudgetLineItem, "quantity" | "unitMonthlyPrice" | "setupFee">
    >
  ) => void;
  onRemove: (serviceId: BudgetServiceId) => void;
  onAdd: (serviceId: BudgetServiceId) => void;
  availableServices: BudgetServiceDefinition[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ServiceAllocationTable({
  lineItems,
  onUpdate,
  onRemove,
  onAdd,
  availableServices,
}: ServiceAllocationTableProps) {
  // ─── Handlers ────────────────────────────────────────────────────────────

  function handleQuantityChange(
    serviceId: BudgetServiceId,
    value: string
  ) {
    const qty = parseInt(value, 10);
    if (!isNaN(qty) && qty > 0) {
      onUpdate(serviceId, { quantity: qty });
    }
  }

  function handleMonthlyPriceChange(
    serviceId: BudgetServiceId,
    value: string,
    min: number,
    max: number
  ) {
    let price = parseFloat(value);
    if (isNaN(price)) return;
    price = Math.max(min, Math.min(max > 0 ? max : price, price));
    onUpdate(serviceId, { unitMonthlyPrice: price });
  }

  function handleSetupFeeChange(
    serviceId: BudgetServiceId,
    value: string
  ) {
    const fee = parseFloat(value);
    if (!isNaN(fee) && fee >= 0) {
      onUpdate(serviceId, { setupFee: fee });
    }
  }

  function handleAddServiceSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value as BudgetServiceId;
    if (id) {
      onAdd(id);
      e.target.value = "";
    }
  }

  // ─── Empty State ─────────────────────────────────────────────────────────

  if (lineItems.length === 0) {
    return (
      <div
        className="rounded-lg border"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--rtm-border)" }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Service Allocation
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Add services to build the budget
            </p>
          </div>
        </div>
        <div className="p-10 text-center">
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            No services added yet
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--rtm-text-muted)" }}>
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

  // ─── Table ────────────────────────────────────────────────────────────────

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between gap-4"
        style={{ borderColor: "var(--rtm-border)" }}>
        <div>
          <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Service Allocation
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {lineItems.length} service{lineItems.length !== 1 ? "s" : ""} · Adjust quantity and pricing per line
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
            {lineItems.map((item, idx) => {
              const def = getBudgetServiceById(item.serviceId);

              return (
                <tr
                  key={item.serviceId}
                  style={{
                    background:
                      idx % 2 === 0
                        ? "var(--rtm-surface)"
                        : "var(--rtm-bg)",
                    borderBottom: "1px solid var(--rtm-border)",
                  }}
                >
                  {/* Service */}
                  <td className="px-4 py-3">
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {item.label}
                      </p>
                      {!item.isRecurring && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block"
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

                  {/* Quantity */}
                  <td className="px-4 py-3">
                    {def ? (
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.serviceId, e.target.value)
                        }
                        className="px-2 py-1.5 rounded border text-sm outline-none w-20"
                        style={{
                          background: "var(--rtm-bg)",
                          borderColor: "var(--rtm-border)",
                          color: "var(--rtm-text-primary)",
                        }}
                      >
                        {def.quantityOptions.map((qty) => (
                          <option key={qty} value={qty}>
                            {qty} {def.quantityUnit}
                            {qty !== 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: "var(--rtm-text-secondary)" }}>
                        {item.quantity}
                      </span>
                    )}
                  </td>

                  {/* Monthly Price */}
                  <td className="px-4 py-3">
                    {item.isRecurring && def ? (
                      <input
                        type="number"
                        value={item.unitMonthlyPrice}
                        min={def.minMonthlyPrice}
                        max={def.maxMonthlyPrice > 0 ? def.maxMonthlyPrice : undefined}
                        step={50}
                        onChange={(e) =>
                          handleMonthlyPriceChange(
                            item.serviceId,
                            e.target.value,
                            def.minMonthlyPrice,
                            def.maxMonthlyPrice
                          )
                        }
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

                  {/* Setup Fee */}
                  <td className="px-4 py-3">
                    {def?.setupFeeEditable ? (
                      <input
                        type="number"
                        value={item.setupFee}
                        min={0}
                        step={50}
                        onChange={(e) =>
                          handleSetupFeeChange(item.serviceId, e.target.value)
                        }
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
                        {formatUSD(item.setupFee)}
                      </span>
                    )}
                  </td>

                  {/* Monthly Subtotal */}
                  <td className="px-4 py-3">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {formatUSD(item.monthlySubtotal)}
                    </span>
                    {item.monthlySubtotal === 0 && item.setupSubtotal > 0 && (
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        {formatUSD(item.setupSubtotal)} setup
                      </p>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onRemove(item.serviceId)}
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
          <p
            className="text-xs"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            All available services have been added.
          </p>
        </div>
      )}
    </div>
  );
}
