// Role-based authentication system for LiquidFlow

export interface User {
  walletAddress: string;
  role: 'customer' | 'admin' | 'super_admin';
  permissions: string[];
  clientId?: string; // For customers
  adminLevel?: number; // For admins
}

// 🔐 ADMIN WALLET ADDRESSES (In production, store in database)
const ADMIN_WALLETS = [
  '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2', // Primary admin
  '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t', // Secondary admin
  // Add more admin wallet addresses here
];

// 🏢 LIQUIDFLOW COMPANY ADDRESSES (Super admin access)
const LIQUIDFLOW_ADMIN_WALLETS = [
  '0x9f8e7d6c5b4a3928374656789abcdef0123456789', // John's admin wallet
  '0x456789abcdef0123456789abcdef0123456789ab',   // Company owner
];

export function getUserRole(walletAddress: string): User {
  const address = walletAddress.toLowerCase();
  
  // Check if LiquidFlow admin
  if (LIQUIDFLOW_ADMIN_WALLETS.some(admin => admin.toLowerCase() === address)) {
    return {
      walletAddress: address,
      role: 'super_admin',
      permissions: [
        'view_all_portfolios',
        'manage_all_clients', 
        'view_platform_analytics',
        'manage_admin_settings',
        'execute_trades',
        'access_sensitive_data'
      ],
      adminLevel: 3
    };
  }
  
  // Check if regular admin
  if (ADMIN_WALLETS.some(admin => admin.toLowerCase() === address)) {
    return {
      walletAddress: address,
      role: 'admin',
      permissions: [
        'view_assigned_portfolios',
        'manage_assigned_clients',
        'view_basic_analytics'
      ],
      adminLevel: 2
    };
  }
  
  // Default: Regular customer
  return {
    walletAddress: address,
    role: 'customer',
    permissions: [
      'view_own_portfolio',
      'manage_own_settings',
      'view_own_alerts'
    ],
    clientId: generateClientId(address),
    adminLevel: 0
  };
}

export function hasPermission(user: User, permission: string): boolean {
  return user.permissions.includes(permission);
}

export function canAccessAdminFeatures(walletAddress: string): boolean {
  const user = getUserRole(walletAddress);
  return user.role === 'admin' || user.role === 'super_admin';
}

export function canManageAllClients(walletAddress: string): boolean {
  const user = getUserRole(walletAddress);
  return user.role === 'super_admin';
}

function generateClientId(walletAddress: string): string {
  // Generate unique client ID from wallet address
  return `client_${walletAddress.slice(2, 10)}`;
}

// 🚨 SECURITY MIDDLEWARE
export function requireAdminAccess(walletAddress: string | null): boolean {
  if (!walletAddress) return false;
  return canAccessAdminFeatures(walletAddress);
}

export function requireSuperAdminAccess(walletAddress: string | null): boolean {
  if (!walletAddress) return false;
  const user = getUserRole(walletAddress);
  return user.role === 'super_admin';
}

// 📊 BUSINESS LOGIC
export function getAccessibleClients(adminWalletAddress: string): string[] {
  const user = getUserRole(adminWalletAddress);
  
  if (user.role === 'super_admin') {
    // Super admins can access all clients
    return ['all'];
  }
  
  if (user.role === 'admin') {
    // Regular admins can only access assigned clients
    return getAssignedClients(adminWalletAddress);
  }
  
  return []; // Customers can't access other clients
}

function getAssignedClients(adminWallet: string): string[] {
  // In production, this would query database for admin's assigned clients
  return [
    '0xabcdef0123456789abcdef0123456789abcdef01',
    '0xfedcba9876543210fedcba9876543210fedcba98'
  ];
}

// 🔐 PRODUCTION IMPLEMENTATION NOTES:
//
// 1. DATABASE STRUCTURE:
//    - users table: wallet_address, role, permissions, created_at
//    - admin_assignments: admin_wallet, client_wallet, assigned_at
//    - audit_log: action, user_wallet, timestamp, details
//
// 2. JWT TOKENS:
//    - Sign tokens with role and permissions
//    - Include expiration (24 hours for customers, 8 hours for admins)
//    - Refresh token mechanism
//
// 3. API MIDDLEWARE:
//    - Validate JWT on every request
//    - Check permissions for specific actions
//    - Log all admin actions for audit
//
// 4. FRONTEND PROTECTION:
//    - Hide admin UI elements for non-admins
//    - Redirect unauthorized users
//    - Show different navigation based on role 