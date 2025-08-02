import { useState, useEffect } from 'react';
import Head from 'next/head';

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

export default function AdminPortfoliosPage() {
  const [wallets, setWallets] = useState<ClientWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');

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
    button: {
      background: '#2563eb',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    card: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '2rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const
    },
    readOnlyBanner: {
      background: '#f0f7ff',
      border: '2px solid #3b82f6',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '2rem',
      textAlign: 'center' as const
    }
  };

  useEffect(() => {
    // Always show demo portfolio data for read-only access
    loadDemoData();
    
    // Check if user is logged in for management features
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) {
        setUserEmail(savedEmail);
        setUserRole(localStorage.getItem('userRole') || '');
        setFullName(localStorage.getItem('fullName') || '');
        setCompanyName(localStorage.getItem('companyName') || '');
      }
    }
  }, []);

  const loadDemoData = () => {
    setIsLoading(true);
    
    // Demo portfolio data for read-only viewing
    const demoWallets: ClientWallet[] = [
      {
        id: 'demo_1',
        address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
        clientName: 'Demo Portfolio - Alice Johnson',
        totalValue: 245823.12,
        lastUpdated: '2 mins ago',
        status: 'active',
        positions: 8,
        protocols: ['Uniswap V3', 'Aave V3'],
        alerts: 0,
        performance24h: 2.45
      },
      {
        id: 'demo_2',
        address: '0x456789abcdef0123456789abcdef0123456789ab',
        clientName: 'Demo Portfolio - Bob Smith',
        totalValue: 156789.45,
        lastUpdated: '5 mins ago',
        status: 'active',
        positions: 12,
        protocols: ['Compound', 'Yearn'],
        alerts: 1,
        performance24h: 1.89
      },
      {
        id: 'demo_3',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        clientName: 'Demo Portfolio - Charlie Brown',
        totalValue: 89123.45,
        lastUpdated: '10 mins ago',
        status: 'warning',
        positions: 5,
        protocols: ['Uniswap V2'],
        alerts: 2,
        performance24h: -0.85
      }
    ];

    setWallets(demoWallets);
    setIsLoading(false);
  };

  const handleManagementAction = () => {
    if (!userEmail) {
      const shouldRegister = confirm(`🔐 Admin Access Required

This is READ-ONLY access. To manage portfolios, you need admin access.

✅ Get Admin Access: Create account for full management features
❌ Cancel: Continue viewing in read-only mode

Would you like to get admin access?`);
      
      if (shouldRegister) {
        window.location.href = '/auth/register';
      }
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      setUserEmail('');
      setUserRole('');
      setFullName('');
      setCompanyName('');
    }
  };

  return (
    <>
      <Head>
        <title>Portfolio Analytics - LiquidFlow v2.1</title>
      </Head>
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={styles.title}>📊 Portfolio Analytics</h1>
              <p style={styles.subtitle}>
                {userEmail ? `${fullName} (${userRole}) • ${companyName}` : 'Read-Only Access'} • {wallets.length} portfolio{wallets.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {userEmail ? (
                <button onClick={handleLogout} style={{ ...styles.button, background: '#dc2626' }}>
                  🚪 Logout
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => window.location.href = '/auth/login'}
                    style={styles.button}
                  >
                    🔑 Sign In
                  </button>
                  <button 
                    onClick={() => window.location.href = '/auth/register'}
                    style={{ ...styles.button, background: '#16a34a' }}
                  >
                    👑 Get Admin Access
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Access Level Banner */}
          {!userEmail && (
            <div style={styles.readOnlyBanner}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#2563eb' }}>
                👀 READ-ONLY ACCESS
              </div>
              <p style={{ margin: 0, color: '#666' }}>
                You're viewing portfolio analytics in read-only mode. For full management features, 
                <button 
                  onClick={() => window.location.href = '/auth/register'}
                  style={{ ...styles.button, marginLeft: '0.5rem', padding: '0.5rem 1rem' }}
                >
                  Get Admin Access
                </button>
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div style={styles.card}>
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <h3>Loading Portfolio Data...</h3>
                <p>Fetching comprehensive DeFi analytics</p>
              </div>
            </div>
          ) : (
            // Portfolios Table
            <div style={styles.card}>
              <h3 style={{ marginBottom: '1.5rem' }}>
                📈 DeFi Portfolio Analytics ({wallets.length})
              </h3>
              
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #000', textAlign: 'left' }}>Portfolio</th>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #000', textAlign: 'right' }}>Total Value</th>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #000', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #000', textAlign: 'right' }}>24h Change</th>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #000', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((wallet) => (
                    <tr key={wallet.id}>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #ccc' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{wallet.clientName}</div>
                          <div style={{ fontSize: '0.875rem', color: '#666' }}>
                            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)} • {wallet.positions} positions
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #ccc', textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold' }}>
                          ${wallet.totalValue.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>
                          {wallet.protocols.join(', ')}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #ccc', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          background: wallet.status === 'active' ? '#dcfce7' : wallet.status === 'warning' ? '#fef3c7' : '#fef2f2',
                          color: wallet.status === 'active' ? '#166534' : wallet.status === 'warning' ? '#92400e' : '#dc2626'
                        }}>
                          {wallet.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #ccc', 
                        textAlign: 'right',
                        color: wallet.performance24h >= 0 ? '#16a34a' : '#dc2626',
                        fontWeight: 'bold'
                      }}>
                        {wallet.performance24h >= 0 ? '+' : ''}{wallet.performance24h}%
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #ccc', textAlign: 'center' }}>
                        <button 
                          onClick={userEmail ? undefined : handleManagementAction}
                          style={{
                            background: userEmail ? '#000000' : '#6b7280',
                            color: '#ffffff',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          {userEmail ? 'Manage' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 