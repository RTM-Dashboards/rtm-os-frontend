// RTM OS — Sales Settings Breadcrumb / Back-link
// Shown at the top of every Sales-workspace-scoped config page.
// Provides "Sales › Settings › [Section]" context without replacing
// the page's own internal breadcrumb.

import Link from "next/link";

interface SalesSettingsBreadcrumbProps {
  /** The final crumb label, e.g. "Team and Access" */
  section: string;
}

export default function SalesSettingsBreadcrumb({
  section,
}: SalesSettingsBreadcrumbProps) {
  return (
    <div
      className="flex items-center justify-between mb-5 pb-4 border-b"
      style={{ borderColor: "var(--rtm-border)" }}
    >
      {/* Breadcrumb trail */}
      <nav
        className="flex items-center gap-1.5 text-xs"
        style={{ color: "var(--rtm-text-muted)" }}
      >
        <Link
          href="/sales"
          className="hover:underline"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Sales
        </Link>
        <span>›</span>
        <Link
          href="/sales/settings"
          className="hover:underline"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Settings
        </Link>
        <span>›</span>
        <span style={{ color: "var(--rtm-text-secondary)", fontWeight: 600 }}>
          {section}
        </span>
      </nav>

      {/* Back link */}
      <Link
        href="/sales/settings"
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
        style={{
          background: "var(--rtm-surface)",
          color: "var(--rtm-text-secondary)",
          borderColor: "var(--rtm-border)",
          textDecoration: "none",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 2L3.5 6L7.5 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Sales Settings
      </Link>
    </div>
  );
}
