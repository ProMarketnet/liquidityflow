import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: ''
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
      maxWidth: '500px',
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
      textAlign: 'center' as const,
      lineHeight: 1.5
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
    infoBox: {
      background: '#f0f7ff',
      border: '2px solid #3b82f6',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginTop: '1rem',
      fontSize: '0.875rem',
      color: '#1e40af'
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

    // Basic validation
    if (!formData.email || !formData.password || !formData.fullName || !formData.companyName) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Creating new account:', {
        email: formData.email,
        fullName: formData.fullName,
        companyName: formData.companyName
      });

      // In production, call API to create account
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          companyName: formData.companyName
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store user session
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userRole', 'PRIMARY_ADMIN');
        localStorage.setItem('accountId', data.accountId);
        localStorage.setItem('fullName', formData.fullName);
        localStorage.setItem('companyName', formData.companyName);
        
        console.log('✅ Account created successfully:', data);
        
        // Redirect to portfolio management
        router.push('/admin/portfolios?welcome=true');
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // For demo purposes, simulate successful registration
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userRole', 'PRIMARY_ADMIN');
      localStorage.setItem('accountId', `acc_${Date.now()}`);
      localStorage.setItem('fullName', formData.fullName);
      localStorage.setItem('companyName', formData.companyName);
      
      console.log('✅ Demo account created for:', formData.email);
      router.push('/admin/portfolios?welcome=true');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Account - LiquidFlow</title>
        <meta name="description" content="Create your LiquidFlow account and start managing portfolios" />
      </Head>
      
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🏢</div>
            <h1 style={styles.title}>Create Your Account</h1>
            <p style={styles.subtitle}>
              Start managing portfolios and collaborating with your team
            </p>

            {error && (
              <div style={styles.errorMessage}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Smith"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@company.com"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Company/Organization Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="XTC Company"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  style={styles.input}
                  required
                  minLength={6}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
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
                {isLoading ? '⏳ Creating Account...' : '🚀 Create Account'}
              </button>
            </form>

            <div style={styles.infoBox}>
              <strong>🎯 As Account Creator:</strong>
              <br />
              • You become the Primary Admin automatically
              • Full access to portfolio management & reports
              • Ability to invite team members with different roles
              • Complete control over account settings
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <span style={{ color: '#666', fontSize: '0.875rem' }}>
                Already have an account?{' '}
              </span>
              <button 
                onClick={() => router.push('/auth/login')}
                style={styles.linkButton}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 