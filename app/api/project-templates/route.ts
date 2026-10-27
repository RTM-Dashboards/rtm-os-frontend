// RTM OS — Project Templates CRUD
//
// GET  /api/project-templates
//   → { templates: ProjectTemplateRecord[] }
//
// POST /api/project-templates
//   Body: { name: string; description?: string; blueprintIds?: string[] }
//   → { template: ProjectTemplateRecord }
//
// PATCH /api/project-templates
//   Body: { id: string; name?: string; description?: string; blueprintIds?: string[]; isActive?: boolean }
//   → { template: ProjectTemplateRecord }
//
// DELETE /api/project-templates
//   Body: { id: string }
//   → { ok: true }
//
// Auth guard: same as POST /api/projects/apply-blueprint —
//   requireDepartment(user, "Account Management", "Member")
//   (passes Executive and SystemAdmin via condition A).

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireDepartment } from "@/lib/auth";
import { VALID_DEPARTMENTS } from "@/lib/auth/vocab";
import { prisma } from "@/lib/db/prisma";

const ACCOUNT_MANAGEMENT_DEPT = VALID_DEPARTMENTS[0]; // "Account Management"

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface ProjectTemplateRecord {
  id:          string;
  name:        string;
  description: string;
  isActive:    boolean;
  createdAt:   string;
  updatedAt:   string;
  blueprints:  Array<{
    position:    number;
    blueprintId: string;
    name:        string;
    serviceId:   string;
    department:  string;
    description: string;
  }>;
}

async function toRecord(
  t: {
    id: string; name: string; description: string; isActive: boolean;
    createdAt: string; updatedAt: string;
    blueprints: Array<{
      position: number; blueprintId: string;
      blueprint: { name: string; serviceId: string; department: string; description: string };
    }>;
  }
): Promise<ProjectTemplateRecord> {
  return {
    id:          t.id,
    name:        t.name,
    description: t.description,
    isActive:    t.isActive,
    createdAt:   t.createdAt,
    updatedAt:   t.updatedAt,
    blueprints:  t.blueprints
      .sort((a, b) => a.position - b.position)
      .map((b) => ({
        position:    b.position,
        blueprintId: b.blueprintId,
        name:        b.blueprint.name,
        serviceId:   b.blueprint.serviceId,
        department:  b.blueprint.department,
        description: b.blueprint.description,
      })),
  };
}

const BLUEPRINT_SELECT = {
  position:    true,
  blueprintId: true,
  blueprint: {
    select: { name: true, serviceId: true, department: true, description: true },
  },
} as const;

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });

  const deptGate = requireDepartment(user!, ACCOUNT_MANAGEMENT_DEPT, "Member");
  if (deptGate) return NextResponse.json({ error: deptGate.error }, { status: deptGate.status });

  const rows = await prisma.projectTemplate.findMany({
    orderBy:  { name: "asc" },
    include: { blueprints: { select: BLUEPRINT_SELECT } },
  });

  const templates = await Promise.all(rows.map(toRecord));
  return NextResponse.json({ templates });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });

  const deptGate = requireDepartment(user!, ACCOUNT_MANAGEMENT_DEPT, "Member");
  if (deptGate) return NextResponse.json({ error: deptGate.error }, { status: deptGate.status });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description = "", blueprintIds = [] } =
    body as { name?: string; description?: string; blueprintIds?: string[] };

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!Array.isArray(blueprintIds)) {
    return NextResponse.json({ error: "blueprintIds must be an array" }, { status: 400 });
  }

  // Validate all blueprint ids exist.
  if (blueprintIds.length > 0) {
    const found = await prisma.taskListTemplate.findMany({
      where:  { id: { in: blueprintIds as string[] } },
      select: { id: true },
    });
    const foundIds = new Set(found.map((f) => f.id));
    const missing  = (blueprintIds as string[]).filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Blueprint id(s) not found: ${missing.join(", ")}` },
        { status: 400 },
      );
    }
  }

  const now = new Date().toISOString();
  const id  = makeId("pt");

  const created = await prisma.projectTemplate.create({
    data: {
      id,
      name:        name.trim(),
      description: typeof description === "string" ? description : "",
      isActive:    true,
      createdAt:   now,
      updatedAt:   now,
      blueprints: {
        create: (blueprintIds as string[]).map((bpId, idx) => ({
          id:          makeId("ptb"),
          blueprintId: bpId,
          position:    idx,
        })),
      },
    },
    include: { blueprints: { select: BLUEPRINT_SELECT } },
  });

  return NextResponse.json({ template: await toRecord(created) }, { status: 201 });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });

  const deptGate = requireDepartment(user!, ACCOUNT_MANAGEMENT_DEPT, "Member");
  if (deptGate) return NextResponse.json({ error: deptGate.error }, { status: deptGate.status });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, name, description, blueprintIds, isActive } =
    body as {
      id?: string; name?: string; description?: string;
      blueprintIds?: string[]; isActive?: boolean;
    };

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const existing = await prisma.projectTemplate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: `Template not found: ${id}` }, { status: 404 });
  }

  const now = new Date().toISOString();
  const updateData: Record<string, unknown> = { updatedAt: now };
  if (typeof name === "string" && name.trim()) updateData.name = name.trim();
  if (typeof description === "string")          updateData.description = description;
  if (typeof isActive === "boolean")            updateData.isActive = isActive;

  // If blueprintIds is supplied, replace the join rows entirely.
  if (Array.isArray(blueprintIds)) {
    const found = blueprintIds.length > 0
      ? await prisma.taskListTemplate.findMany({
          where:  { id: { in: blueprintIds as string[] } },
          select: { id: true },
        })
      : [];
    const foundIds = new Set(found.map((f) => f.id));
    const missing  = (blueprintIds as string[]).filter((bpId) => !foundIds.has(bpId));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Blueprint id(s) not found: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    await prisma.projectTemplateBlueprint.deleteMany({ where: { templateId: id } });
    if (blueprintIds.length > 0) {
      await prisma.projectTemplateBlueprint.createMany({
        data: (blueprintIds as string[]).map((bpId, idx) => ({
          id:          makeId("ptb"),
          templateId:  id,
          blueprintId: bpId,
          position:    idx,
        })),
      });
    }
  }

  const updated = await prisma.projectTemplate.update({
    where:   { id },
    data:    updateData,
    include: { blueprints: { select: BLUEPRINT_SELECT } },
  });

  return NextResponse.json({ template: await toRecord(updated) });
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });

  const deptGate = requireDepartment(user!, ACCOUNT_MANAGEMENT_DEPT, "Member");
  if (deptGate) return NextResponse.json({ error: deptGate.error }, { status: deptGate.status });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id } = body as { id?: string };
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const existing = await prisma.projectTemplate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: `Template not found: ${id}` }, { status: 404 });
  }

  // Cascade deletes project_template_blueprints via ON DELETE CASCADE.
  await prisma.projectTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
