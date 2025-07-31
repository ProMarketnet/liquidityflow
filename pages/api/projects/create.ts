import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { ethers } from 'ethers';

interface Pool {
  address: string;
  dex: string;
  token0Symbol: string;
  token1Symbol: string;
  liquidity: number;
  volume24h: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, selectedPools }: { 
      walletAddress: string; 
      selectedPools: Pool[] 
    } = req.body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    if (!selectedPools || selectedPools.length === 0) {
      return res.status(400).json({ error: 'No pools selected' });
    }

    // For now, create a temporary user (in production, you'd have authentication)
    // Check if user exists or create one
    let user = await prisma.user.findFirst({
      where: {
        email: `${walletAddress.toLowerCase()}@temp.liquidflow.com`
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `${walletAddress.toLowerCase()}@temp.liquidflow.com`,
          name: `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          password: 'temp', // In production, this would be properly handled
          plan: 'BASIC'
        }
      });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} Monitoring`,
        tokenAddress: walletAddress,
        tokenSymbol: 'ETH', // Default, could be derived from the wallet's main token
        tokenName: 'Ethereum',
        chain: 'ethereum',
        description: `Monitoring project for wallet ${walletAddress}`,
        userId: user.id
      }
    });

    // Create pools
    const createdPools = [];
    for (const poolData of selectedPools) {
      try {
        const pool = await prisma.pool.create({
          data: {
            address: poolData.address,
            dex: poolData.dex.toLowerCase().replace(' ', ''),
            version: poolData.dex.includes('V3') ? 'v3' : 'v2',
            pairAddress: poolData.address, // For simplicity, using same as pool address
            token0Address: '0x0000000000000000000000000000000000000000', // Would be fetched from DEX
            token1Address: '0x0000000000000000000000000000000000000000', // Would be fetched from DEX
            token0Symbol: poolData.token0Symbol,
            token1Symbol: poolData.token1Symbol,
            feePercentage: 0.3, // Default 0.3% fee
            chain: 'ethereum',
            projectId: project.id
          }
        });
        createdPools.push(pool);
      } catch (error) {
        console.error(`Error creating pool ${poolData.address}:`, error);
        // Continue with other pools
      }
    }

    // Initial health check for each pool
    for (const pool of createdPools) {
      try {
        await prisma.healthCheck.create({
          data: {
            projectId: project.id,
            poolId: pool.id,
            status: 'HEALTHY',
            liquidityScore: 85.0,
            slippageScore: 90.0,
            volumeScore: 80.0,
            overallScore: 85.0,
            issues: [],
            recommendations: []
          }
        });
      } catch (error) {
        console.error(`Error creating health check for pool ${pool.id}:`, error);
      }
    }

    res.status(200).json({ 
      success: true, 
      project: {
        id: project.id,
        name: project.name,
        poolCount: createdPools.length
      }
    });

  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
} 