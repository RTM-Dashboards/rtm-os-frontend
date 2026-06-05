"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconMenu, IconBell, IconSearch } from "./icons";

const routeLabels: Record<string, { title: string; sub: string }> = {
  "/admin":              { title: "Overview",             sub: "All departments at a glance" },
  "/dashboard":          { title: "Overview",             sub: "All departments at a glance" },
  "/account-management": { title: "Account Management",   sub: "Client portfolio & health tracking" },
  "/sales":              { title: "Sales",                sub: "Pipeline, leads & new business" },
  "/billing":            { title: "Billing",              sub: "Revenue, invoices & subscriptions" },
  "/content":            { title: "Content",              sub: "Blog, social & email production" },
  "/design":             { title: "Design",               sub: "Creative assets & brand requests" },
  "/seo-local":          { title: "SEO & Local",          sub: "Search rankings, GBP & Yelp" },
  "/paid-advertising":   { title: "Paid Advertising",     sub: "Meta Ads & Google Ads" },
  "/web-development-design": { title: "Web Dev & Design",  sub: "Websites, redesigns & creative" },
  "/local-service-ads":  { title: "Local Service Ads",    sub: "LSA setup, reviews & budgets" },
  "/seo":                { title: "SEO / GBP / Yelp",     sub: "Search, maps & local listings" },
  "/meta-ads":           { title: "Meta Ads & PPC",       sub: "Paid social & search campaigns" },
  "/reporting":          { title: "Reporting",            sub: "Client reports & performance analytics" },
  "/lsa-reviews":        { title: "Local Service Ads",    sub: "LSA management & review tracking" },
  "/it-security":        { title: "IT & Security",        sub: "Infrastructure, access & monitoring" },
  "/settings":           { title: "Settings",             sub: "Platform configuration & preferences" },
  "/clients":            { title: "Clients",              sub: "Client accounts & portfolios" },
};

interface TopNavProps {
  onMenuClick: () => void;
}

const WORKSPACE_SLUGS = [
  "account-management",
  "sales",
  "billing",
  "content",
  "web-development-design",
  "seo-local",
  "paid-advertising",
  "reporting",
  "local-service-ads",
  "it-security",
] as const;

function detectWorkspace(pathname: string): string | null {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  for (const slug of WORKSPACE_SLUGS) {
    if (pathname === "/" + slug || pathname.startsWith("/" + slug + "/")) return slug;
  }
  return null;
}

function getAvatarLinks(pathname: string): { label: string; href: string }[] {
  const ws = detectWorkspace(pathname);
  if (ws === "admin") {
    return [
      { label: "My Profile",         href: "/admin/profile" },
      { label: "Team Members",        href: "/admin/users" },
      { label: "Roles & Permissions", href: "/admin/users" },
      { label: "Workspace Settings",  href: "/admin/settings" },
    ];
  }
  if (ws) {
    return [
      { label: "My Profile",         href: `/${ws}/profile` },
      { label: "Team Members",        href: `/${ws}/team-members` },
      { label: "Roles & Permissions", href: `/${ws}/roles` },
      { label: "Workspace Settings",  href: `/${ws}/settings` },
    ];
  }
  // Fallback — no recognised workspace
  return [
    { label: "My Profile",         href: "/account-management/profile" },
    { label: "Team Members",        href: "/account-management/team-members" },
    { label: "Roles & Permissions", href: "/account-management/roles" },
    { label: "Workspace Settings",  href: "/account-management/settings" },
  ];
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const avatarLinks = getAvatarLinks(pathname);
  const workspaceSettingsHref = avatarLinks.find((l) => l.label === "Workspace Settings")?.href ?? "/settings";

  const pageKey = Object.keys(routeLabels).find(
    (k) => pathname === k || (k !== "/dashboard" && k !== "/admin" && pathname.startsWith(k))
  );
  const page = pageKey
    ? routeLabels[pageKey]
    : { title: "RTM OS", sub: "Real Time Marketing Operational Dashboards" };

  return (
    <header
      className="h-[60px] flex items-center justify-between px-4 sm:px-6 flex-shrink-0 sticky top-0 z-10"
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid var(--rtm-border)",
        boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
      }}
    >
      {/* ── Left: hamburger + page title ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: "var(--rtm-text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-xlight)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          aria-label="Open navigation"
        >
          <IconMenu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-3">
          {/* RTM blue accent bar */}
          <span
            className="w-0.5 h-5 rounded-full hidden lg:block"
            style={{ background: "linear-gradient(180deg, var(--rtm-blue) 0%, var(--rtm-blue-mid) 100%)" }}
          />
          <div className="flex items-baseline gap-2">
            <h1
              className="text-sm font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {page.title}
            </h1>
            {page.sub && (
              <span
                className="text-xs hidden md:inline"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                {page.sub}
              </span>
            )}
          </div>
        </div>

        {/* Mobile title */}
        <div className="sm:hidden">
          <h1 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {page.title}
          </h1>
        </div>
      </div>

      {/* ── Right: search + live + notifications + avatar ── */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* Search — desktop */}
        <button
          className="hidden md:flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm w-52 border transition-all"
          style={{
            background: "var(--rtm-bg)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-muted)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-blue)";
            (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-border)";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-bg)";
          }}
        >
          <IconSearch className="w-3.5 h-3.5 flex-shrink-0 text-[color:var(--rtm-text-muted)]" />
          <span className="text-xs flex-1 text-left">Search anything…</span>
          <kbd
            className="ml-auto text-[10px] rounded-md px-1.5 py-0.5 font-mono border"
            style={{
              background: "#ffffff",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-muted)",
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Live indicator — blue pulse */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
          style={{
            background: "var(--rtm-blue-xlight)",
            borderColor: "var(--rtm-blue-light)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full rtm-live-dot"
            style={{ background: "var(--rtm-blue)" }}
          />
          <span className="text-xs font-semibold" style={{ color: "var(--rtm-blue)" }}>Live</span>
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: "var(--rtm-text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-xlight)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <IconBell className="w-[18px] h-[18px]" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white"
            style={{ background: "var(--rtm-blue)" }}
          />
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-8 h-8 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white transition-opacity hover:opacity-80"
            style={{ background: "linear-gradient(135deg, var(--rtm-blue) 0%, var(--rtm-blue-mid) 100%)" }}
            aria-label="Account menu"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            A
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-1 z-50"
              style={{
                background: "#ffffff",
                border: "1px solid var(--rtm-border)",
                boxShadow: "0 8px 24px rgba(15,28,56,0.12)",
              }}
            >
              {/* Profile header */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--rtm-border)" }}
              >
                <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>Admin User</p>
                <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>admin@rtmos.com</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {avatarLinks.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { router.push(item.href); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{ color: "var(--rtm-text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-xlight)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Divider + Sign Out */}
              <div
                className="border-t pt-1"
                style={{ borderColor: "var(--rtm-border)" }}
              >
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm transition-colors"
                  style={{ color: "#DC2626" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
