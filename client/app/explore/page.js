'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { postAPI, categoryAPI } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ExploreContent() {
    const searchParams = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '');
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
        postAPI.getAll(params)
            .then(d => { setPosts(d.posts || []); setTotalPages(d.pages || 1); })
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, [page, search, selectedCat]);

    return (
        <div>
            {/* Search Bar */}
            <div className="glass" style={{ padding: '20px 24px', marginBottom: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <input className="form-input" placeholder="Search stories, histories, oriki…" value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    style={{ flex: 1, minWidth: 200 }} />
                <select className="form-select" value={selectedCat} onChange={e => { setSelectedCat(e.target.value); setPage(1); }} style={{ minWidth: 180 }}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {(search || selectedCat) && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setSelectedCat(''); setPage(1); }}>Clear</button>
                )}
            </div>

            {/* Category Pills */}
            {categories.length > 0 && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
                    <button onClick={() => setSelectedCat('')}
                        className={`badge ${!selectedCat ? 'badge-gold' : ''}`}
                        style={{ cursor: 'pointer', border: '1px solid var(--border)', background: !selectedCat ? '' : 'transparent', color: !selectedCat ? '' : 'var(--text-muted)', padding: '8px 16px', borderRadius: 50, fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                        All
                    </button>
                    {categories.map(c => (
                        <button key={c._id} onClick={() => { setSelectedCat(c._id); setPage(1); }}
                            className={`badge ${selectedCat === c._id ? 'badge-gold' : ''}`}
                            style={{ cursor: 'pointer', border: '1px solid var(--border)', background: selectedCat === c._id ? '' : 'transparent', color: selectedCat === c._id ? '' : 'var(--text-muted)', padding: '8px 16px', borderRadius: 50, fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                            {c.icon} {c.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Posts Grid */}
            {loading ? (
                <div className="content-grid">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                            <div className="skeleton" style={{ height: 180 }} />
                            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div className="skeleton" style={{ height: 16, width: '60%' }} />
                                <div className="skeleton" style={{ height: 20, width: '90%' }} />
                                <div className="skeleton" style={{ height: 16, width: '80%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : posts.length > 0 ? (
                <div className="content-grid">
                    {posts.map(post => (
                        <Link key={post._id} href={`/post/${post._id}`} className="card" style={{ textDecoration: 'none' }}>
                            {post.coverImage ? (
                                <div style={{ height: 180, overflow: 'hidden' }}>
                                    <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                        onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                                        onMouseOut={e => e.target.style.transform = 'scale(1)'}
                                    />
                                </div>
                            ) : (
                                <div style={{ height: 120, background: `linear-gradient(135deg, ${post.category?.color || '#C8973A'}22, #1A3A2F)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                                    📚
                                </div>
                            )}
                            <div style={{ padding: 20 }}>
                                {post.category && <span className="badge badge-gold" style={{ marginBottom: 10, fontSize: '0.7rem' }}>{post.category.name}</span>}
                                <h3 style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>{post.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    {post.excerpt || post.body?.replace(/<[^>]+>/g, '').slice(0, 90) + '…'}
                                </p>
                                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                        👁 {post.views} · {post.readTime} min
                                    </span>
                                    <span style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600 }}>Read →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 16 }}>📭</div>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: 8 }}>No content found</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Try a different search or category</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                            style={{
                                width: 40, height: 40, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                                background: p === page ? 'var(--gold)' : 'transparent',
                                color: p === page ? '#0D0800' : 'var(--text-muted)',
                            }}>{p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ExplorePage() {
    return (
        <div style={{ paddingTop: 100, minHeight: '100vh' }}>
            <div className="container" style={{ paddingBottom: 80 }}>
                <div style={{ marginBottom: 40 }}>
                    <h1 className="section-title">Explore Yoruba Knowledge</h1>
                    <div className="gold-line" />
                    <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Browse stories, histories, oriki, folk tales and more</p>
                </div>
                <Suspense fallback={<div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div>}>
                    <ExploreContent />
                </Suspense>
            </div>
        </div>
    );
}
