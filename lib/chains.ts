// Multi-chain configuration for LiquidFlow
// Supports Ethereum, Arbitrum, Base, Optimism, and Solana

export interface ChainConfig {
  id: string;
  name: string;
  displayName: string;
  logo: string;
  currency: string;
  rpcUrl: string;
  blockExplorer: string;
  moralisChainId: string;
  type: 'evm' | 'solana';
  color: string;
  protocols: string[];
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
  // 🔵 Ethereum Mainnet
  {
    id: 'ethereum',
    name: 'eth',
    displayName: 'Ethereum',
    logo: '⟠',
    currency: 'ETH',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/',
    blockExplorer: 'https://etherscan.io',
    moralisChainId: 'eth',
    type: 'evm',
    color: '#627EEA',
    protocols: [
      'Uniswap V2', 'Uniswap V3', 'Aave V3', 'Compound', 'Curve',
      'Lido', 'MakerDAO', '1inch', 'SushiSwap', 'Balancer'
    ]
  },
  
  // 🔴 Arbitrum
  {
    id: 'arbitrum',
    name: 'arbitrum',
    displayName: 'Arbitrum One',
    logo: '🔵',
    currency: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    moralisChainId: '0xa4b1',
    type: 'evm',
    color: '#28A0F0',
    protocols: [
      'Uniswap V3', 'Aave V3', 'Curve', 'SushiSwap', 'Balancer',
      'GMX', 'Camelot', 'Radiant', 'Jones DAO'
    ]
  },
  
  // 🔵 Base (Coinbase L2)
  {
    id: 'base',
    name: 'base',
    displayName: 'Base',
    logo: '🔷',
    currency: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    moralisChainId: '0x2105',
    type: 'evm',
    color: '#0052FF',
    protocols: [
      'Uniswap V3', 'Aave V3', 'Curve', 'SushiSwap',
      'Aerodrome', 'Compound V3', 'Moonwell'
    ]
  },
  
  // 🔴 Optimism
  {
    id: 'optimism',
    name: 'optimism',
    displayName: 'Optimism',
    logo: '🔴',
    currency: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorer: 'https://optimistic.etherscan.io',
    moralisChainId: '0xa',
    type: 'evm',
    color: '#FF0420',
    protocols: [
      'Uniswap V3', 'Aave V3', 'Curve', 'SushiSwap',
      'Velodrome', 'Synthetix', 'Kwenta', 'Polynomial'
    ]
  },
  
  // 🟣 Solana
  {
    id: 'solana',
    name: 'solana',
    displayName: 'Solana',
    logo: '◉',
    currency: 'SOL',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    blockExplorer: 'https://solscan.io',
    moralisChainId: 'mainnet', // Solana uses different API
    type: 'solana',
    color: '#9945FF',
    protocols: [
      'Raydium', 'Orca', 'Jupiter', 'Marinade', 'Lido',
      'Serum', 'Mango', 'Drift', 'Kamino', 'Tulip'
    ]
  }
];

export const DEFAULT_CHAIN = SUPPORTED_CHAINS[0]; // Ethereum

export function getChainById(chainId: string): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
}

export function getChainByMoralisId(moralisId: string): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find(chain => chain.moralisChainId === moralisId);
}

export function getEVMChains(): ChainConfig[] {
  return SUPPORTED_CHAINS.filter(chain => chain.type === 'evm');
}

export function getSolanaChains(): ChainConfig[] {
  return SUPPORTED_CHAINS.filter(chain => chain.type === 'solana');
}

// 🌐 MORALIS API CONFIGURATION
export const MORALIS_CONFIG = {
  // EVM chains (Ethereum, Arbitrum, Base, Optimism)
  evm: {
    baseUrl: 'https://deep-index.moralis.io/api/v2.2',
    endpoints: {
      balance: '/wallets/{address}/chains/{chain}/stats',
      tokens: '/{address}/erc20',
      nfts: '/{address}/nft',
      defiPositions: '/wallets/{address}/defi/positions',
      defiSummary: '/wallets/{address}/defi/summary',
      transactions: '/{address}',
      portfolioHistory: '/wallets/{address}/history'
    }
  },
  
  // Solana chain
  solana: {
    baseUrl: 'https://solana-gateway.moralis.io',
    endpoints: {
      balance: '/account/{network}/{address}/balance',
      tokens: '/account/{network}/{address}/tokens',
      nfts: '/account/{network}/{address}/nft',
      portfolio: '/account/{network}/{address}/portfolio',
      transactions: '/account/{network}/{address}/transactions'
    }
  }
};

// 🔗 CHAIN-SPECIFIC DEX CONFIGURATIONS
export const DEX_CONFIG = {
  ethereum: {
    uniswapV3: 'https://app.uniswap.org/#/swap',
    uniswapV2: 'https://app.uniswap.org/#/swap',
    sushiswap: 'https://www.sushi.com/swap',
    curve: 'https://curve.fi/#/ethereum/swap',
    balancer: 'https://app.balancer.fi/#/ethereum/swap'
  },
  arbitrum: {
    uniswapV3: 'https://app.uniswap.org/#/swap?chain=arbitrum',
    sushiswap: 'https://www.sushi.com/swap?chainId=42161',
    curve: 'https://curve.fi/#/arbitrum/swap',
    camelot: 'https://app.camelot.exchange/swap'
  },
  base: {
    uniswapV3: 'https://app.uniswap.org/#/swap?chain=base',
    aerodrome: 'https://aerodrome.finance/swap',
    sushiswap: 'https://www.sushi.com/swap?chainId=8453'
  },
  optimism: {
    uniswapV3: 'https://app.uniswap.org/#/swap?chain=optimism',
    velodrome: 'https://app.velodrome.finance/swap',
    curve: 'https://curve.fi/#/optimism/swap'
  },
  solana: {
    jupiter: 'https://jup.ag/swap',
    raydium: 'https://raydium.io/swap',
    orca: 'https://www.orca.so/pools'
  }
};

// 🎨 CHAIN SELECTOR COMPONENT HELPER
export function getChainSelectorOptions() {
  return SUPPORTED_CHAINS.map(chain => ({
    value: chain.id,
    label: `${chain.logo} ${chain.displayName}`,
    color: chain.color,
    type: chain.type
  }));
}

// 🔧 UTILITY FUNCTIONS
export function formatAddress(address: string, chainType: 'evm' | 'solana' = 'evm'): string {
  if (!address) return '';
  
  if (chainType === 'solana') {
    // Solana addresses are longer, show more characters
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  }
  
  // EVM addresses
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getExplorerUrl(address: string, chainId: string, type: 'address' | 'tx' = 'address'): string {
  const chain = getChainById(chainId);
  if (!chain) return '';
  
  if (chain.type === 'solana') {
    return `${chain.blockExplorer}/${type === 'address' ? 'account' : 'tx'}/${address}`;
  }
  
  return `${chain.blockExplorer}/${type === 'address' ? 'address' : 'tx'}/${address}`;
}

export function isValidAddress(address: string, chainType: 'evm' | 'solana'): boolean {
  if (chainType === 'evm') {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  if (chainType === 'solana') {
    // Solana addresses are base58 encoded, typically 44 characters
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
  
  return false;
}

// 📊 PROTOCOL MAPPING
export const PROTOCOL_LOGOS: { [key: string]: string } = {
  // Universal
  'Uniswap V2': '🦄',
  'Uniswap V3': '🦄',
  'SushiSwap': '🍣',
  'Curve': '🌀',
  'Aave V3': '👻',
  'Compound': '🏦',
  'Lido': '🛡️',
  'Balancer': '⚖️',
  
  // Arbitrum specific
  'GMX': '⚡',
  'Camelot': '🏰',
  'Radiant': '💫',
  'Jones DAO': '🃏',
  
  // Base specific
  'Aerodrome': '✈️',
  'Moonwell': '🌙',
  
  // Optimism specific
  'Velodrome': '🚴',
  'Synthetix': '🔗',
  'Kwenta': '⚔️',
  'Polynomial': '📈',
  
  // Solana specific
  'Raydium': '⚡',
  'Orca': '🐋',
  'Jupiter': '🪐',
  'Marinade': '🥩',
  'Serum': '🧪',
  'Mango': '🥭',
  'Drift': '🌊',
  'Kamino': '🎯',
  'Tulip': '🌷'
};

// 🚀 PRODUCTION IMPLEMENTATION NOTES:
//
// 1. MORALIS API INTEGRATION:
//    - Use separate endpoints for EVM vs Solana
//    - Handle different response formats
//    - Implement chain-specific error handling
//
// 2. WALLET CONNECTION:
//    - Support MetaMask, WalletConnect for EVM
//    - Support Phantom, Solflare for Solana
//    - Chain switching functionality
//
// 3. DATA AGGREGATION:
//    - Combine portfolio data across all chains
//    - Calculate total USD values
//    - Handle cross-chain position tracking
//
// 4. UI/UX:
//    - Chain selector in navigation
//    - Chain-specific branding colors
//    - Protocol logos and links
//    - Multi-chain portfolio view 