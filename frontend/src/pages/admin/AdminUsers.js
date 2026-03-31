import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';

const ROLE_COLORS = {
  admin: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  manager: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  user: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    api.get('/users').then(({ data }) => { setUsers(data); setLoading(false); });
  }, []);

  const handleToggleActive = async (user) => {
    await api.put(`/users/${user._id}`, { isActive: !user.isActive });
    setUsers(u => u.map(x => x._id === user._id ? { ...x, isActive: !x.isActive } : x));
  };

  const handleRoleChange = async (userId, role) => {
    await api.put(`/users/${userId}`, { role });
    setUsers(u => u.map(x => x._id === userId ? { ...x, role } : x));
    setEditing(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter ? u.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  return (
    <Layout title="User Management">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Users', count: users.length, color: 'bg-blue-500/20' },
            { label: 'Managers', count: users.filter(u => u.role === 'manager').length, color: 'bg-purple-500/20' },
            { label: 'Active Users', count: users.filter(u => u.isActive).length, color: 'bg-green-500/20' },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl`}>👤</div>
              <div>
                <p className="text-slate-400 text-xs">{s.label}</p>
                <p className="text-white font-bold text-xl">{s.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card flex flex-wrap gap-3">
          <input className="input w-56" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input w-36" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                {['User','Role','City','Status','Joined','Actions'].map(h => (
                  <th key={h} className="text-left pb-3 font-semibold pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-500">Loading...</td></tr>
              ) : filtered.map(user => (
                <tr key={user._id} className="table-row">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    {editing === user._id ? (
                      <select className="input text-xs py-1 w-28" defaultValue={user.role}
                        onChange={e => handleRoleChange(user._id, e.target.value)}>
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`badge ${ROLE_COLORS[user.role]}`}>{user.role}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{user.city || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-400">{formatDate(user.createdAt)}</td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => setEditing(editing === user._id ? null : user._id)}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium">Edit</button>
                    <button onClick={() => handleToggleActive(user)}
                      className={`text-xs font-medium ${user.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}>
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && !filtered.length && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-500">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsers;
