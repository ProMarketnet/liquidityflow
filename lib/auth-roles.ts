// 🏢 Multi-tenant role-based authentication system for LiquidFlow

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  role: 'MEMBER' | 'ADMIN' | 'OWNER' | 'SUPER_ADMIN';
  permissions: string[];
  
  // 🏢 Company Association
  companyId?: string;
  companyName?: string;
  companySlug?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  maxWallets: number;
  maxPools: number;
  isActive: boolean;
}

// 🔐 COMPANY ADMIN MAPPINGS (In production, store in database)
const COMPANY_ADMINS = {
  'abc-company': {
    id: 'comp_abc123',
    name: 'ABC Company',
    slug: 'abc-company',
    plan: 'ENTERPRISE' as const,
    maxWallets: 50,
    maxPools: 100,
    isActive: true,
    admins: [
      '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2', // ABC Company Admin 1
      '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t', // ABC Company Admin 2
    ]
  },
  'xyz-corp': {
    id: 'comp_xyz456',
    name: 'XYZ Corporation',
    slug: 'xyz-corp',
    plan: 'PRO' as const,
    maxWallets: 25,
    maxPools: 50,
    isActive: true,
    admins: [
      '0x9f8e7d6c5b4a3928374656789abcdef0123456789', // XYZ Corp Admin 1
      '0x456789abcdef0123456789abcdef0123456789ab',   // XYZ Corp Admin 2
    ]
  },
  'demo-llc': {
    id: 'comp_demo789',
    name: 'Demo LLC',
    slug: 'demo-llc',
    plan: 'BASIC' as const,
    maxWallets: 10,
    maxPools: 20,
    isActive: true,
    admins: [
      '0xabcdef0123456789abcdef0123456789abcdef01', // Demo LLC Admin
    ]
  }
};

// 🏢 LIQUIDFLOW PLATFORM SUPER ADMINS
const LIQUIDFLOW_SUPER_ADMINS = [
  '0xLIQUIDFLOW123456789abcdef0123456789abcdef', // Platform owner
  '0xPLATFORM456789abcdef0123456789abcdef0123',   // Platform admin
];

export function getUserWithCompany(walletAddress: string): User | null {
  const address = walletAddress.toLowerCase();
  
  // Check if LiquidFlow platform super admin
  if (LIQUIDFLOW_SUPER_ADMINS.some(admin => admin.toLowerCase() === address)) {
    return {
      id: `super_${address.slice(2, 10)}`,
      walletAddress: address,
      email: `super-admin@liquidflow.com`,
      name: 'LiquidFlow Super Admin',
      role: 'SUPER_ADMIN',
      permissions: [
        'view_all_companies',
        'manage_all_companies',
        'view_platform_analytics',
        'manage_platform_settings',
        'access_all_data'
      ]
    };
  }
  
  // Check company admins
  for (const [companySlug, companyData] of Object.entries(COMPANY_ADMINS)) {
    if (companyData.admins.some(admin => admin.toLowerCase() === address)) {
      return {
        id: `admin_${address.slice(2, 10)}`,
        walletAddress: address,
        email: `admin@${companySlug.replace('-', '')}.com`,
        name: `${companyData.name} Admin`,
        role: 'ADMIN',
        companyId: companyData.id,
        companyName: companyData.name,
        companySlug: companySlug,
        permissions: [
          'view_company_portfolios',
          'manage_company_wallets',
          'manage_company_pools',
          'view_company_analytics',
          'generate_company_reports',
          'manage_company_alerts'
        ]
      };
    }
  }
  
  return null; // No admin access
}

export function getCompanyData(companySlug: string): Company | null {
  const companyData = COMPANY_ADMINS[companySlug as keyof typeof COMPANY_ADMINS];
  if (!companyData) return null;
  
  return {
    id: companyData.id,
    name: companyData.name,
    slug: companyData.slug,
    plan: companyData.plan,
    maxWallets: companyData.maxWallets,
    maxPools: companyData.maxPools,
    isActive: companyData.isActive
  };
}

export function hasPermission(user: User, permission: string): boolean {
  return user.permissions.includes(permission);
}

export function canAccessCompanyData(user: User, companyId: string): boolean {
  // Super admins can access all company data
  if (user.role === 'SUPER_ADMIN') return true;
  
  // Company admins can only access their own company data
  return user.companyId === companyId;
}

export function requireCompanyAccess(walletAddress: string | null): User | null {
  if (!walletAddress) return null;
  
  const user = getUserWithCompany(walletAddress);
  if (!user) return null;
  
  // Must be at least a company admin
  if (user.role === 'MEMBER') return null;
  
  return user;
}

// 🔐 COMPANY-SPECIFIC DATA ACCESS
export function getAccessibleWallets(user: User): string[] {
  if (user.role === 'SUPER_ADMIN') {
    return ['all']; // Can access all wallets across all companies
  }
  
  if (user.companyId) {
    // Return wallets for this specific company
    return getCompanyWallets(user.companyId);
  }
  
  return []; // No access
}

export function getAccessiblePools(user: User): string[] {
  if (user.role === 'SUPER_ADMIN') {
    return ['all']; // Can access all pools across all companies
  }
  
  if (user.companyId) {
    // Return pools for this specific company
    return getCompanyPools(user.companyId);
  }
  
  return []; // No access
}

// 📊 MOCK COMPANY DATA (In production, query from database)
function getCompanyWallets(companyId: string): string[] {
  const companyWallets: { [key: string]: string[] } = {
    'comp_abc123': [
      '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2', // Alice Johnson
      '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t', // Bob Chen
      '0x9f8e7d6c5b4a3928374656789abcdef0123456789', // Carol Smith
      // ... up to 10 wallets for ABC Company
    ],
    'comp_xyz456': [
      '0x456789abcdef0123456789abcdef0123456789ab',   // David Brown
      '0xabcdef0123456789abcdef0123456789abcdef01',   // Emma Wilson
      // ... different wallets for XYZ Corp
    ],
    'comp_demo789': [
      '0xdemo123456789abcdef0123456789abcdef012345',   // Demo Client
      // ... demo wallets
    ]
  };
  
  return companyWallets[companyId] || [];
}

function getCompanyPools(companyId: string): string[] {
  const companyPools: { [key: string]: string[] } = {
    'comp_abc123': [
      'pool_abc_eth_usdc',
      'pool_abc_btc_eth',
      'pool_abc_uni_eth',
      'pool_abc_aave_usdc',
      'pool_abc_comp_eth',
      // 5 pools for ABC Company
    ],
    'comp_xyz456': [
      'pool_xyz_eth_dai',
      'pool_xyz_link_eth',
      'pool_xyz_sol_usdc',
      // 3 pools for XYZ Corp
    ],
    'comp_demo789': [
      'pool_demo_eth_usdc',
      // 1 pool for Demo LLC
    ]
  };
  
  return companyPools[companyId] || [];
}

// 🔍 SESSION MANAGEMENT
export function createUserSession(user: User): string {
  // In production, create JWT with company info
  return btoa(JSON.stringify({
    userId: user.id,
    walletAddress: user.walletAddress,
    role: user.role,
    companyId: user.companyId,
    companySlug: user.companySlug,
    permissions: user.permissions,
    expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
  }));
}

export function validateUserSession(sessionToken: string): User | null {
  try {
    const session = JSON.parse(atob(sessionToken));
    
    if (session.expiresAt < Date.now()) {
      return null; // Session expired
    }
    
    return {
      id: session.userId,
      walletAddress: session.walletAddress,
      role: session.role,
      companyId: session.companyId,
      companySlug: session.companySlug,
      permissions: session.permissions
    };
  } catch {
    return null; // Invalid session
  }
} 