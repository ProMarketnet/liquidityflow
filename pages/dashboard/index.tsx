import React, { useState, useEffect } from 'react';
import WalletBalance from '../../components/WalletBalance';
import TopTokenHoldings from '../../components/TopTokenHoldings';
import DeFiPositions from '../../components/DeFiPositions';

export default function DashboardPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wallet = localStorage.getItem('connectedWallet');
      setWalletAddress(wallet);
      setIsLoading(false);
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        localStorage.setItem('connectedWallet', address);
        setWalletAddress(address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to continue');
    }
  };

  // Debug: Log state
  console.log('Dashboard render:', { walletAddress, isLoading });

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--color-background)'
      }}>
        <div style={{ 
          background: 'var(--color-surface)',
          padding: 'var(--space-8)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--color-background)'
      }}>
        <div style={{ 
          background: 'var(--color-surface)',
          padding: 'var(--space-12)',
          textAlign: 'center',
          maxWidth: '500px',
          margin: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-6)' }}>🔗</div>
          <h2 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
            Connect Your Wallet
          </h2>
          <p style={{ marginBottom: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
            Connect your wallet to view your portfolio analytics and DeFi positions across all supported chains.
          </p>
          <button 
            onClick={connectWallet} 
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              padding: 'var(--space-4) var(--space-8)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Simple Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: 'var(--space-4) 0',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 var(--space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: '800',
            color: 'var(--color-text-primary)'
          }}>
            LiquidFlow
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
            <a href="/admin/portfolios" style={{ color: 'var(--color-success)', fontWeight: '600', textDecoration: 'none' }}>
              🏠 Home
            </a>
            <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>📊 Dashboard</span>
            <button 
              onClick={() => {
                localStorage.removeItem('connectedWallet');
                window.location.href = '/';
              }}
              style={{
                background: 'var(--color-error)',
                color: '#ffffff',
                border: 'none',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: 'var(--space-8) var(--space-4)' 
      }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
            Portfolio Dashboard
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Connected: <span style={{ 
              color: 'var(--color-primary)',
              fontWeight: '600',
              fontFamily: 'monospace'
            }}>
              {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </span>
          </p>
        </div>

        {/* Simple Grid for Components */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)'
        }}>
          {/* Wallet Balance */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)'
          }}>
            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
              💰 Wallet Balance
            </h3>
            {walletAddress && <WalletBalance walletAddress={walletAddress} />}
          </div>

          {/* Token Holdings */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)'
          }}>
            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
              🏆 Top Tokens
            </h3>
            {walletAddress && <TopTokenHoldings walletAddress={walletAddress} maxTokens={3} />}
          </div>

          {/* DeFi Positions */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)'
          }}>
            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
              🏊‍♂️ DeFi Positions
            </h3>
            {walletAddress && <DeFiPositions walletAddress={walletAddress} maxPositions={3} />}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)'
        }}>
          <h3 style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-primary)' }}>
            Quick Actions
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--space-4)'
          }}>
            <a href="/dashboard/pools" style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              textAlign: 'center',
              textDecoration: 'none',
              color: 'var(--color-text-primary)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>💧</div>
              <span>Explore Pools</span>
            </a>
            
            <a href="/admin/portfolios" style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              textAlign: 'center',
              textDecoration: 'none',
              color: 'var(--color-text-primary)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🏢</div>
              <span>Portfolio Management</span>
            </a>
            
            <a href="/admin/reports" style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              textAlign: 'center',
              textDecoration: 'none',
              color: 'var(--color-text-primary)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📊</div>
              <span>View Reports</span>
            </a>
            
            <a href="/dashboard/settings" style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              textAlign: 'center',
              textDecoration: 'none',
              color: 'var(--color-text-primary)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>⚙️</div>
              <span>Settings</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
