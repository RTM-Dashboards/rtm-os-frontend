// RTM OS — GET /api/notifications
//
// Returns the authenticated user's notifications, newest first.
// Optional query params:
//   ?unread=1   — only unread (read_at IS NULL)
//   ?limit=N    — max rows (default 100)
//
// A user only ever sees their own notifications.
// This is enforced by filtering on recipient_id = session user id.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const { user, error, status } = await getSessionUser(request);
  if (error) return NextResponse.json({ error }, { status });

  const url    = request.nextUrl;
  const unread = url.searchParams.get("unread") === "1";
  const limit  = Math.min(parseInt(url.searchParams.get("limit") ?? "100", 10), 200);

  const rows = await prisma.notification.findMany({
    where: {
      recipientId: user!.id,
      ...(unread ? { readAt: null } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id:                true,
      type:              true,
      message:           true,
      link:              true,
      readAt:            true,
      createdAt:         true,
      concernAboutType:  true,
      concernAboutId:    true,
      raisedById:        true,
      escalationLevel:   true,
      escalationParentId:true,
      resolvedAt:        true,
      resolvedById:      true,
      raisedBy:          { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ notifications: rows });
}
