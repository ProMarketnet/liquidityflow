import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { usePrivy } from '@privy-io/react-auth';

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

interface PoolData {
  id: string;
  clientName: string;
  address: string;
  protocol: string;
  pair: string;
  totalValue: number;
  change24h: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  pairAddress: string;
}

export default function PortfoliosPage() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [pools, setPools] = useState<PoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadPoolsFromWallets();
    }
  }, []);

  const loadPoolsFromWallets = async () => {
    setIsLoading(true);
    try {
      // Load wallets from localStorage (same source as Wallet Management)
      const savedWallets = localStorage.getItem('managedWallets');
      let wallets: ManagedWallet[] = [];

      console.log('🔍 Debug: Raw localStorage data:', savedWallets);

      if (savedWallets) {
        wallets = JSON.parse(savedWallets);
      }

      console.log(`🔍 Debug: Parsed ${wallets.length} wallets:`, wallets.map(w => ({ name: w.clientName, address: w.address })));

      if (wallets.length === 0) {
        console.warn('⚠️ No wallets found in localStorage');
        setPools([]);
        return;
      }

      console.log(`🔍 Fetching real pool data for ${wallets.length} wallets via Moralis API`);

      // Call our new API endpoint to get real Moralis data
      const response = await fetch('/api/admin/wallet-pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallets: wallets.map(wallet => ({
            address: wallet.address,
            clientName: wallet.clientName
          }))
        })
      });

      console.log(`🔍 Debug: API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errorText);
        throw new Error(`API returned ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`🔍 Debug: API response data:`, data);

      if (data.success && Array.isArray(data.pools)) {
        console.log(`✅ Received ${data.pools.length} real pools from Moralis API`);
        console.log(`🔍 Debug: Pool details:`, data.pools);
        setPools(data.pools);
      } else {
        console.warn('⚠️ API returned no pools, falling back to placeholder data');
        console.log('🔍 Debug: Fallback reason - data:', data);
        // Fallback to generate basic placeholder data if no real pools found
        const fallbackPools: PoolData[] = wallets.map((wallet, index) => ({
          id: wallet.id,
          clientName: wallet.clientName,
          address: wallet.address,
          protocol: 'No DeFi Positions Found',
          pair: 'Try Refresh or Check Wallet',
          totalValue: wallet.totalValue || 0,
          change24h: 0,
          status: 'WARNING' as const,
          pairAddress: wallet.address
        }));
        console.log('🔍 Debug: Setting fallback pools:', fallbackPools);
        setPools(fallbackPools);
      }

    } catch (error) {
      console.error('❌ Error loading real pool data:', error);
      
      // Fallback to localStorage wallets on error
      const savedWallets = localStorage.getItem('managedWallets');
      if (savedWallets) {
        const wallets: ManagedWallet[] = JSON.parse(savedWallets);
        const fallbackPools: PoolData[] = wallets.map((wallet, index) => ({
          id: wallet.id,
          clientName: wallet.clientName,
          address: wallet.address,
          protocol: 'API Error - Check Console',
          pair: `Error: ${error instanceof Error ? error.message.substring(0, 30) : 'Unknown'}`,
          totalValue: wallet.totalValue || 0,
          change24h: 0,
          status: 'CRITICAL' as const,
          pairAddress: wallet.address
        }));
        console.log('🔍 Debug: Setting error fallback pools:', fallbackPools);
        setPools(fallbackPools);
      } else {
        setPools([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticatedAction = (actionName: string, action: () => void) => {
    if (!authenticated) {
      const shouldLogin = confirm(
        `To ${actionName.toLowerCase()}, you need to create an account.\n\n` +
        `Benefits of registering:\n` +
        `• Add unlimited wallet addresses\n` +
        `• Generate detailed reports\n` +
        `• Invite team members\n` +
        `• Save your analysis\n\n` +
        `Would you like to create an account now?`
      );
      
      if (shouldLogin) {
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
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
              Active Pairs / Pools
            </h1>
            <p style={{ color: '#6b7280' }}>
              Manage and monitor liquidity pools from tracked wallet addresses
            </p>
          </div>

          {/* Quick Access Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <a href="/admin/wallets" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', transition: 'all 0.2s', cursor: 'pointer' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💳</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>Wallet Management</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Add, remove, and manage all client wallets with different access levels</p>
              </div>
            </a>
            <a href="/admin/reports" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', transition: 'all 0.2s', cursor: 'pointer' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>Trading Reports</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Generate comprehensive P&L, transfer tracking, and wallet balance reports</p>
              </div>
            </a>
            <a href="/admin/analytics" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', transition: 'all 0.2s', cursor: 'pointer' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>Platform Analytics</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>View comprehensive platform analytics and performance metrics</p>
              </div>
            </a>
            <a href="/dashboard/pools" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', transition: 'all 0.2s', cursor: 'pointer' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>Pool Lookup</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Look up any DEX pair on any DeFi protocol across all chains</p>
              </div>
            </a>
          </div>

          {/* Active Pairs/Pools Table */}
          <div style={{ background: '#ffffff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#1f2937' }}>💧 Active Pairs / Pools</h2>
                <button
                  onClick={loadPoolsFromWallets}
                  disabled={isLoading}
                  style={{
                    background: isLoading ? '#9ca3af' : '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isLoading ? '🔄 Loading Moralis Data...' : '🔄 Refresh Pool Data'}
                </button>
              </div>
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
                  {pools.map((pool) => (
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

          {/* Loading State */}
          {isLoading && (
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '0.5rem', 
              padding: '3rem', 
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              marginTop: '2rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1f2937' }}>
                Loading Real Pool Data...
              </h3>
              <p style={{ color: '#6b7280' }}>
                Fetching DeFi positions from Moralis API across all supported chains
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && pools.length === 0 && (
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '0.5rem', 
              padding: '3rem', 
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              marginTop: '2rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💧</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1f2937' }}>
                No Active Pools Found
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Add wallet addresses in Wallet Management to see their DeFi positions
              </p>
              <a 
                href="/admin/wallets"
                style={{
                  background: '#3b82f6',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: '600',
                  display: 'inline-block'
                }}
              >
                + Add Wallets
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 