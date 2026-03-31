import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminAnalytics from './pages/admin/AdminAnalytics';

import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerOrders from './pages/manager/ManagerOrders';
import ManagerProfile from './pages/manager/ManagerProfile';

import UserDashboard from './pages/user/UserDashboard';
import Shop from './pages/user/Shop';
import UserOrders from './pages/user/UserOrders';
import TrackOrder from './pages/user/TrackOrder';
import UserProfile from './pages/user/UserProfile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-slate-400 animate-pulse">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'manager') return <Navigate to="/manager" replace />;
    return <Navigate to="/user" replace />;
  }
  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-slate-400 animate-pulse">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'manager') return <Navigate to="/manager" replace />;
  return <Navigate to="/user" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />

      <Route path="/manager" element={<ProtectedRoute allowedRoles={['admin','manager']}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/manager/orders" element={<ProtectedRoute allowedRoles={['admin','manager']}><ManagerOrders /></ProtectedRoute>} />
      <Route path="/manager/profile" element={<ProtectedRoute allowedRoles={['admin','manager']}><ManagerProfile /></ProtectedRoute>} />

      <Route path="/user" element={<ProtectedRoute allowedRoles={['user','admin','manager']}><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/shop" element={<ProtectedRoute allowedRoles={['user','admin','manager']}><Shop /></ProtectedRoute>} />
      <Route path="/user/orders" element={<ProtectedRoute allowedRoles={['user','admin','manager']}><UserOrders /></ProtectedRoute>} />
      <Route path="/user/track" element={<ProtectedRoute allowedRoles={['user','admin','manager']}><TrackOrder /></ProtectedRoute>} />
      <Route path="/user/profile" element={<ProtectedRoute allowedRoles={['user','admin','manager']}><UserProfile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
