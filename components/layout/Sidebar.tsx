"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconDashboard,
  IconBuilding,
  IconTrending,
  IconCreditCard,
  IconFile,
  IconPalette,
  IconSearch,
  IconTarget,
  IconBarChart,
  IconStar,
  IconShield,
  IconSettings,
  IconX,
  IconUsers,
  IconCheckSquare,
} from "./icons";

// Executive Command Center icon
const IconCommand = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);
import { useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
  badge?: string;
  children?: { label: string; href: string }[];
}

// ── Icon helpers ──────────────────────────────────────────────────
const IconChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M19 9l-7 7-7-7"/>
  </svg>
);

// ── Icon: Bell ────────────────────────────────────────────────────
const IconBellSidebar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24"strokeWidth={2} strokeLinecap="round"strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

// ── Nav definition ────────────────────────────────────────────────
// Main navigation — clean, no duplicates.
// Departments with sub-sections expose nested links only.
// Task pages live inside each workspace, not here.
const navItems: NavItem[] = [
  // ── Overview & global ─────────────────────────────────────────
  { label: "Executive Command Center", href: "/executive", icon: IconCommand, section: "overview" },
  { label: "Admin Overview",      href: "/admin",              icon: IconDashboard,    section: "overview"},
  { label: "Clients",             href: "/clients",            icon: IconUsers,        section: "overview"},
  {
    label: "Projects & Tasks",
    href: "/projects",
    icon: IconCheckSquare,
    section: "overview",
    badge: "124",
    children: [
      { label: "Task Blueprints",        href: "/tasks/templates"},
      { label: "Activation Rules",      href: "/tasks/activation-rules"},
      { label: "Activation Engine",     href: "/tasks/activation-engine"},
      { label: "Department Activation", href: "/tasks/department-activation"},
      { label: "Workload Planning",     href: "/tasks/workload-planning"},
      { label: "Analytics",             href: "/tasks/analytics"},
      { label: "Collaboration Hub",       href: "/tasks/collaboration"},
    ],
  },
  { label: "Notifications",       href: "/notifications",      icon: IconBellSidebar,  section: "overview"},

  // ── Operations ─────────────────────────────────────────────────
  {
    label: "Operations",
    href: "/operations/workflows",
    icon: IconCheckSquare,
    section: "operations",
    children: [
      { label: "Workflow Engine",          href: "/admin/workflows"},
      { label: "Reporting & Intelligence", href: "/reporting"},
    ],
  },

  // ── Admin section ─────────────────────────────────────────────
  { label: "Users",               href: "/admin/users",        icon: IconUsers,        section: "admin"},
  { label: "Workspaces",          href: "/admin/workspaces",   icon: IconBuilding,     section: "admin"},
  { label: "Workflow Engine",         href: "/admin/workflows",            icon: IconCheckSquare,  section: "admin"},
  { label: "Platform Operations",    href: "/admin/platform-operations",  icon: IconShield,       section: "admin"},
  { label: "Admin Settings",          href: "/admin/settings",             icon: IconSettings,     section: "admin"},

  // ── Departments ───────────────────────────────────────────────
  { label: "Sales",               href: "/sales",              icon: IconTrending,  section: "departments", badge: "24"},
  { label: "Billing",             href: "/billing",            icon: IconCreditCard,section: "departments"},
  { label: "Account Management",  href: "/account-management", icon: IconBuilding,  section: "departments"},
  { label: "Content",             href: "/content",            icon: IconFile,      section: "departments"},
  {
    label: "Web Development & Design",
    href: "/web-development-design",
    icon: IconPalette,
    section: "departments",
    children: [
      { label: "Web Development", href: "/web-development-design/web-development"},
      { label: "Design",          href: "/web-development-design/design"},
      { label: "Reports",         href: "/web-development-design/reports"},
    ],
  },
  {
    label: "SEO & Local",
    href: "/seo-local",
    icon: IconSearch,
    section: "departments",
    children: [
      { label: "SEO",  href: "/seo-local/seo"},
      { label: "GBP",  href: "/seo-local/gbp"},
      { label: "Yelp", href: "/seo-local/yelp"},
    ],
  },
  {
    label: "Paid Advertising",
    href: "/paid-advertising",
    icon: IconTarget,
    section: "departments",
    children: [
      { label: "Meta Ads",   href: "/paid-advertising/meta-ads"},
      { label: "Google Ads", href: "/paid-advertising/google-ads"},
    ],
  },
  {
    label: "Reporting & Intelligence",
    href: "/reporting",
    icon: IconBarChart,
    section: "departments",
    children: [
      { label: "Reporting Dashboard",  href: "/reporting"},
      { label: "Report Automation",    href: "/reporting/automation"},
      { label: "Dashboard Builder",    href: "/reporting/dashboards"},
      { label: "Report Templates",     href: "/reporting/templates"},
      { label: "Generate Report",      href: "/reporting/generate"},
      { label: "Call Intelligence",    href: "/reporting/call-intelligence"},
    ],
  },
  { label: "Local Service Ads", href: "/local-service-ads",  icon: IconStar,      section: "departments"},
  { label: "IT & Security",     href: "/it-security",        icon: IconShield,    section: "departments"},

  // ── Settings ──────────────────────────────────────────────────
  // Settings child navigation is handled by the settings layout sidebar.
  // Keep only the top-level entry here.
  { label: "Settings", href: "/settings", icon: IconSettings, section: "settings" },
];

const sectionLabels: Record<string, string> = {
  overview:    "",
  operations:  "Operations",
  admin:       "Admin",
  departments: "Departments",
  settings:    "",
};

// ── Role-based visibility ────────────────────────────────────────────────────
//
// Items tagged with a visibleTo constraint are hidden unless the user's role
// satisfies it.  The check runs in visibleNavItems below, alongside the
// existing department-scoping logic.
//
//   "all"          — every authenticated user (shared operational / personal)
//   "adminOnly"    — Executive and SystemAdmin only
//   "decisionNeeded" — leave visible; owner must decide before restricting
//
// Items with no tag are handled by the existing department-scoping logic
// (departments section) or by the adminOnly rule on the admin section.
type NavVisibility = "all" | "adminOnly" | "decisionNeeded";

const NAV_VISIBILITY: Record<string, NavVisibility> = {
  // overview section
  "/executive":     "adminOnly",      // Executive Command Center
  "/admin":         "adminOnly",      // Admin Overview
  "/clients":       "decisionNeeded", // Clients — unclear if all staff need this; leave visible pending owner decision
  "/projects":      "all",            // Projects & Tasks — shared operational; all staff use tasks
  "/notifications": "all",            // Notifications — personal; every user has notifications

  // operations section (Workflow Engine / Reporting & Intelligence)
  // Classification uncertain; leave visible pending owner decision.
  "/operations/workflows": "decisionNeeded",

  // admin section — all items are administrative
  "/admin/users":                 "adminOnly",
  "/admin/workspaces":            "adminOnly",
  "/admin/workflows":             "adminOnly",
  "/admin/platform-operations":  "adminOnly",
  "/admin/settings":             "adminOnly",

  // settings section — personal settings page, visible to all
  "/settings": "all",

  // departments section — handled separately by department-scoping logic; no entry needed here
};

// ── Department → nav href mapping ─────────────────────────────────────────────
// Mirrors the "departments" section of navItems above. Used to compute which
// single workspace entry to show for non-Executive / non-SystemAdmin users.
// Executive and SystemAdmin see every entry; everyone else sees only theirs.
const DEPT_TO_HREF: Record<string, string> = {
  "Account Management":      "/account-management",
  "Sales":                    "/sales",
  "Billing":                  "/billing",
  "Content":                  "/content",
  "Web Development & Design": "/web-development-design",
  "SEO & Local":              "/seo-local",
  "Paid Advertising":         "/paid-advertising",
  "Reporting":                "/reporting",
  "Local Service Ads":        "/local-service-ads",
  "IT & Security":            "/it-security",
};

interface AuthUser {
  name: string;
  email: string;
  initial: string;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  user: AuthUser | null;
  /** Role from /api/me. Null while loading or on fetch error. */
  role: string | null;
  /** Department from /api/me. Null while loading, on error, or for unassigned users. */
  department: string | null;
}

export default function Sidebar({ open, onClose, user, role, department }: SidebarProps) {
  const pathname = usePathname();

  // ── Role gates ───────────────────────────────────────────────────────────
  // While role is still loading (null), show all — avoids flash of empty sidebar.
  // isFullAccess: sees everything (Executive + SystemAdmin + loading state).
  // isAdminOnly:  sees adminOnly items too.
  // Everyone else: sees "all" items + their own dept module only.
  const isFullAccess  = role === null || role === "Executive" || role === "SystemAdmin";
  const isAdminOnly   = isFullAccess; // same set: admins see admin items
  const ownDeptHref   = department ? (DEPT_TO_HREF[department] ?? null) : null;

  // Live notification badge — fetched from DB, not mock data
  const [notifUnread, setNotifUnread] = useState<number>(0);
  useEffect(() => {
    let mounted = true;
    async function fetchCount() {
      try {
        const res = await fetch("/api/notifications/count", { credentials: "include" });
        if (res.ok && mounted) {
          const data = await res.json() as { unread: number };
          setNotifUnread(data.unread ?? 0);
        }
      } catch { /* non-critical */ }
    }
    void fetchCount();
    const t = setInterval(() => { void fetchCount(); }, 60_000);
    return () => { mounted = false; clearInterval(t); };
  }, []);
  const notifBadge = notifUnread >= 100 ? "99+" : notifUnread > 0 ? String(notifUnread) : undefined;

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => ({
    "/seo-local":                true,
    "/paid-advertising":         true,
    "/web-development-design":   true,
    "/projects":                 true,
    "/reporting":                true,
    "/operations/workflows":     true,
  }));

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  // Build the visible item list.
  //
  // Two rules applied in sequence:
  //
  // 1. Role-based rule (applies to every section except "departments"):
  //    — "adminOnly" items: visible to Executive and SystemAdmin only
  //      (isAdminOnly / isFullAccess).  Hidden to everyone else.
  //    — "decisionNeeded" items: left visible for all users until the owner
  //      classifies them.  They appear in the "undecided" report section.
  //    — "all" items: always visible.
  //    — Untagged non-dept items: currently none; fall through as visible.
  //
  // 2. Department-scoping rule (departments section only):
  //    — Executive / SystemAdmin / loading: see all department modules.
  //    — Unassigned user (dept === null): show all; owner decides.
  //    — Everyone else: only the module matching their own department.
  const visibleNavItems = navItems.filter((item) => {
    // ─ Rule 1: role-based visibility for non-dept sections ─
    if (item.section !== "departments") {
      const vis = NAV_VISIBILITY[item.href];
      if (vis === "adminOnly") {
        // Visible only to Executive and SystemAdmin (and while loading).
        return isAdminOnly;
      }
      // "all", "decisionNeeded", or untagged: visible to everyone.
      return true;
    }

    // ─ Rule 2: department-scoping for the departments section ─
    if (isFullAccess) return true;          // Executive / SystemAdmin / loading
    if (ownDeptHref === null) return true;  // unassigned user — show all, owner decides
    return item.href === ownDeptHref;       // scoped: only their workspace
  });

  const grouped = visibleNavItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const key = item.section ?? "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sectionOrder = ["overview", "operations", "admin", "departments", "settings"];

  const linkStyle = (isActive: boolean): React.CSSProperties =>
    isActive
      ? { background: "var(--rtm-sidebar-active)", color: "#ffffff", boxShadow: "inset 2px 0 0 var(--rtm-blue-mid)"}
      : { color: "var(--rtm-sidebar-text)"};

  const iconColor = (isActive: boolean) =>
    isActive ? "#a8d4f0": "rgba(200,213,222,0.7)";

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 backdrop-blur-sm lg:hidden"style={{ background: "rgba(35,31,32,0.55)"}}
          onClick={onClose}
          aria-hidden="true"/>
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col w-[252px] flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0": "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:z-auto lg:inset-auto
        `}
        style={{
          background: "var(--rtm-sidebar-bg)",
          borderRight: "1px solid var(--rtm-sidebar-border)",
        }}
      >
        {/* ── Logo header ── */}
        <div
          className="flex items-center justify-between px-5 h-[68px] flex-shrink-0"style={{ borderBottom: "1px solid var(--rtm-sidebar-border)"}}
        >
          <Link
            href="/admin"className="flex items-center gap-2 py-1 focus:outline-none group"onClick={onClose}
          >
            <Image
              src="/rtm-logo.png" alt="Real Time Marketing" width={144}
              height={36}
              priority
              className="object-contain" style={{ filter: "brightness(1.1) saturate(0.9)", width: 144, height: "auto" }}
            />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg transition-colors"style={{ color: "var(--rtm-sidebar-text)"}}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Close sidebar">
            <IconX className="w-4 h-4"/>
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          {sectionOrder.map((section) => {
            const items = grouped[section];
            if (!items?.length) return null;
            return (
              <div key={section} className={section === "departments"? "pt-4": ""}>
                {sectionLabels[section] && (
                  <p
                    className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest"style={{ color: "rgba(200,213,238,0.45)"}}
                  >
                    {sectionLabels[section]}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded  = expandedItems[item.href] ?? false;

                    const isActive = hasChildren
                      ? pathname === item.href || pathname.startsWith(item.href + "/")
                      : item.href === "/admin"? pathname === "/admin": pathname.startsWith(item.href);

                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        {hasChildren ? (
                          <div>
                            <button
                              onClick={() => toggleExpand(item.href)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"style={linkStyle(isActive)}
                              onMouseEnter={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.background = "var(--rtm-sidebar-hover)";
                                  e.currentTarget.style.color = "#ffffff";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.background = "transparent";
                                  e.currentTarget.style.color = "var(--rtm-sidebar-text)";
                                }
                              }}
                            >
                              <span
                                className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center"style={{ color: iconColor(isActive) }}
                              >
                                <Icon className="w-full h-full"/>
                              </span>
                              <Link
                                href={item.href}
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="truncate flex-1 text-left hover:underline">
                                {item.label}
                              </Link>
                              <IconChevronDown
                                className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180": ""}`}
                              />
                            </button>

                            {isExpanded && (
                              <ul className="mt-0.5 ml-[30px] space-y-0.5 border-l border-white/10 pl-3">
                                {item.children!.map((child) => {
                                  const isChildActive = pathname === child.href || pathname.startsWith(child.href + "/");
                                  return (
                                    <li key={`${item.label}-${child.label}`}>
                                      <Link
                                        href={child.href}
                                        onClick={() => onClose()}
                                        className="block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150"style={
                                          isChildActive
                                            ? { background: "var(--rtm-sidebar-active)", color: "#ffffff", boxShadow: "inset 2px 0 0 var(--rtm-blue-mid)"}
                                            : { color: "var(--rtm-sidebar-text)"}
                                        }
                                        onMouseEnter={(e) => {
                                          if (!isChildActive) {
                                            e.currentTarget.style.background = "var(--rtm-sidebar-hover)";
                                            e.currentTarget.style.color = "#ffffff";
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isChildActive) {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.color = "var(--rtm-sidebar-text)";
                                          }
                                        }}
                                      >
                                        {child.label}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => onClose()}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"style={linkStyle(isActive)}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = "var(--rtm-sidebar-hover)";
                                e.currentTarget.style.color = "#ffffff";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "var(--rtm-sidebar-text)";
                              }
                            }}
                          >
                            <span
                              className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center"style={{ color: iconColor(isActive) }}
                            >
                              <Icon className="w-full h-full"/>
                            </span>
                            <span className="truncate flex-1">
                              {item.href === "/notifications"&& notifBadge
                                ? `Notifications`
                                : item.label}
                            </span>
                            {/* Dynamic notifications badge */}
                            {item.href === "/notifications"&& notifBadge ? (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"style={{
                                  background: isActive ? "rgba(239,68,68,0.25)" : "rgba(220,38,38,0.75)",
                                  color:      isActive ? "#FECACA": "#FFFFFF",
                                }}
                              >
                                {notifBadge}
                              </span>
                            ) : item.badge ? (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"style={{
                                  background: isActive ? "rgba(41,148,210,0.25)" : "rgba(29,112,159,0.35)",
                  color:      isActive ? "#a8d4f0" : "#7ab9d8",
                                }}
                              >
                                {item.badge}
                              </span>
                            ) : null}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* ── Footer / User ── */}
        <div
          className="px-3 py-4 flex-shrink-0"style={{ borderTop: "1px solid var(--rtm-sidebar-border)"}}
        >
          {user ? (
            <div
              className="flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-default transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow"
                style={{ background: "linear-gradient(135deg, var(--rtm-blue) 0%, var(--rtm-blue-mid) 100%)" }}
              >
                {user.initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-white">{user.name}</p>
                <p className="text-[11px] truncate" style={{ color: "rgba(200,213,238,0.55)" }}>
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            // Session absent: neutral state — no name, no email, no avatar initial.
            // Never fall back to displaying "Admin" or any hardcoded identity.
            <div
              className="flex items-center gap-3 px-2 py-2.5 rounded-lg"
            >
              <div
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <div className="min-w-0 flex-1">
                <div
                  className="h-3 w-24 rounded"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
                <div
                  className="h-2.5 w-32 rounded mt-1.5"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
