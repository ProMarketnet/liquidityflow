#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const MORALIS_API_KEY = process.argv[2];

if (!MORALIS_API_KEY) {
  console.error('❌ Please provide your Moralis API key as an argument');
  console.log('📝 Usage: node scripts/setup-env.js YOUR_MORALIS_API_KEY');
  process.exit(1);
}

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

// Read the example file
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ .env.example file not found');
  process.exit(1);
}

const envExample = fs.readFileSync(envExamplePath, 'utf8');

// Replace the Moralis API key placeholder
const envContent = envExample.replace(
  'your-moralis-api-key-here',
  MORALIS_API_KEY
);

// Generate a random JWT secret
const jwtSecret = require('crypto').randomBytes(32).toString('hex');
const finalEnvContent = envContent.replace(
  'your-super-secret-jwt-key-here',
  jwtSecret
);

// Write to .env file
fs.writeFileSync(envPath, finalEnvContent);

console.log('✅ Environment file created successfully!');
console.log('📄 Created .env with your Moralis API key');
console.log('🔑 Generated random JWT secret');
console.log('');
console.log('🚀 Next steps:');
console.log('1. Update DATABASE_URL with your PostgreSQL connection string');
console.log('2. Add your Infura RPC URL (optional)');
console.log('3. Run: npm run dev');
console.log('');
console.log('🌐 For Railway deployment, add these environment variables:');
console.log(`MORALIS_API_KEY=${MORALIS_API_KEY}`);
console.log(`JWT_SECRET=${jwtSecret}`); 