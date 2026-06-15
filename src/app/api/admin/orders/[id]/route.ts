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
      const order = await prisma.order.update({
        where: { id },
        data: {
          status,
          ...(status === "PAID" ? { paidAt: new Date() } : {}),
        },
      });
      return { order };
    },
    { action: "order.status", target: id },
  );
}
