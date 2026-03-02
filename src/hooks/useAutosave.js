import { useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { useDocStore } from '../store/documentStore';

export const useAutosave = (docId, title, content) => {
  const { updateDocument, saveVersion, setSavingStatus } = useDocStore.getState();
  const timerRef = useRef(null);

  const debouncedSave = useDebounce((t, c) => {
    setSavingStatus(docId, 'saving');
    // Optimistic update — apply immediately to the store
    updateDocument(docId, { title: t, content: c });

    // Simulated async persist (replace with real API call)
    timerRef.current = setTimeout(() => {
      saveVersion(docId);
      setSavingStatus(docId, 'saved');
      setTimeout(() => setSavingStatus(docId, null), 2500);
    }, 200);
  }, 800);

  useEffect(() => {
    debouncedSave(title, content);
  }, [title, content]);

  useEffect(() => () => clearTimeout(timerRef.current), [docId]);
};
