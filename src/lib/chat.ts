/**
 * NeoXR AI chat client (server-side only) with automatic v1 -> v2 fallback.
 *
 *   AI v1 (Kimi K2):  GET https://api.neoxr.eu/api/kimi?q=...&apikey=...
 *   AI v2 (Chat GPT-4): GET https://api.neoxr.eu/api/gpt4?q=...&apikey=...
 *
 * If v1 times out / returns an error, we automatically retry against v2.
 * If both fail, we return a fallback message instructing the user to
 * contact the owner directly.
 */

const BASE_URL = process.env.CHATBOT_BASE_URL || "https://api.neoxr.eu/api";
const API_KEY = process.env.CHATBOT_API_KEY || "";
const V1 = process.env.CHATBOT_V1_ENDPOINT || "kimi";
const V2 = process.env.CHATBOT_V2_ENDPOINT || "gpt4";
const TIMEOUT_MS = 5000;

export const FALLBACK_MESSAGE =
  "Maaf, asisten AI sedang tidak tersedia. Silakan hubungi owner langsung melalui tombol Chat Owner.";

export interface AiResult {
  message: string;
  source: "ai_v1" | "ai_v2" | "fallback";
}

interface NeoxrBody {
  status?: boolean;
  data?: unknown;
  result?: unknown;
  message?: unknown;
}

function extractMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const b = body as NeoxrBody;
  if (b.status === false) return null;
  // NeoXR responses vary: data can be a string or an object with `message`.
  const data = b.data ?? b.result ?? b.message;
  if (!data) return null;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const d = data as { message?: unknown; result?: unknown; answer?: unknown };
    if (typeof d.message === "string") return d.message;
    if (typeof d.result === "string") return d.result;
    if (typeof d.answer === "string") return d.answer;
  }
  return null;
}

async function callEndpoint(
  endpoint: string,
  message: string,
  sessionId?: string,
): Promise<string | null> {
  if (!API_KEY) throw new Error("CHATBOT_API_KEY is not configured");

  const params = new URLSearchParams({ q: message, apikey: API_KEY });
  if (sessionId) params.set("session", sessionId);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}?${params.toString()}`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) throw new Error("non-json response");
    const body = await res.json();
    return extractMessage(body);
  } finally {
    clearTimeout(timer);
  }
}

/** Ask the AI. Tries v1 first, then v2, then returns a fallback message. */
export async function askAi(
  message: string,
  sessionId?: string,
): Promise<AiResult> {
  try {
    const v1 = await callEndpoint(V1, message, sessionId);
    if (v1) return { message: v1, source: "ai_v1" };
  } catch (err) {
    console.warn("[chat] AI v1 failed, falling back to v2:", err);
  }

  try {
    const v2 = await callEndpoint(V2, message, sessionId);
    if (v2) return { message: v2, source: "ai_v2" };
  } catch (err) {
    console.warn("[chat] AI v2 failed:", err);
  }

  return { message: FALLBACK_MESSAGE, source: "fallback" };
}
