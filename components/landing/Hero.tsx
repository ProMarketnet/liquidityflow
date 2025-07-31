import React from 'react';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <section className="relative py-20 px-4 text-center">
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
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/demo"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            View Live Demo
          </Link>
          <Link
            href="#pricing"
            className="px-8 py-4 border-2 border-blue-500 text-blue-400 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all"
          >
            See Pricing
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
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
  );
};
