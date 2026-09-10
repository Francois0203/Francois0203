import { useCallback, useEffect, useRef, useState } from 'react';
import { getLenis } from '../../hooks/useMomentumScroll';
import { useContent } from '../../context/ContentContext';
import { readName, writeName } from './identity';
import styles from './Intro.module.css';

/**
 * The opening: liquid glass floods the viewport, then drains away.
 *
 * The site is briefly visible, sharp. Glass rises from below the fold behind a
 * rippling meniscus, decelerating as it reaches level. The name surfaces as the
 * water passes it. A specular highlight travels across the surface. Then the
 * level drops and drains off the bottom, leaving the site.
 *
 * ── What "liquid glass" is made of, and what each part costs ─────────────────
 * Translucency and blur is `backdrop-filter`. The specular highlight is a
 * gradient that moves. The rim and the chromatic edge are static inset
 * shadows. True refraction - the lensing that displaces what is behind the
 * glass - needs an SVG displacement map used as a backdrop-filter, which is
 * Chrome-only and rebuilds that map whenever the geometry changes. It is not
 * used here.
 *
 * ── The rules this obeys, and why ────────────────────────────────────────────
 * `backdrop-filter` costs a full re-blur of everything behind it on every
 * frame in which it, or anything behind it, moves. So:
 *
 *   1. There is exactly ONE backdrop-filter element - the water body.
 *   2. Its geometry never animates. No border-radius morph, no clip-path
 *      animation, no width or height. Only transform and opacity.
 *   3. The liquid is in FRONT of the glass, not in it: the meniscus is two
 *      wave overlays translating horizontally at different speeds. Two phases
 *      beating against each other is what reads as a moving water surface, and
 *      transform-only means each rasterises once.
 *
 * Rule 2 is not theoretical. pages/Loading had three glass blobs each carrying
 * backdrop-filter while being translated every frame AND morphing their
 * border-radius on an infinite loop, and it is the Suspense fallback for every
 * route, so it paid that bill on every navigation.
 *
 * ── One animation, not a timeline ────────────────────────────────────────────
 * The tide is a single CSS animation whose keyframes carry their own timing
 * functions, so the rise can decelerate, the hold can be still, and the drain
 * can accelerate - without a JS timeline. The only JS clock is one timer for
 * the unmount.
 *
 * ── Rules carried over ───────────────────────────────────────────────────────
 *   1. Once per page load. A refresh, a fresh tab or a direct URL replays it;
 *      moving between routes does not. Hence the module-scoped flag: AppLayout
 *      unmounts on /admin and mounts again on the way back, and neither is a
 *      load.
 *   2. Any input skips it.
 *   3. It never gates the content - the page is rendered underneath from the
 *      first frame; this is purely an overlay.
 *   4. It does not exist under reduced motion or the site's Motion toggle.
 */

let playedThisLoad = false;

/** Total run. Must match the `tide` keyframes in Intro.module.css. */
const TOTAL_MS = 3100;
/** The shortened exit when someone skips. */
const SKIP_MS = 220;

const shouldPlay = () => {
  if (typeof window === 'undefined') return false;
  if (playedThisLoad) return false;
  if (document.documentElement.dataset.noAnimations === 'true') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
};

/**
 * Four periods of a wave across a 2400-unit box, closed downward into a solid.
 *
 * Four rather than one so the element can be 200% wide and loop by translating
 * exactly one period - 600 units, a quarter of its own width - which is
 * seamless because the path is periodic. A single period stretched to 200%
 * would visibly snap back.
 */
const WAVE = [
  'M0,40',
  'C100,10 200,10 300,40 C400,70 500,70 600,40',
  'C700,10 800,10 900,40 C1000,70 1100,70 1200,40',
  'C1300,10 1400,10 1500,40 C1600,70 1700,70 1800,40',
  'C1900,10 2000,10 2100,40 C2200,70 2300,70 2400,40',
  'L2400,120 L0,120 Z',
].join(' ');

const Wave = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 2400 120"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path d={WAVE} />
  </svg>
);

const Intro = () => {
  // Decided in the initialiser, not an effect, so the overlay is either in the
  // very first paint or never in the tree at all.
  const [playing, setPlaying] = useState(shouldPlay);
  const [skipping, setSkipping] = useState(false);

  const { data } = useContent();
  const timerRef = useRef(0);
  const doneRef = useRef(false);

  /*
   * Captured once, so the name cannot change under the reader mid-sequence. A
   * repeat visit has it in the first frame; a first visit picks it up when the
   * data lands, which is well before the name's own reveal at 700ms.
   */
  const cachedName = useRef(readName());
  const liveName = data?.personal?.name ?? null;
  const name = cachedName.current ?? liveName;
  useEffect(() => { writeName(liveName); }, [liveName]);

  const finish = useCallback(() => {
    clearTimeout(timerRef.current);
    setPlaying(false);
  }, []);

  // Guarded on a ref rather than state: four listeners can fire in the same
  // gesture, and reading state here would let two of them queue their own exit.
  const skip = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setSkipping(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(finish, SKIP_MS);
  }, [finish]);

  useEffect(() => {
    if (!playing) return undefined;

    playedThisLoad = true;

    /*
     * Lenis is created by useMomentumScroll in AppLayout, whose effect runs
     * after this one - effects fire child-first - so getLenis() is null right
     * now. One frame's delay is enough. Stopping it matters: body overflow
     * alone does not reach Lenis, which scrolls by transform off its own
     * virtual scroll, so a wheel during the intro would scroll the page unseen
     * and the reveal would land halfway down the site.
     */
    const lenisId = requestAnimationFrame(() => getLenis()?.stop());
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const opts = { passive: true, once: true };
    window.addEventListener('wheel', skip, opts);
    window.addEventListener('touchstart', skip, opts);
    window.addEventListener('pointerdown', skip, opts);
    window.addEventListener('keydown', skip, opts);

    timerRef.current = setTimeout(() => { doneRef.current = true; finish(); }, TOTAL_MS);

    return () => {
      cancelAnimationFrame(lenisId);
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
  }, [playing, skip, finish]);

  if (!playing) return null;

  return (
    // Decorative, and the page underneath carries all of it as real content, so
    // this is hidden from assistive tech entirely. Focus is never moved into it.
    <div
      className={styles.curtain}
      data-state={skipping ? 'skipping' : 'playing'}
      aria-hidden="true"
    >
      {/* Everything rides this one element, so the tide is a single transform
          rather than several kept in sync. */}
      <div className={styles.body}>
        <div className={styles.water}>
          <span className={styles.specular} />
        </div>

        {/* The meniscus straddles the top edge of the body. Two phases at
            different speeds and amplitudes; neither is in sync with the other,
            which is what stops it reading as a repeating graphic. */}
        <div className={styles.surface}>
          <Wave className={styles.waveBack} />
          <Wave className={styles.waveFront} />
          <span className={styles.crest} />
        </div>

        <div className={styles.title}>
          <h1 className={styles.name}>{name ?? ''}</h1>
          <p className={styles.role}>Data Scientist &middot; Researcher &middot; Developer</p>
        </div>
      </div>
    </div>
  );
};

export default Intro;
