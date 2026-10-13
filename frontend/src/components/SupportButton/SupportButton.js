import { useState } from 'react';
import Shape from '../Shape';
import styles from './SupportButton.module.css';

const BURST = [
  { kind: 'star', colour: 'yellow', x: -70, y: -58, r: -40 },
  { kind: 'circle', colour: 'green', x: -18, y: -74, r: 0 },
  { kind: 'triangle', colour: 'pink', x: 42, y: -66, r: 35 },
  { kind: 'squircle', colour: 'blue', x: 86, y: -24, r: 50 },
  { kind: 'hexagon', colour: 'orange', x: -92, y: -8, r: -25 },
  { kind: 'ring', colour: 'yellow', x: 70, y: 30, r: 20 },
];

// A sticker button. Its shadow changes colour, the heart beats, and a click throws confetti.
const SupportButton = ({ href, children }) => {
  const [pops, setPops] = useState(0);

  return (
    <a
      className={styles.support}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setPops(n => n + 1)}
    >
      <span className={styles.heart} aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 20.3 4.6 13a4.7 4.7 0 0 1 6.6-6.7l.8.8.8-.8a4.7 4.7 0 0 1 6.6 6.7Z" />
        </svg>
      </span>
      <span className={styles.label}>{children}</span>
      <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>

      {pops > 0 && (
        <span className={styles.burst} key={pops} aria-hidden="true">
          {BURST.map((b, i) => (
            <span key={i} className={styles.bit} style={{ '--x': `${b.x}px`, '--y': `${b.y}px`, '--r': `${b.r}deg`, '--i': i }}>
              <Shape kind={b.kind} colour={b.colour} />
            </span>
          ))}
        </span>
      )}
    </a>
  );
};

export default SupportButton;
