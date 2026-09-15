import { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAnimations } from '../../hooks';
import styles from './Nav.module.css';

/*
 * A hairline across the top. Transparent over the field until the page
 * moves under it, then it takes a glass backing, driven by one observer on
 * a sentinel rather than a scroll listener. On a narrow screen the routes
 * move into a full screen overlay at display size.
 */

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.6v2.4M12 19v2.4M21.4 12H19M5 12H2.6M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7M18.6 18.6l-1.7-1.7M7.1 7.1L5.4 5.4" strokeLinecap="round" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z" strokeLinejoin="round" />
  </svg>
);

const MotionIcon = ({ off }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    {off
      ? <><path d="M9 5v14M15 5v14" strokeLinecap="round" /></>
      : <><path d="M3 12h4l2.5-6 5 12L17 12h4" strokeLinecap="round" strokeLinejoin="round" /></>}
  </svg>
);

const Nav = ({ links = [], theme, toggleTheme }) => {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const { reduceAnimations, toggleAnimations } = useAnimations();
  const isDark = theme !== 'light';

  // While the sentinel is visible the reader is at the top.
  const sentinel = useCallback((node) => {
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(node);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    // The page behind an overlay must not scroll.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <div ref={sentinel} className={styles.sentinel} aria-hidden="true" />

      <header className={`${styles.bar} ${stuck ? styles.stuck : ''}`}>
        <NavLink to="/" className={styles.mark} onClick={close} aria-label="Home">
          <span>FM</span>
        </NavLink>

        <nav className={styles.routes} aria-label="Site">
          {links.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `${styles.route} ${isActive ? styles.active : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.icon}
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <MoonIcon /> : <SunIcon />}
          </button>

          <button
            type="button"
            className={`${styles.icon} ${reduceAnimations ? styles.iconOn : ''}`}
            onClick={toggleAnimations}
            aria-pressed={reduceAnimations}
            aria-label={reduceAnimations ? 'Enable motion' : 'Reduce motion'}
          >
            <MotionIcon off={reduceAnimations} />
          </button>

          <button
            type="button"
            className={styles.menu}
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className={open ? styles.barsOpen : styles.bars} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`} hidden={!open}>
        <nav aria-label="Site, expanded">
          {links.map(({ label, to }, i) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={close}
              className={({ isActive }) => `${styles.big} ${isActive ? styles.bigActive : ''}`}
              style={{ '--i': i }}
            >
              <span className={styles.bigIndex}>{String(i + 1).padStart(2, '0')}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Nav;
