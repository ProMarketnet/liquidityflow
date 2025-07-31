import React, { useState } from 'react';
import { useWallet } from './WalletProvider';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectWallet, isConnecting, availableWallets } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleWalletConnect = async (walletId: string) => {
    try {
      setError(null);
      await connectWallet(walletId);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInstallWallet = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/10 border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-300 mb-6 text-center">
          Choose your preferred wallet to connect to LiquidFlow
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {availableWallets.map((wallet) => (
            <div key={wallet.id}>
              {wallet.installed ? (
                <button
                  onClick={() => handleWalletConnect(wallet.id)}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{wallet.icon}</span>
                    <div className="text-left">
                      <div className="text-white font-medium">{wallet.name}</div>
                      <div className="text-gray-400 text-sm">Available</div>
                    </div>
                  </div>
                  
                  {isConnecting ? (
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => wallet.downloadUrl && handleInstallWallet(wallet.downloadUrl)}
                  className="w-full flex items-center justify-between p-4 bg-gray-800/50 border border-gray-600/50 rounded-lg transition-all hover:bg-gray-800/70"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl opacity-50">{wallet.icon}</span>
                    <div className="text-left">
                      <div className="text-gray-300 font-medium">{wallet.name}</div>
                      <div className="text-gray-500 text-sm">Not installed</div>
                    </div>
                  </div>
                  
                  <div className="text-blue-400 text-sm font-medium">
                    Install
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-gray-400 text-xs text-center">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export function WalletButton() {
  const { wallet, disconnectWallet } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (wallet) {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2">
          <div className="text-white text-sm font-medium">
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </div>
          <div className="text-gray-400 text-xs">
            {parseFloat(wallet.balance).toFixed(4)} ETH
          </div>
        </div>
        
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
              <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all font-bold text-xl border-2 border-blue-400 hover:border-blue-300 transform hover:scale-105 shadow-lg"
        >
          🔗 Connect Wallet
        </button>
      
      <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
} 