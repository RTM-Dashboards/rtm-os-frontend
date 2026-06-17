"use client";

import type { ApprovalStep } from "@/lib/collaboration/types";
import { Avatar, ApprovalBadge, formatDateTime, EmptyTab } from "../CollabUtils";

interface Props {
  approvals: ApprovalStep[];
}

export default function ApprovalsTab({ approvals }: Props) {
  if (!approvals.length) return <EmptyTab icon="✅" message="No approvals on this task yet." />;

  const pending = approvals.filter((a) => a.status === "Pending Approval" || a.status === "Pending Review" || a.status === "Needs Revision");
  const completed = approvals.filter((a) => a.status === "Approved" || a.status === "Rejected");

  return (
    <div className="space-y-6">
      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            Pending ({pending.length})
          </p>
          <div className="space-y-3">
            {pending.map((a) => <ApprovalCard key={a.id} approval={a} />)}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            Completed ({completed.length})
          </p>
          <div className="space-y-3">
            {completed.map((a) => <ApprovalCard key={a.id} approval={a} />)}
          </div>
        </div>
      )}

      {/* Request New */}
      <div
        className="p-4 rounded-xl"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>
          Request New Approval
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Step Name</label>
            <input
              type="text"
              placeholder="e.g. Content Approval"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Approver</label>
            <input
              type="text"
              placeholder="Select approver"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            />
          </div>
        </div>
        <textarea
          rows={2}
          placeholder="Notes for the approver (optional)"
          className="w-full mt-3 resize-none rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)" }}
        />
        <div className="flex justify-end mt-2">
          <button
            className="text-xs px-4 py-1.5 rounded-lg font-semibold text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            Request Approval
          </button>
        </div>
      </div>
    </div>
  );
}

function ApprovalCard({ approval }: { approval: ApprovalStep }) {
  const isComplete = approval.status === "Approved" || approval.status === "Rejected";

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--rtm-surface)",
        border: `1px solid ${isComplete ? "var(--rtm-border)" : "#BFDBFE"}`,
        boxShadow: isComplete ? "none" : "0 0 0 3px #EBF0FD",
      }}
    >
      {/* Step + Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{approval.stepName}</p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            Requested: {formatDateTime(approval.requestedAt)}
          </p>
        </div>
        <ApprovalBadge status={approval.status} />
      </div>

      {/* People */}
      <div className="flex flex-wrap gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Avatar initials={approval.approverInitials} color={approval.approverColor} size="xs" />
          <div>
            <p className="text-[11px] font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{approval.approver}</p>
            <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Approver</p>
          </div>
        </div>
        {approval.reviewer && approval.reviewerInitials && approval.reviewerColor && (
          <div className="flex items-center gap-2">
            <Avatar initials={approval.reviewerInitials} color={approval.reviewerColor} size="xs" />
            <div>
              <p className="text-[11px] font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{approval.reviewer}</p>
              <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Reviewer</p>
            </div>
          </div>
        )}
      </div>

      {/* Decision */}
      {approval.decision && (
        <div
          className="p-3 rounded-lg mb-3"
          style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}
        >
          <p className="text-[11px] font-semibold mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>Decision</p>
          <p className="text-sm" style={{ color: "var(--rtm-text-primary)" }}>{approval.decision}</p>
        </div>
      )}

      {/* Notes */}
      {approval.notes && (
        <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
          📝 {approval.notes}
        </p>
      )}

      {/* Completion */}
      {approval.completedAt && (
        <p className="text-[10px] mt-2" style={{ color: "var(--rtm-text-muted)" }}>
          Completed: {formatDateTime(approval.completedAt)}
        </p>
      )}

      {/* Action buttons for pending */}
      {!isComplete && (
        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--rtm-border-light)" }}>
          <button
            className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
            style={{ background: "#059669" }}
          >
            ✓ Approve
          </button>
          <button
            className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
            style={{ background: "#DC2626" }}
          >
            ✕ Reject
          </button>
          <button
            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{ background: "#FEF3C7", color: "#92400E" }}
          >
            ↩ Request Revision
          </button>
        </div>
      )}
    </div>
  );
}
