import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { CTA } from '@/components/landing/CTA';

export default function HomePage() {
  return (
    <Layout title="LiquidFlow - Professional Liquidity Management">
      <Hero />
      <Features />
      <Pricing />
      <CTA />
    </Layout>
  );
}
