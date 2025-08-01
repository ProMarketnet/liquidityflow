// Privy configuration for LiquidFlow authentication

export const PRIVY_APP_ID = 'cmcipgo4f009tib0n39t8b8pn';
export const PRIVY_APP_SECRET = 'DuF7mac593PhqLW8681PRmiefHCwjegeUXahQ1Jj3bEWLub6Q5Bysqj1cyDFg4hMd5MnqP3uaKPgDZfCuWANNUn';

export const privyConfig = {
  // Authentication configuration
    // Supported login methods
    loginMethods: ['wallet', 'email', 'sms'],
    
    // Wallet configuration
    appearance: {
      theme: 'light',
      accentColor: '#16a34a', // LiquidFlow green
      logo: '/logo.svg',
      showWalletLoginFirst: true,
      walletChainType: 'ethereum-and-solana'
    },
    
    // Supported wallets
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: true
    },
    
    // External wallets
    externalWallets: {
      metamask: true,
      coinbaseWallet: true,
      walletConnect: true,
      rainbow: true,
      phantom: true, // Solana support
      solflare: true // Solana support
    },
    
    // Legal configuration
    legal: {
      termsAndConditionsUrl: '/terms',
      privacyPolicyUrl: '/privacy'
    },
    
    // Multi-chain support
    supportedChains: [
      // Ethereum Mainnet
      {
        id: 1,
        name: 'Ethereum',
        network: 'mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://eth-mainnet.g.alchemy.com/v2/demo'] },
          public: { http: ['https://eth-mainnet.g.alchemy.com/v2/demo'] }
        },
        blockExplorers: {
          default: { name: 'Etherscan', url: 'https://etherscan.io' }
        }
      },
      // Arbitrum One
      {
        id: 42161,
        name: 'Arbitrum One',
        network: 'arbitrum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://arb1.arbitrum.io/rpc'] },
          public: { http: ['https://arb1.arbitrum.io/rpc'] }
        },
        blockExplorers: {
          default: { name: 'Arbiscan', url: 'https://arbiscan.io' }
        }
      },
      // Base
      {
        id: 8453,
        name: 'Base',
        network: 'base',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://mainnet.base.org'] },
          public: { http: ['https://mainnet.base.org'] }
        },
        blockExplorers: {
          default: { name: 'BaseScan', url: 'https://basescan.org' }
        }
      },
      // Optimism
      {
        id: 10,
        name: 'Optimism',
        network: 'optimism',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://mainnet.optimism.io'] },
          public: { http: ['https://mainnet.optimism.io'] }
        },
        blockExplorers: {
          default: { name: 'Optimistic Etherscan', url: 'https://optimistic.etherscan.io' }
        }
      }
    ],
    
    // Solana configuration
    solana: {
      enabled: true,
      cluster: 'mainnet-beta'
    }
};

// User roles and permissions
export interface LiquidFlowUser {
  id: string;
  walletAddress: string;
  email?: string;
  phone?: string;
  role: 'customer' | 'admin' | 'super_admin';
  permissions: string[];
  createdAt: Date;
  lastLoginAt: Date;
  profile: {
    companyName?: string;
    managedWallets?: string[];
    accessLevel?: 'own' | 'managed' | 'both';
  };
}

// Default user permissions
export const USER_PERMISSIONS = {
  customer: [
    'view_own_portfolio',
    'research_public_wallets',
    'access_trading_links',
    'manage_own_alerts'
  ],
  admin: [
    'view_own_portfolio',
    'research_public_wallets',
    'access_trading_links',
    'manage_own_alerts',
    'view_assigned_clients',
    'manage_client_portfolios',
    'execute_client_trades'
  ],
  super_admin: [
    'view_own_portfolio',
    'research_public_wallets',
    'access_trading_links',
    'manage_own_alerts',
    'view_assigned_clients',
    'manage_client_portfolios',
    'execute_client_trades',
    'view_platform_analytics',
    'manage_all_users',
    'access_admin_settings'
  ]
};

// Environment variables validation
export function validatePrivyConfig() {
  const requiredEnvVars = {
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET
  };

  const missing = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(`⚠️ Missing Privy environment variables: ${missing.join(', ')}`);
    console.warn('Add these to your .env.local file for full functionality');
  }

  return missing.length === 0;
}

// Helper functions
export function getUserRole(user: any): 'customer' | 'admin' | 'super_admin' {
  // Check if user is in admin list (you can modify this logic)
  const adminWallets = [
    '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
    '0x9f8e7d6c5b4a3928374656789abcdef0123456789'
  ];
  
  const superAdminWallets = [
    '0x456789abcdef0123456789abcdef0123456789ab'
  ];

  if (user?.wallet?.address) {
    const address = user.wallet.address.toLowerCase();
    
    if (superAdminWallets.some(admin => admin.toLowerCase() === address)) {
      return 'super_admin';
    }
    
    if (adminWallets.some(admin => admin.toLowerCase() === address)) {
      return 'admin';
    }
  }
  
  return 'customer';
}

export function getUserPermissions(role: 'customer' | 'admin' | 'super_admin'): string[] {
  return USER_PERMISSIONS[role] || USER_PERMISSIONS.customer;
} 