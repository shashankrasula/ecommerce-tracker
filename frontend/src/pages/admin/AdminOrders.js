import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { StatusBadge, PaymentBadge, PriorityBadge, TrackingTimeline, ProgressStepper } from '../../components/OrderStatusBadge';
import api from '../../utils/api';
import { formatCurrency, formatDate, capitalize } from '../../utils/helpers';

const STATUSES = ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', location: '', description: '' });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get('/orders', { params });
      setOrders(data.orders); setTotal(data.total);
    } finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async () => {
    if (!updateForm.status) return;
    setUpdating(true);
    try {
      await api.put(`/orders/${selected._id}/status`, updateForm);
      await fetchOrders();
      setSelected(null);
    } finally { setUpdating(false); }
  };

  return (
    <Layout title="All Orders">
      <div className="space-y-4">
        {/* Filters */}
        <div className="card flex flex-wrap gap-3 items-center">
          <input
            className="input w-56" placeholder="Search by Order ID..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="input w-44" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
          </select>
          <button className="btn-secondary" onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }}>Reset</button>
          <span className="text-slate-400 text-sm ml-auto">{total} orders</span>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                {['Order ID','Customer','Items','Amount','Status','Payment','Priority','Date','Actions'].map(h => (
                  <th key={h} className="text-left pb-3 font-semibold pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-10 text-center text-slate-500">Loading...</td></tr>
              ) : orders.map(order => (
                <tr key={order._id} className="table-row">
                  <td className="py-3 pr-4 text-blue-400 font-mono text-xs whitespace-nowrap">{order.orderId}</td>
                  <td className="py-3 pr-4 text-white whitespace-nowrap">
                    <div>{order.user?.name}</div>
                    <div className="text-slate-500 text-xs">{order.user?.email}</div>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{order.items?.length} item(s)</td>
                  <td className="py-3 pr-4 text-green-400 font-semibold whitespace-nowrap">{formatCurrency(order.totalAmount)}</td>
                  <td className="py-3 pr-4"><StatusBadge status={order.status} /></td>
                  <td className="py-3 pr-4"><PaymentBadge status={order.paymentStatus} /></td>
                  <td className="py-3 pr-4"><PriorityBadge priority={order.priority} /></td>
                  <td className="py-3 pr-4 text-slate-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  <td className="py-3">
                    <button
                      onClick={() => { setSelected(order); setUpdateForm({ status: order.status, location: '', description: '' }); }}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                    >
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && !orders.length && (
                <tr><td colSpan={9} className="py-10 text-center text-slate-500">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Page {page}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
            <button disabled={orders.length < 10} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm disabled:opacity-40">Next →</button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 flex items-start justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">{selected.orderId}</h2>
                <p className="text-slate-400 text-sm">{selected.user?.name} · {selected.user?.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-6">
              <ProgressStepper currentStatus={selected.status} />

              {/* Update Status */}
              <div className="bg-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold text-sm">Update Status</h3>
                <select className="input" value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
                </select>
                <input className="input" placeholder="Location (e.g. Mumbai Hub)" value={updateForm.location} onChange={e => setUpdateForm({ ...updateForm, location: e.target.value })} />
                <input className="input" placeholder="Description" value={updateForm.description} onChange={e => setUpdateForm({ ...updateForm, description: e.target.value })} />
                <button onClick={handleStatusUpdate} disabled={updating} className="btn-primary w-full">
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selected.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-800 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        <p className="text-slate-400 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-green-400 font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping */}
              {selected.shippingAddress && (
                <div>
                  <h3 className="text-white font-semibold text-sm mb-2">Shipping Address</h3>
                  <div className="bg-slate-800 rounded-xl px-4 py-3 text-slate-300 text-sm">
                    {selected.shippingAddress.name}, {selected.shippingAddress.street}, {selected.shippingAddress.city}, {selected.shippingAddress.state} - {selected.shippingAddress.zip}
                  </div>
                </div>
              )}

              {/* Tracking History */}
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

export default AdminOrders;
