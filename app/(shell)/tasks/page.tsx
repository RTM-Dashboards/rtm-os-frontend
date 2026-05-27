"use client";

import { useState, useMemo } from "react";
import type { Task, Deliverable } from "@/lib/tasks/types";
import { MOCK_DELIVERABLES, ALL_TASKS } from "@/lib/tasks/mock-data";
import TaskKPIBar from "@/components/tasks/TaskKPIBar";
import TaskFilters, { type FilterState } from "@/components/tasks/TaskFilters";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import TaskTable from "@/components/tasks/TaskTable";
import DeliverableCard from "@/components/tasks/DeliverableCard";
import TaskDetailModal from "@/components/tasks/TaskDetailModal";

type ViewMode = "kanban" | "list" | "deliverables";

const VIEW_OPTIONS: { id: ViewMode; label: string; icon: string }[] = [
  { id: "kanban",       label: "Kanban",       icon: "▦" },
  { id: "list",         label: "List",         icon: "≡" },
  { id: "deliverables", label: "Deliverables", icon: "⊟" },
];

export default function TasksPage() {
  const [view, setView]               = useState<ViewMode>("kanban");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters]         = useState<FilterState>({
    search: "",
    status: "All",
    priority: "All",
    department: "All",
  });

  // Filtered flat task list
  const filteredTasks = useMemo(() => {
    return ALL_TASKS.filter((task) => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !task.description?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.status !== "All" && task.status !== filters.status) return false;
      if (filters.priority !== "All" && task.priority !== filters.priority) return false;
      if (filters.department !== "All" && task.department !== filters.department) return false;
      return true;
    });
  }, [filters]);

  // Filtered deliverables (only those with matching tasks)
  const filteredDeliverables: Deliverable[] = useMemo(() => {
    const filteredIds = new Set(filteredTasks.map((t) => t.id));
    return MOCK_DELIVERABLES.map((d) => ({
      ...d,
      tasks: d.tasks.filter((t) => filteredIds.has(t.id)),
    })).filter((d) => d.tasks.length > 0 || filters.search === "");
  }, [filteredTasks, filters.search]);

  // Find which deliverable owns a task
  function findDeliverable(task: Task): Deliverable | undefined {
    return MOCK_DELIVERABLES.find((d) => d.id === task.deliverableId);
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
            Deliverables & Tasks
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
            {MOCK_DELIVERABLES.length} deliverables · {ALL_TASKS.length} tasks across all departments
          </p>
        </div>

        {/* View toggle */}
        <div
          className="flex rounded-lg overflow-hidden border"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setView(opt.id)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors"
              style={
                view === opt.id
                  ? {
                      background: "var(--rtm-blue)",
                      color: "#ffffff",
                    }
                  : {
                      background: "var(--rtm-surface)",
                      color: "var(--rtm-text-secondary)",
                    }
              }
            >
              <span>{opt.icon}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI summary */}
      <TaskKPIBar tasks={ALL_TASKS} />

      {/* Filters */}
      <div className="rtm-card px-4 py-3">
        <TaskFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Result count */}
      {(filters.search || filters.status !== "All" || filters.priority !== "All" || filters.department !== "All") && (
        <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
          Showing <span className="font-bold" style={{ color: "var(--rtm-blue)" }}>{filteredTasks.length}</span> task{filteredTasks.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Views */}
      {view === "kanban" && (
        <KanbanBoard tasks={filteredTasks} onTaskClick={setSelectedTask} />
      )}

      {view === "list" && (
        <TaskTable tasks={filteredTasks} onTaskClick={setSelectedTask} />
      )}

      {view === "deliverables" && (
        <div className="flex flex-col gap-4">
          {filteredDeliverables.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 rounded-xl"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--rtm-text-muted)" }}>
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

      {/* Task detail modal */}
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
