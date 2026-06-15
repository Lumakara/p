import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseOwnerReply, isTelegramConfigured } from "./telegram";

describe("parseOwnerReply", () => {
  it("parses inline format: U-<id> : reply", () => {
    const update = {
      message: { text: "U-user123 : Hello user, how can I help?" },
    };
    const result = parseOwnerReply(update);
    expect(result).toEqual({
      userId: "user123",
      text: "Hello user, how can I help?",
    });
  });

  it("parses inline format with no spaces around colon", () => {
    const update = {
      message: { text: "U-abc_def:quick reply" },
    };
    const result = parseOwnerReply(update);
    expect(result).toEqual({
      userId: "abc_def",
      text: "quick reply",
    });
  });

  it("parses reply-to-message format", () => {
    const update = {
      message: {
        text: "Sure, I'll help",
        reply_to_message: {
          text: "PESAN BARU DARI USER\n\nID User : U-user456\nPesan : test",
        },
      },
    };
    const result = parseOwnerReply(update);
    expect(result).toEqual({
      userId: "user456",
      text: "Sure, I'll help",
    });
  });

  it("returns null for non-chat messages", () => {
    expect(parseOwnerReply({})).toBeNull();
    expect(parseOwnerReply({ message: {} })).toBeNull();
    expect(parseOwnerReply({ message: { text: "random text" } })).toBeNull();
    expect(parseOwnerReply(null)).toBeNull();
    expect(parseOwnerReply(undefined)).toBeNull();
  });

  it("returns null when message has no text", () => {
    expect(parseOwnerReply({ message: { photo: [] } })).toBeNull();
  });
});

describe("isTelegramConfigured", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns false when env vars are empty", () => {
    // The module reads env at import time, so with defaults it's false
    expect(isTelegramConfigured()).toBe(false);
  });
});

describe("sendTelegramMessage", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns false when not configured", async () => {
    const { sendTelegramMessage } = await import("./telegram");
    const result = await sendTelegramMessage("test");
    expect(result).toBe(false);
  });
});
