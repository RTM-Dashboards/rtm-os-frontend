"use client";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  filters?: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: FilterOption[];
  }[];
  placeholder?: string;
  resultCount?: number;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  filters = [],
  placeholder = "Search...",
  resultCount,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1 0 4.5 4.5a7.5 7.5 0 0 0 12.15 12.15z"
          />
        </svg>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Filters */}
      {filters.map((filter) => (
        <select
          key={filter.label}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
          aria-label={filter.label}
        >
          <option value="">{filter.label}: All</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {/* Result count */}
      {resultCount !== undefined && (
        <span className="text-xs text-slate-500 whitespace-nowrap sm:ml-auto">
          {resultCount} result{resultCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
