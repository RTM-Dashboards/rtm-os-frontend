import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { AutomationRule, RulesStore } from "../../route";

const DATA_FILE = path.join(process.cwd(), "data", "report-automation-rules.json");

function readStore(): RulesStore {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as RulesStore;
}

function writeStore(store: RulesStore): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

type RouteContext = { params: Promise<{ ruleId: string }> };

/**
 * POST /api/report-automation-rules/[ruleId]/run
 *
 * "Run Now" is a manual test trigger — not real automatic event-driven execution.
 * It simply records a lastRun timestamp and increments the run counter.
 * Real automatic triggering is deferred (same reasoning as Scheduled Reporting auto-triggering).
 */
export async function POST(_req: NextRequest, context: RouteContext) {
  try {
    const { ruleId } = await context.params;
    const store = readStore();
    const idx = store.rules.findIndex((r: AutomationRule) => r.ruleId === ruleId);
    if (idx === -1) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const rule = store.rules[idx];

    store.rules[idx] = {
      ...rule,
      lastRun: now.slice(0, 10), // YYYY-MM-DD
      runsTotal: rule.runsTotal + 1,
      updatedAt: now,
    };

    writeStore(store);
    return NextResponse.json({
      rule: store.rules[idx],
      message: "Manual test run recorded. Automatic event-driven execution is not yet implemented.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to record rule run" }, { status: 500 });
  }
}
