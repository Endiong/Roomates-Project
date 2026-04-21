// Auth helpers — nickname + 4-digit PIN stored in Firestore
// Users collection: /users/{roommateId} → { nickname, pinHash, roommateId }

import { db } from './config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

// Simple PIN hash (not cryptographic — fine for a private friend app)
export function hashPin(pin) {
  let hash = 0;
  const str = `clockkit_${pin}_nddc`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Login: look up roommate by nickname, compare PIN hash
export async function loginWithNicknamePin(nickname, pin) {
  const normalizedNickname = nickname.toLowerCase().trim();
  const userRef = doc(db, 'users', normalizedNickname);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    throw new Error('Roommate not found. Check your nickname!');
  }

  const data = snap.data();
  if (data.pinHash !== hashPin(pin)) {
    throw new Error('Wrong PIN — try again!');
  }

  return {
    roommateId: data.roommateId,
    nickname: data.nickname,
    displayNickname: data.displayNickname || data.nickname,
    role: data.role || 'user',
  };
}

// Register a new user (for initial setup only)
export async function registerUser(roommateId, nickname, displayNickname, pin, role = 'user') {
  const normalizedNickname = nickname.toLowerCase().trim();
  const userRef = doc(db, 'users', normalizedNickname);
  await setDoc(userRef, {
    roommateId,
    nickname: normalizedNickname,
    displayNickname,
    pinHash: hashPin(pin),
    role,
    createdAt: new Date().toISOString(),
  });
}

// Update PIN
export async function updatePin(nickname, newPin) {
  const userRef = doc(db, 'users', nickname.toLowerCase().trim());
  await updateDoc(userRef, { pinHash: hashPin(newPin) });
}
