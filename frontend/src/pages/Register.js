import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', city: 'Hyderabad', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await register(form);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'manager') navigate('/manager');
      else navigate('/user');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-3">T</div>
          <h1 className="text-3xl font-black text-white">TrackR</h1>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-1">Create account</h2>
          <p className="text-slate-400 text-sm mb-6">Join TrackR today</p>

          {error && <div className="bg-red-900/30 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Full Name</label>
              <input type="text" className="input" placeholder="Rahul Kumar"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Phone Number</label>
              <input type="tel" className="input" placeholder="+91 9876543210"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">City</label>
                <input type="text" className="input" placeholder="Hyderabad"
                  value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Role</label>
                <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
