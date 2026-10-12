const HEX = [[50, 6], [90, 28], [90, 72], [50, 94], [10, 72], [10, 28]];
const TRI = [[50, 12], [92, 86], [8, 86]];
const STAR = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
  const r = i % 2 ? 31 : 46;
  return [+(50 + Math.cos(a) * r).toFixed(2), +(50 + Math.sin(a) * r).toFixed(2)];
});

const poly = (pts) => pts.map(p => p.join(',')).join(' ');

export const SHAPES = {
  circle: { m: '<circle cx="50" cy="50" r="46"/>', sw: 0 },
  squircle: { m: '<rect x="4" y="4" width="92" height="92" rx="26"/>', sw: 0 },
  hexagon: { m: `<polygon points="${poly(HEX)}"/>`, sw: 9 },
  star: { m: `<polygon points="${poly(STAR)}"/>`, sw: 7 },
  ring: { m: '<path fill-rule="evenodd" d="M50 4a46 46 0 1 0 0.01 0zM50 32a18 18 0 1 1-0.01 0z"/>', sw: 0 },
  pill: { m: '<rect x="4" y="26" width="92" height="48" rx="24"/>', sw: 0 },
  triangle: { m: `<polygon points="${poly(TRI)}"/>`, sw: 11 },
  arch: { m: '<path d="M4 96V50a46 46 0 0 1 92 0v46z"/>', sw: 0 },
};

export const KINDS = Object.keys(SHAPES);

const layer = (shape, paint, extra, props = {}) => (
  <g
    style={{ fill: paint, stroke: paint }}
    strokeWidth={shape.sw + extra}
    strokeLinejoin="round"
    dangerouslySetInnerHTML={{ __html: shape.m }}
    {...props}
  />
);

// A flat shape with an ink outline and a hard offset shadow, like a sticker.
const Shape = ({ kind = 'circle', colour = 'blue', sticker = true, className = '', style, ...rest }) => {
  const shape = SHAPES[kind] ?? SHAPES.circle;
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ overflow: 'visible', ...style }}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {sticker && layer(shape, 'var(--ink)', 5, { transform: 'translate(4 5)' })}
      {sticker && layer(shape, 'var(--ink)', 5)}
      {layer(shape, `var(--c-${colour})`, 0)}
    </svg>
  );
};

export default Shape;
