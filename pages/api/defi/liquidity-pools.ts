import type { NextApiRequest, NextApiResponse } from 'next';
import { getLiquidityPoolPositions } from '@/lib/moralis';
import { ethers } from 'ethers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, protocol } = req.query;
    const walletAddress = Array.isArray(address) ? address[0] : address;
    const targetProtocol = Array.isArray(protocol) ? protocol[0] : protocol || 'uniswap-v3';

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // 🌊 Get liquidity pool positions using advanced Moralis DeFi API
    const poolPositions = await getLiquidityPoolPositions(walletAddress, targetProtocol);

    // Also get positions from other major DEXs for comparison
    const otherProtocols = ['uniswap-v2', 'sushiswap', 'pancakeswap-v3'];
    const otherPoolPromises = otherProtocols
      .filter(p => p !== targetProtocol)
      .map(async (protocol) => {
        try {
          const positions = await getLiquidityPoolPositions(walletAddress, protocol);
          return { protocol, positions };
        } catch (error) {
          console.error(`Error fetching ${protocol} positions:`, error);
          return { protocol, positions: null };
        }
      });

    const otherPoolResults = await Promise.all(otherPoolPromises);

    // Format response for dashboard consumption
    const response = {
      address: walletAddress,
      primaryProtocol: targetProtocol,
      timestamp: new Date().toISOString(),
      
      // Primary protocol data
      primary: {
        protocol: poolPositions.protocol,
        totalPools: poolPositions.totalPools,
        totalLiquidity: poolPositions.totalLiquidity,
        totalFees24h: poolPositions.totalFees24h,
        positions: poolPositions.positions.map((pos: any) => ({
          pool: pos.pool,
          tokens: pos.tokens,
          liquidity: pos.liquidity,
          fees24h: pos.fees24h,
          apr: pos.apr,
          protocolName: pos.protocolName
        }))
      },
      
      // Other protocol summaries
      others: otherPoolResults
        .filter(result => result.positions && result.positions.totalPools > 0)
        .map(result => ({
          protocol: result.protocol,
          totalPools: result.positions?.totalPools || 0,
          totalLiquidity: result.positions?.totalLiquidity || 0,
          totalFees24h: result.positions?.totalFees24h || 0
        })),
      
      // Combined summary
      summary: {
        totalProtocols: 1 + otherPoolResults.filter(r => r.positions && r.positions.totalPools > 0).length,
        totalLiquidity: poolPositions.totalLiquidity + 
          otherPoolResults.reduce((sum, result) => sum + (result.positions?.totalLiquidity || 0), 0),
        totalFees24h: poolPositions.totalFees24h + 
          otherPoolResults.reduce((sum, result) => sum + (result.positions?.totalFees24h || 0), 0),
        totalPools: poolPositions.totalPools + 
          otherPoolResults.reduce((sum, result) => sum + (result.positions?.totalPools || 0), 0)
      },
      
      // Raw data for advanced usage
      raw: {
        primary: poolPositions,
        others: otherPoolResults
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching liquidity pool positions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch liquidity pool positions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 