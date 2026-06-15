import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateOrderId } from "./payment";

describe("generateOrderId", () => {
  it("returns a string matching ORD-YYYYMMDD-XXXXX", () => {
    const id = generateOrderId();
    expect(id).toMatch(/^ORD-\d{8}-\d{5}$/);
  });

  it("uses the current date", () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const expected = `ORD-${y}${m}${d}`;

    const id = generateOrderId();
    expect(id).toContain(expected);
  });

  it("generates the random suffix in range 10000-99999", () => {
    for (let i = 0; i < 50; i++) {
      const id = generateOrderId();
      const suffix = parseInt(id.split("-")[2], 10);
      expect(suffix).toBeGreaterThanOrEqual(10000);
      expect(suffix).toBeLessThanOrEqual(99999);
    }
  });

  it("generates different IDs on successive calls", () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateOrderId()));
    expect(ids.size).toBeGreaterThan(1);
  });
});

describe("createDeposit", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when PAYMENT_API_KEY is not configured", async () => {
    const { createDeposit } = await import("./payment");
    await expect(createDeposit(10000)).rejects.toThrow(
      "PAYMENT_API_KEY is not configured",
    );
  });
});

describe("getDepositStatus", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when PAYMENT_API_KEY is not configured", async () => {
    const { getDepositStatus } = await import("./payment");
    await expect(getDepositStatus("dep-123")).rejects.toThrow(
      "PAYMENT_API_KEY is not configured",
    );
  });
});

describe("getBalance", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when PAYMENT_API_KEY is not configured", async () => {
    const { getBalance } = await import("./payment");
    await expect(getBalance()).rejects.toThrow(
      "PAYMENT_API_KEY is not configured",
    );
  });
});
