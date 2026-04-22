import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { timeline, groupStats } from '../data/roommates';
import { useAuth } from '../context/AuthContext';
import { addMemory, getMemories, deleteMemory, getMoods, setMood, deleteMood, updateMemoryPosition, clearAllMemoryPositions } from '../firebase/db';
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
          width: fr.isShape ? '54px' : '54px',
          height: fr.isShape ? '54px' : fr.id === 'polaroid' ? '54px' : '42px',
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
          clipPath: fr.clipPath,
        }}>
          {fr.taped && (
            <>
              <div style={{ position: 'absolute', top: '-0.3rem', left: '-0.8rem', transform: 'rotate(-45deg)', width: '3rem', height: '0.9rem', background: 'rgba(235, 230, 215, 0.85)', boxShadow: '1px 1px 3px rgba(0,0,0,0.1)' }} />
              <div style={{ position: 'absolute', bottom: '-0.3rem', right: '-0.8rem', transform: 'rotate(-45deg)', width: '3rem', height: '0.9rem', background: 'rgba(235, 230, 215, 0.85)', boxShadow: '1px 1px 3px rgba(0,0,0,0.1)' }} />
            </>
          )}
          {preview
            ? <img src={preview} alt="" style={{ width: '100%', height: fr.id === 'polaroid' || fr.id === 'polaroid-dark' ? 'calc(100% - 10px)' : '100%', objectFit: 'cover', borderRadius: '1px' }} />
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

// ── Unique Pin Styles Per Template ────────────────────────────────
// Returns JSX for a realistic, unique pin based on template + card ID
function getPinStyle(cardId, tpl) {
  // Pick a variant based on card ID hash for variety
  const idSum = cardId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const variant = idSum % 3; // 0, 1, or 2

  switch (tpl.id) {
    case 'sticky': {
      // Classic round thumbtack in gold/amber shades
      const colors = ['#e8a020', '#d4831a', '#c46a10'];
      const col = colors[variant];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '16px', height: '16px', borderRadius: '50%',
            background: `radial-gradient(circle at 5px 5px, #fff8 2px, ${col} 6px, rgba(0,0,0,0.5) 14px)`,
            boxShadow: `0 4px 10px rgba(0,0,0,0.35), inset 0 -2px 4px rgba(0,0,0,0.2)`,
          }} />
          <div style={{ width: '2.5px', height: '10px', background: 'linear-gradient(to bottom, #aaa, #777)', marginTop: '-2px', boxShadow: '1px 2px 3px rgba(0,0,0,0.3)' }} />
        </div>
      );
    }
    case 'torn': {
      // Paperclip (spiral wire)
      return (
        <div style={{ position: 'relative', top: '6px', filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.3))' }}>
          <svg width="18" height="32" viewBox="0 0 18 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 21V7C14.5 3.13401 11.366 0 7.5 0C3.63401 0 0.5 3.13401 0.5 7V24.5C0.5 28.0899 3.41015 31 7 31C10.5899 31 13.5 28.0899 13.5 24.5V9C13.5 7.34315 12.1569 6 10.5 6C8.84315 6 7.5 7.34315 7.5 9V20" stroke="#999" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
      );
    }
    case 'corkboard': {
      // Classic round corkboard pushpin — red, blue or green
      const pinColors = ['#d63031', '#0984e3', '#00b894'];
      const pc = pinColors[variant];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '18px', height: '18px', borderRadius: '50%',
            background: `radial-gradient(circle at 5px 5px, rgba(255,255,255,0.5) 2px, ${pc} 7px, rgba(0,0,0,0.4) 16px)`,
            boxShadow: `0 5px 12px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.3) inset`,
          }} />
          <div style={{ width: '3px', height: '12px', background: 'linear-gradient(to right, #aaa, #eee, #aaa)', marginTop: '-2px', boxShadow: '2px 2px 4px rgba(0,0,0,0.4)' }} />
        </div>
      );
    }
    case 'washi': {
      // Decorative sticker pin: flower, butterfly or heart shapes
      const icons = ['✿', '❀', '✦'];
      const iconColors = ['#e084c8', '#c06abf', '#9b59b6'];
      return (
        <div style={{
          fontSize: '22px', lineHeight: 1, color: iconColors[variant],
          textShadow: `0 2px 8px rgba(0,0,0,0.2)`,
          filter: 'drop-shadow(0 2px 3px rgba(120,90,126,0.4))',
        }}>
          {icons[variant]}
        </div>
      );
    }
    case 'kraft': {
      // Brass upholstery tack
      const brassShades = ['#c8a84b', '#b8943c', '#a07830'];
      const bs = brassShades[variant];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '14px', height: '14px', borderRadius: '50%',
            background: `radial-gradient(circle at 4px 4px, #fff4 1px, ${bs} 5px, rgba(0,0,0,0.45) 12px)`,
            boxShadow: `0 3px 8px rgba(0,0,0,0.35)`,
          }} />
          <div style={{ width: '2px', height: '8px', background: 'linear-gradient(to right, #999, #ccc, #999)', marginTop: '-1px' }} />
        </div>
      );
    }
    case 'grid': {
      // Blue/teal pushpin — office style
      const gridPinColors = ['#2980b9', '#16a085', '#8e44ad'];
      const gpc = gridPinColors[variant];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '15px', height: '15px', borderRadius: '50%',
            background: `radial-gradient(circle at 4px 4px, rgba(255,255,255,0.4) 2px, ${gpc} 6px, rgba(0,0,0,0.4) 13px)`,
            boxShadow: `0 4px 10px rgba(0,0,0,0.3)`,
          }} />
          <div style={{ width: '2px', height: '9px', background: 'linear-gradient(to right, #888, #ccc, #888)', marginTop: '-2px' }} />
        </div>
      );
    }
    case 'postcard': {
      // Wax seal sticker pin
      const sealColors = ['#c0392b', '#922b21', '#cb4335'];
      const sc = sealColors[variant];
      return (
        <div style={{
          width: '20px', height: '20px', borderRadius: '50%',
          background: `radial-gradient(circle at 7px 7px, #fff3 2px, ${sc} 8px, rgba(0,0,0,0.3) 18px)`,
          boxShadow: `0 4px 10px rgba(0,0,0,0.35)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '8px', color: 'rgba(255,255,255,0.7)',
        }}>★</div>
      );
    }
    case 'receipt': {
      // Office staple — double metal bar
      return (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {[0, 1].map(k => (
            <div key={k} style={{
              width: '8px', height: '14px',
              border: '2px solid #9e9e9e',
              borderBottom: '2px solid #9e9e9e',
              borderRadius: '1px 1px 0 0',
              background: 'transparent',
              boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
            }} />
          ))}
        </div>
      );
    }
    default: {
      // Fallback: generic round pin
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: tpl.pinColor || '#815a5b', boxShadow: '0 3px 8px rgba(0,0,0,0.3)' }} />
          <div style={{ width: '2px', height: '8px', background: '#aaa', marginTop: '-1px' }} />
        </div>
      );
    }
  }
}

// ── Memory Wall Card ──────────────────────────────────────────────
function MemoryWallCard({ mem, i, isAdminUser, currentUserNickname, onDelete, onExpand, isLandscape, cardW }) {
  const tpl = TEXT_TEMPLATES.find(t => t.id === mem.template) || TEXT_TEMPLATES[0];
  const rotation = mem.rotation ?? (i % 2 === 0 ? -2 : 2);
  const authorColor = getAuthorColor(mem.authorNickname || mem.author);

  const idSum = mem.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const scatterX = (idSum % 60) - 30;
  const scatterY = ((idSum * 3) % 40) - 20;

  // Delete for true authors only (or admins via dash)
  const isAuthor = currentUserNickname === mem.authorNickname;
  const canDelete = isAuthor;
  const isLockedOut = false;

  const dateLabel = mem.takenAt
    ? new Date(mem.takenAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  if (mem.type === 'text') {
    return (
      <div
        className="memory-card-hover"
        style={{
          transform: `rotate(${rotation}deg) translate(${scatterX}px, ${scatterY}px)`,
          width: '210px',
          cursor: 'pointer',
          position: 'relative',
          transition: 'transform 0.25s',
          zIndex: 1,
        }}
      >
        <div style={{
          background: tpl.bg,
          borderRadius: tpl.clipPath ? 0 : '0.5rem',
          clipPath: tpl.clipPath,
          padding: '1.25rem 1.25rem 1rem',
          boxShadow: tpl.extraStyle?.boxShadow || '0 6px 20px rgba(57,57,27,0.1)',
          ...(tpl.extraStyle || {}),
        }}>
          {tpl.washiStrips && (
            <>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: `${tpl.border}80`, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', background: `${tpl.border}80`, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
            </>
          )}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', flexShrink: 0 }}>
              {mem.text && mem.text.length > 120 && (
                <span title="Long note — click to read" className="material-symbols-outlined" style={{ fontSize: '0.75rem', color: tpl.accent, opacity: 0.65 }}>unfold_more</span>
              )}
              {canDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(mem.id); }} title="Delete" style={{ background: 'rgba(190,45,6,0.1)', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', padding: '0.15rem 0.3rem', display: 'flex', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.8rem', color: '#be2d06' }}>delete</span>
                </button>
              )}
            </div>
          </div>
          {/* Note text — truncate long ones with fade */}
          <div style={{ position: 'relative', overflow: 'hidden', maxHeight: mem.text && mem.text.length > 120 ? '5.5rem' : 'none' }}>
            <p style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1.05rem', color: 'var(--on-surface)', lineHeight: 1.6 }}>
              {mem.text}
            </p>
            {mem.text && mem.text.length > 120 && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5rem', background: `linear-gradient(to bottom, transparent, ${tpl.bg || '#fffde7'})`, pointerEvents: 'none' }} />
            )}
          </div>
        </div>

        {/* Unique Pin per template — outside clipPath so it shows properly */}
        <div style={{ position: 'absolute', top: '-1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, pointerEvents: 'none' }}>
          {getPinStyle(mem.id, tpl)}
        </div>

        {isLockedOut && (
          <span title="Can only delete within 72 hours of posting" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', opacity: 0.35 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--outline)' }}>lock</span>
          </span>
        )}
      </div>
    );
  }

  // ── Photo memory ──
  const frameStyle = PHOTO_FRAMES.find(f => f.id === mem.frame) || PHOTO_FRAMES[0];
  return (
    <div
      className="memory-card-hover"
      style={{
        transform: `rotate(${rotation}deg) translate(${scatterX}px, ${scatterY}px)`,
        width: '180px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.25s',
      }}
    >
      <div style={{
        background: frameStyle.bg,
        padding: frameStyle.padding,
        borderRadius: mem.frame === 'round' ? '50%' : '2px',
        border: frameStyle.border || 'none',
        boxShadow: frameStyle.shadow,
        position: 'relative',
        width: '100%',
        height: '100%',
      }}>
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
            <button onClick={(e) => { e.stopPropagation(); onDelete(mem.id); }} title="Delete" style={{ background: 'rgba(190,45,6,0.15)', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', padding: '0.15rem 0.3rem', display: 'flex', flexShrink: 0, position: 'relative', zIndex: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.8rem', color: '#be2d06' }}>delete</span>
            </button>
          )}
        </div>

        <img
          src={mem.photoUrl}
          alt={mem.caption}
          style={{ width: '100%', aspectRatio: isLandscape ? '4/3' : '1', objectFit: 'cover', display: 'block', borderRadius: '1px' }}
        />
        {isLockedOut && (
          <span title="Can only delete within 72 hours of posting" style={{ position: 'absolute', top: '0.35rem', right: '0.35rem', opacity: 0.3 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--outline)' }}>lock</span>
          </span>
        )}
      </div>
    </div>
  );
}

// ── Scattered Memory Wall ──────────────────────────────────────────
// Deterministic pseudorandom scrapbook layout — no overlapping, mixed card sizes.
// Recent memories appear toward the top of the wall.

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(s) / 0x7fffffff;
  };
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function ScatteredMemoryWall({ memories, isAdminUser, currentUserNickname, onDelete, onExpand }) {
  const getBreakpoint = () => {
    if (typeof window === 'undefined') return 'desktop';
    if (window.innerWidth < 640) return 'mobile';
    if (window.innerWidth < 1024) return 'tablet';
    return 'desktop';
  };

  const [breakpoint, setBreakpoint] = useState(getBreakpoint);
  const [resetKey, setResetKey] = useState(0);
  const wallRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setBreakpoint(getBreakpoint());
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sort memories: newest first by takenAt, then by createdAt
  const sorted = [...memories].sort((a, b) => {
    const da = a.takenAt ? new Date(a.takenAt) : (a.createdAt?.toDate?.() || new Date(0));
    const db = b.takenAt ? new Date(b.takenAt) : (b.createdAt?.toDate?.() || new Date(0));
    return db - da;
  });

  if (breakpoint === 'mobile') {
    // Mobile: 1-column layout
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0 2rem', alignItems: 'center' }}>
        {sorted.map((mem, i) => (
          <div key={mem.id} style={{ width: '100%', maxWidth: '380px' }}>
            <MemoryWallCard
              mem={{ ...mem, rotation: 0 }}
              i={i}
              isAdminUser={isAdminUser}
              currentUserNickname={currentUserNickname}
              onDelete={onDelete}
              onExpand={onExpand}
            />
          </div>
        ))}
      </div>
    );
  }

  if (breakpoint === 'tablet') {
    // Tablet: 2-column masonry-style stagger with slight rotations
    const col0 = sorted.filter((_, i) => i % 2 === 0);
    const col1 = sorted.filter((_, i) => i % 2 === 1);
    return (
      <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem 0 2rem', alignItems: 'flex-start', justifyContent: 'center' }}>
        {[col0, col1].map((col, ci) => (
          <div key={ci} style={{ flex: 1, maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: ci === 1 ? '2rem' : 0 }}>
            {col.map((mem, i) => (
              <div key={mem.id} style={{ width: '100%' }}>
                <MemoryWallCard
                  mem={{ ...mem, rotation: ((ci + i) % 2 === 0 ? -1.5 : 1.5) }}
                  i={i}
                  isAdminUser={isAdminUser}
                  currentUserNickname={currentUserNickname}
                  onDelete={onDelete}
                  onExpand={onExpand}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: scattered absolute layout
  const COLS = 5;
  const SCATTER_Y = 22;

  const colHeights = Array(COLS).fill(0);
  const cards = sorted.map((mem, i) => {
    const rng = seededRandom(hashStr(mem.id + 'layout'));
    const r1 = rng(); const r2 = rng(); const r3 = rng(); const r4 = rng();

    const isLandscape = hashStr(mem.id) % 4 === 0 && mem.type === 'photo';
    const cardW = isLandscape ? 290 : 190;
    const spanCols = Math.min(isLandscape ? 2 : 1, COLS);

    let bestCol = 0;
    let bestHeight = Infinity;
    for (let c = 0; c <= COLS - spanCols; c++) {
      const maxH = Math.max(...colHeights.slice(c, c + spanCols));
      if (maxH < bestHeight) { bestHeight = maxH; bestCol = c; }
    }

    const baseXPercent = (bestCol / COLS) * 100;
    const baseY = bestHeight + (r2 * 2 - 1) * SCATTER_Y + (i === 0 ? 0 : 18);
    const estimatedH = mem.type === 'text' ? 210 : (isLandscape ? 230 : 270);
    const rowH = estimatedH + 28;

    for (let c = bestCol; c < bestCol + spanCols; c++) {
      colHeights[c] = Math.max(colHeights[c], bestHeight + rowH);
    }

    const rotation = mem.rotation ?? ((r3 * 14) - 7);
    const scatterX = (r4 * 2 - 1) * 8;

    const xStr = mem.customX !== undefined ? `${mem.customX}px` : `calc(${baseXPercent}% + ${scatterX}px)`;
    const finalYStr = mem.customY !== undefined ? `${mem.customY}px` : `${baseY}px`;

    return { mem, i, xStr, finalYStr, cardW, isLandscape, rotation };
  });

  const totalHeight = Math.max(...colHeights) + 100;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: `${totalHeight + 40}px`,
      minHeight: '600px',
      padding: '1.5rem 0 3rem',
      display: 'flex',
      justifyContent: 'center',
    }}>
      {isAdminUser && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 50 }}>
          <button
            onClick={async () => {
              if (!confirm('Reset all manually dragged memories?')) return;
              await clearAllMemoryPositions();
              window.location.reload();
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: 'var(--surface-container)', color: 'var(--primary)',
              border: '1.5px solid rgba(129,90,91,0.25)', borderRadius: 'var(--radius-full)',
              padding: '0.45rem 0.85rem', fontFamily: 'var(--font-headline)',
              fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(57,57,27,0.1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,90,91,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(129,90,91,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(57,57,27,0.1)'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>grid_view</span>
            Align
          </button>
        </div>
      )}

      <div ref={wallRef} style={{ position: 'relative', width: '100%', minWidth: '920px', height: `${totalHeight}px`, margin: '0 auto' }}>
        {cards.map(({ mem, i, xStr, finalYStr, cardW, isLandscape, rotation }) => {
          const isOwner = currentUserNickname === mem.authorNickname;
          const canDrag = isAdminUser || isOwner;
          return (
          <motion.div
            key={`${mem.id}-${resetKey}`}
            onTap={() => onExpand(mem)}
            drag={canDrag}
            dragConstraints={wallRef}
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={async (e) => {
              if (!canDrag || !wallRef.current) return;
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const parentRect = wallRef.current.getBoundingClientRect();
              const newX = rect.left - parentRect.left;
              const newY = rect.top - parentRect.top;
              await updateMemoryPosition(mem.id, newX, newY);
            }}
            style={{
              position: 'absolute',
              left: xStr,
              top: finalYStr,
              width: `${cardW}px`,
              zIndex: Math.floor(10 + i * 0.5),
              cursor: canDrag ? 'grab' : 'default',
            }}
            whileDrag={{ zIndex: 999, cursor: 'grabbing', scale: 1.04 }}
          >
            <MemoryWallCard
              mem={{ ...mem, rotation }}
              i={i}
              isAdminUser={isAdminUser}
              currentUserNickname={currentUserNickname}
              onDelete={onDelete}
              onExpand={onExpand}
              isLandscape={isLandscape}
              cardW={cardW}
            />
          </motion.div>
          );
        })}
      </div>
    </div>
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
  const [expandedMem, setExpandedMem] = useState(null);

  // ── Mood state ──
  const [moods, setMoods] = useState([]);
  const [showMoodInput, setShowMoodInput] = useState(false);
  const [moodEmoji, setMoodEmoji] = useState('✨');
  const [moodText, setMoodText] = useState('');
  const [savingMood, setSavingMood] = useState(false);
  const MOOD_MAX = 72;
  const MOOD_MIN = 6;
  const EMOJI_OPTIONS = ['✨', '🍕', '😴', '💀', '🎉', '😭', '🧼', '💃', '📚', '🍞', '🤩', '😤'];

  async function fetchMoods() {
    try {
      const m = await getMoods();
      setMoods(m);
    } catch (e) {
      console.error('Failed to load moods:', e);
    }
  }

  async function handleSaveMood() {
    if (!currentUser || !moodText.trim() || moodText.trim().length < MOOD_MIN) return;
    setSavingMood(true);
    try {
      await setMood(currentUser.nickname, {
        emoji: moodEmoji,
        text: moodText.trim(),
        displayName: currentUser.displayNickname || currentUser.nickname,
      });
      await fetchMoods();
      setShowMoodInput(false);
      setMoodText('');
    } catch (e) {
      console.error('Failed to save mood:', e);
    }
    setSavingMood(false);
  }

  async function handleClearMood() {
    if (!currentUser) return;
    try {
      await deleteMood(currentUser.nickname);
      await fetchMoods();
    } catch (e) {
      console.error('Failed to clear mood:', e);
    }
  }

  async function fetchMemories() {
    setLoadingMems(true);
    try {
      const mems = await getMemories();
      const adminMode = currentUser?.role === 'admin';
      setMemories(adminMode ? mems : mems.filter(m => m.visible !== false));
    } catch (e) {
      console.error('Failed to load memories:', e);
    }
    setLoadingMems(false);
  }

  useEffect(() => {
    fetchMemories();
    fetchMoods();
  }, [currentUser?.role]);

  async function handleDelete(id) {
    if (!confirm('Delete this memory permanently?')) return;
    await deleteMemory(id);
    setMemories(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div className="scrapbook-dots memories-page-root">

      {/* ── HERO — Reference-style: torn paper left + upload button right ── */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1.5rem 1.5rem', position: 'relative' }}>
        {/* Decorative floating stickers */}
        <div style={{ position: 'absolute', top: '1rem', left: '1%', opacity: 0.08, transform: 'rotate(15deg)', color: 'var(--tertiary)', pointerEvents: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '6rem', fontVariationSettings: "'FILL' 1" }}>favorite</span>
        </div>
        <div style={{ position: 'absolute', top: '0.5rem', right: '3%', opacity: 0.07, transform: 'rotate(-12deg)', color: 'var(--primary)', pointerEvents: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '5rem', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          {/* Torn-paper heading card (matching reference exactly) */}
          <div style={{
            position: 'relative',
            display: 'inline-block',
            background: 'var(--surface-container-high)',
            padding: '1.5rem 2.5rem 1.75rem',
            clipPath: "polygon(0% 0%, 5% 2%, 10% 0%, 15% 3%, 20% 0%, 25% 2%, 30% 0%, 35% 3%, 40% 0%, 45% 2%, 50% 0%, 55% 3%, 60% 0%, 65% 2%, 70% 0%, 75% 3%, 80% 0%, 85% 2%, 90% 0%, 95% 3%, 100% 0%, 100% 100%, 95% 97%, 90% 100%, 85% 98%, 80% 100%, 75% 97%, 70% 100%, 65% 98%, 60% 100%, 55% 97%, 50% 100%, 45% 98%, 40% 100%, 35% 97%, 30% 100%, 25% 98%, 20% 100%, 15% 97%, 10% 100%, 5% 98%, 0% 100%)",
            transform: 'rotate(-1deg)',
            boxShadow: '0 6px 20px rgba(57,57,27,0.1)',
          }}>
            {/* Washi tape strip on top */}
            <div style={{
              position: 'absolute',
              top: '-0.7rem',
              left: '50%',
              transform: 'translateX(-50%) rotate(12deg)',
              width: '6rem',
              height: '1.4rem',
              background: 'rgba(250,211,253,0.75)',
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.25) 8px, rgba(255,255,255,0.25) 16px)',
              zIndex: -1,
            }} />
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(1.6rem, 4vw, 3rem)',
              fontWeight: 800,
              color: 'var(--on-surface)',
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1.15,
            }}>
              Shared Memories: The NDDC Story
            </h1>
            <p style={{
              fontFamily: 'var(--font-label)',
              fontSize: '0.95rem',
              fontStyle: 'italic',
              fontWeight: 500,
              color: 'var(--on-surface-variant)',
              marginTop: '0.4rem',
            }}>
              Every messy moment, perfectly clocked.
            </p>
          </div>

        </motion.div>

        {/* ── MOOD UPDATES SECTION — Live from Firestore ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{ marginTop: '2.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary-dim)', whiteSpace: 'nowrap' }}>Mood Updates</h2>
            <div style={{ flexGrow: 1, height: '1px', background: 'var(--outline-variant)' }} />
            {/* Add mood button for logged-in non-admin users */}
            {currentUser && !isAdmin() && (
              <button
                onClick={() => setShowMoodInput(v => !v)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)',
                  background: showMoodInput ? 'var(--primary-container)' : 'transparent',
                  border: '1.5px solid rgba(189,187,146,0.4)',
                  fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: '0.72rem',
                  color: 'var(--primary)', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>{showMoodInput ? 'close' : 'mood'}</span>
                {showMoodInput ? 'Cancel' : 'Update my mood'}
              </button>
            )}
          </div>

          {/* Mood input form */}
          <AnimatePresence>
            {showMoodInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden', marginBottom: '1rem' }}
              >
                <div style={{
                  background: 'var(--surface-container-low)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  border: '1.5px solid rgba(189,187,146,0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                  {/* Emoji picker */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {EMOJI_OPTIONS.map(e => (
                      <button key={e} onClick={() => setMoodEmoji(e)} style={{
                        fontSize: '1.25rem', padding: '0.2rem 0.4rem',
                        borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                        background: moodEmoji === e ? 'var(--primary-container)' : 'transparent',
                        transform: moodEmoji === e ? 'scale(1.2)' : 'scale(1)',
                        transition: 'all 0.15s',
                      }}>{e}</button>
                    ))}
                  </div>
                  {/* Text input */}
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={moodText}
                      onChange={e => setMoodText(e.target.value.slice(0, MOOD_MAX))}
                      placeholder={`How's the vibe? (${MOOD_MIN}–${MOOD_MAX} chars)`}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '0.6rem 3rem 0.6rem 0.9rem',
                        borderRadius: '0.65rem',
                        border: `1.5px solid ${moodText.length < MOOD_MIN && moodText.length > 0 ? 'var(--error)' : 'rgba(189,187,146,0.4)'}`,
                        background: 'var(--surface-container-lowest)',
                        fontFamily: 'var(--font-label)', fontSize: '0.9rem',
                        color: 'var(--on-surface)', outline: 'none',
                      }}
                    />
                    <span style={{
                      position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                      fontFamily: 'var(--font-label)', fontSize: '0.6rem', fontWeight: 700,
                      color: moodText.length > MOOD_MAX * 0.85 ? 'var(--error)' : 'var(--outline)',
                      opacity: 0.7,
                    }}>{moodText.length}/{MOOD_MAX}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleSaveMood}
                      disabled={savingMood || moodText.trim().length < MOOD_MIN}
                      style={{
                        flex: 1, padding: '0.55rem', borderRadius: 'var(--radius-full)',
                        background: moodText.trim().length >= MOOD_MIN ? 'var(--primary)' : 'rgba(189,187,146,0.3)',
                        color: moodText.trim().length >= MOOD_MIN ? 'white' : 'var(--outline)',
                        border: 'none', fontFamily: 'var(--font-headline)', fontWeight: 700,
                        fontSize: '0.85rem', cursor: moodText.trim().length >= MOOD_MIN ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                      }}
                    >
                      {savingMood ? 'Saving...' : `${moodEmoji} Post Mood`}
                    </button>
                    {moods.find(m => m.nickname === currentUser?.nickname) && (
                      <button
                        onClick={handleClearMood}
                        style={{
                          padding: '0.55rem 1rem', borderRadius: 'var(--radius-full)',
                          background: 'transparent', border: '1.5px solid rgba(190,45,6,0.25)',
                          color: 'var(--error)', fontFamily: 'var(--font-headline)', fontWeight: 600,
                          fontSize: '0.8rem', cursor: 'pointer',
                        }}
                      >
                        Clear mine
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live mood chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {moods.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-label)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--outline)', opacity: 0.6 }}>
                No moods yet — be the first to share yours!
              </p>
            ) : moods.map((mood, i) => {
              const rotations = ['1deg', '-2deg', '1.5deg', '-1deg', '2deg', '-1.5deg'];
              const bgs = ['var(--surface-container-low)', 'var(--secondary-container)', 'var(--tertiary-container)', 'var(--surface-container)', 'var(--primary-container)'];
              const relativeDate = mood.updatedAt?.toDate
                ? (() => {
                    const diff = Date.now() - mood.updatedAt.toDate().getTime();
                    if (diff < 60000) return 'just now';
                    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
                    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
                    return mood.updatedAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                  })()
                : '';
              return (
                <div key={mood.id} style={{
                  background: bgs[i % bgs.length],
                  padding: '0.65rem 1rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(189,187,146,0.15)',
                  boxShadow: '0 2px 8px rgba(57,57,27,0.06)',
                  transform: `rotate(${rotations[i % rotations.length]})`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  maxWidth: '220px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{mood.emoji}</span>
                    <span style={{ fontFamily: 'var(--font-label)', fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--on-surface)', lineHeight: 1.3 }}>{mood.text}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', paddingLeft: '0.25rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--outline-variant)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.58rem', color: 'var(--outline)', textTransform: 'capitalize' }}>
                      {mood.displayName || mood.nickname}
                    </span>
                    {relativeDate && (
                      <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.55rem', color: 'var(--outline)', opacity: 0.6 }}>
                        · {relativeDate}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      </section>

      {/* ── EXPANDED LIGHTBOX ── */}
      <AnimatePresence>
        {expandedMem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpandedMem(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'zoom-out' }}
          >
            {expandedMem.type === 'text' ? (
              // ── TEXT NOTE: Wide horizontal card with scroll ──
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                onClick={e => e.stopPropagation()}
                style={{
                  background: (() => {
                    const tpl = TEXT_TEMPLATES.find(t => t.id === expandedMem.template) || TEXT_TEMPLATES[0];
                    return tpl.bg;
                  })(),
                  ...( (() => {
                    const tpl = TEXT_TEMPLATES.find(t => t.id === expandedMem.template) || TEXT_TEMPLATES[0];
                    return tpl.extraStyle || {};
                  })() ),
                  clipPath: (() => {
                    const tpl = TEXT_TEMPLATES.find(t => t.id === expandedMem.template) || TEXT_TEMPLATES[0];
                    return tpl.clipPath;
                  })(),
                  borderRadius: (() => {
                    const tpl = TEXT_TEMPLATES.find(t => t.id === expandedMem.template) || TEXT_TEMPLATES[0];
                    return tpl.clipPath ? 0 : '0.75rem';
                  })(),
                  width: '100%',
                  maxWidth: '44rem',
                  maxHeight: '80vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Pin at top */}
                {(() => {
                  const tpl = TEXT_TEMPLATES.find(t => t.id === expandedMem.template) || TEXT_TEMPLATES[0];
                  const PIN_STYLES = getPinStyle(expandedMem.id || 'x', tpl);
                  return (
                    <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                      {PIN_STYLES}
                    </div>
                  );
                })()}
                {/* Washi strips if applicable */}
                {(() => {
                  const tpl = TEXT_TEMPLATES.find(t => t.id === expandedMem.template) || TEXT_TEMPLATES[0];
                  return tpl.washiStrips ? (
                    <>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: `${tpl.border}80`, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6px', background: `${tpl.border}80`, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
                    </>
                  ) : null;
                })()}
                {/* Header */}
                {(() => {
                  const tpl = TEXT_TEMPLATES.find(t => t.id === expandedMem.template) || TEXT_TEMPLATES[0];
                  const authorColor = getAuthorColor(expandedMem.authorNickname || expandedMem.author);
                  const dateLabel = expandedMem.takenAt
                    ? new Date(expandedMem.takenAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : null;
                  return (
                    <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: `1px solid ${tpl.border}22` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: authorColor, flexShrink: 0 }} />
                        <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.8rem', color: tpl.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {expandedMem.caption} — {expandedMem.author}
                        </p>
                      </div>
                      {dateLabel && <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', color: 'var(--outline)', marginTop: '0.2rem', marginLeft: '1.1rem' }}>{dateLabel}</p>}
                    </div>
                  );
                })()}
                {/* Scrollable note body */}
                <div style={{ overflowY: 'auto', padding: '1.25rem 1.75rem 2rem', flex: 1 }}>
                  <p style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', color: 'var(--on-surface)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {expandedMem.text}
                  </p>
                </div>
                {/* Close button */}
                <button
                  onClick={() => setExpandedMem(null)}
                  style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--on-surface-variant)' }}>close</span>
                </button>
              </motion.div>
            ) : (
              // ── PHOTO: large lightbox ──
              <motion.div
                initial={{ scale: 0.85, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', cursor: 'default', maxWidth: '90vw' }}
              >
                <div style={{ transform: 'scale(1.4)', transformOrigin: 'center center', pointerEvents: 'none' }}>
                  <MemoryWallCard mem={{...expandedMem, rotation: 0}} i={0} isAdminUser={isAdmin()} currentUserNickname={currentUser?.nickname} onDelete={()=>{}} onExpand={()=>{}} />
                </div>

                {expandedMem.photoUrl && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(expandedMem.photoUrl);
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        const dateStr = expandedMem.takenAt || (expandedMem.createdAt?.toDate ? expandedMem.createdAt.toDate().toISOString().split('T')[0] : expandedMem.id);
                        a.download = `memory-${dateStr}.jpg`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch {
                        window.open(expandedMem.photoUrl, '_blank');
                      }
                    }}
                    style={{ marginTop: '3rem', padding: '0.8rem 2rem', background: '#fff', color: '#111', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', pointerEvents: 'auto', transition: 'transform 0.2s', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>download</span>
                    Save Photo
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-surface-variant)', opacity: 0.6, marginBottom: '0.25rem' }}>Live from our scrapbook</p>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', letterSpacing: '-0.04em', color: 'var(--primary)' }}>
              Our Memory Wall 
              <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.9rem', color: 'var(--outline)', marginLeft: '0.75rem', fontWeight: 600 }}>
                ({memories.length} {memories.length === 1 ? 'memory' : 'memories'})
              </span>
            </h2>
          </div>
          
          {/* Upload Button moved here */}
          {currentUser && !isAdmin() ? (
            <button
              onClick={() => { setModalKey(k => k + 1); setShowModal(true); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--primary)',
                color: 'var(--on-primary)',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                boxShadow: '0 4px 12px rgba(129,90,91,0.25)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(129,90,91,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(129,90,91,0.25)'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>add_a_photo</span>
              Upload a Group Memory
            </button>
          ) : !isAdmin() ? (
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--surface-container)',
                border: '1.5px solid rgba(189,187,146,0.4)',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: 'var(--on-surface-variant)',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>lock</span>
              Sign in to add memories
            </Link>
          ) : null}
        </div>

        {loadingMems ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', padding: '1rem 0' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ width: i % 3 === 0 ? '280px' : '180px', height: `${13 + (i % 3) * 3}rem`, background: 'var(--surface-container)', borderRadius: '0.5rem', opacity: 0.5 }} />
            ))}
          </div>
        ) : memories.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--outline)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'block' }}>photo_library</span>
            <p style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1.4rem', marginBottom: '0.5rem' }}>No memories yet!</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>Be the first to add one — sign in and tap "Upload a Group Memory" above.</p>
          </motion.div>
        ) : (
          <ScatteredMemoryWall
            memories={memories}
            isAdminUser={isAdmin()}
            currentUserNickname={currentUser?.nickname}
            onDelete={handleDelete}
            onExpand={setExpandedMem}
          />
        )}
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <motion.div {...fadeUp} style={{ background: 'var(--surface-container-low)', padding: 'clamp(2rem, 4vw, 4rem)', clipPath: "polygon(0% 2%, 4% 0%, 8% 2%, 14% 0%, 20% 2%, 26% 0%, 32% 2%, 38% 0%, 44% 2%, 50% 0%, 56% 2%, 62% 0%, 68% 2%, 74% 0%, 80% 2%, 86% 0%, 92% 2%, 97% 0%, 100% 2%, 100% 98%, 97% 100%, 92% 97%, 86% 100%, 80% 97%, 74% 100%, 68% 97%, 62% 100%, 56% 97%, 50% 100%, 44% 97%, 38% 100%, 32% 97%, 26% 100%, 20% 97%, 14% 100%, 8% 97%, 4% 100%, 0% 98%)", position: 'relative' }}>
          {/* washi tape accent */}
          <div style={{ position: 'absolute', top: '-0.5rem', right: '3rem', width: '6rem', height: '1.25rem', background: 'rgba(226,209,188,0.6)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)', transform: 'rotate(45deg)' }} />
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: 'var(--primary)', marginBottom: '2rem' }}>Timeline: Beginning → Now</h2>
          {/* Horizontal scroll on mobile, flex-wrap on desktop */}
          <div style={{ overflowX: 'auto', paddingBottom: '0.5rem', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ position: 'relative', display: 'flex', flexWrap: 'nowrap', gap: '1.5rem', minWidth: 'max-content', paddingTop: '0.75rem' }}>
              <div style={{ position: 'absolute', top: '0.75rem', left: 0, right: 0, height: '2px', background: 'rgba(189,187,146,0.3)' }} />
              {timeline.map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', width: '11rem', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: item.dotColor, border: '4px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '0.75rem', position: 'relative' }}>
                    {item.pulse && (
                      <motion.div
                        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', background: item.dotColor, opacity: 0.4 }}
                      />
                    )}
                  </div>
                  <span style={{ fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: '0.7rem', color: item.dotColor, marginBottom: '0.3rem' }}>{item.date}</span>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
        <motion.div {...fadeUp} style={{ background: 'var(--surface-container-highest)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid rgba(189,187,146,0.15)' }}>
          <h4 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">receipt_long</span>
            Stats that Matter
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {groupStats.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.45)', padding: '1rem 1.5rem', borderRadius: 'var(--radius)', textAlign: 'center', minWidth: '130px', flex: '1 1 130px', maxWidth: '200px' }}>
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
