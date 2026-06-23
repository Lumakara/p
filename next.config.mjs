/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "api.qrserver.com" },
      { protocol: "https", hostname: "ramashop.my.id" },
      { protocol: "https", hostname: "larabert-qrgen.hf.space" },
      { protocol: "https", hostname: "cdn.neoxr.eu" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
  eslint: {
    // Lint is run separately; don't fail production builds on lint warnings.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
