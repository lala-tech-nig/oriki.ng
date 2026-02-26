'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
    const router = useRouter();
    const { user, login, loading: authLoading } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);

    // Redirect if already logged in as admin
    useEffect(() => {
        if (!authLoading && user) {
            if (user.role === 'admin' || user.role === 'superadmin') {
                router.replace('/admin');
            } else {
                setError('Access denied. Admin credentials required.');
            }
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) {
            setError('All fields are required.');
            return;
        }
        setLoading(true);
        try {
            const data = await login(form.email, form.password);
            const role = data?.user?.role || data?.role;
            if (role !== 'admin' && role !== 'superadmin') {
                setError('Access denied. Admin credentials required.');
                // clear the logged-in state
                localStorage.removeItem('oriki_token');
            }
            // redirect handled by useEffect above
        } catch (err) {
            setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#080F0C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background glow orbs */}
            <div style={{
                position: 'absolute', top: '-20%', left: '-10%',
                width: 600, height: 600, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(200,151,58,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-20%', right: '-10%',
                width: 500, height: 500, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(26,58,47,0.4) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            {/* Grid overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(200,151,58,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,151,58,0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
            }} />

            <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

                {/* Brand */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #C8973A, #9A6F22)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 0 40px rgba(200,151,58,0.3)',
                        fontSize: '1.6rem',
                    }}>⚜️</div>
                    <h1 style={{
                        fontFamily: 'Noto Serif, serif', fontSize: '1.75rem',
                        color: '#F5EDD8', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6,
                    }}>Admin Portal</h1>
                    <p style={{ color: 'rgba(200,151,58,0.7)', fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
                        ORIKI.NG Control Centre
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(200,151,58,0.2)',
                    borderRadius: 20, padding: '40px 36px',
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}>

                    {/* Security badge */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'rgba(200,151,58,0.08)', border: '1px solid rgba(200,151,58,0.15)',
                        borderRadius: 8, padding: '8px 14px', marginBottom: 28,
                    }}>
                        <span>🔐</span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(200,151,58,0.8)', letterSpacing: '0.04em' }}>
                            RESTRICTED — Authorised Personnel Only
                        </span>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)',
                            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span>⚠️</span>
                            <span style={{ fontSize: '0.875rem', color: '#ff6b6b' }}>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block', fontSize: '0.78rem', fontWeight: 600,
                                color: 'rgba(245,237,216,0.6)', letterSpacing: '0.08em',
                                textTransform: 'uppercase', marginBottom: 8,
                            }}>Admin Email</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>📧</span>
                                <input
                                    id="admin-email"
                                    type="email"
                                    placeholder="admin@oriki.ng"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    autoComplete="username"
                                    style={{
                                        width: '100%', padding: '13px 16px 13px 42px', boxSizing: 'border-box',
                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,151,58,0.2)',
                                        borderRadius: 10, color: '#F5EDD8', fontSize: '0.95rem', outline: 'none',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#C8973A'; e.target.style.boxShadow = '0 0 0 3px rgba(200,151,58,0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(200,151,58,0.2)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 28 }}>
                            <label style={{
                                display: 'block', fontSize: '0.78rem', fontWeight: 600,
                                color: 'rgba(245,237,216,0.6)', letterSpacing: '0.08em',
                                textTransform: 'uppercase', marginBottom: 8,
                            }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔑</span>
                                <input
                                    id="admin-password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••••"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    autoComplete="current-password"
                                    style={{
                                        width: '100%', padding: '13px 48px 13px 42px', boxSizing: 'border-box',
                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,151,58,0.2)',
                                        borderRadius: 10, color: '#F5EDD8', fontSize: '0.95rem', outline: 'none',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#C8973A'; e.target.style.boxShadow = '0 0 0 3px rgba(200,151,58,0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(200,151,58,0.2)'; e.target.style.boxShadow = 'none'; }}
                                />
                                <button type="button" onClick={() => setShowPass(s => !s)} style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: 4, color: '#F5EDD8', fontSize: '1rem',
                                }}>{showPass ? '🙈' : '👁️'}</button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            id="admin-login-btn"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                                background: loading ? 'rgba(200,151,58,0.4)' : 'linear-gradient(135deg, #C8973A, #9A6F22)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                color: '#0D0800', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.05em',
                                boxShadow: loading ? 'none' : '0 4px 20px rgba(200,151,58,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    Authenticating...
                                </>
                            ) : '⚜️ Access Admin Panel'}
                        </button>
                    </form>
                </div>

                {/* Back link */}
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <a href="/" style={{ color: 'rgba(200,151,58,0.5)', fontSize: '0.82rem', textDecoration: 'none' }}
                        onMouseOver={e => e.target.style.color = '#C8973A'}
                        onMouseOut={e => e.target.style.color = 'rgba(200,151,58,0.5)'}
                    >← Back to ORIKI.NG</a>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: rgba(245,237,216,0.25) !important; }
            `}</style>
        </div>
    );
}
