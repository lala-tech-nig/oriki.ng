'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { favoriteAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DashboardShell } from '../page';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState({ posts: [], museum: [] });
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('posts');

    useEffect(() => {
        if (user) {
            favoriteAPI.getAll()
                .then(setFavorites)
                .catch(() => { })
                .finally(() => setLoading(false));
        } else setLoading(false);
    }, [user]);

    const removePost = async (id) => {
        await favoriteAPI.togglePost(id);
        setFavorites(f => ({ ...f, posts: f.posts.filter(p => p._id !== id) }));
        toast.success('Removed from favorites');
    };

    const removeMuseum = async (id) => {
        await favoriteAPI.toggleMuseum(id);
        setFavorites(f => ({ ...f, museum: f.museum.filter(m => m._id !== id) }));
        toast.success('Removed from favorites');
    };

    return (
        <DashboardShell>
            <div style={{ maxWidth: 960 }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.8rem', color: 'var(--text)', marginBottom: 6 }}>My Favorites 🔖</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Content you've saved for later</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 50, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
                    {[['posts', '📚 Stories', favorites.posts?.length], ['museum', '🏛️ 3D Artefacts', favorites.museum?.length]].map(([t, label, count]) => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{
                                padding: '10px 24px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                                background: tab === t ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'transparent',
                                color: tab === t ? '#0D0800' : 'var(--text-muted)',
                            }}>
                            {label} {count > 0 && <span style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 50, padding: '2px 8px', fontSize: '0.75rem' }}>{count}</span>}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="content-grid">
                        {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius)' }} />)}
                    </div>
                ) : tab === 'posts' ? (
                    favorites.posts?.length > 0 ? (
                        <div className="content-grid">
                            {favorites.posts.map(post => (
                                <div key={post._id} className="card" style={{ padding: 20 }}>
                                    {post.category && <span className="badge badge-gold" style={{ marginBottom: 10, fontSize: '0.7rem' }}>{post.category.name}</span>}
                                    <h3 style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>{post.title}</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 14 }}>
                                        {new Date(post.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Link href={`/post/${post._id}`} className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }}>Read</Link>
                                        <button onClick={() => removePost(post._id)} className="btn btn-ghost btn-sm" style={{ color: '#e74c3c' }}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 16 }}>📭</div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>No saved stories yet</p>
                            <Link href="/explore" className="btn btn-primary">Browse Stories</Link>
                        </div>
                    )
                ) : (
                    favorites.museum?.length > 0 ? (
                        <div className="content-grid">
                            {favorites.museum.map(item => (
                                <div key={item._id} className="card">
                                    {item.previewImage && (
                                        <div style={{ height: 160, overflow: 'hidden' }}>
                                            <img src={item.previewImage} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div style={{ padding: 16 }}>
                                        <h3 style={{ fontSize: '0.95rem', color: 'var(--text)', marginBottom: 12 }}>{item.title}</h3>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <Link href={`/museum/${item._id}`} className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }}>View 3D</Link>
                                            <button onClick={() => removeMuseum(item._id)} className="btn btn-ghost btn-sm" style={{ color: '#e74c3c' }}>Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🏛️</div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>No saved artefacts yet</p>
                            <Link href="/museum" className="btn btn-primary">Explore Museum</Link>
                        </div>
                    )
                )}
            </div>
        </DashboardShell>
    );
}
