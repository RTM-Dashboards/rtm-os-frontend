"use client";

/**
 * AM Projects - Health & Action Summary View
 *
 * DATA SOURCES (real Postgres only):
 *   /api/projects/scoped  → Postgres projects with open/done task counts
 *   /api/tasks            → Postgres tasks for off-track computation
 *   /api/businesses       → real activeServices, monthlyValueCents
 *   /api/onboarding-records?clientId= → onboarding record for each project
 *   lib/account-management/am-client-success-data.ts
 *                         → COMMUNICATIONS (project communication history)
 *
 * DATA REMOVED (had no Postgres source):
 *   - engine project health (Green/Yellow/Red) — no health field in Project model
 *   - engine task linkedOnboardingId — resolved via OnboardingRecord.projectId
 *
 * LOCKED ARCHITECTURE:
 *   This page is a HEALTH/ACTION SUMMARY only - NOT a task management UI.
 *   "Manage Tasks →" deep-links to the real Global Project Management detail view
 *   at /projects/[id].
 */

import React, { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ScopedProjectListItem } from "@/app/api/projects/scoped/route";
import type { TaskListItem } from "@/app/api/tasks/route";
import {
  fetchAMClients,
  type BusinessClient,
} from "@/lib/account-management/am-client-data";
import {
  COMMUNICATIONS,
  getCommunicationsByProject,
  getCommunicationsByClient,
  type CommunicationEntry,
} from "@/lib/account-management/am-client-success-data";
import { KpiCard } from "@/components/ui";

// ── Date helpers ──────────────────────────────────────────────────────────────

function fmt(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Off-track task computation ────────────────────────────────────────────────
/**
 * A task is "off-track" if:
 *   - dueDate is in the past AND status is not "done" or "skipped"
 *
 * Note: there is no "Blocked" status in the Postgres Task model.
 * A task waiting on prerequisites has no dueDate until they close.
 */
const TODAY_ISO = new Date().toISOString().slice(0, 10);

function getOffTrackTasks(projectId: string, tasksList: TaskListItem[]): TaskListItem[] {
  return tasksList.filter((t) => {
    if (t.projectId !== projectId) return false;
    if (t.dueDate && t.dueDate < TODAY_ISO && t.status !== "done" && t.status !== "skipped") return true;
    return false;
  });
}

function getDepartmentsNeedingFollowUp(offTrackTasks: TaskListItem[]): string[] {
  const seen = new Set<string>();
  for (const t of offTrackTasks) {
    if (t.department) seen.add(t.department);
  }
  return Array.from(seen);
}

// ── Communication helpers ─────────────────────────────────────────────────────

function createFollowUpEntry(
  projectId: string,
  projectName: string,
  clientId: string | undefined,
  accountManagerName: string,
  note: string
): CommunicationEntry {
  const now = new Date().toISOString();
  const dateStr = now.split("T")[0];
  const id = `cm-followup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    clientId: clientId ?? undefined,
    engineProjectId: projectId,
    client: projectName,
    accountManager: accountManagerName,
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

// ── Send Follow-up Modal ──────────────────────────────────────────────────────

interface FollowUpModalProps {
  project: ScopedProjectListItem;
  accountManagerName: string;
  onClose: () => void;
  onSent: (entry: CommunicationEntry) => void;
}

function SendFollowUpModal({ project, accountManagerName, onClose, onSent }: FollowUpModalProps) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    const entry = createFollowUpEntry(
      project.id,
      project.name,
      project.clientId || undefined,
      accountManagerName,
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
              <span className="font-semibold">{project.name}</span>.{" "}
              <Link href="/account-management/communications" className="text-blue-600 underline">
                View in Communications
              </Link>
            </p>
          </div>
          <button onClick={onClose} className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
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
              Project: <span className="font-semibold text-slate-700 text-xs">{project.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">×</button>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Follow-up Note</label>
          <textarea
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            placeholder="Describe the follow-up action, any blockers, next steps, or communication summary..."
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={handleSend} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
            Log Follow-up →
          </button>
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Activation Wizard — creation retired, UI retained ────────────────────────

function ActivationWizard({
  client,
  onCancel,
}: {
  client: BusinessClient;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-6">
      <button onClick={onCancel} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
        ← Back to Projects
      </button>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Activation Wizard</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Project Activation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Client: <strong className="text-slate-700">{client.clientName}</strong>
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 space-y-1">
        <p className="text-sm font-bold text-amber-800">Project creation via this wizard is no longer available.</p>
        <p className="text-xs text-amber-700">
          Projects are created automatically when Billing clears a client (via Billing Activation → Postgres).
          If this client&apos;s project was not created, check the Billing Activation page or contact your administrator.
        </p>
      </div>

      {client.activeServices.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-2">
          <h2 className="text-sm font-bold text-slate-800">Contracted Services</h2>
          <div className="flex flex-wrap gap-2">
            {client.activeServices.map((svc) => (
              <span key={svc} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
                {svc}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          ← Back
        </button>
      </div>
    </div>
  );
}

// ── Onboarding record per project ────────────────────────────────────────────

/** Fetch onboarding record id for a project via clientId → onboarding-records API */
async function fetchOnboardingRecordIdForProject(
  clientId: string,
  projectId: string
): Promise<string | null> {
  if (!clientId) return null;
  try {
    const res = await fetch(`/api/onboarding-records?clientId=${encodeURIComponent(clientId)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json() as { record?: { id: string; projectId: string | null } };
    const rec = data.record;
    if (rec && rec.projectId === projectId) return rec.id;
    return null;
  } catch {
    return null;
  }
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function ProjectsPageInner() {
  const searchParams = useSearchParams();
  const [wizardClient,    setWizardClient]    = useState<BusinessClient | null>(null);
  const [followUpProject, setFollowUpProject] = useState<ScopedProjectListItem | null>(null);
  const [search,          setSearch]          = useState(() => searchParams.get("search") ?? "");
  const activateClientId = searchParams.get("activateClientId") ?? null;
  const [autoLaunchFired, setAutoLaunchFired] = useState(false);

  const [liveProjects, setLiveProjects] = useState<ScopedProjectListItem[]>([]);
  const [liveTasks,    setLiveTasks]    = useState<TaskListItem[]>([]);
  const [liveClients,  setLiveClients]  = useState<BusinessClient[]>([]);
  // Map projectId → onboarding record id (null = no record, undefined = not loaded)
  const [onboardingMap, setOnboardingMap] = useState<Map<string, string | null>>(new Map());

  const refreshData = useCallback(async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        fetch("/api/projects/scoped"),
        fetch("/api/tasks"),
      ]);
      if (projRes.ok) {
        const d = await projRes.json() as { records: ScopedProjectListItem[] };
        setLiveProjects(d.records ?? []);
      }
      if (taskRes.ok) {
        const d = await taskRes.json() as { tasks: TaskListItem[] };
        setLiveTasks(d.tasks ?? []);
      }
      const bizData = await fetchAMClients().catch(() => []);
      setLiveClients(bizData);
    } catch {
      // keep state on error
    }
  }, []);

  useEffect(() => { void refreshData(); }, [refreshData]);

  // After projects load, pre-fetch onboarding record ids for all of them
  useEffect(() => {
    if (liveProjects.length === 0) return;
    const newMap = new Map<string, string | null>();
    Promise.all(
      liveProjects.map(async (p) => {
        if (!p.clientId) { newMap.set(p.id, null); return; }
        const rid = await fetchOnboardingRecordIdForProject(p.clientId, p.id);
        newMap.set(p.id, rid);
      })
    ).then(() => setOnboardingMap(new Map(newMap)));
  }, [liveProjects]);

  const openWizardForClient = useCallback(async (clientId: string) => {
    try {
      const res = await fetch(`/api/businesses?id=${encodeURIComponent(clientId)}`);
      if (res.ok) {
        const d = await res.json() as { record?: {
          id: string; domain: string; displayName: string; assignedAM: string;
          activeServices: string[]; monthlyValueCents: number; activationStatus: string;
          onboardingStatus: string; cleared: boolean; kickoffCompleted: boolean;
          kickoffDate: string | null; assignedAt: string | null; clientId: string;
          invoiceStatus: string; paymentStatus: string; renewalDate: string | null;
          renewalStatus: string; cancellationStatus: string; billingStatus: string;
        }};
        if (d.record) {
          const r = d.record;
          const bc: BusinessClient = {
            id: r.id, clientId: r.clientId, displayName: r.displayName || r.domain,
            clientName: r.displayName || r.domain, domain: r.domain, email: "", phone: "",
            invoiceStatus: r.invoiceStatus, paymentStatus: r.paymentStatus,
            cancellationStatus: r.cancellationStatus ?? "None",
            billingStatus: r.billingStatus ?? "Pending",
            monthlyValue: Math.round(r.monthlyValueCents / 100),
            activeServices: r.activeServices, renewalDate: r.renewalDate,
            renewalStatus: r.renewalStatus, assignedAM: r.assignedAM,
            activationStatus: r.activationStatus, onboardingStatus: r.onboardingStatus,
            cleared: r.cleared, kickoffCompleted: r.kickoffCompleted,
            kickoffDate: r.kickoffDate, assignedAt: r.assignedAt,
          };
          setWizardClient(bc);
          return;
        }
      }
    } catch { /* fall through */ }
    const fallback = liveClients.find((c) => c.id === clientId) ?? null;
    setWizardClient(fallback);
  }, [liveClients]);

  // Auto-launch wizard for activateClientId from query param
  useEffect(() => {
    if (!activateClientId || autoLaunchFired || wizardClient) return;
    const client = liveClients.find((c) => c.id === activateClientId);
    if (!client) return;
    const alreadyHasProject = liveProjects.some((p) => p.clientId === activateClientId);
    if (alreadyHasProject) return;
    setAutoLaunchFired(true);
    void openWizardForClient(activateClientId);
  }, [activateClientId, autoLaunchFired, wizardClient, liveClients, liveProjects, openWizardForClient]);

  // All projects are real Postgres projects
  const amProjects = liveProjects;

  // Cleared clients without a project yet
  const clearedWithoutProject = useMemo(
    () => liveClients.filter(
      (c) => c.cleared && c.activationStatus !== "active" &&
        !amProjects.some((p) => p.clientId === c.clientId)
    ),
    [amProjects, liveClients]
  );

  // KPIs
  const total      = amProjects.length;
  const inProgress = amProjects.filter((p) => p.status === "active").length;
  const offTrackProjects = amProjects.filter((p) => getOffTrackTasks(p.id, liveTasks).length > 0);
  const offTrackCount    = offTrackProjects.length;

  const filtered = amProjects.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q) ||
      (p.assignedAMName ?? "").toLowerCase().includes(q);
  });

  const handleWizardComplete = useCallback(() => {
    setWizardClient(null);
    void refreshData();
  }, [refreshData]);

  if (wizardClient) {
    return (
      <ActivationWizard
        client={wizardClient}
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
          accountManagerName={followUpProject.assignedAMName ?? "Account Manager"}
          onClose={() => setFollowUpProject(null)}
          onSent={() => {
            void refreshData();
            setFollowUpProject(null);
          }}
        />
      )}

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
          <h1 className="text-2xl font-bold text-slate-900">Projects - Health &amp; Action Summary</h1>
          <p className="text-sm text-slate-500 mt-1">
            Project health, off-track tasks, and communication context.
            Task creation and editing lives in the{" "}
            <Link href="/account-management/all-projects" className="text-blue-600 underline">Global Project Management</Link> view.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Total Projects"              value={String(total)} />
        <KpiCard title="Active"                      value={String(inProgress)} />
        <KpiCard title="Projects with Overdue Tasks" value={String(offTrackCount)}
          risk={offTrackCount > 0 ? "at-risk" : "healthy"} />
        <KpiCard title="Awaiting Activation"         value={String(clearedWithoutProject.length)}
          risk={clearedWithoutProject.length > 0 ? "at-risk" : "healthy"} />
      </div>

      {/* Cleared clients awaiting activation */}
      {clearedWithoutProject.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
          <h2 className="text-sm font-bold text-amber-900">
            Cleared Clients Awaiting Project Activation ({clearedWithoutProject.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {clearedWithoutProject.map((client) => (
              <div key={client.id} className="rounded-lg border border-amber-200 bg-white px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{client.clientName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    AM: {client.assignedAM} · {client.activeServices.length > 0 ? client.activeServices.join(", ") : "Services TBD"}
                  </p>
                  {client.monthlyValue > 0 && (
                    <p className="text-xs text-slate-400">${client.monthlyValue.toLocaleString()}/mo</p>
                  )}
                </div>
                <button
                  onClick={() => void openWizardForClient(client.id)}
                  className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Activate Project
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project list */}
      {total === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-6 py-16 text-center">
          <div className="text-slate-300 text-5xl mb-4">📋</div>
          <h2 className="text-lg font-bold text-slate-700 mb-1">No projects yet</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Projects are created automatically when Billing confirms payment and clears a client through the proposal.
          </p>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search projects or domains..."
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
                Project Health &amp; Action Summary
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Project / Domain","Account Manager","Status","Open Tasks","Overdue Tasks","Depts. Overdue","Last Communication","Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((project) => {
                    const offTrackTasks = getOffTrackTasks(project.id, liveTasks);
                    const deptsNeedingFollowUp = getDepartmentsNeedingFollowUp(offTrackTasks);
                    const masterClient = liveClients.find((c) => c.clientId === project.clientId);
                    const projectComms = getCommunicationsByProject(project.id);
                    const clientComms = project.clientId
                      ? getCommunicationsByClient(project.clientId)
                      : [];
                    const allComms = [
                      ...projectComms,
                      ...clientComms.filter((c) => !projectComms.some((pc) => pc.id === c.id)),
                    ].sort((a, b) => b.date.localeCompare(a.date));
                    const latestComm = allComms[0];
                    const onboardingRecordId = onboardingMap.get(project.id) ?? null;

                    return (
                      <tr key={project.id} className="hover:bg-slate-50 transition-colors align-top">
                        {/* Project / Domain */}
                        <td className="px-4 py-4 min-w-[180px]">
                          <p className="font-semibold text-slate-900 leading-snug">{project.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{project.domain}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {project.openTaskCount} open · {project.doneTaskCount} done
                          </p>
                          {masterClient && masterClient.activeServices.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {masterClient.activeServices.slice(0, 3).map((s) => (
                                <span key={s} className="inline-block rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">{s}</span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Account Manager */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                          {project.assignedAMName ?? <span className="text-slate-400 italic text-xs">Unassigned</span>}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{
                              background: project.status === "active" ? "#ECFDF5" : project.status === "complete" ? "#F1F5F9" : "#F8FAFC",
                              color: project.status === "active" ? "#059669" : "#64748B",
                              borderColor: project.status === "active" ? "#A7F3D0" : "#E2E8F0",
                            }}>
                            {project.status}
                          </span>
                        </td>

                        {/* Open Tasks */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold">
                          {project.openTaskCount}
                        </td>

                        {/* Overdue Tasks */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {offTrackTasks.length === 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                              On track
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                                {offTrackTasks.length} overdue
                              </span>
                              <div className="text-[10px] text-slate-500 space-y-0.5">
                                {offTrackTasks.slice(0, 3).map((t) => (
                                  <p key={t.id} className="truncate max-w-[140px]">🟡 {t.label}</p>
                                ))}
                                {offTrackTasks.length > 3 && <p className="text-slate-400">+{offTrackTasks.length - 3} more</p>}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Depts Needing Follow-up */}
                        <td className="px-4 py-4">
                          {deptsNeedingFollowUp.length === 0 ? (
                            <span className="text-xs text-slate-400">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {deptsNeedingFollowUp.map((dept) => (
                                <span key={dept} className="inline-flex rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
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
                              <p className="text-xs font-semibold text-slate-700">{fmt(latestComm.date)}</p>
                              <p className="text-[11px] text-slate-500">{latestComm.type}</p>
                              <p className="text-[11px] text-slate-400 max-w-[140px] truncate">{latestComm.subject}</p>
                              <Link href="/account-management/communications" className="inline-flex text-[11px] text-blue-600 hover:underline">
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
                            <Link href={`/projects/${project.id}`}
                              className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 whitespace-nowrap">
                              Manage Tasks →
                            </Link>
                            <button
                              onClick={() => setFollowUpProject(project)}
                              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap"
                            >
                              Send Follow-up
                            </button>
                            {onboardingRecordId && (
                              <Link href={`/account-management/onboarding/${onboardingRecordId}/record`}
                                className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 whitespace-nowrap">
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
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                        No projects match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Off-track detail callout */}
          {offTrackCount > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
              <h2 className="text-sm font-bold text-amber-900">Projects with Overdue Tasks — Action Required</h2>
              <div className="space-y-3">
                {offTrackProjects.map((project) => {
                  const offTrackTasks = getOffTrackTasks(project.id, liveTasks);
                  const depts = getDepartmentsNeedingFollowUp(offTrackTasks);
                  return (
                    <div key={project.id} className="rounded-lg border border-amber-200 bg-white px-4 py-3 flex flex-wrap items-start gap-4 justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">{project.name}</p>
                        <p className="text-xs text-slate-500">
                          {offTrackTasks.length} overdue task{offTrackTasks.length !== 1 ? "s" : ""} ·{" "}
                          {depts.length > 0 ? `Depts: ${depts.join(", ")}` : "No dept follow-up"}
                        </p>
                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          {offTrackTasks.map((t) => (
                            <p key={t.id}>🟡 Overdue - {t.label} {t.dueDate ? `(due ${fmt(t.dueDate)})` : ""}</p>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/projects/${project.id}`}
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 whitespace-nowrap">
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
    <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400 text-sm">Loading...</div>}>
      <ProjectsPageInner />
    </Suspense>
  );
}
