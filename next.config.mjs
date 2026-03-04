/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  experimental: {
    turbopackScopeHoisting: false, // This fixes the Turbopack build error
  },
  images: {
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
