import { Pool } from '@prisma/client';
import axios from 'axios';

export interface DexData {
  totalLiquidity: number;
  token0Reserve: number;
  token1Reserve: number;
  volume24h: number;
  lpCount: number;
  slippage1Percent: number;
  slippage5Percent: number;
  priceImpact: number;
}

export async function getDexData(pool: Pool): Promise<DexData> {
  switch (pool.dex.toLowerCase()) {
    case 'uniswap':
      return getUniswapData(pool);
    case 'sushiswap':
      return getSushiswapData(pool);
    case 'pancakeswap':
      return getPancakeswapData(pool);
    default:
      throw new Error(`Unsupported DEX: ${pool.dex}`);
  }
}

async function getUniswapData(pool: Pool): Promise<DexData> {
  try {
    const query = `
      query GetPool($poolAddress: String!) {
        pool(id: $poolAddress) {
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
          liquidity
          token0Price
          token1Price
        }
      }
    `;

    const response = await axios.post(process.env.UNISWAP_SUBGRAPH_URL!, {
      query,
      variables: { poolAddress: pool.address.toLowerCase() }
    });

    const poolData = response.data.data.pool;
    
    if (!poolData) {
      throw new Error(`Pool not found: ${pool.address}`);
    }

    // Calculate slippage for 1% trade size
    const slippage1Percent = calculateSlippage(
      parseFloat(poolData.totalValueLockedUSD),
      0.01
    );

    return {
      totalLiquidity: parseFloat(poolData.totalValueLockedUSD),
      token0Reserve: parseFloat(poolData.liquidity) * parseFloat(poolData.token0Price),
      token1Reserve: parseFloat(poolData.liquidity) * parseFloat(poolData.token1Price),
      volume24h: poolData.poolDayData[0]?.volumeUSD ? parseFloat(poolData.poolDayData[0].volumeUSD) : 0,
      lpCount: 0, // Not available in basic query
      slippage1Percent,
      slippage5Percent: calculateSlippage(parseFloat(poolData.totalValueLockedUSD), 0.05),
      priceImpact: slippage1Percent
    };
  } catch (error) {
    console.error('Error fetching Uniswap data:', error);
    throw error;
  }
}

async function getSushiswapData(pool: Pool): Promise<DexData> {
  // Similar implementation for SushiSwap
  // This would use SushiSwap's API or subgraph
  return {
    totalLiquidity: 50000, // Mock data
    token0Reserve: 25000,
    token1Reserve: 25000,
    volume24h: 10000,
    lpCount: 15,
    slippage1Percent: 2.5,
    slippage5Percent: 8.2,
    priceImpact: 2.5
  };
}

async function getPancakeswapData(pool: Pool): Promise<DexData> {
  // Similar implementation for PancakeSwap
  return {
    totalLiquidity: 35000, // Mock data
    token0Reserve: 17500,
    token1Reserve: 17500,
    volume24h: 7500,
    lpCount: 12,
    slippage1Percent: 3.1,
    slippage5Percent: 9.8,
    priceImpact: 3.1
  };
}

function calculateSlippage(liquidity: number, tradePercent: number): number {
  // Simplified slippage calculation
  // In reality, this would be more complex based on AMM math
  const tradeSize = liquidity * tradePercent;
  const slippage = (tradeSize / liquidity) * 100;
  return Math.min(slippage * 2, 50); // Cap at 50%
}
