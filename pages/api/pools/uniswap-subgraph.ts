import type { NextApiRequest, NextApiResponse } from 'next';

// Uniswap V2 and V3 subgraph endpoints
const UNISWAP_V2_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
const UNISWAP_V3_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

// GraphQL query for Uniswap V2 pair data
const UNISWAP_V2_PAIR_QUERY = `
  query GetPair($pairId: String!) {
    pair(id: $pairId) {
      id
      token0 {
        id
        symbol
        name
        decimals
        derivedETH
      }
      token1 {
        id
        symbol
        name
        decimals
        derivedETH
      }
      reserve0
      reserve1
      reserveUSD
      trackedReserveETH
      token0Price
      token1Price
      volumeUSD
      txCount
      createdAtTimestamp
      createdAtBlockNumber
    }
  }
`;

// GraphQL query for Uniswap V3 pool data
const UNISWAP_V3_POOL_QUERY = `
  query GetPool($poolId: String!) {
    pool(id: $poolId) {
      id
      token0 {
        id
        symbol
        name
        decimals
        derivedETH
      }
      token1 {
        id
        symbol
        name
        decimals
        derivedETH
      }
      liquidity
      sqrtPrice
      tick
      token0Price
      token1Price
      volumeUSD
      txCount
      totalValueLockedUSD
      feeTier
      createdAtTimestamp
      createdAtBlockNumber
    }
  }
`;

// GraphQL query to search for pairs by token symbols
const SEARCH_PAIRS_QUERY = `
  query SearchPairs($token0Symbol: String!, $token1Symbol: String!) {
    pairs(
      where: {
        and: [
          { token0_: { symbol_contains_nocase: $token0Symbol } }
          { token1_: { symbol_contains_nocase: $token1Symbol } }
        ]
      }
      orderBy: reserveUSD
      orderDirection: desc
      first: 5
    ) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
      reserveUSD
      volumeUSD
      txCount
    }
  }
`;

// Fetch data from Uniswap subgraph
async function queryUniswapSubgraph(endpoint: string, query: string, variables: any) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`Subgraph query failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  } catch (error) {
    console.error('Uniswap subgraph query error:', error);
    throw error;
  }
}

// Get current ETH price from Uniswap
async function getETHPrice() {
  const ETH_PRICE_QUERY = `
    {
      bundle(id: "1") {
        ethPrice
      }
    }
  `;

  try {
    const data = await queryUniswapSubgraph(UNISWAP_V2_SUBGRAPH, ETH_PRICE_QUERY, {});
    return parseFloat(data.bundle?.ethPrice || '0');
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return 0;
  }
}

// Convert pair data to standard format
function formatUniswapV2PairData(pair: any, ethPrice: number) {
  if (!pair) return null;

  const reserve0USD = parseFloat(pair.reserve0) * parseFloat(pair.token0.derivedETH) * ethPrice;
  const reserve1USD = parseFloat(pair.reserve1) * parseFloat(pair.token1.derivedETH) * ethPrice;

  return {
    address: pair.id,
    dex: 'Uniswap V2',
    protocol: 'uniswap-v2',
    chain: 'Ethereum',
    version: 'V2',
    baseToken: {
      symbol: pair.token0.symbol,
      name: pair.token0.name,
      address: pair.token0.id,
      decimals: pair.token0.decimals
    },
    quoteToken: {
      symbol: pair.token1.symbol,
      name: pair.token1.name,
      address: pair.token1.id,
      decimals: pair.token1.decimals
    },
    reserves: {
      token0: parseFloat(pair.reserve0),
      token1: parseFloat(pair.reserve1),
      token0USD: reserve0USD,
      token1USD: reserve1USD
    },
    prices: {
      token0Price: parseFloat(pair.token0Price),
      token1Price: parseFloat(pair.token1Price),
      token0PriceUSD: parseFloat(pair.token0.derivedETH) * ethPrice,
      token1PriceUSD: parseFloat(pair.token1.derivedETH) * ethPrice
    },
    liquidity: parseFloat(pair.reserveUSD),
    volume24h: parseFloat(pair.volumeUSD), // Note: This is all-time volume, would need daily data for 24h
    txCount: parseInt(pair.txCount),
    createdAt: new Date(parseInt(pair.createdAtTimestamp) * 1000).toISOString(),
    source: 'Uniswap V2 Subgraph',
    url: `https://v2.info.uniswap.org/pair/${pair.id}`
  };
}

function formatUniswapV3PoolData(pool: any, ethPrice: number) {
  if (!pool) return null;

  return {
    address: pool.id,
    dex: 'Uniswap V3',
    protocol: 'uniswap-v3',
    chain: 'Ethereum',
    version: 'V3',
    baseToken: {
      symbol: pool.token0.symbol,
      name: pool.token0.name,
      address: pool.token0.id,
      decimals: pool.token0.decimals
    },
    quoteToken: {
      symbol: pool.token1.symbol,
      name: pool.token1.name,
      address: pool.token1.id,
      decimals: pool.token1.decimals
    },
    liquidity: parseFloat(pool.totalValueLockedUSD),
    volume24h: parseFloat(pool.volumeUSD), // Note: This is all-time volume
    prices: {
      token0Price: parseFloat(pool.token0Price),
      token1Price: parseFloat(pool.token1Price),
      token0PriceUSD: parseFloat(pool.token0.derivedETH) * ethPrice,
      token1PriceUSD: parseFloat(pool.token1.derivedETH) * ethPrice
    },
    feeTier: parseInt(pool.feeTier),
    tick: parseInt(pool.tick),
    sqrtPrice: pool.sqrtPrice,
    txCount: parseInt(pool.txCount),
    createdAt: new Date(parseInt(pool.createdAtTimestamp) * 1000).toISOString(),
    source: 'Uniswap V3 Subgraph',
    url: `https://info.uniswap.org/#/pools/${pool.id}`
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, version, search } = req.query;
    
    // Handle search by token symbols
    if (search && typeof search === 'string') {
      const [token0, token1] = search.split('/');
      if (token0 && token1) {
        console.log(`🔍 Searching for ${token0}/${token1} pairs...`);
        
        const data = await queryUniswapSubgraph(UNISWAP_V2_SUBGRAPH, SEARCH_PAIRS_QUERY, {
          token0Symbol: token0,
          token1Symbol: token1
        });

        const ethPrice = await getETHPrice();
        const formattedPairs = data.pairs.map((pair: any) => formatUniswapV2PairData(pair, ethPrice));

        return res.status(200).json({
          search: `${token0}/${token1}`,
          pairs: formattedPairs,
          ethPrice
        });
      }
    }

    // Handle direct pair/pool address lookup
    const pairAddress = Array.isArray(address) ? address[0] : address;
    if (!pairAddress) {
      return res.status(400).json({ error: 'Pair address or search term is required' });
    }

    console.log(`🔍 Looking up Uniswap pair: ${pairAddress}`);

    // Get current ETH price for USD calculations
    const ethPrice = await getETHPrice();
    console.log(`💰 Current ETH price: $${ethPrice}`);

    let result = null;

    // Try Uniswap V3 first if version specified or address looks like V3
    if (version === 'v3' || !version) {
      try {
        console.log('📊 Trying Uniswap V3...');
        const v3Data = await queryUniswapSubgraph(UNISWAP_V3_SUBGRAPH, UNISWAP_V3_POOL_QUERY, {
          poolId: pairAddress.toLowerCase()
        });

        if (v3Data.pool) {
          result = {
            success: true,
            pairInfo: formatUniswapV3PoolData(v3Data.pool, ethPrice)
          };
        }
      } catch (error) {
        console.log('⚠️ V3 lookup failed:', error);
      }
    }

    // Try Uniswap V2 if V3 failed or version specified
    if (!result && (version === 'v2' || !version)) {
      try {
        console.log('📊 Trying Uniswap V2...');
        const v2Data = await queryUniswapSubgraph(UNISWAP_V2_SUBGRAPH, UNISWAP_V2_PAIR_QUERY, {
          pairId: pairAddress.toLowerCase()
        });

        if (v2Data.pair) {
          result = {
            success: true,
            pairInfo: formatUniswapV2PairData(v2Data.pair, ethPrice)
          };
        }
      } catch (error) {
        console.log('⚠️ V2 lookup failed:', error);
      }
    }

    if (result && result.success) {
      res.status(200).json({
        address: pairAddress,
        ethPrice,
        ...result
      });
    } else {
      res.status(404).json({
        address: pairAddress,
        error: 'Pair not found in Uniswap V2 or V3',
        suggestions: [
          'Verify the pair address is correct',
          'Check if this is a valid Uniswap pair address',
          'Try searching by token symbols using ?search=TOKEN0/TOKEN1',
          'This might be a pair on a different DEX or chain'
        ]
      });
    }

  } catch (error) {
    console.error('❌ Uniswap subgraph API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data from Uniswap subgraph',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 