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

      <div className="min-h-screen pt-16" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <OnboardingFlow />
        </div>
      </div>
    </>
  );
}

export default function OnboardingPage() {
  // Force Railway cache refresh - v3.0 (clean build)
  return (
    <WalletProvider>
      <OnboardingPageContent />
    </WalletProvider>
  );
} 