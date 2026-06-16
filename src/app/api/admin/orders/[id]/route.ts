import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api";
import type { OrderStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/orders/[id] — detail + webhook logs. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withAdmin(async () => {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { webhookLogs: { orderBy: { createdAt: "asc" } } },
    });
    return { order };
  });
}

/** PATCH /api/admin/orders/[id] — manual status update (edge cases). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return withAdmin(
    async () => {
      const status = body.status as OrderStatus;
      
      const currentOrder = await prisma.order.findUnique({ where: { id } });
      if (!currentOrder) throw new Error("Order not found");

      // Validate transitions
      if (currentOrder.status === status) {
        return { order: currentOrder };
      }

      let productKey = currentOrder.productKey;
      let shouldDecrementStock = false;

      if (status === "PAID" && currentOrder.status !== "PAID") {
        if (!productKey) {
          // Generate a fake key for manual completion if none exists
          productKey = `KEY-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }
        shouldDecrementStock = true;
      }

      const order = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id },
          data: {
            status,
            ...(status === "PAID" ? { paidAt: new Date(), productKey } : {}),
          },
        });

        if (shouldDecrementStock && currentOrder.productId) {
          await tx.product.updateMany({
            where: { id: currentOrder.productId, stock: { gt: 0 } },
            data: { stock: { decrement: 1 } },
          });
        }
        return updated;
      });

      return { order };
    },
    { action: "order.status", target: id },
  );
}
