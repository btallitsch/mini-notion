// src/hooks/useAutosave.js
//
// Debounced autosave with optimistic updates.
//
// Flow:
//   1. User types → local state updates immediately (optimistic)
//   2. Zustand store updates immediately for instant UI reflection
//   3. After 800ms of silence → write to Firestore + snapshot version
//
// If the Firestore write fails, the error is surfaced via setSavingStatus
// and the local state is preserved — no data loss.

import { useEffect, useRef, useCallback } from 'react';
import { updateDocument, saveVersion } from '../firebase/firestore';
import { useDocStore } from '../store/documentStore';

const AUTOSAVE_DELAY = 800; // ms

/**
 * @param {string} uid       Firebase user ID
 * @param {string} docId     Document being edited
 * @param {string} title     Current title value
 * @param {string} content   Current content value
 */
export const useAutosave = (uid, docId, title, content) => {
  const { setSavingStatus, saveVersionLocal, updateDocumentLocal } =
    useDocStore.getState();

  const timerRef = useRef(null);
  const latestRef = useRef({ title, content });

  // Keep latest values in a ref so the debounced callback always
  // reads fresh data even if closures capture stale state.
  useEffect(() => {
    latestRef.current = { title, content };
  }, [title, content]);

  // Clear timer when switching documents
  useEffect(() => () => clearTimeout(timerRef.current), [docId]);

  const triggerSave = useCallback(() => {
    clearTimeout(timerRef.current);

    // Optimistic: update Zustand immediately so the UI is always in sync
    updateDocumentLocal(docId, {
      title: latestRef.current.title,
      content: latestRef.current.content,
    });

    setSavingStatus(docId, 'saving');

    timerRef.current = setTimeout(async () => {
      try {
        // Persist to Firestore
        await updateDocument(uid, docId, {
          title: latestRef.current.title,
          content: latestRef.current.content,
        });

        // Snapshot version (deduplication handled inside saveVersionLocal)
        await saveVersionLocal(uid, docId);

        setSavingStatus(docId, 'saved');
        setTimeout(() => setSavingStatus(docId, null), 2500);
      } catch (err) {
        console.error('[Autosave] Firestore write failed:', err);
        setSavingStatus(docId, 'error');
        setTimeout(() => setSavingStatus(docId, null), 4000);
      }
    }, AUTOSAVE_DELAY);
  }, [uid, docId]);

  return triggerSave;
};
