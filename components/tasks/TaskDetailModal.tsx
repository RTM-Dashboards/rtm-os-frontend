"use client";

import { useEffect } from "react";
import type { Task, Deliverable } from "@/lib/tasks/types";
import TaskStatusBadge from "./TaskStatusBadge";
import PriorityBadge from "./PriorityBadge";
import UserAvatarStack from "./UserAvatarStack";

interface Props {
  task: Task | null;
  deliverable?: Deliverable;
  onClose: () => void;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider"style={{ color: "var(--rtm-text-muted)"}}>
        {label}
      </span>
      <div className="text-sm"style={{ color: "var(--rtm-text-primary)"}}>
        {children}
      </div>
    </div>
  );
}

export default function TaskDetailModal({ task, deliverable, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"style={{ background: "rgba(14,32,85,0.55)", backdropFilter: "blur(4px)"}}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-start justify-between gap-4 sticky top-0 z-10"style={{
            background: "var(--rtm-surface)",
            borderBottom: "1px solid var(--rtm-border)",
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1"style={{ color: "var(--rtm-text-muted)"}}>
              {task.department}
            </p>
            <h2 className="text-lg font-bold leading-snug"style={{ color: "var(--rtm-text-primary)"}}>
              {task.title}
            </h2>
            {deliverable && (
              <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>
                In deliverable: <span className="font-semibold">{deliverable.title}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors flex-shrink-0"style={{ color: "var(--rtm-text-secondary)"}}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-xlight)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Close">
            <svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
              <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Status & Priority */}
          <div className="flex flex-wrap gap-2">
            <TaskStatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-sm"style={{ color: "var(--rtm-text-secondary)", lineHeight: "1.6"}}>
                {task.description}
              </p>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}>
            <InfoRow label="Start Date">{formatDate(task.startDate)}</InfoRow>
            <InfoRow label="Due Date">
              <span style={{ color: task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done"? "#DC2626": "inherit"}}>
                {formatDate(task.dueDate)}
              </span>
            </InfoRow>
            <InfoRow label="Department">{task.department}</InfoRow>
            <InfoRow label="Assignees">
              <div className="flex items-center gap-2 pt-0.5">
                <UserAvatarStack users={task.assignees} size="sm"max={4} />
                <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                  {task.assignees.map((u) => u.name).join(", ")}
                </span>
              </div>
            </InfoRow>
            {task.tags.length > 0 && (
              <InfoRow label="Tags">
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {task.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-medium"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}>
                      {tag}
                    </span>
                  ))}
                </div>
              </InfoRow>
            )}
          </div>

          {/* Blockers */}
          {task.blockers.length > 0 && (
            <div>
              <h3 className="text-sm font-bold mb-2 flex items-center gap-2"style={{ color: "#DC2626"}}>
                <span></span> Blockers
              </h3>
              <div className="space-y-2">
                {task.blockers.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-lg text-sm"style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626"}}
                  >
                    <p className="font-medium">{b.description}</p>
                    <p className="text-xs mt-1"style={{ color: "#EF4444"}}>
                      Raised: {formatDate(b.raisedAt)}
                      {b.resolvedAt && ` · Resolved: ${formatDate(b.resolvedAt)}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal Notes */}
          {task.notes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold mb-2"style={{ color: "var(--rtm-text-primary)"}}>
                 Internal Notes
              </h3>
              <div className="space-y-2">
                {task.notes.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold"style={{ color: "var(--rtm-blue)"}}>{note.authorName}</span>
                      <span className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{note.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
