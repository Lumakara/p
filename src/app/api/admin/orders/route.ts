import { NextRequest } from "next/server";
import { prisma } from "@/db/client";
import { withAdmin } from "@/lib/api-middleware";
import type { Prisma, OrderStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/orders?status=&q=&from=&to= */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  return withAdmin(async () => {
    const where: Prisma.OrderWhereInput = {};
    if (status && status !== "all") where.status = status as OrderStatus;
    if (q)
      where.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
      ];
    if (from || to)
      where.createdAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return { orders };
  });
}
