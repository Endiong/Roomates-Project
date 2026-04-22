// Firestore DB helpers for profiles, memories, and customizations

import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  deleteField,
} from 'firebase/firestore';

// ─── PROFILES ─────────────────────────────────────────────────────

export async function getProfileOverrides(roommateId) {
  const ref = doc(db, 'profiles', roommateId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

export async function updateProfile(roommateId, data) {
  const ref = doc(db, 'profiles', roommateId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function setProfile(roommateId, data) {
  const ref = doc(db, 'profiles', roommateId);
  try {
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  } catch (e) {
    // doc doesn't exist yet — create it
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() });
  }
}

// ─── MEMORIES ──────────────────────────────────────────────────────

export async function getMemories() {
  const q = query(collection(db, 'memories'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addMemory(memoryData) {
  return addDoc(collection(db, 'memories'), {
    ...memoryData,
    createdAt: serverTimestamp(),
  });
}

export async function deleteMemory(memoryId) {
  return deleteDoc(doc(db, 'memories', memoryId));
}

export async function setMemoryVisible(memoryId, visible) {
  return updateDoc(doc(db, 'memories', memoryId), { visible, updatedAt: serverTimestamp() });
}

export async function updateMemoryPosition(memoryId, x, y) {
  return updateDoc(doc(db, 'memories', memoryId), {
    customX: x,
    customY: y,
    updatedAt: serverTimestamp(),
  });
}

export async function clearAllMemoryPositions() {
  const mems = await getMemories();
  const batch = writeBatch(db);
  mems.forEach(m => {
    if (m.customX !== undefined || m.customY !== undefined) {
      batch.update(doc(db, 'memories', m.id), {
        customX: deleteField(),
        customY: deleteField(),
      });
    }
  });
  await batch.commit();
}

// ─── ADMIN ─────────────────────────────────────────────────────────

export async function getAllMemoriesAdmin() {
  // Returns ALL memories (including hidden ones) — admin use only
  const q = query(collection(db, 'memories'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateUserPin(nickname, newPinHash) {
  const ref = doc(db, 'users', nickname.toLowerCase().trim());
  await updateDoc(ref, { pinHash: newPinHash, updatedAt: serverTimestamp() });
}



// ─── PROFILE NOTES (Peer Notes) ────────────────────────────────────

export async function addProfileNote(roommateId, { author, authorNickname, text, template }) {
  return addDoc(collection(db, 'profileNotes'), {
    roommateId,
    author,
    authorNickname,
    text,
    template: template || 'sticky',
    createdAt: serverTimestamp(),
  });
}

export async function getProfileNotes(roommateId) {
  const q = query(
    collection(db, 'profileNotes'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(n => n.roommateId === roommateId);
}

export async function getAllProfileNotes() {
  // Admin use only — returns all peer notes across every profile
  const q = query(collection(db, 'profileNotes'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteProfileNote(noteId) {
  return deleteDoc(doc(db, 'profileNotes', noteId));
}

// ─── MOODS ─────────────────────────────────────────────────────────

export async function getMoods() {
  const q = query(collection(db, 'moods'), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function setMood(nickname, { emoji, text, displayName }) {
  // One mood per user — keyed by nickname so update overwrites
  const ref = doc(db, 'moods', nickname.toLowerCase().trim());
  return setDoc(ref, {
    nickname: nickname.toLowerCase().trim(),
    displayName,
    emoji,
    text,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMood(nickname) {
  return deleteDoc(doc(db, 'moods', nickname.toLowerCase().trim()));
}

// ─── SITE CONFIG (banner, etc.) ───────────────────────────────────────────

export async function getBanner() {
  const ref = doc(db, 'config', 'site');
  const snap = await getDoc(ref);
  if (!snap.exists()) return '';
  return snap.data().banner || '';
}

export async function setBanner(text) {
  const ref = doc(db, 'config', 'site');
  return setDoc(ref, { banner: text }, { merge: true });
}
