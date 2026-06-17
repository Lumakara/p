import { NextRequest } from "next/server";
import { prisma } from "@/db/client";
import { withAdmin } from "@/lib/api-middleware";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PUT /api/admin/products/[id] — update a product. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return withAdmin(
    async () => {
      const data: Record<string, unknown> = {};
      const fields = [
        "title",
        "description",
        "fullDescription",
        "icon",
        "images",
        "category",
        "badge",
        "features",
        "tiers",
        "active",
      ];
      for (const f of fields) if (f in body) data[f] = body[f];
      if ("basePrice" in body) data.basePrice = Number(body.basePrice) || 0;
      if ("discountPrice" in body)
        data.discountPrice = body.discountPrice
          ? Number(body.discountPrice)
          : null;
      if ("stock" in body)
        data.stock =
          body.stock === "" || body.stock === null ? null : Number(body.stock);

      const product = await prisma.product.update({ where: { id }, data });
      return { product };
    },
    { action: "product.update", target: id },
  );
}

/** PATCH /api/admin/products/[id] — toggle active state. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return withAdmin(
    async () => {
      const product = await prisma.product.update({
        where: { id },
        data: { active: Boolean(body.active) },
      });
      return { product };
    },
    { action: "product.toggle", target: id },
  );
}

/** DELETE /api/admin/products/[id] — delete (or deactivate if it has orders). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withAdmin(
    async () => {
      const orderCount = await prisma.order.count({ where: { productId: id } });
      if (orderCount > 0) {
        await prisma.product.update({
          where: { id },
          data: { active: false },
        });
        return {
          ok: true,
          deactivated: true,
          message:
            "Produk memiliki order, jadi dinonaktifkan (tidak dihapus permanen).",
        };
      }
      await prisma.product.delete({ where: { id } });
      return { ok: true, deleted: true };
    },
    { action: "product.delete", target: id },
  );
}
