import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseOwnerReply } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/webhook
 * Receives owner replies from Telegram. The owner replies using:
 *   U-<userId> : <text>     (or by replying to the forwarded message)
 *
 * Set the webhook with a secret token:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook
 *     ?url=<APP_URL>/api/telegram/webhook
 *     &secret_token=<TELEGRAM_WEBHOOK_SECRET>
 */
export async function POST(req: NextRequest) {
  try {
    // Verify Telegram secret token header. Fail closed: if no secret is
    // configured we cannot authenticate the caller, so reject rather than
    // accept unauthenticated owner-reply injection.
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!secret) {
      console.error(
        "[telegram/webhook] TELEGRAM_WEBHOOK_SECRET not configured; rejecting webhook",
      );
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 503 },
      );
    }
    const got = req.headers.get("x-telegram-bot-api-secret-token");
    if (got !== secret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const update = await req.json().catch(() => ({}));
    const reply = parseOwnerReply(update);

    // Always log the raw update for auditing.
    await prisma.webhookLog
      .create({
        data: {
          source: "telegram",
          event: reply ? "owner_reply" : "update",
          payload: update,
          verified: true,
        },
      })
      .catch((err) => {
        console.error("[telegram/webhook] failed to log update:", err);
      });

    if (!reply) {
      return NextResponse.json({ ok: true });
    }

    // Find (or create) the OWNER session for this user and store the reply.
    let session = await prisma.chatSession.findFirst({
      where: { userId: reply.userId, mode: "OWNER" },
      orderBy: { lastActive: "desc" },
    });
    if (!session) {
      session = await prisma.chatSession.create({
        data: { userId: reply.userId, mode: "OWNER" },
      });
    }

    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "OWNER",
        message: reply.text,
        status: "DELIVERED",
      },
    });
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { lastActive: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : "Internal error";
    console.error("[telegram/webhook]", m);
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
