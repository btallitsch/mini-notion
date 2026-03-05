// src/hooks/useAuth.js
//
// Manages Firebase Authentication state.
// Exposes the current user and loading state to the rest of the app.

import { useState, useEffect } from 'react';
import { onAuthChange } from '../firebase/auth';

/**
 * @returns {{ user: import('firebase/auth').User|null, loading: boolean }}
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthChange returns an unsubscribe function
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
};
