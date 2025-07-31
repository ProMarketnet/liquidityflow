import React from 'react';

interface StatsGridProps {
  stats: {
    totalLiquidity: number;
    maxSlippage: number;
    activeLPs: number;
    volume24h: number;
  };
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Liquidity Depth',
      value: `${stats.totalLiquidity.toLocaleString()}`,
      change: '-23%',
      changeType: 'negative',
      icon: '💧',
      color: 'warning'
    },
    {
      title: 'Max Slippage (1% trade)',
      value: `${stats.maxSlippage.toFixed(1)}%`,
      change: '+4.2%',
      changeType: 'negative',
      icon: '📉',
      color: 'critical'
    },
    {
      title: 'Active LP Positions',
      value: stats.activeLPs.toString(),
      change: '+3',
      changeType: 'positive',
      icon: '👥',
      color: 'success'
    },
    {
      title: '24h Trading Volume',
      value: `${stats.volume24h.toLocaleString()}`,
      change: '-12%',
      changeType: 'neutral',
      icon: '📊',
      color: 'default'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className={`bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden stat-card-${stat.color}`}>
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getColorClasses(stat.color)}`}></div>
          
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-400 text-sm font-medium">{stat.title}</span>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${getIconBgClasses(stat.color)}`}>
              {stat.icon}
            </div>
          </div>
          
          <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
          <div className={`text-sm font-medium ${getChangeClasses(stat.changeType)}`}>
            {stat.change} from last week
          </div>
        </div>
      ))}
    </div>
  );
};

function getColorClasses(color: string): string {
  switch (color) {
    case 'warning': return 'from-yellow-500 to-orange-500';
    case 'critical': return 'from-red-500 to-red-600';
    case 'success': return 'from-green-500 to-green-600';
    default: return 'from-primary-500 to-secondary-500';
  }
}

function getIconBgClasses(color: string): string {
  switch (color) {
    case 'warning': return 'bg-yellow-500/20 text-yellow-400';
    case 'critical': return 'bg-red-500/20 text-red-400';
    case 'success': return 'bg-green-500/20 text-green-400';
    default: return 'bg-primary-500/20 text-primary-400';
  }
}

function getChangeClasses(changeType: string): string {
  switch (changeType) {
    case 'positive': return 'text-green-400';
    case 'negative': return 'text-red-400';
    default: return 'text-gray-400';
  }
}
