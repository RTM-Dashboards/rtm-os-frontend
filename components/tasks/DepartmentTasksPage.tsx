"use client";

import { useState, useMemo } from "react";
import type { Task, Deliverable, Department } from "@/lib/tasks/types";
import { MOCK_DELIVERABLES, ALL_TASKS } from "@/lib/tasks/mock-data";
import TaskKPIBar from "@/components/tasks/TaskKPIBar";
import TaskFilters, { type FilterState } from "@/components/tasks/TaskFilters";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import TaskTable from "@/components/tasks/TaskTable";
import DeliverableCard from "@/components/tasks/DeliverableCard";
import TaskDetailModal from "@/components/tasks/TaskDetailModal";

type ViewMode = "kanban"| "list"| "deliverables";

const VIEW_OPTIONS: { id: ViewMode; label: string; icon: string }[] = [
  { id: "kanban",       label: "Kanban",       icon: "▦"},
  { id: "list",         label: "List",         icon: "≡"},
  { id: "deliverables", label: "Deliverables", icon: "⊟"},
];

interface DepartmentTasksPageProps {
  department: Department | Department[];
  title?: string;
  description?: string;
}

export default function DepartmentTasksPage({
  department,
  title,
  description,
}: DepartmentTasksPageProps) {
  const [view, setView]                 = useState<ViewMode>("kanban");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters]           = useState<FilterState>({
    search:     "",
    status:     "All",
    priority:   "All",
    department: "All",
  });

  const departments = Array.isArray(department) ? department : [department];

  // Pre-filter to this department's tasks
  const deptTasks = useMemo(
    () => ALL_TASKS.filter((t) => departments.includes(t.department)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [department]
  );

  const filteredTasks = useMemo(() => {
    return deptTasks.filter((task) => {
      if (
        filters.search &&
        !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !task.description?.toLowerCase().includes(filters.search.toLowerCase())
      ) return false;
      if (filters.status   !== "All"&& task.status   !== filters.status)   return false;
      if (filters.priority !== "All"&& task.priority !== filters.priority) return false;
      return true;
    });
  }, [deptTasks, filters]);

  const filteredDeliverables: Deliverable[] = useMemo(() => {
    const filteredIds = new Set(filteredTasks.map((t) => t.id));
    return MOCK_DELIVERABLES.filter((d) => departments.includes(d.department))
      .map((d) => ({
        ...d,
        tasks: d.tasks.filter((t) => filteredIds.has(t.id)),
      }))
      .filter((d) => d.tasks.length > 0 || filters.search === "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTasks, filters.search, department]);

  function findDeliverable(task: Task): Deliverable | undefined {
    return MOCK_DELIVERABLES.find((d) => d.id === task.deliverableId);
  }

  const pageTitle       = title       ?? `${departments[0]} Tasks`;
  const pageDescription = description ?? `${filteredDeliverables.length} deliverables · ${deptTasks.length} tasks`;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>
            {pageTitle}
          </h1>
          <p className="text-sm mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>
            {pageDescription}
          </p>
        </div>

        {/* View toggle */}
        <div
          className="flex rounded-lg overflow-hidden border"style={{ borderColor: "var(--rtm-border)"}}
        >
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setView(opt.id)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors"style={
                view === opt.id
                  ? { background: "var(--rtm-blue)", color: "#ffffff"}
                  : { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)"}
              }
            >
              <span>{opt.icon}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <TaskKPIBar tasks={deptTasks} />

      <div className="rtm-card px-4 py-3">
        <TaskFilters
          filters={filters}
          onChange={setFilters}
          hideDepartmentFilter
        />
      </div>

      {(filters.search || filters.status !== "All"|| filters.priority !== "All") && (
        <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>
          Showing{""}
          <span className="font-bold"style={{ color: "var(--rtm-blue)"}}>
            {filteredTasks.length}
          </span>{""}
          task{filteredTasks.length !== 1 ? "s": ""}
        </p>
      )}

      {view === "kanban"&& (
        <KanbanBoard tasks={filteredTasks} onTaskClick={setSelectedTask} />
      )}
      {view === "list"&& (
        <TaskTable tasks={filteredTasks} onTaskClick={setSelectedTask} />
      )}
      {view === "deliverables"&& (
        <div className="flex flex-col gap-4">
          {filteredDeliverables.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 rounded-xl"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
            >
              <p className="text-sm font-medium"style={{ color: "var(--rtm-text-muted)"}}>
                No deliverables match your filters
              </p>
            </div>
          ) : (
            filteredDeliverables.map((d) => (
              <DeliverableCard key={d.id} deliverable={d} onTaskClick={setSelectedTask} />
            ))
          )}
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          deliverable={findDeliverable(selectedTask)}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
