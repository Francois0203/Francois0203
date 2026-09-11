import { useEffect, useRef } from 'react';
import { getLenis } from './useMomentumScroll';

/**
 * Depth on scroll: many elements, one loop.
 *
 * ── Why this is JavaScript and not `animation-timeline: scroll()` ───────────
 * styles/Reveal.css drives the reading-progress bar off a scroll progress
 * timeline with no JavaScript at all, and that is the right tool there: the
 * bar's job is to map "0% to 100% of the document" onto "0% to 100% of a
 * scaleX". Parallax is the opposite kind of quantity. A layer has to move a
 * fixed number of pixels per pixel of scroll, and a progress timeline only
 * knows fractions of the document - so the same rate would travel four times
 * as far on the Bio page as on Connect, purely because Bio is longer. The
 * effect would be a different effect on every page, which is not an effect.
 *
 * `scroll()` also cannot express the other half of this, which is a layer
 * whose offset depends on where *it* sits relative to the viewport rather than
 * where the document does. `view()` timelines can, but only as a fraction of
 * the element's own pass through the viewport, and they are still unsupported
 * in Firefox and Safari - which is most of the phones that will see this site.
 *
 * ── What it costs ───────────────────────────────────────────────────────────
 * One passive scroll listener and one rAF for the whole site, no matter how
 * many layers register. The loop stops itself when the scroll position stops
 * changing, so an idle page runs nothing. Each frame writes `transform` on the
 * registered elements and reads nothing, so there is no layout thrash: the
 * measuring pass is separate and only runs when the page has actually resized.
 *
 * ── The one constraint on a target ──────────────────────────────────────────
 * The engine owns the element's inline `transform`. A target must therefore not
 * be an element that a stylesheet or another animation also transforms - which
 * in practice means never putting parallax on the same element as
 * `[data-reveal]`, whose entrance is a transform transition. Wrap, or use the
 * reveal's parent: a child's transform composes with its parent's, so a
 * parallax wrapper around revealing content is exactly right and the two never
 * touch the same property.
 */

/* el -> { rate, mode, max, applied, center } */
const layers = new Map();

let rafId = 0;
let lastScroll = -1;
let idleFrames = 0;
let measureNeeded = true;
let listening = false;
let resizeObserver = null;
let attrObserver = null;
let mq = null;

const prefersReduced = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* The in-app Motion toggle (Settings cog) writes this on <html>. Parallax is
   motion the reader did not ask for, so it is one of the first things that has
   to go when they turn motion off - the same test hooks/useMomentumScroll
   applies to the momentum scroller. */
const motionDisabled = () =>
  document.documentElement.getAttribute('data-no-animations') === 'true';

const enabled = () => !prefersReduced() && !motionDisabled();

/* Lenis's own position is fractional; window.scrollY is rounded to whole
   pixels by most browsers. Reading the rounded value means a layer moving at
   0.08 only changes every twelfth pixel of scroll, which is visible as a
   stepped judder on the slowest layers. */
const scrollPos = () => {
  const lenis = getLenis();
  const pos = lenis?.animatedScroll;
  return typeof pos === 'number' ? pos : window.scrollY;
};

const clamp = (n, limit) => (n > limit ? limit : n < -limit ? -limit : n);

/**
 * Records where each `view` layer sits in the document.
 *
 * The element's current offset has to be subtracted back out, because the
 * engine is what put it there: measuring a transformed element and then
 * deriving its offset from that measurement would feed the layer's own
 * position back into itself and drift a little further every pass.
 */
const measure = () => {
  const scroll = scrollPos();
  layers.forEach((layer, el) => {
    if (layer.mode !== 'view') return;
    const rect = el.getBoundingClientRect();
    layer.center = rect.top + scroll - layer.applied + rect.height / 2;
  });
  measureNeeded = false;
};

const apply = () => {
  const scroll = scrollPos();
  const viewCenter = scroll + window.innerHeight / 2;

  layers.forEach((layer, el) => {
    let y;

    if (layer.mode === 'page') {
      /* A fixed layer translating against the scroll direction at a fraction
         of its speed is what reads as distance: the content leaves the screen
         at rate 1, the layer at `rate`, and the gap between the two is the
         depth cue. */
      const travel = scroll * layer.rate;

      /* A page-anchored layer has an unbounded distance to cover - a long page
         is tens of thousands of pixels - and two ways to survive it.
         A repeating pattern wraps: translating it by one tile is
         indistinguishable from translating it by none, so taking the
         remainder gives motion that never ends and never runs off its own
         edge. Everything else is clamped, and a diffuse wash that stops
         drifting several screens down is not something a reader can see;
         the same wash sliding a thousand pixels out of its container is. */
      y = layer.period
        ? -(travel % layer.period)
        : -clamp(travel, layer.max);
    } else {
      /* An in-flow layer is measured from its own centre instead, so it sits
         level with the page when it is level with the eye and lags either side
         of that. Anchoring to the document's origin rather than the element's
         would offset a section near the bottom of a long page by hundreds of
         pixels before it was ever seen. */
      y = clamp((viewCenter - layer.center) * layer.rate, layer.max);
    }

    /* Rounded to a third of a pixel. Sub-pixel transforms are honoured by the
       compositor, but writing a value that differs in the ninth decimal still
       costs a full style write, and there are up to a dozen of these. */
    const next = Math.round(y * 3) / 3;
    if (next === layer.applied) return;
    layer.applied = next;
    el.style.transform = `translate3d(0, ${next}px, 0)`;
  });
};

const clear = () => {
  layers.forEach((layer, el) => {
    layer.applied = 0;
    el.style.transform = '';
  });
};

const frame = () => {
  const scroll = scrollPos();

  if (scroll === lastScroll && !measureNeeded) {
    /* Two idle frames rather than one: Lenis settles asymptotically, and a
       single frame of no movement happens mid-glide often enough that stopping
       on it would drop the last few pixels of every scroll. */
    if (++idleFrames > 2) { rafId = 0; return; }
  } else {
    idleFrames = 0;
  }

  lastScroll = scroll;
  if (measureNeeded) measure();
  apply();

  rafId = requestAnimationFrame(frame);
};

const wake = () => {
  if (!enabled() || layers.size === 0) return;
  idleFrames = 0;
  if (!rafId) rafId = requestAnimationFrame(frame);
};

const remeasure = () => { measureNeeded = true; wake(); };

const sync = () => {
  if (enabled()) {
    remeasure();
  } else {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    clear();
  }
};

const listen = () => {
  if (listening) return;
  listening = true;

  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', remeasure);

  /* Every page here fills in after first paint - the portfolio documents, the
     GitHub project list, an opened README - so an element measured at mount is
     rarely where it ends up. Watching the body for size changes is the same
     problem useMomentumScroll solves for Lenis's scroll height, and the same
     answer. Coalesced to one pass per frame so a settling image or a swapping
     font cannot fire it once per mutation. */
  if (typeof ResizeObserver !== 'undefined') {
    let pending = 0;
    resizeObserver = new ResizeObserver(() => {
      if (pending) return;
      pending = requestAnimationFrame(() => { pending = 0; remeasure(); });
    });
    resizeObserver.observe(document.body);
  }

  attrObserver = new MutationObserver(sync);
  attrObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-no-animations'],
  });

  mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  mq?.addEventListener('change', sync);
};

const unlisten = () => {
  if (!listening) return;
  listening = false;

  window.removeEventListener('scroll', wake);
  window.removeEventListener('resize', remeasure);
  resizeObserver?.disconnect();
  resizeObserver = null;
  attrObserver?.disconnect();
  attrObserver = null;
  mq?.removeEventListener('change', sync);
  mq = null;

  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  lastScroll = -1;
};

const register = (el, cfg) => {
  layers.set(el, { ...cfg, applied: 0, center: 0 });
  listen();

  /*
   * Placed immediately, not on the next frame.
   *
   * A layer's resting offset depends on the scroll position, and a page does
   * not always mount at the top: a reload restores the reader's position, and
   * so does the browser's back button. Waiting for a frame means the first one
   * paints every layer at zero and the second one snaps them all into place,
   * which is a flash of the page with its depth collapsed - exactly at the
   * moment someone is looking at it.
   *
   * It also means the engine's state is observable without an animation
   * frame, which is the only way anything here can be checked in a headless
   * browser: Chrome freezes rAF under `--virtual-time-budget`, so a loop that
   * only ever acts inside a frame reports nothing at all. See
   * dev/ParallaxPreview.
   */
  if (enabled()) {
    measureNeeded = true;
    measure();
    apply();
  }

  remeasure();

  return () => {
    el.style.transform = '';
    layers.delete(el);
    /* The last layer to leave turns the lights off, so navigating to /admin -
       which is outside the public layout and registers nothing - leaves no
       scroll listener behind. */
    if (layers.size === 0) unlisten();
  };
};

/**
 * Registers one element as a parallax layer and returns the ref to attach.
 *
 * @param {object}  [options]
 * @param {number}  [options.rate=0.08] pixels of layer travel per pixel of
 *        scroll. Keep these small and keep them different: the effect is the
 *        *difference* between two layers' rates, so 0.04 against 0.12 reads as
 *        depth while 0.30 alone reads as something being dragged.
 * @param {'page'|'view'} [options.mode='view'] `page` anchors to the document
 *        scroll and is for fixed backdrop layers; `view` anchors to the
 *        element's own position and is for anything in the flow.
 * @param {number}  [options.max=90] the furthest the layer may travel, in
 *        pixels. Without a cap, a long page's rate compounds into a section
 *        sitting visibly outside the gap it was laid out in.
 * @param {number}  [options.period] `page` mode only, and only for a layer
 *        whose paint repeats: the tile height in pixels. The travel is taken
 *        modulo this, which makes the layer's drift endless instead of capped.
 *        It must match the pattern exactly or the wrap will be visible as a
 *        jump.
 * @param {boolean} [options.enabled=true] pass false to opt out, for a layer
 *        that is conditionally rendered or measured elsewhere.
 * @returns {React.RefObject<HTMLElement>}
 */
const useParallax = ({
  rate = 0.08,
  mode = 'view',
  max = 90,
  period = 0,
  enabled: on = true,
} = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !on || typeof window === 'undefined') return undefined;
    return register(el, { rate, mode, max, period });
  }, [rate, mode, max, period, on]);

  return ref;
};

export default useParallax;
