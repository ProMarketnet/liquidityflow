import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
  poolAddress?: string;
  walletAddress?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Get connected wallet
    if (typeof window !== 'undefined') {
      const wallet = localStorage.getItem('connectedWallet');
      setWalletAddress(wallet);
      if (wallet) {
        loadAlerts(wallet);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const loadAlerts = async (address: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from your alerts API
      const response = await fetch(`/api/alerts?address=${address}`);
      if (response.ok) {
        const alertsData = await response.json();
        setAlerts(alertsData);
      } else {
        // For now, show empty state since alerts API doesn't exist yet
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'border-red-500/50 bg-red-900/20';
      case 'warning': return 'border-yellow-500/50 bg-yellow-900/20';
      case 'info': return 'border-blue-500/50 bg-blue-900/20';
      default: return 'border-gray-500/50 bg-gray-900/20';
    }
  };

  if (!walletAddress) {
    return (
      <Layout title="Alerts & Monitoring" showSidebar={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">Connect your wallet to view alerts and monitoring</p>
            <a
              href="/onboarding-new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Get Started
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Alerts & Monitoring" showSidebar={true}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Alerts & Monitoring</h1>
            <p className="text-gray-400 mt-1">
              Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
          <button
            onClick={() => walletAddress && loadAlerts(walletAddress)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded mb-4"></div>
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-xl p-6 ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {alert.title}
                      </h3>
                      <p className="text-gray-300 mb-2">{alert.description}</p>
                      <div className="text-sm text-gray-400">{alert.time}</div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔕</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Alerts Yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Your wallet monitoring is active. Alerts will appear here when there are important 
              changes to your liquidity positions or unusual activity.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Alert Settings</h3>
              <p className="text-gray-400 text-sm mb-4">
                Configure your alert preferences in settings to receive notifications for:
              </p>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Price movements above threshold</li>
                <li>• Low liquidity warnings</li>
                <li>• High slippage detection</li>
                <li>• Unusual trading volume</li>
              </ul>
              <a
                href="/dashboard/settings"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Configure Alerts
              </a>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
