'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { lessonAPI } from '@/lib/api';

export default function LessonDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activePhrase, setActivePhrase] = useState(null);

    useEffect(() => {
        lessonAPI.getById(id)
            .then(setLesson)
            .catch(() => router.push('/learn'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div style={{ paddingTop: 100, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: 800, paddingBottom: 80 }}>
                {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8, marginBottom: 16 }} />)}
            </div>
        </div>
    );
    if (!lesson) return null;

    const levelColors = { beginner: 'var(--green-light)', intermediate: 'var(--gold)', advanced: '#e74c3c' };

    return (
        <div style={{ paddingTop: 100, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: 800, paddingBottom: 80 }}>
                <Link href="/learn" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>← Back to Lessons</Link>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                    <span className="badge badge-gold">Lesson {lesson.lessonNumber}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: levelColors[lesson.level], textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center' }}>{lesson.level}</span>
                </div>

                <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--text)', marginBottom: 12 }}>{lesson.title}</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: 36, fontSize: '1.05rem', lineHeight: 1.7 }}>{lesson.description}</p>

                {/* Main content */}
                {lesson.content && (
                    <div className="glass" style={{ padding: 28, borderRadius: 'var(--radius)', marginBottom: 36 }}>
                        <div className="prose-content" dangerouslySetInnerHTML={{ __html: lesson.content }} />
                    </div>
                )}

                {/* Phrases */}
                {lesson.phrases?.length > 0 && (
                    <div>
                        <h2 style={{ fontFamily: 'Noto Serif, serif', color: 'var(--golden)', fontSize: '1.4rem', marginBottom: 20 }}>
                            <span style={{ color: 'var(--gold)' }}>📝</span> Vocabulary & Phrases
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {lesson.phrases.map((phrase, i) => (
                                <div key={i} className="card" style={{ padding: 20, cursor: 'pointer', borderColor: activePhrase === i ? 'var(--gold)' : 'var(--border)' }}
                                    onClick={() => setActivePhrase(activePhrase === i ? null : i)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>{phrase.yoruba}</p>
                                            <p style={{ fontSize: '0.95rem', color: 'var(--text)', marginBottom: phrase.pronunciation ? 4 : 0 }}>{phrase.english}</p>
                                            {phrase.pronunciation && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>/{phrase.pronunciation}/</p>}
                                        </div>
                                        {phrase.audioUrl && (
                                            <button onClick={e => { e.stopPropagation(); new Audio(phrase.audioUrl).play(); }}
                                                style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(200,151,58,0.2)', border: '1px solid var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: '1rem', flexShrink: 0 }}>
                                                ▶
                                            </button>
                                        )}
                                    </div>
                                    {activePhrase === i && phrase.example && (
                                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                <strong style={{ color: 'var(--text-dim)' }}>Example: </strong>{phrase.example}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: 40 }}>
                    <Link href="/learn" className="btn btn-outline">← Back to all lessons</Link>
                </div>
            </div>
        </div>
    );
}
