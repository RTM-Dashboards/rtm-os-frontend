"use client";

/**
 * AM Projects - Health & Action Summary View
 *
 * DATA SOURCES:
 *   lib/engine/mock-data.ts          (ENGINE_STORE - Projects, Tasks)
 *   lib/mock/master-clients.ts       (MASTER_CLIENTS - activeServices, monthlyValue, billingOwner)
 *   lib/account-management/am-client-success-data.ts
 *                                    (COMMUNICATIONS - project communication history + Send Follow-up)
 *
 * LOCKED ARCHITECTURE:
 *   This page is a HEALTH/ACTION SUMMARY only - NOT a task management UI.
 *   "Manage Tasks →" deep-links to the real Global Project Management detail view
 *   at /projects/[id] (app/(shell)/projects/[id]/page.tsx).
 *   Task creation/editing happens THERE, not here.
 *
 * FEATURES:
 *   - Project list with health status from engine project.health
 *   - "Tasks Off-Track" count per project: engine tasks that are Blocked
 *     OR (past dueDate AND not Completed/Cancelled) - computed, not fabricated
 *   - "Departments Needing Follow-up" - unique dept names from off-track tasks
 *   - Last communication date + "Send Follow-up" action → creates a real
 *     CommunicationEntry in COMMUNICATIONS (in-session persistence)
 *   - "Manage Tasks →" link to /projects/${project.id} (global PM detail view)
 *   - Contract/service data from MASTER_CLIENTS (activeServices, monthlyValue, billingOwner)
 *   - 2-step "Activate Project" wizard retained (AM's primary workflow)
 */

import React, { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ENGINE_STORE, BLUEPRINTS } from "@/lib/engine/mock-data";
import { appendToEngineStore } from "@/lib/engine/api";
import type { Project, Task, Milestone, DepartmentName } from "@/lib/engine/types";
import {
  createEngineProject,
  blueprintIdsForServices,
  deriveProjectName,
  SERVICE_TO_BLUEPRINT,
  genId,
} from "@/lib/engine/create-project";
import {
  MASTER_CLIENTS,
  markActivationTasksCreated,
  markOnboardingRecordCreated,
} from "@/lib/mock/master-clients";
import {
  apiMarkActivationTasksCreated,
  apiMarkOnboardingRecordCreated,
  fetchMasterClients,
} from "@/lib/mock/master-clients-api";
import type { MasterClient } from "@/lib/mock/master-clients";
import {
  COMMUNICATIONS,
  getCommunicationsByProject,
  getCommunicationsByClient,
  type CommunicationEntry,
} from "@/lib/account-management/am-client-success-data";
import { KpiCard } from "@/components/ui";

// ── Date helpers ──────────────────────────────────────────────────────────────

const TODAY_ISO = "2025-06-10"; // mock "today" matches demo data dates

function fmt(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Off-track task computation ────────────────────────────────────────────────
/**
 * A task is "off-track" if:
 *   - status === "Blocked", OR
 *   - dueDate is in the past AND status is not "Completed" or "Cancelled"
 *
 * Derived from real engine Task fields - no fabricated fields.
 */
function getOffTrackTasks(projectId: string, tasksList?: Task[]): Task[] {
  const tasks = tasksList ?? ENGINE_STORE.tasks;
  return tasks.filter((t) => {
    if (t.projectId !== projectId) return false;
    if (t.status === "Blocked") return true;
    if (
      t.dueDate &&
      t.dueDate < TODAY_ISO &&
      t.status !== "Completed" &&
      t.status !== "Cancelled"
    )
      return true;
    return false;
  });
}

/**
 * Returns unique department names from the off-track task list.
 */
function getDepartmentsNeedingFollowUp(offTrackTasks: Task[]): DepartmentName[] {
  const seen = new Set<DepartmentName>();
  for (const t of offTrackTasks) {
    if (t.department) seen.add(t.department);
  }
  return Array.from(seen);
}

// ── Communication helpers ─────────────────────────────────────────────────────

function createFollowUpEntry(
  projectId: string,
  clientName: string,
  clientId: string | undefined,
  accountManager: string,
  note: string
): CommunicationEntry {
  const now = new Date().toISOString();
  const dateStr = now.split("T")[0];
  return {
    id: genId("cm-followup"),
    clientId: clientId ?? undefined,
    engineProjectId: projectId,
    client: clientName,
    accountManager,
    type: "Follow-Up",
    date: dateStr,
    subject: "Project Follow-up",
    summary: note.trim() || "Follow-up logged from AM Projects page.",
    followUpRequired: false,
    actionItems: [],
    sentiment: "Neutral",
    openConcerns: [],
  };
}

// ── Wizard-local helpers ──────────────────────────────────────────────────────
// (createEngineProject, blueprintIdsForServices, deriveProjectName, and
//  SERVICE_TO_BLUEPRINT are now imported from @/lib/engine/create-project)

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

// ── Health badge helpers ──────────────────────────────────────────────────────

function healthStyle(health: string): React.CSSProperties {
  switch (health) {
    case "Green":  return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
    case "Yellow": return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Red":    return { background: "#FEF2F2", color: "#991B1B", borderColor: "#FECACA" };
    default:       return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  }
}

// ── Send Follow-up Modal ──────────────────────────────────────────────────────

interface FollowUpModalProps {
  project: Project;
  accountManager: string;
  onClose: () => void;
  onSent: (entry: CommunicationEntry) => void;
}

function SendFollowUpModal({ project, accountManager, onClose, onSent }: FollowUpModalProps) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  // Read from seed data - this is display-only, not the mutable status fields
  const masterClient = MASTER_CLIENTS.find((c) => c.id === project.clientId);

  const handleSend = () => {
    const entry = createFollowUpEntry(
      project.id,
      project.client,
      project.clientId,
      accountManager,
      note
    );
    COMMUNICATIONS.push(entry);
    setSent(true);
    onSent(entry);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="rounded-2xl border border-emerald-200 bg-white shadow-xl p-8 max-w-md w-full mx-4 space-y-4">
          <div className="text-center space-y-2">
            <div className="text-4xl">✅</div>
            <h2 className="text-lg font-bold text-slate-900">Follow-up Logged</h2>
            <p className="text-sm text-slate-500">
              Communication entry created for{" "}
              <span className="font-semibold">{project.client}</span> and linked to this project.
              You can view all comms in the{" "}
              <Link
                href="/account-management/communications"
                className="text-blue-600 underline"
              >
                Communications module
              </Link>
              .
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl p-6 max-w-lg w-full mx-4 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Send Follow-up</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Client: <span className="font-semibold text-slate-700">{project.client}</span>
              {" · "}Project:{" "}
              <span className="font-semibold text-slate-700 text-xs">{project.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Contract context */}
        {masterClient && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs space-y-1">
            <p className="text-slate-500">
              <span className="font-semibold text-slate-700">Services:</span>{" "}
              {masterClient.activeServices.join(", ")}
            </p>
            <p className="text-slate-500">
              <span className="font-semibold text-slate-700">MRR:</span>{" "}
              ${masterClient.monthlyValue.toLocaleString()}/mo
            </p>
            <p className="text-slate-500">
              <span className="font-semibold text-slate-700">Billing owner:</span>{" "}
              {masterClient.billingOwner}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Follow-up Note
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            placeholder="Describe the follow-up action, any blockers, next steps, or communication summary..."
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSend}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Log Follow-up →
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 2-Step Activation Wizard ────────────────────────────────────────────────────────────────────

type WizardStep = 1 | 2 | "done";
interface WizardState {
  client:             MasterClient;
  step:               WizardStep;
  selectedServices:   string[];
  manualBlueprintIds: string[];  // Part 3A: IDs added manually beyond auto-matched set
  createdProject:     Project | null;
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
  const initialServices = client.activeServices.length > 0 ? client.activeServices : [];
  const [state, setState] = useState<WizardState>({
    client,
    step:               1,
    selectedServices:   initialServices,
    manualBlueprintIds: [],
    createdProject:     null,
  });

  // Dropdown state for "Add Another Blueprint"
  const [addBpSelectValue, setAddBpSelectValue] = useState("");

  // Auto-matched blueprint IDs from services
  const autoMatchedBpIds = useMemo(
    () => blueprintIdsForServices(state.selectedServices),
    [state.selectedServices]
  );

  // All blueprint IDs (auto-matched union manually added)
  const allBlueprintIds = useMemo(
    () => Array.from(new Set([...autoMatchedBpIds, ...state.manualBlueprintIds])),
    [autoMatchedBpIds, state.manualBlueprintIds]
  );

  // Blueprints available to add manually (not already included)
  const availableToAdd = useMemo(
    () => BLUEPRINTS.filter((bp) => !allBlueprintIds.includes(bp.id)),
    [allBlueprintIds]
  );

  const previewTasks = useMemo(
    () =>
      allBlueprintIds
        .map((id) => BLUEPRINTS.find((b) => b.id === id))
        .filter(Boolean)
        .map((bp) => ({
          bpId:     bp!.id,
          bpName:   bp!.name,
          tasks:    bp!.tasks,
          isManual: !autoMatchedBpIds.includes(bp!.id),
        })),
    [allBlueprintIds, autoMatchedBpIds]
  );

  const affectedDepts = useMemo(() => {
    const depts = new Set<DepartmentName>();
    for (const grp of previewTasks) {
      for (const t of grp.tasks) depts.add(t.department as DepartmentName);
    }
    return Array.from(depts);
  }, [previewTasks]);

  const toggleService = (svc: string) => {
    setState((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(svc)
        ? prev.selectedServices.filter((s) => s !== svc)
        : [...prev.selectedServices, svc],
    }));
  };

  const addManualBlueprint = () => {
    if (!addBpSelectValue) return;
    setState((prev) => ({
      ...prev,
      manualBlueprintIds: [...prev.manualBlueprintIds, addBpSelectValue],
    }));
    setAddBpSelectValue("");
  };

  const removeManualBlueprint = (bpId: string) => {
    setState((prev) => ({
      ...prev,
      manualBlueprintIds: prev.manualBlueprintIds.filter((id) => id !== bpId),
    }));
  };

  const totalPreviewTasks = previewTasks.reduce((s, g) => s + g.tasks.length, 0);

  const handleStep1Confirm = () => {
    if (totalPreviewTasks === 0) return;
    setState((prev) => ({ ...prev, step: 2 }));
  };

  const handleStep2Confirm = async () => {
    // Pass the full explicit blueprint IDs so createEngineProject uses them
    // rather than re-deriving from services (which would miss manually-added blueprints)
    const { project, tasks, milestone } = await createEngineProject(
      client,
      state.selectedServices,
      allBlueprintIds
    );
    // Write to file-backed API only — refreshData() will re-fetch and set
    // liveProjects/liveTasks from the authoritative file store.
    // Direct ENGINE_STORE.push() calls were removed because they mutated the
    // same array reference held as React state (via the useState initializer),
    // causing duplicate-key warnings on the next render before refreshData
    // replaced the array.
    await appendToEngineStore({ projects: [project], tasks, milestones: [milestone] });
    // Persist MASTER_CLIENTS mutations through API (cross-route-group reliable)
    await apiMarkActivationTasksCreated(client.id);
    await apiMarkOnboardingRecordCreated(client.id);
    // Also update in-memory for same-session callers that still read MASTER_CLIENTS directly
    markActivationTasksCreated(client.id);
    markOnboardingRecordCreated(client.id);
    setState((prev) => ({ ...prev, step: "done", createdProject: project }));
    onComplete(project);
  };

  if (state.step === 1) {
    return (
      <div className="space-y-6">
        <button onClick={onCancel} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          ← Back to Projects
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Activation Wizard · Step 1 of 2
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            Load Task List from Templates
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Confirm the services for{" "}
            <strong className="text-slate-700">{client.clientName}</strong>. Task Blueprints will
            be matched to generate a real engine project and task list.
          </p>
        </div>

        {/* Contracted Services */}
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
              <p className="text-sm font-semibold text-amber-800">
                No services confirmed in billing yet.
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                A generic Client Onboarding Blueprint will be applied.
              </p>
            </div>
          )}
        </div>

        {/* Blueprint preview (auto-matched + manually added) */}
        {previewTasks.length > 0 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 space-y-4">
            <h2 className="text-sm font-bold text-blue-900">
              Blueprints → {totalPreviewTasks} tasks will be generated
            </h2>
            {previewTasks.map(({ bpId, bpName, tasks, isManual }) => (
              <div key={bpId} className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">{bpName}</p>
                  {isManual && (
                    <>
                      <span className="inline-block rounded-full bg-violet-100 border border-violet-300 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                        Added manually
                      </span>
                      <button
                        onClick={() => removeManualBlueprint(bpId)}
                        className="text-[11px] text-red-500 hover:text-red-700 font-semibold ml-1"
                      >
                        × Remove
                      </button>
                    </>
                  )}
                </div>
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

        {/* Part 3A: Add Another Blueprint */}
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 space-y-3">
          <h2 className="text-sm font-bold text-violet-900">Add Another Blueprint</h2>
          <p className="text-xs text-violet-700">
            Manually include an additional Task Blueprint beyond the auto-matched set (e.g. for
            upsells or custom service inclusions).
          </p>
          {availableToAdd.length === 0 ? (
            <p className="text-xs font-semibold text-violet-500 italic">
              All available blueprints are already included.
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={addBpSelectValue}
                onChange={(e) => setAddBpSelectValue(e.target.value)}
                className="flex-1 rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                <option value="">Select a blueprint to add…</option>
                {availableToAdd.map((bp) => (
                  <option key={bp.id} value={bp.id}>
                    {bp.name}
                  </option>
                ))}
              </select>
              <button
                onClick={addManualBlueprint}
                disabled={!addBpSelectValue}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                + Add Blueprint
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleStep1Confirm}
            disabled={totalPreviewTasks === 0}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Task List →
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
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
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Activation Wizard · Step 2 of 2
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Activate Departments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Mark the following departments active for{" "}
            <strong className="text-slate-700">{client.clientName}</strong>.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800">
            Departments implicated by this project
          </h2>
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
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-sm font-bold text-blue-800">
            Ready to create:{" "}
            <span className="font-normal">
              {deriveProjectName(client.clientName, state.selectedServices)}
            </span>
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            {totalPreviewTasks + 1} tasks will be generated after you confirm.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void handleStep2Confirm()}
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

function ProjectsPageInner() {
  const searchParams = useSearchParams();
  const [wizardClient,   setWizardClient]   = useState<MasterClient | null>(null);
  const [followUpProject, setFollowUpProject] = useState<Project | null>(null);
  const [search,          setSearch]          = useState(
    () => searchParams.get("search") ?? ""
  );

  // clientId to auto-launch the activation wizard for (passed from Onboarding Queue)
  const activateClientId = searchParams.get("activateClientId") ?? null;
  // Track whether the auto-launch has already fired so it doesn't re-trigger on
  // subsequent liveClients/liveProjects refreshes.
  const [autoLaunchFired, setAutoLaunchFired] = useState(false);

  // Live data - shallow-copy seed arrays so wizard push() mutations don't
  // silently contaminate state and cause duplicate keys on the next refresh.
  const [liveProjects, setLiveProjects] = useState<Project[]>(() => [...ENGINE_STORE.projects]);
  const [liveTasks,    setLiveTasks]    = useState<Task[]>(() => [...ENGINE_STORE.tasks]);
  const [liveClients,  setLiveClients]  = useState<MasterClient[]>(() => [...MASTER_CLIENTS]);

  const refreshData = useCallback(async () => {
    try {
      const [projectsRes, tasksRes, clientsRes] = await Promise.all([
        fetch("/api/engine?resource=projects"),
        fetch("/api/engine?resource=tasks"),
        fetch("/api/master-clients"),
      ]);
      if (projectsRes.ok) {
        const d = await projectsRes.json() as { projects: Project[] };
        setLiveProjects(d.projects);
      }
      if (tasksRes.ok) {
        const d = await tasksRes.json() as { tasks: Task[] };
        setLiveTasks(d.tasks);
      }
      if (clientsRes.ok) {
        const d = await clientsRes.json() as { clients: MasterClient[] };
        setLiveClients(d.clients);
      }
    } catch {
      // Keep using seed data on fetch failure — non-fatal
    }
  }, []);

  useEffect(() => { void refreshData(); }, [refreshData]);

  /**
   * BUG FIX (Part 1): Always fetch a fresh client record from the file-backed
   * API before opening the wizard. The in-memory MASTER_CLIENTS seed may be
   * stale relative to data/master-clients.json (e.g. after a PATCH that updated
   * activeServices). Fetching live guarantees the wizard sees the correct
   * services regardless of whether the page-level refreshData() has resolved.
   */
  const openWizardForClient = useCallback(async (clientId: string) => {
    try {
      const res = await fetch(`/api/master-clients?id=${encodeURIComponent(clientId)}`);
      if (res.ok) {
        const d = await res.json() as { client: MasterClient };
        setWizardClient(d.client);
        return;
      }
    } catch {
      // Fall through to liveClients on fetch failure
    }
    // Fallback: use liveClients (already API-hydrated after refreshData)
    const fallback = liveClients.find((c) => c.id === clientId) ?? null;
    setWizardClient(fallback);
  }, [liveClients]);

  // Auto-launch the activation wizard when arriving from the Onboarding Queue
  // with ?activateClientId=<id>. Runs once after live data is available.
  useEffect(() => {
    if (!activateClientId || autoLaunchFired || wizardClient) return;
    // Only open the wizard if the client is still cleared and has no project yet
    const client = liveClients.find((c) => c.id === activateClientId);
    if (!client) return;
    const alreadyHasProject = liveProjects.some((p) => p.clientId === activateClientId);
    if (alreadyHasProject) return; // already activated — don't re-open wizard
    setAutoLaunchFired(true);
    void openWizardForClient(activateClientId);
  }, [activateClientId, autoLaunchFired, wizardClient, liveClients, liveProjects, openWizardForClient]);

  // All AM-created projects (have a clientId)
  const amProjects = useMemo(
    () => liveProjects.filter((p) => !!p.clientId),
    [liveProjects]
  );

  // Cleared clients without a project yet
  const clearedWithoutProject = useMemo(
    () =>
      liveClients.filter(
        (c) =>
          c.cleared &&
          c.activationStatus !== "Active" &&
          !amProjects.some((p) => p.clientId === c.id)
      ),
    [amProjects, liveClients]
  );

  // KPIs
  const total      = amProjects.length;
  const inProgress = amProjects.filter(
    (p) => p.status === "In Progress" || p.status === "Launched"
  ).length;
  const offTrackProjects = amProjects.filter((p) => {
    const offTrack = getOffTrackTasks(p.id, liveTasks);
    return offTrack.length > 0;
  });
  const offTrackCount = offTrackProjects.length;

  const filtered = amProjects.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.client.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.accountManager.toLowerCase().includes(q)
    );
  });

  // Wizard completion - re-fetch live data after activation
  const handleWizardComplete = useCallback(
    (project: Project) => {
      setWizardClient(null);
      void refreshData();
      void project; // suppress unused-var lint
    },
    [refreshData]
  );

  // Follow-up sent
  const handleFollowUpSent = useCallback(() => {
    void refreshData();
  }, [refreshData]);

  if (wizardClient) {
    return (
      <ActivationWizard
        client={wizardClient}
        onComplete={handleWizardComplete}
        onCancel={() => setWizardClient(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Follow-up modal */}
      {followUpProject && (
        <SendFollowUpModal
          project={followUpProject}
          accountManager={followUpProject.accountManager || "Account Manager"}
          onClose={() => setFollowUpProject(null)}
          onSent={(entry) => {
            handleFollowUpSent();
            setFollowUpProject(null);
          }}
        />
      )}

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Account Management
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Projects - Health & Action Summary</h1>
          <p className="text-sm text-slate-500 mt-1">
            Project health, off-track tasks, department follow-ups, and communication context.
            Task creation and editing lives in the{" "}
            <Link href="/projects" className="text-blue-600 underline">
              Global Project Management
            </Link>{" "}
            view.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Total Projects"        value={String(total)} />
        <KpiCard title="In Progress"           value={String(inProgress)} />
        <KpiCard
          title="Projects with Off-Track Tasks"
          value={String(offTrackCount)}
          risk={offTrackCount > 0 ? "at-risk" : "healthy"}
        />
        <KpiCard
          title="Awaiting Activation"
          value={String(clearedWithoutProject.length)}
          risk={clearedWithoutProject.length > 0 ? "at-risk" : "healthy"}
        />
      </div>

      {/* Cleared clients awaiting activation */}
      {clearedWithoutProject.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
          <h2 className="text-sm font-bold text-amber-900">
            Cleared Clients Awaiting Project Activation ({clearedWithoutProject.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {clearedWithoutProject.map((client) => {
              const mc = liveClients.find((m) => m.id === client.id);
              return (
                <div
                  key={client.id}
                  className="rounded-lg border border-amber-200 bg-white px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{client.clientName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      AM: {client.assignedAM} ·{" "}
                      {mc && mc.activeServices.length > 0
                        ? mc.activeServices.join(", ")
                        : "Services TBD"}
                    </p>
                    {mc && mc.monthlyValue > 0 && (
                      <p className="text-xs text-slate-400">
                        ${mc.monthlyValue.toLocaleString()}/mo
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => void openWizardForClient(client.id)}
                    className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Activate Project
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project list */}
      {total === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-6 py-16 text-center">
          <div className="text-slate-300 text-5xl mb-4">📋</div>
          <h2 className="text-lg font-bold text-slate-700 mb-1">No projects activated yet</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Use{" "}
            <strong className="text-slate-600">"Activate Project"</strong> on a cleared client
            above to generate a real engine project and task list.
          </p>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search projects or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] max-w-xs rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <span className="text-sm text-slate-400">{filtered.length} projects</span>
          </div>

          {/* Health & Action Summary Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Project Health & Action Summary
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {[
                      "Project / Client",
                      "Health",
                      "Contract & Services",
                      "Tasks Off-Track",
                      "Depts. Needing Follow-up",
                      "Last Communication",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((project) => {
                    // Off-track tasks - computed from live engine data
                    const offTrackTasks = getOffTrackTasks(project.id, liveTasks);
                    const deptsNeedingFollowUp = getDepartmentsNeedingFollowUp(offTrackTasks);

                    // Task progress
                    const allTasks = liveTasks.filter(
                      (t) => t.projectId === project.id
                    );
                    const doneTasks = allTasks.filter(
                      (t) => t.status === "Completed"
                    ).length;

                    // Contract/service data from live clients
                    const masterClient = liveClients.find(
                      (c) => c.id === project.clientId
                    );

                    // Communication history for this project
                    const projectComms = getCommunicationsByProject(project.id);
                    const clientComms = project.clientId
                      ? getCommunicationsByClient(project.clientId)
                      : getCommunicationsByClient(project.client);
                    const allComms = [
                      ...projectComms,
                      ...clientComms.filter(
                        (c) => !projectComms.some((pc) => pc.id === c.id)
                      ),
                    ].sort((a, b) => b.date.localeCompare(a.date));
                    const latestComm = allComms[0];

                    // Onboarding record link - use engine task's linkedOnboardingId
                    const onbTask = liveTasks.find(
                      (t) => t.projectId === project.id && !!t.linkedOnboardingId
                    );
                    const onboardingRecordId = onbTask?.linkedOnboardingId ?? null;

                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-slate-50 transition-colors align-top"
                      >
                        {/* Project / Client */}
                        <td className="px-4 py-4 min-w-[180px]">
                          <p className="font-semibold text-slate-900 leading-snug">
                            {project.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{project.client}</p>
                          <p className="text-xs text-slate-400">
                            AM: {project.accountManager || "-"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {doneTasks}/{allTasks.length} tasks done
                          </p>
                        </td>

                        {/* Health */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                            style={healthStyle(project.health)}
                          >
                            {project.health}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {project.status}
                          </p>
                        </td>

                        {/* Contract & Services */}
                        <td className="px-4 py-4 min-w-[160px]">
                          {masterClient ? (
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-1">
                                {masterClient.activeServices.map((s) => (
                                  <span
                                    key={s}
                                    className="inline-block rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-slate-500">
                                ${masterClient.monthlyValue.toLocaleString()}/mo
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Billing: {masterClient.billingOwner}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">
                              {project.contractSummary || "-"}
                            </p>
                          )}
                        </td>

                        {/* Tasks Off-Track */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {offTrackTasks.length === 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                              ✓ On track
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                                {offTrackTasks.length} off-track
                              </span>
                              <div className="text-[10px] text-slate-500 space-y-0.5">
                                {offTrackTasks.slice(0, 3).map((t) => (
                                  <p key={t.id} className="truncate max-w-[140px]">
                                    {t.status === "Blocked" ? "🔴" : "🟡"} {t.title}
                                  </p>
                                ))}
                                {offTrackTasks.length > 3 && (
                                  <p className="text-slate-400">
                                    +{offTrackTasks.length - 3} more
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Depts Needing Follow-up */}
                        <td className="px-4 py-4">
                          {deptsNeedingFollowUp.length === 0 ? (
                            <span className="text-xs text-slate-400">-</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {deptsNeedingFollowUp.map((dept) => (
                                <span
                                  key={dept}
                                  className="inline-flex rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800"
                                >
                                  {dept}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Last Communication */}
                        <td className="px-4 py-4 min-w-[160px]">
                          {latestComm ? (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-slate-700">
                                {fmt(latestComm.date)}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {latestComm.type}
                              </p>
                              <p className="text-[11px] text-slate-400 max-w-[140px] truncate">
                                {latestComm.subject}
                              </p>
                              <Link
                                href="/account-management/communications"
                                className="inline-flex text-[11px] text-blue-600 hover:underline"
                              >
                                View all comms →
                              </Link>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No communications yet</p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1.5 min-w-[130px]">
                            {/* Manage Tasks → global PM detail view */}
                            <Link
                              href={`/projects/${project.id}`}
                              className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 whitespace-nowrap"
                            >
                              Manage Tasks →
                            </Link>

                            {/* Send Follow-up → creates communication entry */}
                            <button
                              onClick={() => setFollowUpProject(project)}
                              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap"
                            >
                              Send Follow-up
                            </button>

                            {/* View Onboarding (if record exists) — read-only record page */}
                            {onboardingRecordId && (
                              <Link
                                href={`/account-management/onboarding/${onboardingRecordId}/record`}
                                className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 whitespace-nowrap"
                              >
                                Onboarding Record
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-sm text-slate-400"
                      >
                        No projects match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Off-track detail callout (if any) */}
          {offTrackCount > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
              <h2 className="text-sm font-bold text-amber-900">
                Projects with Off-Track Tasks - Action Required
              </h2>
              <div className="space-y-3">
                {offTrackProjects.map((project) => {
                  const offTrackTasks = getOffTrackTasks(project.id, liveTasks);
                  const depts = getDepartmentsNeedingFollowUp(offTrackTasks);
                  return (
                    <div
                      key={project.id}
                      className="rounded-lg border border-amber-200 bg-white px-4 py-3 flex flex-wrap items-start gap-4 justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">{project.name}</p>
                        <p className="text-xs text-slate-500">
                          {offTrackTasks.length} off-track task
                          {offTrackTasks.length !== 1 ? "s" : ""} ·{" "}
                          {depts.length > 0
                            ? `Depts: ${depts.join(", ")}`
                            : "No dept follow-up needed"}
                        </p>
                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          {offTrackTasks.map((t) => (
                            <p key={t.id}>
                              {t.status === "Blocked" ? "🔴 Blocked" : "🟡 Overdue"} - {t.title}{" "}
                              {t.dueDate ? `(due ${fmt(t.dueDate)})` : ""}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link
                          href={`/projects/${project.id}`}
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 whitespace-nowrap"
                        >
                          Manage Tasks →
                        </Link>
                        <button
                          onClick={() => setFollowUpProject(project)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap"
                        >
                          Send Follow-up
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
          Loading...
        </div>
      }
    >
      <ProjectsPageInner />
    </Suspense>
  );
}
