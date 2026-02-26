'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { museumAPI, categoryAPI } from '@/lib/api';

export default function MuseumPage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCat, setSelectedCat] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        categoryAPI.getAll().then(setCategories).catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = { page, limit: 12 };
        if (search) params.search = search;
        if (selectedCat) params.category = selectedCat;
        museumAPI.getAll(params)
            .then(d => { setItems(d.items || []); setTotalPages(d.pages || 1); })
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [page, search, selectedCat]);

    return (
        <div style={{ paddingTop: 100, minHeight: '100vh' }}>
            {/* Hero Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(13,27,21,0.95), rgba(200,151,58,0.15))', borderBottom: '1px solid var(--border)', padding: '60px 0 40px' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <span className="badge badge-gold" style={{ marginBottom: 16 }}>🏛️ Virtual Museum</span>
                    <h1 className="section-title">Yoruba 3D Heritage Museum</h1>
                    <div className="gold-line" style={{ margin: '12px auto 16px' }} />
                    <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto' }}>
                        Explore high-resolution 3D artefacts from Yoruba civilisation. Rotate, zoom, and click annotation points for rich historical context.
                    </p>
                </div>
            </div>

            <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
                {/* Filters */}
                <div className="glass" style={{ padding: '16px 20px', marginBottom: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input className="form-input" placeholder="Search artefacts…" value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ flex: 1, minWidth: 200 }} />
                    <select className="form-select" value={selectedCat} onChange={e => { setSelectedCat(e.target.value); setPage(1); }} style={{ minWidth: 180 }}>
                        <option value="">All Collections</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="content-grid-lg">
                        {Array(8).fill(0).map((_, i) => (
                            <div key={i} className="card">
                                <div className="skeleton" style={{ height: 240 }} />
                                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div className="skeleton" style={{ height: 20, width: '80%' }} />
                                    <div className="skeleton" style={{ height: 14, width: '60%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length > 0 ? (
                    <div className="content-grid-lg">
                        {items.map(item => (
                            <Link key={item._id} href={`/museum/${item._id}`} className="card" style={{ textDecoration: 'none' }}>
                                <div style={{ height: 240, overflow: 'hidden', position: 'relative' }}>
                                    {item.previewImage ? (
                                        <img src={item.previewImage} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                                            onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                                            onMouseOut={e => e.target.style.transform = 'scale(1)'}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1A3A2F, #2D5C47)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🏺</div>
                                    )}
                                    {/* 3D badge */}
                                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(13,27,21,0.9)', border: '1px solid var(--gold)', borderRadius: 6, padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em' }}>3D</div>
                                    {/* Annotation count */}
                                    {item.annotations?.length > 0 && (
                                        <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(13,27,21,0.85)', borderRadius: 6, padding: '4px 10px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            📍 {item.annotations.length} points
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: 20 }}>
                                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text)', marginBottom: 8 }}>{item.title}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                                        {item.description?.slice(0, 100)}…
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                            {item.era && <span>🕰 {item.era}</span>}
                                            {item.origin && <span>📍 {item.origin}</span>}
                                        </div>
                                        <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.85rem' }}>View 3D →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <div style={{ fontSize: '5rem', marginBottom: 16 }}>🏛️</div>
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Museum is being curated</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>3D artefacts are being uploaded. Check back soon!</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)}
                                style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, background: p === page ? 'var(--gold)' : 'transparent', color: p === page ? '#0D0800' : 'var(--text-muted)', transition: 'all 0.2s' }}>{p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
