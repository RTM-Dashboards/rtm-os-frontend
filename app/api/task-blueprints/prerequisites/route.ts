// RTM OS — Blueprint Prerequisites API
//
// Manages the prerequisite declarations on task_list_templates rows.
//
// GET  /api/task-blueprints/prerequisites?blueprintId=<id>
//   Returns prerequisite_ids for the given blueprint.
//   → { prerequisites: string[] }
//
// GET  /api/task-blueprints/prerequisites
//   Returns all edges.
//   → { edges: Array<{ blueprintId: string; prerequisiteId: string }> }
//
// PUT  /api/task-blueprints/prerequisites?blueprintId=<id>
//   Body: { prerequisiteIds: string[] }
//   Replaces the prerequisite set for this blueprint atomically.
//   Refuses:
//     a. A cycle in the resulting graph.
//     b. A recurring blueprint as a prerequisite.
//   → { prerequisites: string[] }
//
// DELETE /api/task-blueprints/prerequisites?blueprintId=<id>&prerequisiteId=<id>
//   Removes a single edge.
//   → { ok: true }
//
// Auth: Account Management department or Executive / SystemAdmin (same gate as
// blueprint PATCH).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireDepartment } from "@/lib/auth";
import { VALID_DEPARTMENTS } from "@/lib/auth/vocab";
import {
  detectCycle,
  getExistingEdges,
  isBlueprintRecurring,
  makeId,
} from "@/lib/projects/blueprint-prerequisites";

const AM_DEPT = VALID_DEPARTMENTS[0]; // "Account Management"

async function authWrite(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return { denied: NextResponse.json({ error }, { status: status ?? 401 }) };
  const gate = requireDepartment(user!, AM_DEPT, "Member");
  if (gate) return { denied: NextResponse.json({ error: gate.error }, { status: gate.status }) };
  return { denied: null };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });
  void user; // auth check only

  const sp = new URL(req.url).searchParams;
  const blueprintId = sp.get("blueprintId");

  try {
    if (blueprintId) {
      const rows = await prisma.blueprintPrerequisite.findMany({
        where:  { blueprintId },
        select: { prerequisiteId: true },
      });
      return NextResponse.json({ prerequisites: rows.map((r) => r.prerequisiteId) });
    }

    const rows = await prisma.blueprintPrerequisite.findMany({
      select: { blueprintId: true, prerequisiteId: true },
    });
    return NextResponse.json({ edges: rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PUT — replace prerequisite set for a blueprint ────────────────────────────

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const { denied } = await authWrite(req);
  if (denied) return denied;

  const blueprintId = new URL(req.url).searchParams.get("blueprintId");
  if (!blueprintId) {
    return NextResponse.json({ error: "blueprintId query param required" }, { status: 400 });
  }

  let body: { prerequisiteIds: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.prerequisiteIds)) {
    return NextResponse.json({ error: "prerequisiteIds must be an array" }, { status: 400 });
  }

  const newPrereqIds: string[] = [...new Set(body.prerequisiteIds)];

  // Verify the blueprint exists.
  const blueprint = await prisma.taskListTemplate.findUnique({
    where:  { id: blueprintId },
    select: { id: true, name: true, groups: true },
  });
  if (!blueprint) {
    return NextResponse.json({ error: `Blueprint not found: ${blueprintId}` }, { status: 404 });
  }

  // A blueprint cannot be its own prerequisite.
  if (newPrereqIds.includes(blueprintId)) {
    return NextResponse.json(
      { error: "A blueprint cannot be its own prerequisite." },
      { status: 422 },
    );
  }

  // Validate each proposed prerequisite exists and is not recurring.
  for (const prereqId of newPrereqIds) {
    const prereq = await prisma.taskListTemplate.findUnique({
      where:  { id: prereqId },
      select: { id: true, name: true, serviceId: true, groups: true },
    });
    if (!prereq) {
      return NextResponse.json(
        { error: `Prerequisite blueprint not found: ${prereqId}` },
        { status: 404 },
      );
    }
    if (isBlueprintRecurring(prereq.groups)) {
      const label = prereq.name || prereq.serviceId;
      return NextResponse.json(
        {
          error:
            `"${label}" is a recurring blueprint. Recurring lists never complete, ` +
            `so anything waiting on them waits forever. ` +
            `A recurring blueprint cannot be used as a prerequisite.`,
        },
        { status: 422 },
      );
    }
  }

  // Load all existing edges EXCLUDING the ones we are about to replace for this blueprint.
  const allEdges = await getExistingEdges();
  const otherEdges = allEdges.filter((e) => e.blueprintId !== blueprintId);

  // Cycle check: for each new edge, check whether it creates a cycle with the
  // already-existing edges (plus any previously-added new edges in this batch).
  const batchEdges = [...otherEdges];
  for (const prereqId of newPrereqIds) {
    const wouldCycle = detectCycle(batchEdges, blueprintId, prereqId);
    if (wouldCycle) {
      const prereq = await prisma.taskListTemplate.findUnique({
        where:  { id: prereqId },
        select: { name: true, serviceId: true },
      });
      const bpLabel     = blueprint.name || blueprintId;
      const prereqLabel = prereq?.name || prereqId;
      return NextResponse.json(
        {
          error:
            `Setting "${bpLabel}" → "${prereqLabel}" would create a prerequisite cycle. ` +
            `A blueprint cannot (directly or indirectly) be a prerequisite of itself.`,
        },
        { status: 422 },
      );
    }
    // Add this edge to the batch so subsequent edges in the same request see it.
    batchEdges.push({ blueprintId, prerequisiteId: prereqId });
  }

  // Atomically replace: delete all current edges for this blueprint, insert new ones.
  try {
    const now = new Date().toISOString();
    await prisma.$transaction(async (tx) => {
      await tx.blueprintPrerequisite.deleteMany({ where: { blueprintId } });
      if (newPrereqIds.length > 0) {
        await tx.blueprintPrerequisite.createMany({
          data: newPrereqIds.map((prereqId) => ({
            id:             makeId("bprq"),
            blueprintId,
            prerequisiteId: prereqId,
            createdAt:      now,
          })),
        });
      }
    });

    return NextResponse.json({ prerequisites: newPrereqIds });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── DELETE — remove a single edge ─────────────────────────────────────────────

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { denied } = await authWrite(req);
  if (denied) return denied;

  const sp = new URL(req.url).searchParams;
  const blueprintId    = sp.get("blueprintId");
  const prerequisiteId = sp.get("prerequisiteId");

  if (!blueprintId || !prerequisiteId) {
    return NextResponse.json(
      { error: "blueprintId and prerequisiteId query params required" },
      { status: 400 },
    );
  }

  try {
    await prisma.blueprintPrerequisite.deleteMany({
      where: { blueprintId, prerequisiteId },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
