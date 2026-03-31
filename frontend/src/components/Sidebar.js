import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '▣', end: true },
  { to: '/admin/orders', label: 'All Orders', icon: '📦' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/products', label: 'Products', icon: '🛍️' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📊' },
];

const managerLinks = [
  { to: '/manager', label: 'Dashboard', icon: '▣', end: true },
  { to: '/manager/orders', label: 'Manage Orders', icon: '📦' },
  { to: '/manager/profile', label: 'Profile', icon: '👤' },
];

const userLinks = [
  { to: '/user', label: 'Dashboard', icon: '▣', end: true },
  { to: '/user/shop', label: 'Shop', icon: '🛒' },
  { to: '/user/orders', label: 'My Orders', icon: '📋' },
  { to: '/user/track', label: 'Track Order', icon: '🔍' },
  { to: '/user/profile', label: 'Profile', icon: '👤' },
];

const LINKS = { admin: adminLinks, manager: managerLinks, user: userLinks };

const ROLE_COLORS = {
  admin: 'from-blue-600 to-blue-800',
  manager: 'from-purple-600 to-purple-800',
  user: 'from-teal-600 to-teal-800',
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = LINKS[user?.role] || userLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-700/60 flex flex-col">
      <div className="px-6 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">T</div>
          <span className="font-black text-xl text-white tracking-tight">TrackR</span>
        </div>
        <p className="text-slate-500 text-xs mt-1">Order Tracking System</p>
      </div>

      <div className={`mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r ${ROLE_COLORS[user?.role] || 'from-blue-600 to-blue-800'} shadow-lg`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-white/70 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Navigation</p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="text-base">{link.icon}</span>
            <span className="text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-150 font-medium text-sm"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
