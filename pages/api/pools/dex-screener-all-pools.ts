import type { NextApiRequest, NextApiResponse } from 'next';

// DexScreener API base URL
const DEXSCREENER_BASE = 'https://api.dexscreener.com/latest/dex';

// Supported chains and their DEXes on DexScreener
const SUPPORTED_CHAINS = {
  ethereum: {
    name: 'Ethereum',
    dexes: ['uniswap-v2', 'uniswap-v3', 'sushiswap', 'curve'],
    chainId: 'ethereum'
  },
  arbitrum: {
    name: 'Arbitrum',
    dexes: ['uniswap-v3', 'sushiswap', 'curve'],
    chainId: 'arbitrum'
  },
  base: {
    name: 'Base',
    dexes: ['uniswap-v3', 'aerodrome'],
    chainId: 'base'
  },
  optimism: {
    name: 'Optimism',
    dexes: ['uniswap-v3', 'velodrome'],
    chainId: 'optimism'
  },
  solana: {
    name: 'Solana',
    dexes: ['raydium', 'orca', 'jupiter'],
    chainId: 'solana'
  }
};

// Search for token pools on DexScreener
async function searchTokenPools(tokenAddress: string, chainId?: string) {
  try {
    // Try direct token search first
    const tokenUrl = `${DEXSCREENER_BASE}/tokens/${tokenAddress}`;
    console.log(`🔍 Searching DexScreener for token: ${tokenUrl}`);
    
    const response = await fetch(tokenUrl, {
      headers: {
        'accept': 'application/json',
        'user-agent': 'LiquidityFlow/1.0'
      }
    });

    if (!response.ok) {
      console.warn(`DexScreener token search failed: ${response.status}`);
      return { pools: [], error: `DexScreener API failed: ${response.status}` };
    }

    const data = await response.json();
    console.log(`📊 DexScreener found ${data.pairs?.length || 0} pairs for token ${tokenAddress}`);

    if (!data.pairs || data.pairs.length === 0) {
      return { pools: [], error: 'No pairs found on DexScreener' };
    }

    // Filter by chain if specified
    let filteredPairs = data.pairs;
    if (chainId && chainId !== 'all') {
      filteredPairs = data.pairs.filter((pair: any) => 
        pair.chainId?.toLowerCase() === chainId.toLowerCase() ||
        pair.dexId?.toLowerCase().includes(chainId.toLowerCase())
      );
    }

    // Convert to standard format
    const pools = filteredPairs.map((pair: any) => formatDexScreenerPool(pair, tokenAddress));
    
    // Sort by liquidity descending
    pools.sort((a: any, b: any) => (b.liquidity || 0) - (a.liquidity || 0));

    return { pools, error: null };

  } catch (error) {
    console.error('Error searching DexScreener:', error);
    return { pools: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Format DexScreener data to standard format
function formatDexScreenerPool(pair: any, searchToken: string) {
  // Determine which token is the base token (the one we searched for)
  const isToken0Base = pair.baseToken?.address?.toLowerCase() === searchToken.toLowerCase();
  const baseToken = isToken0Base ? pair.baseToken : pair.quoteToken;
  const pairedToken = isToken0Base ? pair.quoteToken : pair.baseToken;

  return {
    pairAddress: pair.pairAddress,
    dex: getDexName(pair.dexId),
    chain: getChainName(pair.chainId),
    baseToken: {
      symbol: baseToken?.symbol || 'UNKNOWN',
      name: baseToken?.name || 'Unknown Token',
      address: baseToken?.address || searchToken,
      decimals: baseToken?.decimals || 18
    },
    pairedToken: {
      symbol: pairedToken?.symbol || 'UNKNOWN',
      name: pairedToken?.name || 'Unknown Token',
      address: pairedToken?.address || '',
      decimals: pairedToken?.decimals || 18
    },
    liquidity: parseFloat(pair.liquidity?.usd || '0'),
    volume24h: parseFloat(pair.volume?.h24 || '0'),
    priceUsd: parseFloat(pair.priceUsd || '0'),
    priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
    reserves: {
      token0: parseFloat(pair.liquidity?.base || '0'),
      token1: parseFloat(pair.liquidity?.quote || '0')
    },
    marketCap: parseFloat(pair.marketCap || '0'),
    fdv: parseFloat(pair.fdv || '0'),
    txCount24h: parseInt(pair.txns?.h24?.buys || '0') + parseInt(pair.txns?.h24?.sells || '0'),
    createdAt: pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toISOString() : null,
    url: pair.url || `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`,
    source: 'DexScreener'
  };
}

// Get readable DEX name
function getDexName(dexId: string): string {
  const dexMap: Record<string, string> = {
    'uniswap-v2': 'Uniswap V2',
    'uniswap-v3': 'Uniswap V3',
    'sushiswap': 'SushiSwap',
    'curve': 'Curve',
    'raydium': 'Raydium',
    'orca': 'Orca',
    'jupiter': 'Jupiter',
    'aerodrome': 'Aerodrome',
    'velodrome': 'Velodrome'
  };
  return dexMap[dexId] || dexId || 'Unknown DEX';
}

// Get readable chain name
function getChainName(chainId: string): string {
  const chainMap: Record<string, string> = {
    'ethereum': 'Ethereum',
    'arbitrum': 'Arbitrum',
    'base': 'Base',
    'optimism': 'Optimism',
    'solana': 'Solana',
    'polygon': 'Polygon',
    'bsc': 'BSC'
  };
  return chainMap[chainId] || chainId || 'Unknown Chain';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, chain } = req.query;
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ 
        error: 'Token address is required',
        example: '/api/pools/dex-screener-all-pools?address=TOKEN_ADDRESS&chain=ethereum'
      });
    }

    console.log(`🔍 Finding ALL pools for token: ${address} on DexScreener`);

    // Search for all pools containing this token
    const chainId = Array.isArray(chain) ? chain[0] : chain;
    const result = await searchTokenPools(address, chainId);

    if (result.error && result.pools.length === 0) {
      return res.status(404).json({
        success: false,
        error: result.error,
        tokenAddress: address,
        suggestions: [
          'Verify the token address is correct',
          'Check if this token has trading pairs on major DEXs',
          'Try searching on dexscreener.com directly',
          'This token might not be actively traded'
        ]
      });
    }

    // Group pools by DEX and chain
    const poolsByDex = result.pools.reduce((acc: any, pool: any) => {
      const key = `${pool.dex} (${pool.chain})`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(pool);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate summary
    const totalLiquidity = result.pools.reduce((sum: number, pool: any) => sum + (pool.liquidity || 0), 0);
    const totalVolume = result.pools.reduce((sum: number, pool: any) => sum + (pool.volume24h || 0), 0);
    const chainsFound = Array.from(new Set(result.pools.map((p: any) => p.chain)));
    const dexsFound = Array.from(new Set(result.pools.map((p: any) => p.dex)));

    res.status(200).json({
      success: true,
      tokenAddress: address,
      summary: {
        totalPools: result.pools.length,
        totalLiquidity,
        totalVolume24h: totalVolume,
        chainsFound,
        dexsFound
      },
      poolsByDex,
      allPools: result.pools,
      source: 'DexScreener API',
      note: chainId ? `Filtered for ${chainId} chain` : 'Showing all chains'
    });

  } catch (error) {
    console.error('❌ DexScreener pools API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch token pools from DexScreener',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 