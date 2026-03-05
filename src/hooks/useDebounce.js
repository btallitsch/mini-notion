// src/hooks/useDebounce.js

import { useRef, useCallback } from 'react';

/**
 * Returns a debounced version of the provided callback.
 * The callback is only invoked after `delay` ms of silence.
 *
 * @param {Function} callback
 * @param {number} delay  milliseconds
 * @returns {Function} debounced callback
 */
export const useDebounce = (callback, delay) => {
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    (...args) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay]
  );
};
