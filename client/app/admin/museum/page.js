'use client';
import { useState, useEffect } from 'react';
import { museumAPI, categoryAPI, adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminMuseumPage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        title: '', description: '', category: '',
        era: '', origin: '', material: '', dimensions: '',
        model: null, preview: null,
        previewUrl: '', modelUrl: '',
        annotations: []
    });

    const load = async () => {
        setLoading(true);
        try {
            const [mData, cData] = await Promise.all([museumAPI.getAll({ limit: 100 }), categoryAPI.getAll()]);
            setItems(mData.items || []);
            setCategories(cData.filter(c => c.type === 'museum'));
        } catch (err) { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const addAnnotation = () => {
        setForm({ ...form, annotations: [...form.annotations, { label: '', description: '', position: { x: 0, y: 0, z: 0 } }] });
    };

    const updateAnnotation = (idx, field, val) => {
        const ann = [...form.annotations];
        if (field.includes('.')) {
            const [obj, f] = field.split('.');
            ann[idx][obj][f] = Number(val);
        } else {
            ann[idx][field] = val;
        }
        setForm({ ...form, annotations: ann });
    };

    const removeAnnotation = (idx) => {
        setForm({ ...form, annotations: form.annotations.filter((_, i) => i !== idx) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.category) return toast.error('Please select a collection');

        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('description', form.description);
            fd.append('category', form.category);
            fd.append('era', form.era);
            fd.append('origin', form.origin);
            fd.append('material', form.material);
            fd.append('dimensions', form.dimensions);
            fd.append('annotations', JSON.stringify(form.annotations));

            if (form.model) fd.append('model', form.model);
            if (form.preview) fd.append('preview', form.preview);

            if (editingId) {
                await museumAPI.update(editingId, fd);
                toast.success('Artefact updated');
            } else {
                await museumAPI.create(fd);
                toast.success('Artefact created');
            }
            resetForm();
            load();
        } catch (err) { toast.error(err.message); }
        finally { setUploading(false); }
    };

    const resetForm = () => {
        setForm({ title: '', description: '', category: '', era: '', origin: '', material: '', dimensions: '', model: null, preview: null, previewUrl: '', modelUrl: '', annotations: [] });
        setEditingId(null);
        setShowForm(false);
    };

    const edit = (item) => {
        setForm({
            title: item.title,
            description: item.description || '',
            category: item.category?._id || '',
            era: item.era || '',
            origin: item.origin || '',
            material: item.material || '',
            dimensions: item.dimensions || '',
            annotations: item.annotations || [],
            previewUrl: item.previewImage || '',
            modelUrl: item.modelUrl || '',
            model: null, preview: null
        });
        setEditingId(item._id);
        setShowForm(true);
    };

    const remove = async (id) => {
        if (!confirm('Delete this artefact?')) return;
        try {
            await museumAPI.delete(id);
            toast.success('Artefact deleted');
            load();
        } catch (err) { toast.error(err.message); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.8rem', color: '#fff', marginBottom: 6 }}>Virtual Museum Management</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Upload 3D models and define interactive hotspots</p>
                </div>
                <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
                    {showForm ? '✕ Close Editor' : '+ Add 3D Artefact'}
                </button>
            </div>

            {showForm && (
                <div className="glass" style={{ padding: 32, borderRadius: 16, marginBottom: 40, animation: 'fadeInUp 0.3s ease' }}>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--gold)', fontWeight: 700, marginBottom: 24 }}>{editingId ? 'Edit Artefact' : 'New 3D Artefact'}</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="form-group">
                                <label className="form-label">Artefact Title</label>
                                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Bronze Head of Ife" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Historical Description</label>
                                <textarea className="form-input" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Provide detailed historical context…" />
                            </div>

                            {/* Annotations Section */}
                            <div style={{ marginTop: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>Annotation Points (Hotspots)</h3>
                                    <button type="button" onClick={addAnnotation} className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}>+ Add Point</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {form.annotations.map((ann, i) => (
                                        <div key={i} className="glass" style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                                <span style={{ fontWeight: 700, color: 'var(--gold)' }}>Point #{i + 1}</span>
                                                <button type="button" onClick={() => removeAnnotation(i)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                                <input className="form-input" placeholder="Label" value={ann.label} onChange={e => updateAnnotation(i, 'label', e.target.value)} />
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <input className="form-input" type="number" step="0.1" placeholder="X" value={ann.position.x} onChange={e => updateAnnotation(i, 'position.x', e.target.value)} />
                                                    <input className="form-input" type="number" step="0.1" placeholder="Y" value={ann.position.y} onChange={e => updateAnnotation(i, 'position.y', e.target.value)} />
                                                    <input className="form-input" type="number" step="0.1" placeholder="Z" value={ann.position.z} onChange={e => updateAnnotation(i, 'position.z', e.target.value)} />
                                                </div>
                                            </div>
                                            <textarea className="form-input" rows={2} placeholder="Description for this hotspot…" value={ann.description} onChange={e => updateAnnotation(i, 'description', e.target.value)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="form-group">
                                <label className="form-label">Collection (Category)</label>
                                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                                    <option value="">Select Collection</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">3D Model (.glb, .gltf)</label>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{form.modelUrl ? 'Current model stored on Cloudinary' : 'Required for 3D view'}</p>
                                <label className="btn btn-outline btn-sm" style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}>
                                    {form.model ? `📎 ${form.model.name}` : '⬆ Select 3D File'}
                                    <input type="file" accept=".glb,.gltf" style={{ display: 'none' }} onChange={e => setForm({ ...form, model: e.target.files[0] })} />
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Preview Image</label>
                                {form.previewUrl && <img src={form.previewUrl} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
                                <label className="btn btn-outline btn-sm" style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}>
                                    {form.preview ? `📷 ${form.preview.name}` : '⬆ Upload Preview'}
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setForm({ ...form, preview: e.target.files[0] })} />
                                </label>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group"><label className="form-label">Era</label><input className="form-input" value={form.era} onChange={e => setForm({ ...form, era: e.target.value })} placeholder="e.g. 12th Century" /></div>
                                <div className="form-group"><label className="form-label">Origin</label><input className="form-input" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} placeholder="e.g. Ile-Ife" /></div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={uploading}>
                                {uploading ? 'Processing & Uploading…' : (editingId ? 'Save Changes' : 'Create 3D Artefact')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Grid Listing for Museum */}
            <div className="content-grid-lg">
                {loading ? (
                    Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />)
                ) : items.length > 0 ? (
                    items.map(item => (
                        <div key={item._id} className="glass" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
                            <div style={{ height: 200, background: '#1A3A2F', position: 'relative' }}>
                                {item.previewImage ? <img src={item.previewImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🏺</div>}
                                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700 }}>3D</div>
                            </div>
                            <div style={{ padding: 20 }}>
                                <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: 12 }}>{item.category?.name || 'No collection'}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>📍 {item.annotations?.length || 0} points</span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => edit(item)}>Edit</button>
                                        <button className="btn btn-ghost btn-sm" style={{ color: '#ff4d4d' }} onClick={() => remove(item._id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>No 3D items found. Upload one above.</div>
                )}
            </div>
        </div>
    );
}
