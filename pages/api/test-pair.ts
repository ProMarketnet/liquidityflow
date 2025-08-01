import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;
    const pairAddress = Array.isArray(address) ? address[0] : address;

    if (!pairAddress) {
      return res.status(400).json({ error: 'Address is required' });
    }

    console.log('🧪 Testing APIs for address:', pairAddress);

    const results: any = {
      address: pairAddress,
      tests: {}
    };

    // Test 1: DexScreener API for Ethereum
    if (pairAddress.startsWith('0x')) {
      try {
        console.log('📱 Testing DexScreener for Ethereum...');
        const ethResponse = await fetch(
          `https://api.dexscreener.com/latest/dex/pairs/ethereum/${pairAddress}`,
          { headers: { 'accept': 'application/json' } }
        );
        
        results.tests.dexScreenerEthereum = {
          status: ethResponse.status,
          ok: ethResponse.ok,
          data: ethResponse.ok ? await ethResponse.json() : null
        };
      } catch (error) {
        results.tests.dexScreenerEthereum = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test 2: DexScreener API for Arbitrum  
      try {
        console.log('📱 Testing DexScreener for Arbitrum...');
        const arbResponse = await fetch(
          `https://api.dexscreener.com/latest/dex/pairs/arbitrum/${pairAddress}`,
          { headers: { 'accept': 'application/json' } }
        );
        
        results.tests.dexScreenerArbitrum = {
          status: arbResponse.status,
          ok: arbResponse.ok,
          data: arbResponse.ok ? await arbResponse.json() : null
        };
      } catch (error) {
        results.tests.dexScreenerArbitrum = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Test 3: DexScreener API for Solana
    else {
      try {
        console.log('🟣 Testing DexScreener for Solana...');
        const solResponse = await fetch(
          `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`,
          { headers: { 'accept': 'application/json' } }
        );
        
        results.tests.dexScreenerSolana = {
          status: solResponse.status,
          ok: solResponse.ok,
          data: solResponse.ok ? await solResponse.json() : null
        };
      } catch (error) {
        results.tests.dexScreenerSolana = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test 4: Jupiter API for Solana tokens
      try {
        console.log('🚀 Testing Jupiter API...');
        const jupiterResponse = await fetch(
          `https://price.jup.ag/v6/price?ids=${pairAddress}`,
          { headers: { 'accept': 'application/json' } }
        );
        
        results.tests.jupiter = {
          status: jupiterResponse.status,
          ok: jupiterResponse.ok,
          data: jupiterResponse.ok ? await jupiterResponse.json() : null
        };
      } catch (error) {
        results.tests.jupiter = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Test 5: Known working pairs for comparison
    try {
      console.log('✅ Testing known working USDC/ETH pair...');
      const knownPairResponse = await fetch(
        'https://api.dexscreener.com/latest/dex/pairs/ethereum/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
        { headers: { 'accept': 'application/json' } }
      );
      
      results.tests.knownWorkingPair = {
        status: knownPairResponse.status,
        ok: knownPairResponse.ok,
        pairAddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
        description: 'USDC/ETH Uniswap V3 pair',
        data: knownPairResponse.ok ? await knownPairResponse.json() : null
      };
    } catch (error) {
      results.tests.knownWorkingPair = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    res.status(200).json(results);

  } catch (error) {
    console.error('❌ Test API error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 