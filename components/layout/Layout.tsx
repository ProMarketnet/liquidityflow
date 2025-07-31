import React from 'react';
import Head from 'next/head';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'LiquidFlow', 
  showSidebar = false 
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Professional liquidity management for DeFi projects" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700">
        {showSidebar ? (
          <div className="flex">
            <Sidebar />
            <main className="flex-1">
              <Header />
              <div className="p-6">
                {children}
              </div>
            </main>
          </div>
        ) : (
          <>
            <Header />
            <main>
              {children}
            </main>
          </>
        )}
      </div>
    </>
  );
};
