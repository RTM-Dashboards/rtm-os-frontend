"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NOTIFICATIONS } from "@/lib/notifications";
import type { RTMNotification, NotificationStatus } from "@/lib/notifications";

// ─── Filter tabs ─────────────────────────────────────────────────
const FILTER_TABS = [
  { key: "All",          label: "All"},
  { key: "Unread",       label: "Unread"},
  { key: "Task",         label: "Tasks"},
  { key: "Workflow",     label: "Workflow"},
  { key: "Billing",      label: "Billing"},
  { key: "Renewal",      label: "Renewals"},
  { key: "Cancellation", label: "Cancellations"},
  { key: "Affiliate",    label: "Affiliates"},
] as const;

// ─── Priority colors ─────────────────────────────────────────────
const PRIORITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Low:      { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E"},
  Medium:   { bg: "#FFFBEB", text: "#B45309", dot: "#F59E0B"},
  High:     { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316"},
  Urgent:   { bg: "#FEF2F2", text: "#B91C1C", dot: "#EF4444"},
  Critical: { bg: "#FFF0F0", text: "#991B1B", dot: "#DC2626"},
};

// ─── Module tag colors ────────────────────────────────────────────
const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
  "Workflow Engine":    { bg: "#EFF6FF", text: "#1D4ED8"},
  "Task Engine":        { bg: "#F5F3FF", text: "#6D28D9"},
  "Billing":            { bg: "#ECFDF5", text: "#065F46"},
  "Billing Activation": { bg: "#FFF0FE", text: "#86198F"},
  "Account Management": { bg: "#F0F9FF", text: "#075985"},
  "Client Portfolio":   { bg: "#F0F9FF", text: "#075985"},
  "Sales":              { bg: "#FFF7ED", text: "#C2410C"},
  "Renewals":           { bg: "#ECFDF5", text: "#065F46"},
  "Cancellations":      { bg: "#FEF2F2", text: "#B91C1C"},
  "Offboarding":        { bg: "#FDF2F8", text: "#831843"},
  "Affiliate Management": { bg: "#FFFBEB", text: "#B45309"},
  "Admin":              { bg: "#F1F5F9", text: "#475569"},
};

// ─── Badge count formatting ───────────────────────────────────────
function formatBadge(n: number): string {
  if (n >= 100) return "99+";
  if (n > 0)    return String(n);
  return "";
}

// ─── PriorityDot ─────────────────────────────────────────────────
function PriorityDot({ priority }: { priority: string }) {
  const c = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.Medium;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none flex-shrink-0"style={{ background: c.bg, color: c.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: c.dot }}
      />
      {priority}
    </span>
  );
}

// ─── ModuleTag ────────────────────────────────────────────────────
function ModuleTag({ module }: { module: string }) {
  const c = MODULE_COLORS[module] ?? { bg: "#F1F5F9", text: "#475569"};
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none flex-shrink-0"style={{ background: c.bg, color: c.text }}
    >
      {module}
    </span>
  );
}

// ─── Relative time ───────────────────────────────────────────────
function relativeDate(dateStr: string): string {
  const now  = new Date("2025-07-14");
  const then = new Date(dateStr);
  const diff = Math.floor((now.getTime() - then.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7)  return `${diff}d ago`;
  return `${Math.floor(diff / 7)}w ago`;
}

// ─── Main component ───────────────────────────────────────────────
export default function NotificationBell() {
  const router = useRouter();
  const ref    = useRef<HTMLDivElement>(null);

  const [open,     setOpen]     = useState(false);
  const [filter,   setFilter]   = useState<string>("All");
  const [items,    setItems]    = useState<RTMNotification[]>(NOTIFICATIONS);

  const unreadCount = useMemo(
    () => items.filter((n) => n.status === "Unread"|| n.status === "Escalated").length,
    [items]
  );

  const badge = formatBadge(unreadCount);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }
  }, [open]);

  // Filtered list (max 12 in dropdown)
  const filtered = useMemo(() => {
    const base =
      filter === "All"? items :
      filter === "Unread"? items.filter((n) => n.status === "Unread"|| n.status === "Escalated") :
                            items.filter((n) => n.type === filter);
    return base.slice(0, 12);
  }, [items, filter]);

  // ── Actions ────────────────────────────────────────────────────
  function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) => n.id === id && (n.status === "Unread"|| n.status === "Escalated")
        ? { ...n, status: "Read"as NotificationStatus }
        : n
      )
    );
  }

  function acknowledge(id: string) {
    setItems((prev) =>
      prev.map((n) => n.id === id ? { ...n, status: "Acknowledged"as NotificationStatus } : n)
    );
  }

  function dismiss(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  function markAllRead() {
    setItems((prev) =>
      prev.map((n) =>
        n.status === "Unread"|| n.status === "Escalated"? { ...n, status: "Read"as NotificationStatus }
          : n
      )
    );
  }

  function clearRead() {
    setItems((prev) => prev.filter((n) => n.status !== "Read"&& n.status !== "Resolved"));
  }

  function openNotification(n: RTMNotification) {
    markRead(n.id);
    setOpen(false);
    if (n.relatedRoute) router.push(n.relatedRoute);
  }

  // ── Row ────────────────────────────────────────────────────────
  function NotifRow({ n }: { n: RTMNotification }) {
    const isUnread   = n.status === "Unread"|| n.status === "Escalated";
    const isEscalted = n.status === "Escalated";
    return (
      <div
        className="group relative"style={{
          borderBottom: "1px solid var(--rtm-border-light)",
          background: isEscalted ? "#FFFAFA": isUnread ? "var(--rtm-blue-xlight)": "var(--rtm-surface)",
        }}
      >
        <div className="flex items-start gap-2.5 px-3 py-2.5">
          {/* Unread dot */}
          <span
            className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"style={{
              background: isEscalted
                ? "#DC2626": isUnread
                ? "var(--rtm-blue)": "transparent",
            }}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p
                className="text-xs font-semibold truncate leading-snug"style={{
                  color: isEscalted ? "#B91C1C": "var(--rtm-text-primary)",
                  maxWidth: "200px",
                }}
              >
                {n.title}
              </p>
              <span className="text-[10px] flex-shrink-0"style={{ color: "var(--rtm-text-muted)"}}>
                {relativeDate(n.createdDate)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <PriorityDot priority={n.priority} />
              <ModuleTag module={n.module} />
              {n.client && n.client !== "—"&& (
                <span className="text-[10px] text-gray-400 truncate">{n.client}</span>
              )}
            </div>

            <p
              className="text-[11px] leading-relaxed line-clamp-2"style={{ color: "var(--rtm-text-secondary)"}}
            >
              {n.description}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openNotification(n)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
              >
                Open
              </button>
              {isUnread && (
                <button
                  onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded"style={{ background: "#F0FDF4", color: "#15803D"}}
                >
                  Mark Read
                </button>
              )}
              {n.status !== "Acknowledged"&& (
                <button
                  onClick={(e) => { e.stopPropagation(); acknowledge(n.id); }}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded"style={{ background: "#FFFBEB", color: "#B45309"}}
                >
                  Ack
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                className="text-[10px] font-semibold px-2 py-0.5 rounded"style={{ background: "#FEF2F2", color: "#B91C1C"}}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="relative"ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${badge ? ` — ${badge} unread` : ""}`}
        aria-haspopup="true"aria-expanded={open}
        className="relative p-2 rounded-lg transition-colors"style={{ color: "var(--rtm-text-secondary)"}}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-xlight)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = open ? "var(--rtm-blue-xlight)": "transparent")}
      >
        {/* Bell SVG */}
        <svg
          className="w-[18px] h-[18px]"fill="none"stroke="currentColor"viewBox="0 0 24 24"strokeWidth={2}
          strokeLinecap="round"strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {/* Badge */}
        {badge && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white font-bold ring-2 ring-white px-0.5"style={{
              fontSize: "9px",
              lineHeight: "1",
              background: unreadCount > 0
                ? (items.some((n) => n.status === "Escalated"&& (n.priority === "Critical"|| n.priority === "Urgent"))
                    ? "#DC2626": "var(--rtm-blue)")
                : "var(--rtm-blue)",
            }}
          >
            {badge}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 mt-2 z-50 flex flex-col"style={{
            width: "380px",
            maxHeight: "560px",
            background: "#ffffff",
            border: "1px solid var(--rtm-border)",
            borderRadius: "14px",
            boxShadow: "0 12px 40px rgba(15,28,56,0.16), 0 2px 8px rgba(15,28,56,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"style={{ borderBottom: "1px solid var(--rtm-border)"}}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                Notifications
              </span>
              {badge && (
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
                >
                  {badge} unread
                </span>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors"style={{ color: "var(--rtm-blue)"}}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-xlight)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Mark All Read
              </button>
              <button
                onClick={clearRead}
                className="text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors"style={{ color: "var(--rtm-text-muted)"}}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Clear Read
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div
            className="flex items-center gap-0.5 px-3 py-2 overflow-x-auto flex-shrink-0"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}
          >
            {FILTER_TABS.map((tab) => {
              const isActive = filter === tab.key;
              const count =
                tab.key === "All"? items.length :
                tab.key === "Unread"? items.filter((n) => n.status === "Unread"|| n.status === "Escalated").length :
                                       items.filter((n) => n.type === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap"style={
                    isActive
                      ? { background: "var(--rtm-blue)", color: "#ffffff"}
                      : { color: "var(--rtm-text-secondary)"}
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "var(--rtm-blue-xlight)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className="ml-1 opacity-70">({count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <svg
                  className="w-10 h-10"style={{ color: "var(--rtm-text-muted)"}}
                  fill="none"stroke="currentColor"viewBox="0 0 24 24"strokeWidth={1.5}
                >
                  <path strokeLinecap="round"strokeLinejoin="round"d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path strokeLinecap="round"strokeLinejoin="round"d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p className="text-sm font-medium"style={{ color: "var(--rtm-text-muted)"}}>
                  No notifications
                </p>
              </div>
            ) : (
              filtered.map((n) => <NotifRow key={n.id} n={n} />)
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"style={{ borderTop: "1px solid var(--rtm-border)", background: "var(--rtm-bg)"}}
          >
            <span className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>
              Showing {filtered.length} of {items.length}
            </span>
            <button
              onClick={() => { setOpen(false); router.push("/notifications"); }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"style={{
                background: "var(--rtm-blue)",
                color: "#ffffff",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-dark)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--rtm-blue)")}
            >
              View All Notifications
              <svg className="w-3 h-3"fill="none"stroke="currentColor"viewBox="0 0 24 24"strokeWidth={2.5}>
                <path strokeLinecap="round"strokeLinejoin="round"d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
