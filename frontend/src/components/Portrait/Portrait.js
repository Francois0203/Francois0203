import { useEffect, useRef, useState } from 'react';
import Shape from '../Shape';
import styles from './Portrait.module.css';

const still = () =>
  typeof window === 'undefined'
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.dataset.noAnimations === 'true';

const BEHIND = [
  { kind: 'circle', colour: 'blue', cls: 'b1', d: 0.6 },
  { kind: 'star', colour: 'yellow', cls: 'b2', d: 1.4 },
  { kind: 'hexagon', colour: 'pink', cls: 'b3', d: 1 },
];

const DOTS = ['green', 'blue', 'orange', 'pink'];

const Portrait = ({ src, name = '', facts = [] }) => {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('');

  useEffect(() => {
    const el = ref.current;
    if (!el || still() || window.matchMedia('(pointer: coarse)').matches) return undefined;

    let raf = 0;
    let tx = 0, ty = 0, x = 0, y = 0;

    const loop = () => {
      x += (tx - x) * 0.1;
      y += (ty - y) * 0.1;
      el.style.setProperty('--px', x.toFixed(4));
      el.style.setProperty('--py', y.toFixed(4));
      raf = (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)));
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onLeave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={styles.wrap}>
      <div className={styles.stage}>
      {BEHIND.map(b => (
        <span key={b.cls} className={`${styles.behind} ${styles[b.cls]}`} style={{ '--d': b.d }}>
          <Shape kind={b.kind} colour={b.colour} className={styles.shape} />
        </span>
      ))}

      <div className={styles.card}>
        {src && !failed
          ? <img className={styles.photo} src={src} alt={name} width="640" height="640" fetchPriority="high" onError={() => setFailed(true)} />
          : <span className={styles.initials} aria-hidden="true">{initials}</span>}
      </div>
      </div>

      <ul className={styles.facts}>
        {facts.map((f, i) => (
          <li key={f.text} className={styles.fact} data-slot={i} style={{ '--d': f.depth ?? 1, '--i': i, '--dot': `var(--c-${DOTS[i % DOTS.length]})` }}>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.factText}>
              <span className={styles.factKey}>{f.key}</span>
              {f.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Portrait;
