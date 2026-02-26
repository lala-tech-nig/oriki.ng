'use client';
import { useState, useEffect } from 'react';
import { categoryAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', icon: '', color: '#C8973A', type: 'post' });

    const load = () => {
        setLoading(true);
        categoryAPI.getAll()
            .then(setCategories)
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await categoryAPI.update(editingId, form);
                toast.success('Category updated');
            } else {
                await categoryAPI.create(form);
                toast.success('Category created');
            }
            setForm({ name: '', description: '', icon: '', color: '#C8973A', type: 'post' });
            setShowForm(false);
            setEditingId(null);
            load();
        } catch (err) { toast.error(err.message); }
    };

    const edit = (cat) => {
        setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', color: cat.color || '#C8973A', type: cat.type || 'post' });
        setEditingId(cat._id);
        setShowForm(true);
    };

    const remove = async (id) => {
        if (!confirm('Are you sure? This might affect content in this category.')) return;
        try {
            await categoryAPI.delete(id);
            toast.success('Category deleted');
            load();
        } catch (err) { toast.error(err.message); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.8rem', color: '#fff', marginBottom: 6 }}>Categories</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Manage content sections and organisation</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', description: '', icon: '', color: '#C8973A', type: 'post' }); }}>
                    {showForm ? '✕ Close Form' : '+ New Category'}
                </button>
            </div>

            {showForm && (
                <div className="glass" style={{ padding: 28, borderRadius: 16, marginBottom: 32, animation: 'fadeInUp 0.3s ease' }}>
                    <h2 style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 700, marginBottom: 20 }}>{editingId ? 'Edit Category' : 'Create New Category'}</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                        <div className="form-group">
                            <label className="form-label">Category Name</label>
                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Yoruba History" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Icon (Emoji)</label>
                            <input className="form-input" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 📜" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Theme Color</label>
                            <input className="form-input" type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ height: 42 }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Content Type</label>
                            <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option value="post">Post (News, Stories)</option>
                                <option value="museum">Museum (3D Items)</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Description</label>
                            <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Briefly describe what this category contains…" />
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12 }}>
                            <button type="submit" className="btn btn-primary" style={{ minWidth: 160 }}>{editingId ? 'Save Changes' : 'Create Category'}</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="content-grid">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)
                ) : categories.length > 0 ? (
                    categories.map(cat => (
                        <div key={cat._id} className="glass" style={{ padding: 24, borderRadius: 16, borderLeft: `4px solid ${cat.color || 'var(--gold)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <span style={{ fontSize: '2.5rem' }}>{cat.icon || '📁'}</span>
                                <span className="badge badge-ghost" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{cat.type}</span>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 6 }}>{cat.name}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 20 }}>{cat.description || 'No description provided.'}</p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn btn-outline btn-sm" onClick={() => edit(cat)}>Edit</button>
                                <button className="btn btn-ghost btn-sm" style={{ color: '#ff4d4d' }} onClick={() => remove(cat._id)}>Delete</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>No categories created yet.</div>
                )}
            </div>
        </div>
    );
}
