import { getPersonal, getSocial } from '../../firebase/firestore';

/**
 * Who the intro is about, available fast enough to actually animate.
 *
 * The problem this exists to solve: the intro's subject is the name and the
 * face, and both live in Firestore. ContentProvider does have them, but
 * getPortfolio() resolves only once all nine of its reads have settled, which
 * is far too late - and reading them in through context would mean the name
 * popping into a card the reader is already looking at.
 *
 * So: read the two documents that matter instead of nine, cache the answer in
 * localStorage, and seed the next load from that cache synchronously. A
 * first-ever visit waits a few hundred ms behind a parchment sheet that is
 * already covering the screen, so the wait is invisible. Every load after that
 * is instant.
 *
 * The cache is not the source of truth for anything - it only decides what the
 * intro draws, it is refreshed on every load, and if it is missing or stale the
 * intro degrades rather than breaks.
 */

const CACHE_KEY = 'fm:identity';

const EMPTY = { name: null, title: null, photoUrl: null };

/**
 * The same fallback chain the cover uses (see Home.js): an explicit photoUrl
 * wins, and failing that the GitHub avatar is derived from the social document.
 * Duplicating the chain here rather than reading one field is the whole fix for
 * the intro showing a monogram while the cover two seconds later showed a face
 * - photoUrl is frequently empty precisely because the GitHub fallback works.
 */
const resolvePhotoUrl = (personal, platforms) => {
  if (personal?.photoUrl) return personal.photoUrl;
  const github = (platforms ?? []).find(p => (p?.key || '').toLowerCase() === 'github');
  const handle = github?.url?.replace(/\/$/, '').split('/').pop();
  return handle ? `https://github.com/${handle}.png` : null;
};

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
 * Resolves true only once the image is actually decodable, so the portrait can
 * never appear as a half-painted band partway through its own reveal. Never
 * rejects - a missing or broken photo is a state the intro is designed for, not
 * an error.
 */
export const preloadPhoto = (url) =>
  new Promise((resolve) => {
    if (!url) { resolve(false); return; }
    const img = new Image();
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });

/**
 * Deliberately does NOT wait for the image.
 *
 * An earlier version raced the photo download inside this gate, which meant a
 * slow avatar either delayed the whole sequence or fell through to the monogram
 * for the entire run. The photo now loads alongside and crossfades into the
 * portrait disc whenever it lands - so the timing of the card never depends on
 * the network, and the picture is not sacrificed to hold the schedule.
 *
 * @param {number} timeoutMs how long to hold the sequence for the name.
 * @returns {Promise<{name, title, photoUrl}>}
 */
export const resolveIdentity = async ({ timeoutMs = 900 } = {}) => {
  const cached = readIdentity();

  // Runs to completion whether or not it wins the race below, so the cache is
  // refreshed on every load even when the intro started without waiting.
  const work = (async () => {
    try {
      // Both at once - the second read is free in wall-clock terms.
      const [personal, platforms] = await Promise.all([getPersonal(), getSocial()]);
      if (personal?.name) {
        const identity = {
          name:     personal.name  ?? null,
          title:    personal.title ?? null,
          photoUrl: resolvePhotoUrl(personal, platforms),
        };
        writeIdentity(identity);
        return identity;
      }
    } catch {
      // Offline, or rules changed. Whatever the cache holds is still the best
      // answer available, and no answer at all is handled downstream.
    }
    return cached ?? EMPTY;
  })();

  const settled = await Promise.race([
    work,
    new Promise((resolve) => { setTimeout(() => resolve(null), timeoutMs); }),
  ]);

  // Timed out: go with the cache. The monogram fallback is a designed state, so
  // an empty cache still looks deliberate rather than unfinished.
  return settled ?? (cached ?? EMPTY);
};

/**
 * "François Meiring" → "FM". Two letters at most: three initials in a 104px
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
