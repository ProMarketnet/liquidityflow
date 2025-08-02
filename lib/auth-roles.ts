// 🏢 Collaborative workspace authentication system for LiquidFlow

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'SUPER_ADMIN';
  permissions: string[];
  createdAt?: string;
}

export interface Workspace {
  id: string;
  name: string; // "XTC Company", "ABC Corp", etc.
  slug: string; // "xtc-company", "abc-corp"
  ownerId: string; // User ID who created the workspace
  ownerEmail: string;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  maxWallets: number;
  maxPools: number;
  isActive: boolean;
  createdAt: string;
  lastAccessed: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  userEmail: string;
  role: 'OWNER' | 'ADMIN' | 'GUEST'; // Role within this specific workspace
  permissions: string[];
  invitedBy: string; // Email of who invited them
  joinedAt: string;
  lastAccessed: string;
}

// 🔐 SIMPLE EMAIL-BASED AUTHENTICATION
export function getUserFromEmail(email: string): User | null {
  if (!email || !email.includes('@')) {
    return null;
  }

  const userId = `user_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}`;

  return {
    id: userId,
    email: email.toLowerCase(),
    name: extractNameFromEmail(email),
    role: 'USER',
    permissions: [
      'create_workspace',
      'join_workspace',
      'manage_own_profile'
    ]
  };
}

// 🏢 WORKSPACE MANAGEMENT
export function getUserWorkspaces(userEmail: string): WorkspaceMember[] {
  // In production: SELECT * FROM workspace_members WHERE user_email = ?
  const userWorkspaces: { [key: string]: WorkspaceMember[] } = {
    'john@company.com': [
      {
        id: 'member_1',
        workspaceId: 'ws_xtc_company',
        userId: 'user_amRvbkBjb21w',
        userEmail: 'john@company.com',
        role: 'OWNER',
        permissions: ['manage_workspace', 'invite_members', 'manage_wallets', 'manage_pools', 'view_reports'],
        invitedBy: 'self',
        joinedAt: '2024-01-15T10:00:00Z',
        lastAccessed: new Date().toISOString()
      }
    ],
    'jane@email.com': [
      {
        id: 'member_2',
        workspaceId: 'ws_xtc_company',
        userId: 'user_amFuZUBlbWFp',
        userEmail: 'jane@email.com',
        role: 'ADMIN',
        permissions: ['manage_wallets', 'manage_pools', 'view_reports'],
        invitedBy: 'john@company.com',
        joinedAt: '2024-01-16T14:30:00Z',
        lastAccessed: new Date().toISOString()
      }
    ],
    'test@example.com': [
      {
        id: 'member_3',
        workspaceId: 'ws_personal_test',
        userId: 'user_dGVzdEBleGFt',
        userEmail: 'test@example.com',
        role: 'OWNER',
        permissions: ['manage_workspace', 'invite_members', 'manage_wallets', 'manage_pools', 'view_reports'],
        invitedBy: 'self',
        joinedAt: '2024-01-10T09:00:00Z',
        lastAccessed: new Date().toISOString()
      }
    ]
  };

  return userWorkspaces[userEmail] || [];
}

export function getWorkspaceDetails(workspaceId: string): Workspace | null {
  // In production: SELECT * FROM workspaces WHERE id = ?
  const workspaces: { [key: string]: Workspace } = {
    'ws_xtc_company': {
      id: 'ws_xtc_company',
      name: 'XTC Company',
      slug: 'xtc-company',
      ownerId: 'user_amRvbkBjb21w',
      ownerEmail: 'john@company.com',
      plan: 'PRO',
      maxWallets: 25,
      maxPools: 50,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      lastAccessed: new Date().toISOString()
    },
    'ws_personal_test': {
      id: 'ws_personal_test',
      name: 'Test Personal Workspace',
      slug: 'test-personal',
      ownerId: 'user_dGVzdEBleGFt',
      ownerEmail: 'test@example.com',
      plan: 'BASIC',
      maxWallets: 10,
      maxPools: 20,
      isActive: true,
      createdAt: '2024-01-10T09:00:00Z',
      lastAccessed: new Date().toISOString()
    }
  };

  return workspaces[workspaceId] || null;
}

export function getWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
  // In production: SELECT * FROM workspace_members WHERE workspace_id = ?
  const workspaceMembers: { [key: string]: WorkspaceMember[] } = {
    'ws_xtc_company': [
      {
        id: 'member_1',
        workspaceId: 'ws_xtc_company',
        userId: 'user_amRvbkBjb21w',
        userEmail: 'john@company.com',
        role: 'OWNER',
        permissions: ['manage_workspace', 'invite_members', 'manage_wallets', 'manage_pools', 'view_reports'],
        invitedBy: 'self',
        joinedAt: '2024-01-15T10:00:00Z',
        lastAccessed: new Date().toISOString()
      },
      {
        id: 'member_2',
        workspaceId: 'ws_xtc_company',
        userId: 'user_amFuZUBlbWFp',
        userEmail: 'jane@email.com',
        role: 'ADMIN',
        permissions: ['manage_wallets', 'manage_pools', 'view_reports'],
        invitedBy: 'john@company.com',
        joinedAt: '2024-01-16T14:30:00Z',
        lastAccessed: new Date().toISOString()
      }
    ],
    'ws_personal_test': [
      {
        id: 'member_3',
        workspaceId: 'ws_personal_test',
        userId: 'user_dGVzdEBleGFt',
        userEmail: 'test@example.com',
        role: 'OWNER',
        permissions: ['manage_workspace', 'invite_members', 'manage_wallets', 'manage_pools', 'view_reports'],
        invitedBy: 'self',
        joinedAt: '2024-01-10T09:00:00Z',
        lastAccessed: new Date().toISOString()
      }
    ]
  };

  return workspaceMembers[workspaceId] || [];
}

// 🔐 WORKSPACE ACCESS CONTROL
export function canAccessWorkspace(userEmail: string, workspaceId: string): boolean {
  const userWorkspaces = getUserWorkspaces(userEmail);
  return userWorkspaces.some(membership => membership.workspaceId === workspaceId);
}

export function getUserRoleInWorkspace(userEmail: string, workspaceId: string): WorkspaceMember | null {
  const userWorkspaces = getUserWorkspaces(userEmail);
  return userWorkspaces.find(membership => membership.workspaceId === workspaceId) || null;
}

export function hasWorkspacePermission(userEmail: string, workspaceId: string, permission: string): boolean {
  const membership = getUserRoleInWorkspace(userEmail, workspaceId);
  return membership ? membership.permissions.includes(permission) : false;
}

// 📊 WORKSPACE DATA ACCESS
export function getWorkspaceWallets(workspaceId: string): any[] {
  // In production: SELECT * FROM wallets WHERE workspace_id = ?
  const workspaceWalletData: { [key: string]: any[] } = {
    'ws_xtc_company': [
      {
        id: '1',
        address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
        clientName: 'XTC Client - Alice Johnson',
        totalValue: 245823.12,
        status: 'active',
        addedBy: 'john@company.com',
        createdAt: '2024-01-15T11:00:00Z'
      },
      {
        id: '2',
        address: '0x456789abcdef0123456789abcdef0123456789ab',
        clientName: 'XTC Client - Bob Smith (added by Jane)',
        totalValue: 156789.45,
        status: 'active',
        addedBy: 'jane@email.com',
        createdAt: '2024-01-16T15:00:00Z'
      }
    ],
    'ws_personal_test': [
      {
        id: '3',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        clientName: 'Personal Client - Charlie Brown',
        totalValue: 89123.45,
        status: 'active',
        addedBy: 'test@example.com',
        createdAt: '2024-01-10T10:00:00Z'
      }
    ]
  };

  return workspaceWalletData[workspaceId] || [];
}

export function getWorkspacePools(workspaceId: string): any[] {
  // In production: SELECT * FROM pools WHERE workspace_id = ?
  const workspacePoolData: { [key: string]: any[] } = {
    'ws_xtc_company': [
      { id: 'pool_1', name: 'ETH/USDC', dex: 'Uniswap V3', addedBy: 'john@company.com' },
      { id: 'pool_2', name: 'BTC/ETH', dex: 'Sushiswap', addedBy: 'jane@email.com' }
    ],
    'ws_personal_test': [
      { id: 'pool_3', name: 'WETH/DAI', dex: 'Curve', addedBy: 'test@example.com' }
    ]
  };

  return workspacePoolData[workspaceId] || [];
}

// 🎯 INVITATION SYSTEM
export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviterEmail: string;
  inviterName: string;
  inviteeEmail: string;
  role: 'ADMIN' | 'GUEST';
  permissions: string[];
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  invitedAt: string;
  expiresAt: string;
}

export function createWorkspaceInvitation(
  workspaceId: string, 
  inviterEmail: string, 
  inviteeEmail: string, 
  role: 'ADMIN' | 'GUEST'
): WorkspaceInvitation {
  const workspace = getWorkspaceDetails(workspaceId);
  const inviter = getUserFromEmail(inviterEmail);
  
  const permissions = role === 'ADMIN' 
    ? ['manage_wallets', 'manage_pools', 'view_reports']
    : ['view_wallets', 'view_pools', 'view_reports'];

  return {
    id: `inv_${Date.now()}`,
    workspaceId,
    workspaceName: workspace?.name || 'Unknown Workspace',
    inviterEmail,
    inviterName: inviter?.name || 'Unknown User',
    inviteeEmail,
    role,
    permissions,
    status: 'PENDING',
    invitedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  };
}

function extractNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  return localPart
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

// 🔍 SESSION MANAGEMENT
export function createUserSession(user: User, workspaceId?: string): string {
  return btoa(JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    currentWorkspaceId: workspaceId,
    permissions: user.permissions,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }));
}

export function validateUserSession(sessionToken: string): { user: User; workspaceId?: string } | null {
  try {
    const session = JSON.parse(atob(sessionToken));
    
    if (session.expiresAt < Date.now()) {
      return null; // Session expired
    }
    
    return {
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        permissions: session.permissions
      },
      workspaceId: session.currentWorkspaceId
    };
  } catch {
    return null; // Invalid session
  }
} 