import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';

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
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b, #581c87)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔗</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
            Connect Your Wallet
          </h2>
          <p style={{ color: '#cbd5e1', marginBottom: '2rem' }}>
            Connect your wallet to view your dashboard and portfolio data
          </p>
          <button
            onClick={connectWallet}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e1b4b, #581c87)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            LiquidFlow
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none' }}>📊 Overview</a>
            <a href="/dashboard/pools" style={{ color: '#cbd5e1', textDecoration: 'none' }}>💧 Liquidity Pools</a>
            <a href="/dashboard/alerts" style={{ color: '#cbd5e1', textDecoration: 'none' }}>🚨 Alerts & Monitoring</a>
            <a href="/dashboard/settings" style={{ color: '#cbd5e1', textDecoration: 'none' }}>⚙️ Settings</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
              Dashboard
            </h1>
            <p style={{ color: '#cbd5e1' }}>
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <button
              onClick={() => loadDashboardData(walletAddress)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '0.5rem'
              }}
              disabled={isLoading}
            >
              {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Portfolio Value */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(255,255,255,0.05))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderLeft: '4px solid #10b981',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                ${portfolioData?.totalUsd.toFixed(2) || '0.00'}
              </div>
              <div style={{ color: '#10b981' }}>Portfolio Value</div>
            </div>

            {/* ETH Balance */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(255,255,255,0.05))',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderLeft: '4px solid #3b82f6',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                {portfolioData?.ethBalance.toFixed(4) || '0.0000'} ETH
              </div>
              <div style={{ color: '#3b82f6' }}>ETH Balance</div>
            </div>

            {/* Token Holdings */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(255,255,255,0.05))',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderLeft: '4px solid #8b5cf6',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🪙</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                {portfolioData?.tokens.length || 0}
              </div>
              <div style={{ color: '#8b5cf6' }}>Token Holdings</div>
            </div>
          </div>

          {/* Content Sections */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Top Token Holdings */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
                Top Token Holdings
              </h3>
              {isLoading ? (
                <div style={{ color: '#cbd5e1' }}>Loading tokens...</div>
              ) : portfolioData?.tokens.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {portfolioData.tokens.slice(0, 5).map((token, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '0.5rem'
                    }}>
                      <div>
                        <div style={{ color: 'white', fontWeight: '500' }}>{token.symbol}</div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>{token.balance.toFixed(4)}</div>
                      </div>
                      <div style={{ color: '#10b981', fontWeight: '500' }}>
                        ${token.usdValue.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#cbd5e1' }}>No tokens found or still loading...</div>
              )}
            </div>

            {/* DeFi Positions */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
                DeFi Positions
              </h3>
              {isLoading ? (
                <div style={{ color: '#cbd5e1' }}>Loading DeFi data...</div>
              ) : defiData?.protocols.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {defiData.protocols.slice(0, 5).map((protocol, i) => (
                    <div key={i} style={{
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '0.5rem'
                    }}>
                      <div style={{ color: 'white', fontWeight: '500', marginBottom: '0.5rem' }}>
                        {protocol.name}
                      </div>
                      {protocol.positions.map((position, j) => (
                        <div key={j} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          color: '#cbd5e1',
                          fontSize: '0.875rem'
                        }}>
                          <span>{position.label}</span>
                          <span>${position.value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#cbd5e1' }}>No DeFi positions found</div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            marginTop: '2rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href="/dashboard/pools"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                🏊 View Liquidity Pools
              </a>
              <a
                href="/dashboard/alerts"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                🔔 Manage Alerts
              </a>
              <a
                href="/dashboard/settings"
                style={{
                  background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                ⚙️ Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
