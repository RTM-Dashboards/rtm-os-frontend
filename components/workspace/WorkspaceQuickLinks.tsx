import Link from "next/link";
import type { WorkspaceNavItem } from "@/types/workspace";

interface QuickLinkItem {
  label: string;
  href: string;
  icon?: string;
  description?: string;
  accent?: string;
}

interface WorkspaceQuickLinksProps {
  links: QuickLinkItem[];
  title?: string;
}

export default function WorkspaceQuickLinks({ links, title = "Quick Access"}: WorkspaceQuickLinksProps) {
  return (
    <div
      className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
    >
      <h2 className="text-sm font-bold mb-4"style={{ color: "var(--rtm-text-primary)"}}>
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex flex-col items-start gap-2 p-4 rounded-lg border transition-all duration-150"style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border-light)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = link.accent ?? "#1d709f";
              (e.currentTarget as HTMLAnchorElement).style.background = `${link.accent ?? "#1d709f"}08`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rtm-border-light)";
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--rtm-bg)";
            }}
          >
            <span className="text-2xl">{link.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight"style={{ color: "var(--rtm-text-primary)"}}>
                {link.label}
              </p>
              {link.description && (
                <p className="text-[11px] mt-0.5 leading-snug"style={{ color: "var(--rtm-text-muted)"}}>
                  {link.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
