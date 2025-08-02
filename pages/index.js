export default function Home() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        padding: '1rem 0',
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: '#1f2937'
          }}>
            LiquidFlow
          </div>
          
          <a href="/admin/portfolios" style={{
            background: '#3b82f6',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            🚀 Launch App
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        paddingTop: '6rem',
        paddingBottom: '4rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '900',
            marginBottom: '1.5rem',
            color: '#1f2937',
            lineHeight: '1.1'
          }}>
            Professional DeFi Portfolio Management
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: '#6b7280',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Advanced liquidity monitoring, cross-chain analytics, and institutional-grade portfolio management for DeFi professionals.
          </p>
          
          <div style={{ marginBottom: '3rem' }}>
            <a href="/admin/portfolios" style={{
              background: '#3b82f6',
              color: '#ffffff',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              Launch Portfolio Manager
            </a>
          </div>
          
          {/* Trust Indicators */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '2rem',
            maxWidth: '600px', 
            margin: '0 auto' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: '800', 
                color: '#3b82f6',
                marginBottom: '0.5rem'
              }}>$50M+</div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#6b7280'
              }}>Assets Under Management</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: '800', 
                color: '#10b981',
                marginBottom: '0.5rem'
              }}>500+</div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#6b7280'
              }}>Active Portfolios</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: '800', 
                color: '#8b5cf6',
                marginBottom: '0.5rem'
              }}>15+</div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#6b7280'
              }}>Supported Chains</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>
              Professional DeFi Tools
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Everything you need to manage, monitor, and optimize your DeFi portfolio with institutional precision.
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            {/* Feature 1 */}
            <div style={{ 
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                Multi-Chain Analytics
              </h3>
              <p style={{ color: '#6b7280' }}>
                Track positions across Ethereum, Arbitrum, Base, Optimism, and Solana with real-time data.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ 
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                Direct Trading Links
              </h3>
              <p style={{ color: '#6b7280' }}>
                Seamlessly execute trades on Uniswap, Raydium, Orca, and other DEXs directly from your portfolio.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ 
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                Portfolio Management
              </h3>
              <p style={{ color: '#6b7280' }}>
                Professional admin tools for managing multiple client portfolios with P&L tracking and reporting.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
