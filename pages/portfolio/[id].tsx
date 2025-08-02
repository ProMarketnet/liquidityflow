import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { usePrivy } from '@privy-io/react-auth';

interface PortfolioPosition {
  protocol: string;
  type: string;
  tokens: string;
  value: number;
  apr: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

interface PortfolioAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
}

interface PortfolioData {
  id: string;
  clientName: string;
  address: string;
  totalValue: number;
  activePositions: number;
  activeAlerts: number;
  performance24h: number;
  positions: PortfolioPosition[];
  alerts: PortfolioAlert[];
}

export default function PortfolioDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPortfolioData();
    }
  }, [id]);

  const loadPortfolioData = async () => {
    setIsLoading(true);
    
    // Mock data based on the portfolio ID
    const mockPortfolios: { [key: string]: PortfolioData } = {
      '1': {
        id: '1',
        clientName: 'Alice Johnson',
        address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
        totalValue: 245823,
        activePositions: 3,
        activeAlerts: 2,
        performance24h: 2.45,
        positions: [
          {
            protocol: 'Uniswap V3',
            type: 'Liquidity Pool',
            tokens: 'ETH/USDC',
            value: 125000,
            apr: 15.6,
            status: 'HEALTHY'
          },
          {
            protocol: 'Aave V3',
            type: 'Lending',
            tokens: 'USDC Supply',
            value: 85000,
            apr: 4.2,
            status: 'HEALTHY'
          },
          {
            protocol: 'Aave V3',
            type: 'Borrowing',
            tokens: 'ETH Borrow',
            value: -35000,
            apr: 3.8,
            status: 'HEALTHY'
          }
        ],
        alerts: [
          {
            id: '1',
            type: 'warning',
            title: 'High Gas Fees',
            description: 'Current gas fees are above average. Consider waiting for lower fees.',
            time: '5 mins ago'
          },
          {
            id: '2',
            type: 'info',
            title: 'LP Rewards Available',
            description: 'You have unclaimed LP rewards worth $234.56',
            time: '1 hour ago'
          }
        ]
      },
      '2': {
        id: '2',
        clientName: 'Bob Chen',
        address: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
        totalValue: 123457,
        activePositions: 5,
        activeAlerts: 3,
        performance24h: -1.23,
        positions: [
          {
            protocol: 'Curve',
            type: 'Liquidity Pool',
            tokens: 'USDC/USDT',
            value: 80000,
            apr: 8.4,
            status: 'HEALTHY'
          },
          {
            protocol: 'Convex',
            type: 'Staking',
            tokens: 'CVX',
            value: 43457,
            apr: 12.1,
            status: 'WARNING'
          }
        ],
        alerts: [
          {
            id: '3',
            type: 'critical',
            title: 'Position Health Warning',
            description: 'Your leveraged position health factor is below 1.5',
            time: '10 mins ago'
          }
        ]
      }
    };

    const portfolioData = mockPortfolios[id as string];
    setPortfolio(portfolioData || null);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '1.2rem'
      }}>
        Loading portfolio...
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <h1>Portfolio Not Found</h1>
        <a href="/admin/portfolios" style={{ color: '#3b82f6', textDecoration: 'none' }}>← Back to Portfolios</a>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{portfolio.clientName} Portfolio - LiquidFlow</title>
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '2rem 1rem'
      }}>
        {/* Sticky Navigation */}
        <nav style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#ffffff',
          borderBottom: '2px solid #e5e7eb',
          padding: '1rem 0',
          marginBottom: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
              🏢 LiquidFlow Admin
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <a href="/admin/portfolios" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>🏠 Home</a>
              <a href="/admin/wallets" style={{ color: '#6b7280', fontWeight: '600', textDecoration: 'none' }}>💳 Manage Wallets</a>
              <a href="/admin/reports" style={{ color: '#6b7280', fontWeight: '600', textDecoration: 'none' }}>📊 Trading Reports</a>
              <a href="/admin/analytics" style={{ color: '#6b7280', fontWeight: '600', textDecoration: 'none' }}>📈 Analytics</a>
              <a href="/dashboard" style={{ color: '#6b7280', fontWeight: '600', textDecoration: 'none' }}>🖥️ Dashboard</a>
              <a href="/dashboard/pools" style={{ color: '#6b7280', fontWeight: '600', textDecoration: 'none' }}>🔍 Pool Lookup</a>
              
              {ready && authenticated && user && (
                <>
                  <span style={{ color: '#059669', fontWeight: '600', fontSize: '0.9rem' }}>
                    ✅ {user.email?.address || user.wallet?.address?.slice(0, 6) + '...' + user.wallet?.address?.slice(-4)}
                  </span>
                  <button 
                    onClick={logout}
                    style={{
                      background: '#dc2626',
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    🚪 Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Portfolio Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#1f2937',
                margin: 0
              }}>
                📊 {portfolio.clientName} Portfolio
              </h1>
              <a 
                href="/admin/portfolios" 
                style={{ 
                  color: '#6b7280', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                ← Back to Portfolios
              </a>
            </div>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.9rem',
              margin: 0
            }}>
              Address: {portfolio.address}
            </p>
          </div>

          {/* Portfolio Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                ${portfolio.totalValue.toLocaleString()}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Value</div>
            </div>

            <div style={{ 
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                {portfolio.activePositions}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Active Positions</div>
            </div>

            <div style={{ 
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                {portfolio.activeAlerts}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Active Alerts</div>
            </div>
          </div>

          {/* Active Positions */}
          <div style={{ 
            background: '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            marginBottom: '2rem'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🏛️ Active Positions
              </h2>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Protocol</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Type</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Tokens</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Value</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>APR</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.positions.map((position, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{position.protocol}</td>
                    <td style={{ padding: '1rem' }}>{position.type}</td>
                    <td style={{ padding: '1rem' }}>{position.tokens}</td>
                    <td style={{ 
                      padding: '1rem', 
                      textAlign: 'right', 
                      fontWeight: '600',
                      color: position.value >= 0 ? '#059669' : '#dc2626'
                    }}>
                      {position.value >= 0 ? '' : '-'}${Math.abs(position.value).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#059669' }}>
                      {position.apr}%
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: position.status === 'HEALTHY' ? '#dcfce7' : position.status === 'WARNING' ? '#fef3c7' : '#fee2e2',
                        color: position.status === 'HEALTHY' ? '#166534' : position.status === 'WARNING' ? '#92400e' : '#dc2626'
                      }}>
                        {position.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Alerts */}
          <div style={{ 
            background: '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🚨 Recent Alerts
              </h2>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              {portfolio.alerts.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', margin: 0 }}>No recent alerts</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {portfolio.alerts.map((alert) => (
                    <div key={alert.id} style={{
                      padding: '1rem',
                      border: `2px solid ${alert.type === 'critical' ? '#fecaca' : alert.type === 'warning' ? '#fed7aa' : '#bfdbfe'}`,
                      borderRadius: '0.5rem',
                      background: alert.type === 'critical' ? '#fef2f2' : alert.type === 'warning' ? '#fff7ed' : '#eff6ff'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: '1rem', 
                          fontWeight: '600',
                          color: alert.type === 'critical' ? '#dc2626' : alert.type === 'warning' ? '#d97706' : '#2563eb'
                        }}>
                          {alert.title}
                        </h3>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{alert.time}</span>
                      </div>
                      <p style={{ margin: 0, color: '#374151' }}>{alert.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 