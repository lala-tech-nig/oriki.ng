'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subAccountAPI } from '@/lib/api';
import { DashboardShell } from '../page';
import toast from 'react-hot-toast';

export default function MembersPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [creating, setCreating] = useState(false);

    const load = () => subAccountAPI.getAll().then(setMembers).catch(() => { }).finally(() => setLoading(false));
    useEffect(() => { if (user?.role === 'org') load(); else setLoading(false); }, [user]);

    const create = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const m = await subAccountAPI.create(form);
            setMembers(prev => [m, ...prev]);
            setForm({ name: '', email: '', password: '' });
            setShowForm(false);
            toast.success('Sub-account created!');
        } catch (err) { toast.error(err.message); }
        finally { setCreating(false); }
    };

    const remove = async (id) => {
        if (!confirm('Remove this member?')) return;
        try {
            await subAccountAPI.delete(id);
            setMembers(m => m.filter(x => x._id !== id));
            toast.success('Member removed');
        } catch (err) { toast.error(err.message); }
    };

    if (user?.role !== 'org') return (
        <DashboardShell>
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🏢</div>
                <h2 style={{ color: 'var(--text)', marginBottom: 8 }}>Organisation Feature</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Sub-account management is only available for organisation accounts.</p>
            </div>
        </DashboardShell>
    );

    const seats = user?.subscription?.seats || 1;

    return (
        <DashboardShell>
            <div style={{ maxWidth: 860 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.8rem', color: 'var(--text)', marginBottom: 6 }}>Members Management 👥</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{members.length} / {seats} seats used</p>
                    </div>
                    <button onClick={() => setShowForm(p => !p)} className="btn btn-primary">
                        {showForm ? '✕ Cancel' : '+ Add Member'}
                    </button>
                </div>

                {/* Seat usage bar */}
                <div className="glass" style={{ padding: '14px 20px', marginBottom: 28, borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Seats used</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>{members.length} / {seats}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, (members.length / seats) * 100)}%`, background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                    {members.length >= seats && (
                        <p style={{ fontSize: '0.8rem', color: '#e74c3c', marginTop: 8 }}>⚠️ Seat limit reached. <a href="/pricing" style={{ color: 'var(--gold)' }}>Upgrade your plan</a> for more members.</p>
                    )}
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className="glass" style={{ padding: 24, marginBottom: 24, borderRadius: 'var(--radius)', animation: 'fadeInUp 0.3s ease' }}>
                        <h3 style={{ color: 'var(--text)', marginBottom: 18, fontFamily: 'Noto Serif, serif' }}>New Sub-Account</h3>
                        <form onSubmit={create} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Member's name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="member@email.com" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Initial Password</label>
                                <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Min. 6 characters" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button type="submit" className="btn btn-primary" disabled={creating} style={{ width: '100%' }}>
                                    {creating ? 'Creating…' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Members Table */}
                {loading ? (
                    <div>{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8, marginBottom: 8 }} />)}</div>
                ) : members.length > 0 ? (
                    <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    {members.map(m => (
                                        <tr key={m._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#0D0800' }}>{m.name?.charAt(0)}</div>
                                                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{m.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)' }}>{m.email}</td>
                                            <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                                {new Date(m.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td><span className="badge badge-green">Active</span></td>
                                            <td>
                                                <button onClick={() => remove(m._id)} className="btn btn-ghost btn-sm" style={{ color: '#e74c3c', border: 'none' }}>Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>👥</div>
                        <p style={{ color: 'var(--text-muted)' }}>No members yet. Add your first sub-account above.</p>
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
