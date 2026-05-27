"use client";

import type { TaskStatus, TaskPriority, Department } from "@/lib/tasks/types";

export interface FilterState {
  search: string;
  status: TaskStatus | "All";
  priority: TaskPriority | "All";
  department: Department | "All";
}

const STATUSES: (TaskStatus | "All")[] = ["All", "Pending", "In Progress", "In Review", "Blocked", "Done"];
const PRIORITIES: (TaskPriority | "All")[] = ["All", "Critical", "High", "Medium", "Low"];
const DEPARTMENTS: (Department | "All")[] = [
  "All",
  "Account Management",
  "Sales",
  "Billing",
  "Content",
  "Design",
  "SEO",
  "Meta Ads & PPC",
  "Reporting",
  "Local Service Ads",
  "IT & Security",
];

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  hideDepartmentFilter?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}

function FilterSelect({ value, onChange, options, label }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm rounded-lg px-3 py-2 font-medium border focus:outline-none focus:ring-2"
      style={{
        background: "var(--rtm-surface)",
        color: "var(--rtm-text-primary)",
        borderColor: "var(--rtm-border)",
        minWidth: "140px",
      }}
      aria-label={label}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export default function TaskFilters({ filters, onChange, hideDepartmentFilter }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "var(--rtm-text-muted)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search tasks…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full text-sm rounded-lg pl-9 pr-4 py-2 border focus:outline-none focus:ring-2"
          style={{
            background: "var(--rtm-surface)",
            color: "var(--rtm-text-primary)",
            borderColor: "var(--rtm-border)",
          }}
        />
      </div>

      <FilterSelect
        label="Status"
        value={filters.status}
        onChange={(v) => onChange({ ...filters, status: v as TaskStatus | "All" })}
        options={STATUSES}
      />
      <FilterSelect
        label="Priority"
        value={filters.priority}
        onChange={(v) => onChange({ ...filters, priority: v as TaskPriority | "All" })}
        options={PRIORITIES}
      />
      {!hideDepartmentFilter && (
        <FilterSelect
          label="Department"
          value={filters.department}
          onChange={(v) => onChange({ ...filters, department: v as Department | "All" })}
          options={DEPARTMENTS}
        />
      )}

      {/* Clear */}
      {(filters.search || filters.status !== "All" || filters.priority !== "All" || (!hideDepartmentFilter && filters.department !== "All")) && (
        <button
          onClick={() => onChange({ search: "", status: "All", priority: "All", department: "All" })}
          className="text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
          style={{ color: "var(--rtm-blue)", background: "var(--rtm-blue-xlight)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-blue-light)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-blue-xlight)")}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
