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
  totalBids: number;
  totalSpent: number;
  averageBidAmount: number;
  winRate: number;
  auctionsParticipated: number;
  wonCount: number;
  favoriteCategories: Array<{ category: string; count: number }>;
  biddingTimeline: Array<{ date: string; count: number }>;
  spendingTimeline: Array<{ date: string; amount: number }>;
}

interface BuyerAnalyticsProps {
  analytics: Analytics;
}

const CATEGORY_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export const BuyerAnalytics = ({ analytics }: BuyerAnalyticsProps) => {
  // Format timelines for charts
  const biddingData = analytics.biddingTimeline.map((item) => ({
    date: format(new Date(item.date), 'MMM d'),
    count: item.count,
  }));

  const spendingData = analytics.spendingTimeline.map((item) => ({
    date: format(new Date(item.date), 'MMM d'),
    amount: item.amount,
  }));

  // Category data for pie chart
  const categoryData = analytics.favoriteCategories.map((cat, index) => ({
    name: cat.category,
    value: cat.count,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  // Metrics cards
  const metrics = [
    {
      label: 'Total Spent',
      value: `$${analytics.totalSpent.toFixed(2)}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'var(--success)',
      bgColor: 'var(--success-bg)',
    },
    {
      label: 'Average Bid Amount',
      value: `$${analytics.averageBidAmount.toFixed(2)}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'var(--info)',
      bgColor: 'var(--info-bg)',
    },
    {
      label: 'Win Rate',
      value: `${analytics.winRate}%`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'var(--secondary)',
      bgColor: 'var(--surface)',
    },
    {
      label: 'Total Bids',
      value: analytics.totalBids.toString(),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
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

      {/* Additional Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Auctions Won</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--success)' }}>
            {analytics.wonCount}
          </p>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Auctions Participated</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--info)' }}>
            {analytics.auctionsParticipated}
          </p>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Average Spent per Win</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
            {analytics.wonCount > 0
              ? `$${(analytics.totalSpent / analytics.wonCount).toFixed(2)}`
              : '$0.00'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bidding Timeline */}
        {biddingData.length > 0 ? (
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Bidding Activity (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={biddingData}>
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
                  formatter={(value: number) => [value, 'Bids']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Bids"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Bidding Activity</h3>
            <div className="flex h-[300px] items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
              <p className="text-sm">No bidding activity in the last 30 days</p>
            </div>
          </div>
        )}

        {/* Spending Timeline */}
        {spendingData.length > 0 ? (
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Spending Timeline (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingData}>
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
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                />
                <Legend />
                <Bar dataKey="amount" fill="#10b981" name="Amount Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Spending Timeline</h3>
            <div className="flex h-[300px] items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
              <p className="text-sm">No spending data in the last 30 days</p>
            </div>
          </div>
        )}
      </div>

      {/* Favorite Categories */}
      {categoryData.length > 0 ? (
        <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}>
          <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Favorite Categories</h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
            <div className="flex flex-col justify-center gap-3">
              {categoryData.map((cat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--card)',
                    boxShadow: 'var(--shadow-soft)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>{cat.name}</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: 'var(--muted-foreground)' }}>{cat.value} bids</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}>
          <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Favorite Categories</h3>
          <div className="flex h-[300px] items-center justify-center text-gray-500">
            <p className="text-sm">No category data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

