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

// 🚀 NEW INTERFACES FOR ENHANCED EVM DATA
interface AnalyticsData {
  analytics: {
    ethBalance: number;
    totalTokens: number;
    verifiedTokens: number;
    possibleSpamTokens: number;
    totalNFTs: number;
    tokens: Array<{
      symbol: string;
      name: string;
      balance: number;
      verified: boolean;
      possibleSpam: boolean;
    }>;
  };
}

interface TransactionData {
  analytics: {
    totalTransactions: number;
    totalGasUsed: number;
    averageGasPrice: number;
    uniqueContracts: number;
    transactionTypes: {
      sent: number;
      received: number;
    };
  };
  recentTransactions: Array<{
    hash: string;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    gasPrice: string;
    timestamp: string;
    status: string;
  }>;
}

interface NFTData {
  analytics: {
    totalNFTs: number;
    totalCollections: number;
    verifiedCollections: number;
  };
  collections: Array<{
    name: string;
    symbol: string;
    itemCount: number;
    verified: boolean;
  }>;
}

export default function DashboardClean() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [defiData, setDefiData] = useState<DeFiData | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🚀 NEW STATE FOR ENHANCED EVM DATA
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [nftData, setNftData] = useState<NFTData | null>(null);

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
      const [portfolioRes, defiRes, analyticsRes, transactionsRes, nftRes, advancedDefiRes, liquidityRes, yieldRes] = await Promise.all([
        fetch(`/api/wallet/portfolio?address=${address}`),
        fetch(`/api/wallet/defi?address=${address}`),
        fetch(`/api/wallet/analytics?address=${address}`),
        fetch(`/api/wallet/transaction-analysis?address=${address}&days=30`),
        fetch(`/api/wallet/nft-collections?address=${address}`),
        fetch(`/api/defi/advanced-positions?address=${address}`),
        fetch(`/api/defi/liquidity-pools?address=${address}&protocol=uniswap-v3`),
        fetch(`/api/defi/yield-farming?address=${address}`)
      ]);

      if (portfolioRes.ok) {
        const portfolioData = await portfolioRes.json();
        setPortfolioData(portfolioData);
      }

      if (defiRes.ok) {
        const defiData = await defiRes.json();
        setDefiData(defiData);
      }

      // 🚀 STORE ENHANCED EVM DATA FOR DASHBOARD DISPLAY
      if (analyticsRes.ok) {
        const analyticsResult = await analyticsRes.json();
        setAnalyticsData(analyticsResult);
        console.log('📊 Enhanced Analytics:', analyticsResult);
      }

      if (transactionsRes.ok) {
        const transactionResult = await transactionsRes.json();
        setTransactionData(transactionResult);
        console.log('💳 Transaction Analysis:', transactionResult);
      }

      if (nftRes.ok) {
        const nftResult = await nftRes.json();
        setNftData(nftResult);
        console.log('🖼️ NFT Collections:', nftResult);
      }

      // 🏦 ADVANCED DEFI API DATA LOGGING
      if (advancedDefiRes.ok) {
        const advancedDefiResult = await advancedDefiRes.json();
        console.log('🏦 Advanced DeFi Positions:', advancedDefiResult);
      }

      if (liquidityRes.ok) {
        const liquidityResult = await liquidityRes.json();
        console.log('🌊 Liquidity Pool Positions:', liquidityResult);
      }

      if (yieldRes.ok) {
        const yieldResult = await yieldRes.json();
        console.log('🌾 Yield Farming & Lending:', yieldResult);
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
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

            {/* 🚀 ENHANCED STATS GRID - Live EVM Data Feed */}
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
                  {analyticsData?.analytics.ethBalance.toFixed(4) || portfolioData?.ethBalance.toFixed(4) || '0.0000'} ETH
                </div>
                <div style={styles.statLabel}>ETH Balance</div>
              </div>

              <div style={styles.statCard}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🪙</div>
                <div style={styles.statValue}>
                  {analyticsData?.analytics.totalTokens || portfolioData?.tokens.length || 0}
                </div>
                <div style={styles.statLabel}>
                  Token Holdings
                  {analyticsData?.analytics.verifiedTokens && (
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                      {analyticsData.analytics.verifiedTokens} verified
                    </div>
                  )}
                </div>
              </div>

              {/* 🆕 NEW STATS FROM ENHANCED EVM API */}
              <div style={styles.statCard}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
                <div style={styles.statValue}>
                  {nftData?.analytics.totalNFTs || 0}
                </div>
                <div style={styles.statLabel}>
                  NFT Collection
                  {nftData?.analytics.totalCollections && (
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                      {nftData.analytics.totalCollections} collections
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
                <div style={styles.statValue}>
                  {transactionData?.analytics.totalTransactions || 0}
                </div>
                <div style={styles.statLabel}>
                  Transactions (30d)
                  {transactionData?.analytics.averageGasPrice && (
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                      ~{transactionData.analytics.averageGasPrice} Gwei avg
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔗</div>
                <div style={styles.statValue}>
                  {transactionData?.analytics.uniqueContracts || 0}
                </div>
                <div style={styles.statLabel}>Unique Contracts</div>
              </div>
            </div>

            {/* Content Grid */}
            <div style={styles.contentGrid}>
              <div style={styles.contentCard}>
                <h3 style={styles.sectionTitle}>🪙 Enhanced Token Holdings</h3>
                {isLoading ? (
                  <div style={{ color: '#000000' }}>Loading tokens...</div>
                ) : analyticsData?.analytics.tokens.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analyticsData.analytics.tokens.slice(0, 8).map((token, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: token.verified ? '#f0fdf4' : (token.possibleSpam ? '#fef2f2' : '#f5f5f5'),
                        borderRadius: '0.5rem',
                        border: `1px solid ${token.verified ? '#22c55e' : (token.possibleSpam ? '#ef4444' : '#000000')}`
                      }}>
                        <div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#000000',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {token.symbol}
                            {token.verified && <span style={{ fontSize: '0.75rem', color: '#22c55e' }}>✓</span>}
                            {token.possibleSpam && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>⚠️</span>}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#000000' }}>{token.name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', color: '#000000' }}>
                            {token.balance.toFixed(4)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>
                            {token.verified ? 'Verified' : token.possibleSpam ? 'Possible Spam' : 'Unknown'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                <h3 style={styles.sectionTitle}>💳 Recent Transactions</h3>
                {isLoading ? (
                  <div style={{ color: '#000000' }}>Loading transaction data...</div>
                ) : transactionData?.recentTransactions.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {transactionData.recentTransactions.slice(0, 5).map((tx, i) => (
                      <div key={i} style={{
                        padding: '0.75rem',
                        background: tx.status === 'Success' ? '#f0fdf4' : '#fef2f2',
                        borderRadius: '0.5rem',
                        border: `1px solid ${tx.status === 'Success' ? '#22c55e' : '#ef4444'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                              {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#000000', fontWeight: 'bold' }}>
                              {tx.value}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                              {tx.gasPrice}
                            </div>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: tx.status === 'Success' ? '#22c55e' : '#ef4444',
                              fontWeight: 'bold'
                            }}>
                              {tx.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#000000' }}>No recent transactions found or still loading...</div>
                )}
              </div>

              {/* 🆕 NEW NFT COLLECTIONS SECTION */}
              <div style={styles.contentCard}>
                <h3 style={styles.sectionTitle}>🖼️ NFT Collections</h3>
                {isLoading ? (
                  <div style={{ color: '#000000' }}>Loading NFT data...</div>
                ) : nftData?.collections.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {nftData.collections.slice(0, 5).map((collection, i) => (
                      <div key={i} style={{
                        padding: '1rem',
                        background: collection.verified ? '#f0fdf4' : '#f5f5f5',
                        borderRadius: '0.5rem',
                        border: `1px solid ${collection.verified ? '#22c55e' : '#000000'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ color: '#000000', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {collection.name || collection.symbol}
                              {collection.verified && <span style={{ fontSize: '0.75rem', color: '#22c55e' }}>✓ Verified</span>}
                            </h4>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>
                              {collection.symbol}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', color: '#000000' }}>
                              {collection.itemCount} items
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#000000' }}>No NFT collections found or still loading...</div>
                )}
              </div>

              {/* DEFI POSITIONS - MOVED TO THIRD COLUMN */}
              <div style={styles.contentCard}>
                <h3 style={styles.sectionTitle}>🏦 DeFi Positions</h3>
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