'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { lessonAPI } from '@/lib/api';

const levels = ['beginner', 'intermediate', 'advanced'];
const cats = ['greetings', 'numbers', 'colors', 'family', 'proverbs', 'grammar', 'culture', 'misc'];
const catIcons = { greetings: '🌅', numbers: '🔢', colors: '🎨', family: '👨‍👩‍👧', proverbs: '📖', grammar: '📝', culture: '🎭', misc: '📚' };
const levelColors = { beginner: 'var(--green-light)', intermediate: 'var(--gold)', advanced: '#e74c3c' };

export default function LearnPage() {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedCat, setSelectedCat] = useState('');

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (selectedLevel) params.level = selectedLevel;
        if (selectedCat) params.category = selectedCat;
        lessonAPI.getAll(params)
            .then(d => setLessons(d.lessons || []))
            .catch(() => setLessons([]))
            .finally(() => setLoading(false));
    }, [selectedLevel, selectedCat]);

    return (
        <div style={{ paddingTop: 100, minHeight: '100vh' }}>
            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, rgba(13,27,21,0.95), rgba(26,58,47,0.5))', borderBottom: '1px solid var(--border)', padding: '60px 0 40px' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <span className="badge badge-green" style={{ marginBottom: 16 }}>🗣️ Yoruba Language</span>
                    <h1 className="section-title">Learn to Speak Yoruba</h1>
                    <div className="gold-line" style={{ margin: '12px auto 16px' }} />
                    <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto' }}>
                        Structured lessons take you from basic greetings to advanced grammar. Listen, learn, and connect with Yoruba culture.
                    </p>
                </div>
            </div>

            <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
                {/* Level filter */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                    {['', ...levels].map(l => (
                        <button key={l} onClick={() => setSelectedLevel(l)}
                            style={{
                                padding: '8px 20px', borderRadius: 50, border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                                background: selectedLevel === l ? 'var(--gold)' : 'transparent',
                                color: selectedLevel === l ? '#0D0800' : 'var(--text-muted)',
                            }}>
                            {l ? l.charAt(0).toUpperCase() + l.slice(1) : 'All Levels'}
                        </button>
                    ))}
                </div>

                {/* Category filter */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
                    {['', ...cats].map(c => (
                        <button key={c} onClick={() => setSelectedCat(c)}
                            style={{
                                padding: '6px 16px', borderRadius: 50, border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem', transition: 'all 0.2s',
                                background: selectedCat === c ? 'rgba(200,151,58,0.15)' : 'transparent',
                                color: selectedCat === c ? 'var(--gold)' : 'var(--text-muted)',
                                borderColor: selectedCat === c ? 'rgba(200,151,58,0.4)' : 'var(--border)',
                            }}>
                            {c ? `${catIcons[c] || '📚'} ${c.charAt(0).toUpperCase() + c.slice(1)}` : 'All Topics'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="content-grid">
                        {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius)' }} />)}
                    </div>
                ) : lessons.length > 0 ? (
                    <div className="content-grid">
                        {lessons.map(lesson => (
                            <Link key={lesson._id} href={`/learn/${lesson._id}`} className="card" style={{ padding: 24, textDecoration: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                    <span style={{ fontSize: '2rem' }}>{catIcons[lesson.category] || '📚'}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: levelColors[lesson.level], textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lesson.level}</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 6 }}>Lesson {lesson.lessonNumber}</p>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>{lesson.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>{lesson.description?.slice(0, 80) || 'Explore this Yoruba lesson'}…</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>📍 {lesson.phrases?.length || 0} phrases</span>
                                    <span style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600 }}>Start →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🗣️</div>
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Lessons coming soon</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Our language team is preparing structured Yoruba lessons</p>
                    </div>
                )}
            </div>
        </div>
    );
}
