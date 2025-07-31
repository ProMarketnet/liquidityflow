import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import axios from 'axios';

interface Pool {
  address: string;
  dex: string;
  token0Symbol: string;
  token1Symbol: string;
  liquidity: number;
  volume24h: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Pool[] | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Discover pools from multiple DEXs
    const pools: Pool[] = [];

    // Uniswap V3 Discovery
    try {
      const uniswapPools = await discoverUniswapPools(walletAddress);
      pools.push(...uniswapPools);
    } catch (error) {
      console.error('Error discovering Uniswap pools:', error);
    }

    // SushiSwap Discovery (if needed)
    // const sushiPools = await discoverSushiSwapPools(walletAddress);
    // pools.push(...sushiPools);

    // If no pools found, return demo pools
    if (pools.length === 0) {
      const demoPools: Pool[] = [
        {
          address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
          dex: 'Uniswap V3',
          token0Symbol: 'USDC',
          token1Symbol: 'ETH',
          liquidity: 45000000,
          volume24h: 12500000
        },
        {
          address: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
          dex: 'Uniswap V3', 
          token0Symbol: 'USDC',
          token1Symbol: 'ETH',
          liquidity: 28000000,
          volume24h: 8200000
        },
        {
          address: '0x4e68ccd3e89f51c3074ca5072bbac773960dfa36',
          dex: 'Uniswap V3',
          token0Symbol: 'ETH',
          token1Symbol: 'USDT',
          liquidity: 67000000,
          volume24h: 18500000
        }
      ];
      return res.status(200).json(demoPools);
    }

    res.status(200).json(pools);
  } catch (error) {
    console.error('Error discovering pools:', error);
    res.status(500).json({ error: 'Failed to discover pools' });
  }
}

async function discoverUniswapPools(walletAddress: string): Promise<Pool[]> {
  try {
    const query = `
      query GetLiquidityPositions($owner: String!) {
        positions(where: { owner: $owner }) {
          id
          pool {
            id
            totalValueLockedUSD
            token0 {
              symbol
              decimals
            }
            token1 {
              symbol
              decimals
            }
            poolDayData(first: 1, orderBy: date, orderDirection: desc) {
              volumeUSD
            }
          }
          liquidity
        }
      }
    `;

    const response = await axios.post(
      process.env.UNISWAP_SUBGRAPH_URL || 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
      {
        query,
        variables: { owner: walletAddress.toLowerCase() }
      }
    );

    if (!response.data?.data?.positions) {
      return [];
    }

    const pools: Pool[] = [];
    const seenPools = new Set<string>();

    for (const position of response.data.data.positions) {
      const pool = position.pool;
      
      // Skip if we've already added this pool
      if (seenPools.has(pool.id)) continue;
      seenPools.add(pool.id);

      // Only include pools with significant liquidity
      const liquidity = parseFloat(pool.totalValueLockedUSD);
      if (liquidity < 10000) continue; // Minimum $10k liquidity

      pools.push({
        address: pool.id,
        dex: 'Uniswap V3',
        token0Symbol: pool.token0.symbol,
        token1Symbol: pool.token1.symbol,
        liquidity: liquidity,
        volume24h: pool.poolDayData[0]?.volumeUSD ? parseFloat(pool.poolDayData[0].volumeUSD) : 0
      });
    }

    return pools;
  } catch (error) {
    console.error('Error fetching Uniswap positions:', error);
    return [];
  }
} 