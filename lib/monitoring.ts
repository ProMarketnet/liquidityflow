import { Project, Pool, HealthStatus } from '@prisma/client';
import { prisma } from './db';
import { getDexData } from './dex-api';

interface HealthCheckResult {
  status: HealthStatus;
  liquidityScore: number;
  slippageScore: number;
  volumeScore: number;
  overallScore: number;
  issues: string[];
  recommendations: string[];
}

export async function performHealthCheck(
  project: Project & { pools: Pool[] }
): Promise<HealthCheckResult[]> {
  const results: HealthCheckResult[] = [];

  for (const pool of project.pools) {
    try {
      // Get latest liquidity data from DEX
      const dexData = await getDexData(pool);
      
      // Calculate health scores
      const liquidityScore = calculateLiquidityScore(dexData.totalLiquidity);
      const slippageScore = calculateSlippageScore(dexData.slippage1Percent);
      const volumeScore = calculateVolumeScore(dexData.volume24h);
      const overallScore = (liquidityScore + slippageScore + volumeScore) / 3;

      // Determine status
      let status: HealthStatus;
      if (overallScore >= 80) status = HealthStatus.HEALTHY;
      else if (overallScore >= 60) status = HealthStatus.WARNING;
      else status = HealthStatus.CRITICAL;

      // Identify issues and recommendations
      const issues = identifyIssues(dexData, liquidityScore, slippageScore, volumeScore);
      const recommendations = generateRecommendations(issues, dexData);

      // Save to database
      await prisma.healthCheck.create({
        data: {
          projectId: project.id,
          poolId: pool.id,
          status,
          liquidityScore,
          slippageScore,
          volumeScore,
          overallScore,
          issues,
          recommendations
        }
      });

      // Save liquidity data
      await prisma.liquidityData.create({
        data: {
          poolId: pool.id,
          totalLiquidity: dexData.totalLiquidity,
          token0Reserve: dexData.token0Reserve,
          token1Reserve: dexData.token1Reserve,
          volume24h: dexData.volume24h,
          lpCount: dexData.lpCount,
          slippage1Percent: dexData.slippage1Percent,
          slippage5Percent: dexData.slippage5Percent,
          priceImpact: dexData.priceImpact
        }
      });

      results.push({
        status,
        liquidityScore,
        slippageScore,
        volumeScore,
        overallScore,
        issues,
        recommendations
      });

      // Trigger alerts if needed
      if (status === HealthStatus.CRITICAL) {
        await triggerCriticalAlert(project, pool, dexData);
      }

    } catch (error) {
      console.error(`Health check failed for pool ${pool.id}:`, error);
    }
  }

  return results;
}

function calculateLiquidityScore(totalLiquidity: number): number {
  // Score based on liquidity thresholds
  if (totalLiquidity >= 100000) return 100;
  if (totalLiquidity >= 50000) return 80;
  if (totalLiquidity >= 25000) return 60;
  if (totalLiquidity >= 10000) return 40;
  return 20;
}

function calculateSlippageScore(slippage1Percent: number): number {
  // Lower slippage = higher score
  if (slippage1Percent <= 1) return 100;
  if (slippage1Percent <= 3) return 80;
  if (slippage1Percent <= 5) return 60;
  if (slippage1Percent <= 10) return 40;
  return 20;
}

function calculateVolumeScore(volume24h: number): number {
  // Score based on 24h volume
  if (volume24h >= 50000) return 100;
  if (volume24h >= 25000) return 80;
  if (volume24h >= 10000) return 60;
  if (volume24h >= 5000) return 40;
  return 20;
}

function identifyIssues(dexData: any, liquidityScore: number, slippageScore: number, volumeScore: number): string[] {
  const issues: string[] = [];

  if (liquidityScore < 60) {
    issues.push('Low liquidity depth - risk of high slippage');
  }
  
  if (slippageScore < 60) {
    issues.push('High slippage impacting trading experience');
  }
  
  if (volumeScore < 40) {
    issues.push('Low trading volume indicates poor market interest');
  }
  
  if (dexData.lpCount < 5) {
    issues.push('Very few liquidity providers - high concentration risk');
  }

  return issues;
}

function generateRecommendations(issues: string[], dexData: any): string[] {
  const recommendations: string[] = [];

  if (issues.some(issue => issue.includes('Low liquidity'))) {
    recommendations.push('Consider increasing LP incentives or emergency liquidity injection');
  }
  
  if (issues.some(issue => issue.includes('High slippage'))) {
    recommendations.push('Add more liquidity to reduce slippage impact');
  }
  
  if (issues.some(issue => issue.includes('Low trading volume'))) {
    recommendations.push('Review marketing strategy and community engagement');
  }
  
  if (issues.some(issue => issue.includes('few liquidity providers'))) {
    recommendations.push('Diversify LP base through targeted incentive programs');
  }

  return recommendations;
}

async function triggerCriticalAlert(project: Project, pool: Pool, dexData: any) {
  // Create alert in database
  await prisma.alert.create({
    data: {
      type: 'LIQUIDITY_DROP',
      severity: 'CRITICAL',
      title: 'Critical Liquidity Alert',
      message: `Pool ${pool.pairAddress} liquidity dropped to ${dexData.totalLiquidity.toFixed(2)}`,
      userId: project.userId,
      projectId: project.id,
      data: dexData
    }
  });

  // TODO: Send external notifications (Discord, Telegram, etc.)
}
