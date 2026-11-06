import { useEffect, useRef } from 'react';
import styles from './Rail.module.css';

// Scroll timelines let the line and its tip follow the scroll on the compositor, with no script per frame.
// With motion off the global reset stops all animations, so the measured fallback keeps the line drawn.
export const railTimelines = () => typeof CSS !== 'undefined'
  && CSS.supports('animation-timeline: --a')
  && CSS.supports('timeline-scope: --a')
  && document.documentElement.dataset.noAnimations !== 'true'
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A timeline line that fills to the middle of the screen. Stops are the parent's [data-stop] nodes.
// onProgress gets the share filled (null when CSS drives it) and the index of the last stop passed.
const Rail = ({ as: Tag = 'div', onProgress, className = '' }) => {
  const ref = useRef(null);
  const report = useRef(onProgress);
  report.current = onProgress;

  useEffect(() => {
    const rail = ref.current;
    const host = rail?.parentElement;
    if (!rail || !host) return undefined;
    const css = railTimelines();
    rail.toggleAttribute('data-css', css);

    let stops = [];
    let marks = [];
    let start = 0;
    let length = 0;
    let lit = -2;

    const light = (last) => {
      if (last === lit) return;
      lit = last;
      const tone = last >= 0 && getComputedStyle(stops[last]).getPropertyValue('--tone').trim();
      if (tone) rail.style.setProperty('--spark', tone);
      if (css) report.current?.(null, last);
    };

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

    const ro = new ResizeObserver(() => { layout(); if (!css) onScroll(); });
    let raf = 0;
    let io = null;

    // Stops only change state when they cross the middle, so an observer is enough.
    // The root reaches far above the screen so a fast flick past the middle still registers.
    const watchStops = () => {
      io?.disconnect();
      io = new IntersectionObserver((entries) => {
        entries.forEach(e => e.target.toggleAttribute('data-passed', e.isIntersecting));
        let last = -1;
        stops.forEach((n, i) => { if (n.hasAttribute('data-passed')) last = i; });
        light(last);
      }, { rootMargin: '100000px 0px -50% 0px', threshold: 0 });
      stops.forEach(n => io.observe(n));
    };

    // Fallback without scroll timelines: measured once a frame while scrolling.
    const paint = () => {
      raf = 0;
      if (!stops.length) return;
      const mid = window.innerHeight / 2;
      const top = host.getBoundingClientRect().top + start;
      const fill = Math.max(0, Math.min(length, mid - top));
      rail.style.setProperty('--fill', `${fill.toFixed(1)}px`);
      rail.toggleAttribute('data-live', fill > 0);
      let last = -1;
      stops.forEach((n, i) => {
        const passed = marks[i] - start <= fill + 1;
        n.toggleAttribute('data-passed', passed);
        if (passed) last = i;
      });
      light(last);
      report.current?.(fill / length, last);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };

    layout();
    ro.observe(host);
    if (css) {
      watchStops();
      const mo = new MutationObserver(() => { layout(); watchStops(); });
      mo.observe(host, { childList: true });
      return () => { ro.disconnect(); io?.disconnect(); mo.disconnect(); };
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <Tag ref={ref} className={[styles.rail, className].filter(Boolean).join(' ')} aria-hidden="true">
      <span className={styles.window}><span className={styles.fill} /></span>
      <span className={styles.sparkRun}><span className={styles.spark} /></span>
    </Tag>
  );
};

export default Rail;
