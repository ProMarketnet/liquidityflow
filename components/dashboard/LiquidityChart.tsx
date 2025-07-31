import React from 'react';

export const LiquidityChart: React.FC = () => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Liquidity Depth Over Time</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">7D</button>
          <button className="px-3 py-1 text-sm text-gray-400 hover:text-white">30D</button>
        </div>
      </div>
      
      <div className="h-64 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg flex items-center justify-center relative overflow-hidden">
        {/* Simulated chart line */}
        <div className="absolute bottom-16 left-8 right-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        <div className="absolute bottom-14 left-1/4 w-2 h-2 bg-blue-400 rounded-full"></div>
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-purple-500 rounded-full"></div>
        
        <div className="text-center">
          <div className="text-gray-400 mb-2">Liquidity Trend</div>
          <div className="text-sm text-blue-400 font-semibold">Declining - Intervention Recommended</div>
        </div>
      </div>
    </div>
  );
};
