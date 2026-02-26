'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminAPI.getStats()
            .then(setStats)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
        </div>
    );

    const cards = [
        { label: 'Total Users', val: stats?.users || 0, icon: '👥', color: 'var(--gold)', href: '/admin/users' },
        { label: 'Articles & Stories', val: stats?.posts || 0, icon: '✍️', color: 'var(--green-light)', href: '/admin/posts' },
        { label: '3D Artefacts', val: stats?.museum || 0, icon: '🏛️', color: '#3498db', href: '/admin/museum' },
        { label: 'Yoruba Lessons', val: stats?.lessons || 0, icon: '🗣️', color: '#e74c3c', href: '/admin/lessons' },
    ];

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '2rem', color: '#fff', marginBottom: 8 }}>Dashboard Overview</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>System-wide performance and engagement metrics</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
                {cards.map(card => (
                    <Link key={card.label} href={card.href} className="glass"
                        style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 20, textDecoration: 'none', transition: 'transform 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ width: 56, height: 56, borderRadius: 12, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                            {card.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{card.label}</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{card.val}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
                {/* Recent Users */}
                <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 700 }}>Recent Users</h2>
                        <Link href="/admin/users" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>View all</Link>
                    </div>
                    <div className="table-wrap">
                        <table style={{ fontSize: '0.9rem' }}>
                            <thead><tr><th>User</th><th>Role</th><th>Joined</th></tr></thead>
                            <tbody>
                                {stats?.recentUsers?.map(u => (
                                    <tr key={u._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#000', fontWeight: 700 }}>{u.name?.charAt(0)}</div>
                                                <span style={{ color: '#fff' }}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td><span className={`badge ${u.role === 'org' ? 'badge-gold' : 'badge-green'}`} style={{ fontSize: '0.7rem' }}>{u.role}</span></td>
                                        <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Posts */}
                <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 700 }}>Latest Content</h2>
                        <Link href="/admin/posts" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>View all</Link>
                    </div>
                    <div className="table-wrap">
                        <table style={{ fontSize: '0.9rem' }}>
                            <thead><tr><th>Title</th><th>Views</th><th>Status</th></tr></thead>
                            <tbody>
                                {stats?.recentPosts?.map(p => (
                                    <tr key={p._id}>
                                        <td style={{ color: '#fff', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                                        <td style={{ color: 'rgba(255,255,255,0.4)' }}>👁 {p.views}</td>
                                        <td><span className={`badge ${p.status === 'published' ? 'badge-green' : 'badge-gold'}`} style={{ fontSize: '0.7rem' }}>{p.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
