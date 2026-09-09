import { useCallback, useEffect, useRef, useState } from 'react';
import { getLenis } from '../../hooks/useMomentumScroll';
import { useContent } from '../../context/ContentContext';
import { readName, writeName } from './identity';
import styles from './Intro.module.css';

/**
 * The opening: a loader, not a show.
 *
 * A hairline rule across the top tracks what has actually loaded, a counter
 * runs to 100, and the panel lifts the moment the site is ready. Nothing here
 * is decorative time. The previous version was a 4.3s book-opening sequence
 * with a portrait, a quill, embers, stars and light rays, and the honest
 * assessment is that it was 4.3 seconds of friction on every page load: a
 * decorative preloader running past about a second is cost with no return, and
 * a splash screen should never add delay the load did not already have.
 *
 * ── What the counter actually measures ───────────────────────────────────────
 * Five real signals, weighted by how much of the page each one unblocks: the
 * portfolio document, the copy overrides, the webfonts, the studio sites the
 * cover renders, and the window load event. It is a real progress bar, so it
 * can legitimately sit at 40 for a moment on a cold network. That is the point
 * of showing it rather than animating a fixed timeline.
 *
 * Two guards keep it honest in both directions:
 *   MIN_MS  a load that finishes in 80ms should not flash a panel at someone.
 *   MAX_MS  a dead network must never hold the site hostage. At the cap the
 *           bar completes and the panel lifts regardless of the network.
 *
 * ── Rules carried over from the previous version ─────────────────────────────
 *   1. Once per page load. A refresh, a fresh tab or a direct URL replays it;
 *      moving between routes inside the app does not. Hence a module-scoped
 *      flag: AppLayout unmounts when you open /admin and mounts again on the
 *      way back, and neither is a load.
 *   2. Any input skips it.
 *   3. It never gates the content. The page renders underneath from the first
 *      frame; this is purely an overlay.
 *   4. It does not exist under reduced motion, or with the site's own Motion
 *      toggle off.
 *
 * The counter is written straight to the DOM from one rAF loop rather than held
 * in state. At 60fps a state-driven counter is 60 React renders a second during
 * the exact window when the main thread is busiest mounting the app.
 */

let playedThisLoad = false;

/** Do not flash a panel at someone whose page was already cached. */
const MIN_MS = 480;
/**
 * Hard cap. Past this the bar completes whatever the network is doing, giving
 * a worst case of MAX_MS + HOLD_MS + LIFT_MS, about 2.7s, on a network that has
 * effectively failed. Kept deliberately tight: the page renders underneath this
 * panel from the first frame, so on a bad connection the honest thing is to
 * show the reader the skeletons rather than hold a counter in front of them.
 */
const MAX_MS = 2000;
/** A beat at 100 before the lift, so the number is legible at its end state. */
const HOLD_MS = 160;
/** Must match .curtain[data-state='lifting'] in Intro.module.css. */
const LIFT_MS = 560;
/** The shortened exit when someone skips. */
const SKIP_MS = 220;

/* How much of the wait each signal accounts for. Weighted by how much of the
 * page each unblocks, not evenly: the portfolio document is most of the site,
 * the studio sites are three cards on one band. */
const WEIGHTS = { portfolio: 0.4, copy: 0.12, fonts: 0.2, studio: 0.18, load: 0.1 };

const shouldPlay = () => {
  if (typeof window === 'undefined') return false;
  if (playedThisLoad) return false;
  if (document.documentElement.dataset.noAnimations === 'true') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
};

const Intro = () => {
  // Decided in the initialiser, not an effect, so the overlay is either in the
  // very first paint or never in the tree at all.
  const [playing, setPlaying] = useState(shouldPlay);
  const [state, setState] = useState('loading');

  const { data, loading: portfolioLoading, copyLoading, studioLoading } = useContent();

  const barRef = useRef(null);
  const numRef = useRef(null);
  const rafRef = useRef(0);
  const timerRef = useRef(0);

  /* Written by the effects below and read by the rAF loop. A ref rather than
     state on purpose: the loop must see the newest value without the component
     re-rendering to deliver it. */
  const signals = useRef({ portfolio: 0, copy: 0, fonts: 0, studio: 0, load: 0 });
  const startedAt = useRef(0);
  const doneRef = useRef(false);

  /*
   * The cached name is captured once, in a ref, so it cannot change under the
   * reader mid-load. A repeat visit therefore shows the name in the first
   * frame; a first-ever visit shows no name until the data lands, which is
   * quieter than showing a placeholder and then swapping it.
   */
  const cachedName = useRef(readName());
  const liveName = data?.personal?.name ?? null;
  const name = cachedName.current ?? liveName;

  // Refreshes the cache for next time, whatever it held before.
  useEffect(() => { writeName(liveName); }, [liveName]);

  const finish = useCallback(() => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    setPlaying(false);
  }, []);

  const lift = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setState('lifting');
    timerRef.current = setTimeout(finish, LIFT_MS);
  }, [finish]);

  // Guarded on a ref rather than state: four listeners can fire in the same
  // gesture, and reading state here would let two of them queue their own exit.
  const skippedRef = useRef(false);
  const skip = useCallback(() => {
    if (skippedRef.current || doneRef.current) return;
    skippedRef.current = true;
    doneRef.current = true;
    setState('skipping');
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(finish, SKIP_MS);
  }, [finish]);

  /* ── Real signals ─────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!playing) return;
    signals.current.portfolio = portfolioLoading ? 0 : 1;
    signals.current.copy = copyLoading ? 0 : 1;
    signals.current.studio = studioLoading ? 0 : 1;
  }, [playing, portfolioLoading, copyLoading, studioLoading]);

  useEffect(() => {
    if (!playing) return undefined;
    let live = true;

    // Fonts matter here specifically: this site sets its headings in a serif,
    // and revealing the cover before the swap means the first thing the reader
    // sees is the fallback reflowing.
    document.fonts?.ready.then(() => { if (live) signals.current.fonts = 1; });

    if (document.readyState === 'complete') {
      signals.current.load = 1;
      return () => { live = false; };
    }

    const onLoad = () => { signals.current.load = 1; };
    window.addEventListener('load', onLoad, { once: true });
    return () => { live = false; window.removeEventListener('load', onLoad); };
  }, [playing]);

  /* ── The loop ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!playing) return undefined;

    playedThisLoad = true;
    startedAt.current = performance.now();

    /*
     * Lenis is created by useMomentumScroll in AppLayout, whose effect runs
     * after this one - effects fire child-first - so getLenis() is null right
     * now. One frame's delay is enough for it to exist. Stopping it matters:
     * body overflow alone does not reach Lenis, which scrolls by transform off
     * its own virtual scroll, so a wheel during the intro would scroll the page
     * unseen and the reveal would land halfway down the site.
     */
    const lenisId = requestAnimationFrame(() => getLenis()?.stop());
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const opts = { passive: true, once: true };
    window.addEventListener('wheel', skip, opts);
    window.addEventListener('touchstart', skip, opts);
    window.addEventListener('pointerdown', skip, opts);
    window.addEventListener('keydown', skip, opts);

    let shown = 0;

    const tick = () => {
      const elapsed = performance.now() - startedAt.current;

      const real = Object.entries(WEIGHTS)
        .reduce((sum, [key, w]) => sum + w * (signals.current[key] ?? 0), 0);

      // Past the cap the bar completes on its own, so a stalled read cannot
      // strand the reader behind a panel that never lifts.
      const target = elapsed >= MAX_MS ? 1 : real;

      // Eased rather than snapped: a real signal lands as a step change, and a
      // counter that jumps 0 to 52 in one frame reads as broken, not as fast.
      shown += (target - shown) * 0.11;
      if (target - shown < 0.004) shown = target;

      const pct = Math.min(100, Math.round(shown * 100));
      if (numRef.current) numRef.current.textContent = String(pct);
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown.toFixed(4)})`;

      if (pct >= 100 && elapsed >= MIN_MS) {
        timerRef.current = setTimeout(lift, HOLD_MS);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    /*
     * Absolute failsafe, independent of the loop above. The cap inside tick()
     * only fires if frames are still being delivered, so anything that stops
     * rAF - a backgrounded tab, a long main-thread block - would leave the
     * panel up with no way down. This timer does not care about frames.
     */
    const failsafeId = setTimeout(lift, MAX_MS + HOLD_MS + 200);

    return () => {
      clearTimeout(failsafeId);
      cancelAnimationFrame(lenisId);
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchstart', skip);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      // Restored on every path out, including an unmount mid-animation, so the
      // site can never be left unscrollable.
      document.body.style.overflow = prevOverflow;
      getLenis()?.start();
    };
  }, [playing, skip, lift]);

  if (!playing) return null;

  return (
    // Decorative, and the page underneath carries all of it as real content, so
    // this is hidden from assistive tech entirely. Focus is never moved into it.
    <div className={styles.curtain} data-state={state} aria-hidden="true">
      <div className={styles.track}>
        <span ref={barRef} className={styles.bar} />
      </div>

      <div className={styles.foot}>
        <span className={styles.who}>{name ?? ''}</span>
        <span className={styles.count}>
          <span ref={numRef} className={styles.num}>0</span>
          <span className={styles.pct}>%</span>
        </span>
      </div>
    </div>
  );
};

export default Intro;
