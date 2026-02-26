'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { subscriptionAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PricingPage() {
    const { user } = useAuth();
    const [seats, setSeats] = useState(10);
    const [loading, setLoading] = useState(false);
    const [loadingOrg, setLoadingOrg] = useState(false);

    const handleIndividualPay = async () => {
        if (!user) return toast.error('Please login or register first');
        setLoading(true);
        try {
            const { authorization_url } = await subscriptionAPI.initiate({ plan: 'individual', seats: 1 });
            if (typeof window !== 'undefined') window.location.href = authorization_url;
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    };

    const handleOrgPay = async () => {
        if (!user) return toast.error('Please login or register as an organisation');
        if (user.role !== 'org') return toast.error('Organisation accounts only. Please register as an org.');
        setLoadingOrg(true);
        try {
            const { authorization_url } = await subscriptionAPI.initiate({ plan: 'org_bulk', seats });
            if (typeof window !== 'undefined') window.location.href = authorization_url;
        } catch (err) { toast.error(err.message); }
        finally { setLoadingOrg(false); }
    };

    return (
        <div style={{ paddingTop: 100, minHeight: '100vh' }}>
            <div className="container" style={{ paddingBottom: 80 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <span className="badge badge-gold" style={{ marginBottom: 16 }}>Simple Pricing</span>
                    <h1 className="section-title">Support Yoruba Culture</h1>
                    <div className="gold-line" style={{ margin: '12px auto 16px' }} />
                    <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto' }}>
                        Your subscription funds the preservation of Yoruba history, stories, and cultural artefacts for future generations.
                    </p>
                </div>

                {/* Plans */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, maxWidth: 900, margin: '0 auto 64px' }}>
                    {/* Individual */}
                    <div className="glass" style={{ padding: 36, border: '2px solid var(--gold)', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#0D0800', padding: '4px 20px', borderRadius: 50, fontWeight: 700, fontSize: '0.8rem' }}>MOST POPULAR</div>
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>👤</div>
                            <h2 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.4rem', color: 'var(--text)', marginBottom: 4 }}>Individual</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>For personal subscribers</p>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--gold)' }}>$20</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>/month</span>
                        </div>
                        {[
                            '✅ Unlimited access to all content',
                            '✅ Like & save favorites',
                            '✅ 3D museum explorer',
                            '✅ Yoruba language lessons',
                            '✅ 30-day subscription countdown',
                            '✅ Priority support',
                        ].map(f => <p key={f} style={{ color: 'var(--text-muted)', marginBottom: 10, fontSize: '0.9rem' }}>{f}</p>)}
                        <button onClick={handleIndividualPay} className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} disabled={loading}>
                            {loading ? 'Redirecting…' : 'Subscribe Now'}
                        </button>
                        {user?.subscription?.status === 'active' && user.subscription.plan === 'individual' && (
                            <p style={{ textAlign: 'center', marginTop: 12, color: 'var(--green-light)', fontSize: '0.85rem' }}>✓ Current plan</p>
                        )}
                    </div>

                    {/* Organisation */}
                    <div className="glass" style={{ padding: 36, borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🏢</div>
                            <h2 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.4rem', color: 'var(--text)', marginBottom: 4 }}>Organisation</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Schools, universities, groups</p>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--gold)' }}>${(20 * seats).toLocaleString()}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>/month</span>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 4 }}>$20 × {seats} accounts</p>
                        </div>

                        {/* Seats Slider */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Team size</span>
                                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{seats} accounts</span>
                            </div>
                            <input type="range" min={2} max={200} value={seats} onChange={e => setSeats(Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 4 }}>
                                <span>2</span><span>200</span>
                            </div>
                        </div>

                        {[
                            '✅ All Individual benefits',
                            '✅ Create sub-accounts for members',
                            '✅ Centralised billing',
                            '✅ Organisation dashboard',
                            `✅ ${seats} active user accounts`,
                            '✅ Dedicated support',
                        ].map(f => <p key={f} style={{ color: 'var(--text-muted)', marginBottom: 10, fontSize: '0.9rem' }}>{f}</p>)}

                        <button onClick={handleOrgPay} className="btn btn-outline" style={{ width: '100%', marginTop: 20 }} disabled={loadingOrg}>
                            {loadingOrg ? 'Redirecting…' : `Subscribe ${seats} accounts`}
                        </button>
                        <p style={{ textAlign: 'center', marginTop: 10, color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                            Requires an Organisation account. <Link href="/auth/register" style={{ color: 'var(--gold)' }}>Register as org →</Link>
                        </p>
                    </div>
                </div>

                {/* FAQ */}
                <div style={{ maxWidth: 680, margin: '0 auto' }}>
                    <h2 style={{ fontFamily: 'Noto Serif, serif', textAlign: 'center', marginBottom: 32, color: 'var(--text)' }}>Frequently Asked Questions</h2>
                    {[
                        ['What payment methods are accepted?', 'We accept all major debit/credit cards via Paystack (Visa, Mastercard, Verve). Nigerian bank transfers are also supported.'],
                        ['How does the org bulk plan work?', 'As an organisation admin, you pay for a set number of seats. You then create sub-accounts for each member — they each get their own login with full platform access.'],
                        ['What happens when my subscription expires?', 'You will see a countdown timer on your dashboard. When it reaches zero, premium features (like/save, 3D museum, full lessons) are paused until you renew.'],
                        ['Can I cancel anytime?', 'Yes. You can cancel your subscription from your dashboard at any time. Your access remains until the end of the current billing period.'],
                    ].map(([q, a]) => (
                        <div key={q} className="glass" style={{ padding: '20px 24px', borderRadius: 'var(--radius)', marginBottom: 12 }}>
                            <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{q}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
