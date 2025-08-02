import { NextApiRequest, NextApiResponse } from 'next';
import { getUserWithCompany, getAccessibleWallets } from '../../../lib/auth-roles';

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
  companyId: string;
  companyName: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session/wallet address
    const walletAddress = req.headers['x-wallet-address'] as string || req.query.wallet as string;
    
    if (!walletAddress) {
      return res.status(401).json({ error: 'Wallet address required for authentication' });
    }

    const user = getUserWithCompany(walletAddress);
    if (!user) {
      return res.status(403).json({ error: 'Unauthorized - No admin access' });
    }

    // Get company-specific wallets
    const accessibleWallets = getAccessibleWallets(user);
    
    let companyWallets: ClientWallet[] = [];

    if (user.role === 'SUPER_ADMIN') {
      // Super admins see all wallets across all companies
      companyWallets = getAllCompanyWallets();
    } else if (user.companyId) {
      // Company admins see only their company's wallets
      companyWallets = getWalletsForCompany(user.companyId, user.companyName || 'Unknown Company');
    }

    console.log(`👥 User ${user.name} (${user.role}) accessing ${companyWallets.length} wallets`);

    return res.status(200).json({ 
      wallets: companyWallets,
      company: user.companyName,
      totalWallets: companyWallets.length,
      userRole: user.role
    });

  } catch (error) {
    console.error('Error in all-wallets API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// 🏢 COMPANY-SPECIFIC WALLET DATA
function getWalletsForCompany(companyId: string, companyName: string): ClientWallet[] {
  const companyWalletData: { [key: string]: ClientWallet[] } = {
    'comp_abc123': [
      {
        id: '1',
        address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
        clientName: 'ABC Client - Alice Johnson',
        totalValue: 245823.12,
        lastUpdated: '2 mins ago',
        status: 'active',
        positions: 8,
        protocols: ['Uniswap V3', 'Aave V3'],
        alerts: 0,
        performance24h: 2.45,
        companyId: 'comp_abc123',
        companyName: 'ABC Company'
      },
      {
        id: '2',
        address: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
        clientName: 'ABC Client - Bob Chen',
        totalValue: 123456.78,
        lastUpdated: '5 mins ago',
        status: 'warning',
        positions: 12,
        protocols: ['Compound', 'Curve', 'Balancer'],
        alerts: 2,
        performance24h: -1.23,
        companyId: 'comp_abc123',
        companyName: 'ABC Company'
      },
      {
        id: '3',
        address: '0x9f8e7d6c5b4a3928374656789abcdef0123456789',
        clientName: 'ABC Client - Carol Smith',
        totalValue: 87234.56,
        lastUpdated: '1 hour ago',
        status: 'critical',
        positions: 5,
        protocols: ['Aave V3'],
        alerts: 4,
        performance24h: -5.67,
        companyId: 'comp_abc123',
        companyName: 'ABC Company'
      }
    ],
    'comp_xyz456': [
      {
        id: '4',
        address: '0x456789abcdef0123456789abcdef0123456789ab',
        clientName: 'XYZ Client - David Brown',
        totalValue: 456789.23,
        lastUpdated: '10 mins ago',
        status: 'active',
        positions: 15,
        protocols: ['Uniswap V3', 'Compound', 'Yearn'],
        alerts: 1,
        performance24h: 3.21,
        companyId: 'comp_xyz456',
        companyName: 'XYZ Corporation'
      },
      {
        id: '5',
        address: '0xabcdef0123456789abcdef0123456789abcdef01',
        clientName: 'XYZ Client - Emma Wilson',
        totalValue: 198765.43,
        lastUpdated: '3 mins ago',
        status: 'active',
        positions: 9,
        protocols: ['Curve', 'Balancer'],
        alerts: 0,
        performance24h: 1.89,
        companyId: 'comp_xyz456',
        companyName: 'XYZ Corporation'
      }
    ],
    'comp_demo789': [
      {
        id: '6',
        address: '0xdemo123456789abcdef0123456789abcdef012345',
        clientName: 'Demo Client - Frank Miller',
        totalValue: 54321.09,
        lastUpdated: '15 mins ago',
        status: 'active',
        positions: 3,
        protocols: ['Uniswap V2'],
        alerts: 0,
        performance24h: 0.85,
        companyId: 'comp_demo789',
        companyName: 'Demo LLC'
      }
    ]
  };

  return companyWalletData[companyId] || [];
}

// 🌐 ALL COMPANIES WALLET DATA (for super admins)
function getAllCompanyWallets(): ClientWallet[] {
  const allWallets: ClientWallet[] = [];
  
  // Combine wallets from all companies
  allWallets.push(...getWalletsForCompany('comp_abc123', 'ABC Company'));
  allWallets.push(...getWalletsForCompany('comp_xyz456', 'XYZ Corporation'));
  allWallets.push(...getWalletsForCompany('comp_demo789', 'Demo LLC'));
  
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