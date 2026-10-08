"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface DBNotification {
  id:                  string;
  type:                string;
  message:             string;
  link:                string;
  readAt:              string | null;
  createdAt:           string;
  concernAboutType:    string | null;
  concernAboutId:      string | null;
  raisedById:          string | null;
  escalationLevel:     number | null;
  escalationParentId:  string | null;
  resolvedAt:          string | null;
  resolvedById:        string | null;
  raisedBy?:           { id: string; name: string } | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<string, { bg: string; color: string; label: string }> = {
  task_assigned:     { bg: "#EFF6FF", color: "#1D4ED8", label: "Task Assigned" },
  concern_raised:    { bg: "#FFF7ED", color: "#C2410C", label: "Concern Raised" },
  concern_escalated: { bg: "#FFF0F0", color: "#B91C1C", label: "Escalated" },
  concern_resolved:  { bg: "#F0FDF4", color: "#166534", label: "Resolved" },
};

function typeCfg(type: string) {
  return TYPE_CFG[type] ?? { bg: "#F1F5F9", color: "#475569", label: type };
}

function TypeBadge({ type }: { type: string }) {
  const c = typeCfg(type);
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function isEscalation(n: DBNotification) {
  return n.escalationLevel !== null && n.escalationLevel !== undefined;
}

function isUnread(n: DBNotification) {
  return !n.readAt;
}

function relativeDate(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7)  return `${diff}d ago`;
  return `${Math.floor(diff / 7)}w ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// RAISE CONCERN FORM
// ─────────────────────────────────────────────────────────────────────────────

function RaiseConcernForm({ onDone }: { onDone: () => void }) {
  const [concernAboutType, setConcernAboutType] = useState<"project"|"task"|"client">("project");
  const [concernAboutId,   setConcernAboutId]   = useState("");
  const [message,          setMessage]           = useState("");
  const [link,             setLink]              = useState("");
  const [submitting,       setSubmitting]         = useState(false);
  const [result,           setResult]             = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/notifications/escalate", {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ concernAboutType, concernAboutId, message, link }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (res.ok) {
        setResult(`Concern raised. Manager notified (recipient: ${data.recipientName as string}).`);
        setMessage(""); setConcernAboutId(""); setLink("");
        onDone();
      } else {
        setResult(`Error: ${String(data.error)}`);
      }
    } catch {
      setResult("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background:   "var(--rtm-surface)",
    border:       "1px solid var(--rtm-border)",
    color:        "var(--rtm-text-primary)",
    borderRadius: "8px",
    padding:      "6px 10px",
    fontSize:     "13px",
    width:        "100%",
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            About
          </label>
          <select value={concernAboutType} onChange={(e) => setConcernAboutType(e.target.value as "project"|"task"|"client")} style={inputStyle}>
            <option value="project">Project</option>
            <option value="task">Task</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            ID / Name
          </label>
          <input
            type="text" value={concernAboutId} onChange={(e) => setConcernAboutId(e.target.value)}
            placeholder="project id, task id, or client name"
            style={inputStyle} required
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>
          Concern
        </label>
        <textarea
          value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the concern…"
          rows={3} style={{ ...inputStyle, resize: "vertical" }} required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>
          Link (deep link to the record)
        </label>
        <input
          type="text" value={link} onChange={(e) => setLink(e.target.value)}
          placeholder="/projects/proj-xxx or /tasks"
          style={inputStyle} required
        />
      </div>
      {result && (
        <p className="text-sm font-medium px-3 py-2 rounded-lg"
          style={{ background: result.startsWith("Error") ? "#FFF0F0" : "#F0FDF4", color: result.startsWith("Error") ? "#B91C1C" : "#166534" }}>
          {result}
        </p>
      )}
      <button
        type="submit" disabled={submitting}
        className="px-4 py-2 rounded-lg text-sm font-semibold"
        style={{ background: "var(--rtm-blue)", color: "#fff", opacity: submitting ? 0.6 : 1 }}
      >
        {submitting ? "Raising…" : "Raise Concern"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION ROW
// ─────────────────────────────────────────────────────────────────────────────

function NotifRow({
  n,
  onMarkRead,
  onEscalateToExec,
  onResolve,
}: {
  n:                 DBNotification;
  onMarkRead:        (id: string) => void;
  onEscalateToExec:  (parentId: string) => void;
  onResolve:         (id: string) => void;
}) {
  const unread = isUnread(n);
  const esc    = isEscalation(n);

  return (
    <tr
      style={{
        background:   unread ? "#F0F7FF" : "var(--rtm-surface)",
        borderBottom: "1px solid var(--rtm-border)",
        borderLeft:   unread ? "3px solid #3B82F6" : "3px solid transparent",
      }}
    >
      <td className="px-4 py-3 whitespace-nowrap"><TypeBadge type={n.type} /></td>
      <td className="px-4 py-3 max-w-[320px]">
        <p className="text-sm font-semibold leading-snug line-clamp-3"
           style={{ color: "var(--rtm-text-primary)" }}>
          {n.message}
        </p>
        {n.raisedBy && (
          <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            Raised by {n.raisedBy.name}
          </p>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {n.link && (
          <Link href={n.link} className="text-xs font-semibold hover:underline"
                style={{ color: "var(--rtm-blue)" }}>
            {n.link}
          </Link>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        {relativeDate(n.createdAt)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {n.resolvedAt ? (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#F0FDF4", color: "#166534" }}>Resolved</span>
        ) : unread ? (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#EFF6FF", color: "#1D4ED8" }}>Unread</span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#F1F5F9", color: "#475569" }}>Read</span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1">
          {unread && (
            <button onClick={() => onMarkRead(n.id)}
              className="px-2 py-1 rounded text-xs font-semibold"
              style={{ background: "#F0FDF4", color: "#166534" }}>
              Mark Read
            </button>
          )}
          {esc && n.escalationLevel === 1 && !n.resolvedAt && (
            <button onClick={() => onEscalateToExec(n.id)}
              className="px-2 py-1 rounded text-xs font-semibold"
              style={{ background: "#FFF0F0", color: "#B91C1C" }}>
              → Executive
            </button>
          )}
          {esc && !n.resolvedAt && (
            <button onClick={() => onResolve(n.id)}
              className="px-2 py-1 rounded text-xs font-semibold"
              style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
              Resolve
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading,       setLoading]        = useState(true);
  const [activeTab,     setActiveTab]      = useState<"all" | "my" | "escalations">("all");
  const [showRaiseForm, setShowRaiseForm]  = useState(false);
  const [actionMsg,     setActionMsg]      = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=200", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { notifications: DBNotification[] };
        setNotifications(data.notifications ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const unreadCount   = useMemo(() => notifications.filter(isUnread).length, [notifications]);
  const escalations   = useMemo(() => notifications.filter(isEscalation), [notifications]);

  const displayed = activeTab === "escalations" ? escalations : notifications;

  // ── Actions ────────────────────────────────────────────────────────────────
  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    await fetch("/api/notifications/read", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    await fetch("/api/notifications/read", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
  }

  async function escalateToExec(parentNotifId: string) {
    const res = await fetch("/api/notifications/escalate", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentNotifId }),
    });
    const data = await res.json() as Record<string, unknown>;
    if (res.ok) {
      setActionMsg(`Escalated to ${String(data.recipientName)}.`);
      void fetchAll();
    } else {
      setActionMsg(`Error: ${String(data.error)}`);
    }
  }

  async function resolve(notifId: string) {
    const res = await fetch("/api/notifications/resolve", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifId }),
    });
    const data = await res.json() as Record<string, unknown>;
    if (res.ok) {
      setActionMsg("Resolved. Raiser has been notified.");
      void fetchAll();
    } else {
      setActionMsg(`Error: ${String(data.error)}`);
    }
  }

  // ── Styles ─────────────────────────────────────────────────────────────────
  const tabBase   = "px-4 py-2 text-sm font-semibold rounded-lg transition-all";
  const tabActive = { background: "var(--rtm-blue)", color: "#fff" };
  const tabOff    = { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Notifications
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            Your in-app notifications. Escalate a concern to your department manager; escalate further to an Executive.
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
               style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            {unreadCount} Unread
          </div>
        )}
      </div>

      {/* ACTION BAR */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { void markAllRead(); }}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: "var(--rtm-blue)", color: "#fff" }}>
          Mark All Read
        </button>
        <button onClick={() => setShowRaiseForm((v) => !v)}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: showRaiseForm ? "#FFF0F0" : "var(--rtm-surface)", color: showRaiseForm ? "#B91C1C" : "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" }}>
          {showRaiseForm ? "Cancel" : "Raise a Concern"}
        </button>
        <button onClick={() => { void fetchAll(); }}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" }}>
          Refresh
        </button>
      </div>

      {/* RAISE CONCERN FORM */}
      {showRaiseForm && (
        <div className="p-5 rounded-xl border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "var(--rtm-text-primary)" }}>
            Raise a Concern
          </h2>
          <p className="text-xs mb-4" style={{ color: "var(--rtm-text-muted)" }}>
            Your concern goes to the manager of your department. If it is not resolved, the manager
            or you can escalate it further to an Executive using the button that appears on the
            notification row.
          </p>
          <RaiseConcernForm onDone={() => { setShowRaiseForm(false); void fetchAll(); }} />
        </div>
      )}

      {/* ACTION MESSAGE */}
      {actionMsg && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: actionMsg.startsWith("Error") ? "#FFF0F0" : "#F0FDF4",
                   color: actionMsg.startsWith("Error") ? "#B91C1C" : "#166534" }}>
          {actionMsg}
          <button className="ml-3 underline text-xs" onClick={() => setActionMsg(null)}>dismiss</button>
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "my", "escalations"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={tabBase}
                  style={activeTab === tab ? tabActive : tabOff}>
            {tab === "all"         ? `All (${notifications.length})`
             : tab === "my"        ? `My Notifications (${notifications.length})`
             : `Escalation Center (${escalations.length})`}
          </button>
        ))}
      </div>

      {/* ESCALATION CENTER */}
      {activeTab === "escalations" && (
        <div className="rounded-xl border overflow-hidden"
             style={{ background: "var(--rtm-surface)", borderColor: "#FECACA" }}>
          <div className="px-5 py-4" style={{ background: "#FFF5F5", borderBottom: "1px solid #FECACA" }}>
            <h2 className="text-base font-bold text-red-800">Escalation Center</h2>
            <p className="text-xs text-red-600 mt-0.5">
              Active escalations. Level 1 = department manager. Level 2 = Executive.
              Escalate further by pressing → Executive. Resolve when done.
            </p>
          </div>
          {escalations.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>No escalations</p>
              <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>Use "Raise a Concern" to start one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#FFF0F0", borderBottom: "1px solid #FECACA" }}>
                    {["Type", "Concern", "Link", "Age", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-red-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {escalations.map((n) => (
                    <NotifRow key={n.id} n={n}
                      onMarkRead={(id) => { void markRead(id); }}
                      onEscalateToExec={(pid) => { void escalateToExec(pid); }}
                      onResolve={(id) => { void resolve(id); }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* NOTIFICATION FEED (All / My tabs) */}
      {activeTab !== "escalations" && (
        <div className="rounded-xl border overflow-hidden"
             style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div className="px-5 py-4 flex items-center justify-between"
               style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-bg)" }}>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {activeTab === "my" ? "My Notifications" : "All Notifications"}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>
              {displayed.length} notifications
            </span>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <p style={{ color: "var(--rtm-text-muted)" }}>Loading…</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-4xl mb-3">🔔</p>
              <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>No notifications yet</p>
              <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                Notifications appear here when tasks are assigned or concerns are raised.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
                    {["Type", "Message", "Link", "Age", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide"
                          style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((n) => (
                    <NotifRow key={n.id} n={n}
                      onMarkRead={(id) => { void markRead(id); }}
                      onEscalateToExec={(pid) => { void escalateToExec(pid); }}
                      onResolve={(id) => { void resolve(id); }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
