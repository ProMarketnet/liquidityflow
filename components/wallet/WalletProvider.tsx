import React, { ReactNode, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Extend Window interface for ethereum and other wallets
declare global {
  interface Window {
    ethereum?: any;
    trustWallet?: any;
    coinbaseWalletExtension?: any;
  }
}

interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  provider: any;
}

interface WalletContextType {
  wallet: WalletInfo | null;
  isConnecting: boolean;
  connectWallet: (walletType: string) => Promise<void>;
  disconnectWallet: () => void;
  availableWallets: WalletOption[];
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  installed: boolean;
  downloadUrl?: string;
}

const WalletContext = React.createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);

  useEffect(() => {
    // Check for available wallets
    const wallets: WalletOption[] = [
      {
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        installed: !!window.ethereum?.isMetaMask,
        downloadUrl: 'https://metamask.io/download/'
      },
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '🔵',
        installed: !!window.coinbaseWalletExtension,
        downloadUrl: 'https://www.coinbase.com/wallet'
      },
      {
        id: 'trust',
        name: 'Trust Wallet',
        icon: '🛡️',
        installed: !!window.trustWallet,
        downloadUrl: 'https://trustwallet.com/'
      }
    ];

    setAvailableWallets(wallets);

    // Check if already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      // Auto-reconnect if previously connected
      connectWallet('metamask').catch(console.error);
    }
  }, []);

  const connectWallet = async (walletType: string) => {
    setIsConnecting(true);
    
    try {
      let provider: any = null;
      
      switch (walletType) {
        case 'metamask':
          if (!window.ethereum?.isMetaMask) {
            throw new Error('MetaMask not installed');
          }
          provider = new ethers.BrowserProvider(window.ethereum);
          break;
        
        case 'coinbase':
          if (!window.coinbaseWalletExtension) {
            throw new Error('Coinbase Wallet not installed');
          }
          provider = new ethers.BrowserProvider(window.coinbaseWalletExtension);
          break;
          
        case 'trust':
          if (!window.trustWallet) {
            throw new Error('Trust Wallet not installed');
          }
          provider = new ethers.BrowserProvider(window.trustWallet);
          break;
          
        default:
          throw new Error('Unsupported wallet type');
      }

      // Request account access
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      const walletInfo: WalletInfo = {
        address,
        balance: ethers.formatEther(balance),
        network: network.name,
        provider
      };

      setWallet(walletInfo);
      
      // Store connection preference
      localStorage.setItem('lastConnectedWallet', walletType);
      
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    localStorage.removeItem('lastConnectedWallet');
  };

  const value: WalletContextType = {
    wallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    availableWallets
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = React.useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
} 