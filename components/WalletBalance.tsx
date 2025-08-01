import React, { useState, useEffect } from 'react';

interface ChainBalance {
  chainId: string;
  chainName: string;
  chainLogo: string;
  nativeBalance: number;
  nativeSymbol: string;
  nativeValueUsd: number;
  tokens: TokenBalance[];
  totalValueUsd: number;
}

interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  balanceFormatted: string;
  valueUsd: number;
  contractAddress: string;
  decimals: number;
  logo?: string;
}

interface WalletBalance {
  address: string;
  totalValueUsd: number;
  chains: ChainBalance[];
  lastUpdated: string;
}

interface WalletBalanceProps {
  walletAddress: string;
  showChains?: boolean;
}

export default function WalletBalance({ walletAddress, showChains = true }: WalletBalanceProps) {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🎨 INLINE STYLES FOR GUARANTEED VISIBILITY
  const styles = {
    container: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1rem'
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    totalValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#16a34a',
      marginBottom: '1rem'
    },
    chainsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    chainCard: {
      background: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1rem'
    },
    chainHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    chainLogo: {
      fontSize: '1.5rem'
    },
    chainName: {
      fontWeight: 'bold',
      color: '#000000'
    },
    balance: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#000000'
    },
    valueUsd: {
      fontSize: '0.875rem',
      color: '#666666'
    },
    tokens: {
      marginTop: '0.5rem',
      paddingTop: '0.5rem',
      borderTop: '1px solid #e5e7eb'
    },
    token: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.875rem',
      marginBottom: '0.25rem'
    },
    loading: {
      textAlign: 'center' as const,
      color: '#666666',
      padding: '2rem'
    },
    error: {
      background: '#fef2f2',
      border: '2px solid #dc2626',
      borderRadius: '0.5rem',
      padding: '1rem',
      color: '#dc2626',
      textAlign: 'center' as const
    },
    refreshButton: {
      background: '#3b82f6',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 'bold'
    },
    lastUpdated: {
      fontSize: '0.75rem',
      color: '#666666',
      textAlign: 'center' as const,
      marginTop: '1rem'
    }
  };

  const fetchBalance = async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Fetching balance for ${walletAddress}`);
      const response = await fetch(`/api/wallet/balance?address=${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        setBalance(data);
        console.log('✅ Balance fetched successfully:', data);
      } else {
        throw new Error('Failed to fetch balance');
      }
    } catch (err) {
      console.error('❌ Error fetching balance:', err);
      setError('Failed to load wallet balance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [walletAddress]);

  const formatBalance = (balance: number, symbol: string) => {
    if (balance === 0) return `0.0000 ${symbol}`;
    if (balance < 0.001) return `<0.001 ${symbol}`;
    return `${balance.toFixed(4)} ${symbol}`;
  };

  const formatUSD = (value: number) => {
    if (value === 0) return '$0.00';
    if (value < 0.01) return '<$0.01';
    return `$${value.toFixed(2)}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div>🔄 Loading wallet balance...</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Fetching data from Ethereum, Arbitrum, Base, Optimism & Solana
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <div>❌ {error}</div>
          <button 
            onClick={fetchBalance} 
            style={{ ...styles.refreshButton, marginTop: '1rem' }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>No balance data available</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        💰 Wallet Balance
        <button 
          onClick={fetchBalance} 
          style={styles.refreshButton}
          title="Refresh balance"
        >
          🔄
        </button>
      </div>
      
      <div style={styles.totalValue}>
        {formatUSD(balance.totalValueUsd)}
      </div>
      
      <div style={{ fontSize: '0.875rem', color: '#666666', marginBottom: '1rem' }}>
        Total value across {balance.chains.length} chains
      </div>

      {showChains && (
        <div style={styles.chainsGrid}>
          {balance.chains
            .filter(chain => chain.totalValueUsd > 0 || chain.nativeBalance > 0)
            .sort((a, b) => b.totalValueUsd - a.totalValueUsd)
            .map((chain) => (
            <div key={chain.chainId} style={styles.chainCard}>
              <div style={styles.chainHeader}>
                <span style={styles.chainLogo}>{chain.chainLogo}</span>
                <span style={styles.chainName}>{chain.chainName}</span>
              </div>
              
              {chain.nativeBalance > 0 && (
                <div>
                  <div style={styles.balance}>
                    {formatBalance(chain.nativeBalance, chain.nativeSymbol)}
                  </div>
                  <div style={styles.valueUsd}>
                    {formatUSD(chain.nativeValueUsd)}
                  </div>
                </div>
              )}
              
              {chain.tokens.length > 0 && (
                <div style={styles.tokens}>
                  {chain.tokens
                    .filter(token => token.valueUsd > 0.01)
                    .slice(0, 3)
                    .map((token, index) => (
                    <div key={index} style={styles.token}>
                      <span>{formatBalance(token.balance, token.symbol)}</span>
                      <span>{formatUSD(token.valueUsd)}</span>
                    </div>
                  ))}
                  {chain.tokens.length > 3 && (
                    <div style={{ fontSize: '0.75rem', color: '#666666', textAlign: 'center' }}>
                      +{chain.tokens.length - 3} more tokens
                    </div>
                  )}
                </div>
              )}
              
              {chain.nativeBalance === 0 && chain.tokens.length === 0 && (
                <div style={{ color: '#666666', fontSize: '0.875rem' }}>
                  No balance
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {balance.chains.filter(chain => chain.totalValueUsd > 0 || chain.nativeBalance > 0).length === 0 && (
        <div style={{ textAlign: 'center', color: '#666666', padding: '2rem' }}>
          No balances found across any supported chains
        </div>
      )}
      
      <div style={styles.lastUpdated}>
        Last updated: {formatTimeAgo(balance.lastUpdated)}
      </div>
    </div>
  );
} 