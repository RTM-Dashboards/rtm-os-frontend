"use client";

import { useState } from "react";
import { RoleToggle } from "@/components/am-role-toggle";
import {
  ALL_TASKS,
  AM_NAMES,
  SARAH,
  type AMRole,
} from "@/lib/am-role-mock-data";

// ── Helpers ───────────────────────────────────────────────────────────────────

type TaskStatusType = "Not Started" | "In Progress" | "Completed" | "Blocked" | "Waiting For Client" | "Review";

function statusBadge(s: string) {
  switch (s) {
    case "Completed": return "bg-emerald-100 text-emerald-700";
    case "In Progress": return "bg-blue-100 text-blue-700";
    case "Blocked": return "bg-red-100 text-red-700";
    case "Waiting For Client": return "bg-amber-100 text-amber-700";
    case "Review": return "bg-violet-100 text-violet-700";
    case "Not Started": return "bg-slate-100 text-slate-500";
    default: return "bg-slate-100 text-slate-500";
  }
}

function priorityBadge(p: string) {
  switch (p) {
    case "High": return "bg-red-100 text-red-700";
    case "Medium": return "bg-amber-100 text-amber-700";
    case "Low": return "bg-slate-100 text-slate-500";
    default: return "bg-slate-100 text-slate-500";
  }
}

const ALL_STATUSES: TaskStatusType[] = ["Not Started", "In Progress", "Completed", "Blocked", "Waiting For Client", "Review"];
const ALL_DEPTS = [...new Set(ALL_TASKS.map((t) => t.department))];

// ── Head View ─────────────────────────────────────────────────────────────────

function HeadView() {
  const [filterAM, setFilterAM] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [tasks, setTasks] = useState(ALL_TASKS);

  const filtered = tasks.filter((t) => {
    if (filterAM !== "All" && t.assignedAM !== filterAM) return false;
    if (filterDept !== "All" && t.department !== filterDept) return false;
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    return true;
  });

  function updateStatus(id: string, status: TaskStatusType) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  }

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: ALL_TASKS.length, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
          { label: "In Progress", value: ALL_TASKS.filter((t) => t.status === "In Progress").length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "Blocked", value: ALL_TASKS.filter((t) => t.status === "Blocked").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
          { label: "Completed", value: ALL_TASKS.filter((t) => t.status === "Completed").length, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
          { label: "Waiting For Client", value: ALL_TASKS.filter((t) => t.status === "Waiting For Client").length, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
          { label: "Ready for Review", value: ALL_TASKS.filter((t) => t.status === "Review").length, color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
          { label: "High Priority", value: ALL_TASKS.filter((t) => t.priority === "High").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
          { label: "Not Started", value: ALL_TASKS.filter((t) => t.status === "Not Started").length, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Head Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Head Management Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Escalate Blocked Tasks", color: "bg-red-600 hover:bg-red-700" },
            { label: "Rebalance Ownership", color: "bg-indigo-600 hover:bg-indigo-700" },
            { label: "Create Manager Note", color: "bg-slate-600 hover:bg-slate-700" },
            { label: "Export Task Report", color: "bg-slate-700 hover:bg-slate-800" },
          ].map(({ label, color }) => (
            <button key={label} className={`${color} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* All Tasks Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Department / Client Tasks</h2>
            <p className="text-sm text-slate-500">Full centralized task view across all AMs, clients, and departments.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filterAM} onChange={(e) => setFilterAM(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option value="All">All AMs</option>
              {AM_NAMES.map((am) => <option key={am}>{am}</option>)}
            </select>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option value="All">All Departments</option>
              {ALL_DEPTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option value="All">All Statuses</option>
              {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Task", "Client", "Assigned AM", "Department", "Service", "Due Date", "Priority", "Status", "Notes", "Update"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className={`border-t border-slate-100 hover:bg-slate-50 ${t.status === "Completed" ? "bg-emerald-50/30" : ""}`}>
                  <td className="px-4 py-3 font-medium text-slate-800 min-w-[180px]">{t.task}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.assignedAM}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.department}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.service}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{t.dueDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityBadge(t.priority)}`}>{t.priority}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value as TaskStatusType)} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-0 outline-none ${statusBadge(t.status)}`}>
                      {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-[180px]">{t.notes}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button className="text-xs font-semibold text-indigo-600 hover:underline">Reassign</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-400">No tasks match the filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">{filtered.length} of {ALL_TASKS.length} tasks shown</p>
        </div>
      </section>

      {/* Task distribution by AM */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Task Distribution by AM</h2>
          <p className="text-sm text-slate-500">Breakdown of task ownership across the AM team.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {AM_NAMES.map((am) => {
            const amTasks = ALL_TASKS.filter((t) => t.assignedAM === am);
            const blocked = amTasks.filter((t) => t.status === "Blocked").length;
            return (
              <div key={am} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800 mb-3">{am}</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Total Tasks</span><span className="font-bold">{amTasks.length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">In Progress</span><span className="text-blue-600 font-semibold">{amTasks.filter((t) => t.status === "In Progress").length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Blocked</span><span className={`font-semibold ${blocked > 0 ? "text-red-600" : "text-green-600"}`}>{blocked}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Completed</span><span className="text-green-600 font-semibold">{amTasks.filter((t) => t.status === "Completed").length}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ── AM View ───────────────────────────────────────────────────────────────────

function AMView() {
  const [myTasks, setMyTasks] = useState(ALL_TASKS.filter((t) => t.assignedAM === SARAH));
  const [filterStatus, setFilterStatus] = useState("All");
  const [newNote, setNewNote] = useState<Record<string, string>>({});

  const filtered = myTasks.filter((t) => filterStatus === "All" || t.status === filterStatus);

  function updateStatus(id: string, status: TaskStatusType) {
    setMyTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  }

  function saveNote(id: string) {
    setMyTasks((prev) => prev.map((t) => t.id === id ? { ...t, notes: newNote[id] ?? t.notes } : t));
  }

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "My Total Tasks", value: myTasks.length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "In Progress", value: myTasks.filter((t) => t.status === "In Progress").length, color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
          { label: "Blocked", value: myTasks.filter((t) => t.status === "Blocked").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
          { label: "Completed", value: myTasks.filter((t) => t.status === "Completed").length, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* AM Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">My Task Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Complete Task", color: "bg-teal-600 hover:bg-teal-700" },
            { label: "Add Comment", color: "bg-violet-600 hover:bg-violet-700" },
            { label: "Add Client Note", color: "bg-slate-600 hover:bg-slate-700" },
            { label: "Request Manager Escalation", color: "bg-red-600 hover:bg-red-700" },
          ].map(({ label, color }) => (
            <button key={label} className={`${color} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* My Assigned Client Tasks */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Assigned Client Tasks</h2>
            <p className="text-sm text-slate-500">Tasks assigned to {SARAH} only. Other AM tasks are not visible.</p>
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Statuses</option>
            {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-3 p-5">
          {filtered.map((t) => (
            <div key={t.id} className={`rounded-xl border p-4 ${t.status === "Blocked" ? "border-red-200 bg-red-50" : t.status === "Completed" ? "border-green-200 bg-green-50" : "border-slate-100 bg-white"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{t.task}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.client} · {t.department} · Due: {t.dueDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityBadge(t.priority)}`}>{t.priority}</span>
                  <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value as TaskStatusType)} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-0 outline-none cursor-pointer ${statusBadge(t.status)}`}>
                    {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue={t.notes}
                  onChange={(e) => setNewNote((prev) => ({ ...prev, [t.id]: e.target.value }))}
                  placeholder="Add note…"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                />
                <button onClick={() => saveNote(t.id)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Save</button>
                {t.status === "Blocked" && (
                  <button className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Escalate</button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">No tasks match the current filter.</p>
          )}
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic">You can only see tasks assigned to you. Other AM tasks are not visible in this view.</p>
        </div>
      </section>

      {/* My Client Handoffs */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">My Client Handoffs</h2>
          <p className="text-sm text-slate-500">Client tasks I&apos;m handing off or receiving.</p>
        </div>
        <div className="p-5">
          {myTasks.filter((t) => t.status === "Waiting For Client").length > 0 ? (
            <div className="space-y-3">
              {myTasks.filter((t) => t.status === "Waiting For Client").map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.task}</p>
                    <p className="text-xs text-slate-500">{t.client} · {t.department}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge(t.status)}`}>{t.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No client handoffs pending.</p>
          )}
        </div>
      </section>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TasksCentralPage() {
  const [role, setRole] = useState<AMRole>("head");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Centralized Tasks</h1>
        <p className="text-sm text-slate-500 mt-1">
          Shared task board across all client workspaces — onboarding, recurring, and department tasks.
        </p>
      </div>

      {/* Role Toggle — Account Management Head View / Account Manager View */}
      <RoleToggle role={role} onRoleChange={setRole} />

      {/* Role content */}
      {role === "head" ? <HeadView /> : <AMView />}
    </div>
  );
}
