// src/firebase/firestore.js
//
// All Firestore operations are isolated in this module.
// Components and hooks import from here — never call Firestore directly.
//
// DATA MODEL:
//   workspaces/{userId}/documents/{docId}     ← document metadata + content
//   workspaces/{userId}/versions/{docId}/snapshots/{snapId} ← version history
//
// This gives each user a fully isolated workspace. Sharing can be
// implemented later by adding a `members` map to a top-level workspace doc.

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// ─── Path helpers ─────────────────────────────────────────────────────────────

const docsCol = (uid) =>
  collection(db, 'workspaces', uid, 'documents');

const docRef = (uid, docId) =>
  doc(db, 'workspaces', uid, 'documents', docId);

const versionsCol = (uid, docId) =>
  collection(db, 'workspaces', uid, 'versions', docId, 'snapshots');

const versionRef = (uid, docId, snapId) =>
  doc(db, 'workspaces', uid, 'versions', docId, 'snapshots', snapId);

// ─── Convert Firestore timestamps ─────────────────────────────────────────────

const toMs = (val) => {
  if (!val) return Date.now();
  if (val instanceof Timestamp) return val.toMillis();
  if (typeof val === 'number') return val;
  return Date.now();
};

export const normalizeDoc = (raw) => ({
  ...raw,
  createdAt: toMs(raw.createdAt),
  updatedAt: toMs(raw.updatedAt),
});

export const normalizeVersion = (raw) => ({
  ...raw,
  savedAt: toMs(raw.savedAt),
});

// ─── Documents ────────────────────────────────────────────────────────────────

/**
 * Fetch all documents for a user as a flat array.
 * Called once on initial load to seed the Zustand store.
 */
export const fetchAllDocuments = async (uid) => {
  const snap = await getDocs(docsCol(uid));
  return snap.docs.map((d) => normalizeDoc({ id: d.id, ...d.data() }));
};

/**
 * Write a new document to Firestore.
 * Uses setDoc so the caller controls the ID.
 */
export const createDocument = async (uid, document) => {
  await setDoc(docRef(uid, document.id), {
    ...document,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Patch specific fields on an existing document.
 * Always stamps updatedAt with server time.
 */
export const updateDocument = async (uid, docId, changes) => {
  await updateDoc(docRef(uid, docId), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a document. Caller is responsible for cascading
 * child deletions (see deleteDocumentTree below).
 */
export const deleteDocument = async (uid, docId) => {
  await deleteDoc(docRef(uid, docId));
};

/**
 * Delete a document and all its descendants in a single batch.
 * Firestore batches support up to 500 writes.
 */
export const deleteDocumentTree = async (uid, docIds) => {
  const chunks = [];
  for (let i = 0; i < docIds.length; i += 490) {
    chunks.push(docIds.slice(i, i + 490));
  }
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach((id) => batch.delete(docRef(uid, id)));
    await batch.commit();
  }
};

/**
 * Subscribe to real-time updates on the documents collection.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 *
 * The callback receives an array of change objects:
 *   { type: 'added' | 'modified' | 'removed', doc: NormalizedDoc }
 */
export const subscribeToDocuments = (uid, onChange) => {
  const q = query(docsCol(uid), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const changes = snapshot.docChanges().map((change) => ({
      type: change.type,
      doc: normalizeDoc({ id: change.doc.id, ...change.doc.data() }),
    }));
    onChange(changes);
  });
};

// ─── Root document order ──────────────────────────────────────────────────────

/**
 * Persist the root-level document order array.
 * Stored on a separate workspace doc so it doesn't conflict with document updates.
 */
export const saveRootOrder = async (uid, rootDocumentIds) => {
  await setDoc(
    doc(db, 'workspaces', uid, 'meta', 'workspace'),
    { rootDocumentIds },
    { merge: true }
  );
};

export const fetchRootOrder = async (uid) => {
  const snap = await getDoc(doc(db, 'workspaces', uid, 'meta', 'workspace'));
  return snap.exists() ? snap.data().rootDocumentIds || [] : [];
};

export const subscribeToRootOrder = (uid, onChange) =>
  onSnapshot(doc(db, 'workspaces', uid, 'meta', 'workspace'), (snap) => {
    if (snap.exists()) onChange(snap.data().rootDocumentIds || []);
  });

// ─── Version History ──────────────────────────────────────────────────────────

/**
 * Save a version snapshot for a document.
 */
export const saveVersion = async (uid, docId, snapshot) => {
  await setDoc(versionRef(uid, docId, snapshot.id), {
    ...snapshot,
    savedAt: serverTimestamp(),
  });
};

/**
 * Fetch all version snapshots for a document, newest first.
 */
export const fetchVersions = async (uid, docId) => {
  const q = query(versionsCol(uid, docId), orderBy('savedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeVersion({ id: d.id, ...d.data() }));
};

/**
 * Subscribe to real-time version updates for a document.
 */
export const subscribeToVersions = (uid, docId, onChange) => {
  const q = query(versionsCol(uid, docId), orderBy('savedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => normalizeVersion({ id: d.id, ...d.data() })));
  });
};
