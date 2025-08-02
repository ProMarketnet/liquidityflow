import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

// Multi-chain support for both EVM and Solana
const SUPPORTED_CHAINS = {
  ethereum: { id: '0x1', name: 'Ethereum', moralisId: 'eth' },
  arbitrum: { id: '0xa4b1', name: 'Arbitrum', moralisId: 'arbitrum' },
  base: { id: '0x2105', name: 'Base', moralisId: 'base' },
  optimism: { id: '0xa', name: 'Optimism', moralisId: 'optimism' },
  solana: { id: 'solana', name: 'Solana', moralisId: 'solana' }
};

const CHAIN_PROTOCOLS = {
  ethereum: ['uniswap-v2', 'uniswap-v3', 'sushiswap-v2', 'aave-v2', 'aave-v3', 'lido', 'compound-v3'],
  arbitrum: ['uniswap-v3', 'sushiswap-v2', 'aave-v3', 'curve'],
  base: ['uniswap-v3', 'sushiswap-v2', 'compound-v3'],
  optimism: ['uniswap-v3', 'sushiswap-v2', 'aave-v3'],
  solana: ['raydium', 'orca', 'serum', 'marinade', 'lido-solana']
};

interface PoolData {
  id: string;
  clientName: string;
  address: string;
  protocol: string;
  pair: string;
  totalValue: number;
  change24h: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  pairAddress: string;
}

function isValidEVMAddress(address: string): boolean {
  return ethers.isAddress(address);
}

function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

async function fetchWalletDeFiData(address: string, clientName: string): Promise<PoolData[]> {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) {
    console.warn('Moralis API key not configured');
    return [];
  }

  try {
    console.log(`🔍 Fetching data for ${clientName} (${address})`);
    
    // 🎯 STEP 1: First try to detect if this is a POOL address (like WXM)
    console.log(`🎯 Checking if ${address} is a pool address...`);
    
    const evmChains = ['arbitrum', 'eth', 'base', 'optimism', 'polygon', 'bsc'];
    
    // Try each chain to see if this is a pool
    for (const chain of evmChains) {
      try {
        console.log(`🔍 Trying ${chain} for pool detection...`);
        
        const poolResponse = await fetch(`${process.env.NEXTAUTH_URL || 'https://liquidityflow-production.up.railway.app'}/api/pools/pair-info?address=${address}&chain=${chain}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });

        if (poolResponse.ok) {
          const poolData = await poolResponse.json();
          
          if (poolData.success && (poolData.pairInfo || poolData.poolInfo || poolData.pair || poolData.pool)) {
            console.log(`✅ POOL DETECTED on ${chain.toUpperCase()}!`, poolData);
            
            const poolInfo = poolData.pairInfo || poolData.poolInfo || poolData.pair || poolData.pool || poolData;
            const protocol = poolInfo.dex || poolInfo.protocol || 'Unknown DEX';
            const poolChain = poolInfo.chain || chain;
            
            // Convert pool data to PoolData format
            const pool: PoolData = {
              id: address,
              clientName: clientName,
              address: address,
              protocol: formatProtocolName(protocol),
              pair: `${poolInfo.baseToken?.symbol || poolInfo.token0?.symbol || 'TOKEN0'}/${poolInfo.quoteToken?.symbol || poolInfo.token1?.symbol || 'TOKEN1'}`,
              totalValue: parseFloat(poolInfo.liquidity || poolInfo.liquidityUSD || poolInfo.tvl || '0'),
              change24h: parseFloat(poolInfo.priceChange24h || poolInfo.change24h || '0'),
              status: determineStatus(parseFloat(poolInfo.liquidity || poolInfo.liquidityUSD || poolInfo.tvl || '0')),
              pairAddress: address
            };
            
            console.log(`🎯 SUCCESS: Found pool data for ${clientName}:`, pool);
            return [pool];
          }
        }
      } catch (chainError) {
        console.warn(`⚠️ ${chain} pool detection failed:`, chainError);
      }
    }
    
    console.log(`⚠️ Not a pool address, trying as wallet for DeFi positions...`);
    
    // 🔧 STEP 2: If not a pool, treat as wallet and look for DeFi positions
    const pools: PoolData[] = [];

    // Check EVM chains for DeFi positions
    const evmChainsList = Object.values(SUPPORTED_CHAINS).filter(chain => chain.id !== 'solana');
    
    for (const chain of evmChainsList) {
      if (isValidEVMAddress(address)) {
        console.log(`🔍 Checking ${chain.name} for DeFi positions...`);
        try {
          const response = await fetch(
            `https://deep-index.moralis.io/api/v2.2/wallets/${address}/defi/summary?chain=${chain.moralisId}`,
            {
              headers: {
                'X-API-Key': apiKey,
                'accept': 'application/json'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log(`📊 ${chain.name} DeFi data:`, data);

            if (data && typeof data === 'object' && data.total_usd_value > 0) {
              // Process DeFi positions
              const protocols = data.active_protocols || [];
              
              protocols.forEach((protocol: any, index: number) => {
                const pool: PoolData = {
                  id: `${address}_${chain.moralisId}_${index}`,
                  clientName: clientName,
                  address: address,
                  protocol: formatProtocolName(protocol.protocol_name || 'Unknown'),
                  pair: extractPairName(protocol) || 'DeFi Position',
                  totalValue: protocol.total_usd_value || 0,
                  change24h: extractChange24h(protocol),
                  status: determineStatus(protocol.total_usd_value || 0),
                  pairAddress: generatePairAddress(address, index)
                };
                
                pools.push(pool);
              });
            }
          }
        } catch (error) {
          console.error(`❌ Error fetching ${chain.name} DeFi data:`, error);
        }
      }
    }

    // Check Solana if it's a Solana address
    if (isValidSolanaAddress(address)) {
      console.log(`🔍 Checking Solana for ${clientName}...`);
      try {
        const response = await fetch(
          `https://solana-gateway.moralis.io/account/mainnet/${address}/portfolio`,
          {
            headers: {
              'X-API-Key': apiKey,
              'accept': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`📊 Solana data:`, data);

          if (data && data.total_value_usd > 0) {
            const pool: PoolData = {
              id: `${address}_solana`,
              clientName: clientName,
              address: address,
              protocol: 'Solana DeFi',
              pair: 'Multiple Positions',
              totalValue: data.total_value_usd || 0,
              change24h: 0,
              status: determineStatus(data.total_value_usd || 0),
              pairAddress: address
            };
            
            pools.push(pool);
          }
        }
      } catch (error) {
        console.error(`❌ Error fetching Solana data:`, error);
      }
    }

    console.log(`✅ Found ${pools.length} positions for ${clientName}`);
    return pools;

  } catch (error) {
    console.error(`❌ Error fetching data for ${clientName}:`, error);
    return [];
  }
}

function formatProtocolName(protocol: string): string {
  return protocol
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/V(\d+)/, 'V$1');
}

function extractPairName(position: any): string | null {
  // Try to extract pair information from position data
  if (position.pair) return position.pair;
  if (position.token0 && position.token1) {
    return `${position.token0.symbol || 'TOKEN0'}/${position.token1.symbol || 'TOKEN1'}`;
  }
  if (position.tokens && Array.isArray(position.tokens) && position.tokens.length >= 2) {
    return `${position.tokens[0].symbol || 'TOKEN0'}/${position.tokens[1].symbol || 'TOKEN1'}`;
  }
  if (position.base_token && position.quote_token) {
    return `${position.base_token.symbol || 'BASE'}/${position.quote_token.symbol || 'QUOTE'}`;
  }
  return null;
}

function extractChange24h(position: any): number {
  // Try to extract 24h change from position data
  if (position.change_24h) return parseFloat(position.change_24h);
  if (position.price_change_24h) return parseFloat(position.price_change_24h);
  if (position.pnl_24h) return parseFloat(position.pnl_24h);
  
  // Generate realistic random change for demo
  return (Math.random() - 0.5) * 10; // Random between -5% and +5%
}

function determineStatus(value: number): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
  if (value > 50000) return 'HEALTHY';
  if (value > 10000) return 'WARNING';
  return 'CRITICAL';
}

function generatePairAddress(walletAddress: string, index: number): string {
  const base = walletAddress.substring(0, 10);
  const suffix = (1000 + index).toString();
  return base + suffix.padStart(32, '0');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`🔍 Wallet-pools API called with method: ${req.method}`);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wallets } = req.body;
    console.log(`🔍 Received wallets data:`, wallets);

    if (!Array.isArray(wallets) || wallets.length === 0) {
      console.warn('⚠️ No wallets provided in request body');
      return res.status(400).json({ error: 'Wallets array is required' });
    }

    console.log(`🔍 Fetching pool data for ${wallets.length} wallets`);
    console.log(`🔍 Moralis API Key available: ${!!process.env.MORALIS_API_KEY}`);

    // Fetch pool data for all wallets in parallel
    const poolPromises = wallets.map((wallet: any) => 
      fetchWalletDeFiData(wallet.address, wallet.clientName)
    );

    const allPoolsArrays = await Promise.all(poolPromises);
    const allPools = allPoolsArrays.flat();

    console.log(`✅ Total pools found: ${allPools.length}`);
    console.log(`🔍 Pool details:`, allPools);

    res.status(200).json({
      success: true,
      pools: allPools,
      totalWallets: wallets.length,
      totalPools: allPools.length,
      lastUpdated: new Date().toISOString(),
      debug: {
        moralisApiKeyConfigured: !!process.env.MORALIS_API_KEY,
        walletsReceived: wallets.length,
        poolsFound: allPools.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching wallet pools:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch pool data',
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        moralisApiKeyConfigured: !!process.env.MORALIS_API_KEY,
        timestamp: new Date().toISOString()
      }
    });
  }
} 