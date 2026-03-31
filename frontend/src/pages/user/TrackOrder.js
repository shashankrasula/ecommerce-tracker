import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { StatusBadge, TrackingTimeline, ProgressStepper } from '../../components/OrderStatusBadge';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true); setError(''); setOrder(null);
    try {
      const { data } = await api.get(`/orders/track/${orderId.trim()}`);
      setOrder(data);
    } catch (err) {
      setError('Order not found. Please check the order ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Track Order">
      <div className="max-w-2xl space-y-6">
        {/* Search */}
        <div className="card">
          <h2 className="text-white font-bold text-lg mb-1">Track Your Package</h2>
          <p className="text-slate-400 text-sm mb-5">Enter your order ID to get real-time tracking updates</p>
          <form onSubmit={handleTrack} className="flex gap-3">
            <input
              className="input flex-1"
              placeholder="e.g. ORD-1234567890-ABCDE"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
              {loading ? 'Searching...' : '🔍 Track'}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-900/30 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Result */}
        {order && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="card bg-gradient-to-r from-teal-900/30 to-slate-800 border-teal-700/30">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-teal-300 text-xs font-semibold uppercase tracking-wider mb-1">Order Found</p>
                  <h3 className="text-white font-black text-lg">{order.orderId}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <ProgressStepper currentStatus={order.status} />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card">
                <p className="text-slate-400 text-xs mb-1">Order Total</p>
                <p className="text-green-400 font-bold text-xl">{formatCurrency(order.totalAmount)}</p>
                <p className="text-slate-500 text-xs capitalize mt-0.5">{order.paymentMethod} · {order.paymentStatus}</p>
              </div>
              <div className="card">
                <p className="text-slate-400 text-xs mb-1">Carrier</p>
                <p className="text-white font-bold">{order.carrier || 'Not assigned'}</p>
                {order.trackingNumber && <p className="text-teal-400 font-mono text-xs mt-0.5">{order.trackingNumber}</p>}
              </div>
              {order.estimatedDelivery && (
                <div className="card col-span-2">
                  <p className="text-slate-400 text-xs mb-1">Estimated Delivery</p>
                  <p className="text-white font-bold text-lg">📅 {formatDate(order.estimatedDelivery)}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="card">
              <h3 className="text-white font-semibold text-sm mb-3">Items in This Order</h3>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-700/50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{item.name}</p>
                      <p className="text-slate-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-green-400 font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="card">
                <h3 className="text-white font-semibold text-sm mb-2">📍 Delivering To</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {order.shippingAddress.name}<br />
                  {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                  {order.shippingAddress.state} - {order.shippingAddress.zip}, {order.shippingAddress.country}
                </p>
              </div>
            )}

            {/* Tracking History */}
            <div className="card">
              <h3 className="text-white font-semibold text-sm mb-4">Tracking History</h3>
              <TrackingTimeline history={order.trackingHistory} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!order && !loading && !error && (
          <div className="card text-center py-12 border-dashed">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-white font-bold">Enter an Order ID above</p>
            <p className="text-slate-400 text-sm mt-1">Get real-time shipping and delivery updates</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrackOrder;
