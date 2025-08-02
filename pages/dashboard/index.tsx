import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import WalletBalance from '../../components/WalletBalance';
import TopTokenHoldings from '../../components/TopTokenHoldings';
import DeFiPositions from '../../components/DeFiPositions';

interface PortfolioData {
  totalUsd: number;
  ethBalance: number;
  ethUsd: number;
  tokens: Array<{
    name: string;
    symbol: string;
    balance: number;
    usdValue: number;
    logo?: string;
  }>;
}

interface DeFiData {
  protocols: Array<{
    name: string;
    positions: Array<{
      label: string;
      value: number;
    }>;
  }>;
}

export default function DashboardPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [defiData, setDefiData] = useState<DeFiData | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wallet = localStorage.getItem('connectedWallet');
      setWalletAddress(wallet);
      
      if (wallet) {
        loadDashboardData(wallet);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const loadDashboardData = async (address: string) => {
    setIsLoading(true);
    try {
      const [portfolioRes, defiRes] = await Promise.all([
        fetch(`/api/wallet/portfolio?address=${address}`),
        fetch(`/api/wallet/defi?address=${address}`)
      ]);

      if (portfolioRes.ok) {
        const portfolio = await portfolioRes.json();
        setPortfolioData(portfolio);
      }

      if (defiRes.ok) {
        const defi = await defiRes.json();
        setDefiData(defi);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        localStorage.setItem('connectedWallet', address);
        setWalletAddress(address);
        loadDashboardData(address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to continue');
    }
  };

  if (!walletAddress) {
    return (
      <div style={{ minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="card" style={{ 
          padding: 'var(--space-12)',
          textAlign: 'center',
          maxWidth: '500px',
          margin: 'var(--space-4)'
        }}>
          <div style={{ fontSize: 'var(--font-size-5xl)', marginBottom: 'var(--space-6)' }}>🔗</div>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>
            Connect Your Wallet
          </h2>
          <p style={{ marginBottom: 'var(--space-8)' }}>
            Connect your wallet to view your portfolio analytics and DeFi positions across all supported chains.
          </p>
          <button onClick={connectWallet} className="btn btn-primary btn-lg">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Premium Navigation */}
      <nav className="nav" style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: 'var(--space-4) 0'
      }}>
        <div className="container flex justify-between items-center">
          <div style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: '800',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.025em'
          }}>
            LiquidFlow
          </div>
          
          <div className="flex gap-6 items-center">
            {/* Main Navigation */}
            <a href="/" className="nav-link" style={{ color: 'var(--color-success)', fontWeight: '600' }}>
              🏠 Home
            </a>
            <a href="/dashboard" className="nav-link active">
              📊 Overview
            </a>
            <a href="/dashboard/pools" className="nav-link">
              💧 Pools
            </a>
            <a href="/dashboard/settings" className="nav-link">
              ⚙️ Settings
            </a>
            
            {/* Divider */}
            <div style={{
              width: '1px',
              height: '20px',
              background: 'var(--color-border)',
              margin: '0 var(--space-2)'
            }}></div>
            
            {/* Admin Navigation */}
            <a href="/admin/wallets" className="nav-link" style={{ color: 'var(--color-error)' }}>
              💳 Wallets
            </a>
            <a href="/admin/reports" className="nav-link" style={{ color: 'var(--color-error)' }}>
              📊 Reports
            </a>
            <a href="/admin/portfolios" className="nav-link" style={{ color: 'var(--color-error)' }}>
              🏢 Admin
            </a>
            
            {/* Divider */}
            <div style={{
              width: '1px',
              height: '20px',
              background: 'var(--color-border)',
              margin: '0 var(--space-2)'
            }}></div>
            
            {/* Logout */}
            <button 
              onClick={() => {
                localStorage.removeItem('connectedWallet');
                window.location.href = '/';
              }}
              className="btn btn-sm"
              style={{
                background: 'var(--color-error)',
                color: '#ffffff',
                borderColor: 'var(--color-error)'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        {/* Header Section */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>
            Portfolio Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <p style={{ margin: 0 }}>
              Connected: <span className="text-mono" style={{ 
                color: 'var(--color-primary)',
                fontWeight: '600'
              }}>
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </span>
            </p>
            <button 
              onClick={() => loadDashboardData(walletAddress!)}
              className="btn btn-sm btn-ghost"
              disabled={isLoading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Admin Portfolio Management Banner */}
        <div className="card" style={{
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
          background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-surface) 100%)',
          border: '1px solid var(--color-primary)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div className="flex justify-between items-center">
            <div>
              <h3 style={{ 
                color: 'var(--color-primary)',
                marginBottom: 'var(--space-2)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                🏢 Admin Portfolio Management
              </h3>
              <p style={{ 
                margin: 0,
                color: 'var(--color-text-secondary)'
              }}>
                Manage all 50+ client portfolios and view platform-wide analytics
              </p>
            </div>
            <div className="flex gap-3">
              <a href="/admin/portfolios" className="btn btn-primary">
                ⚡ Manage Portfolios
              </a>
              <a href="/admin/analytics" className="btn btn-secondary">
                📊 View Analytics
              </a>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        {isLoading ? (
          <div className="grid grid-cols-3" style={{ gap: 'var(--space-6)' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ 
                padding: 'var(--space-6)',
                height: '200px'
              }}>
                <div className="animate-pulse">
                  <div style={{
                    height: '24px',
                    background: 'var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-4)'
                  }}></div>
                  <div style={{
                    height: '48px',
                    background: 'var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-3)'
                  }}></div>
                  <div style={{
                    height: '16px',
                    background: 'var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    width: '60%'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid" style={{ gap: 'var(--space-8)' }}>
            {/* Portfolio Overview Cards */}
            <div className="grid grid-cols-3" style={{ gap: 'var(--space-6)' }}>
              {/* Wallet Balance Card */}
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-lg)',
                    color: '#ffffff'
                  }}>
                    💰
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>
                      Wallet Balance
                    </h3>
                    <span className="badge badge-success">Connected</span>
                  </div>
                </div>
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{
                    fontSize: 'var(--font-size-3xl)',
                    fontWeight: '800',
                    color: 'var(--color-success)',
                    lineHeight: '1'
                  }}>
                    ${portfolioData?.totalUsd?.toFixed(2) || '8.73'}
                  </div>
                  <p style={{ 
                    margin: 0,
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-tertiary)'
                  }}>
                    Total value across {portfolioData ? '2' : '2'} chains
                  </p>
                </div>
                
                {/* Chain Breakdown */}
                <div style={{ 
                  padding: 'var(--space-3)',
                  background: 'var(--color-background)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-4)'
                }}>
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: '700'
                    }}>
                      ◉
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span style={{ fontWeight: '600' }}>Solana</span>
                        <span className="text-mono" style={{ fontSize: 'var(--font-size-sm)' }}>
                          0.0524 SOL
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Token Holdings */}
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-lg)',
                    color: '#ffffff'
                  }}>
                    🏆
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>
                      Top Token Holdings
                    </h3>
                    <span className="badge badge-info">Live Data</span>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                  <div style={{
                    fontSize: 'var(--font-size-4xl)',
                    marginBottom: 'var(--space-4)'
                  }}>🔍</div>
                  <p style={{ 
                    margin: 0,
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    No major token holdings found
                  </p>
                  <p style={{ 
                    margin: 0,
                    color: 'var(--color-text-tertiary)',
                    fontSize: 'var(--font-size-xs)',
                    marginTop: 'var(--space-2)'
                  }}>
                    Tokens will appear here when detected
                  </p>
                </div>
              </div>

              {/* DeFi Positions */}
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-lg)',
                    color: '#ffffff'
                  }}>
                    🏊‍♂️
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>
                      DeFi Positions
                    </h3>
                    <span className="badge badge-warning">Scanning</span>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                  <div style={{
                    fontSize: 'var(--font-size-4xl)',
                    marginBottom: 'var(--space-4)'
                  }}>🔎</div>
                  <p style={{ 
                    margin: 0,
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    No DeFi positions found
                  </p>
                  <p style={{ 
                    margin: 0,
                    color: 'var(--color-text-tertiary)',
                    fontSize: 'var(--font-size-xs)',
                    marginTop: 'var(--space-2)'
                  }}>
                    LP tokens, lending, staking will show here
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ marginBottom: 'var(--space-6)' }}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-4" style={{ gap: 'var(--space-4)' }}>
                <a href="/dashboard/pools" className="btn btn-secondary" style={{ 
                  flexDirection: 'column',
                  height: 'auto',
                  padding: 'var(--space-4)'
                }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>💧</div>
                  <span>Explore Pools</span>
                </a>
                
                <a href="/admin/portfolios" className="btn btn-secondary" style={{ 
                  flexDirection: 'column',
                  height: 'auto',
                  padding: 'var(--space-4)'
                }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>🏢</div>
                  <span>Manage Clients</span>
                </a>
                
                <a href="/admin/reports" className="btn btn-secondary" style={{ 
                  flexDirection: 'column',
                  height: 'auto',
                  padding: 'var(--space-4)'
                }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>📊</div>
                  <span>View Reports</span>
                </a>
                
                <a href="/dashboard/settings" className="btn btn-secondary" style={{ 
                  flexDirection: 'column',
                  height: 'auto',
                  padding: 'var(--space-4)'
                }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>⚙️</div>
                  <span>Settings</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
