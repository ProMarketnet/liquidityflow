import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromEmail, getUserWorkspaces, getWorkspaceWallets } from '../../../lib/auth-roles';

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
  addedBy: string;
  workspaceId: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user email and workspace from headers/query
    const userEmail = req.headers['x-user-email'] as string || req.query.email as string;
    const workspaceId = req.headers['x-workspace-id'] as string || req.query.workspace as string;
    
    if (!userEmail) {
      return res.status(401).json({ error: 'User email required for authentication' });
    }

    const user = getUserFromEmail(userEmail);
    if (!user) {
      return res.status(403).json({ error: 'Unauthorized - Invalid user email' });
    }

    // Get user's workspaces
    const userWorkspaces = getUserWorkspaces(userEmail);
    
    if (userWorkspaces.length === 0) {
      return res.status(200).json({ 
        wallets: [],
        userEmail: user.email,
        workspaces: [],
        totalWallets: 0,
        userRole: user.role,
        message: 'No workspaces found. Create your first workspace to get started.'
      });
    }

    let workspaceWallets: ClientWallet[] = [];
    let selectedWorkspace = null;

    if (workspaceId) {
      // Get wallets for specific workspace
      const hasAccess = userWorkspaces.some(ws => ws.workspaceId === workspaceId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this workspace' });
      }
      
      selectedWorkspace = userWorkspaces.find(ws => ws.workspaceId === workspaceId);
      workspaceWallets = getWorkspaceMockWallets(workspaceId);
    } else {
      // Default to first workspace
      selectedWorkspace = userWorkspaces[0];
      workspaceWallets = getWorkspaceMockWallets(selectedWorkspace.workspaceId);
    }

    console.log(`👤 User ${user.email} accessing ${workspaceWallets.length} wallets in workspace ${selectedWorkspace?.workspaceId}`);

    return res.status(200).json({ 
      wallets: workspaceWallets,
      userEmail: user.email,
      currentWorkspace: selectedWorkspace,
      workspaces: userWorkspaces,
      totalWallets: workspaceWallets.length,
      userRole: user.role
    });

  } catch (error) {
    console.error('Error in all-wallets API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// 🏢 WORKSPACE-SPECIFIC WALLET DATA
function getWorkspaceMockWallets(workspaceId: string): ClientWallet[] {
  const workspaceWalletData: { [key: string]: ClientWallet[] } = {
    'ws_xtc_company': [
      {
        id: '1',
        address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
        clientName: 'XTC Client - Alice Johnson',
        totalValue: 245823.12,
        lastUpdated: '2 mins ago',
        status: 'active',
        positions: 8,
        protocols: ['Uniswap V3', 'Aave V3'],
        alerts: 0,
        performance24h: 2.45,
        addedBy: 'john@company.com',
        workspaceId: 'ws_xtc_company'
      },
      {
        id: '2',
        address: '0x456789abcdef0123456789abcdef0123456789ab',
        clientName: 'XTC Client - Bob Smith (added by Jane)',
        totalValue: 156789.45,
        lastUpdated: '5 mins ago',
        status: 'active',
        positions: 12,
        protocols: ['Compound', 'Yearn'],
        alerts: 1,
        performance24h: 1.89,
        addedBy: 'jane@email.com',
        workspaceId: 'ws_xtc_company'
      }
    ],
    'ws_personal_test': [
      {
        id: '3',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        clientName: 'Personal Client - Charlie Brown',
        totalValue: 89123.45,
        lastUpdated: '10 mins ago',
        status: 'active',
        positions: 5,
        protocols: ['Uniswap V2'],
        alerts: 0,
        performance24h: 0.85,
        addedBy: 'test@example.com',
        workspaceId: 'ws_personal_test'
      }
    ]
  };

  return workspaceWalletData[workspaceId] || [];
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