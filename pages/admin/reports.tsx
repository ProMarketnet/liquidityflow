import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface WalletReport {
  address: string;
  clientName: string;
  reportPeriod: string;
  
  // Core P&L Metrics
  startingBalance: number;
  currentBalance: number;
  netPnL: number;
  netPnLPercentage: number;
  
  // Trading Activity
  totalTradingVolume: number;
  totalFeesPaid: number;
  numberOfTrades: number;
  
  // Trade Analysis
  largestTradeValue: number;
  largestTradeType: string;
  largestTradeSymbol: string;
  averageTradeSize: number;
  
  // Period
  periodDays: number;
}

export default function AdminReportsPage() {
  console.log('🔄 AdminReportsPage loading...');
  
  const [reports, setReports] = useState<WalletReport[]>([]);
  const [reportPeriod, setReportPeriod] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simple inline styles
  const styles = {
    page: {
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      padding: '2rem'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    nav: {
      background: '#ffffff',
      borderBottom: '2px solid #000000',
      padding: '1rem 0',
      marginBottom: '2rem'
    },
    navLink: {
      color: '#000000',
      textDecoration: 'none',
      fontWeight: '500',
      marginRight: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    controls: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      padding: '1rem',
      background: '#f9fafb',
      border: '1px solid #ccc',
      borderRadius: '0.5rem'
    },
    select: {
      padding: '0.5rem',
      border: '1px solid #ccc',
      borderRadius: '0.25rem'
    },
    button: {
      background: '#16a34a',
      color: '#ffffff',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '0.25rem',
      cursor: 'pointer'
    },
    card: {
      background: '#ffffff',
      border: '1px solid #ccc',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1rem'
    },
    error: {
      background: '#fef2f2',
      border: '1px solid #dc2626',
      borderRadius: '0.5rem',
      padding: '1rem',
      color: '#dc2626'
    },
    loading: {
      textAlign: 'center' as const,
      padding: '2rem'
    }
  };

  // Single simple useEffect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔄 Reports page initialized');
    }
  }, []);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Generating simple report...');
      
      // Simple mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReports: WalletReport[] = [
        {
          address: '0xeB35698c801ff1fb2Ca5F79E496d95A38D3BDc35',
          clientName: 'WXM Pool Portfolio',
          reportPeriod: reportPeriod,
          
          // Core P&L Metrics (based on user's example)
          startingBalance: 95620.45,
          currentBalance: 89457.09,
          netPnL: -6163.36,
          netPnLPercentage: -6.45,
          
          // Trading Activity
          totalTradingVolume: 124500.00,
          totalFeesPaid: 892.35,
          numberOfTrades: 28,
          
          // Trade Analysis  
          largestTradeValue: 15420.50,
          largestTradeType: 'Buy',
          largestTradeSymbol: 'WXM/WETH',
          averageTradeSize: 4446.43, // 124500/28
          
          // Period
          periodDays: reportPeriod === '7d' ? 7 : reportPeriod === '30d' ? 30 : reportPeriod === '90d' ? 90 : 365
        },
        {
          address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
          clientName: 'ETH/USDC Trading Portfolio',
          reportPeriod: reportPeriod,
          
          // Core P&L Metrics (profitable example)
          startingBalance: 78250.00,
          currentBalance: 85670.25,
          netPnL: 7420.25,
          netPnLPercentage: 9.48,
          
          // Trading Activity
          totalTradingVolume: 198400.00,
          totalFeesPaid: 456.78,
          numberOfTrades: 42,
          
          // Trade Analysis
          largestTradeValue: 22850.00,
          largestTradeType: 'Sell',
          largestTradeSymbol: 'ETH/USDC',
          averageTradeSize: 4724.76, // 198400/42
          
          // Period
          periodDays: reportPeriod === '7d' ? 7 : reportPeriod === '30d' ? 30 : reportPeriod === '90d' ? 90 : 365
        }
      ];
      
      setReports(mockReports);
      console.log('✅ Simple report generated');
    } catch (error) {
      console.error('❌ Error:', error);
      setHasError(true);
      setErrorMessage('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = (wallet: WalletReport) => {
    // Simple PDF export
    const reportContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${wallet.clientName} Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${wallet.clientName}</h1>
    <p>Period: ${wallet.reportPeriod}</p>
    <p>Generated: ${new Date().toLocaleDateString()}</p>
  </div>
  
  <table>
    <tr><th>Metric</th><th>Value</th></tr>
    <tr><td>Address</td><td>${wallet.address}</td></tr>
    <tr><td>Total P&L</td><td>$${wallet.netPnL.toLocaleString()}</td></tr>
    <tr><td>Current Balance</td><td>$${wallet.currentBalance.toLocaleString()}</td></tr>
    <tr><td>Trading Volume</td><td>$${wallet.totalTradingVolume.toLocaleString()}</td></tr>
    <tr><td>Total Fees</td><td>$${wallet.totalFeesPaid.toLocaleString()}</td></tr>
    <tr><td>Total Transfers</td><td>${wallet.numberOfTrades}</td></tr>
  </table>
</body>
</html>`;

    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wallet.clientName.replace(/\s+/g, '_')}_report.html`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('📄 Report exported! Open the HTML file and print to PDF.');
  };

  const exportToCSV = (wallet: WalletReport) => {
    const csvContent = `Metric,Value
Address,${wallet.address}
Total P&L,$${wallet.netPnL}
Current Balance,$${wallet.currentBalance}
Trading Volume,$${wallet.totalTradingVolume}
Total Fees,$${wallet.totalFeesPaid}
Total Transfers,${wallet.numberOfTrades}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wallet.clientName.replace(/\s+/g, '_')}_data.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('📊 CSV exported successfully!');
  };

  // Show error state
  if (hasError) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.error}>
            <h2>⚠️ Error</h2>
            <p>{errorMessage}</p>
            <button 
              style={styles.button} 
              onClick={() => window.location.reload()}
            >
              🔄 Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Trading Reports - LiquidityFlow</title>
      </Head>

      <div style={styles.page}>
        {/* Simple Navigation */}
        <nav style={styles.nav}>
          <div style={styles.container}>
            <a href="/admin/portfolios" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>
              🏠 Home
            </a>
            <a href="/admin/wallets" style={styles.navLink}>💳 Wallets</a>
            <a href="/admin/analytics" style={styles.navLink}>📊 Analytics</a>
            <a href="/dashboard" style={styles.navLink}>← My Wallet</a>
          </div>
        </nav>

        <div style={styles.container}>
          <h1 style={styles.title}>📊 Trading Reports</h1>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            Generate simple P&L and portfolio reports
          </p>

          {/* Simple Controls */}
          <div style={styles.controls}>
            <div>
              <label>Report Period:</label>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                style={styles.select}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            
            <button
              onClick={generateReport}
              disabled={isLoading}
              style={{
                ...styles.button,
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? '⏳ Loading...' : '📈 Generate Report'}
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div style={styles.card}>
              <div style={styles.loading}>
                <h3>Generating Report...</h3>
                <p>Please wait while we fetch your data.</p>
              </div>
            </div>
          )}

          {/* Simple Reports Display */}
          {!isLoading && reports.length > 0 && (
            <>
              {reports.map((wallet, index) => (
                <div key={index} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>{wallet.clientName}</h3>
                    <div>
                      <button 
                        onClick={() => exportToPDF(wallet)} 
                        style={{ ...styles.button, background: '#dc2626', marginRight: '0.5rem' }}
                      >
                        📄 PDF
                      </button>
                      <button 
                        onClick={() => exportToCSV(wallet)} 
                        style={{ ...styles.button, background: '#dc2626' }}
                      >
                        📊 CSV
                      </button>
                    </div>
                  </div>

                  {/* Professional Summary Grid with All Key Metrics */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    {/* Starting Balance */}
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#64748b' }}>
                        ${wallet.startingBalance.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>Starting Balance</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{wallet.periodDays} days ago</div>
                    </div>
                    
                    {/* Current Balance */}
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                        ${wallet.currentBalance.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>Current Balance</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>Today</div>
                    </div>
                    
                    {/* Net P&L with Percentage */}
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '1rem', 
                      background: wallet.netPnL >= 0 ? '#f0fdf4' : '#fef2f2', 
                      borderRadius: '0.5rem',
                      border: `1px solid ${wallet.netPnL >= 0 ? '#bbf7d0' : '#fecaca'}`
                    }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: wallet.netPnL >= 0 ? '#16a34a' : '#dc2626' }}>
                        ${wallet.netPnL.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>Net P&L</div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 'bold',
                        color: wallet.netPnL >= 0 ? '#16a34a' : '#dc2626' 
                      }}>
                        ({wallet.netPnLPercentage >= 0 ? '+' : ''}{wallet.netPnLPercentage.toFixed(2)}%)
                      </div>
                    </div>
                    
                    {/* Total Trading Volume */}
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#fefbf0', borderRadius: '0.5rem', border: '1px solid #fed7aa' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ea580c' }}>
                        ${wallet.totalTradingVolume.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>Trading Volume</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{wallet.periodDays} days</div>
                    </div>
                    
                    {/* Total Fees Paid */}
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#dc2626' }}>
                        ${wallet.totalFeesPaid.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>Total Fees Paid</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>All transactions</div>
                    </div>
                    
                    {/* Number of Trades */}
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0369a1' }}>
                        {wallet.numberOfTrades}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>Number of Trades</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>Total executed</div>
                    </div>
                  </div>

                  {/* Trading Analysis Section */}
                  <div style={{ 
                    background: '#f8fafc',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    marginTop: '1rem'
                  }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.125rem' }}>
                      📈 Trading Analysis
                    </h4>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                      gap: '1rem' 
                    }}>
                      {/* Largest Trade */}
                      <div style={{ 
                        background: '#fffbeb', 
                        padding: '1rem', 
                        borderRadius: '0.375rem',
                        border: '1px solid #fde68a'
                      }}>
                        <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          🏆 Largest Trade
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#d97706', marginBottom: '0.25rem' }}>
                          ${wallet.largestTradeValue.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#78716c' }}>
                          {wallet.largestTradeType} • {wallet.largestTradeSymbol}
                        </div>
                      </div>
                      
                      {/* Average Trade Size */}
                      <div style={{ 
                        background: '#f0fdf4', 
                        padding: '1rem', 
                        borderRadius: '0.375rem',
                        border: '1px solid #bbf7d0'
                      }}>
                        <div style={{ fontSize: '0.875rem', color: '#166534', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          📊 Average Trade Size
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '0.25rem' }}>
                          ${wallet.averageTradeSize.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#78716c' }}>
                          Across {wallet.numberOfTrades} trades
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Simple Address Info */}
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#eff6ff', borderRadius: '0.25rem' }}>
                    <strong>Address:</strong> {wallet.address}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* No Reports State */}
          {!isLoading && reports.length === 0 && (
            <div style={styles.card}>
              <div style={styles.loading}>
                <h3>📋 No Reports Generated</h3>
                <p>Click "Generate Report" to create your first trading report.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 