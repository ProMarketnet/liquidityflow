import { useState, useEffect } from 'react';

export default function Demo() {
  const [stats, setStats] = useState({
    totalLiquidity: 127450,
    maxSlippage: 8.7,
    activeLPs: 47,
    volume24h: 18340
  });
  
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalLiquidity: Math.round(prev.totalLiquidity + (Math.random() * 2000 - 1000)),
        maxSlippage: Math.max(0.1, Math.round((prev.maxSlippage + (Math.random() * 0.6 - 0.3)) * 10) / 10)
      }));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e1b4b, #581c87)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: 'white'
    }}>
      {/* Navigation */}
      <nav style={{
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '1rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <a href="/" style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textDecoration: 'none'
          }}>
            LiquidFlow
          </a>
          <a href="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>← Back to Home</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Demo Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
          padding: '1rem 2rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ fontWeight: 'bold' }}>
            🎯 This is a DEMO dashboard - See how LiquidFlow monitors your project
          </div>
          <button 
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={() => alert('Ready to start? Contact hello@liquidflow.com')}
          >
            Start Free Trial
          </button>
        </div>

        {/* Project Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>DEMO Token (DEMO)</h1>
            <span style={{
              padding: '0.5rem 1rem',
              background: 'rgba(251, 146, 60, 0.2)',
              color: '#fb923c',
              borderRadius: '2rem',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              border: '1px solid rgba(251, 146, 60, 0.3)'
            }}>
              ⚠️ Warning
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.1)',
                color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
              onClick={() => setIsLive(!isLive)}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isLive ? '#22c55e' : '#6b7280'
              }}></span>
              {isLive ? 'Live Updates' : 'Paused'}
            </button>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={() => alert('🚨 Emergency Action Triggered!\n\nThis would:\n• Inject $50K emergency liquidity\n• Boost LP rewards by 200%\n• Send alerts to your team\n• Prevent liquidity death spiral')}
            >
              🚨 Emergency Action
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[
            {
              title: 'Total Liquidity Depth',
              value: `$${stats.totalLiquidity.toLocaleString()}`,
              change: '↓ 23% from last week',
              changeColor: '#ef4444',
              icon: '💧',
              color: '#fb923c'
            },
            {
              title: 'Max Slippage (1% trade)',
              value: `${stats.maxSlippage}%`,
              change: '↑ 4.2% from yesterday',
              changeColor: '#ef4444',
              icon: '📉',
              color: '#ef4444'
            },
            {
              title: 'Active LP Positions',
              value: stats.activeLPs.toString(),
              change: '↑ 3 new this week',
              changeColor: '#22c55e',
              icon: '👥',
              color: '#22c55e'
            },
            {
              title: '24h Trading Volume',
              value: `$${stats.volume24h.toLocaleString()}`,
              change: '↓ 12% from yesterday',
              changeColor: '#6b7280',
              icon: '📊',
              color: '#3b82f6'
            }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
              padding: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: stat.color
              }}></div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '1rem'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>
                  {stat.title}
                </span>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: `${stat.color}20`,
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  {stat.icon}
                </div>
              </div>
              
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: stat.changeColor }}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            padding: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>
                Liquidity Depth Over Time
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.8rem'
                }}>7D</button>
                <button style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '0.25rem',
                  fontSize: '0.8rem'
                }}>30D</button>
              </div>
            </div>
            
            <div style={{
              height: '300px',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                bottom: '20%',
                left: '10%',
                right: '10%',
                height: '2px',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                borderRadius: '1px'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '18%',
                left: '25%',
                width: '8px',
                height: '8px',
                background: '#3b82f6',
                borderRadius: '50%'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '22%',
                right: '30%',
                width: '8px',
                height: '8px',
                background: '#8b5cf6',
                borderRadius: '50%'
              }}></div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#3b82f6', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Liquidity declining - intervention recommended
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Emergency protocols ready to deploy
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            padding: '2rem'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Pool Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { dex: '🦄 Uniswap V3', percent: '67%' },
                { dex: '🍣 SushiSwap', percent: '23%' },
                { dex: '🥞 PancakeSwap', percent: '10%' }
              ].map((pool, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '0.5rem'
                }}>
                  <span style={{ color: '#cbd5e1' }}>{pool.dex}</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{pool.percent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pool Health Overview */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Pool Health Overview
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {[
              {
                dex: '🦄',
                name: 'Uniswap V3',
                pair: 'DEMO/USDC • 0.3% Fee',
                liquidity: '$47,230',
                change: '↓ 15% (24h)',
                changeColor: '#ef4444',
                health: 'CRITICAL',
                healthColor: '#ef4444',
                slippage: '12.4% slippage',
                bgColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)'
              },
              {
                dex: '🍣',
                name: 'SushiSwap',
                pair: 'DEMO/ETH • 0.25% Fee',
                liquidity: '$32,180',
                change: '↓ 8% (24h)',
                changeColor: '#fb923c',
                health: 'WARNING',
                healthColor: '#fb923c',
                slippage: '7.8% slippage',
                bgColor: 'rgba(251, 146, 60, 0.1)',
                borderColor: 'rgba(251, 146, 60, 0.3)'
              },
              {
                dex: '🥞',
                name: 'PancakeSwap',
                pair: 'DEMO/BUSD • 0.25% Fee',
                liquidity: '$28,940',
                change: '↑ 5% (24h)',
                changeColor: '#22c55e',
                health: 'HEALTHY',
                healthColor: '#22c55e',
                slippage: '4.2% slippage',
                bgColor: 'rgba(34, 197, 94, 0.1)',
                borderColor: 'rgba(34, 197, 94, 0.3)'
              }
            ].map((pool, i) => (
              <div key={i} style={{
                background: pool.bgColor,
                border: `1px solid ${pool.borderColor}`,
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <span style={{ fontSize: '2rem' }}>{pool.dex}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>
                      {pool.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                      {pool.pair}
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                    {pool.liquidity}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: pool.changeColor }}>
                    {pool.change}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1rem'
                }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: `${pool.healthColor}20`,
                    color: pool.healthColor,
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {pool.health}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    {pool.slippage}
                  </span>
                </div>
                
                {pool.health === 'CRITICAL' && (
                  <button style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onClick={() => alert(`🚨 Emergency Action for ${pool.name}!\n\nWould trigger:\n• $25K emergency liquidity injection\n• 300% LP reward boost\n• Immediate team alerts`)}>
                    🚨 Emergency Intervention
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          padding: '2rem'
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Recent Alerts
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                type: 'critical',
                icon: '🚨',
                title: 'Critical: Liquidity dropped below emergency threshold',
                description: 'Total liquidity depth fell to $127K, triggering emergency protocols',
                time: '2 hours ago',
                bgColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)'
              },
              {
                type: 'warning',
                icon: '⚠️',
                title: 'Large LP withdrawal detected',
                description: 'Whale LP removed $45K in liquidity from Uniswap V3 pool',
                time: '4 hours ago',
                bgColor: 'rgba(251, 146, 60, 0.1)',
                borderColor: 'rgba(251, 146, 60, 0.3)'
              },
              {
                type: 'info',
                icon: 'ℹ️',
                title: 'LP incentive program adjusted',
                description: 'Increased rewards by 15% to attract new liquidity providers',
                time: '6 hours ago',
                bgColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 0.3)'
              },
              {
                type: 'warning',
                icon: '⚠️',
                title: 'Slippage threshold exceeded',
                description: '1% trades now experiencing 8.7% slippage - above 5% threshold',
                time: '8 hours ago',
                bgColor: 'rgba(251, 146, 60, 0.1)',
                borderColor: 'rgba(251, 146, 60, 0.3)'
              }
            ].map((alert, i) => (
              <div key={i} style={{
                background: alert.bgColor,
                border: `1px solid ${alert.borderColor}`,
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{alert.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '0.5rem',
                      fontSize: '1.1rem'
                    }}>
                      {alert.title}
                    </h4>
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '0.9rem',
                      marginBottom: '0.75rem',
                      lineHeight: 1.5
                    }}>
                      {alert.description}
                    </p>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {alert.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div style={{
          marginTop: '3rem',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          borderRadius: '1rem',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem'
          }}>
            Ready to Protect Your Liquidity?
          </h3>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2rem',
            fontSize: '1.1rem',
            lineHeight: 1.6
          }}>
            Stop watching your project die from bad liquidity. Get professional monitoring 
            and emergency intervention that actually works.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              style={{
                background: 'white',
                color: '#3b82f6',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
              onClick={() => alert('Contact us to get started:\n\n📧 hello@liquidflow.com\n📱 Schedule a demo call\n💬 Join our Discord\n\n✅ Free 7-day trial\n✅ No setup fees\n✅ Cancel anytime')}
            >
              Start Free Trial
            </button>
            <button 
              style={{
                background: 'transparent',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                border: '2px solid rgba(255,255,255,0.3)',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
              onClick={() => alert('Schedule a personalized demo:\n\n• See your actual token data\n• Custom liquidity analysis\n• Emergency intervention demo\n• Pricing discussion\n\nContact: hello@liquidflow.com')}
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
