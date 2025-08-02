import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface PlatformAnalytics {
  totalUsers: number;
  totalValueLocked: number;
  totalPositions: number;
  topProtocols: Array<{ name: string; tvl: number; users: number }>;
  recentConnections: Array<{ address: string; timestamp: string; tvl: number }>;
  alertsSummary: {
    critical: number;
    warning: number;
    info: number;
  };
  dailyActivity: Array<{ date: string; newUsers: number; totalTvl: number }>;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/platform-analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Fallback to mock data for demo
        setAnalytics({
          totalUsers: 1247,
          totalValueLocked: 8925463.78,
          totalPositions: 3892,
          topProtocols: [
            { name: 'Uniswap V3', tvl: 3245000, users: 456 },
            { name: 'Aave V3', tvl: 2156000, users: 324 },
            { name: 'Raydium', tvl: 1890000, users: 289 },
            { name: 'Curve', tvl: 1634463.78, users: 178 }
          ],
          recentConnections: [
            { address: '0x742d35Cc66335C0532925a3b8C0d2c35ad81C35C2', timestamp: '2 mins ago', tvl: 125000 },
            { address: '0x8ba1f109551bD432803012645Hac085c32c4a9b8', timestamp: '5 mins ago', tvl: 87500 },
            { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', timestamp: '12 mins ago', tvl: 245000 }
          ],
          alertsSummary: {
            critical: 0,
            warning: 0,
            info: 0
          },
          dailyActivity: [
            { date: '2025-01-01', newUsers: 23, totalTvl: 8925463.78 },
            { date: '2024-12-31', newUsers: 45, totalTvl: 8756234.12 },
            { date: '2024-12-30', newUsers: 38, totalTvl: 8634567.89 }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toFixed(2)}`;
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Head>
        <title>Platform Analytics - LiquidFlow Admin</title>
        <meta name="description" content="Comprehensive analytics dashboard for LiquidFlow platform administrators" />
      </Head>

      {/* Premium Navigation */}
      <nav className="nav" style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: 'var(--space-4) 0'
      }}>
        <div className="container flex justify-between items-center">
          <div style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: '800',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.025em'
          }}>
            🏢 LiquidFlow Admin
          </div>
          
          <div className="flex gap-6 items-center">
            {/* Admin Navigation */}
            <a href="/" className="nav-link" style={{ color: 'var(--color-success)', fontWeight: '600' }}>
              🏠 Home
            </a>
            <a href="/admin/wallets" className="nav-link">
              💳 Manage Wallets
            </a>
            <a href="/admin/portfolios" className="nav-link">
              🏢 Portfolios
            </a>
            <a href="/dashboard" className="nav-link">
              ⬅️ Back to Dashboard
            </a>
            
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input"
              style={{ width: 'auto', padding: 'var(--space-2) var(--space-3)' }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            {/* Logout */}
            <button 
              onClick={() => {
                localStorage.removeItem('adminSession');
                window.location.href = '/';
              }}
              className="btn btn-sm"
              style={{
                background: 'var(--color-error)',
                color: '#ffffff',
                borderColor: 'var(--color-error)'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        {/* Header Section */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>
            📊 Platform Analytics
          </h1>
          <p style={{ margin: 0 }}>
            Comprehensive view of all connected wallets and platform activity
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4" style={{ gap: 'var(--space-6)' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card" style={{ 
                padding: 'var(--space-6)',
                height: '150px'
              }}>
                <div className="animate-pulse">
                  <div style={{
                    height: '24px',
                    background: 'var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-4)'
                  }}></div>
                  <div style={{
                    height: '48px',
                    background: 'var(--color-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : analytics ? (
          <div className="grid" style={{ gap: 'var(--space-8)' }}>
            {/* Key Metrics */}
            <div className="grid grid-cols-4" style={{ gap: 'var(--space-6)' }}>
              {/* Total Users */}
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-lg)',
                    color: '#ffffff'
                  }}>
                    👥
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>
                      Total Users
                    </h3>
                    <span className="badge badge-info">Connected wallets</span>
                  </div>
                </div>
                <div style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: '800',
                  color: 'var(--color-primary)',
                  lineHeight: '1'
                }}>
                  {analytics.totalUsers.toLocaleString()}
                </div>
              </div>

              {/* Total Value Locked */}
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-lg)',
                    color: '#ffffff'
                  }}>
                    💰
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>
                      Total Value Locked
                    </h3>
                    <span className="badge badge-success">Across all positions</span>
                  </div>
                </div>
                <div style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: '800',
                  color: 'var(--color-success)',
                  lineHeight: '1'
                }}>
                  {formatCurrency(analytics.totalValueLocked)}
                </div>
              </div>

              {/* Total Positions */}
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-lg)',
                    color: '#ffffff'
                  }}>
                    📊
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>
                      Total Positions
                    </h3>
                    <span className="badge badge-info">DeFi positions monitored</span>
                  </div>
                </div>
                <div style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: '800',
                  color: 'var(--color-info)',
                  lineHeight: '1'
                }}>
                  {analytics.totalPositions.toLocaleString()}
                </div>
              </div>

              {/* Active Alerts */}
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    background: analytics.alertsSummary.critical > 0 ? 'var(--color-error)' : 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-lg)',
                    color: '#ffffff'
                  }}>
                    🚨
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>
                      Active Alerts
                    </h3>
                    <span className={`badge ${analytics.alertsSummary.critical > 0 ? 'badge-error' : 'badge-success'}`}>
                      {analytics.alertsSummary.critical > 0 ? 'Action needed' : 'All clear'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: '800',
                      color: 'var(--color-error)'
                    }}>
                      {analytics.alertsSummary.critical}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                      Critical
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: '800',
                      color: 'var(--color-warning)'
                    }}>
                      {analytics.alertsSummary.warning}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                      Warning
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: '800',
                      color: 'var(--color-info)'
                    }}>
                      {analytics.alertsSummary.info}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                      Info
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Protocols Table */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ marginBottom: 'var(--space-6)' }}>
                🏆 Top Protocols by TVL
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ 
                        textAlign: 'left', 
                        padding: 'var(--space-3)', 
                        fontWeight: '600',
                        color: 'var(--color-text-secondary)'
                      }}>
                        Protocol
                      </th>
                      <th style={{ 
                        textAlign: 'right', 
                        padding: 'var(--space-3)', 
                        fontWeight: '600',
                        color: 'var(--color-text-secondary)'
                      }}>
                        Total Value Locked
                      </th>
                      <th style={{ 
                        textAlign: 'right', 
                        padding: 'var(--space-3)', 
                        fontWeight: '600',
                        color: 'var(--color-text-secondary)'
                      }}>
                        Users
                      </th>
                      <th style={{ 
                        textAlign: 'right', 
                        padding: 'var(--space-3)', 
                        fontWeight: '600',
                        color: 'var(--color-text-secondary)'
                      }}>
                        % of Platform
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topProtocols.map((protocol, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: 'var(--space-3)' }}>
                          <div style={{ fontWeight: '600' }}>{protocol.name}</div>
                        </td>
                        <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                          <div style={{ fontWeight: '700', color: 'var(--color-success)' }}>
                            {formatCurrency(protocol.tvl)}
                          </div>
                        </td>
                        <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                          {protocol.users}
                        </td>
                        <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                          {((protocol.tvl / analytics.totalValueLocked) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Wallet Connections */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ marginBottom: 'var(--space-6)' }}>
                🔗 Recent Wallet Connections
              </h3>
              
              <div className="grid" style={{ gap: 'var(--space-4)' }}>
                {analytics.recentConnections.map((connection, index) => (
                  <div key={index} className="card" style={{ 
                    padding: 'var(--space-4)',
                    background: 'var(--color-background)'
                  }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div style={{ 
                          fontFamily: 'monospace',
                          fontWeight: '600',
                          marginBottom: 'var(--space-1)'
                        }}>
                          {formatAddress(connection.address)}
                        </div>
                        <div style={{ 
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text-tertiary)'
                        }}>
                          Connected {connection.timestamp}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontWeight: '700',
                          color: 'var(--color-success)',
                          fontSize: 'var(--font-size-lg)'
                        }}>
                          {formatCurrency(connection.tvl)}
                        </div>
                        <div style={{ 
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text-tertiary)'
                        }}>
                          Portfolio Value
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-4)' }}>⚠️</div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>
              Unable to Load Analytics
            </h3>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              There was an error loading the platform analytics. Please try again later.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--space-8) 0',
        marginTop: 'var(--space-16)'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-tertiary)',
            margin: 0
          }}>
            © 2025 LiquidFlow. Professional DeFi portfolio management platform.
          </p>
        </div>
      </footer>
    </div>
  );
} 