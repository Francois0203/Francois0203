// The entrance and exit of every reveal style. Timed, so each one plays in full however fast the page scrolls.
// Transform and opacity only, one function list everywhere, so they run on the compositor and blend part by part.

const T = (x = 0, y = 0, rx = 0, ry = 0, rz = 0, s = 1) =>
  `perspective(1200px) translate3d(${x}px, ${y}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
export const REST = T();

const SPRING = 'cubic-bezier(0.22, 0.9, 0.32, 1)';
const SWAY = 'ease-in-out';

// Keyframes as [offset, transform, opacity?]; opacity is full by the second frame of every style.
const STYLES = {
  // Text: rises, lifts a hair past its place, settles.
  rise: { ms: 760, frames: () => [[0, T(0, 46, 0, 0, 0, 0.97), 0], [0.62, T(0, -5), 1], [1, REST]], out: () => T(0, 36, 0, 0, 0, 0.97) },
  // Bubbles up from small, overshoots, wobbles back.
  pop: {
    ms: 820,
    frames: () => [[0, T(0, 34, 0, 0, 0, 0.35), 0], [0.46, T(0, -6, 0, 0, 0, 1.1), 1], [0.72, T(0, 2, 0, 0, 0, 0.96)], [1, REST]],
    out: () => T(0, 24, 0, 0, 0, 0.5),
  },
  // Tips over towards you like a tile, overshoots and rocks back.
  flip: {
    ms: 980,
    frames: () => [[0, T(0, 50, -88, 0, 0, 0.9), 0], [0.58, T(0, -4, 12, 0, 0, 1.01), 1], [0.82, T(0, 0, -4)], [1, REST]],
    out: () => T(0, 40, -75, 0, 0, 0.92),
  },
  // A page turning in on the hinge nearest the screen side.
  turn: {
    ms: 1050,
    frames: (d) => [[0, T(0, 20, 0, -100 * d, 0, 1), 0], [0.4, T(0, 0, 0, -40 * d), 1], [0.7, T(0, 0, 0, 9 * d)], [0.86, T(0, 0, 0, -3 * d)], [1, REST]],
    out: (d) => T(0, 20, 0, -85 * d, 0, 1),
  },
  // Rolls in from its own side and rocks to a stop.
  roll: {
    ms: 1000,
    frames: (d, w) => [[0, T(-w * d, 60, 0, 0, -38 * d, 0.72), 0], [0.38, T(-w * 0.25 * d, 8, 0, 0, -8 * d, 0.95), 1], [0.7, T(14 * d, -4, 0, 0, 4 * d, 1.02)], [0.86, T(-4 * d, 0, 0, 0, -1 * d)], [1, REST]],
    out: (d, w) => T(-w * 0.6 * d, 40, 0, 0, -25 * d, 0.8),
  },
  // Whirls in from tiny, overshoots the turn and the size.
  spin: {
    ms: 900,
    frames: () => [[0, T(0, 0, 0, 0, -280, 0.2), 0], [0.6, T(0, 0, 0, 0, 14, 1.16), 1], [0.8, T(0, 0, 0, 0, -5, 0.96)], [1, REST]],
    out: () => T(0, 0, 0, 0, -180, 0.3),
  },
};

const styleOf = (el, low) => (low || !STYLES[el.dataset.rise] ? STYLES.rise : STYLES[el.dataset.rise]);
const sideOf = (el) => (el.dataset.side === 'r' ? -1 : 1);
const reach = () => Math.min(240, window.innerWidth * 0.4);

// Each item comes from the side of the screen it sits on; full-width ones from the left.
export const markSide = (el) => {
  const r = el.getBoundingClientRect();
  el.dataset.side = r.left + r.width / 2 > window.innerWidth / 2 + 8 ? 'r' : 'l';
};

export const entrance = (el, low) => {
  const style = styleOf(el, low);
  const list = style.frames(sideOf(el), reach());
  const frames = list.map(([offset, transform, opacity], k) => ({
    offset, transform, ...(opacity === undefined ? {} : { opacity }), easing: k === 0 ? SPRING : SWAY,
  }));
  frames[frames.length - 1].opacity = 1;
  return { frames, ms: low ? 600 : style.ms };
};

export const exitPose = (el, low) => ({ transform: styleOf(el, low).out(sideOf(el), reach()), opacity: 0 });
