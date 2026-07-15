"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ClientCommSource =
  | "Email"
  | "Phone Call"
  | "Meeting"
  | "Slack"
  | "Text Message"
  | "Portal";

const ALL_SOURCES: ClientCommSource[] = [
  "Email",
  "Phone Call",
  "Meeting",
  "Slack",
  "Text Message",
  "Portal",
];

interface AggregatedClientNote {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  source: string;
  body: string;
  createdAt: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  assignedAM: string;
  avatarColor: string;
}

interface TaskOption {
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  department: string;
  status: string;
}

interface MasterClient {
  id: string;
  clientName: string;
  assignedAM?: string;
  avatarColor?: string;
}

// ── Source styling ────────────────────────────────────────────────────────────

const SOURCE_COLORS: Record<ClientCommSource, string> = {
  "Email":        "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  "Phone Call":   "bg-green-100 text-green-800 ring-1 ring-green-200",
  "Meeting":      "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
  "Slack":        "bg-purple-100 text-purple-800 ring-1 ring-purple-200",
  "Text Message": "bg-teal-100 text-teal-800 ring-1 ring-teal-200",
  "Portal":       "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
};

const SOURCE_DOT: Record<ClientCommSource, string> = {
  "Email":        "bg-blue-500",
  "Phone Call":   "bg-green-500",
  "Meeting":      "bg-violet-500",
  "Slack":        "bg-purple-500",
  "Text Message": "bg-teal-500",
  "Portal":       "bg-amber-500",
};

const SOURCE_ICONS: Record<ClientCommSource, React.ReactNode> = {
  "Email": (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  "Phone Call": (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  "Meeting": (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  "Slack": (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  "Text Message": (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  "Portal": (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  ),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isKnownSource(s: string): s is ClientCommSource {
  return ALL_SOURCES.includes(s as ClientCommSource);
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  }) + " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: string }) {
  const key = isKnownSource(source) ? source : null;
  const colorClass = key ? SOURCE_COLORS[key] : "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  const dotClass   = key ? SOURCE_DOT[key]    : "bg-gray-400";
  const icon       = key ? SOURCE_ICONS[key]  : null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}
    >
      {icon ?? <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />}
      {source}
    </span>
  );
}

function Avatar({
  initials,
  color,
  size = "sm",
}: {
  initials: string;
  color: string;
  size?: "sm" | "md";
}) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm";
  return (
    <span
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ background: color }}
    >
      {initials || "?"}
    </span>
  );
}

function KPICard({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: number | string;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex flex-col gap-0.5 min-w-0">
      <span className={`text-2xl font-bold ${accent ?? "text-gray-900"}`}>{value}</span>
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
        {label}
      </span>
      {sub && <span className="text-xs text-gray-400 mt-0.5">{sub}</span>}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg
        className="w-10 h-10 text-gray-300 mb-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
        />
      </svg>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

// ── Log Communication Modal ────────────────────────────────────────────────────

interface LogModalProps {
  clients: MasterClient[];
  onClose: () => void;
  onSaved: () => void;
  defaultClientId?: string;
}

function LogCommunicationModal({
  clients,
  onClose,
  onSaved,
  defaultClientId,
}: LogModalProps) {
  const [selectedClientId, setSelectedClientId] = useState(defaultClientId ?? "");
  const [taskOptions, setTaskOptions]           = useState<TaskOption[]>([]);
  const [selectedTaskId, setSelectedTaskId]     = useState("");
  const [source, setSource]                     = useState<ClientCommSource>("Email");
  const [body, setBody]                         = useState("");
  const [saving, setSaving]                     = useState(false);
  const [error, setError]                       = useState("");
  const [loadingTasks, setLoadingTasks]         = useState(false);

  // Load task options when client changes
  useEffect(() => {
    if (!selectedClientId) {
      setTaskOptions([]);
      setSelectedTaskId("");
      return;
    }
    setLoadingTasks(true);
    setSelectedTaskId("");
    fetch(`/api/communications?clientId=${encodeURIComponent(selectedClientId)}&taskIds=true`)
      .then((r) => r.json())
      .then((d: { taskOptions?: TaskOption[] }) => {
        setTaskOptions(d.taskOptions ?? []);
        if (d.taskOptions && d.taskOptions.length > 0) {
          setSelectedTaskId(d.taskOptions[0].taskId);
        }
      })
      .catch(() => setTaskOptions([]))
      .finally(() => setLoadingTasks(false));
  }, [selectedClientId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTaskId) { setError("Please select a task to attach this note to."); return; }
    if (!body.trim())    { setError("Note body cannot be empty."); return; }
    setError("");
    setSaving(true);
    try {
      const res = await fetch(
        `/api/collaboration?taskId=${encodeURIComponent(selectedTaskId)}&resource=clientNotes`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorName:     "You",
            authorInitials: "YO",
            authorColor:    "#1B4FD8",
            source,
            body: body.trim(),
          }),
        }
      );
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Failed to save.");
        return;
      }
      onSaved();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Log Communication</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Client */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Client
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">— Select client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.clientName}</option>
              ))}
            </select>
          </div>

          {/* Task */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Attach to Task
              <span className="ml-1 text-gray-400 normal-case font-normal">(required — note will be visible in Collaboration Hub)</span>
            </label>
            {loadingTasks ? (
              <div className="text-xs text-gray-400 py-2">Loading tasks…</div>
            ) : taskOptions.length === 0 && selectedClientId ? (
              <div className="text-xs text-amber-600 py-2 bg-amber-50 rounded-lg px-3 border border-amber-100">
                No engine tasks found for this client. Select a different client.
              </div>
            ) : (
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                disabled={taskOptions.length === 0}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                required
              >
                <option value="">— Select task —</option>
                {taskOptions.map((t) => (
                  <option key={t.taskId} value={t.taskId}>
                    {t.taskTitle} · {t.department} ({t.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Communication Channel
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_SOURCES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                    source === s
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {source === s ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                  ) : (
                    <span className={`w-1.5 h-1.5 rounded-full ${SOURCE_DOT[s]}`} />
                  )}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Note body */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Note
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Summarize the communication — what was discussed, decided, or agreed upon…"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !selectedTaskId || !body.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Log Communication"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CommunicationsPage() {
  const [entries, setEntries]           = useState<AggregatedClientNote[]>([]);
  const [clients, setClients]           = useState<MasterClient[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeSource, setActiveSource] = useState<"All" | ClientCommSource>("All");
  const [clientFilter, setClientFilter] = useState<string>("All");
  const [showModal, setShowModal]       = useState(false);
  const [modalClientId, setModalClientId] = useState<string | undefined>(undefined);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/communications");
      const data = (await res.json()) as { entries: AggregatedClientNote[] };
      setEntries(data.entries ?? []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const res = await fetch("/api/master-clients");
      const data = (await res.json()) as { clients: MasterClient[] };
      setClients(data.clients ?? []);
    } catch {
      setClients([]);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
    void loadClients();
  }, [loadEntries, loadClients]);

  // ── Filters ──────────────────────────────────────────────────────────────
  const clientsWithEntries = Array.from(
    new Map(entries.map((e) => [e.clientId, e.clientName])).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const filtered = entries.filter((e) => {
    const matchSource = activeSource === "All" || e.source === activeSource;
    const matchClient = clientFilter === "All" || e.clientId === clientFilter;
    return matchSource && matchClient;
  });

  // Count per source (after client filter)
  const countsBySource = (entries.filter(
    (e) => clientFilter === "All" || e.clientId === clientFilter
  )).reduce<Record<string, number>>((acc, e) => {
    acc[e.source] = (acc[e.source] ?? 0) + 1;
    return acc;
  }, {});

  const countAfterClientFilter = entries.filter(
    (e) => clientFilter === "All" || e.clientId === clientFilter
  ).length;

  // KPIs
  const uniqueClients = new Set(filtered.map((e) => e.clientId)).size;
  const uniqueTasks   = new Set(filtered.map((e) => e.taskId)).size;
  const latestDate    = filtered.length > 0 ? filtered[0].createdAt : null;

  function openLog(clientId?: string) {
    setModalClientId(clientId);
    setShowModal(true);
  }

  function handleModalSaved() {
    setShowModal(false);
    void loadEntries();
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Client Communications
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Aggregated communication history across all clients and tasks — pulled from the live Collaboration Hub.
            </p>
          </div>
          <button
            onClick={() => openLog(clientFilter !== "All" ? clientFilter : undefined)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Log Communication
          </button>
        </div>

        {/* ── KPI Row ──────────────────────────────────────────────────────── */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard
              label="Total Notes"
              value={filtered.length}
              accent="text-gray-900"
            />
            <KPICard
              label="Clients Covered"
              value={uniqueClients}
              accent="text-blue-700"
            />
            <KPICard
              label="Tasks Referenced"
              value={uniqueTasks}
              accent="text-violet-700"
            />
            <KPICard
              label="Last Activity"
              value={
                latestDate
                  ? new Date(latestDate).toLocaleDateString("en-US", {
                      month: "short",
                      day:   "numeric",
                    })
                  : "—"
              }
              accent="text-gray-600"
            />
          </div>
        )}

        {/* ── Client Filter ─────────────────────────────────────────────────── */}
        {!loading && clientsWithEntries.length > 1 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Client:</span>
            <button
              onClick={() => setClientFilter("All")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                clientFilter === "All"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
              <span className={`ml-1.5 text-xs rounded-full px-1.5 font-semibold ${
                clientFilter === "All" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {entries.length}
              </span>
            </button>
            {clientsWithEntries.map(([cid, name]) => {
              const cnt = entries.filter((e) => e.clientId === cid).length;
              return (
                <button
                  key={cid}
                  onClick={() => setClientFilter(cid)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    clientFilter === cid
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {name}
                  <span className={`ml-1.5 text-xs rounded-full px-1.5 font-semibold ${
                    clientFilter === cid ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {cnt}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Source Filter Tabs ────────────────────────────────────────────── */}
        {!loading && (
          <div className="flex flex-wrap gap-2">
            {(["All", ...ALL_SOURCES] as Array<"All" | ClientCommSource>).map((tab) => {
              const isActive = activeSource === tab;
              const cnt = tab === "All" ? countAfterClientFilter : (countsBySource[tab] ?? 0);
              const dot = tab !== "All" ? SOURCE_DOT[tab as ClientCommSource] : null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSource(tab)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {dot && (
                    <span
                      className={`w-2 h-2 rounded-full ${isActive ? "bg-white opacity-80" : dot}`}
                    />
                  )}
                  {tab}
                  <span
                    className={`text-xs rounded-full px-1.5 py-0 font-semibold ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {cnt}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Timeline ──────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Communication Timeline
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 h-28 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              message={
                entries.length === 0
                  ? "No client notes logged yet. Use 'Log Communication' to add the first entry."
                  : "No communications match the selected filters."
              }
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-gray-300 transition-colors"
                >
                  {/* Card top row: source badge + timestamp */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <SourceBadge source={entry.source} />
                      {/* Client badge when in "All clients" mode */}
                      {clientFilter === "All" && (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700"
                          style={{ borderLeft: `3px solid ${entry.avatarColor}` }}
                        >
                          {entry.clientName}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium shrink-0">
                      {formatDateTime(entry.createdAt)}
                    </span>
                  </div>

                  {/* Author row */}
                  <div className="mt-3 flex items-center gap-2.5">
                    <Avatar initials={entry.authorInitials || getInitials(entry.authorName)} color={entry.authorColor} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-semibold text-gray-900">{entry.authorName}</span>
                        {entry.assignedAM && entry.assignedAM !== entry.authorName && (
                          <>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500">AM: {entry.assignedAM}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {entry.taskTitle}
                        <span className="mx-1 text-gray-300">·</span>
                        {entry.projectName}
                      </p>
                    </div>
                  </div>

                  {/* Note body */}
                  <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {entry.body}
                  </p>

                  {/* Footer: task + project links */}
                  <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-xs text-gray-400">
                      <span className="font-medium text-gray-500">Task:</span> {entry.taskTitle}
                    </span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400">
                      <span className="font-medium text-gray-500">Project:</span> {entry.projectName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Data Source Attribution ───────────────────────────────────────── */}
        {!loading && entries.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <svg
              className="w-3.5 h-3.5 text-gray-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <p className="text-xs text-gray-400">
              All entries are real ClientNotes from the Collaboration Hub persistence layer
              ({entries.length} note{entries.length !== 1 ? "s" : ""} across{" "}
              {new Set(entries.map((e) => e.taskId)).size} task
              {new Set(entries.map((e) => e.taskId)).size !== 1 ? "s" : ""}).
              Logged notes are visible in the source task&apos;s Collaboration Hub drawer.
            </p>
          </div>
        )}

        {/* ── Empty state when collaboration-store has no notes at all ─────── */}
        {!loading && entries.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">No client notes logged yet</p>
            <p className="text-xs text-gray-400 mb-4">
              This page shows real ClientNotes from the Collaboration Hub.
              Click &ldquo;Log Communication&rdquo; to add the first entry — it will also appear
              in the relevant task&apos;s Collaboration Hub drawer.
            </p>
            <button
              onClick={() => openLog()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Log First Communication
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {showModal && (
        <LogCommunicationModal
          clients={clients}
          onClose={() => setShowModal(false)}
          onSaved={handleModalSaved}
          defaultClientId={modalClientId}
        />
      )}
    </div>
  );
}
