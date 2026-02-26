'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { categoryAPI, postAPI, museumAPI } from '@/lib/api';

const heroWords = ['Stories', 'Heritage', 'History', 'Oriki', 'Culture'];

export default function HomePage() {
  const [wordIdx, setWordIdx] = useState(0);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [museum, setMuseum] = useState([]);

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % heroWords.length), 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    categoryAPI.getAll().then(setCategories).catch(() => { });
    postAPI.getAll({ limit: 6, featured: true }).then(d => setPosts(d.posts || [])).catch(() => { });
    museumAPI.getAll({ limit: 4, featured: true }).then(d => setMuseum(d.items || [])).catch(() => { });
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
        <div className="orb" style={{ width: 600, height: 600, background: '#C8973A', top: -200, right: -100 }} />
        <div className="orb" style={{ width: 400, height: 400, background: '#1A3A2F', bottom: -100, left: -100 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '80px 24px' }}>
          <div className="badge badge-gold animate-fadeInUp" style={{ marginBottom: 24, display: 'inline-flex' }}>
            🌍 The Yoruba Knowledge Zone
          </div>
          <h1 className="animate-fadeInUp" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontFamily: 'Noto Serif, serif', fontWeight: 700, lineHeight: 1.1, marginBottom: 24, animationDelay: '0.1s' }}>
            Discover Yoruba{' '}
            <span style={{ color: 'var(--gold)', display: 'inline-block', minWidth: '4ch' }} key={wordIdx} className="animate-fadeIn">
              {heroWords[wordIdx]}
            </span>
          </h1>
          <p className="animate-fadeInUp" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto 40px', animationDelay: '0.2s' }}>
            News, histories, folk tales, kings, virtual 3D museum, oriki and Yoruba language learning — all in one place.
          </p>
          <div className="animate-fadeInUp" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }}>
            <Link href="/auth/register" className="btn btn-primary btn-lg">Start Exploring Free</Link>
            <Link href="/museum" className="btn btn-outline btn-lg">View 3D Museum</Link>
          </div>

          {/* Stats */}
          <div className="animate-fadeInUp" style={{ display: 'flex', gap: 48, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap', animationDelay: '0.4s' }}>
            {[['500+', 'Stories & Articles'], ['50+', '3D Artifacts'], ['1000+', 'Cultural Records'], ['20+', 'Yoruba Lessons']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold)' }}>{n}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="page-section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>From ancient histories to modern news — explore every facet of Yoruba life</p>
            <div className="gold-line" style={{ margin: '16px auto 0' }} />
          </div>

          {categories.length > 0 ? (
            <div className="content-grid">
              {categories.map(cat => (
                <Link key={cat._id} href={`/explore?category=${cat._id}`} className="card" style={{ padding: 28, cursor: 'pointer', textDecoration: 'none' }}>
                  <div style={{ fontSize: 2.5 + 'rem', marginBottom: 16 }}>{cat.icon || '📚'}</div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: 8 }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{cat.description || 'Explore this category'}</p>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600 }}>
                    Explore →
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // Placeholder static categories used before DB is seeded
            <div className="content-grid">
              {[
                { icon: '📰', name: 'Yoruba News', desc: 'Latest news from Yorubaland and the diaspora' },
                { icon: '📖', name: 'Stories & Heritage', desc: 'Rich stories and cultural heritage passed down through generations' },
                { icon: '👑', name: 'Kings & Rulers', desc: 'History of Obas, Ewi, and great Yoruba rulers' },
                { icon: '🌿', name: 'Folk Tales', desc: 'Traditional Yoruba fables, proverbs, and oral literature' },
                { icon: '🎙️', name: 'Oriki', desc: 'Praise poetry, ancestral chants and family oriki' },
                { icon: '🏛️', name: 'History', desc: 'Ancient and modern history of Yoruba civilisation' },
              ].map(c => (
                <Link key={c.name} href={`/explore?search=${c.name}`} className="card" style={{ padding: 28, cursor: 'pointer', textDecoration: 'none' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{c.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: 8 }}>{c.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.desc}</p>
                  <div style={{ marginTop: 16, color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600 }}>Explore →</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Posts ── */}
      {posts.length > 0 && (
        <section className="page-section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 className="section-title">Featured Stories</h2>
                <div className="gold-line" />
              </div>
              <Link href="/explore" className="btn btn-outline">View All</Link>
            </div>
            <div className="content-grid">
              {posts.map(post => (
                <Link key={post._id} href={`/post/${post._id}`} className="card" style={{ textDecoration: 'none' }}>
                  {post.coverImage && (
                    <div style={{ height: 180, overflow: 'hidden' }}>
                      <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.target.style.transform = 'scale(1)'}
                      />
                    </div>
                  )}
                  <div style={{ padding: 20 }}>
                    {post.category && <span className="badge badge-gold" style={{ marginBottom: 10 }}>{post.category.name}</span>}
                    <h3 style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>{post.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{post.excerpt || post.body?.replace(/<[^>]+>/g, '').slice(0, 100)}...</p>
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{post.readTime} min read</span>
                      <span style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600 }}>Read →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Virtual Museum Teaser ── */}
      <section className="page-section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60, alignItems: 'center' }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: 16 }}>🏛️ Virtual Museum</span>
              <h2 className="section-title" style={{ marginBottom: 16 }}>Explore 3D Yoruba Artefacts</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.8 }}>
                Step into our immersive 3D virtual museum — high-resolution artifacts with annotation hotspots explaining historical context, just like Sketchfab.
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.8 }}>
                Rotate, zoom, and explore ancient Yoruba objects from the comfort of your device.
              </p>
              <Link href="/museum" className="btn btn-primary">Explore Museum</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {museum.length > 0 ? museum.slice(0, 4).map(item => (
                <Link key={item._id} href={`/museum/${item._id}`} className="card" style={{ textDecoration: 'none', aspectRatio: '1', overflow: 'hidden' }}>
                  <img src={item.previewImage || '/placeholder-3d.jpg'} alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ padding: '8px 10px', background: 'rgba(13,27,21,0.9)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                  </div>
                </Link>
              )) : ['Crown', 'Drum', 'Mask', 'Bronze'].map(n => (
                <div key={n} className="card" style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ fontSize: '2.5rem' }}>🏺</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Language Learning ── */}
      <section className="page-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>Learn the Yoruba Language</h2>
          <div className="gold-line" style={{ margin: '0 auto 20px' }} />
          <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 40px' }}>
            From greetings and numbers to proverbs and grammar — our structured lessons make learning Yoruba accessible.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
            {[['🌅', 'Greetings'], ['🔢', 'Numbers'], ['🎨', 'Colors'], ['👨‍👩‍👧', 'Family'], ['📖', 'Proverbs'], ['📝', 'Grammar']].map(([icon, name]) => (
              <div key={name} className="card" style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{icon}</div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{name}</p>
              </div>
            ))}
          </div>
          <Link href="/learn" className="btn btn-outline">Start Learning →</Link>
        </div>
      </section>

      {/* ── Pricing CTA ── */}
      <section className="page-section" style={{ background: 'linear-gradient(135deg, rgba(200,151,58,0.1), rgba(26,58,47,0.3))' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>Join the Yoruba Knowledge Community</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto 40px' }}>
            Subscribe for $20/month and unlock full access — like, save favorites, explore 3D artifacts, and support the preservation of Yoruba culture.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/pricing" className="btn btn-primary btn-lg">View Plans</Link>
            <Link href="/auth/register" className="btn btn-outline btn-lg">Register Free</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
