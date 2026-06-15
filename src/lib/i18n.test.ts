import { describe, it, expect } from "vitest";
import { t, translations } from "./i18n";

describe("t", () => {
  it("returns Indonesian translation for id", () => {
    expect(t("home", "id")).toBe("Beranda");
  });

  it("returns English translation for en", () => {
    expect(t("home", "en")).toBe("Home");
  });

  it("returns the key as string for an unknown key", () => {
    const unknownKey = "nonExistentKey" as keyof typeof translations;
    expect(t(unknownKey, "en")).toBe("nonExistentKey");
  });

  it("translates all known keys without throwing", () => {
    const keys = Object.keys(translations) as (keyof typeof translations)[];
    for (const key of keys) {
      expect(typeof t(key, "id")).toBe("string");
      expect(typeof t(key, "en")).toBe("string");
      expect(t(key, "id").length).toBeGreaterThan(0);
      expect(t(key, "en").length).toBeGreaterThan(0);
    }
  });
});

describe("translations dictionary", () => {
  it("has both id and en for every entry", () => {
    for (const [key, val] of Object.entries(translations)) {
      expect(val).toHaveProperty("id");
      expect(val).toHaveProperty("en");
      expect(typeof val.id).toBe("string");
      expect(typeof val.en).toBe("string");
    }
  });

  it("contains expected keys", () => {
    const expectedKeys = [
      "home",
      "products",
      "cart",
      "orders",
      "checkout",
      "signIn",
      "signUp",
    ];
    for (const key of expectedKeys) {
      expect(translations).toHaveProperty(key);
    }
  });
});
