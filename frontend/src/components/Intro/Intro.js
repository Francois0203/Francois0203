import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getLenis } from '../../hooks/useMomentumScroll';
import { useContent } from '../../context/ContentContext';
import { readName, writeName } from './identity';
import styles from './Intro.module.css';

/**
 * The opening: a parallax star field that resolves into a constellation, then
 * flies through it into the site.
 *
 * ── Why stars, and why parallax ──────────────────────────────────────────────
 * Not decoration picked for looking expensive. Parallax - the apparent shift of
 * a near star against far ones as the observer moves - is how astronomers
 * measure distance, and astronomical data processing is the MSc this portfolio
 * is about. So the depth is the subject: three layers of stars fly out at three
 * different rates, and the nearest ones streak past while the far field barely
 * moves. Lift the idea out and the subject goes with it, which is the test this
 * site's design has to pass.
 *
 * The constellation is nine stars joined into an asterism that climbs left to
 * right, then breaks into a loop - a route between fixed points, which is the
 * same gesture the roadmap further down the page makes.
 *
 * ── The sequence ─────────────────────────────────────────────────────────────
 *      0 -  900   the field fades up, layer by layer, and drifts
 *    600 - 1700   the constellation draws itself between the nine stars
 *   1150 - 1900   each joined star flares as the line reaches it
 *   1500 - 2200   the name resolves out of blur beneath it
 *   2200 - 2500   hold
 *   2500 - 3200   flight: the three layers accelerate outward at their own
 *                 rates, the constellation recedes, the panel dissolves
 *   3200         unmounts
 *
 * ── Cost ─────────────────────────────────────────────────────────────────────
 * Every moving thing is a transform or an opacity on its own element, so the
 * whole sequence composites. The flight scales three containers rather than
 * ~70 stars individually - one transform per layer per frame, not seventy. The
 * star count halves on a small screen. There is no JS timeline at all: the only
 * JS is one timer for the flight and one for the unmount.
 *
 * ── Rules ────────────────────────────────────────────────────────────────────
 *   1. Once per page load. A refresh, a fresh tab or a direct URL replays it;
 *      moving between routes inside the app does not. Hence a module-scoped
 *      flag: AppLayout unmounts when you open /admin and mounts again on the
 *      way back, and neither is a load.
 *   2. Any input skips it, fast.
 *   3. It never gates the content. The page renders underneath from the first
 *      frame; this is purely an overlay.
 *   4. It does not exist under reduced motion, or with the site's Motion
 *      toggle off. A full-viewport flight is the largest motion on the site.
 */

let playedThisLoad = false;

/** When the flight begins. Must match the delays in Intro.module.css. */
const FLIGHT_AT = 2500;
/** Flight duration; the panel unmounts at FLIGHT_AT + FLIGHT_MS. */
const FLIGHT_MS = 700;
/** The shortened exit when someone skips. */
const SKIP_MS = 220;

/* A small screen is also the slowest device and the one most likely to be on a
 * battery, so the field is budgeted rather than scaled. */
const IS_SMALL = typeof window !== 'undefined' &&
  (window.matchMedia?.('(max-width: 640px)').matches ||
   window.matchMedia?.('(pointer: coarse)').matches);

/* Three depths. `z` drives both how bright and how fast: the near layer is the
 * one that streaks past, the far layer barely moves, and that difference is the
 * parallax the whole thing is built on. */
const LAYERS = [
  { key: 'far',  count: IS_SMALL ? 26 : 64, z: 0.35 },
  { key: 'mid',  count: IS_SMALL ? 12 : 28, z: 0.75 },
  { key: 'near', count: IS_SMALL ? 5  : 11, z: 1.35 },
];

/**
 * The asterism, in a 1000x560 box. Hand-placed rather than random: a random
 * walk reads as a scribble, and the one thing a constellation has to look like
 * is a shape someone once decided was worth naming.
 *
 * Percentages, so the figure scales with the viewport and never needs
 * measuring - which is what keeps this whole component free of layout reads.
 */
const FIGURE = [
  [12, 71], [25, 59], [33, 34], [47, 45], [56, 23],
  [69, 38], [77, 64], [89, 54], [62, 75],
];

/* Index pairs, so the chain can branch. A single polyline would force the
 * figure to be one unbroken path, and an asterism that never forks reads as a
 * zigzag rather than a shape. */
const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [3, 8], [8, 6],
];

const shouldPlay = () => {
  if (typeof window === 'undefined') return false;
  if (playedThisLoad) return false;
  if (document.documentElement.dataset.noAnimations === 'true') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
};

/* Randomised per mount rather than hand-picked: values chosen by hand betray
 * the grid they were chosen on, and an evenly spread field reads as a dot
 * screen rather than as sky. */
const buildField = () =>
  LAYERS.flatMap(({ key, count, z }) =>
    Array.from({ length: count }, (_, i) => ({
      id: `${key}-${i}`,
      layer: key,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      /*
       * Depth is expressed as a narrow multiplier, not as a raw factor of z.
       * Scaling size straight by z put the far layer at 0.3px - below a device
       * pixel - so two thirds of the field rendered as nothing at all. The
       * spread here still reads as depth while every star stays visible.
       */
      size: `${((1.1 + Math.random() * 1.7) * (0.62 + z * 0.4)).toFixed(2)}px`,
      delay: `${Math.random() * 700}ms`,
      twinkle: `${2200 + Math.random() * 2600}ms`,
      peak: ((0.32 + Math.random() * 0.5) * (0.58 + z * 0.34)).toFixed(3),
    })),
  );

const Intro = () => {
  // Decided in the initialiser, not an effect, so the overlay is either in the
  // very first paint or never in the tree at all.
  const [playing, setPlaying] = useState(shouldPlay);
  const [state, setState] = useState('show');

  const { data } = useContent();
  const field = useMemo(buildField, []);
  const timerRef = useRef(0);
  const flightRef = useRef(0);
  const doneRef = useRef(false);

  /*
   * The cached name is captured once, in a ref, so it cannot change under the
   * reader mid-sequence. A repeat visit shows it in the first frame; a
   * first-ever visit shows it as soon as the data lands, which is well before
   * the name's own reveal at 1500ms.
   */
  const cachedName = useRef(readName());
  const liveName = data?.personal?.name ?? null;
  const name = cachedName.current ?? liveName;
  useEffect(() => { writeName(liveName); }, [liveName]);

  const finish = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(flightRef.current);
    setPlaying(false);
  }, []);

  // Guarded on a ref rather than state: four listeners can fire in the same
  // gesture, and reading state here would let two of them queue their own exit.
  const skip = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setState('skipping');
    clearTimeout(timerRef.current);
    clearTimeout(flightRef.current);
    timerRef.current = setTimeout(finish, SKIP_MS);
  }, [finish]);

  useEffect(() => {
    if (!playing) return undefined;

    playedThisLoad = true;

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

    // Two timers, and that is the entire JS timeline: the choreography is CSS,
    // which runs off the main thread while the app is still mounting.
    flightRef.current = setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      setState('flight');
      timerRef.current = setTimeout(finish, FLIGHT_MS);
    }, FLIGHT_AT);

    return () => {
      cancelAnimationFrame(lenisId);
      clearTimeout(timerRef.current);
      clearTimeout(flightRef.current);
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
    <div className={styles.curtain} data-state={state} aria-hidden="true">
      {LAYERS.map(({ key }) => (
        <div key={key} className={`${styles.layer} ${styles[key]}`}>
          {field.filter(s => s.layer === key).map(s => (
            <span
              key={s.id}
              className={styles.star}
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                '--delay': s.delay,
                '--twinkle': s.twinkle,
                '--peak': s.peak,
              }}
            />
          ))}
        </div>
      ))}

      {/* The figure sits in its own layer so the flight can push it back while
          the near stars rush forward - the two moving opposite ways is what
          sells the depth. */}
      <div className={styles.figure}>
        <svg
          className={styles.chart}
          viewBox="0 0 1000 560"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          aria-hidden="true"
        >
          {EDGES.map(([a, b], i) => (
            <line
              key={`${a}-${b}`}
              className={styles.edge}
              style={{ '--ei': i }}
              x1={FIGURE[a][0] * 10} y1={FIGURE[a][1] * 5.6}
              x2={FIGURE[b][0] * 10} y2={FIGURE[b][1] * 5.6}
            />
          ))}

          {FIGURE.map(([x, y], i) => (
            <g key={`${x}-${y}`} className={styles.node} style={{ '--ni': i }}>
              <circle className={styles.nodeHalo} cx={x * 10} cy={y * 5.6} r="13" />
              <circle className={styles.nodeCore} cx={x * 10} cy={y * 5.6} r="3.2" />
            </g>
          ))}
        </svg>
      </div>

      <div className={styles.title}>
        <h1 className={styles.name}>{name ?? ''}</h1>
        <p className={styles.role}>Data Scientist &middot; Researcher &middot; Developer</p>
      </div>
    </div>
  );
};

export default Intro;
