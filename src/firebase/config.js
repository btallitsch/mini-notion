// src/firebase/config.js
//
// HOW TO SET UP:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or use an existing one)
// 3. Add a Web App: Project Settings → Your Apps → Add App → Web
// 4. Copy your firebaseConfig object and paste it below
// 5. In Firebase Console:
//    - Enable Authentication → Sign-in method → Google + Email/Password
//    - Enable Firestore Database → Start in production mode
//    - Add Firestore Security Rules (see rules below)
//
// FIRESTORE SECURITY RULES (paste into Firebase Console → Firestore → Rules):
// ─────────────────────────────────────────────────────────────────────────────
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /workspaces/{userId}/{document=**} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//   }
// }
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from 'firebase/firestore';

// ─── REPLACE THIS WITH YOUR FIREBASE CONFIG ──────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// ─────────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence (IndexedDB cache)
// This gives the app full offline support — reads and writes
// queue locally and sync when connectivity is restored.
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open — persistence only works in one tab at a time
    console.warn('[Firestore] Persistence disabled: multiple tabs open.');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support IndexedDB
    console.warn('[Firestore] Persistence not supported in this browser.');
  }
});

// ─── LOCAL EMULATOR (optional, for development) ──────────────────────────────
// Uncomment these lines if you run `firebase emulators:start`
//
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }
// ─────────────────────────────────────────────────────────────────────────────

export default app;
