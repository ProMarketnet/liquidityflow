import React from 'react';

interface StatsGridProps {
  stats: {
    totalLiquidity: number;
    maxSlippage: number;
    activeLPs: number;
    volume24h: number;
  };
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="text-gray-400 text-sm">Total Liquidity</span>
          <span className="text-2xl">💧</span>
        </div>
        <div className="text-2xl font-bold text-white">${stats.totalLiquidity.toLocaleString()}</div>
        <div className="text-red-400 text-sm">-23% from last week</div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="text-gray-400 text-sm">Max Slippage</span>
          <span className="text-2xl">📉</span>
        </div>
        <div className="text-2xl font-bold text-white">{stats.maxSlippage}%</div>
        <div className="text-red-400 text-sm">+4.2% from yesterday</div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="text-gray-400 text-sm">Active LPs</span>
          <span className="text-2xl">👥</span>
        </div>
        <div className="text-2xl font-bold text-white">{stats.activeLPs}</div>
        <div className="text-green-400 text-sm">+3 new this week</div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="text-gray-400 text-sm">24h Volume</span>
          <span className="text-2xl">📊</span>
        </div>
        <div className="text-2xl font-bold text-white">${stats.volume24h.toLocaleString()}</div>
        <div className="text-gray-400 text-sm">-12% from yesterday</div>
      </div>
    </div>
  );
};
