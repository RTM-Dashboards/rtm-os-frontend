import type { WorkspaceConfig } from "@/types/workspace";

interface WorkspaceHeaderProps {
  workspace: WorkspaceConfig;
  subtitle?: string;
}

export default function WorkspaceHeader({ workspace, subtitle }: WorkspaceHeaderProps) {
  return (
    <div
      className="rounded-xl px-6 py-5 mb-6 flex items-center gap-4"style={{
        background: `linear-gradient(135deg, ${workspace.accentColor}18 0%, ${workspace.accentColor}08 100%)`,
        border: `1px solid ${workspace.accentColor}30`,
      }}
    >
      <span className="text-4xl flex-shrink-0">{workspace.icon}</span>
      <div className="min-w-0">
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-0.5"style={{ color: workspace.accentColor }}
        >
          Workspace
        </p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
          {workspace.name}
        </h1>
        <p className="text-sm mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>
          {subtitle ?? workspace.description}
        </p>
      </div>
    </div>
  );
}
