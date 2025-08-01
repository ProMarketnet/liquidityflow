import { NextApiRequest, NextApiResponse } from 'next';

interface UserWallet {
  address: string;
  connectedAt: string;
  lastSeen: string;
  totalValue: number;
  positionCount: number;
  protocols: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeRange = '7d' } = req.query;
    
    // 🔒 In production, add admin authentication here
    // const user = await verifyAdminToken(req);
    // if (!user?.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    // 📊 Get all connected wallets from localStorage tracking
    // In production, this would query your database of connected users
    const connectedWallets = await getAllConnectedWallets();
    
    // 🏦 Aggregate platform-wide data using Moralis API
    const platformAnalytics = await aggregatePlatformData(connectedWallets, timeRange as string);
    
    res.status(200).json(platformAnalytics);

  } catch (error) {
    console.error('Platform analytics API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllConnectedWallets(): Promise<UserWallet[]> {
  // 📝 Mock data - In production, query your user database
  // This would be: SELECT wallet_address, connected_at, last_seen FROM users
  
  return [
    {
      address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
      connectedAt: '2024-01-20T10:30:00Z',
      lastSeen: '2024-01-20T16:45:00Z',
      totalValue: 45823.12,
      positionCount: 7,
      protocols: ['Uniswap V3', 'Aave V3']
    },
    {
      address: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
      connectedAt: '2024-01-19T14:22:00Z',
      lastSeen: '2024-01-20T15:30:00Z',
      totalValue: 123456.78,
      positionCount: 12,
      protocols: ['Uniswap V3', 'Compound', 'Curve']
    },
    {
      address: '0x9f8e7d6c5b4a3928374656789abcdef0123456789',
      connectedAt: '2024-01-18T09:15:00Z',
      lastSeen: '2024-01-20T14:20:00Z',
      totalValue: 87234.56,
      positionCount: 5,
      protocols: ['Aave V3', 'Balancer']
    }
    // ... would continue with all 47+ users
  ];
}

async function aggregatePlatformData(wallets: UserWallet[], timeRange: string) {
  // 🔥 In production, you'd make batch Moralis API calls here:
  // 1. Get positions for all wallet addresses
  // 2. Aggregate by protocol
  // 3. Calculate platform-wide metrics
  
  // Example pseudo-code for production:
  /*
  const allPositions = await Promise.all(
    wallets.map(wallet => 
      fetch(`/api/defi/advanced-positions?address=${wallet.address}`)
    )
  );
  
  const aggregatedData = allPositions.reduce((acc, positions) => {
    // Aggregate TVL by protocol
    // Count users per protocol  
    // Sum total platform TVL
    return acc;
  }, {});
  */

  // 🎯 Mock aggregated data for demonstration
  const totalUsers = wallets.length;
  const totalValueLocked = wallets.reduce((sum, wallet) => sum + wallet.totalValue, 0);
  const totalPositions = wallets.reduce((sum, wallet) => sum + wallet.positionCount, 0);

  // Group protocols by usage
  const protocolUsage = wallets.reduce((acc: any, wallet) => {
    wallet.protocols.forEach(protocol => {
      if (!acc[protocol]) {
        acc[protocol] = { users: 0, tvl: 0 };
      }
      acc[protocol].users += 1;
      acc[protocol].tvl += wallet.totalValue / wallet.protocols.length; // Estimate
    });
    return acc;
  }, {});

  const topProtocols = Object.entries(protocolUsage)
    .map(([name, data]: [string, any]) => ({
      name,
      users: data.users,
      tvl: data.tvl
    }))
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 5);

  // Recent connections (last 5)
  const recentConnections = wallets
    .sort((a, b) => new Date(b.connectedAt).getTime() - new Date(a.connectedAt).getTime())
    .slice(0, 5)
    .map(wallet => ({
      address: `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
      timestamp: getTimeAgo(wallet.connectedAt),
      tvl: wallet.totalValue
    }));

  // Mock alerts summary
  const alertsSummary = {
    critical: Math.floor(totalUsers * 0.06), // ~6% critical alerts
    warning: Math.floor(totalUsers * 0.25),  // ~25% warning alerts  
    info: Math.floor(totalUsers * 0.6)       // ~60% info alerts
  };

  // Daily activity (mock data based on time range)
  const dailyActivity = generateDailyActivity(timeRange, totalValueLocked);

  return {
    totalUsers,
    totalValueLocked,
    totalPositions,
    topProtocols,
    recentConnections,
    alertsSummary,
    dailyActivity
  };
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

function generateDailyActivity(timeRange: string, currentTvl: number) {
  const days = timeRange === '24h' ? 1 : 
               timeRange === '7d' ? 7 : 
               timeRange === '30d' ? 30 : 90;
  
  const activity = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Mock growth pattern
    const growthFactor = 1 - (i * 0.05); // Simulate decline going back in time
    const dayTvl = currentTvl * growthFactor;
    const newUsers = Math.floor(Math.random() * 12) + 1; // 1-12 new users per day
    
    activity.push({
      date: date.toISOString().split('T')[0],
      newUsers,
      totalTvl: dayTvl
    });
  }
  
  return activity;
}

// 🚀 Production Implementation Notes:
//
// 1. USER TRACKING DATABASE:
//    - Store wallet addresses when users connect
//    - Track connection timestamps, last activity
//    - Store user preferences and settings
//
// 2. BATCH MORALIS API CALLS:
//    - Aggregate positions for all users
//    - Cache results to avoid API rate limits
//    - Update platform analytics periodically
//
// 3. ADMIN AUTHENTICATION:
//    - Verify admin JWT tokens
//    - Role-based access control
//    - Audit log for admin actions
//
// 4. REAL-TIME UPDATES:
//    - WebSocket for live platform metrics
//    - Background jobs for data aggregation
//    - Caching layer for performance 