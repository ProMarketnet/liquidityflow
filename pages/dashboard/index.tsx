import React from 'react';
import { Layout } from '@/components/layout/Layout';

// Simple demo data
const mockStats = {
  totalLiquidity: 127450,
  maxSlippage: 8.7,
  activeLPs: 47,
  volume24h: 18340
};

export default function DashboardPage() {
  return (
    <Layout title="Dashboard" showSidebar={true}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>

        {/* Simple Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-2xl mb-2">💧</div>
            <div className="text-2xl font-bold text-white">${mockStats.totalLiquidity.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Total Liquidity</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-2xl mb-2">📉</div>
            <div className="text-2xl font-bold text-white">{mockStats.maxSlippage}%</div>
            <div className="text-gray-400 text-sm">Max Slippage</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-2xl font-bold text-white">{mockStats.activeLPs}</div>
            <div className="text-gray-400 text-sm">Active LPs</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-2xl font-bold text-white">${mockStats.volume24h.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">24h Volume</div>
          </div>
        </div>

        {/* Simple Chart Placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Liquidity Overview</h3>
          <div className="h-64 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <div className="text-white font-semibold">Dashboard Coming Soon</div>
              <div className="text-gray-400">Real-time charts and analytics</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
