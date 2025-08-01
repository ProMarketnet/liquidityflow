import type { NextApiRequest, NextApiResponse } from 'next';

// Moralis Solana API configuration
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const MORALIS_SOLANA_BASE = 'https://solana-gateway.moralis.io';

// Supported Solana DEXs (focusing on Raydium and Orca)
const SOLANA_DEXS = {
  raydium: {
    name: 'Raydium',
    id: 'raydium',
    logo: '🌊',
    website: 'https://raydium.io'
  },
  orca: {
    name: 'Orca',
    id: 'orca', 
    logo: '🐋',
    website: 'https://orca.so'
  }
};

// Fetch Solana token price from Moralis
async function fetchSolanaTokenPrice(mintAddress: string) {
  if (!MORALIS_API_KEY) {
    throw new Error('MORALIS_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${MORALIS_SOLANA_BASE}/token/${mintAddress}/price`,
      {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Moralis token price API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Solana token price:', error);
    return null;
  }
}

// Fetch Solana token metadata from Moralis
async function fetchSolanaTokenMetadata(mintAddress: string) {
  if (!MORALIS_API_KEY) {
    throw new Error('MORALIS_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${MORALIS_SOLANA_BASE}/token/${mintAddress}/metadata`,
      {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Moralis token metadata API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Solana token metadata:', error);
    return null;
  }
}

// Fetch Solana DEX pairs from Moralis (for Raydium/Orca)
async function fetchSolanaDEXPairs(tokenA: string, tokenB?: string, dex?: string) {
  if (!MORALIS_API_KEY) {
    throw new Error('MORALIS_API_KEY not configured');
  }

  try {
    let url = `${MORALIS_SOLANA_BASE}/pairs`;
    const params = new URLSearchParams();
    
    if (tokenA) params.append('token_a', tokenA);
    if (tokenB) params.append('token_b', tokenB);
    if (dex) params.append('exchange', dex);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log(`🔍 Fetching Solana DEX pairs: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'X-API-Key': MORALIS_API_KEY,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Moralis DEX pairs API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Solana DEX pairs:', error);
    return null;
  }
}

// Format Solana pair data to standard format
function formatSolanaPairData(pairData: any, tokenAMetadata: any, tokenBMetadata: any, priceData: any) {
  const dexInfo = SOLANA_DEXS[pairData.exchange as keyof typeof SOLANA_DEXS] || {
    name: pairData.exchange || 'Unknown DEX',
    id: pairData.exchange || 'unknown',
    logo: '🏪',
    website: '#'
  };

  return {
    address: pairData.pair_address || pairData.address,
    dex: dexInfo.name,
    protocol: dexInfo.id,
    chain: 'Solana',
    version: 'V1',
    baseToken: {
      symbol: tokenAMetadata?.symbol || 'UNKNOWN',
      name: tokenAMetadata?.name || 'Unknown Token',
      address: pairData.token_a || pairData.tokenA,
      decimals: tokenAMetadata?.decimals || 9
    },
    quoteToken: {
      symbol: tokenBMetadata?.symbol || 'UNKNOWN',
      name: tokenBMetadata?.name || 'Unknown Token', 
      address: pairData.token_b || pairData.tokenB,
      decimals: tokenBMetadata?.decimals || 9
    },
    liquidity: parseFloat(pairData.liquidity_usd || pairData.liquidityUsd || '0'),
    volume24h: parseFloat(pairData.volume_24h || pairData.volume24h || '0'),
    prices: {
      tokenAPrice: parseFloat(pairData.token_a_price || '0'),
      tokenBPrice: parseFloat(pairData.token_b_price || '0'),
      tokenAPriceUSD: priceData?.usdPrice || 0,
      tokenBPriceUSD: 0 // Would need separate price call
    },
    reserves: {
      tokenA: parseFloat(pairData.token_a_reserve || '0'),
      tokenB: parseFloat(pairData.token_b_reserve || '0')
    },
    feeTier: pairData.fee_tier || 'N/A',
    txCount: parseInt(pairData.tx_count || '0'),
    createdAt: pairData.created_at || new Date().toISOString(),
    source: 'Moralis Solana API',
    url: `${dexInfo.website}`,
    dexLogo: dexInfo.logo
  };
}

// Generate mock Solana pair data (fallback)
function generateMockSolanaPair(address: string) {
  const mockDexes = ['raydium', 'orca'];
  const mockDex = mockDexes[Math.floor(Math.random() * mockDexes.length)];
  const dexInfo = SOLANA_DEXS[mockDex as keyof typeof SOLANA_DEXS];

  return {
    address,
    dex: dexInfo.name,
    protocol: dexInfo.id,
    chain: 'Solana',
    version: 'V1',
    baseToken: {
      symbol: 'MOCK',
      name: 'Mock Token',
      address: address.substring(0, 32),
      decimals: 9
    },
    quoteToken: {
      symbol: 'SOL',
      name: 'Solana',
      address: 'So11111111111111111111111111111111111111112',
      decimals: 9
    },
    liquidity: Math.random() * 1000000,
    volume24h: Math.random() * 500000,
    prices: {
      tokenAPrice: Math.random() * 100,
      tokenBPrice: Math.random() * 100,
      tokenAPriceUSD: Math.random() * 10,
      tokenBPriceUSD: Math.random() * 200
    },
    reserves: {
      tokenA: Math.random() * 1000000,
      tokenB: Math.random() * 10000
    },
    feeTier: '0.25%',
    txCount: Math.floor(Math.random() * 10000),
    createdAt: new Date().toISOString(),
    source: 'Mock Data (Moralis API Key needed)',
    url: dexInfo.website,
    dexLogo: dexInfo.logo,
    note: 'This is mock data. Configure MORALIS_API_KEY for real Solana data.'
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
    const { address, tokenA, tokenB, dex } = req.query;

    // Handle direct pair address lookup
    if (address && typeof address === 'string') {
      console.log(`🟣 Looking up Solana pair: ${address}`);

      if (!MORALIS_API_KEY) {
        console.warn('⚠️ MORALIS_API_KEY not configured, using mock data');
        const mockData = generateMockSolanaPair(address);
        return res.status(200).json({
          success: true,
          pairInfo: mockData
        });
      }

      try {
        // Try to get token metadata for this address (might be a token, not pair)
        const tokenMetadata = await fetchSolanaTokenMetadata(address);
        const priceData = await fetchSolanaTokenPrice(address);

        if (tokenMetadata) {
          // This is a token address, try to find pairs containing this token
          const pairs = await fetchSolanaDEXPairs(address);
          
          if (pairs && pairs.length > 0) {
            // Get metadata for the paired token
            const firstPair = pairs[0];
            const pairedTokenAddress = firstPair.token_b === address ? firstPair.token_a : firstPair.token_b;
            const pairedTokenMetadata = await fetchSolanaTokenMetadata(pairedTokenAddress);
            
            const formattedPair = formatSolanaPairData(firstPair, tokenMetadata, pairedTokenMetadata, priceData);
            
            return res.status(200).json({
              success: true,
              pairInfo: formattedPair,
              foundPairs: pairs.length,
              note: `Found ${pairs.length} pairs for this token`
            });
          } else {
            // Token found but no pairs
            return res.status(404).json({
              success: false,
              error: 'Token found but no trading pairs available on Raydium/Orca',
              tokenInfo: {
                symbol: tokenMetadata.symbol,
                name: tokenMetadata.name,
                address: address
              },
              suggestions: [
                'This token might not be listed on major Solana DEXs',
                'Try searching on Raydium.io or Orca.so directly',
                'Verify this is a tradeable token address'
              ]
            });
          }
        } else {
          // Not a valid token, might be a pair address
          const mockData = generateMockSolanaPair(address);
          return res.status(200).json({
            success: true,
            pairInfo: mockData,
            note: 'Could not verify with Moralis API - showing mock data'
          });
        }

      } catch (error) {
        console.error('❌ Moralis Solana API error:', error);
        const mockData = generateMockSolanaPair(address);
        return res.status(200).json({
          success: true,
          pairInfo: mockData,
          note: 'API error - showing mock data'
        });
      }
    }

    // Handle token pair search
    if (tokenA && typeof tokenA === 'string') {
      console.log(`🔍 Searching for Solana pairs: ${tokenA} / ${tokenB || 'SOL'}`);

      if (!MORALIS_API_KEY) {
        console.warn('⚠️ MORALIS_API_KEY not configured, using mock data');
        const mockData = generateMockSolanaPair(tokenA);
        return res.status(200).json({
          success: true,
          pairs: [mockData]
        });
      }

      try {
        const pairs = await fetchSolanaDEXPairs(
          tokenA, 
          typeof tokenB === 'string' ? tokenB : undefined,
          typeof dex === 'string' ? dex : undefined
        );

        if (pairs && pairs.length > 0) {
          const formattedPairs = await Promise.all(
            pairs.slice(0, 5).map(async (pair: any) => {
              const tokenAMetadata = await fetchSolanaTokenMetadata(pair.token_a);
              const tokenBMetadata = await fetchSolanaTokenMetadata(pair.token_b);
              const priceData = await fetchSolanaTokenPrice(pair.token_a);
              
              return formatSolanaPairData(pair, tokenAMetadata, tokenBMetadata, priceData);
            })
          );

          return res.status(200).json({
            success: true,
            pairs: formattedPairs,
            totalFound: pairs.length
          });
        } else {
          return res.status(404).json({
            success: false,
            error: 'No pairs found for the specified tokens',
            suggestions: [
              'Try different token addresses',
              'Check if tokens are listed on Raydium or Orca',
              'Verify token addresses are correct'
            ]
          });
        }

      } catch (error) {
        console.error('❌ Moralis Solana pair search error:', error);
        const mockData = generateMockSolanaPair(tokenA);
        return res.status(200).json({
          success: true,
          pairs: [mockData],
          note: 'API error - showing mock data'
        });
      }
    }

    // No valid parameters
    return res.status(400).json({
      error: 'Please provide either an address or tokenA parameter',
      examples: {
        'Pair lookup': '/api/pools/moralis-solana?address=PAIR_ADDRESS',
        'Token search': '/api/pools/moralis-solana?tokenA=TOKEN_ADDRESS',
        'DEX specific': '/api/pools/moralis-solana?tokenA=TOKEN_A&tokenB=TOKEN_B&dex=raydium'
      },
      supportedDEXs: Object.values(SOLANA_DEXS).map(dex => ({
        name: dex.name,
        id: dex.id,
        website: dex.website
      }))
    });

  } catch (error) {
    console.error('❌ Moralis Solana API handler error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Solana DEX data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 