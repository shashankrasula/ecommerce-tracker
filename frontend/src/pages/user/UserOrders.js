import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { StatusBadge, PaymentBadge, TrackingTimeline, ProgressStepper } from '../../components/OrderStatusBadge';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/orders/my-orders').then(({ data }) => { setOrders(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = filter ? orders.filter(o => o.status === filter) : orders;

  const STATUS_FILTERS = ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled'];

  return (
    <Layout title="My Orders">
      <div className="space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${!filter ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            All ({orders.length})
          </button>
          {STATUS_FILTERS.map(s => {
            const count = orders.filter(o => o.status === s).length;
            if (!count) return null;
            return (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all capitalize ${filter === s ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {s.replace(/_/g,' ')} ({count})
              </button>
            );
          })}
        </div>

        {loading && <div className="text-center text-slate-500 py-10">Loading your orders...</div>}

        {!loading && !filtered.length && (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-white font-bold">No orders found</p>
            <p className="text-slate-400 text-sm mt-1">You haven't placed any orders yet</p>
          </div>
        )}

        {/* Order Cards */}
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order._id} className="card hover:border-teal-500/40 transition-colors cursor-pointer" onClick={() => setSelected(order)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold text-sm">{order.orderId}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentBadge status={order.paymentStatus} />
                  <StatusBadge status={order.status} />
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                {order.items?.slice(0,3).map((item, i) => (
                  <div key={i} className="bg-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                    {item.name} × {item.quantity}
                  </div>
                ))}
                {order.items?.length > 3 && <span className="text-slate-500 text-xs">+{order.items.length - 3} more</span>}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <div>
                  {order.carrier && <p className="text-slate-400 text-xs">🚚 {order.carrier} · {order.trackingNumber}</p>}
                  {order.estimatedDelivery && <p className="text-slate-400 text-xs">Est: {formatDate(order.estimatedDelivery)}</p>}
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">{order.items?.length} item(s)</p>
                  <p className="text-green-400 font-bold">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 flex justify-between items-start">
              <div>
                <h2 className="text-white font-bold">Order Details</h2>
                <p className="text-teal-400 font-mono text-xs mt-0.5">{selected.orderId}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Progress */}
              <ProgressStepper currentStatus={selected.status} />

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Total Amount</p>
                  <p className="text-green-400 font-bold text-lg">{formatCurrency(selected.totalAmount)}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Payment</p>
                  <p className="text-white font-semibold capitalize">{selected.paymentMethod}</p>
                  <PaymentBadge status={selected.paymentStatus} />
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-2">Items Ordered</h3>
                <div className="space-y-2">
                  {selected.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-800 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        <p className="text-slate-400 text-xs">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                      <span className="text-green-400 font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping */}
              {selected.shippingAddress && (
                <div>
                  <h3 className="text-white font-semibold text-sm mb-2">Shipping Address</h3>
                  <div className="bg-slate-800 rounded-xl px-4 py-3 text-slate-300 text-sm leading-relaxed">
                    {selected.shippingAddress.name}<br />
                    {selected.shippingAddress.street}, {selected.shippingAddress.city}<br />
                    {selected.shippingAddress.state} - {selected.shippingAddress.zip}
                  </div>
                </div>
              )}

              {/* Tracking */}
              {selected.carrier && (
                <div className="bg-slate-800 rounded-xl px-4 py-3">
                  <p className="text-slate-400 text-xs mb-1">Carrier / Tracking No.</p>
                  <p className="text-white font-medium">{selected.carrier}</p>
                  <p className="text-teal-400 font-mono text-sm">{selected.trackingNumber}</p>
                </div>
              )}

              {/* History */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-3">Tracking History</h3>
                <TrackingTimeline history={selected.trackingHistory} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserOrders;
