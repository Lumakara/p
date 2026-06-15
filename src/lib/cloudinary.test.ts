import { describe, it, expect } from "vitest";
import { isCloudinaryConfigured, cloudinaryConfig } from "./cloudinary";

describe("isCloudinaryConfigured", () => {
  it("returns false when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set", () => {
    expect(isCloudinaryConfigured()).toBe(false);
  });
});

describe("cloudinaryConfig", () => {
  it("has expected shape with default empty strings", () => {
    expect(cloudinaryConfig).toHaveProperty("cloudName");
    expect(cloudinaryConfig).toHaveProperty("apiKey");
    expect(cloudinaryConfig).toHaveProperty("apiSecret");
    expect(cloudinaryConfig).toHaveProperty("uploadPreset");
    expect(typeof cloudinaryConfig.cloudName).toBe("string");
    expect(typeof cloudinaryConfig.apiKey).toBe("string");
  });
});
