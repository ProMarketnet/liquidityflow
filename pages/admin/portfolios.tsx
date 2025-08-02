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
  const [userWorkspaces, setUserWorkspaces] = useState<any[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
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
    loginForm: {
      background: '#f0f7ff',
      border: '3px solid #2563eb',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem',
      textAlign: 'center' as const
    },
    workspaceSelector: {
      background: '#f0f7ff',
      border: '3px solid #2563eb',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem'
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
    }
  };

  useEffect(() => {
    // Check for saved user session
    const savedEmail = localStorage.getItem('userEmail');
    const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
    
    if (savedEmail) {
      setUserEmail(savedEmail);
      loadUserWorkspaces(savedEmail, savedWorkspaceId || undefined);
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
    loadUserWorkspaces(email);
  };

  const handleLogout = () => {
    setUserEmail('');
    setUserWorkspaces([]);
    setCurrentWorkspace(null);
    setWallets([]);
    setSelectedWallet(null);
    setWalletDetails(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentWorkspaceId');
  };

  const loadUserWorkspaces = async (email: string, workspaceId?: string) => {
    setIsLoading(true);
    try {
      console.log(`🔗 Loading workspaces for user: ${email}`);
      
      // Mock user workspaces based on email
      const workspaces = getUserMockWorkspaces(email);
      setUserWorkspaces(workspaces);
      
      if (workspaces.length > 0) {
        // Select saved workspace or first available
        const selectedWorkspace = workspaceId 
          ? workspaces.find(ws => ws.id === workspaceId) || workspaces[0]
          : workspaces[0];
        
        setCurrentWorkspace(selectedWorkspace);
        localStorage.setItem('currentWorkspaceId', selectedWorkspace.id);
        loadWorkspaceWallets(selectedWorkspace.id);
      } else {
        setIsLoading(false);
      }
      
      console.log(`✅ Found ${workspaces.length} workspaces for ${email}`);
    } catch (error) {
      console.error('❌ Error loading user workspaces:', error);
      setUserWorkspaces([]);
      setIsLoading(false);
    }
  };

  const loadWorkspaceWallets = async (workspaceId: string) => {
    try {
      console.log(`💼 Loading wallets for workspace: ${workspaceId}`);
      
      const workspaceWallets = getWorkspaceMockWallets(workspaceId);
      setWallets(workspaceWallets);
      
      console.log(`✅ Loaded ${workspaceWallets.length} wallets for workspace`);
    } catch (error) {
      console.error('❌ Error loading workspace wallets:', error);
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkspaceSwitch = (workspace: any) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('currentWorkspaceId', workspace.id);
    loadWorkspaceWallets(workspace.id);
  };

  const handleInviteMember = (inviteeEmail: string, role: 'ADMIN' | 'GUEST') => {
    // In production, this would call the invitation API
    alert(`📧 Invitation sent to ${inviteeEmail} as ${role} for ${currentWorkspace.name}`);
    setShowInviteModal(false);
  };

  // 🏢 MOCK WORKSPACE DATA
  const getUserMockWorkspaces = (email: string): any[] => {
    if (email === 'john@company.com') {
      return [
        {
          id: 'ws_xtc_company',
          name: 'XTC Company',
          role: 'OWNER',
          memberCount: 2,
          plan: 'PRO',
          permissions: ['manage_workspace', 'invite_members', 'manage_wallets', 'manage_pools', 'view_reports']
        }
      ];
    }
    
    if (email === 'jane@email.com') {
      return [
        {
          id: 'ws_xtc_company',
          name: 'XTC Company',
          role: 'ADMIN',
          memberCount: 2,
          plan: 'PRO',
          permissions: ['manage_wallets', 'manage_pools', 'view_reports'],
          invitedBy: 'john@company.com'
        }
      ];
    }
    
    if (email === 'test@example.com') {
      return [
        {
          id: 'ws_personal_test',
          name: 'Personal Workspace',
          role: 'OWNER',
          memberCount: 1,
          plan: 'BASIC',
          permissions: ['manage_workspace', 'invite_members', 'manage_wallets', 'manage_pools', 'view_reports']
        }
      ];
    }
    
    return []; // No workspaces for unknown users
  };

  const getWorkspaceMockWallets = (workspaceId: string): ClientWallet[] => {
    const workspaceWalletData: { [key: string]: ClientWallet[] } = {
      'ws_xtc_company': [
        {
          id: '1',
          address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
          clientName: 'XTC Client - Alice Johnson',
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
          clientName: 'XTC Client - Bob Smith (added by Jane)',
          totalValue: 156789.45,
          lastUpdated: '5 mins ago',
          status: 'active',
          positions: 12,
          protocols: ['Compound', 'Yearn'],
          alerts: 1,
          performance24h: 1.89
        }
      ],
      'ws_personal_test': [
        {
          id: '3',
          address: '0x1234567890abcdef1234567890abcdef12345678',
          clientName: 'Personal Client - Charlie Brown',
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

    return workspaceWalletData[workspaceId] || [];
  };

  // If not logged in, show simple email login
  if (!userEmail) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>🏢 Portfolio Management</h1>
          <p style={styles.subtitle}>Enter your email to access your workspaces</p>
          
          <div style={styles.loginForm}>
            <h3 style={{ marginBottom: '1.5rem', color: '#2563eb' }}>Login to LiquidFlow</h3>
            
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
                Access My Workspaces
              </button>
            </form>
            
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                <strong>🏢 Collaborative Workspaces:</strong> Create companies, invite team members, and manage shared portfolios together.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no workspaces, show workspace creation
  if (userWorkspaces.length === 0 && !isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={styles.title}>🏢 Portfolio Management</h1>
              <p style={styles.subtitle}>Welcome {userEmail}! Create your first workspace to get started.</p>
            </div>
            <button onClick={handleLogout} style={{ ...styles.button, background: '#dc2626' }}>
              🚪 Logout
            </button>
          </div>

          <div style={styles.card}>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
              <h3>Create Your First Workspace</h3>
              <p style={{ marginBottom: '2rem', color: '#666' }}>
                Workspaces let you organize portfolios and collaborate with team members.
              </p>
              <button style={styles.button} onClick={() => setShowCreateWorkspace(true)}>
                ➕ Create Workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header with Workspace Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={styles.title}>🏢 Portfolio Management</h1>
            <p style={styles.subtitle}>
              {userEmail} • {currentWorkspace?.name} ({currentWorkspace?.role}) • {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Workspace Switcher */}
            {userWorkspaces.length > 1 && (
              <select 
                value={currentWorkspace?.id || ''} 
                onChange={(e) => {
                  const workspace = userWorkspaces.find(ws => ws.id === e.target.value);
                  if (workspace) handleWorkspaceSwitch(workspace);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid #000000',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                {userWorkspaces.map(ws => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} ({ws.role})
                  </option>
                ))}
              </select>
            )}
            
            {/* Invite Button (only for owners/admins) */}
            {currentWorkspace?.permissions.includes('invite_members') && (
              <button onClick={() => setShowInviteModal(true)} style={styles.button}>
                👥 Invite Member
              </button>
            )}
            
            <button onClick={handleLogout} style={{ ...styles.button, background: '#dc2626' }}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Workspace Info Banner */}
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
            <strong>🏢 {currentWorkspace?.name}</strong> • 
            <span style={{ marginLeft: '0.5rem' }}>Your Role: <strong>{currentWorkspace?.role}</strong></span> •
            <span style={{ marginLeft: '0.5rem' }}>{currentWorkspace?.memberCount} member{currentWorkspace?.memberCount !== 1 ? 's' : ''}</span> •
            <span style={{ marginLeft: '0.5rem' }}>Plan: <strong>{currentWorkspace?.plan}</strong></span>
          </div>
          {currentWorkspace?.invitedBy && (
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Invited by: {currentWorkspace.invitedBy}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div style={styles.card}>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              <h3>Loading Workspace...</h3>
              <p>Fetching portfolios for {currentWorkspace?.name}</p>
            </div>
          </div>
        ) : wallets.length === 0 ? (
          // Empty State
          <div style={styles.card}>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3>{currentWorkspace?.name} is Empty</h3>
              <p style={{ marginBottom: '2rem', color: '#666' }}>
                No client wallets in this workspace yet. Start by adding your first client wallet.
              </p>
              {currentWorkspace?.permissions.includes('manage_wallets') ? (
                <button style={styles.button}>
                  ➕ Add First Client Wallet
                </button>
              ) : (
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  You need wallet management permissions to add clients.
                </p>
              )}
            </div>
          </div>
        ) : (
          // Wallets Table
          <div style={styles.card}>
            <h3 style={{ marginBottom: '1.5rem' }}>
              👥 {currentWorkspace?.name} Client Wallets ({wallets.length})
            </h3>
            
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
                        {currentWorkspace?.permissions.includes('manage_wallets') ? 'Manage' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={{ marginBottom: '1.5rem' }}>👥 Invite Member to {currentWorkspace?.name}</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const email = formData.get('email') as string;
                const role = formData.get('role') as 'ADMIN' | 'GUEST';
                handleInviteMember(email, role);
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Email Address:
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="jane@email.com"
                    style={styles.input}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Role:
                  </label>
                  <select name="role" style={styles.input} required>
                    <option value="ADMIN">Admin (can manage wallets & pools)</option>
                    <option value="GUEST">Guest (view-only access)</option>
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
  );
} 