"use client";

import type { TaskAttachment } from "@/lib/collaboration/types";
import { Avatar, AttachmentStatusBadge, FileIcon, formatDate, formatFileSize, EmptyTab } from "../CollabUtils";

interface Props {
  attachments: TaskAttachment[];
}

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Report:         { bg: "#DBEAFE", color: "#1E40AF"},
  Proposal:       { bg: "#F3E8FF", color: "#6B21A8"},
  Contract:       { bg: "#D1FAE5", color: "#065F46"},
  "Creative Asset": { bg: "#FCE7F3", color: "#9D174D"},
  Screenshot:     { bg: "#E0F2FE", color: "#0369A1"},
  Audit:          { bg: "#FEF3C7", color: "#92400E"},
  "Access Request": { bg: "#FEE2E2", color: "#991B1B"},
  Spreadsheet:    { bg: "#D1FAE5", color: "#065F46"},
  Video:          { bg: "#F3E8FF", color: "#6B21A8"},
  Other:          { bg: "#F3F4F6", color: "#6B7280"},
};

export default function AttachmentsTab({ attachments }: Props) {
  if (!attachments.length) return <EmptyTab message="No attachments yet. Upload files to this task."/>;

  const active = attachments.filter((a) => a.status === "Active");
  const superseded = attachments.filter((a) => a.status !== "Active");

  return (
    <div className="space-y-5">
      {/* Active Attachments */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>
          Active Files ({active.length})
        </p>
        <div className="space-y-2">
          {active.map((att) => <AttachmentRow key={att.id} att={att} />)}
        </div>
      </div>

      {/* Superseded / Archived */}
      {superseded.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>
            Older Versions ({superseded.length})
          </p>
          <div className="space-y-2 opacity-60">
            {superseded.map((att) => <AttachmentRow key={att.id} att={att} />)}
          </div>
        </div>
      )}

      {/* Upload zone */}
      <div
        className="flex flex-col items-center gap-2 py-8 rounded-xl border-2 border-dashed cursor-pointer"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)"}}
      >
        
        <p className="text-sm font-medium">Drop files here or click to upload</p>
        <p className="text-xs">PDF, DOCX, XLSX, PNG, JPG, MP4, ZIP</p>
      </div>
    </div>
  );
}

function AttachmentRow({ att }: { att: TaskAttachment }) {
  const catStyle = CATEGORY_COLORS[att.category] ?? CATEGORY_COLORS["Other"];
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
    >
      {/* File Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"style={{ background: "var(--rtm-bg)"}}
      >
        <FileIcon type={att.fileType} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="text-sm font-semibold truncate"style={{ color: "var(--rtm-text-primary)"}}>
            {att.fileName}
          </p>
          <AttachmentStatusBadge status={att.status} />
          <span
            className="px-2 py-0.5 rounded text-[10px] font-semibold"style={{ background: catStyle.bg, color: catStyle.color }}
          >
            {att.category}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>
          <span className="flex items-center gap-1">
            <Avatar initials={att.uploadedByInitials} color={att.uploadedByColor} size="xs"/>
            {att.uploadedBy}
          </span>
          <span>·</span>
          <span>{formatDate(att.uploadDate)}</span>
          <span>·</span>
          <span>{formatFileSize(att.sizeKB)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          className="text-xs px-3 py-1.5 rounded-lg font-medium"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
        >
          Download
        </button>
      </div>
    </div>
  );
}
