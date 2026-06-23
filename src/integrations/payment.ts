/**
 * RamaShop Payment Gateway client (server-side only).
 * Docs: https://ramashop.my.id/docs.html
 *
 * RamaShop uses a QRIS deposit + polling model (no webhook):
 *   - POST /deposit/create  -> returns a QRIS image + unique amount + depositId
 *   - GET  /deposit/status/{depositId} -> poll until "success"
 *
 * Auth is via the "X-API-Key" header.
 */

import { randomInt, randomBytes } from "crypto";

const BASE_URL =
  process.env.PAYMENT_BASE_URL || process.env.NEXT_PAYMENT_BASE_URL || "https://ramashop.my.id/api/public";
const API_KEY = process.env.PAYMENT_API_KEY || process.env.NEXT_PAYMENT_API_KEY || "";

function headers(json = false): HeadersInit {
  const h: Record<string, string> = { "X-API-Key": API_KEY };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

export interface CreateDepositResult {
  depositId: string;
  amount: number;
  uniqueCode: number;
  totalAmount: number;
  fee: number;
  qrImage: string;
  qrString: string;
  status: string;
  expiredAt: string;
  message?: string;
}

export type RamaStatus = "pending" | "success" | "already" | "expired" | "failed";

export interface DepositStatusResult {
  status: RamaStatus;
  paidAmount?: number;
  paidAt?: string;
}

import { safeJson } from "@/lib/fetch";

interface DepositCreateEnvelope {
  success?: boolean;
  message?: string;
  data?: {
    depositId: string;
    amount: number;
    uniqueCode: number;
    totalAmount: number;
    fee?: number;
    qrImage: string;
    qrString: string;
    status?: string;
    expiredAt: string;
  };
}

interface DepositStatusEnvelope {
  status?: boolean;
  success?: boolean;
  message?: string;
  data?: { status?: string; paidAmount?: number; paidAt?: string; depositId?: string };
}

interface BalanceEnvelope {
  success?: boolean;
  message?: string;
  data?: { balance?: number; username?: string; email?: string };
}

/** Create a QRIS deposit. `amount` is the base amount in Rupiah. */
export async function createDeposit(
  amount: number,
): Promise<CreateDepositResult> {
  if (!API_KEY) throw new Error("PAYMENT_API_KEY is not configured");

  const res = await fetch(`${BASE_URL}/deposit/create`, {
    method: "POST",
    headers: headers(true),
    body: JSON.stringify({ amount, method: "qris" }),
    cache: "no-store",
  });

  const body = await safeJson<DepositCreateEnvelope>(res);
  if (!res.ok || !body?.success) {
    throw new Error(
      body?.message || `Failed to create deposit (status ${res.status})`,
    );
  }

  const d = body.data;
  if (!d) {
    throw new Error("Payment gateway returned a malformed deposit response");
  }
  return {
    depositId: d.depositId,
    amount: d.amount,
    uniqueCode: d.uniqueCode,
    totalAmount: d.totalAmount,
    fee: d.fee ?? 0,
    qrImage: d.qrImage,
    qrString: d.qrString,
    status: d.status ?? "pending",
    expiredAt: d.expiredAt,
    message: body.message,
  };
}

/** Poll the status of a deposit. */
export async function getDepositStatus(
  depositId: string,
): Promise<DepositStatusResult> {
  if (!API_KEY) throw new Error("PAYMENT_API_KEY is not configured");

  const res = await fetch(`${BASE_URL}/deposit/status/${depositId}`, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });

  const body = await safeJson<DepositStatusEnvelope>(res);
  const isOk = body?.status === true || body?.success === true;
  if (!res.ok || !isOk) {
    throw new Error(
      body?.message || `Failed to fetch deposit status (status ${res.status})`,
    );
  }

  return {
    status: body.data?.status as RamaStatus,
    paidAmount: body.data?.paidAmount,
    paidAt: body.data?.paidAt,
  };
}

/** Get the current account balance (used for the dashboard health check). */
export async function getBalance(): Promise<{
  balance: number;
  username?: string;
  email?: string;
}> {
  if (!API_KEY) throw new Error("PAYMENT_API_KEY is not configured");

  const res = await fetch(`${BASE_URL}/balance`, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });
  const body = await safeJson<BalanceEnvelope>(res);
  if (!res.ok || !body?.success) {
    throw new Error(body?.message || "Failed to fetch balance");
  }
  return {
    balance: body.data?.balance ?? 0,
    username: body.data?.username,
    email: body.data?.email,
  };
}

/** Generate an order id in the format ORD-YYYYMMDD-XXXXX. */
export function generateOrderId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = randomInt(10000, 100000);
  return `ORD-${y}${m}${d}-${rand}`;
}

/** Generate a non-guessable product key in the format KEY-XXXX-XXXX-XXXX. */
export function generateProductKey(): string {
  const part = () => randomBytes(3).toString("hex").slice(0, 4).toUpperCase();
  return `KEY-${part()}-${part()}-${part()}`;
}
