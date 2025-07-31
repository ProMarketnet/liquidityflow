import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { MoralisService } from '@/lib/moralis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    console.log('Fetching portfolio for wallet:', walletAddress);

    // Get wallet portfolio using Moralis
    const portfolio = await MoralisService.getWalletPortfolio(walletAddress);

    // Enhanced response with additional metadata
    const enhancedPortfolio = {
      ...portfolio,
      address: walletAddress,
      lastUpdated: new Date().toISOString(),
      summary: {
        totalTokens: portfolio.tokenBalances.length,
        verifiedTokens: portfolio.tokenBalances.filter(t => t.verified_contract).length,
        spamTokens: portfolio.tokenBalances.filter(t => t.possible_spam).length,
        ethBalance: (parseFloat(portfolio.nativeBalance) / 1e18).toFixed(4),
      }
    };

    res.status(200).json(enhancedPortfolio);
  } catch (error) {
    console.error('Error fetching wallet portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
} 