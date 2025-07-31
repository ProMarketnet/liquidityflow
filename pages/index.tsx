import React from 'react';
import Head from 'next/head';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>LiquidFlow - Professional Liquidity Management</title>
        <meta name="description" content="Professional liquidity management for DeFi projects" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-xl border-b border-white/10 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                LiquidFlow
              </div>
              
              <div className="flex items-center space-x-4">
                <a href="/demo" className="text-gray-300 hover:text-white transition-colors">
                  Demo
                </a>
                <a 
                  href="/demo"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 text-center">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Stop Watching Your{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Liquidity Die
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Professional liquidity management that prevents the death spiral. Monitor, maintain, 
              and rescue your token's trading liquidity with institutional-grade DeFi infrastructure.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a
                href="/demo"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                View Live Demo
              </a>
              <a
                href="#pricing"
                className="px-8 py-4 border-2 border-blue-500 text-blue-400 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all"
              >
                See Pricing
              </a>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">$50M+</div>
                <div className="text-gray-400">Liquidity Under Management</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">95%</div>
                <div className="text-gray-400">Crisis Recovery Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <div className="text-gray-400">Automated Monitoring</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Your Liquidity Lifeline</h2>
              <p className="text-xl text-gray-300">Professional tools that institutional traders use, now available for your project</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-white mb-3">24/7 Health Monitoring</h3>
                <p className="text-gray-300">Real-time tracking across all major DEXs. Get alerts before liquidity crisis hits, not after.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="text-4xl mb-4">🚨</div>
                <h3 className="text-xl font-semibold text-white mb-3">Emergency Liquidity Injection</h3>
                <p className="text-gray-300">Automated liquidity provision when pools drop below critical levels. Stop the death spiral immediately.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold text-white mb-3">Smart Incentive Management</h3>
                <p className="text-gray-300">Dynamic LP rewards that scale with market conditions. Keep your best liquidity providers happy.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-white mb-3">Launch Bootstrapping</h3>
                <p className="text-gray-300">Professional token launches with gradual price discovery. No more "launch and pray" strategies.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Choose Your Protection Level</h2>
              <p className="text-xl text-gray-300">From basic monitoring to full liquidity management</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Basic Monitor</h3>
                <div className="text-4xl font-bold text-blue-400 mb-6">$500<span className="text-lg text-gray-400">/month</span></div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="text-gray-300">✓ Real-time liquidity monitoring</li>
                  <li className="text-gray-300">✓ Slippage analysis & alerts</li>
                  <li className="text-gray-300">✓ Weekly health reports</li>
                  <li className="text-gray-300">✓ Discord/Telegram integration</li>
                </ul>
                <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Start Monitoring
                </button>
              </div>
              
              <div className="bg-white/5 border-2 border-blue-500 rounded-xl p-8 text-center relative scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Liquidity Guardian</h3>
                <div className="text-4xl font-bold text-blue-400 mb-6">$2,000<span className="text-lg text-gray-400">/month</span></div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="text-gray-300">✓ Everything in Basic</li>
                  <li className="text-gray-300">✓ Emergency liquidity injection</li>
                  <li className="text-gray-300">✓ Automated LP incentives</li>
                  <li className="text-gray-300">✓ Advanced analytics dashboard</li>
                  <li className="text-gray-300">✓ Priority support</li>
                </ul>
                <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Get Guardian
                </button>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Enterprise</h3>
                <div className="text-4xl font-bold text-blue-400 mb-6">Custom</div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="text-gray-300">✓ Everything in Guardian</li>
                  <li className="text-gray-300">✓ Unlimited emergency liquidity</li>
                  <li className="text-gray-300">✓ Launch bootstrapping</li>
                  <li className="text-gray-300">✓ Dedicated account manager</li>
                  <li className="text-gray-300">✓ Custom integrations</li>
                </ul>
                <button className="w-full py-3 border-2 border-blue-500 text-blue-400 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Don't Let Your Project Die From Bad Liquidity
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the projects that take liquidity seriously. Start monitoring today, upgrade when you need rescue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/demo"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Start Free 7-Day Trial
              </a>
              <a
                href="mailto:hello@liquidflow.com"
                className="px-8 py-4 border-2 border-blue-500 text-blue-400 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all"
              >
                Talk to Expert
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center text-gray-400">
            <p>&copy; 2025 LiquidFlow. Professional liquidity management for serious DeFi projects.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
