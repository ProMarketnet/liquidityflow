import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdvancedDeFiProtocolPositions } from '@/lib/moralis';
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

    // 🏦 Get comprehensive DeFi positions using advanced Moralis DeFi API
    const advancedPositions = await getAdvancedDeFiProtocolPositions(walletAddress);

    // Format response for dashboard consumption
    const response = {
      address: walletAddress,
      timestamp: new Date().toISOString(),
      
      // Protocol summary
      summary: {
        totalProtocolsChecked: advancedPositions.totalProtocolsChecked,
        activeProtocols: advancedPositions.successfulProtocols,
        failedProtocols: advancedPositions.failedProtocols
      },
      
      // Active protocol positions
      activeProtocols: advancedPositions.protocols.map(protocol => ({
        name: protocol.protocol,
        hasPositions: protocol.data && (protocol.data as any).result?.length > 0,
        positionCount: protocol.data ? (protocol.data as any).result?.length || 0 : 0,
        positions: protocol.data ? (protocol.data as any).result?.slice(0, 5).map((pos: any) => ({
          type: pos.position_type,
          value: pos.total_usd_value || 0,
          tokens: pos.position_tokens || [],
          apr: pos.apr || pos.apy || 0
        })) : []
      })).filter(protocol => protocol.hasPositions),
      
      // Protocol errors (for debugging)
      errors: advancedPositions.errors.map(error => ({
        protocol: error.protocol,
        error: error.error
      })),
      
      // Raw data for advanced usage
      raw: advancedPositions
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching advanced DeFi positions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch advanced DeFi positions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 