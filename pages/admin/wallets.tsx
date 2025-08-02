import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface ManagedWallet {
  id: string;
  address: string;
  clientName: string;
  accessType: 'view_only' | 'managed' | 'full_access';
  hasPrivateKey: boolean;
  dateAdded: string;
  lastActivity: string;
  totalValue: number;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<ManagedWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'view_only' | 'managed' | 'full_access'>('all');

  // New wallet form state
  const [newWallet, setNewWallet] = useState<{
    address: string;
    clientName: string;
    accessType: 'view_only' | 'managed' | 'full_access';
    privateKey: string;
    notes: string;
  }>({
    address: '',
    clientName: '',
    accessType: 'view_only',
    privateKey: '',
    notes: ''
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
      maxWidth: '1600px',
      margin: '0 auto'
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
    controls: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap' as const,
      alignItems: 'center'
    },
    input: {
      padding: '0.75rem',
      border: '2px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      minWidth: '200px'
    },
    select: {
      padding: '0.75rem',
      border: '2px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      background: '#ffffff'
    },
    button: {
      background: '#3b82f6',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    addButton: {
      background: '#16a34a',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    dangerButton: {
      background: '#dc2626',
      color: '#ffffff',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '0.875rem'
    },
    card: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      border: '2px solid #000000'
    },
    th: {
      background: '#f3f4f6',
      color: '#000000',
      fontWeight: 'bold',
      padding: '1rem',
      textAlign: 'left' as const,
      border: '1px solid #000000'
    },
    td: {
      padding: '1rem',
      border: '1px solid #000000',
      color: '#000000'
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
    statusInactive: {
      background: '#fef3c7',
      color: '#92400e'
    },
    statusSuspended: {
      background: '#fee2e2',
      color: '#991b1b'
    },
    accessBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: 'bold'
    },
    accessViewOnly: {
      background: '#e0e7ff',
      color: '#3730a3'
    },
    accessManaged: {
      background: '#fef3c7',
      color: '#92400e'
    },
    accessFull: {
      background: '#fee2e2',
      color: '#991b1b'
    },
    modal: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
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
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      color: '#000000',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    textarea: {
      padding: '0.75rem',
      border: '2px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      width: '100%',
      minHeight: '100px',
      resize: 'vertical' as const
    },
    warning: {
      background: '#fef3c7',
      border: '2px solid #f59e0b',
      borderRadius: '0.5rem',
      padding: '1rem',
      color: '#92400e',
      marginBottom: '1rem'
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    setIsLoading(true);
    try {
      // In production, this would call your wallet management API
      // For now, simulate loading from multiple sources
      
      const mockWallets: ManagedWallet[] = [
        {
          id: '1',
          address: '0x4f02bb03',
          clientName: 'Your Connected Wallet',
          accessType: 'view_only',
          hasPrivateKey: false,
          dateAdded: '2024-01-20T10:00:00Z',
          lastActivity: '2024-01-20T18:30:00Z',
          totalValue: 8.69,
          status: 'active',
          notes: 'Main admin wallet - connected via Privy'
        },
        {
          id: '2',
          address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
          clientName: 'Alice Johnson',
          accessType: 'managed',
          hasPrivateKey: false,
          dateAdded: '2024-01-18T14:30:00Z',
          lastActivity: '2024-01-20T16:45:00Z',
          totalValue: 0,
          status: 'active',
          notes: 'Portfolio management client'
        },
        {
          id: '3',
          address: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
          clientName: 'Bob Chen',
          accessType: 'full_access',
          hasPrivateKey: true,
          dateAdded: '2024-01-19T09:15:00Z',
          lastActivity: '2024-01-20T12:20:00Z',
          totalValue: 0,
          status: 'active',
          notes: 'Full trading access with stored private key'
        }
      ];
      
      setWallets(mockWallets);
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addWallet = async () => {
    if (!newWallet.address || !newWallet.clientName) {
      alert('Please fill in wallet address and client name');
      return;
    }

    // Validate wallet address format
    const isEVMAddress = /^0x[a-fA-F0-9]{40}$/.test(newWallet.address);
    const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(newWallet.address);
    
    if (!isEVMAddress && !isSolanaAddress) {
      alert('Invalid wallet address format. Please enter a valid Ethereum (0x...) or Solana address.');
      return;
    }

    const wallet: ManagedWallet = {
      id: Date.now().toString(),
      address: newWallet.address,
      clientName: newWallet.clientName,
      accessType: newWallet.accessType,
      hasPrivateKey: newWallet.privateKey.length > 0,
      dateAdded: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      totalValue: 0,
      status: 'active',
      notes: newWallet.notes
    };

    // In production, save to database and optionally store encrypted private key
    setWallets(prev => [...prev, wallet]);
    
    // Reset form
    setNewWallet({
      address: '',
      clientName: '',
      accessType: 'view_only',
      privateKey: '',
      notes: ''
    });
    setShowAddForm(false);
    
    alert(`✅ Added wallet for ${newWallet.clientName}`);
  };

  const removeWallet = async (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return;

    if (confirm(`Are you sure you want to remove wallet for ${wallet.clientName}? This cannot be undone.`)) {
      // In production, remove from database and delete any stored private keys
      setWallets(prev => prev.filter(w => w.id !== walletId));
      alert(`🗑️ Removed wallet for ${wallet.clientName}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseStyle = styles.statusBadge;
    switch (status) {
      case 'active':
        return { ...baseStyle, ...styles.statusActive };
      case 'inactive':
        return { ...baseStyle, ...styles.statusInactive };
      case 'suspended':
        return { ...baseStyle, ...styles.statusSuspended };
      default:
        return baseStyle;
    }
  };

  const getAccessBadge = (accessType: string) => {
    const baseStyle = styles.accessBadge;
    switch (accessType) {
      case 'view_only':
        return { ...baseStyle, ...styles.accessViewOnly };
      case 'managed':
        return { ...baseStyle, ...styles.accessManaged };
      case 'full_access':
        return { ...baseStyle, ...styles.accessFull };
      default:
        return baseStyle;
    }
  };

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wallet.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || wallet.accessType === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <>
      <Head>
        <title>Wallet Management - LiquidFlow Admin</title>
        <meta name="description" content="Manage all client wallets and access permissions" />
      </Head>
      
      <div style={styles.page}>
        <nav style={styles.nav}>
          <div style={styles.navContainer}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000' }}>
              🏢 LiquidFlow Admin
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <a href="/admin/portfolios" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>🏠 Home</a>
              <a href="/admin/portfolios" style={styles.navLink}>💼 Portfolios</a>
              <a href="/admin/analytics" style={styles.navLink}>📊 Analytics</a>
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
          <h1 style={styles.title}>💳 Wallet Management</h1>
          <p style={styles.subtitle}>
            Add, remove, and manage all client wallets with different access levels
          </p>

          <div style={styles.controls}>
            <input
              type="text"
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.input}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              style={styles.select}
            >
              <option value="all">All Access Types</option>
              <option value="view_only">View Only</option>
              <option value="managed">Managed</option>
              <option value="full_access">Full Access</option>
            </select>
            <button
              onClick={() => setShowAddForm(true)}
              style={styles.addButton}
            >
              ➕ Add New Wallet
            </button>
            <button
              onClick={loadWallets}
              style={styles.button}
            >
              🔄 Refresh
            </button>
          </div>

          {isLoading ? (
            <div style={styles.card}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h3 style={{ color: '#000000' }}>Loading Wallets...</h3>
                <p style={{ color: '#666' }}>Fetching all managed wallets</p>
              </div>
            </div>
          ) : (
            <div style={styles.card}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                📋 Managed Wallets ({filteredWallets.length})
              </h2>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Client Name</th>
                      <th style={styles.th}>Wallet Address</th>
                      <th style={styles.th}>Access Type</th>
                      <th style={styles.th}>Private Key</th>
                      <th style={styles.th}>Portfolio Value</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Date Added</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWallets.map((wallet) => (
                      <tr key={wallet.id}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 'bold' }}>{wallet.clientName}</div>
                          {wallet.notes && (
                            <div style={{ fontSize: '0.875rem', color: '#666666' }}>
                              {wallet.notes}
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          <code style={{ 
                            background: '#f3f4f6', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem'
                          }}>
                            {wallet.address}
                          </code>
                        </td>
                        <td style={styles.td}>
                          <span style={getAccessBadge(wallet.accessType)}>
                            {wallet.accessType.toUpperCase().replace('_', ' ')}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {wallet.hasPrivateKey ? (
                            <span style={{ color: '#dc2626', fontWeight: 'bold' }}>🔑 STORED</span>
                          ) : (
                            <span style={{ color: '#6b7280' }}>❌ None</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: 'bold', color: '#16a34a' }}>
                            {formatCurrency(wallet.totalValue)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={getStatusBadge(wallet.status)}>
                            {wallet.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: '0.875rem' }}>
                            {formatDate(wallet.dateAdded)}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => window.open(`/admin/portfolios?wallet=${wallet.address}`, '_blank')}
                              style={{
                                ...styles.button,
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem'
                              }}
                            >
                              👁️ View
                            </button>
                            <button
                              onClick={() => removeWallet(wallet.id)}
                              style={{
                                ...styles.dangerButton,
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem'
                              }}
                            >
                              🗑️ Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Wallet Modal */}
      {showAddForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              ➕ Add New Wallet
            </h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Client Name *</label>
              <input
                type="text"
                value={newWallet.clientName}
                onChange={(e) => setNewWallet(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="e.g., John Doe"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Wallet Address *</label>
              <input
                type="text"
                value={newWallet.address}
                onChange={(e) => setNewWallet(prev => ({ ...prev, address: e.target.value }))}
                placeholder="0x... or Solana address"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Access Type</label>
              <select
                value={newWallet.accessType}
                onChange={(e) => setNewWallet(prev => ({ ...prev, accessType: e.target.value as any }))}
                style={styles.select}
              >
                <option value="view_only">View Only - Monitor portfolio only</option>
                <option value="managed">Managed - Portfolio management without private key</option>
                <option value="full_access">Full Access - Trading with private key (HIGH RISK)</option>
              </select>
            </div>

            {newWallet.accessType === 'full_access' && (
              <>
                <div style={styles.warning}>
                  <strong>⚠️ SECURITY WARNING:</strong> Storing private keys is extremely risky. 
                  Only use for trusted clients and ensure proper encryption. 
                  Consider using multi-signature wallets instead.
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Private Key (Optional but Required for Trading)</label>
                  <input
                    type="password"
                    value={newWallet.privateKey}
                    onChange={(e) => setNewWallet(prev => ({ ...prev, privateKey: e.target.value }))}
                    placeholder="Private key will be encrypted and stored securely"
                    style={styles.input}
                  />
                </div>
              </>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Notes (Optional)</label>
              <textarea
                value={newWallet.notes}
                onChange={(e) => setNewWallet(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this client or wallet..."
                style={styles.textarea}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  background: '#6b7280',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addWallet}
                style={styles.addButton}
              >
                ✅ Add Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 