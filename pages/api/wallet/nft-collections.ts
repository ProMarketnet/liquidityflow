import type { NextApiRequest, NextApiResponse } from 'next';
import { getNFTCollectionDetails } from '@/lib/moralis';
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

    // Get comprehensive NFT collection data using enhanced Moralis EVM API
    const nftData = await getNFTCollectionDetails(walletAddress);

    // Format response for dashboard consumption
    const response = {
      address: walletAddress,
      timestamp: new Date().toISOString(),
      
      // NFT analytics
      analytics: {
        totalNFTs: nftData.analytics.totalNFTs,
        totalCollections: nftData.analytics.totalCollections,
        verifiedCollections: nftData.analytics.verifiedCollections
      },
      
      // Collections summary
      collections: nftData.collections.map((collection: any) => ({
        address: collection.address,
        name: collection.name,
        symbol: collection.symbol,
        contractType: collection.contract_type,
        itemCount: collection.items.length,
        verified: collection.verified,
        // Sample items from each collection
        sampleItems: collection.items.slice(0, 3).map((item: any) => ({
          tokenId: item.token_id,
          name: item.name,
          image: item.normalized_metadata?.image,
          description: item.normalized_metadata?.description
        }))
      })),
      
      // Recent NFTs (all items)
      recentNFTs: (nftData.nfts as any).result?.slice(0, 20).map((nft: any) => ({
        tokenAddress: nft.token_address,
        tokenId: nft.token_id,
        name: nft.name,
        symbol: nft.symbol,
        contractType: nft.contract_type,
        image: nft.normalized_metadata?.image,
        description: nft.normalized_metadata?.description,
        attributes: nft.normalized_metadata?.attributes,
        verified: nft.verified_collection,
        possibleSpam: nft.possible_spam
      })) || [],
      
      // Raw data for advanced usage
      raw: nftData
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching NFT collections:', error);
    res.status(500).json({ 
      error: 'Failed to fetch NFT collections',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 