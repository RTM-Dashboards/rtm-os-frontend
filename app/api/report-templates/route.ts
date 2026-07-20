// RTM OS — Report Templates API Route
//
// Persistence: reads/writes data/report-templates.json
//
// Single canonical source of truth for all report templates.
// Consumed by Tab 6 (Template Library) on /reporting and by the
// /settings/report-templates and /reporting/templates redirects.
//
// GET    /api/report-templates                → { templates: ReportTemplate[] }
// POST   /api/report-templates                → body: Partial<ReportTemplate>
//                                              → { template: ReportTemplate }
// PATCH  /api/report-templates                → body: { templateId: string; updates: Partial<ReportTemplate> }
//                                              → { template: ReportTemplate }
// DELETE /api/report-templates?templateId=... → { ok: true }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReportTemplate {
  templateId: string;
  name: string;
  version: string;
  department: string;
  sections: string[];
  dataConnections: string[];
  frequency: string;
  owner: string;
  status: "Active" | "Draft" | "Archived";
  usageCount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportTemplatesFile {
  templates: ReportTemplate[];
}

// ── File path ─────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "report-templates.json");

// ── File I/O ──────────────────────────────────────────────────────────────────

function readTemplates(): ReportTemplate[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ReportTemplatesFile;
    if (!Array.isArray(parsed.templates)) throw new Error("bad shape");
    return parsed.templates;
  } catch {
    return [];
  }
}

function writeTemplates(templates: ReportTemplate[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ templates }, null, 2), "utf-8");
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const templates = readTemplates();
  return NextResponse.json({ templates });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as Partial<ReportTemplate>;
  if (!payload || typeof payload.name !== "string" || !payload.name.trim()) {
    return NextResponse.json(
      { error: "Body must include name (string)" },
      { status: 400 }
    );
  }

  const templates = readTemplates();
  const newId = `tmpl-${String(Date.now()).slice(-6)}`;
  const now = new Date().toISOString();

  const template: ReportTemplate = {
    templateId: newId,
    name: payload.name.trim(),
    version: payload.version ?? "v1.0",
    department: payload.department ?? "Multi",
    sections: Array.isArray(payload.sections) ? payload.sections : [],
    dataConnections: Array.isArray(payload.dataConnections) ? payload.dataConnections : [],
    frequency: payload.frequency ?? "Monthly",
    owner: payload.owner ?? "",
    status: payload.status ?? "Draft",
    usageCount: 0,
    description: payload.description ?? "",
    createdAt: now,
    updatedAt: now,
  };

  templates.push(template);

  try {
    writeTemplates(templates);
    return NextResponse.json({ template }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { templateId?: unknown; updates?: unknown };
  if (
    !payload ||
    typeof payload.templateId !== "string" ||
    !payload.updates ||
    typeof payload.updates !== "object" ||
    Array.isArray(payload.updates)
  ) {
    return NextResponse.json(
      { error: "Body must include templateId (string) and updates (object)" },
      { status: 400 }
    );
  }

  const templates = readTemplates();
  const idx = templates.findIndex((t) => t.templateId === payload.templateId);

  if (idx < 0) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const updates = payload.updates as Partial<ReportTemplate>;
  templates[idx] = {
    ...templates[idx],
    ...updates,
    templateId: templates[idx].templateId, // never overwrite PK
    usageCount: templates[idx].usageCount, // preserve usage count unless explicitly passed
    ...(typeof updates.usageCount === "number" ? { usageCount: updates.usageCount } : {}),
    createdAt: templates[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };

  try {
    writeTemplates(templates);
    return NextResponse.json({ template: templates[idx] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
// Archive semantics: sets status to "Archived" rather than hard-deleting.
// Hard delete available via ?hardDelete=true for admin use.

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get("templateId");
  const hardDelete = searchParams.get("hardDelete") === "true";

  if (!templateId) {
    return NextResponse.json(
      { error: "templateId query param required" },
      { status: 400 }
    );
  }

  const templates = readTemplates();
  const idx = templates.findIndex((t) => t.templateId === templateId);

  if (idx < 0) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  if (hardDelete) {
    templates.splice(idx, 1);
  } else {
    // Soft archive
    templates[idx] = {
      ...templates[idx],
      status: "Archived",
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    writeTemplates(templates);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
