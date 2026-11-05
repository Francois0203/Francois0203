import { useEffect, useRef } from 'react';
import styles from './Rail.module.css';

// A timeline line that fills to the middle of the screen. Stops are the parent's [data-stop] nodes.
// onProgress gets the share filled and the index of the last stop passed.
const Rail = ({ as: Tag = 'div', onProgress, className = '' }) => {
  const ref = useRef(null);
  const report = useRef(onProgress);
  report.current = onProgress;

  useEffect(() => {
    const rail = ref.current;
    const host = rail?.parentElement;
    if (!rail || !host) return undefined;

    let stops = [];
    let marks = [];
    let start = 0;
    let length = 0;
    let raf = 0;
    let lit = null;

    const layout = () => {
      stops = [...host.querySelectorAll('[data-stop]')];
      if (!stops.length) return;
      // Offsets, not rects, so reveal transforms do not skew the line.
      const centre = (n) => {
        let y = n.offsetHeight / 2;
        for (let el = n; el && el !== host; el = el.offsetParent) y += el.offsetTop;
        return y;
      };
      marks = stops.map(centre);
      start = marks[0];
      length = Math.max(1, marks[marks.length - 1] - start);
      rail.style.top = `${start}px`;
      rail.style.height = `${length}px`;
    };

    const paint = () => {
      raf = 0;
      if (!stops.length) return;
      const mid = window.innerHeight / 2;
      const top = host.getBoundingClientRect().top + start;
      const fill = Math.max(0, Math.min(length, mid - top));
      rail.style.setProperty('--fill', `${fill.toFixed(1)}px`);
      rail.toggleAttribute('data-live', fill > 0);
      let last = null;
      stops.forEach((n, i) => {
        const passed = marks[i] - start <= fill + 1;
        n.toggleAttribute('data-passed', passed);
        if (passed) last = n;
      });
      if (last !== lit) {
        lit = last;
        const tone = last && getComputedStyle(last).getPropertyValue('--tone').trim();
        if (tone) rail.style.setProperty('--spark', tone);
      }
      report.current?.(fill / length, stops.indexOf(last));
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const relayout = () => { layout(); onScroll(); };

    relayout();
    const ro = new ResizeObserver(relayout);
    ro.observe(host);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', relayout);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', relayout);
    };
  }, []);

  return (
    <Tag ref={ref} className={[styles.rail, className].filter(Boolean).join(' ')} aria-hidden="true">
      <span className={styles.window}><span className={styles.fill} /></span>
      <span className={styles.spark} />
    </Tag>
  );
};

export default Rail;
