"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconX, IconChevronDown } from "./icons";
import type { WorkspaceConfig, WorkspaceNavItem } from "@/types/workspace";

interface WorkspaceSidebarProps {
  workspace: WorkspaceConfig;
  open: boolean;
  onClose: () => void;
}

// ── Inline SVG nav icons (keyed by semantic name) ─────────────────────────────
// Used to replace emoji icons in workspace nav items.

const NavIcon = ({ name, className = "w-4 h-4" }: { name?: string; className?: string }) => {
  switch (name) {
    case "dashboard":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
        </svg>
      );
    case "tasks":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case "clients":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "performance":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "reports":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "queue":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      );
    case "invoices":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
      );
    case "revenue":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "collections":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case "leads":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "pipeline":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case "proposals":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    case "settings":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "team":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case "health":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case "security":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "systems":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
        </svg>
      );
    case "data":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm0 5h16" />
        </svg>
      );
    case "calls":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      );
    case "affiliates":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case "ai":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case "notifications":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
    case "chevron-left":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      );
    default:
      // Generic circle dot for unmapped icons
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" strokeWidth={1.75} />
        </svg>
      );
  }
};

// ── Map legacy emoji icon strings to semantic names ────────────────────────────
function resolveIconName(label: string, iconStr?: string): string {
  // First try to infer from label
  const l = label.toLowerCase();
  if (l.includes("dashboard") || l.includes("overview")) return "dashboard";
  if (l.includes("task") || l.includes("deliverable")) return "tasks";
  if (l.includes("client") || l.includes("portfolio")) return "clients";
  if (l.includes("performance") || l.includes("metric")) return "performance";
  if (l.includes("report")) return "reports";
  if (l.includes("queue") || l.includes("work queue")) return "queue";
  if (l.includes("invoice") || l.includes("billing")) return "invoices";
  if (l.includes("revenue") || l.includes("recurring")) return "revenue";
  if (l.includes("collection")) return "collections";
  if (l.includes("lead")) return "leads";
  if (l.includes("pipeline")) return "pipeline";
  if (l.includes("proposal")) return "proposals";
  if (l.includes("setting")) return "settings";
  if (l.includes("team") || l.includes("member") || l.includes("role")) return "team";
  if (l.includes("health")) return "health";
  if (l.includes("security")) return "security";
  if (l.includes("system")) return "systems";
  if (l.includes("data source") || l.includes("integration")) return "data";
  if (l.includes("call")) return "calls";
  if (l.includes("affiliate")) return "affiliates";
  if (l.includes("ai") || l.includes("automation") || l.includes("intelligence")) return "ai";
  if (l.includes("notification")) return "notifications";
  // fallback
  return "default";
}

// ── Workspace nav overrides (clean, no emoji, no duplicates) ──────────────────
const WORKSPACE_NAV_OVERRIDES: Record<string, WorkspaceNavItem[]> = {
  sales: [
    { label: "Dashboard",       href: "/sales" },
    { label: "Leads",           href: "/sales/leads" },
    { label: "Audits",          href: "/sales/audits" },
    { label: "Pipeline",        href: "/sales/pipeline" },
    { label: "Proposals",       href: "/sales/proposals" },
    { label: "Follow Ups",      href: "/sales/followups" },
    { label: "Affiliates",      href: "/sales/affiliates" },
    { label: "Handoffs",        href: "/sales/handoffs" },
    { label: "Recommendations", href: "/sales/recommendations" },
    { label: "Tasks",           href: "/sales/tasks" },
    { label: "Performance",     href: "/sales/performance" },
    { label: "Team Members",    href: "/sales/team-members" },
    { label: "Settings",        href: "/sales/settings" },
  ],
  billing: [
    { label: "Dashboard",        href: "/billing" },
    { label: "Invoices",         href: "/billing/invoices" },
    { label: "Recurring Revenue",href: "/billing/recurring-revenue" },
    { label: "Revenue",          href: "/billing/revenue" },
    { label: "Collections",      href: "/billing/collections" },
    { label: "Activation Queue", href: "/billing/activation-queue" },
    { label: "Active Services",  href: "/billing/active-services" },
    { label: "Client Portfolio", href: "/billing/client-portfolio" },
    { label: "Cancellations",    href: "/billing/cancellations" },
    { label: "Activation",       href: "/billing/activation" },
    { label: "Offboarding",      href: "/billing/offboarding" },
    { label: "Tasks",            href: "/billing/tasks" },
    { label: "Team Members",     href: "/billing/team-members" },
    { label: "Settings",         href: "/billing/settings" },
  ],
};

export default function WorkspaceSidebar({ workspace, open, onClose }: WorkspaceSidebarProps) {
  const pathname = usePathname();

  // Build deduplicated navItems: use override if present, otherwise dedup source items.
  const dedupedNavItems = (() => {
    const sourceItems = WORKSPACE_NAV_OVERRIDES[workspace.slug] ?? workspace.navItems;
    const seenHref  = new Set<string>();
    const seenLabel = new Set<string>();
    const items: WorkspaceNavItem[] = [];
    for (const item of sourceItems) {
      if (seenHref.has(item.href)) continue;
      if (seenLabel.has(item.label)) continue;
      seenHref.add(item.href);
      seenLabel.add(item.label);
      items.push(item);
    }
    return items;
  })();

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
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
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: workspace.accentColor, color: "#fff" }}
            >
              <NavIcon name="dashboard" className="w-3.5 h-3.5" />
            </div>
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
            className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg text-xs font-semibold transition-all"
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
            <NavIcon name="chevron-left" className="w-3.5 h-3.5 flex-shrink-0" />
            Back to Admin
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
              const iconName = resolveIconName(item.label, item.icon);

              return (
                <li key={`${item.href}--${idx}`}>
                  {hasChildren ? (
                    <div>
                      <button
                        onClick={() => toggleExpand(item.href)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
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
                        <NavIcon name={iconName} className="w-4 h-4 flex-shrink-0 opacity-70" />
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
                          {item.children!.map((child, cidx) => {
                            const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                            return (
                              <li key={`${child.href}--${cidx}`}>
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
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
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
                      <NavIcon name={iconName} className="w-4 h-4 flex-shrink-0 opacity-70" />
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
