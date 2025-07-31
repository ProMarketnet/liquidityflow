interface Pool {
  id: string;
  dex: string;
  version?: string;
  pair: string;
  fee?: number;
  liquidity: number;
  liquidityChange: number;
  volume24h: number;
  health: 'healthy' | 'warning' | 'critical'; // Explicit union type
  slippage: number;
  lpCount: number;
}
