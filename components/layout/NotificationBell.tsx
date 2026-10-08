"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types (minimal — only what the dropdown needs) ──────────────────────────
interface DBNotification {
  id:          string;
  type:        string;
  message:     string;
  link:        string;
  readAt:      string | null;
  createdAt:   string;
  escalationLevel?: number | null;
}

// ─── Priority colours keyed on type ──────────────────────────────────────────
const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  task_assigned:      { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  concern_raised:     { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  concern_escalated:  { bg: "#FFF0F0", text: "#B91C1C", dot: "#EF4444" },
  concern_resolved:   { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
};

function typeCfg(type: string) {
  return TYPE_COLORS[type] ?? { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" };
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    task_assigned:     "Task",
    concern_raised:    "Concern",
    concern_escalated: "Escalated",
    concern_resolved:  "Resolved",
  };
  return map[type] ?? type;
}

function relativeDate(dateStr: string): string {
  const now  = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7)  return `${diff}d ago`;
  return `${Math.floor(diff / 7)}w ago`;
}

function formatBadge(n: number): string {
  if (n >= 100) return "99+";
  if (n > 0)    return String(n);
  return "";
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NotificationBell() {
  const router = useRouter();
  const ref    = useRef<HTMLDivElement>(null);

  const [open,    setOpen]    = useState(false);
  const [items,   setItems]   = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = items.filter((n) => !n.readAt).length;
  const badge = formatBadge(unreadCount);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=12", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { notifications: DBNotification[] };
        setItems(data.notifications ?? []);
      }
    } catch {
      // Bell is non-critical; silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on open, and poll count every 60s while closed.
  useEffect(() => {
    if (open) {
      void fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // Badge count poll (lightweight — count endpoint only).
  useEffect(() => {
    let mounted = true;
    async function pollCount() {
      try {
        const res = await fetch("/api/notifications/count", { credentials: "include" });
        if (res.ok && mounted) {
          const data = await res.json() as { unread: number };
          // If count changed since last fetch and panel is closed, bump items length hint.
          // Full data arrives when the panel opens.
          if (!open && data.unread !== unreadCount) {
            // We don't have content yet; just mark items dirty so next open refetches.
            setItems((prev) => prev); // noop — triggers refetch on next open via dep
          }
        }
      } catch { /* non-critical */ }
    }
    const t = setInterval(() => { void pollCount(); }, 60_000);
    return () => { mounted = false; clearInterval(t); };
  }, [open, unreadCount]);

  // Close on outside click.
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }
  }, [open]);

  // ── Actions ────────────────────────────────────────────────────────────────
  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    await fetch("/api/notifications/read", {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ id }),
    }).catch(() => { /* non-critical */ });
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    await fetch("/api/notifications/read", {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ all: true }),
    }).catch(() => { /* non-critical */ });
  }

  function openNotification(n: DBNotification) {
    void markRead(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  // ── Row ────────────────────────────────────────────────────────────────────
  function NotifRow({ n }: { n: DBNotification }) {
    const isUnread = !n.readAt;
    const cfg      = typeCfg(n.type);
    return (
      <div
        className="group relative"
        style={{
          borderBottom: "1px solid var(--rtm-border-light)",
          background: isUnread ? "var(--rtm-blue-xlight)" : "var(--rtm-surface)",
        }}
      >
        <div className="flex items-start gap-2.5 px-3 py-2.5">
          {/* Unread dot */}
          <span
            className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: isUnread ? cfg.dot : "transparent" }}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none flex-shrink-0"
                style={{ background: cfg.bg, color: cfg.text }}
              >
                {typeLabel(n.type)}
              </span>
              <span className="text-[10px] flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }}>
                {relativeDate(n.createdAt)}
              </span>
            </div>

            <p
              className="text-xs font-semibold leading-snug line-clamp-2 mt-0.5"
              style={{ color: isUnread ? "var(--rtm-text-primary)" : "var(--rtm-text-secondary)" }}
            >
              {n.message}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {n.link && (
                <button
                  onClick={() => openNotification(n)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded"
                  style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
                >
                  Open
                </button>
              )}
              {isUnread && (
                <button
                  onClick={(e) => { e.stopPropagation(); void markRead(n.id); }}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded"
                  style={{ background: "#F0FDF4", color: "#15803D" }}
                >
                  Mark Read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${badge ? ` — ${badge} unread` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative p-2 rounded-lg transition-colors"
        style={{ color: "var(--rtm-text-secondary)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-xlight)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = open ? "var(--rtm-blue-xlight)" : "transparent")}
      >
        <svg
          className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {badge && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white font-bold ring-2 ring-white px-0.5"
            style={{ fontSize: "9px", lineHeight: "1", background: "var(--rtm-blue)" }}
          >
            {badge}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 mt-2 z-50 flex flex-col"
          style={{
            width: "360px",
            maxHeight: "520px",
            background: "#ffffff",
            border: "1px solid var(--rtm-border)",
            borderRadius: "14px",
            boxShadow: "0 12px 40px rgba(15,28,56,0.16), 0 2px 8px rgba(15,28,56,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--rtm-border)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                Notifications
              </span>
              {badge && (
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
                >
                  {badge} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { void markAllRead(); }}
                className="text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors"
                style={{ color: "var(--rtm-blue)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-xlight)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Mark All Read
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading…</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <svg className="w-10 h-10" style={{ color: "var(--rtm-text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p className="text-sm font-medium" style={{ color: "var(--rtm-text-muted)" }}>No notifications</p>
              </div>
            ) : (
              items.map((n) => <NotifRow key={n.id} n={n} />)
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
            style={{ borderTop: "1px solid var(--rtm-border)", background: "var(--rtm-bg)" }}
          >
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
              Showing {items.length} most recent
            </span>
            <button
              onClick={() => { setOpen(false); router.push("/notifications"); }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "var(--rtm-blue)", color: "#ffffff" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-dark)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--rtm-blue)")}
            >
              View All Notifications
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
