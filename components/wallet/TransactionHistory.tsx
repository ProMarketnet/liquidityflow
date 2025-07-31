import React, { useState, useEffect } from 'react';
import { useWallet } from './WalletProvider';

interface TransactionHistory {
  summary: {
    totalTransactions: number;
    totalTransfers: number;
    defiSwaps: number;
    liquidityActions: number;
    lendingActions: number;
    regularTransfers: number;
  };
  categorized: {
    defiSwaps: any[];
    liquidityActions: any[];
    lendingActions: any[];
    transfers: any[];
    other: any[];
  };
  analytics: {
    mostActiveCategory: string;
    recentActivity: string;
    defiInteractionLevel: string;
    totalGasSpent: number;
  };
  lastUpdated: string;
  error?: string;
}

const categoryIcons = {
  'DeFi Swaps': '🔄',
  'Liquidity': '💧',
  'Lending': '🏦',
  'Transfers': '💸',
  'Other': '📝'
};

const activityColors = {
  'very-active': 'text-green-400',
  'active': 'text-blue-400',
  'moderate': 'text-yellow-400',
  'light': 'text-orange-400',
  'inactive': 'text-gray-400'
};

const defiLevelColors = {
  'expert': 'from-purple-500 to-pink-500',
  'advanced': 'from-blue-500 to-purple-500',
  'intermediate': 'from-green-500 to-blue-500',
  'beginner': 'from-yellow-500 to-green-500',
  'none': 'from-gray-500 to-gray-600'
};

export function TransactionHistory() {
  const { wallet } = useWallet();
  const [txHistory, setTxHistory] = useState<TransactionHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    if (wallet?.address) {
      fetchTransactionHistory();
    }
  }, [wallet?.address]);

  const fetchTransactionHistory = async () => {
    if (!wallet?.address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wallet/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }

      const data = await response.json();
      setTxHistory(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!wallet) {
    return null;
  }

  return (
    <div className="bg-white/5 border border-white/20 rounded-xl p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Transaction History</h3>
        <button
          onClick={fetchTransactionHistory}
          disabled={loading}
          className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && !txHistory && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-300">Loading transaction history...</span>
        </div>
      )}

      {txHistory && (
        <div className="space-y-6">
          {/* Analytics Overview */}
          {txHistory.analytics && (
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Activity Analytics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-white mb-1">
                    {txHistory.analytics.mostActiveCategory}
                  </div>
                  <div className="text-gray-300 text-sm">Most Active</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${activityColors[txHistory.analytics.recentActivity as keyof typeof activityColors]} mb-1`}>
                    {txHistory.analytics.recentActivity.charAt(0).toUpperCase() + txHistory.analytics.recentActivity.slice(1)}
                  </div>
                  <div className="text-gray-300 text-sm">Activity Level</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold bg-gradient-to-r ${defiLevelColors[txHistory.analytics.defiInteractionLevel as keyof typeof defiLevelColors]} bg-clip-text text-transparent mb-1`}>
                    {txHistory.analytics.defiInteractionLevel.charAt(0).toUpperCase() + txHistory.analytics.defiInteractionLevel.slice(1)}
                  </div>
                  <div className="text-gray-300 text-sm">DeFi Level</div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Summary */}
          {txHistory.summary && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Transaction Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{txHistory.summary.defiSwaps}</div>
                  <div className="text-gray-300">DeFi Swaps</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{txHistory.summary.liquidityActions}</div>
                  <div className="text-gray-300">Liquidity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{txHistory.summary.lendingActions}</div>
                  <div className="text-gray-300">Lending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{txHistory.summary.regularTransfers}</div>
                  <div className="text-gray-300">Transfers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{txHistory.summary.totalTransactions}</div>
                  <div className="text-gray-300">Total TX</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{txHistory.summary.totalTransfers}</div>
                  <div className="text-gray-300">Token Moves</div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Categories Tabs */}
          <div>
            <div className="flex space-x-1 mb-4 bg-white/5 rounded-lg p-1">
              {['overview', 'swaps', 'liquidity', 'lending', 'transfers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white/5 rounded-lg p-4 min-h-[200px]">
              {activeTab === 'overview' && (
                <div className="space-y-3">
                  <h5 className="text-white font-medium">Recent Activity Breakdown</h5>
                  {Object.entries(txHistory.categorized).map(([category, transactions]) => {
                    if (!Array.isArray(transactions) || transactions.length === 0) return null;
                    
                    const displayName = category === 'defiSwaps' ? 'DeFi Swaps' :
                                      category === 'liquidityActions' ? 'Liquidity' :
                                      category === 'lendingActions' ? 'Lending' :
                                      category === 'transfers' ? 'Transfers' : 'Other';
                    
                    return (
                      <div key={category} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{categoryIcons[displayName as keyof typeof categoryIcons] || '📝'}</span>
                          <div>
                            <div className="text-white font-medium">{displayName}</div>
                            <div className="text-gray-400 text-sm">{transactions.length} transactions</div>
                          </div>
                        </div>
                        <div className="text-indigo-400">
                          {((transactions.length / txHistory.summary.totalTransactions) * 100).toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab !== 'overview' && (
                <div className="space-y-2">
                  {(() => {
                    const categoryKey = activeTab === 'swaps' ? 'defiSwaps' :
                                       activeTab === 'liquidity' ? 'liquidityActions' :
                                       activeTab === 'lending' ? 'lendingActions' :
                                       activeTab === 'transfers' ? 'transfers' : 'other';
                    
                    const transactions = txHistory.categorized[categoryKey as keyof typeof txHistory.categorized] || [];
                    
                    if (transactions.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-400">
                          No {activeTab} found in recent history
                        </div>
                      );
                    }

                    return transactions.slice(0, 10).map((tx: any, index: number) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">
                              {tx.token_symbol || 'ETH'} {tx.category}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {formatAddress(tx.from_address || tx.from)} → {formatAddress(tx.to_address || tx.to)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white text-sm">
                              {tx.value_decimal || (tx.value && (parseFloat(tx.value) / 1e18).toFixed(4)) || 'N/A'}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {tx.block_timestamp && formatDate(tx.block_timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Last Updated */}
          {txHistory.lastUpdated && (
            <div className="text-center text-gray-400 text-xs">
              Last updated: {new Date(txHistory.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 