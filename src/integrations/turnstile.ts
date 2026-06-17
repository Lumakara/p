/**
 * Cloudflare Turnstile server-side verification.
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const SECRET = process.env.CF_TURNSTILE_SECRET || process.env.NEXT_TURNSTILE_SECRET || "";
const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileConfigured(): boolean {
  return Boolean(SECRET);
}

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<boolean> {
  // If Turnstile is not configured, don't block requests (dev-friendly).
  if (!SECRET) return true;
  if (!token) return false;

  try {
    const form = new URLSearchParams();
    form.set("secret", SECRET);
    form.set("response", token);
    if (remoteIp) form.set("remoteip", remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      cache: "no-store",
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error("[turnstile] verify failed:", err);
    return false;
  }
}
