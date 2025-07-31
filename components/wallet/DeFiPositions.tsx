import React, { useState, useEffect } from 'react';
import { useWallet } from './WalletProvider';

interface DeFiStats {
  totalProtocols: number;
  hasLiquidityPositions: boolean;
  hasLendingPositions: boolean;
  hasStakingPositions: boolean;
  totalPositions: number;
}

interface DeFiData {
  summary: any;
  positions: any[];
  protocolBreakdown: Record<string, any>;
  stats: DeFiStats;
  lastUpdated: string;
  error?: string;
}

const protocolInfo = {
  'uniswap-v3': { name: 'Uniswap V3', icon: '🦄', color: 'from-pink-500 to-purple-500' },
  'uniswap-v2': { name: 'Uniswap V2', icon: '🦄', color: 'from-pink-500 to-purple-500' },
  'sushiswap-v2': { name: 'SushiSwap', icon: '🍣', color: 'from-blue-500 to-teal-500' },
  'aave-v2': { name: 'Aave V2', icon: '👻', color: 'from-purple-500 to-blue-500' },
  'aave-v3': { name: 'Aave V3', icon: '👻', color: 'from-purple-500 to-blue-500' },
  'lido': { name: 'Lido', icon: '🔥', color: 'from-orange-500 to-red-500' },
};

export function DeFiPositions() {
  const { wallet } = useWallet();
  const [defiData, setDefiData] = useState<DeFiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wallet?.address) {
      fetchDeFiData();
    }
  }, [wallet?.address]);

  const fetchDeFiData = async () => {
    if (!wallet?.address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wallet/defi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch DeFi data');
      }

      const data = await response.json();
      setDefiData(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching DeFi data:', err);
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
        <h3 className="text-xl font-semibold text-white">DeFi Positions</h3>
        <button
          onClick={fetchDeFiData}
          disabled={loading}
          className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && !defiData && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-300">Loading DeFi positions...</span>
        </div>
      )}

      {defiData && (
        <div className="space-y-4">
          {/* DeFi Overview */}
          {defiData.stats && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">DeFi Activity Overview</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{defiData.stats.totalProtocols}</div>
                  <div className="text-gray-300">Protocols</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{defiData.stats.totalPositions}</div>
                  <div className="text-gray-300">Positions</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${defiData.stats.hasLiquidityPositions ? 'text-green-400' : 'text-gray-400'}`}>
                    {defiData.stats.hasLiquidityPositions ? '✓' : '✗'}
                  </div>
                  <div className="text-gray-300">Liquidity</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${defiData.stats.hasLendingPositions ? 'text-green-400' : 'text-gray-400'}`}>
                    {defiData.stats.hasLendingPositions ? '✓' : '✗'}
                  </div>
                  <div className="text-gray-300">Lending</div>
                </div>
              </div>
            </div>
          )}

          {/* Protocol Breakdown */}
          {defiData.protocolBreakdown && Object.keys(defiData.protocolBreakdown).length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-3">Active Protocols</h4>
              <div className="space-y-3">
                {Object.entries(defiData.protocolBreakdown).map(([protocol, data]) => {
                  if (!data || data === null) return null;
                  
                  const info = protocolInfo[protocol as keyof typeof protocolInfo];
                  if (!info) return null;

                  return (
                    <div key={protocol} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${info.color} rounded-full flex items-center justify-center`}>
                            <span className="text-white text-lg">{info.icon}</span>
                          </div>
                          <div>
                            <div className="text-white font-medium">{info.name}</div>
                            <div className="text-gray-400 text-sm">
                              {typeof data === 'object' && data.length ? `${data.length} positions` : 'Active'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                      </div>

                      {/* Show protocol-specific data if available */}
                      {Array.isArray(data) && data.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="text-gray-300 text-sm">
                            Found {data.length} position{data.length !== 1 ? 's' : ''} on {info.name}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DeFi Summary */}
          {defiData.summary && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">DeFi Summary</h4>
              <div className="text-gray-300 text-sm">
                {typeof defiData.summary === 'object' ? (
                  <pre className="whitespace-pre-wrap text-xs bg-black/20 p-2 rounded">
                    {JSON.stringify(defiData.summary, null, 2)}
                  </pre>
                ) : (
                  <div>Summary data available</div>
                )}
              </div>
            </div>
          )}

          {/* No DeFi Activity */}
          {defiData.stats?.totalProtocols === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏦</div>
              <div className="text-white font-medium mb-2">No DeFi Activity Found</div>
              <div className="text-gray-400 text-sm">
                This wallet doesn't appear to have any active DeFi positions on major protocols.
              </div>
            </div>
          )}

          {/* Last Updated */}
          {defiData.lastUpdated && (
            <div className="text-center text-gray-400 text-xs">
              Last updated: {new Date(defiData.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 