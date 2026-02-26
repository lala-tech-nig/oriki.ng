'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [type, setType] = useState('individual');
    const [form, setForm] = useState({ name: '', email: '', password: '', orgName: '' });
    const [loading, setLoading] = useState(false);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
            const payload = { ...form, role: type === 'org' ? 'org' : 'user' };
            const data = await register(payload);
            toast.success('Account created! Welcome to ORIKI.NG 🎉');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.message);
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', position: 'relative' }}>
            <div className="orb" style={{ width: 500, height: 500, background: '#1A3A2F', top: -100, right: -100 }} />
            <div className="glass animate-fadeInUp" style={{ width: '100%', maxWidth: 480, padding: '48px 40px', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #C8973A, #9A6F22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontFamily: 'Noto Serif', fontWeight: 700, fontSize: '1.4rem', color: '#0D0800' }}>O</div>
                    <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.6rem', color: 'var(--text)', marginBottom: 6 }}>Join ORIKI.NG</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create your free account today</p>
                </div>

                {/* Account type toggle */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 50, padding: 4, marginBottom: 28, border: '1px solid var(--border)' }}>
                    {['individual', 'org'].map(t => (
                        <button key={t} type="button" onClick={() => setType(t)}
                            style={{
                                flex: 1, padding: '10px 20px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                                background: type === t ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'transparent',
                                color: type === t ? '#0D0800' : 'var(--text-muted)',
                            }}>
                            {t === 'individual' ? '👤 Individual' : '🏢 Organisation'}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {type === 'org' && (
                        <div className="form-group">
                            <label className="form-label">Organisation Name</label>
                            <input className="form-input" type="text" placeholder="e.g. University of Ibadan" value={form.orgName} onChange={set('orgName')} required />
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">{type === 'org' ? 'Contact Person Name' : 'Full Name'}</label>
                        <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={set('name')} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={set('password')} required />
                    </div>

                    {type === 'org' && (
                        <div className="glass" style={{ padding: 16, borderRadius: 12, background: 'rgba(200,151,58,0.05)' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                🏢 <strong style={{ color: 'var(--gold)' }}>Organisation account</strong> allows you to create sub-accounts for students, staff, or members and manage bulk subscriptions.
                            </p>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                        {loading ? 'Creating account…' : 'Create Account Free'}
                    </button>
                    <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        By registering, you agree to our Terms of Service
                    </p>
                </form>
                <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Already have an account?{' '}
                    <Link href="/auth/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
