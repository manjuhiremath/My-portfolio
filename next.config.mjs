/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopackScopeHoisting: false, // This fixes the Turbopack build error
  },
};

export default nextConfig;
