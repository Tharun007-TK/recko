import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Strict mode for catching potential issues early.
   * Disable only if a third-party library is incompatible.
   */
  reactStrictMode: true,

  /**
   * Image domains – extend when integrating Supabase Storage.
   * Example: images: { domains: ["<project>.supabase.co"] }
   */
  images: {
    formats: ["image/avif", "image/webp"],
  },

  /**
   * Suppress the "x-powered-by: Next.js" header for security.
   */
  poweredByHeader: false,
};

export default nextConfig;
