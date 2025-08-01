import React, { useState, useEffect } from 'react';
import Head from 'next/head';

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

export default function DashboardClean() {
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
      // 🚀 ENHANCED EVM DATA LOADING - Using comprehensive Moralis Web3 Data API
      const [portfolioRes, defiRes, analyticsRes, transactionsRes, nftRes] = await Promise.all([
        fetch(`/api/wallet/portfolio?address=${address}`),
        fetch(`/api/wallet/defi?address=${address}`),
        fetch(`/api/wallet/analytics?address=${address}`),
        fetch(`/api/wallet/transaction-analysis?address=${address}&days=30`),
        fetch(`/api/wallet/nft-collections?address=${address}`)
      ]);

      if (portfolioRes.ok) {
        const portfolioData = await portfolioRes.json();
        setPortfolioData(portfolioData);
      }

      if (defiRes.ok) {
        const defiData = await defiRes.json();
        setDefiData(defiData);
      }

      // Store additional analytics for enhanced dashboard
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        console.log('📊 Enhanced Analytics:', analyticsData);
      }

      if (transactionsRes.ok) {
        const transactionData = await transactionsRes.json();
        console.log('💳 Transaction Analysis:', transactionData);
      }

      if (nftRes.ok) {
        const nftData = await nftRes.json();
        console.log('🖼️ NFT Collections:', nftData);
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

  // 🚨 EMERGENCY STYLES - INLINE ONLY FOR MAXIMUM VISIBILITY
  const styles = {
    page: {
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#000000',
      margin: 0,
      padding: 0
    },
    nav: {
      background: '#ffffff',
      borderBottom: '2px solid #000000',
      padding: '1rem 0'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#000000'
    },
    navLinks: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center'
    },
    navLink: {
      color: '#000000',
      textDecoration: 'none',
      fontWeight: '500'
    },
    content: {
      padding: '2rem 1rem'
    },
    connectCard: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '3rem',
      textAlign: 'center' as const,
      maxWidth: '500px',
      margin: '4rem auto'
    },
    connectButton: {
      background: '#000000',
      color: '#ffffff',
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '1rem'
    },
    subtitle: {
      color: '#000000',
      marginBottom: '2rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '1.5rem'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '0.5rem'
    },
    statLabel: {
      color: '#000000',
      fontWeight: '500'
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.5rem'
    },
    contentCard: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '1rem'
    }
  };

  if (!walletAddress) {
    return (
      <>
        <Head>
          <title>Dashboard - LiquidFlow</title>
          <meta name="description" content="Your DeFi dashboard" />
        </Head>
        
        <div style={styles.page}>
          <nav style={styles.nav}>
            <div style={styles.container}>
              <div style={styles.logo}>LiquidFlow</div>
              <div style={styles.navLinks}>
                <a href="/" style={styles.navLink}>Home</a>
                <a href="/dashboard" style={styles.navLink}>Dashboard</a>
              </div>
            </div>
          </nav>

          <div style={styles.connectCard}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔗</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000000', marginBottom: '1rem' }}>
              Connect Your Wallet
            </h2>
            <p style={{ color: '#000000', marginBottom: '2rem' }}>
              Connect your wallet to view your dashboard and portfolio data
            </p>
            <button onClick={connectWallet} style={styles.connectButton}>
              Connect Wallet
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - LiquidFlow</title>
        <meta name="description" content="Your DeFi dashboard" />
      </Head>
      
      <div style={styles.page}>
        <nav style={styles.nav}>
          <div style={styles.container}>
            <div style={styles.logo}>LiquidFlow</div>
            <div style={styles.navLinks}>
              <a href="/" style={styles.navLink}>Home</a>
              <a href="/dashboard" style={styles.navLink}>📊 Overview</a>
              <a href="/dashboard/pools" style={styles.navLink}>💧 Pools</a>
              <a href="/dashboard/alerts" style={styles.navLink}>🚨 Alerts</a>
              <a href="/dashboard/settings" style={styles.navLink}>⚙️ Settings</a>
            </div>
          </div>
        </nav>

        <div style={styles.content}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={styles.title}>Dashboard</h1>
              <p style={styles.subtitle}>
                Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
              <button
                onClick={() => loadDashboardData(walletAddress)}
                style={styles.connectButton}
                disabled={isLoading}
              >
                {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                <div style={styles.statValue}>
                  ${portfolioData?.totalUsd.toFixed(2) || '0.00'}
                </div>
                <div style={styles.statLabel}>Portfolio Value</div>
              </div>

              <div style={styles.statCard}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                <div style={styles.statValue}>
                  {portfolioData?.ethBalance.toFixed(4) || '0.0000'} ETH
                </div>
                <div style={styles.statLabel}>ETH Balance</div>
              </div>

              <div style={styles.statCard}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🪙</div>
                <div style={styles.statValue}>
                  {portfolioData?.tokens.length || 0}
                </div>
                <div style={styles.statLabel}>Token Holdings</div>
              </div>
            </div>

            {/* Content Grid */}
            <div style={styles.contentGrid}>
              <div style={styles.contentCard}>
                <h3 style={styles.sectionTitle}>Top Token Holdings</h3>
                {isLoading ? (
                  <div style={{ color: '#000000' }}>Loading tokens...</div>
                ) : portfolioData?.tokens.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {portfolioData.tokens.slice(0, 5).map((token, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: '#f5f5f5',
                        borderRadius: '0.5rem',
                        border: '1px solid #000000'
                      }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#000000' }}>{token.symbol}</div>
                          <div style={{ fontSize: '0.875rem', color: '#000000' }}>{token.name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', color: '#000000' }}>
                            ${token.usdValue.toFixed(2)}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#000000' }}>
                            {token.balance.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#000000' }}>No tokens found or still loading...</div>
                )}
              </div>

              <div style={styles.contentCard}>
                <h3 style={styles.sectionTitle}>DeFi Positions</h3>
                {isLoading ? (
                  <div style={{ color: '#000000' }}>Loading DeFi data...</div>
                ) : defiData?.protocols.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {defiData.protocols.map((protocol, i) => (
                      <div key={i} style={{
                        padding: '1rem',
                        background: '#f5f5f5',
                        borderRadius: '0.5rem',
                        border: '1px solid #000000'
                      }}>
                        <h4 style={{ color: '#000000', marginBottom: '0.5rem' }}>{protocol.name}</h4>
                        {protocol.positions.map((position, j) => (
                          <div key={j} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.875rem',
                            color: '#000000'
                          }}>
                            <span>{position.label}</span>
                            <span>${position.value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#000000' }}>No DeFi positions found or still loading...</div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: '2rem' }}>
              <h3 style={styles.sectionTitle}>Quick Actions</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a
                  href="/dashboard/pools"
                  style={{
                    ...styles.connectButton,
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  🌊 View Liquidity Pools
                </a>
                <a
                  href="/dashboard/alerts"
                  style={{
                    ...styles.connectButton,
                    background: '#f59e0b',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  ⚠️ Manage Alerts
                </a>
                <a
                  href="/dashboard/settings"
                  style={{
                    ...styles.connectButton,
                    background: '#6b7280',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  ⚙️ Settings
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 