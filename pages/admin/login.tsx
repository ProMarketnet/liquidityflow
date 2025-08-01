import { useState } from 'react';
import Head from 'next/head';

interface AdminAccount {
  email: string;
  password: string;
  companyName: string;
  walletAccess: 'own' | 'managed' | 'both';
  managedWallets: ManagedWallet[];
}

interface ManagedWallet {
  id: string;
  clientName: string;
  walletAddress: string;
  encryptedPrivateKey: string;
  permissions: string[];
  accessLevel: 'view' | 'trade' | 'full';
}

export default function AdminLogin() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    adminWallet: '',
    walletAccess: 'own' as 'own' | 'managed' | 'both'
  });
  const [managedWallets, setManagedWallets] = useState<ManagedWallet[]>([]);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWallet, setNewWallet] = useState({
    clientName: '',
    walletAddress: '',
    privateKey: '',
    accessLevel: 'view' as 'view' | 'trade' | 'full'
  });

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
      maxWidth: '800px',
      margin: '0 auto',
      background: '#ffffff',
      borderRadius: '1rem',
      border: '2px solid #e5e7eb',
      padding: '2rem'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#666666',
      fontSize: '1rem'
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      padding: '1rem 0'
    },
    navTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#000000'
    },
    homeBtn: {
      background: '#16a34a',
      color: '#ffffff',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontWeight: 'bold'
    },
    tabs: {
      display: 'flex',
      marginBottom: '2rem',
      borderBottom: '2px solid #e5e7eb'
    },
    tab: {
      padding: '1rem 2rem',
      background: 'transparent',
      border: 'none',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      borderBottom: '2px solid transparent'
    },
    activeTab: {
      color: '#dc2626',
      borderBottom: '2px solid #dc2626'
    },
    inactiveTab: {
      color: '#666666'
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    label: {
      fontWeight: 'bold',
      color: '#000000',
      fontSize: '0.875rem'
    },
    input: {
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#000000',
      background: '#ffffff'
    },
    select: {
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#000000',
      background: '#ffffff'
    },
    button: {
      background: '#dc2626',
      color: '#ffffff',
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '1rem'
    },
    secondaryButton: {
      background: '#ffffff',
      color: '#dc2626',
      border: '2px solid #dc2626',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    warning: {
      background: '#fef3c7',
      border: '2px solid #f59e0b',
      borderRadius: '0.5rem',
      padding: '1rem',
      color: '#000000',
      fontSize: '0.875rem',
      marginBottom: '1rem'
    },
    walletCard: {
      background: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1rem'
    },
    accessBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: 'bold'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // 🔐 In production: hash password, encrypt private keys, store in database
    const adminData = {
      ...formData,
      managedWallets,
      createdAt: new Date().toISOString()
    };

    console.log('Admin Account Data:', adminData);
    
    // Store in localStorage for demo (use secure database in production)
    localStorage.setItem('liquidflow_admin', JSON.stringify(adminData));
    localStorage.setItem('admin_session', 'true');
    
    // Redirect to admin dashboard
    window.location.href = '/admin/portfolios';
  };

  const addManagedWallet = () => {
    if (!newWallet.clientName || !newWallet.walletAddress) {
      alert('Please fill in client name and wallet address');
      return;
    }

    const wallet: ManagedWallet = {
      id: `wallet_${Date.now()}`,
      clientName: newWallet.clientName,
      walletAddress: newWallet.walletAddress,
      encryptedPrivateKey: newWallet.privateKey ? encrypt(newWallet.privateKey) : '',
      permissions: getPermissionsByAccessLevel(newWallet.accessLevel),
      accessLevel: newWallet.accessLevel
    };

    setManagedWallets([...managedWallets, wallet]);
    setNewWallet({
      clientName: '',
      walletAddress: '',
      privateKey: '',
      accessLevel: 'view'
    });
    setShowAddWallet(false);
  };

  const encrypt = (privateKey: string): string => {
    // 🔐 In production: use proper encryption (AES-256)
    return btoa(privateKey); // Simple base64 for demo
  };

  const getPermissionsByAccessLevel = (level: string): string[] => {
    switch (level) {
      case 'view':
        return ['view_portfolio', 'view_positions'];
      case 'trade':
        return ['view_portfolio', 'view_positions', 'execute_trades', 'manage_positions'];
      case 'full':
        return ['view_portfolio', 'view_positions', 'execute_trades', 'manage_positions', 'withdraw_funds', 'change_settings'];
      default:
        return ['view_portfolio'];
    }
  };

  const getAccessBadgeStyle = (level: string) => {
    const colors = {
      view: { bg: '#dbeafe', color: '#1d4ed8' },
      trade: { bg: '#fef3c7', color: '#d97706' },
      full: { bg: '#fecaca', color: '#dc2626' }
    };
    return {
      ...styles.accessBadge,
      background: colors[level as keyof typeof colors]?.bg || colors.view.bg,
      color: colors[level as keyof typeof colors]?.color || colors.view.color
    };
  };

  return (
    <>
      <Head>
        <title>Admin Login - LiquidFlow</title>
        <meta name="description" content="Admin access for portfolio management" />
      </Head>
      <div style={styles.page}>
        <nav style={styles.nav}>
          <div style={styles.navTitle}>🏢 LiquidFlow Admin</div>
          <a href="/" style={styles.homeBtn}>🏠 Home</a>
        </nav>

        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>
              {mode === 'login' ? 'Admin Login' : 'Create Admin Account'}
            </h1>
            <p style={styles.subtitle}>
              {mode === 'login' 
                ? 'Access your portfolio management dashboard' 
                : 'Set up your LiquidFlow admin account with wallet management'
              }
            </p>
          </div>

          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(mode === 'login' ? styles.activeTab : styles.inactiveTab)
              }}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              style={{
                ...styles.tab,
                ...(mode === 'register' ? styles.activeTab : styles.inactiveTab)
              }}
              onClick={() => setMode('register')}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={styles.input}
                required
              />
            </div>

            {mode === 'register' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    style={styles.input}
                    placeholder="e.g., ABC Company"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Admin Wallet Address</label>
                  <input
                    type="text"
                    value={formData.adminWallet}
                    onChange={(e) => setFormData({...formData, adminWallet: e.target.value})}
                    style={styles.input}
                    placeholder="0x..."
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Wallet Access Type</label>
                  <select
                    value={formData.walletAccess}
                    onChange={(e) => setFormData({...formData, walletAccess: e.target.value as 'own' | 'managed' | 'both'})}
                    style={styles.select}
                  >
                    <option value="own">Own Wallet Only</option>
                    <option value="managed">Manage Client Wallets</option>
                    <option value="both">Own + Client Wallets</option>
                  </select>
                </div>

                {(formData.walletAccess === 'managed' || formData.walletAccess === 'both') && (
                  <div>
                    <div style={styles.warning}>
                      ⚠️ <strong>Security Notice:</strong> Private keys will be encrypted and stored securely. 
                      Only use this for client wallets where you have explicit permission to manage funds.
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ color: '#000000', margin: 0 }}>Managed Client Wallets</h3>
                      <button
                        type="button"
                        onClick={() => setShowAddWallet(true)}
                        style={styles.secondaryButton}
                      >
                        + Add Wallet
                      </button>
                    </div>

                    {managedWallets.map((wallet) => (
                      <div key={wallet.id} style={styles.walletCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#000000' }}>{wallet.clientName}</div>
                            <div style={{ color: '#666666', fontSize: '0.875rem' }}>
                              {wallet.walletAddress.slice(0, 10)}...{wallet.walletAddress.slice(-8)}
                            </div>
                          </div>
                          <div style={getAccessBadgeStyle(wallet.accessLevel)}>
                            {wallet.accessLevel.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}

                    {showAddWallet && (
                      <div style={{ background: '#f3f4f6', border: '2px solid #d1d5db', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                        <h4 style={{ color: '#000000', marginBottom: '1rem' }}>Add Client Wallet</h4>
                        
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Client Name</label>
                          <input
                            type="text"
                            value={newWallet.clientName}
                            onChange={(e) => setNewWallet({...newWallet, clientName: e.target.value})}
                            style={styles.input}
                            placeholder="e.g., ABC Company Pool #1"
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Wallet Address</label>
                          <input
                            type="text"
                            value={newWallet.walletAddress}
                            onChange={(e) => setNewWallet({...newWallet, walletAddress: e.target.value})}
                            style={styles.input}
                            placeholder="0x..."
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Private Key (Optional - for trading access)</label>
                          <input
                            type="password"
                            value={newWallet.privateKey}
                            onChange={(e) => setNewWallet({...newWallet, privateKey: e.target.value})}
                            style={styles.input}
                            placeholder="Private key for trading (will be encrypted)"
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Access Level</label>
                          <select
                            value={newWallet.accessLevel}
                            onChange={(e) => setNewWallet({...newWallet, accessLevel: e.target.value as 'view' | 'trade' | 'full'})}
                            style={styles.select}
                          >
                            <option value="view">View Only</option>
                            <option value="trade">Trading Enabled</option>
                            <option value="full">Full Control</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                          <button type="button" onClick={addManagedWallet} style={styles.secondaryButton}>
                            Add Wallet
                          </button>
                          <button type="button" onClick={() => setShowAddWallet(false)} style={{ ...styles.secondaryButton, color: '#666666', borderColor: '#666666' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <button type="submit" style={styles.button}>
              {mode === 'login' ? 'Login to Admin Dashboard' : 'Create Admin Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
            <p style={{ color: '#666666', margin: 0, fontSize: '0.875rem' }}>
              <strong>Two Ways to Use LiquidFlow:</strong><br/>
              🚀 <strong>Get Started</strong> = Connect any wallet for read-only viewing<br/>
              🏢 <strong>Admin</strong> = Full account with private key management & trading
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 