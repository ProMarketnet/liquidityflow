import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const { projectId } = req.query;
      
      const pools = await prisma.pool.findMany({
        where: {
          project: {
            userId: user.id,
            ...(projectId && { id: projectId as string })
          }
        },
        include: {
          liquidityData: {
            orderBy: { timestamp: 'desc' },
            take: 1
          },
          healthChecks: {
            orderBy: { timestamp: 'desc' },
            take: 1
          },
          project: true
        }
      });

      return res.status(200).json(pools);
    }

    if (req.method === 'POST') {
      const { 
        address, 
        dex, 
        version, 
        pairAddress, 
        token0Address, 
        token1Address,
        token0Symbol,
        token1Symbol,
        feePercentage,
        chain,
        projectId 
      } = req.body;

      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: user.id
        }
      });

      if (!project) {
        return res.status(403).json({ error: 'Project not found or unauthorized' });
      }

      const pool = await prisma.pool.create({
        data: {
          address,
          dex,
          version,
          pairAddress,
          token0Address,
          token1Address,
          token0Symbol,
          token1Symbol,
          feePercentage,
          chain,
          projectId
        },
        include: {
          project: true
        }
      });

      return res.status(201).json(pool);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Pools API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
