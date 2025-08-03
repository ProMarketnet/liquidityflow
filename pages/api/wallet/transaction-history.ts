import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, days = 30 } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
  if (!MORALIS_API_KEY) {
    return res.status(500).json({ error: 'Moralis API key not configured' });
  }

  try {
    console.log(`🔍 Fetching transaction history for ${address} (last ${days} days)`);
    
    // Calculate date range
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const transactions = [];
    
    // 1. Fetch ERC20 token transfers (buy/sell transactions)
    const erc20Response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/${address}/erc20/transfers?chain=arbitrum&from_date=${fromDate.toISOString()}&to_date=${toDate.toISOString()}&limit=100`,
      {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'accept': 'application/json'
        }
      }
    );

    if (erc20Response.ok) {
      const erc20Data = await erc20Response.json();
      console.log(`📊 Found ${erc20Data.result?.length || 0} ERC20 transfers`);
      
      // Process ERC20 transfers as buy/sell transactions
      if (erc20Data.result) {
        for (const tx of erc20Data.result) {
          const isBuy = tx.to_address?.toLowerCase() === address.toLowerCase();
          const isSell = tx.from_address?.toLowerCase() === address.toLowerCase();
          
          if (isBuy || isSell) {
            transactions.push({
              hash: tx.transaction_hash,
              type: isBuy ? 'transfer_in' : 'transfer_out',
              timestamp: tx.block_timestamp,
              tokenIn: isBuy ? tx.token_symbol || 'TOKEN' : 'ETH', // Assuming ETH as payment
              tokenOut: isSell ? tx.token_symbol || 'TOKEN' : 'ETH',
              amountIn: isBuy ? parseFloat(tx.value) / Math.pow(10, tx.token_decimals || 18) : 0,
              amountOut: isSell ? parseFloat(tx.value) / Math.pow(10, tx.token_decimals || 18) : 0,
              usdValue: parseFloat(tx.value_formatted || '0') * (parseFloat(tx.usd_price || '0') || 1),
              gasFee: 0, // Will be filled from main transaction
              chain: 'Arbitrum',
              protocol: 'Token Transfer',
              blockNumber: parseInt(tx.block_number),
              tokenAddress: tx.token_address,
              tokenSymbol: tx.token_symbol,
              tokenDecimals: tx.token_decimals
            });
          }
        }
      }
    }

    // 2. Fetch native transactions (ETH transfers)
    const nativeResponse = await fetch(
      `https://deep-index.moralis.io/api/v2.2/${address}?chain=arbitrum&from_date=${fromDate.toISOString()}&to_date=${toDate.toISOString()}&limit=100`,
      {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'accept': 'application/json'
        }
      }
    );

    if (nativeResponse.ok) {
      const nativeData = await nativeResponse.json();
      console.log(`💰 Found ${nativeData.result?.length || 0} native transactions`);
      
      if (nativeData.result) {
        for (const tx of nativeData.result) {
          const isBuy = tx.to_address?.toLowerCase() === address.toLowerCase();
          const isSell = tx.from_address?.toLowerCase() === address.toLowerCase();
          
          if (isBuy || isSell && parseFloat(tx.value) > 0) {
            transactions.push({
              hash: tx.hash,
              type: isBuy ? 'transfer_in' : 'transfer_out',
              timestamp: tx.block_timestamp,
              tokenIn: isBuy ? 'ETH' : '',
              tokenOut: isSell ? 'ETH' : '',
              amountIn: isBuy ? parseFloat(tx.value) / Math.pow(10, 18) : 0,
              amountOut: isSell ? parseFloat(tx.value) / Math.pow(10, 18) : 0,
              usdValue: (parseFloat(tx.value) / Math.pow(10, 18)) * 2000, // Rough ETH price
              gasFee: parseFloat(tx.gas_price || '0') * parseFloat(tx.gas_used || '0') / Math.pow(10, 18),
              chain: 'Arbitrum',
              protocol: 'Native Transfer',
              blockNumber: parseInt(tx.block_number)
            });
          }
        }
      }
    }

    // 3. Try to fetch DEX trades/swaps (more complex, would need specific DEX APIs)
    // For now, we'll enhance the data we have

    // Sort transactions by timestamp (newest first)
    transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    console.log(`✅ Total transactions processed: ${transactions.length}`);

    res.status(200).json({
      success: true,
      transactions,
      totalTransactions: transactions.length,
      period: `${days} days`,
      address,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching transaction history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch transaction history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 