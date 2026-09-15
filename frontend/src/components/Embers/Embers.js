import { useMemo } from 'react';
import styles from './Embers.module.css';

/*
 * Drifting embers. `rise` loops as a slow updraft, `burst` runs once.
 * Values are derived from the index rather than drawn at random, so a
 * re-render cannot reshuffle the field. Decorative, so it is aria-hidden
 * and absent under reduced motion.
 */

// Same index, same ember, every render.
const noise = (i, salt) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const Embers = ({ count = 14, mode = 'rise', className = '' }) => {
  const embers = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: `${noise(i, 1) * 100}%`,
    size: `${3 + noise(i, 2) * 5}px`,
    delay: `${noise(i, 3) * (mode === 'rise' ? 6 : 0.4)}s`,
    duration: `${(mode === 'rise' ? 6 : 1.1) + noise(i, 4) * (mode === 'rise' ? 6 : 0.8)}s`,
    drift: `${(noise(i, 5) - 0.5) * (mode === 'rise' ? 90 : 220)}px`,
    // A real distance: a percentage here is a share of a five pixel span.
    lift: `${mode === 'rise' ? 320 + noise(i, 6) * 460 : 60 + noise(i, 6) * 120}px`,
  })), [count, mode]);

  return (
    <div className={`${styles.field} ${styles[mode]} ${className}`} aria-hidden="true">
      {embers.map((e, i) => (
        <span
          key={i}
          className={styles.ember}
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            animationDelay: e.delay,
            animationDuration: e.duration,
            '--drift': e.drift,
            '--lift': e.lift,
          }}
        />
      ))}
    </div>
  );
};

export default Embers;
