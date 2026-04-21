/**
 * seed-users.mjs — Clockk It!
 * Creates all 6 roommate accounts + 1 admin account in Firestore.
 *
 * Usage:
 *   node seed-users.mjs
 *
 * Note: firebase-admin must be installed (npm install firebase-admin --save-dev)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, 'roomatesweb-firebase-adminsdk-fbsvc-27de64b885.json');

if (!existsSync(keyPath)) {
  console.error('\n❌  Firebase Admin key not found at:', keyPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Must match the hashPin() in src/firebase/auth.js exactly
function hashPin(pin) {
  let hash = 0;
  const str = `clockkit_${pin}_nddc`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// ─── USER ACCOUNTS ──────────────────────────────────────────────────────────
// Roommate PINs: 4 digits each. Change to real PINs and re-run!
// Admin PIN: 6 digits. Change before sharing.

const users = [
  // ── 6 Roommates ──
  { roommateId: 'divine',   nickname: 'divine',   displayNickname: 'Divine',   pin: '1111', role: 'user' },
  { roommateId: 'endiong',  nickname: 'endiong',  displayNickname: 'Endiong',  pin: '2222', role: 'user' },
  { roommateId: 'nova',     nickname: 'nova',     displayNickname: 'Nova',     pin: '3333', role: 'user' },
  { roommateId: 'esther',   nickname: 'esther',   displayNickname: 'Esther',   pin: '4444', role: 'user' },
  { roommateId: 'ediomo',   nickname: 'ediomo',   displayNickname: 'Ediomo',   pin: '5555', role: 'user' },
  { roommateId: 'joy',      nickname: 'joy',      displayNickname: 'Joy',      pin: '6666', role: 'user' },

  // ── Admin Account ──
  // PIN is 6–8 digits for security. Change before use!
  { roommateId: 'admin', nickname: 'admin', displayNickname: 'Admin', pin: '123456', role: 'admin' },
];

async function seed() {
  console.log('\n🌱  Seeding Clockk It! accounts into Firestore...\n');

  for (const user of users) {
    const data = {
      roommateId: user.roommateId,
      nickname: user.nickname,
      displayNickname: user.displayNickname,
      pinHash: hashPin(user.pin),
      role: user.role,
      createdAt: new Date().toISOString(),
    };
    await db.collection('users').doc(user.nickname).set(data, { merge: true });
    const badge = user.role === 'admin' ? '🔐 ADMIN' : '👤 user';
    console.log(`  ✅  ${badge}  ${user.displayNickname.padEnd(12)} › login: "${user.nickname}"  PIN: ${user.pin}`);
  }

  console.log('\n🎉  All accounts created!\n');
  console.log('📌  IMPORTANT — before sharing with the girlies:');
  console.log('    1. Change all PINs to real ones above');
  console.log('    2. Change the admin PIN to something secret (6–8 digits)');
  console.log('    3. Re-run: node seed-users.mjs');
  console.log('    4. Tell each girlie their nickname + PIN privately\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌  Seeding failed:', err.message, '\n');
  process.exit(1);
});
