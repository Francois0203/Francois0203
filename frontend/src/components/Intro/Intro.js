import { useCallback, useEffect, useState } from 'react';
import Shape from '../Shape';
import styles from './Intro.module.css';

let playedThisLoad = false;

const GLYPHS = [
  ['###', '#..', '##.', '#..', '#..'],
  ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
];
const TONES = ['blue', 'yellow', 'green', 'orange', 'pink'];

const BLOCKS = (() => {
  const out = [];
  let col0 = 0;
  GLYPHS.forEach((rows) => {
    rows.forEach((row, r) => {
      [...row].forEach((ch, c) => {
        if (ch === '#') out.push({ c: col0 + c, r });
      });
    });
    col0 += rows[0].length + 1;
  });
  return out.map((b, i) => {
    const dx = b.c - 4;
    const dy = b.r - 2;
    const angle = (dx || dy ? Math.atan2(dy, dx) : i) + (((i * 37) % 21) - 10) / 40;
    const reach = 80 + ((i * 29) % 30);
    return {
      ...b,
      tone: TONES[(b.c * 3 + b.r) % TONES.length],
      delay: b.c * 70 + (4 - b.r) * 45 + (i % 3) * 20,
      fx: Math.cos(angle) * reach,
      fy: Math.sin(angle) * reach,
      out: (Math.abs(dx) + Math.abs(dy)) * 25,
      spin: ((i * 71) % 300) - 150,
    };
  });
})();

const COLS = 9;
const ROWS = 5;
const LIFT_AT = 2700;
const LIFT_MS = 850;

const shouldPlay = () => {
  if (typeof window === 'undefined') return false;
  if (playedThisLoad) return false;
  if (document.documentElement.dataset.noAnimations === 'true') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
};

const Intro = ({ name = 'Francois Meiring' }) => {
  const [play] = useState(() => {
    const yes = shouldPlay();
    if (yes) document.documentElement.dataset.intro = 'playing';
    return yes;
  });
  const [lifting, setLifting] = useState(false);
  const [gone, setGone] = useState(false);

  const lift = useCallback(() => {
    setLifting((already) => {
      if (already) return already;
      delete document.documentElement.dataset.intro;
      window.dispatchEvent(new Event('intro:done'));
      setTimeout(() => setGone(true), LIFT_MS);
      return true;
    });
  }, []);

  useEffect(() => {
    if (!play) return undefined;
    playedThisLoad = true;
    document.documentElement.dataset.intro = 'playing';

    const timer = setTimeout(lift, LIFT_AT);
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    events.forEach(e => window.addEventListener(e, lift, { passive: true }));

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, lift));
      document.body.style.overflow = prevOverflow;
      if (document.documentElement.dataset.intro === 'playing') {
        delete document.documentElement.dataset.intro;
        window.dispatchEvent(new Event('intro:done'));
      }
    };
  }, [play, lift]);

  useEffect(() => {
    if (lifting) document.body.style.overflow = '';
  }, [lifting]);

  if (!play || gone) return null;

  return (
    <div
      className={[styles.intro, lifting && styles.lifting].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <div className={styles.board} style={{ '--cols': COLS, '--rows': ROWS }}>
        {BLOCKS.map((b, i) => (
          <span
            key={i}
            className={styles.block}
            style={{
              '--c': b.c,
              '--r': b.r,
              '--d': `${b.delay}ms`,
              '--fx': `${b.fx}vmax`,
              '--fy': `${b.fy}vmax`,
              '--out': `${b.out}ms`,
              '--spin': `${b.spin}deg`,
            }}
          >
            <Shape kind="squircle" colour={b.tone} className={styles.shape} />
          </span>
        ))}
      </div>

      <p className={styles.name}>
        {name.split(' ').map((w, i) => (
          <span key={w} className={styles.word} style={{ '--i': i }}>{w}</span>
        ))}
      </p>

      <p className={styles.skip}>Press any key to skip</p>
    </div>
  );
};

export default Intro;
