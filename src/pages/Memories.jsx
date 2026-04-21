import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { groupMemories, timeline, groupStats } from '../data/roommates';
import { useAuth } from '../context/AuthContext';
import { addMemory, getMemories, deleteMemory } from '../firebase/db';
import { uploadPhoto } from '../firebase/storage';
import { Link } from 'react-router-dom';

const TEXT_TEMPLATES = [
  { id: 'sticky', label: 'Sticky Note', bg: 'rgba(254,252,203,0.9)', border: '#bdbb92', icon: 'sticky_note_2' },
  { id: 'torn', label: 'Torn Paper', bg: '#fff', border: '#815a5b', icon: 'description' },
  { id: 'corkboard', label: 'Cork Pin', bg: '#f5e6c8', border: '#a0763a', icon: 'push_pin' },
  { id: 'washi', label: 'Washi Border', bg: 'rgba(250,211,253,0.25)', border: '#785a7e', icon: 'format_color_fill' },
];

const PHOTO_FRAMES = [
  { id: 'polaroid', label: 'Polaroid', padding: '0.75rem 0.75rem 3rem' },
  { id: 'classic', label: 'Classic', padding: '0.4rem' },
  { id: 'round', label: 'Round', borderRadius: '50%' },
  { id: 'filmstrip', label: 'Film Strip', padding: '0.25rem', border: '4px solid #222' },
];

function AddMemoryModal({ onClose, onAdded }) {
  const { currentUser } = useAuth();
  const [type, setType] = useState('photo');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [frame, setFrame] = useState('polaroid');
  const [template, setTemplate] = useState('sticky');
  const [caption, setCaption] = useState('');
  const [noteText, setNoteText] = useState('');
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split('T')[0]); // default: today
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (!caption.trim()) { setError('Please add a caption!'); return; }
    if (type === 'photo' && !file) { setError('Please choose a photo!'); return; }
    if (type === 'text' && !noteText.trim()) { setError('Please write something!'); return; }
    setError('');
    setSaving(true);
    try {
      if (type === 'photo') {
        const url = await uploadPhoto(file);
        await addMemory({
          type: 'photo',
          photoUrl: url,
          caption: caption.trim(),
          frame,
          author: currentUser.displayNickname || currentUser.nickname,
          visible: true,
          takenAt,
          rotation: Math.floor(Math.random() * 7) - 3,
        });
      } else {
        await addMemory({
          type: 'text',
          text: noteText.trim(),
          caption: caption.trim(),
          template,
          author: currentUser.displayNickname || currentUser.nickname,
          visible: true,
          takenAt,
          rotation: Math.floor(Math.random() * 7) - 3,
        });
      }
      setDone(true);
      onAdded?.();
      setTimeout(onClose, 1600);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again!');
    } finally {
      setSaving(false);
    }
  }

  const tpl = TEXT_TEMPLATES.find(t => t.id === template);

  if (done) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '16rem', gap: '1rem' }}>
      <motion.span className="material-symbols-outlined" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ fontSize: '4rem', color: 'var(--secondary)' }}>check_circle</motion.span>
      <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>Memory saved!</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {['photo', 'text'].map(t => (
          <button key={t} onClick={() => setType(t)} style={{
            flex: 1, padding: '0.65rem', borderRadius: 'var(--radius)', border: `2px solid ${type === t ? 'var(--primary)' : 'rgba(189,187,146,0.3)'}`,
            background: type === t ? 'var(--primary-container)' : 'var(--surface-container)',
            fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            color: type === t ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{t === 'photo' ? 'photo_camera' : 'edit_note'}</span>
            {t === 'photo' ? 'Photo' : 'Text Note'}
          </button>
        ))}
      </div>

      {type === 'photo' && (
        <div>
          <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Choose Frame</p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {PHOTO_FRAMES.map(f => (
              <button key={f.id} onClick={() => setFrame(f.id)} style={{
                padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${frame === f.id ? 'var(--primary)' : 'rgba(189,187,146,0.4)'}`,
                background: frame === f.id ? 'var(--primary-container)' : 'transparent',
                fontFamily: 'var(--font-label)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
                color: frame === f.id ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
              }}>{f.label}</button>
            ))}
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem', background: 'var(--surface-container-low)', borderRadius: '0.5rem', border: '2px dashed rgba(189,187,146,0.5)', cursor: 'pointer', minHeight: '8rem' }}>
            {preview
              ? <img src={preview} alt="preview" style={{ maxHeight: '10rem', maxWidth: '100%', objectFit: 'contain', borderRadius: '0.35rem' }} />
              : <><span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>add_photo_alternate</span><span style={{ fontFamily: 'var(--font-label)', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Click to choose a photo</span></>
            }
            <input type="file" accept="image/*" onChange={pickFile} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      {type === 'text' && (
        <div>
          <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Choose Style</p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {TEXT_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${template === t.id ? 'var(--primary)' : 'rgba(189,187,146,0.4)'}`,
                background: template === t.id ? 'var(--primary-container)' : 'transparent',
                fontFamily: 'var(--font-label)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
                color: template === t.id ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ background: tpl?.bg, border: `2px solid ${tpl?.border}`, borderRadius: '0.5rem', padding: '1rem' }}>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Write your memory here..."
              rows={4}
              style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', fontFamily: 'var(--font-handwritten)', fontSize: '1.1rem', color: 'var(--on-surface)', resize: 'none', outline: 'none' }}
            />
          </div>
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>
          Caption / Title *
        </label>
        <input
          type="text" value={caption} onChange={e => setCaption(e.target.value)}
          placeholder="e.g. The 3 AM suya run"
          style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1.5px solid rgba(189,187,146,0.4)', background: 'var(--surface-container-low)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--on-surface)', outline: 'none' }}
        />
      </div>

      {/* When was this taken? */}
      <div>
        <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>
          When was this taken?
        </label>
        <input
          type="date"
          value={takenAt}
          max={new Date().toISOString().split('T')[0]}
          onChange={e => setTakenAt(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1.5px solid rgba(189,187,146,0.4)', background: 'var(--surface-container-low)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--on-surface)', outline: 'none' }}
        />
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.8rem', color: 'var(--error)', fontWeight: 600 }}>{error}</p>
      )}

      <button onClick={submit} disabled={saving} style={{
        padding: '0.75rem', background: saving ? 'var(--outline-variant)' : 'var(--primary)',
        color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1rem',
        cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>save</span>
        {saving ? 'Saving memory...' : 'Save to Scrapbook'}
      </button>
    </div>
  );
}

// ── Memory Wall Card ──────────────────────────────────────────────
function MemoryWallCard({ mem, i, isAdminUser, currentUserNickname, onDelete }) {
  const tpl = TEXT_TEMPLATES.find(t => t.id === mem.template) || TEXT_TEMPLATES[0];
  const rotation = mem.rotation ?? (i % 2 === 0 ? -2 : 2);

  // 72-hour delete lock for non-admins
  const isAuthor = currentUserNickname === mem.author?.toLowerCase();
  const createdMs = mem.createdAt?.toDate?.()?.getTime?.() || 0;
  const withinWindow = createdMs > 0 && (Date.now() - createdMs) < 72 * 60 * 60 * 1000;
  const canDelete = isAdminUser || (isAuthor && withinWindow);
  const isLockedOut = isAuthor && !isAdminUser && !withinWindow;

  // Format the takenAt date nicely
  const dateLabel = mem.takenAt
    ? new Date(mem.takenAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  if (mem.type === 'text') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04 }}
        whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
        style={{
          transform: `rotate(${rotation}deg)`,
          background: tpl.bg,
          border: `2px solid ${tpl.border}44`,
          borderRadius: '0.5rem',
          padding: '1.25rem 1.25rem 1rem',
          boxShadow: '0 6px 20px rgba(57,57,27,0.1)',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: '-0.6rem', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', borderRadius: '50%', background: tpl.border, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
        <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.1rem', color: 'var(--on-surface)', lineHeight: 1.6, marginBottom: '0.6rem' }}>
          {mem.text}
        </p>
        <div style={{ borderTop: `1px solid ${tpl.border}33`, paddingTop: '0.5rem', marginTop: '0.25rem' }}>
          <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.65rem', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {mem.caption} — {mem.author}
          </p>
          {dateLabel && (
            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.6rem', color: 'var(--outline)', opacity: 0.7, marginTop: '0.1rem' }}>
              {dateLabel}
            </p>
          )}
        </div>
        {canDelete && (
          <button onClick={() => onDelete(mem.id)} title="Delete" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(190,45,6,0.1)', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', padding: '0.15rem 0.3rem', display: 'flex' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.8rem', color: '#be2d06' }}>delete</span>
          </button>
        )}
        {isLockedOut && (
          <span title="Can only delete within 72 hours of posting" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', opacity: 0.35, fontSize: '0.8rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--outline)' }}>lock</span>
          </span>
        )}
      </motion.div>
    );
  }

  // Photo memory
  const frameStyle = PHOTO_FRAMES.find(f => f.id === mem.frame) || PHOTO_FRAMES[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
      style={{
        transform: `rotate(${rotation}deg)`,
        background: 'white',
        padding: frameStyle.padding,
        borderRadius: mem.frame === 'round' ? '50%' : '2px',
        border: frameStyle.border || 'none',
        boxShadow: '0 10px 32px rgba(57,57,27,0.13)',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: '-0.6rem', left: '50%', transform: 'translateX(-50%) rotate(-2deg)', width: '4rem', height: '1.1rem', background: 'rgba(185,238,219,0.7)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)' }} />
      <img
        src={mem.photoUrl}
        alt={mem.caption}
        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', borderRadius: mem.frame === 'round' ? '50%' : '2px' }}
      />
      <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
        <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '0.95rem', color: 'var(--on-surface)' }}>{mem.caption}</p>
        <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--outline)', marginTop: '0.15rem' }}>by {mem.author}</p>
        {dateLabel && (
          <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.58rem', color: 'var(--outline)', opacity: 0.65, marginTop: '0.1rem' }}>{dateLabel}</p>
        )}
      </div>
      {canDelete && (
        <button onClick={() => onDelete(mem.id)} title="Delete" style={{ position: 'absolute', top: '0.35rem', right: '0.35rem', background: 'rgba(190,45,6,0.15)', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', padding: '0.15rem 0.3rem', display: 'flex' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '0.8rem', color: '#be2d06' }}>delete</span>
        </button>
      )}
      {isLockedOut && (
        <span title="Can only delete within 72 hours of posting" style={{ position: 'absolute', top: '0.35rem', right: '0.35rem', opacity: 0.3 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--outline)' }}>lock</span>
        </span>
      )}
    </motion.div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function Memories() {
  const { currentUser, isAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [memories, setMemories] = useState([]);
  const [loadingMems, setLoadingMems] = useState(true);

  async function fetchMemories() {
    setLoadingMems(true);
    try {
      const mems = await getMemories();
      setMemories(isAdmin() ? mems : mems.filter(m => m.visible !== false));
    } catch (e) {
      console.error('Failed to load memories:', e);
    }
    setLoadingMems(false);
  }

  useEffect(() => { fetchMemories(); }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this memory permanently?')) return;
    await deleteMemory(id);
    setMemories(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div style={{ background: '#faf9f5' }} className="scrapbook-dots">

      {/* ── HERO ── */}
      <section style={{ textAlign: 'center', padding: '5rem 1.5rem 3rem' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            The Core Memories.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--on-surface-variant)', maxWidth: '36rem', margin: '0 auto', lineHeight: 1.7 }}>
            Capturing the chaos, the suya runs, and the shared survival of living together.
          </p>
          {currentUser ? (
            <button
              onClick={() => { setModalKey(k => k + 1); setShowModal(true); }}
              style={{ marginTop: '2rem', background: 'var(--primary)', color: 'var(--on-primary)', padding: '1rem 2rem', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 24px rgba(129,90,91,0.3)', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <span className="material-symbols-outlined">add_a_photo</span>
              Add a Memory
            </button>
          ) : (
            <Link to="/login" style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', background: 'var(--surface-container)', border: '1.5px solid rgba(189,187,146,0.4)', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--on-surface-variant)', textDecoration: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>lock</span>
              Sign in to add memories
            </Link>
          )}
        </motion.div>
      </section>

      {/* ── ADD MEMORY MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(57,57,27,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '28rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(57,57,27,0.3)', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>Add a Memory</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <AddMemoryModal key={modalKey} onClose={() => setShowModal(false)} onAdded={fetchMemories} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LIVE MEMORY WALL ── */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-surface-variant)', opacity: 0.6, marginBottom: '0.25rem' }}>Live from the scrapbook</p>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', letterSpacing: '-0.04em', color: 'var(--primary)' }}>Our Memory Wall</h2>
          </div>
          <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', color: 'var(--outline)' }}>
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
          </span>
        </div>

        {loadingMems ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '14rem', background: 'var(--surface-container)', borderRadius: '0.5rem', opacity: 0.5 }} />
            ))}
          </div>
        ) : memories.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--outline)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'block' }}>photo_library</span>
            <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>No memories yet!</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>Be the first to add one — sign in and tap "Add a Memory" above.</p>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {memories.map((mem, i) => (
              <MemoryWallCard
                key={mem.id}
                mem={mem}
                i={i}
                isAdminUser={isAdmin()}
                currentUserNickname={currentUser?.nickname}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── DECORATIVE: Group Polaroids ── */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>From the Beginning</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {groupMemories.map((mem, i) => (
            <motion.div key={mem.id} {...fadeUp} transition={{ delay: i * 0.07 }} whileHover={{ rotate: 0, scale: 1.05, zIndex: 10 }}
              style={{ transform: `rotate(${mem.rotation}deg)`, background: 'white', padding: '0.75rem 0.75rem 2.5rem', boxShadow: '0 8px 24px rgba(57,57,27,0.1)', marginTop: i % 2 === 0 ? '1rem' : '0' }}>
              <img src={mem.img} alt={mem.caption} style={{ width: '100%', height: '12rem', objectFit: 'cover' }} />
              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>{mem.caption}</p>
                <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{mem.subCaption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <motion.div {...fadeUp} style={{ background: 'var(--surface-container-low)', padding: 'clamp(2rem, 4vw, 4rem)', borderRadius: 'var(--radius)', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: 'var(--primary)', marginBottom: '3rem' }}>Timeline: Beginning → Now</h2>
          <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', top: '1rem', left: 0, right: 0, height: '2px', background: 'rgba(189,187,146,0.3)' }} />
            {timeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', maxWidth: '12rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: item.dotColor, border: '4px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '1rem' }} />
                <span style={{ fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: '0.75rem', color: item.dotColor, marginBottom: '0.35rem' }}>{item.date}</span>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
        <motion.div {...fadeUp} style={{ background: 'var(--surface-container-highest)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid rgba(189,187,146,0.15)' }}>
          <h4 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined">receipt_long</span>
            Stats that Matter
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {groupStats.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.45)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                <span style={{ display: 'block', fontSize: '2.25rem', fontWeight: 900, fontFamily: 'var(--font-headline)', color: ['var(--primary)', 'var(--secondary)', 'var(--tertiary)', 'var(--primary-dim)'][i] }}>{s.value}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

    </div>
  );
}
