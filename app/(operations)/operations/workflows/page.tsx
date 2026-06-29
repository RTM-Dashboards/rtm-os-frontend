"use client";

import React, { useState } from "react";
import {
  WORKFLOWS,
  EXECUTION_HISTORY,
  WORKFLOW_TEMPLATES,
  AI_RECOMMENDATIONS,
  WORKFLOW_KPIS,
  type Workflow,
  type WorkflowStatus,
  type WorkflowCategory,
  type ExecutionRecord,
  type WorkflowTemplate,
  type AIRecommendation,
} from "@/lib/workflow/mock-data";

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function IconWorkflow({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M4 6h16M4 12h8m-8 6h16"/>
    </svg>
  );
}
function IconPlay({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <polygon points="5 3 19 12 5 21 5 3"strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} />
    </svg>
  );
}
function IconPause({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <rect x="6"y="4"width="4"height="16"rx="1"strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} />
      <rect x="14"y="4"width="4"height="16"rx="1"strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} />
    </svg>
  );
}
function IconCopy({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <rect x="9"y="9"width="13"height="13"rx="2"strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} />
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  );
}
function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <polyline points="3 6 5 6 21 6"strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} />
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4a1 1 0 011-1h2a1 1 0 011 1v2"/>
    </svg>
  );
}
function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <line x1="12"y1="5"x2="12"y2="19"strokeLinecap="round"strokeWidth={2} />
      <line x1="5"y1="12"x2="19"y2="12"strokeLinecap="round"strokeWidth={2} />
    </svg>
  );
}
function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <line x1="18"y1="6"x2="6"y2="18"strokeLinecap="round"strokeWidth={2} />
      <line x1="6"y1="6"x2="18"y2="18"strokeLinecap="round"strokeWidth={2} />
    </svg>
  );
}
function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M19 9l-7 7-7-7"/>
    </svg>
  );
}
function IconZap({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} />
    </svg>
  );
}
function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24"strokeWidth={1.75}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"strokeLinecap="round"strokeLinejoin="round"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"strokeLinecap="round"strokeLinejoin="round"/>
    </svg>
  );
}
function IconCpu({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24"strokeWidth={1.75}>
      <rect x="4"y="4"width="16"height="16"rx="2"strokeLinecap="round"strokeLinejoin="round"/>
      <rect x="9"y="9"width="6"height="6"strokeLinecap="round"strokeLinejoin="round"/>
      <line x1="9"y1="1"x2="9"y2="4"strokeLinecap="round"/>
      <line x1="15"y1="1"x2="15"y2="4"strokeLinecap="round"/>
      <line x1="9"y1="20"x2="9"y2="23"strokeLinecap="round"/>
      <line x1="15"y1="20"x2="15"y2="23"strokeLinecap="round"/>
      <line x1="20"y1="9"x2="23"y2="9"strokeLinecap="round"/>
      <line x1="20"y1="14"x2="23"y2="14"strokeLinecap="round"/>
      <line x1="1"y1="9"x2="4"y2="9"strokeLinecap="round"/>
      <line x1="1"y1="14"x2="4"y2="14"strokeLinecap="round"/>
    </svg>
  );
}
function IconBarChart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  );
}
function IconCheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}
function IconAlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12"y1="9"x2="12"y2="13"strokeLinecap="round"strokeWidth={1.75} />
      <line x1="12"y1="17"x2="12.01"y2="17"strokeLinecap="round"strokeWidth={2} />
    </svg>
  );
}
function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <circle cx="12"cy="12"r="3"strokeWidth={1.75} />
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const map: Record<WorkflowStatus, { bg?: string; color?: string; dot: string; label: string }> = {
    Active:   { bg: "#ECFDF5", color: "#059669", dot: "#10B981", label: "Active"},
    Inactive: { bg: "#F4F7FF", color: "#5A6A85", dot: "#9AAABB", label: "Inactive"},
    Failed:   { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", label: "Failed"},
    Draft:    { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B", label: "Draft"},
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function ResultBadge({ result }: { result: ExecutionRecord["result"] }) {
  const map: Record<string, { bg?: string; color?: string }> = {
    Success: { bg: "#ECFDF5", color: "#059669"},
    Failed:  { bg: "#FEF2F2", color: "#DC2626"},
    Partial: { bg: "#FFFBEB", color: "#D97706"},
    Skipped: { bg: "#F4F7FF", color: "#5A6A85"},
  };
  const s = map[result] ?? { bg: "#F4F7FF", color: "#5A6A85"};
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"style={{ background: s.bg, color: s.color }}
    >
      {result}
    </span>
  );
}

function ImpactBadge({ impact }: { impact: "High"| "Medium"| "Low"}) {
  const map: Record<string, { bg?: string; color?: string }> = {
    High:   { bg: "#FEF2F2", color: "#DC2626"},
    Medium: { bg: "#FFFBEB", color: "#D97706"},
    Low:    { bg: "#ECFDF5", color: "#059669"},
  };
  const s = map[impact];
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"style={{ background: s.bg, color: s.color }}
    >
      {impact} Impact
    </span>
  );
}

function CategoryChip({ category }: { category: WorkflowCategory }) {
  const colorMap: Record<WorkflowCategory, string> = {
    Activation:   "#1B4FD8",
    Project:      "#7C3AED",
    Task:         "#0891B2",
    Billing:      "#059669",
    Renewal:      "#D97706",
    Expansion:    "#16A34A",
    Cancellation: "#DC2626",
    Offboarding:  "#9333EA",
    Escalation:   "#EA580C",
    Notification: "#2563EB",
    Custom:       "#5A6A85",
  };
  const color = colorMap[category] ?? "#5A6A85";
  return (
    <span
      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide"style={{ background: `${color}18`, color }}
    >
      {category}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────────────────────────

interface KpiProps {
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
  bg?: string;
  icon: React.ReactNode;
}

function KpiCard({ label, value, sub, color, bg, icon }: KpiProps) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
            {value}
          </p>
          {sub && (
            <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
              {sub}
            </p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"style={{ background: bg, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Builder Modal
// ─────────────────────────────────────────────────────────────────────────────

type BuilderStep = "trigger"| "conditions"| "actions"| "notifications"| "escalations"| "approvals";

const BUILDER_STEPS: { id: BuilderStep; label: string }[] = [
  { id: "trigger",       label: "Trigger"},
  { id: "conditions",    label: "Conditions"},
  { id: "actions",       label: "Actions"},
  { id: "notifications", label: "Notifications"},
  { id: "escalations",   label: "Escalations"},
  { id: "approvals",     label: "Approval Rules"},
];

const TRIGGER_OPTIONS = [
  "Proposal Accepted",
  "Contract Signed",
  "Invoice Paid",
  "Project Created",
  "Task Overdue",
  "Project Delayed",
  "Client Health Changed",
  "Renewal Window Reached",
  "Cancellation Requested",
  "Offboarding Started",
  "Manual Trigger",
  "Custom Trigger",
];

const CONDITION_OPTIONS = [
  { id: "department",     label: "Department"},
  { id: "clientType",     label: "Client Type"},
  { id: "revenueTier",    label: "Revenue Tier"},
  { id: "serviceType",    label: "Service Type"},
  { id: "healthScore",    label: "Health Score"},
  { id: "contractType",   label: "Contract Type"},
  { id: "projectStatus",  label: "Project Status"},
  { id: "priorityLevel",  label: "Priority Level"},
  { id: "customRule",     label: "Custom Rule"},
];

const ACTION_OPTIONS = [
  { id: "createProject",          label: "Create Project"},
  { id: "createTaskList",         label: "Create Task List"},
  { id: "generateBlueprint",      label: "Generate Task Blueprint"},
  { id: "assignAM",               label: "Assign Account Manager"},
  { id: "assignDepartment",       label: "Assign Department"},
  { id: "assignUser",             label: "Assign User"},
  { id: "updateStatus",           label: "Update Status"},
  { id: "createNotification",     label: "Create Notification"},
  { id: "createEscalation",       label: "Create Escalation"},
  { id: "generateReport",         label: "Generate Report"},
  { id: "createChangeRequest",    label: "Create Change Request"},
  { id: "createRenewalOpp",       label: "Create Renewal Opportunity"},
  { id: "createOffboarding",      label: "Create Offboarding Project"},
];

const NOTIFICATION_OPTIONS = [
  { id: "inApp",    label: "In-App Notification"},
  { id: "email",    label: "Email"},
  { id: "slack",    label: "Slack"},
  { id: "teams",    label: "Teams"},
  { id: "webhook",  label: "Webhook"},
  { id: "custom",   label: "Custom Notification"},
];

const ESCALATION_OPTIONS = [
  { id: "deptLead",   label: "Department Lead"},
  { id: "opsSupport", label: "Operations Support"},
  { id: "executive",  label: "Executive Team"},
  { id: "custom",     label: "Custom Escalation Path"},
];

const APPROVAL_OPTIONS = [
  { id: "department",  label: "Department Approval"},
  { id: "am",          label: "AM Approval"},
  { id: "billing",     label: "Billing Approval"},
  { id: "executive",   label: "Executive Approval"},
  { id: "multiStep",   label: "Multi-Step Approval"},
];

const CATEGORY_OPTIONS: WorkflowCategory[] = [
  "Activation", "Project", "Task", "Billing", "Renewal",
  "Expansion", "Cancellation", "Offboarding", "Escalation",
  "Notification", "Custom",
];

interface BuilderState {
  name: string;
  category: WorkflowCategory;
  trigger: string;
  conditions: string[];
  actions: string[];
  notifications: string[];
  escalations: string[];
  approvals: string[];
}

function WorkflowBuilderModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<BuilderStep>("trigger");
  const [state, setState] = useState<BuilderState>({
    name: "",
    category: "Activation",
    trigger: "",
    conditions: [],
    actions: [],
    notifications: [],
    escalations: [],
    approvals: [],
  });

  const toggle = (key: keyof BuilderState, value: string) => {
    setState((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const stepIndex = BUILDER_STEPS.findIndex((s) => s.id === step);

  const renderStepContent = () => {
    switch (step) {
      case "trigger":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5"style={{ color: "var(--rtm-text-secondary)"}}>
                  Workflow Name
                </label>
                <input
                  type="text"value={state.name}
                  onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Client Activation — Invoice Paid"className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-400"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)"}}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5"style={{ color: "var(--rtm-text-secondary)"}}>
                  Category
                </label>
                <select
                  value={state.category}
                  onChange={(e) => setState((p) => ({ ...p, category: e.target.value as WorkflowCategory }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-400"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)"}}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-secondary)"}}>
                Trigger Event
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TRIGGER_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setState((p) => ({ ...p, trigger: t }))}
                    className="px-3 py-2.5 rounded-lg text-xs font-semibold border text-left transition-all"style={
                      state.trigger === t
                        ? { background: "var(--rtm-blue)", color: "#fff", borderColor: "var(--rtm-blue)"}
                        : { background: "var(--rtm-bg)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)"}
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "conditions":
        return (
          <div className="space-y-4">
            <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>
              Define conditions that must be met for this workflow to execute. Select all that apply.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CONDITION_OPTIONS.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all"style={
                    state.conditions.includes(c.id)
                      ? { background: "var(--rtm-blue-light)", borderColor: "var(--rtm-blue)"}
                      : { background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}
                  }
                >
                  <input
                    type="checkbox"className="rounded"checked={state.conditions.includes(c.id)}
                    onChange={() => toggle("conditions", c.id)}
                  />
                  <span className="text-sm font-medium"style={{ color: "var(--rtm-text-primary)"}}>
                    {c.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case "actions":
        return (
          <div className="space-y-4">
            <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>
              Select the actions this workflow will execute when triggered. Actions run in sequence.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACTION_OPTIONS.map((a) => (
                <label
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all"style={
                    state.actions.includes(a.id)
                      ? { background: "var(--rtm-blue-light)", borderColor: "var(--rtm-blue)"}
                      : { background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}
                  }
                >
                  <input
                    type="checkbox"className="rounded"checked={state.actions.includes(a.id)}
                    onChange={() => toggle("actions", a.id)}
                  />
                  <span className="text-sm font-medium"style={{ color: "var(--rtm-text-primary)"}}>
                    {a.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-4">
            <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>
              Choose notification channels to alert stakeholders when this workflow runs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NOTIFICATION_OPTIONS.map((n) => (
                <label
                  key={n.id}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-lg border cursor-pointer transition-all"style={
                    state.notifications.includes(n.id)
                      ? { background: "var(--rtm-blue-light)", borderColor: "var(--rtm-blue)"}
                      : { background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}
                  }
                >
                  <input
                    type="checkbox"className="rounded"checked={state.notifications.includes(n.id)}
                    onChange={() => toggle("notifications", n.id)}
                  />
                  <div>
                    <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{n.label}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case "escalations":
        return (
          <div className="space-y-4">
            <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>
              Define escalation paths when workflow actions are not completed within the expected timeframe.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ESCALATION_OPTIONS.map((e) => (
                <label
                  key={e.id}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-lg border cursor-pointer transition-all"style={
                    state.escalations.includes(e.id)
                      ? { background: "#FFF7ED", borderColor: "#EA580C"}
                      : { background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}
                  }
                >
                  <input
                    type="checkbox"className="rounded"checked={state.escalations.includes(e.id)}
                    onChange={() => toggle("escalations", e.id)}
                  />
                  <span className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{e.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "approvals":
        return (
          <div className="space-y-4">
            <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>
              Configure approval requirements before this workflow proceeds to execution.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {APPROVAL_OPTIONS.map((a) => (
                <label
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-lg border cursor-pointer transition-all"style={
                    state.approvals.includes(a.id)
                      ? { background: "#FAF5FF", borderColor: "#7C3AED"}
                      : { background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}
                  }
                >
                  <input
                    type="checkbox"className="rounded"checked={state.approvals.includes(a.id)}
                    onChange={() => toggle("approvals", a.id)}
                  />
                  <div>
                    <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{a.label}</p>
                  </div>
                </label>
              ))}
            </div>
            <div
              className="mt-4 p-4 rounded-lg"style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE"}}
            >
              <p className="text-xs font-semibold"style={{ color: "var(--rtm-blue)"}}>
                Multi-Step Approval Note
              </p>
              <p className="text-xs mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
                When Multi-Step Approval is selected, approvals are required in sequence. Inaction after 24 hours triggers automatic escalation to the next level.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"style={{ background: "rgba(15,28,56,0.55)"}}>
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-blue-xlight)"}}
        >
          <div>
            <h2 className="text-base font-bold"style={{ color: "var(--rtm-text-primary)"}}>
              Workflow Builder
            </h2>
            <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>
              Configure trigger, conditions, actions, notifications, escalations, and approvals
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-blue-100"style={{ color: "var(--rtm-text-secondary)"}}
          >
            <IconX className="w-4 h-4"/>
          </button>
        </div>

        {/* Step Nav */}
        <div
          className="flex items-center gap-1 px-6 py-3 flex-shrink-0 overflow-x-auto"style={{ borderBottom: "1px solid var(--rtm-border-light)", background: "var(--rtm-bg)"}}
        >
          {BUILDER_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"style={
                step === s.id
                  ? { background: "var(--rtm-blue)", color: "#fff"}
                  : i < stepIndex
                    ? { background: "#ECFDF5", color: "#059669"}
                    : { color: "var(--rtm-text-secondary)"}
              }
            >
              {i < stepIndex && <IconCheckCircle className="w-3 h-3"/>}
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"style={{ borderTop: "1px solid var(--rtm-border)", background: "var(--rtm-bg)"}}
        >
          <button
            onClick={() => {
              const prev = BUILDER_STEPS[stepIndex - 1];
              if (prev) setStep(prev.id);
            }}
            disabled={stepIndex === 0}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-40"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
          >
            Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
              Step {stepIndex + 1} of {BUILDER_STEPS.length}
            </span>
            {stepIndex < BUILDER_STEPS.length - 1 ? (
              <button
                onClick={() => {
                  const next = BUILDER_STEPS[stepIndex + 1];
                  if (next) setStep(next.id);
                }}
                className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"style={{ background: "var(--rtm-blue)"}}
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"style={{ background: "#059669"}}
              >
                Save Workflow
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Settings Dropdown
// ─────────────────────────────────────────────────────────────────────────────

function WorkflowSettingsMenu({ workflow }: { workflow: Workflow }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-1.5 rounded-lg border transition-colors hover:bg-gray-50"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
      >
        <IconSettings className="w-3.5 h-3.5"/>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10"onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-8 z-20 w-44 rounded-xl shadow-lg overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            {[
              { icon: <IconPlay className="w-3.5 h-3.5"/>,  label: workflow.status === "Active"? "Disable": "Enable"},
              { icon: <IconCopy className="w-3.5 h-3.5"/>,  label: "Clone Workflow"},
              { icon: <IconBarChart className="w-3.5 h-3.5"/>, label: "Version History"},
              { icon: <IconSettings className="w-3.5 h-3.5"/>, label: "Change Owner"},
              { icon: <IconTrash className="w-3.5 h-3.5"/>, label: "Archive", danger: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors hover:bg-gray-50 text-left"style={{ color: (item as { danger?: boolean }).danger ? "#DC2626": "var(--rtm-text-primary)"}}
              >
                <span style={{ color: (item as { danger?: boolean }).danger ? "#DC2626": "var(--rtm-text-secondary)"}}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Template Card
// ─────────────────────────────────────────────────────────────────────────────

function TemplateCard({ tpl, onUse }: { tpl: WorkflowTemplate; onUse: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const categoryColors: Record<string, string> = {
    Activation:   "#1B4FD8",
    Project:      "#7C3AED",
    Billing:      "#059669",
    Renewal:      "#D97706",
    Expansion:    "#16A34A",
    Cancellation: "#DC2626",
    Offboarding:  "#9333EA",
    Escalation:   "#EA580C",
    Custom:       "#5A6A85",
  };
  const color = categoryColors[tpl.category] ?? "#5A6A85";

  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow hover:shadow-md"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
    >
      <div className="px-5 py-4"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CategoryChip category={tpl.category} />
            </div>
            <h3 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>
              {tpl.name}
            </h3>
            <p className="text-xs mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
              {tpl.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"style={{ background: `${color}15`, color }}>
            {tpl.automationCount} automations
          </span>
          <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
            {tpl.estimatedDuration}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="px-5 py-3"style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)"}}>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}>
            Workflow Steps
          </p>
          <ol className="space-y-1.5">
            {tpl.steps.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"style={{ background: `${color}18`, color }}
                >
                  {i + 1}
                </span>
                <span className="text-xs"style={{ color: "var(--rtm-text-primary)"}}>{s}</span>
                {i < tpl.steps.length - 1 && (
                  <svg width="10"height="10"viewBox="0 0 24 24"fill="none"stroke={color} strokeWidth="2"className="ml-auto mr-0 flex-shrink-0">
                    <path d="M12 5v14M5 12l7 7 7-7"strokeLinecap="round"strokeLinejoin="round"/>
                  </svg>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="px-5 py-3 flex items-center gap-2">
        <button
          onClick={onUse}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"style={{ background: color }}
        >
          Use Template
        </button>
        <button
          onClick={() => setExpanded((p) => !p)}
          className="px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
        >
          {expanded ? "Collapse": "Preview"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Recommendation Panel
// ─────────────────────────────────────────────────────────────────────────────

function AIRecommendationCard({ rec }: { rec: AIRecommendation }) {
  const typeColors: Record<string, { bg?: string; color?: string }> = {
    Bottleneck:   { bg: "#FEF2F2", color: "#DC2626"},
    Opportunity:  { bg: "#ECFDF5", color: "#059669"},
    Improvement:  { bg: "var(--rtm-blue-light)", color: "var(--rtm-blue)"},
    Suggestion:   { bg: "#FFFBEB", color: "#D97706"},
  };
  const t = typeColors[rec.type] ?? typeColors.Suggestion;

  return (
    <div
      className="rounded-xl p-4 transition-shadow hover:shadow-sm"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"style={{ background: t.bg, color: t.color }}
        >
          {rec.type}
        </span>
        <ImpactBadge impact={rec.impact} />
      </div>
      <h4 className="text-sm font-bold mb-1"style={{ color: "var(--rtm-text-primary)"}}>
        {rec.title}
      </h4>
      <p className="text-xs leading-relaxed"style={{ color: "var(--rtm-text-secondary)"}}>
        {rec.description}
      </p>
      <div className="flex items-center gap-2 mt-3">
        <CategoryChip category={rec.category} />
        <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
          Effort: {rec.effort}
        </span>
        <button
          className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors hover:opacity-80"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

type TabId = "workflows"| "templates"| "history"| "ai"| "settings";

const TABS: { id: TabId; label: string }[] = [
  { id: "workflows",  label: "All Workflows"},
  { id: "templates",  label: "Templates"},
  { id: "history",    label: "Execution History"},
  { id: "ai",         label: "AI Recommendations"},
];

const NAV_LINKS = [
  { label: "Operations",           href: "/operations/workflows"},
  { label: "Projects",             href: "/tasks"},
  { label: "Activation & Handoff", href: "/activation"},
  { label: "Escalations",          href: "/operations/workflows#escalations"},
  { label: "Workflow Engine",      href: "/operations/workflows"},
  { label: "Reporting & Intelligence", href: "/reporting"},
  { label: "Notifications",        href: "/notifications"},
];

export default function WorkflowEnginePage() {
  const [tab, setTab]               = useState<TabId>("workflows");
  const [showBuilder, setShowBuilder] = useState(false);
  const [filterCategory, setFilterCategory] = useState<WorkflowCategory | "All">("All");
  const [filterStatus, setFilterStatus]     = useState<WorkflowStatus | "All">("All");
  const [search, setSearch]                 = useState("");

  const filtered = WORKFLOWS.filter((w) => {
    const catMatch    = filterCategory === "All"|| w.category === filterCategory;
    const statusMatch = filterStatus   === "All"|| w.status   === filterStatus;
    const searchMatch = !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.trigger.toLowerCase().includes(search.toLowerCase());
    return catMatch && statusMatch && searchMatch;
  });

  const kpis: KpiProps[] = [
    {
      label: "Active Workflows",
      value: WORKFLOW_KPIS.activeWorkflows,
      sub: `${WORKFLOWS.length} total workflows`,
      color: "#059669",
      bg: "#ECFDF5",
      icon: <IconPlay className="w-5 h-5"/>,
    },
    {
      label: "Inactive Workflows",
      value: WORKFLOW_KPIS.inactiveWorkflows,
      color: "#5A6A85",
      bg: "#F4F7FF",
      icon: <IconPause className="w-5 h-5"/>,
    },
    {
      label: "Failed Automations",
      value: WORKFLOW_KPIS.failedAutomations,
      color: "#DC2626",
      bg: "#FEF2F2",
      icon: <IconAlertTriangle className="w-5 h-5"/>,
    },
    {
      label: "Pending Actions",
      value: WORKFLOW_KPIS.pendingActions,
      color: "#D97706",
      bg: "#FFFBEB",
      icon: <IconZap className="w-5 h-5"/>,
    },
    {
      label: "Tasks Generated",
      value: WORKFLOW_KPIS.tasksGenerated,
      sub: "This session",
      color: "#7C3AED",
      bg: "#FAF5FF",
      icon: <IconCheckCircle className="w-5 h-5"/>,
    },
    {
      label: "Projects Generated",
      value: WORKFLOW_KPIS.projectsGenerated,
      color: "#0891B2",
      bg: "#ECFEFF",
      icon: <IconWorkflow className="w-5 h-5"/>,
    },
    {
      label: "Notifications Sent",
      value: WORKFLOW_KPIS.notificationsSent,
      color: "#1B4FD8",
      bg: "var(--rtm-blue-light)",
      icon: <IconBell className="w-5 h-5"/>,
    },
    {
      label: "Avg Success Rate",
      value: `${WORKFLOW_KPIS.avgSuccessRate}%`,
      sub: `${WORKFLOW_KPIS.totalRuns} total runs`,
      color: "#059669",
      bg: "#ECFDF5",
      icon: <IconBarChart className="w-5 h-5"/>,
    },
  ];

  return (
    <>
      {showBuilder && <WorkflowBuilderModal onClose={() => setShowBuilder(false)} />}

      <div className="space-y-6">
        {/* ── Breadcrumb nav ── */}
        <nav className="flex items-center gap-1 flex-wrap">
          {NAV_LINKS.map((link, i) => (
            <React.Fragment key={link.href + link.label}>
              {i > 0 && (
                <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>/</span>
              )}
              <a
                href={link.href}
                className="text-xs font-medium transition-colors hover:underline"style={
                  link.label === "Workflow Engine"? { color: "var(--rtm-blue)", fontWeight: 700 }
                    : { color: "var(--rtm-text-secondary)"}
                }
              >
                {link.label}
              </a>
            </React.Fragment>
          ))}
        </nav>

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: "var(--rtm-blue)"}}
            >
              Operations
            </p>
            <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
              Workflow Engine
            </h1>
            <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
              Automate agency operations. Configure triggers, conditions, actions, notifications, escalations, and approvals to reduce manual coordination.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowBuilder(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"style={{ background: "var(--rtm-blue)"}}
            >
              <IconPlus className="w-4 h-4"/>
              Create Workflow
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>

        {/* ── Tab Bar ── */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl w-fit"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"style={
                tab === t.id
                  ? { background: "var(--rtm-surface)", color: "var(--rtm-blue)", boxShadow: "0 1px 3px rgba(15,28,56,0.1)"}
                  : { color: "var(--rtm-text-secondary)"}
              }
            >
              {t.label}
              {t.id === "ai"&& (
                <span
                  className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"style={{ background: "#FFFBEB", color: "#D97706"}}
                >
                  {AI_RECOMMENDATIONS.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── All Workflows Tab ── */}
        {tab === "workflows"&& (
          <div
            className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            {/* Filters */}
            <div
              className="px-5 py-4 flex flex-wrap items-center gap-3"style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-bg)"}}
            >
              <input
                type="text"placeholder="Search workflows..."value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[200px]"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)"}}
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as WorkflowCategory | "All")}
                className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-400"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)"}}
              >
                <option value="All">All Categories</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as WorkflowStatus | "All")}
                className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-400"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)"}}
              >
                <option value="All">All Statuses</option>
                {(["Active", "Inactive", "Failed", "Draft"] as WorkflowStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="ml-auto text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                {filtered.length} workflow{filtered.length !== 1 ? "s": ""}
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[960px]">
                <thead>
                  <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                    {["Workflow Name", "Category", "Trigger", "Status", "Last Run", "Success Rate", "Owner", "Actions"].map((col) => (
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
                  {filtered.map((wf, i) => (
                    <tr
                      key={wf.id}
                      className="hover:bg-blue-50/30 transition-colors"style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--rtm-border-light)": "none"}}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-sm"style={{ color: "var(--rtm-text-primary)"}}>
                            {wf.name}
                          </p>
                          <p className="text-xs mt-0.5 line-clamp-1"style={{ color: "var(--rtm-text-muted)"}}>
                            {wf.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <CategoryChip category={wf.category} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium"style={{ color: "var(--rtm-text-secondary)"}}>
                          {wf.trigger}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={wf.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                          {wf.lastRun}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-20 h-1.5 rounded-full overflow-hidden"style={{ background: "var(--rtm-border)"}}
                          >
                            <div
                              className="h-full rounded-full"style={{
                                width: `${wf.successRate}%`,
                                background: wf.successRate >= 90 ? "#059669": wf.successRate >= 75 ? "#D97706": "#DC2626",
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-bold"style={{
                              color: wf.successRate >= 90 ? "#059669": wf.successRate >= 75 ? "#D97706": "#DC2626",
                            }}
                          >
                            {wf.successRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                          {wf.owner}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowBuilder(true)}
                            className="p-1.5 rounded-lg border transition-colors hover:bg-blue-50"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-blue)"}}
                            title="Edit">
                            <IconSettings className="w-3.5 h-3.5"/>
                          </button>
                          <button
                            className="p-1.5 rounded-lg border transition-colors hover:bg-gray-50"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
                            title="Clone">
                            <IconCopy className="w-3.5 h-3.5"/>
                          </button>
                          <WorkflowSettingsMenu workflow={wf} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-10 h-10 mx-auto mb-3"style={{ color: "var(--rtm-text-muted)"}}>
                <IconWorkflow className="w-full h-full"/>
              </div>
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>
                  No workflows match your filters
                </p>
                <p className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>
                  Try adjusting the category or status filter
                </p>
              </div>
            )}

            <div
              className="px-5 py-3 flex items-center justify-between"style={{ borderTop: "1px solid var(--rtm-border-light)"}}
            >
              <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                Showing {filtered.length} of {WORKFLOWS.length} workflows
              </span>
              <button
                onClick={() => setShowBuilder(true)}
                className="text-xs font-semibold hover:underline"style={{ color: "var(--rtm-blue)"}}
              >
                + Create New Workflow
              </button>
            </div>
          </div>
        )}

        {/* ── Templates Tab ── */}
        {tab === "templates"&& (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                  Workflow Templates
                </h2>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>
                  Pre-built automation templates for common agency workflows. Customize after applying.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {WORKFLOW_TEMPLATES.map((tpl) => (
                <TemplateCard key={tpl.id} tpl={tpl} onUse={() => setShowBuilder(true)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Execution History Tab ── */}
        {tab === "history"&& (
          <div
            className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <div
              className="px-5 py-4 flex items-center justify-between"style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-bg)"}}
            >
              <div>
                <h2 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                  Execution History
                </h2>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                  Complete record of workflow runs, results, and generated outputs.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className="px-2.5 py-1 rounded-full font-semibold"style={{ background: "#ECFDF5", color: "#059669"}}
                >
                  {EXECUTION_HISTORY.filter((r) => r.result === "Success").length} Success
                </span>
                <span
                  className="px-2.5 py-1 rounded-full font-semibold"style={{ background: "#FEF2F2", color: "#DC2626"}}
                >
                  {EXECUTION_HISTORY.filter((r) => r.result === "Failed").length} Failed
                </span>
                <span
                  className="px-2.5 py-1 rounded-full font-semibold"style={{ background: "#FFFBEB", color: "#D97706"}}
                >
                  {EXECUTION_HISTORY.filter((r) => r.result === "Partial").length} Partial
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[960px]">
                <thead>
                  <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                    {["Workflow", "Date", "Trigger", "Result", "Duration", "Tasks", "Notifications", "Error Details"].map((col) => (
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
                  {EXECUTION_HISTORY.map((rec, i) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-blue-50/30 transition-colors"style={{ borderBottom: i < EXECUTION_HISTORY.length - 1 ? "1px solid var(--rtm-border-light)": "none"}}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}>
                          {rec.workflowName}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{rec.date}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium"style={{ color: "var(--rtm-text-secondary)"}}>
                          {rec.trigger}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ResultBadge result={rec.result} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono"style={{ color: "var(--rtm-text-secondary)"}}>
                          {rec.durationMs >= 1000
                            ? `${(rec.durationMs / 1000).toFixed(1)}s`
                            : `${rec.durationMs}ms`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold"style={{ color: rec.tasksGenerated > 0 ? "#7C3AED": "var(--rtm-text-muted)"}}>
                          {rec.tasksGenerated > 0 ? `+${rec.tasksGenerated}` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs"style={{ color: rec.notificationsSent > 0 ? "var(--rtm-blue)": "var(--rtm-text-muted)"}}>
                          {rec.notificationsSent > 0 ? rec.notificationsSent : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {rec.errorDetails ? (
                          <span className="text-[11px] font-medium"style={{ color: "#DC2626"}}>
                            {rec.errorDetails}
                          </span>
                        ) : (
                          <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className="px-5 py-3"style={{ borderTop: "1px solid var(--rtm-border-light)"}}
            >
              <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                Showing {EXECUTION_HISTORY.length} recent execution records
              </span>
            </div>
          </div>
        )}

        {/* ── AI Recommendations Tab ── */}
        {tab === "ai"&& (
          <div className="space-y-4">
            <div
              className="rounded-xl p-5"style={{ background: "linear-gradient(135deg, #0E2055, #1B4FD8)", border: "1px solid #1B4FD8"}}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"style={{ background: "rgba(255,255,255,0.15)"}}
                >
                  <IconCpu className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">AI Workflow Recommendations</h2>
                  <p className="text-sm mt-1 text-blue-200">
                    RTM Intelligence has analyzed your workflow execution history and identified {AI_RECOMMENDATIONS.length} opportunities to improve automation coverage and reduce manual coordination.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"style={{ background: "rgba(255,255,255,0.15)", color: "#fff"}}>
                      {AI_RECOMMENDATIONS.filter((r) => r.impact === "High").length} High Impact
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"style={{ background: "rgba(255,255,255,0.15)", color: "#fff"}}>
                      {AI_RECOMMENDATIONS.filter((r) => r.type === "Bottleneck").length} Bottlenecks
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"style={{ background: "rgba(255,255,255,0.15)", color: "#fff"}}>
                      {AI_RECOMMENDATIONS.filter((r) => r.type === "Opportunity").length} Opportunities
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AI_RECOMMENDATIONS.map((rec) => (
                <AIRecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
