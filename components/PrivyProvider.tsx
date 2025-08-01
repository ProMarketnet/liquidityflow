// Privy authentication provider for LiquidFlow
import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { PRIVY_APP_ID } from '../lib/privy-config';

interface PrivyProviderProps {
  children: React.ReactNode;
}

export default function PrivyProvider({ children }: PrivyProviderProps) {
  return (
    <BasePrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        // Supported login methods
        loginMethods: ['wallet', 'email'],
        
        // Appearance customization
        appearance: {
          theme: 'light',
          accentColor: '#16a34a', // LiquidFlow green
          logo: '/logo.svg',
          showWalletLoginFirst: true,
          walletChainType: 'ethereum-and-solana'
        },
        
        // Embedded wallets
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: true
        },
        
        // External wallet support - simplified configuration
        // MetaMask, Coinbase Wallet, WalletConnect, etc. are enabled by default
        
        // Legal pages
        legal: {
          termsAndConditionsUrl: '/terms',
          privacyPolicyUrl: '/privacy'
        }
      }}
    >
      {children}
    </BasePrivyProvider>
  );
} 