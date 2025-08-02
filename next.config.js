/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  generateBuildId: async () => {
    // Force completely new build ID every single time
    return `liquidflow-rebuild-${Date.now()}-${Math.random().toString(36).substr(2, 15)}-force`
  },
  // Disable ALL caching to force fresh build
  experimental: {
    isrMemoryCacheSize: 0,
  },
  // Force complete rebuild
  swcMinify: false,
}

module.exports = nextConfig
/* CACHE BUST Sat Aug  2 11:36:33 CDT 2025 */
