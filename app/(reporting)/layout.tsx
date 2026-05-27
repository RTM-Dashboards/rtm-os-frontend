import WorkspaceShell from "@/components/layout/WorkspaceShell";
import { getWorkspace } from "@/lib/workspaces";
import { notFound } from "next/navigation";

export default function ureportingLayout({ children }: { children: React.ReactNode }) {
  const workspace = getWorkspace("reporting");
  if (!workspace) notFound();
  return <WorkspaceShell workspace={workspace}>{children}</WorkspaceShell>;
}
