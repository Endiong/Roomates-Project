import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileEditModal({ roommate, currentData, onClose, onSave }) {
  const [formData, setFormData] = useState({
    finalNote: currentData?.finalNote || roommate.finalNote || '',
    quote: currentData?.quote || roommate.quote || '',
    roomVibe: currentData?.roomVibe || roommate.roomVibe || '',
    themeColor: currentData?.themeColor || null,
    redFlags: (currentData?.redFlags || roommate.redFlags || []).join('\n'),
    greenFlags: (currentData?.greenFlags || roommate.greenFlags || []).join('\n'),
    todoList: (currentData?.todoList || roommate.todoList || []).join('\n'),
    personalityChips: (currentData?.personalityChips || roommate.personalityChips || []).join(', '),
    favSong: currentData?.favSong || roommate.favSong || '',
    spotifyLink: currentData?.spotifyLink || roommate.spotifyLink || '',
  });

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({
      ...formData,
      redFlags: formData.redFlags.split('\n').map(s => s.trim()).filter(s => s !== ''),
      greenFlags: formData.greenFlags.split('\n').map(s => s.trim()).filter(s => s !== ''),
      todoList: formData.todoList.split('\n').map(s => s.trim()).filter(s => s !== ''),
      personalityChips: formData.personalityChips.split(',').map(s => s.trim()).filter(s => s !== ''),
    });
    setSaving(false);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(57,57,27,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          style={{ background: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '35rem', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(57,57,27,0.3)', position: 'relative' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>Edit Your Profile</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Your Room Vibe</label>
              <input
                type="text" value={formData.roomVibe} onChange={e => setFormData({ ...formData, roomVibe: e.target.value })}
                placeholder="e.g. Dramatic Mornings, Cooking, Reading manga..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--outline-variant)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Signature Quote</label>
              <input
                type="text" value={formData.quote} onChange={e => setFormData({ ...formData, quote: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--outline-variant)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Personality Stickers (Comma separated)</label>
              <input
                type="text" value={formData.personalityChips} onChange={e => setFormData({ ...formData, personalityChips: e.target.value })}
                placeholder="Night Owl, Foodie, The Coder..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--outline-variant)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--error)', marginBottom: '0.4rem' }}>Red Flags (One per line)</label>
              <textarea
                value={formData.redFlags} onChange={e => setFormData({ ...formData, redFlags: e.target.value })}
                rows={3}
                placeholder="Will scream your name across the room..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--outline-variant)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '0.95rem', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--success)', marginBottom: '0.4rem' }}>Green Flags (One per line)</label>
              <textarea
                value={formData.greenFlags} onChange={e => setFormData({ ...formData, greenFlags: e.target.value })}
                rows={3}
                placeholder="Always has food to share..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--outline-variant)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '0.95rem', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.4rem' }}>To-Do List (One per line)</label>
              <textarea
                value={formData.todoList} onChange={e => setFormData({ ...formData, todoList: e.target.value })}
                rows={4}
                placeholder="Clean the dishes..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--outline-variant)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '0.95rem', resize: 'vertical' }}
              />
            </div>

            {/* Favourite Music / Playlist */}
            <div style={{ background: 'rgba(29,185,84,0.06)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid rgba(29,185,84,0.15)' }}>
              <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#1db954', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>music_note</span>
                Current Vibe / Fav Song
              </p>
              <input
                type="text" value={formData.favSong} onChange={e => setFormData({ ...formData, favSong: e.target.value })}
                placeholder="e.g. Espresso – Sabrina Carpenter"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(29,185,84,0.25)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '0.95rem', marginBottom: '0.6rem', boxSizing: 'border-box' }}
              />
              <input
                type="url" value={formData.spotifyLink} onChange={e => setFormData({ ...formData, spotifyLink: e.target.value })}
                placeholder="Spotify / Apple Music link (optional)"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(29,185,84,0.25)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Final Note (Polaroid text)</label>
              <textarea
                value={formData.finalNote} onChange={e => setFormData({ ...formData, finalNote: e.target.value })}
                rows={4}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--outline-variant)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '0.95rem', resize: 'vertical' }}
              />
            </div>

            <button onClick={handleSave} disabled={saving} style={{
              width: '100%', padding: '0.85rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer', marginTop: '1rem', opacity: saving ? 0.7 : 1
            }}>
              {saving ? 'Saving Profile...' : 'Save Profile Settings'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
