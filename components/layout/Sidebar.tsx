import React from 'react';
import Link from 'next/link';

export const Sidebar: React.FC = () => {
  const navItems = [
    { href: '/dashboard', icon: '📊', label: 'Overview' },
    { href: '/dashboard/pools', icon: '💧', label: 'Liquidity Pools' },
    { href: '/dashboard/alerts', icon: '🚨', label: 'Alerts & Monitoring' },
    { href: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 min-h-screen">
      <div className="p-6">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          LiquidFlow
        </Link>
      </div>
      
      <nav className="mt-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center px-6 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};
