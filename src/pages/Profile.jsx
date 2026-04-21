import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { roommates, roommateThemes } from '../data/roommates';
import { useAuth } from '../context/AuthContext';
import { setProfile, addProfileNote, getProfileNotes, deleteProfileNote } from '../firebase/db';
import { uploadPhoto } from '../firebase/storage';

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
  const { currentUser, isOwner } = useAuth();
  const roommate = roommates.find(r => r.id === id);
  const theme = roommateThemes[id] || roommateThemes.maya;

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [customQuote, setCustomQuote] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileImg, setProfileImg] = useState(roommate?.avatar);

  // Peer Notes
  const [peerNotes, setPeerNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [sendingNote, setSendingNote] = useState(false);

  useEffect(() => {
    setProfileImg(roommate?.avatar);
    setCustomNote(roommate?.finalNote || '');
    setCustomQuote(roommate?.quote || '');
    window.scrollTo(0, 0);
    // Load peer notes
    getProfileNotes(id).then(setPeerNotes).catch(console.error);
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

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
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

  const accent = theme.accentColor;
  const handCss = { fontFamily: theme.handwrittenFont };

  return (
    <div style={{
      background: theme.dotBg,
      backgroundImage: theme.patternStyle,
      backgroundSize: theme.patternSize,
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1.25rem 5rem' }}>

        {/* ─── HERO HEADER ─── */}
        <motion.header
          initial="hidden" animate="show" variants={stagger}
          style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}
        >
          <motion.div variants={fadeUp}>
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              letterSpacing: '-0.04em',
              color: accent,
              lineHeight: 1,
              marginBottom: '0.75rem',
            }}>
              {roommate.name}'s Inner World
            </h1>
          </motion.div>
          <motion.p variants={fadeUp} style={{ ...handCss, fontSize: '1.5rem', color: 'var(--on-surface-variant)', transform: 'rotate(-1.5deg)' }}>
            {roommate.subtitle}
          </motion.p>

          {/* Decorative icon stickers */}
          <div style={{ position: 'absolute', top: 0, left: '4%', opacity: 0.12, transform: 'rotate(15deg)', color: accent }}>
            <span className="material-symbols-outlined" style={{ fontSize: '6rem', fontVariationSettings: "'FILL' 1" }}>{theme.heroIcon}</span>
          </div>
          <div style={{ position: 'absolute', top: '50%', right: '4%', opacity: 0.1, transform: 'rotate(-12deg) translateY(-50%)', color: 'var(--tertiary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>

          {/* Edit mode button */}
          {isOwner(id) && (
            <motion.div variants={fadeUp} style={{ marginTop: '1rem' }}>
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
                  {editMode ? 'close' : 'edit'}
                </span>
                {editMode ? 'Cancel Edit' : '✏️ Edit My Page'}
              </button>
            </motion.div>
          )}
        </motion.header>

        {/* ─── MAIN BENTO GRID ─── */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '1.25rem',
            alignItems: 'start',
          }}
        >
          {/* ── COL 1-4: Polaroid + Identity ── */}
          <motion.div variants={fadeUp} style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Polaroid */}
            <div style={{
              background: 'white',
              padding: '1rem 1rem 3.5rem',
              boxShadow: '0 20px 50px -8px rgba(57,57,27,0.18)',
              transform: `rotate(${roommate.rotation}deg)`,
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
                <img
                  src={profileImg}
                  alt={roommate.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
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
                  {roommate.name} {roommate.surname} • 2024
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
                  { label: 'Room Vibe', value: roommate.roomVibe },
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
                {roommate.personalityChips?.map(chip => (
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
                { label: '5-Year Dream', value: roommate.fiveYearDream || 'Coming soon... ✨', icon: 'star' },
                { label: 'Room Vibe', value: roommate.roomVibe || 'TBD', icon: 'home' },
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
          <motion.div variants={fadeUp} style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'rgba(254,203,203,0.3)', padding: '1.25rem', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--error)', fontVariationSettings: "'FILL' 1" }}>flag</span>
                  <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.875rem', color: 'var(--error)' }}>Red Flags</h3>
                </div>
                {roommate.redFlags?.map((f, i) => (
                  <p key={i} style={{ ...handCss, fontSize: '0.95rem', color: 'var(--on-surface)', marginBottom: '0.4rem', lineHeight: 1.4 }}>• {f}</p>
                ))}
              </div>
              <div style={{ background: `${theme.accentContainer}44`, padding: '1.25rem', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: accent, fontVariationSettings: "'FILL' 1" }}>flag</span>
                  <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.875rem', color: accent }}>Green Flags</h3>
                </div>
                {roommate.greenFlags?.map((f, i) => (
                  <p key={i} style={{ ...handCss, fontSize: '0.95rem', color: 'var(--on-surface)', marginBottom: '0.4rem', lineHeight: 1.4 }}>• {f}</p>
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
              {editMode && isOwner(id) ? (
                <textarea
                  value={customQuote}
                  onChange={e => setCustomQuote(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    fontFamily: theme.handwrittenFont, fontSize: '1.3rem',
                    border: `1.5px solid ${accent}`, borderRadius: '0.5rem',
                    padding: '0.5rem', background: 'transparent', color: 'var(--on-surface)',
                    resize: 'vertical',
                  }}
                />
              ) : (
                <p style={{ ...handCss, fontSize: '1.4rem', color: 'var(--on-surface)', lineHeight: 1.5, marginLeft: '1rem' }}>
                  {customQuote || roommate.quote}
                </p>
              )}
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
          <motion.div variants={fadeUp} style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

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
            <div style={{ background: 'white', padding: '0.75rem', boxShadow: '0 12px 30px rgba(57,57,27,0.1)', transform: 'rotate(2deg)' }}>
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
              transform: 'rotate(-1.5deg)',
            }}>
              <p style={{ ...handCss, fontSize: '1.2rem', color: accent, marginBottom: '0.75rem' }}>{roommate.name}'s To-Do:</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {roommate.todoList?.map((item, i) => (
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

            {/* My First Impression Of... */}
            {roommate.myFirstImpressionOf && (
              <div style={{ background: `${accent}10`, padding: '1.25rem', borderRadius: '0.5rem', border: `1.5px dashed ${accent}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: accent, fontVariationSettings: "'FILL' 1" }}>visibility</span>
                  <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.85rem', color: accent }}>First One I Noticed</h3>
                </div>
                <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>
                  My first impression of {roommate.myFirstImpressionOf.personName}...
                </p>
                <p style={{ ...handCss, fontSize: '1rem', color: 'var(--on-surface)', lineHeight: 1.5 }}>
                  {roommate.myFirstImpressionOf.text}
                </p>
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

            {editMode && isOwner(id) ? (
              <textarea
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                rows={6}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontFamily: theme.handwrittenFont, fontSize: '1.3rem',
                  border: `1.5px solid ${accent}`, borderRadius: '0.5rem',
                  padding: '0.75rem', background: 'transparent', color: 'var(--on-surface)',
                  resize: 'vertical', lineHeight: 1.6,
                }}
              />
            ) : (
              <p style={{ ...handCss, fontSize: '1.35rem', color: 'var(--on-surface)', lineHeight: 1.7 }}>
                {customNote || roommate.finalNote}
              </p>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', color: accent, opacity: 0.35 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>favorite</span>
              <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>draw</span>
              <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>stars</span>
            </div>

            {/* Save button */}
            {editMode && isOwner(id) && (
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setEditMode(false)}
                  style={{ padding: '0.6rem 1.25rem', background: 'transparent', border: `1.5px solid ${accent}44`, borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  onClick={saveEdits}
                  disabled={saving}
                  style={{ padding: '0.6rem 1.5rem', background: accent, border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>save</span>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </motion.section>

        {/* ─── LOVE LETTER ─── */}
        {roommate.loveLetter && (
          <motion.section
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            style={{ maxWidth: '48rem', margin: '2rem auto 0' }}
          >
            <div style={{
              background: 'rgba(254,203,203,0.15)',
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
                — {roommate.name} 💌
              </p>
            </div>
          </motion.section>
        )}

        {/* ─── PEER NOTES ─── */}
        <motion.section
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          style={{ maxWidth: '48rem', margin: '2rem auto 0' }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: accent, fontVariationSettings: "'FILL' 1" }}>sticky_note_2</span>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.1rem', color: accent }}>Notes from the Girlies</h3>
            </div>
            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Leave {roommate.name} a note, a first impression, or a love message.</p>
          </div>

          {/* Note Input — only for logged-in non-owners */}
          {currentUser && !isOwner(id) && (
            <div style={{ background: 'rgba(248,246,195,0.7)', padding: '1.25rem', borderRadius: '0.5rem', border: '1.5px dashed rgba(189,187,146,0.5)', marginBottom: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-0.55rem', left: '50%', transform: 'translateX(-50%)', width: '3.5rem', height: '1rem', background: 'rgba(185,238,219,0.7)' }} />
              <textarea
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder={`Write something for ${roommate.name}...`}
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', fontFamily: 'var(--font-handwritten)', fontSize: '1.1rem', color: 'var(--on-surface)', resize: 'none', outline: 'none', marginBottom: '0.75rem' }}
              />
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
                      });
                      const updated = await getProfileNotes(id);
                      setPeerNotes(updated);
                      setNoteInput('');
                    } catch (e) { console.error(e); }
                    setSendingNote(false);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1.1rem', background: noteInput.trim() ? accent : 'rgba(189,187,146,0.3)', color: noteInput.trim() ? 'white' : 'var(--outline)', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.85rem', cursor: noteInput.trim() ? 'pointer' : 'not-allowed' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>send</span>
                  {sendingNote ? 'Sending...' : 'Drop a note'}
                </button>
              </div>
            </div>
          )}

          {/* Notes Grid */}
          {peerNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--outline)' }}>
              <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.15rem' }}>No notes yet... be the first!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
              {peerNotes.map((note, i) => {
                const noteColors = [
                  'rgba(254,252,203,0.9)',
                  'rgba(185,238,219,0.4)',
                  'rgba(250,211,253,0.3)',
                  'rgba(245,224,181,0.5)',
                ];
                const pinColors = ['#bdbb92', '#3c6d5e', '#785a7e', '#be7d2d'];
                return (
                  <div
                    key={note.id}
                    style={{
                      background: noteColors[i % 4],
                      padding: '1rem',
                      borderRadius: '0.25rem',
                      boxShadow: '0 4px 14px rgba(57,57,27,0.09)',
                      transform: `rotate(${[-1.5, 1.5, -1, 2][i % 4]}deg)`,
                      position: 'relative',
                    }}
                  >
                    <div style={{ position: 'absolute', top: '-0.5rem', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', borderRadius: '50%', background: pinColors[i % 4], boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                    <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1rem', color: 'var(--on-surface)', lineHeight: 1.6, marginBottom: '0.6rem' }}>{note.text}</p>
                    <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--outline)', textAlign: 'right' }}>
                      — {note.author}
                    </p>
                    {(isOwner(id) || currentUser?.nickname === note.authorNickname) && (
                      <button
                        onClick={async () => {
                          await deleteProfileNote(note.id);
                          setPeerNotes(prev => prev.filter(n => n.id !== note.id));
                        }}
                        style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '0.85rem', color: '#be2d06' }}>close</span>
                      </button>
                    )}
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
