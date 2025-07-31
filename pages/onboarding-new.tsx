import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { WalletProvider, useWallet } from '@/components/wallet/WalletProvider';
import { WalletButton } from '@/components/wallet/WalletModal';

function OnboardingContent() {
  const { wallet } = useWallet();
  const [step, setStep] = useState(1);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [defiData, setDefiData] = useState<any>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [selectedPools, setSelectedPools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (wallet && step === 1) {
      setStep(2);
      loadWalletData();
    }
  }, [wallet]);

  const loadWalletData = async () => {
    if (!wallet) return;
    
    setIsLoading(true);
    try {
      // Load portfolio data
      const portfolioRes = await fetch(`/api/wallet/portfolio?address=${wallet.address}`);
      if (portfolioRes.ok) {
        const portfolio = await portfolioRes.json();
        setPortfolioData(portfolio);
      }

      // Load DeFi data
      const defiRes = await fetch(`/api/wallet/defi?address=${wallet.address}`);
      if (defiRes.ok) {
        const defi = await defiRes.json();
        setDefiData(defi);
      }

      // Load transaction data
      const txRes = await fetch(`/api/wallet/transactions?address=${wallet.address}`);
      if (txRes.ok) {
        const transactions = await txRes.json();
        setTransactionData(transactions);
      }

      // Discover pools
      const poolsRes = await fetch(`/api/pools/discover?address=${wallet.address}`);
      if (poolsRes.ok) {
        const pools = await poolsRes.json();
        setSelectedPools(pools.slice(0, 5)); // Pre-select top 5 pools
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupProject = async () => {
    if (!wallet || selectedPools.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet.address,
          pools: selectedPools,
          projectName: `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)} Portfolio`
        })
      });

      if (response.ok) {
        setStep(4);
      }
    } catch (error) {
      console.error('Error setting up project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Get Started - LiquidFlow</title>
        <meta name="description" content="Connect your wallet and start monitoring liquidity pools" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LiquidFlow
            </Link>
            <Link href="/" className="text-white hover:text-blue-400 transition-colors font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen pt-20" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      }}>
        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white/20 border-2 border-white/40 rounded-2xl p-8 backdrop-blur-md shadow-2xl mb-8">
            <div className="flex items-center justify-center space-x-6">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl border-4 transition-all duration-300 shadow-xl ${
                    step >= stepNum 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-300 scale-110 shadow-blue-500/50' 
                      : 'bg-white/10 text-white border-white/40'
                  }`}>
                    {step > stepNum ? '✓' : stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div className={`w-24 h-4 mx-6 rounded-full transition-all duration-500 ${
                      step > stepNum ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6 text-lg font-bold">
              <span className={`${step >= 1 ? 'text-white' : 'text-white/60'} drop-shadow-lg`}>Connect</span>
              <span className={`${step >= 2 ? 'text-white' : 'text-white/60'} drop-shadow-lg`}>Analyze</span>
              <span className={`${step >= 3 ? 'text-white' : 'text-white/60'} drop-shadow-lg`}>Select</span>
              <span className={`${step >= 4 ? 'text-white' : 'text-white/60'} drop-shadow-lg`}>Monitor</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white/20 border-2 border-white/40 rounded-2xl p-12 backdrop-blur-md shadow-2xl">
            
            {/* Step 1: Connect Wallet */}
            {step === 1 && (
              <div className="text-center">
                <div className="text-8xl mb-8">🚀</div>
                <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-2xl">
                  Connect Your Wallet
                </h1>
                <p className="text-white text-2xl mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                  Connect your wallet to start monitoring liquidity pools and track your DeFi positions
                </p>
                
                <div className="mb-12">
                  <WalletButton />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white/15 border border-white/30 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-4xl mb-4">✨</div>
                    <h3 className="text-white text-xl font-bold mb-2">Real-time Portfolio</h3>
                    <p className="text-white/90">Track your wallet balance and token holdings</p>
                  </div>
                  <div className="bg-white/15 border border-white/30 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-white text-xl font-bold mb-2">DeFi Positions</h3>
                    <p className="text-white/90">Monitor your DeFi protocol interactions</p>
                  </div>
                  <div className="bg-white/15 border border-white/30 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-4xl mb-4">🔔</div>
                    <h3 className="text-white text-xl font-bold mb-2">Smart Alerts</h3>
                    <p className="text-white/90">Get notified of important changes</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Analyze */}
            {step === 2 && (
              <div className="text-center">
                <div className="text-8xl mb-8">📊</div>
                <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-2xl">
                  Analyzing Your Wallet
                </h1>
                {isLoading ? (
                  <div>
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-8"></div>
                    <p className="text-white text-2xl">Loading your portfolio data...</p>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                      {portfolioData && (
                        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-400/40 rounded-xl p-6">
                          <h3 className="text-white text-2xl font-bold mb-4">Portfolio Value</h3>
                          <p className="text-green-300 text-4xl font-bold">${portfolioData.totalUsdValue?.toFixed(2) || '0.00'}</p>
                          <p className="text-white mt-2">{portfolioData.tokens?.length || 0} tokens</p>
                        </div>
                      )}
                      {defiData && (
                        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-400/40 rounded-xl p-6">
                          <h3 className="text-white text-2xl font-bold mb-4">DeFi Activity</h3>
                          <p className="text-blue-300 text-4xl font-bold">{defiData.protocolCount || 0}</p>
                          <p className="text-white mt-2">protocols used</p>
                        </div>
                      )}
                      {transactionData && (
                        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-2 border-purple-400/40 rounded-xl p-6">
                          <h3 className="text-white text-2xl font-bold mb-4">Transactions</h3>
                          <p className="text-purple-300 text-4xl font-bold">{transactionData.totalTransactions || 0}</p>
                          <p className="text-white mt-2">total transactions</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setStep(3)}
                      className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-2xl font-bold border-2 border-blue-400 hover:scale-105 transition-all shadow-xl"
                    >
                      Continue to Pool Selection →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Select Pools */}
            {step === 3 && (
              <div className="text-center">
                <div className="text-8xl mb-8">🎯</div>
                <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-2xl">
                  Select Pools to Monitor
                </h1>
                <p className="text-white text-2xl mb-8">We've found {selectedPools.length} pools related to your activity</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
                  {selectedPools.slice(0, 4).map((pool, index) => (
                    <div key={index} className="bg-white/15 border border-white/30 rounded-xl p-6 text-left">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white text-xl font-bold">{pool.token0?.symbol || 'TOKEN'}/{pool.token1?.symbol || 'ETH'}</h3>
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      </div>
                      <p className="text-white/80">Pool Address: {pool.address?.slice(0, 10) || 'Loading...'}...</p>
                      <p className="text-white/80">Protocol: {pool.protocol || 'Uniswap V3'}</p>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={setupProject}
                  disabled={isLoading}
                  className="px-12 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl text-2xl font-bold border-2 border-green-400 hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                >
                  {isLoading ? 'Setting up...' : 'Start Monitoring →'}
                </button>
              </div>
            )}

            {/* Step 4: Complete */}
            {step === 4 && (
              <div className="text-center">
                <div className="text-8xl mb-8">🎉</div>
                <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-2xl">
                  You're All Set!
                </h1>
                <p className="text-white text-2xl mb-8">Your liquidity monitoring is now active</p>
                
                <div className="space-y-4 mb-8">
                  <Link href="/dashboard" className="block">
                    <button className="w-full px-12 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl text-2xl font-bold border-2 border-green-400 hover:scale-105 transition-all shadow-xl">
                      Go to Dashboard →
                    </button>
                  </Link>
                  <Link href="/dashboard/pools" className="block">
                    <button className="w-full px-12 py-4 bg-white/20 text-white rounded-xl text-xl font-bold border-2 border-white/40 hover:scale-105 transition-all">
                      View Pool Details
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function OnboardingNewPage() {
  return (
    <WalletProvider>
      <OnboardingContent />
    </WalletProvider>
  );
} 