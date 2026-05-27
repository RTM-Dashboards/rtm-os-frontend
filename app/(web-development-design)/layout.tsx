import WorkspaceShell from "@/components/layout/WorkspaceShell";
import { getWorkspace } from "@/lib/workspaces";
import { notFound } from "next/navigation";

export default function uwebudevelopmentudesignLayout({ children }: { children: React.ReactNode }) {
  const workspace = getWorkspace("web-development-design");
  if (!workspace) notFound();
  return <WorkspaceShell workspace={workspace}>{children}</WorkspaceShell>;
}
