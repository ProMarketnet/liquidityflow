/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Force cache busting for CSS and static assets
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  
  // Add cache-busting headers
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  
  // Force new CSS compilation
  experimental: {
    forceSwcTransforms: true,
  },
}

// Cache bust: ${Date.now()}
module.exports = nextConfig
