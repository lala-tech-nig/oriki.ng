'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { postAPI, favoriteAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function PostPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        postAPI.getById(id)
            .then(p => { setPost(p); setLikes(p.likes?.length || 0); })
            .catch(() => router.push('/explore'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleLike = async () => {
        if (!user) return toast.error('Please login to like posts');
        try {
            const res = await postAPI.like(id);
            setLiked(res.liked);
            setLikes(res.likes);
        } catch { toast.error('Failed to like'); }
    };

    const handleSave = async () => {
        if (!user) return toast.error('Please login to save posts');
        try {
            const res = await favoriteAPI.togglePost(id);
            setSaved(res.saved);
            toast.success(res.saved ? 'Saved to favorites!' : 'Removed from favorites');
        } catch { toast.error('Failed to save'); }
    };

    if (loading) return (
        <div style={{ paddingTop: 100, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: 800, paddingBottom: 80 }}>
                <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius)', marginBottom: 32 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="skeleton" style={{ height: 40, width: '70%' }} />
                    <div className="skeleton" style={{ height: 20, width: '50%' }} />
                    {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 16 }} />)}
                </div>
            </div>
        </div>
    );

    if (!post) return null;

    return (
        <div style={{ paddingTop: 100, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: 860, paddingBottom: 80 }}>
                {/* Breadcrumb */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                    <Link href="/explore" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Explore</Link>
                    <span style={{ color: 'var(--text-dim)' }}>›</span>
                    {post.category && <Link href={`/explore?category=${post.category._id}`} style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{post.category.name}</Link>}
                    <span style={{ color: 'var(--text-dim)' }}>›</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>{post.title?.slice(0, 40)}…</span>
                </div>

                {/* Category Badge */}
                {post.category && <span className="badge badge-gold" style={{ marginBottom: 16 }}>{post.category.icon} {post.category.name}</span>}

                {/* Title */}
                <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text)', marginBottom: 16, lineHeight: 1.2 }}>{post.title}</h1>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', marginBottom: 32, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <span>📅 {new Date(post.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>⏱ {post.readTime} min read</span>
                    <span>👁 {post.views} views</span>
                    <span>❤️ {likes} likes</span>
                </div>

                {/* Cover Image */}
                {post.coverImage && (
                    <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 40, maxHeight: 480 }}>
                        <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}

                {/* Excerpt */}
                {post.excerpt && (
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontStyle: 'italic', borderLeft: '3px solid var(--gold)', paddingLeft: 20, marginBottom: 36, lineHeight: 1.7 }}>
                        {post.excerpt}
                    </p>
                )}

                {/* Body */}
                <div className="prose-content" dangerouslySetInnerHTML={{ __html: post.body }} style={{ fontSize: '1.05rem', lineHeight: 1.9 }} />

                {/* Tags */}
                {post.tags?.length > 0 && (
                    <div style={{ marginTop: 40, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {post.tags.map(t => <span key={t} className="badge badge-green">#{t}</span>)}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
                    <button onClick={handleLike} className={`btn ${liked ? 'btn-primary' : 'btn-outline'}`}>
                        {liked ? '❤️' : '🤍'} {likes} {likes === 1 ? 'Like' : 'Likes'}
                    </button>
                    <button onClick={handleSave} className={`btn ${saved ? 'btn-primary' : 'btn-ghost'}`}>
                        {saved ? '🔖 Saved' : '🔖 Save'}
                    </button>
                    <Link href="/explore" className="btn btn-ghost">← Back to Explore</Link>
                </div>
            </div>
        </div>
    );
}
