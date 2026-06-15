import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getDepositStatus } from "@/lib/payment";
import { notifyPaidOrder, notifyFailedOrder } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generateProductKey(): string {
  const part = () =>
    Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KEY-${part()}-${part()}-${part()}`;
}

/**
 * GET /api/payment/status/[orderId]
 * Polls RamaShop for the deposit status, applies validation + idempotency,
 * updates the order, and returns the current state to the frontend.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const { userId } = await auth();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    // Owners of the order only (admins can use the admin endpoints).
    if (order.userId && userId && order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Terminal states: return as-is (idempotent).
    if (order.status === "PAID") {
      return NextResponse.json({
        orderId: order.id,
        status: "PAID",
        paidAt: order.paidAt,
        productKey: order.productKey,
      });
    }
    if (order.status === "EXPIRED" || order.status === "FAILED") {
      return NextResponse.json({
        orderId: order.id,
        status: order.status,
        reason: "Pembayaran tidak selesai",
        canRetry: true,
      });
    }

    // Check local expiry first.
    if (order.expiredAt && order.expiredAt.getTime() < Date.now()) {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: "EXPIRED" },
      });
      notifyFailedOrder({
        orderId: updated.id,
        productName: updated.productName,
        amount: updated.amount,
        customer: updated.customerName || "Customer",
        reason: "Waktu pembayaran habis (timeout)",
      }).catch(() => {});
      return NextResponse.json({
        orderId: updated.id,
        status: "EXPIRED",
        reason: "Waktu pembayaran habis",
        canRetry: true,
      });
    }

    if (!order.transactionId) {
      return NextResponse.json({ orderId: order.id, status: "PENDING" });
    }

    const remote = await getDepositStatus(order.transactionId);

    if (remote.status === "success" || remote.status === "already") {
      // Validate the amount paid (must not be less than expected total).
      const expected = order.totalAmount ?? order.amount;
      if (remote.paidAmount !== undefined && remote.paidAmount < expected) {
        await prisma.webhookLog.create({
          data: {
            orderId: order.id,
            source: "payment",
            event: "amount_mismatch",
            payload: remote as object,
            verified: false,
          },
        });
        return NextResponse.json({ orderId: order.id, status: "PENDING" });
      }

      const productKey = generateProductKey();
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: remote.paidAt ? new Date(remote.paidAt) : new Date(),
          productKey,
        },
      });

      await prisma.webhookLog.create({
        data: {
          orderId: order.id,
          source: "payment",
          event: "payment.success",
          payload: remote as object,
          verified: true,
        },
      });

      notifyPaidOrder({
        orderId: updated.id,
        productName: updated.productName,
        amount: updated.amount,
        customer: updated.customerName || "Customer",
      }).catch(() => {});

      return NextResponse.json({
        orderId: updated.id,
        status: "PAID",
        paidAt: updated.paidAt,
        productKey: updated.productKey,
      });
    }

    return NextResponse.json({ orderId: order.id, status: "PENDING" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[payment/status]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
