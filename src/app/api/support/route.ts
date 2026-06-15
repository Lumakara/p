import { NextRequest, NextResponse } from "next/server";
import { notifySupportTicket } from "@/lib/telegram";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/support — create a support ticket (notifies owner via Telegram). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { subject, category, email, description, turnstileToken } = body as {
      subject?: string;
      category?: string;
      email?: string;
      description?: string;
      turnstileToken?: string;
    };

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
    if (!(await verifyTurnstile(turnstileToken, ip))) {
      return NextResponse.json(
        { error: "Verifikasi captcha gagal" },
        { status: 400 },
      );
    }

    if (!subject || !email || !description) {
      return NextResponse.json(
        { error: "subject, email and description are required" },
        { status: 400 },
      );
    }

    await notifySupportTicket({
      subject,
      category: category || "general",
      email,
      description,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : "Internal error";
    console.error("[support]", m);
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
