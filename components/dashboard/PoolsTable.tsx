import React from 'react';

interface Pool {
  id: string;
  dex: string;
  pair: string;
  liquidity: number;
  liquidityChange: number;
  volume24h: number;
  health: 'healthy' | 'warning' | 'critical';
  slippage: number;
  lpCount: number;
}

interface PoolsTableProps {
  pools: Pool[];
}

export const PoolsTable: React.FC<PoolsTableProps> = ({ pools }) => {
  const getDexIcon = (dex: string) => {
    switch (dex.toLowerCase()) {
      case 'uniswap': return '🦄';
      case 'sushiswap': return '🍣';
      case 'pancakeswap': return '🥞';
      default: return '💧';
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">Healthy</span>;
      case 'warning':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">Warning</span>;
      case 'critical':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">Critical</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">Unknown</span>;
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-xl font-semibold text-white">Active Liquidity Pools</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-300">Pool</th>
              <th className="text-left p-4 font-semibold text-gray-300">Liquidity</th>
              <th className="text-left p-4 font-semibold text-gray-300">24h Volume</th>
              <th className="text-left p-4 font-semibold text-gray-300">Health</th>
              <th className="text-left p-4 font-semibold text-gray-300">Slippage</th>
              <th className="text-left p-4 font-semibold text-gray-300">LPs</th>
              <th className="text-left p-4 font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pools.map((pool) => (
              <tr key={pool.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getDexIcon(pool.dex)}</span>
                    <div>
                      <div className="font-semibold text-white">{pool.dex}</div>
                      <div className="text-sm text-gray-400">{pool.pair}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-white">${pool.liquidity.toLocaleString()}</div>
                  <div className={`text-sm ${pool.liquidityChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pool.liquidityChange >= 0 ? '+' : ''}{pool.liquidityChange}%
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-white">${pool.volume24h.toLocaleString()}</div>
                </td>
                <td className="p-4">
                  {getHealthBadge(pool.health)}
                </td>
                <td className="p-4">
                  <div className="font-semibold text-white">{pool.slippage}%</div>
                  <div className="text-xs text-gray-400">1% trade size</div>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-white">{pool.lpCount}</div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30">
                      Manage
                    </button>
                    {pool.health === 'critical' && (
                      <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30">
                        Emergency
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
