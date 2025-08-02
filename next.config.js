/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  generateBuildId: async () => {
    // Force new build ID every time
    return `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  // Disable all caching during deployment issues
  experimental: {
    isrMemoryCacheSize: 0,
  },
}

module.exports = nextConfig
