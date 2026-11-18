"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Loads data from the learning service with loading, error and retry states.
 * `load` must be stable (a module-level function or wrapped in useCallback).
 */
export function useServiceData<T>(load: () => Promise<T>) {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({
    data: null,
    error: null,
    loading: true,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    load()
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch(() => alive && setState({ data: null, error: "This content could not be loaded.", loading: false }));
    return () => {
      alive = false;
    };
  }, [load, attempt]);

  const retry = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setAttempt((a) => a + 1);
  }, []);

  return { ...state, retry };
}
