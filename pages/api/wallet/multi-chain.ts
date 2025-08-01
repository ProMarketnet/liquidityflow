import { NextApiRequest, NextApiResponse } from 'next';
import { SUPPORTED_CHAINS, getChainById, MORALIS_CONFIG } from '../../../lib/chains';

interface MultiChainPortfolio {
  totalValue: number;
  totalValueChange24h: number;
  chains: ChainPortfolio[];
  summary: {
    totalTokens: number;
    totalNFTs: number;
    totalProtocols: number;
    topChainByValue: string;
  };
}

interface ChainPortfolio {
  chainId: string;
  chainName: string;
  chainLogo: string;
  value: number;
  valueChange24h: number;
  tokens: TokenBalance[];
  nfts: NFTBalance[];
  defiPositions: DefiPosition[];
  transactionCount: number;
}

interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  balanceFormatted: string;
  valueUsd: number;
  logo?: string;
  contractAddress: string;
}

interface NFTBalance {
  name: string;
  collection: string;
  tokenId: string;
  image?: string;
  estimatedValue?: number;
}

interface DefiPosition {
  protocol: string;
  protocolLogo: string;
  type: string;
  value: number;
  apy?: number;
  healthFactor?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, chains } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Parse requested chains (default to all if not specified)
    const requestedChains = chains 
      ? (chains as string).split(',')
      : SUPPORTED_CHAINS.map(c => c.id);

    console.log(`🌐 Fetching multi-chain portfolio for ${address} across chains: ${requestedChains.join(', ')}`);

    // Fetch data for all requested chains in parallel
    const chainPortfolios = await Promise.all(
      requestedChains.map(chainId => fetchChainPortfolio(address, chainId))
    );

    // Filter out failed requests
    const validPortfolios = chainPortfolios.filter((p): p is ChainPortfolio => p !== null);

    // Calculate totals
    const totalValue = validPortfolios.reduce((sum, portfolio) => sum + portfolio.value, 0);
    const totalValueChange24h = validPortfolios.reduce((sum, portfolio) => sum + portfolio.valueChange24h, 0);
    const totalTokens = validPortfolios.reduce((sum, portfolio) => sum + portfolio.tokens.length, 0);
    const totalNFTs = validPortfolios.reduce((sum, portfolio) => sum + portfolio.nfts.length, 0);
    const totalProtocols = new Set(
      validPortfolios.flatMap(p => p.defiPositions.map(pos => pos.protocol))
    ).size;

    // Find top chain by value
    const topChain = validPortfolios.reduce((max, portfolio) => 
      portfolio.value > max.value ? portfolio : max, 
      validPortfolios[0] || { value: 0, chainName: 'None' }
    );

    const multiChainPortfolio: MultiChainPortfolio = {
      totalValue,
      totalValueChange24h,
      chains: validPortfolios,
      summary: {
        totalTokens,
        totalNFTs,
        totalProtocols,
        topChainByValue: topChain.chainName
      }
    };

    res.status(200).json(multiChainPortfolio);

  } catch (error) {
    console.error('Multi-chain portfolio API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function fetchChainPortfolio(address: string, chainId: string): Promise<ChainPortfolio | null> {
  const chain = getChainById(chainId);
  if (!chain) {
    console.error(`❌ Unknown chain: ${chainId}`);
    return null;
  }

  try {
    console.log(`🔍 Fetching ${chain.displayName} portfolio for ${address}`);

    if (chain.type === 'evm') {
      return await fetchEVMPortfolio(address, chain);
    } else if (chain.type === 'solana') {
      return await fetchSolanaPortfolio(address, chain);
    }

    return null;
  } catch (error) {
    console.error(`❌ Error fetching ${chain.displayName} portfolio:`, error);
    return null;
  }
}

async function fetchEVMPortfolio(address: string, chain: any): Promise<ChainPortfolio> {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) {
    throw new Error('MORALIS_API_KEY not configured');
  }

  const baseUrl = MORALIS_CONFIG.evm.baseUrl;
  const headers = {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  };

  // Fetch wallet stats (includes balance and 24h change)
  const statsResponse = await fetch(
    `${baseUrl}/wallets/${address}/chains/${chain.moralisChainId}/stats`,
    { headers }
  );
  const stats = statsResponse.ok ? await statsResponse.json() : null;

  // Fetch token balances
  const tokensResponse = await fetch(
    `${baseUrl}/${address}/erc20?chain=${chain.moralisChainId}`,
    { headers }
  );
  const tokens = tokensResponse.ok ? await tokensResponse.json() : [];

  // Fetch NFTs
  const nftsResponse = await fetch(
    `${baseUrl}/${address}/nft?chain=${chain.moralisChainId}&limit=20`,
    { headers }
  );
  const nfts = nftsResponse.ok ? await nftsResponse.json() : { result: [] };

  // Fetch DeFi positions
  const defiResponse = await fetch(
    `${baseUrl}/wallets/${address}/defi/positions?chain=${chain.moralisChainId}`,
    { headers }
  );
  const defiPositions = defiResponse.ok ? await defiResponse.json() : [];

  // Mock data for demo (replace with actual API responses)
  const mockPortfolio: ChainPortfolio = {
    chainId: chain.id,
    chainName: chain.displayName,
    chainLogo: chain.logo,
    value: Math.random() * 50000 + 1000, // $1K - $50K
    valueChange24h: (Math.random() - 0.5) * 1000, // ±$500
    tokens: generateMockTokens(chain),
    nfts: generateMockNFTs(chain),
    defiPositions: generateMockDefiPositions(chain),
    transactionCount: Math.floor(Math.random() * 1000) + 50
  };

  return mockPortfolio;
}

async function fetchSolanaPortfolio(address: string, chain: any): Promise<ChainPortfolio> {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) {
    throw new Error('MORALIS_API_KEY not configured');
  }

  const baseUrl = MORALIS_CONFIG.solana.baseUrl;
  const headers = {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  };

  // Fetch Solana portfolio using different API structure
  try {
    // Solana balance
    const balanceResponse = await fetch(
      `${baseUrl}/account/mainnet/${address}/balance`,
      { headers }
    );
    const balance = balanceResponse.ok ? await balanceResponse.json() : null;

    // Solana tokens
    const tokensResponse = await fetch(
      `${baseUrl}/account/mainnet/${address}/tokens`,
      { headers }
    );
    const tokens = tokensResponse.ok ? await tokensResponse.json() : [];

    // Solana portfolio summary
    const portfolioResponse = await fetch(
      `${baseUrl}/account/mainnet/${address}/portfolio`,
      { headers }
    );
    const portfolio = portfolioResponse.ok ? await portfolioResponse.json() : null;

  } catch (error) {
    console.log('Using mock Solana data for demo');
  }

  // Mock Solana portfolio for demo
  const mockSolanaPortfolio: ChainPortfolio = {
    chainId: chain.id,
    chainName: chain.displayName,
    chainLogo: chain.logo,
    value: Math.random() * 25000 + 500,
    valueChange24h: (Math.random() - 0.5) * 500,
    tokens: [
      {
        symbol: 'SOL',
        name: 'Solana',
        balance: Math.random() * 100 + 10,
        balanceFormatted: '45.67',
        valueUsd: Math.random() * 5000 + 1000,
        contractAddress: 'So11111111111111111111111111111111111111112'
      },
      {
        symbol: 'RAY',
        name: 'Raydium',
        balance: Math.random() * 1000 + 100,
        balanceFormatted: '234.56',
        valueUsd: Math.random() * 1000,
        contractAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'
      }
    ],
    nfts: [
      {
        name: 'DeGods #1234',
        collection: 'DeGods',
        tokenId: '1234',
        estimatedValue: Math.random() * 10000 + 1000
      }
    ],
    defiPositions: [
      {
        protocol: 'Raydium',
        protocolLogo: '⚡',
        type: 'Liquidity Pool',
        value: Math.random() * 5000 + 500,
        apy: Math.random() * 50 + 10
      },
      {
        protocol: 'Marinade',
        protocolLogo: '🥩',
        type: 'Staking',
        value: Math.random() * 3000 + 200,
        apy: Math.random() * 10 + 5
      }
    ],
    transactionCount: Math.floor(Math.random() * 500) + 25
  };

  return mockSolanaPortfolio;
}

function generateMockTokens(chain: any): TokenBalance[] {
  const commonTokens = {
    ethereum: [
      { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000' },
      { symbol: 'USDC', name: 'USD Coin', address: '0xa0b86a33e6441c8c673e4c0b8e0a3d8f6b1c8a8c' },
      { symbol: 'USDT', name: 'Tether', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' }
    ],
    arbitrum: [
      { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000' },
      { symbol: 'ARB', name: 'Arbitrum', address: '0x912ce59144191c1204e64559fe8253a0e49e6548' },
      { symbol: 'GMX', name: 'GMX', address: '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a' }
    ],
    base: [
      { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000' },
      { symbol: 'USDC', name: 'USD Coin', address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' }
    ],
    optimism: [
      { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000' },
      { symbol: 'OP', name: 'Optimism', address: '0x4200000000000000000000000000000000000042' }
    ]
  };

  const chainTokens = commonTokens[chain.id as keyof typeof commonTokens] || commonTokens.ethereum;
  
  return chainTokens.map(token => ({
    symbol: token.symbol,
    name: token.name,
    balance: Math.random() * 100 + 1,
    balanceFormatted: (Math.random() * 100 + 1).toFixed(4),
    valueUsd: Math.random() * 10000 + 100,
    contractAddress: token.address
  }));
}

function generateMockNFTs(chain: any): NFTBalance[] {
  const mockNFTs = [
    { name: 'Bored Ape #1234', collection: 'Bored Ape Yacht Club' },
    { name: 'CryptoPunk #5678', collection: 'CryptoPunks' },
    { name: 'Azuki #9012', collection: 'Azuki' }
  ];

  return mockNFTs.slice(0, Math.floor(Math.random() * 3) + 1).map((nft, index) => ({
    name: nft.name,
    collection: nft.collection,
    tokenId: String(1234 + index),
    estimatedValue: Math.random() * 50000 + 1000
  }));
}

function generateMockDefiPositions(chain: any): DefiPosition[] {
  const protocolsByChain = {
    ethereum: ['Uniswap V3', 'Aave V3', 'Compound', 'Lido'],
    arbitrum: ['Uniswap V3', 'GMX', 'Camelot', 'Radiant'],
    base: ['Uniswap V3', 'Aerodrome', 'Moonwell'],
    optimism: ['Uniswap V3', 'Velodrome', 'Synthetix'],
    solana: ['Raydium', 'Orca', 'Marinade', 'Jupiter']
  };

  const protocols = protocolsByChain[chain.id as keyof typeof protocolsByChain] || protocolsByChain.ethereum;
  const logos = ['🦄', '👻', '🏦', '🛡️', '⚡', '🏰', '💫', '✈️', '🌙', '🚴', '🔗'];

  return protocols.slice(0, Math.floor(Math.random() * 3) + 1).map((protocol, index) => ({
    protocol,
    protocolLogo: logos[index % logos.length],
    type: Math.random() > 0.5 ? 'Liquidity Pool' : 'Lending',
    value: Math.random() * 10000 + 500,
    apy: Math.random() * 30 + 5,
    healthFactor: Math.random() > 0.7 ? Math.random() * 3 + 1.5 : undefined
  }));
} 