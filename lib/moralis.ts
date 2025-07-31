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