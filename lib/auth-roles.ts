// 👤 User-based multi-tenant authentication system for LiquidFlow

export interface User {
  id: string;
  email: string;
  name?: string;
  walletAddress?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  permissions: string[];
  
  // 🏢 User's Own Workspace
  userWorkspaceId: string; // Unique workspace for this user
  createdAt?: string;
}

export interface UserWorkspace {
  id: string;
  userEmail: string;
  userName?: string;
  walletCount: number;
  poolCount: number;
  createdAt: string;
  lastAccessed: string;
}

// 🔐 SIMPLE EMAIL-BASED AUTHENTICATION (In production, use proper auth service)
export function getUserFromEmail(email: string): User | null {
  if (!email || !email.includes('@')) {
    return null; // Invalid email
  }

  // Generate consistent user ID from email
  const userId = `user_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}`;
  const workspaceId = `workspace_${userId}`;

  return {
    id: userId,
    email: email.toLowerCase(),
    name: extractNameFromEmail(email),
    role: 'USER', // All users are regular users by default
    userWorkspaceId: workspaceId,
    permissions: [
      'view_own_portfolios',
      'manage_own_wallets',
      'manage_own_pools',
      'view_own_analytics',
      'generate_own_reports',
      'manage_own_alerts'
    ]
  };
}

// 🏢 SUPER ADMIN ACCESS (LiquidFlow platform admins)
export function getSuperAdminFromEmail(email: string): User | null {
  const superAdminEmails = [
    'admin@liquidflow.com',
    'support@liquidflow.com'
  ];

  if (superAdminEmails.includes(email.toLowerCase())) {
    return {
      id: 'super_admin',
      email: email.toLowerCase(),
      name: 'LiquidFlow Admin',
      role: 'SUPER_ADMIN',
      userWorkspaceId: 'all_workspaces',
      permissions: [
        'view_all_users',
        'manage_all_data',
        'platform_analytics',
        'user_management'
      ]
    };
  }

  return null;
}

export function authenticateUser(email: string, password?: string): User | null {
  // Check if super admin first
  const superAdmin = getSuperAdminFromEmail(email);
  if (superAdmin) return superAdmin;

  // Regular user authentication
  return getUserFromEmail(email);
}

// 🔐 USER WORKSPACE ACCESS CONTROL
export function canAccessWorkspace(user: User, workspaceId: string): boolean {
  // Super admins can access all workspaces
  if (user.role === 'SUPER_ADMIN') return true;
  
  // Users can only access their own workspace
  return user.userWorkspaceId === workspaceId;
}

export function getUserWorkspace(user: User): UserWorkspace {
  return {
    id: user.userWorkspaceId,
    userEmail: user.email,
    userName: user.name,
    walletCount: getUserWalletCount(user.userWorkspaceId),
    poolCount: getUserPoolCount(user.userWorkspaceId),
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString()
  };
}

// 📊 USER-SPECIFIC DATA ACCESS
export function getUserWallets(userWorkspaceId: string): any[] {
  // In production, query database: SELECT * FROM wallets WHERE user_workspace_id = ?
  const userWalletData: { [key: string]: any[] } = {
    'workspace_user_dGVzdEBleGFtcGxl': [ // test@example.com
      {
        id: '1',
        address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
        clientName: 'Alice Johnson',
        totalValue: 245823.12,
        status: 'active'
      }
    ],
    'workspace_user_amRvZUBjb21wYW55': [ // jdoe@company.com  
      {
        id: '2',
        address: '0x456789abcdef0123456789abcdef0123456789ab',
        clientName: 'John Client',
        totalValue: 156789.45,
        status: 'active'
      }
    ]
  };

  return userWalletData[userWorkspaceId] || [];
}

export function getUserPools(userWorkspaceId: string): any[] {
  // In production, query database: SELECT * FROM pools WHERE user_workspace_id = ?
  const userPoolData: { [key: string]: any[] } = {
    'workspace_user_dGVzdEBleGFtcGxl': [
      { id: 'pool_1', name: 'ETH/USDC', dex: 'Uniswap V3' }
    ],
    'workspace_user_amRvZUBjb21wYW55': [
      { id: 'pool_2', name: 'BTC/ETH', dex: 'Sushiswap' }
    ]
  };

  return userPoolData[userWorkspaceId] || [];
}

function getUserWalletCount(workspaceId: string): number {
  return getUserWallets(workspaceId).length;
}

function getUserPoolCount(workspaceId: string): number {
  return getUserPools(workspaceId).length;
}

function extractNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  return localPart
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

// 🔍 SESSION MANAGEMENT
export function createUserSession(user: User): string {
  return btoa(JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    workspaceId: user.userWorkspaceId,
    permissions: user.permissions,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
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
      email: session.email,
      role: session.role,
      userWorkspaceId: session.workspaceId,
      permissions: session.permissions
    };
  } catch {
    return null; // Invalid session
  }
}

// 🔒 PRODUCTION NOTES:
// 1. Replace email-based auth with proper authentication service (Auth0, Firebase, etc.)
// 2. Store user workspaces in database with proper foreign keys
// 3. Implement proper password hashing and JWT tokens
// 4. Add rate limiting and audit logging
// 5. Use proper database queries instead of mock data 