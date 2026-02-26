'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const load = () => {
        setLoading(true);
        adminAPI.getUsers({ search })
            .then(setUsers)
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [search]);

    const toggleActive = async (id, current) => {
        try {
            await adminAPI.updateUser(id, { isActive: !current });
            setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !current } : u));
            toast.success('User status updated');
        } catch (err) { toast.error(err.message); }
    };

    const changeRole = async (id, role) => {
        try {
            await adminAPI.updateUser(id, { role });
            setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
            toast.success('User role updated');
        } catch (err) { toast.error(err.message); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.8rem', color: '#fff', marginBottom: 6 }}>User Management</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Manage roles and account permissions</p>
                </div>
                <div className="glass" style={{ padding: '8px 16px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 10, width: 300 }}>
                    <span style={{ opacity: 0.5 }}>🔍</span>
                    <input className="form-input" placeholder="Search user by name or email…"
                        style={{ background: 'none', border: 'none', padding: '4px 0', fontSize: '0.9rem' }}
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>User / Email</th>
                                <th>Role</th>
                                <th>Organisation</th>
                                <th>Subscription</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan="6"><div className="skeleton" style={{ height: 40, margin: '8px 0' }} /></td></tr>)
                            ) : users.length > 0 ? (
                                users.map(u => (
                                    <tr key={u._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#000', fontSize: '0.9rem' }}>
                                                    {u.name?.charAt(0)}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</p>
                                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <select className="form-select" value={u.role} onChange={e => changeRole(u._id, e.target.value)}
                                                style={{ fontSize: '0.75rem', padding: '4px 8px', width: 110, background: 'rgba(255,255,255,0.05)' }}>
                                                <option value="user">User</option>
                                                <option value="org">Organisation</option>
                                                <option value="admin">Admin</option>
                                                <option value="superadmin">Super Admin</option>
                                            </select>
                                        </td>
                                        <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{u.orgName || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <span className={`badge ${u.subscription?.status === 'active' ? 'badge-green' : 'badge-gold'}`} style={{ fontSize: '0.65rem' }}>
                                                    {u.subscription?.status || 'inactive'}
                                                </span>
                                                {u.subscription?.plan && <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{u.subscription.plan} ({u.subscription.seats})</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.isActive ? 'badge-green' : 'badge-ghost'}`} style={{ fontSize: '0.7rem', border: u.isActive ? '' : '1px solid rgba(255,255,255,0.1)' }}>
                                                {u.isActive ? 'Active' : 'Banned'}
                                            </span>
                                        </td>
                                        <td>
                                            <button onClick={() => toggleActive(u._id, u.isActive)}
                                                className="btn btn-ghost btn-sm" style={{ color: u.isActive ? '#ff4d4d' : '#2ecc71', fontSize: '0.8rem' }}>
                                                {u.isActive ? 'Ban User' : 'Unban'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>No users found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
