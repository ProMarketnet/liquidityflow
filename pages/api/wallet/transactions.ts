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

    console.log('Fetching transaction history for wallet:', walletAddress);

    // Get comprehensive transaction history using Moralis
    const txHistory = await MoralisService.getWalletTransactionHistory(walletAddress);

    // Enhanced response with analytics
    const enhancedTxHistory = {
      ...txHistory,
      address: walletAddress,
      analytics: {
        mostActiveCategory: getMostActiveCategory(txHistory.summary),
        recentActivity: getRecentActivityTrend(txHistory.categorized),
        defiInteractionLevel: calculateDeFiLevel(txHistory.summary),
        totalGasSpent: 0, // Could be calculated if gas data is available
      }
    };

    res.status(200).json(enhancedTxHistory);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transaction history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function getMostActiveCategory(summary: any): string {
  if (!summary) return 'unknown';
  
  const categories = {
    'DeFi Swaps': summary.defiSwaps || 0,
    'Liquidity': summary.liquidityActions || 0,
    'Lending': summary.lendingActions || 0,
    'Transfers': summary.regularTransfers || 0
  };

  return Object.entries(categories).reduce((a, b) => 
    categories[a[0] as keyof typeof categories] > categories[b[0] as keyof typeof categories] ? a : b
  )[0];
}

function getRecentActivityTrend(categorized: any): string {
  if (!categorized) return 'inactive';
  
  const totalRecent = Object.values(categorized).reduce((sum: number, category: any) => 
    sum + (Array.isArray(category) ? category.length : 0), 0
  );

  if (totalRecent > 20) return 'very-active';
  if (totalRecent > 10) return 'active';
  if (totalRecent > 3) return 'moderate';
  return 'light';
}

function calculateDeFiLevel(summary: any): string {
  if (!summary) return 'none';
  
  const defiTx = (summary.defiSwaps || 0) + (summary.liquidityActions || 0) + (summary.lendingActions || 0);
  const totalTx = summary.totalTransactions || 1;
  const defiRatio = defiTx / totalTx;

  if (defiRatio > 0.7) return 'expert';
  if (defiRatio > 0.4) return 'advanced';
  if (defiRatio > 0.1) return 'intermediate';
  if (defiTx > 0) return 'beginner';
  return 'none';
} 