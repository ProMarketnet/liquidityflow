import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const Header: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full bg-dark-900/95 backdrop-blur-xl border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            LiquidFlow
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#solutions" className="text-gray-300 hover:text-primary-500 transition-colors">
              Solutions
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-primary-500 transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-gray-300 hover:text-primary-500 transition-colors">
              About
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/demo">
              <Button variant="outline" size="sm">
                View Demo
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
