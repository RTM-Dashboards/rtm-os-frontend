"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconX } from "./icons";
import type { WorkspaceConfig, WorkspaceNavItem } from "@/types/workspace";

// ── Chevron icon ──────────────────────────────────────────────────────────────
const IconChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

interface WorkspaceSidebarProps {
  workspace: WorkspaceConfig;
  open: boolean;
  onClose: () => void;
}

// Corrected navItems for workspaces that have bad source data.
// Keyed by workspace slug; takes priority over workspace.navItems.
const WORKSPACE_NAV_OVERRIDES: Record<string, Array<{ label: string; href: string; icon?: string; badge?: string; children?: Array<{ label: string; href: string; icon?: string }> }>> = {
  sales: [
    { label: "Sales Dashboard", href: "/sales",              icon: "📊" },
    { label: "Leads",           href: "/sales/leads",        icon: "🎯" },
    { label: "Audits",          href: "/sales/audits",       icon: "🔎" },
    { label: "Pipeline",        href: "/sales/pipeline",     icon: "🔄" },
    { label: "Proposals",       href: "/sales/proposals",    icon: "📝" },
    { label: "Contracts",       href: "/sales/contracts",    icon: "✍️" },
    { label: "Follow Ups",      href: "/sales/followups",    icon: "📅" },
    { label: "Affiliates",      href: "/sales/affiliates",   icon: "🤝" },
    { label: "Team Members",    href: "/sales/team-members", icon: "👥" },
    { label: "Performance",     href: "/sales/performance",  icon: "📋" },
    { label: "Settings",        href: "/sales/settings",     icon: "⚙️" },
  ],
};

// Mock notification counts per workspace slug
const WORKSPACE_NOTIF_COUNTS: Record<string, number> = {
  "sales":                  12,
  "billing":                 4,
  "account-management":      8,
  "seo-local":               6,
  "paid-advertising":        3,
  "content":                 5,
  "reporting":               2,
  "local-service-ads":       7,
  "web-development-design":  9,
  "it-security":            11,
  "admin":                   1,
};

export default function WorkspaceSidebar({ workspace, open, onClose }: WorkspaceSidebarProps) {
  const pathname = usePathname();

  // Build deduplicated navItems: use override if present, otherwise dedup source items.
  // Deduplication guards against both same-href-and-label and same-href-only duplicates.
  const dedupedNavItems = (() => {
    const sourceItems = WORKSPACE_NAV_OVERRIDES[workspace.slug] ?? workspace.navItems;
    const seenHref  = new Set<string>();
    const seenLabel = new Set<string>();
    const items: WorkspaceNavItem[] = [];
    for (const item of sourceItems) {
      // Skip if exact href already used (prevents duplicate React keys / routes)
      if (seenHref.has(item.href)) continue;
      // Skip if label already used (prevents confusing dupes)
      if (seenLabel.has(item.label)) continue;
      seenHref.add(item.href);
      seenLabel.add(item.label);
      items.push(item);
    }
    // Inject Notifications after the first item
    const notifCount = WORKSPACE_NOTIF_COUNTS[workspace.slug] ?? 0;
    const notifItem: WorkspaceNavItem = {
      label: "Notifications",
      href: "/notifications",
      icon: "🔔",
      badge: notifCount > 0 ? String(notifCount) : undefined,
    };
    return items.length > 0
      ? [items[0], notifItem, ...items.slice(1)]
      : [notifItem, ...items];
  })();

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
    // Auto-expand the active parent
    const expanded: Record<string, boolean> = {};
    workspace.navItems.forEach((item) => {
      if (item.children && pathname.startsWith(item.href)) {
        expanded[item.href] = true;
      }
    });
    return expanded;
  });

  const toggleExpand = (href: string) =>
    setExpandedItems((prev) => ({ ...prev, [href]: !prev[href] }));

  const isActive = (href: string, exact = false): boolean =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const linkStyle = (active: boolean): React.CSSProperties =>
    active
      ? { background: "rgba(59,110,245,0.22)", color: "#ffffff", boxShadow: "inset 2px 0 0 #3B6EF5" }
      : { color: "var(--rtm-sidebar-text)" };

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
        {/* ── Logo / brand header ── */}
        <div
          className="flex items-center justify-between px-5 h-[68px] flex-shrink-0"
          style={{ borderBottom: "1px solid var(--rtm-sidebar-border)" }}
        >
          <Link
            href="/admin"
            className="flex items-center gap-2 py-1 focus:outline-none"
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
            aria-label="Close sidebar"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* ── Workspace header badge ── */}
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--rtm-sidebar-border)" }}
        >
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <span className="text-xl flex-shrink-0">{workspace.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{workspace.name}</p>
              <p className="text-[10px] truncate" style={{ color: "rgba(200,213,238,0.6)" }}>
                Workspace
              </p>
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Back to all workspaces */}
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 mb-3 rounded-lg text-xs font-semibold transition-all"
            style={{ color: "rgba(200,213,238,0.6)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(200,213,238,0.6)";
            }}
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ← Back to Admin
          </Link>

          <p
            className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "rgba(200,213,238,0.35)" }}
          >
            {workspace.name}
          </p>

          <ul className="space-y-0.5">
            {dedupedNavItems.map((item, idx) => {
              const hasChildren = item.children && item.children.length > 0;
              const expanded = expandedItems[item.href] ?? false;
              const active = hasChildren
                ? isActive(item.href)
                : pathname === item.href;

              return (
                <li key={`${item.href}--${item.label}--${idx}`}>
                  {hasChildren ? (
                    <div>
                      <button
                        onClick={() => toggleExpand(item.href)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                        style={linkStyle(active)}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                            e.currentTarget.style.color = "#ffffff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--rtm-sidebar-text)";
                          }
                        }}
                      >
                        {item.icon && (
                          <span className="text-base flex-shrink-0 w-5 text-center leading-none">
                            {item.icon}
                          </span>
                        )}
                        <Link
                          href={item.href}
                          onClick={(e) => { e.stopPropagation(); onClose(); }}
                          className="truncate flex-1 text-left"
                        >
                          {item.label}
                        </Link>
                        <IconChevronDown
                          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      {expanded && (
                        <ul className="mt-0.5 ml-[30px] space-y-0.5 border-l border-white/10 pl-3">
                          {item.children!.map((child: WorkspaceNavItem["children"] extends Array<infer C> | undefined ? NonNullable<WorkspaceNavItem["children"]>[number] : never, cidx: number) => {
                            const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                            return (
                              <li key={`${child.href}--${child.label}--${cidx}`}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className="block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                  style={
                                    childActive
                                      ? { background: "rgba(59,110,245,0.22)", color: "#ffffff", boxShadow: "inset 2px 0 0 #3B6EF5" }
                                      : { color: "var(--rtm-sidebar-text)" }
                                  }
                                  onMouseEnter={(e) => {
                                    if (!childActive) {
                                      e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                                      e.currentTarget.style.color = "#ffffff";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!childActive) {
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
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                      style={linkStyle(active)}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                          e.currentTarget.style.color = "#ffffff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--rtm-sidebar-text)";
                        }
                      }}
                    >
                      {item.icon && (
                        <span className="text-base flex-shrink-0 w-5 text-center leading-none">
                          {item.icon}
                        </span>
                      )}
                      <span className="truncate flex-1">{item.label}</span>
                      {item.badge && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                          style={{
                            background: active ? "rgba(122,171,255,0.25)" : "rgba(27,79,216,0.35)",
                            color:      active ? "#BFDFFF" : "#93C5FD",
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Footer ── */}
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
                {workspace.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
