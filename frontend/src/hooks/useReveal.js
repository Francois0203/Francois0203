import { useEffect, useState } from 'react';
import { REST, entrance, exitPose, markSide } from './motions';

const SELECTOR = '[data-rise], [data-reveal]';
const STEP = 80;
const MAX_STEP = 6;
// Scrolling down, items play in once their top is 12% up the screen, so the whole entrance is seen.
const SHOW_EDGE = '0px 0px -12% 0px';
// Scrolling up, they fold away while still well in view: once their top drops below the middle of the screen.
// The root reaches far above the screen so a jump past the line still counts as a crossing.
const HIDE_LINE = 0.5;
const HIDE_EDGE = `100000px 0px -${Math.round((1 - HIDE_LINE) * 100)}% 0px`;
// Scroll this far the other way before it counts as turning round, so trackpad wobble and iOS bounce do nothing.
const TURN = 16;
// Hiding moves at once and holds its opacity for the first part, so the exit itself is what shows.
const HIDE_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const HIDE_MS = 520;

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

const low = () => document.documentElement.dataset.tier === 'low';

// Observers see the moving box, so an entrance that starts lower or smaller would read as leaving and restart itself.
// While an item is animating its reports are ignored; the settle sweep puts right anything missed.
const busy = (el) => el.__reveal && (el.__reveal.playState === 'running' || el.__reveal.playState === 'pending');

// Plays an item in or out; a direction change mid-flight carries on from the pose it has reached.
const play = (el, show, delay = 0, instant = false) => {
  const was = el.hasAttribute('data-in');
  if (show) el.setAttribute('data-in', ''); else el.removeAttribute('data-in');
  if (!el.hasAttribute('data-rise') || calm()) return;

  const running = el.__reveal;
  const live = running && (running.playState === 'running' || running.playState === 'pending');
  if (live && running.__show === show) return;
  if (!live && was === show) return;

  let from = null;
  if (live) {
    const cs = getComputedStyle(el);
    from = { opacity: cs.opacity, transform: cs.transform === 'none' ? REST : cs.transform };
    running.cancel();
  }
  el.__reveal = null;
  if (instant) return;

  let frames;
  let ms;
  if (show && !from) ({ frames, ms } = entrance(el, low()));
  else if (show) { frames = [from, { opacity: 1, transform: REST }]; ms = 600; }
  else {
    const start = from ?? { opacity: 1, transform: REST };
    frames = [{ ...start, offset: 0 }, { opacity: start.opacity, offset: 0.45 }, { ...exitPose(el, low()), offset: 1 }];
    ms = HIDE_MS;
  }
  const anim = el.animate(frames, {
    duration: ms,
    delay: live ? 0 : delay,
    easing: show ? 'linear' : HIDE_EASE,
    fill: 'both',
  });
  anim.__show = show;
  anim.onfinish = () => { if (el.__reveal === anim) { anim.cancel(); el.__reveal = null; } };
  el.__reveal = anim;
};

// The stretch of screen where a scroll up folds things away in view.
const inFoldZone = (el) => {
  const r = el.getBoundingClientRect();
  return r.top > window.innerHeight * HIDE_LINE && r.top < window.innerHeight && r.top + window.scrollY >= window.innerHeight;
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

    // Turning up folds away what already sits below the line, lowest first, so it is seen going.
    const foldZone = () => {
      const els = [...onScreen].filter(el => el.hasAttribute('data-in') && inFoldZone(el));
      els.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? 1 : -1));
      els.forEach((el, k) => play(el, false, Math.min(k, MAX_STEP) * 30));
      window.dispatchEvent(new Event('reveal:up'));
    };

    // Safety net: once scrolling or a layout shift settles, nothing hidden is left inside the reveal zone.
    // Scrolling up, only above the fold line, so the intended fold-away stays.
    let settle = 0;
    const sweep = () => {
      const line = window.innerHeight * (down ? 0.88 : HIDE_LINE);
      const rest = [...document.querySelectorAll(SELECTOR)].filter((el) => {
        if (el.hasAttribute('data-in')) return false;
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < line;
      });
      if (rest.length) showAll(rest);
    };
    const sweepSoon = () => { clearTimeout(settle); settle = setTimeout(sweep, 220); };

    // Turning back down brings back whatever folded away but is still on screen.
    const onScroll = () => {
      sweepSoon();
      const y = window.scrollY;
      if (room === Infinity) measure();
      if (y < 0 || y > room) return;
      if (down ? y > mark : y < mark) { mark = y; return; }
      if (Math.abs(y - mark) < TURN) return;
      down = !down;
      mark = y;
      if (down) showAll([...onScreen].filter(el => !el.hasAttribute('data-in')));
      else foldZone();
    };
    const measure = () => { room = Math.max(0, document.documentElement.scrollHeight - window.innerHeight); };

    const onEarly = (entries) => {
      const enter = [];
      entries.forEach((e) => {
        const el = e.target;
        if (busy(el)) return;
        if (e.isIntersecting) {
          onScreen.add(el);
          if (!el.hasAttribute('data-in')) enter.push(el);
          return;
        }
        onScreen.delete(el);
        // Already scrolled past when first seen: just be there. Dropped right out below: fold away.
        if (!below(e, 0.97)) { if (!el.hasAttribute('data-in')) el.setAttribute('data-in', ''); return; }
        if (el.hasAttribute('data-in') && !firstScreen(e)) play(el, false, 0, true);
      });
      if (enter.length) showAll(enter);
    };

    const onLate = (entries) => {
      const enter = [];
      entries.forEach((e) => {
        const el = e.target;
        // Only a real crossing counts, not the first report.
        const wasIn = el.__lateIn;
        if (busy(el)) { el.__lateIn = e.isIntersecting; return; }
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
    const watch = (el) => {
      if (el.hasAttribute('data-rise')) markSide(el);
      early.observe(el);
      late.observe(el);
    };
    const forget = (el) => { early.unobserve(el); late.unobserve(el); onScreen.delete(el); el.__reveal?.cancel(); };

    const arm = () => {
      early = new IntersectionObserver(onEarly, { rootMargin: SHOW_EDGE, threshold: 0 });
      late = new IntersectionObserver(onLate, { rootMargin: HIDE_EDGE, threshold: 0 });
      end = new IntersectionObserver(onEnd, { threshold: 0 });
      document.body.appendChild(sentinel);
      end.observe(sentinel);
      each(document.body, watch);
      sweepSoon();
      mo = new MutationObserver((records) => {
        records.forEach((r) => {
          r.removedNodes.forEach(node => each(node, forget));
          r.addedNodes.forEach(node => each(node, watch));
        });
        // New content can push the sentinel; keep it last.
        if (document.body.lastElementChild !== sentinel) document.body.appendChild(sentinel);
        room = Infinity;
        sweepSoon();
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
      clearTimeout(settle);
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
    const onUp = () => { if (inFoldZone(el)) setShown(false); };
    window.addEventListener('reveal:up', onUp);

    return () => { stopWaiting(); early?.disconnect(); late?.disconnect(); window.removeEventListener('reveal:up', onUp); };
  }, [el, enabled]);

  return [setEl, shown];
};

export default useReveal;
