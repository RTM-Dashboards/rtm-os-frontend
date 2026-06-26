"use client";

import { useState, useEffect, useRef } from "react";
import type { WorkspaceTask, WorkspaceTaskStatus } from "./WorkspaceTaskPage";

// ─────────────────────────────────────────────────────────────────────────────
// WorkspaceTaskDrawer
//
// Self-contained right-side task detail drawer for department workspace views.
// Uses WorkspaceTask data directly — no dependency on the global collaboration
// module. All actions are mock-only. Permission logic is role-aware UI only.
//
// Tabs: Overview | Checklist | Notes | Comments | Dependencies | Files |
//       Activity | Workflow
// ─────────────────────────────────────────────────────────────────────────────

// ── Role model (mock only) ────────────────────────────────────────────────────

export type WorkspaceUserRole =
  | "department-member"
  | "department-lead"
  | "manager"
  | "executive";

export interface WorkspaceUserContext {
  role: WorkspaceUserRole;
  name: string;
  department: string;
  hasProjectAccess: boolean;
}

// ── Tab IDs ───────────────────────────────────────────────────────────────────

type TabId =
  | "overview"
  | "checklist"
  | "notes"
  | "comments"
  | "dependencies"
  | "files"
  | "activity"
  | "workflow";

// ── Status options for update ─────────────────────────────────────────────────

const STATUS_OPTIONS: WorkspaceTaskStatus[] = [
  "Pending",
  "In Progress",
  "In Review",
  "Blocked",
  "Done",
];

// Extended statuses shown in the drawer update panel
const EXTENDED_STATUSES = [
  "Open",
  "In Progress",
  "Waiting on Client",
  "Waiting on Department",
  "Review",
  "Blocked",
  "Done",
] as const;
type ExtendedStatus = typeof EXTENDED_STATUSES[number];

// ── Design tokens ─────────────────────────────────────────────────────────────

const COLORS = {
  border:   "var(--rtm-border, #e2e8f0)",
  surface:  "var(--rtm-surface, #fff)",
  bg:       "var(--rtm-bg, #f8fafc)",
  primary:  "var(--rtm-text-primary, #1e293b)",
  secondary:"var(--rtm-text-secondary, #475569)",
  muted:    "var(--rtm-text-muted, #94a3b8)",
  blue:     "var(--rtm-blue, #1B4FD8)",
  blueBg:   "var(--rtm-blue-xlight, #eff6ff)",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Open:                  { bg: "#f1f5f9", text: "#475569",  dot: "#94a3b8" },
  Pending:               { bg: "#f1f5f9", text: "#475569",  dot: "#94a3b8" },
  "In Progress":         { bg: "#dbeafe", text: "#1d4ed8",  dot: "#3b82f6" },
  "Waiting on Client":   { bg: "#fef3c7", text: "#b45309",  dot: "#f59e0b" },
  "Waiting on Department":{ bg: "#fef9c3", text: "#854d0e",  dot: "#eab308" },
  Review:                { bg: "#ede9fe", text: "#6d28d9",  dot: "#8b5cf6" },
  "In Review":           { bg: "#ede9fe", text: "#6d28d9",  dot: "#8b5cf6" },
  Blocked:               { bg: "#fee2e2", text: "#b91c1c",  dot: "#dc2626" },
  Done:                  { bg: "#dcfce7", text: "#15803d",  dot: "#22c55e" },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  Low:      { bg: "#f1f5f9", text: "#64748b" },
  Medium:   { bg: "#ede9fe", text: "#6d28d9" },
  High:     { bg: "#fef3c7", text: "#d97706" },
  Critical: { bg: "#fee2e2", text: "#dc2626" },
};

// ── Small badge helpers ───────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.text,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot }} />
      {status}
    </span>
  );
}

function PriorityPill({ priority }: { priority: string }) {
  const c = PRIORITY_COLORS[priority] ?? { bg: "#f1f5f9", text: "#64748b" };
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.text,
    }}>
      {priority}
    </span>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
        textTransform: "uppercase", color: COLORS.muted, marginBottom: 8,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Field row ─────────────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "130px 1fr",
      gap: 8, padding: "6px 0",
      borderBottom: `1px solid ${COLORS.border}`,
      alignItems: "center",
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted }}>{label}</span>
      <span style={{ fontSize: 12, color: COLORS.primary }}>{children}</span>
    </div>
  );
}

// ── Action button ─────────────────────────────────────────────────────────────

interface ActionBtnProps {
  label: string;
  variant?: "default" | "primary" | "danger" | "warning";
  onClick: () => void;
  disabled?: boolean;
}

function ActionBtn({ label, variant = "default", onClick, disabled }: ActionBtnProps) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.secondary },
    primary: { background: "#1B4FD8", border: "1px solid #1B4FD8", color: "#fff" },
    danger:  { background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c" },
    warning: { background: "#fef3c7", border: "1px solid #fcd34d", color: "#b45309" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
        transition: "opacity 0.15s",
        ...styles[variant],
      }}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Overview
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({
  task,
  userCtx,
  localStatus,
  onStatusChange,
  onAction,
}: {
  task: WorkspaceTask;
  userCtx: WorkspaceUserContext;
  localStatus: string;
  onStatusChange: (s: ExtendedStatus) => void;
  onAction: (a: string) => void;
}) {
  const [showStatusPanel, setShowStatusPanel] = useState(false);

  const canReassign = userCtx.role === "department-lead" || userCtx.role === "manager" || userCtx.role === "executive";
  const canEscalate = userCtx.role !== "department-member";
  const canComplete = userCtx.role === "department-lead" || userCtx.role === "manager" || userCtx.role === "executive";

  return (
    <div>
      {/* Task actions bar */}
      <div style={{
        background: COLORS.bg, border: `1px solid ${COLORS.border}`,
        borderRadius: 8, padding: "12px 14px", marginBottom: 16,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.muted, marginBottom: 8 }}>
          Task Actions
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <ActionBtn label="Update Status" onClick={() => setShowStatusPanel(v => !v)} />
          <ActionBtn label="Add Note" onClick={() => onAction("add-note")} />
          <ActionBtn label="Add Comment" onClick={() => onAction("add-comment")} />
          <ActionBtn label="Mark Blocked" variant="danger" onClick={() => onAction("mark-blocked")} />
          <ActionBtn label="Request Review" variant="warning" onClick={() => onAction("request-review")} />
          <ActionBtn label="Complete Task" variant="primary" onClick={() => onAction("complete-task")} disabled={!canComplete} />
          <ActionBtn label="Escalate" variant="danger" onClick={() => onAction("escalate")} disabled={!canEscalate} />
          {canReassign && (
            <ActionBtn label="Reassign" onClick={() => onAction("reassign")} />
          )}
        </div>
        {!canComplete && (
          <p style={{ fontSize: 10, color: COLORS.muted, marginTop: 6, margin: "6px 0 0" }}>
            Complete Task requires Department Lead or higher role.
          </p>
        )}
        {!canEscalate && (
          <p style={{ fontSize: 10, color: COLORS.muted, marginTop: 4, margin: "4px 0 0" }}>
            Escalation requires Department Lead or higher.
          </p>
        )}
      </div>

      {/* Status update panel */}
      {showStatusPanel && (
        <div style={{
          background: "#fff", border: `1px solid ${COLORS.border}`,
          borderRadius: 8, padding: "12px 14px", marginBottom: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.primary, marginBottom: 10 }}>
            Update Status
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {EXTENDED_STATUSES.map((s) => {
              const c = STATUS_COLORS[s] ?? { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" };
              const isActive = localStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => { onStatusChange(s); setShowStatusPanel(false); }}
                  style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    border: isActive ? `2px solid ${c.dot}` : `1px solid ${COLORS.border}`,
                    background: isActive ? c.bg : COLORS.bg,
                    color: isActive ? c.text : COLORS.secondary,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 10, color: COLORS.muted, marginTop: 8 }}>
            Status updates are reflected in the global task record.
          </p>
        </div>
      )}

      {/* Task metadata */}
      <Section title="Task Details">
        <FieldRow label="Task Name">{task.title}</FieldRow>
        <FieldRow label="Status"><StatusPill status={localStatus} /></FieldRow>
        <FieldRow label="Priority"><PriorityPill priority={task.priority} /></FieldRow>
        <FieldRow label="Client">{task.client}</FieldRow>
        <FieldRow label="Project">
          {userCtx.hasProjectAccess ? (
            <a href="/projects" style={{ color: COLORS.blue, fontWeight: 600, fontSize: 12 }}>
              {task.project}
            </a>
          ) : (
            <span style={{ color: COLORS.secondary }}>{task.project}</span>
          )}
        </FieldRow>
        <FieldRow label="Department">{task.department}</FieldRow>
        <FieldRow label="Service">{task.service}</FieldRow>
        <FieldRow label="Assignee">{task.assignee || task.owner || "—"}</FieldRow>
        <FieldRow label="Due Date">{task.dueDate || task.due || "—"}</FieldRow>
        <FieldRow label="Source">{task.source}</FieldRow>
        {task.blueprintSource && (
          <FieldRow label="Blueprint Source">{task.blueprintSource}</FieldRow>
        )}
        {task.workflowSource && (
          <FieldRow label="Workflow Source">{task.workflowSource}</FieldRow>
        )}
        {task.blocker && (
          <FieldRow label="Blocker">
            <span style={{ color: "#b91c1c", fontWeight: 600 }}>{task.blocker}</span>
          </FieldRow>
        )}
      </Section>

      {/* Permission context note */}
      <div style={{
        background: COLORS.bg, border: `1px solid ${COLORS.border}`,
        borderRadius: 7, padding: "10px 12px", fontSize: 11,
        color: COLORS.secondary, lineHeight: 1.5,
      }}>
        <strong style={{ color: COLORS.primary }}>Your access:</strong>{" "}
        {userCtx.role === "department-member" && "Department Member — can update status, add notes and comments, mark blocked, and request review."}
        {userCtx.role === "department-lead" && "Department Lead — can reassign, escalate, and approve completion."}
        {userCtx.role === "manager" && "Manager / Operations — full task access including global project context."}
        {userCtx.role === "executive" && "Executive — full visibility across all tasks and projects."}
        {!userCtx.hasProjectAccess && (
          <span style={{ display: "block", marginTop: 4, color: COLORS.muted }}>
            Project name shown as context only. Global project access required to open the project.
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Checklist
// ─────────────────────────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

const MOCK_CHECKLIST: ChecklistItem[] = [
  { id: "ck-1", label: "Review task brief and acceptance criteria", done: true },
  { id: "ck-2", label: "Confirm client requirements with Account Manager", done: true },
  { id: "ck-3", label: "Complete primary deliverable", done: false },
  { id: "ck-4", label: "Internal review by department lead", done: false },
  { id: "ck-5", label: "Submit for client-facing review", done: false },
  { id: "ck-6", label: "Address feedback and revisions", done: false },
  { id: "ck-7", label: "Final sign-off and mark complete", done: false },
];

function ChecklistTab() {
  const [items, setItems] = useState<ChecklistItem[]>(MOCK_CHECKLIST);
  const [newLabel, setNewLabel] = useState("");

  const toggle = (id: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));

  const addItem = () => {
    if (!newLabel.trim()) return;
    setItems(prev => [...prev, { id: `ck-${Date.now()}`, label: newLabel.trim(), done: false }]);
    setNewLabel("");
  };

  const done = items.filter(i => i.done).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

  return (
    <div>
      <Section title="Checklist">
        {/* Progress bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.secondary }}>
              {done} of {items.length} completed
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? "#15803d" : COLORS.blue }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: 4, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              background: pct === 100 ? "#22c55e" : COLORS.blue,
              width: `${pct}%`, transition: "width 0.3s",
            }} />
          </div>
        </div>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map(item => (
            <label
              key={item.id}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 6,
                background: item.done ? "#f0fdf4" : COLORS.bg,
                border: `1px solid ${item.done ? "#bbf7d0" : COLORS.border}`,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggle(item.id)}
                style={{ accentColor: "#22c55e", width: 14, height: 14, cursor: "pointer" }}
              />
              <span style={{
                fontSize: 12, color: item.done ? "#15803d" : COLORS.primary,
                textDecoration: item.done ? "line-through" : "none",
                flex: 1,
              }}>
                {item.label}
              </span>
            </label>
          ))}
        </div>

        {/* Add item */}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addItem()}
            placeholder="Add checklist item..."
            style={{
              flex: 1, padding: "7px 10px", borderRadius: 6, fontSize: 12,
              border: `1px solid ${COLORS.border}`, outline: "none",
              background: COLORS.surface, color: COLORS.primary,
            }}
          />
          <ActionBtn label="Add" variant="primary" onClick={addItem} />
        </div>
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Notes
// ─────────────────────────────────────────────────────────────────────────────

interface NoteEntry {
  id: string;
  author: string;
  dept: string;
  body: string;
  timestamp: string;
  clientVisible: boolean;
}

const MOCK_NOTES: NoteEntry[] = [
  {
    id: "n-1",
    author: "Jordan M.",
    dept: "Account Management",
    body: "Client confirmed they are ready to move forward with this task. Priority is to have deliverable by end of week.",
    timestamp: "Jun 3 · 10:14 AM",
    clientVisible: false,
  },
  {
    id: "n-2",
    author: "Sarah K.",
    dept: "Operations",
    body: "Internal note: waiting on creative assets before this can be completed. Flagging for department lead.",
    timestamp: "Jun 4 · 2:30 PM",
    clientVisible: false,
  },
  {
    id: "n-3",
    author: "Alex R.",
    dept: "Billing",
    body: "Client account is current. No billing holds. Safe to proceed.",
    timestamp: "Jun 5 · 9:00 AM",
    clientVisible: true,
  },
];

function NotesTab({ userCtx }: { userCtx: WorkspaceUserContext }) {
  const [notes, setNotes] = useState<NoteEntry[]>(MOCK_NOTES);
  const [body, setBody] = useState("");
  const [clientVisible, setClientVisible] = useState(false);

  const addNote = () => {
    if (!body.trim()) return;
    setNotes(prev => [{
      id: `n-${Date.now()}`,
      author: userCtx.name,
      dept: userCtx.department,
      body: body.trim(),
      timestamp: "Just now",
      clientVisible,
    }, ...prev]);
    setBody("");
    setClientVisible(false);
  };

  return (
    <div>
      {/* Add note */}
      <Section title="Add Internal Note">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Add an internal note..."
          rows={3}
          style={{
            width: "100%", padding: "9px 10px", borderRadius: 6, fontSize: 12,
            border: `1px solid ${COLORS.border}`, outline: "none",
            background: COLORS.surface, color: COLORS.primary,
            resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: COLORS.secondary, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={clientVisible}
              onChange={e => setClientVisible(e.target.checked)}
              style={{ accentColor: COLORS.blue, width: 13, height: 13 }}
            />
            Client-visible note
          </label>
          <ActionBtn label="Add Note" variant="primary" onClick={addNote} />
        </div>
      </Section>

      {/* Notes list */}
      <Section title="Notes">
        {notes.length === 0 ? (
          <p style={{ fontSize: 12, color: COLORS.muted }}>No notes yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notes.map(note => (
              <div key={note.id} style={{
                background: note.clientVisible ? "#f0f9ff" : COLORS.bg,
                border: `1px solid ${note.clientVisible ? "#bae6fd" : COLORS.border}`,
                borderRadius: 7, padding: "10px 12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%", background: "#1B4FD8",
                    color: "#fff", fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {note.author.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.primary }}>{note.author}</span>
                  <span style={{ fontSize: 10, color: COLORS.muted }}>{note.dept}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: COLORS.muted }}>{note.timestamp}</span>
                  {note.clientVisible && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "1px 6px",
                      borderRadius: 10, background: "#dbeafe", color: "#1d4ed8",
                      letterSpacing: "0.04em",
                    }}>
                      CLIENT-VISIBLE
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: COLORS.primary, margin: 0, lineHeight: 1.6 }}>{note.body}</p>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Comments
// ─────────────────────────────────────────────────────────────────────────────

interface CommentEntry {
  id: string;
  author: string;
  dept: string;
  body: string;
  timestamp: string;
  color: string;
}

const AVATAR_COLORS = ["#1B4FD8", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

const MOCK_COMMENTS: CommentEntry[] = [
  {
    id: "cm-1",
    author: "Jordan M.",
    dept: "Account Management",
    body: "Starting on this now. Client confirmed the scope hasn't changed from the original brief.",
    timestamp: "Jun 3 · 9:15 AM",
    color: "#1B4FD8",
  },
  {
    id: "cm-2",
    author: "Sarah K.",
    dept: "Operations",
    body: "Heads up — the related deliverable for Apex Roofing was slightly delayed. This may affect your timeline. Flagging for awareness.",
    timestamp: "Jun 4 · 11:00 AM",
    color: "#7c3aed",
  },
];

function CommentsTab({ userCtx }: { userCtx: WorkspaceUserContext }) {
  const [comments, setComments] = useState<CommentEntry[]>(MOCK_COMMENTS);
  const [body, setBody] = useState("");

  const addComment = () => {
    if (!body.trim()) return;
    setComments(prev => [...prev, {
      id: `cm-${Date.now()}`,
      author: userCtx.name,
      dept: userCtx.department,
      body: body.trim(),
      timestamp: "Just now",
      color: AVATAR_COLORS[prev.length % AVATAR_COLORS.length],
    }]);
    setBody("");
  };

  return (
    <div>
      <Section title="Department Comments">
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {comments.map(c => (
            <div key={c.id} style={{
              background: COLORS.bg, border: `1px solid ${COLORS.border}`,
              borderRadius: 7, padding: "10px 12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: "50%", background: c.color,
                  color: "#fff", fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {c.author.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </span>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.primary }}>{c.author}</span>
                  <span style={{ fontSize: 10, color: COLORS.muted, marginLeft: 6 }}>{c.dept}</span>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 10, color: COLORS.muted }}>{c.timestamp}</span>
              </div>
              <p style={{ fontSize: 12, color: COLORS.primary, margin: 0, lineHeight: 1.6 }}>{c.body}</p>
            </div>
          ))}
        </div>

        {/* Add comment */}
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Add a department comment..."
          rows={3}
          style={{
            width: "100%", padding: "9px 10px", borderRadius: 6, fontSize: 12,
            border: `1px solid ${COLORS.border}`, outline: "none",
            background: COLORS.surface, color: COLORS.primary,
            resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
            marginBottom: 8,
          }}
        />
        <ActionBtn label="Post Comment" variant="primary" onClick={addComment} />
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Dependencies
// ─────────────────────────────────────────────────────────────────────────────

const DEP_COLORS: Record<string, { bg: string; text: string }> = {
  Satisfied: { bg: "#dcfce7", text: "#15803d" },
  Pending:   { bg: "#fef3c7", text: "#b45309" },
  Blocked:   { bg: "#fee2e2", text: "#b91c1c" },
  Escalated: { bg: "#ede9fe", text: "#6d28d9" },
};

const MOCK_DEPS = {
  blockedBy: [
    { id: "dep-1", name: "Client Asset Delivery", status: "Pending", owner: "Account Management", note: "Waiting on client to provide photos and brand assets." },
    { id: "dep-2", name: "Billing Confirmation", status: "Satisfied", owner: "Billing", note: "Payment confirmed. No hold on account." },
  ],
  blocking: [
    { id: "dep-3", name: "Monthly Report Generation", status: "Pending", owner: "Reporting", note: "Cannot generate report until this task is complete." },
  ],
  related: [
    { id: "dep-4", name: "SEO Audit — Same Client", status: "Satisfied", owner: "SEO", note: "Completed. Findings inform this task." },
  ],
};

function DepRow({ item }: { item: typeof MOCK_DEPS.blockedBy[0] }) {
  const c = DEP_COLORS[item.status] ?? { bg: "#f1f5f9", text: "#475569" };
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto",
      gap: 8, padding: "9px 12px", borderRadius: 6,
      background: COLORS.bg, border: `1px solid ${COLORS.border}`,
      marginBottom: 6,
    }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary }}>{item.name}</div>
        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
          Owner: {item.owner} · {item.note}
        </div>
      </div>
      <span style={{
        padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700,
        background: c.bg, color: c.text, alignSelf: "center", whiteSpace: "nowrap",
      }}>
        {item.status}
      </span>
    </div>
  );
}

function DependenciesTab() {
  return (
    <div>
      <Section title="Blocked By">
        {MOCK_DEPS.blockedBy.map(d => <DepRow key={d.id} item={d} />)}
      </Section>
      <Section title="Blocking">
        {MOCK_DEPS.blocking.map(d => <DepRow key={d.id} item={d} />)}
      </Section>
      <Section title="Related Tasks">
        {MOCK_DEPS.related.map(d => <DepRow key={d.id} item={d} />)}
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Files
// ─────────────────────────────────────────────────────────────────────────────

const FILE_ICON_COLORS: Record<string, string> = {
  pdf:  "#dc2626",
  docx: "#1d4ed8",
  xlsx: "#15803d",
  png:  "#7c3aed",
  jpg:  "#d97706",
  mp4:  "#0891b2",
  zip:  "#64748b",
};

const MOCK_FILES = [
  { id: "f-1", name: "Task-Brief-Q2.pdf",          type: "pdf",  size: "1.2 MB", owner: "Jordan M.",  uploadedAt: "Jun 1 · 9:00 AM",  linkedDeliverable: "Kickoff Package" },
  { id: "f-2", name: "Client-Assets-Photos.zip",    type: "zip",  size: "18.4 MB",owner: "Alex R.",    uploadedAt: "Jun 2 · 3:15 PM",  linkedDeliverable: null },
  { id: "f-3", name: "Deliverable-Draft-v1.docx",   type: "docx", size: "340 KB", owner: "Sarah K.",   uploadedAt: "Jun 4 · 10:30 AM", linkedDeliverable: "Final Deliverable" },
];

function FilesTab() {
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      {/* Upload area */}
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={e => e.preventDefault()}
        onDrop={() => setDragging(false)}
        style={{
          border: `2px dashed ${dragging ? COLORS.blue : COLORS.border}`,
          borderRadius: 8, padding: "18px 14px",
          background: dragging ? COLORS.blueBg : COLORS.bg,
          textAlign: "center", marginBottom: 16,
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.secondary }}>
          Drag files here or{" "}
          <span style={{ color: COLORS.blue, cursor: "pointer", textDecoration: "underline" }}>
            browse to upload
          </span>
        </div>
        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
          PDF, DOCX, XLSX, PNG, JPG, MP4, ZIP supported (mock only)
        </div>
      </div>

      {/* Files list */}
      <Section title="Attachments">
        {MOCK_FILES.map(f => {
          const iconColor = FILE_ICON_COLORS[f.type] ?? "#64748b";
          return (
            <div key={f.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 6,
              background: COLORS.bg, border: `1px solid ${COLORS.border}`,
              marginBottom: 6,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 6,
                background: iconColor + "20", border: `1px solid ${iconColor}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 800, color: iconColor, letterSpacing: "0.03em",
                flexShrink: 0,
              }}>
                {f.type.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {f.name}
                </div>
                <div style={{ fontSize: 10, color: COLORS.muted }}>
                  {f.size} · {f.owner} · {f.uploadedAt}
                  {f.linkedDeliverable && (
                    <span style={{ marginLeft: 6, color: COLORS.blue, fontWeight: 600 }}>
                      {f.linkedDeliverable}
                    </span>
                  )}
                </div>
              </div>
              <button style={{
                padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 600,
                border: `1px solid ${COLORS.border}`, background: COLORS.surface,
                color: COLORS.secondary, cursor: "pointer",
              }}>
                View
              </button>
            </div>
          );
        })}
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Activity
// ─────────────────────────────────────────────────────────────────────────────

const ACTIVITY_EVENT_COLORS: Record<string, { dot: string; bg: string }> = {
  "Task Created":    { dot: "#94a3b8", bg: "#f1f5f9" },
  "Assigned":        { dot: "#3b82f6", bg: "#dbeafe" },
  "Status Changed":  { dot: "#8b5cf6", bg: "#ede9fe" },
  "Comment Added":   { dot: "#0891b2", bg: "#cffafe" },
  "Note Added":      { dot: "#d97706", bg: "#fef3c7" },
  "Escalated":       { dot: "#dc2626", bg: "#fee2e2" },
  "Completed":       { dot: "#22c55e", bg: "#dcfce7" },
  "Blocked":         { dot: "#dc2626", bg: "#fee2e2" },
  "Review Requested":{ dot: "#8b5cf6", bg: "#ede9fe" },
};

const MOCK_ACTIVITY = [
  { id: "ac-1", type: "Task Created",     actor: "System",    time: "Jun 1 · 8:00 AM",  detail: "Task created from workflow automation" },
  { id: "ac-2", type: "Assigned",         actor: "Jordan M.", time: "Jun 1 · 8:05 AM",  detail: "Assigned to Sarah K." },
  { id: "ac-3", type: "Status Changed",   actor: "Sarah K.",  time: "Jun 2 · 9:30 AM",  detail: "Open → In Progress" },
  { id: "ac-4", type: "Note Added",       actor: "Jordan M.", time: "Jun 3 · 10:14 AM", detail: "Internal note added" },
  { id: "ac-5", type: "Comment Added",    actor: "Alex R.",   time: "Jun 4 · 2:00 PM",  detail: "Department comment added" },
  { id: "ac-6", type: "Blocked",          actor: "Sarah K.",  time: "Jun 5 · 9:00 AM",  detail: "Marked blocked — waiting on client assets" },
  { id: "ac-7", type: "Escalated",        actor: "Jordan M.", time: "Jun 5 · 9:15 AM",  detail: "Escalated to Department Lead" },
  { id: "ac-8", type: "Review Requested", actor: "Sarah K.",  time: "Jun 5 · 11:00 AM", detail: "Review requested from department lead" },
];

function ActivityTab() {
  return (
    <Section title="Activity Timeline">
      <div style={{ position: "relative", paddingLeft: 20 }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute", left: 6, top: 8, bottom: 8,
          width: 1, background: COLORS.border,
        }} />

        {MOCK_ACTIVITY.map((ev, idx) => {
          const c = ACTIVITY_EVENT_COLORS[ev.type] ?? { dot: "#94a3b8", bg: "#f1f5f9" };
          return (
            <div key={ev.id} style={{
              display: "flex", gap: 10, marginBottom: idx < MOCK_ACTIVITY.length - 1 ? 12 : 0,
              position: "relative",
            }}>
              {/* Dot */}
              <div style={{
                position: "absolute", left: -16, top: 4,
                width: 10, height: 10, borderRadius: "50%",
                background: c.dot, border: "2px solid #fff",
                boxShadow: `0 0 0 1px ${c.dot}40`,
                flexShrink: 0,
              }} />

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10,
                    background: c.bg, color: c.dot,
                  }}>
                    {ev.type}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.primary }}>{ev.actor}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: COLORS.muted }}>{ev.time}</span>
                </div>
                <p style={{ fontSize: 11, color: COLORS.secondary, margin: "4px 0 0" }}>{ev.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Workflow
// ─────────────────────────────────────────────────────────────────────────────

function WorkflowTab({ task }: { task: WorkspaceTask }) {
  return (
    <div>
      <Section title="Workflow Origin">
        <FieldRow label="Source Type">{task.source}</FieldRow>
        {task.workflowSource && <FieldRow label="Workflow">{task.workflowSource}</FieldRow>}
        {task.blueprintSource && <FieldRow label="Blueprint">{task.blueprintSource}</FieldRow>}
        <FieldRow label="Department">{task.department}</FieldRow>
        <FieldRow label="Service">{task.service}</FieldRow>
      </Section>

      <Section title="Automation Context">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            {
              label: "Automation Trigger",
              value: task.workflowSource
                ? `Triggered by: ${task.workflowSource}`
                : task.blueprintSource
                  ? `Blueprint template: ${task.blueprintSource}`
                  : "Manually created — no automation trigger",
              icon: "T",
              color: "#1B4FD8",
            },
            {
              label: "Related Notification",
              value: "Assignee notified via system notification on task creation",
              icon: "N",
              color: "#0891b2",
            },
            {
              label: "Related Escalation Rule",
              value: "Escalation triggers if task is overdue by 2+ days with no status update",
              icon: "E",
              color: "#dc2626",
            },
            {
              label: "Linked Project Milestone",
              value: `Milestone: ${task.project} — delivery checkpoint`,
              icon: "M",
              color: "#7c3aed",
            },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", gap: 10, padding: "10px 12px",
              background: COLORS.bg, border: `1px solid ${COLORS.border}`,
              borderRadius: 7, alignItems: "flex-start",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: item.color + "18", border: `1px solid ${item.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: item.color, flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 12, color: COLORS.primary, marginTop: 2, lineHeight: 1.5 }}>
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Source of Truth">
        <div style={{
          background: "#f0f9ff", border: "1px solid #bae6fd",
          borderRadius: 7, padding: "10px 12px", fontSize: 12, color: "#0c4a6e", lineHeight: 1.5,
        }}>
          This task originates from the{" "}
          <a href="/projects/tasks" style={{ color: "#0369a1", fontWeight: 700 }}>
            Global Projects &amp; Tasks
          </a>{" "}
          module. Workflow automation, blueprints, notifications, and escalation rules
          are configured globally. This workspace view provides a filtered working interface only.
        </div>
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root: WorkspaceTaskDrawer
// ─────────────────────────────────────────────────────────────────────────────

interface WorkspaceTaskDrawerProps {
  task: WorkspaceTask;
  userCtx: WorkspaceUserContext;
  onClose: () => void;
  onStatusUpdate?: (taskId: string, status: WorkspaceTaskStatus) => void;
  onToast?: (msg: string) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "overview",      label: "Overview"      },
  { id: "checklist",     label: "Checklist"     },
  { id: "notes",         label: "Notes"         },
  { id: "comments",      label: "Comments"      },
  { id: "dependencies",  label: "Dependencies"  },
  { id: "files",         label: "Files"         },
  { id: "activity",      label: "Activity"      },
  { id: "workflow",      label: "Workflow"       },
];

export default function WorkspaceTaskDrawer({
  task,
  userCtx,
  onClose,
  onStatusUpdate,
  onToast,
}: WorkspaceTaskDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [localStatus, setLocalStatus] = useState<string>(task.status);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleStatusChange(s: ExtendedStatus) {
    setLocalStatus(s);
    // Map extended status back to WorkspaceTaskStatus for parent callback
    const mapped: WorkspaceTaskStatus =
      s === "Open" ? "Pending"
      : s === "Waiting on Client" ? "Blocked"
      : s === "Waiting on Department" ? "Blocked"
      : s === "Review" ? "In Review"
      : (STATUS_OPTIONS.includes(s as WorkspaceTaskStatus) ? s as WorkspaceTaskStatus : "Pending");

    onStatusUpdate?.(task.id, mapped);
    onToast?.(`Status updated to "${s}" — reflected in global task record`);
  }

  function handleAction(action: string) {
    const msgs: Record<string, string> = {
      "add-note":       "Note panel is ready. Switch to the Notes tab.",
      "add-comment":    "Comment panel is ready. Switch to Comments tab.",
      "mark-blocked":   `Task marked as Blocked.`,
      "request-review": "Review requested — department lead notified.",
      "complete-task":  `Task marked as Complete — reflected in global Projects & Tasks.`,
      "escalate":       "Task escalated to Department Lead.",
      "reassign":       "Reassign panel: select a new assignee from the department roster.",
    };
    if (action === "mark-blocked") {
      setLocalStatus("Blocked");
      onStatusUpdate?.(task.id, "Blocked");
    }
    if (action === "complete-task") {
      setLocalStatus("Done");
      onStatusUpdate?.(task.id, "Done");
    }
    if (action === "add-note") setActiveTab("notes");
    if (action === "add-comment") setActiveTab("comments");
    onToast?.(msgs[action] ?? `Action: ${action}`);
  }

  return (
    // Backdrop
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(14, 32, 85, 0.4)",
        backdropFilter: "blur(3px)",
        display: "flex", justifyContent: "flex-end",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Drawer panel */}
      <div
        ref={drawerRef}
        style={{
          width: "100%", maxWidth: 680, height: "100%",
          display: "flex", flexDirection: "column",
          background: COLORS.surface,
          boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div style={{
          flexShrink: 0, padding: "16px 20px",
          background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", color: COLORS.muted, marginBottom: 4,
              }}>
                {task.department} · {task.project}
              </div>
              <h2 style={{
                fontSize: 16, fontWeight: 800, color: COLORS.primary, lineHeight: 1.3,
                margin: 0, wordBreak: "break-word",
              }}>
                {task.title}
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                <StatusPill status={localStatus} />
                <PriorityPill priority={task.priority} />
                <span style={{
                  padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                  background: COLORS.bg, color: COLORS.muted, fontFamily: "monospace",
                }}>
                  {task.id}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              style={{
                width: 32, height: 32, borderRadius: 7, border: `1px solid ${COLORS.border}`,
                background: "transparent", cursor: "pointer", color: COLORS.muted,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{
          flexShrink: 0, overflowX: "auto",
          background: COLORS.surface, borderBottom: `2px solid ${COLORS.border}`,
        }}>
          <div style={{ display: "flex", minWidth: "max-content", padding: "0 16px" }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "10px 14px", fontSize: 11, fontWeight: 600,
                    border: "none", background: "transparent", cursor: "pointer",
                    color: isActive ? COLORS.blue : COLORS.secondary,
                    borderBottom: isActive ? `2px solid ${COLORS.blue}` : "2px solid transparent",
                    marginBottom: "-2px", whiteSpace: "nowrap",
                    transition: "color 0.15s",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px" }}>
          {activeTab === "overview" && (
            <OverviewTab
              task={task}
              userCtx={userCtx}
              localStatus={localStatus}
              onStatusChange={handleStatusChange}
              onAction={handleAction}
            />
          )}
          {activeTab === "checklist" && <ChecklistTab />}
          {activeTab === "notes" && <NotesTab userCtx={userCtx} />}
          {activeTab === "comments" && <CommentsTab userCtx={userCtx} />}
          {activeTab === "dependencies" && <DependenciesTab />}
          {activeTab === "files" && <FilesTab />}
          {activeTab === "activity" && <ActivityTab />}
          {activeTab === "workflow" && <WorkflowTab task={task} />}
        </div>

        {/* ── Footer ── */}
        <div style={{
          flexShrink: 0, padding: "10px 20px",
          background: COLORS.bg, borderTop: `1px solid ${COLORS.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 11, color: COLORS.muted }}>
            Source: Global Projects &amp; Tasks · {task.source}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {userCtx.hasProjectAccess && (
              <a
                href="/projects"
                style={{
                  padding: "5px 11px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  border: `1px solid ${COLORS.border}`, background: COLORS.surface,
                  color: COLORS.secondary, textDecoration: "none",
                }}
              >
                Open Project
              </a>
            )}
            <button
              onClick={onClose}
              style={{
                padding: "5px 11px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                border: `1px solid ${COLORS.border}`, background: COLORS.surface,
                color: COLORS.secondary, cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
