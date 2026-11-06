import { useEffect, useRef, useState } from 'react';
import useTilt from '../../../hooks/useTilt';
import styles from './Tally.module.css';

const still = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.dataset.noAnimations === 'true';

// Counts up to the real number once it is on screen.
const useCount = (target, on) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return undefined;
    if (still()) { setN(target); return undefined; }
    let raf = 0;
    const began = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - began) / 1100);
      setN(Math.round(target * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, on]);
  return n;
};

const Stat = ({ value, label, tone, on, i }) => {
  const ref = useRef(null);
  useTilt(ref, { max: 8, lift: 14 });
  const n = useCount(value, on);
  return (
    <li className={styles.cell} data-rise="flip" style={{ '--i': i }}>
      <div ref={ref} className={`glass ${styles.stat}`} data-tone={tone}>
        <span className={styles.value}>{n}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </li>
  );
};

// A row of real counts taken from the data, never typed in by hand.
const Tally = ({ items = [], shown }) => {
  const list = items.filter(s => s.value > 0);
  if (!list.length) return null;
  return (
    <ul className={styles.tally}>
      {list.map((s, i) => <Stat key={s.label} {...s} on={shown} i={i + 5} />)}
    </ul>
  );
};

export default Tally;
