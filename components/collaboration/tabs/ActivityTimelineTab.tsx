"use client";

import type { ActivityEvent, ActivityEventType } from "@/lib/collaboration/types";
import { Avatar, formatDateTime } from "../CollabUtils";

interface Props {
  activity: ActivityEvent[];
}

// Short labels used in the dot/icon — no emoji
const EVENT_CONFIG: Record<ActivityEventType, { abbr: string; color: string; label: string }> = {
  "Task Created":        { abbr: "TC", color: "#059669", label: "Task created"},
  "Task Assigned":       { abbr: "TA", color: "#1d709f", label: "Task assigned"},
  "Task Reassigned":     { abbr: "TR", color: "#D97706", label: "Task reassigned"},
  "Status Changed":      { abbr: "SC", color: "#0891B2", label: "Status changed"},
  "Comment Added":       { abbr: "CA", color: "#7C3AED", label: "Comment added"},
  "Attachment Uploaded": { abbr: "AU", color: "#1d709f", label: "File uploaded"},
  "Approval Requested":  { abbr: "AR", color: "#D97706", label: "Approval requested"},
  "Approval Completed":  { abbr: "AC", color: "#059669", label: "Approval completed"},
  "Dependency Added":    { abbr: "DA", color: "#6B7280", label: "Dependency added"},
  "Dependency Removed":  { abbr: "DR", color: "#6B7280", label: "Dependency removed"},
  "Due Date Changed":    { abbr: "DC", color: "#DC2626", label: "Due date changed"},
  "Task Completed":      { abbr: "CP", color: "#059669", label: "Task completed"},
  "Note Added":          { abbr: "NA", color: "#92400E", label: "Note added"},
  "Watcher Added":       { abbr: "WA", color: "#6B7280", label: "Watcher added"},
  "Watcher Removed":     { abbr: "WR", color: "#6B7280", label: "Watcher removed"},
  "Mention Added":       { abbr: "@",  color: "#7C3AED", label: "Mentioned someone"},
  "Blocker Added":       { abbr: "BL", color: "#DC2626", label: "Blocker added"},
  "Blocker Resolved":    { abbr: "BR", color: "#059669", label: "Blocker resolved"},
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
    case "Mention Added":       return `Mentioned ${meta?.mentioned ?? "someone"}`;
    case "Blocker Added":       return `Blocker added: ${meta?.reason ?? "reason unknown"}`;
    default:                    return cfg.label;
  }
}

export default function ActivityTimelineTab({ activity }: Props) {
  if (!activity.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}
        >
          <svg className="w-5 h-5"style={{ color: "var(--rtm-border)"}} fill="none"stroke="currentColor"viewBox="0 0 24 24">
            <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activity.map((event, idx) => {
        const cfg = EVENT_CONFIG[event.eventType] ?? { abbr: "?", color: "#6B7280", label: event.eventType };
        const isLast = idx === activity.length - 1;

        return (
          <div key={event.id} className="flex gap-3">
            {/* Timeline column */}
            <div className="flex flex-col items-center flex-shrink-0"style={{ width: 32 }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white z-10"style={{ background: cfg.color }}
              >
                {cfg.abbr}
              </div>
              {!isLast && (
                <div className="flex-1 w-px mt-1"style={{ background: "var(--rtm-border-light)", minHeight: 16 }} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Avatar initials={event.userInitials} color={event.userColor} size="xs"/>
                <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                  {event.userName}
                </span>
                <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                  {buildEventText(event)}
                </span>
              </div>
              {event.notes && (
                <p
                  className="mt-1 ml-8 text-xs leading-relaxed px-2 py-1.5 rounded-lg"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border-light)"}}
                >
                  {event.notes}
                </p>
              )}
              <p className="mt-0.5 ml-8 text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
                {formatDateTime(event.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
