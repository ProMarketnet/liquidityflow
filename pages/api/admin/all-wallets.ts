import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromEmail, getUserWallets } from '../../../lib/auth-roles';

interface ClientWallet {
  id: string;
  address: string;
  clientName: string;
  totalValue: number;
  lastUpdated: string;
  status: 'active' | 'warning' | 'critical';
  positions: number;
  protocols: string[];
  alerts: number;
  performance24h: number;
  userEmail: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user email from headers or query
    const userEmail = req.headers['x-user-email'] as string || req.query.email as string;
    
    if (!userEmail) {
      return res.status(401).json({ error: 'User email required for authentication' });
    }

    const user = getUserFromEmail(userEmail);
    if (!user) {
      return res.status(403).json({ error: 'Unauthorized - Invalid user email' });
    }

    // Get user-specific wallets
    let userWallets: ClientWallet[] = [];

    if (user.role === 'SUPER_ADMIN') {
      // Super admins see all wallets across all users
      userWallets = getAllUserWallets();
    } else {
      // Regular users see only their own wallets
      userWallets = getWalletsForUser(user.userWorkspaceId, user.email);
    }

    console.log(`👤 User ${user.email} (${user.role}) accessing ${userWallets.length} wallets`);

    return res.status(200).json({ 
      wallets: userWallets,
      userEmail: user.email,
      userWorkspace: user.userWorkspaceId,
      totalWallets: userWallets.length,
      userRole: user.role
    });

  } catch (error) {
    console.error('Error in all-wallets API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// 👤 USER-SPECIFIC WALLET DATA
function getWalletsForUser(userWorkspaceId: string, userEmail: string): ClientWallet[] {
  const userWalletData: { [key: string]: ClientWallet[] } = {
    'workspace_user_dGVzdEBleGFtcGxl': [ // test@example.com
      {
        id: '1',
        address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
        clientName: 'My Client - Alice Johnson',
        totalValue: 245823.12,
        lastUpdated: '2 mins ago',
        status: 'active',
        positions: 8,
        protocols: ['Uniswap V3', 'Aave V3'],
        alerts: 0,
        performance24h: 2.45,
        userEmail: 'test@example.com'
      }
    ],
    'workspace_user_amRvZUBjb21wYW55': [ // john@company.com  
      {
        id: '2',
        address: '0x456789abcdef0123456789abcdef0123456789ab',
        clientName: 'John Client - David Brown',
        totalValue: 156789.45,
        lastUpdated: '5 mins ago',
        status: 'active',
        positions: 12,
        protocols: ['Compound', 'Yearn'],
        alerts: 1,
        performance24h: 1.89,
        userEmail: 'john@company.com'
      }
    ]
  };

  return userWalletData[userWorkspaceId] || [];
}

// 🌐 ALL USERS WALLET DATA (for super admins)
function getAllUserWallets(): ClientWallet[] {
  const allWallets: ClientWallet[] = [];
  
  // Combine wallets from all users
  allWallets.push(...getWalletsForUser('workspace_user_dGVzdEBleGFtcGxl', 'test@example.com'));
  allWallets.push(...getWalletsForUser('workspace_user_amRvZUBjb21wYW55', 'john@company.com'));
  
  return allWallets;
}

// 🚀 Production Implementation Functions:

/*
async function getMoralisPortfolioData(address: string) {
  // Fetch complete portfolio using existing Moralis endpoints
  const [portfolio, defi, advanced] = await Promise.all([
    fetch(`/api/wallet/portfolio?address=${address}`),
    fetch(`/api/wallet/defi?address=${address}`),
    fetch(`/api/defi/advanced-positions?address=${address}`)
  ]);
  
  return {
    totalUsdValue: portfolio.totalUsd,
    positions: [...defi.protocols, ...advanced.activeProtocols],
    performance24h: calculatePerformance24h(portfolio)
  };
}

async function getActiveAlerts(address: string) {
  // Get active alerts for this wallet
  const alerts = await prisma.alert.findMany({
    where: {
      walletAddress: address,
      status: 'active'
    }
  });
  
  return alerts;
}

function calculateRiskStatus(portfolio: any, alerts: any[]): 'active' | 'warning' | 'critical' {
  const criticalAlerts = alerts.filter(a => a.type === 'critical').length;
  const warningAlerts = alerts.filter(a => a.type === 'warning').length;
  
  if (criticalAlerts > 0) return 'critical';
  if (warningAlerts > 2) return 'warning';
  return 'active';
}

function getUniqueProtocols(positions: any[]): string[] {
  return [...new Set(positions.map(p => p.protocol))];
}
*/

// 📊 Business Intelligence Notes:
//
// This endpoint powers the admin's ability to:
// 1. 👥 Monitor all 50+ client portfolios at once
// 2. 💰 Track total platform AUM (Assets Under Management)
// 3. 🚨 Identify clients needing immediate attention
// 4. 📈 Monitor platform-wide performance trends
// 5. 🏦 Manage risk across all client positions 