import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/auth";
import { prisma } from "@/db/client";
import { getDepositStatus, generateProductKey } from "@/integrations/payment";
import { notifyPaidOrder, notifyFailedOrder } from "@/integrations/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const userId = await getSessionId();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    // Owners of the order only (admins can use the admin endpoints).
    if (order.userId !== userId) {
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
      }).catch((err) => {
        console.warn("[payment/status] notifyFailedOrder failed:", err);
      });
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

    // RamaShop can also mark deposits as expired before our local timer fires.
    if (remote.status === "expired" || remote.status === "failed") {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: "EXPIRED" },
      });
      notifyFailedOrder({
        orderId: updated.id,
        productName: updated.productName,
        amount: updated.amount,
        customer: updated.customerName || "Customer",
        reason: "Ditolak oleh payment gateway",
      }).catch((err) => {
        console.warn("[payment/status] notifyFailedOrder failed:", err);
      });
      return NextResponse.json({
        orderId: updated.id,
        status: "EXPIRED",
        reason: "Waktu pembayaran habis",
        canRetry: true,
      });
    }

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

      const paidAt = remote.paidAt ? new Date(remote.paidAt) : new Date();
      const productKey = generateProductKey();

      // Atomically transition PENDING -> PAID exactly once. Concurrent polls
      // race here; only the request whose conditional update matches a still
      // PENDING row "wins" and fulfils the order (mints the key, decrements
      // stock, notifies). The rest return the already-persisted state.
      const won = await prisma.$transaction(async (tx) => {
        const res = await tx.order.updateMany({
          where: { id: order.id, status: "PENDING" },
          data: { status: "PAID", paidAt, productKey },
        });
        if (res.count === 0) return false;
        if (order.productId) {
          await tx.product.updateMany({
            where: { id: order.productId, stock: { gt: 0 } },
            data: { stock: { decrement: 1 } },
          });
        }
        return true;
      });

      if (!won) {
        const fresh = await prisma.order.findUnique({ where: { id: order.id } });
        return NextResponse.json({
          orderId: order.id,
          status: fresh?.status ?? "PAID",
          paidAt: fresh?.paidAt,
          productKey: fresh?.productKey,
        });
      }

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
        orderId: order.id,
        productName: order.productName,
        amount: order.amount,
        customer: order.customerName || "Customer",
      }).catch((err) => {
        console.warn("[payment/status] notifyPaidOrder failed:", err);
      });

      return NextResponse.json({
        orderId: order.id,
        status: "PAID",
        paidAt,
        productKey,
      });
    }

    return NextResponse.json({ orderId: order.id, status: "PENDING" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[payment/status]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
