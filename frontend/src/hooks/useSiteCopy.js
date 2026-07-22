import { useState, useEffect } from 'react';
import { getCopy } from '../firebase/firestore';

/**
 * Loads the editable "site copy" overrides (portfolio/copy) once and caches
 * them at module scope so navigating between pages doesn't refetch. Pages pass
 * the relevant group (e.g. overrides.home) through `resolveGroup` with their
 * in-code defaults, so the site looks identical until copy is edited in /admin.
 */
let cache = null;             // resolved overrides object, or null until first load
let inflight = null;          // shared promise so parallel mounts share one read

const load = () => {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = getCopy()
      .then((data) => { cache = data ?? {}; return cache; })
      .catch(() => { cache = {}; return cache; })
      .finally(() => { inflight = null; });
  }
  return inflight;
};

export const useSiteCopy = () => {
  const [overrides, setOverrides] = useState(cache ?? {});
  const [loading, setLoading]     = useState(cache === null);

  useEffect(() => {
    let alive = true;
    if (cache !== null) { setOverrides(cache); setLoading(false); return; }
    load().then((data) => { if (alive) { setOverrides(data); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  return { overrides, loading };
};

export default useSiteCopy;
