import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// 🔥 ALWAYS hit backend on http://localhost:5000
axios.defaults.baseURL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('trackr_user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      axios.defaults.headers.common['Authorization'] = `Bearer ${u.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    const { data } = await axios.post('/api/auth/login', { email: identifier, password });
    setUser(data);
    localStorage.setItem('trackr_user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const register = async (formData) => {
    const { data } = await axios.post('/api/auth/register', formData);
    setUser(data);
    localStorage.setItem('trackr_user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('trackr_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    setUser(merged);
    localStorage.setItem('trackr_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};