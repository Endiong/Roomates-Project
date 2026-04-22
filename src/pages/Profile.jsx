import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { roommates, roommateThemes } from '../data/roommates';
import { useAuth } from '../context/AuthContext';
import { setProfile, addProfileNote, getProfileNotes, deleteProfileNote } from '../firebase/db';
import { uploadPhoto } from '../firebase/storage';

// ── NOTE TEMPLATES ─────────────────────
import { TEXT_TEMPLATES } from '../data/templates';
import ProfileEditModal from '../components/ProfileEditModal';

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

// Torn paper edge clip-path
const TORN = "polygon(0% 0%, 5% 2%, 10% 0%, 15% 3%, 20% 0%, 25% 2%, 30% 0%, 35% 3%, 40% 0%, 45% 2%, 50% 0%, 55% 3%, 60% 0%, 65% 2%, 70% 0%, 75% 3%, 80% 0%, 85% 2%, 90% 0%, 95% 3%, 100% 0%, 100% 100%, 95% 98%, 90% 100%, 85% 97%, 80% 100%, 75% 98%, 70% 100%, 65% 97%, 60% 100%, 55% 98%, 50% 100%, 45% 97%, 40% 100%, 35% 98%, 30% 100%, 25% 97%, 20% 100%, 15% 98%, 10% 100%, 5% 97%, 0% 100%)";

function MessBar({ value, label, accent }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>
          Messiness Level
        </span>
        <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.9rem', color: accent }}>
          {value}%
        </span>
      </div>
      <div style={{ height: '8px', background: 'rgba(189,187,146,0.25)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: accent, borderRadius: '999px', transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1rem', color: 'var(--on-surface-variant)', marginTop: '0.35rem', display: 'block' }}>
        {label}
      </span>
    </div>
  );
}

function TraitChip({ label, accent }) {
  return (
    <span style={{
      padding: '0.3rem 0.75rem',
      borderRadius: 'var(--radius-full)',
      background: accent + '22',
      border: `1px solid ${accent}44`,
      color: accent,
      fontFamily: 'var(--font-label)',
      fontWeight: 600,
      fontSize: '0.75rem',
      letterSpacing: '0.02em',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
    }}>
      {label}
    </span>
  );
}

export default function Profile() {
  const { id } = useParams();
  const { currentUser, isOwner, isAdmin } = useAuth();
  const roommate = roommates.find(r => r.id === id);
  const baseTheme = roommateThemes[id] || roommateThemes.maya;

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [customQuote, setCustomQuote] = useState('');
  const [customRoomVibe, setCustomRoomVibe] = useState('');
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileImg, setProfileImg] = useState(roommate?.avatar);

  const [redFlags, setRedFlags] = useState(null);
  const [greenFlags, setGreenFlags] = useState(null);
  const [todoList, setTodoList] = useState(null);
  const [personalityChips, setPersonalityChips] = useState(null);
  const [loadingOverrides, setLoadingOverrides] = useState(true);

  // Theme colour + pattern customisation
  const [themeColor, setThemeColor] = useState(null); // null = use default
  const [colorSaving, setColorSaving] = useState(false);
  const [bgPattern, setBgPattern] = useState(null); // null = use default dots
  const [colorWarning, setColorWarning] = useState(false);

  // Background pattern options
  const BG_PATTERNS = [
    { id: 'dots', label: 'Dots', icon: '⬤', fn: (c) => `radial-gradient(${c}66 1.5px, transparent 1.5px)`, size: '24px 24px' },
    { id: 'stars', label: 'Stars', icon: '✦', fn: (c) => `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext y='16' font-size='14' opacity='0.35' fill='${encodeURIComponent(c)}'%3E✦%3C/text%3E%3C/svg%3E")`, size: '20px 20px' },
    { id: 'hearts', label: 'Hearts', icon: '♥', fn: (c) => `url("data:image/svg+xml,%3Csvg width='22' height='22' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext y='17' font-size='13' opacity='0.3' fill='${encodeURIComponent(c)}'%3E♥%3C/text%3E%3C/svg%3E")`, size: '22px 22px' },
    { id: 'sparkles', label: 'Sparkles', icon: '✨', fn: (c) => `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext y='18' font-size='14' opacity='0.28' fill='${encodeURIComponent(c)}'%3E✨%3C/text%3E%3C/svg%3E")`, size: '24px 24px' },
    { id: 'cross', label: 'Cross', icon: '✕', fn: (c) => `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='4' y1='4' x2='16' y2='16' stroke='${encodeURIComponent(c)}' stroke-width='1.5' opacity='0.25'/%3E%3Cline x1='16' y1='4' x2='4' y2='16' stroke='${encodeURIComponent(c)}' stroke-width='1.5' opacity='0.25'/%3E%3C/svg%3E")`, size: '20px 20px' },
    { id: 'dash', label: 'Dashes', icon: '— ', fn: (c) => `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='3' y1='10' x2='17' y2='10' stroke='${encodeURIComponent(c)}' stroke-width='1.5' opacity='0.25'/%3E%3C/svg%3E")`, size: '20px 20px' },
    { id: 'diamond', label: 'Diamonds', icon: '◇', fn: (c) => `url("data:image/svg+xml,%3Csvg width='22' height='22' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='11,3 19,11 11,19 3,11' stroke='${encodeURIComponent(c)}' stroke-width='1.5' fill='none' opacity='0.22'/%3E%3C/svg%3E")`, size: '22px 22px' },
    { id: 'moon', label: 'Moons', icon: '☽', fn: (c) => `url("data:image/svg+xml,%3Csvg width='22' height='22' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext y='17' font-size='14' opacity='0.28' fill='${encodeURIComponent(c)}'%3E☽%3C/text%3E%3C/svg%3E")`, size: '22px 22px' },
  ];

  function getPatternStyle(patId, color) {
    const pat = BG_PATTERNS.find(p => p.id === patId);
    if (!pat) return BG_PATTERNS[0].fn(color);
    return pat.fn(color);
  }
  function getPatternSize(patId) {
    const pat = BG_PATTERNS.find(p => p.id === patId);
    return pat?.size || '24px 24px';
  }

  function hexLuminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const toLinear = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }

  // Peer Notes
  const [peerNotes, setPeerNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [noteTemplate, setNoteTemplate] = useState('sticky');
  const [sendingNote, setSendingNote] = useState(false);

  // Computed theme — merge Firestore colour override into base theme
  const theme = themeColor
    ? {
      ...baseTheme,
      accentColor: themeColor,
      dotColor: themeColor + '66',
      patternStyle: `radial-gradient(${themeColor}66 1.5px, transparent 1.5px)`,
      washibg: themeColor + 'bb',
      accentContainer: themeColor + '33',
    }
    : baseTheme;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setProfileImg(roommate?.avatar);
    setCustomNote(roommate?.finalNote || '');
    setCustomQuote(roommate?.quote || '');
    window.scrollTo(0, 0);
    getProfileNotes(id).then(setPeerNotes).catch(console.error);
    // Load saved theme colour and data overrrides from Firestore
    import('../firebase/db').then(({ getProfileOverrides }) => {
      getProfileOverrides(id).then(data => {
        if (data) {
          if (data.themeColor) setThemeColor(data.themeColor);
          if (data.bgPattern) setBgPattern(data.bgPattern);
          if (data.avatar) setProfileImg(data.avatar);
          if (data.finalNote) setCustomNote(data.finalNote);
          if (data.quote) setCustomQuote(data.quote);
          if (data.roomVibe) setCustomRoomVibe(data.roomVibe);
          if (data.redFlags) setRedFlags(data.redFlags);
          if (data.greenFlags) setGreenFlags(data.greenFlags);
          if (data.todoList) setTodoList(data.todoList);
          if (data.personalityChips) setPersonalityChips(data.personalityChips);
        }
      }).catch(() => { }).finally(() => setLoadingOverrides(false));
    });
  }, [id, roommate]);

  if (!roommate) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--outline-variant)' }}>sentiment_dissatisfied</span>
        <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--on-surface-variant)' }}>
          Roommate not found!
        </p>
        <Link to="/roommates" style={{ color: 'var(--primary)', fontFamily: 'var(--font-headline)', fontWeight: 600 }}>
          ← Back to Roomies
        </Link>
      </div>
    );
  }

  if (loadingOverrides) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: baseTheme.dotBg }}>
        <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--on-surface-variant)' }}>Opening Space...</p>
      </div>
    );
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const tempUrl = URL.createObjectURL(file);
    setProfileImg(tempUrl);
    try {
      const url = await uploadPhoto(file);
      setProfileImg(url);
      await setProfile(id, { avatar: url });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function saveEdits() {
    setSaving(true);
    try {
      await setProfile(id, { finalNote: customNote, quote: customQuote, avatar: profileImg });
      setEditMode(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  async function saveThemeColor(color) {
    // Light-color safety: warn if color is very light
    if (hexLuminance(color) > 0.8) {
      setColorWarning(true);
      setTimeout(() => setColorWarning(false), 3000);
    } else {
      setColorWarning(false);
    }
    setThemeColor(color);
    setColorSaving(true);
    try {
      await setProfile(id, { themeColor: color });
    } catch (err) {
      console.error('Color save failed:', err);
    } finally {
      setColorSaving(false);
    }
  }

  async function saveBgPattern(patId) {
    setBgPattern(patId);
    try {
      await setProfile(id, { bgPattern: patId });
    } catch (err) {
      console.error('Pattern save failed:', err);
    }
  }

  const accent = theme.accentColor;
  const handCss = { fontFamily: theme.handwrittenFont };
  const resolvedPattern = getPatternStyle(bgPattern || 'dots', accent);
  const resolvedPatternSize = getPatternSize(bgPattern || 'dots');

  return (
    <div style={{
      background: theme.dotBg,
      backgroundImage: resolvedPattern,
      backgroundSize: resolvedPatternSize,
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: isMobile ? '1.5rem 1rem 4rem' : '3rem 1.25rem 5rem' }}>

        {editMode && isOwner(id) && (
          <ProfileEditModal
            roommate={roommate}
            currentData={{ finalNote: customNote, quote: customQuote, roomVibe: customRoomVibe, themeColor, redFlags, greenFlags, todoList, personalityChips }}
            onClose={() => setEditMode(false)}
            onSave={async (data) => {
              await setProfile(id, data);
              if (data.finalNote !== undefined) setCustomNote(data.finalNote);
              if (data.quote !== undefined) setCustomQuote(data.quote);
              if (data.roomVibe !== undefined) setCustomRoomVibe(data.roomVibe);
              if (data.redFlags !== undefined) setRedFlags(data.redFlags);
              if (data.greenFlags !== undefined) setGreenFlags(data.greenFlags);
              if (data.todoList !== undefined) setTodoList(data.todoList);
              if (data.personalityChips !== undefined) setPersonalityChips(data.personalityChips);
              setEditMode(false);
            }}
          />
        )}

        {/* ─── HERO HEADER ─── */}
        <motion.header
          initial="hidden" animate="show" variants={stagger}
          style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '3rem', position: 'relative' }}
        >
          <motion.div variants={fadeUp}>
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 900,
              fontSize: isMobile ? 'clamp(2rem, 10vw, 3rem)' : 'clamp(2.5rem, 7vw, 5rem)',
              letterSpacing: '-0.04em',
              color: accent,
              lineHeight: 1,
              marginBottom: '0.75rem',
            }}>
              {roommate.name}'s Space
            </h1>
          </motion.div>
          <motion.p variants={fadeUp} style={{ ...handCss, fontSize: '1.5rem', color: 'var(--on-surface-variant)', transform: 'rotate(-1.5deg)' }}>
            {roommate.subtitle}
          </motion.p>

          {/* Decorative icon stickers */}
          {!isMobile && (
            <>
              <div style={{ position: 'absolute', top: 0, left: '4%', opacity: 0.12, transform: 'rotate(15deg)', color: accent }}>
                <span className="material-symbols-outlined" style={{ fontSize: '6rem', fontVariationSettings: "'FILL' 1" }}>{theme.heroIcon}</span>
              </div>
              <div style={{ position: 'absolute', top: '50%', right: '4%', opacity: 0.1, transform: 'rotate(-12deg) translateY(-50%)', color: 'var(--tertiary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '4rem', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
            </>
          )}

          {/* Edit mode button + colour wheel */}
          {isOwner(id) && (
            <motion.div variants={fadeUp} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={() => setEditMode(e => !e)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 1.25rem',
                    background: editMode ? 'var(--error)' : accent,
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                    edit
                  </span>
                  Edit My Page
                </button>

                {/* Colour wheel picker */}
                <label
                  title="Change your theme colour"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.45rem 1rem',
                    background: 'white',
                    border: `2px solid ${accent}44`,
                    borderRadius: 'var(--radius-full)',
                    fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    color: accent,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>palette</span>
                  {colorSaving ? 'Saving...' : 'My Colour'}
                  {/* Hidden colour input */}
                  <input
                    type="color"
                    defaultValue={accent}
                    onChange={e => saveThemeColor(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' }}
                  />
                </label>

                {/* Colour preview dot */}
                <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '50%', background: accent, border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} title={`Current: ${accent}`} />
              </div>

              {/* Background Pattern Picker */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', opacity: 0.6 }}>Background Pattern</p>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {BG_PATTERNS.map(pat => (
                    <button
                      key={pat.id}
                      onClick={() => saveBgPattern(pat.id)}
                      title={pat.label}
                      style={{
                        width: '2rem', height: '2rem',
                        borderRadius: '50%',
                        border: `2.5px solid ${(bgPattern || 'dots') === pat.id ? accent : 'rgba(189,187,146,0.4)'}`,
                        background: (bgPattern || 'dots') === pat.id ? `${accent}22` : 'white',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                        transform: (bgPattern || 'dots') === pat.id ? 'scale(1.15)' : 'scale(1)',
                        color: accent,
                      }}
                    >
                      {pat.icon}
                    </button>
                  ))}
                </div>
                {colorWarning && (
                  <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', color: '#be7d2d', fontWeight: 600, maxWidth: '16rem', textAlign: 'center' }}>
                    ⚠️ That colour is very light — text may be hard to read on your page!
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </motion.header>

        {/* ─── MAIN BENTO GRID ─── */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
            gap: '1.25rem',
            alignItems: 'start',
          }}
        >
          {/* ── COL 1-4: Polaroid + Identity ── */}
          <motion.div variants={fadeUp} style={{ gridColumn: isMobile ? '1 / -1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Polaroid */}
            <div style={{
              background: 'white',
              padding: '1rem 1rem 3.5rem',
              boxShadow: '0 20px 50px -8px rgba(57,57,27,0.18)',
              transform: isMobile ? 'none' : `rotate(${roommate.rotation}deg)`,
              position: 'relative',
              transition: 'transform 0.5s ease',
            }}>
              {/* Washi tape */}
              <div style={{
                position: 'absolute', top: '-1rem', left: '50%', transform: 'translateX(-50%) rotate(2deg)',
                width: '6rem', height: '1.75rem', background: theme.washibg, zIndex: 10,
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 16px)',
              }} />
              {/* Photo */}
              <div style={{ aspectRatio: '1', overflow: 'hidden', background: 'var(--surface-variant)', position: 'relative' }}>
                {profileImg ? (
                  <img
                    src={profileImg}
                    alt={roommate.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: accent, opacity: 0.8 }} />
                )}
                {/* Photo upload overlay */}
                {editMode && isOwner(id) && (
                  <label style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white', gap: '0.5rem',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>add_a_photo</span>
                    <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.85rem' }}>
                      {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                    </span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <p style={{ ...handCss, fontSize: '1.75rem', color: 'var(--on-surface)' }}>{roommate.polaroidCaption}</p>
                <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--outline)', marginTop: '0.2rem' }}>
                  {roommate.name} {roommate.surname}
                </p>
              </div>
            </div>

            {/* Core Identity */}
            <div style={{
              background: 'var(--surface-container)',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              borderLeft: `4px solid ${accent}`,
              boxShadow: '0 2px 12px rgba(57,57,27,0.06)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: accent, opacity: 0.08 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>fingerprint</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, marginBottom: '1rem' }}>
                Core Identity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { label: 'Name', value: `${roommate.name} ${roommate.surname}`.trim() },
                  { label: 'Nickname', value: roommate.nickname },
                  { label: 'Room Vibe', value: customRoomVibe || roommate.roomVibe },
                  { label: 'MBTI', value: roommate.mbti || 'TBD — ask her!' },
                  { label: 'Birthday', value: roommate.birthday || 'TBD ✦' },
                  { label: 'Level', value: roommate.level ? `${roommate.level}` : 'TBD' },
                  { label: 'Department', value: roommate.department || 'TBD' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(189,187,146,0.2)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{item.label}</span>
                    <span style={{
                      fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem',
                      background: item.label === 'MBTI' ? `${accent}22` : 'transparent',
                      color: item.label === 'MBTI' ? accent : 'var(--on-surface)',
                      padding: item.label === 'MBTI' ? '0.15rem 0.6rem' : '0',
                      borderRadius: item.label === 'MBTI' ? 'var(--radius-full)' : '0',
                    }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personality Chips */}
            <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.6)', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(57,57,27,0.05)', border: '1px dashed rgba(189,187,146,0.5)' }}>
              <h3 style={{ fontFamily: 'var(--font-label)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>
                Personality Stickers
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(personalityChips || roommate.personalityChips)?.map(chip => (
                  <TraitChip key={chip} label={chip} accent={accent} />
                ))}
                {roommate.traits?.map(t => (
                  <TraitChip key={t} label={t} accent='var(--tertiary)' />
                ))}
              </div>
            </div>

            {/* Deep Dive */}
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '0.5rem', boxShadow: '0 2px 12px rgba(57,57,27,0.07)' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: accent, marginBottom: '1rem' }}>
                Personality Deep Dive
              </h3>
              {[
                { label: 'Love Language', value: roommate.loveLanguage || 'TBD ✦', icon: 'favorite' },
                { label: 'Favourite Food', value: roommate.favoriteFood || roommate.comfortFood || 'TBD ✦', icon: roommate.comfortFoodIcon || 'restaurant' },
                { label: 'MBTI', value: roommate.mbti || 'TBD', icon: 'psychology' },
                { label: '5-Year Dream', value: roommate.fiveYearDream || 'Coming soon...', icon: 'star' },
                { label: 'Room Vibe', value: customRoomVibe || roommate.roomVibe || 'TBD', icon: 'home' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: `${accent}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: accent, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>{item.label}</p>
                    <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--on-surface)' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── COL 5-8: Middle Column ── */}
          <motion.div variants={fadeUp} style={{ gridColumn: isMobile ? '1 / -1' : 'span 5', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* First Impression vs Now */}
            <div style={{
              background: 'var(--surface-container-low)',
              padding: '1.5rem',
              clipPath: TORN,
              paddingTop: '2rem',
              paddingBottom: '2rem',
            }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: accent, marginBottom: '1rem' }}>
                First Impression vs. Now
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '0.5rem' }}>
                  <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>
                    They Thought
                  </p>
                  <p style={{ ...handCss, fontSize: '1.3rem', color: 'var(--on-surface)' }}>{roommate.firstImpression}</p>
                </div>
                <div style={{ padding: '1rem', background: `${accent}15`, borderRadius: '0.5rem', borderLeft: `3px solid ${accent}` }}>
                  <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent, marginBottom: '0.4rem' }}>
                    Reality
                  </p>
                  <p style={{ ...handCss, fontSize: '1.3rem', color: accent, fontWeight: 700 }}>{roommate.reality}</p>
                </div>
              </div>
            </div>

            {/* Known For */}
            <div style={{
              background: `${accent}15`,
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: `2px dashed ${accent}44`,
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: accent, opacity: 0.2 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', fontVariationSettings: "'FILL' 1" }}>{theme.heroIcon}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, marginBottom: '0.75rem' }}>
                Known for...
              </h3>
              <p style={{ ...handCss, fontSize: '1.4rem', color: 'var(--on-surface)', lineHeight: 1.4 }}>{roommate.knownFor}</p>
            </div>

            {/* Red & Green Flags */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: '#ffebee', padding: '1.25rem', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#c62828', fontVariationSettings: "'FILL' 1" }}>flag</span>
                  <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.875rem', color: '#c62828' }}>Red Flags</h3>
                </div>
                {(redFlags || roommate.redFlags)?.map((f, i) => (
                  <p key={i} style={{ ...handCss, fontSize: '0.95rem', color: '#b71c1c', marginBottom: '0.4rem', lineHeight: 1.4 }}>• {f}</p>
                ))}
              </div>
              <div style={{ background: '#e8f5e9', padding: '1.25rem', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#2e7d32', fontVariationSettings: "'FILL' 1" }}>flag</span>
                  <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.875rem', color: '#2e7d32' }}>Green Flags</h3>
                </div>
                {(greenFlags || roommate.greenFlags)?.map((f, i) => (
                  <p key={i} style={{ ...handCss, fontSize: '0.95rem', color: '#1b5e20', marginBottom: '0.4rem', lineHeight: 1.4 }}>• {f}</p>
                ))}
              </div>
            </div>

            {/* Messiness + Chaos */}
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(57,57,27,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <MessBar value={roommate.messiness} label={roommate.messinessLabel} accent={accent} />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>
                    Chaos Level
                  </span>
                  <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--tertiary)' }}>
                    {roommate.chaosLevel}%
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(120,90,126,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${roommate.chaosLevel}%`, background: 'var(--tertiary)', borderRadius: '999px' }} />
                </div>
                <span style={{ ...handCss, fontSize: '1rem', color: 'var(--on-surface-variant)', marginTop: '0.35rem', display: 'block' }}>
                  {roommate.chaosLabel}
                </span>
              </div>
            </div>

            {/* Quote card */}
            <div style={{
              background: 'var(--surface-container-lowest)',
              padding: '1.5rem 1.75rem',
              boxShadow: '0 8px 24px rgba(57,57,27,0.08)',
              position: 'relative',
              clipPath: TORN,
              paddingTop: '2rem',
              paddingBottom: '2rem',
            }}>
              <div style={{ position: 'absolute', top: '0.5rem', left: '1.25rem', color: accent, fontSize: '3rem', opacity: 0.15, fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</div>
              <p style={{ ...handCss, fontSize: '1.4rem', color: 'var(--on-surface)', lineHeight: 1.5, marginLeft: '1rem' }}>
                {customQuote || roommate.quote}
              </p>
              <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.8rem', color: accent }}>— {roommate.name}</span>
              </div>
            </div>

            {/* Personal Timeline */}
            <div style={{ padding: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: accent, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>history</span>
                {roommate.name}'s Timeline
              </h3>
              <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: `2px solid ${accent}33` }}>
                {roommate.timeline?.map((item, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: '1.25rem' }}>
                    <div style={{
                      position: 'absolute', left: '-1.85rem', top: '0.1rem',
                      width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                      background: item.active ? accent : 'var(--surface-container)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${accent}66`,
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '0.7rem', color: item.active ? 'white' : accent }}>{item.icon}</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: accent, letterSpacing: '0.08em' }}>{item.date}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--on-surface)', marginTop: '0.15rem', lineHeight: 1.4 }}>{item.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── COL 9-12: Right Column ── */}
          <motion.div variants={fadeUp} style={{ gridColumn: isMobile ? '1 / -1' : 'span 3', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Quick Stats */}
            <div style={{ background: `${accent}12`, padding: '1.25rem', borderRadius: '0.5rem', border: `2px solid ${accent}22` }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, marginBottom: '1rem' }}>
                Quick Stats
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {roommate.stats?.map(stat => (
                  <div key={stat.label} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.5)', borderRadius: '0.5rem' }}>
                    <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.5rem', color: accent, lineHeight: 1 }}>{stat.value}</p>
                    <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Her Spot */}
            <div style={{ background: 'white', padding: '0.75rem', boxShadow: '0 12px 30px rgba(57,57,27,0.1)', transform: isMobile ? 'none' : 'rotate(2deg)' }}>
              <div style={{ position: 'absolute', top: '-0.75rem', right: '25%', width: '4rem', height: '1.25rem', background: theme.washibg, transform: 'rotate(6deg)' }} />
              <div style={{ aspectRatio: '1', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <img src={roommate.spotImg} alt={roommate.campusSpot || 'Spot'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p style={{ ...handCss, fontSize: '1.1rem', textAlign: 'center', color: 'var(--on-surface)' }}>{roommate.campusSpot || roommate.spotName}</p>
              <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', color: 'var(--outline)', marginTop: '0.25rem' }}>
                {roommate.campusSpotCaption || roommate.spotCaption}
              </p>
            </div>

            {/* To-Do List */}
            <div style={{
              background: 'rgba(248,246,195,0.9)',
              padding: '1.25rem',
              borderRadius: '0.5rem',
              border: '1px dashed rgba(189,187,146,0.6)',
              transform: isMobile ? 'none' : 'rotate(-1.5deg)',
            }}>
              <p style={{ ...handCss, fontSize: '1.2rem', color: accent, marginBottom: '0.75rem' }}>{roommate.name}'s To-Do:</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(todoList || roommate.todoList)?.map((item, i) => (
                  <li key={i} style={{ ...handCss, fontSize: '0.95rem', color: 'var(--on-surface)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <span style={{ color: accent, flexShrink: 0 }}>◻</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Playlist */}
            <div style={{ background: `${theme.accentContainer}55`, padding: '1.25rem', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.875rem', color: accent }}>{roommate.name}'s Vibe</h3>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: accent, fontVariationSettings: "'FILL' 1" }}>music_note</span>
              </div>
              {roommate.playlist?.map((p, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.6)', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.35rem', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.7rem', color: 'white' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--on-surface)' }}>{p.title}</p>
                    <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', color: 'var(--on-surface-variant)' }}>{p.vibe}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* My First Impressions */}
            {(roommate.firstImpressions?.length > 0 || roommate.myFirstImpressionOf) && (
              <div style={{ background: `${accent}10`, padding: '1.25rem', borderRadius: '0.5rem', border: `1.5px dashed ${accent}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: accent, fontVariationSettings: "'FILL' 1" }}>visibility</span>
                  <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.85rem', color: accent }}>My First Impressions</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {(roommate.firstImpressions || [roommate.myFirstImpressionOf]).map((imp, i) => imp && (
                    <div key={i}>
                      <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>
                        On {imp.personName}...
                      </p>
                      <p style={{ ...handCss, fontSize: '1.05rem', color: 'var(--on-surface)', lineHeight: 1.5 }}>
                        {imp.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* ─── FINAL NOTES ─── */}
        <motion.section
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          style={{ marginTop: '3rem', maxWidth: '48rem', margin: '3rem auto 0' }}
        >
          <div style={{
            background: 'var(--surface-container-lowest)',
            padding: '2.5rem 2rem 3rem',
            boxShadow: '0 20px 60px -10px rgba(57,57,27,0.15)',
            clipPath: TORN,
            paddingTop: '3rem',
            paddingBottom: '3rem',
            position: 'relative',
          }}>
            {/* Corner tapes */}
            <div style={{ position: 'absolute', top: '-0.75rem', left: '-1rem', width: '6rem', height: '1.5rem', background: theme.washibg, transform: 'rotate(-15deg)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 16px)' }} />
            <div style={{ position: 'absolute', bottom: '-0.75rem', right: '-1rem', width: '6rem', height: '1.5rem', background: `${theme.accentContainer}99`, transform: 'rotate(-15deg)' }} />

            <h3 style={{ ...handCss, fontSize: '2rem', color: accent, marginBottom: '1rem' }}>Final Notes...</h3>

            <p style={{ ...handCss, fontSize: '1.35rem', color: 'var(--on-surface)', lineHeight: 1.7 }}>
              {customNote || roommate.finalNote}
            </p>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', color: accent, opacity: 0.35 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>favorite</span>
              <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>draw</span>
              <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>stars</span>
            </div>
          </div>
        </motion.section>

        {/* ─── LOVE LETTER ─── */}
        {roommate.loveLetter && (
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            style={{ maxWidth: '48rem', margin: '2rem auto 0' }}
          >
            <div style={{
              background: 'rgba(226,209,188,0.15)',
              padding: '2rem',
              borderRadius: '0.5rem',
              border: '1.5px dashed rgba(129,90,91,0.25)',
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 0.75rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: accent, fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1rem', color: accent, textAlign: 'center', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                A Love Letter to the Room
              </h3>
              <p style={{ ...handCss, fontSize: '1.25rem', color: 'var(--on-surface)', lineHeight: 1.7, textAlign: 'center' }}>
                {roommate.loveLetter}
              </p>
              <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.8rem', color: accent, textAlign: 'right', marginTop: '1rem' }}>
                — {roommate.name}
              </p>
            </div>
          </motion.section>
        )}

        {/* ─── PEER NOTES ─── */}
        <motion.section
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          style={{ maxWidth: '52rem', margin: '2rem auto 0' }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: accent, fontVariationSettings: "'FILL' 1" }}>sticky_note_2</span>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.1rem', color: accent }}>Notes from the Girlies</h3>
            </div>
            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Leave {roommate.name} a note, a first impression, or a love message — choose your style!</p>
          </div>

          {/* Note Input — only for logged-in non-owners and non-admins */}
          {currentUser && !isOwner(id) && !isAdmin() && (
            <div style={{ marginBottom: '1.75rem' }}>
              {/* Template mini-picker */}
              <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Choose note style:</p>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {TEXT_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setNoteTemplate(t.id)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      border: `1.5px solid ${noteTemplate === t.id ? t.border : 'rgba(189,187,146,0.35)'}`,
                      background: noteTemplate === t.id ? t.bg : 'transparent',
                      fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: '0.72rem',
                      cursor: 'pointer',
                      color: noteTemplate === t.id ? t.accent : 'var(--on-surface-variant)',
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      transition: 'all 0.18s',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
              {/* Live note preview / input */}
              {(() => {
                const tpl = TEXT_TEMPLATES.find(t => t.id === noteTemplate);
                return (
                  <div style={{
                    background: tpl.bg,
                    border: `2px solid ${tpl.border}44`,
                    borderRadius: tpl.clipPath ? 0 : '0.5rem',
                    clipPath: tpl.clipPath,
                    padding: '1.2rem 1.2rem 0.9rem',
                    position: 'relative',
                    ...(tpl.extraStyle || {}),
                    marginBottom: '0.75rem',
                    maxWidth: '260px',
                  }}>
                    {tpl.washiStrips && (
                      <>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: `${tpl.border}80`, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', background: `${tpl.border}80`, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
                      </>
                    )}
                    <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', width: '9px', height: '9px', borderRadius: '50%', background: tpl.pinColor, boxShadow: '0 2px 5px rgba(0,0,0,0.25)' }} />
                    <textarea
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder={`Write something for ${roommate.name}...`}
                      rows={3}
                      style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', fontFamily: "'Nanum Pen Script', cursive", fontSize: '1.1rem', color: 'var(--on-surface)', resize: 'none', outline: 'none', paddingTop: tpl.washiStrips ? '0.5rem' : 0 }}
                    />
                  </div>
                );
              })()}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  disabled={!noteInput.trim() || sendingNote}
                  onClick={async () => {
                    if (!noteInput.trim()) return;
                    setSendingNote(true);
                    try {
                      await addProfileNote(id, {
                        author: currentUser.displayNickname || currentUser.nickname,
                        authorNickname: currentUser.nickname,
                        text: noteInput.trim(),
                        template: noteTemplate,
                      });
                      const updated = await getProfileNotes(id);
                      setPeerNotes(updated);
                      setNoteInput('');
                      setNoteTemplate('sticky');
                    } catch (e) { console.error(e); }
                    setSendingNote(false);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 1.2rem', background: noteInput.trim() ? accent : 'rgba(189,187,146,0.3)', color: noteInput.trim() ? 'white' : 'var(--outline)', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.85rem', cursor: noteInput.trim() ? 'pointer' : 'not-allowed', boxShadow: noteInput.trim() ? `0 4px 14px ${accent}44` : 'none', transition: 'all 0.2s' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>send</span>
                  {sendingNote ? 'Sending...' : 'Drop the note'}
                </button>
              </div>
            </div>
          )}

          {/* Notes Grid — rendered with scrapbook templates */}
          {peerNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--outline)' }}>
              <p style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1.15rem' }}>No notes yet... be the first!</p>
            </div>
          ) : (
            <div className="masonry-wall">
              {peerNotes.map((note, i) => {
                const tpl = TEXT_TEMPLATES.find(t => t.id === note.template) || TEXT_TEMPLATES[0];
                const rotation = isMobile ? 0 : [-1.5, 1.5, -1, 2][i % 4];
                return (
                  <div key={note.id} className="masonry-item">
                    <div
                      style={{
                        background: tpl.bg,
                        borderRadius: tpl.clipPath ? 0 : '0.35rem',
                        clipPath: tpl.clipPath,
                        padding: '1.1rem 1rem 0.9rem',
                        boxShadow: tpl.extraStyle?.boxShadow || '0 4px 14px rgba(57,57,27,0.09)',
                        transform: `rotate(${rotation}deg)`,
                        position: 'relative',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        ...(tpl.extraStyle || {}),
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1.04)'}
                      onMouseLeave={e => e.currentTarget.style.transform = `rotate(${rotation}deg)`}
                    >
                      {tpl.washiStrips && (
                        <>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: `${tpl.border}80`, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', background: `${tpl.border}80`, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
                        </>
                      )}
                      <div style={{ position: 'absolute', top: '-0.5rem', left: '50%', transform: 'translateX(-50%)', width: '9px', height: '9px', borderRadius: '50%', background: tpl.pinColor, boxShadow: '0 2px 5px rgba(0,0,0,0.22)' }} />
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: `1px solid ${tpl.border}33`, paddingBottom: '0.4rem' }}>
                        <div>
                          <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.67rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: tpl.accent }}>
                            {note.author}
                          </p>
                          {note.createdAt?.toDate && (
                            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.55rem', color: 'var(--outline)', opacity: 0.65, marginTop: '0.1rem' }}>
                              {note.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </div>
                        {currentUser?.nickname?.toLowerCase() === note.authorNickname?.toLowerCase() && (
                          <button
                            onClick={async () => {
                              await deleteProfileNote(note.id);
                              setPeerNotes(prev => prev.filter(n => n.id !== note.id));
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, padding: '0.15rem', display: 'flex', flexShrink: 0 }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '0.85rem', color: '#be2d06' }}>close</span>
                          </button>
                        )}
                      </div>
                      <p style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1rem', color: 'var(--on-surface)', lineHeight: 1.6, maxHeight: '180px', overflowY: 'auto', paddingRight: '4px', whiteSpace: 'pre-wrap' }}>{note.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* ─── BACK BUTTON ─── */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link
            to="/roommates"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1.5rem',
              background: 'var(--surface-container)',
              border: '1px solid rgba(189,187,146,0.3)',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.875rem',
              color: 'var(--on-surface-variant)', textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span>
            Back to Roomies
          </Link>
        </div>
      </div>
    </div>
  );
}
