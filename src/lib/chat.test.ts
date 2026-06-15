import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FALLBACK_MESSAGE } from "./chat";

describe("FALLBACK_MESSAGE", () => {
  it("is a non-empty string", () => {
    expect(typeof FALLBACK_MESSAGE).toBe("string");
    expect(FALLBACK_MESSAGE.length).toBeGreaterThan(0);
  });
});

describe("askAi (with mocked module)", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("CHATBOT_API_KEY", "test-key");
    vi.stubEnv("CHATBOT_BASE_URL", "https://mock-api.test/api");
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns ai_v1 source when v1 succeeds", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ status: true, data: "Hello from v1" }),
    });

    const { askAi } = await import("./chat");
    const result = await askAi("test question");
    expect(result.source).toBe("ai_v1");
    expect(result.message).toBe("Hello from v1");
  });

  it("falls back to v2 when v1 fails", async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({ status: true, data: "Hello from v2" }),
      });

    const { askAi } = await import("./chat");
    const result = await askAi("test question");
    expect(result.source).toBe("ai_v2");
    expect(result.message).toBe("Hello from v2");
  });

  it("returns fallback when both v1 and v2 fail", async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("v1 error"))
      .mockRejectedValueOnce(new Error("v2 error"));

    const { askAi } = await import("./chat");
    const result = await askAi("test question");
    expect(result.source).toBe("fallback");
    expect(result.message).toContain("asisten AI sedang tidak tersedia");
  });

  it("returns fallback when v1 returns null and v2 also returns null", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ status: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ status: false }),
      });

    const { askAi } = await import("./chat");
    const result = await askAi("test question");
    expect(result.source).toBe("fallback");
  });

  it("extracts message from data.message format", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () =>
        Promise.resolve({ status: true, data: { message: "nested msg" } }),
    });

    const { askAi } = await import("./chat");
    const result = await askAi("test");
    expect(result.message).toBe("nested msg");
    expect(result.source).toBe("ai_v1");
  });

  it("extracts message from data.result format", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () =>
        Promise.resolve({ status: true, data: { result: "result msg" } }),
    });

    const { askAi } = await import("./chat");
    const result = await askAi("test");
    expect(result.message).toBe("result msg");
  });

  it("extracts message from data.answer format", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () =>
        Promise.resolve({ status: true, data: { answer: "answer msg" } }),
    });

    const { askAi } = await import("./chat");
    const result = await askAi("test");
    expect(result.message).toBe("answer msg");
  });
});
