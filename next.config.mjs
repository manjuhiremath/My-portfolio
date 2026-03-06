import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  experimental: {
    turbopackScopeHoisting: false, // This fixes the Turbopack build error
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    domains: [
      "res.cloudinary.com",
      "images.unsplash.com",
      "unsplash.com",
      "upload.wikimedia.org",
      "openrouter.ai",
      "www.gravatar.com",
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "openrouter.ai",
      },
      {
        protocol: "https",
        hostname: "www.gravatar.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:all*\\.(js|css|woff2|woff|ttf|otf|svg|jpg|jpeg|png|webp|avif|gif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
