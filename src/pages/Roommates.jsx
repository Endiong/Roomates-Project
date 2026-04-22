import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { roommates, roommateThemes } from '../data/roommates';

const ROTATIONS = [-1.5, 2, -2, 1, -1, 2.5];

const WASHI_STYLES = [
  { top: '-0.6rem', left: '50%', transform: 'translateX(-50%) rotate(-2deg)', bg: 'rgba(185,238,219,0.75)' },
  { top: '-0.5rem', right: '0.75rem', transform: 'rotate(8deg)', bg: 'rgba(250,211,253,0.7)' },
  { top: '-0.5rem', left: '1rem', transform: 'rotate(-10deg)', bg: 'rgba(226,209,188,0.65)' },
  { top: '-0.6rem', left: '35%', transform: 'rotate(5deg)', bg: 'rgba(185,238,219,0.65)' },
  { top: '-0.5rem', left: '2rem', transform: 'rotate(-14deg)', bg: 'rgba(250,211,253,0.65)' },
  { top: '-0.5rem', right: '1.5rem', transform: 'rotate(11deg)', bg: 'rgba(248,246,195,0.85)' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function Roommates() {
  return (
    <div style={{
      background: '#fffbff',
      backgroundImage: 'radial-gradient(#bdbb92 0.5px, transparent 0.5px)',
      backgroundSize: '22px 22px',
      minHeight: '100vh',
    }}>

      {/* ─── HEADER ─── */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem 2rem',
          maxWidth: '52rem',
          margin: '0 auto',
        }}
      >
        {/* Washi accent */}
        <div style={{
          height: '6px',
          background: 'linear-gradient(90deg, rgba(185,238,219,0.7) 0%, rgba(226,209,188,0.7) 25%, rgba(250,211,253,0.7) 50%, rgba(248,246,195,0.9) 75%, rgba(185,238,219,0.5) 100%)',
          borderRadius: '3px',
          maxWidth: '8rem',
          margin: '0 auto 1.25rem',
        }} />

        <h1 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
          fontWeight: 900,
          color: 'var(--primary)',
          letterSpacing: '-0.04em',
          marginBottom: '0.6rem',
          lineHeight: 1,
        }}>
          Meet the Girlies
        </h1>
        <div style={{
          display: 'inline-block',
          background: 'var(--primary-container)',
          color: 'var(--on-primary-container)',
          fontFamily: 'var(--font-label)',
          fontWeight: 700,
          fontSize: '0.65rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          padding: '0.25rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          marginBottom: '0.85rem',
        }}>
          6 Pretty Girlies
        </div>
        <p style={{
          fontFamily: 'var(--font-handwritten)',
          fontSize: '1.1rem',
          color: 'var(--on-surface-variant)',
          maxWidth: '22rem',
          margin: '0 auto',
          lineHeight: 1.5,
          transform: 'rotate(-0.5deg)',
        }}>
          Six curators. One shared story. Enough energy to power a small city.
        </p>
      </motion.div>

      {/* ─── GRID — 3 columns on desktop, 2 on mobile ─── */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="roommates-grid"
        style={{
          maxWidth: '48rem',
          margin: '0 auto',
          padding: '0 1.25rem 5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '3rem 1.5rem',
          alignItems: 'start',
        }}
      >
        {roommates.map((roommate, i) => {
          const theme = roommateThemes[roommate.id];
          const washi = WASHI_STYLES[i];
          const isOffset = i % 3 === 1; // middle column staggered down

          return (
            <motion.div
              key={roommate.id}
              variants={fadeUp}
              whileHover={{ y: -8, rotate: 0, transition: { duration: 0.28 } }}
              style={{
                transform: `rotate(${ROTATIONS[i]}deg)`,
                position: 'relative',
                marginTop: isOffset ? '2rem' : '0',
                cursor: 'pointer',
              }}
              className="roomie-card-wrapper"
            >
              <Link to={`/profile/${roommate.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  background: 'var(--surface-container-lowest)',
                  padding: '0.6rem 0.6rem 2.25rem',
                  boxShadow: '0 8px 28px -4px rgba(57,57,27,0.13)',
                  position: 'relative',
                  overflow: 'visible',
                  transition: 'box-shadow 0.3s ease',
                }}>
                  {/* Washi tape */}
                  <div style={{
                    position: 'absolute',
                    width: '3.75rem',
                    height: '1rem',
                    background: washi.bg,
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.12) 5px, rgba(255,255,255,0.12) 10px)',
                    top: washi.top,
                    left: washi.left,
                    right: washi.right,
                    transform: washi.transform,
                    zIndex: 10,
                  }} />

                  {/* Photo */}
                  <div style={{
                    aspectRatio: '3/4',
                    overflow: 'hidden',
                    background: `${theme.accentContainer}55`,
                  }}>
                    <img
                      src={roommate.avatar}
                      alt={roommate.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.45s ease',
                        display: 'block',
                      }}
                      className="roomie-img"
                    />
                  </div>

                  {/* Info strip */}
                  <div style={{ padding: '0.5rem 0.3rem 0', textAlign: 'center' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '1.05rem',
                      color: theme.accentColor,
                      marginBottom: '0.05rem',
                      textAlign: 'center',
                    }}>
                      {roommate.name} {roommate.emoji}
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.09em',
                      color: 'var(--on-surface-variant)',
                      marginBottom: '0.35rem',
                      textAlign: 'center',
                    }}>
                      {roommate.tagline}
                    </p>
                    <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <span style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                        background: `${theme.accentColor}18`,
                        color: theme.accentColor,
                        fontFamily: 'var(--font-label)',
                        fontWeight: 700,
                        fontSize: '0.58rem',
                        border: `1px solid ${theme.accentColor}2a`,
                      }}>{roommate.mbti}</span>
                      {roommate.traits.slice(0, 1).map(t => (
                        <span key={t} style={{
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--surface-container)',
                          color: 'var(--on-surface-variant)',
                          fontFamily: 'var(--font-label)',
                          fontWeight: 600,
                          fontSize: '0.58rem',
                        }}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div
                    className="roomie-overlay"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `${theme.accentColor}e8`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      opacity: 0,
                      transition: 'opacity 0.28s ease',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.75rem', color: 'white', fontVariationSettings: "'FILL' 1" }}>
                      {roommate.icon}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      color: 'white',
                      letterSpacing: '0.04em',
                    }}>
                      Open Profile →
                    </span>
                  </div>

                  {/* Corner icon */}
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute',
                    bottom: '0.35rem',
                    right: '0.55rem',
                    fontSize: '1.25rem',
                    color: theme.accentContainer,
                    transform: 'rotate(12deg)',
                    fontVariationSettings: "'FILL' 1",
                  }}>
                    {roommate.icon}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      <style>{`
        .roomie-card-wrapper:hover .roomie-overlay { opacity: 1 !important; }
        .roomie-card-wrapper:hover .roomie-img { transform: scale(1.06); }
        @media (max-width: 760px) {
          .roomie-card-wrapper { margin-top: 0 !important; transform: none !important; }
          .roommates-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 2.5rem 1rem !important; padding: 0 1rem 4rem !important; }
        }
        @media (max-width: 480px) {
          .roommates-grid { gap: 2rem 0.75rem !important; }
        }
      `}</style>
    </div>
  );
}
