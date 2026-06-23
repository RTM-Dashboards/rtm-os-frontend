"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { workspaces } from "@/lib/workspaces";

interface WorkspaceDetail {
  slug: string;
  deptAdmin: string;
  adminEmail: string;
  adminInitials: string;
  adminColor: string;
  memberCount: number;
  clientCount: number;
  accessLevel: "Full"| "Limited"| "Read Only";
  health: "success"| "warning"| "info";
  healthLabel: string;
  score: number;
}

const workspaceDetails: WorkspaceDetail[] = [
  { slug: "account-management",    deptAdmin: "Jordan Martinez", adminEmail: "jordan@rtm.com",  adminInitials: "JM", adminColor: "#1B4FD8", memberCount: 5,  clientCount: 148, accessLevel: "Full",      health: "success", healthLabel: "Healthy",  score: 94 },
  { slug: "sales",                 deptAdmin: "Daniel Chen",     adminEmail: "daniel@rtm.com",  adminInitials: "DC", adminColor: "#0EA5E9", memberCount: 4,  clientCount: 62,  accessLevel: "Full",      health: "success", healthLabel: "On Track", score: 88 },
  { slug: "billing",               deptAdmin: "Priya Nair",      adminEmail: "priya@rtm.com",   adminInitials: "PN", adminColor: "#F43F5E", memberCount: 3,  clientCount: 148, accessLevel: "Full",      health: "success", healthLabel: "Healthy",  score: 97 },
  { slug: "content",               deptAdmin: "Alex Rivera",     adminEmail: "alex@rtm.com",    adminInitials: "AR", adminColor: "#059669", memberCount: 6,  clientCount: 98,  accessLevel: "Full",      health: "warning", healthLabel: "Behind",   score: 71 },
  { slug: "web-development-design",deptAdmin: "Tom Walsh",       adminEmail: "tom@rtm.com",     adminInitials: "TW", adminColor: "#6366F1", memberCount: 4,  clientCount: 45,  accessLevel: "Full",      health: "warning", healthLabel: "Backlog",  score: 62 },
  { slug: "seo-local",             deptAdmin: "Lisa Park",       adminEmail: "lisa@rtm.com",    adminInitials: "LP", adminColor: "#EC4899", memberCount: 5,  clientCount: 112, accessLevel: "Full",      health: "success", healthLabel: "On Track", score: 90 },
  { slug: "paid-advertising",      deptAdmin: "Mike Torres",     adminEmail: "mike@rtm.com",    adminInitials: "MT", adminColor: "#7C3AED", memberCount: 4,  clientCount: 87,  accessLevel: "Full",      health: "info",    healthLabel: "Active",   score: 85 },
  { slug: "reporting",             deptAdmin: "Rachel Moon",     adminEmail: "rachel@rtm.com",  adminInitials: "RM", adminColor: "#14B8A6", memberCount: 3,  clientCount: 148, accessLevel: "Full",      health: "success", healthLabel: "On Track", score: 89 },
  { slug: "local-service-ads",     deptAdmin: "Sarah Kim",       adminEmail: "sarah@rtm.com",   adminInitials: "SK", adminColor: "#D97706", memberCount: 2,  clientCount: 34,  accessLevel: "Limited",   health: "info",    healthLabel: "Active",   score: 83 },
  { slug: "it-security",           deptAdmin: "Steve Nguyen",    adminEmail: "steve@rtm.com",   adminInitials: "SN", adminColor: "#64748B", memberCount: 2,  clientCount: 148, accessLevel: "Full",      health: "success", healthLabel: "Secure",   score: 94 },
];

const accessMatrix = [
  { role: "Super Admin", permissions: ["View All", "Edit All", "Delete", "Manage Users", "Billing", "System Config"] },
  { role: "Admin",       permissions: ["View All", "Edit All", "Delete", "Manage Users"] },
  { role: "Manager",     permissions: ["View Dept", "Edit Dept", "Assign Tasks"] },
  { role: "Specialist",  permissions: ["View Dept", "Edit Assigned"] },
  { role: "Read Only",   permissions: ["View Dept"] },
];

export default function AdminWorkspacesPage() {
  const merged = workspaceDetails.map((wd) => {
    const ws = workspaces.find((w) => w.slug === wd.slug);
    return { ...wd, name: ws?.name ?? wd.slug, icon: ws?.icon ?? "", accentColor: ws?.accentColor ?? "#1B4FD8", dashboardRoute: ws?.dashboardRoute ?? `/${wd.slug}` };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: "var(--rtm-blue)"}}>
          Admin · Workspaces
        </p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
          Workspaces
        </h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
          Department workspaces, admins, member counts, and access configuration.
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Workspaces", value: workspaceDetails.length.toString(),                                                icon: ""},
          { label: "Total Members",    value: workspaceDetails.reduce((s, w) => s + w.memberCount, 0).toString(),               icon: ""},
          { label: "Healthy Depts",    value: workspaceDetails.filter((w) => w.health === "success").length.toString(),         icon: ""},
          { label: "Needs Attention",  value: workspaceDetails.filter((w) => w.health !== "success").length.toString(),         icon: ""},
        ].map((k) => (
          <div key={k.label} className="rounded-xl border p-4"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{k.icon}</span>
              <span className="text-xs font-medium"style={{ color: "var(--rtm-text-muted)"}}>{k.label}</span>
            </div>
            <p className="text-2xl font-bold"style={{ color: "var(--rtm-text-primary)"}}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Workspace cards */}
      <div>
        <h2 className="text-sm font-bold mb-4"style={{ color: "var(--rtm-text-primary)"}}>Department Workspaces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {merged.map((ws) => (
            <div
              key={ws.slug}
              className="rounded-xl border p-5 flex flex-col gap-4"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"style={{ background: `${ws.accentColor}18` }}
                  >
                    {ws.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{ws.name}</p>
                    <StatusBadge variant={ws.health} label={ws.healthLabel} size="sm"/>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold"style={{ color: ws.accentColor }}>{ws.score}</p>
                  <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>health score</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Members",  value: ws.memberCount },
                  { label: "Clients",  value: ws.clientCount },
                  { label: "Access",   value: ws.accessLevel, isText: true },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg p-2.5 text-center"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}
                  >
                    <p
                      className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}
                    >
                      {s.value}
                    </p>
                    <p className="text-[10px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Dept admin */}
              <div
                className="flex items-center gap-3 p-3 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"style={{ background: ws.adminColor }}
                >
                  {ws.adminInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate"style={{ color: "var(--rtm-text-primary)"}}>{ws.deptAdmin}</p>
                  <p className="text-[10px] truncate"style={{ color: "var(--rtm-text-muted)"}}>Dept Admin · {ws.adminEmail}</p>
                </div>
              </div>

              {/* CTA */}
              <Link
                href={ws.dashboardRoute}
                className="text-xs font-semibold text-center py-2 rounded-lg border transition-colors"style={{
                  borderColor: ws.accentColor,
                  color: ws.accentColor,
                  background: `${ws.accentColor}08`,
                }}
              >
                Open Workspace →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Access Matrix */}
      <div
        className="rounded-xl border overflow-hidden"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
      >
        <div className="px-5 py-4"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          <h2 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Access Matrix</h2>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>Role-based permissions across all workspaces.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)"}}>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider"style={{ color: "var(--rtm-text-muted)"}}>Role</th>
                {["View All", "Edit All", "Delete", "Manage Users", "Billing", "System Config", "View Dept", "Edit Dept", "Assign Tasks", "Edit Assigned"].map((p) => (
                  <th key={p} className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider"style={{ color: "var(--rtm-text-muted)"}}>
                    <span className="block max-w-[60px] mx-auto leading-tight">{p}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accessMatrix.map((row, i) => (
                <tr key={row.role} style={{ borderBottom: i < accessMatrix.length - 1 ? "1px solid var(--rtm-border-light)": "none"}}>
                  <td className="px-4 py-3 font-semibold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{row.role}</td>
                  {["View All", "Edit All", "Delete", "Manage Users", "Billing", "System Config", "View Dept", "Edit Dept", "Assign Tasks", "Edit Assigned"].map((p) => (
                    <td key={p} className="px-3 py-3 text-center">
                      {row.permissions.includes(p) ? (
                        <span className="inline-block w-5 h-5 rounded-full text-white text-xs font-bold leading-5"style={{ background: "#10B981"}}></span>
                      ) : (
                        <span className="inline-block w-5 h-5 rounded-full text-xs leading-5"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)", color: "var(--rtm-text-muted)"}}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
