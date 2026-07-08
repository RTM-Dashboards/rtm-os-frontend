"use client";

/**
 * AM Project Activation Center — v2
 *
 * DATA SOURCE: lib/engine/  (real engine store — Projects, Tasks, Blueprints)
 *              lib/mock/master-clients.ts (client list + activation checklist)
 *              lib/mock/am-onboarding-store.ts (onboarding record lookup)
 *
 * Replaces lib/mock/am-projects-store.ts placeholder entirely.
 *
 * Features:
 *  - Lists all engine projects that have a clientId (AM-created projects)
 *  - 2-step "Activate Project" wizard for cleared clients without a project:
 *      Step 1 — Load Task List from Templates (matches activeServices → BLUEPRINTS)
 *      Step 2 — Activate Departments (marks departments active for this client)
 *  - Once both wizard steps are done, "Activate Onboarding" links to the
 *    existing onboarding form at /account-management/onboarding/{recordId}
 */

import React, { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ENGINE_STORE, BLUEPRINTS } from "@/lib/engine/mock-data";
import { getProjectsByClient } from "@/lib/engine/index";
import type { Project, Task, Milestone, DepartmentName } from "@/lib/engine/types";
import {
  MASTER_CLIENTS,
  markActivationTasksCreated,
} from "@/lib/mock/master-clients";
import type { MasterClient } from "@/lib/mock/master-clients";
import { getOnboardingRecordByClientId } from "@/lib/mock/am-onboarding-store";
import { KpiCard } from "@/components/ui";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Engine mutation helpers ────────────────────────────────────────────────────

let _projSeq = 9000;
let _taskSeq = 9000;
let _msSeq   = 9000;
let _actSeq  = 9000;
function genId(prefix: string, seq: () => number): string {
  return `${prefix}-wizard-${seq()}`;
}

/** Map MASTER_CLIENTS service string → best-matching engine BLUEPRINT id */
const SERVICE_TO_BLUEPRINT: Record<string, string> = {
  "seo / gbp":           "bp-001",   // SEO Launch + GBP Launch
  "seo":                 "bp-001",
  "gbp":                 "bp-002",
  "google ads":          "bp-003",
  "ppc":                 "bp-003",
  "meta ads":            "bp-006",
  "facebook ads":        "bp-006",
  "website build":       "bp-007",
  "website redesign":    "bp-007",
  "monthly reporting":   "bp-005",
  "reporting":           "bp-005",
  "account management":  "bp-004",
  "onboarding":          "bp-004",
};

function blueprintIdsForServices(services: string[]): string[] {
  const ids = new Set<string>();
  ids.add("bp-004"); // always include onboarding blueprint
  for (const svc of services) {
    const key = svc.toLowerCase().trim();
    for (const [pattern, bpId] of Object.entries(SERVICE_TO_BLUEPRINT)) {
      if (key.includes(pattern)) { ids.add(bpId); break; }
    }
  }
  return Array.from(ids);
}

/** Map engine DepartmentName to wizard-display label */
const DEPT_LABELS: Partial<Record<DepartmentName, string>> = {
  "Account Management": "Account Management",
  "SEO":                "SEO",
  "GBP":                "GBP",
  "PPC":                "Paid Advertising",
  "Meta Ads":           "Meta Ads",
  "Reporting":          "Reporting",
  "Web Development":    "Web Dev",
  "Design":             "Design",
};

/** Creates a real engine Project + Tasks + Milestone from client + selected services */
function createEngineProject(
  client: MasterClient,
  services: string[]
): { project: Project; tasks: Task[]; milestone: Milestone } {
  const now   = new Date().toISOString();
  const today = now.split("T")[0];
  const projectId   = `proj-wizard-${++_projSeq}`;
  const milestoneId = `ms-wizard-${++_msSeq}`;

  const bpIds = blueprintIdsForServices(services);
  const taskIds: string[] = [];
  const tasks: Task[] = [];

  for (const bpId of bpIds) {
    const bp = BLUEPRINTS.find((b) => b.id === bpId);
    if (!bp) continue;
    for (const bpt of bp.tasks) {
      const tid = `tsk-wizard-${++_taskSeq}`;
      taskIds.push(tid);
      tasks.push({
        id:             tid,
        projectId,
        milestoneId,
        blueprintId:    bpId,
        title:          bpt.name,
        type:           "One-Time",
        source:         "Task Blueprint",
        department:     bpt.department as DepartmentName,
        service:        bp.mappedLineItem,
        assignedUserName: "Unassigned",
        createdById:    "u3",
        createdByName:  "Activation Wizard",
        status:         "Open",
        priority:       bpt.priority,
        dueDate:        new Date(Date.now() + bpt.dueDaysOffset * 86400000).toISOString().split("T")[0],
        estimatedHours: bpt.estimatedHours,
        dependencies:   [],
        notes:          [],
        files:          [],
        automationHistory: [],
        createdAt:      now,
        updatedAt:      now,
        clientName:     client.clientName,
        projectName:    `${client.clientName} — Onboarding`,
        description:    bpt.description,
      });
    }
  }

  // Derive departments from tasks
  const deptSet = new Set(tasks.map((t) => t.department));
  const departments = Array.from(deptSet).map((dept) => ({
    department: dept,
    owner:      "Unassigned",
    taskIds:    tasks.filter((t) => t.department === dept).map((t) => t.id),
    escalationStatus: "None" as const,
  }));

  const milestone: Milestone = {
    id:         milestoneId,
    projectId,
    name:       "Onboarding Launch",
    owner:      client.assignedAM,
    status:     "In Progress",
    startDate:  today,
    dueDate:    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    progress:   0,
    taskIds,
    blueprintId: "bp-004",
  };

  const project: Project = {
    id:              projectId,
    name:            `${client.clientName} — Onboarding`,
    client:          client.clientName,
    clientSlug:      client.slug,
    clientId:        client.id,
    servicePackage:  "Custom",
    contractSummary: `Services: ${services.join(", ")}. Activated ${today}.`,
    owner:           client.assignedAM,
    accountManager:  client.assignedAM,
    departments,
    launchDate:      new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    status:          "In Progress",
    health:          "Green",
    priority:        "High",
    milestoneIds:    [milestoneId],
    taskIds,
    activityLog: [
      {
        id:          `act-wizard-${++_actSeq}`,
        projectId,
        eventType:   "Project Created",
        description: `Project created via AM Activation Wizard. Services: ${services.join(", ")}.`,
        actorName:   client.assignedAM,
        timestamp:   now,
      },
    ],
    notes:     `Created by AM Activation Wizard for ${client.clientName}.`,
    createdAt: now,
    updatedAt: now,
  };

  return { project, tasks, milestone };
}

// ── Task status display ───────────────────────────────────────────────────────

function taskStatusStyle(status: Task["status"]): { bg: string; color: string; border: string } {
  switch (status) {
    case "Completed":   return { bg: "#D1FAE5", color: "#065F46", border: "#6EE7B7" };
    case "In Progress": return { bg: "#DBEAFE", color: "#1E40AF", border: "#93C5FD" };
    case "Blocked":     return { bg: "#FEE2E2", color: "#991B1B", border: "#FCA5A5" };
    case "Open":        return { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" };
    default:            return { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" };
  }
}

// ── ProjectDetail view ────────────────────────────────────────────────────────

function ProjectDetail({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  // Group tasks by service
  const allTasks = ENGINE_STORE.tasks.filter((t) => t.projectId === project.id);
  const grouped: Record<string, Task[]> = {};
  for (const t of allTasks) {
    if (!grouped[t.service]) grouped[t.service] = [];
    grouped[t.service].push(t);
  }

  const done  = allTasks.filter((t) => t.status === "Completed").length;
  const total = allTasks.length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  // Lookup onboarding record for this project's client
  const onbRecord = project.clientId
    ? getOnboardingRecordByClientId(project.clientId)
    : undefined;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back to Projects
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Account Management — Projects
          </p>
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Client: <span className="font-semibold text-slate-700">{project.client}</span>
            {" · "}AM: <span className="font-semibold text-slate-700">{project.accountManager}</span>
            {" · "}Created: {fmt(project.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border"
            style={{ background: "#DBEAFE", color: "#1E40AF", borderColor: "#93C5FD" }}
          >
            {project.status}
          </span>
          {/* Cross-link: always show when an onboarding record exists for this client */}
          {onbRecord ? (
            <Link
              href={`/account-management/onboarding/${onbRecord.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
            >
              View Onboarding Record →
            </Link>
          ) : (
            <Link
              href="/account-management/onboarding"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Start Onboarding →
            </Link>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Overall Task Progress</span>
          <span className="text-sm font-bold text-slate-900">{done}/{total} tasks complete</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? "#10B981" : pct >= 60 ? "#3B82F6" : pct >= 30 ? "#F59E0B" : "#E2E8F0",
            }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">{pct}% complete</p>
      </div>

      {/* Tasks by service */}
      {Object.entries(grouped).map(([service, tasks]) => {
        const svcDone = tasks.filter((t) => t.status === "Completed").length;
        return (
          <div key={service} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="text-sm font-bold text-slate-800">{service}</span>
              <span className="text-xs text-slate-400">{svcDone}/{tasks.length} done</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Task", "Status", "Department", "Due Date", "Assignee"].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tasks.map((task) => {
                    const st = taskStatusStyle(task.status);
                    return (
                      <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-slate-400 mt-0.5 max-w-xs">{task.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
                            style={{ background: st.bg, color: st.color, borderColor: st.border }}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{task.department}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{task.dueDate ? fmt(task.dueDate) : "—"}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{task.assignedUserName || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {allTasks.length === 0 && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-6 py-10 text-center text-slate-400 text-sm">
          No tasks in this project yet.
        </div>
      )}
    </div>
  );
}

// ── 2-Step Activation Wizard ──────────────────────────────────────────────────

type WizardStep = 1 | 2 | "done";

interface WizardState {
  client:             MasterClient;
  step:               WizardStep;
  selectedServices:   string[];
  previewTasks:       Task[];
  createdProject:     Project | null;
  deptsActivated:     boolean;
}

function ActivationWizard({
  client,
  onComplete,
  onCancel,
}: {
  client:     MasterClient;
  onComplete: (project: Project) => void;
  onCancel:   () => void;
}) {
  const initialServices = client.activeServices.length > 0
    ? client.activeServices
    : [];

  const [state, setState] = useState<WizardState>({
    client,
    step:             1,
    selectedServices: initialServices,
    previewTasks:     [],
    createdProject:   null,
    deptsActivated:   false,
  });

  // Preview tasks based on selected services
  const previewBpIds = useMemo(
    () => blueprintIdsForServices(state.selectedServices),
    [state.selectedServices]
  );

  const previewTasks: Array<{ bpName: string; tasks: typeof BLUEPRINTS[0]["tasks"] }> = useMemo(
    () =>
      previewBpIds
        .map((id) => BLUEPRINTS.find((b) => b.id === id))
        .filter(Boolean)
        .map((bp) => ({ bpName: bp!.name, tasks: bp!.tasks })),
    [previewBpIds]
  );

  // Unique departments that will be activated
  const affectedDepts = useMemo(() => {
    const depts = new Set<DepartmentName>();
    for (const grp of previewTasks) {
      for (const t of grp.tasks) depts.add(t.department as DepartmentName);
    }
    return Array.from(depts);
  }, [previewTasks]);

  // Toggle a service
  const toggleService = (svc: string) => {
    setState((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(svc)
        ? prev.selectedServices.filter((s) => s !== svc)
        : [...prev.selectedServices, svc],
    }));
  };

  // Step 1 → 2: preview only — NO engine mutations yet
  const handleStep1Confirm = () => {
    if (totalPreviewTasks === 0) return;
    setState((prev) => ({ ...prev, step: 2 }));
  };

  // Step 2: create real engine records + mark departments activated
  const handleStep2Confirm = () => {
    const { project, tasks, milestone } = createEngineProject(client, state.selectedServices);
    ENGINE_STORE.projects.push(project);
    ENGINE_STORE.tasks.push(...tasks);
    ENGINE_STORE.milestones.push(milestone);
    markActivationTasksCreated(client.id);
    // Tag the project with departmentsActivated
    (project as Project & { departmentsActivated?: boolean }).departmentsActivated = true;
    setState((prev) => ({ ...prev, step: "done", createdProject: project, deptsActivated: true }));
    onComplete(project);
  };

  const totalPreviewTasks = previewTasks.reduce((s, g) => s + g.tasks.length, 0);

  if (state.step === 1) {
    return (
      <div className="space-y-6">
        <button onClick={onCancel} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          ← Back to Projects
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Activation Wizard · Step 1 of 2</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Load Task List from Templates</h1>
          <p className="text-sm text-slate-500 mt-1">
            Confirm the services for <strong className="text-slate-700">{client.clientName}</strong>.
            Task Blueprints will be matched to these services to generate a real engine project and task list.
          </p>
        </div>

        {/* Service selection */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800">Contracted Services</h2>
          {initialServices.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {initialServices.map((svc) => (
                <button
                  key={svc}
                  onClick={() => toggleService(svc)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    state.selectedServices.includes(svc)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {svc}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-sm font-semibold text-amber-800">No services confirmed in billing yet.</p>
              <p className="text-xs text-amber-700 mt-0.5">
                A generic Client Onboarding Blueprint will be applied. Coordinate with Billing to confirm services.
              </p>
              <p className="text-xs text-amber-600 mt-1 font-medium">
                Proceeding with: Client Onboarding Blueprint (bp-004)
              </p>
            </div>
          )}
        </div>

        {/* Blueprint preview */}
        {previewTasks.length > 0 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-blue-900">
                Matched Blueprints → {totalPreviewTasks} tasks will be generated
              </h2>
            </div>
            {previewTasks.map(({ bpName, tasks }) => (
              <div key={bpName} className="space-y-1">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">{bpName}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tasks.map((t) => (
                    <span
                      key={t.id}
                      className="inline-block rounded bg-white border border-blue-200 px-2 py-0.5 text-[11px] font-medium text-blue-800"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleStep1Confirm}
            disabled={totalPreviewTasks === 0}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Task List →
          </button>
          <button onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (state.step === 2) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Activation Wizard · Step 2 of 2</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Activate Departments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Mark the following departments active for{" "}
            <strong className="text-slate-700">{client.clientName}</strong>.
            This registers them in the Department Activation queue.
          </p>
        </div>

        {/* Departments to activate */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800">Departments implicated by this project</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {affectedDepts.map((dept) => (
              <div
                key={dept}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-emerald-800">
                  {DEPT_LABELS[dept] ?? dept}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            These departments will appear in the{" "}
            <Link href="/tasks/department-activation" className="text-blue-600 underline">
              Department Activation
            </Link>{" "}
            queue.
          </p>
        </div>

        {/* Preview info — project not created yet */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-sm font-bold text-blue-800">
            Ready to create: <span className="font-normal">{client.clientName} — Onboarding</span>
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            {totalPreviewTasks} tasks from {blueprintIdsForServices(state.selectedServices).length} blueprints will be generated after you confirm departments.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleStep2Confirm}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Activate Departments &amp; Create Project →
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function ProjectActivationPageInner() {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  const searchParams = useSearchParams();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    () => searchParams.get("project")
  );
  const [wizardClient,      setWizardClient]      = useState<MasterClient | null>(null);
  const [search,            setSearch]            = useState("");

  // Sync ?project= param on initial mount only (deep-link from onboarding record)
  useEffect(() => {
    const pid = searchParams.get("project");
    if (pid && !selectedProjectId) setSelectedProjectId(pid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // All engine projects that have a clientId (AM-created)
  const amProjects = useMemo(
    () => ENGINE_STORE.projects.filter((p) => !!p.clientId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [forceUpdate]
  );

  // Cleared clients that don't yet have an engine project
  const clearedWithoutProject = useMemo(
    () =>
      MASTER_CLIENTS.filter(
        (c) =>
          c.cleared &&
          c.activationStatus !== "Active" &&
          !amProjects.some((p) => p.clientId === c.id)
      ),
    [amProjects]
  );

  // KPIs
  const total       = amProjects.length;
  const inProgress  = amProjects.filter((p) => p.status === "In Progress" || p.status === "Launched").length;
  const pending     = amProjects.filter((p) => p.status === "Pending Client" || p.status === "Blocked").length;
  const completed   = amProjects.filter((p) => p.status === "Completed").length;
  const totalTasks  = amProjects.reduce((s, p) => s + ENGINE_STORE.tasks.filter((t) => t.projectId === p.id).length, 0);
  const doneTasks   = amProjects.reduce(
    (s, p) => s + ENGINE_STORE.tasks.filter((t) => t.projectId === p.id && t.status === "Completed").length,
    0
  );

  const filtered = amProjects.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.client.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.accountManager.toLowerCase().includes(q)
    );
  });

  // Wizard completion handler
  const handleWizardComplete = useCallback(
    (project: Project) => {
      setWizardClient(null);
      setSelectedProjectId(project.id);
      refresh();
    },
    [refresh]
  );

  // Show wizard
  if (wizardClient) {
    return (
      <ActivationWizard
        client={wizardClient}
        onComplete={handleWizardComplete}
        onCancel={() => setWizardClient(null)}
      />
    );
  }

  // Show project detail
  if (selectedProjectId) {
    const project = ENGINE_STORE.projects.find((p) => p.id === selectedProjectId);
    if (project) {
      return <ProjectDetail project={project} onBack={() => setSelectedProjectId(null)} />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
          <h1 className="text-2xl font-bold text-slate-900">Project Activation Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Onboarding projects created from cleared clients. Each project carries tasks
            generated from real Task Blueprints matched to the client's contracted services.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Total Projects"   value={String(total)} />
        <KpiCard title="In Progress"      value={String(inProgress)} />
        <KpiCard title="Pending / Blocked"value={String(pending)} />
        <KpiCard title="Completed"        value={String(completed)} />
        <KpiCard title="Awaiting Activation" value={String(clearedWithoutProject.length)} />
        <KpiCard
          title="Task Progress"
          value={totalTasks === 0 ? "—" : `${doneTasks}/${totalTasks}`}
        />
      </div>

      {/* Cleared clients awaiting activation */}
      {clearedWithoutProject.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
          <h2 className="text-sm font-bold text-amber-900">
            Cleared Clients Awaiting Project Activation ({clearedWithoutProject.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {clearedWithoutProject.map((client) => (
              <div
                key={client.id}
                className="rounded-lg border border-amber-200 bg-white px-4 py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">{client.clientName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    AM: {client.assignedAM} · {client.activeServices.length > 0 ? client.activeServices.join(", ") : "Services TBD"}
                  </p>
                </div>
                <button
                  onClick={() => setWizardClient(client)}
                  className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Activate Project
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects list */}
      {total === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-6 py-16 text-center">
          <div className="text-slate-300 text-5xl mb-4">📋</div>
          <h2 className="text-lg font-bold text-slate-700 mb-1">No projects activated yet</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Use <strong className="text-slate-600">"Activate Project"</strong> on a cleared client
            above to generate a real engine project and task list.
          </p>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search projects or clients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] max-w-xs rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <span className="text-sm text-slate-400">{filtered.length} projects</span>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Project / Client", "Status", "Health", "Task Progress", "AM", "Created", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((project) => {
                  const tasks  = ENGINE_STORE.tasks.filter((t) => t.projectId === project.id);
                  const done   = tasks.filter((t) => t.status === "Completed").length;
                  const tot    = tasks.length;
                  const pct    = tot === 0 ? 0 : Math.round((done / tot) * 100);
                  const onbRec = project.clientId
                    ? getOnboardingRecordByClientId(project.clientId)
                    : undefined;

                  const healthColor =
                    project.health === "Green"  ? { bg: "#D1FAE5", color: "#065F46" } :
                    project.health === "Yellow" ? { bg: "#FEF3C7", color: "#92400E" } :
                                                  { bg: "#FEE2E2", color: "#991B1B" };

                  return (
                    <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{project.name}</p>
                        <p className="text-xs text-slate-400">{project.client}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border border-blue-200 bg-blue-50 text-blue-700">
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          style={healthColor}
                        >
                          {project.health}
                        </span>
                      </td>
                      <td className="px-4 py-3 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: pct === 100 ? "#10B981" : pct >= 60 ? "#3B82F6" : pct >= 30 ? "#F59E0B" : "#E2E8F0",
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{done}/{tot}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{project.accountManager || "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmt(project.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => setSelectedProjectId(project.id)}
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            View Tasks
                          </button>
                          {onbRec && (
                            <Link
                              href={`/account-management/onboarding/${onbRec.id}`}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 text-center"
                            >
                              View Onboarding
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                      No projects match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function ProjectActivationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400 text-sm">Loading…</div>}>
      <ProjectActivationPageInner />
    </Suspense>
  );
}
