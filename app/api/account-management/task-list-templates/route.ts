// RTM OS — Task List Templates API
//
// GET  /api/account-management/task-list-templates?serviceId=<id>
//   Returns the template for a service (or null if none exists yet).
//   → { template: TemplateRow | null }
//
// PUT  /api/account-management/task-list-templates?serviceId=<id>
//   Creates or replaces the template for a service (upsert by serviceId).
//   Body: { groups: TemplateGroup[] }
//   → { template: TemplateRow }
//
// Auth: requireDepartment(user, "Account Management", "Member")
//   Any active Account Management member passes.
//   Executives and SystemAdmins pass (condition A of requireDepartment).
//   Manager of another department is denied.
//   Billing Member is denied.
//
// Error shape: { error: string } — matches all other routes.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireDepartment } from "@/lib/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TemplateTaskDef {
  label: string;
  department: string;
  offsetDays: number;
}

export interface TemplateGroup {
  kind: "setup" | "recurring";
  heading: string;
  tasks: TemplateTaskDef[];
}

export interface TemplateRow {
  id: string;
  serviceId: string;
  groups: TemplateGroup[];
  updatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function parseGroups(raw: unknown): TemplateGroup[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((g): g is Record<string, unknown> => g !== null && typeof g === "object")
    .map((g) => ({
      kind:    g.kind === "recurring" ? "recurring" : "setup",
      heading: typeof g.heading === "string" ? g.heading : "",
      tasks:   Array.isArray(g.tasks)
        ? (g.tasks as unknown[])
            .filter((t): t is Record<string, unknown> => t !== null && typeof t === "object")
            .map((t) => ({
              label:      typeof t.label      === "string" ? t.label      : "",
              department: typeof t.department === "string" ? t.department : "",
              offsetDays: typeof t.offsetDays === "number" ? t.offsetDays : 0,
            }))
        : [],
    }));
}

function rowToApi(
  r: { id: string; serviceId: string; groups: unknown; updatedAt: string },
): TemplateRow {
  return {
    id:        r.id,
    serviceId: r.serviceId,
    groups:    parseGroups(r.groups),
    updatedAt: r.updatedAt,
  };
}

// ── Auth helper ───────────────────────────────────────────────────────────────

async function authorise(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return { user: null, denied: NextResponse.json({ error }, { status: status ?? 401 }) };
  const gate = requireDepartment(user!, "Account Management", "Member");
  if (gate) return { user: null, denied: NextResponse.json({ error: gate.error }, { status: gate.status }) };
  return { user: user!, denied: null };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { denied } = await authorise(req);
  if (denied) return denied;

  const serviceId = req.nextUrl.searchParams.get("serviceId");
  if (!serviceId) {
    return NextResponse.json({ error: "serviceId query param is required" }, { status: 400 });
  }

  try {
    const row = await prisma.taskListTemplate.findFirst({ where: { serviceId } });
    if (!row) {
      return NextResponse.json({ template: null });
    }
    return NextResponse.json({ template: rowToApi(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PUT ───────────────────────────────────────────────────────────────────────

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const { denied } = await authorise(req);
  if (denied) return denied;

  const serviceId = req.nextUrl.searchParams.get("serviceId");
  if (!serviceId) {
    return NextResponse.json({ error: "serviceId query param is required" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { groups } = body as { groups?: unknown };
  if (!Array.isArray(groups)) {
    return NextResponse.json({ error: "Body must include groups (array)" }, { status: 400 });
  }

  const cleanGroups = parseGroups(groups);
  const now = new Date().toISOString();

  try {
    // Upsert: find existing row for this serviceId and update it, or create.
    const existing = await prisma.taskListTemplate.findFirst({ where: { serviceId } });

    let row;
    if (existing) {
      row = await prisma.taskListTemplate.update({
        where: { id: existing.id },
        data:  { groups: cleanGroups as object[], updatedAt: now },
      });
    } else {
      row = await prisma.taskListTemplate.create({
        data: {
          id:        makeId("tlt"),
          serviceId,
          groups:    cleanGroups as object[],
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    return NextResponse.json({ template: rowToApi(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
