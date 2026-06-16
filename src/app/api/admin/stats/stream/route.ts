import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/stats/stream
 * SSE endpoint for real-time dashboard notifications.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  let lastSync = new Date();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const sendEvent = (data: unknown) => {
        if (isClosed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Check DB every 3 seconds for new orders or updated orders
      const timer = setInterval(async () => {
        if (isClosed) return;
        try {
          const updatedOrders = await prisma.order.findMany({
            where: {
              updatedAt: { gt: lastSync },
            },
            select: { id: true, status: true, productName: true, updatedAt: true },
            orderBy: { updatedAt: "asc" },
          });

          if (updatedOrders.length > 0) {
            sendEvent({ type: "orders_updated", orders: updatedOrders });
            lastSync = updatedOrders[updatedOrders.length - 1].updatedAt;
          }
        } catch (err) {
          console.error("[admin/stream] SSE error:", err);
        }
      }, 3000);

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
