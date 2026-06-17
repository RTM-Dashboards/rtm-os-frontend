"use client";

// ─────────────────────────────────────────────────────────────────────────────
// RTM OS — Shared collaboration UI helpers
// ─────────────────────────────────────────────────────────────────────────────

import type { ApprovalStatus, AttachmentStatus, DependencyStatus } from "@/lib/collaboration/types";

// ── Avatar ────────────────────────────────────────────────────────────────────

interface AvatarProps {
  initials: string;
  color: string;
  size?: "xs" | "sm" | "md";
  title?: string;
}

export function Avatar({ initials, color, size = "sm", title }: AvatarProps) {
  const sz = size === "xs" ? "w-6 h-6 text-[10px]" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      title={title}
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

// ── Relative time ─────────────────────────────────────────────────────────────

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Priority badge ────────────────────────────────────────────────────────────

type Priority = "Low" | "Medium" | "High" | "Urgent";

export function PriorityDot({ priority }: { priority: Priority }) {
  const colors: Record<Priority, string> = {
    Low: "#6B7280",
    Medium: "#D97706",
    High: "#DC2626",
    Urgent: "#7C2D12",
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
      style={{ background: colors[priority] }}
    >
      {priority}
    </span>
  );
}

// ── Approval status badge ─────────────────────────────────────────────────────

export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const map: Record<ApprovalStatus, { bg: string; color: string; label: string }> = {
    "Pending Review":   { bg: "#FEF3C7", color: "#92400E", label: "Pending Review" },
    "Pending Approval": { bg: "#DBEAFE", color: "#1E40AF", label: "Pending Approval" },
    "Approved":         { bg: "#D1FAE5", color: "#065F46", label: "Approved" },
    "Rejected":         { bg: "#FEE2E2", color: "#991B1B", label: "Rejected" },
    "Needs Revision":   { bg: "#FEF9C3", color: "#92400E", label: "Needs Revision" },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ── Dependency status badge ───────────────────────────────────────────────────

export function DepStatusBadge({ status }: { status: DependencyStatus }) {
  const map: Record<DependencyStatus, { bg: string; color: string }> = {
    Satisfied:  { bg: "#D1FAE5", color: "#065F46" },
    Pending:    { bg: "#FEF3C7", color: "#92400E" },
    Blocked:    { bg: "#FEE2E2", color: "#991B1B" },
    Escalated:  { bg: "#F3E8FF", color: "#6B21A8" },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

// ── Attachment status badge ───────────────────────────────────────────────────

export function AttachmentStatusBadge({ status }: { status: AttachmentStatus }) {
  const map: Record<AttachmentStatus, { bg: string; color: string }> = {
    Active:     { bg: "#D1FAE5", color: "#065F46" },
    Superseded: { bg: "#FEF3C7", color: "#92400E" },
    Archived:   { bg: "#F3F4F6", color: "#6B7280" },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

// ── File type icon ────────────────────────────────────────────────────────────

export function FileIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    pdf: "📄",
    docx: "📝",
    xlsx: "📊",
    csv: "📊",
    png: "🖼️",
    jpg: "🖼️",
    mp4: "🎥",
    zip: "📦",
  };
  return <span>{icons[type] ?? "📁"}</span>;
}

// ── File size ─────────────────────────────────────────────────────────────────

export function formatFileSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

// ── Mention badge ─────────────────────────────────────────────────────────────

export function MentionBadge({ label, kind }: { label: string; kind: string }) {
  const color = kind === "user" ? "#1B4FD8" : kind === "department" ? "#7C3AED" : "#059669";
  return (
    <span
      className="inline-flex items-center px-1.5 py-0 rounded text-[11px] font-semibold"
      style={{ background: `${color}18`, color }}
    >
      {label}
    </span>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
      {children}
    </h3>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function EmptyTab({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>{message}</p>
    </div>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────────

export function CollabCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
    >
      {children}
    </div>
  );
}
