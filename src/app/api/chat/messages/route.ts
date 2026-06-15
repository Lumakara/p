import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/chat/messages?userId=...&mode=ai|owner&since=ISO
 * Returns chat history for a user (used for polling owner replies and
 * restoring history when the widget re-opens).
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const mode = url.searchParams.get("mode"); // "ai" | "owner" | null (all)
    const since = url.searchParams.get("since");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const sessions = await prisma.chatSession.findMany({
      where: {
        userId,
        ...(mode ? { mode: mode.toUpperCase() as "AI" | "OWNER" } : {}),
      },
      select: { id: true },
    });
    const sessionIds = sessions.map((s) => s.id);
    if (sessionIds.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId: { in: sessionIds },
        ...(since ? { createdAt: { gt: new Date(since) } } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender.toLowerCase(),
        message: m.message,
        source: m.source,
        timestamp: m.createdAt.toISOString(),
      })),
    });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : "Internal error";
    console.error("[chat/messages]", m);
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
