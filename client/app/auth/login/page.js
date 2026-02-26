'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(form.email, form.password);
            toast.success(`Welcome back, ${data.user.name}!`);
            if (data.user.role === 'admin' || data.user.role === 'superadmin') router.push('/admin');
            else router.push('/dashboard');
        } catch (err) {
            toast.error(err.message);
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', position: 'relative' }}>
            <div className="orb" style={{ width: 400, height: 400, background: '#C8973A', top: -100, left: '50%', transform: 'translateX(-50%)' }} />
            <div className="glass animate-fadeInUp" style={{ width: '100%', maxWidth: 440, padding: '48px 40px', position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #C8973A, #9A6F22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontFamily: 'Noto Serif', fontWeight: 700, fontSize: '1.4rem', color: '#0D0800' }}>O</div>
                    <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.6rem', color: 'var(--text)', marginBottom: 6 }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to your ORIKI.NG account</p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" placeholder="Enter your password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Don't have an account?{' '}
                    <Link href="/auth/register" style={{ color: 'var(--gold)', fontWeight: 600 }}>Create one free</Link>
                </p>
                <p style={{ textAlign: 'center', marginTop: 12, color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    <Link href="/admin/login" style={{ color: 'var(--text-dim)' }}>Admin login →</Link>
                </p>
            </div>
        </div>
    );
}
