import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface WalletReport {
  address: string;
  clientName: string;
  reportPeriod: string;
  
  // Date Range
  startDate: string;
  endDate: string;
  
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
  const [selectedPairs, setSelectedPairs] = useState<string[]>([]);
  const [availablePairs, setAvailablePairs] = useState([
    { id: 'wxm_weth', name: 'WXM/WETH', address: '0xeB35698c801ff1fb2Ca5F79E496d95A38D3BDc35', chain: 'Arbitrum', protocol: 'Uniswap V3', tvl: 87500 },
    { id: 'eth_usdc', name: 'ETH/USDC', address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2', chain: 'Arbitrum', protocol: 'Uniswap V3', tvl: 85670 },
    { id: 'btc_weth', name: 'BTC/WETH', address: '0x1234567890abcdef1234567890abcdef12345678', chain: 'Ethereum', protocol: 'Uniswap V2', tvl: 156000 }
  ]);

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
    if (selectedPairs.length === 0) {
      alert('⚠️ Please select at least one trading pair to generate a report for.');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`📊 Generating reports for selected pairs: ${selectedPairs.join(', ')}`);
      
      // Calculate date range based on selected period
      const endDate = new Date();
      const periodDays = reportPeriod === '7d' ? 7 : reportPeriod === '30d' ? 30 : reportPeriod === '90d' ? 90 : 365;
      const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
      
      const startDateStr = startDate.toISOString().slice(0, 10);
      const endDateStr = endDate.toISOString().slice(0, 10);
      
      // Simple mock data based on selected pairs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReports: WalletReport[] = selectedPairs.map(pairId => {
        const pair = availablePairs.find(p => p.id === pairId);
        
        if (pairId === 'wxm_weth') {
          return {
            address: pair?.address || '',
            clientName: `${pair?.name} Pool Portfolio`,
            reportPeriod: reportPeriod,
            
            // Date Range
            startDate: startDateStr,
            endDate: endDateStr,
            
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
            largestTradeSymbol: pair?.name || 'WXM/WETH',
            averageTradeSize: 4446.43,
            
            // Period
            periodDays: periodDays
          };
        } else if (pairId === 'eth_usdc') {
          return {
            address: pair?.address || '',
            clientName: `${pair?.name} Trading Portfolio`,
            reportPeriod: reportPeriod,
            
            // Date Range
            startDate: startDateStr,
            endDate: endDateStr,
            
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
            largestTradeSymbol: pair?.name || 'ETH/USDC',
            averageTradeSize: 4724.76,
            
            // Period
            periodDays: periodDays
          };
        } else {
          // BTC/WETH or other pairs
          return {
            address: pair?.address || '',
            clientName: `${pair?.name} Portfolio`,
            reportPeriod: reportPeriod,
            
            // Date Range
            startDate: startDateStr,
            endDate: endDateStr,
            
            // Core P&L Metrics
            startingBalance: 145000.00,
            currentBalance: 156890.75,
            netPnL: 11890.75,
            netPnLPercentage: 8.20,
            
            // Trading Activity
            totalTradingVolume: 287300.00,
            totalFeesPaid: 1245.60,
            numberOfTrades: 35,
            
            // Trade Analysis
            largestTradeValue: 35000.00,
            largestTradeType: 'Buy',
            largestTradeSymbol: pair?.name || 'BTC/WETH',
            averageTradeSize: 8208.57,
            
            // Period
            periodDays: periodDays
          };
        }
      });
      
      setReports(mockReports);
      console.log(`✅ Generated ${mockReports.length} reports for selected pairs`);
    } catch (error) {
      console.error('❌ Error:', error);
      setHasError(true);
      setErrorMessage('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePairToggle = (pairId: string) => {
    setSelectedPairs(prev => 
      prev.includes(pairId) 
        ? prev.filter(id => id !== pairId)
        : [...prev, pairId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPairs.length === availablePairs.length) {
      setSelectedPairs([]);
    } else {
      setSelectedPairs(availablePairs.map(p => p.id));
    }
  };

  const exportToPDF = (wallet: WalletReport) => {
    const pnlColor = wallet.netPnL >= 0 ? '#16a34a' : '#dc2626';
    const pnlIcon = wallet.netPnL >= 0 ? '📈' : '📉';
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${wallet.clientName} Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 20px; 
      line-height: 1.4;
      background: white;
    }
    .header {
      text-align: left;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }
    .header h1 {
      font-size: 1.5rem;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    .date-info {
      background: #f1f5f9;
      padding: 0.5rem;
      border-radius: 0.25rem;
      font-family: Monaco, monospace;
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 0.5rem;
    }
    .address-info {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #eff6ff;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }
    
    /* Metrics Grid - 5 cards in responsive layout */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .metric-card {
      text-align: center;
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid;
    }
    .metric-value {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    .metric-label {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 0.25rem;
    }
    .metric-sublabel {
      font-size: 0.75rem;
      color: #888;
    }
    
    /* Card specific colors matching web page */
    .card-starting { background: #f8fafc; border-color: #cbd5e1; }
    .card-starting .metric-value { color: #475569; }
    
    .card-current { background: #f8fafc; border-color: #cbd5e1; }
    .card-current .metric-value { color: #475569; }
    
    .card-pnl-positive { background: #f0fdf4; border-color: #bbf7d0; }
    .card-pnl-positive .metric-value { color: #16a34a; }
    
    .card-pnl-negative { background: #fef2f2; border-color: #fecaca; }
    .card-pnl-negative .metric-value { color: #dc2626; }
    
    .card-volume { background: #fefbf0; border-color: #fed7aa; }
    .card-volume .metric-value { color: #ea580c; }
    
    .card-fees { background: #fef2f2; border-color: #fecaca; }
    .card-fees .metric-value { color: #dc2626; }
    
    .card-trades { background: #f0f9ff; border-color: #bae6fd; }
    .card-trades .metric-value { color: #0369a1; }
    
    /* Trading Analysis */
    .trading-analysis {
      background: #f8fafc;
      border-radius: 0.5rem;
      padding: 1.5rem;
      border: 1px solid #e2e8f0;
      margin-bottom: 1rem;
    }
    .analysis-title {
      margin-bottom: 1rem;
      color: #1e293b;
      font-size: 1.125rem;
      font-weight: bold;
    }
    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    .analysis-card {
      padding: 1rem;
      border-radius: 0.375rem;
      border: 1px solid;
    }
    .analysis-card-largest {
      background: #fffbeb;
      border-color: #fde68a;
    }
    .analysis-card-average {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    .analysis-label {
      font-size: 0.875rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .analysis-value {
      font-size: 1.1rem;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    .analysis-desc {
      font-size: 0.875rem;
      color: #78716c;
    }
    .largest-label { color: #92400e; }
    .largest-value { color: #d97706; }
    .average-label { color: #166534; }
    .average-value { color: #16a34a; }
    
    @media print {
      body { margin: 0; padding: 15px; }
      .metrics-grid { grid-template-columns: repeat(3, 1fr); }
      .analysis-grid { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${wallet.clientName}</h1>
    <div class="date-info">
      📅 <strong>From:</strong> ${wallet.startDate} <strong>To:</strong> ${wallet.endDate} (${wallet.periodDays} days)
    </div>
  </div>

  <!-- Main Metrics Grid - Exactly matching web page -->
  <div class="metrics-grid">
    <!-- Starting Balance -->
    <div class="metric-card card-starting">
      <div class="metric-value">$${wallet.startingBalance.toLocaleString()}</div>
      <div class="metric-label">Starting Balance</div>
      <div class="metric-sublabel">${wallet.periodDays} days ago</div>
    </div>
    
    <!-- Current Balance -->
    <div class="metric-card card-current">
      <div class="metric-value">$${wallet.currentBalance.toLocaleString()}</div>
      <div class="metric-label">Current Balance</div>
      <div class="metric-sublabel">Today</div>
    </div>
    
    <!-- Net P&L -->
    <div class="metric-card ${wallet.netPnL >= 0 ? 'card-pnl-positive' : 'card-pnl-negative'}">
      <div class="metric-value">${wallet.netPnL >= 0 ? '+' : ''}$${wallet.netPnL.toLocaleString()}</div>
      <div class="metric-label">Net P&L</div>
      <div class="metric-sublabel">(${wallet.netPnLPercentage >= 0 ? '+' : ''}${wallet.netPnLPercentage.toFixed(2)}%)</div>
    </div>
    
    <!-- Trading Volume -->
    <div class="metric-card card-volume">
      <div class="metric-value">$${wallet.totalTradingVolume.toLocaleString()}</div>
      <div class="metric-label">Trading Volume</div>
      <div class="metric-sublabel">${wallet.periodDays} days</div>
    </div>
    
    <!-- Total Fees -->
    <div class="metric-card card-fees">
      <div class="metric-value">$${wallet.totalFeesPaid.toLocaleString()}</div>
      <div class="metric-label">Total Fees Paid</div>
      <div class="metric-sublabel">All transactions</div>
    </div>
    
    <!-- Number of Trades -->
    <div class="metric-card card-trades">
      <div class="metric-value">${wallet.numberOfTrades}</div>
      <div class="metric-label">Number of Trades</div>
      <div class="metric-sublabel">Total executed</div>
    </div>
  </div>

  <!-- Trading Analysis - Exactly matching web page -->
  <div class="trading-analysis">
    <div class="analysis-title">📈 Trading Analysis</div>
    
    <div class="analysis-grid">
      <!-- Largest Trade -->
      <div class="analysis-card analysis-card-largest">
        <div class="analysis-label largest-label">🏆 Largest Trade</div>
        <div class="analysis-value largest-value">$${wallet.largestTradeValue.toLocaleString()}</div>
        <div class="analysis-desc">${wallet.largestTradeType} • ${wallet.largestTradeSymbol}</div>
      </div>
      
      <!-- Average Trade Size -->
      <div class="analysis-card analysis-card-average">
        <div class="analysis-label average-label">📊 Average Trade Size</div>
        <div class="analysis-value average-value">$${wallet.averageTradeSize.toLocaleString()}</div>
        <div class="analysis-desc">Across ${wallet.numberOfTrades} trades</div>
      </div>
    </div>
  </div>

  <!-- Address Info -->
  <div class="address-info">
    <strong>Address:</strong> ${wallet.address}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wallet.clientName.replace(/\s+/g, '_')}_Report_${wallet.startDate}_to_${wallet.endDate}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      alert(`📄 Report downloaded! 

🖨️ To save as PDF:
1. Open the downloaded HTML file
2. Press Ctrl+P (or Cmd+P on Mac)  
3. Choose "Save as PDF"
4. Select "More settings" → Paper size: A4
5. Click "Save"

✅ Your ${wallet.clientName} report matches exactly what you see on screen!`);
    }, 500);
  };

  const exportToCSV = (wallet: WalletReport) => {
    const csvContent = `Metric,Value
Address,${wallet.address}
Report Period,${wallet.startDate} to ${wallet.endDate}
Period Days,${wallet.periodDays}
Start Date,${wallet.startDate}
End Date,${wallet.endDate}
Total P&L,$${wallet.netPnL}
P&L Percentage,${wallet.netPnLPercentage}%
Starting Balance,$${wallet.startingBalance}
Current Balance,$${wallet.currentBalance}
Trading Volume,$${wallet.totalTradingVolume}
Total Fees,$${wallet.totalFeesPaid}
Number of Trades,${wallet.numberOfTrades}
Largest Trade,$${wallet.largestTradeValue}
Largest Trade Type,${wallet.largestTradeType}
Largest Trade Symbol,${wallet.largestTradeSymbol}
Average Trade Size,$${wallet.averageTradeSize}`;

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
              disabled={isLoading || selectedPairs.length === 0}
              style={{
                ...styles.button,
                opacity: isLoading || selectedPairs.length === 0 ? 0.6 : 1
              }}
            >
              {isLoading ? '⏳ Loading...' : `📈 Generate Report (${selectedPairs.length})`}
            </button>
          </div>

          {/* Pair Selection */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>🎯 Select Trading Pairs/Pools</h3>
              <button
                onClick={handleSelectAll}
                style={{
                  background: selectedPairs.length === availablePairs.length ? '#dc2626' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                {selectedPairs.length === availablePairs.length ? '❌ Deselect All' : '✅ Select All'}
              </button>
            </div>
            
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.875rem' }}>
              Choose which trading pairs to include in your report. Selected: {selectedPairs.length}/{availablePairs.length}
            </p>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1rem' 
            }}>
              {availablePairs.map(pair => (
                <div 
                  key={pair.id} 
                  onClick={() => handlePairToggle(pair.id)}
                  style={{
                    background: selectedPairs.includes(pair.id) ? '#dbeafe' : '#ffffff',
                    border: selectedPairs.includes(pair.id) ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedPairs.includes(pair.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handlePairToggle(pair.id);
                      }}
                      style={{ 
                        width: '1.25rem', 
                        height: '1.25rem',
                        accentColor: '#3b82f6'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        color: selectedPairs.includes(pair.id) ? '#1e40af' : '#374151',
                        marginBottom: '0.25rem'
                      }}>
                        {pair.name} <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'normal' }}>on {pair.chain}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'Monaco, monospace', marginBottom: '0.25rem' }}>
                        {pair.address}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {pair.protocol} • TVL: ${pair.tvl.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>{wallet.clientName}</h3>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: '#64748b',
                        background: '#f1f5f9',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        fontFamily: 'Monaco, monospace'
                      }}>
                        📅 <strong>From:</strong> {wallet.startDate} <strong>To:</strong> {wallet.endDate} ({wallet.periodDays} days)
                      </div>
                    </div>
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