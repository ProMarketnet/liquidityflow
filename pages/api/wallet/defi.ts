import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

// Multi-chain support for both EVM and Solana
const SUPPORTED_CHAINS = {
  // EVM Chains
  ethereum: { id: '0x1', name: 'Ethereum', moralisId: 'eth' },
  arbitrum: { id: '0xa4b1', name: 'Arbitrum', moralisId: 'arbitrum' },
  base: { id: '0x2105', name: 'Base', moralisId: 'base' },
  optimism: { id: '0xa', name: 'Optimism', moralisId: 'optimism' },
  // Solana
  solana: { id: 'solana', name: 'Solana', moralisId: 'solana' }
};

// Protocol mapping for different chains
const CHAIN_PROTOCOLS = {
  ethereum: ['uniswap-v2', 'uniswap-v3', 'sushiswap-v2', 'aave-v2', 'aave-v3', 'lido', 'compound-v3'],
  arbitrum: ['uniswap-v3', 'sushiswap-v2', 'aave-v3', 'curve'],
  base: ['uniswap-v3', 'sushiswap-v2', 'compound-v3'],
  optimism: ['uniswap-v3', 'sushiswap-v2', 'aave-v3'],
  solana: ['raydium', 'orca', 'serum', 'marinade', 'lido-solana']
};

// Address validation functions
function isValidEVMAddress(address: string): boolean {
  return ethers.isAddress(address);
}

function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and typically 32-44 characters
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// Moralis API calls for EVM chains
async function fetchEVMDeFiData(address: string, chain: string) {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) throw new Error('Moralis API key not configured');

  try {
    console.log(`🔍 Fetching EVM DeFi data for ${address} on ${chain}`);
    
    // Fetch DeFi positions summary
    const summaryResponse = await fetch(
      `https://deep-index.moralis.io/api/v2.2/wallets/${address}/defi/summary?chain=${chain}`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    let summary = null;
    if (summaryResponse.ok) {
      summary = await summaryResponse.json();
    }

    // Fetch protocol-specific positions
    const protocols = CHAIN_PROTOCOLS[chain as keyof typeof CHAIN_PROTOCOLS] || [];
    const protocolData: Record<string, any> = {};

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
          const data = await protocolResponse.json();
          if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
            protocolData[protocol] = data;
            console.log(`✅ Found ${protocol} positions on ${chain}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch ${protocol} on ${chain}:`, error);
      }
    }

    return {
      chain,
      summary,
      protocolData,
      hasPositions: Object.keys(protocolData).length > 0
    };
  } catch (error) {
    console.error(`❌ Error fetching EVM DeFi data for ${chain}:`, error);
    return { chain, summary: null, protocolData: {}, hasPositions: false };
  }
}

// Moralis API calls for Solana
async function fetchSolanaDeFiData(address: string) {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) throw new Error('Moralis API key not configured');

  try {
    console.log(`🟣 Fetching Solana DeFi data for ${address}`);
    
    // Fetch Solana DeFi positions (Raydium, Orca, etc.)
    const response = await fetch(
      `https://solana-gateway.moralis.io/account/mainnet/${address}/defi/positions`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Solana DeFi API returned ${response.status}`);
      return { chain: 'solana', summary: null, protocolData: {}, hasPositions: false };
    }

    const data = await response.json();
    
    // Process Solana DeFi data
    const protocolData: Record<string, any> = {};
    
    if (data && data.result) {
      // Group positions by protocol
      data.result.forEach((position: any) => {
        const protocol = position.protocol_name || position.dex || 'unknown';
        if (!protocolData[protocol]) {
          protocolData[protocol] = [];
        }
        protocolData[protocol].push(position);
      });
      
      console.log(`✅ Found Solana DeFi positions:`, Object.keys(protocolData));
    }

    return {
      chain: 'solana',
      summary: data.summary || null,
      protocolData,
      hasPositions: Object.keys(protocolData).length > 0
    };
  } catch (error) {
    console.error(`❌ Error fetching Solana DeFi data:`, error);
    return { chain: 'solana', summary: null, protocolData: {}, hasPositions: false };
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
    const { address } = req.query;
    const walletAddress = Array.isArray(address) ? address[0] : address;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    console.log('🔍 Analyzing wallet address:', walletAddress);

    // Determine address type and supported chains
    const isEVM = isValidEVMAddress(walletAddress);
    const isSolana = isValidSolanaAddress(walletAddress);

    if (!isEVM && !isSolana) {
      return res.status(400).json({ 
        error: 'Invalid wallet address format. Please provide a valid Ethereum or Solana address.' 
      });
    }

    const allChainData: any[] = [];
    let totalPositions = 0;
    let totalProtocols = 0;
    const protocolBreakdown: Record<string, any> = {};

    // Fetch data from EVM chains if it's a valid EVM address
    if (isEVM) {
      console.log('📡 Fetching EVM chain data...');
      const evmChains = ['ethereum', 'arbitrum', 'base', 'optimism'];
      
      const evmPromises = evmChains.map(chain => 
        fetchEVMDeFiData(walletAddress, SUPPORTED_CHAINS[chain as keyof typeof SUPPORTED_CHAINS].moralisId)
      );
      
      const evmResults = await Promise.all(evmPromises);
      allChainData.push(...evmResults);

      // Process EVM results
      evmResults.forEach(result => {
        if (result.hasPositions) {
          Object.entries(result.protocolData).forEach(([protocol, data]) => {
            const key = `${protocol}_${result.chain}`;
            protocolBreakdown[key] = data;
            totalProtocols++;
            
            if (Array.isArray(data)) {
              totalPositions += data.length;
            } else if (data && typeof data === 'object') {
              totalPositions += Object.keys(data).length;
            }
          });
        }
      });
    }

    // Fetch data from Solana if it's a valid Solana address
    if (isSolana) {
      console.log('🟣 Fetching Solana data...');
      const solanaResult = await fetchSolanaDeFiData(walletAddress);
      allChainData.push(solanaResult);

      // Process Solana results
      if (solanaResult.hasPositions) {
        Object.entries(solanaResult.protocolData).forEach(([protocol, data]) => {
          const key = `${protocol}_solana`;
          protocolBreakdown[key] = data;
          totalProtocols++;
          
          if (Array.isArray(data)) {
            totalPositions += data.length;
          }
        });
      }
    }

    // Calculate total value across all chains
    let totalValue = 0;
    allChainData.forEach(chainData => {
      if (chainData.summary && chainData.summary.total_usd_value) {
        totalValue += parseFloat(chainData.summary.total_usd_value) || 0;
      }
    });

    console.log(`📊 Multi-chain DeFi Summary:`, {
      totalProtocols,
      totalPositions,
      totalValue,
      chains: allChainData.map(d => d.chain),
      protocols: Object.keys(protocolBreakdown)
    });

    // Format response for frontend
    const response = {
      address: walletAddress,
      addressType: isEVM && isSolana ? 'multi' : (isEVM ? 'evm' : 'solana'),
      totalValue,
      totalPositions,
      totalProtocols,
      chainData: allChainData,
      protocolBreakdown,
      positions: Object.entries(protocolBreakdown).map(([protocolChain, data]) => {
        const [protocol, chain] = protocolChain.split('_');
        return {
          protocol: protocol.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          chain: chain.charAt(0).toUpperCase() + chain.slice(1),
          data,
          count: Array.isArray(data) ? data.length : (data ? Object.keys(data).length : 0)
        };
      }),
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error fetching multi-chain DeFi data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch DeFi data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 