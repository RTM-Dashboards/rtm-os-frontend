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
import { NOTIFICATIONS } from "@/lib/notifications";

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
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// ── Icon: Bell ────────────────────────────────────────────────────
const IconBellSidebar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// ── Nav definition ────────────────────────────────────────────────
// Main navigation — clean, no duplicates.
// Departments with sub-sections expose nested links only.
// Task pages live inside each workspace, not here.
const navItems: NavItem[] = [
  // ── Overview & global ─────────────────────────────────────────
  { label: "Admin Overview",      href: "/admin",              icon: IconDashboard,    section: "overview" },
  { label: "Clients",             href: "/clients",            icon: IconUsers,        section: "overview" },
  {
    label: "Tasks",
    href: "/tasks",
    icon: IconCheckSquare,
    section: "overview",
    badge: "124",
    children: [
      { label: "Tasks",             href: "/tasks" },
      { label: "Templates",        href: "/tasks/templates" },
      { label: "Activation Rules", href: "/tasks/activation-rules" },
      { label: "Workload Planning", href: "/tasks/workload" },
    ],
  },
  { label: "Notifications",       href: "/notifications",      icon: IconBellSidebar,  section: "overview" },

  // ── Admin section ─────────────────────────────────────────────
  { label: "Users",               href: "/admin/users",        icon: IconUsers,        section: "admin" },
  { label: "Workspaces",          href: "/admin/workspaces",   icon: IconBuilding,     section: "admin" },
  { label: "Workflow Engine",     href: "/admin/workflows",    icon: IconCheckSquare,  section: "admin" },
  { label: "Admin Settings",      href: "/admin/settings",     icon: IconSettings,     section: "admin" },

  // ── Departments ───────────────────────────────────────────────
  { label: "Sales",               href: "/sales",              icon: IconTrending,  section: "departments", badge: "24" },
  { label: "Billing",             href: "/billing",            icon: IconCreditCard,section: "departments" },
  { label: "Account Management",  href: "/account-management", icon: IconBuilding,  section: "departments" },
  { label: "Content",             href: "/content",            icon: IconFile,      section: "departments" },
  {
    label: "Web Development & Design",
    href: "/web-development-design",
    icon: IconPalette,
    section: "departments",
    children: [
      { label: "Web Development", href: "/web-development-design/web-development" },
      { label: "Design",          href: "/web-development-design/design" },
    ],
  },
  {
    label: "SEO & Local",
    href: "/seo-local",
    icon: IconSearch,
    section: "departments",
    children: [
      { label: "SEO",  href: "/seo-local/seo" },
      { label: "GBP",  href: "/seo-local/gbp" },
      { label: "Yelp", href: "/seo-local/yelp" },
    ],
  },
  {
    label: "Paid Advertising",
    href: "/paid-advertising",
    icon: IconTarget,
    section: "departments",
    children: [
      { label: "Meta Ads",   href: "/paid-advertising/meta-ads" },
      { label: "Google Ads", href: "/paid-advertising/google-ads" },
    ],
  },
  { label: "Reporting",         href: "/reporting",          icon: IconBarChart,  section: "departments" },
  { label: "Local Service Ads", href: "/local-service-ads",  icon: IconStar,      section: "departments" },
  { label: "IT & Security",     href: "/it-security",        icon: IconShield,    section: "departments" },

  // ── Settings ──────────────────────────────────────────────────
  { label: "Settings",          href: "/settings",           icon: IconSettings,  section: "settings" },
];

const sectionLabels: Record<string, string> = {
  overview:    "",
  admin:       "Admin",
  departments: "Departments",
  settings:    "",
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Live notification badge count
  const notifUnread = NOTIFICATIONS.filter(
    (n) => n.status === "Unread" || n.status === "Escalated"
  ).length;
  const notifBadge = notifUnread >= 100 ? "99+" : notifUnread > 0 ? String(notifUnread) : undefined;

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => ({
    "/seo-local":                true,
    "/paid-advertising":         true,
    "/web-development-design":   true,
    "/tasks":                    true,
  }));

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const grouped = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const key = item.section ?? "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sectionOrder = ["overview", "admin", "departments", "settings"];

  const linkStyle = (isActive: boolean): React.CSSProperties =>
    isActive
      ? { background: "rgba(59,110,245,0.22)", color: "#ffffff", boxShadow: "inset 2px 0 0 #3B6EF5" }
      : { color: "var(--rtm-sidebar-text)" };

  const iconColor = (isActive: boolean) =>
    isActive ? "#7AABFF" : "rgba(200,213,238,0.7)";

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 backdrop-blur-sm lg:hidden"
          style={{ background: "rgba(14,32,85,0.55)" }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col w-[252px] flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:z-auto lg:inset-auto
        `}
        style={{
          background: "var(--rtm-sidebar-bg)",
          borderRight: "1px solid var(--rtm-sidebar-border)",
        }}
      >
        {/* ── Logo header ── */}
        <div
          className="flex items-center justify-between px-5 h-[68px] flex-shrink-0"
          style={{ borderBottom: "1px solid var(--rtm-sidebar-border)" }}
        >
          <Link
            href="/admin"
            className="flex items-center gap-2 py-1 focus:outline-none group"
            onClick={onClose}
          >
            <Image
              src="/rtm-logo.png"
              alt="Real Time Marketing"
              width={144}
              height={36}
              priority
              className="object-contain"
              style={{ filter: "brightness(1.1) saturate(0.9)" }}
            />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--rtm-sidebar-text)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Close sidebar"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          {sectionOrder.map((section) => {
            const items = grouped[section];
            if (!items?.length) return null;
            return (
              <div key={section} className={section === "departments" ? "pt-4" : ""}>
                {sectionLabels[section] && (
                  <p
                    className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "rgba(200,213,238,0.45)" }}
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
                      : item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);

                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        {hasChildren ? (
                          <div>
                            <button
                              onClick={() => toggleExpand(item.href)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                              style={linkStyle(isActive)}
                              onMouseEnter={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
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
                                className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center"
                                style={{ color: iconColor(isActive) }}
                              >
                                <Icon className="w-full h-full" />
                              </span>
                              <Link
                                href={item.href}
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="truncate flex-1 text-left hover:underline"
                              >
                                {item.label}
                              </Link>
                              <IconChevronDown
                                className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
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
                                        className="block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                        style={
                                          isChildActive
                                            ? { background: "rgba(59,110,245,0.22)", color: "#ffffff", boxShadow: "inset 2px 0 0 #3B6EF5" }
                                            : { color: "var(--rtm-sidebar-text)" }
                                        }
                                        onMouseEnter={(e) => {
                                          if (!isChildActive) {
                                            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
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
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                            style={linkStyle(isActive)}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
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
                              className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center"
                              style={{ color: iconColor(isActive) }}
                            >
                              <Icon className="w-full h-full" />
                            </span>
                            <span className="truncate flex-1">
                              {item.href === "/notifications" && notifBadge
                                ? `Notifications`
                                : item.label}
                            </span>
                            {/* Dynamic notifications badge */}
                            {item.href === "/notifications" && notifBadge ? (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                                style={{
                                  background: isActive ? "rgba(239,68,68,0.25)" : "rgba(220,38,38,0.75)",
                                  color:      isActive ? "#FECACA" : "#FFFFFF",
                                }}
                              >
                                {notifBadge}
                              </span>
                            ) : item.badge ? (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                                style={{
                                  background: isActive ? "rgba(122,171,255,0.25)" : "rgba(27,79,216,0.35)",
                                  color:      isActive ? "#BFDFFF" : "#93C5FD",
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
          className="px-3 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid var(--rtm-sidebar-border)" }}
        >
          <div
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow"
              style={{ background: "linear-gradient(135deg, #1B4FD8, #3B6EF5)" }}
            >
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-white">Admin</p>
              <p className="text-[11px] truncate" style={{ color: "rgba(200,213,238,0.55)" }}>
                admin@realtimemarketing.com
              </p>
            </div>
            <svg
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "rgba(200,213,238,0.4)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>
      </aside>
    </>
  );
}
