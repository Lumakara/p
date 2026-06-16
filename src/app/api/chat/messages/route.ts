import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { processChatBackgroundJobs } from "@/lib/chat-jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/chat/messages?userId=...&mode=ai|owner&since=ISO
 * Returns chat history via Server-Sent Events (SSE).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const mode = url.searchParams.get("mode");
  let since = url.searchParams.get("since");

  if (!userId) {
    return new Response("userId required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const sendEvent = (data: unknown) => {
        if (isClosed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Poll DB every 2 seconds
      const timer = setInterval(async () => {
        if (isClosed) return;
        
        // Opportunistically process background tasks (auto-reply, retries)
        await processChatBackgroundJobs();
        try {
          const sessions = await prisma.chatSession.findMany({
            where: {
              userId,
              ...(mode && mode !== "null" ? { mode: mode.toUpperCase() as "AI" | "OWNER" } : {}),
            },
            select: { id: true },
          });
          const sessionIds = sessions.map((s) => s.id);
          
          if (sessionIds.length > 0) {
            const messages = await prisma.chatMessage.findMany({
              where: {
                sessionId: { in: sessionIds },
                ...(since ? { createdAt: { gt: new Date(since) } } : {}),
              },
              orderBy: { createdAt: "asc" },
            });

            if (messages.length > 0) {
              const payload = messages.map((m) => ({
                id: m.id,
                sender: m.sender.toLowerCase(),
                message: m.message,
                source: m.source,
                timestamp: m.createdAt.toISOString(),
              }));
              sendEvent({ messages: payload });
              since = messages[messages.length - 1].createdAt.toISOString();
            }
          }
        } catch (err) {
          console.error("[chat/messages] SSE error:", err);
        }
      }, 2000);

      req.signal.addEventListener("abort", () => {
        isClosed = true;
        clearInterval(timer);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
