/**
 * Cloudinary configuration (server-side).
 * Docs: https://next.cloudinary.dev/installation
 *
 * On the client we use <CldUploadWidget> / <CldImage> from "next-cloudinary",
 * which read NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and the upload preset directly.
 * This module is for server-side signed operations (e.g. deletes).
 */

import { env } from "./env";

export const cloudinaryConfig = env.cloudinary;

export function isCloudinaryConfigured(): boolean {
  return env.cloudinary.isConfigured;
}
