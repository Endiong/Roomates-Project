import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { roommates } from '../data/roommates';

export default function Login() {
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  if (currentUser) {
    return (
      <div style={{
        minHeight: '70vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '2rem',
        textAlign: 'center', gap: '1.5rem',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--secondary)' }}>check_circle</span>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--primary)' }}>
          You're in, {currentUser.displayNickname}!
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to={`/profile/${currentUser.roommateId}`}
            style={{ padding: '0.65rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, textDecoration: 'none' }}>
            My Profile
          </Link>
          <Link to="/memories"
            style={{ padding: '0.65rem 1.5rem', background: 'var(--surface-container)', color: 'var(--on-surface)', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 600, textDecoration: 'none' }}>
            Add a Memory
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nickname.trim() || pin.length < 4) {
      setError('Enter your nickname and PIN (4–8 digits).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(nickname.trim(), pin);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(`/profile/${user.roommateId}`);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Try again!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'var(--background)',
      backgroundImage: 'radial-gradient(#bdbb92 0.5px, transparent 0.5px)',
      backgroundSize: '24px 24px',
      position: 'relative',
    }}>
      {/* Floating decorations */}
      <div style={{ position: 'absolute', top: '15%', left: '8%', opacity: 0.3, transform: 'rotate(15deg)', color: 'var(--tertiary)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>lock_open</span>
      </div>
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', opacity: 0.2, transform: 'rotate(-10deg)', color: 'var(--secondary)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '5rem', fontVariationSettings: "'FILL' 1" }}>favorite</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '22rem',
          position: 'relative',
        }}
      >
        {/* Washi tapes */}
        <div style={{
          position: 'absolute', top: '-1rem', left: '-1rem', zIndex: 20,
          width: '6rem', height: '1.75rem',
          background: 'rgba(185,238,219,0.8)',
          transform: 'rotate(-15deg)',
        }} />
        <div style={{
          position: 'absolute', top: '-0.75rem', right: '-0.5rem', zIndex: 20,
          width: '5rem', height: '1.5rem',
          background: 'rgba(250,211,253,0.8)',
          transform: 'rotate(10deg)',
        }} />

        {/* Card */}
        <div style={{
          background: 'var(--surface-container-lowest)',
          padding: '2.5rem 2rem',
          boxShadow: '0 24px 60px -8px rgba(57,57,27,0.18)',
          position: 'relative',
          transform: 'rotate(-0.5deg)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '4rem', height: '4rem',
              borderRadius: '50%',
              background: 'var(--primary-container)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>photo_album</span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 800,
              fontSize: '1.5rem',
              color: 'var(--primary)',
              letterSpacing: '-0.03em',
              marginBottom: '0.25rem',
            }}>
              Welcome Back!
            </h1>
            <p style={{
              fontFamily: 'var(--font-handwritten)',
              fontSize: '1.1rem',
              color: 'var(--on-surface-variant)',
            }}>
              Sign into the scrapbook
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Nickname */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-label)',
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--on-surface-variant)',
                marginBottom: '0.4rem',
              }}>
                Your Nickname
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--on-surface-variant)', fontSize: '1.1rem',
                }}>person</span>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="e.g. Plant Mama"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                    borderRadius: 'var(--radius)',
                    border: '1.5px solid rgba(189,187,146,0.5)',
                    background: 'var(--surface-container-low)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    color: 'var(--on-surface)',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(189,187,146,0.5)'}
                />
              </div>
            </div>

            {/* PIN */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-label)',
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--on-surface-variant)',
                marginBottom: '0.4rem',
              }}>
                4–8 Digit PIN
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--on-surface-variant)', fontSize: '1.1rem',
                }}>pin</span>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="••••••"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.65rem 2.5rem 0.65rem 2.25rem',
                    borderRadius: 'var(--radius)',
                    border: '1.5px solid rgba(189,187,146,0.5)',
                    background: 'var(--surface-container-low)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1.25rem',
                    color: 'var(--on-surface)',
                    letterSpacing: '0.25em',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(189,187,146,0.5)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(s => !s)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--on-surface-variant)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                    {showPin ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '0.65rem 1rem',
                background: 'rgba(226,209,188,0.5)',
                borderRadius: 'var(--radius)',
                borderLeft: '3px solid var(--primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'var(--error)',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.85rem',
                background: loading ? 'var(--outline-variant)' : 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(129,90,91,0.35)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                {loading ? 'hourglass_empty' : 'login'}
              </span>
              {loading ? 'Signing in...' : 'Enter the Scrapbook'}
            </button>
          </form>

          {/* Roommate picker hint */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(189,187,146,0.3)' }}>
            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', textAlign: 'center', marginBottom: '0.75rem' }}>
              The Crew
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              {roommates.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setNickname(r.nickname.replace(/'/g, ''))}
                  style={{
                    background: 'var(--surface-container)',
                    border: '1px solid rgba(189,187,146,0.3)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.25rem 0.65rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    color: 'var(--on-surface-variant)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-container)'; e.currentTarget.style.color = 'var(--on-primary-container)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.color = 'var(--on-surface-variant)'; }}
                >
                  {r.emoji} {r.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
