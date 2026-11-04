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

export { gsap, ScrollTrigger, useGSAP };
