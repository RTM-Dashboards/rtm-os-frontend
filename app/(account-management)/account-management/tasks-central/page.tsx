"use client";

import { useState } from "react";
import { RoleToggle } from "@/components/am-role-toggle";
import {
  ALL_TASKS,
  AM_NAMES,
  SARAH,
  type AMRole,
} from "@/lib/am-role-mock-data";

//  Helpers 

type TaskStatusType = "Not Started"| "In Progress"| "Completed"| "Blocked"| "Waiting For Client"| "Review";

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

function templateStatusBadge(s: string) {
  switch (s) {
    case "Active": return "bg-emerald-100 text-emerald-700";
    case "Draft": return "bg-amber-100 text-amber-700";
    case "Archived": return "bg-slate-100 text-slate-500";
    default: return "bg-slate-100 text-slate-500";
  }
}

const ALL_STATUSES: TaskStatusType[] = ["Not Started", "In Progress", "Completed", "Blocked", "Waiting For Client", "Review"];
const ALL_DEPTS = [...new Set(ALL_TASKS.map((t) => t.department))];

//  Mock Data 

const DEPARTMENTS = [
  "Account Management",
  "SEO & Local",
  "Paid Advertising",
  "Content",
  "Web Development",
  "Reporting",
  "Billing",
  "Sales",
];

interface TaskTemplate {
  id: string;
  name: string;
  department: string;
  service: string;
  taskCount: number;
  activeClients: number;
  status: "Active"| "Draft"| "Archived";
  lastModified: string;
}

const TASK_TEMPLATES: TaskTemplate[] = [
  { id: "tt1", name: "SEO Client Onboarding", department: "SEO & Local", service: "SEO", taskCount: 12, activeClients: 8, status: "Active", lastModified: "2025-07-10"},
  { id: "tt2", name: "Meta Ads Launch Checklist", department: "Paid Advertising", service: "Meta Ads", taskCount: 9, activeClients: 5, status: "Active", lastModified: "2025-07-08"},
  { id: "tt3", name: "Google Ads Setup", department: "Paid Advertising", service: "Google Ads", taskCount: 11, activeClients: 6, status: "Active", lastModified: "2025-07-05"},
  { id: "tt4", name: "GBP Optimization Flow", department: "SEO & Local", service: "GBP", taskCount: 7, activeClients: 4, status: "Active", lastModified: "2025-06-28"},
  { id: "tt5", name: "Monthly Reporting Setup", department: "Reporting", service: "Reporting", taskCount: 5, activeClients: 14, status: "Active", lastModified: "2025-06-20"},
  { id: "tt6", name: "Content Calendar Build", department: "Content", service: "Content", taskCount: 8, activeClients: 3, status: "Draft", lastModified: "2025-07-01"},
  { id: "tt7", name: "Website Dev Handoff", department: "Web Development", service: "Web Dev", taskCount: 15, activeClients: 2, status: "Active", lastModified: "2025-06-15"},
  { id: "tt8", name: "Billing Onboarding", department: "Billing", service: "Billing", taskCount: 4, activeClients: 11, status: "Active", lastModified: "2025-05-30"},
];

interface ProjectTemplate {
  id: string;
  name: string;
  department: string;
  servicesIncluded: string[];
  taskCount: number;
  duration: string;
  status: "Active"| "Draft"| "Archived";
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  { id: "pt1", name: "SEO Client Onboarding", department: "SEO & Local", servicesIncluded: ["SEO", "GBP", "Content"], taskCount: 22, duration: "30 days", status: "Active"},
  { id: "pt2", name: "Meta Ads Launch", department: "Paid Advertising", servicesIncluded: ["Meta Ads", "Reporting"], taskCount: 14, duration: "14 days", status: "Active"},
  { id: "pt3", name: "Google Ads Launch", department: "Paid Advertising", servicesIncluded: ["Google Ads", "Reporting"], taskCount: 16, duration: "14 days", status: "Active"},
  { id: "pt4", name: "GBP Optimization", department: "SEO & Local", servicesIncluded: ["GBP"], taskCount: 9, duration: "7 days", status: "Active"},
  { id: "pt5", name: "Website Development", department: "Web Development", servicesIncluded: ["Web Dev", "Content", "SEO"], taskCount: 30, duration: "60 days", status: "Active"},
  { id: "pt6", name: "Reporting Setup", department: "Reporting", servicesIncluded: ["Reporting", "Account Management"], taskCount: 8, duration: "5 days", status: "Draft"},
];

interface DeptTemplateRow {
  department: string;
  templateCount: number;
  activeProjects: number;
  owner: string;
}

const DEPT_TEMPLATE_ROWS: DeptTemplateRow[] = [
  { department: "Account Management", templateCount: 3, activeProjects: 12, owner: "Jordan Mills"},
  { department: "SEO & Local", templateCount: 6, activeProjects: 18, owner: "Maya Torres"},
  { department: "Paid Advertising", templateCount: 5, activeProjects: 11, owner: "Chris Blake"},
  { department: "Content", templateCount: 4, activeProjects: 7, owner: "Ava Kim"},
  { department: "Web Development", templateCount: 3, activeProjects: 4, owner: "Devon Park"},
  { department: "Reporting", templateCount: 2, activeProjects: 22, owner: "Riley Chen"},
  { department: "Billing", templateCount: 2, activeProjects: 15, owner: "Sam Nguyen"},
  { department: "Sales", templateCount: 2, activeProjects: 6, owner: "Taylor Ross"},
];

interface ClientTemplate {
  id: string;
  client: string;
  template: string;
  service: string;
  taskCount: number;
  lastUpdated: string;
}

const CLIENT_TEMPLATES: ClientTemplate[] = [
  { id: "ct1", client: "Apex Roofing", template: "SEO Package", service: "SEO", taskCount: 14, lastUpdated: "2025-07-11"},
  { id: "ct2", client: "Pacific Dental", template: "Growth Package", service: "SEO + Meta Ads", taskCount: 19, lastUpdated: "2025-07-09"},
  { id: "ct3", client: "Harbor Auto", template: "Lead Generation Package", service: "Google Ads + Meta Ads", taskCount: 16, lastUpdated: "2025-07-07"},
  { id: "ct4", client: "Summit Fitness", template: "Social Media Package", service: "Content + Meta Ads", taskCount: 11, lastUpdated: "2025-07-03"},
  { id: "ct5", client: "Lakeside Dental", template: "Local SEO Package", service: "SEO + GBP", taskCount: 10, lastUpdated: "2025-06-29"},
  { id: "ct6", client: "Metro HVAC", template: "Full Service Package", service: "SEO + Google Ads + Reporting", taskCount: 24, lastUpdated: "2025-06-25"},
];

interface BuilderTask {
  id: string;
  name: string;
  description: string;
  ownerType: string;
  priority: string;
  dueDays: number;
  dependency: string;
}

interface GeneratedTask {
  id: string;
  name: string;
  department: string;
  priority: string;
  dueDays: number;
}

interface PackageState {
  client: string;
  service: string;
  template: string;
  department: string;
  generated: boolean;
}

const DEPENDENCY_CHAINS = [
  { id: "dep1", label: "SEO Campaign", steps: ["SEO Audit", "Keyword Research", "Content Planning", "Implementation", "Reporting"] },
  { id: "dep2", label: "Paid Ads Launch", steps: ["Account Setup", "Audience Research", "Ad Creative Build", "Campaign Launch", "Performance Review"] },
  { id: "dep3", label: "Website Build", steps: ["Discovery Call", "Wireframe Approval", "Content Collection", "Development", "QA & Launch"] },
];

const MOCK_GENERATED_TASKS: GeneratedTask[] = [
  { id: "g1", name: "Initial SEO Audit", department: "SEO & Local", priority: "High", dueDays: 3 },
  { id: "g2", name: "Keyword Research Report", department: "SEO & Local", priority: "High", dueDays: 7 },
  { id: "g3", name: "On-Page Optimization", department: "SEO & Local", priority: "Medium", dueDays: 14 },
  { id: "g4", name: "Content Brief Creation", department: "Content", priority: "Medium", dueDays: 10 },
  { id: "g5", name: "Monthly Reporting Setup", department: "Reporting", priority: "Low", dueDays: 21 },
];

//  Head View 

function HeadView() {
  const [filterAM, setFilterAM] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [tasks, setTasks] = useState(ALL_TASKS);

  const filtered = tasks.filter((t) => {
    if (filterAM !== "All"&& t.assignedAM !== filterAM) return false;
    if (filterDept !== "All"&& t.department !== filterDept) return false;
    if (filterStatus !== "All"&& t.status !== filterStatus) return false;
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
          { label: "Total Tasks", value: ALL_TASKS.length, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200"},
          { label: "In Progress", value: ALL_TASKS.filter((t) => t.status === "In Progress").length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200"},
          { label: "Blocked", value: ALL_TASKS.filter((t) => t.status === "Blocked").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200"},
          { label: "Completed", value: ALL_TASKS.filter((t) => t.status === "Completed").length, color: "text-green-700", bg: "bg-green-50", border: "border-green-200"},
          { label: "Waiting For Client", value: ALL_TASKS.filter((t) => t.status === "Waiting For Client").length, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200"},
          { label: "Ready for Review", value: ALL_TASKS.filter((t) => t.status === "Review").length, color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200"},
          { label: "High Priority", value: ALL_TASKS.filter((t) => t.priority === "High").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200"},
          { label: "Not Started", value: ALL_TASKS.filter((t) => t.status === "Not Started").length, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200"},
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
            { label: "Escalate Blocked Tasks", color: "bg-red-600 hover:bg-red-700"},
            { label: "Rebalance Ownership", color: "bg-indigo-600 hover:bg-indigo-700"},
            { label: "Create Manager Note", color: "bg-slate-600 hover:bg-slate-700"},
            { label: "Export Task Report", color: "bg-slate-700 hover:bg-slate-800"},
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
                <tr key={t.id} className={`border-t border-slate-100 hover:bg-slate-50 ${t.status === "Completed"? "bg-emerald-50/30": ""}`}>
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
                  <div className="flex justify-between"><span className="text-slate-500">Blocked</span><span className={`font-semibold ${blocked > 0 ? "text-red-600": "text-green-600"}`}>{blocked}</span></div>
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

//  AM View 

function AMView() {
  const [myTasks, setMyTasks] = useState(ALL_TASKS.filter((t) => t.assignedAM === SARAH));
  const [filterStatus, setFilterStatus] = useState("All");
  const [newNote, setNewNote] = useState<Record<string, string>>({});

  const filtered = myTasks.filter((t) => filterStatus === "All"|| t.status === filterStatus);

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
          { label: "My Total Tasks", value: myTasks.length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200"},
          { label: "In Progress", value: myTasks.filter((t) => t.status === "In Progress").length, color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200"},
          { label: "Blocked", value: myTasks.filter((t) => t.status === "Blocked").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200"},
          { label: "Completed", value: myTasks.filter((t) => t.status === "Completed").length, color: "text-green-700", bg: "bg-green-50", border: "border-green-200"},
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
            { label: "Complete Task", color: "bg-teal-600 hover:bg-teal-700"},
            { label: "Add Comment", color: "bg-violet-600 hover:bg-violet-700"},
            { label: "Add Client Note", color: "bg-slate-600 hover:bg-slate-700"},
            { label: "Request Manager Escalation", color: "bg-red-600 hover:bg-red-700"},
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
            <div key={t.id} className={`rounded-xl border p-4 ${t.status === "Blocked"? "border-red-200 bg-red-50": t.status === "Completed"? "border-green-200 bg-green-50": "border-slate-100 bg-white"}`}>
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
                  type="text"defaultValue={t.notes}
                  onChange={(e) => setNewNote((prev) => ({ ...prev, [t.id]: e.target.value }))}
                  placeholder="Add note…"className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"/>
                <button onClick={() => saveNote(t.id)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Save</button>
                {t.status === "Blocked"&& (
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

//  Task Template Library 

function TaskTemplateLibrary() {
  const [templates, setTemplates] = useState<TaskTemplate[]>(TASK_TEMPLATES);
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = templates.filter((t) => {
    if (filterDept !== "All"&& t.department !== filterDept) return false;
    if (filterStatus !== "All"&& t.status !== filterStatus) return false;
    return true;
  });

  function archiveTemplate(id: string) {
    setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, status: "Archived"as const } : t));
  }

  function cloneTemplate(id: string) {
    const source = templates.find((t) => t.id === id);
    if (!source) return;
    const clone: TaskTemplate = {
      ...source,
      id: `tt-clone-${Date.now()}`,
      name: `${source.name} (Copy)`,
      status: "Draft",
      lastModified: new Date().toISOString().slice(0, 10),
      activeClients: 0,
    };
    setTemplates((prev) => [...prev, clone]);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"id="task-template-library">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-0.5">Teamwork Foundation</p>
          <h2 className="text-lg font-bold text-slate-900">Task Template Library</h2>
          <p className="text-sm text-slate-500">Reusable task templates organized by department and service.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Statuses</option>
            {["Active", "Draft", "Archived"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">+ Create Template</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Template Name", "Department", "Service", "No. of Tasks", "Active Clients", "Status", "Last Modified", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">{t.name}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.department}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.service}</td>
                <td className="px-4 py-3 text-center font-bold text-slate-700">{t.taskCount}</td>
                <td className="px-4 py-3 text-center font-bold text-blue-700">{t.activeClients}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${templateStatusBadge(t.status)}`}>{t.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{t.lastModified}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button className="text-xs font-semibold text-indigo-600 hover:underline">Edit</button>
                    <button onClick={() => cloneTemplate(t.id)} className="text-xs font-semibold text-teal-600 hover:underline">Clone</button>
                    <button onClick={() => archiveTemplate(t.id)} className="text-xs font-semibold text-slate-400 hover:underline">Archive</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No templates match the filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">{filtered.length} of {templates.length} templates shown</p>
      </div>
    </section>
  );
}

//  Project Template Library 

function ProjectTemplateLibrary() {
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = PROJECT_TEMPLATES.filter((p) => {
    if (filterDept !== "All"&& p.department !== filterDept) return false;
    if (filterStatus !== "All"&& p.status !== filterStatus) return false;
    return true;
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"id="project-template-library">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-0.5">Teamwork Foundation</p>
          <h2 className="text-lg font-bold text-slate-900">Project Template Library</h2>
          <p className="text-sm text-slate-500">Pre-built project templates for common service launches and onboarding flows.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Statuses</option>
            {["Active", "Draft", "Archived"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">+ New Project Template</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Project Template", "Department", "Services Included", "Task Count", "Duration", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.department}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.servicesIncluded.map((s) => (
                      <span key={s} className="inline-flex rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-bold text-slate-700">{p.taskCount}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.duration}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${templateStatusBadge(p.status)}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button className="text-xs font-semibold text-teal-600 hover:underline">Launch</button>
                    <button className="text-xs font-semibold text-indigo-600 hover:underline">Edit</button>
                    <button className="text-xs font-semibold text-slate-400 hover:underline">Clone</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No project templates match the filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">{filtered.length} of {PROJECT_TEMPLATES.length} project templates</p>
      </div>
    </section>
  );
}

//  Department Template Library 

function DepartmentTemplateLibrary() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-0.5">Teamwork Foundation</p>
        <h2 className="text-lg font-bold text-slate-900">Department Template Library</h2>
        <p className="text-sm text-slate-500">Template ownership and active projects broken down by department.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Department", "Templates", "Active Projects", "Template Owner", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEPT_TEMPLATE_ROWS.map((row) => (
              <tr key={row.department} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-semibold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"/>
                    {row.department}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-bold text-indigo-700">{row.templateCount}</td>
                <td className="px-4 py-3 text-center font-bold text-teal-700">{row.activeProjects}</td>
                <td className="px-4 py-3 text-slate-600">{row.owner}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button className="text-xs font-semibold text-indigo-600 hover:underline">View Templates</button>
                    <button className="text-xs font-semibold text-slate-400 hover:underline">Edit Owner</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

//  Client Template Library 

function ClientTemplateLibrary() {
  const [filterService, setFilterService] = useState("All");
  const services = [...new Set(CLIENT_TEMPLATES.map((c) => c.service))];
  const filtered = filterService === "All"? CLIENT_TEMPLATES : CLIENT_TEMPLATES.filter((c) => c.service === filterService);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-0.5">Teamwork Foundation</p>
          <h2 className="text-lg font-bold text-slate-900">Client Template Library</h2>
          <p className="text-sm text-slate-500">Client-specific templates for customized service packages.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Services</option>
            {services.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">+ Add Client Template</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Client", "Template", "Service", "Task Count", "Last Updated", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">{c.client}</td>
                <td className="px-4 py-3 text-slate-600">{c.template}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.service}</td>
                <td className="px-4 py-3 text-center font-bold text-slate-700">{c.taskCount}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.lastUpdated}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button className="text-xs font-semibold text-indigo-600 hover:underline">Edit</button>
                    <button className="text-xs font-semibold text-teal-600 hover:underline">Generate Tasks</button>
                    <button className="text-xs font-semibold text-slate-400 hover:underline">Archive</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No client templates found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">{filtered.length} of {CLIENT_TEMPLATES.length} client templates</p>
      </div>
    </section>
  );
}

//  Template Builder 

function TemplateBuilder() {
  const [templateName, setTemplateName] = useState("");
  const [department, setDepartment] = useState("");
  const [service, setService] = useState("");
  const [description, setDescription] = useState("");
  const [builderTasks, setBuilderTasks] = useState<BuilderTask[]>([
    { id: "bt1", name: "Initial Audit", description: "Conduct baseline audit", ownerType: "SEO Specialist", priority: "High", dueDays: 3, dependency: ""},
    { id: "bt2", name: "Keyword Research", description: "Research target keywords", ownerType: "SEO Specialist", priority: "High", dueDays: 7, dependency: "Initial Audit"},
    { id: "bt3", name: "Strategy Document", description: "Create strategy doc", ownerType: "Account Manager", priority: "Medium", dueDays: 10, dependency: "Keyword Research"},
  ]);
  const [saved, setSaved] = useState(false);

  function addTask() {
    const newTask: BuilderTask = {
      id: `bt-${Date.now()}`,
      name: "",
      description: "",
      ownerType: "",
      priority: "Medium",
      dueDays: 7,
      dependency: "",
    };
    setBuilderTasks((prev) => [...prev, newTask]);
  }

  function removeTask(id: string) {
    setBuilderTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTask(id: string, field: keyof BuilderTask, value: string | number) {
    setBuilderTasks((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t));
  }

  function saveTemplate() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"id="template-builder">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-0.5">Teamwork Foundation</p>
        <h2 className="text-lg font-bold text-slate-900">Template Builder</h2>
        <p className="text-sm text-slate-500">Build reusable task templates from scratch or customize existing ones.</p>
      </div>
      <div className="p-6 space-y-6">
        {/* Template Header Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Template Name</label>
            <input
              type="text"value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. SEO Client Onboarding"className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400">
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Service</label>
            <input
              type="text"value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. SEO, Meta Ads"className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Description</label>
            <input
              type="text"value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400"/>
          </div>
        </div>

        {/* Task Builder */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-700">Task Builder <span className="text-slate-400 font-normal">({builderTasks.length} tasks)</span></p>
            <button onClick={addTask} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">+ Add Task</button>
          </div>
          <div className="space-y-3">
            {builderTasks.map((t, idx) => (
              <div key={t.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                  <input
                    type="text"value={t.name}
                    onChange={(e) => updateTask(t.id, "name", e.target.value)}
                    placeholder="Task Name"className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400"/>
                  <button onClick={() => removeTask(t.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold px-2">Remove</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  <input
                    type="text"value={t.description}
                    onChange={(e) => updateTask(t.id, "description", e.target.value)}
                    placeholder="Task Description"className="col-span-2 sm:col-span-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-400"/>
                  <input
                    type="text"value={t.ownerType}
                    onChange={(e) => updateTask(t.id, "ownerType", e.target.value)}
                    placeholder="Owner Type"className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-400"/>
                  <select
                    value={t.priority}
                    onChange={(e) => updateTask(t.id, "priority", e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-400">
                    {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"value={t.dueDays}
                      onChange={(e) => updateTask(t.id, "dueDays", parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-400"min={0}
                    />
                    <span className="text-xs text-slate-400 whitespace-nowrap">days</span>
                  </div>
                  <input
                    type="text"value={t.dependency}
                    onChange={(e) => updateTask(t.id, "dependency", e.target.value)}
                    placeholder="Dependency"className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-400"/>
                </div>
              </div>
            ))}
            {builderTasks.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
                No tasks yet. Click &quot;+ Add Task&quot; to get started.
              </div>
            )}
          </div>
        </div>

        {/* Builder Actions */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
          <button onClick={addTask} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">+ Add Task</button>
          <button onClick={saveTemplate} className={`text-sm font-semibold px-6 py-2 rounded-lg transition-colors text-white ${saved ? "bg-emerald-600": "bg-emerald-600 hover:bg-emerald-700"}`}>
            {saved ? "Saved!": "Save Template"}
          </button>
        </div>
      </div>
    </section>
  );
}

//  Task Package Generator 

function TaskPackageGenerator() {
  const [pkg, setPkg] = useState<PackageState>({ client: "", service: "", template: "", department: "", generated: false });
  const [pushed, setPushed] = useState(false);

  const templateNames = TASK_TEMPLATES.map((t) => t.name);
  const services = [...new Set(TASK_TEMPLATES.map((t) => t.service))];
  const clients = [...new Set(CLIENT_TEMPLATES.map((c) => c.client))];

  function generate() {
    if (!pkg.client || !pkg.service || !pkg.template) return;
    const matchedTemplate = TASK_TEMPLATES.find((t) => t.name === pkg.template);
    setPkg((prev) => ({ ...prev, department: matchedTemplate?.department ?? "", generated: true }));
    setPushed(false);
  }

  function pushToCentral() {
    setPushed(true);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"id="task-package-generator">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-0.5">Teamwork Foundation</p>
        <h2 className="text-lg font-bold text-slate-900">Task Package Generator</h2>
        <p className="text-sm text-slate-500">Select a client, service, and template — generate and push tasks to the Centralized Task board.</p>
      </div>
      <div className="p-6 space-y-6">
        {/* Workflow Indicator */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {["Client", "Service Activated", "Select Template", "Generate Tasks", "Push To Centralized Tasks"].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${i <= (pkg.generated ? (pushed ? 4 : 3) : pkg.client ? (pkg.service ? (pkg.template ? 2 : 1) : 1) : 0) ? "bg-indigo-600 text-white": "bg-slate-100 text-slate-500"}`}>
                {step}
              </span>
              {i < arr.length - 1 && <span className="text-slate-300">→</span>}
            </div>
          ))}
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Client</label>
            <select
              value={pkg.client}
              onChange={(e) => setPkg((prev) => ({ ...prev, client: e.target.value, generated: false }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400">
              <option value="">Select client</option>
              {clients.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Service</label>
            <select
              value={pkg.service}
              onChange={(e) => setPkg((prev) => ({ ...prev, service: e.target.value, generated: false }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400">
              <option value="">Select service</option>
              {services.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Template</label>
            <select
              value={pkg.template}
              onChange={(e) => setPkg((prev) => ({ ...prev, template: e.target.value, generated: false }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400">
              <option value="">Select template</option>
              {templateNames.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={generate}
              disabled={!pkg.client || !pkg.service || !pkg.template}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Generate Tasks
            </button>
          </div>
        </div>

        {/* Generated Tasks Preview */}
        {pkg.generated && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-indigo-800">Generated Task Package</p>
                <p className="text-xs text-indigo-600 mt-0.5">{pkg.client} · {pkg.service} · {pkg.template} · Dept: {pkg.department}</p>
              </div>
              {!pushed ? (
                <button onClick={pushToCentral} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                  Push To Centralized Tasks
                </button>
              ) : (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-lg"> Pushed to Central Board</span>
              )}
            </div>
            <div className="space-y-2">
              {MOCK_GENERATED_TASKS.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg bg-white border border-indigo-100 px-3 py-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${priorityBadge(t.priority)}`}>{t.priority}</span>
                  <span className="text-sm font-medium text-slate-800 flex-1">{t.name}</span>
                  <span className="text-xs text-slate-500">{t.department}</span>
                  <span className="text-xs text-slate-400">Due in {t.dueDays}d</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

//  Task Dependency Builder 

function TaskDependencyBuilder() {
  const [selected, setSelected] = useState(DEPENDENCY_CHAINS[0].id);
  const chain = DEPENDENCY_CHAINS.find((c) => c.id === selected) ?? DEPENDENCY_CHAINS[0];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-0.5">Teamwork Foundation</p>
          <h2 className="text-lg font-bold text-slate-900">Task Dependency Builder</h2>
          <p className="text-sm text-slate-500">Visualize and define task dependency chains for templates and projects.</p>
        </div>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
          {DEPENDENCY_CHAINS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="p-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{chain.label} — Dependency Chain</p>
        <div className="flex flex-col items-start gap-0">
          {chain.steps.map((step, idx) => (
            <div key={step} className="flex flex-col items-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-800 min-w-[200px]">
                  {step}
                </div>
                {idx === 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Start</span>}
                {idx === chain.steps.length - 1 && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">End</span>}
              </div>
              {idx < chain.steps.length - 1 && (
                <div className="ml-4 flex items-center">
                  <div className="w-0 h-6 border-l-2 border-dashed border-indigo-300"/>
                  <span className="text-indigo-300 ml-[-1px] text-xs">↓</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">+ Add Step</button>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition-colors">Reorder Steps</button>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition-colors">Save Chain</button>
        </div>
      </div>
    </section>
  );
}

//  Task Management Action Center 

function TaskManagementActionCenter() {
  const actions = [
    { label: "Create Template", color: "bg-indigo-600 hover:bg-indigo-700"},
    { label: "Clone Template", color: "bg-teal-600 hover:bg-teal-700", icon: ""},
    { label: "Generate Task Package", color: "bg-orange-600 hover:bg-orange-700"},
    { label: "Launch Project", color: "bg-emerald-600 hover:bg-emerald-700"},
    { label: "Assign Tasks", color: "bg-violet-600 hover:bg-violet-700"},
    { label: "Archive Template", color: "bg-slate-500 hover:bg-slate-600"},
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Task Management Action Center</p>
      <p className="text-sm text-slate-500 mb-4">Central controls for template management, task generation, and project operations.</p>
      <div className="flex flex-wrap gap-3">
        {actions.map(({ label, color, icon }) => (
          <button key={label} className={`${color} rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors flex items-center gap-2 shadow-sm`}>
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

//  Project Workspace Mock Data 

interface Project {
  id: string;
  project: string;
  client: string;
  services: string[];
  owner: string;
  startDate: string;
  dueDate: string;
  progress: number;
  status: "Planning"| "Active"| "Waiting For Client"| "Blocked"| "Completed"| "Delayed";
}

const PROJECT_WORKSPACE_DATA: Project[] = [
  { id: "pw1", project: "SEO Onboarding", client: "Apex Roofing", services: ["SEO", "GBP"], owner: "Jordan Mills", startDate: "2025-07-01", dueDate: "2025-07-31", progress: 65, status: "Active"},
  { id: "pw2", project: "Meta Ads Launch", client: "Pacific Dental", services: ["Meta Ads", "Reporting"], owner: "Maya Torres", startDate: "2025-07-05", dueDate: "2025-07-20", progress: 30, status: "Waiting For Client"},
  { id: "pw3", project: "Google Ads Setup", client: "Harbor Auto", services: ["Google Ads"], owner: "Chris Blake", startDate: "2025-06-15", dueDate: "2025-07-10", progress: 80, status: "Active"},
  { id: "pw4", project: "Website Rebuild", client: "Summit Fitness", services: ["Web Dev", "SEO", "Content"], owner: "Devon Park", startDate: "2025-06-01", dueDate: "2025-08-31", progress: 45, status: "Active"},
  { id: "pw5", project: "GBP Optimization", client: "Lakeside Dental", services: ["GBP"], owner: "Ava Kim", startDate: "2025-07-08", dueDate: "2025-07-15", progress: 10, status: "Planning"},
  { id: "pw6", project: "Full Service Launch", client: "Metro HVAC", services: ["SEO", "Google Ads", "Reporting"], owner: "Riley Chen", startDate: "2025-06-20", dueDate: "2025-07-25", progress: 0, status: "Blocked"},
  { id: "pw7", project: "Content Calendar Q3", client: "Apex Roofing", services: ["Content"], owner: "Ava Kim", startDate: "2025-07-01", dueDate: "2025-09-30", progress: 15, status: "Active"},
  { id: "pw8", project: "Reporting Automation", client: "Pacific Dental", services: ["Reporting"], owner: "Riley Chen", startDate: "2025-05-01", dueDate: "2025-06-30", progress: 100, status: "Completed"},
  { id: "pw9", project: "Meta Ads Refresh", client: "Harbor Auto", services: ["Meta Ads"], owner: "Maya Torres", startDate: "2025-07-10", dueDate: "2025-07-22", progress: 5, status: "Delayed"},
];

const PROJECT_STATUSES = ["Planning", "Active", "Waiting For Client", "Blocked", "Completed", "Delayed"] as const;

function projectStatusBadge(s: string) {
  switch (s) {
    case "Active": return "bg-blue-100 text-blue-700";
    case "Planning": return "bg-slate-100 text-slate-600";
    case "Waiting For Client": return "bg-amber-100 text-amber-700";
    case "Blocked": return "bg-red-100 text-red-700";
    case "Completed": return "bg-emerald-100 text-emerald-700";
    case "Delayed": return "bg-orange-100 text-orange-700";
    default: return "bg-slate-100 text-slate-500";
  }
}

//  Milestone Mock Data 

interface Milestone {
  id: string;
  milestone: string;
  client: string;
  owner: string;
  dueDate: string;
  status: "Not Started"| "In Progress"| "Complete"| "Overdue"| "Blocked";
  dependency: string;
}

const MILESTONE_DATA: Milestone[] = [
  { id: "ms1", milestone: "Project Kickoff", client: "Apex Roofing", owner: "Jordan Mills", dueDate: "2025-07-02", status: "Complete", dependency: "—"},
  { id: "ms2", milestone: "Intake Complete", client: "Apex Roofing", owner: "Jordan Mills", dueDate: "2025-07-05", status: "Complete", dependency: "Project Kickoff"},
  { id: "ms3", milestone: "Asset Collection Complete", client: "Apex Roofing", owner: "Ava Kim", dueDate: "2025-07-10", status: "In Progress", dependency: "Intake Complete"},
  { id: "ms4", milestone: "Service Setup", client: "Pacific Dental", owner: "Maya Torres", dueDate: "2025-07-12", status: "Not Started", dependency: "Asset Collection Complete"},
  { id: "ms5", milestone: "Department Launch", client: "Harbor Auto", owner: "Chris Blake", dueDate: "2025-07-15", status: "In Progress", dependency: "Service Setup"},
  { id: "ms6", milestone: "First Report Sent", client: "Harbor Auto", owner: "Riley Chen", dueDate: "2025-07-20", status: "Not Started", dependency: "Department Launch"},
  { id: "ms7", milestone: "Optimization Phase", client: "Summit Fitness", owner: "Devon Park", dueDate: "2025-08-01", status: "Not Started", dependency: "First Report Sent"},
  { id: "ms8", milestone: "Renewal Review", client: "Metro HVAC", owner: "Jordan Mills", dueDate: "2025-09-01", status: "Blocked", dependency: "Optimization Phase"},
  { id: "ms9", milestone: "Project Kickoff", client: "Lakeside Dental", owner: "Ava Kim", dueDate: "2025-07-09", status: "Overdue", dependency: "—"},
  { id: "ms10", milestone: "Intake Complete", client: "Metro HVAC", owner: "Jordan Mills", dueDate: "2025-06-28", status: "Complete", dependency: "Project Kickoff"},
];

function milestoneStatusBadge(s: string) {
  switch (s) {
    case "Complete": return "bg-emerald-100 text-emerald-700";
    case "In Progress": return "bg-blue-100 text-blue-700";
    case "Not Started": return "bg-slate-100 text-slate-500";
    case "Overdue": return "bg-red-100 text-red-700";
    case "Blocked": return "bg-orange-100 text-orange-700";
    default: return "bg-slate-100 text-slate-500";
  }
}

//  Kanban Board Mock Data 

interface KanbanTask {
  id: string;
  name: string;
  client: string;
  department: string;
  owner: string;
  dueDate: string;
  priority: "High"| "Medium"| "Low";
  column: "Not Started"| "In Progress"| "Waiting For Client"| "Waiting For Department"| "Ready For Review"| "Completed"| "Blocked";
}

const KANBAN_TASKS: KanbanTask[] = [
  { id: "k1", name: "Keyword Research Report", client: "Apex Roofing", department: "SEO & Local", owner: "Maya Torres", dueDate: "2025-07-14", priority: "High", column: "In Progress"},
  { id: "k2", name: "Meta Ads Creative Pack", client: "Pacific Dental", department: "Paid Advertising", owner: "Chris Blake", dueDate: "2025-07-12", priority: "High", column: "Waiting For Client"},
  { id: "k3", name: "GBP Profile Audit", client: "Lakeside Dental", department: "SEO & Local", owner: "Ava Kim", dueDate: "2025-07-16", priority: "Medium", column: "Not Started"},
  { id: "k4", name: "Monthly Report — June", client: "Harbor Auto", department: "Reporting", owner: "Riley Chen", dueDate: "2025-07-10", priority: "High", column: "Ready For Review"},
  { id: "k5", name: "Blog Post Drafts x3", client: "Summit Fitness", department: "Content", owner: "Ava Kim", dueDate: "2025-07-18", priority: "Medium", column: "In Progress"},
  { id: "k6", name: "Google Ads Negative Keywords", client: "Harbor Auto", department: "Paid Advertising", owner: "Chris Blake", dueDate: "2025-07-11", priority: "Medium", column: "Blocked"},
  { id: "k7", name: "Website Homepage Copy", client: "Summit Fitness", department: "Web Development", owner: "Devon Park", dueDate: "2025-07-20", priority: "High", column: "Waiting For Department"},
  { id: "k8", name: "Billing Reconciliation", client: "Metro HVAC", department: "Billing", owner: "Sam Nguyen", dueDate: "2025-07-09", priority: "Low", column: "Completed"},
  { id: "k9", name: "SEO Technical Audit", client: "Metro HVAC", department: "SEO & Local", owner: "Maya Torres", dueDate: "2025-07-22", priority: "High", column: "Not Started"},
  { id: "k10", name: "Client Intro Call Notes", client: "Apex Roofing", department: "Account Management", owner: "Jordan Mills", dueDate: "2025-07-08", priority: "Medium", column: "Completed"},
  { id: "k11", name: "Ad Copy Revisions", client: "Pacific Dental", department: "Paid Advertising", owner: "Chris Blake", dueDate: "2025-07-15", priority: "High", column: "Ready For Review"},
  { id: "k12", name: "Landing Page Design", client: "Apex Roofing", department: "Web Development", owner: "Devon Park", dueDate: "2025-07-25", priority: "Medium", column: "Waiting For Department"},
];

const KANBAN_COLUMNS = ["Not Started", "In Progress", "Waiting For Client", "Waiting For Department", "Ready For Review", "Completed", "Blocked"] as const;

//  Task Detail Mock Data 

interface TaskDetailComment {
  id: string;
  author: string;
  date: string;
  text: string;
  type: "internal"| "handoff"| "am_note"| "activity"| "status_change";
}

interface TaskDetailData {
  id: string;
  name: string;
  client: string;
  service: string;
  department: string;
  assignedUser: string;
  dueDate: string;
  priority: "High"| "Medium"| "Low";
  status: string;
  description: string;
  deliverables: string[];
  dependencies: string[];
  blockers: string[];
  comments: TaskDetailComment[];
}

const TASK_DETAIL_MOCK: TaskDetailData = {
  id: "td1",
  name: "Keyword Research Report",
  client: "Apex Roofing",
  service: "SEO",
  department: "SEO & Local",
  assignedUser: "Maya Torres",
  dueDate: "2025-07-14",
  priority: "High",
  status: "In Progress",
  description: "Conduct comprehensive keyword research for Apex Roofing targeting local roofing and repair terms. Identify primary, secondary, and long-tail keywords with volume and competition data.",
  deliverables: [
    "Keyword research spreadsheet (50+ keywords)",
    "Competitor keyword gap analysis",
    "Recommended content cluster topics",
    "Priority keyword list for on-page optimization",
  ],
  dependencies: ["Intake Form Received", "GBP Audit Complete"],
  blockers: [],
  comments: [
    { id: "c1", author: "Jordan Mills", date: "2025-07-10 09:12", text: "Client confirmed they want to focus on emergency roofing services and storm damage.", type: "internal"},
    { id: "c2", author: "Maya Torres", date: "2025-07-10 10:45", text: "Handing off competitor list to SEO team for gap analysis. See attached doc.", type: "handoff"},
    { id: "c3", author: "Jordan Mills", date: "2025-07-11 14:00", text: "AM Note: Client prefers to review the keyword list before we proceed with implementation.", type: "am_note"},
    { id: "c4", author: "System", date: "2025-07-09 08:00", text: "Task created from SEO Onboarding template.", type: "activity"},
    { id: "c5", author: "System", date: "2025-07-10 09:00", text: "Status changed from Not Started → In Progress by Maya Torres.", type: "status_change"},
  ],
};

function commentTypeBadge(type: string) {
  switch (type) {
    case "internal": return "bg-slate-100 text-slate-600";
    case "handoff": return "bg-blue-100 text-blue-700";
    case "am_note": return "bg-violet-100 text-violet-700";
    case "activity": return "bg-slate-50 text-slate-400";
    case "status_change": return "bg-amber-50 text-amber-600";
    default: return "bg-slate-100 text-slate-500";
  }
}

function commentTypeLabel(type: string) {
  switch (type) {
    case "internal": return "Internal Comment";
    case "handoff": return "Department Handoff Note";
    case "am_note": return "AM Note";
    case "activity": return "Activity";
    case "status_change": return "Status Change";
    default: return type;
  }
}

//  Approval Workflow Mock Data 

interface ApprovalItem {
  id: string;
  type: "AM Review"| "Department Head Review"| "Client Approval"| "QA Approval"| "Reporting Approval";
  task: string;
  client: string;
  assignedTo: string;
  requestedDate: string;
  status: "Not Required"| "Pending"| "Approved"| "Rejected"| "Revision Requested";
  notes: string;
}

const APPROVAL_DATA: ApprovalItem[] = [
  { id: "ap1", type: "AM Review", task: "Keyword Research Report", client: "Apex Roofing", assignedTo: "Jordan Mills", requestedDate: "2025-07-11", status: "Pending", notes: "Awaiting AM sign-off before sending to client."},
  { id: "ap2", type: "Client Approval", task: "Meta Ads Creative Pack", client: "Pacific Dental", assignedTo: "Sarah Adams", requestedDate: "2025-07-10", status: "Revision Requested", notes: "Client requested changes to headline copy."},
  { id: "ap3", type: "QA Approval", task: "Monthly Report — June", client: "Harbor Auto", assignedTo: "Riley Chen", requestedDate: "2025-07-09", status: "Approved", notes: "QA passed. Report ready to send."},
  { id: "ap4", type: "Department Head Review", task: "Google Ads Negative Keywords", client: "Harbor Auto", assignedTo: "Chris Blake", requestedDate: "2025-07-08", status: "Pending", notes: "Blocked pending PPC head review."},
  { id: "ap5", type: "Reporting Approval", task: "Q2 SEO Summary", client: "Metro HVAC", assignedTo: "Jordan Mills", requestedDate: "2025-07-07", status: "Not Required", notes: "Client opted out of formal approval flow."},
  { id: "ap6", type: "AM Review", task: "Blog Post Drafts x3", client: "Summit Fitness", assignedTo: "Jordan Mills", requestedDate: "2025-07-12", status: "Rejected", notes: "Does not match client brand voice. Returned to content team."},
  { id: "ap7", type: "Client Approval", task: "Website Homepage Copy", client: "Summit Fitness", assignedTo: "Sarah Adams", requestedDate: "2025-07-13", status: "Pending", notes: "Sent via email, awaiting response."},
  { id: "ap8", type: "QA Approval", task: "Landing Page Design", client: "Apex Roofing", assignedTo: "Devon Park", requestedDate: "2025-07-14", status: "Pending", notes: "Design QA in progress."},
];

function approvalStatusBadge(s: string) {
  switch (s) {
    case "Approved": return "bg-emerald-100 text-emerald-700";
    case "Pending": return "bg-amber-100 text-amber-700";
    case "Rejected": return "bg-red-100 text-red-700";
    case "Revision Requested": return "bg-orange-100 text-orange-700";
    case "Not Required": return "bg-slate-100 text-slate-400";
    default: return "bg-slate-100 text-slate-500";
  }
}

//  Team Throughput Mock Data 

interface ThroughputUser {
  id: string;
  user: string;
  department: string;
  openTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  slaCompliance: number;
  queueStatus: "Available"| "On Track"| "At Risk"| "Overdue";
}

const WORKLOAD_DATA: ThroughputUser[] = [
  { id: "wl1", user: "Jordan Mills", department: "Account Management", openTasks: 8, overdueTasks: 1, blockedTasks: 0, slaCompliance: 88, queueStatus: "On Track"},
  { id: "wl2", user: "Maya Torres", department: "SEO & Local", openTasks: 14, overdueTasks: 3, blockedTasks: 1, slaCompliance: 72, queueStatus: "Overdue"},
  { id: "wl3", user: "Chris Blake", department: "Paid Advertising", openTasks: 10, overdueTasks: 0, blockedTasks: 2, slaCompliance: 83, queueStatus: "At Risk"},
  { id: "wl4", user: "Ava Kim", department: "Content", openTasks: 6, overdueTasks: 0, blockedTasks: 0, slaCompliance: 95, queueStatus: "On Track"},
  { id: "wl5", user: "Devon Park", department: "Web Development", openTasks: 4, overdueTasks: 0, blockedTasks: 0, slaCompliance: 100, queueStatus: "Available"},
  { id: "wl6", user: "Riley Chen", department: "Reporting", openTasks: 11, overdueTasks: 2, blockedTasks: 0, slaCompliance: 82, queueStatus: "At Risk"},
  { id: "wl7", user: "Sam Nguyen", department: "Billing", openTasks: 5, overdueTasks: 0, blockedTasks: 0, slaCompliance: 100, queueStatus: "Available"},
  { id: "wl8", user: "Sarah Adams", department: "Account Management", openTasks: 9, overdueTasks: 2, blockedTasks: 1, slaCompliance: 76, queueStatus: "Overdue"},
  { id: "wl9", user: "Taylor Ross", department: "Sales", openTasks: 3, overdueTasks: 0, blockedTasks: 0, slaCompliance: 100, queueStatus: "Available"},
];

function workloadStatusBadge(s: string) {
  switch (s) {
    case "Available": return "bg-emerald-100 text-emerald-700";
    case "On Track": return "bg-blue-100 text-blue-700";
    case "At Risk": return "bg-amber-100 text-amber-700";
    case "Overdue": return "bg-red-100 text-red-700";
    default: return "bg-slate-100 text-slate-500";
  }
}

//  Time Tracking Mock Data 

interface TimeEntry {
  id: string;
  task: string;
  client: string;
  user: string;
  estimated: number;
  logged: number;
  billable: number;
  nonBillable: number;
  notes: string;
}

const TIME_TRACKING_DATA: TimeEntry[] = [
  { id: "tt1", task: "Keyword Research Report", client: "Apex Roofing", user: "Maya Torres", estimated: 4, logged: 2.5, billable: 2.5, nonBillable: 0, notes: "Ongoing — competitor gap still in progress"},
  { id: "tt2", task: "Meta Ads Creative Pack", client: "Pacific Dental", user: "Chris Blake", estimated: 3, logged: 3, billable: 2, nonBillable: 1, notes: "1h non-billable revision requested by client"},
  { id: "tt3", task: "Monthly Report — June", client: "Harbor Auto", user: "Riley Chen", estimated: 2, logged: 2, billable: 2, nonBillable: 0, notes: "Report completed and QA approved"},
  { id: "tt4", task: "Blog Post Drafts x3", client: "Summit Fitness", user: "Ava Kim", estimated: 5, logged: 4, billable: 3, nonBillable: 1, notes: "Revision round counted as non-billable"},
  { id: "tt5", task: "Website Homepage Copy", client: "Summit Fitness", user: "Devon Park", estimated: 6, logged: 1, billable: 1, nonBillable: 0, notes: "Waiting on client content before continuing"},
];

//  Automation Rules Mock Data 

interface AutomationRule {
  id: string;
  trigger: string;
  action: string;
  target: string;
  status: "Active"| "Paused"| "Draft";
  lastTriggered: string;
}

const AUTOMATION_RULES: AutomationRule[] = [
  { id: "ar1", trigger: "Payment confirmed", action: "Create onboarding project", target: "Account Management", status: "Active", lastTriggered: "2025-07-10"},
  { id: "ar2", trigger: "Service activated", action: "Generate department task package", target: "All Departments", status: "Active", lastTriggered: "2025-07-09"},
  { id: "ar3", trigger: "Task blocked", action: "Notify assigned AM", target: "Account Management", status: "Active", lastTriggered: "2025-07-11"},
  { id: "ar4", trigger: "Report approved by QA", action: "Mark report ready to send", target: "Reporting", status: "Active", lastTriggered: "2025-07-08"},
  { id: "ar5", trigger: "Client approval needed", action: "Create follow-up task", target: "Account Management", status: "Active", lastTriggered: "2025-07-07"},
  { id: "ar6", trigger: "Milestone overdue", action: "Escalate to department head", target: "All Departments", status: "Active", lastTriggered: "2025-07-06"},
  { id: "ar7", trigger: "Project completed", action: "Trigger renewal review task", target: "Account Management", status: "Active", lastTriggered: "2025-07-05"},
  { id: "ar8", trigger: "Intake form submitted", action: "Begin asset collection checklist", target: "Account Management", status: "Draft", lastTriggered: "—"},
  { id: "ar9", trigger: "Task overdue 3+ days", action: "Send overdue alert to owner", target: "All Departments", status: "Paused", lastTriggered: "2025-07-01"},
  { id: "ar10", trigger: "Department handoff note added", action: "Notify receiving department", target: "All Departments", status: "Active", lastTriggered: "2025-07-11"},
];

function automationStatusBadge(s: string) {
  switch (s) {
    case "Active": return "bg-emerald-100 text-emerald-700";
    case "Paused": return "bg-amber-100 text-amber-700";
    case "Draft": return "bg-slate-100 text-slate-500";
    default: return "bg-slate-100 text-slate-500";
  }
}

//  Project Workspace Section 

function ProjectWorkspaceSection() {
  const [projects, setProjects] = useState<Project[]>(PROJECT_WORKSPACE_DATA);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterOwner, setFilterOwner] = useState("All");

  const owners = [...new Set(PROJECT_WORKSPACE_DATA.map((p) => p.owner))];
  const filtered = projects.filter((p) => {
    if (filterStatus !== "All"&& p.status !== filterStatus) return false;
    if (filterOwner !== "All"&& p.owner !== filterOwner) return false;
    return true;
  });

  function updateProjectStatus(id: string, status: Project["status"]) {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"id="project-workspace">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-0.5">Project Workspace</p>
          <h2 className="text-lg font-bold text-slate-900">Project Workspace</h2>
          <p className="text-sm text-slate-500">Track all active client projects from launch to completion.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Statuses</option>
            {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Owners</option>
            {owners.map((o) => <option key={o}>{o}</option>)}
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">+ Create Project</button>
        </div>
      </div>
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-6 pt-4 pb-2">
        {PROJECT_STATUSES.map((s) => {
          const count = projects.filter((p) => p.status === s).length;
          return (
            <div key={s} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center">
              <p className="text-xs font-semibold text-slate-500 truncate">{s}</p>
              <p className={`text-xl font-bold mt-1 ${projectStatusBadge(s).split("")[1]}`}>{count}</p>
            </div>
          );
        })}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Project", "Client", "Services", "Project Owner", "Start Date", "Due Date", "Progress", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800 min-w-[160px]">{p.project}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.client}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.services.map((s) => (
                      <span key={s} className="inline-flex rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.owner}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.startDate}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.dueDate}</td>
                <td className="px-4 py-3 min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${p.progress === 100 ? "bg-emerald-500": p.progress >= 70 ? "bg-blue-500": p.progress >= 30 ? "bg-amber-500": "bg-slate-300"}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{p.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <select
                    value={p.status}
                    onChange={(e) => updateProjectStatus(p.id, e.target.value as Project["status"])}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-0 outline-none cursor-pointer ${projectStatusBadge(p.status)}`}
                  >
                    {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No projects match the filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">{filtered.length} of {projects.length} projects shown</p>
      </div>
    </section>
  );
}

//  Milestone Tracking Section 

function MilestoneTrackingSection() {
  const [milestones, setMilestones] = useState<Milestone[]>(MILESTONE_DATA);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterClient, setFilterClient] = useState("All");

  const clients = [...new Set(MILESTONE_DATA.map((m) => m.client))];
  const filtered = milestones.filter((m) => {
    if (filterStatus !== "All"&& m.status !== filterStatus) return false;
    if (filterClient !== "All"&& m.client !== filterClient) return false;
    return true;
  });

  function updateMilestoneStatus(id: string, status: Milestone["status"]) {
    setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"id="milestone-tracking">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-0.5">Milestone Tracking</p>
          <h2 className="text-lg font-bold text-slate-900">Milestone Tracking</h2>
          <p className="text-sm text-slate-500">Track key project milestones across all clients and services.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Clients</option>
            {clients.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Statuses</option>
            {["Not Started", "In Progress", "Complete", "Overdue", "Blocked"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">+ Create Milestone</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Milestone", "Client", "Owner", "Due Date", "Status", "Dependency", "Update"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className={`border-t border-slate-100 hover:bg-slate-50 ${m.status === "Overdue"? "bg-red-50/40": m.status === "Complete"? "bg-emerald-50/30": ""}`}>
                <td className="px-4 py-3 font-semibold text-slate-800">{m.milestone}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{m.client}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{m.owner}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{m.dueDate}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <select
                    value={m.status}
                    onChange={(e) => updateMilestoneStatus(m.id, e.target.value as Milestone["status"])}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-0 outline-none cursor-pointer ${milestoneStatusBadge(m.status)}`}
                  >
                    {["Not Started", "In Progress", "Complete", "Overdue", "Blocked"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{m.dependency}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button className="text-xs font-semibold text-indigo-600 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No milestones match the filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">{filtered.length} of {milestones.length} milestones shown</p>
      </div>
    </section>
  );
}

//  Task Board (Kanban) 

function TaskBoardSection() {
  const [tasks, setTasks] = useState<KanbanTask[]>(KANBAN_TASKS);
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);

  const depts = [...new Set(KANBAN_TASKS.map((t) => t.department))];
  const filtered = tasks.filter((t) => {
    if (filterPriority !== "All"&& t.priority !== filterPriority) return false;
    if (filterDept !== "All"&& t.department !== filterDept) return false;
    return true;
  });

  function moveTask(id: string, column: KanbanTask["column"]) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, column } : t));
    if (selectedTask?.id === id) setSelectedTask((prev) => prev ? { ...prev, column } : prev);
  }

  const kanbanColumnColors: Record<string, string> = {
    "Not Started": "border-slate-200 bg-slate-50",
    "In Progress": "border-blue-200 bg-blue-50",
    "Waiting For Client": "border-amber-200 bg-amber-50",
    "Waiting For Department": "border-orange-200 bg-orange-50",
    "Ready For Review": "border-violet-200 bg-violet-50",
    "Completed": "border-emerald-200 bg-emerald-50",
    "Blocked": "border-red-200 bg-red-50",
  };

  const kanbanHeaderColors: Record<string, string> = {
    "Not Started": "text-slate-600",
    "In Progress": "text-blue-700",
    "Waiting For Client": "text-amber-700",
    "Waiting For Department": "text-orange-700",
    "Ready For Review": "text-violet-700",
    "Completed": "text-emerald-700",
    "Blocked": "text-red-700",
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"id="task-board">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-0.5">Task Board</p>
          <h2 className="text-lg font-bold text-slate-900">Task Board</h2>
          <p className="text-sm text-slate-500">Kanban-style view of all tasks across departments and clients.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Priorities</option>
            {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
          </select>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Departments</option>
            {depts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">+ Add Task</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-3 p-4 min-w-max">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = filtered.filter((t) => t.column === col);
            return (
              <div key={col} className={`flex flex-col gap-2 rounded-xl border p-3 min-w-[220px] max-w-[240px] ${kanbanColumnColors[col]}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-xs font-bold uppercase tracking-widest ${kanbanHeaderColors[col]}`}>{col}</p>
                  <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${kanbanHeaderColors[col]} bg-white/70`}>{colTasks.length}</span>
                </div>
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                    className={`rounded-xl border bg-white p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow ${selectedTask?.id === task.id ? "ring-2 ring-indigo-400": ""}`}
                  >
                    <p className="text-xs font-bold text-slate-800 mb-1 leading-snug">{task.name}</p>
                    <p className="text-xs text-slate-500 mb-2">{task.client}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className={`inline-flex rounded-full px-1.5 py-0.5 text-xs font-semibold ${priorityBadge(task.priority)}`}>{task.priority}</span>
                      <span className="inline-flex rounded-full px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600">{task.department.split("")[0]}</span>
                    </div>
                    <p className="text-xs text-slate-400"> {task.owner}</p>
                    <p className="text-xs text-slate-400"> {task.dueDate}</p>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 p-3 text-center text-xs text-slate-400">No tasks</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Selected task move panel */}
      {selectedTask && (
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Move: {selectedTask.name}</p>
          <div className="flex flex-wrap gap-2">
            {KANBAN_COLUMNS.filter((c) => c !== selectedTask.column).map((col) => (
              <button
                key={col}
                onClick={() => moveTask(selectedTask.id, col)}
                className="text-xs font-semibold rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors">
                → {col}
              </button>
            ))}
            <button onClick={() => setSelectedTask(null)} className="text-xs font-semibold rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-slate-400 hover:bg-slate-100">Dismiss</button>
          </div>
        </div>
      )}
    </section>
  );
}

//  Task Detail Panel 

function TaskDetailSection() {
  const [task] = useState<TaskDetailData>(TASK_DETAIL_MOCK);
  const [commentFilter, setCommentFilter] = useState("All");
  const [newComment, setNewComment] = useState("");
  const [newCommentType, setNewCommentType] = useState<TaskDetailComment["type"]>("internal");
  const [comments, setComments] = useState<TaskDetailComment[]>(TASK_DETAIL_MOCK.comments);

  const commentTypes: TaskDetailComment["type"][] = ["internal", "handoff", "am_note", "activity", "status_change"];
  const filteredComments = commentFilter === "All"? comments : comments.filter((c) => c.type === commentFilter);

  function addComment() {
    if (!newComment.trim()) return;
    const comment: TaskDetailComment = {
      id: `c-${Date.now()}`,
      author: "Jordan Mills",
      date: new Date().toISOString().slice(0, 16).replace("T", ""),
      text: newComment.trim(),
      type: newCommentType,
    };
    setComments((prev) => [...prev, comment]);
    setNewComment("");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"id="task-detail">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-0.5">Task Detail</p>
        <h2 className="text-lg font-bold text-slate-900">Task Detail &amp; Comments</h2>
        <p className="text-sm text-slate-500">Deep view into a single task with full comment history.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Left: Task Info */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
            <h3 className="text-base font-bold text-slate-900">{task.name}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ["Client", task.client],
                ["Service", task.service],
                ["Department", task.department],
                ["Assigned User", task.assignedUser],
                ["Due Date", task.dueDate],
                ["Priority", task.priority],
                ["Status", task.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="font-bold uppercase tracking-widest text-slate-400">{label}</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{task.description}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Deliverables</p>
            <ul className="space-y-1">
              {task.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 text-emerald-500"></span>{d}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Dependencies</p>
              {task.dependencies.length > 0 ? (
                <ul className="space-y-1">
                  {task.dependencies.map((d) => (
                    <li key={d} className="text-xs text-slate-700 flex items-center gap-1"><span className="text-blue-400">↑</span>{d}</li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-400">None</p>}
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Blockers</p>
              {task.blockers.length > 0 ? (
                <ul className="space-y-1">
                  {task.blockers.map((b) => (
                    <li key={b} className="text-xs text-red-700 flex items-center gap-1"><span></span>{b}</li>
                  ))}
                </ul>
              ) : <p className="text-xs text-emerald-600 font-semibold">No blockers</p>}
            </div>
          </div>
        </div>
        {/* Right: Comments */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-700">Comments &amp; Activity</p>
            <select value={commentFilter} onChange={(e) => setCommentFilter(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1">
              <option value="All">All Types</option>
              {commentTypes.map((t) => <option key={t} value={t}>{commentTypeLabel(t)}</option>)}
            </select>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredComments.map((c) => (
              <div key={c.id} className={`rounded-xl border px-4 py-3 ${c.type === "activity"|| c.type === "status_change"? "border-slate-100 bg-slate-50": "border-slate-100 bg-white"}`}>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${commentTypeBadge(c.type)}`}>{commentTypeLabel(c.type)}</span>
                  <span className="text-xs font-semibold text-slate-600">{c.author}</span>
                  <span className="text-xs text-slate-400">{c.date}</span>
                </div>
                <p className="text-sm text-slate-700">{c.text}</p>
              </div>
            ))}
            {filteredComments.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No comments of this type.</p>
            )}
          </div>
          {/* Add Comment */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Add Comment</p>
            <select value={newCommentType} onChange={(e) => setNewCommentType(e.target.value as TaskDetailComment["type"])} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
              {commentTypes.filter((t) => t !== "activity"&& t !== "status_change").map((t) => (
                <option key={t} value={t}>{commentTypeLabel(t)}</option>
              ))}
            </select>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder="Add a comment, note, or handoff detail…"className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 resize-none"/>
            <button onClick={addComment} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">Post Comment</button>
          </div>
        </div>
      </div>
    </section>
  );
}

//  Approval Workflow Section 

function ApprovalWorkflowSection() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(APPROVAL_DATA);
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const approvalTypes = [...new Set(APPROVAL_DATA.map((a) => a.type))];
  const approvalStatuses = ["Not Required", "Pending", "Approved", "Rejected", "Revision Requested"];
  const filtered = approvals.filter((a) => {
    if (filterType !== "All"&& a.type !== filterType) return false;
    if (filterStatus !== "All"&& a.status !== filterStatus) return false;
    return true;
  });

  function updateApprovalStatus(id: string, status: ApprovalItem["status"]) {
    setApprovals((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"id="approval-workflow">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-0.5">Approval Workflow</p>
          <h2 className="text-lg font-bold text-slate-900">Approval Workflow</h2>
          <p className="text-sm text-slate-500">Track all pending, approved, and rejected approvals across tasks and clients.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Types</option>
            {approvalTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Statuses</option>
            {approvalStatuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">+ Request Approval</button>
        </div>
      </div>
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-6 pt-4 pb-2">
        {approvalStatuses.map((s) => {
          const count = approvals.filter((a) => a.status === s).length;
          return (
            <div key={s} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center">
              <p className="text-xs font-semibold text-slate-500 truncate">{s}</p>
              <p className={`text-xl font-bold mt-1 ${approvalStatusBadge(s).split("")[1]}`}>{count}</p>
            </div>
          );
        })}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Type", "Task", "Client", "Assigned To", "Requested", "Status", "Notes", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-xs font-semibold">{a.type}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800 min-w-[160px]">{a.task}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{a.client}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{a.assignedTo}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{a.requestedDate}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <select
                    value={a.status}
                    onChange={(e) => updateApprovalStatus(a.id, e.target.value as ApprovalItem["status"])}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-0 outline-none cursor-pointer ${approvalStatusBadge(a.status)}`}
                  >
                    {approvalStatuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px]">{a.notes}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button onClick={() => updateApprovalStatus(a.id, "Approved")} className="text-xs font-semibold text-emerald-600 hover:underline">Approve</button>
                    <button onClick={() => updateApprovalStatus(a.id, "Rejected")} className="text-xs font-semibold text-red-600 hover:underline">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No approvals match the filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">{filtered.length} of {approvals.length} approvals shown</p>
      </div>
    </section>
  );
}

//  Team Throughput Section 

function WorkloadManagementSection() {
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const depts = [...new Set(WORKLOAD_DATA.map((w) => w.department))];
  const filtered = WORKLOAD_DATA.filter((w) => {
    if (filterDept !== "All"&& w.department !== filterDept) return false;
    if (filterStatus !== "All"&& w.queueStatus !== filterStatus) return false;
    return true;
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"id="workload-management">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-0.5">Team Throughput</p>
          <h2 className="text-lg font-bold text-slate-900">Team Throughput &amp; SLA Status</h2>
          <p className="text-sm text-slate-500">Monitor open tasks, overdue tasks, and SLA compliance by team member.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Departments</option>
            {depts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Statuses</option>
            {["Available", "On Track", "At Risk", "Overdue"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 pt-4 pb-2">
        {["Available", "On Track", "At Risk", "Overdue"].map((s) => {
          const count = WORKLOAD_DATA.filter((w) => w.queueStatus === s).length;
          return (
            <div key={s} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center">
              <p className="text-xs font-semibold text-slate-500 truncate">{s}</p>
              <p className={`text-xl font-bold mt-1 ${workloadStatusBadge(s).split("")[1]}`}>{count}</p>
            </div>
          );
        })}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["User", "Department", "Open Tasks", "Overdue Tasks", "Blocked Tasks", "SLA Compliance", "Queue Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w.id} className={`border-t border-slate-100 hover:bg-slate-50 ${w.queueStatus === "Overdue"? "bg-red-50/30": ""}`}>
                <td className="px-4 py-3 font-semibold text-slate-800">{w.user}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{w.department}</td>
                <td className="px-4 py-3 text-center font-bold text-slate-700">{w.openTasks}</td>
                <td className="px-4 py-3 text-center font-bold">
                  <span className={w.overdueTasks > 0 ? "text-red-600": "text-slate-400"}>{w.overdueTasks}</span>
                </td>
                <td className="px-4 py-3 text-center font-bold">
                  <span className={w.blockedTasks > 0 ? "text-orange-600": "text-slate-400"}>{w.blockedTasks}</span>
                </td>
                <td className="px-4 py-3 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${w.slaCompliance < 75 ? "bg-red-500": w.slaCompliance < 85 ? "bg-amber-500": w.slaCompliance < 95 ? "bg-blue-500": "bg-emerald-500"}`}
                        style={{ width: `${w.slaCompliance}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{w.slaCompliance}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${workloadStatusBadge(w.queueStatus)}`}>{w.queueStatus}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No users match the filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">{filtered.length} of {WORKLOAD_DATA.length} users shown</p>
      </div>
    </section>
  );
}

//  Time Tracking Section 

function TimeTrackingSection() {
  const total = {
    estimated: TIME_TRACKING_DATA.reduce((s, t) => s + t.estimated, 0),
    logged: TIME_TRACKING_DATA.reduce((s, t) => s + t.logged, 0),
    billable: TIME_TRACKING_DATA.reduce((s, t) => s + t.billable, 0),
    nonBillable: TIME_TRACKING_DATA.reduce((s, t) => s + t.nonBillable, 0),
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"id="time-tracking">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-0.5">SLA Dashboard</p>
          <h2 className="text-lg font-bold text-slate-900">SLA Compliance Dashboard</h2>
          <p className="text-sm text-slate-500">Task completion times, SLA status, and response timestamps. No hours tracked.</p>
        </div>
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">View SLA Report</button>
      </div>
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 pt-4 pb-2">
        {[
          { label: "Total Tasks", value: TIME_TRACKING_DATA.length, color: "text-slate-700"},
          { label: "Completed", value: TIME_TRACKING_DATA.filter((t) => t.logged >= t.estimated).length, color: "text-blue-700"},
          { label: "On Time", value: TIME_TRACKING_DATA.filter((t) => t.billable > 0).length, color: "text-emerald-700"},
          { label: "Overdue", value: TIME_TRACKING_DATA.filter((t) => t.nonBillable > 0).length, color: "text-amber-700"},
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className={`text-xl font-bold mt-1 ${color}`}>{value}h</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Task", "Client", "User", "Estimated", "Logged", "Remaining", "Billable", "Non-Billable", "Notes"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_TRACKING_DATA.map((t) => {
              const remaining = Math.max(0, t.estimated - t.logged);
              return (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 min-w-[160px]">{t.task}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.user}</td>
                  <td className="px-4 py-3 text-center text-slate-700 font-semibold">{t.estimated}h</td>
                  <td className="px-4 py-3 text-center text-blue-700 font-semibold">{t.logged}h</td>
                  <td className="px-4 py-3 text-center font-semibold">
                    <span className={remaining > 0 ? "text-amber-700": "text-emerald-700"}>{remaining}h</span>
                  </td>
                  <td className="px-4 py-3 text-center text-emerald-700 font-semibold">{t.billable}h</td>
                  <td className="px-4 py-3 text-center text-amber-700 font-semibold">{t.nonBillable}h</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px]">{t.notes}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 border-t-2 border-slate-200">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Totals</td>
              <td className="px-4 py-3 text-center font-bold text-slate-700">{total.estimated}h</td>
              <td className="px-4 py-3 text-center font-bold text-blue-700">{total.logged}h</td>
              <td className="px-4 py-3 text-center font-bold text-amber-700">{(total.estimated - total.logged).toFixed(1)}h</td>
              <td className="px-4 py-3 text-center font-bold text-emerald-700">{total.billable}h</td>
              <td className="px-4 py-3 text-center font-bold text-amber-700">{total.nonBillable}h</td>
              <td className="px-4 py-3"/>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

//  Task Automation Rules Section 

function TaskAutomationRulesSection() {
  const [rules, setRules] = useState<AutomationRule[]>(AUTOMATION_RULES);
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = rules.filter((r) => filterStatus === "All"|| r.status === filterStatus);

  function toggleRule(id: string) {
    setRules((prev) => prev.map((r) =>
      r.id === id ? { ...r, status: r.status === "Active"? "Paused": "Active"} : r
    ));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"id="automation-rules">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-0.5">Automation</p>
          <h2 className="text-lg font-bold text-slate-900">Task Automation Rules</h2>
          <p className="text-sm text-slate-500">Mock automation rules that trigger task creation and notifications.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Statuses</option>
            {["Active", "Paused", "Draft"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">+ Add Rule</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Trigger", "Action", "Target", "Status", "Last Triggered", "Toggle"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className={`border-t border-slate-100 hover:bg-slate-50 ${r.status === "Paused"? "opacity-60": ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    
                    <span className="font-semibold text-slate-800">{r.trigger}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">→</span>
                    {r.action}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs font-medium">{r.target}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${automationStatusBadge(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.lastTriggered}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => toggleRule(r.id)}
                    className={`text-xs font-semibold rounded-lg px-3 py-1 transition-colors ${r.status === "Active"? "bg-red-100 text-red-700 hover:bg-red-200": "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                  >
                    {r.status === "Active"? "Pause": "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No rules match the filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">{filtered.length} of {rules.length} rules shown · Active: {rules.filter((r) => r.status === "Active").length}</p>
      </div>
    </section>
  );
}

//  Project Execution Action Center 

function ProjectExecutionActionCenter() {
  const actions = [
    { label: "Create Project", color: "bg-blue-600 hover:bg-blue-700"},
    { label: "Create Milestone", color: "bg-violet-600 hover:bg-violet-700", icon: ""},
    { label: "Add Task", color: "bg-emerald-600 hover:bg-emerald-700", icon: ""},
    { label: "Assign Task", color: "bg-indigo-600 hover:bg-indigo-700"},
    { label: "Move Task", color: "bg-teal-600 hover:bg-teal-700", icon: "↔"},
    { label: "Add Comment", color: "bg-slate-600 hover:bg-slate-700"},
    { label: "Request Approval", color: "bg-amber-600 hover:bg-amber-700"},
    { label: "Log Time", color: "bg-cyan-600 hover:bg-cyan-700", icon: "⏱"},
    { label: "Escalate Blocker", color: "bg-red-600 hover:bg-red-700"},
    { label: "Complete Project", color: "bg-emerald-700 hover:bg-emerald-800"},
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Action Center</p>
      <p className="text-sm text-slate-500 mb-4">Central controls for project execution, task management, and team coordination.</p>
      <div className="flex flex-wrap gap-3">
        {actions.map(({ label, color, icon }) => (
          <button key={label} className={`${color} rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors flex items-center gap-2 shadow-sm`}>
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

//  Project Execution View 

function ProjectExecutionView() {
  const [activeSection, setActiveSection] = useState("all");

  const sections = [
    { id: "all", label: "All"},
    { id: "projects", label: "Project Workspace"},
    { id: "milestones", label: "Milestone Tracking"},
    { id: "board", label: "Task Board"},
    { id: "detail", label: "Task Detail"},
    { id: "approvals", label: "Approval Workflow"},
    { id: "workload", label: "Team Throughput"},
    { id: "time", label: "SLA Dashboard"},
    { id: "automation", label: "Automation Rules"},
  ];

  const show = (id: string) => activeSection === "all"|| activeSection === id;

  return (
    <div className="space-y-8">
      {/* Section nav */}
      <div className="flex flex-wrap gap-1.5">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${activeSection === s.id ? "bg-indigo-600 text-white": "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Action Center always visible */}
      <ProjectExecutionActionCenter />

      {show("projects") && <ProjectWorkspaceSection />}
      {show("milestones") && <MilestoneTrackingSection />}
      {show("board") && <TaskBoardSection />}
      {show("detail") && <TaskDetailSection />}
      {show("approvals") && <ApprovalWorkflowSection />}
      {show("workload") && <WorkloadManagementSection />}
      {show("time") && <TimeTrackingSection />}
      {show("automation") && <TaskAutomationRulesSection />}
    </div>
  );
}

//  Teamwork Foundation View 

function TeamworkFoundationView() {
  return (
    <div className="space-y-8">
      {/* Action Center */}
      <TaskManagementActionCenter />

      {/* Task Template Library */}
      <TaskTemplateLibrary />

      {/* Project Template Library */}
      <ProjectTemplateLibrary />

      {/* Department Template Library */}
      <DepartmentTemplateLibrary />

      {/* Client Template Library */}
      <ClientTemplateLibrary />

      {/* Template Builder */}
      <TemplateBuilder />

      {/* Task Package Generator */}
      <TaskPackageGenerator />

      {/* Task Dependency Builder */}
      <TaskDependencyBuilder />
    </div>
  );
}

//  Page 

type PageTab = "tasks"| "execution"| "teamwork";

export default function TasksCentralPage() {
  const [role, setRole] = useState<AMRole>("head");
  const [tab, setTab] = useState<PageTab>("tasks");

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

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 w-fit flex-wrap">
        <button
          onClick={() => setTab("tasks")}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${tab === "tasks"? "bg-white shadow-sm text-slate-900": "text-slate-500 hover:text-slate-700"}`}
        >
          Task Board
        </button>
        <button
          onClick={() => setTab("execution")}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${tab === "execution"? "bg-white shadow-sm text-slate-900": "text-slate-500 hover:text-slate-700"}`}
        >
          Project Execution
        </button>
        <button
          onClick={() => setTab("teamwork")}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${tab === "teamwork"? "bg-white shadow-sm text-slate-900": "text-slate-500 hover:text-slate-700"}`}
        >
          Teamwork Foundation
        </button>
      </div>

      {tab === "tasks"? (
        <>
          {/* Role Toggle — Account Management Head View / Account Manager View */}
          <RoleToggle role={role} onRoleChange={setRole} />
          {/* Role content */}
          {role === "head"? <HeadView /> : <AMView />}
        </>
      ) : tab === "execution"? (
        <ProjectExecutionView />
      ) : (
        <TeamworkFoundationView />
      )}
    </div>
  );
}
