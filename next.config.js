/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/liquidflow_dev',
    JWT_SECRET: process.env.JWT_SECRET || 'mock-jwt-secret-for-development-only',
    ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/demo',
  },
  // Removed experimental.appDir as it's deprecated
}

module.exports = nextConfig
