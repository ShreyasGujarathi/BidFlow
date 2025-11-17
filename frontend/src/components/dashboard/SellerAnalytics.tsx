'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface Analytics {
  totalRevenue: number;
  averageSalePrice: number;
  totalAuctions: number;
  completedAuctions: number;
  cancelledAuctions: number;
  successRate: number;
  statusBreakdown: {
    pending: number;
    live: number;
    completed: number;
    cancelled: number;
  };
  revenueTimeline: Array<{ date: string; revenue: number }>;
}

interface SellerAnalyticsProps {
  analytics: Analytics;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const SellerAnalytics = ({ analytics }: SellerAnalyticsProps) => {
  // Format revenue timeline for chart
  const revenueData = analytics.revenueTimeline.map((item) => ({
    date: format(new Date(item.date), 'MMM d'),
    revenue: item.revenue,
  }));

  // Status breakdown data
  const statusData = [
    { name: 'Pending', value: analytics.statusBreakdown.pending, color: '#f59e0b' },
    { name: 'Live', value: analytics.statusBreakdown.live, color: '#10b981' },
    { name: 'Completed', value: analytics.statusBreakdown.completed, color: '#3b82f6' },
    { name: 'Cancelled', value: analytics.statusBreakdown.cancelled, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  // Metrics cards
  const metrics = [
    {
      label: 'Total Revenue',
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'var(--success)',
      bgColor: 'var(--success-bg)',
    },
    {
      label: 'Average Sale Price',
      value: `$${analytics.averageSalePrice.toFixed(2)}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'var(--info)',
      bgColor: 'var(--info-bg)',
    },
    {
      label: 'Success Rate',
      value: `${analytics.successRate}%`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'var(--secondary)',
      bgColor: 'var(--surface)',
    },
    {
      label: 'Total Auctions',
      value: analytics.totalAuctions.toString(),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'var(--warning)',
      bgColor: 'var(--warning-bg)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="rounded-2xl border p-6"
            style={{ borderColor: 'var(--border)', backgroundColor: metric.bgColor, boxShadow: 'var(--shadow-soft)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>{metric.label}</p>
                <p className="mt-2 text-2xl font-bold" style={{ color: metric.color }}>
                  {metric.value}
                </p>
              </div>
              <div style={{ color: metric.color }}>
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Timeline */}
        {revenueData.length > 0 ? (
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Revenue Timeline (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Revenue"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Revenue Timeline</h3>
            <div className="flex h-[300px] items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
              <p className="text-sm">No revenue data available for the last 30 days</p>
            </div>
          </div>
        )}

        {/* Status Breakdown */}
        {statusData.length > 0 ? (
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Auction Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Auction Status Breakdown</h3>
            <div className="flex h-[300px] items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
              <p className="text-sm">No auction data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Completed</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--success)' }}>
            {analytics.completedAuctions}
          </p>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Cancelled</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--error)' }}>
            {analytics.cancelledAuctions}
          </p>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Live</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--info)' }}>
            {analytics.statusBreakdown.live}
          </p>
        </div>
      </div>
    </div>
  );
};

