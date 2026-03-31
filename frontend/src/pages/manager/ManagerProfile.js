import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const ManagerProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', city: user?.city || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setSuccess(false);
    try {
      const { data } = await api.put('/auth/me', form);
      updateUser(data);
      setSuccess(true);
    } finally { setSaving(false); }
  };

  return (
    <Layout title="My Profile">
      <div className="max-w-xl space-y-6">
        <div className="card flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black text-2xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">{user?.name}</h2>
            <p className="text-slate-400">{user?.email}</p>
            <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30 mt-1">Manager</span>
          </div>
        </div>

        <div className="card">
          <h3 className="text-white font-bold mb-4">Update Profile</h3>
          {success && <div className="bg-green-900/30 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm mb-4">Profile updated!</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm block mb-1">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-slate-300 text-sm block mb-1">City (for weather)</label>
              <input className="input" placeholder="e.g. Mumbai" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="text-slate-300 text-sm block mb-1">Phone</label>
              <input className="input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerProfile;
