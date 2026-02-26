'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { museumAPI, favoriteAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Environment, PerspectiveCamera } from '@react-three/drei';

function AnnotationPin({ annotation, index, onClick, active }) {
    return (
        <Html position={[annotation.position.x, annotation.position.y, annotation.position.z]} center>
            <div onClick={() => onClick(index)}
                style={{
                    width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                    background: active ? 'var(--gold)' : 'rgba(200,151,58,0.7)',
                    border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#0D0800', fontWeight: 700, fontSize: '0.75rem',
                    boxShadow: active ? '0 0 20px rgba(200,151,58,0.8)' : '0 2px 8px rgba(0,0,0,0.5)',
                    transition: 'all 0.2s', transform: active ? 'scale(1.2)' : 'scale(1)',
                    userSelect: 'none',
                }}>
                {index + 1}
            </div>
        </Html>
    );
}

function Model3D({ url, annotations, onAnnotationClick, activeAnnotation }) {
    const { scene } = useGLTF(url);
    const ref = useRef();
    useFrame(() => { if (ref.current) ref.current.rotation.y += 0.002; });
    return (
        <group ref={ref}>
            <primitive object={scene} scale={1.5} />
            {annotations.map((ann, i) => (
                <AnnotationPin key={i} annotation={ann} index={i} onClick={onAnnotationClick} active={activeAnnotation === i} />
            ))}
        </group>
    );
}

function FallbackModel({ annotations, onAnnotationClick, activeAnnotation }) {
    const ref = useRef();
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y += 0.008;
            ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });
    return (
        <group ref={ref}>
            <mesh castShadow receiveShadow>
                <torusKnotGeometry args={[0.7, 0.2, 200, 20]} />
                <meshStandardMaterial color="#C8973A" metalness={0.8} roughness={0.2} />
            </mesh>
            {annotations.map((ann, i) => (
                <AnnotationPin key={i} annotation={ann} index={i} onClick={onAnnotationClick} active={activeAnnotation === i} />
            ))}
        </group>
    );
}

export default function MuseumViewerPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeAnnotation, setActiveAnnotation] = useState(null);
    const [saved, setSaved] = useState(false);
    const [modelError, setModelError] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);

    useEffect(() => {
        museumAPI.getById(id)
            .then(d => setItem(d))
            .catch(() => router.push('/museum'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSave = async () => {
        if (!user) return toast.error('Please login to save');
        const res = await favoriteAPI.toggleMuseum(id);
        setSaved(res.saved);
        toast.success(res.saved ? 'Saved to favorites!' : 'Removed from favorites');
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', paddingTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading 3D artefact…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        </div>
    );
    if (!item) return null;

    return (
        <div style={{ paddingTop: 72, minHeight: '100vh', background: 'var(--bg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', minHeight: 'calc(100vh - 72px)', gap: 0 }}>
                {/* 3D Canvas */}
                <div style={{ position: 'relative', background: 'radial-gradient(ellipse at center, #1A3A2F 0%, #0D1B15 70%)' }}>
                    <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
                        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#C8973A" />
                        <Suspense fallback={null}>
                            <Environment preset="city" />
                            {item.modelUrl && !modelError ? (
                                <Model3D
                                    url={item.modelUrl}
                                    annotations={item.annotations || []}
                                    onAnnotationClick={setActiveAnnotation}
                                    activeAnnotation={activeAnnotation}
                                />
                            ) : (
                                <FallbackModel
                                    annotations={item.annotations || []}
                                    onAnnotationClick={setActiveAnnotation}
                                    activeAnnotation={activeAnnotation}
                                />
                            )}
                        </Suspense>
                        <OrbitControls enableDamping dampingFactor={0.08} autoRotate={autoRotate} autoRotateSpeed={0.8} />
                    </Canvas>

                    {/* Controls overlay */}
                    <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm glass" onClick={() => setAutoRotate(a => !a)}>
                            {autoRotate ? '⏸ Stop Rotation' : '▶ Auto Rotate'}
                        </button>
                    </div>

                    {/* Side help */}
                    <div style={{ position: 'absolute', top: 16, left: 16 }}>
                        <div className="glass" style={{ padding: '8px 14px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            🖱 Drag to rotate · Scroll to zoom
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div style={{ background: 'rgba(13,27,21,0.95)', borderLeft: '1px solid var(--border)', overflow: 'y-auto', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: 28, flex: 1, overflowY: 'auto' }}>
                        <Link href="/museum" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
                            ← Back to Museum
                        </Link>

                        {item.category && <span className="badge badge-gold" style={{ marginBottom: 12 }}>{item.category.name}</span>}
                        <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: '1.5rem', color: 'var(--text)', marginBottom: 8 }}>{item.title}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 20 }}>{item.description}</p>

                        {/* Metadata */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                            {[['Era', item.era], ['Origin', item.origin], ['Material', item.material], ['Dimensions', item.dimensions]].filter(([, v]) => v).map(([k, v]) => (
                                <div key={k} className="glass" style={{ padding: '10px 14px', borderRadius: 10 }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>{v}</p>
                                </div>
                            ))}
                        </div>

                        {/* Annotations Panel */}
                        {item.annotations?.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                                    Annotation Points ({item.annotations.length})
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {item.annotations.map((ann, i) => (
                                        <div key={i} onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)}
                                            className="card" style={{
                                                padding: '14px 16px', cursor: 'pointer',
                                                borderColor: activeAnnotation === i ? 'var(--gold)' : 'var(--border)',
                                                background: activeAnnotation === i ? 'rgba(200,151,58,0.08)' : 'var(--bg-card)',
                                                transform: 'none',
                                            }}>
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: activeAnnotation === i ? 'var(--gold)' : 'rgba(200,151,58,0.3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#0D0800' }}>{i + 1}</div>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 4 }}>{ann.label}</p>
                                                    {activeAnnotation === i && ann.description && (
                                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{ann.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                        <button onClick={handleSave} className={`btn btn-sm ${saved ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>
                            {saved ? '🔖 Saved' : '🔖 Save'}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @media(max-width:900px) {
          .viewer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
}
