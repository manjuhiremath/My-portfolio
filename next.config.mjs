/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopackScopeHoisting: false, // This fixes the Turbopack build error
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
