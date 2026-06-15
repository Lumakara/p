import { describe, it, expect, vi, afterEach } from "vitest";
import { isTurnstileConfigured, verifyTurnstile } from "./turnstile";

describe("isTurnstileConfigured", () => {
  it("returns false when CF_TURNSTILE_SECRET is not set", () => {
    expect(isTurnstileConfigured()).toBe(false);
  });
});

describe("verifyTurnstile", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns true when secret is not configured (dev-friendly bypass)", async () => {
    const result = await verifyTurnstile("any-token");
    expect(result).toBe(true);
  });

  it("returns true even with null token when secret is not configured", async () => {
    expect(await verifyTurnstile(null)).toBe(true);
  });

  it("returns true with undefined token when secret is not configured", async () => {
    expect(await verifyTurnstile(undefined)).toBe(true);
  });
});
