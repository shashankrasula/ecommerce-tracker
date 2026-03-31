import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#f59e0b','#3b82f6','#8b5cf6','#06b6d4','#f97316','#22c55e','#ef4444'];

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin').then(({ data }) => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return <Layout title="Analytics"><div className="text-slate-400 text-center py-20">Loading analytics...</div></Layout>;

  const barData = stats?.monthlyRevenue?.map(m => ({
    name: MONTHS[m._id.month - 1],
    Revenue: m.revenue,
    Orders: m.orders
  })) || [];

  const pieData = stats?.statusCounts?.map(s => ({
    name: s._id.replace(/_/g,' '),
    value: s.count
  })) || [];

  return (
    <Layout title="Analytics">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: '💰', color: 'bg-green-500/20' },
            { label: 'Total Orders', value: stats?.totalOrders, icon: '📦', color: 'bg-blue-500/20' },
            { label: 'Total Users', value: stats?.totalUsers, icon: '👥', color: 'bg-purple-500/20' },
            { label: 'Managers', value: stats?.totalManagers, icon: '🧑‍💼', color: 'bg-orange-500/20' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-2xl flex-shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-slate-400 text-xs">{s.label}</p>
                <p className="text-white font-black text-xl">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Bar Chart */}
        <div className="card">
          <h3 className="text-white font-bold mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
              <Bar dataKey="Revenue" fill="#3b82f6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="card">
            <h3 className="text-white font-bold mb-4">Orders Per Month</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
                <Line type="monotone" dataKey="Orders" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card">
            <h3 className="text-white font-bold mb-4">Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
                <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminAnalytics;
