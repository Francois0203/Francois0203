/**
 * The one thing the loading panel needs before anything has loaded: a name.
 *
 * This used to be much larger. The old intro was a title card built around the
 * person - portrait, monogram, signature - so it read two Firestore documents
 * of its own, ahead of ContentProvider, purely so the card had a face and a
 * name to animate. The panel that replaced it shows a progress bar and a
 * counter, and its only text is the name, so that whole parallel fetch has been
 * removed: ContentProvider is already reading the same data, and the cache
 * below covers the gap before it arrives.
 *
 * localStorage, not sessionStorage: the point is to be warm on a *new* visit.
 * The cache is the source of truth for nothing. It decides one label, it is
 * refreshed whenever real data lands, and if it is missing the panel simply
 * shows no name until the data arrives.
 */

const CACHE_KEY = 'fm:identity';

/** Synchronous, so the first paint of the panel can already carry the name. */
export const readName = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.name === 'string' && parsed.name ? parsed.name : null;
  } catch {
    // Private mode, quota, or a hand-edited value. Showing no name is a state
    // the panel is designed for, so there is nothing to report.
    return null;
  }
};

export const writeName = (name) => {
  if (!name) return;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ name })); } catch { /* see above */ }
};
