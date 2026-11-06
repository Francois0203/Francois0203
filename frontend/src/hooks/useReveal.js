import { useEffect, useState } from 'react';

const SELECTOR = '[data-rise], [data-reveal]';
const STEP = 80;
const MAX_STEP = 6;
// Scrolling down, items flip in as soon as they peek over the bottom edge.
const SHOW_EDGE = '0px 0px -3% 0px';
// Scrolling up, they fold away once their top drops below three quarters of the screen, so the reverse is seen.
// The root reaches far above the screen so a jump past the line still counts as a crossing.
const HIDE_EDGE = '100000px 0px -25% 0px';
// Scroll this far the other way before it counts as turning round, so trackpad wobble and iOS bounce do nothing.
const TURN = 24;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
// Opacity and transform only, so every flip runs on the compositor. The hinge is set once in global.css.
const SHOWN = { opacity: 1, transform: 'perspective(1600px) translate3d(0, 0, 0) rotateX(0deg) scale(1)' };

const whenIntroDone = (fn) => {
  if (document.documentElement.dataset.intro !== 'playing') { fn(); return () => {}; }
  window.addEventListener('intro:done', fn, { once: true });
  return () => window.removeEventListener('intro:done', fn);
};

const calm = () => document.documentElement.dataset.noAnimations === 'true'
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Part of the first screen of the page: it is what the visitor lands on, so it never folds away.
const firstScreen = (entry) => entry.boundingClientRect.top + window.scrollY < window.innerHeight;

const below = (entry, edge) => entry.boundingClientRect.top >= (entry.rootBounds?.bottom ?? window.innerHeight * edge);

// Cards fold back from their top edge, hinged like a flap; text rises with a slight lean.
const hiddenOf = (el) => {
  if (el.dataset.rise === 'flip') {
    return { opacity: 0, transform: 'perspective(1600px) translate3d(0, 0, 0) rotateX(-82deg) scale(0.94)' };
  }
  return { opacity: 0, transform: 'perspective(1600px) translate3d(0, 26px, 0) rotateX(-16deg) scale(1)' };
};

// Runs on the compositor and plays back from wherever it is if the direction changes mid-flight.
const play = (el, show, delay = 0) => {
  const was = el.hasAttribute('data-in');
  if (show) el.setAttribute('data-in', ''); else el.removeAttribute('data-in');
  if (!el.hasAttribute('data-rise') || calm()) return;

  const running = el.__reveal;
  if (running && running.playState === 'running') {
    if (running.__show === show) return;
    running.__show = show;
    running.updatePlaybackRate(show ? 1 : -1.5);
    return;
  }
  if (was === show) return;

  const flip = el.dataset.rise === 'flip';
  const anim = el.animate([hiddenOf(el), SHOWN], {
    duration: flip ? 1150 : 950,
    delay: show ? delay : 0,
    easing: EASE,
    fill: 'both',
  });
  anim.__show = show;
  if (!show) { anim.currentTime = anim.effect.getComputedTiming().endTime; anim.updatePlaybackRate(-1.5); }
  anim.onfinish = () => { if (el.__reveal === anim) { anim.cancel(); el.__reveal = null; } };
  el.__reveal = anim;
};

// One engine for the whole site. Scroll down and items flip in; scroll up and they fold away again, in view.
export const useScrollReveal = () => {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    let early = null;
    let late = null;
    let end = null;
    let mo = null;
    const onScreen = new Set();
    let down = true;
    let mark = window.scrollY;
    let room = Infinity;
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'height:1px;margin-top:-1px;pointer-events:none';

    const showAll = (els) => {
      els.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      els.forEach((el, k) => {
        // Only headlines read the stagger; on a card it would restyle everything inside it.
        if (el.hasAttribute('data-reveal')) el.style.setProperty('--batch', `${Math.min(k, MAX_STEP) * STEP}ms`);
        play(el, true, Math.min(k, MAX_STEP) * STEP);
      });
    };

    // Turning back down brings back whatever folded away but is still on screen.
    const onScroll = () => {
      const y = window.scrollY;
      if (room === Infinity) measure();
      if (y < 0 || y > room) return;
      if (down ? y > mark : y < mark) { mark = y; return; }
      if (Math.abs(y - mark) < TURN) return;
      down = !down;
      mark = y;
      if (down) showAll([...onScreen].filter(el => !el.hasAttribute('data-in')));
    };
    const measure = () => { room = Math.max(0, document.documentElement.scrollHeight - window.innerHeight); };

    const onEarly = (entries) => {
      const enter = [];
      entries.forEach((e) => {
        const el = e.target;
        if (e.isIntersecting) {
          onScreen.add(el);
          if (!el.hasAttribute('data-in')) enter.push(el);
          return;
        }
        onScreen.delete(el);
        // Already scrolled past when first seen: just be there. Dropped right out below: fold away.
        if (!below(e, 0.97)) { if (!el.hasAttribute('data-in')) el.setAttribute('data-in', ''); return; }
        if (el.hasAttribute('data-in') && !firstScreen(e)) play(el, false);
      });
      if (enter.length) showAll(enter);
    };

    const onLate = (entries) => {
      const enter = [];
      entries.forEach((e) => {
        const el = e.target;
        // Only a real crossing counts, not the first report.
        const wasIn = el.__lateIn;
        el.__lateIn = e.isIntersecting;
        if (wasIn && !e.isIntersecting && !down && el.hasAttribute('data-in') && !firstScreen(e)) play(el, false);
        if (e.isIntersecting && wasIn === false && !el.hasAttribute('data-in')) enter.push(el);
      });
      if (enter.length) showAll(enter);
    };

    // The last few pixels of a page never cross the line, so reaching the end shows what is left.
    const onEnd = ([e]) => {
      if (!e.isIntersecting) return;
      measure();
      const rest = [...document.querySelectorAll(SELECTOR)].filter((el) => {
        if (el.hasAttribute('data-in')) return false;
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      });
      if (rest.length) showAll(rest);
    };

    const each = (root, fn) => {
      if (root.nodeType !== 1) return;
      if (root.matches(SELECTOR)) fn(root);
      root.querySelectorAll(SELECTOR).forEach(fn);
    };
    const watch = (el) => { early.observe(el); late.observe(el); };
    const forget = (el) => { early.unobserve(el); late.unobserve(el); onScreen.delete(el); el.__reveal?.cancel(); };

    const arm = () => {
      early = new IntersectionObserver(onEarly, { rootMargin: SHOW_EDGE, threshold: 0 });
      late = new IntersectionObserver(onLate, { rootMargin: HIDE_EDGE, threshold: 0 });
      end = new IntersectionObserver(onEnd, { threshold: 0 });
      document.body.appendChild(sentinel);
      end.observe(sentinel);
      each(document.body, watch);
      mo = new MutationObserver((records) => {
        records.forEach((r) => {
          r.removedNodes.forEach(node => each(node, forget));
          r.addedNodes.forEach(node => each(node, watch));
        });
        // New content can push the sentinel; keep it last.
        if (document.body.lastElementChild !== sentinel) document.body.appendChild(sentinel);
        room = Infinity;
      });
      mo.observe(document.body, { childList: true, subtree: true });
      mark = window.scrollY;
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', measure);
    };

    const stopWaiting = whenIntroDone(arm);
    return () => {
      stopWaiting();
      early?.disconnect();
      late?.disconnect();
      end?.disconnect();
      mo?.disconnect();
      sentinel.remove();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  }, []);
};

// For a container whose own CSS reacts to being on screen: on when it enters, off when it drops back down.
const useReveal = ({ enabled = true } = {}) => {
  const [el, setEl] = useState(null);
  const [shown, setShown] = useState(!enabled);

  useEffect(() => {
    if (!enabled) { setShown(true); return undefined; }
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return undefined; }

    let early = null;
    let late = null;
    const stopWaiting = whenIntroDone(() => {
      early = new IntersectionObserver(([e]) => {
        if (e.isIntersecting || !below(e, 0.97)) setShown(true);
        else setShown(false);
      }, { rootMargin: SHOW_EDGE, threshold: 0 });
      late = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting && el.__lateIn) setShown(false);
        if (e.isIntersecting && el.__lateIn === false) setShown(true);
        el.__lateIn = e.isIntersecting;
      }, { rootMargin: HIDE_EDGE, threshold: 0 });
      early.observe(el);
      late.observe(el);
    });

    return () => { stopWaiting(); early?.disconnect(); late?.disconnect(); };
  }, [el, enabled]);

  return [setEl, shown];
};

export default useReveal;
