import { useCallback, useState } from 'react';

interface UseHistoryOptions {
  maxHistory?: number;
}

interface UseHistoryReturn<T> {
  state: T;
  set: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newState: T) => void;
}

export function useHistory<T>(
  initialState: T,
  options: UseHistoryOptions = {}
): UseHistoryReturn<T> {
  const { maxHistory = 50 } = options;

  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const set = useCallback(
    (newState: T) => {
      // Don't add to history if state hasn't changed
      if (JSON.stringify(newState) === JSON.stringify(present)) {
        return;
      }

      setPast((prev) => {
        const newPast = [...prev, present];
        // Limit history size
        if (newPast.length > maxHistory) {
          return newPast.slice(-maxHistory);
        }
        return newPast;
      });
      setPresent(newState);
      setFuture([]);
    },
    [present, maxHistory]
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    setPast(newPast);
    setPresent(previous);
    setFuture([present, ...future]);
  }, [past, present, future]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast([...past, present]);
    setPresent(next);
    setFuture(newFuture);
  }, [past, present, future]);

  const reset = useCallback((newState: T) => {
    setPast([]);
    setPresent(newState);
    setFuture([]);
  }, []);

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}
