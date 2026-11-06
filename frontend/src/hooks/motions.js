// The jelly pop every reveal uses: squishes in from small and wobbles to a stop, squishes once and shrinks away.
// data-rise="side" (timelines) flies the same jelly in from the left or right, alternating down the list.
// Transform and opacity only, one function list everywhere, so it runs on the compositor and blends cleanly.

const T = (x = 0, y = 0, sx = 1, sy = sx) => `translate3d(${x}px, ${y}px, 0px) scale(${sx}, ${sy})`;
export const REST = T();

const POP = 'cubic-bezier(0.3, 0.8, 0.4, 1)';
const WOBBLE = 'ease-in-out';
const DROP = 'cubic-bezier(0.55, 0, 0.8, 0.35)';

// Big items wobble less, so a tall card or a page of text never looks like it is melting.
const amountOf = (el) => (el.offsetHeight > window.innerHeight * 0.6 ? 0.4 : el.offsetHeight > 260 ? 0.7 : 1);

// Pulls a scale towards 1 by the item's amount.
const ease = (v, a) => 1 + (v - 1) * a;

// Timeline items take turns: the first comes from the left, the next from the right, and so on.
const sideOf = (el) => {
  const kin = [...(el.parentElement?.children ?? [])].filter(n => n.dataset?.rise === 'side');
  return kin.indexOf(el) % 2 ? -1 : 1;
};
const reach = () => Math.min(340, window.innerWidth * 0.42);

const popIn = (el, from) => {
  const a = amountOf(el);
  const j = (sx, sy) => T(0, 0, ease(sx, a), ease(sy, a));
  return [
    from ? { ...from, offset: 0, easing: POP } : { offset: 0, transform: T(0, 30 * a, ease(0.3, a)), opacity: 0, easing: POP },
    { offset: 0.3, transform: T(0, -6 * a, ease(1.14, a), ease(0.86, a)), opacity: 1, easing: WOBBLE },
    { offset: 0.45, transform: j(0.92, 1.08), easing: WOBBLE },
    { offset: 0.6, transform: j(1.05, 0.95), easing: WOBBLE },
    { offset: 0.75, transform: j(0.98, 1.02), easing: WOBBLE },
    { offset: 0.88, transform: j(1.01, 0.99), easing: WOBBLE },
    { offset: 1, transform: REST, opacity: 1 },
  ];
};

// Flies in stretched along its path, squashes on arrival, rebounds and settles.
const sideIn = (el, from) => {
  const a = amountOf(el);
  const d = sideOf(el);
  const s = (sx, sy) => [ease(sx, a), ease(sy, a)];
  return [
    from ? { ...from, offset: 0, easing: POP } : { offset: 0, transform: T(-reach() * d, 10, ...s(1.22, 0.8)), opacity: 0, easing: POP },
    { offset: 0.34, transform: T(14 * d, 0, ...s(0.86, 1.1)), opacity: 1, easing: WOBBLE },
    { offset: 0.52, transform: T(-6 * d, 0, ...s(1.07, 0.95)), easing: WOBBLE },
    { offset: 0.68, transform: T(2 * d, 0, ...s(0.97, 1.03)), easing: WOBBLE },
    { offset: 0.84, transform: T(0, 0, ...s(1.01, 0.99)), easing: WOBBLE },
    { offset: 1, transform: REST, opacity: 1 },
  ];
};

export const entrance = (el, from) => ({
  frames: el.dataset.rise === 'side' ? sideIn(el, from) : popIn(el, from),
  ms: el.dataset.rise === 'side' ? 1000 : 950,
});

export const exit = (el, from) => {
  const a = amountOf(el);
  const start = from ?? { opacity: 1, transform: REST };
  if (el.dataset.rise === 'side') {
    const d = sideOf(el);
    // Winds up the other way, then zips back off the side it came from.
    return {
      frames: [
        { ...start, offset: 0, easing: WOBBLE },
        { offset: 0.3, transform: T(10 * d, 0, ease(0.9, a), ease(1.1, a)), opacity: start.opacity, easing: DROP },
        { offset: 1, transform: T(-reach() * 0.8 * d, 6, ease(1.2, a), ease(0.82, a)), opacity: 0 },
      ],
      ms: 560,
    };
  }
  return {
    frames: [
      { ...start, offset: 0, easing: WOBBLE },
      { offset: 0.28, transform: T(0, 0, ease(1.1, a), ease(0.9, a)), opacity: start.opacity, easing: WOBBLE },
      { offset: 0.5, transform: T(0, -4 * a, ease(0.92, a), ease(1.08, a)), opacity: start.opacity, easing: DROP },
      { offset: 1, transform: T(0, 20 * a, ease(0.2, a)), opacity: 0 },
    ],
    ms: 560,
  };
};
