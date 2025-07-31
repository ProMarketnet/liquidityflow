import React from 'react';
import { Layout } from '@/components/layout/Layout';

// Mock alert data
const mockAlerts = [
  {
    id: '1',
    type: 'critical' as const,
    title: 'High Slippage Detected',
    description: 'ETH/USDC pool experiencing 12% slippage',
    time: '2 minutes ago'
  },
  {
    id: '2', 
    type: 'warning' as const,
    title: 'Low Liquidity Warning',
    description: 'BTC/ETH pool below minimum liquidity threshold',
    time: '15 minutes ago'
  },
  {
    id: '3',
    type: 'info' as const,
    title: 'New Pool Added',
    description: 'MATIC/USDC pool successfully added to monitoring',
    time: '1 hour ago'
  }
];

export default function AlertsPage() {
  return (
    <Layout title="Alerts - LiquidFlow" showSidebar={true}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Alerts</h1>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {mockAlerts.map((alert) => (
            <div 
              key={alert.id}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    alert.type === 'critical' ? 'bg-red-500' :
                    alert.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {alert.title}
                    </h3>
                    <p className="text-gray-400 mb-2">
                      {alert.description}
                    </p>
                    <span className="text-sm text-gray-500">
                      {alert.time}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  alert.type === 'critical' ? 'bg-red-500/20 text-red-300' :
                  alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {alert.type.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if no alerts */}
        {mockAlerts.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Active Alerts</h3>
            <p className="text-gray-400">All your liquidity pools are running smoothly</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
