"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  IconClipboard,
} from "./icons";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Overview",          href: "/dashboard",          icon: IconDashboard, section: "overview" },
  { label: "Clients",           href: "/clients",            icon: IconUsers,     section: "clients" },
  { label: "Account Management",href: "/account-management", icon: IconBuilding,  section: "departments" },
  { label: "Sales",             href: "/sales",              icon: IconTrending,  section: "departments", badge: "24" },
  { label: "Billing",           href: "/billing",            icon: IconCreditCard,section: "departments" },
  { label: "Content",           href: "/content",            icon: IconFile,      section: "departments" },
  { label: "Design",            href: "/design",             icon: IconPalette,   section: "departments" },
  { label: "SEO / GBP / Yelp",  href: "/seo",                icon: IconSearch,    section: "departments" },
  { label: "Meta Ads & PPC",    href: "/meta-ads",           icon: IconTarget,    section: "departments" },
  { label: "Reporting",         href: "/reporting",          icon: IconBarChart,  section: "departments" },
  { label: "Local Service Ads", href: "/lsa-reviews",        icon: IconStar,      section: "departments" },
  { label: "IT & Security",     href: "/it-security",        icon: IconShield,    section: "departments" },
  { label: "Tasks",             href: "/tasks",              icon: IconClipboard, section: "departments" },
  { label: "Settings",          href: "/settings",           icon: IconSettings,  section: "settings" },
];

const sectionLabels: Record<string, string> = {
  overview:    "",
  clients:     "",
  departments: "Departments",
  settings:    "",
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const grouped = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const key = item.section ?? "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sectionOrder = ["overview", "clients", "departments", "settings"];

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
            href="/dashboard"
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
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => onClose()}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                            transition-all duration-150 group
                          `}
                          style={
                            isActive
                              ? {
                                  background: "rgba(59,110,245,0.22)",
                                  color: "#ffffff",
                                  boxShadow: "inset 2px 0 0 #3B6EF5",
                                }
                              : {
                                  color: "var(--rtm-sidebar-text)",
                                }
                          }
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
                            style={{ color: isActive ? "#7AABFF" : "rgba(200,213,238,0.7)" }}
                          >
                            <Icon className="w-full h-full" />
                          </span>
                          <span className="truncate flex-1">{item.label}</span>
                          {item.badge && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                              style={{
                                background: isActive ? "rgba(122,171,255,0.25)" : "rgba(27,79,216,0.35)",
                                color: isActive ? "#BFDFFF" : "#93C5FD",
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
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
