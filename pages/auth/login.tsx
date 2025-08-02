import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    },
    container: {
      maxWidth: '400px',
      width: '100%'
    },
    card: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '0.5rem',
      textAlign: 'center' as const
    },
    subtitle: {
      color: '#666666',
      marginBottom: '2rem',
      textAlign: 'center' as const
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    label: {
      fontWeight: 'bold',
      color: '#000000'
    },
    input: {
      padding: '0.75rem',
      border: '2px solid #000000',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#000000',
      background: '#ffffff'
    },
    button: {
      background: '#2563eb',
      color: '#ffffff',
      padding: '0.75rem 2rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '1rem'
    },
    errorMessage: {
      background: '#fef2f2',
      color: '#dc2626',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      marginBottom: '1rem'
    },
    linkButton: {
      background: 'transparent',
      color: '#2563eb',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'underline',
      fontSize: '0.875rem'
    },
    demoSection: {
      background: '#f0f7ff',
      border: '2px solid #3b82f6',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginTop: '1rem',
      fontSize: '0.875rem'
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Logging in:', formData.email);

      // In production, call API to authenticate
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store user session
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('accountId', data.accountId);
        localStorage.setItem('fullName', data.fullName);
        localStorage.setItem('companyName', data.companyName);
        
        console.log('✅ Login successful:', data);
        router.push('/admin/portfolios');
      } else {
        const error = await response.json();
        setError(error.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // For demo purposes, simulate login for known emails
      const mockUsers = {
        'john@company.com': { role: 'PRIMARY_ADMIN', fullName: 'John Smith', companyName: 'XTC Company' },
        'jane@email.com': { role: 'ADMIN', fullName: 'Jane Doe', companyName: 'XTC Company' },
        'user@example.com': { role: 'USER', fullName: 'Regular User', companyName: 'XTC Company' }
      };

      const mockUser = mockUsers[formData.email as keyof typeof mockUsers];
      
      if (mockUser) {
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userRole', mockUser.role);
        localStorage.setItem('accountId', 'acc_xtc_company');
        localStorage.setItem('fullName', mockUser.fullName);
        localStorage.setItem('companyName', mockUser.companyName);
        
        console.log('✅ Demo login successful for:', formData.email);
        router.push('/admin/portfolios');
      } else {
        setError('Demo accounts: john@company.com, jane@email.com, user@example.com');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (email: string) => {
    setFormData({ email, password: 'demo123' });
    
    // Auto-submit after a short delay
    setTimeout(() => {
      handleSubmit(new Event('submit') as any);
    }, 100);
  };

  return (
    <>
      <Head>
        <title>Sign In - LiquidFlow</title>
        <meta name="description" content="Sign in to your LiquidFlow account" />
      </Head>
      
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🔐</div>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>
              Sign in to access your portfolio management dashboard
            </p>

            {error && (
              <div style={styles.errorMessage}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  style={styles.input}
                  required
                />
              </div>

              <button 
                type="submit" 
                style={{
                  ...styles.button,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Signing In...' : '🚀 Sign In'}
              </button>
            </form>

            <div style={styles.demoSection}>
              <strong>🎮 Demo Accounts:</strong>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleDemoLogin('john@company.com')}
                  style={{ ...styles.linkButton, textAlign: 'left', padding: '0.25rem' }}
                >
                  👑 john@company.com (Primary Admin)
                </button>
                <button 
                  onClick={() => handleDemoLogin('jane@email.com')}
                  style={{ ...styles.linkButton, textAlign: 'left', padding: '0.25rem' }}
                >
                  ⚡ jane@email.com (Admin)
                </button>
                <button 
                  onClick={() => handleDemoLogin('user@example.com')}
                  style={{ ...styles.linkButton, textAlign: 'left', padding: '0.25rem' }}
                >
                  👤 user@example.com (Regular User)
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <span style={{ color: '#666', fontSize: '0.875rem' }}>
                Don't have an account?{' '}
              </span>
              <button 
                onClick={() => router.push('/auth/register')}
                style={styles.linkButton}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 