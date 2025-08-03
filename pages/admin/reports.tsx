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
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
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
    // Add client-side check for SSR compatibility
    if (typeof window === 'undefined') {
      return;
    }
    
    const userEmail = localStorage.getItem('userEmail');
    const currentWorkspaceId = localStorage.getItem('currentWorkspaceId');
    
    if (!userEmail) {
      // Redirect to portfolio management to login with email
      alert('🏢 Please login with your email first in Portfolio Management');
      window.location.href = '/admin/portfolios';
      return;
    }
    
    loadManagedWallets();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadManagedWallets();
    }
  }, []);

  // Auto-select all wallets when first loaded
  useEffect(() => {
    if (managedWallets.length > 0 && selectedWallets.length === 0) {
      setSelectedWallets(managedWallets.map(w => w.id));
    }
  }, [managedWallets]);

  useEffect(() => {
    if (managedWallets.length > 0) {
      loadReports();
    }
  }, [selectedWallet, reportPeriod, reportType, managedWallets]);

  const loadManagedWallets = async () => {
    if (typeof window === 'undefined') return;
    
    setIsLoadingWallets(true);
    try {
      console.log('🔍 Loading managed wallets from localStorage...');
      
      // Load from localStorage (same source as Wallet Management and Active Pairs/Pools)
      const savedWallets = localStorage.getItem('managedWallets');
      
      if (savedWallets) {
        const wallets = JSON.parse(savedWallets);
        console.log(`✅ Loaded ${wallets.length} wallets from localStorage:`, wallets.map((w: any) => ({ name: w.clientName, address: w.address })));
        setManagedWallets(wallets);
      } else {
        console.log('❌ No wallets found in localStorage');
        // Set default wallets if none exist
        const defaultWallets = [
          {
            id: '1',
            address: '0x4f02bb03',
            clientName: 'Your Connected Wallet',
            accessType: 'view_only',
            hasPrivateKey: false,
            dateAdded: '2024-01-20T10:00:00Z',
            lastActivity: '2024-01-20T18:30:00Z',
            totalValue: 8.69,
            status: 'active',
            notes: 'Main admin wallet - connected via Privy'
          }
        ];
        
        // Save defaults to localStorage and set state
        localStorage.setItem('managedWallets', JSON.stringify(defaultWallets));
        setManagedWallets(defaultWallets);
        console.log('✅ Created default wallet in localStorage');
      }
    } catch (error) {
      console.error('❌ Error loading managed wallets from localStorage:', error);
      setManagedWallets([]);
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
    // Add client-side check for SSR compatibility
    if (typeof window === 'undefined') {
      return 'Loading Workspace...';
    }
    
    const workspaceId = localStorage.getItem('currentWorkspaceId');
    const workspaceNames: { [key: string]: string } = {
      'ws_xtc_company': 'XTC Company',
      'ws_personal_test': 'Personal Workspace'
    };
    
    return workspaceNames[workspaceId || ''] || 'Current Workspace';
  };

  const loadReports = async () => {
    if (managedWallets.length === 0) return;
    if (selectedWallets.length === 0) {
      alert('⚠️ Please select at least one wallet/pair to generate reports for.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(`📊 Loading reports for ${selectedWallets.length} selected wallet(s): ${selectedWallets.join(', ')} (${reportPeriod}, ${reportType})`);
      
      // Filter to only include selected wallets in reports
      const selectedWalletData = managedWallets.filter(w => selectedWallets.includes(w.id));

      if (selectedWalletData.length === 0) {
        console.warn('⚠️ No selected wallets found');
        setReports([]);
        return;
      }

      console.log(`📋 Generating reports for: ${selectedWalletData.map(w => w.clientName).join(', ')}`);

      // In production, this would call your reports API with selected wallet addresses
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Generate reports only for selected wallets
      const mockReports: WalletReport[] = selectedWalletData.map(wallet => ({
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

  // 🎯 CHECKBOX SELECTION FUNCTIONS
  const handleWalletToggle = (walletId: string) => {
    setSelectedWallets(prev => 
      prev.includes(walletId) 
        ? prev.filter(id => id !== walletId)
        : [...prev, walletId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWallets.length === managedWallets.length) {
      setSelectedWallets([]);
    } else {
      setSelectedWallets(managedWallets.map(w => w.id));
    }
  };

  const isAllSelected = selectedWallets.length === managedWallets.length && managedWallets.length > 0;
  const isPartiallySelected = selectedWallets.length > 0 && selectedWallets.length < managedWallets.length;

  const exportToPDF = (wallet: WalletReport) => {
    try {
      // Create comprehensive PDF content as HTML with proper escaping
      const escapeHtml = (text: string) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      const reportHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(wallet.clientName)} - ${reportType.toUpperCase()} Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
    .summary-card { padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; }
    .big-number { font-size: 1.5rem; font-weight: bold; margin-bottom: 5px; }
    .positive { color: #16a34a; }
    .negative { color: #dc2626; }
    .neutral { color: #6b7280; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 0.875rem; }
    th { background-color: #f3f4f6; font-weight: bold; }
    .chain-breakdown { margin: 30px 0; }
    .footer { margin-top: 40px; text-align: center; font-size: 0.75rem; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 ${escapeHtml(wallet.clientName)} - ${reportType.toUpperCase()} Report</h1>
    <p>Period: ${reportPeriod} | Address: ${escapeHtml(wallet.address)}</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="big-number ${wallet.totalPnL > 0 ? 'positive' : wallet.totalPnL < 0 ? 'negative' : 'neutral'}">
        ${formatCurrency(wallet.totalPnL)}
      </div>
      <div>Total P&L</div>
    </div>
    <div class="summary-card">
      <div class="big-number">${formatCurrency(wallet.currentBalance)}</div>
      <div>Current Balance</div>
    </div>
    <div class="summary-card">
      <div class="big-number">${formatCurrency(wallet.tradingVolume)}</div>
      <div>Trading Volume</div>
    </div>
    <div class="summary-card">
      <div class="big-number negative">${formatCurrency(wallet.fees)}</div>
      <div>Total Fees</div>
    </div>
    <div class="summary-card">
      <div class="big-number">${wallet.transactions.length}</div>
      <div>Transfers (${wallet.transfersIn} in, ${wallet.transfersOut} out)</div>
    </div>
    <div class="summary-card">
      <div class="big-number positive">${formatCurrency(wallet.realizedPnL)}</div>
      <div>Realized P&L</div>
    </div>
  </div>

  <div class="chain-breakdown">
    <h3>🌐 Multi-Chain Breakdown</h3>
    <table>
      <thead>
        <tr><th>Chain</th><th>P&L</th><th>Volume</th><th>Fees</th><th>Transactions</th></tr>
      </thead>
      <tbody>
        ${wallet.chainBreakdown.map(chain => `
          <tr>
            <td>${escapeHtml(chain.chainName)}</td>
            <td class="${chain.pnl > 0 ? 'positive' : chain.pnl < 0 ? 'negative' : 'neutral'}">${formatCurrency(chain.pnl)}</td>
            <td>${formatCurrency(chain.volume)}</td>
            <td class="negative">${formatCurrency(chain.fees)}</td>
            <td>${chain.transactions}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div>
    <h3>📋 Recent Transactions</h3>
    <table>
      <thead>
        <tr>
          <th>Date</th><th>Type</th><th>Token In</th><th>Token Out</th><th>USD Value</th><th>Gas Fee</th><th>Chain</th><th>Protocol</th>
        </tr>
      </thead>
      <tbody>
        ${wallet.transactions.slice(0, 50).map(tx => `
          <tr>
            <td>${new Date(tx.timestamp).toLocaleDateString()}</td>
            <td>${escapeHtml(tx.type)}</td>
            <td>${escapeHtml(tx.tokenIn)} ${tx.amountIn}</td>
            <td>${escapeHtml(tx.tokenOut)} ${tx.amountOut}</td>
            <td>${formatCurrency(tx.usdValue)}</td>
            <td>${formatCurrency(tx.gasFee)}</td>
            <td>${escapeHtml(tx.chain)}</td>
            <td>${escapeHtml(tx.protocol || 'N/A')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${wallet.transactions.length > 50 ? `<p><em>Showing first 50 of ${wallet.transactions.length} transactions. Download CSV for complete data.</em></p>` : ''}
  </div>

  <div class="footer">
    <p>Generated by LiquidityFlow Portfolio Management System</p>
    <p>This report is for informational purposes only and should not be considered financial advice.</p>
  </div>
</body>
</html>`;

      // Create blob and download
      const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${wallet.clientName.replace(/\s+/g, '_')}_${reportType}_report_${new Date().toISOString().split('T')[0]}.html`;
      
      // Ensure the link is properly set up
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Force download
      setTimeout(() => {
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success message
        alert(`📄 ${wallet.clientName} ${reportType.toUpperCase()} report exported successfully!\n\nFile: ${link.download}\n\nTip: Open the HTML file and print to PDF from your browser.`);
      }, 100);
      
    } catch (error) {
      console.error('PDF export error:', error);
      alert('❌ Error generating PDF report. Please try again.');
    }
  };

  const exportToCSV = (wallet: WalletReport) => {
    try {
      // Create comprehensive CSV data
      const csvHeaders = [
        'Date',
        'Type', 
        'Token In',
        'Amount In',
        'Token Out',
        'Amount Out',
        'USD Value',
        'Gas Fee',
        'Chain',
        'Protocol',
        'Transaction Hash'
      ];

      const csvRows = wallet.transactions.map(tx => [
        new Date(tx.timestamp).toISOString(),
        tx.type,
        tx.tokenIn || '',
        tx.amountIn.toString(),
        tx.tokenOut || '',
        tx.amountOut.toString(),
        tx.usdValue.toString(),
        tx.gasFee.toString(),
        tx.chain,
        tx.protocol || '',
        tx.hash
      ]);

      // Add summary row at the top
      const summaryRows = [
        ['SUMMARY DATA'],
        ['Report Type', reportType.toUpperCase()],
        ['Client Name', wallet.clientName],
        ['Address', wallet.address],
        ['Report Period', reportPeriod],
        ['Generated Date', new Date().toISOString()],
        ['Total P&L', formatCurrency(wallet.totalPnL)],
        ['Current Balance', formatCurrency(wallet.currentBalance)],
        ['Trading Volume', formatCurrency(wallet.tradingVolume)],
        ['Total Fees', formatCurrency(wallet.fees)],
        ['Total Transactions', wallet.transactions.length.toString()],
        ['Transfers In', wallet.transfersIn.toString()],
        ['Transfers Out', wallet.transfersOut.toString()],
        ['Realized P&L', formatCurrency(wallet.realizedPnL)],
        [''],
        ['CHAIN BREAKDOWN'],
        ...wallet.chainBreakdown.map(chain => [
          chain.chainName,
          formatCurrency(chain.pnl),
          formatCurrency(chain.volume),
          formatCurrency(chain.fees),
          chain.transactions.toString()
        ]),
        [''],
        ['TRANSACTION DATA'],
        csvHeaders
      ];

      // Combine all data
      const allRows = [...summaryRows, ...csvRows];
      
      // Convert to CSV string
      const csvContent = allRows.map(row => 
        row.map(field => {
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(field).replace(/"/g, '""');
          return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') 
            ? `"${escaped}"` 
            : escaped;
        }).join(',')
      ).join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${wallet.clientName.replace(/\s+/g, '_')}_${reportType}_transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      alert(`📊 ${wallet.clientName} transaction data exported successfully!\n\nFile: ${link.download}\nRecords: ${wallet.transactions.length} transactions\n\nIncludes: Summary data, chain breakdown, and complete transaction history.`);
      
    } catch (error) {
      console.error('CSV export error:', error);
      alert('❌ Error generating CSV report. Please try again.');
    }
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
                              <a href="/admin/portfolios" style={{ ...styles.navLink, color: '#16a34a', fontWeight: 'bold' }}>🏠 Home</a>
              <a href="/admin/wallets" style={styles.navLink}>💳 Manage Wallets</a>
              <a href="/admin/portfolios" style={styles.navLink}>💼 Portfolios</a>
              <a href="/admin/analytics" style={styles.navLink}>📊 Analytics</a>
              <a href="/dashboard" style={styles.navLink}>← My Wallet</a>
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
            {typeof window !== 'undefined' && localStorage.getItem('userEmail') && (
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
                  if (selectedWallets.length === 0) {
                    alert('⚠️ Please select at least one wallet/pair to generate reports for.');
                    return;
                  }
                  setIsGenerating(true);
                  setTimeout(() => setIsGenerating(false), 2000);
                  loadReports();
                }}
                style={{
                  ...styles.button,
                  opacity: isLoading || isGenerating || managedWallets.length === 0 || selectedWallets.length === 0 ? 0.6 : 1,
                  cursor: isLoading || isGenerating || managedWallets.length === 0 || selectedWallets.length === 0 ? 'not-allowed' : 'pointer'
                }}
                disabled={isLoading || isGenerating || managedWallets.length === 0 || selectedWallets.length === 0}
              >
                {isGenerating ? '⏳ Generating...' : `📈 Generate Report${selectedWallets.length > 1 ? 's' : ''} (${selectedWallets.length})`}
              </button>
            </div>
          </div>

          {/* Wallet Selection with Checkboxes */}
          {managedWallets.length > 0 && (
            <div style={{
              background: '#f8fafc',
              border: '2px solid #3b82f6',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#1e40af', fontSize: '1.125rem' }}>
                  🎯 Select Wallets/Pairs for Reports
                </h4>
                <div>
                  <button
                    onClick={handleSelectAll}
                    style={{
                      background: isAllSelected ? '#dc2626' : '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {isAllSelected ? '❌ Deselect All' : '✅ Select All'}
                  </button>
                </div>
              </div>
              
              <p style={{ margin: '0 0 1rem 0', color: '#1e40af', fontSize: '0.875rem' }}>
                Found {managedWallets.length} managed wallet{managedWallets.length !== 1 ? 's' : ''} available. 
                Selected: {selectedWallets.length} wallet{selectedWallets.length !== 1 ? 's' : ''}
              </p>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '1rem',
                marginTop: '1rem'
              }}>
                {managedWallets.map(wallet => (
                  <div key={wallet.id} style={{
                    background: selectedWallets.includes(wallet.id) ? '#dbeafe' : '#ffffff',
                    border: selectedWallets.includes(wallet.id) ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleWalletToggle(wallet.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedWallets.includes(wallet.id)}
                        onChange={() => handleWalletToggle(wallet.id)}
                        style={{ 
                          width: '1.25rem', 
                          height: '1.25rem',
                          accentColor: '#3b82f6',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          fontSize: '1rem',
                          color: selectedWallets.includes(wallet.id) ? '#1e40af' : '#374151',
                          marginBottom: '0.25rem'
                        }}>
                          {wallet.clientName}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          fontFamily: 'Monaco, monospace'
                        }}>
                          {wallet.address}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: wallet.status === 'critical' ? '#dc2626' : '#16a34a',
                          marginTop: '0.25rem',
                          fontWeight: 'bold'
                        }}>
                          {wallet.status === 'critical' ? '⚠️ Needs Attention' : '✅ Active'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedWallets.length > 0 && (
                <div style={{
                  background: '#dcfce7',
                  border: '1px solid #16a34a',
                  borderRadius: '0.375rem',
                  padding: '0.75rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: 'bold' }}>
                    ✅ Ready to Generate Reports
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>
                    {selectedWallets.length} wallet{selectedWallets.length !== 1 ? 's' : ''} selected for {reportType.toUpperCase()} analysis over {reportPeriod}
                  </div>
                </div>
              )}
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