// RTM OS — POST /api/notifications/escalate
//
// Two operations depending on the body:
//
// 1. Raise a new concern (level 1 — goes to the raiser's department manager):
//    { concernAboutType: "project"|"task"|"client", concernAboutId: string,
//      message: string, link: string }
//
//    Department routing: the raiser's own department manager receives it.
//    If the raiser has no department, or the department has no manager,
//    it goes to any active Executive.
//    If there is no Executive, it goes to any SystemAdmin.
//    If none of the above exist, returns { error }.
//
// 2. Escalate an existing level-1 concern to an Executive (level 2):
//    { parentNotifId: string }
//
//    No scheduler — this is triggered manually by the raiser or level-1
//    recipient pressing "Escalate to Executive" in the UI.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { raiseEscalation, escalateToExecutive } from "@/lib/notifications/send";

export async function POST(request: NextRequest) {
  const { user, error, status } = await getSessionUser(request);
  if (error) return NextResponse.json({ error }, { status });

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;

  // ── Path 2: escalate existing concern to Executive ──────────────────────────
  if (typeof body.parentNotifId === "string") {
    const result = await escalateToExecutive({
      parentNotifId: body.parentNotifId,
      escalatedById: user!.id,
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result);
  }

  // ── Path 1: raise new concern ───────────────────────────────────────────────
  const { concernAboutType, concernAboutId, message, link } = body;

  if (
    typeof concernAboutType !== "string" ||
    !["project", "task", "client"].includes(concernAboutType) ||
    typeof concernAboutId !== "string" || !concernAboutId ||
    typeof message !== "string"         || !message ||
    typeof link    !== "string"         || !link
  ) {
    return NextResponse.json(
      { error: "Required: concernAboutType, concernAboutId, message, link" },
      { status: 400 }
    );
  }

  const result = await raiseEscalation({
    raisedById:       user!.id,
    concernAboutType: concernAboutType as "project" | "task" | "client",
    concernAboutId:   concernAboutId as string,
    message:          message as string,
    link:             link as string,
  });

  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
