import type { NextApiRequest, NextApiResponse } from 'next';

// Moralis EVM API configuration
const MORALIS_EVM_BASE = 'https://deep-index.moralis.io/api/v2.2';

// Supported EVM chains for Uniswap
const EVM_CHAINS = {
  eth: {
    id: '0x1',
    name: 'Ethereum',
    moralisId: 'eth',
    currency: 'ETH',
    uniswapVersion: ['v2', 'v3'],
    explorer: 'https://etherscan.io'
  },
  arbitrum: {
    id: '0xa4b1', 
    name: 'Arbitrum',
    moralisId: 'arbitrum',
    currency: 'ETH',
    uniswapVersion: ['v3'],
    explorer: 'https://arbiscan.io'
  },
  base: {
    id: '0x2105',
    name: 'Base',
    moralisId: 'base',
    currency: 'ETH', 
    uniswapVersion: ['v3'],
    explorer: 'https://basescan.org'
  },
  optimism: {
    id: '0xa',
    name: 'Optimism',
    moralisId: 'optimism',
    currency: 'ETH',
    uniswapVersion: ['v3'],
    explorer: 'https://optimistic.etherscan.io'
  },
  polygon: {
    id: '0x89',
    name: 'Polygon',
    moralisId: 'polygon',
    currency: 'MATIC',
    uniswapVersion: ['v3'],
    explorer: 'https://polygonscan.com'
  }
};

// Get Uniswap V3 pair address using Moralis
async function getUniswapV3PairAddress(tokenA: string, tokenB: string, fee: number, chain: string, apiKey: string) {
  if (!apiKey) {
    throw new Error('MORALIS_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${MORALIS_EVM_BASE}/token/${tokenA}/pair/${tokenB}/${fee}?chain=${chain}`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Moralis pair address API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Uniswap V3 pair address:', error);
    return null;
  }
}

// Get token price from Moralis
async function getTokenPrice(tokenAddress: string, chain: string) {
  const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
  if (!MORALIS_API_KEY) {
    throw new Error('MORALIS_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${MORALIS_EVM_BASE}/erc20/${tokenAddress}/price?chain=${chain}`,
      {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn(`Token price API failed for ${tokenAddress}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
}

// Get token metadata from Moralis
async function getTokenMetadata(tokenAddress: string, chain: string) {
  const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
  if (!MORALIS_API_KEY) {
    throw new Error('MORALIS_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${MORALIS_EVM_BASE}/erc20/metadata?chain=${chain}&addresses%5B0%5D=${tokenAddress}`,
      {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn(`Token metadata API failed for ${tokenAddress}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
}

// Get pair reserves from Moralis
async function getPairReserves(pairAddress: string, chain: string) {
  const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
  if (!MORALIS_API_KEY) {
    throw new Error('MORALIS_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${MORALIS_EVM_BASE}/erc20/${pairAddress}/reserves?chain=${chain}`,
      {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn(`Pair reserves API failed for ${pairAddress}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pair reserves:', error);
    return null;
  }
}

// Search for token pairs using Moralis
async function searchTokenPairs(tokenAddress: string, chain: string) {
  const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
  if (!MORALIS_API_KEY) {
    throw new Error('MORALIS_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${MORALIS_EVM_BASE}/erc20/${tokenAddress}/pairs?chain=${chain}&limit=10&exchange=uniswapv3`,
      {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn(`Token pairs API failed for ${tokenAddress}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching token pairs:', error);
    return null;
  }
}

// Format EVM pair data to standard format
function formatEVMPairData(pairData: any, tokenAMetadata: any, tokenBMetadata: any, tokenAPrice: any, tokenBPrice: any, chainInfo: any) {
  return {
    address: pairData.pair_address || pairData.address,
    dex: 'Uniswap V3',
    protocol: 'uniswap-v3',
    chain: chainInfo.name,
    version: 'V3',
    baseToken: {
      symbol: tokenAMetadata?.symbol || 'UNKNOWN',
      name: tokenAMetadata?.name || 'Unknown Token',
      address: pairData.token0?.address || pairData.tokenA,
      decimals: parseInt(tokenAMetadata?.decimals || '18')
    },
    quoteToken: {
      symbol: tokenBMetadata?.symbol || 'UNKNOWN',
      name: tokenBMetadata?.name || 'Unknown Token',
      address: pairData.token1?.address || pairData.tokenB,
      decimals: parseInt(tokenBMetadata?.decimals || '18')
    },
    liquidity: parseFloat(pairData.liquidity_usd || pairData.liquidityUsd || '0'),
    volume24h: parseFloat(pairData.volume_24h || pairData.volume24h || '0'),
    prices: {
      token0Price: parseFloat(pairData.token0_price || '0'),
      token1Price: parseFloat(pairData.token1_price || '0'),
      token0PriceUSD: tokenAPrice?.usdPrice || 0,
      token1PriceUSD: tokenBPrice?.usdPrice || 0
    },
    reserves: {
      token0: parseFloat(pairData.reserve0 || '0'),
      token1: parseFloat(pairData.reserve1 || '0'),
      token0USD: (parseFloat(pairData.reserve0 || '0') * (tokenAPrice?.usdPrice || 0)),
      token1USD: (parseFloat(pairData.reserve1 || '0') * (tokenBPrice?.usdPrice || 0))
    },
    feeTier: pairData.fee_tier || '0.3%',
    txCount: parseInt(pairData.tx_count || '0'),
    createdAt: pairData.created_at || new Date().toISOString(),
    source: 'Moralis EVM API',
    url: `https://app.uniswap.org/#/pools/${pairData.pair_address || pairData.address}`,
    explorerUrl: `${chainInfo.explorer}/address/${pairData.pair_address || pairData.address}`
  };
}

// Generate mock EVM pair data (fallback)
function generateMockEVMPair(address: string, chainInfo: any) {
  return {
    address,
    dex: 'Uniswap V3',
    protocol: 'uniswap-v3',
    chain: chainInfo.name,
    version: 'V3',
    baseToken: {
      symbol: 'MOCK',
      name: 'Mock Token',
      address: address.substring(0, 42),
      decimals: 18
    },
    quoteToken: {
      symbol: chainInfo.currency,
      name: chainInfo.currency === 'ETH' ? 'Ethereum' : chainInfo.currency,
      address: '0x' + '0'.repeat(40),
      decimals: 18
    },
    liquidity: Math.random() * 10000000,
    volume24h: Math.random() * 5000000,
    prices: {
      token0Price: Math.random() * 1000,
      token1Price: Math.random() * 1000,
      token0PriceUSD: Math.random() * 100,
      token1PriceUSD: Math.random() * 3000
    },
    reserves: {
      token0: Math.random() * 1000000,
      token1: Math.random() * 10000,
      token0USD: Math.random() * 5000000,
      token1USD: Math.random() * 5000000
    },
    feeTier: '0.3%',
    txCount: Math.floor(Math.random() * 100000),
    createdAt: new Date().toISOString(),
    source: 'Mock Data (Moralis API Key needed)',
    url: `https://app.uniswap.org/#/pools/${address}`,
    explorerUrl: `${chainInfo.explorer}/address/${address}`,
    note: 'This is mock data. Configure MORALIS_API_KEY for real Uniswap data.'
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, tokenA, tokenB, fee, chain } = req.query;
    
    // Determine chain
    const chainKey = (Array.isArray(chain) ? chain[0] : chain) || 'eth';
    const chainInfo = EVM_CHAINS[chainKey as keyof typeof EVM_CHAINS] || EVM_CHAINS.eth;
    
    console.log(`🔗 Processing EVM request on ${chainInfo.name}`);

    // Handle direct pair address lookup
    if (address && typeof address === 'string') {
      console.log(`🔍 Looking up EVM pair: ${address} on ${chainInfo.name}`);

      const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
      if (!MORALIS_API_KEY) {
        console.warn('⚠️ MORALIS_API_KEY not configured, using mock data');
        const mockData = generateMockEVMPair(address, chainInfo);
        return res.status(200).json({
          success: true,
          pairInfo: mockData
        });
      }

      try {
        // Get pair reserves (this will tell us if it's a valid pair)
        const reserves = await getPairReserves(address, chainInfo.moralisId);
        
        if (reserves) {
          // Get token metadata for both tokens
          const tokenAMetadata = await getTokenMetadata(reserves.token0?.address, chainInfo.moralisId);
          const tokenBMetadata = await getTokenMetadata(reserves.token1?.address, chainInfo.moralisId);
          
          // Get token prices
          const tokenAPrice = await getTokenPrice(reserves.token0?.address, chainInfo.moralisId);
          const tokenBPrice = await getTokenPrice(reserves.token1?.address, chainInfo.moralisId);
          
          const formattedPair = formatEVMPairData(
            { ...reserves, pair_address: address },
            tokenAMetadata,
            tokenBMetadata,
            tokenAPrice,
            tokenBPrice,
            chainInfo
          );
          
          return res.status(200).json({
            success: true,
            pairInfo: formattedPair
          });
        } else {
          // Try to search for pairs if this might be a token address
          const pairs = await searchTokenPairs(address, chainInfo.moralisId);
          
          if (pairs && pairs.result && pairs.result.length > 0) {
            const firstPair = pairs.result[0];
            const tokenAMetadata = await getTokenMetadata(firstPair.token0?.address, chainInfo.moralisId);
            const tokenBMetadata = await getTokenMetadata(firstPair.token1?.address, chainInfo.moralisId);
            const tokenAPrice = await getTokenPrice(firstPair.token0?.address, chainInfo.moralisId);
            const tokenBPrice = await getTokenPrice(firstPair.token1?.address, chainInfo.moralisId);
            
            const formattedPair = formatEVMPairData(
              firstPair,
              tokenAMetadata,
              tokenBMetadata,
              tokenAPrice,
              tokenBPrice,
              chainInfo
            );
            
            return res.status(200).json({
              success: true,
              pairInfo: formattedPair,
              foundPairs: pairs.result.length,
              note: `Found ${pairs.result.length} pairs for this token`
            });
          } else {
            return res.status(404).json({
              success: false,
              error: 'No Uniswap pairs found for this address',
              suggestions: [
                'Verify the address is a valid Uniswap pair or token',
                `Check if this token is listed on Uniswap V3 on ${chainInfo.name}`,
                'Try searching on app.uniswap.org'
              ]
            });
          }
        }

      } catch (error) {
        console.error(`❌ Moralis EVM API error on ${chainInfo.name}:`, error);
        const mockData = generateMockEVMPair(address, chainInfo);
        return res.status(200).json({
          success: true,
          pairInfo: mockData,
          note: 'API error - showing mock data'
        });
      }
    }

    // Handle token pair creation/lookup
    if (tokenA && tokenB && typeof tokenA === 'string' && typeof tokenB === 'string') {
      const feeTier = parseInt((Array.isArray(fee) ? fee[0] : fee) || '3000'); // Default 0.3%
      
      console.log(`🔍 Looking up Uniswap V3 pair: ${tokenA}/${tokenB} (${feeTier/10000}%) on ${chainInfo.name}`);

      const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
      if (!MORALIS_API_KEY) {
        console.warn('⚠️ MORALIS_API_KEY not configured, using mock data');
        const mockData = generateMockEVMPair(`${tokenA}-${tokenB}`, chainInfo);
        return res.status(200).json({
          success: true,
          pairInfo: mockData
        });
      }

      try {
        const pairData = await getUniswapV3PairAddress(tokenA, tokenB, feeTier, chainInfo.moralisId, MORALIS_API_KEY);
        
        if (pairData && pairData.pair_address) {
          // Get additional data for the pair
          const reserves = await getPairReserves(pairData.pair_address, chainInfo.moralisId);
          const tokenAMetadata = await getTokenMetadata(tokenA, chainInfo.moralisId);
          const tokenBMetadata = await getTokenMetadata(tokenB, chainInfo.moralisId);
          const tokenAPrice = await getTokenPrice(tokenA, chainInfo.moralisId);
          const tokenBPrice = await getTokenPrice(tokenB, chainInfo.moralisId);
          
          const formattedPair = formatEVMPairData(
            { ...pairData, ...reserves },
            tokenAMetadata,
            tokenBMetadata,
            tokenAPrice,
            tokenBPrice,
            chainInfo
          );
          
          return res.status(200).json({
            success: true,
            pairInfo: formattedPair
          });
        } else {
          return res.status(404).json({
            success: false,
            error: `No Uniswap V3 pair found for ${tokenA}/${tokenB} with ${feeTier/10000}% fee on ${chainInfo.name}`,
            suggestions: [
              'Try different fee tiers: 500 (0.05%), 3000 (0.3%), 10000 (1%)',
              'Verify token addresses are correct',
              'Check if this pair exists on Uniswap V3',
              `Search on app.uniswap.org for ${chainInfo.name} pairs`
            ]
          });
        }

      } catch (error) {
        console.error(`❌ Moralis EVM pair lookup error on ${chainInfo.name}:`, error);
        const mockData = generateMockEVMPair(`${tokenA}-${tokenB}`, chainInfo);
        return res.status(200).json({
          success: true,
          pairInfo: mockData,
          note: 'API error - showing mock data'
        });
      }
    }

    // No valid parameters
    return res.status(400).json({
      error: 'Please provide either an address or tokenA/tokenB parameters',
      examples: {
        'Pair lookup': `/api/pools/moralis-evm?address=PAIR_ADDRESS&chain=${chainKey}`,
        'Token pair': `/api/pools/moralis-evm?tokenA=TOKEN_A&tokenB=TOKEN_B&fee=3000&chain=${chainKey}`,
        'Search token': `/api/pools/moralis-evm?address=TOKEN_ADDRESS&chain=${chainKey}`
      },
      supportedChains: Object.entries(EVM_CHAINS).map(([key, chain]) => ({
        key,
        name: chain.name,
        currency: chain.currency,
        uniswapVersions: chain.uniswapVersion
      })),
      supportedFeeTiers: [
        { fee: 500, percentage: '0.05%' },
        { fee: 3000, percentage: '0.3%' },
        { fee: 10000, percentage: '1%' }
      ]
    });

  } catch (error) {
    console.error('❌ Moralis EVM API handler error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch EVM DEX data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 