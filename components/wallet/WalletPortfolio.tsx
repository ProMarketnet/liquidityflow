import React, { useState, useEffect } from 'react';
import { useWallet } from './WalletProvider';

interface TokenBalance {
  token_address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logo?: string;
  verified_contract: boolean;
  possible_spam: boolean;
}

interface PortfolioData {
  nativeBalance: string;
  tokenBalances: TokenBalance[];
  totalValue?: string;
}

export function WalletPortfolio() {
  const { wallet } = useWallet();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wallet?.address) {
      fetchPortfolio();
    }
  }, [wallet?.address]);

  const fetchPortfolio = async () => {
    if (!wallet?.address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wallet/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }

      const data = await response.json();
      setPortfolio(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) {
    return null;
  }

  return (
    <div className="bg-white/5 border border-white/20 rounded-xl p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Portfolio Overview</h3>
        <button
          onClick={fetchPortfolio}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && !portfolio && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-300">Loading portfolio...</span>
        </div>
      )}

      {portfolio && (
        <div className="space-y-4">
          {/* Native Balance */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">ETH</span>
                </div>
                <div>
                  <div className="text-white font-medium">Ethereum</div>
                  <div className="text-gray-400 text-sm">Native Balance</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  {(parseFloat(portfolio.nativeBalance) / 1e18).toFixed(4)} ETH
                </div>
              </div>
            </div>
          </div>

          {/* Token Balances */}
          {portfolio.tokenBalances && portfolio.tokenBalances.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-3">Token Holdings ({portfolio.tokenBalances.length})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {portfolio.tokenBalances
                  .filter(token => !token.possible_spam && token.verified_contract)
                  .slice(0, 10)
                  .map((token, index) => (
                    <div key={token.token_address || index} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {token.logo ? (
                            <img 
                              src={token.logo} 
                              alt={token.symbol}
                              className="w-6 h-6 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">{token.symbol[0]}</span>
                            </div>
                          )}
                          <div>
                            <div className="text-white text-sm font-medium">{token.symbol}</div>
                            <div className="text-gray-400 text-xs">{token.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm">
                            {(parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(4)}
                          </div>
                          <div className="text-gray-400 text-xs">{token.symbol}</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {portfolio.tokenBalances && portfolio.tokenBalances.length === 0 && (
            <div className="text-center py-4 text-gray-400">
              No token holdings found
            </div>
          )}
        </div>
      )}
    </div>
  );
} 