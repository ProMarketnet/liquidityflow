import type { NextApiRequest, NextApiResponse } from 'next';
import { getTransactionAnalysis } from '@/lib/moralis';
import { ethers } from 'ethers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, days } = req.query;
    const walletAddress = Array.isArray(address) ? address[0] : address;
    const analysisDays = days ? parseInt(Array.isArray(days) ? days[0] : days) : 30;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Get comprehensive transaction analysis using enhanced Moralis EVM API
    const analysis = await getTransactionAnalysis(walletAddress, analysisDays);

    // Format response for dashboard consumption
    const response = {
      address: walletAddress,
      analysisWindow: `${analysisDays} days`,
      timestamp: new Date().toISOString(),
      
      // Transaction analytics
      analytics: {
        totalTransactions: analysis.analysis.totalTransactions,
        totalGasUsed: analysis.analysis.totalGasUsed,
        averageGasPrice: Math.round(analysis.analysis.averageGasPrice / 1e9), // Convert to Gwei
        uniqueContracts: analysis.analysis.uniqueContracts,
        transactionTypes: analysis.analysis.transactionTypes
      },
      
      // Recent transactions (formatted for UI)
      recentTransactions: (analysis.transactions as any).result?.slice(0, 10).map((tx: any) => ({
        hash: tx.hash,
        from: tx.from_address,
        to: tx.to_address,
        value: tx.value ? (parseFloat(tx.value) / 1e18).toFixed(6) + ' ETH' : '0 ETH',
        gasUsed: tx.gas_used,
        gasPrice: tx.gas_price ? Math.round(parseInt(tx.gas_price) / 1e9) + ' Gwei' : 'N/A',
        blockNumber: tx.block_number,
        timestamp: tx.block_timestamp,
        status: tx.receipt_status === '1' ? 'Success' : 'Failed'
      })) || [],
      
      // Raw data for advanced usage
      raw: analysis
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching transaction analysis:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transaction analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 