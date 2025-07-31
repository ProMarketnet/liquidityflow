import React from 'react';

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 px-4 bg-white/5">
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
          
          <div className="bg-white/5 border-2 border-blue-500 rounded-xl p-8 text-center relative">
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
  );
};
