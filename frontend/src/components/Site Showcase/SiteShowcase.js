import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MdArrowOutward, MdOpenInNew, MdTouchApp, MdRefresh } from 'react-icons/md';
import { FaGithub, FaLock } from 'react-icons/fa';
import styles from './SiteShowcase.module.css';

/* Each card runs a real iframe of a client site. Three consequences are handled
 * explicitly: a frame gets its `src` only near the viewport and at most
 * MAX_CONCURRENT load at once; a site that refuses framing (probed at sync time,
 * with LOAD_TIMEOUT_MS as backstop) is never framed; and the frame stays
 * pointer-inert until clicked, so scrolling past does not scroll the framed
 * site. Touch waits for a tap rather than pulling sites over mobile data. */

// Rendered at this width then scaled to fit - the card's real width would
// trigger the framed site's own mobile layout.
const FRAME_WIDTH     = 1440;
const FRAME_RATIO     = 16 / 10;
const MAX_CONCURRENT  = 2;
const LOAD_TIMEOUT_MS = 12_000;

const IS_TOUCH = typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 767px)').matches ||
   window.matchMedia('(pointer: coarse)').matches);

/* ─── Load gate ─────────────────────────────────────────────────────────────── */

const gate = { active: 0, waiting: [] };

/** Runs `start` now if a slot is free, otherwise queues it. */
const acquireSlot = (start) => {
  if (gate.active < MAX_CONCURRENT) { gate.active++; start(); return true; }
  gate.waiting.push(start);
  return false;
};

/** Drops a queued starter that is no longer wanted (card unmounted while waiting). */
const cancelSlot = (start) => {
  const i = gate.waiting.indexOf(start);
  if (i >= 0) gate.waiting.splice(i, 1);
};

const releaseSlot = () => {
  gate.active = Math.max(0, gate.active - 1);
  const next = gate.waiting.shift();
  if (next) { gate.active++; next(); }
};

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

const prettyHost = (url) => {
  try { return new URL(url).host.replace(/^www\./, ''); }
  catch { return url; }
};

/* ─── One embedded frame ────────────────────────────────────────────────────── */

const LiveFrame = ({ site, name }) => {
  const viewportRef = useRef(null);
  const timerRef    = useRef(null);
  const holdRef     = useRef(false);   // we currently occupy a load slot
  const queuedRef   = useRef(null);    // our starter, while it sits in the queue

  // 'idle' → nothing requested yet · 'loading' → src set, waiting on onLoad
  // 'ready' → framed and interactive · 'blocked' → refuses framing / timed out
  const [phase,  setPhase]  = useState(site.embeddable === false ? 'blocked' : 'idle');
  const [live,   setLive]   = useState(false);   // pointer events handed to the frame
  const [scale,  setScale]  = useState(1);
  const [nonce,  setNonce]  = useState(0);       // bumped to retry a blocked frame

  // Guarded on actually holding a slot: releasing one we never held would let
  // an extra frame past MAX_CONCURRENT.
  const release = useCallback(() => {
    if (!holdRef.current) return;
    holdRef.current = false;
    releaseSlot();
  }, []);

  const begin = useCallback(() => {
    holdRef.current   = true;
    queuedRef.current = null;
    setPhase('loading');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Never loaded, or loaded into a frame the site refused to paint.
      setPhase(p => (p === 'loading' ? 'blocked' : p));
      release();
    }, LOAD_TIMEOUT_MS);
  }, [release]);

  // An outstanding request short-circuits: a retry racing the observer would
  // otherwise queue two starters and load the frame twice.
  const request = useCallback(() => {
    if (holdRef.current || queuedRef.current) return;
    const start = () => begin();
    if (!acquireSlot(start)) queuedRef.current = start;
  }, [begin]);

  // Auto-load when the card nears the viewport - desktop only.
  useEffect(() => {
    if (IS_TOUCH || phase !== 'idle') return;
    const el = viewportRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { obs.disconnect(); request(); }
    }, { rootMargin: '400px 0px' });

    obs.observe(el);
    return () => obs.disconnect();
  }, [phase, request]);

  // Scale the 1440px-wide frame down to whatever width the card actually got.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale(w / FRAME_WIDTH);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    if (queuedRef.current) { cancelSlot(queuedRef.current); queuedRef.current = null; }
    release();
  }, [release]);

  // Clicking anywhere outside hands scrolling back to the page.
  useEffect(() => {
    if (!live) return;
    const onDocDown = (e) => {
      if (!viewportRef.current?.contains(e.target)) setLive(false);
    };
    document.addEventListener('pointerdown', onDocDown);
    return () => document.removeEventListener('pointerdown', onDocDown);
  }, [live]);

  const onLoad = () => {
    clearTimeout(timerRef.current);
    setPhase('ready');
    release();
  };

  const retry = () => {
    clearTimeout(timerRef.current);
    if (queuedRef.current) { cancelSlot(queuedRef.current); queuedRef.current = null; }
    release();
    setNonce(n => n + 1);
    setLive(false);
    setPhase('idle');
    request();
  };

  const showFrame = phase === 'loading' || phase === 'ready';

  return (
    <div className={styles.viewport} ref={viewportRef}>
      {showFrame && (
        <iframe
          key={nonce}
          src={site.url}
          title={`${name} - ${site.label}`}
          className={styles.frame}
          style={{
            width:     FRAME_WIDTH,
            height:    FRAME_WIDTH / FRAME_RATIO,
            transform: `scale(${scale})`,
          }}
          onLoad={onLoad}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          // allow-top-navigation absent on purpose: no navigating the portfolio.
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          tabIndex={live ? 0 : -1}
          // Opts this frame out of Lenis's blanket `iframe { pointer-events:
          // none }` once the card has been clicked - without it the frame is
          // inert whenever momentum scrolling is on. Undefined rather than
          // false so the attribute is absent, not present-and-empty.
          data-lenis-interactive={live ? '' : undefined}
        />
      )}

      {/* Idle / loading / blocked states, and the click-to-interact shield. */}
      {phase === 'idle' && (
        <button type="button" className={styles.overlayBtn} onClick={request}>
          <span className={styles.overlayIcon}><MdTouchApp /></span>
          <span className={styles.overlayTitle}>Load live site</span>
          <span className={styles.overlayHint}>{prettyHost(site.url)}</span>
        </button>
      )}

      {phase === 'loading' && (
        <div className={styles.loadingVeil} aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" />
          <span className={styles.loadingText}>Waking {prettyHost(site.url)}…</span>
        </div>
      )}

      {phase === 'blocked' && (
        <div className={styles.blocked}>
          <span className={styles.blockedTitle}>
            {site.reachable === false ? 'Site not responding' : 'This site can’t be embedded'}
          </span>
          <span className={styles.blockedText}>
            {site.reachable === false
              ? 'It may be between deploys. Open it directly to check.'
              : 'It sends headers that forbid framing, so it has to open in its own tab.'}
          </span>
          <span className={styles.blockedActions}>
            <a href={site.url} target="_blank" rel="noopener noreferrer" className={styles.blockedLink}>
              Open site <MdOpenInNew aria-hidden="true" />
            </a>
            <button type="button" className={styles.retryBtn} onClick={retry}>
              <MdRefresh aria-hidden="true" /> Retry
            </button>
          </span>
        </div>
      )}

      {/* The frame is running; the page keeps the scroll until clicked. */}
      {phase === 'ready' && !live && (
        <button
          type="button"
          className={styles.shield}
          onClick={() => setLive(true)}
          aria-label={`Interact with ${name}`}
        >
          <span className={styles.shieldPill}>
            <MdTouchApp aria-hidden="true" /> Click to interact
          </span>
        </button>
      )}

      {phase === 'ready' && live && (
        <span className={styles.liveBadge}>
          Interactive - click outside to release
        </span>
      )}
    </div>
  );
};

/* ─── Showcase card ─────────────────────────────────────────────────────────── */

const SiteShowcase = ({ project, variant = 'card', className = '' }) => {
  const { name, client, tagline, description, sites = [], stack = [], tags = [],
          githubUrl, isPrivate, language } = project ?? {};

  const [activeIdx, setActiveIdx] = useState(0);
  const active = sites[activeIdx] ?? sites[0];

  const hasTabs = sites.length > 1;

  const blurb = useMemo(
    () => (description && description !== tagline ? description : tagline) ?? '',
    [description, tagline],
  );

  if (!active) return null;

  return (
    // 'card' is the base look, so only 'hero' adds a modifier class.
    <article className={`${styles.card} ${variant === 'hero' ? styles.hero : ''} ${className}`}>
      <div className={styles.browser}>
        <div className={styles.chrome}>
          <span className={styles.lights} aria-hidden="true">
            <i /><i /><i />
          </span>

          {hasTabs ? (
            <div className={styles.tabs} role="tablist" aria-label={`${name} sites`}>
              {sites.map((s, i) => (
                <button
                  key={s.url}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIdx}
                  className={`${styles.tab} ${i === activeIdx ? styles.tabActive : ''}`}
                  onClick={() => setActiveIdx(i)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : (
            <span className={styles.urlBar}>{prettyHost(active.url)}</span>
          )}

          <a
            href={active.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.chromeOpen}
            title="Open in a new tab"
          >
            <MdOpenInNew aria-hidden="true" />
          </a>
        </div>

        {/* Keyed on url: switching tabs mounts a fresh frame instead of
            leaving the old page visible mid-load. */}
        <LiveFrame key={active.url} site={active} name={name} />
      </div>

      <div className={styles.info}>
        <header className={styles.infoHead}>
          {client && <p className={styles.client}>{client}</p>}
          <h3 className={styles.name}>{name}</h3>
          {tagline && <p className={styles.tagline}>{tagline}</p>}
        </header>

        {variant === 'hero' && blurb && blurb !== tagline && (
          <p className={styles.blurb}>{blurb}</p>
        )}

        {(stack.length > 0 || tags.length > 0) && (
          <div className={styles.chips}>
            {stack.map(s => <span key={s} className={styles.chip}>{s}</span>)}
            {tags.map(t => <span key={t} className={styles.chipSoft}>{t}</span>)}
            {stack.length === 0 && tags.length === 0 && language && (
              <span className={styles.chip}>{language}</span>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <a
            href={active.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryLink}
          >
            Visit {hasTabs ? active.label.toLowerCase() : 'site'}
            <MdArrowOutward aria-hidden="true" />
          </a>

          {githubUrl && !isPrivate && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryLink}
            >
              <FaGithub aria-hidden="true" /> Code
            </a>
          )}
          {isPrivate && (
            <span className={styles.privatePill}>
              <FaLock size={9} aria-hidden="true" /> Private repo
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default SiteShowcase;
