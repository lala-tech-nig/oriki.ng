'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

const navLinks = [
    { href: '/explore', label: 'Explore' },
    { href: '/museum', label: 'Virtual Museum' },
    { href: '/learn', label: 'Learn Yoruba' },
    { href: '/pricing', label: 'Pricing' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);
        const onScroll = () => setScrolled(window.scrollY > 40);
        const onResize = () => setIsMobile(window.innerWidth < 640);

        onResize(); // Initial check
        window.addEventListener('scroll', onScroll);
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
        };
    }, []);


    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) return null;

    return (
        <header
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
                transition: 'all 0.3s ease',
                background: scrolled ? 'rgba(13,27,21,0.95)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(200,151,58,0.2)' : 'none',
            }}
        >
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #C8973A, #9A6F22)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Noto Serif, serif', fontWeight: 700, fontSize: '1.1rem', color: '#0D0800',
                    }}>O</div>
                    <span style={{ fontFamily: 'Noto Serif, serif', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text)' }}>
                        ORIKI<span style={{ color: 'var(--gold)' }}>.NG</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
                    {navLinks.map(l => (
                        <Link key={l.href} href={l.href}
                            style={{
                                padding: '8px 16px', borderRadius: 50,
                                color: pathname === l.href ? 'var(--gold)' : 'var(--text-muted)',
                                fontWeight: 500, fontSize: '0.9rem', transition: 'var(--transition)',
                                background: pathname === l.href ? 'rgba(200,151,58,0.1)' : 'transparent',
                            }}
                            onMouseOver={e => e.currentTarget.style.color = 'var(--gold)'}
                            onMouseOut={e => e.currentTarget.style.color = pathname === l.href ? 'var(--gold)' : 'var(--text-muted)'}
                        >{l.label}</Link>
                    ))}
                </nav>

                {/* Auth Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setDropOpen(p => !p)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                                    borderRadius: 50, padding: '6px 16px 6px 6px', color: 'var(--text)',
                                    transition: 'var(--transition)',
                                }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '0.8rem', color: '#0D0800',
                                }}>{user.name?.charAt(0).toUpperCase()}</div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
                            </button>
                            {dropOpen && (
                                <div className="glass-dark animate-fadeIn" style={{
                                    position: 'absolute', top: '120%', right: 0, minWidth: 200,
                                    padding: 8, zIndex: 100,
                                }}>
                                    <Link href="/dashboard" style={{ display: 'block', padding: '10px 16px', color: 'var(--text-muted)', borderRadius: 8, fontSize: '0.9rem' }}
                                        onClick={() => setDropOpen(false)}>Dashboard</Link>
                                    {(user.role === 'admin' || user.role === 'superadmin') && (
                                        <Link href="/admin" style={{ display: 'block', padding: '10px 16px', color: 'var(--text-muted)', borderRadius: 8, fontSize: '0.9rem' }}
                                            onClick={() => setDropOpen(false)}>Admin Panel</Link>
                                    )}
                                    <Link href="/dashboard/profile" style={{ display: 'block', padding: '10px 16px', color: 'var(--text-muted)', borderRadius: 8, fontSize: '0.9rem' }}
                                        onClick={() => setDropOpen(false)}>Profile</Link>
                                    <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                                    <button onClick={() => { logout(); setDropOpen(false); }}
                                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', color: '#e74c3c', borderRadius: 8, fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link href="/auth/login" className="btn btn-ghost btn-sm" style={{ display: (mounted && isMobile) ? 'none' : 'flex' }}>Login</Link>

                            <Link href="/auth/register" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}

                    {/* Hamburger */}
                    <button onClick={() => setMenuOpen(p => !p)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 8, display: 'none' }}
                        className="hamburger">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                            {menuOpen
                                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                            }
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="glass-dark animate-fadeInUp" style={{ margin: '0 16px 12px', padding: 16, borderRadius: 'var(--radius)' }}>
                    {navLinks.map(l => (
                        <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                            style={{ display: 'block', padding: '12px 16px', color: pathname === l.href ? 'var(--gold)' : 'var(--text-muted)', borderRadius: 8 }}>
                            {l.label}
                        </Link>
                    ))}
                    {!user && (
                        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                            <Link href="/auth/login" className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>Login</Link>
                            <Link href="/auth/register" className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>Register</Link>
                        </div>
                    )}
                </div>
            )}

            <style>{`
        @media(max-width:768px){.desktop-nav{display:none!important}.hamburger{display:flex!important}}
      `}</style>
        </header>
    );
}
