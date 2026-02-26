'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { subscriptionAPI, favoriteAPI } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

function SubscriptionCountdown({ onLoad }) {
    const [status, setStatus] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        subscriptionAPI.status()
            .then(s => { setStatus(s); if (onLoad) onLoad(s); })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (!status?.active || !status.expiresAt) return;
        const tick = () => {
            const ms = new Date(status.expiresAt) - Date.now();
            if (ms <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
            setTimeLeft({
                days: Math.floor(ms / 86400000),
                hours: Math.floor((ms % 86400000) / 3600000),
                minutes: Math.floor((ms % 3600000) / 60000),
                seconds: Math.floor((ms % 60000) / 1000),
            });
        };
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, [status]);

    if (!status) return null;

    if (!status.active) return (
        <div className="glass" style={{ padding: '16px 24px', marginBottom: 28, background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
                <p style={{ fontWeight: 600, color: '#e74c3c', marginBottom: 4 }}>⚠️ No Active Subscription</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Subscribe to unlock likes, favorites, 3D museum and full lessons.</p>
            </div>
            <Link href="/pricing" className="btn btn-primary btn-sm">Subscribe $20/mo</Link>
        </div>
    );

    return (
        <div className="countdown-banner" style={{ marginBottom: 28, animation: 'glow 3s ease-in-out infinite' }}>
            <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    {status.plan === 'org_bulk' ? '🏢 Organisation' : '👤 Individual'} Subscription
                </p>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>Access expires in…</p>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {[['days', timeLeft.days], ['hours', timeLeft.hours], ['min', timeLeft.minutes], ['sec', timeLeft.seconds]].map(([label, val]) => (
                    <div key={label} className="countdown-item">
                        <span className="countdown-number">{String(val).padStart(2, '0')}</span>
                        <span className="countdown-label">{label}</span>
                    </div>
                ))}
            </div>
            <Link href="/pricing" className="btn btn-outline btn-sm">Renew</Link>
        </div>
    );
}

const sideLinks = [
    { href: '/dashboard', label: 'Overview', icon: '🏠' },
    { href: '/dashboard/favorites', label: 'My Favorites', icon: '🔖' },
    { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
    { href: '/dashboard/members', label: 'Members', icon: '👥', orgOnly: true },
    { href: '/explore', label: 'Explore Content', icon: '📚' },
    { href: '/museum', label: 'Virtual Museum', icon: '🏛️' },
    { href: '/learn', label: 'Learn Yoruba', icon: '🗣️' },
];

function DashboardShell({ children }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [sideOpen, setSideOpen] = useState(false);

    if (!user) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Please login to access your dashboard</p>
                <Link href="/auth/login" className="btn btn-primary">Login</Link>
            </div>
        </div>
    );

    const links = sideLinks.filter(l => !l.orgOnly || user.role === 'org');

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sideOpen ? 'open' : ''}`}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0D0800', fontSize: '0.9rem' }}>O</div>
                        <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>ORIKI.NG</span>
                    </Link>
                </div>

                {/* User info */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0D0800', fontSize: '1rem', flexShrink: 0 }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role === 'org' ? '🏢 Organisation' : '👤 Individual'}</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ padding: '12px 12px', flex: 1 }}>
                    {links.map(l => (
                        <Link key={l.href} href={l.href} onClick={() => setSideOpen(false)}
                            className={`sidebar-link ${pathname === l.href ? 'active' : ''}`}>
                            <span>{l.icon}</span><span>{l.label}</span>
                        </Link>
                    ))}
                </nav>

                <div style={{ padding: '12px 12px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => { logout(); router.push('/'); }} className="sidebar-link" style={{ color: '#e74c3c', width: '100%' }}>
                        <span>🚪</span><span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99, background: 'rgba(13,27,21,0.95)', backdropFilter: 'blur(12px)', padding: '0 16px', height: 56, alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }} className="mobile-dash-header">
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>Dashboard</span>
                <button onClick={() => setSideOpen(p => !p)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1.4rem' }}>☰</button>
            </div>
            {sideOpen && <div onClick={() => setSideOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.5)' }} />}

            {/* Main */}
            <main className="admin-main" style={{ paddingTop: 32 }}>{children}</main>

            <style>{`@media(max-width:1024px){.mobile-dash-header{display:flex!important}.admin-main{margin-left:0;padding-top:72px}}`}</style>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState({ posts: [], museum: [] });

    useEffect(() => {
        if (user) favoriteAPI.getAll().then(setFavorites).catch(() => { });
    }, [user]);

    return (
        <DashboardShell>
            <div style={{ maxWidth: 960 }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.8rem', color: 'var(--text)', marginBottom: 6 }}>
                        Welcome back, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Your Yoruba knowledge hub dashboard</p>
                </div>

                {/* Countdown */}
                <SubscriptionCountdown />

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
                    {[
                        ['🔖', 'Saved Posts', favorites.posts?.length || 0, '/dashboard/favorites'],
                        ['🏛️', '3D Saved', favorites.museum?.length || 0, '/dashboard/favorites'],
                        ['🗣️', 'Language', 'Lessons', '/learn'],
                        ['📚', 'Explore', 'Content', '/explore'],
                    ].map(([icon, label, val, href]) => (
                        <Link key={label} href={href} className="card" style={{ padding: 20, textDecoration: 'none', cursor: 'pointer' }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{icon}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)' }}>{val}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
                        </Link>
                    ))}
                </div>

                {/* Recent Favorites */}
                {favorites.posts?.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.2rem', color: 'var(--text)' }}>Recent Favorites</h2>
                            <Link href="/dashboard/favorites" style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>View all →</Link>
                        </div>
                        <div className="content-grid">
                            {favorites.posts?.slice(0, 3).map(post => (
                                <Link key={post._id} href={`/post/${post._id}`} className="card" style={{ padding: 20, textDecoration: 'none' }}>
                                    <h3 style={{ fontSize: '0.95rem', color: 'var(--text)', marginBottom: 8 }}>{post.title}</h3>
                                    {post.category && <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{post.category.name}</span>}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Links */}
                <div style={{ marginTop: 40 }}>
                    <h2 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.2rem', color: 'var(--text)', marginBottom: 16 }}>Quick Links</h2>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <Link href="/explore" className="btn btn-outline">📚 Explore Stories</Link>
                        <Link href="/museum" className="btn btn-outline">🏛️ 3D Museum</Link>
                        <Link href="/learn" className="btn btn-outline">🗣️ Learn Yoruba</Link>
                        <Link href="/pricing" className="btn btn-ghost">💳 Manage Subscription</Link>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

export { DashboardShell };
