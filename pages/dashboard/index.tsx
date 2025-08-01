import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import WalletBalance from '../../components/WalletBalance';
import TopTokenHoldings from '../../components/TopTokenHoldings';
import DeFiPositions from '../../components/DeFiPositions';

interface PortfolioData {
  totalUsd: number;
  ethBalance: number;
  ethUsd: number;
  tokens: Array<{
    name: string;
    symbol: string;
    balance: number;
    usdValue: number;
    logo?: string;
  }>;
}

interface DeFiData {
  protocols: Array<{
    name: string;
    positions: Array<{
      label: string;
      value: number;
    }>;
  }>;
}

export default function DashboardPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [defiData, setDefiData] = useState<DeFiData | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wallet = localStorage.getItem('connectedWallet');
      setWalletAddress(wallet);
      
      if (wallet) {
        loadDashboardData(wallet);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const loadDashboardData = async (address: string) => {
    setIsLoading(true);
    try {
      const [portfolioRes, defiRes] = await Promise.all([
        fetch(`/api/wallet/portfolio?address=${address}`),
        fetch(`/api/wallet/defi?address=${address}`)
      ]);

      if (portfolioRes.ok) {
        const portfolio = await portfolioRes.json();
        setPortfolioData(portfolio);
      }

      if (defiRes.ok) {
        const defi = await defiRes.json();
        setDefiData(defi);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        localStorage.setItem('connectedWallet', address);
        setWalletAddress(address);
        loadDashboardData(address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to continue');
    }
  };

  if (!walletAddress) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#ffffff', // 🚨 EMERGENCY WHITE BACKGROUND FOR VISIBILITY
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#ffffff', // 🚨 EMERGENCY WHITE CARD BACKGROUND
          border: '2px solid #000000', // 🚨 EMERGENCY BLACK BORDER
          borderRadius: '1rem',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔗</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000000', marginBottom: '1rem' }}> {/* 🚨 EMERGENCY BLACK TEXT */}
            Connect Your Wallet
          </h2>
          <p style={{ color: '#000000', marginBottom: '2rem' }}> {/* 🚨 EMERGENCY BLACK TEXT */}
            Connect your wallet to view your dashboard and portfolio data
          </p>
          <button
            onClick={connectWallet}
            style={{
              background: '#000000', // 🚨 EMERGENCY BLACK BUTTON
              color: '#ffffff', // 🚨 EMERGENCY WHITE TEXT
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff', // 🚨 EMERGENCY WHITE BACKGROUND FOR VISIBILITY
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        background: '#ffffff', // 🚨 EMERGENCY WHITE NAV
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: '#000000', // 🚨 EMERGENCY BLACK LOGO
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            LiquidFlow
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 'bold' }}>🏠 Home</a>
            <a href="/dashboard" style={{ color: '#000000', textDecoration: 'none' }}>📊 Overview</a> {/* 🚨 EMERGENCY BLACK TEXT */}
            <a href="/dashboard/pools" style={{ color: '#000000', textDecoration: 'none' }}>💧 Liquidity Pools</a> {/* 🚨 EMERGENCY BLACK TEXT */}
            <a href="/dashboard/alerts" style={{ color: '#000000', textDecoration: 'none' }}>🚨 Alerts & Monitoring</a> {/* 🚨 EMERGENCY BLACK TEXT */}
            <a href="/dashboard/settings" style={{ color: '#000000', textDecoration: 'none' }}>⚙️ Settings</a> {/* 🚨 EMERGENCY BLACK TEXT */}
            <div style={{ borderLeft: '2px solid #000000', height: '20px', margin: '0 1rem' }}></div>
            <a href="/admin/wallets" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: 'bold' }}>💳 Wallets</a>
            <a href="/admin/portfolios" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: 'bold' }}>🏢 Admin</a>
            <a href="/admin/analytics" style={{ color: '#dc2626', textDecoration: 'none' }}>📊 Analytics</a>
            <div style={{ borderLeft: '2px solid #000000', height: '20px', margin: '0 1rem' }}></div>
            <button 
              onClick={() => {
                localStorage.removeItem('connectedWallet');
                window.location.href = '/';
              }}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#000000', marginBottom: '0.5rem' }}> {/* 🚨 EMERGENCY BLACK TEXT */}
              Dashboard
            </h1>
            <p style={{ color: '#000000' }}> {/* 🚨 EMERGENCY BLACK TEXT */}
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            
            {/* 🏢 ADMIN QUICK ACCESS PANEL */}
            <div style={{ 
              background: '#fef2f2', 
              border: '3px solid #dc2626', 
              borderRadius: '1rem', 
              padding: '1.5rem', 
              margin: '1.5rem 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                  🏢 Admin Portfolio Management
                </h3>
                <p style={{ color: '#000000', fontSize: '0.875rem' }}>
                  Manage all 50+ client portfolios and view platform-wide analytics
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a 
                  href="/admin/portfolios"
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    padding: '1rem 1.5rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  💼 Manage Portfolios
                </a>
                <a 
                  href="/admin/analytics"
                  style={{
                    background: '#ffffff',
                    color: '#dc2626',
                    border: '2px solid #dc2626',
                    padding: '1rem 1.5rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  📊 View Analytics
                </a>
              </div>
            </div>

            <button
              onClick={() => loadDashboardData(walletAddress)}
              style={{
                background: '#000000', // 🚨 EMERGENCY BLACK BUTTON
                color: '#ffffff', // 🚨 EMERGENCY WHITE TEXT
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '0.5rem'
              }}
              disabled={isLoading}
            >
              {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {/* Real-time Wallet Balance */}
          {walletAddress && (
            <WalletBalance walletAddress={walletAddress} showChains={true} />
          )}

          {/* Real-time Data Sections */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Real Token Holdings */}
            {walletAddress && (
              <TopTokenHoldings walletAddress={walletAddress} maxTokens={5} />
            )}

            {/* Real DeFi Positions */}
            {walletAddress && (
              <DeFiPositions walletAddress={walletAddress} maxPositions={5} />
            )}
          </div>

          {/* Quick Actions */}
          <div style={{
            marginTop: '2rem',
            background: '#ffffff', // 🚨 EMERGENCY WHITE BACKGROUND
            border: '3px solid #000000', // 🚨 EMERGENCY BLACK BORDER
            borderRadius: '1rem',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000000', marginBottom: '1rem' }}> {/* 🚨 EMERGENCY BLACK TEXT */}
              Quick Actions
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href="/dashboard/pools"
                style={{
                  background: '#3b82f6',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  border: '2px solid #3b82f6'
                }}
              >
                🏊 View Liquidity Pools
              </a>
              <a
                href="/dashboard/alerts"
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  border: '2px solid #f59e0b'
                }}
              >
                🔔 Manage Alerts
              </a>
              <a
                href="/dashboard/settings"
                style={{
                  background: '#6b7280',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  border: '2px solid #6b7280'
                }}
              >
                ⚙️ Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
