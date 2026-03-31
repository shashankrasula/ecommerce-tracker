export const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  processing: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  shipped: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  out_for_delivery: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  delivered: 'bg-green-500/20 text-green-400 border border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
  returned: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

export const PAYMENT_COLORS = {
  paid: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  failed: 'bg-red-500/20 text-red-400',
  refunded: 'bg-slate-500/20 text-slate-400',
};

export const PRIORITY_COLORS = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-red-500/20 text-red-400',
};

export const STATUS_STEPS = ['pending','confirmed','processing','shipped','out_for_delivery','delivered'];

export const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const capitalize = (s) =>
  s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';
