import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * State that is kept in localStorage. The stored value is read after mount,
 * so the server render and the first client render agree.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T
): [T, (value: T | ((previous: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  const hydrated = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: read once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        if (isValid(parsed)) setState(parsed);
      }
    } catch {
      // Unreadable storage: keep the initial value
    }
    hydrated.current = true;
  }, []);

  const set = useCallback(
    (value: T | ((previous: T) => T)) => {
      setState((previous) => {
        const next =
          typeof value === 'function'
            ? (value as (previous: T) => T)(previous)
            : value;
        if (hydrated.current) {
          try {
            localStorage.setItem(key, JSON.stringify(next));
          } catch {
            // Storage full or blocked: the state still works for this visit
          }
        }
        return next;
      });
    },
    [key]
  );

  return [state, set];
}
