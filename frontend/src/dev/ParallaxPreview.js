import { useEffect } from 'react';
import { ParallaxBackdrop } from '../components';
import Parallax from '../components/Parallax/Parallax';

/**
 * A development-only harness for the parallax layers.
 *
 * The effect is the difference between layers, so a single screenshot of it is
 * worthless: what has to be checked is that a given element has moved by a
 * different amount from its neighbour after the same scroll. That needs two
 * shots at two known scroll positions, and a headless browser will not scroll
 * on its own - so this route reads the position out of the query string and
 * puts the page there itself.
 *
 *     /__preview/parallax          top of the page
 *     /__preview/parallax?y=1800   1800px down
 *
 * A screenshot is not actually the way to read it, though. Chrome's headless
 * `--screenshot` captures the document from its origin whatever the scroll
 * position is, so both of those produce the identical image - the scroll is
 * real, the capture just ignores it. So the probe below publishes the applied
 * offsets into `document.title`, which `--dump-dom | grep title` can read:
 *
 *     chrome --headless=new --virtual-time-budget=4000 --dump-dom  *       "http://localhost:3001/__preview/parallax?y=1800" | grep '<title>'
 *
 * What that output shows, and what nothing else on this site can prove: each
 * row's offset is its rate times the distance from its own centre to the
 * viewport's, capped at `max`. So a healthy run reads like this one, taken at
 * the top of the page:
 *
 *     rows=b0r0:none b0r0.045:7  b0r0.06:6   b0r0.12:7
 *          b1r0:none b1r0.045:-23 b1r0.06:-34 b1r0.12:-73
 *          b3r0:none b3r0.045:-84 b3r0.06:-114 b3r0.12:-200
 *
 * Block 0 straddles the viewport centre, so its offsets are small and
 * positive; the blocks below it are progressively further away, so the
 * offsets grow and turn negative; and the fastest row three blocks down has
 * hit the 200px cap exactly. A rate of 0 is reported as `none` because the
 * engine skips a write it does not need.
 *
 * `rafFired` and `reduced` are in the output because they are the two reasons
 * everything else could be a zero that means nothing: Chrome freezes
 * animation frames under `--virtual-time-budget` (rafFired=0 always, there),
 * and the engine turns itself off entirely under reduced motion. The offsets
 * above are only observable at all because the engine places a layer the
 * moment it registers rather than waiting for a frame.
 *
 * The page-anchored backdrop plates report `none` here, and that is correct
 * rather than broken: their offset is the scroll position times their rate,
 * and the scroll position in a headless dump is zero.
 *
 * It deliberately does NOT mount Lenis, the intro, the nav or Firestore. The
 * layers are driven by hooks/useParallax off the real scroll position, so they
 * behave here exactly as they do on a page; everything else would only add
 * ways for the shot to fail.
 *
 * Reached only in dev - App.js gates the route on import.meta.env.DEV.
 */

const ROWS = [
  { rate: 0,     label: 'rate 0.000 - the page itself, for reference' },
  { rate: 0.045, label: 'rate 0.045 - a section heading' },
  { rate: 0.06,  label: 'rate 0.060 - a page header' },
  { rate: 0.12,  label: 'rate 0.120 - the fastest that still reads as depth' },
];

const ParallaxPreview = () => {
  /*
   * Set after paint, and set twice: the browser restores its own scroll
   * position on a reload, and the parallax engine only measures once the
   * layers are registered. A frame later, both are settled.
   */
  useEffect(() => {
    const y = Number(new URLSearchParams(window.location.search).get('y') ?? 0);
    const put = () => {
      window.scrollTo(0, y);
      document.documentElement.scrollTop = y;
    };
    put();
    const id = requestAnimationFrame(put);
    return () => cancelAnimationFrame(id);
  }, []);

  /*
   * The measurement. Deliberately reads back the *computed* transform rather
   * than trusting what the engine believes it wrote, and waits long enough for
   * the ResizeObserver re-measure to have settled - the numbers are only worth
   * anything once the layout has stopped moving under them.
   */
  useEffect(() => {
    /* Whether animation frames run at all in this environment, which decides
       whether any of the numbers below can mean anything: the engine is
       rAF-driven, so if frames are frozen it has not been given a chance. */
    let rafFired = 0;
    requestAnimationFrame(() => { rafFired += 1; });

    const id = setTimeout(() => {
      /* Re-applied here, not only at mount: something above this route may
         have reset the scroll in between (App's ScrollToTop does exactly that
         on every navigation), and the point of the probe is to report the
         position the numbers were actually taken at. */
      const want = Number(new URLSearchParams(window.location.search).get('y') ?? 0);
      window.scrollTo(0, want);

      /* A beat later, so the engine has responded to the scroll above rather
         than being raced by the read. A timer rather than a frame: under
         Chrome's `--virtual-time-budget` timers are advanced and animation
         frames are not, so a rAF here simply never runs before the dump. */
      setTimeout(() => {
        const offset = (el) => {
          const t = getComputedStyle(el).transform;
          if (!t || t === 'none') return 'none';
          return Math.round(new DOMMatrixReadOnly(t).m42);
        };

        const rows = [...document.querySelectorAll('[data-probe-rate]')]
          .map(el => `${el.dataset.probeRate}:${offset(el)}`);
        const plates = [...document.querySelectorAll('[class*=plate]')].map(offset);

        document.title = [
          `scrollY=${Math.round(window.scrollY)}`,
          `docH=${document.documentElement.scrollHeight}`,
          `winH=${window.innerHeight}`,
          `reduced=${window.matchMedia('(prefers-reduced-motion: reduce)').matches}`,
          `rafFired=${rafFired}`,
          `rows=${rows.join(' ')}`,
          `plates=${plates.join(',')}`,
        ].join(' | ');
      }, 60);
    }, 1200);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <ParallaxBackdrop />

      {/* Four markers a screen apart, so at any scroll position one of them is
          in view with its neighbours' offsets to compare against. Each row is
          its own scale: the ruler is what makes a drift measurable rather than
          a matter of opinion. */}
      <div style={{ position: 'relative', zIndex: 2, padding: '20vh 2rem' }}>
        {[0, 1, 2, 3].map(block => (
          <div key={block} style={{ marginBottom: '60vh' }}>
            <p style={{ font: '700 0.7rem/1 system-ui', letterSpacing: '0.2em', opacity: 0.5 }}>
              BLOCK {block}
            </p>
            {ROWS.map(({ rate, label }) => (
              <Parallax
                key={rate}
                rate={rate}
                max={200}
                data-probe-rate={`b${block}r${rate}`}
                style={{
                  margin: '0.5rem 0',
                  padding: '0.6rem 0.9rem',
                  border: '1px solid rgba(var(--accent-1-rgb), 0.35)',
                  borderRadius: '0.5rem',
                  background: 'var(--background-1)',
                  font: '0.8rem/1.2 system-ui',
                }}
              >
                {label}
              </Parallax>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default ParallaxPreview;
