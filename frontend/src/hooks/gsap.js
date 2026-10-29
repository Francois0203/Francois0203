import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The site's own toggle mirrors prefers-reduced-motion onto this attribute.
export const motionOff = () => document.documentElement.hasAttribute('data-no-animations');

// Runs fn once the intro overlay has gone, or straight away if it is not playing.
export const afterIntro = (fn) => {
  if (document.documentElement.dataset.intro !== 'playing') { fn(); return () => {}; }
  window.addEventListener('intro:done', fn, { once: true });
  return () => window.removeEventListener('intro:done', fn);
};

// Pinned sections sit below content that loads late, so re-measure when the page grows.
let watching = false;
export const watchLayout = () => {
  if (watching || typeof ResizeObserver === 'undefined') return;
  watching = true;
  let t = 0;
  let last = document.body.scrollHeight;
  new ResizeObserver(() => {
    const h = document.body.scrollHeight;
    if (Math.abs(h - last) < 2) return;
    last = h;
    clearTimeout(t);
    t = setTimeout(() => ScrollTrigger.refresh(), 150);
  }).observe(document.body);
};

export { gsap, ScrollTrigger, useGSAP };
