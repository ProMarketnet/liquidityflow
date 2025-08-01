import { NextApiRequest, NextApiResponse } from 'next';

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
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 🔒 In production, add admin authentication here
    // const user = await verifyAdminToken(req);
    // if (!user?.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    // 📊 Get all managed wallets
    const wallets = await getAllManagedWallets();
    
    res.status(200).json({ wallets });

  } catch (error) {
    console.error('All wallets API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllManagedWallets(): Promise<ClientWallet[]> {
  // 🏦 In production, this would:
  // 1. Query your client database
  // 2. Fetch live data from Moralis for each wallet
  // 3. Calculate real-time portfolio values and alerts
  
  // Example production implementation:
  /*
  const clients = await prisma.client.findMany({
    include: { wallet: true }
  });
  
  const walletsWithData = await Promise.all(
    clients.map(async (client) => {
      const portfolio = await getMoralisPortfolioData(client.wallet.address);
      const alerts = await getActiveAlerts(client.wallet.address);
      
      return {
        id: client.id,
        address: client.wallet.address,
        clientName: client.name,
        totalValue: portfolio.totalUsdValue,
        status: calculateRiskStatus(portfolio, alerts),
        positions: portfolio.positions.length,
        protocols: getUniqueProtocols(portfolio.positions),
        alerts: alerts.length,
        performance24h: portfolio.performance24h
      };
    })
  );
  */

  // 📝 Mock data representing 50+ managed client wallets
  return [
    {
      id: '1',
      address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
      clientName: 'Alice Johnson',
      totalValue: 245823.12,
      lastUpdated: '2 mins ago',
      status: 'active',
      positions: 8,
      protocols: ['Uniswap V3', 'Aave V3'],
      alerts: 0,
      performance24h: 2.45
    },
    {
      id: '2',
      address: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
      clientName: 'Bob Chen',
      totalValue: 123456.78,
      lastUpdated: '5 mins ago',
      status: 'warning',
      positions: 12,
      protocols: ['Compound', 'Curve', 'Balancer'],
      alerts: 2,
      performance24h: -1.23
    },
    {
      id: '3',
      address: '0x9f8e7d6c5b4a3928374656789abcdef0123456789',
      clientName: 'Carol Smith',
      totalValue: 87234.56,
      lastUpdated: '1 hour ago',
      status: 'critical',
      positions: 5,
      protocols: ['Aave V3'],
      alerts: 4,
      performance24h: -5.67
    },
    {
      id: '4',
      address: '0x456789abcdef0123456789abcdef0123456789ab',
      clientName: 'David Brown',
      totalValue: 456789.23,
      lastUpdated: '10 mins ago',
      status: 'active',
      positions: 15,
      protocols: ['Uniswap V3', 'Compound', 'Yearn'],
      alerts: 1,
      performance24h: 3.21
    },
    {
      id: '5',
      address: '0xabcdef0123456789abcdef0123456789abcdef01',
      clientName: 'Emma Wilson',
      totalValue: 198765.43,
      lastUpdated: '3 mins ago',
      status: 'active',
      positions: 9,
      protocols: ['Curve', 'Balancer'],
      alerts: 0,
      performance24h: 1.89
    },
    {
      id: '6',
      address: '0xfedcba9876543210fedcba9876543210fedcba98',
      clientName: 'Frank Miller',
      totalValue: 334567.89,
      lastUpdated: '15 mins ago',
      status: 'warning',
      positions: 11,
      protocols: ['Uniswap V3', 'Sushiswap', 'Aave V3'],
      alerts: 3,
      performance24h: -0.85
    },
    {
      id: '7',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      clientName: 'Grace Lee',
      totalValue: 567890.12,
      lastUpdated: '7 mins ago',
      status: 'active',
      positions: 18,
      protocols: ['Compound', 'Yearn', 'Convex'],
      alerts: 0,
      performance24h: 4.33
    },
    {
      id: '8',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      clientName: 'Henry Park',
      totalValue: 98765.43,
      lastUpdated: '25 mins ago',
      status: 'critical',
      positions: 6,
      protocols: ['Aave V3', 'Compound'],
      alerts: 5,
      performance24h: -8.12
    },
    {
      id: '9',
      address: '0x567890abcdef1234567890abcdef1234567890ab',
      clientName: 'Ivy Zhang',
      totalValue: 234567.89,
      lastUpdated: '4 mins ago',
      status: 'active',
      positions: 13,
      protocols: ['Uniswap V3', 'Curve', 'Balancer', 'Yearn'],
      alerts: 1,
      performance24h: 1.67
    },
    {
      id: '10',
      address: '0xcdef1234567890abcdef1234567890abcdef1234',
      clientName: 'Jack Thompson',
      totalValue: 445678.90,
      lastUpdated: '12 mins ago',
      status: 'active',
      positions: 16,
      protocols: ['Compound', 'Aave V3', 'Convex'],
      alerts: 0,
      performance24h: 2.89
    },
    // ... Continue with more clients to reach 50+
    {
      id: '11',
      address: '0x890abcdef1234567890abcdef1234567890abcde',
      clientName: 'Karen Davis',
      totalValue: 156789.23,
      lastUpdated: '8 mins ago',
      status: 'warning',
      positions: 7,
      protocols: ['Uniswap V3', 'Sushiswap'],
      alerts: 2,
      performance24h: -2.45
    },
    {
      id: '12',
      address: '0x34567890abcdef1234567890abcdef1234567890',
      clientName: 'Liam Rodriguez',
      totalValue: 678901.34,
      lastUpdated: '6 mins ago',
      status: 'active',
      positions: 20,
      protocols: ['Yearn', 'Convex', 'Curve', 'Balancer'],
      alerts: 1,
      performance24h: 3.78
    }
    // ... Would continue with all 50+ managed wallets
  ];
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