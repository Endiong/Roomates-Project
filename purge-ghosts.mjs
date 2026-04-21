import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, 'roomatesweb-firebase-adminsdk-fbsvc-27de64b885.json');

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const GHOSTS = ['luna', 'aisha', 'chloe', 'sofia', 'elena', 'maya'];

async function purge() {
  console.log('Purging ghost data...');
  for (const ghost of GHOSTS) {
    await db.collection('users').doc(ghost).delete();
  }
  
  const memoriesSnap = await db.collection('memories').get();
  let memCount = 0;
  for (const doc of memoriesSnap.docs) {
    const data = doc.data();
    const authorLower = (data.authorNickname || data.author || '').toLowerCase();
    if (GHOSTS.includes(authorLower)) {
      await doc.ref.delete();
      memCount++;
    }
  }
  console.log(`Deleted ${memCount} memories authored by ghosts`);

  let noteCount = 0;
  const colls = await db.collection('roommates').listDocuments();
  for (const profileDoc of colls) {
    // Delete profile doc if ghost
    if (GHOSTS.includes(profileDoc.id)) {
       await profileDoc.delete();
    }
    const notesSnap = await profileDoc.collection('peer_notes').get();
    for (const noteDoc of notesSnap.docs) {
      const data = noteDoc.data();
      const authorLower = (data.authorNickname || data.author || '').toLowerCase();
      if (GHOSTS.includes(authorLower) || GHOSTS.includes(profileDoc.id)) {
        await noteDoc.ref.delete();
        noteCount++;
      }
    }
  }
  console.log(`Deleted ${noteCount} peer notes by or for ghosts`);
  console.log('Cleanup complete!');
}

purge().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
