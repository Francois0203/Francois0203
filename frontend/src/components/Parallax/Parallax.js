import useParallax from '../../hooks/useParallax';

/**
 * A wrapper that drifts its children as they pass the viewport.
 *
 * This is the in-flow half of the effect, and it exists because the backdrop
 * alone is not parallax - it is a moving background. Depth needs the content
 * to be layered too: a page header that lags slightly behind the body text
 * beneath it puts the two on different planes, and the backdrop then reads as
 * a third one rather than as wallpaper.
 *
 * Kept deliberately dumb - one div, one ref, no styles of its own - because
 * the interesting decisions are all at the call site, and a component that
 * also had opinions about layout would have to be fought every time.
 *
 * ── The rule for using it ───────────────────────────────────────────────────
 * Wrap, do not decorate. hooks/useParallax owns the inline `transform` of the
 * element it is given, so it must never be handed an element that something
 * else transforms - which on this site means anything carrying `[data-reveal]`
 * (styles/Reveal.css transitions those on transform) and anything containing a
 * `position: sticky` or `fixed` descendant, since a transform makes the
 * wrapper their containing block and the pinning would silently break.
 *
 * Two things it must also stay off:
 *   - Any ancestor of a live `<iframe>` - see Home's Site Showcase band. A
 *     transformed ancestor forces a cross-origin frame to re-composite every
 *     frame, and the whole band stutters.
 *   - Anything with text at body size that the reader is reading *now*. A
 *     paragraph that moves while being read is not depth, it is an annoyance.
 *     Headers, figures, portraits and rules; not prose.
 *
 * Anything else passed through lands on the element, `className` and `style`
 * included - with the one exception that a `transform` inside that `style` is
 * not yours. The engine writes the element's inline transform on every frame
 * of a scroll and will overwrite it; compose on a child instead.
 *
 * @param {number} [rate=0.06] pixels of drift per pixel of scroll. Anything
 *        past about 0.12 stops reading as depth and starts reading as lag.
 * @param {number} [max=70] the travel cap, in pixels.
 */
const Parallax = ({
  rate = 0.06,
  max = 70,
  as: Tag = 'div',
  className,
  children,
  ...rest
}) => {
  const ref = useParallax({ rate, max, mode: 'view' });

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
};

export default Parallax;
