import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ethers } from 'ethers';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletInfo {
  address: string;
  balance: string;
  network: string;
}

interface Pool {
  address: string;
  dex: string;
  token0Symbol: string;
  token1Symbol: string;
  liquidity: number;
  volume24h: number;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [walletInput, setWalletInput] = useState('');
  const [discoveredPools, setDiscoveredPools] = useState<Pool[]>([]);
  const [selectedPools, setSelectedPools] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Connect MetaMask wallet
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      
      if (!window.ethereum) {
        alert('Please install MetaMask to connect your wallet');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      setWalletInfo({
        address,
        balance: ethers.formatEther(balance),
        network: network.name
      });

      setStep(2);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect with wallet address input
  const connectWithAddress = async () => {
    if (!walletInput || !ethers.isAddress(walletInput)) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Use public provider to get basic info
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.infura.io/v3/your-key');
      const balance = await provider.getBalance(walletInput);

      setWalletInfo({
        address: walletInput,
        balance: ethers.formatEther(balance),
        network: 'mainnet'
      });

      setStep(2);
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      alert('Failed to fetch wallet information. Please check the address.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Discover pools associated with wallet
  const discoverPools = async () => {
    if (!walletInfo) return;

    try {
      setIsDiscovering(true);
      
      // Call our API to discover pools
      const response = await fetch('/api/pools/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletInfo.address })
      });

      if (response.ok) {
        const pools = await response.json();
        setDiscoveredPools(pools);
        setStep(3);
      } else {
        throw new Error('Failed to discover pools');
      }
    } catch (error) {
      console.error('Error discovering pools:', error);
      // Mock data for demo
      setDiscoveredPools([
        {
          address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
          dex: 'Uniswap V3',
          token0Symbol: 'USDC',
          token1Symbol: 'ETH',
          liquidity: 45000000,
          volume24h: 12500000
        },
        {
          address: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
          dex: 'Uniswap V3',
          token0Symbol: 'USDC',
          token1Symbol: 'ETH',
          liquidity: 28000000,
          volume24h: 8200000
        }
      ]);
      setStep(3);
    } finally {
      setIsDiscovering(false);
    }
  };

  // Setup monitoring for selected pools
  const setupMonitoring = async () => {
    if (selectedPools.length === 0) {
      alert('Please select at least one pool to monitor');
      return;
    }

    try {
      // Create project and pools in database
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletInfo?.address,
          selectedPools: selectedPools.map(poolAddress => 
            discoveredPools.find(p => p.address === poolAddress)
          )
        })
      });

      if (response.ok) {
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        throw new Error('Failed to setup monitoring');
      }
    } catch (error) {
      console.error('Error setting up monitoring:', error);
      alert('Failed to setup monitoring. Please try again.');
    }
  };

  return (
    <Layout title="Get Started - LiquidFlow" showSidebar={false}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNum 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNum ? 'bg-blue-500' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Connect Wallet */}
          {step === 1 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
              <p className="text-gray-400 mb-8">
                Connect your wallet or enter a wallet address to start monitoring liquidity pools
              </p>

              <div className="space-y-6">
                {/* MetaMask Connection */}
                <div className="border border-white/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Connect with MetaMask</h3>
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
                  >
                    {isConnecting ? 'Connecting...' : '🦊 Connect MetaMask'}
                  </button>
                </div>

                <div className="text-gray-400">or</div>

                {/* Manual Address Input */}
                <div className="border border-white/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Enter Wallet Address</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="0x..."
                      value={walletInput}
                      onChange={(e) => setWalletInput(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={connectWithAddress}
                      disabled={isConnecting || !walletInput}
                      className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect Address'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Wallet Connected */}
          {step === 2 && walletInfo && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h1 className="text-3xl font-bold text-white mb-4">Wallet Connected!</h1>
              
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-green-300 font-medium">Connected</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-300">
                    <span className="text-gray-400">Address:</span> {walletInfo.address}
                  </div>
                  <div className="text-gray-300">
                    <span className="text-gray-400">Balance:</span> {parseFloat(walletInfo.balance).toFixed(4)} ETH
                  </div>
                  <div className="text-gray-300">
                    <span className="text-gray-400">Network:</span> {walletInfo.network}
                  </div>
                </div>
              </div>

              <p className="text-gray-400 mb-6">
                Now let's discover the liquidity pools associated with your wallet
              </p>

              <button
                onClick={discoverPools}
                disabled={isDiscovering}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
              >
                {isDiscovering ? 'Discovering Pools...' : 'Discover My Pools'}
              </button>
            </div>
          )}

          {/* Step 3: Pool Selection */}
          {step === 3 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h1 className="text-3xl font-bold text-white mb-4">Select Pools to Monitor</h1>
              <p className="text-gray-400 mb-6">
                We found {discoveredPools.length} pools associated with your wallet. Select which ones you'd like to monitor.
              </p>

              <div className="space-y-4 mb-6">
                {discoveredPools.map((pool) => (
                  <div 
                    key={pool.address}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPools.includes(pool.address)
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    onClick={() => {
                      setSelectedPools(prev => 
                        prev.includes(pool.address)
                          ? prev.filter(addr => addr !== pool.address)
                          : [...prev, pool.address]
                      );
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">
                          {pool.token0Symbol}/{pool.token1Symbol}
                        </div>
                        <div className="text-sm text-gray-400">{pool.dex}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">${pool.liquidity.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Liquidity</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">${pool.volume24h.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">24h Volume</div>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 ${
                        selectedPools.includes(pool.address)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {selectedPools.includes(pool.address) && (
                          <div className="text-white text-xs text-center">✓</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={selectedPools.length === 0}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
                >
                  Continue ({selectedPools.length} selected)
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Setup Complete */}
          {step === 4 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-4">Setup Your Monitoring</h1>
              <p className="text-gray-400 mb-6">
                You've selected {selectedPools.length} pools to monitor. We'll start tracking their liquidity, slippage, and volume in real-time.
              </p>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">What happens next?</h3>
                <ul className="text-left text-gray-300 space-y-2">
                  <li>• Real-time monitoring of your selected pools</li>
                  <li>• Instant alerts for liquidity drops or high slippage</li>
                  <li>• Daily health reports via email</li>
                  <li>• Emergency intervention when needed</li>
                </ul>
              </div>

              <button
                onClick={setupMonitoring}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-lg"
              >
                🚀 Start Monitoring
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 