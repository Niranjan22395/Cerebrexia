import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, CreditCard, Tag, TrendingUp, CheckCircle } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { Card, Loading } from '../../components/common';

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  });

  if (isLoading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Events',
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      title: 'Total Registrations',
      value: stats?.totalRegistrations || 0,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue || 0}`,
      icon: CreditCard,
      color: 'bg-indigo-500',
    },
    {
      title: 'Pending Verifications',
      value: stats?.pendingVerifications || 0,
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
    {
      title: 'Active Promo Codes',
      value: stats?.activePromoCodes || 0,
      icon: Tag,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all">
              <Users className="h-6 w-6 text-indigo-600 mb-2" />
              <p className="font-medium">Manage Users</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all">
              <Calendar className="h-6 w-6 text-indigo-600 mb-2" />
              <p className="font-medium">Manage Events</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all">
              <CreditCard className="h-6 w-6 text-indigo-600 mb-2" />
              <p className="font-medium">View Payments</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all">
              <Tag className="h-6 w-6 text-indigo-600 mb-2" />
              <p className="font-medium">Promo Codes</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

// Made with Bob
