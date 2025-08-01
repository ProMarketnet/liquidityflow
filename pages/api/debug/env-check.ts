import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const envCheck = {
    MORALIS_API_KEY_EXISTS: !!process.env.MORALIS_API_KEY,
    MORALIS_API_KEY_LENGTH: process.env.MORALIS_API_KEY?.length || 0,
    MORALIS_API_KEY_PREFIX: process.env.MORALIS_API_KEY?.substring(0, 10) || 'not_found',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    RAILWAY: process.env.RAILWAY_ENVIRONMENT,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  };

  res.status(200).json(envCheck);
} 