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

// ─── SITE BANNER ───────────────────────────────────────────────────

export async function setBanner(text) {
  await setDoc(doc(db, 'config', 'banner'), { text, updatedAt: serverTimestamp() });
}

export async function getBanner() {
  const snap = await getDoc(doc(db, 'config', 'banner'));
  return snap.exists() ? snap.data().text : null;
}

// ─── PROFILE NOTES (Peer Notes) ────────────────────────────────────

export async function addProfileNote(roommateId, { author, authorNickname, text }) {
  return addDoc(collection(db, 'profileNotes'), {
    roommateId,
    author,
    authorNickname,
    text,
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

export async function deleteProfileNote(noteId) {
  return deleteDoc(doc(db, 'profileNotes', noteId));
}
