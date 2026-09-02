import { getPersonal } from '../../firebase/firestore';

/**
 * Who the intro is about, available fast enough to actually animate.
 *
 * The problem this exists to solve: the intro's subject is the name and the
 * face, and both live in Firestore. ContentProvider does have them, but
 * getPortfolio() resolves only once all nine of its reads have settled, which
 * is far too late - and reading them in through context would mean the name
 * popping into a card the reader is already looking at.
 *
 * So: read one document instead of nine, cache the answer in localStorage, and
 * seed the next load from that cache synchronously. First-ever visit waits a
 * few hundred ms behind a parchment sheet that is already covering the screen,
 * so the wait is invisible. Every load after that is instant.
 *
 * The cache is intentionally not the source of truth for anything - it is only
 * ever used to decide what the intro draws, is refreshed on every load, and if
 * it is missing or stale the intro degrades rather than breaks.
 */

const CACHE_KEY = 'fm:identity';

const EMPTY = { name: null, title: null, photoUrl: null };

/** localStorage, not sessionStorage: the point is to be warm on a *new* visit. */
export const readIdentity = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // A name is the one field the personal treatment cannot do without, so it
    // is what makes a cache entry worth having.
    return parsed?.name ? { ...EMPTY, ...parsed } : null;
  } catch {
    // Private mode, quota, or a hand-edited value. Falling back to the network
    // is always correct here, so there is nothing to report.
    return null;
  }
};

const writeIdentity = (identity) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(identity)); } catch { /* see above */ }
};

/**
 * Resolves when the image is actually decodable, so the portrait never appears
 * as a half-painted band partway through its own reveal. Never rejects - a
 * missing or broken photo is a state the intro is designed for, not an error.
 */
const preloadPhoto = (url) =>
  new Promise((resolve) => {
    if (!url) { resolve(false); return; }
    const img = new Image();
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });

/**
 * @param {number} timeoutMs how long to wait before starting without the data.
 *        Short when there is a warm cache (we are only waiting on the photo,
 *        which is almost certainly in the HTTP cache), longer on a cold one.
 * @returns {Promise<{name, title, photoUrl, photoReady}>}
 */
export const resolveIdentity = async ({ timeoutMs = 900 } = {}) => {
  const cached = readIdentity();

  // Runs to completion whether or not it wins the race below - so the cache is
  // refreshed on every load even when the intro started without waiting for it.
  const work = (async () => {
    let identity = cached ?? EMPTY;
    try {
      const personal = await getPersonal();
      if (personal?.name) {
        identity = {
          name:     personal.name     ?? null,
          title:    personal.title    ?? null,
          photoUrl: personal.photoUrl ?? null,
        };
        writeIdentity(identity);
      }
    } catch {
      // Offline, or rules changed. Whatever the cache holds is still the best
      // answer available, and no answer at all is handled downstream.
    }
    return { ...identity, photoReady: await preloadPhoto(identity.photoUrl) };
  })();

  const settled = await Promise.race([
    work,
    new Promise((resolve) => { setTimeout(() => resolve(null), timeoutMs); }),
  ]);

  // Timed out: go with the cache and no photo. The monogram fallback is a
  // designed state, so this still looks deliberate rather than unfinished.
  return settled ?? { ...(cached ?? EMPTY), photoReady: false };
};

/**
 * "François Meiring" → "FM". Two letters at most: three initials in a 96px
 * disc stop being a monogram and start being a word.
 */
export const initialsOf = (name) => {
  if (!name) return null;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  const first = parts[0][0];
  const last  = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
};
