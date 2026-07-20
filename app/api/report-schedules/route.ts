// RTM OS — Report Schedules API Route
//
// Persistence: reads/writes data/report-schedules.json
//
// Each schedule record is linked to a real client (clientId → master-clients.json)
// and a real template (templateId → report-templates.json). clientName and
// templateName are denormalised for display efficiency.
//
// NOTE: These records are schedule *configurations* only — they define when a
// report should be produced and delivered. Automatic triggering/generation on
// schedule is NOT implemented here; that depends on Report Generation being
// real first (Phase 5). See status badge in the UI.
//
// GET    /api/report-schedules              → { schedules: ReportSchedule[] }
// POST   /api/report-schedules              → body: ReportScheduleInput
//                                            → { schedule: ReportSchedule }
// PATCH  /api/report-schedules?id=<id>      → body: Partial<ReportScheduleInput>
//                                            → { schedule: ReportSchedule }
// DELETE /api/report-schedules?id=<id>      → { ok: true }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ScheduleFrequency = "Weekly" | "Bi-weekly" | "Monthly" | "Quarterly";
export type ScheduleDeliveryMethod =
  | "Email"
  | "Client Portal"
  | "Email + Portal"
  | "Manual Send";
export type ScheduleStatus = "Active" | "Paused";

export interface ReportSchedule {
  scheduleId: string;
  clientId: string;
  clientName: string;
  templateId: string;
  templateName: string;
  frequency: ScheduleFrequency;
  /** Day number as string ("1"–"31"), "last", or weekday name for Weekly */
  sendDay: string;
  deliveryMethod: ScheduleDeliveryMethod;
  assignedAM: string;
  status: ScheduleStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportScheduleInput = Omit<
  ReportSchedule,
  "scheduleId" | "createdAt" | "updatedAt"
>;

interface SchedulesFile {
  schedules: ReportSchedule[];
}

// ── File path ─────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "report-schedules.json");

// ── File I/O ──────────────────────────────────────────────────────────────────

function readSchedules(): ReportSchedule[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SchedulesFile>;
    if (!Array.isArray(parsed.schedules)) throw new Error("bad shape");
    return parsed.schedules;
  } catch {
    return [];
  }
}

function writeSchedules(schedules: ReportSchedule[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ schedules }, null, 2), "utf-8");
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const schedules = readSchedules();
  return NextResponse.json({ schedules });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as Partial<ReportScheduleInput>;
  if (
    !payload ||
    typeof payload.clientId !== "string" ||
    !payload.clientId.trim() ||
    typeof payload.templateId !== "string" ||
    !payload.templateId.trim()
  ) {
    return NextResponse.json(
      { error: "Body must include clientId and templateId" },
      { status: 400 }
    );
  }

  const schedules = readSchedules();
  const newId = `sched-${String(Date.now()).slice(-6)}`;
  const now = new Date().toISOString();

  const schedule: ReportSchedule = {
    scheduleId: newId,
    clientId: payload.clientId.trim(),
    clientName: payload.clientName ?? "",
    templateId: payload.templateId.trim(),
    templateName: payload.templateName ?? "",
    frequency: payload.frequency ?? "Monthly",
    sendDay: payload.sendDay ?? "1",
    deliveryMethod: payload.deliveryMethod ?? "Email",
    assignedAM: payload.assignedAM ?? "",
    status: payload.status ?? "Active",
    notes: payload.notes ?? "",
    createdAt: now,
    updatedAt: now,
  };

  schedules.push(schedule);

  try {
    writeSchedules(schedules);
    return NextResponse.json({ schedule }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "id query param required" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates = body as Partial<ReportScheduleInput>;
  const schedules = readSchedules();
  const idx = schedules.findIndex((s) => s.scheduleId === id);

  if (idx < 0) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  schedules[idx] = {
    ...schedules[idx],
    ...updates,
    scheduleId: schedules[idx].scheduleId, // never overwrite PK
    createdAt: schedules[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };

  try {
    writeSchedules(schedules);
    return NextResponse.json({ schedule: schedules[idx] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "id query param required" },
      { status: 400 }
    );
  }

  const schedules = readSchedules();
  const idx = schedules.findIndex((s) => s.scheduleId === id);

  if (idx < 0) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  schedules.splice(idx, 1);

  try {
    writeSchedules(schedules);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
