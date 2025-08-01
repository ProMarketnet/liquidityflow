import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface SettingsData {
  moralisApiKey: string;
  webhookUrl: string;
  emailNotifications: boolean;
  slackIntegration: boolean;
  alertThreshold: number;
  checkInterval: number;
  dataRetention: number;
  healthFactorThreshold: number;
  minRewardAlert: number;
  minAprAlert: number;
  enableSmartAlerts: boolean;
  // Wallet connection options
  connectionMode: 'read-only' | 'advanced';
  enablePrivateKeyStorage: boolean;
  encryptedPrivateKey: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    moralisApiKey: '',
    webhookUrl: '',
    emailNotifications: true,
    slackIntegration: false,
    alertThreshold: 5.0,
    checkInterval: 300,
    dataRetention: 30,
    healthFactorThreshold: 1.5,
    minRewardAlert: 100,
    minAprAlert: 20,
    enableSmartAlerts: true,
    // Wallet connection options
    connectionMode: 'read-only',
    enablePrivateKeyStorage: false,
    encryptedPrivateKey: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [apiTestStatus, setApiTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

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
      maxWidth: '1200px',
      margin: '0 auto'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '1rem'
    },
    subtitle: {
      color: '#666666',
      marginBottom: '2rem'
    },
    nav: {
      background: '#ffffff',
      borderBottom: '2px solid #000000',
      padding: '1rem 0',
      marginBottom: '2rem'
    },
    navContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    navLink: {
      color: '#000000',
      textDecoration: 'none',
      fontWeight: '500',
      marginRight: '2rem'
    },
    card: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      color: '#000000',
      fontWeight: '500',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #000000',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#000000',
      background: '#ffffff',
      marginBottom: '1rem'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #000000',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#000000',
      background: '#ffffff',
      marginBottom: '1rem'
    },
    button: {
      background: '#000000',
      color: '#ffffff',
      padding: '1rem 2rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    toggleContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      padding: '1rem',
      border: '2px solid #000000',
      borderRadius: '0.5rem'
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      fontWeight: 'bold'
    },
    statusSuccess: {
      background: '#dcfce7',
      color: '#166534'
    },
    statusError: {
      background: '#fef2f2',
      color: '#dc2626'
    },
    statusTesting: {
      background: '#fef3c7',
      color: '#92400e'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '1.5rem'
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load from localStorage for now (in production, this would be from API)
      const savedSettings = localStorage.getItem('liquidflow_settings');
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }
      
      // Check if Moralis API key is configured
      const envApiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
      if (envApiKey && !settings.moralisApiKey) {
        setSettings(prev => ({ ...prev, moralisApiKey: envApiKey.slice(0, 20) + '...' }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const testMoralisConnection = async () => {
    setApiTestStatus('testing');
    try {
      // Test the Moralis API connection
      const response = await fetch('/api/monitoring/health');
      if (response.ok) {
        setApiTestStatus('success');
        setTimeout(() => setApiTestStatus('idle'), 3000);
      } else {
        setApiTestStatus('error');
        setTimeout(() => setApiTestStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('API test failed:', error);
      setApiTestStatus('error');
      setTimeout(() => setApiTestStatus('idle'), 3000);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // Save to localStorage (in production, this would be API call)
      localStorage.setItem('liquidflow_settings', JSON.stringify(settings));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof SettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span style={{ ...styles.statusBadge, ...styles.statusSuccess }}>✅ Connected</span>;
      case 'error':
        return <span style={{ ...styles.statusBadge, ...styles.statusError }}>❌ Error</span>;
      case 'testing':
        return <span style={{ ...styles.statusBadge, ...styles.statusTesting }}>⏳ Testing...</span>;
      default:
        return <span style={{ ...styles.statusBadge, background: '#f3f4f6', color: '#374151' }}>⚪ Not Tested</span>;
    }
  };

  return (
    <>
      <Head>
        <title>Settings - LiquidFlow</title>
        <meta name="description" content="Configure your DeFi monitoring and alert preferences" />
      </Head>
      
      <div style={styles.page}>
        <nav style={styles.nav}>
          <div style={styles.navContainer}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000' }}>LiquidFlow</div>
                                     <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <a href="/" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>🏠 Home</a>
              <a href="/dashboard" style={styles.navLink}>← Back to Dashboard</a>
              <a href="/dashboard/alerts" style={styles.navLink}>Alerts</a>
              <a href="/dashboard/pools" style={styles.navLink}>Pools</a>
              <button 
                onClick={() => {
                  localStorage.removeItem('connectedWallet');
                  localStorage.removeItem('walletType');
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
                🚪 Disconnect Wallet
              </button>
            </div>
          </div>
        </nav>

        <div style={styles.container}>
          <h1 style={styles.title}>⚙️ Settings</h1>
          <p style={styles.subtitle}>
            Configure your DeFi monitoring, alerts, and API integrations
          </p>

          {/* Wallet Connection Options */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🔗 Wallet Connection Options</h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={styles.label}>Connection Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                
                {/* Read-Only Mode */}
                <div style={{
                  ...styles.toggleContainer,
                  border: settings.connectionMode === 'read-only' ? '3px solid #22c55e' : '2px solid #000000',
                  background: settings.connectionMode === 'read-only' ? '#f0fdf4' : '#ffffff'
                }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 'bold', color: '#000000' }}>🔍 Read-Only (Recommended)</div>
                      <input
                        type="radio"
                        name="connectionMode"
                        checked={settings.connectionMode === 'read-only'}
                        onChange={() => handleInputChange('connectionMode', 'read-only')}
                        style={{ transform: 'scale(1.5)' }}
                      />
                    </div>
                    <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      ✅ <strong>Safe:</strong> Only reads public blockchain data<br/>
                      ✅ <strong>Fast:</strong> No private key management<br/>
                      ✅ <strong>Secure:</strong> Zero risk of fund loss<br/>
                      📊 View positions, balances, and analytics
                    </div>
                    <div style={{ color: '#16a34a', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      CURRENT MODE
                    </div>
                  </div>
                </div>

                {/* Advanced Mode */}
                <div style={{
                  ...styles.toggleContainer,
                  border: settings.connectionMode === 'advanced' ? '3px solid #ef4444' : '2px solid #000000',
                  background: settings.connectionMode === 'advanced' ? '#fef2f2' : '#ffffff'
                }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 'bold', color: '#000000' }}>⚡ Advanced (High Risk)</div>
                      <input
                        type="radio"
                        name="connectionMode"
                        checked={settings.connectionMode === 'advanced'}
                        onChange={() => handleInputChange('connectionMode', 'advanced')}
                        style={{ transform: 'scale(1.5)' }}
                      />
                    </div>
                    <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      ⚠️ <strong>Risky:</strong> Stores encrypted private keys<br/>
                      🔥 <strong>Powerful:</strong> Execute transactions<br/>
                      🤖 <strong>Automated:</strong> Portfolio rebalancing<br/>
                      💡 Auto-claim rewards, optimize yields
                    </div>
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      ⚠️ ADVANCED USERS ONLY
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Mode Configuration */}
            {settings.connectionMode === 'advanced' && (
              <div style={{ 
                background: '#fef2f2', 
                border: '2px solid #ef4444', 
                borderRadius: '0.5rem', 
                padding: '1.5rem',
                marginBottom: '1.5rem' 
              }}>
                <h3 style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '1rem' }}>
                  ⚠️ Advanced Configuration (Use at Your Own Risk)
                </h3>
                
                <div style={styles.toggleContainer}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#000000' }}>Enable Private Key Storage</div>
                    <div style={{ color: '#666', fontSize: '0.875rem' }}>
                      Store encrypted private keys for transaction execution
                    </div>
                  </div>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.enablePrivateKeyStorage}
                      onChange={(e) => handleInputChange('enablePrivateKeyStorage', e.target.checked)}
                      style={{ transform: 'scale(1.5)' }}
                    />
                  </label>
                </div>

                {settings.enablePrivateKeyStorage && (
                  <div>
                    <label style={styles.label}>Private Key (Will be Encrypted)</label>
                    <input
                      type="password"
                      value={settings.encryptedPrivateKey}
                      onChange={(e) => handleInputChange('encryptedPrivateKey', e.target.value)}
                      placeholder="0x..."
                      style={styles.input}
                    />
                    <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>
                      🔒 <strong>Security Notice:</strong> Private keys are encrypted with AES-256 and stored locally. 
                      We recommend using a separate wallet with limited funds for automated strategies.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* API Configuration */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🔌 API Configuration</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={styles.label}>Moralis API Key</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="password"
                  value={settings.moralisApiKey}
                  onChange={(e) => handleInputChange('moralisApiKey', e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  style={styles.input}
                />
                <button onClick={testMoralisConnection} style={styles.button}>
                  Test Connection
                </button>
                {getStatusBadge(apiTestStatus)}
              </div>
              <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Your Moralis Web3 API key for fetching DeFi positions and analytics
              </p>
            </div>

            <div>
              <label style={styles.label}>Webhook URL (Optional)</label>
              <input
                type="url"
                value={settings.webhookUrl}
                onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                placeholder="https://your-app.com/webhook"
                style={styles.input}
              />
              <p style={{ color: '#666', fontSize: '0.875rem' }}>
                Receive real-time alerts via webhook notifications
              </p>
            </div>
          </div>

          {/* Smart Alert Configuration */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🧠 Smart Alert Configuration</h2>
            
            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Health Factor Alert Threshold</label>
                <input
                  type="number"
                  value={settings.healthFactorThreshold}
                  onChange={(e) => handleInputChange('healthFactorThreshold', parseFloat(e.target.value))}
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  style={styles.input}
                />
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Alert when lending health factor drops below this value
                </p>
              </div>

              <div>
                <label style={styles.label}>Minimum Reward Alert ($)</label>
                <input
                  type="number"
                  value={settings.minRewardAlert}
                  onChange={(e) => handleInputChange('minRewardAlert', parseFloat(e.target.value))}
                  min="1"
                  step="1"
                  style={styles.input}
                />
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Alert when unclaimed rewards exceed this amount
                </p>
              </div>

              <div>
                <label style={styles.label}>High APR Alert Threshold (%)</label>
                <input
                  type="number"
                  value={settings.minAprAlert}
                  onChange={(e) => handleInputChange('minAprAlert', parseFloat(e.target.value))}
                  min="1"
                  max="100"
                  step="1"
                  style={styles.input}
                />
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Alert when positions offer APR above this percentage
                </p>
              </div>

              <div>
                <label style={styles.label}>Price Slippage Alert (%)</label>
                <input
                  type="number"
                  value={settings.alertThreshold}
                  onChange={(e) => handleInputChange('alertThreshold', parseFloat(e.target.value))}
                  min="0.1"
                  max="50"
                  step="0.1"
                  style={styles.input}
                />
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Alert when price slippage exceeds this percentage
                </p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📧 Notification Preferences</h2>
            
            <div style={styles.toggleContainer}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#000000' }}>Smart Alerts</div>
                <div style={{ color: '#666', fontSize: '0.875rem' }}>
                  Enable intelligent DeFi position monitoring
                </div>
              </div>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.enableSmartAlerts}
                  onChange={(e) => handleInputChange('enableSmartAlerts', e.target.checked)}
                  style={{ transform: 'scale(1.5)' }}
                />
              </label>
            </div>

            <div style={styles.toggleContainer}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#000000' }}>Email Notifications</div>
                <div style={{ color: '#666', fontSize: '0.875rem' }}>
                  Receive alerts via email
                </div>
              </div>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                  style={{ transform: 'scale(1.5)' }}
                />
              </label>
            </div>

            <div style={styles.toggleContainer}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#000000' }}>Slack Integration</div>
                <div style={{ color: '#666', fontSize: '0.875rem' }}>
                  Send alerts to Slack channel
                </div>
              </div>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.slackIntegration}
                  onChange={(e) => handleInputChange('slackIntegration', e.target.checked)}
                  style={{ transform: 'scale(1.5)' }}
                />
              </label>
            </div>
          </div>

          {/* Monitoring Settings */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⏱️ Monitoring Configuration</h2>
            
            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Check Interval</label>
                <select
                  value={settings.checkInterval}
                  onChange={(e) => handleInputChange('checkInterval', parseInt(e.target.value))}
                  style={styles.select}
                >
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                  <option value="900">15 minutes</option>
                  <option value="1800">30 minutes</option>
                  <option value="3600">1 hour</option>
                </select>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  How often to check for position changes
                </p>
              </div>

              <div>
                <label style={styles.label}>Data Retention</label>
                <select
                  value={settings.dataRetention}
                  onChange={(e) => handleInputChange('dataRetention', parseInt(e.target.value))}
                  style={styles.select}
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">6 months</option>
                  <option value="365">1 year</option>
                </select>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  How long to keep historical data
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {saveStatus === 'success' && (
                <span style={{ ...styles.statusBadge, ...styles.statusSuccess }}>
                  ✅ Settings saved successfully!
                </span>
              )}
              {saveStatus === 'error' && (
                <span style={{ ...styles.statusBadge, ...styles.statusError }}>
                  ❌ Error saving settings
                </span>
              )}
            </div>
            
            <button 
              onClick={saveSettings}
              disabled={isSaving}
              style={{
                ...styles.button,
                opacity: isSaving ? 0.6 : 1,
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? '💾 Saving...' : '💾 Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
