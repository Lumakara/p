import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/stats — dashboard overview metrics. */
export async function GET() {
  return withAdmin(async () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      paidOrders,
      totalOrders,
      ordersToday,
      failedOrders,
      activeProducts,
      totalUsers,
      revenueAgg,
      revenueMonthAgg,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count({ where: { status: { in: ["EXPIRED", "FAILED"] } } }),
      prisma.product.count({ where: { active: true } }),
      prisma.user.count(),
      prisma.order.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.order.aggregate({
        where: { status: "PAID", paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.order.groupBy({
        by: ["productName"],
        where: { status: "PAID" },
        _count: { productName: true },
        orderBy: { _count: { productName: "desc" } },
        take: 5,
      }),
    ]);

    // Revenue for the last 7 days.
    const days: { name: string; date: string; revenue: number; orders: number }[] =
      [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfDay);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const [agg, count] = await Promise.all([
        prisma.order.aggregate({
          where: { status: "PAID", paidAt: { gte: d, lt: next } },
          _sum: { amount: true },
        }),
        prisma.order.count({ where: { createdAt: { gte: d, lt: next } } }),
      ]);
      days.push({
        name: d.toLocaleDateString("id-ID", { weekday: "short" }),
        date: d.toISOString().slice(0, 10),
        revenue: agg._sum.amount ?? 0,
        orders: count,
      });
    }

    return {
      totalRevenue: revenueAgg._sum.amount ?? 0,
      monthRevenue: revenueMonthAgg._sum.amount ?? 0,
      totalOrders,
      ordersToday,
      paidOrders,
      failedOrders,
      activeProducts,
      totalUsers,
      chart: days,
      topProducts: topProducts.map((t) => ({
        name: t.productName,
        count: t._count.productName,
      })),
      recentOrders,
    };
  });
}
