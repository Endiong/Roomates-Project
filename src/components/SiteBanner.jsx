import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBanner } from '../firebase/db';

export default function SiteBanner() {
  const [banner, setBanner] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getBanner().then(text => {
      if (text) setBanner(text);
    }).catch(() => {});
  }, []);

  if (!banner || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'linear-gradient(90deg, var(--primary-container) 0%, rgba(185,238,219,0.4) 100%)',
          borderBottom: '1px solid rgba(189,187,146,0.35)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0.6rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '1rem', color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}
            >
              campaign
            </span>
            <p style={{
              fontFamily: 'var(--font-label)',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--on-surface)',
              margin: 0,
            }}>
              {banner}
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--on-surface-variant)',
              opacity: 0.6,
              display: 'flex',
              padding: '0.2rem',
              flexShrink: 0,
            }}
            title="Dismiss"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
