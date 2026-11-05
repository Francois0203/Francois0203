import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { tabStyle } from '../../content/navigation';
import Monogram from '../Monogram';
import ThemeSwitch from '../ThemeSwitch';
import MotionSwitch from '../MotionSwitch';
import CvButton from '../CvButton';
import usePortfolioData from '../../hooks/usePortfolioData';
import { useCopy } from '../../content/copy/store';
import styles from './Nav.module.css';

const Nav = ({ links = [] }) => {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [spot, setSpot] = useState(null);
  const { pathname } = useLocation();
  const words = useCopy('a11y');
  const site = useCopy('site');
  const { data } = usePortfolioData();
  const name = data?.personal?.name || site.name;
  const railRef = useRef(null);
  const pages = links.filter(l => l.to !== '/');

  useEffect(() => {
    // Re-render only when the bar crosses the line, not on every scroll event.
    let was = null;
    const onScroll = () => {
      const now = window.scrollY > 24;
      if (now !== was) { was = now; setStuck(now); }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The glass pill slides under whichever link is hovered, else the current page.
  const place = useCallback((el) => {
    const rail = railRef.current;
    if (!rail) return;
    if (!el) { rail.style.setProperty('--io', '0'); return; }
    rail.style.setProperty('--io', '1');
    rail.style.setProperty('--ix', `${el.offsetLeft}px`);
    rail.style.setProperty('--iw', `${el.offsetWidth}px`);
    rail.style.setProperty('--itone', getComputedStyle(el).getPropertyValue('--tab'));
  }, []);

  const current = () => railRef.current?.querySelector('[aria-current="page"]') ?? null;

  useLayoutEffect(() => { place(spot ?? current()); });

  useEffect(() => {
    const onResize = () => place(current());
    window.addEventListener('resize', onResize);
    document.fonts?.ready.then(onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [place, pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
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
      <header className={styles.wrap} data-stuck={stuck ? '' : undefined} data-print-hide>
        <div className={`glass ${styles.bar}`} data-tone="blue">
          <NavLink to="/" end className={styles.mark} onClick={close} aria-label={words.homeLink}>
            <Monogram size={30} />
            <span className={styles.markName}>{name}</span>
          </NavLink>

          <nav className={styles.routes} aria-label={words.siteNav} ref={railRef} onPointerLeave={() => setSpot(null)}>
            <span className={styles.indicator} aria-hidden="true" />
            {pages.map(({ label, to, tone }) => (
              <NavLink
                key={to}
                to={to}
                style={tabStyle(tone)}
                className={styles.route}
                onPointerEnter={(e) => setSpot(e.currentTarget)}
                onFocus={(e) => setSpot(e.currentTarget)}
                onBlur={() => setSpot(null)}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.controls}>
            <CvButton className={styles.cv} />
            <ThemeSwitch />
            <MotionSwitch />

            <button
              type="button"
              className={styles.menu}
              onClick={() => setOpen(v => !v)}
              aria-expanded={open}
              aria-label={open ? words.closeMenu : words.openMenu}
            >
              <span className={styles.bars} data-open={open ? '' : undefined} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className={styles.sheet} data-open={open ? '' : undefined} hidden={!open} data-print-hide>
        <nav aria-label={words.siteNav} className={styles.sheetNav}>
          {links.map(({ label, to, blurb, tone }, i) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={close}
              className={`glass ${styles.big}`}
              data-tone={tone}
              style={{ '--i': i, ...tabStyle(tone) }}
            >
              <span className={styles.bigDot} aria-hidden="true" />
              <span className={styles.bigText}>
                {label}
                <span className={styles.bigBlurb}>{blurb}</span>
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Nav;
