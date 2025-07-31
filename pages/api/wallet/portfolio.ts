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

    // Get wallet portfolio with USD prices using Moralis
    const [portfolio, tokensWithPrices, ethPrice] = await Promise.all([
      MoralisService.getWalletPortfolio(walletAddress),
      MoralisService.getWalletTokenBalancesWithPrices(walletAddress),
      MoralisService.getEthPrice()
    ]);

    // Calculate total portfolio value
    const ethBalance = parseFloat(portfolio.nativeBalance) / 1e18;
    const ethValue = ethBalance * ethPrice;
    const tokenValue = tokensWithPrices.reduce((sum, token) => sum + (token.usd_value || 0), 0);
    const totalPortfolioValue = ethValue + tokenValue;

    // Enhanced response with USD values
    const enhancedPortfolio = {
      ...portfolio,
      tokenBalances: tokensWithPrices,
      address: walletAddress,
      lastUpdated: new Date().toISOString(),
      prices: {
        ethPrice,
        ethValue,
        tokenValue,
        totalValue: totalPortfolioValue
      },
      summary: {
        totalTokens: tokensWithPrices.length,
        verifiedTokens: tokensWithPrices.filter(t => t.verified_contract).length,
        tokensWithValue: tokensWithPrices.filter(t => t.usd_value > 0).length,
        ethBalance: ethBalance.toFixed(4),
        ethValueUsd: ethValue.toFixed(2),
        tokenValueUsd: tokenValue.toFixed(2),
        totalValueUsd: totalPortfolioValue.toFixed(2)
      }
    };

    res.status(200).json(enhancedPortfolio);
  } catch (error) {
    console.error('Error fetching wallet portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
} 