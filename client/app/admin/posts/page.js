'use client';
import { useState, useEffect } from 'react';
import { postAPI, categoryAPI, adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function AdminPostsPage() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        title: '', excerpt: '', body: '', category: '',
        coverImage: '', tags: '', status: 'published', isFeatured: false
    });

    const load = async () => {
        setLoading(true);
        try {
            const [pData, cData] = await Promise.all([postAPI.getAll({ limit: 100 }), categoryAPI.getAll()]);
            setPosts(pData.posts || []);
            setCategories(cData.filter(c => c.type === 'post'));
        } catch (err) { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await adminAPI.uploadImage(fd);
            setForm({ ...form, coverImage: res.url });
            toast.success('Image uploaded!');
        } catch (err) { toast.error('Upload failed'); }
        finally { setUploading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.category) return toast.error('Please select a category');

        // Process tags
        const payload = { ...form, tags: form.tags.split(',').map(s => s.trim()).filter(Boolean) };

        try {
            if (editingId) {
                await postAPI.update(editingId, payload);
                toast.success('Post updated');
            } else {
                await postAPI.create(payload);
                toast.success('Post created');
            }
            resetForm();
            load();
        } catch (err) { toast.error(err.message); }
    };

    const resetForm = () => {
        setForm({ title: '', excerpt: '', body: '', category: '', coverImage: '', tags: '', status: 'published', isFeatured: false });
        setEditingId(null);
        setShowForm(false);
    };

    const edit = (post) => {
        setForm({
            title: post.title,
            excerpt: post.excerpt || '',
            body: post.body,
            category: post.category?._id || '',
            coverImage: post.coverImage || '',
            tags: post.tags?.join(', ') || '',
            status: post.status,
            isFeatured: post.isFeatured || false
        });
        setEditingId(post._id);
        setShowForm(true);
    };

    const remove = async (id) => {
        if (!confirm('Delete this post?')) return;
        try {
            await postAPI.delete(id);
            toast.success('Post deleted');
            load();
        } catch (err) { toast.error(err.message); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.8rem', color: '#fff', marginBottom: 6 }}>Stories & News</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Create and manage Yoruba written content</p>
                </div>
                <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
                    {showForm ? '✕ Close Editor' : '+ Create New Post'}
                </button>
            </div>

            {showForm && (
                <div className="glass" style={{ padding: 32, borderRadius: 16, marginBottom: 40, animation: 'fadeInUp 0.3s ease' }}>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--gold)', fontWeight: 700, marginBottom: 24 }}>{editingId ? 'Edit Content' : 'New Content'}</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="form-group">
                                <label className="form-label">Article Title</label>
                                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Enter a compelling title…" style={{ fontSize: '1.1rem', fontWeight: 600 }} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Excerpt / Summary (Short description for listing)</label>
                                <textarea className="form-input" rows={2} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief summary of the article…" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Content Body</label>
                                <div style={{ background: '#fff', color: '#000', borderRadius: 8, overflow: 'hidden' }}>
                                    <ReactQuill theme="snow" value={form.body} onChange={val => setForm({ ...form, body: val })} style={{ height: 400 }} />
                                </div>
                                <div style={{ height: 42 }}></div> {/* Spacer for quill toolbar height issue */}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Cover Image</label>
                                {form.coverImage && (
                                    <div style={{ width: '100%', height: 140, borderRadius: 8, overflow: 'hidden', marginBottom: 12, border: '1px solid var(--border)' }}>
                                        <img src={form.coverImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <label style={{ cursor: 'pointer', display: 'block' }}>
                                    <div className="btn btn-outline btn-sm" style={{ width: '100%', textAlign: 'center' }}>{uploading ? 'Uploading…' : '📷 Upload Image'}</div>
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tags (comma separated)</label>
                                <input className="form-input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="history, kings, ile-ife" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} style={{ width: 18, height: 18, accentColor: 'var(--gold)' }} />
                                <label htmlFor="featured" style={{ fontSize: '0.9rem', color: '#fff' }}>Post Featured</label>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}>
                                {editingId ? 'Save Changes' : 'Publish Now'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Listing */}
            <div className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Post Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Views</th>
                                <th>Likes</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan="7"><div className="skeleton" style={{ height: 40, margin: '8px 0' }} /></td></tr>)
                            ) : posts.length > 0 ? (
                                posts.map(post => (
                                    <tr key={post._id}>
                                        <td style={{ maxWidth: 300 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                {post.coverImage && <img src={post.coverImage} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />}
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</p>
                                                    {post.isFeatured && <span style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>★ Featured</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-ghost" style={{ fontSize: '0.75rem' }}>{post.category?.name || 'Uncategorized'}</span></td>
                                        <td><span className={`badge ${post.status === 'published' ? 'badge-green' : 'badge-gold'}`} style={{ fontSize: '0.7rem' }}>{post.status}</span></td>
                                        <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>👁 {post.views}</td>
                                        <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>❤️ {post.likes?.length || 0}</td>
                                        <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-ghost btn-sm" onClick={() => edit(post)}>Edit</button>
                                                <button className="btn btn-ghost btn-sm" style={{ color: '#ff4d4d' }} onClick={() => remove(post._id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>No posts found. Create your first story above.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
