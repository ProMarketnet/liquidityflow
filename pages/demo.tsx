import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { PoolsTable } from '@/components/dashboard/PoolsTable';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { LiquidityChart } from '@/components/dashboard/LiquidityChart';

// Mock data for demo with correct types
const mockStats = {
  totalLiquidity: 127450,
  maxSlippage: 8.7,
  activeLPs: 47,
  volume24h: 18340
};

const mockPools = [
  {
    id: '1',
    dex: 'uniswap',
    version: 'v3',
    pair: 'DEMO/USDC',
    fee: 0.3,
    liquidity: 47230,
    liquidityChange: -15,
    volume24h: 8420,
    health: 'critical' as const, // Fix: Use 'as const' for literal types
    slippage: 12.4,
    lpCount: 14
  },
  {
    id: '2',
    dex: 'sushiswap',
    pair: 'DEMO/ETH',
    fee: 0.25,
    liquidity: 32180,
    liquidityChange: -8,
    volume24h: 5670,
    health: 'warning' as const, // Fix: Use 'as const'
    slippage: 7.8,
    lpCount: 18
  },
  {
    id: '3',
    dex: 'pancakeswap',
    pair: 'DEMO/BUSD',
    fee: 0.25,
    liquidity: 28940,
    liquidityChange: 5,
    volume24h: 3240,
    health: 'healthy' as const, // Fix: Use 'as const'
    slippage: 4.2,
    lpCount: 22
  }
];

const mockAlerts = [
  {
    id: '1',
    type: 'critical' as const, // Fix: Use 'as const'
    title: 'Critical: Liquidity dropped below emergency threshold',
    description: 'Total liquidity depth fell to $127K, triggering emergency protocols',
    time: '2 hours ago'
  },
  {
    id: '2',
    type: 'warning' as const, // Fix: Use 'as const'
    title: 'Large LP withdrawal detected',
    description: 'Whale LP removed $45K in liquidity from Uniswap V3 pool',
    time: '4 hours ago'
  },
  {
    id: '3',
    type: 'info' as const, // Fix: Use 'as const'
    title: 'LP incentive program adjusted',
    description: 'Increased rewards by 15% to attract new liquidity providers',
    time: '6 hours ago'
  }
];

export default function DemoPage() {
  const [isLive, setIsLive] = useState(true);
  const [stats, setStats] = useState(mockStats);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalLiquidity: prev.totalLiquidity + (Math.random() * 2000 - 1000),
        maxSlippage: Math.max(0.1, prev.maxSlippage + (Math.random() * 0.6 - 0.3))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <Layout title="LiquidFlow Demo Dashboard" showSidebar={true}>
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 mb-6 rounded-lg flex justify-between items-center">
        <div className="text-white font-semibold">
          🎯 This is a DEMO dashboard - See how LiquidFlow monitors your project
        </div>
        <button 
          className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
          onClick={() => alert('Ready to start? Contact sales@liquidflow.io')}
        >
          Start Free Trial
        </button>
      </div>

      {/* Project Header */}
      <div className="flex justify-between items-center mb-6">
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
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            onClick={() => alert('Emergency liquidity injection would be triggered!')}
          >
            🚨 Emergency Action
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <LiquidityChart />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Pool Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">🦄 Uniswap V3</span>
              <span className="text-white font-semibold">67%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">🍣 SushiSwap</span>
              <span className="text-white font-semibold">23%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">🥞 PancakeSwap</span>
              <span className="text-white font-semibold">10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pools Table */}
      <div className="mb-8">
        <PoolsTable pools={mockPools} />
      </div>

      {/* Alerts */}
      <AlertsList alerts={mockAlerts} />
    </Layout>
  );
}
