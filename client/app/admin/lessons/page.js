'use client';
import { useState, useEffect } from 'react';
import { lessonAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function AdminLessonsPage() {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        title: '', description: '', content: '',
        level: 'beginner', category: 'greetings', lessonNumber: 1,
        phrases: []
    });

    const load = () => {
        setLoading(true);
        lessonAPI.getAll()
            .then(d => setLessons(d.lessons || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const addPhrase = () => {
        setForm({ ...form, phrases: [...form.phrases, { yoruba: '', english: '', pronunciation: '', example: '', audioUrl: '' }] });
    };

    const updatePhrase = (idx, field, val) => {
        const ph = [...form.phrases];
        ph[idx][field] = val;
        setForm({ ...form, phrases: ph });
    };

    const removePhrase = (idx) => {
        setForm({ ...form, phrases: form.phrases.filter((_, i) => i !== idx) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await lessonAPI.update(editingId, form);
                toast.success('Lesson updated');
            } else {
                await lessonAPI.create(form);
                toast.success('Lesson created');
            }
            resetForm();
            load();
        } catch (err) { toast.error(err.message); }
    };

    const resetForm = () => {
        setForm({ title: '', description: '', content: '', level: 'beginner', category: 'greetings', lessonNumber: 1, phrases: [] });
        setEditingId(null);
        setShowForm(false);
    };

    const edit = (l) => {
        setForm({
            title: l.title,
            description: l.description || '',
            content: l.content || '',
            level: l.level,
            category: l.category || 'greetings',
            lessonNumber: l.lessonNumber,
            phrases: l.phrases || []
        });
        setEditingId(l._id);
        setShowForm(true);
    };

    const remove = async (id) => {
        if (!confirm('Delete this lesson?')) return;
        try {
            await lessonAPI.delete(id);
            toast.success('Lesson deleted');
            load();
        } catch (err) { toast.error(err.message); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.8rem', color: '#fff', marginBottom: 6 }}>Yoruba Lessons Management</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Create structured language lessons and vocabulary</p>
                </div>
                <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
                    {showForm ? '✕ Close Editor' : '+ Create New Lesson'}
                </button>
            </div>

            {showForm && (
                <div className="glass" style={{ padding: 32, borderRadius: 16, marginBottom: 40, animation: 'fadeInUp 0.3s ease' }}>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--gold)', fontWeight: 700, marginBottom: 24 }}>{editingId ? 'Edit Lesson' : 'New Yoruba Lesson'}</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 20 }}>
                                <div className="form-group">
                                    <label className="form-label">Lesson Title</label>
                                    <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Basic Greetings" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Number</label>
                                    <input className="form-input" type="number" value={form.lessonNumber} onChange={e => setForm({ ...form, lessonNumber: Number(e.target.value) })} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Lesson Description</label>
                                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What will students learn in this lesson?…" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Introduction Content</label>
                                <div style={{ background: '#fff', color: '#000', borderRadius: 8, overflow: 'hidden' }}>
                                    <ReactQuill theme="snow" value={form.content} onChange={val => setForm({ ...form, content: val })} style={{ height: 250 }} />
                                </div>
                                <div style={{ height: 42 }}></div>
                            </div>

                            {/* Phrases */}
                            <div style={{ marginTop: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>Vocabulary & Phrases</h3>
                                    <button type="button" onClick={addPhrase} className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}>+ Add Phrase</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {form.phrases.map((ph, i) => (
                                        <div key={i} className="glass" style={{ padding: 20, borderRadius: 12, background: 'rgba(255,255,255,0.03)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                                <span style={{ fontWeight: 700, color: 'var(--gold)' }}>Phrase #{i + 1}</span>
                                                <button type="button" onClick={() => removePhrase(i)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                                <input className="form-input" placeholder="Yoruba" value={ph.yoruba} onChange={e => updatePhrase(i, 'yoruba', e.target.value)} />
                                                <input className="form-input" placeholder="English Translation" value={ph.english} onChange={e => updatePhrase(i, 'english', e.target.value)} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                <input className="form-input" placeholder="Pronunciation (e.g. ay-kwa-bah)" value={ph.pronunciation} onChange={e => updatePhrase(i, 'pronunciation', e.target.value)} />
                                                <input className="form-input" placeholder="Audio URL (Cloudinary link)" value={ph.audioUrl} onChange={e => updatePhrase(i, 'audioUrl', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="form-group">
                                <label className="form-label">Level</label>
                                <select className="form-select" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Topic / Category</label>
                                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    <option value="greetings">Greetings</option>
                                    <option value="numbers">Numbers</option>
                                    <option value="colors">Colors</option>
                                    <option value="family">Family</option>
                                    <option value="proverbs">Proverbs</option>
                                    <option value="grammar">Grammar</option>
                                    <option value="culture">Culture</option>
                                </select>
                            </div>

                            <div style={{ padding: '16px', borderRadius: 10, background: 'rgba(200,151,58,0.05)', border: '1px solid rgba(200,151,58,0.2)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    💡 <strong>Pro Tip:</strong> Add pronunciation guides and examples to help students master the tonal nature of Yoruba.
                                </p>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}>
                                {editingId ? 'Save Changes' : 'Create Lesson'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Listing */}
            <div className="content-grid">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />)
                ) : lessons.length > 0 ? (
                    lessons.map(l => (
                        <div key={l._id} className="glass" style={{ padding: 24, borderRadius: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span className="badge badge-gold">Lesson {l.lessonNumber}</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: l.level === 'beginner' ? 'var(--green-light)' : 'var(--gold)', textTransform: 'uppercase' }}>{l.level}</span>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 8 }}>{l.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 20 }}>{l.description?.slice(0, 100)}…</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>📝 {l.phrases?.length || 0} vocabulary words</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-outline btn-sm" onClick={() => edit(l)}>Edit</button>
                                    <button className="btn btn-ghost btn-sm" style={{ color: '#ff4d4d' }} onClick={() => remove(l._id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>No lessons created yet.</div>
                )}
            </div>
        </div>
    );
}
