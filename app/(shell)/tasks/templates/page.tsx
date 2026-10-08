"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// 
// Task Blueprints (formerly Task Template Library)
// Route: /tasks/templates
// Master source of task blueprints for all services sold in RTM OS
// Belongs to: Projects & Tasks → Task Blueprints
// 

//  Types 

type TemplateType =
  | "Setup"| "Onboarding"| "Launch"| "Monthly Management"| "Quarterly Review"| "Renewal"| "Offboarding"| "Cancellation"| "Upsell"| "Budget Reallocation";

type ActivationTrigger =
  | "Proposal Approved"| "Contract Signed"| "Invoice Paid"| "Client Activated"| "Upsell Approved"| "Renewal Signed"| "Cancellation Requested"| "Offboarding Approved";

type Department =
  | "SEO"| "GBP"| "Paid Advertising"| "Meta Ads"| "Reporting"| "Web Development"| "Creative"| "Account Management"| "Billing";

type DependencyStatus = "Required"| "Optional"| "Blocked"| "Waiting"| "Ready";
type TemplateStatus = "Active"| "Inactive"| "Draft";
type TaskPriority = "High"| "Medium"| "Low";

interface TemplateTask {
  name: string;
  department: Department;
  ownerRole: string;
  estimatedHours: number;
  targetCompletionDays: number;
  priority: TaskPriority;
  dependency: string;
  dueOffset: string;
  status: DependencyStatus;
  description: string;
}

interface TaskTemplate {
  id: string;
  name: string;
  department: Department;
  type: TemplateType;
  mappedLineItem: string;
  taskCount: number;
  activationTrigger: ActivationTrigger;
  status: TemplateStatus;
  lastUpdated: string;
  activationReady: boolean;
  tasks: TemplateTask[];
  description: string;
  dependencies: string[];
  monthlyTaskCount: number;
  quarterlyTaskCount: number;
  marginContribution: string;
  // SLA policy fields — null means not yet set by Account Management
  firstResponseDays:    number | null;
  targetCompletionDays: number | null;
  dueDateOffsetDays:    number | null;
  escalationAfterDays:  number | null;
}

// ---------------------------------------------------------------------------
// Adapter: BlueprintApiRecord → TaskTemplate
// Blueprints come from /api/task-blueprints (Postgres-backed, single source of truth).
// ---------------------------------------------------------------------------

// Engine-level task def (matches task_list_templates groups[].tasks[]).
interface TemplateTaskDef {
  localId: string;
  label: string;
  department: string;
  offsetDays: number;
  offsetFrom: "launch" | "prereq";
  prereqIds: string[];
  intervalDays?: number;
  // Restored per-task fields
  ownerRole?: string;
  estimatedHours?: number;
  priority?: string;
  description?: string;
}

interface TemplateGroup {
  kind: "setup" | "recurring";
  heading: string;
  tasks: TemplateTaskDef[];
}

interface BlueprintApiTask {
  id: string;
  name: string;
  department: string;
  ownerRole: string;
  estimatedHours: number;
  priority: string;
  dependsOnId?: string;
  dueDaysOffset: number;
  description?: string;
  localId?: string;
  offsetFrom?: "launch" | "prereq";
  prereqIds?: string[];
  intervalDays?: number;
}

interface BlueprintApiRecord {
  id: string;
  name: string;
  department: string;
  servicePackage: string;
  mappedLineItem: string;
  description: string;
  activationTrigger: string;
  estimatedTotalHours: number;
  tasks: BlueprintApiTask[];
  isActive: boolean;
  /** Full group structure from Postgres — present for edit. */
  groups?: TemplateGroup[];
  lastUpdated: string;
  version: string;
  // SLA policy fields from DB — null means not set
  firstResponseDays:    number | null;
  targetCompletionDays: number | null;
  dueDateOffsetDays:    number | null;
  escalationAfterDays:  number | null;
}

// All blueprint-level fields for the editor form
interface BlueprintMeta {
  name: string;
  department: string;
  servicePackage: string;
  mappedLineItem: string;
  description: string;
  activationTrigger: string;
  estimatedTotalHours: number;
  isActive: boolean;
  version: string;
  // SLA policy fields — null means not set
  firstResponseDays:    number | null;
  targetCompletionDays: number | null;
  dueDateOffsetDays:    number | null;
  escalationAfterDays:  number | null;
}

const DEPT_MAP: Record<string, Department> = {
  "SEO":                "SEO",
  "GBP":                "GBP",
  "PPC":                "Paid Advertising",
  "Meta Ads":           "Meta Ads",
  "Reporting":          "Reporting",
  "Web Development":    "Web Development",
  "Design":             "Creative",
  "Account Management": "Account Management",
  "Billing":            "Billing",
};

function blueprintToTemplate(bp: BlueprintApiRecord): TaskTemplate {
  const dept: Department = DEPT_MAP[bp.department] ?? "Account Management";

  let type: TemplateType = "Setup";
  const lname = bp.name.toLowerCase();
  if (lname.includes("onboard")) type = "Onboarding";
  else if (lname.includes("launch")) type = "Launch";
  else if (lname.includes("monthly")) type = "Monthly Management";
  else if (lname.includes("build") || lname.includes("website")) type = "Setup";

  let trigger: ActivationTrigger = "Invoice Paid";
  const at = bp.activationTrigger.toLowerCase();
  if (at.includes("contract") || at.includes("signed")) trigger = "Contract Signed";
  else if (at.includes("client") && at.includes("activat")) trigger = "Client Activated";

  const tasks: TemplateTask[] = bp.tasks.map((bpt) => ({
    name: bpt.name,
    department: DEPT_MAP[bpt.department] ?? dept,
    ownerRole: bpt.ownerRole,
    estimatedHours: bpt.estimatedHours,
    targetCompletionDays: bpt.dueDaysOffset,
    priority: bpt.priority === "Urgent" ? "High" : ((bpt.priority || "High") as TaskPriority),
    dependency: bpt.dependsOnId ?? "None",
    dueOffset: `Day ${bpt.dueDaysOffset}`,
    status: "Required" as DependencyStatus,
    description: bpt.description ?? "",
  }));

  return {
    id: bp.id,
    name: bp.name,
    department: dept,
    type,
    mappedLineItem: bp.mappedLineItem,
    taskCount: bp.tasks.length,
    activationTrigger: trigger,
    status: bp.isActive ? "Active" : "Inactive",
    lastUpdated: bp.lastUpdated,
    activationReady: bp.isActive,
    tasks,
    description: bp.description,
    dependencies: [],
    monthlyTaskCount: bp.tasks.length,
    quarterlyTaskCount: bp.tasks.length * 3,
    marginContribution: "High",
    // SLA fields from DB — null until Account Management sets them
    firstResponseDays:    bp.firstResponseDays    ?? null,
    targetCompletionDays: bp.targetCompletionDays ?? null,
    dueDateOffsetDays:    bp.dueDateOffsetDays    ?? null,
    escalationAfterDays:  bp.escalationAfterDays  ?? null,
  };
}

// ---------------------------------------------------------------------------
// TemplateEditorModal — create or edit a task_list_templates row.
//
// Create: select a service from the catalogue, build setup + recurring groups.
// Edit:   loaded with existing groups; saves via PATCH /api/task-blueprints?id=<serviceId>.
//
// Features carried from the duplicate editor (now deleted):
//   - Two fixed groups (Setup, Recurring).
//   - Prerequisite picker in the Setup group.
//   - Paste-lines textarea (each line becomes a task).
//   - Reorder arrows (never rewire prereqIds).
//   - Client-side cycle check naming the tasks.
//   - Server-side cycle check on POST/PATCH (422 with names).
// ---------------------------------------------------------------------------

// ── ID helper ──────────────────────────────────────────────────────────────
function makeLocalId(): string {
  return "t-" + Math.random().toString(36).slice(2, 7);
}

// ── Blank task factories ───────────────────────────────────────────────────
function blankTask(isRecurring = false): TemplateTaskDef {
  return {
    localId:    makeLocalId(),
    label:      "",
    department: "",
    offsetDays: 0,
    offsetFrom: "launch",
    prereqIds:  [],
    ...(isRecurring ? { intervalDays: 30 } : {}),
  };
}

function pastedTask(label: string, isRecurring = false): TemplateTaskDef {
  return {
    localId:    makeLocalId(),
    label,
    department: "",
    offsetDays: 0,
    offsetFrom: "launch",
    prereqIds:  [],
    ...(isRecurring ? { intervalDays: 30 } : {}),
  };
}

// ── Client-side cycle detection ────────────────────────────────────────────
function findCycleClient(tasks: TemplateTaskDef[]): string[] | null {
  const adj = new Map<string, string[]>();
  for (const t of tasks) adj.set(t.localId, t.prereqIds ?? []);
  const colour = new Map<string, number>();
  const parent = new Map<string, string | null>();
  for (const t of tasks) { colour.set(t.localId, 0); parent.set(t.localId, null); }

  function dfs(node: string): string[] | null {
    colour.set(node, 1);
    for (const dep of adj.get(node) ?? []) {
      if (!colour.has(dep)) continue;
      if (colour.get(dep) === 1) {
        const cycle: string[] = [dep];
        let cur: string = node;
        while (cur !== dep) { cycle.push(cur); const p = parent.get(cur); if (!p) break; cur = p; }
        cycle.push(dep);
        return cycle.reverse();
      }
      if (colour.get(dep) === 0) { parent.set(dep, node); const sub = dfs(dep); if (sub) return sub; }
    }
    colour.set(node, 2);
    return null;
  }

  for (const t of tasks) { if (colour.get(t.localId) === 0) { const c = dfs(t.localId); if (c) return c; } }
  return null;
}

// ── Display-label map (handles duplicate task labels in prereq picker) ──────
function buildDisplayLabels(tasks: TemplateTaskDef[]): Map<string, string> {
  const map = new Map<string, string>();
  const counts = new Map<string, number>();
  for (const t of tasks) counts.set(t.label || "(unlabelled)", (counts.get(t.label || "(unlabelled)") ?? 0) + 1);
  const seen = new Map<string, number>();
  for (const t of tasks) {
    const lbl = t.label || "(unlabelled)";
    const count = counts.get(lbl) ?? 1;
    if (count === 1) { map.set(t.localId, lbl); }
    else { const ord = (seen.get(lbl) ?? 0) + 1; seen.set(lbl, ord); map.set(t.localId, ord === 1 ? lbl : `${lbl} (${ord})`); }
  }
  return map;
}

// ── Shared input style ─────────────────────────────────────────────────────
const EDITOR_INPUT: React.CSSProperties = {
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

const EDITOR_LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--rtm-text-muted)",
  display: "block",
  marginBottom: 3,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const VALID_DEPARTMENTS_EDITOR = [
  "Account Management", "SEO", "GBP", "Paid Advertising", "Meta Ads",
  "Reporting", "Web Development", "Creative", "Billing",
];

// ── EditorTaskRow ──────────────────────────────────────────────────────────
function EditorTaskRow({
  task, index, total, allTasks, displayLabels, onChange, onRemove, onMove, disabled, isSetup, isRecurring,
}: {
  task: TemplateTaskDef; index: number; total: number;
  allTasks: TemplateTaskDef[]; displayLabels: Map<string, string>;
  onChange: (t: TemplateTaskDef) => void; onRemove: () => void;
  onMove: (dir: -1 | 1) => void; disabled: boolean;
  isSetup: boolean; isRecurring: boolean;
}) {
  const prereqOptions = allTasks.filter((t) => t.localId !== task.localId);

  function togglePrereq(localId: string) {
    const current = task.prereqIds ?? [];
    const next = current.includes(localId) ? current.filter((id) => id !== localId) : [...current, localId];
    const offsetFrom = next.length > 0 && current.length === 0 ? "prereq" : task.offsetFrom;
    onChange({ ...task, prereqIds: next, offsetFrom });
  }

  const hasPrereqs = (task.prereqIds ?? []).length > 0;

  return (
    <div className="rounded-lg border p-3 flex flex-col gap-2" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-0.5 flex-shrink-0 mt-0.5">
          <button type="button" onClick={() => onMove(-1)} disabled={disabled || index === 0} title="Move up"
            className="text-xs px-1 py-0.5 rounded border disabled:opacity-30"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)", lineHeight: 1 }}>▲</button>
          <button type="button" onClick={() => onMove(1)} disabled={disabled || index === total - 1} title="Move down"
            className="text-xs px-1 py-0.5 rounded border disabled:opacity-30"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)", lineHeight: 1 }}>▼</button>
        </div>
        <div className="flex-1 min-w-0">
          <label style={EDITOR_LABEL}>Label</label>
          <input type="text" value={task.label} onChange={(e) => onChange({ ...task, label: e.target.value })}
            disabled={disabled} placeholder="Task label" style={{ ...EDITOR_INPUT, width: "100%" }} />
        </div>
        <button type="button" onClick={onRemove} disabled={disabled} title="Remove task"
          className="text-xs px-2 py-1 rounded border mt-4 flex-shrink-0 disabled:opacity-40"
          style={{ borderColor: "#FECACA", color: "#DC2626", background: "#FEF2F2" }}>Remove</button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <label style={EDITOR_LABEL}>Department</label>
          <select value={task.department} onChange={(e) => onChange({ ...task, department: e.target.value })}
            disabled={disabled}
            className="text-xs font-medium rounded-lg border px-2 py-1 focus:outline-none"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
            <option value="">— not set —</option>
            {VALID_DEPARTMENTS_EDITOR.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label style={EDITOR_LABEL}>Due offset (days)</label>
          <input type="number" min={0} value={task.offsetDays}
            onChange={(e) => { const v = parseInt(e.target.value, 10); onChange({ ...task, offsetDays: isNaN(v) ? 0 : Math.max(0, v) }); }}
            disabled={disabled} style={{ ...EDITOR_INPUT, width: "80px" }} />
        </div>
        {isSetup && (
          <div className="flex flex-col gap-1">
            <label style={EDITOR_LABEL}>Due date counts from</label>
            <select value={task.offsetFrom}
              onChange={(e) => onChange({ ...task, offsetFrom: e.target.value as "launch" | "prereq" })}
              disabled={disabled}
              className="text-xs font-medium rounded-lg border px-2 py-1 focus:outline-none"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
              <option value="launch">Project launch</option>
              <option value="prereq">Prerequisites closing</option>
            </select>
          </div>
        )}
        {isRecurring && (
          <div className="flex flex-col gap-1">
            <label style={EDITOR_LABEL}>Repeat every (days)</label>
            <input type="number" min={1} value={task.intervalDays ?? ""}
              onChange={(e) => { const v = parseInt(e.target.value, 10); onChange({ ...task, intervalDays: isNaN(v) || v < 1 ? undefined : v }); }}
              disabled={disabled} placeholder="e.g. 30" style={{ ...EDITOR_INPUT, width: "90px" }} />
            {!task.intervalDays && <span style={{ fontSize: 10, color: "#DC2626" }}>Required</span>}
          </div>
        )}
      </div>

      {/* Restored per-task fields: ownerRole, estimatedHours, priority, description */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <label style={EDITOR_LABEL}>Owner Role</label>
          <input type="text" value={task.ownerRole ?? ""} onChange={(e) => onChange({ ...task, ownerRole: e.target.value || undefined })}
            disabled={disabled} placeholder="e.g. SEO Lead" style={{ ...EDITOR_INPUT, width: "130px" }} />
        </div>
        <div className="flex flex-col gap-1">
          <label style={EDITOR_LABEL}>Est. Hours</label>
          <input type="number" min={0} step={0.25} value={task.estimatedHours ?? ""}
            onChange={(e) => { const v = parseFloat(e.target.value); onChange({ ...task, estimatedHours: isNaN(v) ? undefined : v }); }}
            disabled={disabled} placeholder="0" style={{ ...EDITOR_INPUT, width: "70px" }} />
        </div>
        <div className="flex flex-col gap-1">
          <label style={EDITOR_LABEL}>Priority</label>
          <select value={task.priority ?? "High"} onChange={(e) => onChange({ ...task, priority: e.target.value })}
            disabled={disabled}
            className="text-xs font-medium rounded-lg border px-2 py-1 focus:outline-none"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label style={EDITOR_LABEL}>Description</label>
        <input type="text" value={task.description ?? ""} onChange={(e) => onChange({ ...task, description: e.target.value || undefined })}
          disabled={disabled} placeholder="What this task involves (optional)"
          style={{ ...EDITOR_INPUT, width: "100%" }} />
      </div>

      {isSetup && prereqOptions.length > 0 && (
        <div className="flex flex-col gap-1">
          <label style={EDITOR_LABEL}>
            Prerequisites
            {hasPrereqs && <span style={{ fontWeight: 400, textTransform: "none", marginLeft: 6, color: "var(--rtm-text-secondary)" }}>(waits on selected)</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {prereqOptions.map((opt) => {
              const checked = (task.prereqIds ?? []).includes(opt.localId);
              const lbl = displayLabels.get(opt.localId) ?? (opt.label || "(unlabelled)");
              return (
                <label key={opt.localId} className="flex items-center gap-1.5 text-xs cursor-pointer select-none"
                  style={{ padding: "3px 8px", borderRadius: 6, border: `1px solid ${checked ? "#BFDBFE" : "var(--rtm-border)"}`,
                    background: checked ? "#EFF6FF" : "var(--rtm-bg)", color: checked ? "#1D4ED8" : "var(--rtm-text-secondary)",
                    opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>
                  <input type="checkbox" checked={checked} onChange={() => !disabled && togglePrereq(opt.localId)} disabled={disabled} className="w-3 h-3" />
                  {lbl}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── EditorGroupPanel ───────────────────────────────────────────────────────
function EditorGroupPanel({
  kind, label, tasks, onChange, saving,
}: { kind: "setup" | "recurring"; label: string; tasks: TemplateTaskDef[]; onChange: (t: TemplateTaskDef[]) => void; saving: boolean }) {
  const isSetup = kind === "setup";
  const isRecurring = kind === "recurring";
  const displayLabels = buildDisplayLabels(tasks);
  const pasteRef = useRef<HTMLTextAreaElement>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteValue, setPasteValue] = useState("");

  function addTask() { onChange([...tasks, blankTask(isRecurring)]); }

  function commitPaste() {
    const lines = pasteValue.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0) onChange([...tasks, ...lines.map((l) => pastedTask(l, isRecurring))]);
    setPasteValue(""); setPasteMode(false);
  }

  function updateTask(i: number, t: TemplateTaskDef) { onChange(tasks.map((ex, idx) => idx === i ? t : ex)); }

  function removeTask(i: number) {
    const removed = tasks[i];
    const remaining = tasks.filter((_, idx) => idx !== i);
    const cleaned = remaining.map((t) => ({ ...t, prereqIds: (t.prereqIds ?? []).filter((id) => id !== removed.localId) }));
    onChange(cleaned);
  }

  function moveTask(i: number, dir: -1 | 1) {
    const next = [...tasks];
    const swap = i + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[i], next[swap]] = [next[swap], next[i]];
    onChange(next);
  }

  return (
    <div className="rounded-xl border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{label}</h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: kind === "setup" ? "#EFF6FF" : "#F5F3FF", color: kind === "setup" ? "#1D4ED8" : "#7C3AED",
              border: `1px solid ${kind === "setup" ? "#BFDBFE" : "#DDD6FE"}` }}>
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPasteMode(!pasteMode)} disabled={saving}
            className="text-xs font-semibold px-3 py-1 rounded-lg border transition-colors"
            style={{ background: pasteMode ? "#EFF6FF" : "var(--rtm-bg)", borderColor: pasteMode ? "#BFDBFE" : "var(--rtm-border)",
              color: pasteMode ? "#1D4ED8" : "var(--rtm-text-secondary)" }}>Paste lines</button>
          <button type="button" onClick={addTask} disabled={saving}
            className="text-xs font-semibold px-3 py-1 rounded-lg"
            style={{ background: "#1B4FD8", color: "#fff", border: "none" }}>+ Add task</button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {pasteMode && (
          <div className="rounded-lg border p-3" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
            <label className="text-xs font-semibold block mb-1" style={{ color: "#1D4ED8" }}>Paste task labels — one per line</label>
            <textarea ref={pasteRef} rows={4} value={pasteValue} onChange={(e) => setPasteValue(e.target.value)}
              placeholder={"Write a blog post\nOptimize meta tags\nSubmit sitemap"}
              style={{ ...EDITOR_INPUT, width: "100%", resize: "vertical", fontFamily: "inherit" }} />
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={commitPaste} disabled={saving || pasteValue.trim() === ""}
                className="text-xs font-semibold px-3 py-1 rounded-lg disabled:opacity-50"
                style={{ background: "#1B4FD8", color: "#fff", border: "none" }}>Add as tasks</button>
              <button type="button" onClick={() => { setPasteMode(false); setPasteValue(""); }}
                className="text-xs font-semibold px-3 py-1 rounded-lg border"
                style={{ borderColor: "#BFDBFE", color: "#1D4ED8", background: "transparent" }}>Cancel</button>
            </div>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="text-center py-8 rounded-lg border border-dashed"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
            <p className="text-xs">No tasks yet. Use &quot;+ Add task&quot; or &quot;Paste lines&quot;.</p>
          </div>
        ) : tasks.map((task, i) => (
          <EditorTaskRow key={task.localId} task={task} index={i} total={tasks.length}
            allTasks={tasks} displayLabels={displayLabels}
            onChange={(t) => updateTask(i, t)} onRemove={() => removeTask(i)}
            onMove={(dir) => moveTask(i, dir)} disabled={saving}
            isSetup={isSetup} isRecurring={isRecurring} />
        ))}
      </div>
    </div>
  );
}

// ── TemplateEditorModal ───────────────────────────────────────────────────
//
// editingServiceId: null = create, string = edit existing.
// Blueprint-level meta defaults
const BLANK_META: BlueprintMeta = {
  name: "", department: "", servicePackage: "", mappedLineItem: "",
  description: "", activationTrigger: "Invoice Paid",
  estimatedTotalHours: 0, isActive: true, version: "1.0",
  firstResponseDays: null, targetCompletionDays: null,
  dueDateOffsetDays: null, escalationAfterDays: null,
};

const ACTIVATION_TRIGGERS_LIST = [
  "Invoice Paid","Contract Signed","Proposal Approved","Client Activated",
  "Upsell Approved","Renewal Signed","Cancellation Requested","Offboarding Approved",
];

function TemplateEditorModal({
  onClose, onSaved, editingServiceId, initialGroups, initialMeta,
}: {
  onClose: () => void;
  onSaved: (bp: BlueprintApiRecord) => void;
  editingServiceId: string | null;
  initialGroups: TemplateGroup[];
  initialMeta: BlueprintMeta;
}) {
  const isEditing = editingServiceId !== null;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Blueprint-level meta fields — all editable
  const [meta, setMeta] = useState<BlueprintMeta>(initialMeta);

  // Service picker (create only)
  const [services, setServices] = useState<Array<{ id: string; label: string }>>([]);
  const [serviceId, setServiceId] = useState(editingServiceId ?? "");
  const [servicesLoading, setServicesLoading] = useState(!isEditing);

  // Activation mapping keys (create only)
  const [mappingInput, setMappingInput] = useState("");
  const [serviceMappings, setServiceMappings] = useState<string[]>([]);

  // Two fixed groups
  const [setupTasks,     setSetupTasks]     = useState<TemplateTaskDef[]>(
    initialGroups.find((g) => g.kind === "setup")?.tasks     ?? []
  );
  const [recurringTasks, setRecurringTasks] = useState<TemplateTaskDef[]>(
    initialGroups.find((g) => g.kind === "recurring")?.tasks ?? []
  );

  useEffect(() => {
    if (isEditing) return;
    fetch("/api/sales/service-catalog?all=1")
      .then((r) => r.json())
      .then((d) => {
        const rows = (d.services ?? []) as Array<{ id: string; label: string }>;
        setServices(rows);
        setServicesLoading(false);
      })
      .catch(() => setServicesLoading(false));
  }, [isEditing]);

  const addMapping = () => {
    const v = mappingInput.trim().toLowerCase();
    if (v && !serviceMappings.includes(v)) setServiceMappings((p) => [...p, v]);
    setMappingInput("");
  };

  const handleSave = async () => {
    if (!isEditing && !serviceId) { setError("Select a service."); return; }
    if (!meta.name.trim()) { setError("Blueprint name is required."); return; }

    // Client-side cycle check.
    const cycle = findCycleClient(setupTasks);
    if (cycle) {
      const allById = new Map(setupTasks.map((t) => [t.localId, t]));
      const names = cycle.map((id) => `"${allById.get(id)?.label || id}"`).join(" → ");
      setError(`Cannot save: cycle detected — ${names}`);
      return;
    }

    setSaving(true); setError("");
    const groups: TemplateGroup[] = [
      { kind: "setup",     heading: "Setup",     tasks: setupTasks },
      { kind: "recurring", heading: "Recurring", tasks: recurringTasks },
    ];

    try {
      let res: Response;
      if (isEditing) {
        res = await fetch(`/api/task-blueprints?id=${encodeURIComponent(editingServiceId!)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groups,
            name:                meta.name,
            department:          meta.department,
            servicePackage:      meta.servicePackage,
            mappedLineItem:      meta.mappedLineItem,
            description:         meta.description,
            activationTrigger:   meta.activationTrigger,
            estimatedTotalHours: meta.estimatedTotalHours,
            isActive:            meta.isActive,
            version:             meta.version,
            firstResponseDays:    meta.firstResponseDays,
            targetCompletionDays: meta.targetCompletionDays,
            dueDateOffsetDays:    meta.dueDateOffsetDays,
            escalationAfterDays:  meta.escalationAfterDays,
          }),
        });
      } else {
        const allMappings = [...new Set([serviceId, ...serviceMappings])];
        res = await fetch("/api/task-blueprints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blueprint: {
              id:                  serviceId,
              name:                meta.name || serviceId,
              department:          meta.department,
              servicePackage:      meta.servicePackage,
              mappedLineItem:      meta.mappedLineItem,
              description:         meta.description,
              activationTrigger:   meta.activationTrigger,
              estimatedTotalHours: meta.estimatedTotalHours,
              isActive:            meta.isActive,
              version:             meta.version,
              firstResponseDays:    meta.firstResponseDays,
              targetCompletionDays: meta.targetCompletionDays,
              dueDateOffsetDays:    meta.dueDateOffsetDays,
              escalationAfterDays:  meta.escalationAfterDays,
              groups,
            },
            serviceMappings: allMappings,
          }),
        });
      }

      const data = (await res.json()) as { blueprint?: BlueprintApiRecord; error?: string };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      onSaved(data.blueprint!);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="h-full w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl"
        style={{ background: "var(--rtm-surface)" }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--rtm-border)", background: "#EFF6FF" }}>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#1D4ED8" }}>
              {isEditing ? "Edit Task Template" : "New Task Template"}
            </div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
              {isEditing ? (meta.name || editingServiceId) : "Create Task Blueprint"}
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
              Tasks generated when a project is launched for this service.
            </p>
          </div>
          <button onClick={onClose}
            className="ml-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg hover:opacity-70"
            style={{ background: "rgba(0,0,0,0.08)", color: "var(--rtm-text-primary)" }}>×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Service picker (create only) */}
          {!isEditing && (
            <section className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>Service</div>
              {servicesLoading ? (
                <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Loading services…</p>
              ) : (
                <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
                  <option value="">— choose a service —</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              )}
              {/* Activation mapping */}
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: "var(--rtm-text-primary)" }}>Additional service-name aliases</label>
                <p className="text-xs mb-2" style={{ color: "var(--rtm-text-secondary)" }}>Other lowercase keys that should route to this template (e.g. &ldquo;seo / gbp&rdquo;).</p>
                <div className="flex gap-2">
                  <input type="text" value={mappingInput} onChange={(e) => setMappingInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addMapping()}
                    placeholder="e.g. seo / gbp"
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
                  <button type="button" onClick={addMapping}
                    className="px-3 py-2 rounded-lg text-sm font-bold"
                    style={{ background: "var(--rtm-blue)", color: "#fff" }}>+ Add</button>
                </div>
                {serviceMappings.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {serviceMappings.map((k) => (
                      <span key={k} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
                        {k}
                        <button type="button" onClick={() => setServiceMappings((p) => p.filter((x) => x !== k))}
                          className="ml-1 opacity-60 hover:opacity-100 font-black text-sm">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}


          {/* Blueprint meta fields — always visible, create and edit */}
          <section className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>Blueprint Details</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label style={EDITOR_LABEL}>Name *</label>
                <input type="text" value={meta.name} onChange={(e) => setMeta((m) => ({ ...m, name: e.target.value }))}
                  disabled={saving} placeholder="e.g. SEO Launch Blueprint"
                  style={{ ...EDITOR_INPUT, width: "100%" }} />
              </div>
              <div>
                <label style={EDITOR_LABEL}>Department</label>
                <input type="text" value={meta.department} onChange={(e) => setMeta((m) => ({ ...m, department: e.target.value }))}
                  disabled={saving} placeholder="e.g. SEO"
                  style={{ ...EDITOR_INPUT, width: "100%" }} />
              </div>
              <div>
                <label style={EDITOR_LABEL}>Version</label>
                <input type="text" value={meta.version} onChange={(e) => setMeta((m) => ({ ...m, version: e.target.value }))}
                  disabled={saving} placeholder="e.g. 1.0"
                  style={{ ...EDITOR_INPUT, width: "100%" }} />
              </div>
              <div>
                <label style={EDITOR_LABEL}>Service Package</label>
                <input type="text" value={meta.servicePackage} onChange={(e) => setMeta((m) => ({ ...m, servicePackage: e.target.value }))}
                  disabled={saving} placeholder="e.g. SEO Only"
                  style={{ ...EDITOR_INPUT, width: "100%" }} />
              </div>
              <div>
                <label style={EDITOR_LABEL}>Mapped Line Item</label>
                <input type="text" value={meta.mappedLineItem} onChange={(e) => setMeta((m) => ({ ...m, mappedLineItem: e.target.value }))}
                  disabled={saving} placeholder="e.g. SEO Management"
                  style={{ ...EDITOR_INPUT, width: "100%" }} />
              </div>
              <div>
                <label style={EDITOR_LABEL}>Activation Trigger</label>
                <select value={meta.activationTrigger} onChange={(e) => setMeta((m) => ({ ...m, activationTrigger: e.target.value }))}
                  disabled={saving}
                  className="text-xs font-medium rounded-lg border px-2 py-1 focus:outline-none"
                  style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
                  {ACTIVATION_TRIGGERS_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={EDITOR_LABEL}>Est. Total Hours</label>
                <input type="number" min={0} step={0.5} value={meta.estimatedTotalHours}
                  onChange={(e) => { const v = parseFloat(e.target.value); setMeta((m) => ({ ...m, estimatedTotalHours: isNaN(v) ? 0 : v })); }}
                  disabled={saving} style={{ ...EDITOR_INPUT, width: "90px" }} />
              </div>
              <div className="col-span-2">
                <label style={EDITOR_LABEL}>Description</label>
                <textarea rows={2} value={meta.description} onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
                  disabled={saving} placeholder="What this blueprint does and when it fires."
                  style={{ ...EDITOR_INPUT, width: "100%", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={meta.isActive}
                  onChange={(e) => setMeta((m) => ({ ...m, isActive: e.target.checked }))}
                  disabled={saving} className="w-4 h-4" />
                <label htmlFor="isActive" className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>Active (routes service lookups here)</label>
              </div>
            </div>
          </section>

          {/* SLA Policy fields — set by Account Management */}
          <section className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>Service Level Agreement</div>
            <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>RTM delivery policy for this blueprint. Leave blank until confirmed. All values are in days.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={EDITOR_LABEL}>First Response (business days)</label>
                <input
                  type="number" min={1} step={1}
                  value={meta.firstResponseDays ?? ""}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setMeta((m) => ({ ...m, firstResponseDays: isNaN(v) || v < 1 ? null : v }));
                  }}
                  disabled={saving}
                  placeholder="e.g. 1"
                  style={{ ...EDITOR_INPUT, width: "100%" }}
                />
              </div>
              <div>
                <label style={EDITOR_LABEL}>Target Completion (business days)</label>
                <input
                  type="number" min={1} step={1}
                  value={meta.targetCompletionDays ?? ""}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setMeta((m) => ({ ...m, targetCompletionDays: isNaN(v) || v < 1 ? null : v }));
                  }}
                  disabled={saving}
                  placeholder="e.g. 30"
                  style={{ ...EDITOR_INPUT, width: "100%" }}
                />
              </div>
              <div>
                <label style={EDITOR_LABEL}>Due Date Offset (calendar days from activation)</label>
                <input
                  type="number" min={0} step={1}
                  value={meta.dueDateOffsetDays ?? ""}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setMeta((m) => ({ ...m, dueDateOffsetDays: isNaN(v) || v < 0 ? null : v }));
                  }}
                  disabled={saving}
                  placeholder="e.g. 0"
                  style={{ ...EDITOR_INPUT, width: "100%" }}
                />
              </div>
              <div>
                <label style={EDITOR_LABEL}>Escalation After (calendar days)</label>
                <input
                  type="number" min={1} step={1}
                  value={meta.escalationAfterDays ?? ""}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setMeta((m) => ({ ...m, escalationAfterDays: isNaN(v) || v < 1 ? null : v }));
                  }}
                  disabled={saving}
                  placeholder="e.g. 7"
                  style={{ ...EDITOR_INPUT, width: "100%" }}
                />
              </div>
            </div>
          </section>

          {/* Setup tasks */}
          <section className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>Setup Tasks</div>
            <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>Run once at project launch. Supports prerequisites and &ldquo;due date counts from&rdquo;.</p>
            <EditorGroupPanel kind="setup" label="Setup Tasks" tasks={setupTasks} onChange={setSetupTasks} saving={saving} />
          </section>

          {/* Recurring tasks */}
          <section className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>Recurring Tasks</div>
            <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>Repeat indefinitely. Each task requires a repeat interval (days).</p>
            <EditorGroupPanel kind="recurring" label="Recurring Tasks" tasks={recurringTasks} onChange={setRecurringTasks} saving={saving} />
          </section>

          {error && (
            <div className="rounded-lg px-4 py-3 text-sm font-semibold"
              style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center gap-3 flex-wrap"
          style={{ borderTop: "1px solid var(--rtm-border)" }}>
          <button type="button" onClick={handleSave} disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
            style={{ background: "var(--rtm-blue)" }}>
            {saving ? "Saving…" : isEditing ? "Save changes" : "Create Template"}
          </button>
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ color: "var(--rtm-text-muted)" }}>Cancel</button>
          <span className="ml-auto text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            {setupTasks.length} setup · {recurringTasks.length} recurring
          </span>
        </div>
      </div>
    </div>
  );
}

//  Design helpers 

const DEPT_COLORS: Record<Department, { bg?: string; color?: string; border: string }> = {
  "SEO":                { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE"},
  "GBP":                { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
  "Paid Advertising":   { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA"},
  "Meta Ads":           { bg: "#FAF5FF", color: "#7C3AED", border: "#DDD6FE"},
  "Reporting":          { bg: "#ECFEFF", color: "#0891B2", border: "#A5F3FC"},
  "Web Development":    { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0"},
  "Creative":           { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3"},
  "Account Management": { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
  "Billing":            { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1"},
};

const TYPE_COLORS: Record<TemplateType, { bg?: string; color?: string }> = {
  "Setup":               { bg: "#EFF6FF", color: "#1D4ED8"},
  "Onboarding":          { bg: "#ECFDF5", color: "#059669"},
  "Launch":              { bg: "#FFF7ED", color: "#C2410C"},
  "Monthly Management":  { bg: "#FAF5FF", color: "#7C3AED"},
  "Quarterly Review":    { bg: "#ECFEFF", color: "#0891B2"},
  "Renewal":             { bg: "#F0FDF4", color: "#16A34A"},
  "Offboarding":         { bg: "#FFF1F2", color: "#BE123C"},
  "Cancellation":        { bg: "#FEF2F2", color: "#DC2626"},
  "Upsell":              { bg: "#FFFBEB", color: "#D97706"},
  "Budget Reallocation": { bg: "#F8FAFC", color: "#475569"},
};

const TRIGGER_COLORS: Record<ActivationTrigger, { bg?: string; color?: string }> = {
  "Proposal Approved":      { bg: "#EFF6FF", color: "#1D4ED8"},
  "Contract Signed":        { bg: "#ECFDF5", color: "#059669"},
  "Invoice Paid":           { bg: "#FFF7ED", color: "#C2410C"},
  "Client Activated":       { bg: "#FAF5FF", color: "#7C3AED"},
  "Upsell Approved":        { bg: "#FFFBEB", color: "#D97706"},
  "Renewal Signed":         { bg: "#F0FDF4", color: "#16A34A"},
  "Cancellation Requested": { bg: "#FFF1F2", color: "#BE123C"},
  "Offboarding Approved":   { bg: "#FEF2F2", color: "#DC2626"},
};

const STATUS_COLORS: Record<TemplateStatus, { bg?: string; color?: string; border: string }> = {
  "Active":   { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
  "Inactive": { bg: "#F8FAFC", color: "#94A3B8", border: "#CBD5E1"},
  "Draft":    { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
};

const DEP_STATUS_COLORS: Record<DependencyStatus, { bg?: string; color?: string }> = {
  "Required": { bg: "#EFF6FF", color: "#1D4ED8"},
  "Optional": { bg: "#F0FDF4", color: "#16A34A"},
  "Blocked":  { bg: "#FEF2F2", color: "#DC2626"},
  "Waiting":  { bg: "#FFFBEB", color: "#D97706"},
  "Ready":    { bg: "#ECFDF5", color: "#059669"},
};

const PRIORITY_COLORS: Record<TaskPriority, { bg?: string; color?: string }> = {
  "High":   { bg: "#FEF2F2", color: "#DC2626"},
  "Medium": { bg: "#FFFBEB", color: "#D97706"},
  "Low":    { bg: "#F8FAFC", color: "#94A3B8"},
};

//  Sub-components 

function DeptBadge({ dept }: { dept: Department }) {
  const c = DEPT_COLORS[dept];
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {dept}
    </span>
  );
}

function TypeBadge({ type }: { type: TemplateType }) {
  const c = TYPE_COLORS[type];
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color }}
    >
      {type}
    </span>
  );
}

function TriggerBadge({ trigger }: { trigger: ActivationTrigger }) {
  const c = TRIGGER_COLORS[trigger];
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color }}
    >
       {trigger}
    </span>
  );
}

function StatusBadge({ status }: { status: TemplateStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full"style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {status}
    </span>
  );
}

function DepStatusBadge({ status }: { status: DependencyStatus }) {
  const c = DEP_STATUS_COLORS[status];
  return (
    <span
      className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color }}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const c = PRIORITY_COLORS[priority];
  return (
    <span
      className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color }}
    >
      {priority}
    </span>
  );
}

//  Template Detail Drawer 

function TemplateDrawer({
  template,
  onClose,
  onEdit,
}: {
  template: TaskTemplate;
  onClose: () => void;
  onEdit: (templateId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview"| "tasks"| "dependencies"| "workload"| "activation"| "notes">("overview");

  const tabs = [
    { id: "overview"as const, label: "Overview"},
    { id: "tasks"as const, label: `Tasks (${template.taskCount})` },
    { id: "dependencies"as const, label: "Dependencies"},
    { id: "workload"as const, label: "SLA & Throughput"},
    { id: "activation"as const, label: "Activation Rules"},
    { id: "notes"as const, label: "Notes"},
  ];

  const dc = DEPT_COLORS[template.department];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"style={{ background: "rgba(0,0,0,0.35)"}}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="h-full w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl"style={{ background: "var(--rtm-surface)"}}
      >
        {/* Drawer header */}
        <div
          className="flex items-start justify-between px-6 py-5"style={{ borderBottom: "1px solid var(--rtm-border)", background: dc.bg }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <TypeBadge type={template.type} />
              <StatusBadge status={template.status} />
              {template.activationReady && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                   Activation Ready
                </span>
              )}
            </div>
            <h2 className="text-lg font-extrabold mt-1"style={{ color: "var(--rtm-text-primary)"}}>
              {template.name}
            </h2>
            <p className="text-xs mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
              {template.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg hover:opacity-70 transition-opacity"style={{ background: "rgba(0,0,0,0.08)", color: "var(--rtm-text-primary)"}}
          >
            ×
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-0"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          {[
            { label: "Tasks", value: template.taskCount },
            { label: "Target Completion", value: template.targetCompletionDays !== null ? `${template.targetCompletionDays}bd` : "Not set" },
            { label: "Department", value: template.department },
            { label: "Trigger", value: template.activationTrigger },
          ].map((s, i) => (
            <div
              key={s.label}
              className="px-4 py-3 text-center"style={{
                borderRight: i < 3 ? "1px solid var(--rtm-border)": undefined,
                background: "var(--rtm-bg)",
              }}
            >
              <div className="text-lg font-black"style={{ color: "var(--rtm-text-primary)"}}>{s.value}</div>
              <div className="text-[10px] font-semibold mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0"style={{
                color: activeTab === tab.id ? "var(--rtm-blue)": "var(--rtm-text-secondary)",
                borderBottom: activeTab === tab.id ? "2px solid var(--rtm-blue)": "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview */}
          {activeTab === "overview"&& (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2"style={{ color: "var(--rtm-text-muted)"}}>Mapped Line Item</div>
                  <div className="font-bold"style={{ color: "var(--rtm-text-primary)"}}>{template.mappedLineItem}</div>
                </div>
                <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2"style={{ color: "var(--rtm-text-muted)"}}>Department</div>
                  <DeptBadge dept={template.department} />
                </div>
                <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2"style={{ color: "var(--rtm-text-muted)"}}>Activation Trigger</div>
                  <TriggerBadge trigger={template.activationTrigger} />
                </div>
                <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2"style={{ color: "var(--rtm-text-muted)"}}>Last Updated</div>
                  <div className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{template.lastUpdated}</div>
                </div>
              </div>

              {/* Flow preview */}
              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>Activation Flow</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: template.mappedLineItem },
                    { label: "↓", arrow: true },
                    { label: template.name },
                    { label: "↓", arrow: true },
                    { label: `${template.taskCount} Tasks Generated` },
                    { label: "↓", arrow: true },
                    { label: template.department },
                  ].map((step, i) =>
                    step.arrow ? (
                      <span key={i} className="text-lg font-black"style={{ color: "var(--rtm-text-muted)"}}>↓</span>
                    ) : (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}
                      >
                        {step.label}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tasks */}
          {activeTab === "tasks"&& (
            <div className="space-y-3">
              <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>
                Task Breakdown – {template.taskCount} tasks
              </div>
              <div className="overflow-x-auto rounded-xl"style={{ border: "1px solid var(--rtm-border)"}}>
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                      {["Task Name", "Description", "Dept.", "Owner Role", "Est.Hrs", "Due", "Priority", "Status"].map((col) => (
                        <th key={col} className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-wider"style={{ color: "var(--rtm-text-muted)"}}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {template.tasks.map((task, i) => (
                      <tr
                        key={task.name}
                        style={{ borderBottom: i < template.tasks.length - 1 ? "1px solid var(--rtm-border-light)": "none"}}
                      >
                        <td className="px-3 py-2.5">
                          <span className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}>{task.name}</span>
                        </td>
                        <td className="px-3 py-2.5 text-xs" style={{ color: "var(--rtm-text-secondary)", maxWidth: 160 }}>
                          {task.description || <span style={{ color: "var(--rtm-text-muted)" }}>—</span>}
                        </td>
                        <td className="px-3 py-2.5"><DeptBadge dept={task.department} /></td>
                        <td className="px-3 py-2.5 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{task.ownerRole || "—"}</td>
                        <td className="px-3 py-2.5 text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>{task.estimatedHours ? `${task.estimatedHours}h` : "—"}</td>
                        <td className="px-3 py-2.5 text-xs font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>{task.dueOffset}</td>
                        <td className="px-3 py-2.5"><PriorityBadge priority={task.priority} /></td>
                        <td className="px-3 py-2.5"><DepStatusBadge status={task.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dependencies */}
          {activeTab === "dependencies"&& (
            <div className="space-y-4">
              <div className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>Template Dependencies</div>
              <div className="space-y-2">
                {template.dependencies.map((dep) => (
                  <div
                    key={dep}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}
                  >
                    <div className="flex items-center gap-2">
                      
                      <span className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{dep}</span>
                    </div>
                    <DepStatusBadge status="Required"/>
                  </div>
                ))}
              </div>

              <div className="text-xs font-bold mt-4"style={{ color: "var(--rtm-text-primary)"}}>Task-Level Dependencies</div>
              <div className="space-y-1.5">
                {template.tasks.map((task) => (
                  <div
                    key={task.name}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}
                  >
                    <div className="flex-1 text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{task.name}</div>
                    <div className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                      {task.dependency === "None"? "No dependency": `Depends on: ${task.dependency}`}
                    </div>
                    <DepStatusBadge status={task.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLA & Throughput */}
          {activeTab === "workload"&& (
            <div className="space-y-4">
              {/* Line Item SLA - PRIMARY SOURCE */}
              <div className="rounded-xl p-4" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-black uppercase tracking-wide mb-3" style={{ color: "var(--rtm-text-muted)"}}>SLA Policy</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "First Response", value: template.firstResponseDays !== null ? `${template.firstResponseDays} business day${template.firstResponseDays === 1 ? "" : "s"}` : null },
                    { label: "Target Completion", value: template.targetCompletionDays !== null ? `${template.targetCompletionDays} business day${template.targetCompletionDays === 1 ? "" : "s"}` : null },
                    { label: "Due Date Offset", value: template.dueDateOffsetDays !== null ? `Day ${template.dueDateOffsetDays}` : null },
                    { label: "Escalation After", value: template.escalationAfterDays !== null ? `${template.escalationAfterDays} day${template.escalationAfterDays === 1 ? "" : "s"}` : null },
                  ].map((r) => (
                    <div key={r.label} className="rounded-lg p-3" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
                      <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)"}}>{r.label}</div>
                      <div className="text-sm font-semibold" style={{ color: r.value !== null ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)"}}>
                        {r.value ?? "Not set"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task-level offsets */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Monthly Tasks", value: template.monthlyTaskCount },
                  { label: "Quarterly Tasks", value: template.quarterlyTaskCount, icon: ""},
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-4 flex items-center gap-3"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}
                  >
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <div className="text-xl font-black"style={{ color: "var(--rtm-text-primary)"}}>{stat.value}</div>
                      <div className="text-[10px] font-semibold mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-2"style={{ color: "var(--rtm-text-primary)"}}>Margin Contribution</div>
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-lg"style={{
                    background: template.marginContribution === "High"? "#ECFDF5": template.marginContribution === "Medium"? "#FFFBEB": "#FEF2F2",
                    color: template.marginContribution === "High"? "#059669": template.marginContribution === "Medium"? "#D97706": "#DC2626",
                  }}
                >
                  {template.marginContribution}
                </span>
              </div>
            </div>
          )}

          {/* Activation Rules */}
          {activeTab === "activation"&& (
            <div className="space-y-4">
              <div
                className="rounded-xl p-5"style={{ background: "var(--rtm-bg)", border: "2px solid var(--rtm-border)"}}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>Trigger Event</div>
                <TriggerBadge trigger={template.activationTrigger} />
              </div>

              <div className="rounded-xl p-5"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>Required Conditions</div>
                <ul className="space-y-2">
                  {template.dependencies.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm"style={{ color: "var(--rtm-text-primary)"}}>
                       {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl p-5"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>Activation Status</div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"style={{ background: template.activationReady ? "#10B981": "#F59E0B"}}
                  />
                  <span className="font-bold text-sm"style={{ color: "var(--rtm-text-primary)"}}>
                    {template.activationReady ? "Activation Ready": "Needs Configuration"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl p-5"style={{ background: "#EFF6FF", border: "1px solid #BFDBFE"}}>
                <div className="text-xs font-bold mb-2"style={{ color: "#1D4ED8"}}>Example Rule</div>
                <div className="font-mono text-xs leading-relaxed"style={{ color: "#1E40AF"}}>
                  WHEN {template.activationTrigger}<br />
                  AND mapped_line_item = &quot;{template.mappedLineItem}&quot;<br />
                  THEN activate &quot;{template.name}&quot;<br />
                  → generate {template.taskCount} tasks<br />
                  → assign to {template.department}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {activeTab === "notes"&& (
            <div className="space-y-4">
              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-2"style={{ color: "var(--rtm-text-primary)"}}>Template Notes</div>
                <textarea
                  className="w-full text-sm p-2 rounded-lg resize-none outline-none"rows={5}
                  placeholder="Add notes about this template..."style={{
                    background: "var(--rtm-surface)",
                    border: "1px solid var(--rtm-border)",
                    color: "var(--rtm-text-primary)",
                  }}
                />
              </div>
              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>Activity Log</div>
                <div className="space-y-2">
                  {[
                    { action: "Template updated", by: "Admin", date: template.lastUpdated },
                    { action: "Template activated", by: "System", date: "2025-07-01"},
                    { action: "Template created", by: "Admin", date: "2025-06-15"},
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                      
                      <span className="font-semibold">{log.action}</span>
                      <span>by {log.by}</span>
                      <span className="ml-auto"style={{ color: "var(--rtm-text-muted)"}}>{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer footer */}
        <div
          className="px-6 py-4 flex items-center gap-2 flex-wrap"style={{ borderTop: "1px solid var(--rtm-border)"}}
        >
          <button
            className="px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ background: "var(--rtm-blue)"}}
            onClick={() => { onClose(); onEdit(template.id); }}
          >
            Edit Template
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
          >
            Clone Template
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
          >
            Map Line Item
          </button>
          <button
            className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold"style={{ color: "var(--rtm-text-muted)"}}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

//  Main Page 

export default function TaskTemplatesPage() {
  // ── Live data from /api/task-blueprints ───────────────────────────────────
  const [TASK_TEMPLATES, setTaskTemplates] = useState<TaskTemplate[]>([]);
  /** Raw blueprint records keyed by serviceId, for the Edit button. */
  const [rawBlueprints, setRawBlueprints] = useState<Map<string, BlueprintApiRecord>>(new Map());
  const [loadError, setLoadError] = useState("");

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/task-blueprints");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { blueprints: BlueprintApiRecord[] };
      setTaskTemplates(data.blueprints.map(blueprintToTemplate));
      setRawBlueprints(new Map(data.blueprints.map((b) => [b.id, b])));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load templates.");
    }
  }, []);

  useEffect(() => { void loadTemplates(); }, [loadTemplates]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  /** null = create mode; string = serviceId of template being edited */
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  /** Groups loaded for the template being edited */
  const [editingGroups, setEditingGroups] = useState<TemplateGroup[]>([]);
  /** Meta fields loaded for the template being edited */
  const [editingMeta, setEditingMeta] = useState<BlueprintMeta>(BLANK_META);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  function openEditor(bp?: BlueprintApiRecord) {
    if (bp?.groups) {
      setEditingServiceId(bp.id);
      setEditingGroups(bp.groups);
      setEditingMeta({
        name:                bp.name,
        department:          bp.department,
        servicePackage:      bp.servicePackage,
        mappedLineItem:      bp.mappedLineItem,
        description:         bp.description,
        activationTrigger:   bp.activationTrigger,
        estimatedTotalHours: bp.estimatedTotalHours,
        isActive:            bp.isActive,
        version:             bp.version,
        firstResponseDays:    bp.firstResponseDays    ?? null,
        targetCompletionDays: bp.targetCompletionDays ?? null,
        dueDateOffsetDays:    bp.dueDateOffsetDays    ?? null,
        escalationAfterDays:  bp.escalationAfterDays  ?? null,
      });
    } else {
      setEditingServiceId(null);
      setEditingGroups([]);
      setEditingMeta(BLANK_META);
    }
    setShowCreateModal(true);
  }
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState<Department | "All">("All");
  const [filterType, setFilterType] = useState<TemplateType | "All">("All");
  const [filterStatus, setFilterStatus] = useState<TemplateStatus | "All">("All");
  const [activeSection, setActiveSection] = useState<"templates"| "preview"| "import">("templates");
  const [previewLineItem, setPreviewLineItem] = useState("SEO Monthly");

  //  Derived data 

  const totalTemplates = TASK_TEMPLATES.length;
  const activeTemplates = TASK_TEMPLATES.filter((t) => t.status === "Active").length;
  const inactiveTemplates = TASK_TEMPLATES.filter((t) => t.status === "Inactive").length;
  const activationReady = TASK_TEMPLATES.filter((t) => t.activationReady).length;
  const totalTasksDefined = TASK_TEMPLATES.reduce((s, t) => s + t.taskCount, 0);
  const mappedLineItems = new Set(TASK_TEMPLATES.map((t) => t.mappedLineItem)).size;
  const deptsCovered = new Set(TASK_TEMPLATES.map((t) => t.department)).size;

  //  Filter 

  const filtered = TASK_TEMPLATES.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.mappedLineItem.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q);
    const matchDept = filterDept === "All"|| t.department === filterDept;
    const matchType = filterType === "All"|| t.type === filterType;
    const matchStatus = filterStatus === "All"|| t.status === filterStatus;
    return matchSearch && matchDept && matchType && matchStatus;
  });

  //  Preview 

  const previewTemplate = TASK_TEMPLATES.find(
    (t) => t.mappedLineItem.toLowerCase() === previewLineItem.toLowerCase()
  ) ?? TASK_TEMPLATES[0];

  const PREVIEW_LINE_ITEMS = [
    "SEO Monthly",
    "GBP Optimization",
    "PPC Management",
    "Meta Ads Management",
    "Reporting Dashboard",
    "Landing Page Build",
    "Creative Package",
    "Client Onboarding",
  ];

  const DEPARTMENTS_LIST: Department[] = [
    "SEO", "GBP", "Paid Advertising", "Meta Ads",
    "Reporting", "Web Development", "Creative", "Account Management", "Billing",
  ];

  const TEMPLATE_TYPES: TemplateType[] = [
    "Setup", "Onboarding", "Launch", "Monthly Management",
    "Quarterly Review", "Renewal", "Offboarding", "Cancellation",
    "Upsell", "Budget Reallocation",
  ];

  const STATUSES: TemplateStatus[] = ["Active", "Inactive", "Draft"];

  return (
    <div className="space-y-6">
      {/* Load error banner */}
      {loadError && (
        <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
          Failed to load templates: {loadError}
        </div>
      )}
      {/*  Page header  */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest"style={{ color: "var(--rtm-blue)"}}>
              Projects &amp; Tasks
            </p>
            <span className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>›</span>
            <p className="text-[11px] font-semibold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>
              Task Blueprints
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
            Task Blueprints
          </h1>
          <p className="text-sm mt-1 max-w-xl"style={{ color: "var(--rtm-text-secondary)"}}>
            Manage task blueprints, delivery templates, onboarding templates, and recurring service templates. Master source of task activation for all projects in RTM OS.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"style={{ background: "var(--rtm-blue)"}}
            onClick={() => openEditor()}
          >
            + New Task Template
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
            onClick={() => setActiveSection("import")}
          >
            ↑ Import Template
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
          >
            ↓ Export Template
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
          >
             Clone Template
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
          >
             Activation Mapping
          </button>
          <Link
            href="/tasks/workload-planning"className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
          >
             Workload Planning
          </Link>
        </div>
      </div>

      {/*  Operational bridge banner  */}
      <div
        className="rounded-xl p-4 flex flex-wrap items-center gap-3"style={{ background: "#EFF6FF", border: "1px solid #BFDBFE"}}
      >
        
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black uppercase tracking-wider mb-1"style={{ color: "#1D4ED8"}}>
            Task Operations Bridge
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold"style={{ color: "#1E40AF"}}>
            {[
              "Finance Line Items",
              "→",
              "Proposal Generator",
              "→",
              "Contract Generator",
              "→",
              "Billing",
              "→",
              "Activation Engine",
              "→",
              "Department Throughput",
              "→",
              "Client Delivery",
            ].map((step, i) =>
              step === "→"? (
                <span key={i} className="text-blue-400 font-black">{step}</span>
              ) : (
                <span key={i} className="px-2 py-0.5 rounded-full bg-white border border-blue-200">{step}</span>
              )
            )}
          </div>
        </div>
      </div>

      {/*  KPI cards  */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {[
          { label: "Total Templates", value: totalTemplates, color: "var(--rtm-blue)", bg: "var(--rtm-blue-light)"},
          { label: "Active Templates", value: activeTemplates, color: "#059669", bg: "#ECFDF5"},
          { label: "Inactive Templates", value: inactiveTemplates, color: "#94A3B8", bg: "#F8FAFC"},
          { label: "Mapped Line Items", value: mappedLineItems, color: "#7C3AED", bg: "#FAF5FF"},
          { label: "Unmapped Items", value: 4, color: "#D97706", bg: "#FFFBEB"},
          { label: "Total Tasks Defined", value: totalTasksDefined, color: "#0891B2", bg: "#ECFEFF"},
          { label: "Depts. Covered", value: deptsCovered, color: "#16A34A", bg: "#F0FDF4"},
          { label: "Activation Ready", value: activationReady, color: "#C2410C", bg: "#FFF7ED"},
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-3 text-center"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <div className="text-2xl font-black"style={{ color }}>{value}</div>
            <div className="text-[10px] font-semibold mt-1 leading-tight"style={{ color: "var(--rtm-text-secondary)"}}>{label}</div>
          </div>
        ))}
      </div>

      {/*  Section tabs  */}
      <div className="flex gap-1 p-1 rounded-xl"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", width: "fit-content"}}>
        {(["templates", "preview", "import"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className="px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors"style={{
              background: activeSection === s ? "var(--rtm-blue)": "transparent",
              color: activeSection === s ? "#fff": "var(--rtm-text-secondary)",
            }}
          >
            {s === "templates"? "Templates": s === "preview"? "Preview Flow": "↑ Import / Upload"}
          </button>
        ))}
      </div>

      {/*  */}
      {/* SECTION: Templates table */}
      {/*  */}
      {activeSection === "templates"&& (
        <div className="space-y-4">
          {/* Filters */}
          <div
            className="rounded-xl px-4 py-3 flex flex-wrap items-center gap-3"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"style={{ color: "var(--rtm-text-muted)"}} fill="none"stroke="currentColor"viewBox="0 0 24 24">
                <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"placeholder="Search templates..."value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"style={{
                  background: "var(--rtm-bg)",
                  border: "1px solid var(--rtm-border)",
                  color: "var(--rtm-text-primary)",
                }}
              />
            </div>

            {/* Department filter */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value as Department | "All")}
              className="text-sm px-3 py-2 rounded-lg outline-none"style={{
                background: "var(--rtm-bg)",
                border: "1px solid var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS_LIST.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TemplateType | "All")}
              className="text-sm px-3 py-2 rounded-lg outline-none"style={{
                background: "var(--rtm-bg)",
                border: "1px solid var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            >
              <option value="All">All Types</option>
              {TEMPLATE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TemplateStatus | "All")}
              className="text-sm px-3 py-2 rounded-lg outline-none"style={{
                background: "var(--rtm-bg)",
                border: "1px solid var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            >
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <span className="text-xs font-semibold ml-auto"style={{ color: "var(--rtm-text-muted)"}}>
              {filtered.length} of {totalTemplates} templates
            </span>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1100px]">
                <thead>
                  <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                    {[
                      "Template Name",
                      "Department",
                      "Type",
                      "Mapped Line Item",
                      "Tasks",
                      "First Response SLA",
                      "Target Completion",
                      "Due Date Offset",
                      "Escalation Rule",
                      "Activation Trigger",
                      "Status",
                      "Last Updated",
                      "Actions",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"style={{ color: "var(--rtm-text-secondary)"}}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((template, i) => (
                    <tr
                      key={template.id}
                      className="hover:bg-blue-50/20 transition-colors"style={{
                        borderBottom: i < filtered.length - 1 ? "1px solid var(--rtm-border-light)": "none",
                      }}
                    >
                      {/* Template Name */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedTemplate(template)}
                          className="text-left font-bold hover:underline"style={{ color: "var(--rtm-blue)"}}
                        >
                          {template.name}
                        </button>
                        <div className="text-[10px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                          {template.description.slice(0, 40)}...
                        </div>
                      </td>

                      {/* Department — plain text */}
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: "var(--rtm-text-primary)"}}>{template.department}</span>
                      </td>

                      {/* Type — plain text */}
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: "var(--rtm-text-primary)"}}>{template.type}</span>
                      </td>

                      {/* Mapped Line Item — plain text */}
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: "var(--rtm-text-primary)"}}>
                          {template.mappedLineItem}
                        </span>
                      </td>

                      {/* Task Count — plain */}
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: "var(--rtm-text-secondary)"}}>
                          {template.taskCount}
                        </span>
                      </td>

                      {/* SLA columns — stored per blueprint, null = Not set */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs" style={{ color: template.firstResponseDays !== null ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)"}}>
                          {template.firstResponseDays !== null ? `${template.firstResponseDays} bd` : "Not set"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs" style={{ color: template.targetCompletionDays !== null ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)"}}>
                          {template.targetCompletionDays !== null ? `${template.targetCompletionDays} bd` : "Not set"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs" style={{ color: template.dueDateOffsetDays !== null ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)"}}>
                          {template.dueDateOffsetDays !== null ? `Day ${template.dueDateOffsetDays}` : "Not set"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs" style={{ color: template.escalationAfterDays !== null ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)"}}>
                          {template.escalationAfterDays !== null ? `After ${template.escalationAfterDays}d` : "Not set"}
                        </span>
                      </td>

                      {/* Activation Trigger — plain text */}
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: "var(--rtm-text-primary)"}}>{template.activationTrigger}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={template.status} />
                      </td>

                      {/* Last Updated */}
                      <td className="px-4 py-3">
                        <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                          {template.lastUpdated}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedTemplate(template)}
                            className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:opacity-80 transition-opacity"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEditor(rawBlueprints.get(template.id))}
                            className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:opacity-80 transition-opacity border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
                          >
                            Edit
                          </button>
                          <button
                            className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:opacity-80 transition-opacity border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
                          >
                            
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="py-12 text-center"style={{ color: "var(--rtm-text-muted)"}}>
                
                <div className="text-sm font-semibold">No templates match your filters.</div>
              </div>
            )}

            <div
              className="px-5 py-3 flex items-center justify-between"style={{ borderTop: "1px solid var(--rtm-border-light)"}}
            >
              <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                Showing {filtered.length} of {totalTemplates} task templates
              </span>
              <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>
                {totalTasksDefined} total tasks defined across all templates
              </span>
            </div>
          </div>

          {/*  Activation Rules summary  */}
          <div
            className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A"}}
            >
              
              <h2 className="text-sm font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>
                Activation Rules Engine
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500r-800">
                {totalTemplates} rules configured
              </span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  trigger: "Invoice Paid",
                  templates: TASK_TEMPLATES.filter((t) => t.activationTrigger === "Invoice Paid"),
                  color: "#C2410C",
                  bg: "#FFF7ED",
                  border: "#FED7AA",
                  icon: "",
                },
                {
                  trigger: "Contract Signed",
                  templates: TASK_TEMPLATES.filter((t) => t.activationTrigger === "Contract Signed"),
                  color: "#059669",
                  bg: "#ECFDF5",
                  border: "#A7F3D0",
                  icon: "",
                },
                {
                  trigger: "Client Activated",
                  templates: TASK_TEMPLATES.filter((t) => t.activationTrigger === "Client Activated"),
                  color: "#7C3AED",
                  bg: "#FAF5FF",
                  border: "#DDD6FE",
                  icon: "",
                },
                {
                  trigger: "Offboarding Approved",
                  templates: TASK_TEMPLATES.filter((t) => t.activationTrigger === "Offboarding Approved"),
                  color: "#DC2626",
                  bg: "#FEF2F2",
                  border: "#FECACA",
                  icon: "",
                },
              ].map((rule) => (
                <div
                  key={rule.trigger}
                  className="rounded-xl overflow-hidden"style={{ border: `1px solid ${rule.border}` }}
                >
                  <div className="px-4 py-3"style={{ background: rule.bg }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{rule.icon}</span>
                      <span className="text-xs font-black"style={{ color: rule.color }}>
                        {rule.trigger}
                      </span>
                    </div>
                    <div className="text-[10px]"style={{ color: rule.color }}>
                      Activates {rule.templates.length} template{rule.templates.length !== 1 ? "s": ""}
                    </div>
                  </div>
                  <div className="px-4 py-2 space-y-1"style={{ background: "white"}}>
                    {rule.templates.slice(0, 3).map((t) => (
                      <div key={t.id} className="text-[11px] font-medium flex items-center gap-1"style={{ color: "var(--rtm-text-secondary)"}}>
                        <span style={{ color: rule.color }}>→</span> {t.name}
                      </div>
                    ))}
                    {rule.templates.length > 3 && (
                      <div className="text-[10px] font-semibold"style={{ color: "var(--rtm-text-muted)"}}>
                        +{rule.templates.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/*  Department throughput summary  */}
          <div
            className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <div
              className="px-5 py-4"style={{ borderBottom: "1px solid var(--rtm-border)"}}
            >
              <h2 className="text-sm font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>
                 Department Throughput Summary
              </h2>
              <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                Tasks generated per department from all active templates.
              </p>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {DEPARTMENTS_LIST.map((dept) => {
                const deptTemplates = TASK_TEMPLATES.filter((t) => t.department === dept && t.status === "Active");
                const totalTasks = deptTemplates.reduce((s, t) => s + t.monthlyTaskCount, 0);
                const c = DEPT_COLORS[dept];
                return (
                  <div
                    key={dept}
                    className="rounded-xl p-3 text-center"style={{ background: c.bg, border: `1px solid ${c.border}` }}
                  >
                    <div className="text-xl font-black"style={{ color: c.color }}>{totalTasks}</div>
                    <div className="text-[10px] font-bold mt-0.5"style={{ color: c.color }}>tasks/mo</div>
                    <div className="text-[10px] mt-1 font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>{dept}</div>
                    <div className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{deptTemplates.length} templates</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/*  */}
      {/* SECTION: Template Preview Flow */}
      {/*  */}
      {activeSection === "preview"&& (
        <div className="space-y-6">
          <div
            className="rounded-xl p-5"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <h2 className="text-sm font-extrabold mb-1"style={{ color: "var(--rtm-text-primary)"}}>
               Template Preview Flow
            </h2>
            <p className="text-xs mb-4"style={{ color: "var(--rtm-text-secondary)"}}>
              Select a line item to preview its mapped template, generated tasks, and department assignment.
            </p>

            {/* Line item selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {PREVIEW_LINE_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => setPreviewLineItem(item)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border"style={{
                    background: previewLineItem === item ? "var(--rtm-blue)": "var(--rtm-bg)",
                    color: previewLineItem === item ? "#fff": "var(--rtm-text-primary)",
                    borderColor: previewLineItem === item ? "var(--rtm-blue)": "var(--rtm-border)",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Flow visualization */}
            <div className="flex flex-col items-center gap-3">
              {/* Step 1: Line Item */}
              <div
                className="w-full max-w-md rounded-xl p-4 flex items-center gap-4"style={{ background: "#EFF6FF", border: "2px solid #BFDBFE"}}
              >
                
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider"style={{ color: "#1D4ED8"}}>Selected Line Item</div>
                  <div className="text-lg font-black"style={{ color: "#1D4ED8"}}>{previewLineItem}</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="text-2xl font-black"style={{ color: "var(--rtm-text-muted)"}}>↓</div>

              {/* Step 2: Template */}
              <div
                className="w-full max-w-md rounded-xl p-4 flex items-center gap-4"style={{ background: "#FAF5FF", border: "2px solid #DDD6FE"}}
              >
                
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider"style={{ color: "#7C3AED"}}>Mapped Template</div>
                  <div className="text-lg font-black"style={{ color: "#7C3AED"}}>{previewTemplate.name}</div>
                  <TypeBadge type={previewTemplate.type} />
                </div>
              </div>

              {/* Arrow */}
              <div className="text-2xl font-black"style={{ color: "var(--rtm-text-muted)"}}>↓</div>

              {/* Step 3: Tasks */}
              <div
                className="w-full max-w-md rounded-xl p-4"style={{ background: "#ECFDF5", border: "2px solid #A7F3D0"}}
              >
                <div className="flex items-center gap-3 mb-3">
                  
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider"style={{ color: "#059669"}}>Tasks Generated</div>
                    <div className="text-lg font-black"style={{ color: "#059669"}}>{previewTemplate.taskCount} Tasks</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {previewTemplate.tasks.map((task) => (
                    <div
                      key={task.name}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-white">
                      <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{task.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{task.targetCompletionDays}d</span>
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="text-2xl font-black"style={{ color: "var(--rtm-text-muted)"}}>↓</div>

              {/* Step 4: Department */}
              <div
                className="w-full max-w-md rounded-xl p-4 flex items-center gap-4"style={{
                  background: DEPT_COLORS[previewTemplate.department].bg,
                  border: `2px solid ${DEPT_COLORS[previewTemplate.department].border}`,
                }}
              >
                
                <div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider"style={{ color: DEPT_COLORS[previewTemplate.department].color }}
                  >
                    Department Assignment
                  </div>
                  <div
                    className="text-lg font-black"style={{ color: DEPT_COLORS[previewTemplate.department].color }}
                  >
                    {previewTemplate.department}
                  </div>
                  <div className="text-xs mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
                    {previewTemplate.monthlyTaskCount} tasks/mo
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLA overview for preview */}
          <div
            className="rounded-xl p-5"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <h2 className="text-sm font-extrabold mb-4"style={{ color: "var(--rtm-text-primary)"}}>
              SLA Policy – {previewTemplate.name}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "First Response", value: previewTemplate.firstResponseDays !== null ? `${previewTemplate.firstResponseDays} business day${previewTemplate.firstResponseDays === 1 ? "" : "s"}` : null },
                { label: "Target Completion", value: previewTemplate.targetCompletionDays !== null ? `${previewTemplate.targetCompletionDays} business day${previewTemplate.targetCompletionDays === 1 ? "" : "s"}` : null },
                { label: "Due Date Offset", value: previewTemplate.dueDateOffsetDays !== null ? `Day ${previewTemplate.dueDateOffsetDays}` : null },
                { label: "Escalation After", value: previewTemplate.escalationAfterDays !== null ? `${previewTemplate.escalationAfterDays} day${previewTemplate.escalationAfterDays === 1 ? "" : "s"}` : null },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg p-3"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)"}}>{stat.label}</div>
                  <div className="text-sm font-semibold" style={{ color: stat.value !== null ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)"}}>
                    {stat.value ?? "Not set"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/*  */}
      {/* SECTION: Import / Upload */}
      {/*  */}
      {activeSection === "import"&& (
        <div className="space-y-6">
          <div
            className="rounded-xl p-6"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <h2 className="text-sm font-extrabold mb-1"style={{ color: "var(--rtm-text-primary)"}}>
              ↑ Import Task Templates
            </h2>
            <p className="text-xs mb-6"style={{ color: "var(--rtm-text-secondary)"}}>
              Upload a CSV, XLSX, or JSON file to bulk import task templates.
            </p>

            {/* File drop area */}
            <div
              className="rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:opacity-80 transition-opacity"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)"}}
            >
              
              <div className="font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                Drop your file here or click to browse
              </div>
              <div className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                Supported formats: CSV, XLSX, JSON
              </div>
              <div className="flex gap-2 mt-2">
                {["CSV", "XLSX", "JSON"].map((fmt) => (
                  <span
                    key={fmt}
                    className="text-xs font-bold px-3 py-1 rounded-full"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
                  >
                    .{fmt.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* Expected columns */}
            <div className="mt-6">
              <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>
                Expected Columns
              </div>
              <div className="overflow-x-auto rounded-xl"style={{ border: "1px solid var(--rtm-border)"}}>
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                      {["Column", "Type", "Required", "Example"].map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"style={{ color: "var(--rtm-text-secondary)"}}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { column: "Template Name", type: "string", required: true, example: "SEO Setup Template"},
                      { column: "Task Name", type: "string", required: true, example: "Technical Audit"},
                      { column: "Department", type: "enum", required: true, example: "SEO"},
                      { column: "Hours", type: "number", required: true, example: "5"},
                      { column: "Priority", type: "enum", required: true, example: "High"},
                      { column: "Dependency", type: "string", required: false, example: "GSC Access"},
                      { column: "Activation Trigger", type: "enum", required: true, example: "Invoice Paid"},
                      { column: "Template Type", type: "enum", required: true, example: "Setup"},
                      { column: "Mapped Line Item", type: "string", required: true, example: "SEO Setup"},
                      { column: "Due Offset", type: "string", required: false, example: "Day 3"},
                    ].map((row, i) => (
                      <tr
                        key={row.column}
                        style={{ borderBottom: i < 9 ? "1px solid var(--rtm-border-light)": "none"}}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                          {row.column}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"}}>
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {row.required ? (
                            <span className="text-[11px] font-bold text-green-600"> Required</span>
                          ) : (
                            <span className="text-[11px] text-gray-400">Optional</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono"style={{ color: "var(--rtm-text-muted)"}}>
                          {row.example}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Download template */}
            <div className="mt-4 flex items-center gap-3">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white"style={{ background: "var(--rtm-blue)"}}
              >
                ↓ Download CSV Template
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
              >
                ↓ Download XLSX Template
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
              >
                ↓ Download JSON Schema
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  Module integration links  */}
      <div
        className="rounded-xl p-4"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>
           Connected Systems
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Finance / Line Items", href: "/billing"},
            { label: "Proposal Generator", href: "/sales/proposals"},
            { label: "Contracts", href: "/billing/invoices"},
            { label: "Billing", href: "/billing/client-portfolio"},
            { label: "Activation Engine", href: "/billing/activation"},
            { label: "Task Engine", href: "/tasks"},
            { label: "Onboarding", href: "/account-management/onboarding"},
            { label: "Workload Planning", href: "/tasks/workload-planning"},
            { label: "Activation Rules", href: "/tasks/activation-rules"},
            { label: "Clients", href: "/clients"},
          ].map((r) => (
            <Link
              key={r.label}
              href={r.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:opacity-80 transition-opacity"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)", borderColor: "#BFDBFE"}}
            >
              {r.label}
              <svg width="10"height="10"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10"y1="14"x2="21"y2="3"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/*  Template Detail Drawer  */}
      {selectedTemplate && (
        <TemplateDrawer
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onEdit={(templateId) => {
            setSelectedTemplate(null);
            openEditor(rawBlueprints.get(templateId));
          }}
        />
      )}

      {/*  Create / Edit Template Modal  */}
      {showCreateModal && (
        <TemplateEditorModal
          onClose={() => { setShowCreateModal(false); setEditingServiceId(null); setEditingGroups([]); setEditingMeta(BLANK_META); }}
          onSaved={() => { void loadTemplates(); }}
          editingServiceId={editingServiceId}
          initialGroups={editingGroups}
          initialMeta={editingMeta}
        />
      )}
    </div>
  );
}