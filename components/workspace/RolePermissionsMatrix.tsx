"use client";

import { SectionWrapper } from "@/components/ui";
import { permLevelConfig } from "@/lib/workspace-people";
import type { PermLevel, RoleDef, PermissionArea } from "@/lib/workspace-people";

interface Props {
  roles: RoleDef[];
  permissionAreas: PermissionArea[];
}

function PermCell({ level }: { level: PermLevel }) {
  const cfg = permLevelConfig[level];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap"style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      <span aria-hidden>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

export default function RolePermissionsMatrix({ roles, permissionAreas }: Props) {
  return (
    <div className="space-y-4">
      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>
          Legend:
        </span>
        {(Object.entries(permLevelConfig) as [PermLevel, (typeof permLevelConfig)[PermLevel]][]).map(
          ([key, cfg]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
            >
              <span aria-hidden>{cfg.icon}</span>
              {cfg.label}
              {key === "own"&& (
                <span className="opacity-60 font-normal">(assigned only)</span>
              )}
            </span>
          ),
        )}
      </div>

      {/* ── Matrix table ── */}
      <SectionWrapper
        title="Permissions Matrix"description={`${permissionAreas.length} permission areas across ${roles.length} roles`}
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold w-52"style={{ color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)"}}
                >
                  Permission Area
                </th>
                {roles.map((r) => (
                  <th
                    key={r.name}
                    className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)"}}
                  >
                    <span
                      className="inline-block px-2 py-0.5 rounded-full border font-bold text-[11px]"style={{
                        background: r.badge.bg,
                        color: r.badge.color,
                        borderColor: r.badge.border,
                      }}
                    >
                      {r.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionAreas.map((area, idx) => (
                <tr
                  key={area.area}
                  style={{
                    borderBottom:
                      idx < permissionAreas.length - 1
                        ? "1px solid var(--rtm-border-light)": undefined,
                    background: idx % 2 === 0 ? "var(--rtm-surface)": "var(--rtm-bg)",
                  }}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}>
                      {area.area}
                    </p>
                    <p className="text-[11px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                      {area.description}
                    </p>
                  </td>
                  {roles.map((r) => (
                    <td key={r.name} className="px-3 py-3 text-center">
                      <PermCell level={area.perms[r.name] ?? "none"} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>
    </div>
  );
}
