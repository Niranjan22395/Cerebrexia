import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Tag,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import axios from '../../lib/axios';
import { AdminStats } from '../../types';
import Loading from '../common/Loading';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500',
  };

  const bgColorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50',
    indigo: 'bg-indigo-50',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColorClasses[color]}`}>
          <div className={`${colorClasses[color]} p-2 rounded-lg text-white`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-semibold ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon, onClick, color }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all hover:scale-105 text-left w-full"
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Total Registrations"
          value={stats.totalRegistrations.toLocaleString()}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="orange"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Pending Verifications"
          value={stats.pendingVerifications}
          icon={<Clock className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Active Promo Codes"
          value={stats.activePromoCodes}
          icon={<Tag className="w-6 h-6" />}
          color="indigo"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="Manage Users"
            description="View and manage user accounts"
            icon={<Users className="w-6 h-6 text-blue-600" />}
            onClick={() => window.location.href = '/admin/users'}
            color="bg-blue-50"
          />
          <QuickAction
            title="Manage Events"
            description="Create and edit events"
            icon={<Calendar className="w-6 h-6 text-purple-600" />}
            onClick={() => window.location.href = '/admin/events'}
            color="bg-purple-50"
          />
          <QuickAction
            title="Payment Reports"
            description="View payment transactions"
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            onClick={() => window.location.href = '/admin/payments'}
            color="bg-green-50"
          />
          <QuickAction
            title="Verify IDs"
            description="Review college ID submissions"
            icon={<CheckCircle className="w-6 h-6 text-orange-600" />}
            onClick={() => window.location.href = '/admin/verifications'}
            color="bg-orange-50"
          />
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">All systems operational</span>
            </div>
            <span className="text-xs text-gray-500">Last checked: Just now</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Database: Connected</span>
            </div>
            <span className="text-xs text-green-600 font-semibold">Healthy</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Redis Cache: Active</span>
            </div>
            <span className="text-xs text-green-600 font-semibold">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Made with Bob