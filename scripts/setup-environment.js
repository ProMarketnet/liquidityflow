#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 LiquidFlow Environment Setup');
console.log('================================');

// Check if .env already exists
const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../a .env.example');

if (fs.existsSync(envPath)) {
  console.log('📄 .env file already exists');
  const currentEnv = fs.readFileSync(envPath, 'utf8');
  
  if (currentEnv.includes('MORALIS_API_KEY=') && !currentEnv.includes('MORALIS_API_KEY=your-moralis-api-key-here')) {
    console.log('✅ Moralis API key is already configured');
    console.log('\n🎯 Current setup looks good!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run build');
    console.log('2. Run: npm run dev (for local testing)');
    console.log('3. Test /app-v2 page');
    process.exit(0);
  }
}

console.log('\n📋 Environment Configuration Needed:');
console.log('');

// Copy .env.example to .env if it doesn't exist
if (!fs.existsSync(envPath)) {
  console.log('📄 Creating .env file from template...');
  fs.copyFileSync(envExamplePath, envPath);
}

// Generate JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

// Read current .env
let envContent = fs.readFileSync(envPath, 'utf8');

// Update JWT secret
envContent = envContent.replace(
  'JWT_SECRET=your-super-secret-jwt-key-here-change-in-production',
  `JWT_SECRET=${jwtSecret}`
);

// Get Moralis API key from command line argument
const moralisApiKey = process.argv[2];

if (moralisApiKey) {
  console.log('🔑 Setting up Moralis API key...');
  envContent = envContent.replace(
    'MORALIS_API_KEY=your-moralis-api-key-here',
    `MORALIS_API_KEY=${moralisApiKey}`
  );
  
  // Write updated .env
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Environment configured successfully!');
  console.log('');
  console.log('🎯 Setup Complete! Next steps:');
  console.log('1. Run: npm run build');
  console.log('2. Run: npm run dev (for local testing)');
  console.log('3. Test /app-v2 page with wallet connection');
  console.log('');
  console.log('🚀 Your platform is ready for production!');
  
} else {
  console.log('❌ Moralis API key required');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/setup-environment.js YOUR_MORALIS_API_KEY');
  console.log('');
  console.log('📖 To get your Moralis API key:');
  console.log('1. Go to https://moralis.io/');
  console.log('2. Create account / Sign in');
  console.log('3. Create new project');
  console.log('4. Copy API key from project settings');
  console.log('');
  console.log('🔧 Other optional configurations in .env:');
  console.log('- ETHEREUM_RPC_URL (for custom RPC endpoint)');
  console.log('- DATABASE_URL (for production database)');
  console.log('- NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID (for WalletConnect)');
  
  process.exit(1);
} 