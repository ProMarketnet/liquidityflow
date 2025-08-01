import type { NextApiRequest, NextApiResponse } from 'next';
import { getYieldFarmingPositions, getLendingBorrowingPositions } from '@/lib/moralis';
import { ethers } from 'ethers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;
    const walletAddress = Array.isArray(address) ? address[0] : address;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // 🌾 Get comprehensive yield farming and lending data
    const [yieldFarmingData, lendingData] = await Promise.all([
      getYieldFarmingPositions(walletAddress),
      getLendingBorrowingPositions(walletAddress)
    ]);

    // Format response for dashboard consumption
    const response = {
      address: walletAddress,
      timestamp: new Date().toISOString(),
      
      // Yield farming summary
      yieldFarming: {
        totalStaked: yieldFarmingData.totalStaked,
        totalRewards: yieldFarmingData.totalRewards,
        averageApy: yieldFarmingData.averageApy,
        protocolCount: yieldFarmingData.protocolCount,
        positions: yieldFarmingData.positions.map((pos: any) => ({
          protocol: pos.protocol,
          type: pos.position_type,
          value: pos.total_usd_value || 0,
          apy: pos.apy,
          rewards: pos.rewards,
          tokens: pos.position_tokens || []
        }))
      },
      
      // Lending/Borrowing summary
      lending: {
        totalLent: lendingData.lending.totalValue,
        totalBorrowed: lendingData.borrowing.totalValue,
        healthFactor: lendingData.healthFactor,
        netPosition: lendingData.lending.totalValue - lendingData.borrowing.totalValue,
        lendingPositions: lendingData.lending.positions.map((pos: any) => ({
          protocol: pos.protocol,
          asset: pos.asset_symbol || pos.symbol,
          value: pos.total_usd_value || 0,
          apr: pos.apr || 0
        })),
        borrowingPositions: lendingData.borrowing.positions.map((pos: any) => ({
          protocol: pos.protocol,
          asset: pos.asset_symbol || pos.symbol,
          value: pos.total_usd_value || 0,
          apr: pos.apr || 0
        }))
      },
      
      // Combined DeFi summary
      summary: {
        totalValue: yieldFarmingData.totalStaked + lendingData.lending.totalValue,
        totalEarnings: yieldFarmingData.totalRewards,
        totalBorrowed: lendingData.borrowing.totalValue,
        netWorth: (yieldFarmingData.totalStaked + lendingData.lending.totalValue) - lendingData.borrowing.totalValue,
        riskLevel: lendingData.healthFactor ? (lendingData.healthFactor > 2 ? 'Low' : lendingData.healthFactor > 1.5 ? 'Medium' : 'High') : 'N/A'
      },
      
      // Raw data for advanced usage
      raw: {
        yieldFarming: yieldFarmingData,
        lending: lendingData
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching yield farming data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch yield farming data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 