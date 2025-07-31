import React from 'react';
import Link from 'next/link';

export const CTA: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Don't Let Your Project Die From Bad Liquidity
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join the projects that take liquidity seriously. Start monitoring today, upgrade when you need rescue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/onboarding"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Start Free Monitoring
          </Link>
          <Link
            href="#contact"
            className="px-8 py-4 border-2 border-blue-500 text-blue-400 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all"
          >
            Talk to Expert
          </Link>
        </div>
      </div>
    </section>
  );
};
