"use client";

import type { ActivityEvent, ActivityEventType } from "@/lib/collaboration/types";
import { Avatar, formatDateTime } from "../CollabUtils";

interface Props {
  activity: ActivityEvent[];
}

const EVENT_CONFIG: Record<ActivityEventType, { icon: string; color: string; label: string }> = {
  "Task Created":        { icon: "✨", color: "#059669", label: "Task created" },
  "Task Assigned":       { icon: "👤", color: "#1B4FD8", label: "Task assigned" },
  "Task Reassigned":     { icon: "🔄", color: "#D97706", label: "Task reassigned" },
  "Status Changed":      { icon: "🔵", color: "#0891B2", label: "Status changed" },
  "Comment Added":       { icon: "💬", color: "#7C3AED", label: "Comment added" },
  "Attachment Uploaded": { icon: "📎", color: "#1B4FD8", label: "File uploaded" },
  "Approval Requested":  { icon: "⏳", color: "#D97706", label: "Approval requested" },
  "Approval Completed":  { icon: "✅", color: "#059669", label: "Approval completed" },
  "Dependency Added":    { icon: "🔗", color: "#6B7280", label: "Dependency added" },
  "Dependency Removed":  { icon: "🔓", color: "#6B7280", label: "Dependency removed" },
  "Due Date Changed":    { icon: "📅", color: "#DC2626", label: "Due date changed" },
  "Task Completed":      { icon: "🏁", color: "#059669", label: "Task completed" },
  "Note Added":          { icon: "📝", color: "#92400E", label: "Note added" },
  "Watcher Added":       { icon: "👁️", color: "#6B7280", label: "Watcher added" },
  "Watcher Removed":     { icon: "🚫", color: "#6B7280", label: "Watcher removed" },
  "Mention Added":       { icon: "@",  color: "#7C3AED", label: "Mentioned someone" },
  "Blocker Added":       { icon: "🚫", color: "#DC2626", label: "Blocker added" },
  "Blocker Resolved":    { icon: "✓",  color: "#059669", label: "Blocker resolved" },
};

function buildEventText(event: ActivityEvent): string {
  const cfg = EVENT_CONFIG[event.eventType];
  const { meta } = event;
  switch (event.eventType) {
    case "Task Assigned":       return `${cfg.label} to ${meta?.assignee ?? "someone"}`;
    case "Task Reassigned":     return `${cfg.label} to ${meta?.assignee ?? "someone"}`;
    case "Status Changed":      return `Status changed from ${meta?.from ?? "—"} to ${meta?.to ?? "—"}`;
    case "Due Date Changed":    return `Due date changed from ${meta?.from ?? "—"} to ${meta?.to ?? "—"}`;
    case "Watcher Added":       return `${meta?.watcher ?? "Someone"} added as watcher`;
    case "Attachment Uploaded": return `File uploaded: ${meta?.file ?? "attachment"}`;
    case "Mention Added":       return `Mentioned ${meta?.mentioned ?? "someone"} in a comment`;
    default:                    return event.notes ?? cfg.label;
  }
}

export default function ActivityTimelineTab({ activity }: Props) {
  if (!activity.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <span className="text-4xl">📋</span>
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No activity recorded yet.</p>
      </div>
    );
  }

  const sorted = [...activity].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-0">
      {sorted.map((event, idx) => {
        const cfg = EVENT_CONFIG[event.eventType] ?? { icon: "•", color: "#6B7280", label: event.eventType };
        const isLast = idx === sorted.length - 1;
        return (
          <div key={event.id} className="flex items-start gap-4">
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center gap-0 flex-shrink-0" style={{ width: 32 }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white z-10 flex-shrink-0"
                style={{ background: cfg.color }}
              >
                {cfg.icon}
              </div>
              {!isLast && <div className="w-0.5 flex-1 min-h-[20px]" style={{ background: "var(--rtm-border)", margin: "0 auto" }} />}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-4 ${isLast ? "" : ""}`}>
              <div className="flex items-start gap-2 pt-1">
                <Avatar initials={event.userInitials} color={event.userColor} size="xs" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                      {event.userName}
                    </span>
                    <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                      {buildEventText(event)}
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    {formatDateTime(event.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
