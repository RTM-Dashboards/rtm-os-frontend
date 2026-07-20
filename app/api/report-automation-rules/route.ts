import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "report-automation-rules.json");

export type AutomationRuleStatus = "Active" | "Paused" | "Draft" | "Error";
export type AutomationRuleCategory = "Workflow" | "Scheduled";

export interface AutomationRule {
  ruleId: string;
  name: string;
  category: AutomationRuleCategory;
  reportType: string;
  trigger: string;
  action: string;
  schedule: string;
  recipients: string[];
  clients: string[];
  status: AutomationRuleStatus;
  lastRun: string;
  nextRun: string;
  runsTotal: number;
  runsFailed: number;
  template: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RulesStore {
  rules: AutomationRule[];
}

function readStore(): RulesStore {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as RulesStore;
}

function writeStore(store: RulesStore): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function generateRuleId(): string {
  return `rule-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// GET /api/report-automation-rules — list all rules
export async function GET() {
  try {
    const store = readStore();
    return NextResponse.json({ rules: store.rules });
  } catch {
    return NextResponse.json({ error: "Failed to read automation rules" }, { status: 500 });
  }
}

// POST /api/report-automation-rules — create a new rule
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AutomationRule>;
    const store = readStore();
    const now = new Date().toISOString();

    const newRule: AutomationRule = {
      ruleId: generateRuleId(),
      name: body.name ?? "Untitled Rule",
      category: body.category ?? "Workflow",
      reportType: body.reportType ?? "All",
      trigger: body.trigger ?? "",
      action: body.action ?? "",
      schedule: body.schedule ?? "",
      recipients: body.recipients ?? [],
      clients: body.clients ?? [],
      status: body.status ?? "Draft",
      lastRun: body.lastRun ?? "",
      nextRun: body.nextRun ?? "",
      runsTotal: 0,
      runsFailed: 0,
      template: body.template ?? "N/A",
      notes: body.notes ?? "",
      createdAt: now,
      updatedAt: now,
    };

    store.rules.push(newRule);
    writeStore(store);
    return NextResponse.json({ rule: newRule }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create automation rule" }, { status: 500 });
  }
}
