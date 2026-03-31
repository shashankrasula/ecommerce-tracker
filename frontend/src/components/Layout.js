import React from 'react';
import Sidebar from './Sidebar';
import WeatherBox from './WeatherBox';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, title }) => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-slate-900 border-b border-slate-700/60 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h1 className="text-white font-bold text-lg leading-none">{title}</h1>
            <p className="text-slate-500 text-xs mt-0.5 capitalize">{user?.role} Panel</p>
          </div>
          <div className="flex items-center gap-3">
            <WeatherBox />
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
