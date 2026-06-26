"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// RTM OS — Settings Layout with Collapsible Category Navigation
// ─────────────────────────────────────────────────────────────────────────────

interface SettingsItem {
  label: string;
  href: string;
}

interface SettingsSection {
  label: string;
  items: SettingsItem[];
}

const SETTINGS_NAV: SettingsSection[] = [
  {
    label: "Organization",
    items: [
      { label: "Company Profile",     href: "/settings/organization" },
      { label: "Departments",         href: "/settings/departments" },
      { label: "Users",               href: "/settings/users" },
      { label: "Roles & Permissions", href: "/settings/roles" },
    ],
  },
  {
    label: "Platform Configuration",
    items: [
      { label: "Services",           href: "/settings/services" },
      { label: "Service Catalog",    href: "/settings/service-catalog" },
      { label: "Line Items",         href: "/settings/line-items" },
      { label: "Pricing Rules",      href: "/settings/pricing-rules" },
      { label: "Packages & Bundles", href: "/settings/packages" },
    ],
  },
  {
    label: "Forms & Templates",
    items: [
      { label: "Form Builder",        href: "/settings/form-builder" },
      { label: "Sales Intake Forms",  href: "/settings/sales-intake-forms" },
      { label: "Client Intake Forms", href: "/settings/client-intake-forms" },
      { label: "Audit Templates",     href: "/settings/audit-templates" },
      { label: "Proposal Templates",  href: "/settings/proposal-templates" },
      { label: "Contract Templates",  href: "/settings/contract-templates" },
      { label: "Report Templates",    href: "/settings/report-templates" },
    ],
  },
  {
    label: "Sales Configuration",
    items: [
      { label: "Intake Questions",         href: "/settings/intake-questions" },
      { label: "Audit Goal Configuration", href: "/settings/audit-goal-config" },
      { label: "Audit Conditions",         href: "/settings/audit-conditions" },
      { label: "Recommendation Rules",     href: "/settings/recommendation-rules" },
      { label: "Proposal Rules",           href: "/settings/proposal-rules" },
    ],
  },
  {
    label: "Workflow Configuration",
    items: [
      { label: "Workflow Templates", href: "/settings/workflow-templates" },
      { label: "Workflow Rules",     href: "/settings/workflow-rules" },
      { label: "Task Blueprints",    href: "/settings/task-blueprints" },
      { label: "Automation Rules",   href: "/settings/automation-rules" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "KPI Definitions",      href: "/settings/kpi-definitions" },
      { label: "Dashboard Builder",    href: "/settings/dashboard-builder" },
      { label: "Recommendation Rules", href: "/settings/intelligence-recommendation-rules" },
      { label: "Scoring Rules",        href: "/settings/scoring-rules" },
    ],
  },
  {
    label: "Notifications & Escalations",
    items: [
      { label: "Notification Rules", href: "/settings/notification-rules" },
      { label: "Escalation Rules",   href: "/settings/escalation-rules" },
    ],
  },
  {
    label: "Integrations",
    items: [
      { label: "Integration Hub",    href: "/settings/integrations" },
      { label: "Add Integration",    href: "/settings/integrations/add" },
      { label: "Provider Templates", href: "/settings/integrations/providers" },
      { label: "Webhooks",           href: "/settings/integrations/webhooks" },
      { label: "API Connections",    href: "/settings/integrations/api" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "System Health",       href: "/settings/system-health" },
      { label: "Logs",                href: "/settings/logs" },
      { label: "Configuration Audit", href: "/settings/config-audit" },
      { label: "Issue Monitor",       href: "/settings/issue-monitor" },
    ],
  },
];

// Chevron icon — inline to avoid extra imports
const ChevronIcon = ({
  open,
}: {
  open: boolean;
}) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.18s ease",
      flexShrink: 0,
    }}
  >
    <path
      d="M2 4l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function getSectionForPath(pathname: string): string | null {
  for (const section of SETTINGS_NAV) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(item.href + "/")) {
        return section.label;
      }
    }
  }
  return null;
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeSection = getSectionForPath(pathname);

  // Track which categories are open; active section starts open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of SETTINGS_NAV) {
      initial[section.label] = false;
    }
    if (activeSection) {
      initial[activeSection] = true;
    }
    return initial;
  });

  // Keep active section open when route changes (e.g. navigating via links on the page)
  useEffect(() => {
    const current = getSectionForPath(pathname);
    if (current) {
      setOpenSections((prev) => {
        if (prev[current]) return prev; // already open — no state churn
        return { ...prev, [current]: true };
      });
    }
  }, [pathname]);

  const toggle = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div
      className="-m-4 sm:-m-6 lg:-m-8 flex min-h-full"
    >
      {/* ── Settings Sidebar ──────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 overflow-y-auto"
        style={{
          width: "232px",
          background: "var(--rtm-surface)",
          borderRight: "1px solid var(--rtm-border)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--rtm-border)",
            flexShrink: 0,
          }}
        >
          <Link
            href="/settings"
            style={{
              display: "block",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--rtm-text-muted)",
              textDecoration: "none",
              marginBottom: "2px",
            }}
          >
            Configuration
          </Link>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--rtm-text-primary)",
            }}
          >
            Control Center
          </span>
        </div>

        {/* Category Nav */}
        <nav
          style={{
            flex: 1,
            padding: "12px 8px 24px",
            overflowY: "auto",
          }}
        >
          {SETTINGS_NAV.map((section) => {
            const isOpen = openSections[section.label] ?? false;
            const isSectionActive = activeSection === section.label;

            return (
              <div key={section.label} style={{ marginBottom: "2px" }}>
                {/* Category toggle button */}
                <button
                  onClick={() => toggle(section.label)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    background: "transparent",
                    textAlign: "left",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--rtm-bg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: isSectionActive
                        ? "var(--rtm-blue)"
                        : "var(--rtm-text-secondary)",
                      flex: 1,
                      lineHeight: "1.3",
                    }}
                  >
                    {section.label}
                  </span>
                  <span
                    style={{
                      color: isSectionActive
                        ? "var(--rtm-blue)"
                        : "var(--rtm-text-muted)",
                    }}
                  >
                    <ChevronIcon open={isOpen} />
                  </span>
                </button>

                {/* Collapsible item list */}
                {isOpen && (
                  <ul
                    style={{
                      listStyle: "none",
                      margin: "2px 0 4px",
                      padding: "0 0 0 10px",
                    }}
                  >
                    {section.items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/settings" &&
                          pathname.startsWith(item.href + "/"));

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            style={{
                              display: "block",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "12.5px",
                              fontWeight: isActive ? 600 : 400,
                              color: isActive
                                ? "var(--rtm-blue)"
                                : "var(--rtm-text-secondary)",
                              background: isActive
                                ? "var(--rtm-blue-xlight)"
                                : "transparent",
                              textDecoration: "none",
                              transition: "background 0.12s, color 0.12s",
                              lineHeight: "1.4",
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                (e.currentTarget as HTMLAnchorElement).style.background =
                                  "var(--rtm-bg)";
                                (e.currentTarget as HTMLAnchorElement).style.color =
                                  "var(--rtm-text-primary)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                (e.currentTarget as HTMLAnchorElement).style.background =
                                  "transparent";
                                (e.currentTarget as HTMLAnchorElement).style.color =
                                  "var(--rtm-text-secondary)";
                              }
                            }}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main
        className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8"
      >
        {children}
      </main>
    </div>
  );
}
