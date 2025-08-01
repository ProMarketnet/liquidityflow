# 🌊 LiquidFlow

**Professional liquidity management that prevents the death spiral.** Monitor, maintain, and rescue your token's trading liquidity with institutional-grade DeFi infrastructure.

![LiquidFlow Dashboard](https://via.placeholder.com/800x400/0f172a/ffffff?text=LiquidFlow+Dashboard)

## ✨ Features

- 🎯 **24/7 Health Monitoring** - Real-time tracking across all major DEXs
- 🚨 **Emergency Liquidity Injection** - Automated provision when pools drop below critical levels
- 🎮 **Smart Incentive Management** - Dynamic LP rewards that scale with market conditions  
- 🚀 **Launch Bootstrapping** - Professional token launches with gradual price discovery
- 💼 **Portfolio Management** - Track wallet balances, DeFi positions, and transaction history
- 🔔 **Intelligent Alerts** - Get notified before liquidity crisis hits

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, React
- **Styling**: Inline styles (for deployment reliability)
- **Web3 Integration**: Ethers.js, MetaMask, Wallet Connect
- **Data APIs**: Moralis (wallet data), Uniswap Subgraph (DEX data)
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Railway (with cache-busting optimizations)

### Design System
- **Professional UI** inspired by leading DeFi platforms
- **Glassmorphism effects** with backdrop blur
- **Consistent color palette** with brand gradients
- **Responsive grid layouts** for all screen sizes
- **Accessible typography** with proper contrast ratios

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Moralis account (free tier available)

### 1. Clone and Install
```bash
git clone https://github.com/your-org/liquidityflow.git
cd liquidityflow
npm install
```

### 2. Environment Setup
```bash
# Automated setup with your Moralis API key
node scripts/setup-environment.js YOUR_MORALIS_API_KEY
```

Or manually create `.env` file:
```env
# Moralis API for Web3 Data
MORALIS_API_KEY=your-moralis-api-key-here

# Auto-generated JWT secret (or create your own)
JWT_SECRET=your-super-secret-jwt-key

# Optional: Custom RPC endpoints
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### 3. Build and Run
```bash
# Build the application
npm run build

# Start development server
npm run dev

# Open http://localhost:3000
```

### 4. Test the Platform
1. Navigate to `/app-v2` for the main dashboard
2. Connect your wallet (MetaMask recommended)
3. View your portfolio data and DeFi positions
4. Test the responsive design on different screen sizes

## 🔑 API Keys Setup

### Moralis API Key
1. Go to [moralis.io](https://moralis.io/)
2. Create account or sign in
3. Create new project
4. Copy API key from project settings
5. Use in setup script: `node scripts/setup-environment.js YOUR_API_KEY`

### Optional: Alchemy RPC (for better performance)
1. Go to [alchemy.com](https://alchemy.com/)
2. Create account and new app
3. Add RPC URLs to `.env` file

## 📱 Pages & Routes

### Public Pages
- `/` - Landing page with features and pricing
- `/onboarding-new` - Wallet connection flow

### Dashboard Pages  
- `/app-v2` - Main dashboard with portfolio overview
- `/dashboard/pools` - Liquidity pools management
- `/dashboard/alerts` - Alert configuration and history
- `/dashboard/settings` - Platform settings

### API Endpoints
- `/api/wallet/portfolio` - Get wallet balance and token holdings
- `/api/wallet/defi` - Get DeFi positions and protocol breakdown
- `/api/wallet/transactions` - Get transaction history
- `/api/pools/discover` - Discover relevant liquidity pools

## 🎨 Design System

Our design system ensures consistency across the platform:

- **Colors**: Professional dark theme with brand gradients
- **Typography**: System fonts with clear hierarchy
- **Components**: Reusable card, button, and form patterns
- **Layout**: CSS Grid with responsive breakpoints
- **Interactions**: Subtle hover effects and smooth transitions

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for detailed specifications.

## 🔧 Development

### Project Structure
```
liquidityflow/
├── pages/                 # Next.js pages and API routes
│   ├── api/              # Backend API endpoints
│   ├── dashboard/        # Dashboard pages
│   └── app-v2.tsx        # Main dashboard (inline styles)
├── components/           # React components
├── lib/                  # Utility functions and services
├── styles/               # Global styles (minimal)
├── types/                # TypeScript type definitions
└── scripts/              # Setup and utility scripts
```

### Code Style
- **TypeScript** for type safety
- **Inline styles** for Railway deployment reliability
- **Functional components** with React hooks
- **ESLint** for code quality
- **Consistent naming** with camelCase/PascalCase

### Testing
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build production bundle
npm run build
```

## 🚀 Deployment

### Railway Deployment
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on git push
4. Monitor build logs for any issues

### Environment Variables (Production)
```env
MORALIS_API_KEY=your-production-moralis-key
JWT_SECRET=your-secure-jwt-secret
DATABASE_URL=your-production-database-url
ETHEREUM_RPC_URL=your-production-rpc-url
```

### Performance Optimizations
- **Inline styles** to avoid CSS caching issues
- **Dynamic build IDs** for cache busting
- **API response caching** with proper headers
- **Image optimization** with Next.js built-in features

## 📊 Monitoring & Analytics

### Key Metrics
- **Wallet Connections** - Track user adoption
- **API Response Times** - Monitor performance
- **Error Rates** - Identify issues quickly
- **User Engagement** - Dashboard usage patterns

### Health Checks
- `/api/monitoring/health` - API health status
- **Database connectivity** checks
- **External API availability** monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use inline styles for new components
- Add proper error handling
- Include JSDoc comments for complex functions
- Test on multiple screen sizes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.liquidflow.com](https://docs.liquidflow.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/liquidityflow/issues)
- **Email**: support@liquidflow.com
- **Discord**: [LiquidFlow Community](https://discord.gg/liquidflow)

## 🗺️ Roadmap

### Q1 2025
- [ ] Advanced alert system with webhooks
- [ ] Multi-chain support (Polygon, BSC, Arbitrum)
- [ ] Professional charting and analytics
- [ ] API rate limiting and authentication

### Q2 2025
- [ ] Automated liquidity management
- [ ] Integration with major DEX aggregators
- [ ] Mobile app development
- [ ] Enterprise dashboard features

---

**Built with ❤️ by the LiquidFlow team**

*Professional liquidity management for serious DeFi projects.* 