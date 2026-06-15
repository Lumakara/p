import { describe, it, expect } from "vitest";
import { rupiah, formatDate, statusColor } from "./format";

describe("rupiah", () => {
  it("formats a positive number with id-ID locale", () => {
    const result = rupiah(50000);
    expect(result).toMatch(/^Rp/);
    expect(result).toContain("50");
  });

  it("returns Rp0 for null", () => {
    expect(rupiah(null)).toBe("Rp0");
  });

  it("returns Rp0 for undefined", () => {
    expect(rupiah(undefined)).toBe("Rp0");
  });

  it("returns Rp0 for 0", () => {
    expect(rupiah(0)).toBe("Rp0");
  });

  it("formats large numbers", () => {
    const result = rupiah(1_000_000);
    expect(result).toMatch(/^Rp/);
    expect(result).toContain("1.000.000");
  });
});

describe("formatDate", () => {
  it('returns "-" for null', () => {
    expect(formatDate(null)).toBe("-");
  });

  it('returns "-" for undefined', () => {
    expect(formatDate(undefined)).toBe("-");
  });

  it("formats a Date object", () => {
    const d = new Date("2024-06-15T10:30:00Z");
    const result = formatDate(d);
    expect(typeof result).toBe("string");
    expect(result).not.toBe("-");
    expect(result.length).toBeGreaterThan(0);
  });

  it("formats an ISO string", () => {
    const result = formatDate("2024-01-01T00:00:00Z");
    expect(typeof result).toBe("string");
    expect(result).not.toBe("-");
  });
});

describe("statusColor", () => {
  it('returns green for "PAID"', () => {
    expect(statusColor("PAID")).toBe("bg-green-500");
  });

  it('returns yellow for "PENDING"', () => {
    expect(statusColor("PENDING")).toBe("bg-yellow-500");
  });

  it('returns red for "EXPIRED"', () => {
    expect(statusColor("EXPIRED")).toBe("bg-red-500");
  });

  it('returns red for "FAILED"', () => {
    expect(statusColor("FAILED")).toBe("bg-red-500");
  });

  it("returns gray for unknown status", () => {
    expect(statusColor("UNKNOWN")).toBe("bg-gray-500");
    expect(statusColor("")).toBe("bg-gray-500");
  });
});
