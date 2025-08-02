import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
  poolAddress?: string;
  walletAddress?: string;
  protocol?: string;
  value?: number;
  change?: number;
}

interface DeFiPosition {
  protocol: string;
  position_type: string;
  total_usd_value: number;
  apr?: number;
  apy?: number;
  health_factor?: number;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [defiPositions, setDefiPositions] = useState<DeFiPosition[]>([]);

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
      maxWidth: '1200px',
      margin: '0 auto'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '1rem'
    },
    subtitle: {
      color: '#666666',
      marginBottom: '2rem'
    },
    nav: {
      background: '#ffffff',
      borderBottom: '2px solid #000000',
      padding: '1rem 0',
      marginBottom: '2rem'
    },
    navContainer: {
      maxWidth: '1200px',
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
    alertCard: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1rem'
    },
    alertCritical: {
      borderColor: '#ef4444',
      background: '#fef2f2'
    },
    alertWarning: {
      borderColor: '#f59e0b',
      background: '#fffbeb'
    },
    alertInfo: {
      borderColor: '#3b82f6',
      background: '#eff6ff'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    summaryCard: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '1.5rem'
    },
    loadingCard: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '3rem',
      textAlign: 'center' as const
    }
  };

  useEffect(() => {
    // Get connected wallet
    if (typeof window !== 'undefined') {
      const wallet = localStorage.getItem('connectedWallet');
      setWalletAddress(wallet);
      if (wallet) {
        loadAlertsAndPositions(wallet);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const loadAlertsAndPositions = async (address: string) => {
    setIsLoading(true);
    try {
      // 🚨 Load DeFi positions for intelligent monitoring using Moralis API
      const [defiRes, advancedRes, yieldRes] = await Promise.all([
        fetch(`/api/wallet/defi?address=${address}`),
        fetch(`/api/defi/advanced-positions?address=${address}`),
        fetch(`/api/defi/yield-farming?address=${address}`)
      ]);

      let positions: DeFiPosition[] = [];
      let generatedAlerts: Alert[] = [];

      // Process DeFi positions
      if (defiRes.ok) {
        const defiData = await defiRes.json();
        console.log('🏦 DeFi Data for Alerts:', defiData);
      }

      if (advancedRes.ok) {
        const advancedData = await advancedRes.json();
        console.log('🔍 Advanced Positions for Monitoring:', advancedData);
        
        // Extract positions for monitoring
        if (advancedData.activeProtocols) {
          advancedData.activeProtocols.forEach((protocol: any) => {
            protocol.positions.forEach((pos: any) => {
              positions.push({
                protocol: protocol.name,
                position_type: pos.type,
                total_usd_value: pos.value,
                apr: pos.apr
              });
            });
          });
        }
      }

      if (yieldRes.ok) {
        const yieldData = await yieldRes.json();
        console.log('🌾 Yield Data for Monitoring:', yieldData);
        
        // Check lending health factor for alerts
        if (yieldData.lending && yieldData.lending.healthFactor && yieldData.lending.healthFactor < 1.5) {
          generatedAlerts.push({
            id: `health-${Date.now()}`,
            type: 'critical',
            title: '🚨 Low Health Factor Warning',
            description: `Your lending health factor is ${yieldData.lending.healthFactor.toFixed(2)}. Consider adding collateral to avoid liquidation.`,
            time: new Date().toLocaleString(),
            protocol: 'Lending Protocols',
            value: yieldData.lending.healthFactor
          });
        }

        // Check for high staking rewards
        if (yieldData.yieldFarming && yieldData.yieldFarming.totalRewards > 100) {
          generatedAlerts.push({
            id: `rewards-${Date.now()}`,
            type: 'info',
            title: '💰 Unclaimed Rewards Available',
            description: `You have $${yieldData.yieldFarming.totalRewards.toFixed(2)} in unclaimed staking rewards across protocols.`,
            time: new Date().toLocaleString(),
            protocol: 'Yield Farming',
            value: yieldData.yieldFarming.totalRewards
          });
        }
      }

      // Generate position-based alerts
      positions.forEach((position) => {
        // Alert for high APR opportunities
        if (position.apr && position.apr > 20) {
          generatedAlerts.push({
            id: `apr-${position.protocol}-${Date.now()}`,
            type: 'info',
            title: '📈 High APR Opportunity',
            description: `${position.protocol} offers ${position.apr.toFixed(1)}% APR on your ${position.position_type} position.`,
            time: new Date().toLocaleString(),
            protocol: position.protocol,
            value: position.total_usd_value
          });
        }

        // Alert for large positions (monitoring)
        if (position.total_usd_value > 10000) {
          generatedAlerts.push({
            id: `large-${position.protocol}-${Date.now()}`,
            type: 'warning',
            title: '👀 Large Position Monitoring',
            description: `Monitoring your $${position.total_usd_value.toFixed(2)} position in ${position.protocol} for significant changes.`,
            time: new Date().toLocaleString(),
            protocol: position.protocol,
            value: position.total_usd_value
          });
        }
      });

      setDefiPositions(positions);
      setAlerts(generatedAlerts);

    } catch (error) {
      console.error('Error loading alerts and positions:', error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getAlertStyle = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return styles.alertCritical;
      case 'warning': return styles.alertWarning;
      case 'info': return styles.alertInfo;
      default: return styles.alertCard;
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        localStorage.setItem('connectedWallet', address);
        setWalletAddress(address);
        loadAlertsAndPositions(address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to continue');
    }
  };

  if (!walletAddress) {
    return (
      <>
        <Head>
          <title>Alerts & Monitoring - LiquidFlow</title>
          <meta name="description" content="Monitor your DeFi positions and receive alerts" />
        </Head>
        
        <div style={styles.page}>
          <nav style={styles.nav}>
            <div style={styles.navContainer}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000' }}>LiquidFlow</div>
                                         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <a href="/admin/portfolios" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>🏠 Home</a>
                <a href="/dashboard" style={styles.navLink}>← Back to Dashboard</a>
                <button 
                  onClick={() => {
                    localStorage.removeItem('connectedWallet');
                    localStorage.removeItem('walletType');
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
                  🚪 Disconnect Wallet
                </button>
              </div>
            </div>
          </nav>

          <div style={styles.connectCard}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚨</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000000', marginBottom: '1rem' }}>
              Connect Your Wallet
            </h2>
            <p style={{ color: '#000000', marginBottom: '2rem' }}>
              Connect your wallet to view alerts and monitoring
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
        <title>Alerts & Monitoring - LiquidFlow</title>
        <meta name="description" content="Monitor your DeFi positions and receive alerts" />
      </Head>
      
      <div style={styles.page}>
        <nav style={styles.nav}>
          <div style={styles.navContainer}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000' }}>LiquidFlow</div>
                         <div>
               <a href="/admin/portfolios" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>🏠 Home</a>
               <a href="/dashboard" style={styles.navLink}>← Back to My Wallet</a>
               <a href="/dashboard/pools" style={styles.navLink}>Pools</a>
               <a href="/dashboard/settings" style={styles.navLink}>Settings</a>
             </div>
          </div>
        </nav>

        <div style={styles.container}>
          <h1 style={styles.title}>🚨 Alerts & Monitoring</h1>
          <p style={styles.subtitle}>
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          
          {/* Multi-Chain Wallet Research */}
          <div style={{
            background: 'rgba(0,0,0,0.05)',
            border: '2px solid #e5e7eb',
            borderRadius: '1rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ color: '#000000', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold' }}>
              🌐 Multi-Chain DeFi Intelligence
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                placeholder="Research any wallet: 0x... or Solana address"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#000000'
                }}
                id="researchWalletInput"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('researchWalletInput') as HTMLInputElement;
                  const address = input.value.trim();
                  if (address) {
                    const isEVMAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
                    const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
                    
                    if (isEVMAddress || isSolanaAddress) {
                      window.location.href = `/dashboard/pools?address=${address}`;
                    } else {
                      alert('Invalid wallet address format. Please enter a valid Ethereum (0x...) or Solana address.');
                    }
                  }
                }}
                style={{
                  background: '#3b82f6',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                🔍 Research
              </button>
            </div>
            <p style={{ color: '#666666', fontSize: '0.75rem', margin: 0 }}>
              🕵️ <strong>DeFi Intelligence:</strong> Analyze any wallet's positions across Ethereum, Arbitrum, Base, Optimism & Solana • Perfect for competitor research, whale watching, and client due diligence
            </p>
          </div>
          
          <button
            onClick={() => walletAddress && loadAlertsAndPositions(walletAddress)}
            style={styles.connectButton}
            disabled={isLoading}
          >
            {isLoading ? '🔄 Loading...' : '🔄 Refresh Monitoring'}
          </button>

          {/* Monitoring Summary */}
          <div style={styles.grid}>
            <div style={styles.summaryCard}>
              <h3 style={{ color: '#000000', marginBottom: '1rem' }}>🔍 Active Monitors</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000000' }}>
                {defiPositions.length}
              </div>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>DeFi positions monitored</p>
            </div>

            <div style={styles.summaryCard}>
              <h3 style={{ color: '#000000', marginBottom: '1rem' }}>🚨 Total Alerts</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000000' }}>
                {alerts.length}
              </div>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Active notifications</p>
            </div>

            <div style={styles.summaryCard}>
              <h3 style={{ color: '#000000', marginBottom: '1rem' }}>💰 Total Monitored</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000000' }}>
                ${defiPositions.reduce((sum, pos) => sum + pos.total_usd_value, 0).toFixed(2)}
              </div>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Portfolio value under monitoring</p>
            </div>
          </div>

          {isLoading && (
            <div style={styles.loadingCard}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <h3 style={{ color: '#000000' }}>Analyzing DeFi Positions...</h3>
              <p style={{ color: '#666' }}>Scanning 16+ protocols for monitoring opportunities</p>
            </div>
          )}

          {!isLoading && alerts.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000', marginBottom: '1rem' }}>
                📋 Active Alerts
              </h2>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{ ...styles.alertCard, ...getAlertStyle(alert.type) }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ fontSize: '2rem' }}>{getAlertIcon(alert.type)}</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#000000', marginBottom: '0.5rem' }}>
                          {alert.title}
                        </h3>
                        <p style={{ color: '#000000', marginBottom: '0.5rem' }}>{alert.description}</p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#666' }}>
                          <span>{alert.time}</span>
                          {alert.protocol && <span>Protocol: {alert.protocol}</span>}
                          {alert.value && <span>Value: ${alert.value.toFixed(2)}</span>}
                        </div>
                      </div>
                    </div>
                    <button style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#666' }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && alerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔕</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000000', marginBottom: '1rem' }}>
                No Alerts Yet
              </h2>
              <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                Your wallet monitoring is active using live Moralis DeFi API data. Alerts will appear here when there are important 
                changes to your positions, health factors, or high-yield opportunities.
              </p>
              
              <div style={styles.summaryCard}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000000', marginBottom: '1rem' }}>
                  🎯 Intelligent Monitoring Features
                </h3>
                <div style={{ textAlign: 'left', color: '#000000', marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>🚨 <strong>Health Factor Alerts:</strong> Get warned when lending positions approach liquidation</div>
                  <div style={{ marginBottom: '0.5rem' }}>💰 <strong>Reward Tracking:</strong> Notifications for unclaimed staking rewards</div>
                  <div style={{ marginBottom: '0.5rem' }}>📈 <strong>High APR Alerts:</strong> Discover positions offering 20%+ yields</div>
                  <div style={{ marginBottom: '0.5rem' }}>👀 <strong>Large Position Monitoring:</strong> Track significant portfolio changes</div>
                  <div style={{ marginBottom: '0.5rem' }}>🔍 <strong>Multi-Protocol Scanning:</strong> Monitor across 16+ DeFi protocols</div>
                </div>
                <a
                  href="/dashboard/settings"
                  style={{
                    ...styles.connectButton,
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  Configure Alert Settings
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
