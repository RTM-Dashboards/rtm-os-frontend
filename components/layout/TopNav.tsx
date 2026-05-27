"use client";

import { usePathname } from "next/navigation";
import { IconMenu, IconBell, IconSearch } from "./icons";

const routeLabels: Record<string, { title: string; sub: string }> = {
  "/dashboard": { title: "Overview", sub: "All departments at a glance" },
  "/account-management": { title: "Account Management", sub: "Client portfolio & health tracking" },
  "/sales": { title: "Sales", sub: "Pipeline, leads & new business" },
  "/billing": { title: "Billing", sub: "Revenue, invoices & subscriptions" },
  "/content": { title: "Content", sub: "Blog, social & email production" },
  "/design": { title: "Design", sub: "Creative assets & brand requests" },
  "/seo": { title: "SEO / GBP / Yelp", sub: "Search, maps & local listings" },
  "/meta-ads": { title: "Meta Ads & PPC", sub: "Paid social & search campaigns" },
  "/reporting": { title: "Reporting", sub: "Client reports & performance analytics" },
  "/lsa-reviews": { title: "Local Service Ads", sub: "LSA management & review tracking" },
  "/it-security": { title: "IT & Security", sub: "Infrastructure, access & monitoring" },
  "/settings": { title: "Settings", sub: "Platform configuration & preferences" },
};

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname();
  const page = routeLabels[pathname] ?? { title: "RTM OS", sub: "" };

  return (
    <header className="h-[60px] flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex-shrink-0 sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation"
        >
          <IconMenu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">{page.title}</h1>
            {page.sub && (
              <span className="text-xs text-slate-400 dark:text-slate-500 hidden md:inline">{page.sub}</span>
            )}
          </div>
        </div>
        <div className="sm:hidden">
          <h1 className="text-sm font-bold text-slate-900 dark:text-white">{page.title}</h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Search — desktop */}
        <button className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 rounded-lg px-3 py-1.5 text-sm text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-52 border border-slate-200 dark:border-slate-700">
          <IconSearch className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs">Search anything…</span>
          <kbd className="ml-auto text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Live indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Live</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <IconBell className="w-[1.125rem] h-[1.125rem]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-950" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex-shrink-0 cursor-pointer flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white dark:ring-slate-900">
          A
        </div>
      </div>
    </header>
  );
}
