import { useCallback, useMemo, useRef } from 'react';
import { MdArrowOutward, MdSchool, MdWork } from 'react-icons/md';
import { getLenis } from '../../hooks/useMomentumScroll';
import styles from './Roadmap.module.css';

/**
 * The journey, travelled sideways.
 *
 * The section pins to the viewport and, as you keep scrolling down, the route
 * advances horizontally through the waypoints - then releases and normal
 * scrolling resumes. You move along the route rather than past a list of it.
 *
 * ── The choreography, and why it is built this way ───────────────────────────
 * The first version panned at a constant rate and each panel's only response to
 * its own position was a weak fade. It worked and it read as nothing: linear
 * motion has no character. What gives a pinned pan life is that each panel does
 * something as a function of where it is, and that different depths move at
 * different rates.
 *
 * So: layers at 25% / 100% / 120% of the pan (far haze, the panels, a trail
 * head that runs ahead), and each panel turns to face you as it reaches centre,
 * dwells there, then turns away - with its number and its text counter-drifting
 * against the direction of travel, which is what actually reads as depth.
 *
 * ── Why every panel is driven from ONE timeline ──────────────────────────────
 * The obvious approach is `animation-timeline: view(inline)` per panel, letting
 * each measure its own position. That does not work here, and the reason is
 * worth writing down: a view progress timeline is computed from the subject's
 * LAYOUT position inside the scrollport, and these panels are moved by
 * `transform`. Their layout position never changes, so such a timeline would
 * sit at one progress value forever.
 *
 * Instead every panel shares the section's `--journey` timeline and takes its
 * own slice of it via `animation-range`. Panel `i` is centred when the pan is
 * `i / (n - 1)` of the way along, which is known arithmetic - so the slice is
 * computed once at render as a static inline string and the compositor does the
 * rest. Still no scroll listener, no rAF, no per-frame JS.
 *
 * Descendants pick the same slice up through `animation-range: inherit`, so
 * text inside a panel can stagger against its own arrival without needing a
 * second computed value per element.
 *
 * ── Degrading ────────────────────────────────────────────────────────────────
 * Pinning is opt-in and three things opt out: no scroll-driven animation
 * support (Firefox today), viewports under 900px, and reduced motion. In all
 * three the section is a native horizontal scroller with snapping - swipeable,
 * arrow-key scrollable, and with the trail drawn in full rather than empty.
 */

/** How much of the gap to a neighbouring waypoint one panel's slice spans.
 *  Above 1 the panels' choreography overlaps slightly, which keeps the motion
 *  continuous instead of handing off in visible steps. */
const SLICE = 1.15;

const Roadmap = ({
  stops = [],
  onSelect,
  heading,
  emptyText = 'The route is still being drawn.',
}) => {
  const outerRef = useRef(null);
  const trackRef = useRef(null);

  const handleSelect = useCallback((stop) => () => onSelect?.(stop), [onSelect]);

  /**
   * Each panel's slice of the journey timeline. Computed once per data change,
   * never per frame.
   */
  const ranges = useMemo(() => {
    const last = Math.max(1, stops.length - 1);
    const half = (100 / last) * SLICE;

    return stops.map((_, i) => {
      const centre = (i / last) * 100;
      const from = centre - half;
      const to = centre + half;

      /*
       * The first and last panels reach outside the `contain` phase.
       *
       * Panel 0 is centred at progress 0, so a slice centred on it would need
       * to start at a negative percentage. Clamping it to 0 instead breaks the
       * mapping: the panel would sit at its keyframe 0% - turned away, text at
       * opacity 0 - at the exact moment the reader first sees it. Measured that
       * on the first pass.
       *
       * `entry` and `exit` are the phases either side of `contain`, covering
       * the section scrolling into and out of view. Borrowing from them gives
       * the first panel somewhere real to turn *from* as the section arrives,
       * and the last somewhere to turn away *to* as it leaves - with one
       * keyframe set rather than three.
       */
      if (i === 0) return `entry 55% contain ${to.toFixed(2)}%`;
      if (i === last) return `contain ${from.toFixed(2)}% exit 45%`;

      return `contain ${from.toFixed(2)}% contain ${to.toFixed(2)}%`;
    });
  }, [stops]);

  /**
   * Scroll the page to the point where the pan has reached waypoint `i`.
   *
   * Progress across the pinned range maps linearly to scroll position between
   * the section's top and the point where its bottom clears the viewport.
   */
  const goTo = useCallback((i) => {
    const el = outerRef.current;
    if (!el || stops.length < 2) return;

    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const travel = Math.max(1, rect.height - window.innerHeight);
    const target = Math.round(top + (i / (stops.length - 1)) * travel);

    // Lenis owns the page scroll when it is running; going through the window
    // instead would fight it and land somewhere else.
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target);
    else window.scrollTo({ top: target, behavior: 'smooth' });
  }, [stops.length]);

  /*
   * Arrow keys on the track.
   *
   * Only meaningful in the native-scroller fallback, where the <ol> is a real
   * scroll container - without this you could not move it at all without
   * tabbing through every card in turn. In pinned mode there is nothing to
   * scroll, so the guard makes this a no-op and the page scroll drives the pan.
   */
  const onTrackKeyDown = useCallback((e) => {
    const el = trackRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;

    const page = el.clientWidth * 0.8;
    const delta =
      e.key === 'ArrowRight' ? page
        : e.key === 'ArrowLeft' ? -page
          : e.key === 'Home' ? -el.scrollLeft
            : e.key === 'End' ? el.scrollWidth
              : 0;

    if (!delta) return;
    e.preventDefault();
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  if (stops.length === 0) {
    return <p className={styles.empty}>{emptyText}</p>;
  }

  const last = Math.max(1, stops.length - 1);

  return (
    <div ref={outerRef} className={styles.outer} style={{ '--n': stops.length }}>
      <div className={styles.pin}>
        {/* Far distance, panning at a quarter of the route's rate. Two things
            moving at different speeds is the whole of parallax. */}
        <div className={styles.horizon} aria-hidden="true">
          <span className={styles.haze} />
          <span className={styles.grid} />
        </div>

        {/* Context that survives the pin: once the section takes the viewport,
            the page's own heading has scrolled away. */}
        {heading && (
          <p className={styles.caption} aria-hidden="true">
            <span className={styles.captionRule} />
            {heading}
          </p>
        )}

        <div className={styles.rail} aria-hidden="true">
          <span className={styles.railTrack} />
          <span className={styles.railFill} />
          {/* Runs at 120%, so it pulls ahead of the panels rather than sitting
              among them. */}
          <span className={styles.traveller} />
        </div>

        <ol
          ref={trackRef}
          className={styles.track}
          tabIndex={0}
          onKeyDown={onTrackKeyDown}
          aria-label="The journey, in order"
        >
          {stops.map((s, i) => {
            const isEdu = s.kind === 'education';
            const Icon = isEdu ? MdSchool : MdWork;

            return (
              <li
                key={s.id ?? i}
                className={styles.stop}
                /* This panel's slice of the journey. Descendants inherit it. */
                style={{ animationRange: ranges[i] }}
              >
                <span className={styles.ghost} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className={styles.waypoint} aria-hidden="true">
                  <Icon className={styles.waypointIcon} />
                </span>

                <button
                  type="button"
                  className={styles.card}
                  onClick={handleSelect(s)}
                  disabled={!onSelect}
                >
                  {/* The counter-drift rides this wrapper, so the card's own
                      border and shadow stay put while its contents shift. */}
                  <span className={styles.cardInner}>
                    <span className={styles.meta}>
                      <span className={styles.kind}>
                        {isEdu ? 'Education' : 'Experience'}
                      </span>
                      {s.period && <span className={styles.period}>{s.period}</span>}
                    </span>

                    <span className={styles.title}>
                      {s.title}
                      <MdArrowOutward className={styles.arrow} aria-hidden="true" />
                    </span>

                    {s.subtitle && <span className={styles.sub}>{s.subtitle}</span>}
                    {s.description && <span className={styles.desc}>{s.description}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <nav className={styles.dots} aria-label="Jump to a waypoint">
          {stops.map((s, i) => {
            const to = (i / last) * 100;
            return (
              <button
                key={s.id ?? i}
                type="button"
                className={styles.dot}
                style={{ animationRange: `contain ${Math.max(0, to - 7)}% contain ${to}%` }}
                onClick={() => goTo(i)}
                aria-label={`${i + 1}. ${s.title}`}
              >
                <span className={styles.dotMark} />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Roadmap;
