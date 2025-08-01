import type { NextApiRequest, NextApiResponse } from 'next';

// Moralis DeFi API endpoints for pair/position analysis
async function fetchMoralisDeFiData(address: string, chain: string = 'eth') {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) throw new Error('Moralis API key not configured');

  try {
    console.log(`🔍 Fetching Moralis DeFi data for: ${address} on ${chain}`);
    
    // Use Moralis DeFi positions summary endpoint
    const summaryResponse = await fetch(
      `https://deep-index.moralis.io/api/v2.2/wallets/${address}/defi/summary?chain=${chain}`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.log('📊 Moralis DeFi summary:', summaryData);
      
      if (summaryData && summaryData.total_usd_value > 0) {
        return {
          success: true,
          pairInfo: {
            address: address,
            dex: 'Multi-Protocol',
            protocol: 'DeFi Portfolio',
            chain: chain.charAt(0).toUpperCase() + chain.slice(1),
            totalValue: parseFloat(summaryData.total_usd_value || '0'),
            activeProtocols: summaryData.active_protocols || [],
            source: 'Moralis DeFi'
          }
        };
      }
    }

    // Try DeFi positions by protocol endpoints
    const protocols = ['uniswap-v3', 'uniswap-v2', 'aave-v3', 'compound-v3', 'curve'];
    
    for (const protocol of protocols) {
      try {
        const protocolResponse = await fetch(
          `https://deep-index.moralis.io/api/v2.2/wallets/${address}/defi/${protocol}/positions?chain=${chain}`,
          {
            headers: {
              'X-API-Key': apiKey,
              'accept': 'application/json'
            }
          }
        );

        if (protocolResponse.ok) {
          const protocolData = await protocolResponse.json();
          console.log(`📈 ${protocol} positions:`, protocolData);
          
          if (protocolData && Array.isArray(protocolData) && protocolData.length > 0) {
            const position = protocolData[0];
            return {
              success: true,
              pairInfo: {
                address: address,
                dex: protocol.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                protocol: protocol,
                chain: chain.charAt(0).toUpperCase() + chain.slice(1),
                position_type: position.position_type || 'defi_position',
                total_usd_value: parseFloat(position.total_usd_value || '0'),
                tokens: position.position_token_data || [],
                source: 'Moralis DeFi'
              }
            };
          }
        }
      } catch (protocolError) {
        console.warn(`⚠️ Failed to fetch ${protocol} positions:`, protocolError);
      }
    }

    return {
      success: false,
      error: `No DeFi positions found for address on ${chain}`
    };

  } catch (error) {
    console.error('Error fetching Moralis DeFi data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Moralis DeFi data'
    };
  }
}

// DexScreener API for comprehensive pair data
async function fetchDexScreenerData(pairAddress: string, chain: string) {
  try {
    console.log(`🔍 Fetching DexScreener data for: ${pairAddress} on ${chain}`);
    
    const chainMapping: Record<string, string> = {
      'eth': 'ethereum',
      'arbitrum': 'arbitrum', 
      'base': 'base',
      'optimism': 'optimism',
      'solana': 'solana'
    };
    
    const dexScreenerChain = chainMapping[chain] || chain;
    
    // Try the pairs endpoint first
    let dexScreenerResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/${dexScreenerChain}/${pairAddress}`,
      {
        headers: {
          'accept': 'application/json',
          'user-agent': 'LiquidFlow/1.0'
        }
      }
    );

    console.log(`📊 DexScreener ${dexScreenerChain} response status:`, dexScreenerResponse.status);

    // If pair endpoint fails, try token endpoint for Solana
    if (!dexScreenerResponse.ok && chain === 'solana') {
      console.log('🔄 Trying DexScreener token endpoint for Solana...');
      dexScreenerResponse = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${pairAddress}`,
        {
          headers: {
            'accept': 'application/json',
            'user-agent': 'LiquidFlow/1.0'
          }
        }
      );
      console.log('📊 DexScreener token response status:', dexScreenerResponse.status);
    }

    if (dexScreenerResponse.ok) {
      const dexData = await dexScreenerResponse.json();
      console.log('📊 DexScreener response data:', JSON.stringify(dexData, null, 2));
      
      if (dexData.pairs && dexData.pairs.length > 0) {
        const pair = dexData.pairs[0];
        return {
          success: true,
          pairInfo: {
            address: pairAddress,
            dex: pair.dexId || 'Unknown DEX',
            protocol: pair.dexId || 'Unknown',
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
            fdv: parseFloat(pair.fdv || '0'),
            marketCap: parseFloat(pair.marketCap || '0'),
            pairCreatedAt: pair.pairCreatedAt,
            url: pair.url,
            source: 'DexScreener'
          }
        };
      } else {
        console.log('⚠️ DexScreener returned data but no pairs found');
      }
    } else {
      console.log(`❌ DexScreener API failed with status: ${dexScreenerResponse.status}`);
      const errorText = await dexScreenerResponse.text();
      console.log('Error response:', errorText);
    }

    return {
      success: false,
      error: `Pair not found on ${chain} via DexScreener (Status: ${dexScreenerResponse.status})`
    };

  } catch (error) {
    console.error('Error fetching DexScreener data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch DexScreener data'
    };
  }
}

// Simplified Solana token info (for when pair lookup fails)
async function fetchSolanaTokenInfo(address: string) {
  try {
    console.log(`🟣 Fetching Solana token info for: ${address}`);
    
    // Try Jupiter price API
    const jupiterResponse = await fetch(
      `https://price.jup.ag/v6/price?ids=${address}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );

    if (jupiterResponse.ok) {
      const jupiterData = await jupiterResponse.json();
      console.log('🚀 Jupiter response:', jupiterData);
      
      if (jupiterData.data && jupiterData.data[address]) {
        const tokenData = jupiterData.data[address];
        return {
          success: true,
          pairInfo: {
            address: address,
            dex: 'Jupiter/Raydium',
            protocol: 'Solana Token',
            chain: 'Solana',
            price: tokenData.price || 0,
            source: 'Jupiter'
          }
        };
      }
    }

    return {
      success: false,
      error: 'Token not found on Solana'
    };

  } catch (error) {
    console.error('Error fetching Solana token info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Solana token info'
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

    console.log('🔍 Looking up pair/address:', pairAddress);

    // Determine if this is an EVM or Solana address
    const isEVMAddress = /^0x[a-fA-F0-9]{40}$/.test(pairAddress);
    const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(pairAddress);

    if (!isEVMAddress && !isSolanaAddress) {
      return res.status(400).json({ 
        error: 'Invalid address format. Please provide a valid Ethereum or Solana address.' 
      });
    }

    let result;

    if (isEVMAddress) {
      const targetChain = Array.isArray(chain) ? chain[0] : chain || 'eth';
      console.log(`📱 Processing EVM address on ${targetChain}`);
      
      // For EVM chains, use Moralis EVM API (supports Uniswap on multiple chains)
      try {
        console.log('🔗 Trying Moralis EVM API...');
        const moralisResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/pools/moralis-evm?address=${pairAddress}&chain=${targetChain}`,
          {
            headers: {
              'accept': 'application/json'
            }
          }
        );

        if (moralisResponse.ok) {
          const moralisData = await moralisResponse.json();
          if (moralisData.success && moralisData.pairInfo) {
            result = {
              success: true,
              pairInfo: moralisData.pairInfo
            };
          }
        }
      } catch (error) {
        console.warn('⚠️ Moralis EVM API failed:', error);
      }
      
      // If Moralis EVM API failed, try Uniswap subgraph (Ethereum only)
      if (!result || !result.success) {
        if (targetChain === 'eth' || targetChain === 'ethereum') {
          try {
            console.log('🦄 Falling back to Uniswap subgraph...');
            const uniswapResponse = await fetch(
              `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/pools/uniswap-subgraph?address=${pairAddress}`,
              {
                headers: {
                  'accept': 'application/json'
                }
              }
            );

            if (uniswapResponse.ok) {
              const uniswapData = await uniswapResponse.json();
              if (uniswapData.success && uniswapData.pairInfo) {
                result = {
                  success: true,
                  pairInfo: uniswapData.pairInfo
                };
              }
            }
          } catch (error) {
            console.warn('⚠️ Uniswap subgraph lookup failed:', error);
          }
        }
      }
      
      // Final fallback to DexScreener
      if (!result || !result.success) {
        console.log('🔄 Final fallback to DexScreener...');
        result = await fetchDexScreenerData(pairAddress, targetChain);
      }
      
    } else if (isSolanaAddress) {
      console.log('🟣 Processing Solana address');
      
      // For Solana, use Moralis API (supports Raydium & Orca)
      try {
        console.log('🌊 Trying Moralis Solana API...');
        const moralisResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/pools/moralis-solana?address=${pairAddress}`,
          {
            headers: {
              'accept': 'application/json'
            }
          }
        );

        if (moralisResponse.ok) {
          const moralisData = await moralisResponse.json();
          if (moralisData.success && moralisData.pairInfo) {
            result = {
              success: true,
              pairInfo: moralisData.pairInfo
            };
          }
        }
      } catch (error) {
        console.warn('⚠️ Moralis Solana API failed:', error);
      }
      
      // If Moralis Solana API failed, fallback to DexScreener
      if (!result || !result.success) {
        console.log('🔄 Falling back to DexScreener for Solana...');
        result = await fetchDexScreenerData(pairAddress, 'solana');
      }
    }

    if (result && result.success) {
      res.status(200).json({
        address: pairAddress,
        ...result
      });
    } else {
      res.status(404).json({
        address: pairAddress,
        error: result?.error || 'Address not found',
        suggestions: [
          'Verify the address is correct',
          'Try a different chain if this is an EVM address',
          'Check if this is a valid pair/pool address',
          'For Solana: Ensure this is a valid token or pair address'
        ]
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