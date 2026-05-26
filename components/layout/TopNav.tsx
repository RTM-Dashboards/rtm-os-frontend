"use client";

import { usePathname } from "next/navigation";
import { IconMenu, IconBell, IconSearch } from "./icons";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/account-management": "Account Management",
  "/sales": "Sales",
  "/billing": "Billing",
  "/content": "Content",
  "/design": "Design",
  "/seo": "SEO / GBP / Yelp",
  "/meta-ads": "Meta Ads & PPC",
  "/reporting": "Reporting",
  "/lsa-reviews": "LSA & Reviews",
  "/it-security": "IT & Security",
  "/settings": "Settings",
};

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname();
  const pageTitle = routeLabels[pathname] ?? "RTM OS";

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation"
        >
          <IconMenu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Search — desktop only */}
        <button className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-52">
          <IconSearch className="w-4 h-4 flex-shrink-0" />
          <span>Search…</span>
          <kbd className="ml-auto text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <IconBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-950" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0 cursor-pointer flex items-center justify-center text-white text-xs font-bold">
          A
        </div>
      </div>
    </header>
  );
}
