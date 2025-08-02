import { useState, useEffect } from 'react';
import Head from 'next/head';
import { usePrivy } from '@privy-io/react-auth';

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
  const { login, logout, ready, authenticated, user } = usePrivy();

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    setIsLoading(true);
    
    try {
      // Sample portfolio data
      const sampleWallets: ClientWallet[] = [
        {
          id: '1',
          address: '0x1234...5678',
          clientName: 'DeFi Portfolio Alpha',
          totalValue: 125000,
          lastUpdated: new Date().toISOString(),
          status: 'active',
          positions: 8,
          protocols: ['Uniswap', 'Aave', 'Compound'],
          alerts: 0,
          performance24h: 2.5
        },
        {
          id: '2',
          address: '0x9876...4321',
          clientName: 'Yield Farming Pro',
          totalValue: 89000,
          lastUpdated: new Date().toISOString(),
          status: 'active',
          positions: 12,
          protocols: ['Curve', 'Convex', 'Yearn'],
          alerts: 1,
          performance24h: -0.8
        },
        {
          id: '3',
          address: '0xabcd...efgh',
          clientName: 'Multi-Chain Strategy',
          totalValue: 203000,
          lastUpdated: new Date().toISOString(),
          status: 'active',
          positions: 15,
          protocols: ['Raydium', 'Jupiter', 'Orca'],
          alerts: 0,
          performance24h: 4.2
        }
      ];
      
      setWallets(sampleWallets);
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticatedAction = (actionName: string, action: () => void) => {
    if (!ready) return;
    
    if (!authenticated) {
      const shouldRegister = confirm(`🔐 Account Required\n\nTo ${actionName.toLowerCase()}, please sign in with Privy.\n\n✅ Sign in to:\n   • Add your wallet addresses\n   • Track real positions\n   • Manage settings & alerts\n   • Invite collaborators\n   • Export your data\n\n❌ Cancel: Continue viewing demo\n\nSign in now?`);
      if (shouldRegister) {
        login();
      }
    } else {
      action();
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '1.2rem'
      }}>
        Loading portfolios...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Portfolio Management - LiquidFlow v3.0.{Date.now()}</title>
      </Head>
      
      {/* TIMESTAMP: {new Date().toISOString()} - Simple Portfolio Management */}
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '2rem 1rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header with Auth Status */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                color: '#1f2937',
                margin: 0
              }}>
                Portfolio Management
              </h1>
              
              {ready && (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {authenticated && user ? (
                    <>
                      <span style={{ color: '#059669', fontWeight: '600' }}>
                        ✅ {user.email?.address || user.wallet?.address?.slice(0, 6) + '...' + user.wallet?.address?.slice(-4)}
                      </span>
                      <button 
                        onClick={logout}
                        style={{
                          background: '#dc2626',
                          color: '#ffffff',
                          padding: '0.5rem 1rem',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        🚪 Sign Out
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={login}
                      style={{
                        background: '#3b82f6',
                        color: '#ffffff',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      🔑 Sign In
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1.1rem'
            }}>
              {authenticated ? 'Managing your DeFi portfolios and positions' : 'Overview of sample DeFi portfolios'}
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ 
            background: '#ffffff',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Quick Actions</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => handleAuthenticatedAction('Add New Wallet', () => {
                  const address = prompt('Enter wallet address to track:');
                  if (address) {
                    alert(`✅ Wallet ${address.slice(0,6)}...${address.slice(-4)} added to your portfolio!`);
                    // TODO: Add API call to save wallet to user's account
                  }
                })}
                style={{
                  background: '#3b82f6',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add New Wallet
              </button>
              <button 
                onClick={() => handleAuthenticatedAction('Generate Report', () => {
                  const reportType = confirm('Generate PDF report? OK = PDF, Cancel = CSV');
                  const format = reportType ? 'PDF' : 'CSV';
                  alert(`📊 ${format} report generated for ${user?.email?.address || user?.wallet?.address}! Check your downloads.`);
                  // TODO: Add API call to generate real report
                })}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Generate Report
              </button>
              <a href="/dashboard" style={{
                background: '#8b5cf6',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                View Dashboard
              </a>
            </div>
          </div>

          {/* Portfolios Table */}
          <div style={{ 
            background: '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>Active Portfolios ({wallets.length})</h2>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Portfolio</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Total Value</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>24h Change</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{wallet.clientName}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {wallet.address} • {wallet.positions} positions
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                          {wallet.protocols.join(', ')}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1f2937' }}>
                        ${wallet.totalValue.toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: wallet.status === 'active' ? '#dcfce7' : '#fef3c7',
                        color: wallet.status === 'active' ? '#166534' : '#92400e'
                      }}>
                        {wallet.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '1rem', 
                      textAlign: 'right',
                      fontWeight: '600',
                      color: wallet.performance24h >= 0 ? '#059669' : '#dc2626'
                    }}>
                      {wallet.performance24h >= 0 ? '+' : ''}{wallet.performance24h}%
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleAuthenticatedAction('Manage Portfolio', () => {
                          const action = confirm(`Manage ${wallet.clientName}?\n\nOK = View Details\nCancel = Edit Settings`);
                          if (action) {
                            alert(`📊 Portfolio Details for ${wallet.clientName}\n\n💰 Total Value: $${wallet.totalValue.toLocaleString()}\n🔗 Positions: ${wallet.positions}\n📈 24h: ${wallet.performance24h >= 0 ? '+' : ''}${wallet.performance24h}%\n🛠️ Protocols: ${wallet.protocols.join(', ')}\n\n👤 Owner: ${user?.email?.address || user?.wallet?.address}`);
                          } else {
                            alert(`⚙️ Settings for ${wallet.clientName}\n\n• Add/Remove positions\n• Set alerts\n• Configure notifications\n• Export data\n• Invite collaborators\n\n🔧 These features will be implemented in the full version.`);
                          }
                        })}
                        style={{
                          background: '#374151',
                          color: '#ffffff',
                          padding: '0.5rem 1rem',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
} 