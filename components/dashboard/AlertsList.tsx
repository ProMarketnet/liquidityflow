import React from 'react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
}

interface AlertsListProps {
  alerts: Alert[];
}

export const AlertsList: React.FC<AlertsListProps> = ({ alerts }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500/30 bg-red-500/10';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'info': return 'border-blue-500/30 bg-blue-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Recent Alerts</h3>
      
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{getAlertIcon(alert.type)}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{alert.title}</h4>
                  <p className="text-gray-300 text-sm mb-2">{alert.description}</p>
                  <span className="text-xs text-gray-400">{alert.time}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">✅</div>
            <p>No recent alerts</p>
          </div>
        )}
      </div>
    </div>
  );
};
