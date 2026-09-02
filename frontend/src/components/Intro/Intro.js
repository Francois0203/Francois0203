import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaFeatherAlt } from 'react-icons/fa';
import { getLenis } from '../../hooks/useMomentumScroll';
import { readIdentity, resolveIdentity, preloadPhoto, initialsOf } from './identity';
import styles from './Intro.module.css';

/**
 * The opening title card - an introduction to the person, not to the site.
 *
 * The portrait settles onto a blank parchment leaf, the name rises beneath it,
 * a quill travels across and signs a rule under it, the title follows. Then the
 * leaf splits down the middle and swings open in perspective to reveal the
 * cover behind it.
 *
 * The book framing comes from the site itself - Prologue, Chapter I, "turn the
 * page whenever you're ready", a quill on the cover - but the *subject* is the
 * name and the face. A card that only said "Prologue" introduced the website's
 * table of contents; this introduces its author.
 *
 * The two halves opening are what make it an introduction rather than a wipe. A
 * clip-path reveal says "loading finished"; a book opening says "start here".
 *
 * ── Degrading ────────────────────────────────────────────────────────────────
 * The identity comes off the network, so the card is built to read at three
 * levels and each one is a designed state rather than a broken one:
 *
 *   photo + name + title   the full thing
 *   monogram + name + title   photo missing, slow, or broken
 *   quill mark only            no identity at all - first visit, offline
 *
 * See identity.js for how the name and photo arrive fast enough to animate.
 *
 * ── Rules ────────────────────────────────────────────────────────────────────
 *   1. Once per page load. A refresh, a fresh tab or a direct URL replays it;
 *      moving between routes inside the app does not. Hence a module-scoped
 *      flag rather than a mount check: AppLayout unmounts when you open /admin
 *      and mounts again on the way back, and neither is a load.
 *
 *   2. Any input skips it, in 200ms. Someone who has started reading has told
 *      you the intro is over, and that matters more the longer it runs.
 *
 *   3. It never gates the content. The cover renders underneath from the first
 *      frame; this is purely an overlay. If it broke outright the site would
 *      still be a working site.
 *
 *   4. It does not exist under reduced motion. A perspective book-open across
 *      the whole viewport is by far the largest piece of motion on the site, so
 *      the Motion toggle and prefers-reduced-motion skip it entirely rather
 *      than shortening it.
 *
 * The sequence is CSS keyframes throughout. Page load is when the main thread
 * is busiest - parsing, mounting, nine Firestore reads in flight - and CSS
 * animations run off it, where a JS timeline would drop frames at exactly the
 * wrong moment. Every animated property is transform, opacity or filter.
 */

/**
 * Module scope, so it lives exactly as long as the document does: set on the
 * first play, gone the moment the page is actually reloaded. That is the precise
 * lifetime of "this page load" - no storage to read, nothing to fail in private
 * mode, nothing to clear.
 *
 * Not written from the useState initialiser: StrictMode invokes the render
 * function twice, initialiser included, so the second pass would read the flag
 * its own first pass had just set and decide not to play.
 */
let playedThisLoad = false;

/** Must match the end of the book-open in Intro.module.css. */
const TOTAL_MS = 2460;
/** The shortened exit when someone skips. */
const SKIP_MS = 200;

/** Embers drifting up the parchment. Enough to feel alive, few enough to stay
 *  free - each is a 3px span running one composited transform. */
const EMBER_COUNT = 14;

/* How long to hold the sequence for the identity. Short with a warm cache -
 * only the photo is outstanding and it is almost certainly in the HTTP cache -
 * and longer on a first-ever visit, where the name itself is still in flight.
 * Either way the parchment is already covering the screen, so the wait reads as
 * a beat before the card appears rather than as a delay. */
const WARM_GATE_MS = 350;
const COLD_GATE_MS = 900;

const shouldPlay = () => {
  if (typeof window === 'undefined') return false;
  if (playedThisLoad) return false;
  if (document.documentElement.dataset.noAnimations === 'true') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
};

/* Randomised per mount rather than hand-picked: any values I chose by hand
 * would betray the grid I chose them on, and evenly spread embers read as a row
 * of dots rising rather than as drift. */
const buildEmbers = () =>
  Array.from({ length: EMBER_COUNT }, () => ({
    left:     `${Math.random() * 100}%`,
    size:     `${2 + Math.random() * 3}px`,
    duration: `${2400 + Math.random() * 2200}ms`,
    delay:    `${Math.random() * 1400}ms`,
    drift:    `${(Math.random() - 0.5) * 90}px`,
    peak:     `${0.25 + Math.random() * 0.5}`,
  }));

const Intro = () => {
  // Decided in the initialiser, not an effect, so the overlay is either in the
  // very first paint or never in the tree at all. Deciding it in an effect would
  // show the cover, then cover it up a frame later.
  const [playing, setPlaying] = useState(shouldPlay);
  const [skipped, setSkipped] = useState(false);

  /*
   * `started` gates the timed sequence - not the overlay. The parchment, halo
   * and embers are up from the first frame; only the card and the book-open
   * wait for the identity. Mounting the card is what starts its animation
   * delays, so nothing has to be re-timed against the gate.
   */
  const [started,  setStarted]  = useState(false);
  const [identity, setIdentity] = useState(null);

  /*
   * Tracked separately from `identity` on purpose. The photo is not allowed to
   * hold the sequence up - it loads alongside and crossfades into the portrait
   * disc whenever it lands. Gating on it meant a slow avatar either delayed
   * everything or lost the picture for the whole run.
   *
   * Seeded from the cache so a repeat visit can begin preloading before the
   * network has said anything, which is usually enough for the image to be
   * decoded by the time the card mounts.
   */
  const [photoUrl,   setPhotoUrl]   = useState(() => readIdentity()?.photoUrl ?? null);
  const [photoReady, setPhotoReady] = useState(false);

  const timerRef = useRef(0);
  const embers = useMemo(buildEmbers, []);

  const finish = useCallback(() => {
    clearTimeout(timerRef.current);
    setPlaying(false);
  }, []);

  // Guarded on a ref rather than on the `skipped` state. Four listeners can
  // fire in the same gesture (a tap is touchstart + pointerdown), and reading
  // state here would let two of them through before the re-render - each
  // queueing its own exit timer.
  const skippedRef = useRef(false);
  const skip = useCallback(() => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    setSkipped(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(finish, SKIP_MS);
  }, [finish]);

  /* ── Identity, then start ─────────────────────────────────────────────── */

  useEffect(() => {
    if (!playing) return undefined;

    let live = true;
    const warm = Boolean(readIdentity());

    resolveIdentity({ timeoutMs: warm ? WARM_GATE_MS : COLD_GATE_MS })
      .then((resolved) => {
        // A skip can land inside the gate - the listeners are live from mount,
        // before the sequence has anything to show. Starting anyway would pop
        // the card in and swing the leaves open behind a curtain that is
        // already fading out.
        if (!live || skippedRef.current) return;
        // Set together, in one render, so the card is never mounted with the
        // identity still missing - a second update after the reveal had begun
        // would swap the name under the reader mid-animation.
        setIdentity(resolved);
        setStarted(true);
        // The photo is the one thing allowed to arrive late, and it may be a
        // different url than the cache had (an edited photoUrl, or a changed
        // GitHub handle).
        if (resolved.photoUrl) setPhotoUrl(resolved.photoUrl);
      });

    return () => { live = false; };
  }, [playing]);

  /* Kicks off as soon as a url is known - from cache on mount, or from the
     fetch a moment later - and never blocks anything. */
  useEffect(() => {
    if (!playing || !photoUrl) return undefined;
    let live = true;
    preloadPhoto(photoUrl).then((ok) => { if (live && ok) setPhotoReady(true); });
    return () => { live = false; };
  }, [playing, photoUrl]);

  /* ── Runtime ──────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!playing) return undefined;

    playedThisLoad = true;

    /*
     * Lenis is created by useMomentumScroll in AppLayout, whose effect runs
     * after this one - effects fire child-first - so getLenis() is still null
     * right now. One frame's delay is enough for it to exist.
     *
     * Stopping it matters: body overflow alone does not reach Lenis, which
     * scrolls by transform off its own virtual scroll. Without this, a wheel
     * during the intro scrolls the page unseen behind the overlay and the
     * reveal lands halfway down the site.
     */
    const rafId = requestAnimationFrame(() => getLenis()?.stop());
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const opts = { passive: true, once: true };
    window.addEventListener('wheel',       skip, opts);
    window.addEventListener('touchstart',  skip, opts);
    window.addEventListener('pointerdown', skip, opts);
    window.addEventListener('keydown',     skip, opts);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel',       skip);
      window.removeEventListener('touchstart',  skip);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown',     skip);
      // Restored on every path out, including an unmount mid-animation, so the
      // site can never be left unscrollable.
      document.body.style.overflow = prevOverflow;
      getLenis()?.start();
    };
  }, [playing, skip]);

  // The unmount clock starts when the sequence does, not when the component
  // mounts - otherwise a slow first visit spends its gate eating into the
  // animation and the book-open gets cut off partway through.
  useEffect(() => {
    if (!started || skippedRef.current) return undefined;
    timerRef.current = setTimeout(finish, TOTAL_MS);
    return () => clearTimeout(timerRef.current);
  }, [started, finish]);

  if (!playing) return null;

  const name     = identity?.name ?? null;
  const title    = identity?.title ?? null;
  const initials = initialsOf(name);

  return (
    // Decorative, and the cover underneath carries all of it as real content,
    // so this is hidden from assistive tech entirely. Focus is never moved into
    // it - a keyboard user who tabs on arrival skips the intro and lands on the
    // real first control.
    <div
      className={[
        styles.curtain,
        started ? styles.started : '',
        skipped ? styles.skipping : '',
      ].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {/* The two halves of the leaf. These carry the parchment - the curtain
          itself is transparent, so once they swing open there is genuinely
          nothing left between the reader and the cover. */}
      <div className={`${styles.leaf} ${styles.leafLeft}`} />
      <div className={`${styles.leaf} ${styles.leafRight}`} />

      {/* The seam of light down the fold, which flares as the book parts. */}
      <div className={styles.seam} />

      <div className={styles.stage}>
        <div className={styles.halo} />

        <div className={styles.embers}>
          {embers.map((e, i) => (
            <span
              key={i}
              className={styles.ember}
              style={{
                left:      e.left,
                width:     e.size,
                height:    e.size,
                '--dur':   e.duration,
                '--delay': e.delay,
                '--drift': e.drift,
                '--peak':  e.peak,
              }}
            />
          ))}
        </div>

        {/* Mounted only once the identity has resolved, which is also what
            starts every delay inside it. */}
        {started && (
          <div className={styles.card}>
            {/* Both layers are always present and stacked: the monogram sits
                underneath, and the photo fades in on top the moment it has
                decoded. Swapping one element for the other would pop, and
                would relayout the disc if the photo arrived mid-animation. */}
            <div className={styles.portrait}>
              <span className={styles.portraitFallback}>
                {initials ?? <FaFeatherAlt />}
              </span>
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt=""
                  className={`${styles.portraitImg} ${photoReady ? styles.portraitImgReady : ''}`}
                />
              )}
              <span className={styles.portraitRing} />
            </div>

            {name && <h1 className={styles.name}>{name}</h1>}

            {/* The quill travels left to right while the rule draws behind it
                on the same curve, so the nib stays at the leading edge of the
                stroke - the name is being signed, not underlined. */}
            <span className={styles.penLine}>
              <span className={styles.rule} />
              <span className={styles.penTravel}>
                <FaFeatherAlt className={styles.quill} />
              </span>
            </span>

            {title && <p className={styles.title}>{title}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Intro;
