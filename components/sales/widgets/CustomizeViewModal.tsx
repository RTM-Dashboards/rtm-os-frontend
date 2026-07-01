"use client";

import React from "react";
import { getWidgetsForPage } from "@/lib/sales/widget-config";
import type { WidgetPageId } from "@/lib/sales/widget-config";
import { useWidgetPreferences } from "./useWidgetPreferences";

interface CustomizeViewModalProps {
  pageId: WidgetPageId;
  onClose: () => void;
}

export function CustomizeViewModal({ pageId, onClose }: CustomizeViewModalProps) {
  const { widgetOrder, isVisible, toggleWidget, reorderWidget, resetToDefault } =
    useWidgetPreferences(pageId);

  const allWidgets = getWidgetsForPage(pageId);

  // Render widgets in the user's current preferred order
  const orderedWidgets = widgetOrder
    .map((id) => allWidgets.find((w) => w.id === id))
    .filter(Boolean) as typeof allWidgets;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 28, 56, 0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
        style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Customize Dashboard Widgets
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Choose which KPI cards to show and drag to reorder.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold flex-shrink-0 ml-4 hover:bg-red-50 transition-colors"
            style={{ color: "var(--rtm-text-muted)" }}
            aria-label="Close"
          >
            &#x2715;
          </button>
        </div>

        {/* Widget List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {orderedWidgets.map((widget, idx) => {
            const visible = isVisible(widget.id);
            const isFirst = idx === 0;
            const isLast = idx === orderedWidgets.length - 1;

            return (
              <div
                key={widget.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors"
                style={{
                  background: visible ? "var(--rtm-surface)" : "var(--rtm-bg)",
                  borderColor: visible ? "var(--rtm-border)" : "var(--rtm-border)",
                  opacity: visible ? 1 : 0.6,
                }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  id={`widget-${widget.id}`}
                  checked={visible}
                  onChange={() => toggleWidget(widget.id)}
                  className="w-4 h-4 flex-shrink-0 cursor-pointer accent-emerald-600"
                />

                {/* Label + Description */}
                <label
                  htmlFor={`widget-${widget.id}`}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {widget.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    {widget.description}
                  </p>
                </label>

                {/* Reorder Buttons */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => reorderWidget(widget.id, "up")}
                    disabled={isFirst}
                    className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
                    style={{ color: "var(--rtm-text-muted)" }}
                    aria-label={`Move ${widget.label} up`}
                  >
                    &#x2191;
                  </button>
                  <button
                    onClick={() => reorderWidget(widget.id, "down")}
                    disabled={isLast}
                    className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
                    style={{ color: "var(--rtm-text-muted)" }}
                    aria-label={`Move ${widget.label} down`}
                  >
                    &#x2193;
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <button
            onClick={resetToDefault}
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:bg-slate-50"
            style={{
              background: "var(--rtm-bg)",
              color: "var(--rtm-text-secondary)",
              borderColor: "var(--rtm-border)",
            }}
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors"
            style={{ background: "#059669", color: "#fff", borderColor: "#059669" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
