/**
 * Cloudinary configuration (server-side).
 * Docs: https://next.cloudinary.dev/installation
 *
 * On the client we use <CldUploadWidget> / <CldImage> from "next-cloudinary",
 * which read NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and the upload preset directly.
 * This module is for server-side signed operations (e.g. deletes).
 */

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.NEXT_CLOUDINARY_CLOUD_NAME || "",
  apiKey: process.env.CLOUDINARY_API_KEY || process.env.NEXT_CLOUDINARY_API_KEY || "",
  apiSecret: process.env.CLOUDINARY_API_SECRET || process.env.NEXT_CLOUDINARY_API_SECRET || "",
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_CLOUDINARY_UPLOAD_PRESET || "",
};

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudinaryConfig.cloudName);
}
