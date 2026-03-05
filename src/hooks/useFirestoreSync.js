// src/hooks/useFirestoreSync.js
//
// Bootstraps the document store from Firestore on sign-in and
// subscribes to real-time updates via onSnapshot listeners.
//
// CONFLICT RESOLUTION STRATEGY:
//   Remote changes are applied unless the local copy is newer
//   (based on updatedAt timestamp). This handles the case where
//   the user is mid-edit when a remote update arrives — their
//   unsaved local changes are preserved.
//
//   For true multi-user real-time collaboration, upgrade to
//   Yjs + y-firestore which uses CRDTs for merge-safe edits.

import { useEffect, useRef } from 'react';
import {
  fetchAllDocuments,
  fetchRootOrder,
  fetchVersions,
  subscribeToDocuments,
  subscribeToRootOrder,
} from '../firebase/firestore';
import { useDocStore } from '../store/documentStore';
import { useUIStore } from '../store/uiStore';

/**
 * @param {import('firebase/auth').User|null} user
 */
export const useFirestoreSync = (user) => {
  const unsubscribersRef = useRef([]);

  useEffect(() => {
    if (!user) {
      // User signed out — clear all listeners
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
      useDocStore.getState().resetStore();
      return;
    }

    const uid = user.uid;
    let isMounted = true;

    const bootstrap = async () => {
      useDocStore.getState().setSyncStatus('loading');

      try {
        // 1. Fetch all documents and root order in parallel
        const [docs, rootOrder] = await Promise.all([
          fetchAllDocuments(uid),
          fetchRootOrder(uid),
        ]);

        if (!isMounted) return;

        // 2. If this is a new user, seed with welcome content
        if (docs.length === 0) {
          await useDocStore.getState().seedWorkspace(uid);
        } else {
          // Build flat documents map
          const docMap = {};
          docs.forEach((d) => { docMap[d.id] = d; });

          // Derive root IDs: prefer persisted order, fall back to docs without parent
          const derivedRoot = rootOrder.length > 0
            ? rootOrder
            : docs.filter((d) => !d.parentId).map((d) => d.id);

          useDocStore.getState().hydrateFromFirestore(docMap, derivedRoot);

          // Select the first document
          const firstId = derivedRoot[0];
          if (firstId) useUIStore.getState().selectDocument(firstId);
        }

        // 3. Fetch versions for all docs (fire-and-forget, non-blocking)
        const allDocIds = Object.keys(useDocStore.getState().documents);
        Promise.all(
          allDocIds.map(async (docId) => {
            const versions = await fetchVersions(uid, docId);
            useDocStore.getState().hydrateVersions(docId, versions);
          })
        );

        useDocStore.getState().setSyncStatus('synced');
      } catch (err) {
        console.error('[FirestoreSync] Bootstrap failed:', err);
        if (isMounted) useDocStore.getState().setSyncStatus('error');
      }

      // 4. Subscribe to real-time document changes
      const unsubDocs = subscribeToDocuments(uid, (changes) => {
        if (!isMounted) return;
        useDocStore.getState().applyRemoteChanges(changes);
      });

      // 5. Subscribe to real-time root order changes
      const unsubRoot = subscribeToRootOrder(uid, (rootIds) => {
        if (!isMounted) return;
        useDocStore.getState().setRootDocumentIds(rootIds);
      });

      unsubscribersRef.current = [unsubDocs, unsubRoot];
    };

    bootstrap();

    return () => {
      isMounted = false;
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
    };
  }, [user?.uid]);
};
