import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { AutomationRule, RulesStore } from "../route";

const DATA_FILE = path.join(process.cwd(), "data", "report-automation-rules.json");

function readStore(): RulesStore {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as RulesStore;
}

function writeStore(store: RulesStore): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

type RouteContext = { params: Promise<{ ruleId: string }> };

// PATCH /api/report-automation-rules/[ruleId] — update a rule
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { ruleId } = await context.params;
    const body = (await req.json()) as Partial<AutomationRule>;
    const store = readStore();
    const idx = store.rules.findIndex((r) => r.ruleId === ruleId);
    if (idx === -1) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }
    store.rules[idx] = {
      ...store.rules[idx],
      ...body,
      ruleId, // never overwrite the id
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return NextResponse.json({ rule: store.rules[idx] });
  } catch {
    return NextResponse.json({ error: "Failed to update automation rule" }, { status: 500 });
  }
}

// DELETE /api/report-automation-rules/[ruleId] — delete a rule
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { ruleId } = await context.params;
    const store = readStore();
    const idx = store.rules.findIndex((r) => r.ruleId === ruleId);
    if (idx === -1) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }
    const deleted = store.rules.splice(idx, 1)[0];
    writeStore(store);
    return NextResponse.json({ deleted });
  } catch {
    return NextResponse.json({ error: "Failed to delete automation rule" }, { status: 500 });
  }
}
