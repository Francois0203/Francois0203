import { useCallback, useEffect, useRef, useState } from 'react';
import { useCopy } from '../../content/copy/store';
import styles from './Intro.module.css';

// Once per visit, like a splash screen: a reload or a new page in the same tab goes straight to the site.
const SEEN = 'fm-intro-seen';
let playedThisLoad = false;

const seen = () => { try { return sessionStorage.getItem(SEEN) === '1'; } catch { return false; } };
const markSeen = () => { try { sessionStorage.setItem(SEEN, '1'); } catch { /* storage off: it plays once per load */ } };

const BLOOMS = [
  { tone: 'blue', x: '22%', y: '26%', d: '0ms' },
  { tone: 'pink', x: '78%', y: '24%', d: '150ms' },
  { tone: 'green', x: '84%', y: '78%', d: '300ms' },
  { tone: 'orange', x: '16%', y: '80%', d: '450ms' },
];

const LIFT_AT = 3100;
const LIFT_MS = 1000;

const shouldPlay = () => {
  if (typeof window === 'undefined') return false;
  if (playedThisLoad || seen()) return false;
  if (document.documentElement.dataset.noAnimations === 'true') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
};

// The opening: a glass lens forms, the name writes in, then the lens opens onto the site.
const Intro = () => {
  const { name, role, introSkip } = useCopy('site');
  const [play] = useState(() => {
    const yes = shouldPlay();
    if (yes) document.documentElement.dataset.intro = 'playing';
    return yes;
  });
  const [lifting, setLifting] = useState(false);
  const [gone, setGone] = useState(false);
  const rootRef = useRef(null);
  const lensRef = useRef(null);

  const lift = useCallback(() => {
    setLifting((already) => {
      if (already) return already;
      const r = lensRef.current?.getBoundingClientRect();
      if (r && rootRef.current) {
        rootRef.current.style.setProperty('--cx', `${r.left + r.width / 2}px`);
        rootRef.current.style.setProperty('--cy', `${r.top + r.height / 2}px`);
      }
      markSeen();
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

  let n = 0;

  return (
    <div ref={rootRef} className={[styles.intro, lifting && styles.lifting].filter(Boolean).join(' ')} aria-hidden="true">
      {BLOOMS.map(b => (
        <span key={b.tone} className={styles.bloom} style={{ left: b.x, top: b.y, '--c': `var(--c-${b.tone})`, '--d': b.d }} />
      ))}

      <div className={styles.stage}>
        <div ref={lensRef} className={styles.lens}>
          <span className={styles.rim} />
          <span className={styles.glass} />
          <img className={styles.logo} src="/logo-mark.png" alt="" width="412" height="343" />
          <span className={styles.glint} />
        </div>

        <p className={styles.name}>
          {name.split(' ').map((word, w) => (
            <span key={w} className={styles.word}>
              {[...word].map((ch) => {
                n += 1;
                return <span key={n} className={styles.char} style={{ '--n': n }}>{ch}</span>;
              })}
            </span>
          ))}
        </p>

        <p className={styles.role}>{role}</p>
      </div>

      <p className={styles.skip}>{introSkip}</p>
    </div>
  );
};

export default Intro;
