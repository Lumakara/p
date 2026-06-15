import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
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
    const session = await auth();
    const userId = session?.user?.id;
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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userName = user?.name || user?.username || session.user?.name || "User";

    const review = await prisma.review.create({
      data: {
        productId: id,
        userId,
        userName,
        userAvatar: user?.image || session.user?.image,
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
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
