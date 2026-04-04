import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, getMonthName } from '../utils/formatCurrency';
import StatCard from '../components/StatCard';
import Navbar from '../components/Navbar';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from 'recharts';
import './Dashboard.css';

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b',
  '#38bdf8', '#ec4899', '#14b8a6', '#f97316', '#a78bfa',
];

export default function Dashboard() {
  const { role } = useAuth();

  const [balance, setBalance] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [balanceRes, categoryRes, trendsRes] = await Promise.all([
        dashboardService.getBalance(),
        dashboardService.getCategoryStats(),
        dashboardService.getMonthlyTrends(12),
      ]);

      setBalance(balanceRes.data);

      // Transform category data for chart
      const catMap = {};
      categoryRes.data.forEach((item) => {
        const name = item._id.category;
        if (!catMap[name]) catMap[name] = { name, income: 0, expense: 0 };
        if (item._id.type === 'income') catMap[name].income = item.total;
        if (item._id.type === 'expense') catMap[name].expense = item.total;
      });
      setCategoryData(Object.values(catMap));

      // Transform trends data for chart
      const trendMap = {};
      trendsRes.data.forEach((item) => {
        const key = `${item._id.year}-${item._id.month}`;
        const label = `${getMonthName(item._id.month)} ${item._id.year}`;
        if (!trendMap[key]) trendMap[key] = { key, label, income: 0, expense: 0 };
        if (item._id.type === 'income') trendMap[key].income = item.total;
        if (item._id.type === 'expense') trendMap[key].expense = item.total;
      });
      setTrendsData(
        Object.values(trendMap).sort((a, b) => a.key.localeCompare(b.key))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="chart-tooltip-value" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Your financial overview at a glance</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="dashboard-error">
            <span>{error}</span>
            <button className="btn btn-sm btn-secondary" onClick={fetchDashboardData}>
              Retry
            </button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="dashboard-stats">
          <StatCard
            label="Total Income"
            value={balance?.income}
            variant="income"
            icon={TrendingUp}
            loading={loading}
          />
          <StatCard
            label="Total Expense"
            value={balance?.expense}
            variant="expense"
            icon={TrendingDown}
            loading={loading}
          />
          <StatCard
            label="Net Balance"
            value={balance?.balance}
            variant="balance"
            icon={Wallet}
            loading={loading}
          />
        </div>

        {/* Charts */}
        <div className="dashboard-charts">
          {/* Monthly Trends */}
          <div className="glass-card dashboard-chart-card">
            <h3 className="dashboard-chart-title">Monthly Trends</h3>
            {loading ? (
              <div className="dashboard-chart-skeleton">
                <div className="skeleton" style={{ height: 280, width: '100%' }} />
              </div>
            ) : trendsData.length === 0 ? (
              <div className="empty-state">
                <BarChart3 size={48} className="empty-state-icon" />
                <p className="empty-state-title">No trend data</p>
                <p className="empty-state-text">Add some records to see monthly trends</p>
              </div>
            ) : (
              <div className="dashboard-chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#incomeGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Expense"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fill="url(#expenseGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="glass-card dashboard-chart-card">
            <h3 className="dashboard-chart-title">Category Breakdown</h3>
            {loading ? (
              <div className="dashboard-chart-skeleton">
                <div className="skeleton" style={{ height: 280, width: '100%' }} />
              </div>
            ) : categoryData.length === 0 ? (
              <div className="empty-state">
                <BarChart3 size={48} className="empty-state-icon" />
                <p className="empty-state-title">No category data</p>
                <p className="empty-state-text">Add some records to see category breakdown</p>
              </div>
            ) : (
              <div className="dashboard-chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                      tickLine={false}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
