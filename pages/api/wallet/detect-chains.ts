import type { NextApiRequest, NextApiResponse } from 'next';

// Address validation functions
function isValidEVMAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are 32-44 characters, Base58 encoded
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address) && !address.startsWith('0x');
}

// EVM chains to check with Moralis
const EVM_CHAINS = [
  { id: 'arbitrum', name: 'Arbitrum', moralisChain: 'arbitrum' },
  { id: 'eth', name: 'Ethereum', moralisChain: 'eth' },
  { id: 'base', name: 'Base', moralisChain: 'base' },
  { id: 'optimism', name: 'Optimism', moralisChain: 'optimism' },
  { id: 'polygon', name: 'Polygon', moralisChain: 'polygon' },
  { id: 'bsc', name: 'BSC', moralisChain: 'bsc' }
];

interface ChainActivity {
  chain: string;
  chainName: string;
  hasActivity: boolean;
  hasBalance: boolean;
  hasDeFiPositions: boolean;
  tokenCount: number;
  error?: string;
}

interface ChainDetectionResult {
  address: string;
  addressType: 'evm' | 'solana' | 'unknown';
  activeChains: ChainActivity[];
  primaryChain: string | null;
  recommendedChains: string[];
  totalChainsChecked: number;
  detectionTime: string;
}

// Check EVM chain activity using Moralis
async function checkEVMChainActivity(address: string, chain: any, apiKey: string): Promise<ChainActivity> {
  const result: ChainActivity = {
    chain: chain.id,
    chainName: chain.name,
    hasActivity: false,
    hasBalance: false,
    hasDeFiPositions: false,
    tokenCount: 0
  };

  try {
    // Check native balance
    const balanceResponse = await fetch(
      `https://deep-index.moralis.io/api/v2.2/${address}/balance?chain=${chain.moralisChain}`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json();
      const nativeBalance = parseFloat(balanceData.balance || '0');
      result.hasBalance = nativeBalance > 0;
      if (nativeBalance > 0) result.hasActivity = true;
    }

    // Check token balances
    const tokensResponse = await fetch(
      `https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=${chain.moralisChain}&limit=10`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (tokensResponse.ok) {
      const tokensData = await tokensResponse.json();
      const tokens = tokensData.result || [];
      result.tokenCount = tokens.length;
      if (tokens.length > 0) result.hasActivity = true;
    }

    // Check DeFi positions using official Moralis DeFi API
    try {
      const defiResponse = await fetch(
        `https://deep-index.moralis.io/api/v2.2/wallets/${address}/defi/summary?chain=${chain.moralisChain}`,
        {
          headers: {
            'X-API-Key': apiKey,
            'accept': 'application/json'
          }
        }
      );

      if (defiResponse.ok) {
        const defiData = await defiResponse.json();
        result.hasDeFiPositions = (defiData.total_usd_value || 0) > 0;
        if (result.hasDeFiPositions) result.hasActivity = true;
      }
    } catch (defiError) {
      // DeFi API might not be available for all chains, try alternative endpoint
      try {
        const defiPositionsResponse = await fetch(
          `https://deep-index.moralis.io/api/v2.2/wallets/${address}/defi/positions?chain=${chain.moralisChain}`,
          {
            headers: {
              'X-API-Key': apiKey,
              'accept': 'application/json'
            }
          }
        );

        if (defiPositionsResponse.ok) {
          const defiPositionsData = await defiPositionsResponse.json();
          const positions = defiPositionsData.result || [];
          result.hasDeFiPositions = positions.length > 0;
          if (result.hasDeFiPositions) result.hasActivity = true;
        }
      } catch (positionsError) {
        console.warn(`DeFi check failed for ${chain.name}:`, positionsError);
      }
    }

  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error checking ${chain.name} for ${address}:`, error);
  }

  return result;
}

// Check Solana activity using official Moralis Solana API
async function checkSolanaActivity(address: string, apiKey: string): Promise<ChainActivity> {
  const result: ChainActivity = {
    chain: 'solana',
    chainName: 'Solana',
    hasActivity: false,
    hasBalance: false,
    hasDeFiPositions: false,
    tokenCount: 0
  };

  try {
    // Check SOL balance using official Moralis Solana API
    const balanceResponse = await fetch(
      `https://solana-gateway.moralis.io/account/mainnet/${address}/balance`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json();
      const solBalance = parseFloat(balanceData.solana || balanceData.lamports || '0');
      result.hasBalance = solBalance > 0;
      if (solBalance > 0) result.hasActivity = true;
    }

    // Check SPL tokens using official Moralis Solana API
    const tokensResponse = await fetch(
      `https://solana-gateway.moralis.io/account/mainnet/${address}/tokens`,
      {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (tokensResponse.ok) {
      const tokensData = await tokensResponse.json();
      const tokens = tokensData.tokens || tokensData.result || [];
      result.tokenCount = tokens.length;
      if (tokens.length > 0) result.hasActivity = true;
    }

    // Check NFTs (optional indicator of activity)
    try {
      const nftResponse = await fetch(
        `https://solana-gateway.moralis.io/account/mainnet/${address}/nft`,
        {
          headers: {
            'X-API-Key': apiKey,
            'accept': 'application/json'
          }
        }
      );

      if (nftResponse.ok) {
        const nftData = await nftResponse.json();
        const nfts = nftData.result || nftData.nfts || [];
        if (nfts.length > 0) result.hasActivity = true;
      }
    } catch (nftError) {
      console.warn('NFT check failed for Solana:', nftError);
    }

    // Check portfolio value (if available)
    try {
      const portfolioResponse = await fetch(
        `https://solana-gateway.moralis.io/account/mainnet/${address}/portfolio`,
        {
          headers: {
            'X-API-Key': apiKey,
            'accept': 'application/json'
          }
        }
      );

      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        const totalValue = parseFloat(portfolioData.total_value_usd || '0');
        result.hasDeFiPositions = totalValue > 0;
        if (totalValue > 0) result.hasActivity = true;
      }
    } catch (portfolioError) {
      console.warn('Portfolio check failed for Solana:', portfolioError);
    }

  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error checking Solana for ${address}:`, error);
  }

  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChainDetectionResult | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.body;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Address is required' });
  }

  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Moralis API key not configured' });
  }

  const startTime = Date.now();

  try {
    console.log(`🔍 Starting chain detection for address: ${address}`);

    // Determine address type
    let addressType: 'evm' | 'solana' | 'unknown' = 'unknown';
    if (isValidEVMAddress(address)) {
      addressType = 'evm';
    } else if (isValidSolanaAddress(address)) {
      addressType = 'solana';
    }

    console.log(`📍 Address type detected: ${addressType}`);

    const activeChains: ChainActivity[] = [];
    let totalChainsChecked = 0;

    if (addressType === 'evm') {
      console.log(`🔍 Checking ${EVM_CHAINS.length} EVM chains in parallel...`);
      
      // Check all EVM chains in parallel for speed
      const evmPromises = EVM_CHAINS.map(chain => 
        checkEVMChainActivity(address, chain, apiKey)
      );
      
      const evmResults = await Promise.all(evmPromises);
      activeChains.push(...evmResults);
      totalChainsChecked = EVM_CHAINS.length;

    } else if (addressType === 'solana') {
      console.log(`🔍 Checking Solana...`);
      
      const solanaResult = await checkSolanaActivity(address, apiKey);
      activeChains.push(solanaResult);
      totalChainsChecked = 1;

    } else {
      console.log(`❌ Unknown address type, checking both EVM and Solana...`);
      
      // Try both if address type is unclear
      const allPromises = [
        ...EVM_CHAINS.map(chain => checkEVMChainActivity(address, chain, apiKey)),
        checkSolanaActivity(address, apiKey)
      ];
      
      const allResults = await Promise.all(allPromises);
      activeChains.push(...allResults);
      totalChainsChecked = EVM_CHAINS.length + 1;
    }

    // Filter chains with activity
    const chainsWithActivity = activeChains.filter(chain => chain.hasActivity);
    
    // Determine primary chain (most activity)
    let primaryChain: string | null = null;
    if (chainsWithActivity.length > 0) {
      // Prioritize chains with DeFi activity, then tokens, then balance
      const sortedChains = chainsWithActivity.sort((a, b) => {
        if (a.hasDeFiPositions && !b.hasDeFiPositions) return -1;
        if (!a.hasDeFiPositions && b.hasDeFiPositions) return 1;
        if (a.tokenCount !== b.tokenCount) return b.tokenCount - a.tokenCount;
        return a.hasBalance ? -1 : 1;
      });
      
      primaryChain = sortedChains[0].chain;
    }

    // Generate recommendations
    const recommendedChains = chainsWithActivity.map(chain => chain.chain);

    const detectionTime = `${Date.now() - startTime}ms`;

    const result: ChainDetectionResult = {
      address,
      addressType,
      activeChains,
      primaryChain,
      recommendedChains,
      totalChainsChecked,
      detectionTime
    };

    console.log(`✅ Chain detection completed in ${detectionTime}`);
    console.log(`📊 Found activity on: ${recommendedChains.join(', ') || 'none'}`);
    console.log(`🎯 Primary chain: ${primaryChain || 'none'}`);

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Chain detection error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Chain detection failed' 
    });
  }
} 