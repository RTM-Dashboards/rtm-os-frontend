"use client";

// RTM OS — Task List Editor
// /account-management/settings/task-lists
//
// Melissa picks a service from the catalogue, sees its task list (two fixed
// groups: Setup and Recurring), and edits it. Each task has a label, a
// department (from the ten canonical departments), and a due offset in days.
//
// Gate: requireDepartment(user, "Account Management", "Member") — any active
//   Account Management member passes; Executives and SystemAdmins pass too.
//   The gate is enforced by the API; this page simply shows the right error
//   if the API returns 401/403.
//
// Three distinguishable states per the spec:
//   loading  — initial fetch, no interaction
//   saving   — PUT in flight; Save button disabled
//   error    — API returned a non-OK response; shown verbatim
//
// Paste handling: a textarea-style input splits on newlines. Melissa can paste
//   several task labels from a document, and each line becomes a separate task.
//   Single-line fields elsewhere accept only one line.
//
// Two fixed groups: "Setup" (kind="setup") and "Recurring" (kind="recurring").
//   Melissa cannot add or remove groups — just their tasks.
//   A service with no template shows empty tasks in both groups (normal).

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { VALID_DEPARTMENTS } from "@/lib/auth/vocab";
import type { TemplateGroup, TemplateTaskDef } from "@/app/api/account-management/task-list-templates/route";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServiceOption {
  id: string;
  label: string;
  department: string;
}

// ── Shared style constants ────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  background: "var(--rtm-bg)",
  borderColor: "var(--rtm-border)",
  color: "var(--rtm-text-primary)",
  padding: "5px 8px",
  borderRadius: "6px",
  borderWidth: 1,
  borderStyle: "solid",
  fontSize: 12,
  outline: "none",
};

const SELECT_CLS =
  "text-xs font-medium rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500";
const SELECT_STYLE: React.CSSProperties = {
  background: "var(--rtm-bg)",
  borderColor: "var(--rtm-border)",
  color: "var(--rtm-text-primary)",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--rtm-text-muted)",
  display: "block",
  marginBottom: 3,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

// ── Fixed group definitions ───────────────────────────────────────────────────

const FIXED_GROUPS: Array<{ kind: "setup" | "recurring"; label: string }> = [
  { kind: "setup",     label: "Setup Tasks" },
  { kind: "recurring", label: "Recurring Tasks" },
];

// ── Task row editor ────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: TemplateTaskDef;
  index: number;
  total: number;
  onChange: (t: TemplateTaskDef) => void;
  onRemove: () => void;
  onMove:   (dir: -1 | 1) => void;
  disabled: boolean;
}

function TaskRow({ task, index, total, onChange, onRemove, onMove, disabled }: TaskRowProps) {
  return (
    <div
      className="rounded-lg border p-3 flex flex-col gap-2"
      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
    >
      <div className="flex items-start gap-2">
        {/* Reorder */}
        <div className="flex flex-col gap-0.5 flex-shrink-0 mt-0.5">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={disabled || index === 0}
            title="Move up"
            className="text-xs px-1 py-0.5 rounded border disabled:opacity-30"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)", lineHeight: 1 }}
          >▲</button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={disabled || index === total - 1}
            title="Move down"
            className="text-xs px-1 py-0.5 rounded border disabled:opacity-30"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)", lineHeight: 1 }}
          >▼</button>
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <label style={LABEL_STYLE}>Label</label>
          <input
            type="text"
            value={task.label}
            onChange={(e) => onChange({ ...task, label: e.target.value })}
            disabled={disabled}
            placeholder="Task label"
            style={{ ...INPUT_STYLE, width: "100%" }}
          />
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          title="Remove task"
          className="text-xs px-2 py-1 rounded border mt-4 flex-shrink-0 disabled:opacity-40"
          style={{ borderColor: "#FECACA", color: "#DC2626", background: "#FEF2F2" }}
        >Remove</button>
      </div>

      <div className="flex gap-3 flex-wrap">
        {/* Department */}
        <div className="flex flex-col gap-1">
          <label style={LABEL_STYLE}>Department</label>
          <select
            className={SELECT_CLS}
            style={SELECT_STYLE}
            value={task.department}
            onChange={(e) => onChange({ ...task, department: e.target.value })}
            disabled={disabled}
          >
            <option value="">— not set —</option>
            {VALID_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Due offset */}
        <div className="flex flex-col gap-1">
          <label style={LABEL_STYLE}>Due offset (days)</label>
          <input
            type="number"
            min={0}
            value={task.offsetDays}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              onChange({ ...task, offsetDays: isNaN(v) ? 0 : Math.max(0, v) });
            }}
            disabled={disabled}
            style={{ ...INPUT_STYLE, width: "80px" }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Group editor ──────────────────────────────────────────────────────────────

interface GroupEditorProps {
  kind:    "setup" | "recurring";
  label:   string;
  tasks:   TemplateTaskDef[];
  onChange: (tasks: TemplateTaskDef[]) => void;
  saving:  boolean;
}

function GroupEditor({ kind, label, tasks, onChange, saving }: GroupEditorProps) {
  // Add one blank task.
  function addTask() {
    onChange([...tasks, { label: "", department: "", offsetDays: 0 }]);
  }

  // Add tasks from pasted multi-line text.
  // Each non-empty line becomes one task with empty department and offset 0.
  function addPastedTasks(raw: string) {
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    const newTasks = lines.map((line) => ({ label: line, department: "", offsetDays: 0 }));
    onChange([...tasks, ...newTasks]);
  }

  const pasteRef = useRef<HTMLTextAreaElement>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteValue, setPasteValue] = useState("");

  function commitPaste() {
    addPastedTasks(pasteValue);
    setPasteValue("");
    setPasteMode(false);
  }

  function updateTask(i: number, t: TemplateTaskDef) {
    onChange(tasks.map((existing, idx) => idx === i ? t : existing));
  }

  function removeTask(i: number) {
    onChange(tasks.filter((_, idx) => idx !== i));
  }

  function moveTask(i: number, dir: -1 | 1) {
    const next = [...tasks];
    const swap = i + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[i], next[swap]] = [next[swap], next[i]];
    onChange(next);
  }

  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      {/* Group header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {label}
          </h3>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: kind === "setup" ? "#EFF6FF" : "#F5F3FF",
              color:      kind === "setup" ? "#1D4ED8" : "#7C3AED",
              border:     `1px solid ${kind === "setup" ? "#BFDBFE" : "#DDD6FE"}`,
            }}
          >
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPasteMode(!pasteMode)}
            disabled={saving}
            className="text-xs font-semibold px-3 py-1 rounded-lg border transition-colors"
            style={{
              background:   pasteMode ? "#EFF6FF" : "var(--rtm-bg)",
              borderColor:  pasteMode ? "#BFDBFE" : "var(--rtm-border)",
              color:        pasteMode ? "#1D4ED8" : "var(--rtm-text-secondary)",
            }}
          >
            Paste lines
          </button>
          <button
            type="button"
            onClick={addTask}
            disabled={saving}
            className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
            style={{ background: "#1B4FD8", color: "#fff", border: "none" }}
          >
            + Add task
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Paste box — shown when pasteMode is true */}
        {pasteMode && (
          <div
            className="rounded-lg border p-3"
            style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}
          >
            <label className="text-xs font-semibold block mb-1" style={{ color: "#1D4ED8" }}>
              Paste task labels — one per line
            </label>
            <textarea
              ref={pasteRef}
              rows={4}
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              placeholder={"Write a blog post\nOptimize meta tags\nSubmit sitemap"}
              style={{
                ...INPUT_STYLE,
                width: "100%",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={commitPaste}
                disabled={saving || pasteValue.trim() === ""}
                className="text-xs font-semibold px-3 py-1 rounded-lg disabled:opacity-50"
                style={{ background: "#1B4FD8", color: "#fff", border: "none" }}
              >
                Add as tasks
              </button>
              <button
                type="button"
                onClick={() => { setPasteMode(false); setPasteValue(""); }}
                className="text-xs font-semibold px-3 py-1 rounded-lg border"
                style={{ borderColor: "#BFDBFE", color: "#1D4ED8", background: "transparent" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {tasks.length === 0 ? (
          <div
            className="text-center py-8 rounded-lg border border-dashed"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)" }}
          >
            <p className="text-xs">No tasks yet. Use &quot;+ Add task&quot; or &quot;Paste lines&quot; to add some.</p>
          </div>
        ) : (
          tasks.map((task, i) => (
            <TaskRow
              key={i}
              task={task}
              index={i}
              total={tasks.length}
              onChange={(t) => updateTask(i, t)}
              onRemove={() => removeTask(i)}
              onMove={(dir) => moveTask(i, dir)}
              disabled={saving}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TaskListsPage() {
  // Service list
  const [services, setServices]       = useState<ServiceOption[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError]     = useState<string | null>(null);

  // Selected service
  const [selectedId, setSelectedId]   = useState<string>("");

  // Template state (two fixed groups)
  const [setupTasks,     setSetupTasks]     = useState<TemplateTaskDef[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<TemplateTaskDef[]>([]);

  // Load/save states
  const [templateLoading, setTemplateLoading] = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [saveError, setSaveError]             = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess]         = useState(false);

  // ── Load service list ──────────────────────────────────────────────────────
  useEffect(() => {
    setServicesLoading(true);
    setServicesError(null);
    fetch("/api/sales/service-catalog?all=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const rows = (data.services ?? []) as Array<{
          id: string;
          label: string;
          department: string;
        }>;
        setServices(rows.map((r) => ({ id: r.id, label: r.label, department: r.department })));
        setServicesLoading(false);
      })
      .catch((err: unknown) => {
        setServicesError(String(err));
        setServicesLoading(false);
      });
  }, []);

  // ── Load template when service changes ────────────────────────────────────
  useEffect(() => {
    if (!selectedId) {
      setSetupTasks([]);
      setRecurringTasks([]);
      return;
    }

    setTemplateLoading(true);
    setSaveError(null);
    setSaveSuccess(false);

    fetch(`/api/account-management/task-list-templates?serviceId=${encodeURIComponent(selectedId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const groups: TemplateGroup[] = data.template?.groups ?? [];
        const setupGroup     = groups.find((g) => g.kind === "setup");
        const recurringGroup = groups.find((g) => g.kind === "recurring");
        setSetupTasks(setupGroup?.tasks     ?? []);
        setRecurringTasks(recurringGroup?.tasks ?? []);
        setTemplateLoading(false);
      })
      .catch((err: unknown) => {
        setSaveError(`Failed to load template: ${String(err)}`);
        setTemplateLoading(false);
      });
  }, [selectedId]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!selectedId) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const groups: TemplateGroup[] = [
      { kind: "setup",     heading: "Setup",     tasks: setupTasks },
      { kind: "recurring", heading: "Recurring", tasks: recurringTasks },
    ];

    try {
      const res = await fetch(
        `/api/account-management/task-list-templates?serviceId=${encodeURIComponent(selectedId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groups }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? `HTTP ${res.status}`);
      } else {
        setSaveSuccess(true);
        // Re-populate from returned groups in case server normalised anything.
        const returnedGroups: TemplateGroup[] = data.template?.groups ?? [];
        const sg = returnedGroups.find((g) => g.kind === "setup");
        const rg = returnedGroups.find((g) => g.kind === "recurring");
        setSetupTasks(sg?.tasks ?? []);
        setRecurringTasks(rg?.tasks ?? []);
      }
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  }, [selectedId, setupTasks, recurringTasks]);

  // Clear save-success after 3 s.
  useEffect(() => {
    if (!saveSuccess) return;
    const t = setTimeout(() => setSaveSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [saveSuccess]);

  const selectedService = services.find((s) => s.id === selectedId);
  const hasTemplate     = setupTasks.length > 0 || recurringTasks.length > 0;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        <Link href="/account-management" className="hover:underline" style={{ color: "var(--rtm-text-muted)" }}>
          Account Management
        </Link>
        <span>›</span>
        <Link href="/account-management/settings" className="hover:underline" style={{ color: "var(--rtm-text-muted)" }}>
          Settings
        </Link>
        <span>›</span>
        <span style={{ color: "var(--rtm-text-secondary)", fontWeight: 600 }}>Task Lists</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Task Lists
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            Build the setup and recurring task list for each service. At project launch, each task routes to the right department automatically.
          </p>
        </div>
      </div>

      {/* Service picker */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <label className="text-sm font-semibold block mb-2" style={{ color: "var(--rtm-text-primary)" }}>
          Select a service
        </label>

        {servicesLoading ? (
          <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Loading services…</div>
        ) : servicesError ? (
          <div className="text-xs text-red-600">Failed to load services: {servicesError}</div>
        ) : (
          <select
            className={SELECT_CLS}
            style={{ ...SELECT_STYLE, minWidth: "260px" }}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">— choose a service —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} {s.department ? `(${s.department})` : ""}
              </option>
            ))}
          </select>
        )}

        {selectedService && (
          <p className="text-xs mt-2" style={{ color: "var(--rtm-text-muted)" }}>
            Catalogue department: <strong>{selectedService.department || "not set"}</strong>
            {" · "}Tasks in the list below may belong to different departments.
          </p>
        )}
      </div>

      {/* Editor area */}
      {selectedId && (
        <>
          {templateLoading ? (
            <div
              className="rounded-xl border p-8 text-center"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading task list…</p>
            </div>
          ) : (
            <>
              {/* No-template notice */}
              {!hasTemplate && (
                <div
                  className="rounded-xl border px-5 py-4 text-sm"
                  style={{
                    background: "#FFFBEB",
                    borderColor: "#FDE68A",
                    color: "#92400E",
                  }}
                >
                  ⚠️ No task list exists for this service yet. Add tasks below and save to create one.
                </div>
              )}

              {/* Two fixed group editors */}
              {FIXED_GROUPS.map(({ kind, label }) => (
                <GroupEditor
                  key={kind}
                  kind={kind}
                  label={label}
                  tasks={kind === "setup" ? setupTasks : recurringTasks}
                  onChange={kind === "setup" ? setSetupTasks : setRecurringTasks}
                  saving={saving}
                />
              ))}

              {/* Save bar */}
              <div
                className="flex items-center justify-between rounded-xl border px-5 py-3"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
              >
                <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  {saving
                    ? "Saving…"
                    : saveSuccess
                    ? <span style={{ color: "#059669" }}>✓ Saved successfully</span>
                    : saveError
                    ? <span className="text-red-600">Error: {saveError}</span>
                    : selectedService
                    ? `Editing: ${selectedService.label}`
                    : null}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
                  style={{
                    background: saving ? "var(--rtm-border)" : "#1B4FD8",
                    color: "#fff",
                    border: "none",
                    cursor: saving ? "wait" : "pointer",
                  }}
                >
                  {saving ? "Saving…" : "Save task list"}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Empty prompt */}
      {!selectedId && !servicesLoading && !servicesError && (
        <div
          className="rounded-xl border py-16 text-center"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-primary)" }}>
            Choose a service above to start
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Select a service from the catalogue to view and edit its task list.
          </p>
        </div>
      )}
    </div>
  );
}
