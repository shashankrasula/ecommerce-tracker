import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    city: user?.city || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setSuccess(false); setError('');
    try {
      const { data } = await api.put('/auth/me', form);
      updateUser(data);
      setSuccess(true);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="My Profile">
      <div className="max-w-xl space-y-6">
        {/* Avatar Card */}
        <div className="card flex items-center gap-5 bg-gradient-to-r from-teal-900/30 to-slate-800 border-teal-700/30">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black text-3xl flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">{user?.name}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge bg-teal-500/20 text-teal-400 border border-teal-500/30">Customer</span>
              {user?.city && <span className="text-slate-500 text-xs">📍 {user.city}</span>}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <h3 className="text-white font-bold mb-4">Edit Profile</h3>

          {success && (
            <div className="bg-green-900/30 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2">
              ✅ Profile updated successfully!
            </div>
          )}
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">City (used for weather)</label>
              <input className="input" placeholder="e.g. Hyderabad, Mumbai, Delhi" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Phone Number</label>
              <input className="input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Default Address</label>
              <textarea
                className="input resize-none h-20"
                placeholder="Your shipping address..."
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="card">
          <h3 className="text-white font-bold mb-3">Account Information</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Email', value: user?.email },
              { label: 'Role', value: 'Customer' },
              { label: 'City', value: user?.city || 'Not set' },
              { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                <span className="text-slate-400">{item.label}</span>
                <span className="text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
