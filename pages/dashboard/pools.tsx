import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// 🏊‍♂️ INTERFACES FOR DEFI POSITIONS DATA
interface DeFiPositionSummary {
  total_usd_value: number;
  active_protocols: Array<{
    protocol_name: string;
    protocol_id: string;
    total_usd_value: number;
    relative_portfolio_percentage: number;
  }>;
}

interface ProtocolPosition {
  position_type: string;
  position_id: string;
  position_token_data: any[];
  total_usd_value: number;
  apr?: number;
  apy?: number;
  rewards?: any;
}

interface LiquidityPoolsData {
  summary: DeFiPositionSummary | null;
  protocolPositions: { [protocol: string]: ProtocolPosition[] };
  isLoading: boolean;
  error: string | null;
}

const Pools = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [poolsData, setPoolsData] = useState<LiquidityPoolsData>({
    summary: null,
    protocolPositions: {},
    isLoading: true,
    error: null
  });

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
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    summaryCard: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '1.5rem'
    },
    protocolGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.5rem'
    },
    protocolCard: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '1.5rem'
    },
    positionCard: {
      background: '#f5f5f5',
      border: '1px solid #000000',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1rem'
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
    if (typeof window !== 'undefined') {
      const wallet = localStorage.getItem('connectedWallet');
      setWalletAddress(wallet);
      
      if (wallet) {
        loadDeFiPositions(wallet);
      } else {
        setPoolsData(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, []);

  const loadDeFiPositions = async (address: string) => {
    setPoolsData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // 🏊‍♂️ Load DeFi Positions Summary and Protocol-Specific Data
      const [summaryRes, advancedRes, liquidityRes, yieldRes] = await Promise.all([
        fetch(`/api/wallet/defi?address=${address}`),
        fetch(`/api/defi/advanced-positions?address=${address}`),
        fetch(`/api/defi/liquidity-pools?address=${address}`),
        fetch(`/api/defi/yield-farming?address=${address}`)
      ]);

      let summary = null;
      let protocolPositions: { [protocol: string]: ProtocolPosition[] } = {};

      if (summaryRes.ok) {
        summary = await summaryRes.json();
      }

      if (advancedRes.ok) {
        const advancedData = await advancedRes.json();
        // Process advanced positions into protocol groups
        if (advancedData.activeProtocols) {
          advancedData.activeProtocols.forEach((protocol: any) => {
            protocolPositions[protocol.name] = protocol.positions || [];
          });
        }
      }

      if (liquidityRes.ok) {
        const liquidityData = await liquidityRes.json();
        console.log('🌊 Liquidity Data:', liquidityData);
        
        // Add liquidity pool data
        if (liquidityData.primary && liquidityData.primary.positions.length > 0) {
          protocolPositions['Liquidity Pools'] = liquidityData.primary.positions.map((pos: any) => ({
            position_type: 'liquidity_pool',
            position_id: pos.pool,
            position_token_data: pos.tokens,
            total_usd_value: pos.liquidity,
            apr: pos.apr
          }));
        }
      }

      if (yieldRes.ok) {
        const yieldData = await yieldRes.json();
        console.log('🌾 Yield Data:', yieldData);
        
        // Add yield farming data
        if (yieldData.yieldFarming && yieldData.yieldFarming.positions.length > 0) {
          protocolPositions['Yield Farming'] = yieldData.yieldFarming.positions.map((pos: any) => ({
            position_type: pos.type,
            position_id: pos.protocol,
            position_token_data: pos.tokens,
            total_usd_value: pos.value,
            apy: pos.apy,
            rewards: pos.rewards
          }));
        }

        // Add lending positions
        if (yieldData.lending && yieldData.lending.lendingPositions.length > 0) {
          protocolPositions['Lending'] = yieldData.lending.lendingPositions.map((pos: any) => ({
            position_type: 'lending',
            position_id: pos.protocol,
            position_token_data: [{ symbol: pos.asset }],
            total_usd_value: pos.value,
            apr: pos.apr
          }));
        }
      }

      setPoolsData({
        summary,
        protocolPositions,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Error loading DeFi positions:', error);
      setPoolsData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load DeFi positions'
      }));
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        localStorage.setItem('connectedWallet', address);
        setWalletAddress(address);
        loadDeFiPositions(address);
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
          <title>DeFi Pools & Positions - LiquidFlow</title>
          <meta name="description" content="View your DeFi positions and liquidity pools" />
        </Head>
        
        <div style={styles.page}>
          <nav style={styles.nav}>
            <div style={styles.navContainer}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000' }}>LiquidFlow</div>
              <div>
                <a href="/" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>🏠 Home</a>
                <a href="/dashboard" style={styles.navLink}>← Back to Dashboard</a>
              </div>
            </div>
          </nav>

          <div style={styles.connectCard}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏊‍♂️</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000000', marginBottom: '1rem' }}>
              Connect Your Wallet
            </h2>
            <p style={{ color: '#000000', marginBottom: '2rem' }}>
              Connect your wallet to view your DeFi positions and liquidity pools
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
        <title>DeFi Pools & Positions - LiquidFlow</title>
        <meta name="description" content="View your DeFi positions and liquidity pools" />
      </Head>
      
      <div style={styles.page}>
        <nav style={styles.nav}>
          <div style={styles.navContainer}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000' }}>LiquidFlow</div>
            <div>
              <a href="/" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>🏠 Home</a>
              <a href="/dashboard" style={styles.navLink}>← Back to Dashboard</a>
              <a href="/dashboard/alerts" style={styles.navLink}>Alerts</a>
              <a href="/dashboard/settings" style={styles.navLink}>Settings</a>
            </div>
          </div>
        </nav>

        <div style={styles.container}>
          <h1 style={styles.title}>🏊‍♂️ DeFi Pools & Positions</h1>
          <p style={styles.subtitle}>
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <button
            onClick={() => loadDeFiPositions(walletAddress)}
            style={styles.connectButton}
            disabled={poolsData.isLoading}
          >
            {poolsData.isLoading ? '🔄 Loading...' : '🔄 Refresh Positions'}
          </button>

          {poolsData.isLoading && (
            <div style={styles.loadingCard}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <h3 style={{ color: '#000000' }}>Loading DeFi Positions...</h3>
              <p style={{ color: '#666' }}>Fetching data from 16+ protocols</p>
            </div>
          )}

          {poolsData.error && (
            <div style={{ ...styles.summaryCard, borderColor: '#ef4444', background: '#fef2f2' }}>
              <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>Error Loading Data</h3>
              <p style={{ color: '#000000' }}>{poolsData.error}</p>
            </div>
          )}

          {!poolsData.isLoading && !poolsData.error && (
            <>
              {/* DeFi Summary */}
              {poolsData.summary && (
                <div style={styles.summaryGrid}>
                  <div style={styles.summaryCard}>
                    <h3 style={{ color: '#000000', marginBottom: '1rem' }}>💰 Total DeFi Value</h3>
                                         <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000000' }}>
                       ${Object.values(poolsData.protocolPositions).reduce((sum: number, positions: ProtocolPosition[]) => 
                         sum + positions.reduce((s: number, pos: ProtocolPosition) => s + (pos.total_usd_value || 0), 0), 0
                       ).toFixed(2)}
                     </div>
                  </div>

                  <div style={styles.summaryCard}>
                    <h3 style={{ color: '#000000', marginBottom: '1rem' }}>🔗 Active Protocols</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000000' }}>
                      {Object.keys(poolsData.protocolPositions).length}
                    </div>
                  </div>

                  <div style={styles.summaryCard}>
                    <h3 style={{ color: '#000000', marginBottom: '1rem' }}>📊 Total Positions</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000000' }}>
                      {Object.values(poolsData.protocolPositions).reduce((sum, positions) => sum + positions.length, 0)}
                    </div>
                  </div>
                </div>
              )}

              {/* Protocol Positions */}
              <div style={styles.protocolGrid}>
                {Object.entries(poolsData.protocolPositions).map(([protocol, positions]) => (
                  <div key={protocol} style={styles.protocolCard}>
                    <h3 style={{ color: '#000000', marginBottom: '1rem', fontSize: '1.5rem' }}>
                      🏦 {protocol}
                    </h3>
                    
                    {positions.length > 0 ? (
                      <div>
                        {positions.map((position, index) => (
                          <div key={index} style={styles.positionCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 'bold', color: '#000000' }}>
                                  {position.position_type.replace('_', ' ').toUpperCase()}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                  {position.position_token_data?.map((token: any) => token.symbol).join(', ') || 'Multiple Assets'}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', color: '#000000' }}>
                                  ${position.total_usd_value?.toFixed(2) || '0.00'}
                                </div>
                                {(position.apr || position.apy) && (
                                  <div style={{ fontSize: '0.875rem', color: '#22c55e' }}>
                                    {(position.apr || position.apy)?.toFixed(2)}% APR
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#666', fontStyle: 'italic' }}>
                        No positions found in this protocol
                      </div>
                    )}
                  </div>
                ))}

                {Object.keys(poolsData.protocolPositions).length === 0 && !poolsData.isLoading && (
                  <div style={styles.protocolCard}>
                    <h3 style={{ color: '#000000', marginBottom: '1rem' }}>📭 No DeFi Positions Found</h3>
                    <p style={{ color: '#666' }}>
                      This wallet doesn't have any active DeFi positions across the supported protocols.
                    </p>
                    <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                      <strong>Supported Protocols:</strong><br />
                      Uniswap, Aave, Compound, Curve, Yearn, Lido, SushiSwap, Balancer, Convex, and more...
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Pools;
