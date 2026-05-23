import { useEffect, useState } from 'react';

/*
 * Dynamically discovers photos placed in `frontend/public/photos/` named
 * `photo-1`, `photo-2`, …, up to MAX_INDEX. Each slot is probed with the
 * `.jpeg` extension first, then `.jpg` as a fallback. Missing slots are
 * skipped — gaps are fine.
 *
 * Results are cached at module scope so revisiting the page never re-probes.
 */

const MAX_INDEX = 12;

let cache = null;       // null = not yet probed; [] = probed, none found
let inflight = null;    // in-flight probe promise (deduped)

const probeOne = (idx) => new Promise((resolve) => {
  const tryExt = (ext) => {
    const img = new Image();
    const src = `/photos/photo-${idx}.${ext}`;
    img.onload  = () => resolve(src);
    img.onerror = () => {
      if (ext === 'jpeg') tryExt('jpg');
      else resolve(null);
    };
    img.src = src;
  };
  tryExt('jpeg');
});

const probeAll = () => {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = Promise.all(
    Array.from({ length: MAX_INDEX }, (_, i) => probeOne(i + 1))
  ).then((results) => {
    cache = results.filter(Boolean);
    inflight = null;
    return cache;
  });
  return inflight;
};

const usePolaroidPhotos = () => {
  const [photos,  setPhotos]  = useState(cache ?? []);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    probeAll().then((results) => {
      if (cancelled) return;
      setPhotos(results);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { photos, loading };
};

export default usePolaroidPhotos;
