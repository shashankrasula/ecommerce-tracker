import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { StatusBadge } from '../../components/OrderStatusBadge';
import api from '../../utils/api';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#f59e0b','#3b82f6','#8b5cf6','#06b6d4','#f97316','#22c55e','#ef4444','#94a3b8'];

const StatCard = ({ label, value, icon, sub, color }) => (
  <div className="stat-card">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-slate-400 text-xs font-medium">{label}</p>
      <p className="text-white font-black text-2xl leading-none mt-0.5">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin').then(({ data }) => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Admin Dashboard">
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    </Layout>
  );

  const pieData = stats?.statusCounts?.map(s => ({ name: s._id.replace(/_/g,' '), value: s.count })) || [];
  const barData = stats?.monthlyRevenue?.map(m => ({
    name: MONTHS[(m._id.month - 1)],
    revenue: m.revenue,
    orders: m.orders
  })) || [];

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={stats?.totalOrders || 0} icon="📦" color="bg-blue-500/20" />
          <StatCard label="Total Revenue" value={formatCurrency(stats?.totalRevenue || 0)} icon="💰" color="bg-green-500/20" />
          <StatCard label="Total Users" value={stats?.totalUsers || 0} icon="👥" color="bg-purple-500/20" />
          <StatCard label="Managers" value={stats?.totalManagers || 0} icon="🧑‍💼" color="bg-orange-500/20" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="xl:col-span-2 card">
            <h3 className="text-white font-bold mb-4">Monthly Revenue & Orders</h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[6,6,0,0]} name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">No revenue data yet — run the seed script</div>
            )}
          </div>

          {/* Pie Chart */}
          <div className="card">
            <h3 className="text-white font-bold mb-4">Order Status</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
                  <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">No order data</div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Recent Orders</h3>
            <a href="/admin/orders" className="text-blue-400 text-sm hover:text-blue-300">View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left pb-3 font-semibold">Order ID</th>
                  <th className="text-left pb-3 font-semibold">Customer</th>
                  <th className="text-left pb-3 font-semibold">Amount</th>
                  <th className="text-left pb-3 font-semibold">Status</th>
                  <th className="text-left pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map(order => (
                  <tr key={order._id} className="table-row">
                    <td className="py-3 text-blue-400 font-mono text-xs">{order.orderId}</td>
                    <td className="py-3 text-white">{order.user?.name}</td>
                    <td className="py-3 text-green-400 font-semibold">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-3"><StatusBadge status={order.status} /></td>
                    <td className="py-3 text-slate-400">{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
                {!stats?.recentOrders?.length && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-500">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
