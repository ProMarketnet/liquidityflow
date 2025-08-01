import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { getUserRole, getUserPermissions } from '../../lib/privy-config';

export default function AdminAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [userRole, setUserRole] = useState<'customer' | 'admin' | 'super_admin'>('customer');
  const [loading, setLoading] = useState(true);

  // 🎨 INLINE STYLES FOR GUARANTEED VISIBILITY
  const styles = {
    page: {
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#000000',
      padding: '2rem 1rem'
    },
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      background: '#ffffff',
      borderRadius: '1rem',
      border: '2px solid #e5e7eb',
      padding: '2rem',
      textAlign: 'center' as const
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '1rem'
    },
    subtitle: {
      color: '#666666',
      fontSize: '1rem',
      marginBottom: '2rem'
    },
    button: {
      background: '#dc2626',
      color: '#ffffff',
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginBottom: '1rem'
    },
    successCard: {
      background: '#f0fdf4',
      border: '2px solid #16a34a',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem'
    },
    errorCard: {
      background: '#fef2f2',
      border: '2px solid #dc2626',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem'
    },
    roleCard: {
      background: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '1rem',
      padding: '1rem',
      marginBottom: '1rem'
    },
    homeBtn: {
      background: '#16a34a',
      color: '#ffffff',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontWeight: 'bold',
      display: 'inline-block',
      marginBottom: '2rem'
    }
  };

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
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>🔄 Loading...</h1>
          <p style={styles.subtitle}>Initializing authentication system</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Authentication - LiquidFlow</title>
        <meta name="description" content="Secure admin access for LiquidFlow portfolio management" />
      </Head>
      
      <div style={styles.page}>
        <a href="/" style={styles.homeBtn}>🏠 Back to Home</a>
        
        <div style={styles.container}>
          {!authenticated ? (
            <>
              <h1 style={styles.title}>🏢 Admin Access</h1>
              <p style={styles.subtitle}>
                Connect your admin wallet or use email to access portfolio management features
              </p>
              
              <div style={{
                background: '#f0f9ff',
                border: '2px solid #0ea5e9',
                borderRadius: '1rem',
                padding: '1rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{ color: '#0ea5e9', marginBottom: '0.5rem' }}>🔐 Secure Authentication</h3>
                <p style={{ color: '#666666', fontSize: '0.875rem', margin: 0 }}>
                  • Multi-wallet support (MetaMask, Coinbase, WalletConnect)<br/>
                  • Solana wallets (Phantom, Solflare)<br/>
                  • Email-based authentication<br/>
                  • Automatic role detection
                </p>
              </div>
              
              <button onClick={handleLogin} style={styles.button}>
                🚀 Connect & Login
              </button>
            </>
          ) : (
            <>
              {userRole === 'admin' || userRole === 'super_admin' ? (
                <div style={styles.successCard}>
                  <h1 style={styles.title}>✅ Admin Access Granted</h1>
                  <p style={styles.subtitle}>
                    Welcome! You have been authenticated as an administrator.
                  </p>
                  
                  <div style={styles.roleCard}>
                    <h3 style={{ color: '#000000', marginBottom: '0.5rem' }}>👤 Your Access Level</h3>
                    <div style={{
                      background: userRole === 'super_admin' ? '#dc2626' : '#f59e0b',
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: 'bold',
                      marginBottom: '1rem'
                    }}>
                      {userRole === 'super_admin' ? '🔴 SUPER ADMIN' : '🟡 ADMIN'}
                    </div>
                    
                    <div style={{ textAlign: 'left', fontSize: '0.875rem', color: '#666666' }}>
                      <strong>Connected:</strong><br/>
                      📧 {user?.email?.address || 'No email'}<br/>
                      💼 {user?.wallet?.address ? 
                        `${user.wallet.address.slice(0, 8)}...${user.wallet.address.slice(-8)}` : 
                        'No wallet connected'}<br/>
                      🌐 {user?.wallet?.chainType || 'Unknown chain'}
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '0.875rem', color: '#666666', marginBottom: '2rem' }}>
                    Redirecting to admin dashboard in a moment...
                  </p>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <a 
                      href="/admin/portfolios"
                      style={{
                        background: '#dc2626',
                        color: '#ffffff',
                        padding: '1rem 2rem',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      💼 Go to Admin Dashboard
                    </a>
                    <button onClick={handleLogout} style={{
                      background: '#ffffff',
                      color: '#dc2626',
                      border: '2px solid #dc2626',
                      padding: '1rem 2rem',
                      borderRadius: '0.5rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>
                      🚪 Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.errorCard}>
                  <h1 style={styles.title}>❌ Access Denied</h1>
                  <p style={styles.subtitle}>
                    Your wallet is not authorized for admin access.
                  </p>
                  
                  <div style={styles.roleCard}>
                    <h3 style={{ color: '#000000', marginBottom: '0.5rem' }}>👤 Your Current Access</h3>
                    <div style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: 'bold',
                      marginBottom: '1rem'
                    }}>
                      🟢 CUSTOMER ACCESS
                    </div>
                    
                    <p style={{ fontSize: '0.875rem', color: '#666666' }}>
                      You can still use LiquidFlow as a regular user to view your own portfolio and research other wallets.
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <a 
                      href="/onboarding-new"
                      style={{
                        background: '#16a34a',
                        color: '#ffffff',
                        padding: '1rem 2rem',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      👀 Use as Customer
                    </a>
                    <button onClick={handleLogout} style={{
                      background: '#ffffff',
                      color: '#dc2626',
                      border: '2px solid #dc2626',
                      padding: '1rem 2rem',
                      borderRadius: '0.5rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div style={{
            background: '#f9fafb',
            border: '2px solid #e5e7eb',
            borderRadius: '1rem',
            padding: '1rem',
            marginTop: '2rem'
          }}>
            <h4 style={{ color: '#000000', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              🔒 Powered by Privy Authentication
            </h4>
            <p style={{ color: '#666666', fontSize: '0.75rem', margin: 0 }}>
              Secure, decentralized authentication with support for 15+ wallet types and email login
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 