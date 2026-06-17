"use client";

import type { TaskWatcher } from "@/lib/collaboration/types";
import { Avatar, EmptyTab } from "../CollabUtils";

interface Props {
  watchers: TaskWatcher[];
}

export default function WatchersTab({ watchers }: Props) {
  const active = watchers.filter((w) => w.watching);
  const inactive = watchers.filter((w) => !w.watching);

  if (!watchers.length) return <EmptyTab icon="👁️" message="No watchers on this task yet." />;

  return (
    <div className="space-y-5">
      {/* Watching */}
      {active.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            Watching ({active.length})
          </p>
          <div className="space-y-2">
            {active.map((w) => <WatcherRow key={w.id} watcher={w} />)}
          </div>
        </div>
      )}

      {/* Not watching */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            Not Watching ({inactive.length})
          </p>
          <div className="space-y-2 opacity-60">
            {inactive.map((w) => <WatcherRow key={w.id} watcher={w} />)}
          </div>
        </div>
      )}

      {/* Explain */}
      <div
        className="p-4 rounded-xl text-sm"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
      >
        <p className="font-semibold mb-1" style={{ color: "var(--rtm-text-primary)" }}>About Watchers</p>
        <p className="text-xs leading-relaxed">
          Watchers receive notifications when comments, approvals, attachments, or status changes occur on this task.
          Anyone can watch or unwatch a task at any time.
        </p>
        <button
          className="mt-3 text-xs px-4 py-1.5 rounded-lg font-semibold text-white"
          style={{ background: "var(--rtm-blue)" }}
        >
          + Watch This Task
        </button>
      </div>
    </div>
  );
}

function WatcherRow({ watcher }: { watcher: TaskWatcher }) {
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
        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
        style={{
          background: watcher.watching ? "var(--rtm-blue-light)" : "var(--rtm-bg)",
          color: watcher.watching ? "var(--rtm-blue)" : "var(--rtm-text-muted)",
          border: "1px solid var(--rtm-border)",
        }}
      >
        {watcher.watching ? "👁️ Watching" : "+ Watch"}
      </button>
    </div>
  );
}
