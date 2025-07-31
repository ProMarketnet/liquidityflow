import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { WalletProvider } from '@/components/wallet/WalletProvider';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

function OnboardingPageContent() {
  return (
    <>
      <Head>
        <title>Get Started - LiquidFlow</title>
        <meta name="description" content="Connect your wallet and start monitoring liquidity pools" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Custom Header for Onboarding */}
      <header className="bg-gray-900/95 backdrop-blur-xl border-b border-white/10 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LiquidFlow
            </Link>
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gray-900 pt-16" style={{
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)'
      }}>
        <OnboardingFlow />
      </div>
    </>
  );
}

export default function OnboardingPage() {
  // Force Railway cache refresh - v2.0
  return (
    <WalletProvider>
      <OnboardingPageContent />
    </WalletProvider>
  );
} 