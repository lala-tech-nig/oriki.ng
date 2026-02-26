'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/categories', label: 'Categories', icon: '📁' },
    { href: '/admin/posts', label: 'Stories & News', icon: '✍️' },
    { href: '/admin/museum', label: '3D Museum', icon: '🏛️' },
    { href: '/admin/lessons', label: 'Language Lessons', icon: '🗣️' },
    { href: '/', label: 'View Site', icon: '🌍' },
];

export default function AdminLayout({ children }) {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sideOpen, setSideOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/login');
            } else if (user.role !== 'admin' && user.role !== 'superadmin') {
                router.push('/dashboard');
            }
        }
    }, [user, loading, router]);

    if (loading || !user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1B15' }}>
                <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    return (
        <div className="admin-layout" style={{ background: '#0B120F' }}>
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sideOpen ? 'open' : ''}`} style={{ background: '#0D1B15', borderRight: '1px solid #1A3A2F' }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid #1A3A2F' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#000' }}>A</div>
                        <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem', letterSpacing: '0.05em' }}>ORIKI ADMIN</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '16px 12px' }}>
                    {adminLinks.map(link => (
                        <Link key={link.href} href={link.href} onClick={() => setSideOpen(false)}
                            className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
                            style={{
                                background: pathname === link.href ? 'rgba(200,151,58,0.1)' : 'transparent',
                                color: pathname === link.href ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
                                fontWeight: pathname === link.href ? 600 : 400
                            }}>
                            <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </nav>

                <div style={{ padding: '12px', borderTop: '1px solid #1A3A2F' }}>
                    <button onClick={() => { logout(); router.push('/auth/login'); }}
                        className="sidebar-link" style={{ color: '#ff4d4d', width: '100%', transition: 'all 0.2s' }}>
                        <span>🚪</span><span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Top Bar */}
            <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: '#0D1B15', padding: '0 20px', height: 64, alignItems: 'center', borderBottom: '1px solid #1A3A2F' }} className="admin-mobile-nav">
                <button onClick={() => setSideOpen(!sideOpen)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>☰</button>
                <span style={{ marginLeft: 16, fontWeight: 700, letterSpacing: '0.05em' }}>ADMIN PANEL</span>
            </div>

            <main className="admin-main" style={{ padding: '32px 40px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>

            {sideOpen && <div onClick={() => setSideOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} />}

            <style>{`
        @media (max-width: 1024px) {
          .admin-mobile-nav { display: flex !important; }
          .admin-main { margin-left: 0 !important; padding-top: 96px !important; padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
        </div>
    );
}
