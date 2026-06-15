import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createDeposit, generateOrderId } from "@/lib/payment";
import { notifyNewOrder } from "@/lib/telegram";
import { verifyTurnstile } from "@/lib/turnstile";
import { syncCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payment/create
 * Body: { productId, tier?, turnstileToken? }
 * The price is ALWAYS taken from the database, never from the request.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { productId, tier, turnstileToken } = body as {
      productId?: string;
      tier?: string;
      turnstileToken?: string;
    };

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
    const captchaOk = await verifyTurnstile(turnstileToken, ip);
    if (!captchaOk) {
      return NextResponse.json(
        { error: "Verifikasi captcha gagal" },
        { status: 400 },
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || !product.active) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }
    if (product.stock !== null && product.stock <= 0) {
      return NextResponse.json(
        { error: "Product out of stock" },
        { status: 400 },
      );
    }

    // Resolve the price from the DB based on the selected tier.
    let amount = product.discountPrice ?? product.basePrice;
    let tierName = tier ?? null;
    const tiers = (product.tiers as Array<{ name: string; price: number }>) || [];
    if (tier) {
      const found = tiers.find((t) => t.name === tier);
      if (found) amount = found.price;
    } else if (tiers.length > 0) {
      amount = tiers[0].price;
      tierName = tiers[0].name;
    }

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Invalid product price" },
        { status: 400 },
      );
    }

    // Make sure the user exists in our DB (best-effort).
    await syncCurrentUser().catch(() => null);
    const user = await currentUser();
    const customerName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.username ||
      "Customer";
    const customerEmail = user?.primaryEmailAddress?.emailAddress ?? null;

    const orderId = generateOrderId();

    // Request the QRIS deposit from RamaShop.
    const deposit = await createDeposit(amount);

    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId,
        productId: product.id,
        productName: product.title,
        tier: tierName,
        amount,
        status: "PENDING",
        transactionId: deposit.depositId,
        qrImage: deposit.qrImage,
        qrString: deposit.qrString,
        uniqueCode: deposit.uniqueCode,
        totalAmount: deposit.totalAmount,
        customerName,
        customerEmail,
        expiredAt: deposit.expiredAt ? new Date(deposit.expiredAt) : null,
      },
    });

    // Notify the owner via Telegram (non-blocking).
    notifyNewOrder({
      orderId: order.id,
      productName: order.productName,
      amount: order.amount,
      totalAmount: order.totalAmount ?? order.amount,
      customer: customerName,
      expiredAt: order.expiredAt?.toISOString(),
    }).catch(() => {});

    return NextResponse.json({
      orderId: order.id,
      qrImage: order.qrImage,
      qrString: order.qrString,
      amount: order.amount,
      totalAmount: order.totalAmount,
      uniqueCode: order.uniqueCode,
      expiredAt: order.expiredAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[payment/create]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
