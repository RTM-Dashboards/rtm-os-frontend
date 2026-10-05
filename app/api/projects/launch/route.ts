// RTM OS — Project Launch API
//
// POST /api/projects/launch  { businessId: string }
//   → { result: LaunchResult }
//   → { error: string } on bad input
//
// Called by the Billing Activation page after markCleared succeeds.
// Creates one project per domain, categories per service sold, and setup tasks.
// Safe to call even if a project already exists — returns { result.skipped: true }.

import { NextRequest, NextResponse } from "next/server";
import { launchProject } from "@/lib/projects/launch";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { businessId } = body as { businessId?: string };
  if (!businessId || typeof businessId !== "string") {
    return NextResponse.json(
      { error: "Body must include businessId (string)" },
      { status: 400 }
    );
  }

  try {
    const result = await launchProject(businessId);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
