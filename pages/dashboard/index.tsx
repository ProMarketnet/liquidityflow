import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';

// Get wallet address from localStorage if available
function getConnectedWallet() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('connectedWallet') || null;
  }
  return null;
}

export default function DashboardPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [defiData, setDefiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const wallet = getConnectedWallet();
    setWalletAddress(wallet);
    
    if (wallet) {
      loadWalletData(wallet);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadWalletData = async (address: string) => {
    setIsLoading(true);
    try {
      // Load portfolio data
      const portfolioRes = await fetch(`/api/wallet/portfolio?address=${address}`);
      if (portfolioRes.ok) {
        const portfolio = await portfolioRes.json();
        setPortfolioData(portfolio);
      }

      // Load DeFi data
      const defiRes = await fetch(`/api/wallet/defi?address=${address}`);
      if (defiRes.ok) {
        const defi = await defiRes.json();
        setDefiData(defi);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If no wallet connected, show connection prompt
  if (!walletAddress) {
    return (
      <Layout title="Dashboard" showSidebar={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">Connect your wallet to view your liquidity dashboard</p>
            <a
              href="/onboarding-new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Get Started
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" showSidebar={true}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.5rem' }}>Dashboard</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
          <button
            onClick={() => loadWalletData(walletAddress)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
            disabled={isLoading}
          >
            {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem',
                padding: '1.5rem'
              }}>
                <div style={{ height: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}></div>
                <div style={{ height: '1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}></div>
                <div style={{ height: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <>
                         {/* Portfolio Stats */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
               <div style={{
                 background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
                 border: '1px solid rgba(34, 197, 94, 0.3)',
                 borderRadius: '1rem',
                 padding: '1.5rem'
               }}>
                 <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                 <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.25rem' }}>
                   ${portfolioData?.totalUsdValue?.toFixed(2) || '0.00'}
                 </div>
                 <div style={{ color: '#4ade80', fontSize: '0.875rem' }}>Portfolio Value</div>
               </div>
               
               <div style={{
                 background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                 border: '1px solid rgba(59, 130, 246, 0.3)',
                 borderRadius: '1rem',
                 padding: '1.5rem'
               }}>
                 <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                 <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.25rem' }}>
                   {portfolioData?.ethBalance?.toFixed(4) || '0.0000'} ETH
                 </div>
                 <div style={{ color: '#60a5fa', fontSize: '0.875rem' }}>ETH Balance</div>
               </div>
               
               <div style={{
                 background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%)',
                 border: '1px solid rgba(147, 51, 234, 0.3)',
                 borderRadius: '1rem',
                 padding: '1.5rem'
               }}>
                 <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🪙</div>
                 <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.25rem' }}>
                   {portfolioData?.tokens?.length || 0}
                 </div>
                 <div style={{ color: '#a855f7', fontSize: '0.875rem' }}>Token Holdings</div>
               </div>
               
               <div style={{
                 background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)',
                 border: '1px solid rgba(249, 115, 22, 0.3)',
                 borderRadius: '1rem',
                 padding: '1.5rem'
               }}>
                 <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏛️</div>
                 <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.25rem' }}>
                   {defiData?.protocolCount || 0}
                 </div>
                 <div style={{ color: '#fb923c', fontSize: '0.875rem' }}>DeFi Protocols</div>
               </div>
             </div>

                         {/* Portfolio Overview */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
               {/* Token Holdings */}
               <div style={{
                 backgroundColor: 'rgba(255, 255, 255, 0.05)',
                 border: '1px solid rgba(255, 255, 255, 0.1)',
                 borderRadius: '1rem',
                 padding: '1.5rem'
               }}>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>Top Token Holdings</h3>
                <div className="space-y-3">
                  {portfolioData?.tokens?.slice(0, 5).map((token: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {token.logo && (
                          <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
                        )}
                        <div>
                          <div className="text-white font-medium">{token.symbol}</div>
                          <div className="text-gray-400 text-sm">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          ${token.usdValue?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {parseFloat(token.balance).toFixed(4)} {token.symbol}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-2">🔍</div>
                      <p>No tokens found or still loading...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* DeFi Positions */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">DeFi Positions</h3>
                <div className="space-y-3">
                  {defiData?.protocols?.slice(0, 5).map((protocol: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{protocol.protocol_name}</div>
                        <div className="text-gray-400 text-sm">{protocol.position_type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          ${protocol.usd_value?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {protocol.tokens?.length || 0} tokens
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-2">🏛️</div>
                      <p>No DeFi positions found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/dashboard/pools"
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg transition-all"
                >
                  🏊 View Liquidity Pools
                </a>
                <a
                  href="/dashboard/alerts"
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg text-white font-medium hover:shadow-lg transition-all"
                >
                  🔔 Manage Alerts
                </a>
                <a
                  href="/dashboard/settings"
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:shadow-lg transition-all"
                >
                  ⚙️ Settings
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
