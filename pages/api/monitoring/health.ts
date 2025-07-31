import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { performHealthCheck } from '@/lib/monitoring';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { projectId, poolId } = req.body;

      // Verify ownership
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: user.id
        },
        include: {
          pools: poolId ? {
            where: { id: poolId }
          } : true
        }
      });

      if (!project) {
        return res.status(403).json({ error: 'Project not found' });
      }

      // Perform health check
      const healthResults = await performHealthCheck(project);

      return res.status(200).json(healthResults);
    }

    if (req.method === 'GET') {
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { projectId, limit = '10' } = req.query;

      const healthChecks = await prisma.healthCheck.findMany({
        where: {
          project: {
            userId: user.id,
            ...(projectId && { id: projectId as string })
          }
        },
        include: {
          project: true,
          pool: true
        },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit as string)
      });

      return res.status(200).json(healthChecks);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Health monitoring API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
