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
        <title>Portfolio Overview - LiquidFlow</title>
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '2rem 1rem'
      }}>
        {/* Professional Navigation - STICKY */}
        <nav style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#ffffff',
          borderBottom: '2px solid #e5e7eb',
          padding: '1rem 0',
          marginBottom: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
              🏢 LiquidFlow Admin
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <a href="/admin/portfolios" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>🏠 Home</a>
              <a href="/admin/wallets" style={{ color: '#6b7280', fontWeight: '600', textDecoration: 'none' }}>💳 Manage Wallets</a>
              <a href="/admin/reports" style={{ color: '#6b7280', fontWeight: '600', textDecoration: 'none' }}>📊 Trading Reports</a>
              <a href="/admin/analytics" style={{ color: '#6b7280', fontWeight: '600', textDecoration: 'none' }}>📈 Analytics</a>
              <a href="/dashboard" style={{ color: '#6b7280', fontWeight: '600', textDecoration: 'none' }}>🖥️ Dashboard</a>
              <a href="/dashboard/pools" style={{ color: '#6b7280', fontWeight: '600', textDecoration: 'none' }}>🔍 Pool Lookup</a>
              
              {ready && (
                <>
                  {authenticated && user ? (
                    <>
                      <span style={{ color: '#059669', fontWeight: '600', fontSize: '0.9rem' }}>
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
                        🚪 Logout
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={login}
                      style={{
                        background: '#3b82f6',
                        color: '#ffffff',
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      🔑 Sign In
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              Active Pairs / Pools
            </h1>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1.1rem'
            }}>
              Manage and monitor liquidity pools from tracked wallet addresses
            </p>
          </div>

          {/* Quick Access Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <a href="/admin/wallets" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: '#ffffff',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '2px solid #f3f4f6',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
                <h3 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Wallet Management</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Add, remove, and manage all client wallets with different access levels</p>
              </div>
            </a>

            <a href="/admin/reports" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: '#ffffff',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '2px solid #f3f4f6',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <h3 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Trading Reports</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Generate comprehensive P&L, transfer tracking, and wallet balance reports</p>
              </div>
            </a>

            <a href="/admin/analytics" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: '#ffffff',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '2px solid #f3f4f6',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
                <h3 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Platform Analytics</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>View comprehensive platform analytics and performance metrics</p>
              </div>
            </a>

            <a href="/dashboard/pools" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: '#ffffff',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '2px solid #f3f4f6',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                <h3 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Pool Lookup</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Look up any DEX pair on any DeFi protocol across all chains</p>
              </div>
            </a>
          </div>

          {/* Active Pairs/Pools Table */}
          <div style={{ background: '#ffffff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#1f2937' }}>💧 Active Pairs / Pools</h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Wallet/Address
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Protocol
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Pair/Pool
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Value
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      24h Change
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Status
                    </th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: '1',
                      clientName: 'Alice Johnson',
                      address: '0x742d35Cc6e4C2eA4C59d7c8Dc0cd7d6e5e0f4F3a',
                      protocol: 'Uniswap V3',
                      pair: 'ETH/USDC',
                      totalValue: 94312.66,
                      change24h: 2.3,
                      status: 'HEALTHY' as const,
                      pairAddress: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'
                    },
                    {
                      id: '2', 
                      clientName: 'Bob Chen',
                      address: '0x8ba1f109551bD432803012645Hac136c86745d3B',
                      protocol: 'Raydium',
                      pair: 'SOL/USDC',
                      totalValue: 67890.12,
                      change24h: -1.8,
                      status: 'WARNING' as const,
                      pairAddress: 'HWHvQhFmJB6r7tTiYNwMdL7PjmQMGdP3R1jFhd8Q2K3w'
                    },
                    {
                      id: '3',
                      clientName: 'Corporate Treasury',
                      address: '0x463D7E7cE1d8A52FDBD5C3B0bcB6B7e8a32b72b6',
                      protocol: 'Aave V3',
                      pair: 'WBTC/ETH',
                      totalValue: 125000.00,
                      change24h: 4.2,
                      status: 'HEALTHY' as const,
                      pairAddress: '0x4585FE77225b41b697C938B018E2Ac67Ac5a20c0'
                    }
                  ].map((pool) => (
                    <tr key={pool.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1f2937' }}>{pool.clientName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                            {pool.address.substring(0, 6)}...{pool.address.substring(pool.address.length - 4)}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          background: '#dbeafe', 
                          color: '#1e40af', 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: '600' 
                        }}>
                          {pool.protocol}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{pool.pair}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                          {pool.pairAddress.substring(0, 6)}...{pool.pairAddress.substring(pool.pairAddress.length - 4)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: '#059669' }}>
                          ${pool.totalValue.toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ 
                          color: pool.change24h >= 0 ? '#059669' : '#dc2626', 
                          fontWeight: '600' 
                        }}>
                          {pool.change24h >= 0 ? '+' : ''}{pool.change24h}%
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ 
                          background: pool.status === 'HEALTHY' ? '#dcfce7' : pool.status === 'WARNING' ? '#fef3c7' : '#fee2e2',
                          color: pool.status === 'HEALTHY' ? '#166534' : pool.status === 'WARNING' ? '#92400e' : '#991b1b',
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: '600' 
                        }}>
                          {pool.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <a
                            href={`/dashboard/pools?address=${pool.address}&search=true`}
                            style={{
                              background: '#3b82f6',
                              color: '#ffffff',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.375rem',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              display: 'inline-block'
                            }}
                          >
                            🔍 Analyze Pools
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 