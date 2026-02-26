'use client';
import Link from 'next/link';


const footerLinks = {
    'Explore': [
        { href: '/explore', label: 'All Content' },
        { href: '/museum', label: 'Virtual Museum' },
        { href: '/learn', label: 'Learn Yoruba' },
        { href: '/pricing', label: 'Pricing' },
    ],
    'Categories': [
        { href: '/explore?cat=news', label: 'Yoruba News' },
        { href: '/explore?cat=history', label: 'History' },
        { href: '/explore?cat=kings', label: 'Kings & Rulers' },
        { href: '/explore?cat=folktales', label: 'Folk Tales' },
        { href: '/explore?cat=oriki', label: 'Oriki' },
    ],
    'Account': [
        { href: '/auth/register', label: 'Register' },
        { href: '/auth/login', label: 'Login' },
        { href: '/dashboard', label: 'My Dashboard' },
        { href: '/pricing', label: 'Subscribe' },
    ],
};

export default function Footer() {
    return (
        <footer style={{ background: 'rgba(13,27,21,0.9)', borderTop: '1px solid var(--border)', marginTop: 80 }}>
            <div className="container" style={{ padding: '64px 24px 32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #C8973A, #9A6F22)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'Noto Serif, serif', fontWeight: 700, fontSize: '1.1rem', color: '#0D0800',
                            }}>O</div>
                            <span style={{ fontFamily: 'Noto Serif, serif', fontWeight: 700, fontSize: '1.3rem' }}>
                                ORIKI<span style={{ color: 'var(--gold)' }}>.NG</span>
                            </span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                            The premier digital home of Yoruba culture. Preserving and sharing our stories, history, heritage and language for generations to come.
                        </p>
                        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                            {['Twitter', 'Facebook', 'Instagram', 'YouTube'].map(s => (
                                <a key={s} href="#" title={s}
                                    style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', transition: 'var(--transition)' }}
                                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                >{s[0]}</a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([section, links]) => (
                        <div key={section}>
                            <h4 style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>{section}</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {links.map(l => (
                                    <li key={l.href}>
                                        <Link href={l.href}
                                            style={{ color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'var(--transition)' }}
                                            onMouseOver={e => e.currentTarget.style.color = 'var(--gold)'}
                                            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                        >{l.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>© 2026 ORIKI.NG. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: 24 }}>
                        {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
                            <a key={l} href="#" style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{l}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
