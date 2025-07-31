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
}

export default MoralisService; 