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
  rawData?: any; // Added for detailed display
}

interface LiquidityPoolsData {
  summary: DeFiPositionSummary | null;
  protocolPositions: { [protocol: string]: ProtocolPosition[] };
  isLoading: boolean;
  error: string | null;
}

const Pools = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [poolsData, setPoolsData] = useState<LiquidityPoolsData>({
    summary: null,
    protocolPositions: {},
    isLoading: false,
    error: null
  });
  const [searchAddress, setSearchAddress] = useState<string>('');

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
    },
    searchSection: {
      background: 'rgba(0,0,0,0.05)',
      border: '2px solid #e5e7eb',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    analyzeButton: {
      background: '#3b82f6',
      color: '#ffffff',
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem'
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wallet = localStorage.getItem('connectedWallet');
      setWalletAddress(wallet);
      
      // Don't auto-load data anymore - this is now a pair lookup tool
      setPoolsData(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loadDeFiPositions = async (address: string) => {
    setPoolsData(prev => ({ ...prev, isLoading: true, error: null }));
    setHasSearched(true);
    
    try {
      console.log('🔍 Loading data for address:', address);
      
      // Step 1: Try DexScreener-based token pools API first (no API key needed)
      console.log('🔎 Trying DexScreener token pools search...');
      let dexScreenerResponse = await fetch(`/api/pools/dex-screener-all-pools?address=${address}`);
      
      if (dexScreenerResponse.ok) {
        const dexScreenerData = await dexScreenerResponse.json();
        
        if (dexScreenerData.success && dexScreenerData.allPools && dexScreenerData.allPools.length > 0) {
          console.log(`✅ DexScreener found ${dexScreenerData.allPools.length} pools across ${dexScreenerData.summary.chainsFound.length} chains`);
          
          // Process multiple pools data
          const protocolPositions: { [protocol: string]: ProtocolPosition[] } = {};
          let totalValue = 0;
          
          dexScreenerData.allPools.forEach((pool: any) => {
            const protocolName = `${pool.dex} (${pool.chain})`;
            
            if (!protocolPositions[protocolName]) {
              protocolPositions[protocolName] = [];
            }
            
            const poolValue = parseFloat(pool.liquidity || '0');
            totalValue += poolValue;
            
            protocolPositions[protocolName].push({
              position_type: 'liquidity_pool',
              position_id: pool.pairAddress || pool.address,
              position_token_data: [
                { symbol: pool.baseToken?.symbol || 'TOKEN0' },
                { symbol: pool.pairedToken?.symbol || pool.quoteToken?.symbol || 'TOKEN1' }
              ],
              total_usd_value: poolValue,
              apr: pool.apr || pool.apy,
              rawData: pool
            });
          });
          
          // Create summary
          const activeProtocols = Object.entries(protocolPositions).map(([name, positions]) => {
            const protocolValue = positions.reduce((sum, pos) => sum + (pos.total_usd_value || 0), 0);
            return {
              protocol_name: name,
              protocol_id: name.toLowerCase().replace(/\s+/g, '-'),
              total_usd_value: protocolValue,
              relative_portfolio_percentage: totalValue > 0 ? (protocolValue / totalValue) * 100 : 0
            };
          });
          
          setPoolsData({
            summary: {
              total_usd_value: totalValue,
              active_protocols: activeProtocols
            },
            protocolPositions,
            isLoading: false,
            error: null
          });
          
          return;
        }
      }
      
      // Step 2: Try specific pair lookup (for pool/pair addresses)
      console.log('🔄 Trying as specific pair address...');
      const isEVMAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
      const chain = isEVMAddress ? 'eth' : 'solana';
      
      let pairResponse = await fetch(`/api/pools/pair-info?address=${address}&chain=${chain}`);
      let data;
      
      if (pairResponse.ok) {
        data = await pairResponse.json();
        console.log('📊 Pair data received:', data);
        
        // Check if this is pair/pool data and process it
        if (data.pairInfo || data.poolInfo || data.pair || data.pool) {
          console.log('🏊‍♂️ Processing specific pair/pool data...');
          
          const pairData = data.pairInfo || data.poolInfo || data.pair || data.pool || data;
          const protocol = pairData.dex || pairData.protocol || 'Unknown DEX';
          const pairChain = pairData.chain || (address.startsWith('0x') ? 'Ethereum' : 'Solana');
          
          const protocolName = `${protocol} (${pairChain})`;
          const protocolPositions: { [protocol: string]: ProtocolPosition[] } = {};
          
          protocolPositions[protocolName] = [{
            position_type: 'liquidity_pool',
            position_id: address,
            position_token_data: [
              { symbol: pairData.token0?.symbol || pairData.baseToken?.symbol || 'TOKEN0' },
              { symbol: pairData.token1?.symbol || pairData.quoteToken?.symbol || 'TOKEN1' }
            ],
            total_usd_value: parseFloat(pairData.liquidity || pairData.liquidityUSD || pairData.tvl || '0'),
            apr: pairData.apr || pairData.apy,
            rawData: pairData
          }];
          
          const totalValue = parseFloat(pairData.liquidity || pairData.liquidityUSD || pairData.tvl || '0');
          
          setPoolsData({
            summary: {
              total_usd_value: totalValue,
              active_protocols: [{
                protocol_name: protocolName,
                protocol_id: protocol.toLowerCase(),
                total_usd_value: totalValue,
                relative_portfolio_percentage: 100
              }]
            },
            protocolPositions,
            isLoading: false,
            error: null
          });
          
          return;
        }
      }
      
      // Step 3: Try comprehensive token pools API (requires Moralis)
      console.log('🔄 Trying Moralis token pools search...');
      let tokenPoolsResponse = await fetch(`/api/pools/token-pools?address=${address}`);
      
      if (tokenPoolsResponse.ok) {
        const tokenPoolsData = await tokenPoolsResponse.json();
        
        if (tokenPoolsData.success && tokenPoolsData.allPools && tokenPoolsData.allPools.length > 0) {
          console.log(`✅ Moralis found ${tokenPoolsData.allPools.length} pools across ${tokenPoolsData.summary.chainsFound.length} chains`);
          
          // Process multiple pools data (same logic as above)
          const protocolPositions: { [protocol: string]: ProtocolPosition[] } = {};
          let totalValue = 0;
          
          tokenPoolsData.allPools.forEach((pool: any) => {
            const protocolName = `${pool.dex} (${pool.chain})`;
            
            if (!protocolPositions[protocolName]) {
              protocolPositions[protocolName] = [];
            }
            
            const poolValue = parseFloat(pool.liquidity || '0');
            totalValue += poolValue;
            
            protocolPositions[protocolName].push({
              position_type: 'liquidity_pool',
              position_id: pool.pairAddress || pool.address,
              position_token_data: [
                { symbol: pool.baseToken?.symbol || 'TOKEN0' },
                { symbol: pool.pairedToken?.symbol || pool.quoteToken?.symbol || 'TOKEN1' }
              ],
              total_usd_value: poolValue,
              apr: pool.apr || pool.apy,
              rawData: pool
            });
          });
          
          // Create summary
          const activeProtocols = Object.entries(protocolPositions).map(([name, positions]) => {
            const protocolValue = positions.reduce((sum, pos) => sum + (pos.total_usd_value || 0), 0);
            return {
              protocol_name: name,
              protocol_id: name.toLowerCase().replace(/\s+/g, '-'),
              total_usd_value: protocolValue,
              relative_portfolio_percentage: totalValue > 0 ? (protocolValue / totalValue) * 100 : 0
            };
          });
          
          setPoolsData({
            summary: {
              total_usd_value: totalValue,
              active_protocols: activeProtocols
            },
            protocolPositions,
            isLoading: false,
            error: null
          });
          
          return;
        }
      }
      
      // Step 3: Final fallback to wallet DeFi positions
      console.log('🔄 Trying as wallet address...');
      const walletResponse = await fetch(`/api/wallet/defi?address=${address}`);
      
      if (!walletResponse.ok) {
        throw new Error(`No data found for address ${address}`);
      }
      
      data = await walletResponse.json();
      console.log('📊 Wallet data received:', data);
      
      // Process the data based on type
      const protocolPositions: { [protocol: string]: ProtocolPosition[] } = {};
      
      // Check if this is pair/pool data
      if (data.pairInfo || data.poolInfo || data.pair || data.pool) {
        console.log('🏊‍♂️ Processing pair/pool data...');
        
        const pairData = data.pairInfo || data.poolInfo || data.pair || data.pool || data;
        const protocol = pairData.dex || pairData.protocol || 'Unknown DEX';
        const chain = pairData.chain || (address.startsWith('0x') ? 'Ethereum' : 'Solana');
        
        const protocolName = `${protocol} (${chain})`;
        protocolPositions[protocolName] = [{
          position_type: 'liquidity_pool',
          position_id: address,
          position_token_data: [
            { symbol: pairData.token0?.symbol || pairData.baseToken?.symbol || 'TOKEN0' },
            { symbol: pairData.token1?.symbol || pairData.quoteToken?.symbol || 'TOKEN1' }
          ],
          total_usd_value: parseFloat(pairData.liquidity || pairData.liquidityUSD || pairData.tvl || '0'),
          apr: pairData.apr || pairData.apy,
          rawData: pairData
        }];
        
        setPoolsData({
          summary: {
            total_usd_value: parseFloat(pairData.liquidity || pairData.liquidityUSD || pairData.tvl || '0'),
            active_protocols: [{
              protocol_name: protocolName,
              protocol_id: protocol.toLowerCase(),
              total_usd_value: parseFloat(pairData.liquidity || pairData.liquidityUSD || pairData.tvl || '0'),
              relative_portfolio_percentage: 100
            }]
          },
          protocolPositions,
          isLoading: false,
          error: null
        });
        
        return;
      }
      
      // Process as wallet DeFi positions (existing logic)
      if (data.positions && Array.isArray(data.positions)) {
        data.positions.forEach((pos: any) => {
          const protocolName = `${pos.protocol} (${pos.chain})`;
          
          if (!protocolPositions[protocolName]) {
            protocolPositions[protocolName] = [];
          }
          
          protocolPositions[protocolName].push({
            position_type: 'defi_position',
            position_id: `${pos.protocol}_${pos.chain}`,
            position_token_data: [],
            total_usd_value: 0,
            apr: undefined,
            apy: undefined,
            rewards: undefined,
            rawData: pos.data
          });
        });
      }
      
      if (data.protocolBreakdown && Object.keys(data.protocolBreakdown).length > 0) {
        Object.entries(data.protocolBreakdown).forEach(([protocolChain, protocolData]: [string, any]) => {
          const [protocol, chain] = protocolChain.split('_');
          const displayName = `${protocol.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (${chain.charAt(0).toUpperCase() + chain.slice(1)})`;
          
          if (!protocolPositions[displayName]) {
            protocolPositions[displayName] = [];
          }
          
          if (Array.isArray(protocolData)) {
            protocolData.forEach((position: any, index: number) => {
              protocolPositions[displayName].push({
                position_type: position.position_type || 'liquidity_pool',
                position_id: position.position_id || `${protocol}_${index}`,
                position_token_data: position.tokens || position.position_token_data || [],
                total_usd_value: parseFloat(position.total_usd_value || position.value || position.usd_value || '0'),
                apr: position.apr,
                apy: position.apy,
                rewards: position.rewards,
                rawData: position
              });
            });
          } else if (protocolData && typeof protocolData === 'object') {
            if (protocolData.positions && Array.isArray(protocolData.positions)) {
              protocolData.positions.forEach((position: any, index: number) => {
                protocolPositions[displayName].push({
                  position_type: position.position_type || 'defi_position',
                  position_id: position.position_id || `${protocol}_${index}`,
                  position_token_data: position.tokens || position.position_token_data || [],
                  total_usd_value: parseFloat(position.total_usd_value || position.value || position.usd_value || '0'),
                  apr: position.apr,
                  apy: position.apy,
                  rewards: position.rewards,
                  rawData: position
                });
              });
            } else {
              protocolPositions[displayName].push({
                position_type: 'defi_position',
                position_id: protocolChain,
                position_token_data: [],
                total_usd_value: parseFloat(protocolData.total_usd_value || protocolData.value || '0'),
                apr: protocolData.apr,
                apy: protocolData.apy,
                rewards: protocolData.rewards,
                rawData: protocolData
              });
            }
          }
        });
      }
      
      console.log('🏊‍♂️ Processed protocol positions:', Object.keys(protocolPositions));

      setPoolsData({
        summary: {
          total_usd_value: data.totalValue || 0,
          active_protocols: Object.keys(protocolPositions).map(name => ({
            protocol_name: name,
            protocol_id: name.toLowerCase().replace(/\s+/g, '_'),
            total_usd_value: protocolPositions[name].reduce((sum, pos) => sum + (pos.total_usd_value || 0), 0),
            relative_portfolio_percentage: 0
          }))
        },
        protocolPositions,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('❌ Error loading data:', error);
      setPoolsData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
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
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <a href="/" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>🏠 Home</a>
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
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <a href="/" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>🏠 Home</a>
              <a href="/dashboard" style={styles.navLink}>← Back to Dashboard</a>
              <a href="/dashboard/alerts" style={styles.navLink}>Alerts</a>
              <a href="/dashboard/settings" style={styles.navLink}>Settings</a>
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

        <div style={styles.container}>
          <h1 style={styles.title}>🏊‍♂️ DeFi Pools & Positions</h1>
          <p style={styles.subtitle}>
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} | Analyze DEX pairs and liquidity pools across all chains
          </p>
          
          {/* Search Input */}
          <div style={styles.searchSection}>
            <h3 style={{ color: '#000000', marginBottom: '1rem' }}>🔍 Look up any DEX Pair on any DeFi protocol</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Enter token address OR pool/pair address (0x... or Solana address)"
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: '2px solid #000000',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
              <button
                onClick={() => loadDeFiPositions(searchAddress)}
                disabled={!searchAddress || poolsData.isLoading}
                style={{
                  ...styles.analyzeButton,
                  opacity: (!searchAddress || poolsData.isLoading) ? 0.6 : 1,
                  cursor: (!searchAddress || poolsData.isLoading) ? 'not-allowed' : 'pointer'
                }}
              >
                {poolsData.isLoading ? '🔄 Searching...' : '🔍 Look Up'}
              </button>
            </div>
            <p style={{ color: '#666666', fontSize: '0.9rem', marginBottom: '1rem' }}>
              • <strong>Token Address:</strong> Find ALL pools containing this token across all chains<br/>
              • <strong>Pool/Pair Address:</strong> Get specific information about a single pool/pair<br/>
              • Supports: Ethereum, Arbitrum, Base, Optimism, and Solana
            </p>
          </div>
          
          {poolsData.isLoading && (
            <div style={styles.loadingCard}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <h3 style={{ color: '#000000' }}>Analyzing DEX Pair...</h3>
              <p style={{ color: '#666' }}>Fetching pair data from multiple DEX APIs</p>
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
                {!hasSearched && Object.keys(poolsData.protocolPositions).length === 0 && !poolsData.isLoading && (
                  <div style={styles.protocolCard}>
                    <h3 style={{ color: '#000000', marginBottom: '1rem' }}>🔍 Ready to Analyze</h3>
                    <p style={{ color: '#666' }}>
                      Enter a DEX pair address above to view comprehensive liquidity pool information, trading data, and protocol details.
                    </p>
                    <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                      <strong>Supported Chains & Protocols:</strong><br />
                      <strong>Ethereum:</strong> Uniswap V2/V3, Aave V2/V3, Compound, Curve, Yearn, Lido, SushiSwap<br />
                      <strong>Arbitrum:</strong> Uniswap V3, SushiSwap, Aave V3, Curve<br />
                      <strong>Base:</strong> Uniswap V3, SushiSwap, Compound V3<br />
                      <strong>Optimism:</strong> Uniswap V3, SushiSwap, Aave V3<br />
                      <strong>Solana:</strong> Raydium, Orca, Serum, Marinade, Lido
                    </div>
                  </div>
                )}

                {Object.entries(poolsData.protocolPositions).map(([protocol, positions]) => (
                  <div key={protocol} style={styles.protocolCard}>
                    <h3 style={{ color: '#000000', marginBottom: '1rem', fontSize: '1.5rem' }}>
                      🏦 {protocol}
                    </h3>
                    
                    {positions.length > 0 ? (
                      <div>
                        {positions.map((position, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: '#ffffff',
                              border: '2px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              padding: '1rem',
                              marginBottom: '0.5rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' }}>
                                  {position.position_type?.replace('_', ' ') || 'LIQUIDITY POOL'}
                                </div>
                                <div style={{ color: '#374151', marginTop: '0.25rem' }}>
                                  {position.position_token_data?.map((token: any) => token.symbol).join(', ') || 'Unknown Tokens'}
                                </div>
                                {/* Pool/Pair Address */}
                                {position.position_id && (
                                  <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                    📍 {position.position_id.length > 42 ? 
                                      `${position.position_id.substring(0, 6)}...${position.position_id.substring(position.position_id.length - 4)}` : 
                                      position.position_id}
                                  </div>
                                )}
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000000' }}>
                                  ${(position.total_usd_value || 0).toLocaleString()}
                                </div>
                                {position.rawData?.volume24h && (
                                  <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                    Vol: ${parseFloat(position.rawData.volume24h).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div style={{ 
                              display: 'flex', 
                              gap: '0.5rem', 
                              marginTop: '1rem',
                              flexWrap: 'wrap' as const
                            }}>
                              {/* Trade Button */}
                              {position.rawData?.url && (
                                <a
                                  href={position.rawData.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    background: '#10b981',
                                    color: '#ffffff',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    display: 'inline-block'
                                  }}
                                >
                                  🦄 Trade on {position.rawData.dex || 'DEX'}
                                </a>
                              )}
                              
                              {/* DexScreener Link */}
                              {position.position_id && (
                                <a
                                  href={`https://dexscreener.com/${position.rawData?.chain?.toLowerCase() || 'ethereum'}/${position.position_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    background: '#3b82f6',
                                    color: '#ffffff',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    display: 'inline-block'
                                  }}
                                >
                                  📊 View on DexScreener
                                </a>
                              )}
                              
                              {/* Copy Address Button */}
                              {position.position_id && (
                                <button
                                  onClick={(event) => {
                                    navigator.clipboard.writeText(position.position_id);
                                    // Simple feedback - you could enhance this with a toast
                                    const button = event?.target as HTMLButtonElement;
                                    const originalText = button.textContent;
                                    button.textContent = '✅ Copied!';
                                    setTimeout(() => {
                                      button.textContent = originalText;
                                    }, 2000);
                                  }}
                                  style={{
                                    background: '#6b7280',
                                    color: '#ffffff',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                  }}
                                >
                                  📋 Copy Address
                                </button>
                              )}
                            </div>
                            
                            {/* Additional Pool Info */}
                            {position.rawData && (
                              <div style={{ 
                                marginTop: '1rem', 
                                padding: '0.75rem',
                                background: '#f9fafb',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem'
                              }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                                  {position.rawData.feeTier && (
                                    <div>
                                      <span style={{ color: '#6b7280' }}>Fee:</span> {position.rawData.feeTier}
                                    </div>
                                  )}
                                  {position.rawData.txCount24h && (
                                    <div>
                                      <span style={{ color: '#6b7280' }}>24h Txs:</span> {position.rawData.txCount24h}
                                    </div>
                                  )}
                                  {position.rawData.priceChange24h && (
                                    <div>
                                      <span style={{ color: '#6b7280' }}>24h Change:</span> 
                                      <span style={{ 
                                        color: position.rawData.priceChange24h >= 0 ? '#10b981' : '#ef4444',
                                        fontWeight: 'bold'
                                      }}>
                                        {position.rawData.priceChange24h >= 0 ? '+' : ''}{position.rawData.priceChange24h}%
                                      </span>
                                    </div>
                                  )}
                                  {position.rawData.marketCap && (
                                    <div>
                                      <span style={{ color: '#6b7280' }}>Market Cap:</span> ${parseFloat(position.rawData.marketCap).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
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

                {Object.keys(poolsData.protocolPositions).length === 0 && !poolsData.isLoading && hasSearched && (
                  <div style={styles.protocolCard}>
                    <h3 style={{ color: '#000000', marginBottom: '1rem' }}>📭 No DeFi Positions Found</h3>
                    <p style={{ color: '#666' }}>
                      This address doesn't have any active DeFi positions or pair data across the supported protocols.
                    </p>
                    <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                      <strong>Supported Protocols:</strong><br />
                      <strong>Ethereum:</strong> Uniswap V2/V3, Aave V2/V3, Compound, Curve, Yearn, Lido, SushiSwap<br />
                      <strong>Arbitrum:</strong> Uniswap V3, SushiSwap, Aave V3, Curve<br />
                      <strong>Base:</strong> Uniswap V3, SushiSwap, Compound V3<br />
                      <strong>Optimism:</strong> Uniswap V3, SushiSwap, Aave V3<br />
                      <strong>Solana:</strong> Raydium, Orca, Serum, Marinade, Lido
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
