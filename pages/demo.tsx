import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';

// Mock data for demo
const mockStats = {
  totalLiquidity: 127450,
  maxSlippage: 8.7,
  activeLPs: 47,
  volume24h: 18340
};

export default function DemoPage() {
  const [isLive, setIsLive] = useState(true);
  const [stats, setStats] = useState(mockStats);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalLiquidity: Math.round(prev.totalLiquidity + (Math.random() * 2000 - 1000)),
        maxSlippage: Math.max(0.1, Math.round((prev.maxSlippage + (Math.random() * 0.6 - 0.3)) * 10) / 10)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <Layout title="LiquidFlow Demo Dashboard" showSidebar={true}>
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 mb-6 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-white font-semibold">
          🎯 This is a DEMO dashboard - See how LiquidFlow monitors your project
        </div>
        <button 
          className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
          onClick={() => alert('Ready to start? Contact hello@liquidflow.com')}
        >
          Start Free Trial
        </button>
      </div>

      {/* Project Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">DEMO Token (DEMO)</h1>
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold border border-yellow-500/30">
            ⚠️ Warning
          </span>
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-300 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
            onClick={() => setIsLive(!isLive)}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400' : 'bg-gray-400'}`}></span>
            {isLive ? 'Live Updates' : 'Paused'}
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all"
            onClick={() => alert('🚨 Emergency liquidity injection would be triggered!\n\nThis would:\n• Inject $50K emergency liquidity\n• Boost LP rewards by 200%\n• Send alerts to your team')}
          >
            🚨 Emergency Action
          </button>
        </div>
      </div>

      {/* Stats Grid - Built inline to avoid import issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-400 text-sm font-medium">Total Liquidity Depth</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-yellow-500/20 text-yellow-400">
              💧
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-2">${stats.totalLiquidity.toLocaleString()}</div>
          <div className="text-red-400 text-sm font-medium">↓ 23% from last week</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-400 text-sm font-medium">Max Slippage (1% trade)</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-red-500/20 text-red-400">
              📉
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-2">{stats.maxSlippage}%</div>
          <div className="text-red-400 text-sm font-medium">↑ 4.2% from yesterday</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-400 text-sm font-medium">Active LP Positions</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-green-500/20 text-green-400">
              👥
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-2">{stats.activeLPs}</div>
          <div className="text-green-400 text-sm font-medium">↑ 3 new this week</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-400 text-sm font-medium">24h Trading Volume</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-blue-500/20 text-blue-400">
              📊
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-2">${stats.volume24h.toLocaleString()}</div>
          <div className="text-gray-400 text-sm font-medium">↓ 12% from yesterday</div>
        </div>
      </div>

      {/* Liquidity Chart - Built inline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Liquidity Depth Over Time</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">7D</button>
              <button className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors">30D</button>
            </div>
          </div>
          
          <div className="h-64 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Simulated chart line */}
            <div className="absolute bottom-16 left-8 right-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <div className="absolute bottom-14 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            
            <div className="text-center">
              <div className="text-blue-400 font-semibold mb-2">Liquidity Trend Analysis</div>
              <div className="text-sm text-red-400 font-semibold">📉 Declining - Intervention Recommended</div>
              <div className="text-xs text-gray-400 mt-2">Emergency liquidity available if needed</div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Pool Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-white/5 rounded">
              <span className="text-gray-300">🦄 Uniswap V3</span>
              <span className="text-white font-semibold">67%</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/5 rounded">
              <span className="text-gray-300">🍣 SushiSwap</span>
              <span className="text-white font-semibold">23%</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/5 rounded">
              <span className="text-gray-300">🥞 PancakeSwap</span>
              <span className="text-white font-semibold">10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pools Overview - Simple version */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-6">Pool Health Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🦄</span>
              <div>
                <div className="font-semibold text-white">Uniswap V3</div>
                <div className="text-sm text-gray-400">DEMO/USDC • 0.3% Fee</div>
              </div>
            </div>
            <div className="text-lg font-bold text-white mb-1">$47,230</div>
            <div className="text-red-400 text-sm mb-2">↓ 15% (24h)</div>
            <div className="flex justify-between items-center">
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">CRITICAL</span>
              <span className="text-sm text-gray-400">12.4% slippage</span>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🍣</span>
              <div>
                <div className="font-semibold text-white">SushiSwap</div>
                <div className="text-sm text-gray-400">DEMO/ETH • 0.25% Fee</div>
              </div>
            </div>
            <div className="text-lg font-bold text-white mb-1">$32,180</div>
            <div className="text-yellow-400 text-sm mb-2">↓ 8% (24h)</div>
            <div className="flex justify-between items-center">
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">WARNING</span>
              <span className="text-sm text-gray-400">7.8% slippage</span>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🥞</span>
              <div>
                <div className="font-semibold text-white">PancakeSwap</div>
                <div className="text-sm text-gray-400">DEMO/BUSD • 0.25% Fee</div>
              </div>
            </div>
            <div className="text-lg font-bold text-white mb-1">$28,940</div>
            <div className="text-green-400 text-sm mb-2">↑ 5% (24h)</div>
            <div className="flex justify-between items-center">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">HEALTHY</span>
              <span className="text-sm text-gray-400">4.2% slippage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts - Built inline */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Recent Alerts</h3>
        
        <div className="space-y-4">
          <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">🚨</span>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Critical: Liquidity dropped below emergency threshold</h4>
                <p className="text-gray-300 text-sm mb-2">Total liquidity depth fell to $127K, triggering emergency protocols</p>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
            </div>
          </div>

          <div className="border border-yellow-500/30 bg-yellow-500/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Large LP withdrawal detected</h4>
                <p className="text-gray-300 text-sm mb-2">Whale LP removed $45K in liquidity from Uniswap V3 pool</p>
                <span className="text-xs text-gray-400">4 hours ago</span>
              </div>
            </div>
          </div>

          <div className="border border-blue-500/30 bg-blue-500/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">ℹ️</span>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">LP incentive program adjusted</h4>
                <p className="text-gray-300 text-sm mb-2">Increased rewards by 15% to attract new liquidity providers</p>
                <span className="text-xs text-gray-400">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Ready to Protect Your Liquidity?</h3>
        <p className="text-blue-100 mb-4">Stop watching your project die from bad liquidity. Get professional monitoring and emergency intervention.</p>
        <button 
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          onClick={() => alert('Contact us:\n📧 hello@liquidflow.com\n📱 Schedule a demo\n💬 Discord: /liquidflow')}
        >
          Start Free Trial
        </button>
      </div>
    </Layout>
  );
}
