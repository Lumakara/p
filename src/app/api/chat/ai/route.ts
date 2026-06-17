import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { askAi } from "@/services/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/chat/ai
 * Body: { userId, message, sessionId? }
 * Persists the conversation and returns the AI reply (v1 -> v2 -> fallback).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, message } = body as {
      userId?: string;
      message?: string;
      sessionId?: string;
    };

    if (!userId || !message?.trim()) {
      return NextResponse.json(
        { error: "userId and message are required" },
        { status: 400 },
      );
    }
    if (message.length > 4000) {
      return NextResponse.json(
        { error: "Pesan terlalu panjang (maks 4000 karakter)" },
        { status: 400 },
      );
    }

    // Find or create an AI session for this user.
    let session = await prisma.chatSession.findFirst({
      where: { userId, mode: "AI" },
      orderBy: { lastActive: "desc" },
    });
    if (!session) {
      session = await prisma.chatSession.create({
        data: { userId, mode: "AI" },
      });
    }

    await prisma.chatMessage.create({
      data: { sessionId: session.id, sender: "USER", message },
    });

    const ai = await askAi(message, session.id);

    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "AI",
        message: ai.message,
        source: ai.source,
      },
    });

    await prisma.chatSession.update({
      where: { id: session.id },
      data: { lastActive: new Date() },
    });

    return NextResponse.json({
      sender: "ai",
      message: ai.message,
      source: ai.source,
      sessionId: session.id,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : "Internal error";
    console.error("[chat/ai]", m);
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
