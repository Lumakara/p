import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forwardUserChat, isTelegramConfigured } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/chat/owner
 * Body: { userId, message }
 * Forwards a user's message to the owner via Telegram and stores it.
 * The owner replies in Telegram; replies arrive via /api/telegram/webhook.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, message } = body as { userId?: string; message?: string };

    if (!userId || !message?.trim()) {
      return NextResponse.json(
        { error: "userId and message are required" },
        { status: 400 },
      );
    }

    let session = await prisma.chatSession.findFirst({
      where: { userId, mode: "OWNER" },
      orderBy: { lastActive: "desc" },
    });
    if (!session) {
      session = await prisma.chatSession.create({
        data: { userId, mode: "OWNER" },
      });
    }

    await prisma.chatMessage.create({
      data: { sessionId: session.id, sender: "USER", message, status: "SENT" },
    });
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { lastActive: new Date() },
    });

    const delivered = await forwardUserChat({ userId, message });

    return NextResponse.json({
      ok: true,
      delivered: delivered || isTelegramConfigured(),
      sessionId: session.id,
      note: delivered
        ? "Pesan terkirim ke owner."
        : "Pesan tersimpan. Owner akan segera merespons.",
    });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : "Internal error";
    console.error("[chat/owner]", m);
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
