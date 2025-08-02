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
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadAnalytics = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Loading admin analytics for timeRange:', timeRange);
        
        // Always use fallback data for demo to avoid API issues
        const demoData = {
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
            critical: 2,
            warning: 5,
            info: 8
          }
        };
        
        if (isMounted) {
          setAnalytics(demoData);
          console.log('✅ Analytics demo data loaded');
        }
        
      } catch (error) {
        console.error('Error in analytics:', error);
        if (isMounted) {
          setError('Failed to load analytics');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAnalytics();
    
    return () => {
      isMounted = false;
    };
  }, [timeRange]); // Only depend on timeRange

  const formatCurrency = (amount: number): string => {
    try {
      if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}K`;
      } else {
        return `$${amount.toFixed(2)}`;
      }
    } catch (error) {
      console.error('Format currency error:', error);
      return '$0';
    }
  };

  const formatAddress = (address: string): string => {
    try {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    } catch (error) {
      console.error('Format address error:', error);
      return 'Invalid';
    }
  };

  // Error boundary
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#fafbfc'
      }}>
        <div style={{ 
          background: '#ffffff',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #e1e5eb'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Analytics Error</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#fafbfc'
      }}>
        <div style={{ 
          background: '#ffffff',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #e1e5eb'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ color: '#666' }}>Loading Analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafbfc' }}>
      <Head>
        <title>Platform Analytics - LiquidFlow Admin</title>
        <meta name="description" content="Comprehensive analytics dashboard for LiquidFlow platform administrators" />
      </Head>

      {/* Simple Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '1rem 0',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e1e5eb'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: '#0d1421'
          }}>
            🏢 LiquidFlow Admin
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <a href="/" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>
              🏠 Home
            </a>
            <a href="/admin/wallets" style={{ color: '#4a5568', textDecoration: 'none' }}>
              💳 Manage Wallets
            </a>
            <a href="/admin/portfolios" style={{ color: '#4a5568', textDecoration: 'none' }}>
              🏢 Portfolios
            </a>
            <a href="/admin/reports" style={{ color: '#4a5568', textDecoration: 'none' }}>
              📊 Reports
            </a>
            <span style={{ color: '#2563eb', fontWeight: '600' }}>📈 Analytics</span>
            <a href="/dashboard" style={{ color: '#4a5568', textDecoration: 'none' }}>
              ⬅️ Back to Dashboard
            </a>
            
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #e1e5eb',
                borderRadius: '8px',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            {/* Logout */}
            <button 
              onClick={() => {
                try {
                  localStorage.removeItem('adminSession');
                  window.location.href = '/';
                } catch (error) {
                  console.error('Logout error:', error);
                  window.location.href = '/';
                }
              }}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '2rem 1rem' 
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem', color: '#0d1421' }}>
            📊 Platform Analytics
          </h1>
          <p style={{ margin: 0, color: '#4a5568' }}>
            Comprehensive view of all connected wallets and platform activity
          </p>
        </div>

        {analytics && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Key Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Total Users */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e1e5eb',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.125rem',
                    color: '#ffffff'
                  }}>
                    👥
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#0d1421' }}>
                      Total Users
                    </h3>
                    <span style={{
                      background: '#cffafe',
                      color: '#0891b2',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}>Connected wallets</span>
                  </div>
                </div>
                <div style={{
                  fontSize: '1.875rem',
                  fontWeight: '800',
                  color: '#2563eb',
                  lineHeight: '1'
                }}>
                  {analytics.totalUsers.toLocaleString()}
                </div>
              </div>

              {/* Total Value Locked */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e1e5eb',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.125rem',
                    color: '#ffffff'
                  }}>
                    💰
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#0d1421' }}>
                      Total Value Locked
                    </h3>
                    <span style={{
                      background: '#d1fae5',
                      color: '#059669',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}>Across all positions</span>
                  </div>
                </div>
                <div style={{
                  fontSize: '1.875rem',
                  fontWeight: '800',
                  color: '#059669',
                  lineHeight: '1'
                }}>
                  {formatCurrency(analytics.totalValueLocked)}
                </div>
              </div>

              {/* Total Positions */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e1e5eb',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: '#0891b2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.125rem',
                    color: '#ffffff'
                  }}>
                    📊
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#0d1421' }}>
                      Total Positions
                    </h3>
                    <span style={{
                      background: '#cffafe',
                      color: '#0891b2',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}>DeFi positions monitored</span>
                  </div>
                </div>
                <div style={{
                  fontSize: '1.875rem',
                  fontWeight: '800',
                  color: '#0891b2',
                  lineHeight: '1'
                }}>
                  {analytics.totalPositions.toLocaleString()}
                </div>
              </div>

              {/* Active Alerts */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e1e5eb',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: analytics.alertsSummary.critical > 0 ? '#dc2626' : '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.125rem',
                    color: '#ffffff'
                  }}>
                    🚨
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#0d1421' }}>
                      Active Alerts
                    </h3>
                    <span style={{
                      background: analytics.alertsSummary.critical > 0 ? '#fee2e2' : '#d1fae5',
                      color: analytics.alertsSummary.critical > 0 ? '#dc2626' : '#059669',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}>
                      {analytics.alertsSummary.critical > 0 ? 'Action needed' : 'All clear'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      color: '#dc2626'
                    }}>
                      {analytics.alertsSummary.critical}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                      Critical
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      color: '#d97706'
                    }}>
                      {analytics.alertsSummary.warning}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                      Warning
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      color: '#0891b2'
                    }}>
                      {analytics.alertsSummary.info}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                      Info
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Protocols Table */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e1e5eb',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#0d1421' }}>
                🏆 Top Protocols by TVL
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e1e5eb' }}>
                      <th style={{ 
                        textAlign: 'left', 
                        padding: '0.75rem', 
                        fontWeight: '600',
                        color: '#4a5568'
                      }}>
                        Protocol
                      </th>
                      <th style={{ 
                        textAlign: 'right', 
                        padding: '0.75rem', 
                        fontWeight: '600',
                        color: '#4a5568'
                      }}>
                        Total Value Locked
                      </th>
                      <th style={{ 
                        textAlign: 'right', 
                        padding: '0.75rem', 
                        fontWeight: '600',
                        color: '#4a5568'
                      }}>
                        Users
                      </th>
                      <th style={{ 
                        textAlign: 'right', 
                        padding: '0.75rem', 
                        fontWeight: '600',
                        color: '#4a5568'
                      }}>
                        % of Platform
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topProtocols.map((protocol, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f2f5' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: '600', color: '#0d1421' }}>{protocol.name}</div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ fontWeight: '700', color: '#059669' }}>
                            {formatCurrency(protocol.tvl)}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#0d1421' }}>
                          {protocol.users}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#0d1421' }}>
                          {((protocol.tvl / analytics.totalValueLocked) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Wallet Connections */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e1e5eb',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#0d1421' }}>
                🔗 Recent Wallet Connections
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {analytics.recentConnections.map((connection, index) => (
                  <div key={index} style={{ 
                    padding: '1rem',
                    background: '#fafbfc',
                    border: '1px solid #e1e5eb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ 
                          fontFamily: 'monospace',
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                          color: '#0d1421'
                        }}>
                          {formatAddress(connection.address)}
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem',
                          color: '#718096'
                        }}>
                          Connected {connection.timestamp}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontWeight: '700',
                          color: '#059669',
                          fontSize: '1.125rem'
                        }}>
                          {formatCurrency(connection.tvl)}
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem',
                          color: '#718096'
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
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e1e5eb',
        padding: '2rem 0',
        marginTop: '4rem'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          textAlign: 'center' 
        }}>
          <p style={{ 
            fontSize: '0.875rem',
            color: '#718096',
            margin: 0
          }}>
            © 2025 LiquidFlow. Professional DeFi portfolio management platform.
          </p>
        </div>
      </footer>
    </div>
  );
} 