import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { roommates, groupMemories, timeline, groupStats } from '../data/roommates';

// ── Reusable animated block ───────────────────────────────────────
const Reveal = ({ children, delay = 0, direction = 'up', className, style }) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
      scale: direction === 'scale' ? 0.88 : 1,
    },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// ── Marquee ticker ─────────────────────────────────────────────────
const TICKER_ITEMS = [
  'Clockk It! ✦',
  'Six Girlies ✦',
  'One Room ✦',
  'Endless Memories ✦',
  'Room 3 Energy ✦',
  'The Chaos & The Love ✦',
  'Est. 2026 ✦',
];

function Ticker({ reverse = false }) {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
      <motion.div
        animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
        style={{ display: 'inline-block' }}
      >
        {items.map((item, i) => (
          <span key={i} style={{
            display: 'inline-block',
            marginRight: '2.5rem',
            fontFamily: 'var(--font-label)',
            fontWeight: 700,
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: reverse ? 'var(--secondary)' : 'var(--primary)',
            opacity: 0.75,
          }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Floating polaroid on hero ─────────────────────────────────────
function FloatingPolaroid({ src, caption, style, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: style.rotate || 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 20, transition: { duration: 0.3 } }}
      style={{
        background: 'white',
        padding: '0.5rem 0.5rem 2rem',
        boxShadow: '0 16px 40px rgba(57,57,27,0.14)',
        position: 'absolute',
        cursor: 'pointer',
        ...style,
      }}
    >
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <img src={src} alt={caption} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <p style={{
        position: 'absolute',
        bottom: '0.3rem',
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: 'var(--font-handwritten)',
        fontSize: '0.85rem',
        color: 'var(--on-surface-variant)',
      }}>{caption}</p>
    </motion.div>
  );
}

// ── Section divider: washi tape strip ─────────────────────────────
function WashiDivider() {
  return (
    <div style={{
      height: '8px',
      background: 'linear-gradient(90deg, rgba(185,238,219,0.6) 0%, rgba(226,209,188,0.7) 30%, rgba(250,211,253,0.65) 60%, rgba(248,246,195,0.85) 80%, rgba(185,238,219,0.5) 100%)',
      margin: '0',
    }} />
  );
}

// ── Memory card (photo polaroid) ──────────────────────────────────
function MemoryCard({ mem, i }) {
  return (
    <Reveal delay={i * 0.07} direction="up">
      <motion.div
        whileHover={{ y: -6, rotate: 0, transition: { duration: 0.25 } }}
        style={{
          background: 'white',
          padding: '0.55rem 0.55rem 2.25rem',
          boxShadow: '0 8px 24px rgba(57,57,27,0.1)',
          transform: `rotate(${mem.rotation}deg)`,
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        {/* Washi tape */}
        <div style={{
          position: 'absolute',
          top: '-0.5rem',
          left: '50%',
          transform: 'translateX(-50%) rotate(-3deg)',
          width: '3.25rem',
          height: '0.85rem',
          background: ['rgba(185,238,219,0.75)', 'rgba(250,211,253,0.7)', 'rgba(226,209,188,0.7)', 'rgba(248,246,195,0.85)', 'rgba(185,238,219,0.6)', 'rgba(250,211,253,0.65)'][i % 6],
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.15) 5px, rgba(255,255,255,0.15) 10px)',
          zIndex: 10,
        }} />
        <img src={mem.img} alt={mem.caption} style={{ width: '100%', height: '9rem', objectFit: 'cover', display: 'block', marginBottom: '0.4rem' }} />
        <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '0.875rem', textAlign: 'center', color: 'var(--on-surface)' }}>{mem.caption}</p>
        <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', color: 'var(--outline)', marginTop: '0.1rem' }}>by {mem.author}</p>
      </motion.div>
    </Reveal>
  );
}

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const [avatarModal, setAvatarModal] = useState(null); // holds the roommate object

  return (
    <div style={{ background: 'var(--background)', overflow: 'hidden' }}>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── SECTION 1: HERO ─── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          minHeight: '100vh',
          background: 'var(--background)',
          backgroundImage: 'radial-gradient(#bdbb92 0.5px, transparent 0.5px)',
          backgroundSize: '22px 22px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '5rem 1.5rem 4rem',
        }}
      >
        {/* Soft background blobs */}
        <motion.div style={{ y: heroY, opacity: heroOpacity, position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '5%', left: '-8%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'rgba(185,238,219,0.2)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '15%', right: '-5%', width: '28vw', height: '28vw', borderRadius: '50%', background: 'rgba(250,211,253,0.18)', filter: 'blur(70px)' }} />
          <div style={{ position: 'absolute', top: '40%', right: '20%', width: '18vw', height: '18vw', borderRadius: '50%', background: 'rgba(226,209,188,0.16)', filter: 'blur(50px)' }} />
        </motion.div>

        {/* Floating polaroids */}
        <FloatingPolaroid src={groupMemories[0].img} caption={groupMemories[0].caption} delay={0.3} style={{ width: '10rem', height: '10rem', top: '12%', left: '4%', rotate: '-8deg', zIndex: 5 }} />
        <FloatingPolaroid src={groupMemories[4].img} caption={groupMemories[4].caption} delay={0.45} style={{ width: '9rem', height: '9rem', top: '10%', right: '5%', rotate: '6deg', zIndex: 5 }} />
        <FloatingPolaroid src={groupMemories[2].img} caption={groupMemories[2].caption} delay={0.55} style={{ width: '8.5rem', height: '8.5rem', bottom: '12%', left: '6%', rotate: '5deg', zIndex: 5 }} />
        <FloatingPolaroid src={groupMemories[5].img} caption={groupMemories[5].caption} delay={0.5} style={{ width: '9rem', height: '9rem', bottom: '15%', right: '4%', rotate: '-6deg', zIndex: 5 }} />

        {/* Central content */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, maxWidth: '38rem' }}>
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-container)',
              color: 'var(--on-primary-container)',
              fontFamily: 'var(--font-label)',
              fontWeight: 800,
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.85rem', fontVariationSettings: "'FILL' 1" }}>photo_album</span>
              Est. 2026 · Clockk It!
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 900,
              fontSize: 'clamp(2.75rem, 8vw, 5.5rem)',
              letterSpacing: '-0.05em',
              color: 'var(--primary)',
              lineHeight: 0.95,
              marginBottom: '1.25rem',
            }}
          >
            Clockk It!
          </motion.h1>

          {/* Handwritten subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20, rotate: -1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{
              fontFamily: 'var(--font-handwritten)',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              color: 'var(--on-surface-variant)',
              marginBottom: '0.75rem',
              transform: 'rotate(-0.75deg)',
            }}
          >
            Six people. One chaotic, beautiful room.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: 'var(--on-surface-variant)',
              maxWidth: '25rem',
              margin: '0 auto 2rem',
              lineHeight: 1.7,
              opacity: 0.8,
            }}
          >
            This is our digital scrapbook — full of memories, inside jokes, and the kind of love that only comes from sharing one hostel room.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/roommates" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.75rem 1.75rem',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(129,90,91,0.3)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(129,90,91,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(129,90,91,0.3)'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>group</span>
              View All Profiles
            </Link>
            <Link to="/memories" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(255,255,255,0.7)',
              color: 'var(--on-surface)',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-headline)',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              border: '1.5px solid rgba(189,187,146,0.4)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>photo_library</span>
              Our Memories
            </Link>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--outline)', opacity: 0.5 }}>arrow_downward</span>
            </motion.div>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--outline)', opacity: 0.45 }}>Scroll to explore</span>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── TICKER ─── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div style={{ background: 'var(--primary-container)', padding: '0.6rem 0', overflow: 'hidden' }}>
        <Ticker />
      </div>
      <WashiDivider />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── SECTION 2: BENTO INTRO ─── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '72rem', margin: '0 auto' }}>
        <Reveal direction="up">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-surface-variant)', marginBottom: '0.5rem', opacity: 0.6 }}>Welcome to the archive</p>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-0.04em', color: 'var(--primary)', lineHeight: 1 }}>
              Clockk It!
            </h2>
            <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.15rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem', transform: 'rotate(-0.5deg)' }}>
              A living, breathing scrapbook of six very different people.
            </p>
          </div>
        </Reveal>

        {/* Stats Bento */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {groupStats.map((s, i) => (
            <Reveal key={i} delay={i * 0.08} direction="scale">
              <div style={{
                background: ['var(--primary-container)', 'var(--secondary-container)', 'var(--tertiary-container)', 'var(--surface-container-high)'][i],
                padding: '1.25rem 1rem',
                borderRadius: '0.5rem',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(57,57,27,0.06)',
              }}>
                <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '2rem', color: ['var(--primary)', 'var(--secondary)', 'var(--tertiary)', 'var(--primary)'][i], lineHeight: 1, marginBottom: '0.25rem' }}>
                  {s.value}
                </p>
                <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Feature Bento: 3 col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '1rem' }}>
          {/* Card A — large intro card */}
          <Reveal direction="left">
            <div style={{
              background: 'var(--surface-container)',
              padding: '2rem',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 20px rgba(57,57,27,0.07)',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}>
              <div style={{ position: 'absolute', inset: 0 }}>
                <img src={groupMemories[1].img} alt="group" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(255,251,255,1) 30%, transparent 80%)' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--primary)', fontVariationSettings: "'FILL' 1", marginBottom: '0.5rem', display: 'block' }}>home_heart</span>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                  One Room. Six Lives.
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                  Shared space, shared stories, shared chaos. Welcome to the place we call home.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Card B */}
          <Reveal direction="up" delay={0.08}>
            <div style={{ background: 'var(--primary)', padding: '1.75rem', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.8)', fontVariationSettings: "'FILL' 1" }}>photo_library</span>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.1rem', color: 'white', lineHeight: 1.2 }}>Shared Memories</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                Fries on Valentine's Day, every late-night laugh, and the times we played Hidden Santa.
              </p>
              <Link to="/memories" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.8rem', color: 'white', textDecoration: 'none', marginTop: 'auto' }}>
                Open the Album <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
              </Link>
            </div>
          </Reveal>

          {/* Card C */}
          <Reveal direction="up" delay={0.16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--secondary-container)', padding: '1.25rem', borderRadius: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: 'var(--secondary)', fontVariationSettings: "'FILL' 1", marginBottom: '0.35rem', display: 'block' }}>sports_esports</span>
                <h4 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--secondary)', marginBottom: '0.2rem' }}>Game Night</h4>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Test your roomie knowledge with 4 games.</p>
                <Link to="/games" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--secondary)', textDecoration: 'none', marginTop: '0.4rem' }}>
                  Play Now <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>arrow_forward</span>
                </Link>
              </div>
              <div style={{ background: 'var(--tertiary-container)', padding: '1.25rem', borderRadius: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: 'var(--tertiary)', fontVariationSettings: "'FILL' 1", marginBottom: '0.35rem', display: 'block' }}>lock</span>
                <h4 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--tertiary)', marginBottom: '0.2rem' }}>Your Page</h4>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Sign in to update your profile and add memories.</p>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--tertiary)', textDecoration: 'none', marginTop: '0.4rem' }}>
                  Sign In <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>arrow_forward</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── TICKER 2 (reverse) ─── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div style={{ background: 'rgba(185,238,219,0.2)', padding: '0.5rem 0', overflow: 'hidden', borderTop: '1px solid rgba(185,238,219,0.4)', borderBottom: '1px solid rgba(185,238,219,0.4)' }}>
        <Ticker reverse />
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── SECTION 3: ROOMIE PREVIEW ─── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--surface-container-low)', backgroundImage: 'radial-gradient(rgba(189,187,146,0.3) 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <Reveal direction="up">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2.5rem', gap: '1rem' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-surface-variant)', opacity: 0.6, marginBottom: '0.35rem' }}>The People</p>
                <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', letterSpacing: '-0.04em', color: 'var(--primary)', lineHeight: 1 }}>
                  Meet the Roomies
                </h2>
              </div>
              <Link to="/roommates" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)', border: '1.5px solid rgba(129,90,91,0.25)' }}>
                All 6 Profiles <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
              </Link>
            </div>
          </Reveal>

          {/* Scroll-snap roomie polaroid strip */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            overflowX: 'auto',
            padding: '1rem 0.25rem 2rem',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
          }}>
            {roommates.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.07} direction="up">
                {/* No Link wrapper — opens avatar lightbox instead */}
                <button
                  onClick={() => setAvatarModal(r)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    display: 'block',
                  }}
                >
                  <motion.div
                    whileHover={{ y: -8, rotate: 0, transition: { duration: 0.25 } }}
                    style={{
                      background: 'white',
                      padding: '0.5rem 0.5rem 2.5rem',
                      boxShadow: '0 8px 24px rgba(57,57,27,0.1)',
                      transform: `rotate(${[-2, 2, -1.5, 1.5, -2.5, 2][i]}deg)`,
                      width: '9rem',
                      position: 'relative',
                    }}
                  >
                    <img src={r.avatar} alt={r.name} style={{ width: '100%', height: '9rem', objectFit: 'cover', display: 'block' }} />
                    <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1rem', textAlign: 'center', color: 'var(--primary)', marginTop: '0.35rem' }}>{r.name}</p>
                    <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', color: 'var(--outline)', marginTop: '0.1rem' }}>{r.tagline}</p>
                  </motion.div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Avatar lightbox modal */}
      <AnimatePresence>
        {avatarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAvatarModal(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              cursor: 'zoom-out',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white',
                padding: '1.25rem 1.25rem 2.5rem',
                boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
                maxWidth: '22rem',
                width: '100%',
                position: 'relative',
                cursor: 'default',
              }}
            >
              {/* Washi tape strip */}
              <div style={{ position: 'absolute', top: '-0.6rem', left: '50%', transform: 'translateX(-50%) rotate(-2deg)', width: '5rem', height: '1.1rem', background: 'rgba(185,238,219,0.75)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)' }} />
              <img
                src={avatarModal.avatar}
                alt={avatarModal.name}
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', marginBottom: '0.75rem' }}
              />
              <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.75rem', textAlign: 'center', color: 'var(--primary)', marginBottom: '0.2rem' }}>{avatarModal.name}</p>
              <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', color: 'var(--outline)', marginBottom: '0.75rem' }}>{avatarModal.tagline}</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Link
                  to={`/profile/${avatarModal.id}`}
                  onClick={() => setAvatarModal(null)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-full)',
                    background: 'var(--primary)', color: 'white',
                    fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.8rem',
                    textDecoration: 'none',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>person</span>
                  View Profile
                </Link>
                <button
                  onClick={() => setAvatarModal(null)}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)',
                    background: 'transparent', border: '1.5px solid rgba(189,187,146,0.4)',
                    fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.8rem',
                    color: 'var(--on-surface-variant)', cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── SECTION 4: MEMORIES WALL PREVIEW ─── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <Reveal direction="up">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-surface-variant)', opacity: 0.6, marginBottom: '0.35rem' }}>From the scrapbook</p>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', letterSpacing: '-0.04em', color: 'var(--primary)', lineHeight: 1 }}>
                Core Memories
              </h2>
              <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.1rem', color: 'var(--on-surface-variant)', marginTop: '0.35rem', transform: 'rotate(-0.75deg)' }}>
                A few favourites from the wall...
              </p>
            </div>
          </Reveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}>
            {groupMemories.map((mem, i) => <MemoryCard key={mem.id} mem={mem} i={i} />)}
          </div>

          <Reveal direction="up" delay={0.2}>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link to="/memories" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.75rem 2rem',
                background: 'var(--surface-container)',
                border: '1.5px solid rgba(189,187,146,0.4)',
                color: 'var(--on-surface)',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>photo_library</span>
                View Full Album
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── SECTION 5: TIMELINE ─── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--surface-container-low)', borderTop: '1px solid rgba(189,187,146,0.2)', borderBottom: '1px solid rgba(189,187,146,0.2)' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <Reveal direction="up">
            <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', letterSpacing: '-0.04em', color: 'var(--primary)', marginBottom: '2.5rem', textAlign: 'center', lineHeight: 1 }}>
              The Timeline
            </h2>
          </Reveal>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem' }}>
            <div style={{ position: 'relative', display: 'flex', flexWrap: 'nowrap', gap: '1.5rem', minWidth: 'max-content', paddingTop: '1rem' }}>
              {/* Horizontal line */}
              <div style={{ position: 'absolute', top: '1.5rem', left: 0, right: 0, height: '2px', background: 'rgba(189,187,146,0.35)', transform: 'translateX(-50%)' }} />

              {timeline.map((item, i) => (
                <div key={i} style={{ width: '10rem', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  {/* Dot */}
                  <div style={{
                    width: '1rem', height: '1rem', borderRadius: '50%',
                    background: item.dotColor, border: '3px solid white',
                    boxShadow: `0 0 0 3px ${item.dotColor}44`, marginBottom: '0.75rem',
                    position: 'relative',
                  }}>
                    {item.pulse && (
                      <motion.div
                        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', background: item.dotColor, opacity: 0.4 }}
                      />
                    )}
                  </div>
                  <div style={{ background: 'var(--surface-container-lowest)', padding: '0.65rem 0.85rem', boxShadow: '0 4px 16px rgba(57,57,27,0.08)' }}>
                    <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: item.dotColor, marginBottom: '0.2rem' }}>{item.date}</p>
                    <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '0.95rem', color: 'var(--on-surface)', lineHeight: 1.4 }}>{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── SECTION 6: CTA CLOSE ─── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <Reveal direction="scale">
          <div style={{
            display: 'inline-block',
            background: 'var(--primary-container)',
            padding: '3rem 2.5rem',
            maxWidth: '36rem',
            width: '100%',
            position: 'relative',
          }}>
            {/* Tape corners */}
            <div style={{ position: 'absolute', top: '-0.5rem', left: '-0.75rem', width: '5rem', height: '1.25rem', background: 'rgba(250,211,253,0.7)', transform: 'rotate(-15deg)' }} />
            <div style={{ position: 'absolute', bottom: '-0.5rem', right: '-0.75rem', width: '5rem', height: '1.25rem', background: 'rgba(185,238,219,0.7)', transform: 'rotate(-15deg)' }} />

            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-primary-container)', opacity: 0.6, marginBottom: '0.75rem' }}>
              Clockk It!
            </p>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.04em', color: 'var(--primary)', marginBottom: '0.75rem', lineHeight: 1.1 }}>
              You are here. We are here. <br />This is Room 3.
            </h2>
            <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.15rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem', transform: 'rotate(-0.5deg)' }}>
              — The Clockk It! Girlies
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/roommates" style={{ padding: '0.65rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                Meet the Girlies
              </Link>
              <Link to="/games" style={{ padding: '0.65rem 1.5rem', background: 'rgba(255,255,255,0.6)', color: 'var(--on-surface)', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', border: '1.5px solid rgba(189,187,146,0.4)' }}>
                Games
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
