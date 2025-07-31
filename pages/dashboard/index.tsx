import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { LiquidityChart } from '@/components/dashboard/LiquidityChart';
import { AlertsList } from '@/components/dashboard/AlertsList';
import axios from 'axios';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const [statsRes, alertsRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/alerts')
      ]);

      setStats(statsRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard" showSidebar={true}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" showSidebar={true}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <button 
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all"
            onClick={fetchDashboardData}
          >
            Refresh Data
          </button>
        </div>

        {stats && <StatsGrid stats={stats} />}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiquidityChart />
          <AlertsList alerts={alerts} />
        </div>
      </div>
    </Layout>
  );
}
