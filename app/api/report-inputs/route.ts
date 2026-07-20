// RTM OS — Report Inputs API Route
//
// Persistence: reads/writes data/report-inputs.json
//
// Each input record tracks a per-department data input requirement linked to a
// report record by reportId.  Marking an input as "Received" persists to disk.
//
// GET   /api/report-inputs                    → { inputs: ReportInput[] }
// PATCH /api/report-inputs                    → body: { inputId: string; updates: Partial<ReportInput> }
//                                              → { input: ReportInput }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReportInput {
  inputId: string;
  reportId: string;
  clientName: string;
  department: string;
  inputNeeded: string;
  owner: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Received" | "Overdue";
  blocker: string;
  notes: string;
  receivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ReportInputsFile {
  inputs: ReportInput[];
}

// ── File path ─────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "report-inputs.json");

// ── File I/O ──────────────────────────────────────────────────────────────────

function readInputs(): ReportInput[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ReportInputsFile;
    if (!Array.isArray(parsed.inputs)) throw new Error("bad shape");
    return parsed.inputs;
  } catch {
    return [];
  }
}

function writeInputs(inputs: ReportInput[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ inputs }, null, 2), "utf-8");
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const inputs = readInputs();
  return NextResponse.json({ inputs });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────
// Primary action: mark input as Received (or any other status/field update).

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { inputId?: unknown; updates?: unknown };
  if (
    !payload ||
    typeof payload.inputId !== "string" ||
    !payload.updates ||
    typeof payload.updates !== "object" ||
    Array.isArray(payload.updates)
  ) {
    return NextResponse.json(
      { error: "Body must include inputId (string) and updates (object)" },
      { status: 400 }
    );
  }

  const inputs = readInputs();
  const idx = inputs.findIndex((inp) => inp.inputId === payload.inputId);

  if (idx < 0) {
    return NextResponse.json({ error: "Input not found" }, { status: 404 });
  }

  const updates = payload.updates as Partial<ReportInput>;
  const now = new Date().toISOString();

  // Auto-set receivedAt when marking Received
  const receivedAt =
    updates.status === "Received" && inputs[idx].status !== "Received"
      ? now
      : inputs[idx].receivedAt;

  inputs[idx] = {
    ...inputs[idx],
    ...updates,
    inputId: inputs[idx].inputId, // never overwrite PK
    reportId: inputs[idx].reportId, // never overwrite FK
    createdAt: inputs[idx].createdAt,
    receivedAt,
    updatedAt: now,
  };

  try {
    writeInputs(inputs);
    return NextResponse.json({ input: inputs[idx] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
