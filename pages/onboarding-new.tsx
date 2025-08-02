import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function OnboardingNew() {
  const [step, setStep] = useState(1);
  const [walletAddress, setWalletAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        // Save to localStorage for dashboard access
        localStorage.setItem('connectedWallet', accounts[0]);
        setStep(2);
        // Automatically start analysis
        startAnalysis();
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to continue');
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Auto-scan all supported chains in parallel
    const chains = ['ethereum', 'arbitrum', 'base', 'optimism', 'solana'];
    
    try {
      // Simulate multi-chain analysis (in production, these would be real API calls)
      console.log('🔍 Scanning all chains automatically:', chains);
      
      // Wait 3 seconds to show the analysis process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Auto-redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Head>
        <title>Get Started - LiquidFlow</title>
        <meta name="description" content="Connect your wallet and start monitoring" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Premium Navigation */}
      <nav className="nav" style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: 'var(--space-4) 0'
      }}>
        <div className="container flex justify-between items-center">
          <Link href="/" style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: '800',
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            letterSpacing: '-0.025em'
          }}>
            LiquidFlow
          </Link>
          
          <Link href="/" className="nav-link" style={{ 
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)'
          }}>
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ 
        padding: 'var(--space-16) var(--space-4) var(--space-8)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>

        {/* Progress Indicator - Now only 2 steps */}
        <div className="flex justify-center mb-8 gap-4">
          {[1, 2].map((num) => (
            <div key={num} style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: step >= num ? 'var(--color-primary)' : 'var(--color-border)',
              color: step >= num ? '#ffffff' : 'var(--color-text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: 'var(--font-size-lg)',
              transition: 'all 0.3s ease'
            }}>
              {step > num ? '✓' : num}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="card card-elevated" style={{ 
          padding: 'var(--space-8)',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto'
        }}>

          {/* Step 1: Connect Wallet */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🚀</div>
              <h1 style={{ marginBottom: 'var(--space-4)' }}>
                Connect Your Wallet
              </h1>
              <p style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-6)',
                lineHeight: '1.6'
              }}>
                Connect your wallet to automatically scan all supported chains and discover your DeFi positions
              </p>
              
              <button
                onClick={connectWallet}
                className="btn btn-primary btn-lg"
                style={{
                  fontSize: 'var(--font-size-lg)',
                  padding: 'var(--space-4) var(--space-8)',
                  marginBottom: 'var(--space-8)'
                }}
              >
                🔗 Connect Wallet
              </button>

              {/* Supported Chains Preview */}
              <div style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                marginBottom: 'var(--space-6)'
              }}>
                <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                  🌐 Auto-scanning supported chains:
                </h3>
                <div className="flex justify-center gap-4 flex-wrap">
                  {[
                    { name: 'Ethereum', logo: '⟠', color: '#627EEA' },
                    { name: 'Arbitrum', logo: '🔵', color: '#28A0F0' },
                    { name: 'Base', logo: '🔷', color: '#0052FF' },
                    { name: 'Optimism', logo: '🔴', color: '#FF0420' },
                    { name: 'Solana', logo: '◉', color: '#9945FF' }
                  ].map((chain) => (
                    <div key={chain.name} className="flex items-center gap-2 badge badge-info" style={{
                      padding: 'var(--space-2) var(--space-3)',
                      fontSize: 'var(--font-size-sm)'
                    }}>
                      <span style={{ fontSize: 'var(--font-size-base)' }}>{chain.logo}</span>
                      <span>{chain.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-3" style={{ gap: 'var(--space-4)' }}>
                {[
                  { icon: '✨', title: 'Real-time Portfolio', desc: 'Live wallet tracking' },
                  { icon: '📊', title: 'DeFi Positions', desc: 'All protocols monitored' },
                  { icon: '🔔', title: 'Smart Alerts', desc: 'Automated notifications' }
                ].map((feature, i) => (
                  <div key={i} className="card" style={{
                    padding: 'var(--space-4)',
                    background: 'var(--color-background)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>{feature.icon}</div>
                    <h4 style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      fontWeight: '600', 
                      marginBottom: 'var(--space-1)',
                      color: 'var(--color-text-primary)'
                    }}>
                      {feature.title}
                    </h4>
                    <p style={{ 
                      fontSize: 'var(--font-size-xs)', 
                      color: 'var(--color-text-tertiary)',
                      margin: 0
                    }}>
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Analysis & Auto-redirect */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>
                  {isAnalyzing ? '🔍' : '✅'}
                </div>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>
                  {isAnalyzing ? 'Analyzing Your Portfolio' : 'Wallet Connected!'}
                </h1>
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Connected: <code style={{ 
                    background: 'var(--color-surface)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </code>
                </p>
              </div>
              
              {isAnalyzing ? (
                <div style={{ textAlign: 'center' }}>
                  <div className="animate-pulse" style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-6)',
                    marginBottom: 'var(--space-6)'
                  }}>
                    <h3 style={{ 
                      marginBottom: 'var(--space-4)',
                      color: 'var(--color-primary)'
                    }}>
                      🌐 Scanning all chains automatically...
                    </h3>
                    
                    {/* Chain scanning progress */}
                    <div className="grid grid-cols-5" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                      {[
                        { name: 'Ethereum', logo: '⟠' },
                        { name: 'Arbitrum', logo: '🔵' },
                        { name: 'Base', logo: '🔷' },
                        { name: 'Optimism', logo: '🔴' },
                        { name: 'Solana', logo: '◉' }
                      ].map((chain, index) => (
                        <div key={chain.name} className="card" style={{
                          padding: 'var(--space-3)',
                          background: 'var(--color-background)',
                          textAlign: 'center',
                          minHeight: '80px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          animation: `pulse 2s ease-in-out ${index * 0.2}s infinite`
                        }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>{chain.logo}</div>
                          <div style={{ 
                            fontSize: 'var(--font-size-xs)', 
                            color: 'var(--color-text-tertiary)'
                          }}>
                            {chain.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p style={{ 
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--font-size-sm)',
                      margin: 0
                    }}>
                      Discovering DeFi positions, tokens, and liquidity pools...
                    </p>
                  </div>
                  
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-tertiary)'
                  }}>
                    Redirecting to dashboard in a moment...
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{
                    fontSize: 'var(--font-size-lg)',
                    color: 'var(--color-success)',
                    marginBottom: 'var(--space-6)'
                  }}>
                    🎉 Analysis complete! Your dashboard is ready.
                  </p>
                  
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Link href="/dashboard" className="btn btn-primary btn-lg">
                      📊 Go to Dashboard
                    </Link>
                    
                    <Link href="/dashboard/pools" className="btn btn-secondary">
                      🏊 View Pools
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--space-8) 0',
        marginTop: 'var(--space-16)'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-tertiary)',
            margin: 0
          }}>
            © 2025 LiquidFlow. Professional DeFi portfolio management platform.
          </p>
        </div>
      </footer>
    </div>
  );
} 