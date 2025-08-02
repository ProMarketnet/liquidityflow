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
  const [managedWallets, setManagedWallets] = useState<Array<{id: string; address: string; clientName: string; status: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);

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
      border: '2px solid #000000',
      borderRadius: '1rem'
    },
    select: {
      padding: '0.75rem',
      border: '2px solid #000000',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#000000',
      background: '#ffffff'
    },
    button: {
      background: '#16a34a',
      color: '#ffffff',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    buttonSecondary: {
      background: '#dc2626',
      color: '#ffffff',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      cursor: 'pointer'
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
    },
    walletInfo: {
      background: '#eff6ff',
      border: '2px solid #3b82f6',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1rem'
    }
  };

  // 🔐 CHECK USER SESSION ON LOAD
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const currentWorkspaceId = localStorage.getItem('currentWorkspaceId');
    
    if (!userEmail) {
      // Redirect to portfolio management to login with email
      alert('🏢 Please login with your email first in Portfolio Management');
      window.location.href = '/admin/portfolios';
      return;
    }
    
    loadManagedWallets(currentWorkspaceId || undefined);
  }, []);

  useEffect(() => {
    if (managedWallets.length > 0) {
      loadReports();
    }
  }, [selectedWallet, reportPeriod, reportType, managedWallets]);

  const loadManagedWallets = async (workspaceId?: string) => {
    setIsLoadingWallets(true);
    try {
      // Get current user's email (consistent with portfolio system)
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        console.warn('⚠️ No user email found. Redirecting to portfolio management...');
        setIsLoadingWallets(false);
        return;
      }

      console.log(`🔗 Loading managed wallets for user: ${userEmail}, workspace: ${workspaceId || 'default'}`);
      
      const queryParams = new URLSearchParams({
        email: userEmail
      });
      
      if (workspaceId) {
        queryParams.append('workspace', workspaceId);
      }
      
      const response = await fetch(`/api/admin/all-wallets?${queryParams}`, {
        headers: {
          'x-user-email': userEmail,
          ...(workspaceId && { 'x-workspace-id': workspaceId })
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setManagedWallets(data.wallets || []);
        console.log(`✅ Loaded ${data.wallets?.length || 0} wallets for reports`);
        
        // Show workspace context in UI
        if (data.currentWorkspace) {
          console.log(`📊 Reports system connected to: ${data.currentWorkspace.workspaceId} (${data.currentWorkspace.role})`);
        }
      } else {
        // Use same mock data as portfolio management for consistency
        const mockWallets = getWorkspaceMockWallets(workspaceId || 'ws_personal_test');
        setManagedWallets(mockWallets);
        console.log(`✅ Using ${mockWallets.length} mock wallets for workspace reports`);
      }
    } catch (error) {
      console.error('❌ Error loading managed wallets for reports:', error);
      // Fallback to workspace-specific mock data
      const workspaceId = localStorage.getItem('currentWorkspaceId') || 'ws_personal_test';
      const mockWallets = getWorkspaceMockWallets(workspaceId);
      setManagedWallets(mockWallets);
    } finally {
      setIsLoadingWallets(false);
    }
  };

  // 🏢 WORKSPACE-SPECIFIC MOCK DATA (same as portfolio management)
  const getWorkspaceMockWallets = (workspaceId: string) => {
    const workspaceWalletData: { [key: string]: any[] } = {
      'ws_xtc_company': [
        {
          id: '1',
          address: '0x742d35Cc6635C0532925a3b8C0d2c35ad81C35C2',
          clientName: 'XTC Client - Alice Johnson',
          status: 'active'
        },
        {
          id: '2',
          address: '0x456789abcdef0123456789abcdef0123456789ab',
          clientName: 'XTC Client - Bob Smith (added by Jane)',
          status: 'active'
        }
      ],
      'ws_personal_test': [
        {
          id: '3',
          address: '0x1234567890abcdef1234567890abcdef12345678',
          clientName: 'Personal Client - Charlie Brown',
          status: 'active'
        }
      ]
    };
    
    return workspaceWalletData[workspaceId] || []; // Empty workspace if unknown
  };

  const getWorkspaceDisplayName = (): string => {
    const workspaceId = localStorage.getItem('currentWorkspaceId');
    const workspaceNames: { [key: string]: string } = {
      'ws_xtc_company': 'XTC Company',
      'ws_personal_test': 'Personal Workspace'
    };
    
    return workspaceNames[workspaceId || ''] || 'Current Workspace';
  };

  const loadReports = async () => {
    if (managedWallets.length === 0) return;
    
    setIsLoading(true);
    try {
      console.log(`📊 Loading reports for: ${selectedWallet} (${reportPeriod}, ${reportType})`);
      
      // Filter to only include managed wallets in reports
      const availableWallets = selectedWallet === 'all' 
        ? managedWallets 
        : managedWallets.filter(w => w.address === selectedWallet);

      if (availableWallets.length === 0) {
        console.warn('⚠️ No managed wallets found for selected criteria');
        setReports([]);
        return;
      }

      // In production, this would call your reports API with managed wallet addresses
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Generate reports only for managed wallets
      const mockReports: WalletReport[] = availableWallets.map(wallet => ({
        address: wallet.address,
        clientName: wallet.clientName,
        reportPeriod: reportPeriod,
        totalPnL: wallet.id === '1' ? 15420.50 : wallet.id === '2' ? -2543.75 : wallet.id === '3' ? -8932.45 : wallet.id === '4' ? 12675.80 : 5432.10,
        realizedPnL: wallet.id === '1' ? 8750.25 : wallet.id === '2' ? -1250.00 : wallet.id === '3' ? -5000.00 : wallet.id === '4' ? 7500.00 : 3000.00,
        unrealizedPnL: wallet.id === '1' ? 6670.25 : wallet.id === '2' ? -1293.75 : wallet.id === '3' ? -3932.45 : wallet.id === '4' ? 5175.80 : 2432.10,
        totalTransfers: wallet.id === '1' ? 25 : wallet.id === '2' ? 18 : wallet.id === '3' ? 12 : wallet.id === '4' ? 32 : 15,
        transfersIn: wallet.id === '1' ? 15 : wallet.id === '2' ? 10 : wallet.id === '3' ? 7 : wallet.id === '4' ? 20 : 9,
        transfersOut: wallet.id === '1' ? 10 : wallet.id === '2' ? 8 : wallet.id === '3' ? 5 : wallet.id === '4' ? 12 : 6,
        currentBalance: wallet.id === '1' ? 245823.12 : wallet.id === '2' ? 123456.78 : wallet.id === '3' ? 87234.56 : wallet.id === '4' ? 456789.23 : 198765.43,
        startingBalance: wallet.id === '1' ? 230402.62 : wallet.id === '2' ? 126000.53 : wallet.id === '3' ? 96167.01 : wallet.id === '4' ? 444113.43 : 193333.33,
        highestBalance: wallet.id === '1' ? 252000.00 : wallet.id === '2' ? 135000.00 : wallet.id === '3' ? 98000.00 : wallet.id === '4' ? 470000.00 : 205000.00,
        lowestBalance: wallet.id === '1' ? 225000.00 : wallet.id === '2' ? 118000.00 : wallet.id === '3' ? 82000.00 : wallet.id === '4' ? 440000.00 : 185000.00,
        tradingVolume: wallet.id === '1' ? 125000.00 : wallet.id === '2' ? 89000.00 : wallet.id === '3' ? 45000.00 : wallet.id === '4' ? 275000.00 : 112000.00,
        fees: wallet.id === '1' ? 892.35 : wallet.id === '2' ? 654.20 : wallet.id === '3' ? 321.15 : wallet.id === '4' ? 1234.56 : 567.89,
        transactions: [
          {
            hash: `0x${wallet.id}abc123...`,
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
          }
        ],
        chainBreakdown: [
          {
            chainName: 'Ethereum',
            chainLogo: '⟠',
            pnl: wallet.id === '1' ? 12420.50 : wallet.id === '2' ? -1543.75 : wallet.id === '3' ? -6932.45 : wallet.id === '4' ? 9675.80 : 4432.10,
            volume: wallet.id === '1' ? 95000.00 : wallet.id === '2' ? 65000.00 : wallet.id === '3' ? 32000.00 : wallet.id === '4' ? 200000.00 : 85000.00,
            fees: wallet.id === '1' ? 675.25 : wallet.id === '2' ? 480.15 : wallet.id === '3' ? 240.10 : wallet.id === '4' ? 920.40 : 425.65,
            transactions: wallet.id === '1' ? 18 : wallet.id === '2' ? 12 : wallet.id === '3' ? 8 : wallet.id === '4' ? 24 : 11
          },
          {
            chainName: 'Solana',
            chainLogo: '◎',
            pnl: wallet.id === '1' ? 3000.00 : wallet.id === '2' ? -1000.00 : wallet.id === '3' ? -2000.00 : wallet.id === '4' ? 3000.00 : 1000.00,
            volume: wallet.id === '1' ? 30000.00 : wallet.id === '2' ? 24000.00 : wallet.id === '3' ? 13000.00 : wallet.id === '4' ? 75000.00 : 27000.00,
            fees: wallet.id === '1' ? 217.10 : wallet.id === '2' ? 174.05 : wallet.id === '3' ? 81.05 : wallet.id === '4' ? 314.16 : 142.24,
            transactions: wallet.id === '1' ? 7 : wallet.id === '2' ? 6 : wallet.id === '3' ? 4 : wallet.id === '4' ? 8 : 4
          }
        ]
      }));

      setReports(mockReports);
      console.log('✅ Reports generated for managed wallets:', mockReports.length);
    } catch (error) {
      console.error('❌ Error loading reports:', error);
      setReports([]);
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
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ marginBottom: '0.5rem', color: '#0d1421' }}>
              📊 Trading Reports
            </h1>
            <p style={{ margin: 0, color: '#4a5568' }}>
              Generate comprehensive P&L, transfer tracking, and wallet balance reports for tax and accounting purposes
            </p>
            {localStorage.getItem('userEmail') && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#eff6ff',
                border: '1px solid #3b82f6',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#1e40af'
              }}>
                <strong>👤 User:</strong> {localStorage.getItem('userEmail')} • 
                <strong> Workspace:</strong> {getWorkspaceDisplayName()} •
                <strong> Wallets:</strong> {managedWallets.length} client{managedWallets.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Report Controls */}
          <div style={styles.controls}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                📝 Select Wallet
              </label>
              {isLoadingWallets ? (
                <div style={styles.select}>Loading managed wallets...</div>
              ) : (
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  style={styles.select}
                >
                  <option value="all">All Wallets (Platform Report)</option>
                  {managedWallets.length === 0 ? (
                    <option disabled>No managed wallets found</option>
                  ) : (
                    managedWallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.address}>
                        {wallet.clientName} - {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)} 
                        {wallet.status === 'critical' ? ' ⚠️' : wallet.status === 'warning' ? ' ⚠️' : ' ✅'}
                      </option>
                    ))
                  )}
                </select>
              )}
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                Only wallets from Portfolio Management can generate reports
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                📅 Report Period
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                📊 Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={styles.select}
              >
                <option value="pnl">P&L Analysis</option>
                <option value="transfers">Transfer History</option>
                <option value="balance">Balance History</option>
                <option value="tax">Tax Report</option>
                <option value="fees">Fee Analysis</option>
                <option value="comprehensive">Comprehensive Report</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                🎬 Actions
              </label>
              <button
                onClick={() => {
                  if (managedWallets.length === 0) {
                    alert('⚠️ No managed wallets found. Please add wallets in Portfolio Management first.');
                    return;
                  }
                  setIsGenerating(true);
                  setTimeout(() => setIsGenerating(false), 2000);
                  loadReports();
                }}
                style={{
                  ...styles.button,
                  opacity: isLoading || isGenerating || managedWallets.length === 0 ? 0.6 : 1,
                  cursor: isLoading || isGenerating || managedWallets.length === 0 ? 'not-allowed' : 'pointer'
                }}
                disabled={isLoading || isGenerating || managedWallets.length === 0}
              >
                {isGenerating ? '⏳ Generating...' : '📈 Generate Report'}
              </button>
            </div>
          </div>

          {/* Connection Status Info */}
          {managedWallets.length > 0 && (
            <div style={styles.walletInfo}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>
                🔗 Connected to Portfolio Management
              </h4>
              <p style={{ margin: 0, color: '#1e40af' }}>
                Found {managedWallets.length} managed wallet{managedWallets.length !== 1 ? 's' : ''} available for reporting. 
                {managedWallets.filter(w => w.status === 'critical').length > 0 && 
                  ` ${managedWallets.filter(w => w.status === 'critical').length} wallet(s) need attention.`
                }
              </p>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#475569' }}>
                <strong>Active Clients:</strong> {managedWallets.map(w => w.clientName).join(', ')}
              </div>
            </div>
          )}

          {managedWallets.length === 0 && !isLoadingWallets && (
            <div style={{
              background: '#fef2f2',
              border: '2px solid #ef4444',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc2626' }}>
                ⚠️ No Managed Wallets Found
              </h4>
              <p style={{ margin: '0 0 0.5rem 0', color: '#dc2626' }}>
                No client wallets are currently managed in the Portfolio Management system. 
                Reports can only be generated for actively managed wallets.
              </p>
              <p style={{ margin: 0, color: '#dc2626' }}>
                👉 <a href="/admin/portfolios" style={{ color: '#dc2626', fontWeight: 'bold' }}>
                  Go to Portfolio Management
                </a> to add client wallets first.
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoadingWallets ? (
            <div style={styles.card}>
              <div style={styles.loading}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
                <h3>Connecting to Portfolio System...</h3>
                <p>Loading managed wallets and their status.</p>
              </div>
            </div>
          ) : isLoading ? (
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
                      <button onClick={() => exportToPDF(wallet)} style={styles.buttonSecondary}>
                        📄 Export PDF
                      </button>
                      <button onClick={() => exportToCSV(wallet)} style={styles.buttonSecondary}>
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