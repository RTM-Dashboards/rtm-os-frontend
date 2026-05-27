"use client";

import Link from "next/link";
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
} from "./icons";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: IconDashboard, section: "overview" },
  { label: "Account Management", href: "/account-management", icon: IconBuilding, section: "departments" },
  { label: "Sales", href: "/sales", icon: IconTrending, section: "departments", badge: "24" },
  { label: "Billing", href: "/billing", icon: IconCreditCard, section: "departments" },
  { label: "Content", href: "/content", icon: IconFile, section: "departments" },
  { label: "Design", href: "/design", icon: IconPalette, section: "departments" },
  { label: "SEO / GBP / Yelp", href: "/seo", icon: IconSearch, section: "departments" },
  { label: "Meta Ads & PPC", href: "/meta-ads", icon: IconTarget, section: "departments" },
  { label: "Reporting", href: "/reporting", icon: IconBarChart, section: "departments" },
  { label: "Local Service Ads", href: "/lsa-reviews", icon: IconStar, section: "departments" },
  { label: "IT & Security", href: "/it-security", icon: IconShield, section: "departments" },
  { label: "Settings", href: "/settings", icon: IconSettings, section: "settings" },
];

const sectionLabels: Record<string, string> = {
  overview: "",
  departments: "Departments",
  settings: "",
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

  const sectionOrder = ["overview", "departments", "settings"];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col w-[240px] flex-shrink-0
          bg-[#0f1117] border-r border-white/[0.06]
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:z-auto lg:inset-auto
        `}
      >
        {/* Logo header */}
        <div className="flex items-center justify-between px-4 h-[60px] border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight">RTM OS</span>
              <span className="block text-slate-500 text-[10px] leading-none mt-0.5">Marketing Platform</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sectionOrder.map((section) => {
            const items = grouped[section];
            if (!items?.length) return null;
            return (
              <div key={section}>
                {sectionLabels[section] && (
                  <p className="px-2 mb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
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
                            flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all
                            ${
                              isActive
                                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                                : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 border border-transparent"
                            }
                          `}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-indigo-400" : ""}`} />
                          <span className="truncate flex-1">{item.label}</span>
                          {item.badge && !isActive && (
                            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full leading-none">
                              {item.badge}
                            </span>
                          )}
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
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

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-3 py-4 flex-shrink-0">
          <div className="flex items-center gap-3 px-1.5 py-2 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-lg">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-300 truncate">Admin</p>
              <p className="text-xs text-slate-600 truncate">admin@rtm.io</p>
            </div>
            <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>
      </aside>
    </>
  );
}
