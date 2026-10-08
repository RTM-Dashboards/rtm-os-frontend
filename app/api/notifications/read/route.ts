// RTM OS — POST /api/notifications/read
//
// Mark one or all notifications as read for the authenticated user.
// Body: { id: string }           — mark one
//       { all: true }            — mark all unread as read
//
// Enforced: only touches rows where recipient_id = session user id.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  const { user, error, status } = await getSessionUser(request);
  if (error) return NextResponse.json({ error }, { status });

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const now  = new Date();

  if (body.all === true) {
    await prisma.notification.updateMany({
      where: { recipientId: user!.id, readAt: null },
      data:  { readAt: now },
    });
    return NextResponse.json({ ok: true, all: true });
  }

  const id = typeof body.id === "string" ? body.id : null;
  if (!id) return NextResponse.json({ error: "Provide id or all:true" }, { status: 400 });

  // Verify this notification belongs to the session user.
  const notif = await prisma.notification.findUnique({
    where:  { id },
    select: { recipientId: true },
  });
  if (!notif || notif.recipientId !== user!.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.notification.update({
    where: { id },
    data:  { readAt: now },
  });

  return NextResponse.json({ ok: true, id });
}
