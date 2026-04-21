// Admin Dashboard — Clockk It!
// Only accessible when logged in with role = 'admin'

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  getAllMemoriesAdmin,
  getAllUsers,
  setMemoryVisible,
  deleteMemory,
  setBanner,
  getBanner,
  updateUserPin,
} from '../firebase/db';
import { hashPin } from '../firebase/auth';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const TABS = ['Overview', 'Memories', 'Users', 'Banner'];

export default function Admin() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Overview');
  const [memories, setMemories] = useState([]);
  const [users, setUsers] = useState([]);
  const [banner, setBannerText] = useState('');
  const [bannerInput, setBannerInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // PIN reset state
  const [pinTarget, setPinTarget] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [pinSaving, setPinSaving] = useState(false);

  // Guard — redirect if not admin
  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    if (!isAdmin()) { navigate('/'); return; }
  }, [currentUser]);

  // Load data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [mems, usrs, bnr] = await Promise.all([
          getAllMemoriesAdmin(),
          getAllUsers(),
          getBanner(),
        ]);
        setMemories(mems);
        setUsers(usrs);
        setBannerText(bnr || '');
        setBannerInput(bnr || '');
      } catch (e) {
        showToast('Failed to load data: ' + e.message, 'error');
      }
      setLoading(false);
    }
    load();
  }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function toggleVisible(mem) {
    const newVal = mem.visible === false ? true : false;
    await setMemoryVisible(mem.id, newVal);
    setMemories(prev => prev.map(m => m.id === mem.id ? { ...m, visible: newVal } : m));
    showToast(newVal ? 'Memory is now visible ✓' : 'Memory hidden from wall');
  }

  async function handleDelete(mem) {
    if (!confirm(`Delete "${mem.caption || 'this memory'}" permanently?`)) return;
    await deleteMemory(mem.id);
    setMemories(prev => prev.filter(m => m.id !== mem.id));
    showToast('Memory deleted permanently.', 'error');
  }

  async function saveBanner() {
    setSaving(true);
    await setBanner(bannerInput);
    setBannerText(bannerInput);
    setSaving(false);
    showToast('Banner saved! It\'s now live on the site ✓');
  }

  async function clearBanner() {
    setSaving(true);
    await setBanner('');
    setBannerText('');
    setBannerInput('');
    setSaving(false);
    showToast('Banner cleared.');
  }

  async function resetPin() {
    if (!pinTarget || newPin.length < 4) return;
    setPinSaving(true);
    try {
      await updateUserPin(pinTarget.nickname, hashPin(newPin));
      showToast(`PIN reset for ${pinTarget.displayNickname || pinTarget.nickname} ✓`);
      setPinTarget(null);
      setNewPin('');
    } catch (e) {
      showToast('Failed to reset PIN: ' + e.message, 'error');
    }
    setPinSaving(false);
  }

  // ─── Derived Stats
  const visibleMems = memories.filter(m => m.visible !== false).length;
  const hiddenMems = memories.filter(m => m.visible === false).length;
  const totalUsers = users.filter(u => u.role !== 'admin').length;

  const accent = '#815a5b';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: '#815a5b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '1.25rem', fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.75rem', letterSpacing: '-0.04em', color: 'var(--on-surface)', lineHeight: 1 }}>
                Admin
              </h1>
              <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Clockk It! Control Panel
              </p>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
            Logged in as <strong>{currentUser?.displayNickname}</strong> · Admin
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} style={{ display: 'flex', gap: '0.35rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                border: activeTab === tab ? 'none' : '1.5px solid rgba(189,187,146,0.3)',
                background: activeTab === tab ? accent : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--on-surface-variant)',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--outline)', fontFamily: 'var(--font-handwritten)', fontSize: '1.25rem' }}>
            Loading...
          </div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'Overview' && (
              <motion.div initial="hidden" animate="show" variants={fadeUp}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { icon: 'photo_library', label: 'Total Memories', value: memories.length, color: '#815a5b' },
                    { icon: 'visibility', label: 'Visible', value: visibleMems, color: '#3c6d5e' },
                    { icon: 'visibility_off', label: 'Hidden', value: hiddenMems, color: '#be7d2d' },
                    { icon: 'group', label: 'Roommates', value: totalUsers, color: '#785a7e' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: 'var(--surface-container)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(189,187,146,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                        <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--outline)' }}>{stat.label}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '2.5rem', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div style={{ background: 'var(--surface-container)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(189,187,146,0.2)' }}>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: 'var(--on-surface)', marginBottom: '1rem' }}>Quick Actions</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {[
                      { label: 'Manage Memories', tab: 'Memories', icon: 'photo_library' },
                      { label: 'Manage Users', tab: 'Users', icon: 'group' },
                      { label: 'Edit Banner', tab: 'Banner', icon: 'campaign' },
                    ].map(action => (
                      <button key={action.label} onClick={() => setActiveTab(action.tab)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: 'var(--background)', border: '1.5px solid rgba(189,187,146,0.35)', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.8rem', color: 'var(--on-surface)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{action.icon}</span>
                        {action.label}
                      </button>
                    ))}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: 'var(--background)', border: '1.5px solid rgba(189,187,146,0.35)', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.8rem', color: 'var(--on-surface)', textDecoration: 'none' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>home</span>
                      Back to Site
                    </Link>
                  </div>
                </div>

                {/* What Needs Filling */}
                <div style={{ marginTop: '1.5rem', background: 'rgba(254,203,203,0.15)', padding: '1.5rem', borderRadius: '0.75rem', border: '1.5px dashed rgba(129,90,91,0.3)' }}>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: accent, marginBottom: '1rem' }}>📋 What Still Needs Filling</h2>
                  <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>Once the Google Form responses come in, update these in <code>roommates.js</code>:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
                    {[
                      { field: 'birthday', desc: 'DD/MM for each girlie' },
                      { field: 'mbti', desc: 'Personality type from form' },
                      { field: 'loveLanguage', desc: '5 options from form' },
                      { field: 'favoriteFood', desc: 'Their real fav food' },
                      { field: 'fiveYearDream', desc: 'Where they see themselves' },
                      { field: 'myFirstImpressionOf', desc: 'First impression of one person' },
                      { field: 'loveLetter', desc: 'Letter to the whole room' },
                      { field: 'favoriteTimeOfDay', desc: 'Morning/Evening/Night etc' },
                      { field: 'oneLoveAboutRoom', desc: 'One thing loved about hostel' },
                      { field: 'avatar (photos)', desc: 'Real photos via profile page' },
                    ].map(item => (
                      <div key={item.field} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.5)', borderRadius: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: '#be7d2d', marginTop: '0.1rem', flexShrink: 0 }}>pending</span>
                        <div>
                          <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--on-surface)' }}>{item.field}</p>
                          <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', color: 'var(--outline)' }}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── MEMORIES TAB ── */}
            {activeTab === 'Memories' && (
              <motion.div initial="hidden" animate="show" variants={fadeUp}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)' }}>
                    All Memories ({memories.length})
                  </h2>
                  <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', color: 'var(--outline)' }}>
                    {visibleMems} visible · {hiddenMems} hidden
                  </span>
                </div>

                {memories.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--outline)', fontFamily: 'var(--font-handwritten)', fontSize: '1.25rem' }}>
                    No memories yet. Be the first to add one! 📸
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {memories.map(mem => (
                      <div key={mem.id} style={{ background: 'var(--surface-container)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(189,187,146,0.2)', display: 'flex', gap: '1rem', alignItems: 'center', opacity: mem.visible === false ? 0.55 : 1 }}>
                        {/* Thumbnail */}
                        <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0, background: '#f0ede0' }}>
                          {mem.photoUrl ? (
                            <img src={mem.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: 'var(--outline)' }}>note</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface)', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {mem.caption || mem.text?.substring(0, 60) || 'No caption'}
                          </p>
                          <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', color: 'var(--outline)' }}>
                            by {mem.author || 'unknown'} · {mem.type || 'photo'}
                            {mem.visible === false && <span style={{ marginLeft: '0.5rem', color: '#be7d2d', fontWeight: 700 }}>HIDDEN</span>}
                          </p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                          <button
                            onClick={() => toggleVisible(mem)}
                            title={mem.visible === false ? 'Make visible' : 'Hide from wall'}
                            style={{ width: '2rem', height: '2rem', borderRadius: '0.4rem', border: '1.5px solid rgba(189,187,146,0.35)', background: 'var(--background)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: mem.visible === false ? '#3c6d5e' : '#be7d2d' }}>
                              {mem.visible === false ? 'visibility' : 'visibility_off'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(mem)}
                            title="Delete permanently"
                            style={{ width: '2rem', height: '2rem', borderRadius: '0.4rem', border: '1.5px solid rgba(190,45,6,0.25)', background: 'rgba(190,45,6,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: '#be2d06' }}>delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── USERS TAB ── */}
            {activeTab === 'Users' && (
              <motion.div initial="hidden" animate="show" variants={fadeUp}>
                <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)', marginBottom: '1rem' }}>
                  User Accounts ({users.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {users.map(user => (
                    <div key={user.id} style={{ background: 'var(--surface-container)', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(189,187,146,0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--on-surface)' }}>
                            {user.displayNickname || user.nickname}
                          </p>
                          <span style={{ padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)', background: user.role === 'admin' ? '#815a5b' : 'rgba(189,187,146,0.3)', color: user.role === 'admin' ? 'white' : 'var(--on-surface-variant)', fontFamily: 'var(--font-label)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {user.role || 'user'}
                          </span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.65rem', color: 'var(--outline)' }}>
                          nickname: {user.nickname} · created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'unknown'}
                        </p>
                      </div>

                      {user.role !== 'admin' && (
                        <button
                          onClick={() => setPinTarget(user)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', border: '1.5px solid rgba(189,187,146,0.35)', borderRadius: 'var(--radius-full)', background: 'var(--background)', fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.75rem', color: 'var(--on-surface)', cursor: 'pointer' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>lock_reset</span>
                          Reset PIN
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* PIN Reset Modal */}
                <AnimatePresence>
                  {pinTarget && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}
                      onClick={e => { if (e.target === e.currentTarget) { setPinTarget(null); setNewPin(''); } }}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        style={{ background: 'var(--surface-container)', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '24rem', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
                      >
                        <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)', marginBottom: '0.3rem' }}>
                          Reset PIN
                        </h3>
                        <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', color: 'var(--outline)', marginBottom: '1.25rem' }}>
                          Setting new PIN for <strong>{pinTarget.displayNickname}</strong>
                        </p>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={8}
                          placeholder="New PIN (4–8 digits)"
                          value={newPin}
                          onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                          style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid rgba(189,187,146,0.4)', borderRadius: '0.5rem', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.3em', textAlign: 'center', background: 'var(--background)', color: 'var(--on-surface)', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <button onClick={() => { setPinTarget(null); setNewPin(''); }} style={{ flex: 1, padding: '0.65rem', border: '1.5px solid rgba(189,187,146,0.35)', borderRadius: '0.5rem', background: 'transparent', fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                            Cancel
                          </button>
                          <button
                            onClick={resetPin}
                            disabled={newPin.length < 4 || pinSaving}
                            style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '0.5rem', background: newPin.length >= 4 ? accent : 'rgba(189,187,146,0.3)', color: newPin.length >= 4 ? 'white' : 'var(--outline)', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.85rem', cursor: newPin.length >= 4 ? 'pointer' : 'not-allowed' }}
                          >
                            {pinSaving ? 'Saving...' : 'Save PIN'}
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── BANNER TAB ── */}
            {activeTab === 'Banner' && (
              <motion.div initial="hidden" animate="show" variants={fadeUp}>
                <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)', marginBottom: '0.4rem' }}>
                  Site Banner
                </h2>
                <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
                  Post a message visible to all visitors at the top of the site. Leave blank to hide.
                </p>

                {bannerText && (
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(129,90,91,0.1)', border: '1.5px solid rgba(129,90,91,0.3)', borderRadius: '0.5rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: accent, fontVariationSettings: "'FILL' 1" }}>campaign</span>
                    <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.85rem', color: accent }}><strong>Live banner:</strong> {bannerText}</p>
                  </div>
                )}

                <textarea
                  value={bannerInput}
                  onChange={e => setBannerInput(e.target.value)}
                  placeholder="e.g. 🎉 The site just got a huge update! Check everyone's profiles."
                  rows={3}
                  style={{ width: '100%', padding: '0.875rem 1rem', border: '2px solid rgba(189,187,146,0.4)', borderRadius: '0.625rem', fontFamily: 'var(--font-label)', fontSize: '0.9rem', color: 'var(--on-surface)', background: 'var(--surface-container)', outline: 'none', resize: 'vertical', marginBottom: '1rem', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button onClick={saveBanner} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.65rem 1.25rem', background: accent, color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>save</span>
                    {saving ? 'Saving...' : 'Save Banner'}
                  </button>
                  {bannerText && (
                    <button onClick={clearBanner} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.65rem 1.25rem', background: 'transparent', color: '#be2d06', border: '1.5px solid rgba(190,45,6,0.25)', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
                      Clear Banner
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', padding: '0.75rem 1.5rem', background: toast.type === 'error' ? '#be2d06' : '#3c6d5e', color: 'white', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 10000, whiteSpace: 'nowrap' }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
