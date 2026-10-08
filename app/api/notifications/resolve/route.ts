// RTM OS — POST /api/notifications/resolve
//
// Resolve an escalation.
//
// Body: { notifId: string }
//
// Who can resolve: the notification recipient or a SystemAdmin.
// Effect: sets resolved_at on this row (and its chain partner if one exists),
//         then sends a "concern_resolved" notification to the original raiser.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { resolveEscalation } from "@/lib/notifications/send";

export async function POST(request: NextRequest) {
  const { user, error, status } = await getSessionUser(request);
  if (error) return NextResponse.json({ error }, { status });

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const notifId = typeof body.notifId === "string" ? body.notifId : null;
  if (!notifId) return NextResponse.json({ error: "notifId required" }, { status: 400 });

  const result = await resolveEscalation({ notifId, resolvedById: user!.id });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
