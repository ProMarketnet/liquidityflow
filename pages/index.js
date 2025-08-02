export default function Home() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Navigation */}
      <nav className="nav" style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        padding: 'var(--space-4) 0'
      }}>
        <div className="container flex justify-between items-center">
          <div style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: '800',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.025em'
          }}>
            LiquidFlow
          </div>
          
          <div className="flex gap-6 items-center">
            <a href="/auth/admin" className="nav-link" style={{
              color: 'var(--color-error)',
              fontWeight: '600'
            }}>
              🏢 Admin Portal
            </a>
            <a href="/admin/portfolios" className="btn btn-primary">🚀 Launch App</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-lg" style={{ 
        paddingTop: 'calc(var(--space-20) + var(--space-16))',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--color-background) 0%, #f8fafc 100%)'
      }}>
        <div className="container">
          <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: 'var(--font-size-5xl)',
              fontWeight: '900',
              marginBottom: 'var(--space-6)',
              background: 'linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-primary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '1.1'
            }}>
              Professional DeFi Portfolio Management
            </h1>
            
            <p style={{
              fontSize: 'var(--font-size-xl)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-8)',
              lineHeight: '1.6'
            }}>
              Advanced liquidity monitoring, cross-chain analytics, and institutional-grade portfolio management for DeFi professionals.
            </p>
            
            <div className="flex gap-4 justify-center" style={{ marginBottom: 'var(--space-12)' }}>
              <a href="/onboarding-new" className="btn btn-primary btn-lg">
                Get Started Free
              </a>
              <a href="#features" className="btn btn-secondary btn-lg">
                See Features
              </a>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-3" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: 'var(--font-size-3xl)', 
                  fontWeight: '800', 
                  color: 'var(--color-primary)',
                  marginBottom: 'var(--space-2)'
                }}>$50M+</div>
                <div style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-text-tertiary)',
                  fontWeight: '500'
                }}>Assets Under Management</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: 'var(--font-size-3xl)', 
                  fontWeight: '800', 
                  color: 'var(--color-success)',
                  marginBottom: 'var(--space-2)'
                }}>500+</div>
                <div style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-text-tertiary)',
                  fontWeight: '500'
                }}>Active Portfolios</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: 'var(--font-size-3xl)', 
                  fontWeight: '800', 
                  color: 'var(--color-info)',
                  marginBottom: 'var(--space-2)'
                }}>15+</div>
                <div style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-text-tertiary)',
                  fontWeight: '500'
                }}>Supported Chains</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>
              Professional DeFi Tools
            </h2>
            <p style={{ 
              fontSize: 'var(--font-size-lg)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Everything you need to manage, monitor, and optimize your DeFi portfolio with institutional precision.
            </p>
          </div>
          
          <div className="grid grid-cols-3" style={{ gap: 'var(--space-8)' }}>
            {/* Feature 1 */}
            <div className="card animate-slide-in" style={{ 
              padding: 'var(--space-8)',
              textAlign: 'center',
              height: '100%'
            }}>
              <div style={{
                fontSize: 'var(--font-size-4xl)',
                marginBottom: 'var(--space-4)'
              }}>📊</div>
              <h3 style={{ 
                fontSize: 'var(--font-size-xl)',
                marginBottom: 'var(--space-3)'
              }}>
                Multi-Chain Analytics
              </h3>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                Track positions across Ethereum, Arbitrum, Base, Optimism, and Solana with real-time data from leading protocols.
              </p>
              <div className="flex gap-2 justify-center">
                <span className="badge badge-info">Ethereum</span>
                <span className="badge badge-success">Arbitrum</span>
                <span className="badge badge-warning">Solana</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card animate-slide-in" style={{ 
              padding: 'var(--space-8)',
              textAlign: 'center',
              height: '100%',
              animationDelay: '0.1s'
            }}>
              <div style={{
                fontSize: 'var(--font-size-4xl)',
                marginBottom: 'var(--space-4)'
              }}>🔄</div>
              <h3 style={{ 
                fontSize: 'var(--font-size-xl)',
                marginBottom: 'var(--space-3)'
              }}>
                Direct Trading Links
              </h3>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                Seamlessly execute trades on Uniswap, Raydium, Orca, and other DEXs directly from your portfolio interface.
              </p>
              <div className="flex gap-2 justify-center">
                <span className="badge badge-info">Uniswap</span>
                <span className="badge badge-success">Raydium</span>
                <span className="badge badge-warning">Orca</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card animate-slide-in" style={{ 
              padding: 'var(--space-8)',
              textAlign: 'center',
              height: '100%',
              animationDelay: '0.2s'
            }}>
              <div style={{
                fontSize: 'var(--font-size-4xl)',
                marginBottom: 'var(--space-4)'
              }}>🏢</div>
              <h3 style={{ 
                fontSize: 'var(--font-size-xl)',
                marginBottom: 'var(--space-3)'
              }}>
                Portfolio Management
              </h3>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                Professional-grade admin tools for managing multiple client portfolios with P&L tracking and reporting.
              </p>
              <div className="flex gap-2 justify-center">
                <span className="badge badge-success">P&L Tracking</span>
                <span className="badge badge-info">Reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Paths Section */}
      <section className="section" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, var(--color-background) 100%)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>
              Choose Your Access Level
            </h2>
            <p style={{ 
              fontSize: 'var(--font-size-lg)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Whether you're exploring DeFi or managing professional portfolios, we have the right tools for you.
            </p>
          </div>
          
          <div className="grid grid-cols-2" style={{ gap: 'var(--space-8)', maxWidth: '900px', margin: '0 auto' }}>
            {/* Get Started Path */}
            <div className="card-elevated" style={{ 
              padding: 'var(--space-8)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: 'var(--font-size-4xl)',
                marginBottom: 'var(--space-4)'
              }}>👀</div>
              <h3 style={{ 
                fontSize: 'var(--font-size-2xl)',
                marginBottom: 'var(--space-4)',
                color: 'var(--color-primary)'
              }}>
                Launch App
              </h3>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div className="badge badge-info" style={{ marginBottom: 'var(--space-3)' }}>Read-Only Access</div>
                <p style={{ marginBottom: 'var(--space-4)' }}>
                  Connect any wallet address to view comprehensive DeFi positions, liquidity pools, and portfolio analytics across all supported chains.
                </p>
                <ul style={{ 
                  textAlign: 'left', 
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: '1.8'
                }}>
                  <li>• View any wallet's DeFi positions</li>
                  <li>• Multi-chain portfolio analytics</li>
                  <li>• Real-time price & P&L data</li>
                  <li>• Direct links to trade pairs</li>
                </ul>
              </div>
              <a href="/onboarding-new" className="btn btn-primary" style={{ width: '100%' }}>
                Get Started Free
              </a>
            </div>

            {/* Admin Path */}
            <div className="card-elevated" style={{ 
              padding: 'var(--space-8)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: 'var(--font-size-4xl)',
                marginBottom: 'var(--space-4)'
              }}>🏢</div>
              <h3 style={{ 
                fontSize: 'var(--font-size-2xl)',
                marginBottom: 'var(--space-4)',
                color: 'var(--color-error)'
              }}>
                Admin Portal
              </h3>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div className="badge badge-error" style={{ marginBottom: 'var(--space-3)' }}>Full Management Access</div>
                <p style={{ marginBottom: 'var(--space-4)' }}>
                  Professional account management with multi-wallet oversight, client portfolio management, and comprehensive reporting tools.
                </p>
                <ul style={{ 
                  textAlign: 'left', 
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: '1.8'
                }}>
                  <li>• Manage multiple client wallets</li>
                  <li>• Advanced P&L reporting</li>
                  <li>• Portfolio sharing & access control</li>
                  <li>• Professional trading tools</li>
                </ul>
              </div>
              <a href="/auth/admin" className="btn btn-secondary" style={{ width: '100%' }}>
                Admin Access
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Protocols */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>
              Integrated Protocols
            </h2>
            <p style={{ 
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-secondary)'
            }}>
              Connected to the leading DeFi protocols across all major chains
            </p>
          </div>
          
          <div className="grid grid-cols-4" style={{ gap: 'var(--space-6)' }}>
            {[
              { name: 'Uniswap', chain: 'Ethereum', color: 'var(--color-primary)' },
              { name: 'Raydium', chain: 'Solana', color: 'var(--color-success)' },
              { name: 'Aave', chain: 'Multi-chain', color: 'var(--color-info)' },
              { name: 'Compound', chain: 'Ethereum', color: 'var(--color-warning)' },
              { name: 'Orca', chain: 'Solana', color: 'var(--color-success)' },
              { name: 'Curve', chain: 'Multi-chain', color: 'var(--color-primary)' },
              { name: 'SushiSwap', chain: 'Multi-chain', color: 'var(--color-error)' },
              { name: 'Jupiter', chain: 'Solana', color: 'var(--color-info)' }
            ].map((protocol, index) => (
              <div key={protocol.name} className="card" style={{ 
                padding: 'var(--space-4)',
                textAlign: 'center',
                transition: 'transform 0.2s ease-in-out'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: protocol.color,
                  margin: '0 auto var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: '700',
                  color: '#ffffff'
                }}>
                  {protocol.name.charAt(0)}
                </div>
                <h4 style={{ 
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-1)'
                }}>
                  {protocol.name}
                </h4>
                <p style={{ 
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-tertiary)',
                  margin: 0
                }}>
                  {protocol.chain}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--space-12) 0'
      }}>
        <div className="container">
          <div className="flex justify-between items-center">
            <div>
              <div style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: '800',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                LiquidFlow
              </div>
              <p style={{ 
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-tertiary)',
                margin: 0
              }}>
                Professional DeFi portfolio management platform
              </p>
            </div>
            
            <div className="flex gap-8">
              <div>
                <h5 style={{ 
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-3)'
                }}>
                  Platform
                </h5>
                <div className="flex flex-col gap-2">
                  <p><a href="/admin/portfolios" className="btn btn-outline">🚀 Launch App</a></p>
                  <a href="/auth/admin" className="nav-link" style={{ fontSize: 'var(--font-size-sm)' }}>Admin Portal</a>
                </div>
              </div>
              
              <div>
                <h5 style={{ 
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-3)'
                }}>
                  Supported Chains
                </h5>
                <div className="flex flex-col gap-2">
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Ethereum</span>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Arbitrum</span>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Solana</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid var(--color-border)',
            marginTop: 'var(--space-8)',
            paddingTop: 'var(--space-6)',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-tertiary)',
              margin: 0
            }}>
              © 2025 LiquidFlow. Professional DeFi portfolio management platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
