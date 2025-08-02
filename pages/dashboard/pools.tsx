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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wallet = localStorage.getItem('connectedWallet');
      setWalletAddress(wallet);
      
      if (wallet) {
        setSearchAddress(wallet);
      }
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        localStorage.setItem('connectedWallet', address);
        setWalletAddress(address);
        setSearchAddress(address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to continue');
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('connectedWallet');
    setWalletAddress(null);
    setSearchAddress('');
    setPoolsData({
      summary: null,
      protocolPositions: {},
      isLoading: false,
      error: null
    });
    setHasSearched(false);
  };

  // Helper function to get direct trading URL for a specific pool/pair
  const getDirectTradingUrl = (rawData: any, positionId: string) => {
    if (rawData.url) {
      return rawData.url;
    }

    const baseTokenSymbol = rawData.baseToken?.symbol;
    const pairedTokenSymbol = rawData.pairedToken?.symbol || rawData.quoteToken?.symbol;
    const baseTokenAddress = rawData.baseToken?.address;
    const pairedTokenAddress = rawData.pairedToken?.address || rawData.quoteToken?.address;
    const chainId = rawData.chainId || rawData.chain?.toLowerCase();

    if (!baseTokenAddress || !pairedTokenAddress) {
      return `https://dexscreener.com/${chainId || 'ethereum'}/${positionId}`;
    }

    // Uniswap (EVM chains)
    if (rawData.dex?.toLowerCase().includes('uniswap') && ['ethereum', 'arbitrum', 'base', 'optimism'].includes(chainId)) {
      return `https://app.uniswap.org/#/swap?inputCurrency=${baseTokenAddress}&outputCurrency=${pairedTokenAddress}&chain=${chainId}`;
    }
    // Raydium (Solana)
    if (rawData.dex?.toLowerCase().includes('raydium') && chainId === 'solana') {
      return `https://raydium.io/swap/?inputCurrency=${baseTokenAddress}&outputCurrency=${pairedTokenAddress}`;
    }
    // Orca (Solana)
    if (rawData.dex?.toLowerCase().includes('orca') && chainId === 'solana') {
      return `https://www.orca.so/swap?tokenIn=${baseTokenAddress}&tokenOut=${pairedTokenAddress}`;
    }
    // SushiSwap (various chains)
    if (rawData.dex?.toLowerCase().includes('sushiswap')) {
      const sushiChainIdMap: Record<string, number> = {
        'ethereum': 1, 'arbitrum': 42161, 'base': 8453, 'optimism': 10, 'polygon': 137, 'bsc': 56
      };
      const numericChainId = sushiChainIdMap[chainId];
      if (numericChainId) {
        return `https://sushi.com/swap?fromCurrency=${baseTokenAddress}&toCurrency=${pairedTokenAddress}&fromChainId=${numericChainId}`;
      }
    }

    // Fallback to DexScreener
    return `https://dexscreener.com/${chainId || 'ethereum'}/${positionId}`;
  };

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
      let pairData;
      
              if (pairResponse.ok) {
        pairData = await pairResponse.json();
        console.log('📊 Pair data received:', pairData);
        
        // Check if this is pair/pool data and process it
        if (pairData.success && (pairData.pairInfo || pairData.poolInfo || pairData.pair || pairData.pool)) {
          console.log('🏊‍♂️ Processing specific pair/pool data...');
          
          const specificPairData = pairData.pairInfo || pairData.poolInfo || pairData.pair || pairData.pool || pairData;
          const protocol = specificPairData.dex || specificPairData.protocol || 'Unknown DEX';
          const pairChain = specificPairData.chain || (address.startsWith('0x') ? 'Ethereum' : 'Solana');
          
          const protocolName = `${protocol} (${pairChain})`;
          const protocolPositions: { [protocol: string]: ProtocolPosition[] } = {};
          
          protocolPositions[protocolName] = [{
            position_type: 'liquidity_pool',
            position_id: address,
            position_token_data: [
              { symbol: specificPairData.token0?.symbol || specificPairData.baseToken?.symbol || 'TOKEN0' },
              { symbol: specificPairData.token1?.symbol || specificPairData.quoteToken?.symbol || 'TOKEN1' }
            ],
            total_usd_value: parseFloat(specificPairData.liquidity || specificPairData.liquidityUSD || specificPairData.tvl || '0'),
            apr: specificPairData.apr || specificPairData.apy,
            rawData: specificPairData
          }];
          
          const totalValue = parseFloat(specificPairData.liquidity || specificPairData.liquidityUSD || specificPairData.tvl || '0');
          
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
      
      // Step 4: Final fallback to wallet DeFi positions
      console.log('🔄 Trying as wallet address...');
      const walletResponse = await fetch(`/api/wallet/defi?address=${address}`);
      let walletData: any;
      
      if (!walletResponse.ok) {
        throw new Error(`API returned ${walletResponse?.status}: ${walletResponse?.statusText || 'Unknown error'}`);
      }
      
      walletData = await walletResponse.json();
      console.log('📊 Wallet data received:', walletData);
      
      // Process the data based on type
      const protocolPositions: { [protocol: string]: ProtocolPosition[] } = {};
      
      if (walletData.positions && Array.isArray(walletData.positions)) {
        walletData.positions.forEach((pos: any) => {
          const protocolName = `${pos.protocol} (${pos.chain})`;
          
          if (!protocolPositions[protocolName]) {
            protocolPositions[protocolName] = [];
          }
          
          protocolPositions[protocolName].push({
            position_type: pos.position_type,
            position_id: pos.position_id,
            position_token_data: pos.position_token_data,
            total_usd_value: pos.total_usd_value,
            apr: pos.apr,
            rawData: pos
          });
        });
      }
      
      setPoolsData({
        summary: {
          total_usd_value: walletData.totalValue || 0,
          active_protocols: walletData.protocolBreakdown ? Object.entries(walletData.protocolBreakdown).map(([name, value]) => ({
            protocol_name: name,
            protocol_id: name.toLowerCase(),
            total_usd_value: value as number,
            relative_portfolio_percentage: walletData.totalValue > 0 ? ((value as number) / walletData.totalValue) * 100 : 0
          })) : []
        },
        protocolPositions,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error loading DeFi positions:', error);
      setPoolsData(prev => ({
        ...prev,
        isLoading: false,
        error: `Error Loading Data: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
  };

  const formatCurrency = (amount: number): string => {
    if (amount === 0) return '$0.00';
    if (amount < 0.01) return '<$0.01';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percent: number): string => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Head>
        <title>Liquidity Pools - LiquidFlow</title>
        <meta name="description" content="Explore and analyze DeFi liquidity pools across all major protocols and chains" />
      </Head>

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
            <a href="/dashboard" className="nav-link">
              📊 Overview
            </a>
            <a href="/dashboard/pools" className="nav-link active">
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
            
            {/* Wallet Actions */}
            {walletAddress ? (
              <button onClick={disconnectWallet} className="btn btn-sm btn-ghost">
                🔌 Disconnect
              </button>
            ) : (
              <button onClick={connectWallet} className="btn btn-sm btn-primary">
                🔗 Connect
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        {/* Header Section */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>
            DeFi Liquidity Pools
          </h1>
          <p style={{ margin: 0 }}>
            Search and analyze liquidity pools, token pairs, and DeFi positions across all supported chains and protocols.
          </p>
        </div>

        {/* Search Interface */}
        <div className="card" style={{ 
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-8)'
        }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h3 style={{ 
              margin: 0,
              marginBottom: 'var(--space-2)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              🔍 Search Pools & Tokens
            </h3>
            <p style={{ 
              margin: 0,
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              Enter a token address, pool/pair address, or wallet address to discover DeFi positions
            </p>
          </div>
          
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="0x... (Token/Pool/Wallet address)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="input"
              style={{ flex: 1 }}
            />
            <button
              onClick={() => searchAddress && loadDeFiPositions(searchAddress)}
              disabled={!searchAddress || poolsData.isLoading}
              className="btn btn-primary"
              style={{ minWidth: '120px' }}
            >
              {poolsData.isLoading ? '🔄 Loading...' : '🔍 Search'}
            </button>
          </div>
          
          {/* Quick Examples */}
          <div style={{ marginTop: 'var(--space-4)' }}>
            <div style={{ 
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--space-2)'
            }}>
              Quick examples:
            </div>
            <div className="flex gap-2">
              {[
                { label: 'Sample Token', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' },
                { label: 'Sample Pool', address: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640' }
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchAddress(example.address);
                    loadDeFiPositions(example.address);
                  }}
                  className="btn btn-sm btn-ghost"
                  style={{ fontSize: 'var(--font-size-xs)' }}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {poolsData.isLoading && (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-4)' }}>🔄</div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>
              Searching Across All Chains...
            </h3>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              Scanning Ethereum, Arbitrum, Base, Optimism, Solana, and other supported networks
            </p>
          </div>
        )}

        {poolsData.error && (
          <div className="card" style={{ 
            padding: 'var(--space-6)',
            border: '1px solid var(--color-error)',
            background: 'var(--color-error-light)'
          }}>
            <div className="flex items-center gap-3">
              <div style={{ fontSize: 'var(--font-size-2xl)' }}>⚠️</div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--color-error)' }}>
                  Search Error
                </h4>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                  {poolsData.error}
                </p>
              </div>
            </div>
          </div>
        )}

        {hasSearched && !poolsData.isLoading && !poolsData.error && poolsData.summary && (
          <div className="grid" style={{ gap: 'var(--space-8)' }}>
            {/* Summary Card */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: 'var(--space-2)' }}>
                    Portfolio Summary
                  </h3>
                  <div style={{
                    fontSize: 'var(--font-size-3xl)',
                    fontWeight: '800',
                    color: 'var(--color-success)'
                  }}>
                    {formatCurrency(poolsData.summary.total_usd_value)}
                  </div>
                  <p style={{ 
                    margin: 0,
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-tertiary)'
                  }}>
                    Total liquidity across {poolsData.summary.active_protocols.length} protocols
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => searchAddress && loadDeFiPositions(searchAddress)}
                    className="btn btn-sm btn-ghost"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
              
              {/* Protocol Breakdown */}
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-4)' }}>
                {poolsData.summary.active_protocols.map((protocol, index) => (
                  <div key={index} className="card" style={{ 
                    padding: 'var(--space-4)',
                    background: 'var(--color-background)'
                  }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div style={{ fontWeight: '600', fontSize: 'var(--font-size-sm)' }}>
                          {protocol.protocol_name}
                        </div>
                        <div style={{ 
                          color: 'var(--color-text-tertiary)',
                          fontSize: 'var(--font-size-xs)'
                        }}>
                          {protocol.relative_portfolio_percentage.toFixed(1)}% of portfolio
                        </div>
                      </div>
                      <div style={{
                        fontWeight: '700',
                        color: 'var(--color-primary)'
                      }}>
                        {formatCurrency(protocol.total_usd_value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Positions Grid */}
            <div className="grid" style={{ gap: 'var(--space-6)' }}>
              <h3>Individual Positions</h3>
              
              {Object.entries(poolsData.protocolPositions).map(([protocolName, positions]) => (
                <div key={protocolName} className="card" style={{ padding: 'var(--space-6)' }}>
                  <h4 style={{ 
                    marginBottom: 'var(--space-4)',
                    color: 'var(--color-primary)'
                  }}>
                    {protocolName}
                  </h4>
                  
                  <div className="grid" style={{ gap: 'var(--space-4)' }}>
                    {positions.map((position, index) => (
                      <div key={index} className="card" style={{ 
                        padding: 'var(--space-4)',
                        background: 'var(--color-background)'
                      }}>
                        <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-3)' }}>
                          <div>
                            <div style={{ 
                              fontWeight: '600',
                              marginBottom: 'var(--space-1)'
                            }}>
                              {position.position_token_data?.map(token => token.symbol).join(' / ') || 'Pool Position'}
                            </div>
                            <span className="badge badge-info" style={{ fontSize: 'var(--font-size-xs)' }}>
                              {position.position_type.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              fontWeight: '700',
                              color: 'var(--color-success)',
                              fontSize: 'var(--font-size-lg)'
                            }}>
                              {formatCurrency(position.total_usd_value)}
                            </div>
                            {position.apr && (
                              <div style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)'
                              }}>
                                {position.apr.toFixed(1)}% APR
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Pool Details */}
                        {position.rawData && (
                          <div style={{ marginBottom: 'var(--space-3)' }}>
                            <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                              {position.rawData.volume24h && (
                                <div>
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>24h Volume: </span>
                                  <span>{formatCurrency(position.rawData.volume24h)}</span>
                                </div>
                              )}
                              {position.rawData.priceChange24h && (
                                <div>
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>24h Change: </span>
                                  <span style={{ 
                                    color: position.rawData.priceChange24h >= 0 ? 'var(--color-success)' : 'var(--color-error)'
                                  }}>
                                    {formatPercentage(position.rawData.priceChange24h)}
                                  </span>
                                </div>
                              )}
                              {position.rawData.feeTier && (
                                <div>
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>Fee Tier: </span>
                                  <span>{(position.rawData.feeTier / 10000).toFixed(2)}%</span>
                                </div>
                              )}
                              {position.rawData.txCount24h && (
                                <div>
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>24h Txns: </span>
                                  <span>{position.rawData.txCount24h}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {position.rawData && (
                            <>
                              <a
                                href={getDirectTradingUrl(position.rawData, position.position_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-primary"
                              >
                                🦄 Trade {position.rawData.baseToken?.symbol || 'TOKEN'}/{position.rawData.pairedToken?.symbol || position.rawData.quoteToken?.symbol || 'TOKEN'}
                              </a>
                              
                              <a
                                href={position.rawData.url || `https://dexscreener.com/${position.rawData.chain || 'ethereum'}/${position.position_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-secondary"
                              >
                                📊 View on DexScreener
                              </a>
                              
                              <button
                                onClick={() => navigator.clipboard.writeText(position.position_id)}
                                className="btn btn-sm btn-ghost"
                              >
                                📋 Copy Address
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasSearched && !poolsData.isLoading && !poolsData.error && !poolsData.summary && (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-4)' }}>🔍</div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>
              No Pools Found
            </h3>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              No liquidity pools or DeFi positions found for this address. Try searching for a different token, pool, or wallet address.
            </p>
          </div>
        )}

        {!hasSearched && (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-4)' }}>💧</div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>
              Discover DeFi Pools
            </h3>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              Search above to explore liquidity pools, analyze token pairs, and discover DeFi opportunities across all major protocols and chains.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Pools;
