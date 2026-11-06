// Marks weak machines data-tier="low" (hardware hints first, then real frame timings) so CSS drops costly effects.
// Renamed so a mark saved by the old, over-eager check is ignored.
const KEY = 'fm-tier-2';

const remember = (tier) => { try { sessionStorage.setItem(KEY, tier); } catch { /* storage off */ } };
const recalled = () => { try { return sessionStorage.getItem(KEY); } catch { return null; } };

const setTier = (tier) => { document.documentElement.dataset.tier = tier; };

// A browser that only has software rendering refuses a context when asked to fail on a performance caveat.
const noGpu = () => {
  try {
    const gl = document.createElement('canvas').getContext('webgl', { failIfMajorPerformanceCaveat: true });
    if (!gl) return true;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return false;
  } catch { return false; }
};

const hinted = () => {
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = navigator.deviceMemory ?? 8;
  return cores <= 4 || mem <= 4 || Boolean(navigator.connection?.saveData) || noGpu();
};

// Once loading has finished, watches frames for a moment and steps down only if they run slow throughout.
// Loading stalls (and the dev server's unbundled modules) once marked a 16-core machine as weak.
const watchFrames = () => {
  if (import.meta.env.DEV) return;
  const gaps = [];
  let last = 0;
  let start = 0;
  const tick = (now) => {
    if (document.visibilityState !== 'visible') return;
    if (!start) start = now;
    if (last) gaps.push(now - last);
    last = now;
    if (now - start < 1500) { requestAnimationFrame(tick); return; }
    gaps.sort((a, b) => a - b);
    const typical = gaps[Math.floor(gaps.length / 2)] ?? 0;
    const slow = gaps.filter(g => g > 34).length / Math.max(1, gaps.length);
    if (typical > 24 || slow > 0.4) { setTier('low'); remember('low'); }
  };
  const begin = () => setTimeout(() => requestAnimationFrame(tick), 300);
  if (document.readyState === 'complete') begin(); else window.addEventListener('load', begin, { once: true });
};

export const markTier = () => {
  if (typeof document === 'undefined') return;
  if (recalled() === 'low') { setTier('low'); return; }
  if (hinted()) { setTier('low'); remember('low'); return; }
  setTier('high');
  watchFrames();
};
