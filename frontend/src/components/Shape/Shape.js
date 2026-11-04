import { useId } from 'react';
import styles from './Shape.module.css';

const HEX = [[50, 6], [90, 28], [90, 72], [50, 94], [10, 72], [10, 28]];
const TRI = [[50, 12], [92, 86], [8, 86]];
const STAR = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
  const r = i % 2 ? 31 : 46;
  return [+(50 + Math.cos(a) * r).toFixed(2), +(50 + Math.sin(a) * r).toFixed(2)];
});

const poly = (pts) => pts.map(p => p.join(',')).join(' ');

const SHAPES = {
  circle: { m: '<circle cx="50" cy="50" r="46"/>', sw: 0 },
  squircle: { m: '<rect x="4" y="4" width="92" height="92" rx="26"/>', sw: 0 },
  hexagon: { m: `<polygon points="${poly(HEX)}"/>`, sw: 9 },
  star: { m: `<polygon points="${poly(STAR)}"/>`, sw: 7 },
  ring: { m: '<path fill-rule="evenodd" d="M50 4a46 46 0 1 0 0.01 0zM50 32a18 18 0 1 1-0.01 0z"/>', sw: 0 },
  pill: { m: '<rect x="4" y="26" width="92" height="48" rx="24"/>', sw: 0 },
  triangle: { m: `<polygon points="${poly(TRI)}"/>`, sw: 11 },
  arch: { m: '<path d="M4 96V50a46 46 0 0 1 92 0v46z"/>', sw: 0 },
};


// A glass solid: tinted body, light from the top left, a bright rim.
const Shape = ({ kind = 'circle', colour = 'blue', sticker, className = '', style, ...rest }) => {
  const shape = SHAPES[kind] ?? SHAPES.circle;
  const id = useId().replace(/:/g, '');
  const tone = `var(--c-${colour})`;
  const paint = (fill, stroke, extra = 0, props = {}) => (
    <g
      style={{ fill, stroke }}
      strokeWidth={shape.sw + extra}
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: shape.m }}
      {...props}
    />
  );
  return (
    <svg
      viewBox="0 0 100 100"
      className={[styles.shape, className].filter(Boolean).join(' ')}
      style={{ '--tone': tone, ...style }}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`f${id}`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" className={styles.lit} />
          <stop offset="1" className={styles.deep} />
        </radialGradient>
      </defs>
      {paint(`url(#f${id})`, `url(#f${id})`)}
      {paint(`url(#b${id})`, 'none', 0, { className: styles.gloss })}
      {paint('none', 'rgba(255,255,255,0.6)', 1.5, { className: styles.rim })}
    </svg>
  );
};

export default Shape;
