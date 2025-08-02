import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import WalletBalance from '../../components/WalletBalance';

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

interface SelectedWalletDetails {
  address: string;
  clientName: string;
  totalValue: number;
  positions: Array<{
    protocol: string;
    type: string;
    tokens: string;
    value: number;
    apr: number;
    healthFactor?: number;
    status: 'healthy' | 'warning' | 'critical';
    entryPrice?: number;
    currentPrice?: number;
    quantity?: number;
    pnl?: number;
    pnlPercentage?: number;
    change24h?: number;
    entryDate?: string;
    lastUpdated?: string;
  }>;
  alerts: Array<{
    type: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>;
  totalPnL?: number;
  totalPnLPercentage?: number;
  performance24h?: number;
}

export default function AdminPortfoliosPage() {
  const [wallets, setWallets] = useState<ClientWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [walletDetails, setWalletDetails] = useState<SelectedWalletDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'warning' | 'critical'>('all');

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
      maxWidth: '1600px',
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
      maxWidth: '1600px',
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
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: selectedWallet ? '1fr 1fr' : '1fr',
      gap: '2rem',
      minHeight: '600px'
    },
    card: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '1.5rem'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '1rem'
    },
    controls: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap' as const
    },
    input: {
      padding: '0.75rem',
      border: '2px solid #000000',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#000000',
      background: '#ffffff',
      flex: 1,
      minWidth: '250px'
    },
    select: {
      padding: '0.75rem',
      border: '2px solid #000000',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#000000',
      background: '#ffffff',
      minWidth: '120px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const
    },
    th: {
      borderBottom: '2px solid #000000',
      padding: '0.75rem',
      textAlign: 'left' as const,
      fontWeight: 'bold',
      color: '#000000',
      fontSize: '0.875rem'
    },
    td: {
      borderBottom: '1px solid #ccc',
      padding: '0.75rem',
      color: '#000000',
      fontSize: '0.875rem',
      cursor: 'pointer'
    },
    walletRow: {
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    selectedRow: {
      background: '#eff6ff',
      border: '2px solid #3b82f6'
    },
    statusBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: 'bold'
    },
    statusActive: {
      background: '#dcfce7',
      color: '#166534'
    },
    statusWarning: {
      background: '#fef3c7',
      color: '#92400e'
    },
    statusCritical: {
      background: '#fef2f2',
      color: '#dc2626'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    statCard: {
      background: '#f8fafc',
      border: '2px solid #e2e8f0',
      borderRadius: '0.5rem',
      padding: '1rem',
      textAlign: 'center' as const
    },
    bigNumber: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '0.25rem'
    },
    metric: {
      color: '#666',
      fontSize: '0.75rem'
    },
    loadingCard: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '3rem',
      textAlign: 'center' as const
    },
    actionButton: {
      background: '#000000',
      color: '#ffffff',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginRight: '0.5rem'
    }
  };

  useEffect(() => {
    loadAllWallets();
  }, []);

  useEffect(() => {
    if (selectedWallet) {
      loadWalletDetails(selectedWallet);
    }
  }, [selectedWallet]);

  const loadAllWallets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/all-wallets');
      if (response.ok) {
        const data = await response.json();
        setWallets(data.wallets);
      } else {
        // Mock data for demonstration
        setWallets([
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
          }
          // ... would continue with all 50+ wallets
        ]);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWalletDetails = async (walletId: string) => {
    try {
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) return;

      const response = await fetch(`/api/admin/wallet-details?address=${wallet.address}`);
      if (response.ok) {
        const data = await response.json();
        setWalletDetails(data);
      } else {
        // Mock detailed data
        setWalletDetails({
          address: wallet.address,
          clientName: wallet.clientName,
          totalValue: wallet.totalValue,
          totalPnL: 12543.78,
          totalPnLPercentage: 5.4,
          performance24h: wallet.performance24h,
          positions: [
            {
              protocol: 'Uniswap V3',
              type: 'Liquidity Pool',
              tokens: 'ETH/USDC',
              quantity: 125.5,
              entryPrice: 1850.00,
              currentPrice: 2145.30,
              value: 125000.00,
              pnl: 15643.25,
              pnlPercentage: 14.3,
              change24h: 2.8,
              apr: 15.6,
              healthFactor: 1.8,
              status: 'healthy',
              entryDate: '2024-01-15',
              lastUpdated: 'Just now'
            },
            {
              protocol: 'Aave V3', 
              type: 'Lending',
              tokens: 'USDC',
              quantity: 85000,
              entryPrice: 1.00,
              currentPrice: 1.00,
              value: 85000.00,
              pnl: 3600.00,
              pnlPercentage: 4.4,
              change24h: 0.1,
              apr: 4.2,
              healthFactor: 2.45,
              status: 'healthy',
              entryDate: '2024-01-20',
              lastUpdated: '5 mins ago'
            },
            {
              protocol: 'Aave V3',
              type: 'Borrowing',
              tokens: 'ETH Borrow',
              quantity: -16.3,
              entryPrice: 2100.00,
              currentPrice: 2145.30,
              value: -35000.00,
              pnl: -738.39,
              pnlPercentage: -2.1,
              change24h: -0.8,
              apr: 3.8,
              healthFactor: 2.45,
              status: wallet.status === 'critical' ? 'critical' : 'healthy',
              entryDate: '2024-01-18',
              lastUpdated: '1 hour ago'
            }
          ],
          alerts: [
            {
              type: 'info',
              message: 'High APR opportunity: 18.5% available in new Curve pool',
              timestamp: '10 mins ago'
            },
            {
              type: 'warning',
              message: 'Large position detected: Monitor for impermanent loss',
              timestamp: '2 hours ago'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading wallet details:', error);
    }
  };

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wallet.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || wallet.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const baseStyle = styles.statusBadge;
    switch (status) {
      case 'active':
        return { ...baseStyle, ...styles.statusActive };
      case 'warning':
        return { ...baseStyle, ...styles.statusWarning };
      case 'critical':
        return { ...baseStyle, ...styles.statusCritical };
      default:
        return baseStyle;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatPercentage = (percent: number) => {
    const color = percent >= 0 ? '#16a34a' : '#dc2626';
    const sign = percent >= 0 ? '+' : '';
    return (
      <span style={{ color, fontWeight: 'bold' }}>
        {sign}{percent.toFixed(2)}%
      </span>
    );
  };

  const getTokenAddress = (tokenSymbol: string) => {
    // Token contract addresses for trading links
    const tokenAddresses: { [key: string]: string } = {
      'ETH': 'ETH',
      'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      'USDC': '0xA0b86a33E6441C8C673E4C0b8E0A3D8f6b1c8A8c',
      'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    };
    return tokenAddresses[tokenSymbol.trim()] || tokenSymbol;
  };

  return (
    <>
      <Head>
        <title>Portfolio Management - LiquidFlow Admin</title>
        <meta name="description" content="Manage all client portfolios and positions" />
      </Head>
      
      <div style={styles.page}>
        <nav style={styles.nav}>
          <div style={styles.navContainer}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000' }}>
              🏢 LiquidFlow Admin
            </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>🏠 Home</a>
            <a href="/admin/wallets" style={styles.navLink}>💳 Manage Wallets</a>
            <a href="/admin/portfolios" style={{ ...styles.navLink, color: '#2563eb', fontWeight: 'bold' }}>🏢 Portfolios</a>
            <a href="/admin/reports" style={styles.navLink}>📊 Reports</a>
            <a href="/admin/analytics" style={styles.navLink}>📈 Analytics</a>
            <a href="/dashboard" style={styles.navLink}>← Dashboard</a>
            <button 
              onClick={() => {
                localStorage.removeItem('connectedWallet');
                localStorage.removeItem('walletType');
                localStorage.removeItem('liquidflow_admin');
                localStorage.removeItem('admin_session');
                window.location.href = '/';
              }}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              🚪 Logout
            </button>
          </div>
          </div>
        </nav>

        <div style={styles.container}>
          <h1 style={styles.title}>💼 Portfolio Management</h1>
          <p style={styles.subtitle}>
            Monitor and manage all {wallets.length} client portfolios in real-time
          </p>

          {isLoading ? (
            <div style={styles.loadingCard}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <h3 style={{ color: '#000000' }}>Loading Client Portfolios...</h3>
              <p style={{ color: '#666' }}>Fetching data for all managed wallets</p>
            </div>
          ) : (
            <div style={styles.mainGrid}>
              {/* Wallets List */}
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>👥 Client Wallets ({filteredWallets.length})</h2>
                
                <div style={styles.controls}>
                  <input
                    type="text"
                    placeholder="Search by name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.input}
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    style={styles.select}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Client</th>
                        <th style={styles.th}>Portfolio Value</th>
                        <th style={styles.th}>24h Change</th>
                        <th style={styles.th}>Positions</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Last Updated</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWallets.map((wallet) => (
                        <tr
                          key={wallet.id}
                          style={{
                            ...styles.walletRow,
                            ...(selectedWallet === wallet.id ? styles.selectedRow : {})
                          }}
                          onClick={() => setSelectedWallet(wallet.id)}
                        >
                          <td style={styles.td}>
                            <div style={{ fontWeight: 'bold' }}>{wallet.clientName}</div>
                            <div style={{ color: '#666', fontSize: '0.75rem' }}>
                              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                            </div>
                          </td>
                          <td style={styles.td}>{formatCurrency(wallet.totalValue)}</td>
                          <td style={styles.td}>{formatPercentage(wallet.performance24h)}</td>
                          <td style={styles.td}>
                            {wallet.positions} ({wallet.alerts} alerts)
                          </td>
                          <td style={styles.td}>
                            <span style={getStatusBadge(wallet.status)}>
                              {wallet.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.td}>{wallet.lastUpdated}</td>
                          <td style={styles.td}>
                            <button style={styles.actionButton}>Manage</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Wallet Details */}
              {selectedWallet && walletDetails && (
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>
                    📊 {walletDetails.clientName} Portfolio
                  </h2>
                  
                  {/* Real-time Wallet Balance */}
                  <WalletBalance walletAddress={walletDetails.address} showChains={true} />
                  
                  <div style={styles.detailsGrid}>
                    <div style={styles.statCard}>
                      <div style={styles.bigNumber}>
                        {formatCurrency(walletDetails.totalValue)}
                      </div>
                      <div style={styles.metric}>Total Value</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.bigNumber}>{walletDetails.positions.length}</div>
                      <div style={styles.metric}>Active Positions</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.bigNumber}>{walletDetails.alerts.length}</div>
                      <div style={styles.metric}>Active Alerts</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.bigNumber}>
                        {walletDetails.totalPnL !== undefined 
                          ? formatCurrency(walletDetails.totalPnL) 
                          : '$0.00'}
                      </div>
                      <div style={styles.metric}>Total P&L</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.bigNumber}>
                        {walletDetails.totalPnLPercentage !== undefined 
                          ? formatPercentage(walletDetails.totalPnLPercentage) 
                          : '0%'}
                      </div>
                      <div style={styles.metric}>P&L %</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.bigNumber}>
                        {walletDetails.performance24h !== undefined 
                          ? formatPercentage(walletDetails.performance24h) 
                          : '0%'}
                      </div>
                      <div style={styles.metric}>24h Performance</div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    🏦 Active Positions
                  </h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Protocol</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Tokens</th>
                        <th style={styles.th}>Quantity</th>
                        <th style={styles.th}>Entry Price</th>
                        <th style={styles.th}>Current Price</th>
                        <th style={styles.th}>Value</th>
                        <th style={styles.th}>P&L</th>
                        <th style={styles.th}>24h Change</th>
                        <th style={styles.th}>APR</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletDetails.positions.map((position, index) => (
                        <tr key={index}>
                          <td style={styles.td}>{position.protocol}</td>
                          <td style={styles.td}>{position.type}</td>
                          <td style={styles.td}>{position.tokens}</td>
                          <td style={styles.td}>
                            {position.quantity !== undefined ? position.quantity : '-'}
                          </td>
                          <td style={styles.td}>
                            {position.entryPrice !== undefined ? formatCurrency(position.entryPrice) : '-'}
                          </td>
                          <td style={styles.td}>
                            {position.currentPrice !== undefined ? formatCurrency(position.currentPrice) : '-'}
                          </td>
                          <td style={styles.td}>
                            {position.value < 0 ? '-' : ''}{formatCurrency(position.value)}
                          </td>
                          <td style={styles.td}>
                            {position.pnl !== undefined ? formatCurrency(position.pnl) : '-'}
                          </td>
                          <td style={styles.td}>
                            {position.change24h !== undefined ? formatPercentage(position.change24h) : '-'}
                          </td>
                          <td style={styles.td}>
                            {position.apr > 0 ? `${position.apr.toFixed(1)}%` : '-'}
                          </td>
                          <td style={styles.td}>
                            <span style={getStatusBadge(position.status)}>
                              {position.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {position.protocol === 'Uniswap V3' && (
                              <a
                                href={`https://app.uniswap.org/#/swap?inputCurrency=${getTokenAddress(position.tokens.split('/')[0])}&outputCurrency=${getTokenAddress(position.tokens.split('/')[1])}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: '#FF007A',
                                  color: '#ffffff',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  textDecoration: 'none',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  marginRight: '0.25rem'
                                }}
                              >
                                🦄 Trade
                              </a>
                            )}
                            {position.protocol === 'Aave V3' && (
                              <a
                                href="https://app.aave.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: '#B6509E',
                                  color: '#ffffff',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  textDecoration: 'none',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  marginRight: '0.25rem'
                                }}
                              >
                                💰 Manage
                              </a>
                            )}
                            {position.protocol === 'Compound' && (
                              <a
                                href="https://app.compound.finance/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: '#00D395',
                                  color: '#ffffff',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  textDecoration: 'none',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  marginRight: '0.25rem'
                                }}
                              >
                                🏦 Lend
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '2rem 0 1rem' }}>
                    🚨 Recent Alerts
                  </h3>
                  {walletDetails.alerts.map((alert, index) => (
                    <div key={index} style={{
                      border: '2px solid #000000',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      background: alert.type === 'critical' ? '#fef2f2' : 
                                 alert.type === 'warning' ? '#fef3c7' : '#eff6ff'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {alert.type === 'critical' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'} 
                        {alert.type.toUpperCase()}
                      </div>
                      <div style={{ marginBottom: '0.25rem' }}>{alert.message}</div>
                      <div style={{ color: '#666', fontSize: '0.75rem' }}>{alert.timestamp}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 