// src/firebase/auth.js
//
// Auth helpers wrapping Firebase Authentication.
// Supports Google OAuth and Email/Password flows.

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ─── Sign in / Sign up ────────────────────────────────────────────────────────

// export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithGoogle = () => signInWithRedirect(auth, googleProvider);

export const signInWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpWithEmail = async (email, password, displayName) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential;
};

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export const logOut = () => signOut(auth);

// ─── Auth state observer ──────────────────────────────────────────────────────

/**
 * Subscribe to Firebase auth state changes.
 * Returns an unsubscribe function — call it in a useEffect cleanup.
 *
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {() => void} unsubscribe
 */
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// ─── Current user helpers ─────────────────────────────────────────────────────

export const getCurrentUser = () => auth.currentUser;

export const getUserDisplayName = (user) =>
  user?.displayName || user?.email?.split('@')[0] || 'Anonymous';

export const getUserInitials = (user) => {
  const name = getUserDisplayName(user);
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
