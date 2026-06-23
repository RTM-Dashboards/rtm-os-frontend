"use client";

// RTM OS — Standard Detail Drawer
// Common pattern for all modules: Overview, Activity, Notes, History, Attachments, AI Summary.
// Modules can extend tabs via the `extraTabs` prop.

import React, { useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DrawerTabId =
  | "overview"| "activity"| "notes"| "history"| "attachments"| "ai-summary"| string; // allow custom tabs

export interface DrawerTab {
  id: DrawerTabId;
  label: string;
  /** SVG icon rendered inline — keep it small (16x16) */
  icon?: React.ReactNode;
  badge?: number;
  content: React.ReactNode;
}

export interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Drawer heading */
  title: string;
  subtitle?: string;
  /** Status badge shown in header */
  statusBadge?: React.ReactNode;
  /** Action buttons in header */
  headerActions?: React.ReactNode;
  /** Tabs (in display order) */
  tabs: DrawerTab[];
  /** Default active tab — defaults to tabs[0].id */
  defaultTab?: DrawerTabId;
  /** Width class: "md"(480px) | "lg"(640px) | "xl"(800px) */
  width?: "md"| "lg"| "xl";
  activeTab?: DrawerTabId;
  onTabChange?: (id: DrawerTabId) => void;
}

// ── Layout icons (inline SVG, no external deps) ───────────────────────────────

const IconX = () => (
  <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

const widthMap = { md: "480px", lg: "640px", xl: "800px"};

export default function DetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  statusBadge,
  headerActions,
  tabs,
  defaultTab,
  width = "lg",
  activeTab: controlledTab,
  onTabChange,
}: DetailDrawerProps) {
  const [internalTab, setInternalTab] = React.useState<DrawerTabId>(
    defaultTab ?? tabs[0]?.id ?? "overview",
  );

  const activeId = controlledTab ?? internalTab;
  const setActiveId = useCallback(
    (id: DrawerTabId) => {
      setInternalTab(id);
      onTabChange?.(id);
    },
    [onTabChange],
  );

  // Keyboard: Escape closes
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const activeContent = tabs.find((t) => t.id === activeId)?.content;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 transition-opacity"style={{ background: "rgba(14,32,85,0.45)", backdropFilter: "blur(2px)"}}
          onClick={onClose}
          aria-hidden="true"/>
      )}

      {/* Drawer panel */}
      <aside
        aria-modal="true"role="dialog"aria-label={title}
        className={`fixed right-0 top-0 bottom-0 z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl`}
        style={{
          width: widthMap[width],
          maxWidth: "100vw",
          background: "var(--rtm-surface)",
          borderLeft: "1px solid var(--rtm-border)",
          transform: open ? "translateX(0)": "translateX(100%)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 px-5 py-4"style={{
            borderBottom: "1px solid var(--rtm-border)",
            background: "var(--rtm-bg)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="text-base font-bold leading-tight"style={{ color: "var(--rtm-text-primary)"}}
                >
                  {title}
                </h2>
                {statusBadge}
              </div>
              {subtitle && (
                <p className="mt-0.5 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {headerActions}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors"style={{ color: "var(--rtm-text-muted)"}}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-border-light)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                aria-label="Close drawer">
                <IconX />
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        {tabs.length > 1 && (
          <div
            className="flex-shrink-0 flex items-center gap-0.5 px-4 overflow-x-auto"style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-bg)"}}
            role="tablist">
            {tabs.map((tab) => {
              const isActive = tab.id === activeId;
              return (
                <button
                  key={tab.id}
                  role="tab"aria-selected={isActive}
                  onClick={() => setActiveId(tab.id)}
                  className="relative flex items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors"style={{
                    color: isActive ? "var(--rtm-blue)": "var(--rtm-text-muted)",
                    borderBottom: isActive ? "2px solid var(--rtm-blue)": "2px solid transparent",
                    background: "transparent",
                  }}
                >
                  {tab.icon && (
                    <span className="opacity-80">{tab.icon}</span>
                  )}
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"style={{
                        background: isActive ? "var(--rtm-blue)": "var(--rtm-border)",
                        color: isActive ? "#fff": "var(--rtm-text-muted)",
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-5"role="tabpanel">
          {activeContent}
        </div>
      </aside>
    </>
  );
}
