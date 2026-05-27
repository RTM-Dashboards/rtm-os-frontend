"use client";

import { usePathname } from "next/navigation";
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

export default function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname();
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

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white"
          style={{ background: "linear-gradient(135deg, var(--rtm-blue) 0%, var(--rtm-blue-mid) 100%)" }}
        >
          A
        </div>
      </div>
    </header>
  );
}
