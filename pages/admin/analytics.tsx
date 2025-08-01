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

  // 🎨 INLINE STYLES FOR GUARANTEED VISIBILITY
  const styles = {
    page: {
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#000000',
      padding: '2rem 1rem'
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#666666',
      marginBottom: '2rem'
    },
    nav: {
      background: '#ffffff',
      borderBottom: '2px solid #000000',
      padding: '1rem 0',
      marginBottom: '2rem'
    },
    navContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    navLink: {
      color: '#000000',
      textDecoration: 'none',
      fontWeight: '500',
      marginRight: '2rem'
    },
    card: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '1rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    bigNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '0.5rem'
    },
    metric: {
      color: '#666',
      fontSize: '0.875rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '1rem'
    },
    th: {
      borderBottom: '2px solid #000000',
      padding: '0.75rem',
      textAlign: 'left' as const,
      fontWeight: 'bold',
      color: '#000000'
    },
    td: {
      borderBottom: '1px solid #ccc',
      padding: '0.75rem',
      color: '#000000'
    },
    select: {
      padding: '0.5rem',
      border: '2px solid #000000',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#000000',
      background: '#ffffff'
    },
    loadingCard: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '3rem',
      textAlign: 'center' as const
    }
  };

  useEffect(() => {
    loadPlatformAnalytics();
  }, [timeRange]);

  const loadPlatformAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/platform-analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Mock data for demonstration
        setAnalytics({
          totalUsers: 47,
          totalValueLocked: 2847392.45,
          totalPositions: 312,
          topProtocols: [
            { name: 'Uniswap V3', tvl: 1247832.12, users: 28 },
            { name: 'Aave V3', tvl: 892341.33, users: 19 },
            { name: 'Compound', tvl: 456234.89, users: 15 },
            { name: 'Curve', tvl: 234567.11, users: 12 },
            { name: 'Balancer', tvl: 16417.00, users: 8 }
          ],
          recentConnections: [
            { address: '0x742d...35C2', timestamp: '2 hours ago', tvl: 45823.12 },
            { address: '0x1a2b...7d8e', timestamp: '4 hours ago', tvl: 123456.78 },
            { address: '0x9f8e...2a1b', timestamp: '6 hours ago', tvl: 87234.56 },
            { address: '0x3c4d...9e0f', timestamp: '8 hours ago', tvl: 234567.89 },
            { address: '0x5e6f...1c2d', timestamp: '12 hours ago', tvl: 156789.23 }
          ],
          alertsSummary: {
            critical: 3,
            warning: 12,
            info: 28
          },
          dailyActivity: [
            { date: '2024-01-20', newUsers: 8, totalTvl: 2847392.45 },
            { date: '2024-01-19', newUsers: 5, totalTvl: 2543221.33 },
            { date: '2024-01-18', newUsers: 12, totalTvl: 2234567.89 },
            { date: '2024-01-17', newUsers: 3, totalTvl: 1987654.32 },
            { date: '2024-01-16', newUsers: 7, totalTvl: 1845623.11 },
            { date: '2024-01-15', newUsers: 9, totalTvl: 1687432.22 },
            { date: '2024-01-14', newUsers: 6, totalTvl: 1523456.78 }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading platform analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <>
      <Head>
        <title>Platform Analytics - LiquidFlow Admin</title>
        <meta name="description" content="Platform-wide analytics and user metrics" />
      </Head>
      
      <div style={styles.page}>
        <nav style={styles.nav}>
          <div style={styles.navContainer}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000' }}>
              🏢 LiquidFlow Admin
            </div>
            <div>
              <a href="/" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>🏠 Home</a>
              <a href="/dashboard" style={styles.navLink}>← Back to Dashboard</a>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                style={styles.select}
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        </nav>

        <div style={styles.container}>
          <h1 style={styles.title}>📊 Platform Analytics</h1>
          <p style={styles.subtitle}>
            Comprehensive view of all connected wallets and platform activity
          </p>

          {isLoading ? (
            <div style={styles.loadingCard}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <h3 style={{ color: '#000000' }}>Loading Platform Analytics...</h3>
              <p style={{ color: '#666' }}>Aggregating data from all connected wallets</p>
            </div>
          ) : analytics && (
            <>
              {/* Key Metrics */}
              <div style={styles.grid}>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>👥 Total Users</h3>
                  <div style={styles.bigNumber}>{formatNumber(analytics.totalUsers)}</div>
                  <div style={styles.metric}>Connected wallets</div>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>💰 Total Value Locked</h3>
                  <div style={styles.bigNumber}>{formatCurrency(analytics.totalValueLocked)}</div>
                  <div style={styles.metric}>Across all positions</div>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>📊 Total Positions</h3>
                  <div style={styles.bigNumber}>{formatNumber(analytics.totalPositions)}</div>
                  <div style={styles.metric}>DeFi positions monitored</div>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>🚨 Active Alerts</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                        {analytics.alertsSummary.critical}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>Critical</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                        {analytics.alertsSummary.warning}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>Warning</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                        {analytics.alertsSummary.info}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>Info</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Protocols */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>🏆 Top Protocols by TVL</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Protocol</th>
                      <th style={styles.th}>Total Value Locked</th>
                      <th style={styles.th}>Users</th>
                      <th style={styles.th}>% of Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topProtocols.map((protocol, index) => (
                      <tr key={protocol.name}>
                        <td style={styles.td}>
                          <strong>{index + 1}. {protocol.name}</strong>
                        </td>
                        <td style={styles.td}>{formatCurrency(protocol.tvl)}</td>
                        <td style={styles.td}>{protocol.users}</td>
                        <td style={styles.td}>
                          {((protocol.tvl / analytics.totalValueLocked) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Connections */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>🔗 Recent Wallet Connections</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Wallet Address</th>
                      <th style={styles.th}>Connected</th>
                      <th style={styles.th}>Portfolio Value</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentConnections.map((connection, index) => (
                      <tr key={connection.address}>
                        <td style={styles.td}>
                          <code style={{ background: '#f3f4f6', padding: '0.25rem', borderRadius: '0.25rem' }}>
                            {connection.address}
                          </code>
                        </td>
                        <td style={styles.td}>{connection.timestamp}</td>
                        <td style={styles.td}>{formatCurrency(connection.tvl)}</td>
                        <td style={styles.td}>
                          <span style={{ 
                            background: '#dcfce7', 
                            color: '#166534', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                          }}>
                            ✅ Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Daily Activity */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>📈 Daily Activity</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>New Users</th>
                      <th style={styles.th}>Total TVL</th>
                      <th style={styles.th}>Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.dailyActivity.map((day, index) => {
                      const prevDay = analytics.dailyActivity[index + 1];
                      const growth = prevDay ? 
                        ((day.totalTvl - prevDay.totalTvl) / prevDay.totalTvl * 100) : 0;
                      
                      return (
                        <tr key={day.date}>
                          <td style={styles.td}>{day.date}</td>
                          <td style={styles.td}>+{day.newUsers}</td>
                          <td style={styles.td}>{formatCurrency(day.totalTvl)}</td>
                          <td style={styles.td}>
                            <span style={{ 
                              color: growth >= 0 ? '#16a34a' : '#dc2626',
                              fontWeight: 'bold'
                            }}>
                              {growth >= 0 ? '+' : ''}{growth.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
} 