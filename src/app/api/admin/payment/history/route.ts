import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_URL = env.payment.baseUrl;
const API_KEY = env.payment.apiKey;

/** GET /api/admin/payment/history — fetch transaction history from RamaShop. */
export async function GET() {
  try {
    await requireAdmin();

    if (!API_KEY) {
      return NextResponse.json(
        { error: "PAYMENT_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const res = await fetch(`${BASE_URL}/history`, {
      method: "GET",
      headers: { "X-API-Key": API_KEY },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `RamaShop returned ${res.status}`, detail: text },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    if (message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[admin/payment/history]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
