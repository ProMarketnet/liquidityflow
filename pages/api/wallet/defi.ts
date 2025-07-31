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

    console.log('Fetching DeFi data for wallet:', walletAddress);

    // Get comprehensive DeFi data using Moralis
    const defiData = await MoralisService.getComprehensiveDeFiData(walletAddress);

    // Process and enhance the data
    const enhancedDefiData = {
      ...defiData,
      address: walletAddress,
      stats: {
        totalProtocols: Object.keys(defiData.protocolBreakdown).filter(
          key => defiData.protocolBreakdown[key] !== null
        ).length,
        hasLiquidityPositions: false,
        hasLendingPositions: false,
        hasStakingPositions: false,
        totalPositions: Array.isArray(defiData.positions) ? defiData.positions.length : 0
      }
    };

    // Analyze position types
    if (defiData.protocolBreakdown) {
      // Check for liquidity pools (Uniswap, Sushiswap)
      const liquidityProtocols = ['uniswap-v2', 'uniswap-v3', 'sushiswap-v2'];
      enhancedDefiData.stats.hasLiquidityPositions = liquidityProtocols.some(
        protocol => defiData.protocolBreakdown[protocol] && 
                   Object.keys(defiData.protocolBreakdown[protocol]).length > 0
      );

      // Check for lending (Aave, Compound)
      const lendingProtocols = ['aave-v2', 'aave-v3'];
      enhancedDefiData.stats.hasLendingPositions = lendingProtocols.some(
        protocol => defiData.protocolBreakdown[protocol] && 
                   Object.keys(defiData.protocolBreakdown[protocol]).length > 0
      );

      // Check for staking (Lido)
      enhancedDefiData.stats.hasStakingPositions = Boolean(
        defiData.protocolBreakdown['lido'] && 
        Object.keys(defiData.protocolBreakdown['lido']).length > 0
      );
    }

    res.status(200).json(enhancedDefiData);
  } catch (error) {
    console.error('Error fetching DeFi data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch DeFi data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 