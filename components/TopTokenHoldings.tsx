import React, { useState, useEffect } from 'react';

interface TokenHolding {
  symbol: string;
  name: string;
  balance: number;
  balanceFormatted: string;
  valueUsd: number;
  contractAddress: string;
  decimals: number;
  logo?: string;
  chainId: string;
  chainName: string;
  chainLogo: string;
}

interface TopTokenHoldingsProps {
  walletAddress: string;
  maxTokens?: number;
}

export default function TopTokenHoldings({ walletAddress, maxTokens = 10 }: TopTokenHoldingsProps) {
  const [tokens, setTokens] = useState<TokenHolding[]>([]);
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
      background: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem'
    },
    tokenLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    tokenInfo: {
      display: 'flex',
      flexDirection: 'column' as const
    },
    tokenSymbol: {
      color: '#000000',
      fontWeight: 'bold',
      fontSize: '1rem'
    },
    tokenName: {
      color: '#666666',
      fontSize: '0.75rem'
    },
    tokenBalance: {
      color: '#666666',
      fontSize: '0.875rem'
    },
    tokenValue: {
      color: '#16a34a',
      fontWeight: 'bold',
      fontSize: '1rem'
    },
    chainBadge: {
      background: '#e5e7eb',
      color: '#374151',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: 'bold'
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
    noTokens: {
      textAlign: 'center' as const,
      color: '#666666',
      padding: '2rem'
    }
  };

  const fetchTokenHoldings = async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🪙 Fetching token holdings for ${walletAddress}`);
      const response = await fetch(`/api/wallet/balance?address=${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Balance data received:', data);
        
        // Extract all tokens from all chains and flatten into single array
        const allTokens: TokenHolding[] = [];
        
        data.chains.forEach((chain: any) => {
          chain.tokens.forEach((token: any) => {
            if (token.valueUsd > 0.01) { // Only show tokens worth more than $0.01
              allTokens.push({
                symbol: token.symbol,
                name: token.name,
                balance: token.balance,
                balanceFormatted: token.balanceFormatted,
                valueUsd: token.valueUsd,
                contractAddress: token.contractAddress,
                decimals: token.decimals,
                logo: token.logo,
                chainId: chain.chainId,
                chainName: chain.chainName,
                chainLogo: chain.chainLogo
              });
            }
          });
        });
        
        // Sort by USD value (highest first) and take top tokens
        const topTokens = allTokens
          .sort((a, b) => b.valueUsd - a.valueUsd)
          .slice(0, maxTokens);
        
        setTokens(topTokens);
        console.log(`✅ Found ${topTokens.length} token holdings`);
      } else {
        throw new Error('Failed to fetch token holdings');
      }
    } catch (err) {
      console.error('❌ Error fetching token holdings:', err);
      setError('Failed to load token holdings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenHoldings();
  }, [walletAddress]);

  const formatBalance = (balance: number, symbol: string) => {
    if (balance === 0) return `0 ${symbol}`;
    if (balance < 0.001) return `<0.001 ${symbol}`;
    if (balance < 1) return `${balance.toFixed(4)} ${symbol}`;
    if (balance < 1000) return `${balance.toFixed(2)} ${symbol}`;
    return `${(balance / 1000).toFixed(2)}K ${symbol}`;
  };

  const formatUSD = (value: number) => {
    if (value === 0) return '$0.00';
    if (value < 0.01) return '<$0.01';
    if (value < 1000) return `$${value.toFixed(2)}`;
    if (value < 1000000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.title}>
          🪙 Top Token Holdings
        </div>
        <div style={styles.loading}>
          <div>🔄 Loading token holdings...</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Scanning all chains for your tokens
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.title}>
          🪙 Top Token Holdings
          <button 
            onClick={fetchTokenHoldings} 
            style={styles.refreshButton}
            title="Refresh tokens"
          >
            🔄
          </button>
        </div>
        <div style={styles.error}>
          <div>❌ {error}</div>
          <button 
            onClick={fetchTokenHoldings} 
            style={{ ...styles.refreshButton, marginTop: '1rem' }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        🪙 Top Token Holdings
        <button 
          onClick={fetchTokenHoldings} 
          style={styles.refreshButton}
          title="Refresh tokens"
        >
          🔄
        </button>
      </div>
      
      {tokens.length > 0 ? (
        <div style={styles.tokenList}>
          {tokens.map((token, index) => (
            <div key={`${token.chainId}-${token.contractAddress}`} style={styles.tokenItem}>
              <div style={styles.tokenLeft}>
                <div style={{ fontSize: '1.5rem' }}>
                  {token.logo ? (
                    <img 
                      src={token.logo} 
                      alt={token.symbol} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}>
                      {token.symbol.charAt(0)}
                    </div>
                  )}
                </div>
                <div style={styles.tokenInfo}>
                  <div style={styles.tokenSymbol}>{token.symbol}</div>
                  <div style={styles.tokenName}>{token.name}</div>
                  <div style={styles.tokenBalance}>
                    {formatBalance(token.balance, token.symbol)}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={styles.tokenValue}>
                  {formatUSD(token.valueUsd)}
                </div>
                <div style={styles.chainBadge}>
                  {token.chainLogo} {token.chainName}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.noTokens}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🪙</div>
          <div>No tokens found</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Only native coins (SOL, ETH) detected in your wallet
          </div>
        </div>
      )}
    </div>
  );
} 