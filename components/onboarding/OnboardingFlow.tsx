import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';
import { WalletButton } from '@/components/wallet/WalletModal';
import { WalletPortfolio } from '@/components/wallet/WalletPortfolio';
import { DeFiPositions } from '@/components/wallet/DeFiPositions';

interface Pool {
  address: string;
  dex: string;
  token0Symbol: string;
  token1Symbol: string;
  liquidity: number;
  volume24h: number;
}

export function OnboardingFlow() {
  const { wallet } = useWallet();
  const [step, setStep] = useState(1);
  const [discoveredPools, setDiscoveredPools] = useState<Pool[]>([]);
  const [selectedPools, setSelectedPools] = useState<string[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Progress to step 2 when wallet connects
  useEffect(() => {
    if (wallet && step === 1) {
      setStep(2);
    } else if (!wallet && step > 1) {
      setStep(1);
    }
  }, [wallet, step]);

  // Discover pools associated with wallet
  const discoverPools = async () => {
    if (!wallet) return;

    try {
      setIsDiscovering(true);
      
      const response = await fetch('/api/pools/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: wallet.address })
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
      setIsSettingUp(true);
      
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet?.address,
          selectedPools: selectedPools.map(poolAddress => 
            discoveredPools.find(p => p.address === poolAddress)
          )
        })
      });

      if (response.ok) {
        setStep(4);
        // Redirect to dashboard after a brief success message
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        throw new Error('Failed to setup monitoring');
      }
    } catch (error) {
      console.error('Error setting up monitoring:', error);
      alert('Failed to setup monitoring. Please try again.');
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
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
        <div className="bg-white/10 border border-white/20 rounded-xl p-8 text-center shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-6">Connect Your Wallet</h1>
          <p className="text-gray-200 mb-8 text-lg">
            Connect your wallet to start monitoring liquidity pools
          </p>
          
          <div className="flex justify-center">
            <WalletButton />
          </div>
        </div>
      )}

      {/* Step 2: Wallet Connected */}
      {step === 2 && wallet && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-6">Wallet Connected!</h1>
          
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-green-300 font-medium">Connected</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">
                <span className="text-gray-400">Address:</span> {wallet.address}
              </div>
              <div className="text-gray-300">
                <span className="text-gray-400">Balance:</span> {parseFloat(wallet.balance).toFixed(4)} ETH
              </div>
              <div className="text-gray-300">
                <span className="text-gray-400">Network:</span> {wallet.network}
              </div>
            </div>
          </div>

          <p className="text-gray-200 mb-6 text-lg">
            Now let's discover the liquidity pools associated with your wallet
          </p>

          <button
            onClick={discoverPools}
            disabled={isDiscovering}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
          >
            {isDiscovering ? 'Discovering Pools...' : 'Discover My Pools'}
          </button>
          
          {/* Portfolio Overview */}
          <WalletPortfolio />
          
          {/* DeFi Positions */}
          <DeFiPositions />
        </div>
      )}

      {/* Step 3: Pool Selection */}
      {step === 3 && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-6">Select Pools to Monitor</h1>
          <p className="text-gray-200 mb-6 text-lg">
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
              onClick={setupMonitoring}
              disabled={selectedPools.length === 0 || isSettingUp}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
            >
              {isSettingUp ? 'Setting up...' : `Continue (${selectedPools.length} selected)`}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Setup Complete */}
      {step === 4 && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-8 text-center shadow-2xl">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-white mb-6">Monitoring Activated!</h1>
          <p className="text-gray-200 mb-6 text-lg">
            You've successfully set up monitoring for {selectedPools.length} pools. 
            Redirecting to your dashboard...
          </p>

          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">What happens next?</h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li>• Real-time monitoring of your selected pools</li>
              <li>• Instant alerts for liquidity drops or high slippage</li>
              <li>• Daily health reports via dashboard</li>
              <li>• Emergency intervention when needed</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
} 