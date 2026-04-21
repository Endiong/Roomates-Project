import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileEditModal({ roommate, currentData, onClose, onSave }) {
  const [formData, setFormData] = useState({
    finalNote: currentData?.finalNote || roommate.finalNote || '',
    quote: currentData?.quote || roommate.quote || '',
    roomVibe: currentData?.roomVibe || roommate.roomVibe || '',
    isDarkTheme: currentData?.isDarkTheme || false,
    themeColor: currentData?.themeColor || null,
  });

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(formData);
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
              <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Background Mode</label>
              <button 
                onClick={() => setFormData({ ...formData, isDarkTheme: !formData.isDarkTheme })}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: formData.isDarkTheme ? '#1a1a1a' : '#f5f5f5', color: formData.isDarkTheme ? '#ffffff' : '#000000', border: '1px solid var(--outline-variant)', cursor: 'pointer', fontFamily: 'var(--font-headline)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                <span className="material-symbols-outlined">{formData.isDarkTheme ? 'dark_mode' : 'light_mode'}</span>
                {formData.isDarkTheme ? 'Dark Mode Background' : 'Light Mode Background'}
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Your Room Vibe</label>
              <input
                type="text" value={formData.roomVibe} onChange={e => setFormData({ ...formData, roomVibe: e.target.value })}
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
              <label style={{ display: 'block', fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.4rem' }}>Final Note (Polaroid text)</label>
              <textarea
                value={formData.finalNote} onChange={e => setFormData({ ...formData, finalNote: e.target.value })}
                rows={4}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--outline-variant)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '0.95rem', resize: 'vertical' }}
              />
            </div>

            {/* Note: In a future update these will be full array editors. For now, we allow vibe and quotes as the primary edits! */}

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
