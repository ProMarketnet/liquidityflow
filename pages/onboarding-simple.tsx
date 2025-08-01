import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function OnboardingSimple() {
  const [step, setStep] = useState(1);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setStep(2);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to continue');
    }
  };

  return (
    <>
      <Head>
        <title>Get Started - LiquidFlow</title>
        <meta name="description" content="Connect your wallet and start monitoring" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b, #581c87)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        
        {/* Navigation */}
        <nav style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1000,
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
            <Link href="/" style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textDecoration: 'none'
            }}>
              LiquidFlow
            </Link>
            
            <Link href="/" style={{ 
              color: '#cbd5e1', 
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}>
              ← Back to Home
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <div style={{
          paddingTop: '120px',
          paddingBottom: '60px',
          maxWidth: '800px',
          margin: '0 auto',
          padding: '120px 2rem 60px'
        }}>

          {/* Progress Indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '3rem',
            gap: '1rem'
          }}>
            {[1, 2, 3].map((num) => (
              <div key={num} style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step >= num ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255,255,255,0.2)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>
                {step > num ? '✓' : num}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '3rem 2rem',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center'
          }}>

            {/* Step 1: Connect Wallet */}
            {step === 1 && (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '1rem',
                  lineHeight: '1.2'
                }}>
                  Connect Your Wallet
                </h1>
                <p style={{
                  fontSize: '1.2rem',
                  color: '#cbd5e1',
                  marginBottom: '2rem',
                  lineHeight: '1.6'
                }}>
                  Connect your wallet to start monitoring liquidity pools and track your DeFi positions
                </p>
                
                <button
                  onClick={connectWallet}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                  }}
                >
                  🔗 Connect Wallet
                </button>

                <div style={{
                  marginTop: '2rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {[
                    { icon: '✨', title: 'Real-time Portfolio', desc: 'Track your wallet balance' },
                    { icon: '📊', title: 'DeFi Positions', desc: 'Monitor protocol interactions' },
                    { icon: '🔔', title: 'Smart Alerts', desc: 'Get notified of changes' }
                  ].map((feature, i) => (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '1.5rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
                      <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        {feature.title}
                      </h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Wallet Connected */}
            {step === 2 && (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  Wallet Connected!
                </h1>
                <p style={{
                  fontSize: '1.2rem',
                  color: '#cbd5e1',
                  marginBottom: '1rem'
                }}>
                  Successfully connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: '#94a3b8',
                  marginBottom: '2rem'
                }}>
                  Now we'll analyze your wallet and find relevant liquidity pools to monitor.
                </p>
                
                <button
                  onClick={() => setStep(3)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  🔍 Analyze My Wallet →
                </button>
              </>
            )}

            {/* Step 3: Setup Complete */}
            {step === 3 && (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  You're All Set!
                </h1>
                <p style={{
                  fontSize: '1.2rem',
                  color: '#cbd5e1',
                  marginBottom: '2rem'
                }}>
                  Your liquidity monitoring is now active. Start exploring your dashboard!
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/dashboard" style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                  }}>
                    📊 Go to Dashboard
                  </Link>
                  
                  <Link href="/dashboard/pools" style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    🏊 View Pools
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
} 