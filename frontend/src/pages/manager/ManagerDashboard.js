import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { StatusBadge } from '../../components/OrderStatusBadge';
import api from '../../utils/api';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#f59e0b','#3b82f6','#8b5cf6','#06b6d4','#f97316','#22c55e','#ef4444'];

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/manager').then(({ data }) => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const pieData = stats?.statusCounts?.map(s => ({ name: s._id.replace(/_/g,' '), value: s.count })) || [];

  if (loading) return <Layout title="Manager Dashboard"><div className="text-slate-400 text-center py-20">Loading...</div></Layout>;

  return (
    <Layout title="Manager Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Assigned to Me', value: stats?.assignedOrders || 0, icon: '📋', color: 'bg-blue-500/20' },
            { label: 'Pending', value: stats?.pendingOrders || 0, icon: '⏳', color: 'bg-yellow-500/20' },
            { label: 'Shipped', value: stats?.shippedOrders || 0, icon: '🚚', color: 'bg-cyan-500/20' },
            { label: 'Delivered Today', value: stats?.deliveredToday || 0, icon: '✅', color: 'bg-green-500/20' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-2xl flex-shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-slate-400 text-xs">{s.label}</p>
                <p className="text-white font-black text-2xl">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Orders Table */}
          <div className="xl:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Recent Orders</h3>
              <a href="/manager/orders" className="text-purple-400 text-sm hover:text-purple-300">Manage all →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left pb-3 font-semibold">Order</th>
                    <th className="text-left pb-3 font-semibold">Customer</th>
                    <th className="text-left pb-3 font-semibold">Amount</th>
                    <th className="text-left pb-3 font-semibold">Status</th>
                    <th className="text-left pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentOrders?.slice(0, 8).map(order => (
                    <tr key={order._id} className="table-row">
                      <td className="py-3 text-blue-400 font-mono text-xs">{order.orderId?.slice(0,16)}...</td>
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

          {/* Pie Chart */}
          <div className="card">
            <h3 className="text-white font-bold mb-4">Status Overview</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
                <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 10 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;
