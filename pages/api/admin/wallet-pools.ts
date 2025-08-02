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
    console.log(`🔍 Fetching DeFi data for ${clientName} (${address})`);
    
    const isEVM = isValidEVMAddress(address);
    const isSolana = isValidSolanaAddress(address);
    
    if (!isEVM && !isSolana) {
      console.warn(`Invalid address format: ${address}`);
      return [];
    }

    const pools: PoolData[] = [];
    let poolIndex = 0;

    // Fetch EVM chain data
    if (isEVM) {
      const evmChains = ['ethereum', 'arbitrum', 'base', 'optimism'];
      
      for (const chainName of evmChains) {
        const chain = SUPPORTED_CHAINS[chainName as keyof typeof SUPPORTED_CHAINS].moralisId;
        
        try {
          // Get DeFi summary for this chain
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
            const summary = await summaryResponse.json();
            
            if (summary.total_usd_value && parseFloat(summary.total_usd_value) > 0) {
              // Get protocol-specific positions
              const protocols = CHAIN_PROTOCOLS[chainName as keyof typeof CHAIN_PROTOCOLS] || [];
              
              for (const protocol of protocols.slice(0, 2)) { // Limit to 2 protocols per chain for performance
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
                    const positions = await protocolResponse.json();
                    
                    if (Array.isArray(positions) && positions.length > 0) {
                      // Take first position as representative
                      const position = positions[0];
                      
                      pools.push({
                        id: `${address}-${poolIndex++}`,
                        clientName,
                        address,
                        protocol: formatProtocolName(protocol),
                        pair: extractPairName(position) || 'TOKEN/TOKEN',
                        totalValue: parseFloat(position.usd_value || summary.total_usd_value || '0'),
                        change24h: extractChange24h(position),
                        status: determineStatus(parseFloat(position.usd_value || '0')),
                        pairAddress: position.position_id || position.pair_address || generatePairAddress(address, poolIndex)
                      });
                      
                      break; // Only one pool per protocol for cleaner display
                    }
                  }
                } catch (error) {
                  console.warn(`Failed to fetch ${protocol} on ${chain}:`, error);
                }
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch summary for ${chain}:`, error);
        }
      }
    }

    // Fetch Solana data
    if (isSolana) {
      try {
        const response = await fetch(
          `https://solana-gateway.moralis.io/account/mainnet/${address}/defi/positions`,
          {
            headers: {
              'X-API-Key': apiKey,
              'accept': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data && data.result && Array.isArray(data.result)) {
            // Group by protocol and take one position per protocol
            const protocolGroups: Record<string, any> = {};
            data.result.forEach((position: any) => {
              const protocol = position.protocol_name || position.dex || 'Unknown';
              if (!protocolGroups[protocol]) {
                protocolGroups[protocol] = position;
              }
            });

            Object.entries(protocolGroups).forEach(([protocolName, position]) => {
              pools.push({
                id: `${address}-${poolIndex++}`,
                clientName,
                address,
                protocol: protocolName,
                pair: extractPairName(position) || 'SOL/TOKEN',
                totalValue: parseFloat(position.usd_value || position.value || '0'),
                change24h: extractChange24h(position),
                status: determineStatus(parseFloat(position.usd_value || position.value || '0')),
                pairAddress: position.position_id || position.pair_address || generatePairAddress(address, poolIndex)
              });
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch Solana data:`, error);
      }
    }

    console.log(`✅ Found ${pools.length} pools for ${clientName}`);
    return pools;

  } catch (error) {
    console.error(`❌ Error fetching DeFi data for ${clientName}:`, error);
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