"use client";

import { CldUploadWidget } from "next-cloudinary";

/**
 * Cloudinary upload trigger. Requires:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (unsigned)
 * Docs: https://next.cloudinary.dev/installation
 *
 * If not configured, falls back to a disabled wrapper (the manual URL input
 * in the product form still works).
 */
export function CloudinaryUpload({
  children,
  onUploaded,
}: {
  children: React.ReactNode;
  onUploaded: (url: string) => void;
}) {
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!preset || !cloud) {
    return <>{children}</>;
  }

  return (
    <CldUploadWidget
      uploadPreset={preset}
      onSuccess={(result) => {
        const info = result?.info;
        if (info && typeof info !== "string" && "secure_url" in info) {
          onUploaded(info.secure_url as string);
        }
      }}
    >
      {({ open }) => (
        <span onClick={() => open()} role="button">
          {children}
        </span>
      )}
    </CldUploadWidget>
  );
}
