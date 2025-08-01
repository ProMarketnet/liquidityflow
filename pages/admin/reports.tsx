import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface WalletReport {
  address: string;
  clientName: string;
  reportPeriod: string;
  totalPnL: number;
  realizedPnL: number;
  unrealizedPnL: number;
  totalTransfers: number;
  transfersIn: number;
  transfersOut: number;
  currentBalance: number;
  startingBalance: number;
  highestBalance: number;
  lowestBalance: number;
  tradingVolume: number;
  fees: number;
  transactions: TransactionData[];
  chainBreakdown: ChainReport[];
}

interface TransactionData {
  hash: string;
  type: 'trade' | 'transfer_in' | 'transfer_out' | 'defi_stake' | 'defi_unstake';
  timestamp: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  usdValue: number;
  gasFee: number;
  chain: string;
  protocol?: string;
}

interface ChainReport {
  chainName: string;
  chainLogo: string;
  pnl: number;
  volume: number;
  fees: number;
  transactions: number;
}

export default function AdminReportsPage() {
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [reportPeriod, setReportPeriod] = useState<string>('30d');
  const [reportType, setReportType] = useState<string>('pnl');
  const [reports, setReports] = useState<WalletReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
      maxWidth: '1600px',
      margin: '0 auto'
    },
    nav: {
      background: '#ffffff',
      borderBottom: '2px solid #000000',
      padding: '1rem 0',
      marginBottom: '2rem'
    },
    navContainer: {
      maxWidth: '1600px',
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
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#666666',
      marginBottom: '2rem'
    },
    controls: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
      padding: '1.5rem',
      background: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '1rem'
    },
    select: {
      padding: '0.75rem',
      border: '2px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      background: '#ffffff'
    },
    button: {
      background: '#3b82f6',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    generateButton: {
      background: '#16a34a',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    exportButton: {
      background: '#dc2626',
      color: '#ffffff',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '0.875rem',
      marginLeft: '0.5rem'
    },
    card: {
      background: '#ffffff',
      border: '3px solid #000000',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1rem'
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    summaryCard: {
      background: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1rem',
      textAlign: 'center' as const
    },
    bigNumber: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    positive: {
      color: '#16a34a'
    },
    negative: {
      color: '#dc2626'
    },
    neutral: {
      color: '#6b7280'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      border: '2px solid #000000'
    },
    th: {
      background: '#f3f4f6',
      color: '#000000',
      fontWeight: 'bold',
      padding: '1rem',
      textAlign: 'left' as const,
      border: '1px solid #000000'
    },
    td: {
      padding: '1rem',
      border: '1px solid #000000',
      color: '#000000'
    },
    loading: {
      textAlign: 'center' as const,
      padding: '3rem',
      color: '#666666'
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedWallet, reportPeriod, reportType]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // In production, this would call your reports API
      // For now, generate mock report data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const mockReports: WalletReport[] = [
        {
          address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
          clientName: 'Alice Johnson',
          reportPeriod: reportPeriod,
          totalPnL: 15420.50,
          realizedPnL: 8750.25,
          unrealizedPnL: 6670.25,
          totalTransfers: 25,
          transfersIn: 15,
          transfersOut: 10,
          currentBalance: 245823.12,
          startingBalance: 230402.62,
          highestBalance: 252000.00,
          lowestBalance: 225000.00,
          tradingVolume: 125000.00,
          fees: 892.35,
          transactions: [
            {
              hash: '0xabc123...',
              type: 'trade',
              timestamp: '2024-01-20T14:30:00Z',
              tokenIn: 'USDC',
              tokenOut: 'ETH',
              amountIn: 5000,
              amountOut: 2.1,
              usdValue: 5000,
              gasFee: 12.50,
              chain: 'Ethereum',
              protocol: 'Uniswap V3'
            },
            {
              hash: '0xdef456...',
              type: 'defi_stake',
              timestamp: '2024-01-19T09:15:00Z',
              tokenIn: 'ETH',
              tokenOut: 'stETH',
              amountIn: 5.0,
              amountOut: 4.98,
              usdValue: 11950,
              gasFee: 18.75,
              chain: 'Ethereum',
              protocol: 'Lido'
            }
          ],
          chainBreakdown: [
            { chainName: 'Ethereum', chainLogo: '⟠', pnl: 12420.50, volume: 95000, fees: 650.25, transactions: 18 },
            { chainName: 'Arbitrum', chainLogo: '🔵', pnl: 3000.00, volume: 30000, fees: 242.10, transactions: 7 }
          ]
        }
      ];
      
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // In production, this would:
      // 1. Fetch all transactions from Moralis
      // 2. Calculate P&L using FIFO/LIFO accounting
      // 3. Track all transfers in/out
      // 4. Generate comprehensive analysis
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate generation
      alert('✅ Report generated successfully!');
      await loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('❌ Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = (wallet: WalletReport) => {
    // In production, this would generate a PDF using libraries like jsPDF or Puppeteer
    alert(`📄 Exporting ${wallet.clientName} P&L report to PDF...`);
  };

  const exportToCSV = (wallet: WalletReport) => {
    // In production, this would generate CSV data
    const csvData = wallet.transactions.map(tx => ({
      Date: new Date(tx.timestamp).toLocaleDateString(),
      Type: tx.type,
      'Token In': tx.tokenIn,
      'Amount In': tx.amountIn,
      'Token Out': tx.tokenOut,
      'Amount Out': tx.amountOut,
      'USD Value': tx.usdValue,
      'Gas Fee': tx.gasFee,
      Chain: tx.chain,
      Protocol: tx.protocol || '',
      Hash: tx.hash
    }));
    
    console.log('CSV Data:', csvData);
    alert(`📊 Exporting ${wallet.clientName} transactions to CSV...`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (current: number, starting: number) => {
    const change = ((current - starting) / starting) * 100;
    return {
      value: change.toFixed(2) + '%',
      isPositive: change >= 0
    };
  };

  const getPnLColor = (amount: number) => {
    if (amount > 0) return styles.positive;
    if (amount < 0) return styles.negative;
    return styles.neutral;
  };

  return (
    <>
      <Head>
        <title>Trading Reports - LiquidFlow Admin</title>
        <meta name="description" content="Generate comprehensive P&L, transfer, and balance reports" />
      </Head>
      
      <div style={styles.page}>
        <nav style={styles.nav}>
          <div style={styles.navContainer}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000' }}>
              🏢 LiquidFlow Admin
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <a href="/" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>🏠 Home</a>
              <a href="/admin/wallets" style={styles.navLink}>💳 Manage Wallets</a>
              <a href="/admin/portfolios" style={styles.navLink}>💼 Portfolios</a>
              <a href="/admin/analytics" style={styles.navLink}>📊 Analytics</a>
              <a href="/dashboard" style={styles.navLink}>← Dashboard</a>
              <button 
                onClick={() => {
                  localStorage.removeItem('connectedWallet');
                  localStorage.removeItem('walletType');
                  localStorage.removeItem('liquidflow_admin');
                  localStorage.removeItem('admin_session');
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
                🚪 Logout
              </button>
            </div>
          </div>
        </nav>

        <div style={styles.container}>
          <h1 style={styles.title}>📊 Trading Reports</h1>
          <p style={styles.subtitle}>
            Generate comprehensive P&L, transfer tracking, and wallet balance reports for tax and accounting purposes
          </p>

          {/* Report Controls */}
          <div style={styles.controls}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Select Wallet
              </label>
              <select
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
                style={styles.select}
              >
                <option value="all">All Wallets (Platform Report)</option>
                <option value="0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2">Alice Johnson</option>
                <option value="0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t">Bob Chen</option>
                <option value="0x9f8e7d6c5b4a3928374656789abcdef0123456789">Carol Smith</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Report Period
              </label>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                style={styles.select}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
                <option value="ytd">Year to Date</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={styles.select}
              >
                <option value="pnl">P&L Analysis</option>
                <option value="transfers">Transfer Tracking</option>
                <option value="balance">Balance History</option>
                <option value="tax">Tax Report</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Actions
              </label>
              <button
                onClick={generateReport}
                disabled={isGenerating}
                style={styles.generateButton}
              >
                {isGenerating ? '⏳ Generating...' : '📈 Generate Report'}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div style={styles.card}>
              <div style={styles.loading}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <h3>Generating Trading Reports...</h3>
                <p>Analyzing transactions, calculating P&L, and preparing comprehensive reports</p>
              </div>
            </div>
          ) : (
            <>
              {/* Reports Display */}
              {reports.map((wallet) => (
                <div key={wallet.address} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        📋 {wallet.clientName} - {reportType.toUpperCase()} Report
                      </h2>
                      <p style={{ color: '#666666' }}>
                        Period: {reportPeriod} | Address: {wallet.address}
                      </p>
                    </div>
                    <div>
                      <button onClick={() => exportToPDF(wallet)} style={styles.exportButton}>
                        📄 Export PDF
                      </button>
                      <button onClick={() => exportToCSV(wallet)} style={styles.exportButton}>
                        📊 Export CSV
                      </button>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div style={styles.summaryGrid}>
                    <div style={styles.summaryCard}>
                      <div style={{ ...styles.bigNumber, ...getPnLColor(wallet.totalPnL) }}>
                        {formatCurrency(wallet.totalPnL)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666666' }}>Total P&L</div>
                    </div>

                    <div style={styles.summaryCard}>
                      <div style={styles.bigNumber}>
                        {formatCurrency(wallet.currentBalance)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666666' }}>Current Balance</div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: formatPercentage(wallet.currentBalance, wallet.startingBalance).isPositive ? '#16a34a' : '#dc2626'
                      }}>
                        {formatPercentage(wallet.currentBalance, wallet.startingBalance).value}
                      </div>
                    </div>

                    <div style={styles.summaryCard}>
                      <div style={styles.bigNumber}>
                        {formatCurrency(wallet.tradingVolume)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666666' }}>Trading Volume</div>
                    </div>

                    <div style={styles.summaryCard}>
                      <div style={{ ...styles.bigNumber, color: '#dc2626' }}>
                        {formatCurrency(wallet.fees)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666666' }}>Total Fees</div>
                    </div>

                    <div style={styles.summaryCard}>
                      <div style={styles.bigNumber}>
                        {wallet.totalTransfers}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666666' }}>
                        Transfers ({wallet.transfersIn} in, {wallet.transfersOut} out)
                      </div>
                    </div>

                    <div style={styles.summaryCard}>
                      <div style={{ ...styles.bigNumber, ...getPnLColor(wallet.realizedPnL) }}>
                        {formatCurrency(wallet.realizedPnL)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666666' }}>Realized P&L</div>
                    </div>
                  </div>

                  {/* Chain Breakdown */}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    🌐 Multi-Chain Breakdown
                  </h3>
                  <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Chain</th>
                          <th style={styles.th}>P&L</th>
                          <th style={styles.th}>Volume</th>
                          <th style={styles.th}>Fees</th>
                          <th style={styles.th}>Transactions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wallet.chainBreakdown.map((chain, index) => (
                          <tr key={index}>
                            <td style={styles.td}>
                              <span style={{ marginRight: '0.5rem' }}>{chain.chainLogo}</span>
                              {chain.chainName}
                            </td>
                            <td style={{ ...styles.td, ...getPnLColor(chain.pnl) }}>
                              {formatCurrency(chain.pnl)}
                            </td>
                            <td style={styles.td}>{formatCurrency(chain.volume)}</td>
                            <td style={styles.td}>{formatCurrency(chain.fees)}</td>
                            <td style={styles.td}>{chain.transactions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Recent Transactions */}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    📋 Recent Transactions
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Type</th>
                          <th style={styles.th}>Token In</th>
                          <th style={styles.th}>Token Out</th>
                          <th style={styles.th}>USD Value</th>
                          <th style={styles.th}>Gas Fee</th>
                          <th style={styles.th}>Chain</th>
                          <th style={styles.th}>Protocol</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wallet.transactions.slice(0, 10).map((tx, index) => (
                          <tr key={index}>
                            <td style={styles.td}>
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </td>
                            <td style={styles.td}>
                              <span style={{
                                background: tx.type === 'trade' ? '#3b82f6' : 
                                           tx.type.includes('transfer') ? '#f59e0b' : '#16a34a',
                                color: '#ffffff',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}>
                                {tx.type.toUpperCase().replace('_', ' ')}
                              </span>
                            </td>
                            <td style={styles.td}>{tx.amountIn} {tx.tokenIn}</td>
                            <td style={styles.td}>{tx.amountOut} {tx.tokenOut}</td>
                            <td style={styles.td}>{formatCurrency(tx.usdValue)}</td>
                            <td style={styles.td}>{formatCurrency(tx.gasFee)}</td>
                            <td style={styles.td}>{tx.chain}</td>
                            <td style={styles.td}>{tx.protocol || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
} 