import React, { useState, useEffect } from 'react';

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

export default function AppV2() {
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

  // All styles inline - ZERO external files
  const styles = {
    body: {
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #581c87 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: '#ffffff'
    },
    nav: {
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1rem 0',
      position: 'sticky' as const,
      top: 0,
      zIndex: 1000
    },
    navContainer: {
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
      background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    navLinks: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center'
    },
    navLink: {
      color: '#cbd5e1',
      textDecoration: 'none',
      fontSize: '0.9rem',
      transition: 'color 0.2s'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '0.5rem',
      margin: 0
    },
    subtitle: {
      color: '#cbd5e1',
      fontSize: '1rem',
      margin: '0.5rem 0'
    },
    button: {
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      color: '#ffffff',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      fontWeight: '500',
      cursor: 'pointer',
      fontSize: '0.9rem',
      marginTop: '0.5rem',
      transition: 'transform 0.2s'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '1rem',
      padding: '1.5rem',
      backdropFilter: 'blur(10px)'
    },
    statCardGreen: {
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(255, 255, 255, 0.05))',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderLeft: '4px solid #10b981',
      borderRadius: '1rem',
      padding: '1.5rem'
    },
    statCardBlue: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(255, 255, 255, 0.05))',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderLeft: '4px solid #3b82f6',
      borderRadius: '1rem',
      padding: '1.5rem'
    },
    statCardPurple: {
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(255, 255, 255, 0.05))',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderLeft: '4px solid #8b5cf6',
      borderRadius: '1rem',
      padding: '1.5rem'
    },
    statIcon: {
      fontSize: '2rem',
      marginBottom: '0.5rem'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '1rem',
      padding: '1.5rem',
      backdropFilter: 'blur(10px)'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '1rem'
    },
    tokenList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem'
    },
    tokenItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '0.5rem'
    },
    tokenName: {
      color: '#ffffff',
      fontWeight: '500'
    },
    tokenBalance: {
      color: '#cbd5e1',
      fontSize: '0.875rem'
    },
    tokenValue: {
      color: '#10b981',
      fontWeight: '500'
    },
    connectCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '1rem',
      padding: '3rem',
      textAlign: 'center' as const,
      maxWidth: '500px',
      margin: '0 auto',
      marginTop: '5rem'
    },
    connectIcon: {
      fontSize: '4rem',
      marginBottom: '1rem'
    },
    connectTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '1rem'
    },
    connectDesc: {
      color: '#cbd5e1',
      marginBottom: '2rem',
      lineHeight: '1.6'
    },
    connectButton: {
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      color: '#ffffff',
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'transform 0.2s'
    },
    quickActions: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '1rem',
      padding: '1.5rem'
    },
    actionButtons: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap' as const
    },
    actionButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '0.9rem',
      transition: 'transform 0.2s'
    },
    actionButtonBlue: {
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      color: '#ffffff'
    },
    actionButtonOrange: {
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: '#ffffff'
    },
    actionButtonGray: {
      background: 'linear-gradient(135deg, #6b7280, #4b5563)',
      color: '#ffffff'
    }
  };

  if (!walletAddress) {
    return (
      <div style={styles.body}>
        <div style={styles.connectCard}>
          <div style={styles.connectIcon}>🔗</div>
          <h2 style={styles.connectTitle}>Connect Your Wallet</h2>
          <p style={styles.connectDesc}>
            Connect your wallet to view your dashboard and portfolio data
          </p>
          <button
            onClick={connectWallet}
            style={styles.connectButton}
            onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.body}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>LiquidFlow</div>
          <div style={styles.navLinks}>
            <a href="/app-v2" style={styles.navLink}>📊 Overview</a>
            <a href="/dashboard/pools" style={styles.navLink}>💧 Liquidity Pools</a>
            <a href="/dashboard/alerts" style={styles.navLink}>🚨 Alerts</a>
            <a href="/dashboard/settings" style={styles.navLink}>⚙️ Settings</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <button
            onClick={() => loadDashboardData(walletAddress)}
            style={styles.button}
            disabled={isLoading}
            onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
          >
            {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCardGreen}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statValue}>
              ${portfolioData?.totalUsd.toFixed(2) || '0.00'}
            </div>
            <div style={{...styles.statLabel, color: '#10b981'}}>Portfolio Value</div>
          </div>

          <div style={styles.statCardBlue}>
            <div style={styles.statIcon}>⚡</div>
            <div style={styles.statValue}>
              {portfolioData?.ethBalance.toFixed(4) || '0.0000'} ETH
            </div>
            <div style={{...styles.statLabel, color: '#3b82f6'}}>ETH Balance</div>
          </div>

          <div style={styles.statCardPurple}>
            <div style={styles.statIcon}>🪙</div>
            <div style={styles.statValue}>
              {portfolioData?.tokens.length || 0}
            </div>
            <div style={{...styles.statLabel, color: '#8b5cf6'}}>Token Holdings</div>
          </div>
        </div>

        {/* Content Sections */}
        <div style={styles.contentGrid}>
          {/* Top Token Holdings */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Top Token Holdings</h3>
            {isLoading ? (
              <div style={{color: '#cbd5e1'}}>Loading tokens...</div>
            ) : portfolioData?.tokens.length ? (
              <div style={styles.tokenList}>
                {portfolioData.tokens.slice(0, 5).map((token, i) => (
                  <div key={i} style={styles.tokenItem}>
                    <div>
                      <div style={styles.tokenName}>{token.symbol}</div>
                      <div style={styles.tokenBalance}>{token.balance.toFixed(4)}</div>
                    </div>
                    <div style={styles.tokenValue}>
                      ${token.usdValue.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{color: '#cbd5e1'}}>No tokens found or still loading...</div>
            )}
          </div>

          {/* DeFi Positions */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>DeFi Positions</h3>
            {isLoading ? (
              <div style={{color: '#cbd5e1'}}>Loading DeFi data...</div>
            ) : defiData?.protocols.length ? (
              <div style={styles.tokenList}>
                {defiData.protocols.slice(0, 5).map((protocol, i) => (
                  <div key={i} style={styles.tokenItem}>
                    <div>
                      <div style={styles.tokenName}>{protocol.name}</div>
                      {protocol.positions.map((position, j) => (
                        <div key={j} style={{...styles.tokenBalance, display: 'flex', justifyContent: 'space-between'}}>
                          <span>{position.label}</span>
                          <span>${position.value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{color: '#cbd5e1'}}>No DeFi positions found</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <h3 style={styles.cardTitle}>Quick Actions</h3>
          <div style={styles.actionButtons}>
            <a
              href="/dashboard/pools"
              style={{...styles.actionButton, ...styles.actionButtonBlue}}
              onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
            >
              🏊 View Liquidity Pools
            </a>
            <a
              href="/dashboard/alerts"
              style={{...styles.actionButton, ...styles.actionButtonOrange}}
              onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
            >
              🔔 Manage Alerts
            </a>
            <a
              href="/dashboard/settings"
              style={{...styles.actionButton, ...styles.actionButtonGray}}
              onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
            >
              ⚙️ Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 