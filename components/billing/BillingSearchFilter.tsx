"use client";

interface FilterOption {
  value: string;
  label: string;
}

interface BillingSearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterPlaceholder?: string;
  searchPlaceholder?: string;
  resultCount?: number;
}

export default function BillingSearchFilter({
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder = "All",
  searchPlaceholder = "Search...",
  resultCount,
}: BillingSearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"style={{ color: "var(--rtm-text-muted)"}}
          fill="none"stroke="currentColor"viewBox="0 0 24 24">
          <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition"style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--rtm-blue)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--rtm-border)")}
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 transition-opacity hover:opacity-70"style={{ color: "var(--rtm-text-muted)"}}
            aria-label="Clear search">
            <svg className="w-3.5 h-3.5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
              <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Filter dropdown */}
      {filterOptions && onFilterChange && (
        <select
          value={filterValue ?? ""}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border cursor-pointer outline-none"style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-secondary)",
          }}
        >
          <option value="">{filterPlaceholder}</option>
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {/* Result count */}
      {resultCount !== undefined && (
        <span className="shrink-0 self-center text-xs whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>
          {resultCount} result{resultCount !== 1 ? "s": ""}
        </span>
      )}
    </div>
  );
}
