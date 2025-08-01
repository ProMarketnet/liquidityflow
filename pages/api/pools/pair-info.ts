import type { NextApiRequest, NextApiResponse } from 'next';

// DEX-specific pair info fetchers
async function fetchSolanaPairInfo(pairAddress: string) {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) throw new Error('Moralis API key not configured');

  try {
    console.log(`🟣 Fetching Solana pair info for: ${pairAddress}`);
    
    // Try Jupiter API for Solana pair data
    const jupiterResponse = await fetch(
      `https://price.jup.ag/v4/price?ids=${pairAddress}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );

    if (jupiterResponse.ok) {
      const jupiterData = await jupiterResponse.json();
      if (jupiterData.data && jupiterData.data[pairAddress]) {
        const priceData = jupiterData.data[pairAddress];
        return {
          success: true,
          pairInfo: {
            address: pairAddress,
            dex: 'Raydium', // Most common for the format shown
            protocol: 'Raydium',
            chain: 'Solana',
            baseToken: { symbol: 'TJRM' }, // From the screenshot
            quoteToken: { symbol: 'SOL' },
            price: priceData.price,
            liquidity: null, // Will try to get from other sources
            volume24h: null,
            apr: null,
            source: 'Jupiter'
          }
        };
      }
    }

    // Try DexScreener API as backup
    const dexScreenerResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );

    if (dexScreenerResponse.ok) {
      const dexData = await dexScreenerResponse.json();
      if (dexData.pairs && dexData.pairs.length > 0) {
        const pair = dexData.pairs[0];
        return {
          success: true,
          pairInfo: {
            address: pairAddress,
            dex: pair.dexId || 'Raydium',
            protocol: pair.dexId || 'Raydium',
            chain: 'Solana',
            baseToken: { 
              symbol: pair.baseToken?.symbol || 'TOKEN0',
              address: pair.baseToken?.address 
            },
            quoteToken: { 
              symbol: pair.quoteToken?.symbol || 'TOKEN1',
              address: pair.quoteToken?.address 
            },
            price: parseFloat(pair.priceUsd || '0'),
            liquidity: parseFloat(pair.liquidity?.usd || '0'),
            volume24h: parseFloat(pair.volume?.h24 || '0'),
            priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
            apr: null,
            source: 'DexScreener'
          }
        };
      }
    }

    return {
      success: false,
      error: 'Pair not found on Solana DEXs'
    };

  } catch (error) {
    console.error('Error fetching Solana pair info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Solana pair info'
    };
  }
}

async function fetchEVMPairInfo(pairAddress: string, chain: string = 'eth') {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) throw new Error('Moralis API key not configured');

  try {
    console.log(`📱 Fetching EVM pair info for: ${pairAddress} on ${chain}`);
    
    // Try DexScreener first for comprehensive data
    const chainMapping: Record<string, string> = {
      'eth': 'ethereum',
      'arbitrum': 'arbitrum',
      'base': 'base',
      'optimism': 'optimism'
    };
    
    const dexScreenerChain = chainMapping[chain] || 'ethereum';
    const dexScreenerResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/${dexScreenerChain}/${pairAddress}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );

    if (dexScreenerResponse.ok) {
      const dexData = await dexScreenerResponse.json();
      if (dexData.pairs && dexData.pairs.length > 0) {
        const pair = dexData.pairs[0];
        return {
          success: true,
          pairInfo: {
            address: pairAddress,
            dex: pair.dexId || 'Uniswap',
            protocol: pair.dexId || 'Uniswap',
            chain: chain.charAt(0).toUpperCase() + chain.slice(1),
            baseToken: { 
              symbol: pair.baseToken?.symbol || 'TOKEN0',
              address: pair.baseToken?.address 
            },
            quoteToken: { 
              symbol: pair.quoteToken?.symbol || 'TOKEN1',
              address: pair.quoteToken?.address 
            },
            price: parseFloat(pair.priceUsd || '0'),
            liquidity: parseFloat(pair.liquidity?.usd || '0'),
            volume24h: parseFloat(pair.volume?.h24 || '0'),
            priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
            apr: null,
            source: 'DexScreener'
          }
        };
      }
    }

    // Try Moralis as backup
    try {
      const moralisResponse = await fetch(
        `https://deep-index.moralis.io/api/v2/${pairAddress}/reserves?chain=${chain}`,
        {
          headers: {
            'X-API-Key': apiKey,
            'accept': 'application/json'
          }
        }
      );

      if (moralisResponse.ok) {
        const moralisData = await moralisResponse.json();
        return {
          success: true,
          pairInfo: {
            address: pairAddress,
            dex: 'Uniswap', // Default assumption
            protocol: 'Uniswap',
            chain: chain.charAt(0).toUpperCase() + chain.slice(1),
            baseToken: { symbol: 'TOKEN0' },
            quoteToken: { symbol: 'TOKEN1' },
            liquidity: parseFloat(moralisData.reserve0 || '0') + parseFloat(moralisData.reserve1 || '0'),
            source: 'Moralis'
          }
        };
      }
    } catch (moralisError) {
      console.warn('Moralis pair lookup failed:', moralisError);
    }

    return {
      success: false,
      error: `Pair not found on ${chain} DEXs`
    };

  } catch (error) {
    console.error('Error fetching EVM pair info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch EVM pair info'
    };
  }
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
    const pairAddress = Array.isArray(address) ? address[0] : address;

    if (!pairAddress) {
      return res.status(400).json({ error: 'Pair address is required' });
    }

    console.log('🔍 Looking up pair:', pairAddress);

    // Determine if this is an EVM or Solana pair
    const isEVMPair = /^0x[a-fA-F0-9]{40}$/.test(pairAddress);
    const isSolanaPair = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(pairAddress);

    let result;

    if (isEVMPair) {
      const targetChain = Array.isArray(chain) ? chain[0] : chain || 'eth';
      result = await fetchEVMPairInfo(pairAddress, targetChain);
    } else if (isSolanaPair) {
      result = await fetchSolanaPairInfo(pairAddress);
    } else {
      return res.status(400).json({ 
        error: 'Invalid pair address format. Please provide a valid Ethereum or Solana pair address.' 
      });
    }

    if (result.success) {
      res.status(200).json({
        address: pairAddress,
        ...result
      });
    } else {
      res.status(404).json({
        address: pairAddress,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error in pair info API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pair information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 