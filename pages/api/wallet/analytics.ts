import type { NextApiRequest, NextApiResponse } from 'next';
import { getWalletAnalytics } from '@/lib/moralis';
import { ethers } from 'ethers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;
    const walletAddress = Array.isArray(address) ? address[0] : address;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Get comprehensive wallet analytics using enhanced Moralis EVM API
    const analytics = await getWalletAnalytics(walletAddress);

    // Format response for dashboard consumption
    const response = {
      address: walletAddress,
      timestamp: new Date().toISOString(),
      analytics: {
        // Native balance (ETH)
        ethBalance: parseFloat(analytics.nativeBalance.balance) / 1e18,
        ethBalanceUsd: 0, // Will be calculated with price data
        
        // Token analytics
        totalTokens: analytics.analytics.totalTokens,
        verifiedTokens: analytics.analytics.verifiedTokens,
        possibleSpamTokens: analytics.analytics.possibleSpamTokens,
        
        // NFT analytics  
        totalNFTs: analytics.analytics.totalNFTs,
        
        // Portfolio breakdown
        tokens: (analytics.tokenBalances as any).result?.slice(0, 10).map((token: any) => ({
          address: token.token_address,
          symbol: token.symbol,
          name: token.name,
          balance: parseFloat(token.balance) / Math.pow(10, token.decimals),
          decimals: token.decimals,
          logo: token.logo,
          verified: token.verified_contract,
          possibleSpam: token.possible_spam
        })) || [],
        
        // NFT preview
        nfts: (analytics.nftBalances as any).result?.slice(0, 5).map((nft: any) => ({
          tokenAddress: nft.token_address,
          tokenId: nft.token_id,
          name: nft.name,
          symbol: nft.symbol,
          contractType: nft.contract_type,
          metadata: nft.normalized_metadata,
          verified: nft.verified_collection
        })) || []
      },
      
      // Raw data for advanced usage
      raw: analytics
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching wallet analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 