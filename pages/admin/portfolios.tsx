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
  const [userEmail, setUserEmail] = useState<string>('');

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
    loginForm: {
      background: '#f0f7ff',
      border: '3px solid #2563eb',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem',
      textAlign: 'center' as const
    },
    input: {
      padding: '0.75rem',
      border: '2px solid #000000',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#000000',
      background: '#ffffff',
      width: '300px',
      marginRight: '1rem'
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
      padding: '1.5rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const
    }
  };

  useEffect(() => {
    // Check for saved user session
    const savedEmail = localStorage.getItem('userEmail');
    
    if (savedEmail) {
      setUserEmail(savedEmail);
      loadUserWallets(savedEmail);
    } else {
      setIsLoading(false); // Show login form
    }
  }, []);

  // 👤 USER LOGIN
  const handleUserLogin = (email: string) => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
    loadUserWallets(email);
  };

  const handleLogout = () => {
    setUserEmail('');
    setWallets([]);
    setSelectedWallet(null);
    setWalletDetails(null);
    localStorage.removeItem('userEmail');
  };

  const loadUserWallets = async (email: string) => {
    setIsLoading(true);
    try {
      console.log(`🔗 Loading wallets for user: ${email}`);
      
      // For now, use mock data based on email
      const userWallets = getUserMockWallets(email);
      setWallets(userWallets);
      
      console.log(`✅ Loaded ${userWallets.length} wallets for ${email}`);
    } catch (error) {
      console.error('❌ Error loading user wallets:', error);
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 👤 USER-SPECIFIC MOCK DATA
  const getUserMockWallets = (email: string): ClientWallet[] => {
    // Generate consistent mock data based on email
    const emailHash = btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    
    // Each user gets their own unique wallets
    if (email === 'test@example.com') {
      return [
        {
          id: '1',
          address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
          clientName: 'My Client - Alice Johnson',
          totalValue: 245823.12,
          lastUpdated: '2 mins ago',
          status: 'active',
          positions: 8,
          protocols: ['Uniswap V3', 'Aave V3'],
          alerts: 0,
          performance24h: 2.45
        }
      ];
    }
    
    if (email === 'john@company.com') {
      return [
        {
          id: '2',
          address: '0x456789abcdef0123456789abcdef0123456789ab',
          clientName: 'John Client - David Brown',
          totalValue: 156789.45,
          lastUpdated: '5 mins ago',
          status: 'active',
          positions: 12,
          protocols: ['Compound', 'Yearn'],
          alerts: 1,
          performance24h: 1.89
        }
      ];
    }
    
    // For any other email, return empty (they see nothing until they create wallets)
    return [];
  };

  // If not logged in, show simple email login
  if (!userEmail) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>🏢 Portfolio Management</h1>
          <p style={styles.subtitle}>Enter your email to access your portfolio workspace</p>
          
          <div style={styles.loginForm}>
            <h3 style={{ marginBottom: '1.5rem', color: '#2563eb' }}>Login to Your Workspace</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const email = formData.get('email') as string;
              handleUserLogin(email);
            }}>
              <input
                type="email"
                name="email"
                placeholder="your.email@company.com"
                style={styles.input}
                required
              />
              <button type="submit" style={styles.button}>
                Access My Workspace
              </button>
            </form>
            
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                <strong>🔐 Individual Workspaces:</strong> Each email gets their own isolated workspace. 
                You can only see wallets and pools you personally created.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={styles.title}>🏢 Portfolio Management</h1>
            <p style={styles.subtitle}>
              Logged in as: <strong>{userEmail}</strong> • {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          <button onClick={handleLogout} style={{ ...styles.button, background: '#dc2626' }}>
            🚪 Logout
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div style={styles.card}>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              <h3>Loading Your Workspace...</h3>
              <p>Fetching your wallets and portfolio data.</p>
            </div>
          </div>
        ) : wallets.length === 0 ? (
          // Empty State
          <div style={styles.card}>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3>Your Workspace is Empty</h3>
              <p style={{ marginBottom: '2rem', color: '#666' }}>
                You haven't created any client wallets yet. Start by adding your first client to begin portfolio management.
              </p>
              <button style={styles.button}>
                ➕ Add First Client Wallet
              </button>
            </div>
          </div>
        ) : (
          // Wallets Table
          <div style={styles.card}>
            <h3 style={{ marginBottom: '1.5rem' }}>👥 Your Client Wallets ({wallets.length})</h3>
            
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', borderBottom: '2px solid #000', textAlign: 'left' }}>Client</th>
                  <th style={{ padding: '0.75rem', borderBottom: '2px solid #000', textAlign: 'right' }}>Portfolio Value</th>
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
                          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #ccc', textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        ${wallet.totalValue.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>
                        {wallet.positions} positions
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
                      <button style={{
                        background: '#000000',
                        color: '#ffffff',
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}>
                        Manage
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
  );
} 