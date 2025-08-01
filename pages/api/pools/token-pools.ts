import type { NextApiRequest, NextApiResponse } from 'next';

// Get all pools for a token on EVM chains
async function getAllEVMTokenPools(tokenAddress: string, chain: string, apiKey: string) {
  if (!apiKey) {
    return { pools: [], error: 'MORALIS_API_KEY not configured' };
  }

  try {
    // Get all pairs for this token from Moralis
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/pairs?chain=${chain}&limit=50&exchange=uniswapv3`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn(`Moralis pairs API failed: ${response.status}`);
      return { pools: [], error: `API failed: ${response.status}` };
    }

    const data = await response.json();
    console.log(`🔍 Found ${data.result?.length || 0} pools for token ${tokenAddress} on ${chain}`);

    if (!data.result || data.result.length === 0) {
      return { pools: [], error: 'No pools found' };
    }

    // Get detailed info for each pool
    const poolPromises = data.result.map(async (pool: any) => {
      try {
        // Get token metadata for paired token
        const pairedTokenAddress = pool.token0?.address === tokenAddress.toLowerCase() 
          ? pool.token1?.address 
          : pool.token0?.address;

        const [tokenMetadata, pairedTokenMetadata, tokenPrice, pairedTokenPrice] = await Promise.all([
          getTokenMetadata(tokenAddress, chain, apiKey),
          getTokenMetadata(pairedTokenAddress, chain, apiKey),
          getTokenPrice(tokenAddress, chain, apiKey),
          getTokenPrice(pairedTokenAddress, chain, apiKey)
        ]);

        return {
          pairAddress: pool.pair_address,
          dex: 'Uniswap V3',
          chain: getChainName(chain),
          baseToken: {
            symbol: tokenMetadata?.symbol || 'UNKNOWN',
            name: tokenMetadata?.name || 'Unknown Token',
            address: tokenAddress,
            decimals: parseInt(tokenMetadata?.decimals || '18')
          },
          pairedToken: {
            symbol: pairedTokenMetadata?.symbol || 'UNKNOWN',
            name: pairedTokenMetadata?.name || 'Unknown Token',
            address: pairedTokenAddress,
            decimals: parseInt(pairedTokenMetadata?.decimals || '18')
          },
          liquidity: parseFloat(pool.liquidity_usd || '0'),
          volume24h: parseFloat(pool.volume_24h || '0'),
          reserves: {
            token0: parseFloat(pool.reserve0 || '0'),
            token1: parseFloat(pool.reserve1 || '0')
          },
          prices: {
            tokenPriceUSD: tokenPrice?.usdPrice || 0,
            pairedTokenPriceUSD: pairedTokenPrice?.usdPrice || 0
          },
          feeTier: pool.fee_tier || 'N/A',
          txCount: parseInt(pool.tx_count || '0'),
          url: `https://app.uniswap.org/#/pools/${pool.pair_address}`,
          createdAt: pool.created_at || new Date().toISOString()
        };
      } catch (error) {
        console.error('Error processing pool:', error);
        return null;
      }
    });

    const pools = (await Promise.all(poolPromises)).filter(pool => pool !== null);
    
    // Sort by liquidity descending
    pools.sort((a, b) => (b?.liquidity || 0) - (a?.liquidity || 0));

    return { pools, error: null };

  } catch (error) {
    console.error('Error fetching EVM token pools:', error);
    return { pools: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get all pools for a token on Solana
async function getAllSolanaTokenPools(tokenAddress: string, apiKey: string) {
  if (!apiKey) {
    return { pools: [], error: 'MORALIS_API_KEY not configured' };
  }

  try {
    // Get pairs from Moralis Solana API
    const response = await fetch(
      `https://solana-gateway.moralis.io/pairs?token_a=${tokenAddress}&limit=50`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn(`Moralis Solana pairs API failed: ${response.status}`);
      return { pools: [], error: `API failed: ${response.status}` };
    }

    const data = await response.json();
    console.log(`🟣 Found ${data.length || 0} pools for token ${tokenAddress} on Solana`);

    if (!data || data.length === 0) {
      return { pools: [], error: 'No pools found' };
    }

    // Get detailed info for each pool
    const poolPromises = data.map(async (pool: any) => {
      try {
        const pairedTokenAddress = pool.token_b;
        
        const [tokenMetadata, pairedTokenMetadata, tokenPrice] = await Promise.all([
          getSolanaTokenMetadata(tokenAddress, apiKey),
          getSolanaTokenMetadata(pairedTokenAddress, apiKey),
          getSolanaTokenPrice(tokenAddress, apiKey)
        ]);

        const dexInfo = getDexInfo(pool.exchange);

        return {
          pairAddress: pool.pair_address || pool.address,
          dex: dexInfo.name,
          chain: 'Solana',
          baseToken: {
            symbol: tokenMetadata?.symbol || 'UNKNOWN',
            name: tokenMetadata?.name || 'Unknown Token',
            address: tokenAddress,
            decimals: tokenMetadata?.decimals || 9
          },
          pairedToken: {
            symbol: pairedTokenMetadata?.symbol || 'UNKNOWN',
            name: pairedTokenMetadata?.name || 'Unknown Token',
            address: pairedTokenAddress,
            decimals: pairedTokenMetadata?.decimals || 9
          },
          liquidity: parseFloat(pool.liquidity_usd || '0'),
          volume24h: parseFloat(pool.volume_24h || '0'),
          reserves: {
            tokenA: parseFloat(pool.token_a_reserve || '0'),
            tokenB: parseFloat(pool.token_b_reserve || '0')
          },
          prices: {
            tokenPriceUSD: tokenPrice?.usdPrice || 0,
            pairedTokenPriceUSD: 0 // Would need separate call
          },
          feeTier: pool.fee_tier || 'N/A',
          txCount: parseInt(pool.tx_count || '0'),
          url: dexInfo.website,
          createdAt: pool.created_at || new Date().toISOString()
        };
      } catch (error) {
        console.error('Error processing Solana pool:', error);
        return null;
      }
    });

    const pools = (await Promise.all(poolPromises)).filter(pool => pool !== null);
    
    // Sort by liquidity descending
    pools.sort((a, b) => (b?.liquidity || 0) - (a?.liquidity || 0));

    return { pools, error: null };

  } catch (error) {
    console.error('Error fetching Solana token pools:', error);
    return { pools: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Helper functions
async function getTokenMetadata(tokenAddress: string, chain: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/erc20/metadata?chain=${chain}&addresses%5B0%5D=${tokenAddress}`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );
    const data = await response.json();
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
}

async function getTokenPrice(tokenAddress: string, chain: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/price?chain=${chain}`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
}

async function getSolanaTokenMetadata(tokenAddress: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://solana-gateway.moralis.io/token/${tokenAddress}/metadata`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching Solana token metadata:', error);
    return null;
  }
}

async function getSolanaTokenPrice(tokenAddress: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://solana-gateway.moralis.io/token/${tokenAddress}/price`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching Solana token price:', error);
    return null;
  }
}

function getChainName(chain: string): string {
  const chainMap: Record<string, string> = {
    'eth': 'Ethereum',
    'arbitrum': 'Arbitrum',
    'base': 'Base',
    'optimism': 'Optimism',
    'polygon': 'Polygon'
  };
  return chainMap[chain] || chain;
}

function getDexInfo(exchange: string) {
  const dexMap: Record<string, { name: string; website: string }> = {
    'raydium': { name: 'Raydium', website: 'https://raydium.io' },
    'orca': { name: 'Orca', website: 'https://orca.so' },
    'uniswapv3': { name: 'Uniswap V3', website: 'https://app.uniswap.org' }
  };
  return dexMap[exchange] || { name: exchange || 'Unknown DEX', website: '#' };
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
        example: '/api/pools/token-pools?address=TOKEN_ADDRESS&chain=eth'
      });
    }

    console.log(`🔍 Finding ALL pools for token: ${address}`);

    // Get API key inside handler (like balance API does)
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ MORALIS_API_KEY not configured, returning empty result');
      return res.status(200).json({
        success: false,
        error: 'MORALIS_API_KEY not configured',
        tokenAddress: address,
        summary: { totalPools: 0, totalLiquidity: 0, totalVolume24h: 0, chainsFound: [], dexsFound: [] },
        poolsByDex: {},
        allPools: []
      });
    }

    // Determine if this is an EVM or Solana address
    const isEVMAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
    const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);

    let allPools: any[] = [];
    let errors: string[] = [];

    if (isEVMAddress) {
      // Check multiple EVM chains
      const chains = chain && typeof chain === 'string' ? [chain] : ['eth', 'arbitrum', 'base', 'optimism'];
      
      console.log(`🔗 Checking EVM chains: ${chains.join(', ')}`);
      
      const chainPromises = chains.map(async (chainId) => {
        const result = await getAllEVMTokenPools(address, chainId, apiKey);
        if (result.error) {
          errors.push(`${getChainName(chainId)}: ${result.error}`);
        }
        return result.pools.map(pool => ({ ...pool, chain: getChainName(chainId) }));
      });

      const chainResults = await Promise.all(chainPromises);
      allPools = chainResults.flat();

    } else if (isSolanaAddress) {
      console.log('🟣 Checking Solana DEXs');
      
      const result = await getAllSolanaTokenPools(address, apiKey);
      if (result.error) {
        errors.push(`Solana: ${result.error}`);
      }
      allPools = result.pools;

    } else {
      return res.status(400).json({
        error: 'Invalid address format',
        message: 'Please provide a valid Ethereum (0x...) or Solana address'
      });
    }

    // Sort all pools by liquidity
    allPools.sort((a, b) => (b.liquidity || 0) - (a.liquidity || 0));

    const totalLiquidity = allPools.reduce((sum, pool) => sum + (pool.liquidity || 0), 0);
    const totalVolume = allPools.reduce((sum, pool) => sum + (pool.volume24h || 0), 0);

    // Group pools by DEX
    const poolsByDex = allPools.reduce((acc, pool) => {
      const key = `${pool.dex} (${pool.chain})`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(pool);
      return acc;
    }, {} as Record<string, any[]>);

    res.status(200).json({
      success: true,
      tokenAddress: address,
      summary: {
        totalPools: allPools.length,
        totalLiquidity: totalLiquidity,
        totalVolume24h: totalVolume,
        chainsFound: Array.from(new Set(allPools.map(p => p.chain))),
        dexsFound: Array.from(new Set(allPools.map(p => p.dex)))
      },
      poolsByDex,
      allPools,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Token pools API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch token pools',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 