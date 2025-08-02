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
  const [showInviteModal, setShowInviteModal] = useState(false);

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
    loginPrompt: {
      background: '#f0f7ff',
      border: '3px solid #2563eb',
      borderRadius: '1rem',
      padding: '2rem',
      textAlign: 'center' as const,
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
    modal: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%'
    },
    input: {
      padding: '0.75rem',
      border: '2px solid #000000',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#000000',
      background: '#ffffff',
      width: '100%',
      marginBottom: '1rem'
    }
  };

  useEffect(() => {
    // Check for user session
    if (typeof window === 'undefined') return;
    
    const savedEmail = localStorage.getItem('userEmail');
    const savedRole = localStorage.getItem('userRole');
    const savedFullName = localStorage.getItem('fullName');
    const savedCompanyName = localStorage.getItem('companyName');
    
    if (savedEmail && savedRole) {
      setUserEmail(savedEmail);
      setUserRole(savedRole);
      setFullName(savedFullName || '');
      setCompanyName(savedCompanyName || '');
      loadAccountWallets(savedEmail);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadAccountWallets = async (email: string) => {
    setIsLoading(true);
    try {
      console.log(`🔗 Loading wallets for account: ${email}`);
      
      // Use account-based mock data
      const accountWallets = getAccountMockWallets(email);
      setWallets(accountWallets);
      
      console.log(`✅ Loaded ${accountWallets.length} wallets for account`);
    } catch (error) {
      console.error('❌ Error loading account wallets:', error);
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window === 'undefined') return;
    
    setUserEmail('');
    setUserRole('');
    setFullName('');
    setCompanyName('');
    setWallets([]);
    localStorage.clear();
    window.location.href = '/auth/login';
  };

  const handleInviteTeamMember = async (inviteeEmail: string, role: 'ADMIN' | 'USER') => {
    try {
      setShowInviteModal(false);
      
      console.log(`📧 Inviting ${inviteeEmail} as ${role} to ${companyName}`);
      
      // In production, this would call the invitation API
      alert(`✅ Invitation sent successfully!
      
📧 Email: ${inviteeEmail}
🏢 Company: ${companyName}
👤 Role: ${role}

${inviteeEmail} will receive an email invitation to join your account.`);
      
    } catch (error) {
      console.error('❌ Error sending invitation:', error);
      alert('❌ Failed to send invitation. Please try again.');
    }
  };

  // 🏢 ACCOUNT-BASED MOCK DATA
  const getAccountMockWallets = (email: string): ClientWallet[] => {
    const accountWalletData: { [key: string]: ClientWallet[] } = {
      'john@company.com': [
        {
          id: '1',
          address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
          clientName: 'Client Portfolio - Alice Johnson',
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
          address: '0x456789abcdef0123456789abcdef0123456789ab',
          clientName: 'Client Portfolio - Bob Smith',
          totalValue: 156789.45,
          lastUpdated: '5 mins ago',
          status: 'active',
          positions: 12,
          protocols: ['Compound', 'Yearn'],
          alerts: 1,
          performance24h: 1.89
        }
      ],
      'jane@email.com': [
        {
          id: '3',
          address: '0x1234567890abcdef1234567890abcdef12345678',
          clientName: 'Jane Client - Charlie Brown',
          totalValue: 89123.45,
          lastUpdated: '10 mins ago',
          status: 'active',
          positions: 5,
          protocols: ['Uniswap V2'],
          alerts: 0,
          performance24h: 0.85
        }
      ]
    };

    return accountWalletData[email] || [];
  };

  // If not logged in, show login prompt
  if (!userEmail) {
    return (
      <>
        <Head>
          <title>Portfolio Management - LiquidFlow</title>
        </Head>
        <div style={styles.page}>
          <div style={styles.container}>
            <h1 style={styles.title}>🏢 Portfolio Management</h1>
            <p style={styles.subtitle}>Please sign in to access your account</p>
            
            <div style={styles.loginPrompt}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
              <h3 style={{ marginBottom: '1rem', color: '#2563eb' }}>Authentication Required</h3>
              <p style={{ marginBottom: '2rem', color: '#666' }}>
                You need to sign in to access your portfolio management dashboard.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
                  📝 Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{companyName} Portfolio Management - LiquidFlow</title>
      </Head>
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={styles.title}>🏢 Portfolio Management</h1>
              <p style={styles.subtitle}>
                {fullName} ({userRole.replace('_', ' ')}) • {companyName} • {wallets.length} client wallet{wallets.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {(userRole === 'PRIMARY_ADMIN' || userRole === 'ADMIN') && (
                <button onClick={() => setShowInviteModal(true)} style={styles.button}>
                  👥 Invite Team Member
                </button>
              )}
              <button onClick={handleLogout} style={{ ...styles.button, background: '#dc2626' }}>
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Account Info Banner */}
          <div style={{
            background: '#eff6ff',
            border: '2px solid #3b82f6',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>🏢 {companyName}</strong> • 
              <span style={{ marginLeft: '0.5rem' }}>Your Role: <strong>{userRole.replace('_', ' ')}</strong></span> •
              <span style={{ marginLeft: '0.5rem' }}>Account Owner: {userRole === 'PRIMARY_ADMIN' ? 'You' : 'Primary Admin'}</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Account ID: {localStorage.getItem('accountId')?.slice(0, 12)}...
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div style={styles.card}>
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <h3>Loading Your Portfolio...</h3>
                <p>Fetching client wallets for {companyName}</p>
              </div>
            </div>
          ) : wallets.length === 0 ? (
            // Empty State
            <div style={styles.card}>
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <h3>No Client Wallets Yet</h3>
                <p style={{ marginBottom: '2rem', color: '#666' }}>
                  Start by adding your first client wallet to begin portfolio management.
                </p>
                {(userRole === 'PRIMARY_ADMIN' || userRole === 'ADMIN') ? (
                  <button style={styles.button}>
                    ➕ Add First Client Wallet
                  </button>
                ) : (
                  <p style={{ color: '#666', fontSize: '0.875rem' }}>
                    Contact your admin to add client wallets.
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Wallets Table
            <div style={styles.card}>
              <h3 style={{ marginBottom: '1.5rem' }}>
                👥 {companyName} Client Portfolios ({wallets.length})
              </h3>
              
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #000', textAlign: 'left' }}>Client Portfolio</th>
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
                          {userRole === 'USER' ? 'View' : 'Manage'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Team Invitation Modal */}
          {showInviteModal && (
            <div style={styles.modal}>
              <div style={styles.modalContent}>
                <h3 style={{ marginBottom: '1.5rem' }}>👥 Invite Team Member to {companyName}</h3>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const email = formData.get('email') as string;
                  const role = formData.get('role') as 'ADMIN' | 'USER';
                  handleInviteTeamMember(email, role);
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Email Address:
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="colleague@company.com"
                      style={styles.input}
                      required
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Role:
                    </label>
                    <select name="role" style={styles.input} required>
                      <option value="ADMIN">Admin (can manage portfolios & invite others)</option>
                      <option value="USER">User (view-only access to portfolios)</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowInviteModal(false)}
                      style={{ ...styles.button, background: '#6b7280' }}
                    >
                      Cancel
                    </button>
                    <button type="submit" style={styles.button}>
                      📧 Send Invitation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 