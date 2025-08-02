import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getUserRole, getUserPermissions } from '../../lib/privy-config';

export default function AdminAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [userRole, setUserRole] = useState<'customer' | 'admin' | 'super_admin'>('customer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      setLoading(false);
      if (authenticated && user) {
        const role = getUserRole(user);
        setUserRole(role);
        
        // Check if user has admin access
        if (role === 'admin' || role === 'super_admin') {
          // Store admin session
          localStorage.setItem('liquidflow_admin_session', JSON.stringify({
            userId: user.id,
            role: role,
            permissions: getUserPermissions(role),
            walletAddress: user.wallet?.address,
            email: user.email?.address,
            loginTime: new Date().toISOString()
          }));
          
          // Redirect to admin dashboard after short delay
          setTimeout(() => {
            router.push('/admin/portfolios');
          }, 2000);
        }
      }
    }
  }, [ready, authenticated, user, router]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('liquidflow_admin_session');
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Head>
          <title>Loading - LiquidFlow Admin</title>
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
            
            <Link href="/" className="nav-link">
              🏠 Back to Home
            </Link>
          </div>
        </nav>
        
        <main className="container" style={{ 
          padding: 'var(--space-16) var(--space-4)',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div className="card card-elevated" style={{ padding: 'var(--space-8)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🔄</div>
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Loading...</h1>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              Initializing authentication system
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Head>
        <title>Admin Authentication - LiquidFlow</title>
        <meta name="description" content="Secure admin access for LiquidFlow portfolio management" />
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
          
          <Link href="/" className="nav-link">
            🏠 Back to Home
          </Link>
        </div>
      </nav>
      
      <main className="container" style={{ 
        padding: 'var(--space-16) var(--space-4)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div className="card card-elevated" style={{ 
          padding: 'var(--space-8)',
          textAlign: 'center'
        }}>
          {!authenticated ? (
            <div className="animate-fade-in">
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🏢</div>
              <h1 style={{ marginBottom: 'var(--space-4)' }}>
                Admin Access
              </h1>
              <p style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-6)',
                lineHeight: '1.6'
              }}>
                Connect your admin wallet or use email to access portfolio management features
              </p>
              
              {/* Security Features Card */}
              <div className="card" style={{
                background: 'var(--color-info-light)',
                border: `1px solid var(--color-info)`,
                padding: 'var(--space-6)',
                marginBottom: 'var(--space-6)'
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-lg)',
                    color: '#ffffff'
                  }}>
                    🔐
                  </div>
                  <h3 style={{ margin: 0, color: 'var(--color-info)' }}>
                    Secure Authentication
                  </h3>
                </div>
                
                <div style={{ 
                  textAlign: 'left',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6'
                }}>
                  • Multi-wallet support (MetaMask, Coinbase, WalletConnect)<br/>
                  • Solana wallets (Phantom, Solflare)<br/>
                  • Email-based authentication<br/>
                  • Automatic role detection
                </div>
              </div>
              
              <button 
                onClick={handleLogin} 
                className="btn btn-primary btn-lg"
                style={{
                  fontSize: 'var(--font-size-lg)',
                  padding: 'var(--space-4) var(--space-8)'
                }}
              >
                🚀 Connect & Login
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              {userRole === 'admin' || userRole === 'super_admin' ? (
                <div>
                  {/* Success Header */}
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>✅</div>
                    <h1 style={{ marginBottom: 'var(--space-2)' }}>
                      Admin Access Granted
                    </h1>
                    <p style={{
                      fontSize: 'var(--font-size-base)',
                      color: 'var(--color-text-secondary)',
                      margin: 0
                    }}>
                      Welcome! You have been authenticated as an administrator.
                    </p>
                  </div>
                  
                  {/* Access Level Card */}
                  <div className="card" style={{
                    background: 'var(--color-success-light)',
                    border: `1px solid var(--color-success)`,
                    padding: 'var(--space-6)',
                    marginBottom: 'var(--space-6)'
                  }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--font-size-lg)',
                        color: '#ffffff'
                      }}>
                        👤
                      </div>
                      <h3 style={{ margin: 0, color: 'var(--color-success)' }}>
                        Your Access Level
                      </h3>
                    </div>
                    
                    <div className={`badge ${userRole === 'super_admin' ? 'badge-error' : 'badge-warning'}`} style={{
                      fontSize: 'var(--font-size-base)',
                      padding: 'var(--space-3) var(--space-4)',
                      marginBottom: 'var(--space-4)',
                      fontWeight: '700'
                    }}>
                      {userRole === 'super_admin' ? '🔴 SUPER ADMIN' : '🟡 ADMIN'}
                    </div>
                    
                    <div style={{ 
                      textAlign: 'left',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6'
                    }}>
                      <div style={{ marginBottom: 'var(--space-1)' }}>
                        <strong>Connected:</strong>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-1)' }}>
                        📧 {user?.email?.address || 'No email'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-1)' }}>
                        💼 {user?.wallet?.address ? 
                          `${user.wallet.address.slice(0, 8)}...${user.wallet.address.slice(-8)}` : 
                          'No wallet connected'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)' }}>
                        🌐 {user?.wallet?.chainType || 'ethereum'}
                      </div>
                    </div>
                  </div>
                  
                  <p style={{ 
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-tertiary)',
                    marginBottom: 'var(--space-6)'
                  }}>
                    Redirecting to admin dashboard in a moment...
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Link 
                      href="/admin/portfolios"
                      className="btn btn-primary"
                      style={{
                        padding: 'var(--space-3) var(--space-6)',
                        textDecoration: 'none'
                      }}
                    >
                      💼 Go to Admin Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="btn btn-secondary"
                      style={{
                        padding: 'var(--space-3) var(--space-6)'
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Access Denied Header */}
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>❌</div>
                    <h1 style={{ marginBottom: 'var(--space-2)' }}>
                      Access Denied
                    </h1>
                    <p style={{
                      fontSize: 'var(--font-size-base)',
                      color: 'var(--color-text-secondary)',
                      margin: 0
                    }}>
                      Your wallet is not authorized for admin access.
                    </p>
                  </div>
                  
                  {/* Customer Access Card */}
                  <div className="card" style={{
                    background: 'var(--color-error-light)',
                    border: `1px solid var(--color-error)`,
                    padding: 'var(--space-6)',
                    marginBottom: 'var(--space-6)'
                  }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-error)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--font-size-lg)',
                        color: '#ffffff'
                      }}>
                        👤
                      </div>
                      <h3 style={{ margin: 0, color: 'var(--color-error)' }}>
                        Your Current Access
                      </h3>
                    </div>
                    
                    <div className="badge badge-success" style={{
                      fontSize: 'var(--font-size-base)',
                      padding: 'var(--space-3) var(--space-4)',
                      marginBottom: 'var(--space-4)',
                      fontWeight: '700'
                    }}>
                      🟢 CUSTOMER ACCESS
                    </div>
                    
                    <p style={{ 
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                      lineHeight: '1.6'
                    }}>
                      You can still use LiquidFlow as a regular user to view your own portfolio and research other wallets.
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Link 
                      href="/onboarding-new"
                      className="btn btn-success"
                      style={{
                        padding: 'var(--space-3) var(--space-6)',
                        textDecoration: 'none'
                      }}
                    >
                      👀 Use as Customer
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="btn btn-secondary"
                      style={{
                        padding: 'var(--space-3) var(--space-6)'
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Footer Card */}
          <div className="card" style={{
            background: 'var(--color-surface)',
            padding: 'var(--space-4)',
            marginTop: 'var(--space-8)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
              fontWeight: '600'
            }}>
              🔒 Powered by Privy Authentication
            </h4>
            <p style={{ 
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              margin: 0
            }}>
              Secure, decentralized authentication with support for 15+ wallet types and email login
            </p>
          </div>
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