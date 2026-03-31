import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { StatusBadge, ProgressStepper } from '../../components/OrderStatusBadge';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    api.get('/orders/my-orders').then(({ data }) => {
      setOrders(data);
      if (data.length) setLatest(data[0]);
      setPageLoading(false);
    }).catch(() => setPageLoading(false));
  }, []);

  const totalSpent = orders.filter(o => o.paymentStatus === 'paid').reduce((a, o) => a + o.totalAmount, 0);
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const active = orders.filter(o => !['delivered','cancelled','returned'].includes(o.status)).length;

  return (
    <Layout title="My Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="card bg-gradient-to-r from-teal-900/50 to-slate-800 border-teal-700/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black text-2xl">
              {user?.name?.[0]}
            </div>
            <div>
              <p className="text-teal-300 text-sm font-medium">Welcome back,</p>
              <h2 className="text-white font-black text-2xl">{user?.name}</h2>
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Orders', value: orders.length, icon: '📦', color: 'bg-blue-500/20' },
            { label: 'Delivered', value: delivered, icon: '✅', color: 'bg-green-500/20' },
            { label: 'Active', value: active, icon: '🚚', color: 'bg-orange-500/20' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center text-xl flex-shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-slate-400 text-xs">{s.label}</p>
                <p className="text-white font-black text-xl">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Latest order tracking */}
        {latest && (
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-bold">Latest Order</h3>
                <p className="text-slate-400 text-xs font-mono mt-0.5">{latest.orderId}</p>
              </div>
              <StatusBadge status={latest.status} />
            </div>
            <ProgressStepper currentStatus={latest.status} />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
              <div>
                <p className="text-slate-400 text-xs">Order Total</p>
                <p className="text-green-400 font-bold text-lg">{formatCurrency(latest.totalAmount)}</p>
              </div>
              {latest.estimatedDelivery && (
                <div className="text-right">
                  <p className="text-slate-400 text-xs">Est. Delivery</p>
                  <p className="text-white font-medium">{formatDate(latest.estimatedDelivery)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Total spent */}
        <div className="card bg-gradient-to-r from-blue-900/30 to-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Spent</p>
              <p className="text-white font-black text-3xl">{formatCurrency(totalSpent)}</p>
              <p className="text-slate-500 text-xs mt-1">Across {orders.filter(o => o.paymentStatus === 'paid').length} paid orders</p>
            </div>
            <div className="text-5xl">💳</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          <a href="/user/shop" className="card hover:border-teal-500/50 transition-colors cursor-pointer text-center py-4">
            <div className="text-2xl mb-2">🛒</div>
            <p className="text-white font-semibold text-sm">Shop</p>
            <p className="text-slate-500 text-xs">Browse products</p>
          </a>
          <a href="/user/orders" className="card hover:border-teal-500/50 transition-colors cursor-pointer text-center py-4">
            <div className="text-2xl mb-2">📋</div>
            <p className="text-white font-semibold text-sm">My Orders</p>
            <p className="text-slate-500 text-xs">View order history</p>
          </a>
          <a href="/user/track" className="card hover:border-teal-500/50 transition-colors cursor-pointer text-center py-4">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-white font-semibold text-sm">Track Order</p>
            <p className="text-slate-500 text-xs">Enter order ID</p>
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
