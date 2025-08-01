import Moralis from 'moralis';

let isInitialized = false;

export async function initMoralis() {
  if (!isInitialized && process.env.MORALIS_API_KEY) {
    try {
      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,
      });
      isInitialized = true;
      console.log('Moralis initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Moralis:', error);
      throw error;
    }
  }
}

export interface TokenBalance {
  token_address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logo?: string;
  thumbnail?: string;
  possible_spam: boolean;
  verified_contract: boolean;
}

export interface NFTBalance {
  token_address: string;
  token_id: string;
  contract_type: string;
  owner_of: string;
  block_number: string;
  block_number_minted: string;
  token_uri?: string;
  metadata?: any;
  normalized_metadata?: any;
  possible_spam: boolean;
  verified_collection: boolean;
}

export interface WalletPortfolio {
  nativeBalance: string;
  tokenBalances: TokenBalance[];
  nftBalances: NFTBalance[];
  totalUsdValue?: string;
}

export class MoralisService {
  static async getWalletTokenBalances(address: string, chain = 'eth'): Promise<TokenBalance[]> {
    await initMoralis();
    
    try {
      const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        address,
        chain,
      });
      
      return response.toJSON() as TokenBalance[];
    } catch (error) {
      console.error('Error fetching wallet token balances:', error);
      throw error;
    }
  }

  static async getNativeBalance(address: string, chain = 'eth'): Promise<string> {
    await initMoralis();
    
    try {
      const response = await Moralis.EvmApi.balance.getNativeBalance({
        address,
        chain,
      });
      
      return response.toJSON().balance;
    } catch (error) {
      console.error('Error fetching native balance:', error);
      throw error;
    }
  }

  static async getWalletNFTs(address: string, chain = 'eth'): Promise<NFTBalance[]> {
    await initMoralis();
    
    try {
      const response = await Moralis.EvmApi.nft.getWalletNFTs({
        address,
        chain,
        limit: 100, // Adjust as needed
      });
      
      return response.toJSON().result as NFTBalance[];
    } catch (error) {
      console.error('Error fetching wallet NFTs:', error);
      throw error;
    }
  }

  static async getTokenPrice(tokenAddress: string, chain = 'eth'): Promise<any> {
    await initMoralis();
    
    try {
      const response = await Moralis.EvmApi.token.getTokenPrice({
        address: tokenAddress,
        chain,
      });
      
      return response.toJSON();
    } catch (error) {
      console.error('Error fetching token price:', error);
      throw error;
    }
  }

  static async getMultipleTokenPrices(tokenAddresses: string[], chain = 'eth'): Promise<any[]> {
    await initMoralis();
    
    try {
      const pricePromises = tokenAddresses.map(address => 
        this.getTokenPrice(address, chain).catch(error => {
          console.error(`Error fetching price for ${address}:`, error);
          return null;
        })
      );
      
      const prices = await Promise.all(pricePromises);
      return prices.filter(price => price !== null);
    } catch (error) {
      console.error('Error fetching multiple token prices:', error);
      return [];
    }
  }

  static async getWalletTokenBalancesWithPrices(address: string, chain = 'eth'): Promise<any[]> {
    await initMoralis();
    
    try {
      // Get wallet token balances
      const balances = await this.getWalletTokenBalances(address, chain);
      
      // Filter for verified, non-spam tokens with balance > 0
      const validTokens = balances.filter(token => 
        !token.possible_spam && 
        token.verified_contract &&
        parseFloat(token.balance) > 0
      );

      // Get prices for valid tokens (limit to first 10 to avoid rate limits)
      const tokensToPrice = validTokens.slice(0, 10);
      const pricePromises = tokensToPrice.map(async (token) => {
        try {
          const price = await this.getTokenPrice(token.token_address, chain);
          const balance = parseFloat(token.balance) / Math.pow(10, token.decimals);
          const usdValue = price?.usdPrice ? balance * price.usdPrice : 0;
          
          return {
            ...token,
            price: price?.usdPrice || 0,
            balance_formatted: balance,
            usd_value: usdValue,
            price_24h_change: price?.['24hrPercentChange'] || 0
          };
        } catch (error) {
          console.error(`Error getting price for ${token.symbol}:`, error);
          const balance = parseFloat(token.balance) / Math.pow(10, token.decimals);
          return {
            ...token,
            price: 0,
            balance_formatted: balance,
            usd_value: 0,
            price_24h_change: 0
          };
        }
      });

      const tokensWithPrices = await Promise.all(pricePromises);
      
      // Add remaining tokens without prices
      const remainingTokens = validTokens.slice(10).map(token => {
        const balance = parseFloat(token.balance) / Math.pow(10, token.decimals);
        return {
          ...token,
          price: 0,
          balance_formatted: balance,
          usd_value: 0,
          price_24h_change: 0
        };
      });

      return [...tokensWithPrices, ...remainingTokens];
    } catch (error) {
      console.error('Error fetching wallet balances with prices:', error);
      throw error;
    }
  }

  static async getEthPrice(chain = 'eth'): Promise<number> {
    await initMoralis();
    
    try {
      // Use WETH address for ETH price
      const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
      const price = await this.getTokenPrice(wethAddress, chain);
      return price?.usdPrice || 0;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return 0;
    }
  }

  static async getWalletPortfolio(address: string, chain = 'eth'): Promise<WalletPortfolio> {
    await initMoralis();
    
    try {
      const [nativeBalance, tokenBalances, nftBalances] = await Promise.all([
        this.getNativeBalance(address, chain),
        this.getWalletTokenBalances(address, chain),
        this.getWalletNFTs(address, chain),
      ]);

      return {
        nativeBalance,
        tokenBalances,
        nftBalances,
      };
    } catch (error) {
      console.error('Error fetching wallet portfolio:', error);
      throw error;
    }
  }

  static async getDEXTokenPairs(tokenAddress: string, chain = 'eth'): Promise<any[]> {
    await initMoralis();
    
    try {
      const response = await Moralis.EvmApi.defi.getPairReserves({
        pairAddress: tokenAddress,
        chain,
      });
      
      const result = response.toJSON();
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      console.error('Error fetching DEX token pairs:', error);
      return [];
    }
  }

  // DeFi Balance API Integration
  static async getWalletDeFiSummary(address: string, chain = 'eth'): Promise<any> {
    await initMoralis();
    
    try {
      const response = await Moralis.EvmApi.wallets.getDefiSummary({
        address,
        chain,
      });
      
      return response.toJSON();
    } catch (error) {
      console.error('Error fetching DeFi summary:', error);
      throw error;
    }
  }

  static async getWalletDeFiPositions(address: string, chain = 'eth'): Promise<any[]> {
    await initMoralis();
    
    try {
      const response = await Moralis.EvmApi.wallets.getDefiPositionsSummary({
        address,
        chain,
      });
      
      return response.toJSON();
    } catch (error) {
      console.error('Error fetching DeFi positions:', error);
      return [];
    }
  }

  // Transaction History API Integration
  static async getWalletTransactions(address: string, chain = 'eth', limit = 20): Promise<any[]> {
    await initMoralis();
    
    try {
      const response = await Moralis.EvmApi.transaction.getWalletTransactions({
        address,
        chain,
        limit,
      });
      
      return response.toJSON().result || [];
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      return [];
    }
  }

  static async getERC20Transfers(address: string, chain = 'eth', limit = 50): Promise<any[]> {
    await initMoralis();
    
    try {
      const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
        address,
        chain,
        limit,
      });
      
      return response.toJSON().result || [];
    } catch (error) {
      console.error('Error fetching ERC20 transfers:', error);
      return [];
    }
  }

  static async getWalletTransactionHistory(address: string, chain = 'eth'): Promise<any> {
    await initMoralis();
    
    try {
      console.log('Fetching transaction history for:', address);
      
      // Get transactions and token transfers in parallel
      const [transactions, tokenTransfers] = await Promise.allSettled([
        this.getWalletTransactions(address, chain, 25),
        this.getERC20Transfers(address, chain, 50),
      ]);

      const txData = transactions.status === 'fulfilled' ? transactions.value : [];
      const transferData = tokenTransfers.status === 'fulfilled' ? tokenTransfers.value : [];

      // Categorize transactions
      const categorizedTx = {
        defiSwaps: [] as any[],
        liquidityActions: [] as any[],
        lendingActions: [] as any[],
        transfers: [] as any[],
        other: [] as any[]
      };

      // Process ERC20 transfers for DeFi detection
      transferData.forEach((transfer: any) => {
        const isDefiRelated = this.isDeFiTransaction(transfer);
        if (isDefiRelated.type === 'swap') {
          categorizedTx.defiSwaps.push({...transfer, category: 'swap'});
        } else if (isDefiRelated.type === 'liquidity') {
          categorizedTx.liquidityActions.push({...transfer, category: 'liquidity'});
        } else if (isDefiRelated.type === 'lending') {
          categorizedTx.lendingActions.push({...transfer, category: 'lending'});
        } else {
          categorizedTx.transfers.push({...transfer, category: 'transfer'});
        }
      });

      // Process regular transactions
      txData.forEach((tx: any) => {
        if (!categorizedTx.defiSwaps.find((t: any) => t.transaction_hash === tx.hash) &&
            !categorizedTx.liquidityActions.find((t: any) => t.transaction_hash === tx.hash) &&
            !categorizedTx.lendingActions.find((t: any) => t.transaction_hash === tx.hash)) {
          categorizedTx.other.push({...tx, category: 'transaction'});
        }
      });

      return {
        summary: {
          totalTransactions: txData.length,
          totalTransfers: transferData.length,
          defiSwaps: categorizedTx.defiSwaps.length,
          liquidityActions: categorizedTx.liquidityActions.length,
          lendingActions: categorizedTx.lendingActions.length,
          regularTransfers: categorizedTx.transfers.length
        },
        categorized: categorizedTx,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return {
        summary: {},
        categorized: { defiSwaps: [], liquidityActions: [], lendingActions: [], transfers: [], other: [] },
        lastUpdated: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static isDeFiTransaction(transfer: any): { type: string; confidence: number } {
    const toAddress = transfer.to_address?.toLowerCase() || '';
    const fromAddress = transfer.from_address?.toLowerCase() || '';
    
    // Known DeFi protocol addresses (partial list)
    const defiAddresses = {
      // Uniswap V2/V3 Routers
      '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'swap', // Uniswap V2 Router
      '0xe592427a0aece92de3edee1f18e0157c05861564': 'swap', // Uniswap V3 Router
      '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'swap', // Uniswap V3 Router 2
      
      // SushiSwap
      '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': 'swap', // SushiSwap Router
      
      // Aave
      '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9': 'lending', // Aave V2 Pool
      '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2': 'lending', // Aave V3 Pool
      
      // Lido
      '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': 'staking', // Lido stETH
    };

    const toType = defiAddresses[toAddress as keyof typeof defiAddresses];
    const fromType = defiAddresses[fromAddress as keyof typeof defiAddresses];
    
    if (toType || fromType) {
      return { type: toType || fromType, confidence: 0.9 };
    }

    // Heuristic detection
    if (transfer.value && parseFloat(transfer.value) === 0 && transfer.transaction_hash) {
      return { type: 'swap', confidence: 0.6 }; // Likely a token swap
    }

    return { type: 'transfer', confidence: 0.3 };
  }

  static async getComprehensiveDeFiData(address: string, chain = 'eth'): Promise<any> {
    await initMoralis();
    
    try {
      console.log('Fetching comprehensive DeFi data for:', address);
      
      // Fetch DeFi summary and positions
      const [defiSummary, defiPositions] = await Promise.allSettled([
        this.getWalletDeFiSummary(address, chain),
        this.getWalletDeFiPositions(address, chain),
      ]);

      // Try to get protocol-specific data for major DeFi protocols
      const protocolData: Record<string, any> = {};
      
      // Check for specific protocols with proper types
      const supportedProtocols = [
        'uniswap-v3' as const,
        'uniswap-v2' as const, 
        'sushiswap-v2' as const,
        'aave-v2' as const,
        'aave-v3' as const,
        'lido' as const
      ];
      
      for (const protocol of supportedProtocols) {
        try {
          const response = await Moralis.EvmApi.wallets.getDefiPositionsByProtocol({
            address,
            protocol,
            chain,
          });
          protocolData[protocol] = response.toJSON();
        } catch (error) {
          console.error(`Error fetching ${protocol} positions:`, error);
          protocolData[protocol] = null;
        }
      }

      return {
        summary: defiSummary.status === 'fulfilled' ? defiSummary.value : null,
        positions: defiPositions.status === 'fulfilled' ? defiPositions.value : [],
        protocolBreakdown: protocolData,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching comprehensive DeFi data:', error);
      return {
        summary: null,
        positions: [],
        protocolBreakdown: {},
        lastUpdated: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default MoralisService;

// 🚀 ENHANCED EVM API FUNCTIONS - Full Moralis Web3 Data API Integration

/**
 * Get detailed wallet analytics with USD values
 */
export async function getWalletAnalytics(address: string) {
  await initMoralis();
  
  try {
    const [nativeBalance, tokenBalances, nftBalances] = await Promise.all([
      Moralis.EvmApi.balance.getNativeBalance({
        address,
        chain: "0x1"
      }),
      Moralis.EvmApi.token.getWalletTokenBalances({
        address,
        chain: "0x1"
      }),
      Moralis.EvmApi.nft.getWalletNFTs({
        address,
        chain: "0x1",
        limit: 10
      })
    ]);

    return {
      nativeBalance: nativeBalance.toJSON(),
      tokenBalances: tokenBalances.toJSON(),
      nftBalances: nftBalances.toJSON(),
      analytics: {
        totalTokens: tokenBalances.result.length,
        totalNFTs: nftBalances.result.length,
        verifiedTokens: tokenBalances.result.filter(t => (t as any).verified_contract).length,
        possibleSpamTokens: tokenBalances.result.filter(t => (t as any).possible_spam).length
      }
    };
  } catch (error) {
    console.error('Error fetching wallet analytics:', error);
    throw error;
  }
}

/**
 * Get real-time token prices for multiple tokens
 */
export async function getMultipleTokenPrices(addresses: string[]) {
  await initMoralis();
  
  try {
    const pricePromises = addresses.map(address => 
      Moralis.EvmApi.token.getTokenPrice({
        address,
        chain: "0x1"
      })
    );

    const prices = await Promise.all(pricePromises);
    return prices.map(price => price.toJSON());
  } catch (error) {
    console.error('Error fetching token prices:', error);
    throw error;
  }
}

/**
 * Get detailed token information
 */
export async function getTokenDetails(address: string) {
  await initMoralis();
  
  try {
    const [metadata, price, transfers] = await Promise.all([
      Moralis.EvmApi.token.getTokenMetadata({
        addresses: [address],
        chain: "0x1"
      }),
      Moralis.EvmApi.token.getTokenPrice({
        address,
        chain: "0x1"
      }),
      Moralis.EvmApi.token.getTokenTransfers({
        address,
        chain: "0x1",
        limit: 10
      })
    ]);

    return {
      metadata: metadata.toJSON(),
      price: price.toJSON(),
      recentTransfers: transfers.toJSON()
    };
  } catch (error) {
    console.error('Error fetching token details:', error);
    throw error;
  }
}

/**
 * Get comprehensive transaction analysis
 */
export async function getTransactionAnalysis(address: string, days: number = 30) {
  await initMoralis();
  
  try {
    const transactions = await Moralis.EvmApi.transaction.getWalletTransactions({
      address,
      chain: "0x1",
      limit: 100
    });

    const txData = transactions.toJSON();
    const recentTxs = txData.result || [];

    // Analyze transaction patterns
    const analysis = {
      totalTransactions: recentTxs.length,
      totalGasUsed: recentTxs.reduce((sum, tx) => sum + (parseInt((tx as any).gas_used || '0')), 0),
      averageGasPrice: recentTxs.length > 0 ? 
        recentTxs.reduce((sum, tx) => sum + (parseInt((tx as any).gas_price || '0')), 0) / recentTxs.length : 0,
      uniqueContracts: Array.from(new Set(recentTxs.filter(tx => tx.to_address).map(tx => tx.to_address))).length,
      transactionTypes: {
        sent: recentTxs.filter(tx => tx.from_address.toLowerCase() === address.toLowerCase()).length,
        received: recentTxs.filter(tx => tx.to_address?.toLowerCase() === address.toLowerCase()).length
      }
    };

    return {
      transactions: txData,
      analysis
    };
  } catch (error) {
    console.error('Error analyzing transactions:', error);
    throw error;
  }
}

/**
 * Get wallet's NFT collection with detailed metadata
 */
export async function getNFTCollectionDetails(address: string) {
  await initMoralis();
  
  try {
    const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
      address,
      chain: "0x1",
      format: "decimal",
      normalizeMetadata: true,
      limit: 50
    });

    const nftData = nfts.toJSON();
    const nftList = nftData.result || [];

    // Group by collection
    const collections = nftList.reduce((acc, nft) => {
      const collection = nft.token_address;
      if (!acc[collection]) {
        acc[collection] = {
          address: collection,
          name: nft.name,
          symbol: nft.symbol,
          contract_type: nft.contract_type,
          items: [],
          verified: nft.verified_collection
        };
      }
      acc[collection].items.push(nft);
      return acc;
    }, {} as any);

    return {
      nfts: nftData,
      collections: Object.values(collections),
      analytics: {
        totalNFTs: nftList.length,
        totalCollections: Object.keys(collections).length,
        verifiedCollections: Object.values(collections).filter((c: any) => c.verified).length
      }
    };
  } catch (error) {
    console.error('Error fetching NFT collection details:', error);
    throw error;
  }
}

/**
 * Get real-time blockchain stats
 */
export async function getBlockchainStats() {
  await initMoralis();
  
  try {
    // Get latest block information
    const blockNumber = await Moralis.EvmApi.block.getDateToBlock({
      date: new Date().toISOString(),
      chain: "0x1"
    });

    return {
      latestBlock: blockNumber.toJSON(),
      timestamp: new Date().toISOString(),
      chain: "Ethereum Mainnet"
    };
  } catch (error) {
    console.error('Error fetching blockchain stats:', error);
    throw error;
  }
}

// 🏦 COMPREHENSIVE DEFI API INTEGRATION - Full Moralis DeFi API Reference

/**
 * Get comprehensive DeFi protocol positions for a wallet
 * Based on: https://docs.moralis.com/web3-data-api/evm/reference/defi-api
 */
export async function getAdvancedDeFiProtocolPositions(address: string) {
  await initMoralis();
  
  try {
    // Get positions across all supported protocols
    const protocols = [
      'uniswap-v2', 'uniswap-v3', 'sushiswap', 'pancakeswap-v2', 'pancakeswap-v3',
      'aave-v2', 'aave-v3', 'compound', 'makerdao', 'curve', 'balancer-v2',
      'convex', 'yearn', 'lido', '1inch', 'dydx'
    ];

    const protocolPromises = protocols.map(async (protocol) => {
      try {
        const positions = await Moralis.EvmApi.wallets.getDefiPositionsByProtocol({
          address,
          protocol: protocol as any,
          chain: "0x1"
        });
        return {
          protocol,
          data: positions.toJSON(),
          success: true
        };
      } catch (error) {
        console.error(`Error fetching ${protocol} positions:`, error);
        return {
          protocol,
          data: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const results = await Promise.all(protocolPromises);
    
    // Process and categorize results
    const successfulProtocols = results.filter(r => r.success && r.data);
    const failedProtocols = results.filter(r => !r.success);

    return {
      address,
      totalProtocolsChecked: protocols.length,
      successfulProtocols: successfulProtocols.length,
      failedProtocols: failedProtocols.length,
      protocols: successfulProtocols,
      errors: failedProtocols,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching advanced DeFi protocol positions:', error);
    throw error;
  }
}

/**
 * Get DeFi summary with yield farming and staking information
 */
export async function getAdvancedDeFiSummary(address: string) {
  await initMoralis();
  
  try {
    const [defiSummary, defiPositions] = await Promise.all([
      Moralis.EvmApi.wallets.getDefiSummary({
        address,
        chain: "0x1"
      }),
      Moralis.EvmApi.wallets.getDefiPositionsSummary({
        address,
        chain: "0x1"
      })
    ]);

    const summaryData = defiSummary.toJSON();
    const positionsData = defiPositions.toJSON();

    // Calculate comprehensive DeFi metrics
    const totalValue = (summaryData as any).total_usd_value || 0;
    const positions = (positionsData as any).active_protocols || [];

    return {
      address,
      summary: {
        totalUsdValue: totalValue,
        activeProtocols: positions.length,
        protocolBreakdown: positions.map((protocol: any) => ({
          name: protocol.protocol_name,
          totalValue: protocol.total_usd_value,
          positionCount: protocol.position_count,
          categories: protocol.categories || []
        }))
      },
      detailedPositions: positionsData,
      rawSummary: summaryData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching advanced DeFi summary:', error);
    throw error;
  }
}

/**
 * Get specific protocol liquidity positions (Uniswap, SushiSwap, etc.)
 */
export async function getLiquidityPoolPositions(address: string, protocol: string = 'uniswap-v3') {
  await initMoralis();
  
  try {
    const positions = await Moralis.EvmApi.wallets.getDefiPositionsByProtocol({
      address,
      protocol: protocol as any,
      chain: "0x1"
    });

    const positionsData = positions.toJSON();
    const liquidityPositions = (positionsData as any).result || [];

    // Extract liquidity pool specific data
    const poolPositions = liquidityPositions
      .filter((pos: any) => pos.position_type === 'liquidity_pool' || pos.position_type === 'lp')
      .map((pos: any) => ({
        pool: pos.pair || pos.pool_address,
        tokens: pos.position_tokens || [],
        liquidity: pos.liquidity_usd || pos.total_usd_value,
        fees24h: pos.fees_24h_usd || 0,
        apr: pos.apr || 0,
        protocolName: pos.protocol_name
      }));

    return {
      address,
      protocol,
      totalPools: poolPositions.length,
      totalLiquidity: poolPositions.reduce((sum: number, pos: any) => sum + (pos.liquidity || 0), 0),
      totalFees24h: poolPositions.reduce((sum: number, pos: any) => sum + (pos.fees24h || 0), 0),
      positions: poolPositions,
      rawData: positionsData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching ${protocol} liquidity positions:`, error);
    throw error;
  }
}

/**
 * Get lending and borrowing positions across protocols
 */
export async function getLendingBorrowingPositions(address: string) {
  await initMoralis();
  
  try {
    const lendingProtocols = ['aave-v2', 'aave-v3', 'compound'];
    
    const lendingPromises = lendingProtocols.map(async (protocol) => {
      try {
        const positions = await Moralis.EvmApi.wallets.getDefiPositionsByProtocol({
          address,
          protocol: protocol as any,
          chain: "0x1"
        });
        return {
          protocol,
          data: positions.toJSON()
        };
      } catch (error) {
        console.error(`Error fetching ${protocol} positions:`, error);
        return { protocol, data: null };
      }
    });

    const results = await Promise.all(lendingPromises);
    
    // Process lending/borrowing data
    const lendingPositions: any[] = [];
    const borrowingPositions: any[] = [];

    results.forEach(result => {
      if (result.data) {
        const positions = (result.data as any).result || [];
        positions.forEach((pos: any) => {
          if (pos.position_type === 'lending' || pos.position_type === 'supply') {
            lendingPositions.push({
              ...pos,
              protocol: result.protocol
            });
          } else if (pos.position_type === 'borrowing' || pos.position_type === 'debt') {
            borrowingPositions.push({
              ...pos,
              protocol: result.protocol
            });
          }
        });
      }
    });

    return {
      address,
      lending: {
        totalValue: lendingPositions.reduce((sum, pos) => sum + (pos.total_usd_value || 0), 0),
        positions: lendingPositions
      },
      borrowing: {
        totalValue: borrowingPositions.reduce((sum, pos) => sum + (pos.total_usd_value || 0), 0),
        positions: borrowingPositions
      },
      healthFactor: lendingPositions.length > 0 && borrowingPositions.length > 0 
        ? (lendingPositions.reduce((sum, pos) => sum + (pos.total_usd_value || 0), 0) / 
           borrowingPositions.reduce((sum, pos) => sum + (pos.total_usd_value || 0), 0))
        : null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching lending/borrowing positions:', error);
    throw error;
  }
}

/**
 * Get yield farming and staking rewards
 */
export async function getYieldFarmingPositions(address: string) {
  await initMoralis();
  
  try {
    const yieldProtocols = ['curve', 'convex', 'yearn', 'lido'];
    
    const yieldPromises = yieldProtocols.map(async (protocol) => {
      try {
        const positions = await Moralis.EvmApi.wallets.getDefiPositionsByProtocol({
          address,
          protocol: protocol as any,
          chain: "0x1"
        });
        return {
          protocol,
          data: positions.toJSON()
        };
      } catch (error) {
        console.error(`Error fetching ${protocol} yield positions:`, error);
        return { protocol, data: null };
      }
    });

    const results = await Promise.all(yieldPromises);
    
    // Process yield farming data
    const yieldPositions: any[] = [];
    let totalStaked = 0;
    let totalRewards = 0;

    results.forEach(result => {
      if (result.data) {
        const positions = (result.data as any).result || [];
        positions.forEach((pos: any) => {
          if (pos.position_type === 'yield_farming' || pos.position_type === 'staking') {
            const position = {
              ...pos,
              protocol: result.protocol,
              apy: pos.apy || pos.apr || 0,
              rewards: pos.unclaimed_rewards_usd || 0
            };
            yieldPositions.push(position);
            totalStaked += pos.total_usd_value || 0;
            totalRewards += pos.unclaimed_rewards_usd || 0;
          }
        });
      }
    });

    return {
      address,
      totalStaked,
      totalRewards,
      averageApy: yieldPositions.length > 0 
        ? yieldPositions.reduce((sum, pos) => sum + (pos.apy || 0), 0) / yieldPositions.length 
        : 0,
      positions: yieldPositions,
      protocolCount: yieldPositions.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching yield farming positions:', error);
    throw error;
  }
} 