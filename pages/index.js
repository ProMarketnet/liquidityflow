export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e1b4b, #581c87)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        zIndex: 1000,
        padding: '1rem 0'
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
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            LiquidFlow
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/demo" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Demo</a>
                        <a
              href="/onboarding-simple"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '8rem',
        paddingBottom: '4rem',
        padding: '8rem 1rem 4rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem',
            lineHeight: 1.1
          }}>
            Stop Watching Your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Liquidity Die
            </span>
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: '#cbd5e1',
            marginBottom: '2rem',
            maxWidth: '800px',
            margin: '0 auto 2rem',
            lineHeight: 1.6
          }}>
            Professional liquidity management that prevents the death spiral. Monitor, maintain, 
            and rescue your token's trading liquidity with institutional-grade DeFi infrastructure.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '4rem',
            flexWrap: 'wrap'
          }}>
            <a
              href="/onboarding-simple"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              Get Started Free
            </a>
            <a
              href="#pricing"
              style={{
                border: '2px solid #3b82f6',
                color: '#3b82f6',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              See Pricing
            </a>
          </div>
          
          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00d4ff' }}>$50M+</div>
              <div style={{ color: '#94a3b8' }}>Liquidity Under Management</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00d4ff' }}>95%</div>
              <div style={{ color: '#94a3b8' }}>Crisis Recovery Rate</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00d4ff' }}>24/7</div>
              <div style={{ color: '#94a3b8' }}>Automated Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '4rem 1rem',
        background: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
              Your Liquidity Lifeline
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1' }}>
              Professional tools that institutional traders use, now available for your project
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '🎯',
                title: '24/7 Health Monitoring',
                desc: 'Real-time tracking across all major DEXs. Get alerts before liquidity crisis hits, not after.'
              },
              {
                icon: '🚨',
                title: 'Emergency Liquidity Injection',
                desc: 'Automated liquidity provision when pools drop below critical levels. Stop the death spiral immediately.'
              },
              {
                icon: '🎮',
                title: 'Smart Incentive Management',
                desc: 'Dynamic LP rewards that scale with market conditions. Keep your best liquidity providers happy.'
              },
              {
                icon: '🚀',
                title: 'Launch Bootstrapping',
                desc: 'Professional token launches with gradual price discovery. No more "launch and pray" strategies.'
              }
            ].map((feature, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                padding: '2rem',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
              Choose Your Protection Level
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1' }}>
              From basic monitoring to full liquidity management
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                name: 'Basic Monitor',
                price: '$500',
                period: '/month',
                features: [
                  'Real-time liquidity monitoring',
                  'Slippage analysis & alerts',
                  'Weekly health reports',
                  'Discord/Telegram integration'
                ],
                button: 'Start Monitoring',
                featured: false
              },
              {
                name: 'Liquidity Guardian',
                price: '$2,000',
                period: '/month',
                features: [
                  'Everything in Basic',
                  'Emergency liquidity injection',
                  'Automated LP incentives',
                  'Advanced analytics dashboard',
                  'Priority support'
                ],
                button: 'Get Guardian',
                featured: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                features: [
                  'Everything in Guardian',
                  'Unlimited emergency liquidity',
                  'Launch bootstrapping',
                  'Dedicated account manager',
                  'Custom integrations'
                ],
                button: 'Contact Sales',
                featured: false
              }
            ].map((plan, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)',
                border: plan.featured ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative',
                transform: plan.featured ? 'scale(1.05)' : 'none'
              }}>
                {plan.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    Most Popular
                  </div>
                )}
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
                  {plan.name}
                </h3>
                <div style={{ marginBottom: '2rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00d4ff' }}>
                    {plan.price}
                  </span>
                  <span style={{ color: '#94a3b8' }}>{plan.period}</span>
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                  {plan.features.map((feature, j) => (
                    <li key={j} style={{
                      color: '#cbd5e1',
                      padding: '0.5rem 0',
                      borderBottom: j < plan.features.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
                
                <button style={{
                  width: '100%',
                  background: plan.featured 
                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                    : i === 2 
                      ? 'transparent' 
                      : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: i === 2 ? '2px solid #3b82f6' : 'none',
                  color: i === 2 ? '#3b82f6' : 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}>
                  {plan.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 1rem',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem'
          }}>
            Don't Let Your Project Die From Bad Liquidity
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#cbd5e1',
            marginBottom: '2rem'
          }}>
            Join the projects that take liquidity seriously. Start monitoring today, upgrade when you need rescue.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href="/onboarding-simple"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Start Free Monitoring
            </a>
            <a
              href="mailto:hello@liquidflow.com"
              style={{
                border: '2px solid #3b82f6',
                color: '#3b82f6',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Talk to Expert
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem 1rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}>
        <p style={{ color: '#94a3b8' }}>
          © 2025 LiquidFlow. Professional liquidity management for serious DeFi projects.
        </p>
      </footer>
    </div>
  );
}
