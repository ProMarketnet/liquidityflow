import React from 'react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: '🎯',
      title: '24/7 Health Monitoring',
      description: 'Real-time tracking across all major DEXs. Get alerts before liquidity crisis hits, not after.'
    },
    {
      icon: '🚨',
      title: 'Emergency Liquidity Injection',
      description: 'Automated liquidity provision when pools drop below critical levels. Stop the death spiral immediately.'
    },
    {
      icon: '🎮',
      title: 'Smart Incentive Management',
      description: 'Dynamic LP rewards that scale with market conditions. Keep your best liquidity providers happy.'
    },
    {
      icon: '🚀',
      title: 'Launch Bootstrapping',
      description: 'Professional token launches with gradual price discovery. No more "launch and pray" strategies.'
    }
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Your Liquidity Lifeline</h2>
          <p className="text-xl text-gray-300">Professional tools that institutional traders use, now available for your project</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
