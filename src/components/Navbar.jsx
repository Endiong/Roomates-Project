import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';


export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const links = [
    { to: '/', label: 'Home', icon: 'home' },
    { to: '/roommates', label: 'Roomies', icon: 'group' },
    { to: '/memories', label: 'Memories', icon: 'photo_library' },
    { to: '/games', label: 'Games', icon: 'sports_esports' },
    ...(isAdmin() ? [{ to: '/admin', label: 'Admin', icon: 'admin_panel_settings' }] : []),
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(248, 246, 195, 0.88)'
          : 'rgba(255, 251, 255, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: scrolled
          ? '0 4px 24px -4px rgba(57,57,27,0.12)'
          : '0 1px 0 rgba(189,187,146,0.2)',
        borderBottom: '1px solid rgba(189,187,146,0.2)',
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4rem',
        }}>

          {/* Brand */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--primary)',
              lineHeight: 1,
              letterSpacing: '-0.01em',
            }}>
              Clockk It!
            </span>
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="material-symbols-outlined"
              style={{ fontSize: '0.8rem', color: 'var(--tertiary)', fontVariationSettings: "'FILL' 1", marginBottom: '0.5rem' }}
            >
              favorite
            </motion.span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className="desktop-navbar">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  background: isActive(link.to)
                    ? 'var(--primary-container)'
                    : 'transparent',
                  color: isActive(link.to)
                    ? 'var(--on-primary-container)'
                    : 'var(--on-surface-variant)',
                }}
                onMouseEnter={e => {
                  if (!isActive(link.to)) {
                    e.currentTarget.style.background = 'rgba(129,90,91,0.08)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(link.to)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--on-surface-variant)';
                  }
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* User chip */}
                <Link
                  to={`/profile/${currentUser.roommateId}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0.85rem 0.35rem 0.35rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--surface-container)',
                    textDecoration: 'none',
                    border: '1px solid rgba(189,187,146,0.4)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}>
                    {currentUser.nickname?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: 'var(--on-surface)',
                  }}>{currentUser.nickname}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--on-surface-variant)',
                    padding: '0.35rem',
                    borderRadius: '50%',
                    display: 'flex',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface-container)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--on-surface-variant)'; e.currentTarget.style.background = 'none'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(129,90,91,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(129,90,91,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(129,90,91,0.3)'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>lock</span>
                Sign In
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setOpen(o => !o)}
              className="hamburger-btn"
              aria-label="Menu"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--primary)',
                padding: '0.35rem',
                borderRadius: 'var(--radius)',
              }}
            >
              <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div style={{
          position: 'fixed',
          top: '4rem',
          left: 0,
          right: 0,
          background: 'rgba(254,252,203,0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 16px 40px rgba(57,57,27,0.15)',
          zIndex: 99,
          borderBottom: '1px solid rgba(189,187,146,0.3)',
        }}>
          <nav style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  color: isActive(link.to) ? 'var(--primary)' : 'var(--on-surface)',
                  background: isActive(link.to) ? 'var(--primary-container)' : 'transparent',
                }}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid rgba(189,187,146,0.3)', marginTop: '0.5rem', paddingTop: '0.75rem' }}>
              {currentUser ? (
                <button
                  onClick={logout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', width: '100%',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '1rem',
                    color: 'var(--on-surface-variant)', borderRadius: 'var(--radius)',
                  }}
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sign Out ({currentUser.nickname})
                </button>
              ) : (
                <Link
                  to="/login"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1rem',
                    color: 'var(--primary)', textDecoration: 'none',
                  }}
                >
                  <span className="material-symbols-outlined">lock</span>
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-navbar { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
