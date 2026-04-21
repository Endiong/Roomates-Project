import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { timeline, groupStats } from '../data/roommates';
import { useAuth } from '../context/AuthContext';
import { addMemory, getMemories, deleteMemory } from '../firebase/db';
import { uploadPhoto } from '../firebase/storage';
import { Link } from 'react-router-dom';

// ── SCRAPBOOK DESIGNS ──────────────────────────────────────────────
import { TEXT_TEMPLATES, PHOTO_FRAMES } from '../data/templates';

// ── Mini template preview card ─────────────────────────────────────
function TemplatePreviewCard({ tpl, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      title={tpl.label}
      style={{
        flex: '1 1 calc(50% - 0.3rem)',
        minWidth: '120px',
        padding: 0,
        background: 'none',
        border: `2px solid ${selected ? tpl.border : 'rgba(189,187,146,0.2)'}`,
        borderRadius: '0.6rem',
        cursor: 'pointer',
        overflow: 'hidden',
        outline: selected ? `2.5px solid ${tpl.accent}` : 'none',
        outlineOffset: '2px',
        transition: 'all 0.2s',
        transform: selected ? 'scale(1.03)' : 'scale(1)',
      }}
    >
      {/* Mini preview */}
      <div style={{
        background: tpl.bg,
        ...(tpl.extraStyle || {}),
        padding: '0.6rem 0.6rem 0.5rem',
        position: 'relative',
        clipPath: tpl.clipPath,
      }}>
        {tpl.washiStrips && (
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(120,90,126,0.5)', backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(120,90,126,0.5)', backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
          </>
        )}
        <div style={{ position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '6px', borderRadius: '50%', background: tpl.pinColor, boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
        <p style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '0.65rem', color: 'var(--on-surface)', lineHeight: 1.3, minHeight: '2rem', margin: 0 }}>
          Sample note...
        </p>
      </div>
      <div style={{ padding: '0.3rem 0.5rem', background: selected ? `${tpl.accent}18` : 'transparent', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '0.75rem', color: tpl.accent }}>
          {selected ? 'check_circle' : tpl.icon}
        </span>
        <span style={{ fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: '0.65rem', color: selected ? tpl.accent : 'var(--on-surface-variant)' }}>
          {tpl.label}
        </span>
      </div>
    </button>
  );
}

// ── Mini frame preview card ────────────────────────────────────────
function FramePreviewCard({ fr, selected, onClick, preview }) {
  return (
    <button
      onClick={onClick}
      title={fr.label}
      style={{
        flex: '1 1 calc(50% - 0.3rem)',
        minWidth: '120px',
        padding: 0,
        background: 'none',
        border: `2px solid ${selected ? 'var(--primary)' : 'rgba(189,187,146,0.2)'}`,
        borderRadius: '0.6rem',
        cursor: 'pointer',
        overflow: 'hidden',
        outline: selected ? '2.5px solid var(--primary)' : 'none',
        outlineOffset: '2px',
        transition: 'all 0.2s',
        transform: selected ? 'scale(1.03)' : 'scale(1)',
      }}
    >
      <div style={{
        background: fr.sprockets ? '#1a1a1a' : 'var(--surface-container-low)',
        padding: '0.75rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70px',
        position: 'relative',
      }}>
        {fr.sprockets && (
          <>
            <div style={{ position: 'absolute', left: '4px', top: 0, bottom: 0, width: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '2px' }}>
              {[...Array(4)].map((_, i) => <div key={i} style={{ width: '6px', height: '5px', background: '#f5e6c8', borderRadius: '1px' }} />)}
            </div>
            <div style={{ position: 'absolute', right: '4px', top: 0, bottom: 0, width: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
              {[...Array(4)].map((_, i) => <div key={i} style={{ width: '6px', height: '5px', background: '#f5e6c8', borderRadius: '1px' }} />)}
            </div>
          </>
        )}
        <div style={{
          width: fr.borderRadius === '50%' ? '48px' : '54px',
          height: fr.borderRadius === '50%' ? '48px' : fr.id === 'polaroid' ? '54px' : '42px',
          background: fr.bg,
          borderRadius: fr.borderRadius || '2px',
          border: fr.border,
          boxShadow: fr.shadow,
          overflow: 'hidden',
          padding: fr.id === 'polaroid' ? '3px 3px 10px' : fr.id === 'filmstrip' ? '2px 5px' : '2px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {fr.taped && (
            <>
              <div style={{ position: 'absolute', top: '-0.3rem', left: '-0.8rem', transform: 'rotate(-45deg)', width: '3rem', height: '0.9rem', background: 'rgba(235, 230, 215, 0.85)', boxShadow: '1px 1px 3px rgba(0,0,0,0.1)' }} />
              <div style={{ position: 'absolute', bottom: '-0.3rem', right: '-0.8rem', transform: 'rotate(-45deg)', width: '3rem', height: '0.9rem', background: 'rgba(235, 230, 215, 0.85)', boxShadow: '1px 1px 3px rgba(0,0,0,0.1)' }} />
            </>
          )}
          {preview
            ? <img src={preview} alt="" style={{ width: '100%', height: fr.id === 'polaroid' || fr.id === 'polaroid-dark' ? 'calc(100% - 10px)' : '100%', objectFit: 'cover', borderRadius: fr.borderRadius === '50%' ? '50%' : '1px' }} />
            : <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: fr.bg === '#1a1a1a' || fr.bg === '#1c1c1c' ? '#f5e6c8' : 'var(--outline-variant)' }}>photo_camera</span>
          }
        </div>
      </div>
      <div style={{ padding: '0.3rem 0.5rem', background: selected ? 'var(--primary-container)' : 'transparent', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
          {selected ? 'check_circle' : 'photo_frame'}
        </span>
        <span style={{ fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: '0.65rem', color: selected ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
          {fr.label}
        </span>
      </div>
    </button>
  );
}

// ── Add Memory Modal ──────────────────────────────────────────────
function AddMemoryModal({ onClose, onAdded }) {
  const { currentUser } = useAuth();
  const [type, setType] = useState('photo');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [frame, setFrame] = useState('polaroid');
  const [template, setTemplate] = useState('sticky');
  const [caption, setCaption] = useState('');
  const [noteText, setNoteText] = useState('');
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split('T')[0]);
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
          authorNickname: currentUser.nickname,
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
          authorNickname: currentUser.nickname,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Type toggle */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {['photo', 'text'].map(t => (
          <button key={t} onClick={() => setType(t)} style={{
            flex: 1, padding: '0.65rem', borderRadius: 'var(--radius)',
            border: `2px solid ${type === t ? 'var(--primary)' : 'rgba(189,187,146,0.3)'}`,
            background: type === t ? 'var(--primary-container)' : 'var(--surface-container)',
            fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            color: type === t ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            transition: 'all 0.2s',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{t === 'photo' ? 'photo_camera' : 'edit_note'}</span>
            {t === 'photo' ? 'Photo' : 'Text Note'}
          </button>
        ))}
      </div>

      {/* ── PHOTO SECTION ── */}
      {type === 'photo' && (
        <div>
          <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.6rem' }}>
            Choose Frame Style
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
            {PHOTO_FRAMES.map(f => (
              <FramePreviewCard key={f.id} fr={f} selected={frame === f.id} onClick={() => setFrame(f.id)} preview={preview} />
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

      {/* ── TEXT SECTION ── */}
      {type === 'text' && (
        <div>
          <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.6rem' }}>
            Choose Note Style
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
            {TEXT_TEMPLATES.map(t => (
              <TemplatePreviewCard key={t.id} tpl={t} selected={template === t.id} onClick={() => setTemplate(t.id)} />
            ))}
          </div>
          {/* Live preview of text note */}
          <div style={{
            background: tpl?.bg,
            border: `2px solid ${tpl?.border}44`,
            borderRadius: '0.5rem',
            padding: '1rem 1rem 0.75rem',
            position: 'relative',
            clipPath: tpl?.clipPath,
            ...(tpl?.extraStyle || {}),
          }}>
            {tpl?.washiStrips && (
              <>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: `${tpl.border}80`, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', background: `${tpl.border}80`, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
              </>
            )}
            <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', width: '9px', height: '9px', borderRadius: '50%', background: tpl?.pinColor, boxShadow: '0 2px 5px rgba(0,0,0,0.25)' }} />
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Write your memory here..."
              rows={4}
              style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', fontFamily: "'Nanum Pen Script', cursive", fontSize: '1.1rem', color: 'var(--on-surface)', resize: 'none', outline: 'none', paddingTop: tpl?.washiStrips ? '0.5rem' : 0 }}
            />
          </div>
        </div>
      )}

      {/* Caption */}
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

      {/* Date taken */}
      <div>
        <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>When was this? <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>calendar_today</span></span>
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
        padding: '0.85rem', background: saving ? 'var(--outline-variant)' : 'var(--primary)',
        color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1rem',
        cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        boxShadow: saving ? 'none' : '0 6px 18px rgba(129,90,91,0.3)',
        transition: 'all 0.2s',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>save</span>
        {saving ? 'Saving memory...' : 'Save to Scrapbook'}
      </button>
    </div>
  );
}

// ── Author colour dots ─────────────────────────────────────────────
const AUTHOR_COLORS = {
  divine: '#815a5b',
  endiong: '#2a6d7a',
  nova: '#6a4a7a',
  esther: '#be7d2d',
  ediomo: '#3c6d5e',
  joy: '#785a7e',
};

function getAuthorColor(nickname) {
  if (!nickname) return 'var(--outline)';
  return AUTHOR_COLORS[nickname.toLowerCase()] || 'var(--outline)';
}

// ── Memory Wall Card ──────────────────────────────────────────────
function MemoryWallCard({ mem, i, isAdminUser, currentUserNickname, onDelete }) {
  const tpl = TEXT_TEMPLATES.find(t => t.id === mem.template) || TEXT_TEMPLATES[0];
  const rotation = mem.rotation ?? (i % 2 === 0 ? -2 : 2);
  const authorColor = getAuthorColor(mem.authorNickname || mem.author);

  // Delete for true authors only (or admins via dash)
  const isAuthor = currentUserNickname === mem.authorNickname;
  const canDelete = isAuthor;
  const isLockedOut = false;

  const dateLabel = mem.takenAt
    ? new Date(mem.takenAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  if (mem.type === 'text') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04 }}
        whileHover={{ rotate: 0, scale: 1.04, zIndex: 10 }}
        style={{
          transform: `rotate(${rotation}deg)`,
          background: tpl.bg,
          borderRadius: tpl.clipPath ? 0 : '0.5rem',
          clipPath: tpl.clipPath,
          padding: '1.25rem 1.25rem 1rem',
          boxShadow: tpl.extraStyle?.boxShadow || '0 6px 20px rgba(57,57,27,0.1)',
          position: 'relative',
          ...(tpl.extraStyle || {}),
        }}
      >
        {tpl.washiStrips && (
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: `${tpl.border}80`, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', background: `${tpl.border}80`, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
          </>
        )}
        {/* Realistic Pushpin */}
        <div style={{ position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: `radial-gradient(circle at 4px 4px, #ffffff 1px, ${tpl.pinColor} 5px, rgba(0,0,0,0.6) 12px)`, boxShadow: '0 6px 10px rgba(0,0,0,0.4)', position: 'relative', zIndex: 2 }} />
          <div style={{ width: '2px', height: '8px', background: 'linear-gradient(to right, #888, #ccc, #888)', marginTop: '-2px', zIndex: 1, boxShadow: '2px 2px 3px rgba(0,0,0,0.4)' }} />
        </div>
        <div style={{ paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: `1px solid ${tpl.border}33`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: authorColor, flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.7rem', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {mem.caption} — {mem.author}
              </p>
              {dateLabel && (
                <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.58rem', color: 'var(--outline)', opacity: 0.7, marginTop: '0.1rem' }}>
                  {dateLabel}
                </p>
              )}
            </div>
          </div>
          {canDelete && (
            <button onClick={() => onDelete(mem.id)} title="Delete" style={{ background: 'rgba(190,45,6,0.1)', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', padding: '0.15rem 0.3rem', display: 'flex', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.8rem', color: '#be2d06' }}>delete</span>
            </button>
          )}
        </div>
        <p style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1.05rem', color: 'var(--on-surface)', lineHeight: 1.6 }}>
          {mem.text}
        </p>
        {isLockedOut && (
          <span title="Can only delete within 72 hours of posting" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', opacity: 0.35 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--outline)' }}>lock</span>
          </span>
        )}
      </motion.div>
    );
  }

  // ── Photo memory ──
  const frameStyle = PHOTO_FRAMES.find(f => f.id === mem.frame) || PHOTO_FRAMES[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      whileHover={{ rotate: 0, scale: 1.04, zIndex: 10 }}
      style={{
        transform: `rotate(${rotation}deg)`,
        background: frameStyle.bg,
        padding: frameStyle.padding,
        borderRadius: mem.frame === 'round' ? '50%' : '2px',
        border: frameStyle.border || 'none',
        boxShadow: frameStyle.shadow,
        position: 'relative',
      }}
    >
      {/* Washi tape top accent */}
      {!frameStyle.taped && (
        <div style={{ position: 'absolute', top: '-0.65rem', left: '50%', transform: 'translateX(-50%) rotate(-2deg)', width: '4rem', height: '1.1rem', background: 'rgba(185,238,219,0.7)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)' }} />
      )}
      {frameStyle.taped && (
        <>
          <div style={{ position: 'absolute', top: '-0.5rem', left: '-1.5rem', transform: 'rotate(-45deg)', width: '4rem', height: '1.2rem', background: 'rgba(235, 230, 215, 0.85)', boxShadow: '0 2px 5px rgba(0,0,0,0.15)', zIndex: 5 }} />
          <div style={{ position: 'absolute', bottom: '-0.5rem', right: '-1.5rem', transform: 'rotate(-45deg)', width: '4rem', height: '1.2rem', background: 'rgba(235, 230, 215, 0.85)', boxShadow: '0 2px 5px rgba(0,0,0,0.15)', zIndex: 5 }} />
        </>
      )}
      {/* Film sprockets */}
      {mem.frame === 'filmstrip' && (
        <>
          <div style={{ position: 'absolute', left: '3px', top: 0, bottom: 0, width: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '2px', padding: '4px 0' }}>
            {[...Array(5)].map((_, i) => <div key={i} style={{ width: '6px', height: '5px', background: '#f5e6c8', borderRadius: '1px' }} />)}
          </div>
          <div style={{ position: 'absolute', right: '3px', top: 0, bottom: 0, width: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', padding: '4px 0' }}>
            {[...Array(5)].map((_, i) => <div key={i} style={{ width: '6px', height: '5px', background: '#f5e6c8', borderRadius: '1px' }} />)}
          </div>
        </>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <div>
          <p style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1rem', color: frameStyle.darkText || mem.frame === 'filmstrip' || mem.frame === 'gallery' ? '#f5e6c8' : 'var(--on-surface)' }}>{mem.caption}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: authorColor, flexShrink: 0 }} />
            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: frameStyle.darkText || mem.frame === 'filmstrip' || mem.frame === 'gallery' ? '#f5e6c8' : 'var(--outline)' }}>
              by {mem.author}
            </p>
          </div>
          {dateLabel && (
            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.56rem', color: mem.frame === 'filmstrip' ? '#f5e6c8' : 'var(--outline)', opacity: 0.65, marginTop: '0.1rem' }}>{dateLabel}</p>
          )}
        </div>
        {canDelete && (
          <button onClick={() => onDelete(mem.id)} title="Delete" style={{ background: 'rgba(190,45,6,0.15)', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', padding: '0.15rem 0.3rem', display: 'flex', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.8rem', color: '#be2d06' }}>delete</span>
          </button>
        )}
      </div>

      <img
        src={mem.photoUrl}
        alt={mem.caption}
        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', borderRadius: mem.frame === 'round' ? '50%' : '1px' }}
      />
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
      <section style={{ textAlign: 'center', padding: '5rem 1.5rem 3rem', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative floating stickers */}
        <div style={{ position: 'absolute', top: '2rem', left: '3%', opacity: 0.12, transform: 'rotate(15deg)', color: 'var(--tertiary)', pointerEvents: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '6rem', fontVariationSettings: "'FILL' 1" }}>favorite</span>
        </div>
        <div style={{ position: 'absolute', top: '1.5rem', right: '5%', opacity: 0.1, transform: 'rotate(-12deg)', color: 'var(--primary)', pointerEvents: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '5rem', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Torn paper heading */}
          <div style={{
            display: 'inline-block',
            background: 'var(--surface-container-high)',
            padding: '1.25rem 2.5rem 1.5rem',
            clipPath: "polygon(0% 2%, 4% 0%, 8% 2%, 14% 0%, 19% 2%, 25% 0%, 31% 2%, 37% 0%, 43% 2%, 49% 0%, 55% 2%, 61% 0%, 67% 2%, 73% 0%, 79% 2%, 85% 0%, 91% 2%, 96% 0%, 100% 2%, 100% 98%, 96% 100%, 91% 97%, 85% 100%, 79% 97%, 73% 100%, 67% 97%, 61% 100%, 55% 97%, 49% 100%, 43% 97%, 37% 100%, 31% 97%, 25% 100%, 19% 97%, 14% 100%, 8% 97%, 4% 100%, 0% 97%)",
            transform: 'rotate(-0.8deg)',
            marginBottom: '1.5rem',
            position: 'relative',
          }}>
            {/* Washi tape on torn paper card */}
            <div style={{ position: 'absolute', top: '-0.6rem', left: '50%', transform: 'translateX(-50%) rotate(2deg)', width: '5rem', height: '1.25rem', background: 'rgba(250,211,253,0.7)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)' }} />
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(2rem, 7vw, 4.5rem)', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', margin: 0 }}>
              The Core Memories.
            </h1>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--on-surface-variant)', maxWidth: '36rem', margin: '0 auto 1.75rem', lineHeight: 1.7 }}>
            Capturing the chaos, the suya runs, and the shared survival of living together.
          </p>
          {currentUser ? (
            <button
              onClick={() => { setModalKey(k => k + 1); setShowModal(true); }}
              style={{ marginTop: '0.5rem', background: 'var(--primary)', color: 'var(--on-primary)', padding: '1rem 2rem', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 24px rgba(129,90,91,0.3)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <span className="material-symbols-outlined">add_a_photo</span>
              Add a Memory
            </button>
          ) : (
            <Link to="/login" style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', background: 'var(--surface-container)', border: '1.5px solid rgba(189,187,146,0.4)', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--on-surface-variant)', textDecoration: 'none' }}>
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
              style={{ background: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '30rem', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(57,57,27,0.3)', position: 'relative' }}
            >
              {/* Scrapbook paper feel — washi tape at top */}
              <div style={{ position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%) rotate(-1deg)', width: '7rem', height: '1.5rem', background: 'rgba(185,238,219,0.7)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 16px)', zIndex: 10 }} />
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
            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-surface-variant)', opacity: 0.6, marginBottom: '0.25rem' }}>Live from our scrapbook</p>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', letterSpacing: '-0.04em', color: 'var(--primary)' }}>Our Memory Wall</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {Object.entries(AUTHOR_COLORS).map(([name, color]) => (
                <div key={name} title={name} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                  <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.58rem', color: 'var(--outline)', textTransform: 'capitalize' }}>{name}</span>
                </div>
              ))}
            </div>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', color: 'var(--outline)' }}>
              {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
            </span>
          </div>
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
            <p style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1.4rem', marginBottom: '0.5rem' }}>No memories yet!</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>Be the first to add one — sign in and tap "Add a Memory" above.</p>
          </motion.div>
        ) : (
          (() => {
            const memoriesByYear = memories.reduce((acc, mem) => {
              let year = '2026';
              if (mem.takenAt) {
                year = mem.takenAt.split('-')[0];
              } else if (mem.createdAt?.toDate) {
                year = mem.createdAt.toDate().getFullYear().toString();
              }
              if (!acc[year]) acc[year] = [];
              acc[year].push(mem);
              return acc;
            }, {});
            const sortedYears = Object.keys(memoriesByYear).sort((a,b) => b - a);

            return (
              <div>
                {sortedYears.map((year) => (
                  <div key={year} style={{ marginBottom: '3rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '2px solid rgba(189,187,146,0.3)', paddingBottom: '0.5rem' }}>
                      {year}
                    </h3>
                    <div className="masonry-wall">
                      {memoriesByYear[year].map((mem, i) => (
                        <div key={mem.id} className="masonry-item">
                          <MemoryWallCard
                            mem={mem}
                            i={i}
                            isAdminUser={isAdmin()}
                            currentUserNickname={currentUser?.nickname}
                            onDelete={handleDelete}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <motion.div {...fadeUp} style={{ background: 'var(--surface-container-low)', padding: 'clamp(2rem, 4vw, 4rem)', clipPath: "polygon(0% 2%, 4% 0%, 8% 2%, 14% 0%, 20% 2%, 26% 0%, 32% 2%, 38% 0%, 44% 2%, 50% 0%, 56% 2%, 62% 0%, 68% 2%, 74% 0%, 80% 2%, 86% 0%, 92% 2%, 97% 0%, 100% 2%, 100% 98%, 97% 100%, 92% 97%, 86% 100%, 80% 97%, 74% 100%, 68% 97%, 62% 100%, 56% 97%, 50% 100%, 44% 97%, 38% 100%, 32% 97%, 26% 100%, 20% 97%, 14% 100%, 8% 97%, 4% 100%, 0% 98%)", position: 'relative' }}>
          {/* washi tape accent */}
          <div style={{ position: 'absolute', top: '-0.5rem', right: '3rem', width: '6rem', height: '1.25rem', background: 'rgba(226,209,188,0.6)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)', transform: 'rotate(45deg)' }} />
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: 'var(--primary)', marginBottom: '3rem' }}>Timeline: Beginning → Now</h2>
          <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', top: '1rem', left: 0, right: 0, height: '2px', background: 'rgba(189,187,146,0.3)' }} />
            {timeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', maxWidth: '12rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: item.dotColor, border: '4px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '1rem', animation: item.pulse ? 'pulse 2s infinite' : 'none' }} />
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
