import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/products/[id]/reviews — submit a rating + review (auth required). */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 0));
    const comment = (body.comment || "").toString().trim();
    if (!rating || !comment) {
      return NextResponse.json(
        { error: "rating and comment are required" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Anti review-bombing: verifikasi pembelian
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId,
        productId: id,
        status: "PAID",
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "Anda harus membeli produk ini sebelum memberikan ulasan." },
        { status: 403 }
      );
    }

    const user = await currentUser();
    const userName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.username ||
      "User";

    const review = await prisma.review.create({
      data: {
        productId: id,
        userId,
        userName,
        userAvatar: user?.imageUrl,
        rating,
        comment,
      },
    });

    // Recompute aggregate rating.
    const agg = await prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id },
      data: {
        rating: Number((agg._avg.rating ?? 0).toFixed(1)),
        reviewsCount: agg._count.rating,
      },
    });

    return NextResponse.json({ review });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : "Internal error";
    console.error("[products/reviews]", m);
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
