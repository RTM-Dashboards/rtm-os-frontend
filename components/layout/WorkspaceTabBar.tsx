"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkspaceConfig } from "@/types/workspace";

interface WorkspaceTabBarProps {
  workspace: WorkspaceConfig;
}

export default function WorkspaceTabBar({ workspace }: WorkspaceTabBarProps) {
  const pathname = usePathname();

  const isActive = (href: string, isRoot = false): boolean => {
    if (isRoot) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div
      className="border-b mb-6"style={{ borderColor: "var(--rtm-border)"}}
    >
      {/* Workspace identity strip */}
      <div className="flex items-center gap-3 px-1 pt-4 pb-3">
        <span className="text-2xl">{workspace.icon}</span>
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest"style={{ color: workspace.accentColor }}
          >
            Workspace
          </p>
          <h1
            className="text-lg font-bold leading-tight"style={{ color: "var(--rtm-text-primary)"}}
          >
            {workspace.name}
          </h1>
        </div>
      </div>

      {/* Horizontal tab row */}
      <nav className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
        {workspace.navItems.map((item) => {
          // For root nav item with children, treat top-level href as active when any child is active too
          const active = item.children
            ? isActive(item.href)
            : isActive(item.href, item.href === workspace.dashboardRoute && !item.children);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150"style={{
                borderBottomColor: active ? workspace.accentColor : "transparent",
                color: active ? workspace.accentColor : "var(--rtm-text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--rtm-text-primary)";
                  (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = `${workspace.accentColor}55`;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--rtm-text-secondary)";
                  (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "transparent";
                }
              }}
            >
              {item.icon && <span className="text-base leading-none">{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
