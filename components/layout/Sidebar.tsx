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
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: IconDashboard, section: "overview" },
  { label: "Account Management", href: "/account-management", icon: IconBuilding, section: "departments" },
  { label: "Sales", href: "/sales", icon: IconTrending, section: "departments" },
  { label: "Billing", href: "/billing", icon: IconCreditCard, section: "departments" },
  { label: "Content", href: "/content", icon: IconFile, section: "departments" },
  { label: "Design", href: "/design", icon: IconPalette, section: "departments" },
  { label: "SEO / GBP / Yelp", href: "/seo", icon: IconSearch, section: "marketing" },
  { label: "Meta Ads & PPC", href: "/meta-ads", icon: IconTarget, section: "marketing" },
  { label: "Reporting", href: "/reporting", icon: IconBarChart, section: "marketing" },
  { label: "LSA & Reviews", href: "/lsa-reviews", icon: IconStar, section: "marketing" },
  { label: "IT & Security", href: "/it-security", icon: IconShield, section: "admin" },
  { label: "Settings", href: "/settings", icon: IconSettings, section: "admin" },
];

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  departments: "Departments",
  marketing: "Marketing",
  admin: "Admin",
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

  const sectionOrder = ["overview", "departments", "marketing", "admin"];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col w-64 flex-shrink-0
          bg-slate-900 border-r border-slate-800
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:z-auto lg:inset-auto
        `}
      >
        {/* Logo header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight">RTM OS</span>
              <span className="block text-slate-500 text-xs leading-none">Marketing Platform</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sectionOrder.map((section) => {
            const items = grouped[section];
            if (!items?.length) return null;
            return (
              <div key={section}>
                <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  {sectionLabels[section]}
                </p>
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
                            flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                            ${
                              isActive
                                ? "bg-indigo-600 text-white"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }
                          `}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
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
        <div className="border-t border-slate-800 px-4 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-slate-500 truncate">admin@rtm.io</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
