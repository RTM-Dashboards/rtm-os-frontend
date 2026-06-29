"use client";

import { useState } from "react";
import type { GeneratedTask } from "@/lib/sales/blueprint-config";
import { BlueprintTaskTable } from "./BlueprintTaskTable";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlueprintServiceCardProps {
  serviceId: string;
  serviceName: string;
  department: string;
  tasks: GeneratedTask[];
  assignments: Record<string, string>;
  onAssign: (taskId: string, assignedTo: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlueprintServiceCard({
  serviceName,
  department,
  tasks,
  assignments,
  onAssign,
}: BlueprintServiceCardProps) {
  const [expanded, setExpanded] = useState(true);

  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const criticalCount = tasks.filter((t) => t.priority === "critical").length;
  const assignedCount = tasks.filter(
    (t) => assignments[t.id] || t.assignedTo
  ).length;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--rtm-surface)",
        border: "1px solid var(--rtm-border)",
      }}
    >
      {/* Card Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
        style={{ borderBottom: expanded ? "1px solid var(--rtm-border)" : undefined }}
      >
        {/* Left: service info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span
                className="font-bold text-base"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {serviceName}
              </span>
              {/* Department badge */}
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{
                  background: "var(--rtm-blue-xlight)",
                  color: "var(--rtm-blue)",
                  border: "1px solid #BFDBFE",
                }}
              >
                {department}
              </span>
              {criticalCount > 0 && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{
                    background: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                  }}
                >
                  {criticalCount} critical
                </span>
              )}
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {assignedCount} of {tasks.length} tasks assigned
            </div>
          </div>
        </div>

        {/* Right: stats + chevron */}
        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <div
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Tasks
            </div>
            <div
              className="text-xl font-black"
              style={{ color: "var(--rtm-blue)" }}
            >
              {tasks.length}
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Est. Hours
            </div>
            <div
              className="text-xl font-black"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {totalHours}h
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{
              color: "var(--rtm-text-muted)",
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Task Table */}
      {expanded && (
        <BlueprintTaskTable
          tasks={tasks}
          assignments={assignments}
          onAssign={onAssign}
        />
      )}
    </div>
  );
}
