"use client";

import { useState, useTransition } from "react";
import type { TaskWatcher } from "@/lib/collaboration/types";
import { Avatar, EmptyTab } from "../CollabUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Current-user stub
// ─────────────────────────────────────────────────────────────────────────────
const CURRENT_USER = {
  id:         "current-user",
  name:       "You",
  initials:   "YO",
  color:      "#1d709f",
  role:       "Team Member",
  department: "General",
};

// ── API helpers ───────────────────────────────────────────────────────────────

async function apiPatchWatcher(
  taskId: string,
  watcherId: string,
  patch: Record<string, unknown>
): Promise<TaskWatcher> {
  const res = await fetch(
    `/api/collaboration?taskId=${encodeURIComponent(taskId)}&resource=watchers&id=${encodeURIComponent(watcherId)}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) }
  );
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { watcher: TaskWatcher };
  return data.watcher;
}

async function apiAddWatcher(
  taskId: string,
  watcher: Omit<TaskWatcher, "id">
): Promise<TaskWatcher> {
  const res = await fetch(
    `/api/collaboration?taskId=${encodeURIComponent(taskId)}&resource=watchers`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(watcher) }
  );
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { watcher: TaskWatcher };
  return data.watcher;
}

// ─────────────────────────────────────────────────────────────────────────────
// Watcher row — toggle watching state for persisted watchers
// ─────────────────────────────────────────────────────────────────────────────

function WatcherRow({
  watcher,
  taskId,
  onUpdate,
}: {
  watcher: TaskWatcher;
  taskId: string;
  onUpdate: (updated: TaskWatcher) => void;
}) {
  const [pending, startToggle] = useTransition();

  function handleToggle() {
    startToggle(async () => {
      try {
        const updated = await apiPatchWatcher(taskId, watcher.id, { watching: !watcher.watching });
        onUpdate(updated);
      } catch { /* silent */ }
    });
  }

  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl"
      style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
    >
      <div className="flex items-center gap-3">
        <Avatar initials={watcher.initials} color={watcher.avatarColor} size="sm" />
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{watcher.name}</p>
          <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
            {watcher.role} · {watcher.department}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={pending}
        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
        style={{
          background: watcher.watching ? "var(--rtm-blue-light)" : "var(--rtm-bg)",
          color:      watcher.watching ? "var(--rtm-blue)"       : "var(--rtm-text-muted)",
          border:     "1px solid var(--rtm-border)",
          opacity:    pending ? 0.5 : 1,
          cursor:     pending ? "not-allowed" : "pointer",
        }}
      >
        {pending ? "…" : watcher.watching ? "Watching" : "+ Watch"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main tab
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  taskId: string;
  watchers: TaskWatcher[];
  onWatchersChange: (watchers: TaskWatcher[]) => void;
}

export default function WatchersTab({ taskId, watchers, onWatchersChange }: Props) {
  const [selfPending, startSelf] = useTransition();
  const [selfErr,     setSelfErr] = useState("");

  const active   = watchers.filter((w) => w.watching);
  const inactive = watchers.filter((w) => !w.watching);

  // Check if "You" (current-user) is already watching
  const selfWatcher = watchers.find((w) => w.id === CURRENT_USER.id || w.name === CURRENT_USER.name);
  const selfWatching = selfWatcher?.watching ?? false;

  // ── Update one watcher in list ─────────────────────────────────────────────
  function handleUpdate(updated: TaskWatcher) {
    onWatchersChange(watchers.map((w) => (w.id === updated.id ? updated : w)));
  }

  // ── Toggle "Watch This Task" for current user ──────────────────────────────
  function handleSelfToggle() {
    setSelfErr("");
    startSelf(async () => {
      try {
        if (selfWatcher) {
          // Already in list — toggle watching
          const updated = await apiPatchWatcher(taskId, selfWatcher.id, { watching: !selfWatching });
          onWatchersChange(watchers.map((w) => (w.id === updated.id ? updated : w)));
        } else {
          // Not in list yet — add
          const added = await apiAddWatcher(taskId, {
            name:        CURRENT_USER.name,
            initials:    CURRENT_USER.initials,
            avatarColor: CURRENT_USER.color,
            role:        CURRENT_USER.role,
            department:  CURRENT_USER.department,
            watching:    true,
          });
          onWatchersChange([...watchers, added]);
        }
      } catch {
        setSelfErr("Could not update watcher status. Try again.");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Empty state */}
      {watchers.length === 0 && (
        <EmptyTab message="No watchers on this task yet." />
      )}

      {/* Watching */}
      {active.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            Watching ({active.length})
          </p>
          <div className="space-y-2">
            {active.map((w) => (
              <WatcherRow key={w.id} watcher={w} taskId={taskId} onUpdate={handleUpdate} />
            ))}
          </div>
        </div>
      )}

      {/* Not watching */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            Not Watching ({inactive.length})
          </p>
          <div className="space-y-2 opacity-70">
            {inactive.map((w) => (
              <WatcherRow key={w.id} watcher={w} taskId={taskId} onUpdate={handleUpdate} />
            ))}
          </div>
        </div>
      )}

      {/* About + self-watch action */}
      <div
        className="p-4 rounded-xl text-sm"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
      >
        <p className="font-semibold mb-1" style={{ color: "var(--rtm-text-primary)" }}>About Watchers</p>
        <p className="text-xs leading-relaxed">
          Watchers receive notifications when comments, approvals, attachments, or status changes occur on this task.
          Anyone can watch or unwatch a task at any time.
        </p>
        {selfErr && <p className="text-[10px] text-red-500 mt-2">{selfErr}</p>}
        <div className="mt-3">
          <button
            onClick={handleSelfToggle}
            disabled={selfPending}
            className="text-xs px-4 py-1.5 rounded-lg font-semibold text-white transition-opacity"
            style={{
              background: selfWatching ? "#6B7280" : "var(--rtm-blue)",
              opacity: selfPending ? 0.5 : 1,
              cursor: selfPending ? "not-allowed" : "pointer",
            }}
          >
            {selfPending ? "…" : selfWatching ? "Unwatch This Task" : "+ Watch This Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
