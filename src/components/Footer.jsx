export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(189,187,146,0.25)',
      background: 'var(--background)',
      padding: '1.25rem 2rem',
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontFamily: 'var(--font-headline)',
            fontWeight: 900,
            fontSize: '0.9rem',
            letterSpacing: '-0.03em',
            color: 'var(--primary)',
          }}>
            Clockk It!
          </span>
          <span style={{
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: 'var(--outline-variant)',
            display: 'inline-block',
          }} />
          <span style={{
            fontFamily: 'var(--font-label)',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--on-surface-variant)',
            opacity: 0.5,
          }}>
            Room 3 Chronicles
          </span>
        </div>

        {/* Center — tagline */}
        <span style={{
          fontFamily: 'var(--font-handwritten)',
          fontSize: '0.85rem',
          color: 'var(--on-surface-variant)',
          opacity: 0.45,
          transform: 'rotate(-0.5deg)',
          display: 'inline-block',
        }}>
          made with love, chaos & way too much tea ✦
        </span>

        {/* Right — year */}
        <span style={{
          fontFamily: 'var(--font-label)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: 'var(--on-surface-variant)',
          opacity: 0.35,
        }}>
          © 2024
        </span>
      </div>
    </footer>
  );
}
